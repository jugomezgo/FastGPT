import { UserInformModel } from '@fastgpt/service/support/user/inform/userMsgSchema';
import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { Types } from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // pageNum 从 1 开始，pageSize 默认为 10
  const { pageNum, pageSize } = req.body as {
    pageNum: number;
    pageSize: number;
  };

  // 身份验证
  const { userId } = await authCert({
    req,
    authToken: true
  });

  try {
    const userObjectId = new Types.ObjectId(userId);

    // 获取总数
    const total = await UserInformModel.countDocuments({ userId: userObjectId });

    // 获取列表数据
    console.log('userId:', { userId: userObjectId }, total);
    const list = await UserInformModel.find({ userId: userObjectId })
      .sort({ time: -1 }) // 按时间倒序
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize)
      .exec();

    return {
      list,
      total
    };
  } catch (error) {
    throw error;
  }
}

export default NextAPI(handler);
