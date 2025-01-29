import type { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';

import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import { MongoOrgModel } from '@fastgpt/service/support/permission/org/orgSchema';
import type { postCreateOrgData } from '@fastgpt/global/support/user/team/org/api';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { avatar, name, description, parentId } = req.body as postCreateOrgData;

  // 权限验证
  const { teamId, tmb } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  try {
    // 参数验证
    if (!name?.trim()) {
      throw new Error('Name is required');
    }

    // 查找父组织并验证权限
    const parentOrg = await MongoOrgModel.findOne({
      _id: parentId,
      teamId // 确保父组织属于同一个团队
    });

    if (!parentOrg) {
      throw new Error('Parent org not found or unauthorized');
    }

    const pathId = nanoid(12);
    const newPath = `${parentOrg.path}/${parentOrg.pathId}`;

    // 创建组织
    const org = await MongoOrgModel.create({
      teamId,
      avatar: avatar || '',
      name: name.trim(),
      description: description?.trim() || '',
      path: newPath,
      pathId,
      createTime: new Date(),
      updateTime: new Date()
    });

    return void 0;
  } catch (error: any) {
    console.error('Create org error:', error);
    throw error.message || 'common:code_error.team_error.create_failed';
  }
}

export default NextAPI(handler);
