import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { InviteMemberProps } from '@fastgpt/global/support/user/team/controller.d';
import { authUserExist } from '@fastgpt/service/support/user/controller';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const props = req.body as InviteMemberProps;
  const usernames = props.usernames;
  const teamId = props.teamId;
  let invite: { username: string; userId: string }[] = [];
  let inValid: { username: string; userId: string }[] = [];
  let inTeam: { username: string; userId: string }[] = [];

  if (!props) {
    throw 'Invalid params';
  }

  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  // 并行处理所有用户验证
  const results = await Promise.all(
    // 去除两端的空格
    usernames.map(async (username) => {
      username = username.trim();
      try {
        const user = await authUserExist({ username });
        if (!user) {
          return { type: 'invalid', username, userId: '' };
        }

        const teamMember = await MongoTeamMember.findOne({
          userId: user._id,
          teamId
        });

        if (teamMember && teamMember.status === 'active') {
          return { type: 'inTeam', username, userId: user._id };
        }

        if (!teamMember) {
          await MongoTeamMember.create({
            teamId: tmb.teamId,
            userId: user._id,
            status: 'waiting'
          });
        } else {
          await MongoTeamMember.findByIdAndUpdate(teamMember._id, {
            status: 'waiting'
          });
        }

        return { type: 'invite', username, userId: user._id };
      } catch (e) {
        return { type: 'invalid', username, userId: '' };
      }
    })
  );

  // 分类处理结果
  results.forEach((result) => {
    switch (result.type) {
      case 'invite':
        invite.push({ username: result.username, userId: result.userId });
        break;
      case 'invalid':
        inValid.push({ username: result.username, userId: result.userId });
        break;
      case 'inTeam':
        inTeam.push({ username: result.username, userId: result.userId });
        break;
    }
  });

  return {
    invite,
    inValid,
    inTeam
  };
}

export default NextAPI(handler);
