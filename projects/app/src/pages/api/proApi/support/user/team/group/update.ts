import type { NextApiRequest, NextApiResponse } from 'next';

import { NextAPI } from '@/service/middleware/entry';
import { putUpdateGroupData } from '@fastgpt/global/support/user/team/group/api';
import { authGroupMemberRole } from '@fastgpt/service/support/permission/memberGroup/controllers';
import { GroupMemberRole } from '@fastgpt/global/support/permission/memberGroup/constant';
import { MongoMemberGroupModel } from '@fastgpt/service/support/permission/memberGroup/memberGroupSchema';
import { MongoGroupMemberModel } from '@fastgpt/service/support/permission/memberGroup/groupMemberSchema';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { groupId, name, avatar, memberList } = req.body as putUpdateGroupData;

  if (!groupId) {
    throw new Error('缺少必要参数');
  }

  // 检查是否需要 owner 权限
  const needOwnerPermission = memberList?.some(
    (member) => typeof member === 'object' && member.role === GroupMemberRole.owner
  );

  // 根据权限需求验证用户角色
  const { tmbId } = await authGroupMemberRole({
    groupId,
    req,
    authToken: true,
    role: needOwnerPermission
      ? [GroupMemberRole.owner]
      : [GroupMemberRole.owner, GroupMemberRole.admin]
  });

  await mongoSessionRun(async (session) => {
    if (memberList) {
      // 获取现有成员
      const existingMembers = await MongoGroupMemberModel.find({ groupId }, {}, { session });

      // 确保至少保留一个 owner
      const existingOwners = existingMembers.filter(
        (member) => member.role === GroupMemberRole.owner
      );
      const memberIdMap = new Map(
        memberList.map((member) => [
          typeof member === 'object' ? member.tmbId : String(member),
          typeof member === 'object' ? member.role : GroupMemberRole.member
        ])
      );

      // 检查是否删除了所有 owner
      const hasOwnerAfterUpdate = Array.from(memberIdMap.values()).some(
        (role) => role === GroupMemberRole.owner
      );
      if (!hasOwnerAfterUpdate && existingOwners.length > 0) {
        throw 'no owner in this group';
      }

      const existingMemberIds = existingMembers.map((member) => member.tmbId.toString());

      // 找出需要添加和删除的成员
      const membersToAdd = Array.from(memberIdMap.entries()).filter(
        ([id]) => !existingMemberIds.includes(id)
      );

      const membersToRemove = existingMemberIds.filter((id) => !memberIdMap.has(id));

      // 批量处理新增成员
      if (membersToAdd.length > 0) {
        await MongoGroupMemberModel.insertMany(
          membersToAdd.map(([tmbId, role]) => ({
            groupId,
            tmbId,
            role: role || GroupMemberRole.member
          })),
          { session }
        );
      }

      // 批量删除移除的成员，但确保不会删除最后一个 owner
      if (membersToRemove.length > 0) {
        await MongoGroupMemberModel.deleteMany(
          {
            groupId,
            tmbId: { $in: membersToRemove },
            role: { $ne: GroupMemberRole.owner }
          },
          { session }
        );
      }

      // 更新现有成员的角色
      const updatePromises = Array.from(memberIdMap.entries())
        .filter(([id]) => existingMemberIds.includes(id))
        .map(([tmbId, role]) =>
          MongoGroupMemberModel.updateOne({ groupId, tmbId }, { role }, { session })
        );

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
      }
    }

    // 更新组信息
    if (name || avatar) {
      const updateData: Record<string, any> = {};
      if (name) updateData.name = name;
      if (avatar) updateData.avatar = avatar;

      await MongoMemberGroupModel.updateOne({ _id: groupId }, updateData, { session });
    }
  });

  return { success: true };
}

export default NextAPI(handler);
