import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { listCollaborator } from '@fastgpt/service/support/permission/collaborator/list';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = await authUserPer({
    req,
    authToken: true
  });

  const { datasetId } = req.query as { datasetId: string };

  return await listCollaborator({
    teamId: teamId.toString(),
    resourceType: PerResourceTypeEnum.app,
    resourceId: datasetId
  });
}

export default NextAPI(handler);
