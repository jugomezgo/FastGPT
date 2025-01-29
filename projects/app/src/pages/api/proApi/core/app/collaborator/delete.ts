import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { AppCollaboratorDeleteParams } from '@fastgpt/global/core/app/collaborator';
import { deletePermission } from '@fastgpt/service/support/permission/collaborator/delete';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = await authUserPer({
    req,
    authToken: true
  });

  const { tmbId, groupId, orgId, appId } = req.query as AppCollaboratorDeleteParams;

  return await deletePermission({
    tmbId,
    groupId,
    orgId,
    teamId,
    resourceType: PerResourceTypeEnum.app,
    resourceId: appId
  });
}

export default NextAPI(handler);
