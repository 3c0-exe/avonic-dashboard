// config/email.js
const sgMail = require('@sendgrid/mail');
const emailService = require('../emails/emailService');

function initializeEmail() {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  emailService.initializeEmailService(process.env.SENDGRID_API_KEY);
}

function verifyEmailConfig() {
  console.log('\n📧 === EMAIL CONFIGURATION (SendGrid) ===');
  if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY is NOT SET');
    return;
  }
  console.log('✅ SendGrid API key loaded');
  
  if (process.env.SENDGRID_API_KEY.startsWith('SG.')) {
    console.log('✅ API Key format correct');
  } else {
    console.warn('⚠️ API Key format looks incorrect');
  }
}

module.exports = { initializeEmail, verifyEmailConfig };