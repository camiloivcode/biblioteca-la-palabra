const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

const FROM = process.env.SMTP_FROM || 'noreply@biblioteca-la-palabra.com';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

async function sendPasswordResetEmail(to, nombre, token) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Biblioteca La Palabra" <${FROM}>`,
    to,
    subject: 'Recuperación de contraseña — Biblioteca La Palabra',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1e40af;">Recuperación de contraseña</h2>
        <p>Hola <strong>${nombre}</strong>,</p>
        <p>Recibimos una solicitud para restablecer tu contraseña. Haz clic en el siguiente enlace para continuar:</p>
        <p style="text-align:center;margin:28px 0;">
          <a href="${resetUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;">
            Restablecer contraseña
          </a>
        </p>
        <p style="color:#6b7280;font-size:13px;">Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora este mensaje.</p>
        <hr style="border:none;border-top:1px solid #e5e7eb;">
        <p style="color:#9ca3af;font-size:12px;">Biblioteca Popular La Palabra</p>
      </div>
    `,
  });
}

async function sendRegisterRequestEmail(data) {
  await transporter.sendMail({
    from: `"Biblioteca La Palabra — Solicitud" <${FROM}>`,
    to: process.env.ADMIN_EMAIL || 'admin@biblioteca.com',
    subject: 'Nueva solicitud de registro — Biblioteca La Palabra',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;">
        <h2 style="color:#1e40af;">Nueva solicitud de registro</h2>
        <p>Se ha recibido una nueva solicitud de acceso al sistema:</p>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Nombre</td><td style="padding:8px;border:1px solid #e5e7eb;">${data.nombre}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #e5e7eb;">${data.email}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Teléfono</td><td style="padding:8px;border:1px solid #e5e7eb;">${data.telefono || '—'}</td></tr>
          <tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:bold;">Mensaje</td><td style="padding:8px;border:1px solid #e5e7eb;">${data.mensaje || '—'}</td></tr>
        </table>
        <p>Ingresa al sistema para gestionar esta solicitud.</p>
      </div>
    `,
  });
}

module.exports = { sendPasswordResetEmail, sendRegisterRequestEmail };
