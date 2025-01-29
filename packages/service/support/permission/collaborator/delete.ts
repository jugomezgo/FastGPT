import { MongoResourcePermission } from '../../permission/schema';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';

export async function deletePermission({
  tmbId,
  groupId,
  orgId,
  teamId,
  resourceType,
  resourceId
}: {
  tmbId?: string;
  groupId?: string;
  orgId?: string;
  teamId: string;
  resourceType: PerResourceTypeEnum;
  resourceId?: string;
}) {
  // const { tmb, teamId } = await authUserPer({
  //   req,
  //   authToken: true
  // });

  // if (tmb.role !== 'owner') {
  //   throw 'common:code_error.team_error.un_auth';
  // }

  // const { tmbId, groupId, orgId } = req.query as DeletePermissionQuery;

  // 验证参数
  if (!tmbId && !groupId && !orgId) {
    throw new Error('Missing required parameters');
  }

  // 构建删除条件
  const deleteFilter: {
    teamId: string;
    resourceType: PerResourceTypeEnum;
    resourceId?: string;
    tmbId?: string;
    groupId?: string;
    orgId?: string;
  } = {
    teamId,
    resourceType: resourceType,
    resourceId
  };

  // 只添加存在的字段到过滤条件
  if (tmbId) deleteFilter.tmbId = tmbId;
  if (groupId) deleteFilter.groupId = groupId;
  if (orgId) deleteFilter.orgId = orgId;

  try {
    const result = await MongoResourcePermission.deleteOne(deleteFilter);

    // 检查是否成功删除
    if (result.deletedCount === 0) {
      console.warn('No matching document found for deletion');
    }
  } catch (error) {
    console.error('Delete permission error:', error);
    throw new Error('Failed to delete permission');
  }

  return void 0;
}
