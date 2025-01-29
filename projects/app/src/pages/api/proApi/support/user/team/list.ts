import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { getTmbInfoByTmbId } from '@fastgpt/service/support/user/team/controller';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 凭证校验
  const { userId } = await authCert({ req, authToken: true });

  // 取得query中的status
  const status = req.query.status as string;

  const teamIds = await MongoTeamMember.find({
    userId,
    status
  })
    .select('teamId')
    .lean();
  const teamIdList = teamIds.map((item) => item.teamId);
  const teamList = [];

  for (const teamId of teamIdList) {
    // 首先需要获取该用户在这个团队中的成员记录
    const teamMember = await MongoTeamMember.findOne({
      teamId,
      userId,
      status
    }).lean();

    if (teamMember) {
      const memberInfo = await getTmbInfoByTmbId({
        tmbId: teamMember._id.toString()
      });
      teamList.push(memberInfo);
    }
  }
  return teamList;
}

export default NextAPI(handler);
