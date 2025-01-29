import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { updateClbPermission } from '@fastgpt/service/support/permission/collaborator/update';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import { UpdateDatasetCollaboratorBody } from '@fastgpt/global/core/dataset/collaborator';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  if (tmb.role !== 'owner') {
    throw 'common:code_error.team_error.un_auth';
  }

  const { members, groups, orgs, permission, datasetId } =
    req.body as UpdateDatasetCollaboratorBody;

  return await updateClbPermission({
    members,
    groups,
    orgs,
    permission,
    teamId,
    resourceType: PerResourceTypeEnum.app,
    resourceId: datasetId
  });
}

export default NextAPI(handler);
