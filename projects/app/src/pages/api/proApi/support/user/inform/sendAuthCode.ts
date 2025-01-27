import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { vericationService } from '@fastgpt/service/support/user/inform/verificationCode/service';
import { VerificationCodeType } from '@fastgpt/service/support/user/inform/verificationCode/type';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    throw 'invalid method';
  }

  const { email, username } = req.body as {
    email?: string;
    username?: string;
  };

  // 使用 email 或 username
  const userEmail = email || username;

  // 验证邮箱格式
  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    throw 'empty email';
  }

  await vericationService.createAndSend({
    email: userEmail,
    type: VerificationCodeType.LOGIN
  });
  return void 0;
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
