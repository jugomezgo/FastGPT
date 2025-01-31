import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    throw 'invalid method';
  }

  const { userId } = await authCert({
    req,
    authToken: true
  });

  const { teamId } = req.body as {
    teamId: string;
  };

  if (!teamId) {
    throw 'empty teamId';
  }

  console.log('switch team', userId, teamId);

  const member = await MongoTeamMember.findOne({ userId, teamId });

  if (!member) {
    throw 'not a member of the team';
  }

  console.log('switch team', member);

  const userDetail = await getUserDetail({
    tmbId: member._id,
    userId
  });

  MongoUser.findByIdAndUpdate(userId, {
    lastLoginTmbId: userDetail.team.tmbId
  });

  const token = createJWT({
    ...userDetail,
    isRoot: userDetail.username === 'root'
  });

  setCookie(res, token);

  return token;
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
