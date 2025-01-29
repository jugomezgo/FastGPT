import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { TeamPermission } from '@fastgpt/global/support/permission/user/controller';
import { TeamDefaultPermissionVal } from '@fastgpt/global/support/permission/user/constant';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  // 获取所有资源权限
  const pers = await MongoResourcePermission.find({
    teamId,
    resourceType: PerResourceTypeEnum.team
  }).lean();

  // 将权限按类型分组
  const tmbIds = pers.filter((per) => per.tmbId).map((per) => per.tmbId);
  const orgIds = pers.filter((per) => per.orgId).map((per) => per.orgId);
  const groupIds = pers.filter((per) => per.groupId).map((per) => per.groupId);

  // 并行查询所有相关信息
  const [tmbs, orgs, groups] = await Promise.all([
    tmbIds.length > 0 ? MongoTeamMember.find({ _id: { $in: tmbIds } }).lean() : [],
    orgIds.length > 0 ? MongoOrgModel.find({ _id: { $in: orgIds } }).lean() : [],
    groupIds.length > 0 ? MongoMemberGroupModel.find({ _id: { $in: groupIds } }).lean() : []
  ]);

  // 创建查找映射
  const tmbMap = new Map(tmbs.map((tmb) => [tmb._id.toString(), tmb]));
  const orgMap = new Map(orgs.map((org) => [org._id.toString(), org]));
  const groupMap = new Map(groups.map((group) => [group._id.toString(), group]));

  // 组装结果
  return pers.map((per) => {
    const baseData = {
      ...per,
      permission: new TeamPermission({
        per: per.permission ?? TeamDefaultPermissionVal
      })
    };

    if (per.tmbId) {
      const tmb = tmbMap.get(per.tmbId.toString());
      return {
        ...baseData,
        name: tmb?.name,
        avatar: tmb?.avatar
      };
    }
    if (per.orgId) {
      const org = orgMap.get(per.orgId.toString());
      return {
        ...baseData,
        name: org?.name,
        avatar: org?.avatar
      };
    }
    if (per.groupId) {
      const group = groupMap.get(per.groupId.toString());
      return {
        ...baseData,
        name: group?.name,
        avatar: group?.avatar
      };
    }
    return baseData;
  });
}

export default NextAPI(handler);
