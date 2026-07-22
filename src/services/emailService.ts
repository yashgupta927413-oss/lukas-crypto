import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

interface SmtpConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
  smtpEnabled: boolean;
}

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const config = await prisma.globalConfig.findUnique({ where: { id: "default" } });
  if (!config || !config.smtpEnabled || !config.smtpHost || !config.smtpUser || !config.smtpPass) {
    return null;
  }
  return {
    smtpHost: config.smtpHost,
    smtpPort: config.smtpPort,
    smtpUser: config.smtpUser,
    smtpPass: config.smtpPass,
    smtpFromEmail: config.smtpFromEmail || config.smtpUser,
    smtpFromName: config.smtpFromName || "Lukas Crypto Management",
    smtpEnabled: config.smtpEnabled,
  };
}

function createTransporter(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.smtpHost,
    port: config.smtpPort,
    secure: config.smtpPort === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  });
}

function baseTemplate(title: string, bodyHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#0f172a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:900;letter-spacing:-0.5px;">
                LUKAS <span style="color:#bae6fd;">CRYPTO</span>
              </h1>
              <p style="margin:4px 0 0;color:#bae6fd;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">
                MANAGEMENT PLATFORM
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #334155;text-align:center;">
              <p style="margin:0;color:#64748b;font-size:11px;">
                © ${new Date().getFullYear()} Lukas Crypto Management. All rights reserved.
              </p>
              <p style="margin:6px 0 0;color:#475569;font-size:10px;">
                AI Bot Investment & Binary Options Trading Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── WELCOME EMAIL ──
export async function sendWelcomeEmail(userEmail: string) {
  const config = await getSmtpConfig();
  if (!config) return;

  const body = `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;">Welcome to Lukas Crypto Management! 🎉</h2>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your account has been successfully created. You now have access to our full suite of AI-powered trading tools.
    </p>
    <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
            <span style="color:#64748b;font-size:12px;">Account Email</span><br/>
            <span style="color:#ffffff;font-size:14px;font-weight:700;">${userEmail}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
            <span style="color:#64748b;font-size:12px;">Free Trial Credit</span><br/>
            <span style="color:#10b981;font-size:14px;font-weight:700;">$100.00 USD</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#64748b;font-size:12px;">3-Wallet Security Model</span><br/>
            <span style="color:#0ea5e9;font-size:14px;font-weight:700;">Holding · Bot Trading · Personal Options</span>
          </td>
        </tr>
      </table>
    </div>
    <p style="color:#94a3b8;font-size:13px;line-height:1.6;margin:0 0 24px;">
      Start by depositing crypto into your Holding Wallet and activating an AI Bot contract for daily automated yields.
    </p>
    <a href="https://lukas-crypto.vercel.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:900;letter-spacing:0.5px;">
      LAUNCH DASHBOARD →
    </a>`;

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: userEmail,
    subject: "Welcome to Lukas Crypto Management 🚀",
    html: baseTemplate("Welcome to Lukas Crypto Management", body),
  });
}

// ── DEPOSIT CONFIRMED EMAIL ──
export async function sendDepositConfirmedEmail(userEmail: string, amount: string) {
  const config = await getSmtpConfig();
  if (!config) return;

  const body = `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;">Deposit Confirmed ✅</h2>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your deposit has been approved and credited to your Holding Wallet.
    </p>
    <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:0 0 24px;text-align:center;">
      <span style="color:#64748b;font-size:12px;display:block;margin-bottom:4px;">Amount Credited</span>
      <span style="color:#10b981;font-size:28px;font-weight:900;font-family:monospace;">+$${amount}</span>
    </div>
    <a href="https://lukas-crypto.vercel.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:900;">
      VIEW WALLET →
    </a>`;

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: userEmail,
    subject: `Deposit of $${amount} Confirmed ✅`,
    html: baseTemplate("Deposit Confirmed", body),
  });
}

// ── WITHDRAWAL PROCESSED EMAIL ──
export async function sendWithdrawalProcessedEmail(userEmail: string, amount: string, status: "COMPLETED" | "REJECTED") {
  const config = await getSmtpConfig();
  if (!config) return;

  const isApproved = status === "COMPLETED";
  const body = `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;">
      Withdrawal ${isApproved ? "Approved ✅" : "Rejected ❌"}
    </h2>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your withdrawal request of <strong style="color:#ffffff;">$${amount}</strong> has been 
      <strong style="color:${isApproved ? "#10b981" : "#f43f5e"};">${isApproved ? "approved and processed" : "rejected by the admin"}</strong>.
      ${!isApproved ? "The funds have been returned to your Holding Wallet." : ""}
    </p>
    <a href="https://lukas-crypto.vercel.app/dashboard" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:900;">
      VIEW WALLET →
    </a>`;

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: userEmail,
    subject: `Withdrawal $${amount} ${isApproved ? "Approved ✅" : "Rejected ❌"}`,
    html: baseTemplate("Withdrawal Update", body),
  });
}

// ── BOT ACTIVATED EMAIL ──
export async function sendBotActivatedEmail(userEmail: string, tierName: string, principal: string, durationDays: number) {
  const config = await getSmtpConfig();
  if (!config) return;

  const body = `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;">AI Bot Contract Activated 🤖</h2>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
      Your AI Bot contract has been successfully activated and is now generating daily yields.
    </p>
    <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
            <span style="color:#64748b;font-size:12px;">Plan</span><br/>
            <span style="color:#0ea5e9;font-size:14px;font-weight:700;">${tierName}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;border-bottom:1px solid #1e293b;">
            <span style="color:#64748b;font-size:12px;">Locked Principal</span><br/>
            <span style="color:#10b981;font-size:14px;font-weight:700;">$${principal}</span>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 0;">
            <span style="color:#64748b;font-size:12px;">Lock Duration</span><br/>
            <span style="color:#f59e0b;font-size:14px;font-weight:700;">${durationDays} Days</span>
          </td>
        </tr>
      </table>
    </div>
    <a href="https://lukas-crypto.vercel.app/bots" style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#6366f1);color:#0f172a;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:13px;font-weight:900;">
      VIEW BOT CONTRACTS →
    </a>`;

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: userEmail,
    subject: `AI Bot "${tierName}" Activated – $${principal} Locked 🤖`,
    html: baseTemplate("Bot Contract Activated", body),
  });
}

// ── GENERIC TEST EMAIL ──
export async function sendTestEmail(toEmail: string) {
  const config = await getSmtpConfig();
  if (!config) throw new Error("SMTP is not configured or not enabled.");

  const body = `
    <h2 style="margin:0 0 16px;color:#ffffff;font-size:22px;font-weight:800;">SMTP Test Successful ✅</h2>
    <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 20px;">
      This is a test email from <strong style="color:#0ea5e9;">Lukas Crypto Management</strong> Admin Panel.
      Your iCloud SMTP configuration is working correctly!
    </p>
    <div style="background-color:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin:0 0 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="padding:6px 0;"><span style="color:#64748b;font-size:12px;">SMTP Host:</span> <span style="color:#ffffff;font-size:12px;">${config.smtpHost}</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><span style="color:#64748b;font-size:12px;">Port:</span> <span style="color:#ffffff;font-size:12px;">${config.smtpPort}</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;"><span style="color:#64748b;font-size:12px;">Sender:</span> <span style="color:#0ea5e9;font-size:12px;">${config.smtpFromName} &lt;${config.smtpFromEmail}&gt;</span></td>
        </tr>
      </table>
    </div>`;

  const transporter = createTransporter(config);
  await transporter.sendMail({
    from: `"${config.smtpFromName}" <${config.smtpFromEmail}>`,
    to: toEmail,
    subject: "✅ Lukas Crypto SMTP Test – Connection Verified",
    html: baseTemplate("SMTP Test", body),
  });
}
