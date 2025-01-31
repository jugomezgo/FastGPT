import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { deletePermission } from '@fastgpt/service/support/permission/collaborator/delete';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { DatasetCollaboratorDeleteParams } from '@fastgpt/global/core/dataset/collaborator';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = await authUserPer({
    req,
    authToken: true
  });

  const { tmbId, groupId, orgId, datasetId } = req.query as DatasetCollaboratorDeleteParams;

  return await deletePermission({
    tmbId,
    groupId,
    orgId,
    teamId,
    resourceType: PerResourceTypeEnum.dataset,
    resourceId: datasetId
  });
}

export default NextAPI(handler);
