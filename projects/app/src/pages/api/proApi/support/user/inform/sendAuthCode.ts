import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { verificationService } from '@fastgpt/service/support/user/inform/verificationCode/service';
import { EmailSender } from '@fastgpt/service/support/user/inform/email/sender';
import { verificationCodeMsg } from '@fastgpt/service/support/user/inform/email/templates';
import { VerificationCodeType } from '@fastgpt/service/support/user/inform/verificationCode/type';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    throw 'invalid method';
  }

  const { email, username, type } = req.body as {
    email?: string;
    username?: string;
    type?: VerificationCodeType;
  };

  // 使用 email 或 username
  const userEmail = email || username;

  // 验证邮箱格式
  if (!userEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userEmail)) {
    throw 'empty email';
  }

  // 检查global内的email配置
  if (!global.systemEnv.email) {
    throw 'email config not found';
  }

  // 初始化emailSender
  const emailSender = EmailSender.getInstance(global.systemEnv.email);

  const code = await verificationService.create({
    email: userEmail,
    type: type || VerificationCodeType.LOGIN
  });

  // 发送邮件
  const emailTemplat = verificationCodeMsg(String(code));
  await emailSender.sendMail({
    to: userEmail,
    ...emailTemplat
  });
  return void 0;
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
