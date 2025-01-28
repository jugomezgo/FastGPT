export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export interface template {
  subject: string;
  html: string;
}
