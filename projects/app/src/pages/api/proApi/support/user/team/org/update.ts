import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import type { putUpdateOrgData } from '@fastgpt/global/support/user/team/org/api';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { avatar, name, orgId, description } = req.body as putUpdateOrgData;
  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  await MongoOrgModel.updateOne(
    {
      _id: orgId
    },
    {
      avatar,
      name,
      description
    }
  );

  return void 0;
}

export default NextAPI(handler);
