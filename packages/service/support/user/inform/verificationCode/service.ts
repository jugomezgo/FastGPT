import { VerificationCodeModel } from './codeSchema';
import {
  IVerificationCodeService,
  CreateVerificationCodeDto,
  VerifyCodeDto,
  VerificationCodeError,
  VerificationCodeConfig
} from './type';

const config: VerificationCodeConfig = {
  expiresIn: 300,
  maxAttempts: 5,
  cooldown: 60,
  codeLength: 6
};

export class VerificationCodeService implements IVerificationCodeService {
  private generateCode(): string {
    return Math.random()
      .toString()
      .slice(2, 2 + config.codeLength);
  }

  async createAndSend(data: CreateVerificationCodeDto): Promise<void> {
    const canSend = await this.checkSendFrequency(data.email);
    if (!canSend) {
      throw new Error(VerificationCodeError.SEND_TOO_FREQUENT);
    }

    await this.invalidate(data.email, data.type);

    const code = this.generateCode();
    await VerificationCodeModel.create({
      email: data.email,
      code,
      type: data.type,
      ip: data.ip
    });

    // TODO: 实现邮件发送
    // await this.sendEmail(data.email, code);
  }

  async verify(data: VerifyCodeDto): Promise<boolean> {
    const code = await VerificationCodeModel.findOne({
      email: data.email,
      type: data.type,
      used: false
    }).sort({ createdAt: -1 });

    if (!code) {
      throw new Error(VerificationCodeError.CODE_NOT_FOUND);
    }

    if (code.attempts >= config.maxAttempts) {
      throw new Error(VerificationCodeError.TOO_MANY_ATTEMPTS);
    }

    await VerificationCodeModel.updateOne({ _id: code._id }, { $inc: { attempts: 1 } });

    if (code.code !== data.code) {
      throw new Error(VerificationCodeError.CODE_INVALID);
    }

    await VerificationCodeModel.updateOne({ _id: code._id }, { $set: { used: true } });

    return true;
  }

  async invalidate(email: string, type: string): Promise<void> {
    await VerificationCodeModel.updateMany({ email, type, used: false }, { $set: { used: true } });
  }

  async checkSendFrequency(email: string): Promise<boolean> {
    const lastCode = await VerificationCodeModel.findOne({ email }).sort({ createdAt: -1 });

    if (!lastCode) {
      return true;
    }

    const timeDiff = Date.now() - lastCode.createdAt.getTime();
    return timeDiff >= config.cooldown * 1000;
  }
}
