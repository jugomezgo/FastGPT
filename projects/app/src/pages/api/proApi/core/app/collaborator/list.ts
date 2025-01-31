import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { listCollaborator } from '@fastgpt/service/support/permission/collaborator/list';
import { authApp } from '@fastgpt/service/support/permission/app/auth';
import {
  ReadPermissionVal,
  PerResourceTypeEnum
} from '@fastgpt/global/support/permission/constant';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { appId } = req.query as { appId: string };

  const { teamId } = await authApp({
    appId,
    req,
    authToken: true,
    per: ReadPermissionVal
  });

  return await listCollaborator({
    teamId: teamId.toString(),
    resourceType: PerResourceTypeEnum.app,
    resourceId: appId
  });
}

export default NextAPI(handler);
