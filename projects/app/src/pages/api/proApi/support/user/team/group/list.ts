import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { getGroupMembersByGroupId } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = await authCert({ req, authToken: true });

  // 取得所有 group
  let groups = [];
  try {
    groups = await MongoMemberGroupModel.find({ teamId }).lean();
  } catch (error) {
    throw new Error('Failed to get groups');
  }
  if (groups.length === 0) {
    return [];
  }

  // 使用 Promise.all 和 map 来并行处理所有 group
  return await Promise.all(
    groups.map(async (group) => {
      // 取得group的成员和请求者权限
      const members = await getGroupMembersByGroupId(group._id);
      return {
        ...group,
        members
      };
    })
  );
}

export default NextAPI(handler);
