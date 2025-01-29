import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { UpdateClbPermissionProps } from '@fastgpt/global/support/permission/collaborator';
import { MongoResourcePermission } from '@fastgpt/service/support/permission/schema';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  if (tmb.role !== 'owner') {
    throw 'common:code_error.team_error.un_auth';
  }

  const { members, groups, orgs, permission } = req.body as UpdateClbPermissionProps;

  const bulkOps: {
    updateOne: {
      filter: {
        teamId: string;
        resourceType: PerResourceTypeEnum;
        tmbId?: string;
        groupId?: string;
        orgId?: string;
      };
      update: {
        $set: { permission: any };
      };
      upsert: boolean;
    };
  }[] = [];

  // 构建成员权限更新操作
  if (members && members?.length > 0) {
    members.forEach((tmbId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            tmbId,
            resourceType: PerResourceTypeEnum.team
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 构建组权限更新操作
  if (groups && groups?.length > 0) {
    groups.forEach((groupId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            groupId,
            resourceType: PerResourceTypeEnum.team
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 构建组织权限更新操作
  if (orgs && orgs?.length > 0) {
    orgs.forEach((orgId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            orgId,
            resourceType: PerResourceTypeEnum.team
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 执行批量操作
  if (bulkOps && bulkOps.length > 0) {
    try {
      await MongoResourcePermission.bulkWrite(bulkOps);
    } catch (err) {
      console.error('Bulk update operation error:', err);
    }
  }

  return void 0;
}

export default NextAPI(handler);
