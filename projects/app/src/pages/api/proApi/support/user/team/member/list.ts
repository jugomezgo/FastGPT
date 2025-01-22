import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from "@/service/middleware/entry";
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { getResourcePermission } from '@fastgpt/service/support/permission/controller';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { TeamPermission } from '@fastgpt/global/support/permission/user/controller';
import { TeamDefaultPermissionVal } from '@fastgpt/global/support/permission/user/constant';
import { TeamMemberRoleEnum, notLeaveStatus } from '@fastgpt/global/support/user/team/constant';
import { Types } from '@fastgpt/service/common/mongo';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 凭证校验
  const { teamId } = await authCert({ req, authToken: true });

  // 取得query中的offset和pageSize
  const offset = Number(req.query.offset as string) || 0;
  const pageSize = Number(req.query.pageSize as string) || 10;

  const total = await MongoTeamMember.countDocuments({
    teamId: new Types.ObjectId(teamId),
    status: notLeaveStatus
  });

  // get members with pagination
  const members = await MongoTeamMember.find({
    teamId: new Types.ObjectId(teamId),
    status: notLeaveStatus
  })
    .skip(offset * pageSize)
    .limit(pageSize)
    .lean();

  // get permissions for each member
  const list = await Promise.all(
    members.map(async (member) => {
      const Per = await getResourcePermission({
        resourceType: PerResourceTypeEnum.team,
        teamId: member.teamId,
        tmbId: member._id
      });

      return {
        userId: String(member.userId),
        tmbId: String(member._id),
        teamId: String(member.teamId),
        memberName: member.name,
        avatar: member.avatar,
        role: member.role,
        status: member.status,
        permission: new TeamPermission({
          per: Per ?? TeamDefaultPermissionVal,
          isOwner: member.role === TeamMemberRoleEnum.owner
        })
      };
    })
  );

  return {
    pageSize,
    offset,
    total,
    list
  }
}

// useReqFrequencyLimit(120, 10, true),
export default NextAPI(handler);