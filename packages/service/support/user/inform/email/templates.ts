import { template } from './type';

export function verificationCodeMsg(code: string): template {
  return {
    subject: 'Verification Code',
    html: `Your verification code is: <b>${code}</b>`
  };
}
