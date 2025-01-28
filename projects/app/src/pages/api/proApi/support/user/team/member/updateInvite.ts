import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只接受PUT请求
  if (req.method !== 'PUT') {
    throw 'common:code_error.method_error';
  }

  const { userId } = await authCert({
    req,
    authToken: true
  });

  const { tmbId, status } = req.body;

  if (!tmbId) {
    throw new Error('Missing parameters');
  }

  // 更新数据库
  await MongoTeamMember.findByIdAndUpdate(tmbId, {
    status
  });

  return {};
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
