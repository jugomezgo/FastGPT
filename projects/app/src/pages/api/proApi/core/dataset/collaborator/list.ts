import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { listCollaborator } from '@fastgpt/service/support/permission/collaborator/list';
import {
  ReadPermissionVal,
  PerResourceTypeEnum
} from '@fastgpt/global/support/permission/constant';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { datasetId } = req.query as { datasetId: string };

  const { teamId } = await authDataset({
    datasetId,
    req,
    authToken: true,
    per: ReadPermissionVal
  });

  return await listCollaborator({
    teamId: teamId.toString(),
    resourceType: PerResourceTypeEnum.dataset,
    resourceId: datasetId
  });
}

export default NextAPI(handler);
