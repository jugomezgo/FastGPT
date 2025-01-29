import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { DeletePermissionQuery } from '@fastgpt/global/support/permission/collaborator';
import { MongoOrgMemberModel } from '@fastgpt/service/support/permission/org/orgMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orgId, tmbId } = req.query as DeletePermissionQuery;

  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  await MongoOrgMemberModel.deleteOne({
    orgId,
    tmbId
  });

  return void 0;
}

export default NextAPI(handler);
