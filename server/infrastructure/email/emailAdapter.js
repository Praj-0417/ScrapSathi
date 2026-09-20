'use strict';

const nodemailer = require('nodemailer');
const { env } = require('../../config/env');
const logger = require('../../utils/logger');

// Primary & Fallback Transporters
let _primaryTransporter = null;
let _fallbackTransporter = null;

const createTransporter = (user, pass, host = null, port = null) => {
  if (!user || !pass) return null;
  if (host) {
    return nodemailer.createTransport({
      host,
      port: port || 587,
      secure: Number(port) === 465,
      auth: { user, pass },
    });
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
};

const getPrimaryTransporter = () => {
  const primaryEmail = env.PRIMARY_EMAIL;
  const primaryPass = env.PRIMARY_EMAIL_PASSWORD;
  if (primaryEmail && primaryPass && !_primaryTransporter) {
    _primaryTransporter = createTransporter(primaryEmail, primaryPass, env.SMTP_HOST, env.SMTP_PORT);
  }
  return _primaryTransporter;
};

const getFallbackTransporter = () => {
  const fallbackEmail = env.FALLBACK_EMAIL || env.EMAIL;
  const fallbackPass = env.FALLBACK_EMAIL_PASSWORD || env.PASSWORD;
  if (fallbackEmail && fallbackPass && !_fallbackTransporter) {
    _fallbackTransporter = createTransporter(fallbackEmail, fallbackPass);
  }
  return _fallbackTransporter;
};

/**
 * Send an email using Primary Transporter first, falling back to Backup/Aman's credentials,
 * or simulating in dev mode if neither is available.
 * @param {{ to: string, subject: string, html?: string, text?: string }} options
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const fromName = env.EMAIL_FROM_NAME || 'ScrapSaathi';
  const primaryTransporter = getPrimaryTransporter();
  const fallbackTransporter = getFallbackTransporter();

  // 1. Try Primary Transporter if configured
  if (primaryTransporter && env.PRIMARY_EMAIL) {
    try {
      const mailOptions = {
        from: `"${fromName}" <${env.PRIMARY_EMAIL}>`,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      };
      const info = await primaryTransporter.sendMail(mailOptions);
      logger.info('Email sent successfully via Primary Transporter', { messageId: info.messageId, to, subject });
      return info;
    } catch (primaryErr) {
      logger.warn('Primary email sending failed — trying fallback transporter...', {
        to,
        subject,
        error: primaryErr.message,
      });
    }
  }

  // 2. Try Fallback Transporter (Aman's credentials / Backup)
  const fallbackUser = env.FALLBACK_EMAIL || env.EMAIL;
  if (fallbackTransporter && fallbackUser) {
    try {
      const mailOptions = {
        from: `"${fromName}" <${fallbackUser}>`,
        to,
        subject,
        ...(html ? { html } : {}),
        ...(text ? { text } : {}),
      };
      const info = await fallbackTransporter.sendMail(mailOptions);
      logger.info('Email sent successfully via Fallback Transporter', { messageId: info.messageId, to, subject });
      return info;
    } catch (fallbackErr) {
      logger.error('Fallback email sending failed', {
        to,
        subject,
        error: fallbackErr.message,
      });
    }
  }

  // 3. Dev Mode / Simulation Fallback (prevents blocking signup/OTP when SMTP is offline)
  if (process.env.NODE_ENV !== 'production') {
    logger.warn('SMTP services unavailable or unconfigured — logging simulated email to console (dev mode)', { to, subject });
    console.log(`\n================== [SIMULATED EMAIL DELIVERY (DEV MODE)] ==================`);
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content:\n${text || html}`);
    console.log(`============================================================================\n`);
    return { messageId: 'simulated-dev-id' };
  }

  throw new Error('Email delivery failed: Neither primary nor fallback email service is operational.');
};

// ─── Email template functions ─────────────────────────────────────────────────

const sendOtpEmail = async (email, otp) => {
  return sendEmail({
    to: email,
    subject: 'Your ScrapSaathi OTP Code',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#2e7d32;margin-bottom:8px;">ScrapSaathi ♻️</h2>
        <p style="color:#555;">Your One-Time Password (OTP) for verification is:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1b5e20;padding:16px;background:#f1f8e9;border-radius:6px;text-align:center;margin:16px 0;">
          ${otp}
        </div>
        <p style="color:#888;font-size:13px;">This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.</p>
        <p style="color:#aaa;font-size:12px;margin-top:24px;">If you did not request this, you can safely ignore this email.</p>
      </div>
    `,
  });
};

const sendWelcomeEmail = async (email, name) => {
  return sendEmail({
    to: email,
    subject: 'Welcome to ScrapSaathi!',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#2e7d32;">Welcome to ScrapSaathi ♻️</h2>
        <p>Hi <strong>${name}</strong>,</p>
        <p>Thank you for joining ScrapSaathi — your platform for smart, sustainable waste collection.</p>
        <p>You can now:</p>
        <ul>
          <li>Schedule waste pickups at your doorstep</li>
          <li>Track your pickup requests in real time</li>
          <li>Donate to tree plantation and NGO drives</li>
        </ul>
        <p style="margin-top:24px;color:#888;font-size:13px;">Happy recycling! 🌱</p>
      </div>
    `,
  });
};

const sendPickupAcceptedEmail = async (userEmail, { collectorName, collectorPhone, collectorEmail }) => {
  return sendEmail({
    to: userEmail,
    subject: 'Your Waste Pickup Has Been Accepted — ScrapSaathi',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#2e7d32;">Pickup Accepted ♻️</h2>
        <p>Great news! Your waste pickup request has been accepted by a collector.</p>
        <div style="background:#f1f8e9;border-radius:6px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-weight:bold;">Collector Details</p>
          <p style="margin:4px 0;">Name: ${collectorName}</p>
          <p style="margin:4px 0;">Phone: ${collectorPhone}</p>
          <p style="margin:4px 0;">Email: ${collectorEmail}</p>
        </div>
        <p style="color:#555;">Please be available at your address during the scheduled time slot.</p>
        <p style="color:#aaa;font-size:12px;margin-top:24px;">Thank you for using ScrapSaathi!</p>
      </div>
    `,
  });
};

const sendPickupRequestNotification = async (collectorEmails, { address, wasteType, quantity, preferredTimeSlot }) => {
  if (!collectorEmails || collectorEmails.length === 0) return;
  return sendEmail({
    to: collectorEmails.join(','),
    subject: 'New Waste Pickup Request — ScrapSaathi',
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:1px solid #e0e0e0;border-radius:8px;">
        <h2 style="color:#2e7d32;">New Pickup Request ♻️</h2>
        <p>A new waste pickup request is available. Check your dashboard to accept it.</p>
        <div style="background:#f1f8e9;border-radius:6px;padding:16px;margin:16px 0;">
          <p style="margin:0;font-weight:bold;">Request Details</p>
          <p style="margin:4px 0;">📍 Address: ${address}</p>
          <p style="margin:4px 0;">🗑 Waste Type: ${wasteType || 'Multiple types'}</p>
          <p style="margin:4px 0;">📏 Quantity: ${quantity || 'Unspecified'}</p>
          <p style="margin:4px 0;">🕒 Preferred Time: ${preferredTimeSlot}</p>
        </div>
        <p style="color:#aaa;font-size:12px;margin-top:24px;">Login to ScrapSaathi to accept this request.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendOtpEmail,
  sendWelcomeEmail,
  sendPickupAcceptedEmail,
  sendPickupRequestNotification,
};
