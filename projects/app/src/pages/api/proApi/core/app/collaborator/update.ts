import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { updateClbPermission } from '@fastgpt/service/support/permission/collaborator/update';
import { UpdateAppCollaboratorBody } from '@fastgpt/global/core/app/collaborator';
import { authApp } from '@fastgpt/service/support/permission/app/auth';
import {
  ManagePermissionVal,
  PerResourceTypeEnum
} from '@fastgpt/global/support/permission/constant';
import { MongoApp } from '@fastgpt/service/core/app/schema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { members, groups, orgs, permission, appId } = req.body as UpdateAppCollaboratorBody;

  const { app } = await authApp({
    appId,
    req,
    authToken: true,
    per: ManagePermissionVal
  });

  // If the app has a parent, set its inherit permission to false
  if (app.parentId) {
    await MongoApp.updateOne(
      {
        _id: appId
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
    teamId: app.teamId,
    resourceType: PerResourceTypeEnum.app,
    resourceId: appId
  });
}

export default NextAPI(handler);
