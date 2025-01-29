import type { NextApiRequest, NextApiResponse } from 'next';
import { Types } from 'mongoose';

import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { UserInformModel } from '@fastgpt/service/support/user/inform/userMsgSchema';

// 定义接口来明确文档结构
interface InformItem {
  _id: Types.ObjectId;
  content: string;
  title: string;
  time: Date;
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = await authCert({
    req,
    authToken: true
  });

  try {
    const userObjectId = new Types.ObjectId(userId);

    // 查询条件
    const unreadCondition = {
      userId: userObjectId,
      read: false
    };

    // 并行执行查询
    const [unReadCount, importantInforms] = await Promise.all([
      // 统计所有未读消息数量
      UserInformModel.countDocuments(unreadCondition),
      // 查询重要且未读的通知
      UserInformModel.find({
        ...unreadCondition,
        level: 'important'
      })
        .select('_id content title time')
        .sort({ time: -1 })
        .lean() as Promise<InformItem[]>
    ]);

    return {
      unReadCount,
      importantInforms: importantInforms.map((item) => ({
        _id: item._id.toString(),
        content: item.content,
        title: item.title,
        time: item.time
      }))
    };
  } catch (error) {
    return {
      unReadCount: 0,
      importantInforms: []
    };
  }
}

export default NextAPI(handler);
