import type { NextApiRequest, NextApiResponse } from 'next';
import { NextAPI } from '@/service/middleware/entry';
import { useReqFrequencyLimit } from '@fastgpt/service/common/middle/reqFrequencyLimit';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { joinDefaultTeam, getTmbInfoByTmbId } from '@fastgpt/service/support/user/team/controller';
import { getUserDetail } from '@fastgpt/service/support/user/controller';
import { pushTrack } from '@fastgpt/service/common/middle/tracks/utils';
import { createJWT, setCookie } from '@fastgpt/service/support/permission/controller';
import { verificationService } from '@fastgpt/service/support/user/inform/verificationCode/service';
import { VerificationCodeType } from '@fastgpt/service/support/user/inform/verificationCode/type';
import { mongoSessionRun } from '@fastgpt/service/common/mongo/sessionRun';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, password, code } = req.body as {
    username: string;
    password: string;
    code: string;
  };

  if (!username || !password || !code) {
    return Promise.reject('Invalid params');
  }

  // 验证验证码
  const verified = await verificationService.verify({
    email: username,
    code,
    type: VerificationCodeType.REGISTER
  });

  if (!verified) {
    return Promise.reject('Invalid verification code');
  }

  // 确保用户不存在于数据库
  const userExist = await MongoUser.findOne({
    username
  });

  if (userExist) {
    return Promise.reject('User already exists');
  }

  try {
    const result = await mongoSessionRun(async (session) => {
      // 在数据库创建用户
      const users = await MongoUser.create(
        [
          {
            username,
            password
          }
        ],
        { session }
      );
      const user = users[0];

      // 加入默认团队
      const tmb = await joinDefaultTeam({
        userId: user._id,
        session
      });

      return {
        user,
        tmb
      };
    });

    const { user, tmb } = result;

    console.log('tmb', tmb);

    const tmbInfo = await getTmbInfoByTmbId({
      tmbId: tmb._id
    });

    const userDetail = await getUserDetail({
      tmbId: tmb._id,
      userId: tmbInfo.userId
    });

    MongoUser.findByIdAndUpdate(user._id, {
      lastLoginTmbId: userDetail.team.tmbId
    });

    pushTrack.login({
      type: 'password',
      uid: user._id,
      teamId: userDetail.team.teamId,
      tmbId: userDetail.team.tmbId
    });

    const token = createJWT({
      ...userDetail,
      isRoot: username === 'root'
    });

    setCookie(res, token);

    return {
      user: userDetail,
      token
    };
  } catch (error) {
    return Promise.reject(error);
  }
}

export default NextAPI(useReqFrequencyLimit(120, 10, true), handler);

// req: {
//     "username":"3342288169@qq.com",
//     "code":"159871",
//     "password":"ce2c3b7103a2cb8b995a9b889a5796bc6643b6038543a49ff9d62d46127b7cb6"
// }

// res: {
//     "code": 200,
//     "statusText": "",
//     "message": "",
//     "data": {
//         "user": {
//             "_id": "6797616280e4aa070161d443",
//             "username": "3342288169@qq.com",
//             "avatar": "/icon/logo.svg",
//             "timezone": "Asia/Shanghai",
//             "promotionRate": 15,
//             "team": {
//                 "userId": "6797616280e4aa070161d443",
//                 "teamId": "6797616280e4aa070161d446",
//                 "teamName": "3342288169 Team",
//                 "memberName": "Member",
//                 "avatar": "/icon/logo.svg",
//                 "tmbId": "6797616280e4aa070161d448",
//                 "role": "owner",
//                 "status": "active",
//                 "defaultTeam": true,
//                 "permission": {
//                     "value": 4294967295,
//                     "isOwner": true,
//                     "_permissionList": {
//                         "read": {
//                             "name": "common:permission.read",
//                             "description": "",
//                             "value": 4,
//                             "checkBoxType": "single"
//                         },
//                         "write": {
//                             "name": "common:permission.write",
//                             "description": "",
//                             "value": 2,
//                             "checkBoxType": "single"
//                         },
//                         "manage": {
//                             "name": "common:permission.manager",
//                             "description": "",
//                             "value": 1,
//                             "checkBoxType": "single"
//                         }
//                     },
//                     "hasManagePer": true,
//                     "hasWritePer": true,
//                     "hasReadPer": true
//                 }
//             },
//             "permission": {
//                 "value": 4294967295,
//                 "isOwner": true,
//                 "_permissionList": {
//                     "read": {
//                         "name": "common:permission.read",
//                         "description": "",
//                         "value": 4,
//                         "checkBoxType": "single"
//                     },
//                     "write": {
//                         "name": "common:permission.write",
//                         "description": "",
//                         "value": 2,
//                         "checkBoxType": "single"
//                     },
//                     "manage": {
//                         "name": "common:permission.manager",
//                         "description": "",
//                         "value": 1,
//                         "checkBoxType": "single"
//                     }
//                 },
//                 "hasManagePer": true,
//                 "hasWritePer": true,
//                 "hasReadPer": true
//             }
//         },
//         "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2Nzk3NjE2MjgwZTRhYTA3MDE2MWQ0NDMiLCJ0ZWFtSWQiOiI2Nzk3NjE2MjgwZTRhYTA3MDE2MWQ0NDYiLCJ0bWJJZCI6IjY3OTc2MTYyODBlNGFhMDcwMTYxZDQ0OCIsImV4cCI6MTczODU3ODkxNCwiaWF0IjoxNzM3OTc0MTE0fQ.fjyC3RNT5SCDRAuTTtsZV3MZR3-rJNHLKCkFDK0ySxI"
//     }
// }
