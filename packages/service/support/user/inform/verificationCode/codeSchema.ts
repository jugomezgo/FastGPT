import { connectionMongo, getMongoModel } from '../../../../common/mongo';
import { IVerificationCodeDocument, VerificationCodeType } from './type';

const { Schema } = connectionMongo;

const verificationCodeSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      index: true
    },
    code: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(VerificationCodeType)
    },
    used: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 300
    },
    attempts: {
      type: Number,
      default: 0
    },
    ip: {
      type: String
    }
  },
  {
    timestamps: true,
    collection: 'verification_codes'
  }
);

// 添加索引
verificationCodeSchema.index({ email: 1, type: 1 });
verificationCodeSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 });

// 创建模型
export const VerificationCodeModel = getMongoModel<IVerificationCodeDocument>(
  'VerificationCode',
  verificationCodeSchema
);
