import { MongoResourcePermission } from '../../permission/schema';
import { PerResourceTypeEnum } from '@fastgpt/global/support/permission/constant';
import type { PermissionValueType } from '@fastgpt/global/support/permission/type';

export async function updateClbPermission({
  members,
  groups,
  orgs,
  permission,
  teamId,
  resourceType,
  resourceId
}: {
  members?: string[];
  groups?: string[];
  orgs?: string[];
  permission: PermissionValueType;
  teamId: string;
  resourceType: PerResourceTypeEnum;
  resourceId?: string;
}) {
  const bulkOps: {
    updateOne: {
      filter: {
        teamId: string;
        resourceType: PerResourceTypeEnum;
        tmbId?: string;
        groupId?: string;
        orgId?: string;
        resourceId?: string;
      };
      update: {
        $set: { permission: any };
      };
      upsert: boolean;
    };
  }[] = [];

  // 构建成员权限更新操作
  if (members && members?.length > 0) {
    members.forEach((tmbId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            tmbId,
            resourceType,
            resourceId
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 构建组权限更新操作
  if (groups && groups?.length > 0) {
    groups.forEach((groupId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            groupId,
            resourceType,
            resourceId
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 构建组织权限更新操作
  if (orgs && orgs?.length > 0) {
    orgs.forEach((orgId) => {
      bulkOps.push({
        updateOne: {
          filter: {
            teamId,
            orgId,
            resourceType,
            resourceId
          },
          update: {
            $set: { permission }
          },
          upsert: true
        }
      });
    });
  }

  // 执行批量操作
  if (bulkOps && bulkOps.length > 0) {
    try {
      await MongoResourcePermission.bulkWrite(bulkOps);
    } catch (err) {
      console.error('Bulk update operation error:', err);
    }
  }

  return void 0;
}
