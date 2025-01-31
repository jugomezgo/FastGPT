import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { ManagePermissionVal } from '@fastgpt/global/support/permission/constant';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';
import { MongoGroupMemberModel } from '@fastgpt/service/support/permission/memberGroup/groupMemberSchema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';
import { postCreateGroupData } from '@fastgpt/global/support/user/team/group/api';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId, tmbId } = await authUserPer({
    req,
    authToken: true,
    per: ManagePermissionVal
  });

  const { name, avatar } = req.body as postCreateGroupData;

  if (!name) {
    throw new Error('缺少必要参数');
  }

  let result;
  await mongoSessionRun(async (session) => {
    // 创建群组
    const group = await MongoMemberGroupModel.create(
      [
        {
          teamId,
          name,
          avatar
        }
      ],
      { session }
    );

    // 创建群组所有者
    await MongoGroupMemberModel.create(
      [
        {
          groupId: group[0]._id,
          tmbId, // 使用正确的 tmbId
          role: GroupMemberRole.owner
        }
      ],
      { session }
    );

    result = group[0];
  });

  return {};
}

export default NextAPI(handler);
