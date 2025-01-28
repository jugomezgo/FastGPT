import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    throw 'invalid method';
  }

  const { tmbId } = await authCert({
    req,
    authToken: true
  });

  const { name } = req.body as {
    name: string;
  };

  if (!name) {
    throw 'empty name';
  }

  const member = await MongoTeamMember.findOne({ _id: tmbId });

  if (!member) {
    throw 'member not found';
  }

  member.name = name;
  await member.save();

  return void 0;
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
