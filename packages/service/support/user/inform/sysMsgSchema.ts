import { connectionMongo, getMongoModel } from '../../../common/mongo';
const { Schema } = connectionMongo;

interface SystemMsg {
  _id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  isShowing: boolean;
}

const sysMsgSchema = new Schema(
  {
    _id: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isShowing: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
    collection: 'sysMsg'
  }
);

export const SystemMsgModel = getMongoModel<SystemMsg>('SystemMsg', sysMsgSchema);
