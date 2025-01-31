import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { updateClbPermission } from '@fastgpt/service/support/permission/collaborator/update';
import { UpdateDatasetCollaboratorBody } from '@fastgpt/global/core/dataset/collaborator';
import { authDataset } from '@fastgpt/service/support/permission/dataset/auth';
import { MongoDataset } from '@fastgpt/service/core/dataset/schema';
import {
  ManagePermissionVal,
  PerResourceTypeEnum
} from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId, dataset } = await authDataset({
    datasetId: req.body.datasetId,
    req,
    authToken: true,
    per: ManagePermissionVal
  });

  const { members, groups, orgs, permission, datasetId } =
    req.body as UpdateDatasetCollaboratorBody;

  // If the dataset has a parent, set its inherit permission to false
  if (dataset.parentId) {
    await MongoDataset.updateOne(
      {
        _id: datasetId
      },
      {
        inheritPermission: false
      }
    );
  }

  return await updateClbPermission({
    members,
    groups,
    orgs,
    permission,
    teamId,
    resourceType: PerResourceTypeEnum.dataset,
    resourceId: datasetId
  });
}

export default NextAPI(handler);
