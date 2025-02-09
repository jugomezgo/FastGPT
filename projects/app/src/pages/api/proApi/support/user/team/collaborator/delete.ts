import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { DeletePermissionQuery } from '@fastgpt/global/support/permission/collaborator';
import { deletePermission } from '@fastgpt/service/support/permission/collaborator/delete';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  if (tmb.role !== 'owner') {
    throw 'common:code_error.team_error.un_auth';
  }

  const { tmbId, groupId, orgId } = req.query as DeletePermissionQuery;

  return await deletePermission({
    tmbId,
    groupId,
    orgId,
    teamId,
    resourceType: PerResourceTypeEnum.team
  });
}

export default NextAPI(handler);
