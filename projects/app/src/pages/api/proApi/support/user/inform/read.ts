import type { NextApiRequest, NextApiResponse } from 'next';
import { Types } from 'mongoose';

import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { UserInformModel } from '@fastgpt/service/support/user/inform/userMsgSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = await authCert({ req, authToken: true });
  const msgId = req.query.id as string;

  try {
    const msgObjectId = new Types.ObjectId(msgId);
    const userObjectId = new Types.ObjectId(userId);

    await UserInformModel.updateOne(
      {
        _id: msgObjectId,
        userId: userObjectId
      },
      { read: true }
    );

    return void 0;
  } catch (error) {
    throw error;
  }
}

export default NextAPI(handler);
