import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';

import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { putMoveOrgType } from '@fastgpt/global/support/user/team/org/api';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  const { orgId, targetOrgId } = req.body as putMoveOrgType;

  // 找到目标组织
  const targetOrg = await MongoOrgModel.findOne({
    _id: targetOrgId
  });

  if (!targetOrg) {
    throw 'common:code_error.team_error.org_not_found';
  }

  // 获取当前组织信息
  const currentOrg = await MongoOrgModel.findById(orgId);
  if (!currentOrg) {
    throw 'common:code_error.team_error.org_not_found';
  }

  const oldPath = currentOrg.path;
  const newPath = `${targetOrg.path}/${targetOrg.pathId}`;

  // 更改组织的path
  const org = await MongoOrgModel.findOneAndUpdate(
    {
      _id: orgId
    },
    {
      path: newPath
    }
  );

  // 更改子组织的path
  await MongoOrgModel.updateMany(
    {
      path: { $regex: `^${oldPath}/${currentOrg.pathId}` }
    },
    [
      {
        $set: {
          path: {
            $concat: [
              newPath,
              {
                $substr: [
                  '$path',
                  oldPath.length,
                  { $subtract: [{ $strLenCP: '$path' }, oldPath.length] }
                ]
              }
            ]
          }
        }
      }
    ]
  );

  return org;
}

export default NextAPI(handler);
