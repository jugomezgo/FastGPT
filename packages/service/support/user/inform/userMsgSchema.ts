import { connectionMongo, getMongoModel } from '../../../common/mongo';
const { Schema } = connectionMongo;

const UserInformSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    level: {
      type: String,
      required: true,
      enum: ['normal', 'important']
    },
    title: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    read: {
      type: Boolean,
      default: false
    },
    time: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'userInforms',
    versionKey: false
  }
);

// 添加 userId 索引
UserInformSchema.index({ userId: 1 });

export const UserInformModel = getMongoModel('UserInform', UserInformSchema);
