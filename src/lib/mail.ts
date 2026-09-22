import nodemailer from "nodemailer";

function getTransporter() {
  if (!process.env.EMAIL_SERVER_HOST) return null;

  return nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST,
    port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
    secure: Number(process.env.EMAIL_SERVER_PORT) === 465,
    auth: process.env.EMAIL_SERVER_USER
      ? {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        }
      : undefined,
  });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  const transporter = getTransporter();

  if (!transporter) {
    // No SMTP configured (e.g. local dev) — log so the flow stays testable.
    console.warn(
      `[mail] EMAIL_SERVER_HOST não configurado. Link de redefinição de senha para ${to}:\n${resetUrl}`
    );
    return;
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? "ConectaX <no-reply@conectax.local>",
    to,
    subject: "Redefinição de senha - ConectaX",
    html: `
      <p>Você solicitou a redefinição da sua senha na ConectaX.</p>
      <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a></p>
      <p>Este link expira em 1 hora. Se você não fez essa solicitação, ignore este e-mail.</p>
    `,
  });
}
