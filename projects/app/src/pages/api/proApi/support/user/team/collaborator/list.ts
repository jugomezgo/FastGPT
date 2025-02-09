import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { listCollaborator } from '@fastgpt/service/support/permission/collaborator/list';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  return await listCollaborator({
    teamId: teamId.toString(),
    resourceType: PerResourceTypeEnum.team
  });
}

export default NextAPI(handler);
