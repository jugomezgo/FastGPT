import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { authCert } from '@fastgpt/service/support/permission/auth/common';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';
import { MongoOrgMemberModel } from '@fastgpt/service/support/permission/org/orgMemberSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { teamId } = await authCert({
    req,
    authToken: true
  });

  const orgs = await MongoOrgModel.find({
    teamId
  });

  // 确保root组织位于第一个
  const rootOrg = orgs.find((org) => org.path === '')!;
  const rootOrgIndex = orgs.indexOf(rootOrg);

  if (rootOrgIndex !== 0) {
    orgs.splice(rootOrgIndex, 1);
    orgs.unshift(rootOrg);
  }

  // 获取所有组织成员
  const orgMembers = await MongoOrgMemberModel.find({
    orgId: { $in: orgs.map((org) => org._id) }
  });

  // 将成员按组织分组并添加到对应组织中
  const orgsWithMembers = orgs.map((org) => ({
    ...org.toObject(),
    members: orgMembers.filter((member) => member.orgId.toString() === org._id.toString())
  }));

  return orgsWithMembers;
}

export default NextAPI(handler);
