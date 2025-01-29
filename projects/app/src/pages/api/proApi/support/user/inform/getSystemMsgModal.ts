import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { SystemMsgModel } from '@fastgpt/service/support/user/inform/sysMsgSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 验证用户权限
    await authCert({
      req,
      authToken: true
    });

    // 获取最新的系统消息
    const sysMsg = await SystemMsgModel.findOne(
      { isShowing: true },
      {
        _id: 1,
        content: 1,
        createdAt: 1,
        updatedAt: 1
      }
    )
      .sort({ updatedAt: -1 })
      .lean();

    if (!sysMsg) {
      return void 0;
    }

    // 返回格式化的消息
    return {
      id: sysMsg._id,
      content: sysMsg.content,
      createdAt: sysMsg.createdAt,
      updatedAt: sysMsg.updatedAt
    };
  } catch (error) {
    console.error('[System Message Error]', error);
    throw error;
  }
}

export default NextAPI(handler);
