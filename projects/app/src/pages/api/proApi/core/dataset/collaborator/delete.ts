import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { deletePermission } from '@fastgpt/service/support/permission/collaborator/delete';
import { DatasetCollaboratorDeleteParams } from '@fastgpt/global/core/dataset/collaborator';
import {
  ManagePermissionVal,
  PerResourceTypeEnum
} from '@fastgpt/global/support/permission/constant';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmbId, groupId, orgId, datasetId } = req.query as DatasetCollaboratorDeleteParams;
  const { teamId } = await authDataset({
    datasetId,
    req,
    authToken: true,
    per: ManagePermissionVal
  });

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
