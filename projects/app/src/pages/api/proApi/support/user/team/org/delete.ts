import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';
import { MongoOrgMemberModel } from '@fastgpt/service/support/permission/org/orgMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { orgId } = req.query as {
    orgId: string;
  };

  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  // 检查组织是否存在子组织或者成员
  const org = await MongoOrgModel.findById(orgId);
  if (!org) {
    throw 'common:code_error.team_error.org_not_found';
  }

  const hasChildOrg = await MongoOrgModel.exists({
    path: `${org.path}/${org.pathId}`
  });

  const hasMembers = await MongoOrgMemberModel.exists({
    orgId
  });

  if (hasChildOrg || hasMembers) {
    throw 'common:code_error.team_error.cannot_delete_non_empty_org';
  }

  // 删除组织
  await MongoOrgModel.deleteOne({
    _id: orgId
  });

  return void 0;
}

export default NextAPI(handler);
