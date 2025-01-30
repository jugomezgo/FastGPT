import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { verificationService } from '@fastgpt/service/support/user/inform/verificationCode/service';
import { VerificationCodeType } from '@fastgpt/service/support/user/inform/verificationCode/type';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({ req, authToken: true });

  if (tmb.role !== 'owner') {
    throw 'no permission';
  }

  // {"account":"123@zhtec.xyz","verifyCode":"956103"}
  const { account: username, verifyCode: code } = req.body as {
    account: string;
    verifyCode: string;
  };

  const verified = await verificationService.verify({
    email: username,
    code,
    type: VerificationCodeType.bindNotification
  });

  if (!verified) {
    throw 'Invalid verification code';
  }

  // 更新团少的通知账号
  await MongoTeam.findByIdAndUpdate(teamId, { notificationAccount: username });

  return void 0;
}

export default NextAPI(handler);
