import { Document } from 'mongoose';

// 验证码类型枚举
export enum VerificationCodeType {
  REGISTER = 'REGISTER',
  RESET_PASSWORD = 'RESET_PASSWORD',
  LOGIN = 'LOGIN',
  CHANGE_EMAIL = 'CHANGE_EMAIL'
}

// 基础验证码接口
export interface IVerificationCode {
  email: string;
  code: string;
  type: VerificationCodeType;
  used: boolean;
  createdAt: Date;
  updatedAt?: Date;
  attempts: number;
  ip?: string;
}

// Mongoose Document 接口
export interface IVerificationCodeDocument extends IVerificationCode, Document {}

// DTO 接口
export interface CreateVerificationCodeDto {
  email: string;
  type: VerificationCodeType;
  ip?: string;
}

export interface VerifyCodeDto {
  email: string;
  code: string;
  type: VerificationCodeType;
}

// 服务接口
export interface IVerificationCodeService {
  createAndSend(data: CreateVerificationCodeDto): Promise<void>;
  verify(data: VerifyCodeDto): Promise<boolean>;
  invalidate(email: string, type: VerificationCodeType): Promise<void>;
  checkSendFrequency(email: string): Promise<boolean>;
}

// 错误枚举
export enum VerificationCodeError {
  CODE_NOT_FOUND = 'CODE_NOT_FOUND',
  CODE_INVALID = 'CODE_INVALID',
  TOO_MANY_ATTEMPTS = 'TOO_MANY_ATTEMPTS',
  SEND_TOO_FREQUENT = 'SEND_TOO_FREQUENT'
}

// 配置接口
export interface VerificationCodeConfig {
  expiresIn: number;
  maxAttempts: number;
  cooldown: number;
  codeLength: number;
}
