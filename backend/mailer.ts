import nodemailer from "nodemailer";

export interface SendEmailParams {
  to: string;
  toName: string;
  subject: string;
  replyText: string;
  originalMessage: string;
}

let transporterInstance: any = null;

async function getTransporter() {
  if (transporterInstance) return transporterInstance;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    console.log("Configuring custom SMTP mailer transporter...");
    transporterInstance = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    console.log("No SMTP credentials found in environment. Generating dynamic Ethereal Email test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporterInstance = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      (transporterInstance as any).isTestAccount = true;
    } catch (err) {
      console.error("Failed to generate Ethereal Email account. Falling back to log-only mailer.", err);
      transporterInstance = {
        sendMail: async (options: any) => {
          console.log("[MOCK EMAIL SEND] SMTP not configured. Content:", options);
          return { messageId: "mock-id", previewUrl: "https://ethereal.email" };
        }
      };
    }
  }

  return transporterInstance;
}

export async function sendReplyEmail(params: SendEmailParams): Promise<{ success: boolean; previewUrl?: string; info?: any }> {
  try {
    const transporter = await getTransporter();
    
    const senderName = "Raviraj Chauhan";
    const senderEmail = process.env.SMTP_FROM || "ravirajchauhan219@gmail.com";

    const emailHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #020617; padding: 40px 20px; color: #f1f5f9; text-align: left;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0b1329; border: 1px solid #1e293b; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
          
          <!-- Header -->
          <div style="padding: 30px; background: linear-gradient(135deg, #1d4ed8, #7c3aed); text-align: center; border-bottom: 1px solid #1e293b;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.025em;">Raviraj Chauhan Portfolio</h1>
            <p style="margin: 5px 0 0; font-size: 13px; color: #c084fc; font-family: monospace; text-transform: uppercase; letter-spacing: 0.1em;">Inbound Message Response</p>
          </div>

          <!-- Body -->
          <div style="padding: 35px 30px; line-height: 1.6;">
            <p style="margin-top: 0; font-size: 16px; color: #f8fafc; font-weight: 500;">Hi ${params.toName},</p>
            
            <p style="font-size: 14px; color: #cbd5e1;">
              Thank you for reaching out through my portfolio website. I have reviewed your message and wanted to get back to you:
            </p>

            <!-- Reply Box -->
            <div style="background-color: #0f172a; border-left: 4px solid #a855f7; padding: 20px; border-radius: 8px; margin: 25px 0; color: #e2e8f0; font-size: 14px; white-space: pre-wrap;">${params.replyText}</div>

            <p style="font-size: 14px; color: #cbd5e1; margin-bottom: 30px;">
              Please let me know if you have any questions or would like to discuss potential projects further!
            </p>

            <!-- Button -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://ais-dev-xfacfffibudgwoj4dob52l-748237559399.asia-southeast1.run.app" target="_blank" style="background-color: #3b82f6; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 14px; transition: all 0.2s; display: inline-block; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.25);">Visit My Portfolio</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #1e293b; margin: 30px 0;" />

            <!-- Original Message Drawer -->
            <div style="background-color: #090d16; border: 1px solid #111827; padding: 15px; border-radius: 8px;">
              <p style="margin: 0 0 8px; font-size: 11px; font-family: monospace; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em;">YOUR ORIGINAL MESSAGE:</p>
              <p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic; line-height: 1.5; white-space: pre-wrap;">"${params.originalMessage}"</p>
            </div>
          </div>

          <!-- Footer -->
          <div style="padding: 20px 30px; background-color: #090f20; text-align: center; border-top: 1px solid #1e293b;">
            <p style="margin: 0; font-size: 11px; color: #64748b; font-family: monospace;">
              &copy; ${new Date().getFullYear()} Raviraj Chauhan. All Rights Reserved.
            </p>
          </div>
        </div>
      </div>
    `;

    const mailOptions = {
      from: `"${senderName}" <${senderEmail}>`,
      to: `"${params.toName}" <${params.to}>`,
      subject: params.subject,
      text: `${params.replyText}\n\n---\nOriginal message from you:\n"${params.originalMessage}"`,
      html: emailHtml,
    };

    const info = await transporter.sendMail(mailOptions);
    let previewUrl: string | undefined;

    if (transporter.isTestAccount) {
      previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      console.log(`[ETHEREAL MAIL] Reply sent! Preview URL: ${previewUrl}`);
    }

    return { success: true, previewUrl, info };
  } catch (error) {
    console.error("Error in sendReplyEmail:", error);
    return { success: false };
  }
}
