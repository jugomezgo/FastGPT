import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { authUserPer } from '@fastgpt/service/support/permission/user/auth';
import type { putUpdateOrgMembersData } from '@fastgpt/global/support/user/team/org/api';
import { MongoOrgMemberModel } from '@fastgpt/service/support/permission/org/orgMemberSchema';
import { Types } from 'mongoose';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tmb, teamId } = await authUserPer({
    req,
    authToken: true
  });

  if (!tmb.permission.hasManagePer) {
    throw 'common:code_error.team_error.un_auth';
  }

  const { members, orgId } = req.body as putUpdateOrgMembersData;

  try {
    // 获取该组织所有现有成员
    const currentMembers = await MongoOrgMemberModel.find({
      teamId,
      orgId
    });

    const requestMemberIds = new Set(members.map((m) => m.tmbId));
    const currentMemberIds = new Set(currentMembers.map((m) => m.tmbId));

    // 需要删除的成员
    const membersToDelete = currentMembers.filter((m) => !requestMemberIds.has(m.tmbId));
    // 需要新增的成员
    const membersToAdd = members.filter((m) => !currentMemberIds.has(m.tmbId));

    // 构建批量操作
    const bulkOps = [
      // 删除操作
      ...membersToDelete.map((member) => ({
        deleteOne: {
          filter: { _id: new Types.ObjectId(member._id) }
        }
      })),
      // 新增操作
      ...membersToAdd.map((member) => ({
        insertOne: {
          document: {
            teamId,
            tmbId: member.tmbId,
            orgId
          }
        }
      }))
    ];

    if (bulkOps.length > 0) {
      await MongoOrgMemberModel.bulkWrite(bulkOps);
    }

    res.json({ code: 200, message: 'success' });
  } catch (error) {
    console.error('Update org members error:', error);
    throw 'common:code_error.team_error.update_failed';
  }
}

export default NextAPI(handler);
