import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';
import { MongoGroupMemberModel } from '@fastgpt/service/support/permission/memberGroup/groupMemberSchema';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { authGroupMemberRole } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { groupId } = req.query as { groupId: string };

  // 参数验证
  if (!groupId) {
    throw 'invalid params';
  }

  // 权限验证
  await authGroupMemberRole({
    groupId,
    req,
    authToken: true,
    role: [GroupMemberRole.owner, GroupMemberRole.admin]
  });

  // 使用事务确保数据一致性
  await mongoSessionRun(async (session) => {
    // 检查群组是否存在
    const group = await MongoMemberGroupModel.findById(groupId).session(session);
    if (!group) {
      throw new Error('群组不存在');
    }

    // 删除群组成员
    await MongoGroupMemberModel.deleteMany({ groupId }, { session });

    // 删除群组
    await MongoMemberGroupModel.deleteOne({ _id: groupId }, { session });
  });

  return {};
}

export default NextAPI(handler);
