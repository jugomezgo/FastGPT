import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import {
  getGroupMembersByGroupId,
  getGroupsByTmbId
} from '@fastgpt/service/support/permission/memberGroup/controllers';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmbId, teamId } = await authCert({ req, authToken: true });
  const groups = await getGroupsByTmbId({ tmbId, teamId });

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

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
