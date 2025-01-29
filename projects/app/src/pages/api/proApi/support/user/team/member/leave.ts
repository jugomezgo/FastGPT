import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { TeamMemberStatusEnum } from '@fastgpt/global/support/user/team/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    throw 'invalid method';
  }

  const { userId, tmbId } = await authCert({
    req,
    authToken: true
  });

  // 取得tmb对象
  const tmb = await MongoTeamMember.findOne({ _id: tmbId });

  if (!tmb) {
    throw 'member not found';
  }

  // 查询用户是否还在其他团队中
  const member = await MongoTeamMember.findOne({
    userId,
    _id: {
      $ne: tmbId
    },
    status: TeamMemberStatusEnum.active
  });

  if (!member) {
    throw 'user not in other team';
  }

  // 删除用户
  await tmb.updateOne({
    status: TeamMemberStatusEnum.leave
  });

  return void 0;
}

export default NextAPI(handler);
