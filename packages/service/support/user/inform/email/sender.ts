import nodemailer from 'nodemailer';
import type { EmailConfig, SendEmailParams } from './type';

export class EmailSender {
  private transporter: nodemailer.Transporter;
  private emailConfig: EmailConfig;
  private static instance: EmailSender;

  private constructor(
    host: string,
    port: number,
    secure: boolean,
    username: string,
    password: string
  ) {
    this.emailConfig = {
      host,
      port,
      secure,
      auth: {
        user: username,
        pass: password
      }
    };

    this.transporter = nodemailer.createTransport(this.emailConfig);
  }

  public static getInstance(config?: {
    host: string;
    port: number;
    secure: boolean;
    username: string;
    password: string;
  }): EmailSender {
    if (!EmailSender.instance) {
      if (!config) {
        throw new Error('EmailSender needs to be initialized with config first');
      }
      EmailSender.instance = new EmailSender(
        config.host,
        config.port,
        config.secure,
        config.username,
        config.password
      );
    }
    return EmailSender.instance;
  }

  async sendMail(params: SendEmailParams): Promise<void> {
    try {
      const info = await this.transporter.sendMail({
        from: this.emailConfig.auth.user,
        to: params.to,
        subject: params.subject,
        html: params.html
      });
      return info;
    } catch (error) {
      throw error;
    }
  }
}

export function initEmailSender(config: {
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password: string;
}) {
  EmailSender.getInstance(config);
}
