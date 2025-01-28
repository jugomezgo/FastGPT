import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { createDefaultTeam } from '@fastgpt/service/support/user/team/controller';
import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只接受DELETE请求
  if (req.method !== 'DELETE') {
    throw 'common:code_error.method_error';
  }

  const { tmbId } = req.query;

  if (!tmbId) {
    throw new Error('Missing parameters');
  }

  // 权限校验
  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  // 查找目标成员是否存在
  const targetMember = await MongoTeamMember.findOne({
    _id: tmbId,
    status: 'active'
  });

  if (!targetMember) {
    return {};
  }

  // 检查用户是否只存在于当前团队
  const userTeamCount = await MongoTeamMember.countDocuments({
    userId: targetMember.userId,
    status: 'active'
  });

  console.log('userTeamCount', userTeamCount);

  await mongoSessionRun(async (session) => {
    // 如果当前团队为其默认团队，设为非默认团队
    if (targetMember.defaultTeam) {
      await MongoTeamMember.findByIdAndUpdate(
        targetMember._id,
        {
          defaultTeam: false
        },
        { session }
      );
    }

    // 如果用户只在当前团队，创建默认团队
    if (userTeamCount === 1) {
      await createDefaultTeam({
        userId: targetMember.userId,
        session
      });
    }

    // 删除团队成员
    await MongoTeamMember.findByIdAndUpdate(
      targetMember._id,
      {
        status: 'leave'
      },
      { session }
    );
  });

  return {};
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);
