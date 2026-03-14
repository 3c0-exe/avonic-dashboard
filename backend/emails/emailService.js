// emails/emailService.js - Central Email Service
const sgMail = require('@sendgrid/mail');
const fs = require('fs').promises;
const path = require('path');

// Set API key (will be called from server.js)
function initializeEmailService(apiKey) {
  sgMail.setApiKey(apiKey);
  console.log('✅ Email service initialized');
}

// Helper: Load HTML template and replace placeholders
async function loadTemplate(templateName, replacements) {
  try {
    const templatePath = path.join(__dirname, 'templates', `${templateName}.html`);
    let html = await fs.readFile(templatePath, 'utf-8');
    
    // Replace all placeholders like {{username}}, {{resetCode}}, etc.
    for (const [key, value] of Object.entries(replacements)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value || '');
    }
    
    return html;
  } catch (error) {
    console.error(`❌ Failed to load template: ${templateName}`, error);
    throw error;
  }
}

// Send email helper
async function sendEmail(to, subject, htmlContent) {
  const mailOptions = {
    from: 'AVONIC System <compost.avonic@gmail.com>',
    to,
    subject,
    html: htmlContent
  };
  
  try {
    await sgMail.send(mailOptions);
    console.log(`✅ Email sent to: ${to}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Email send failed:', error);
    if (error.response) {
      console.error(error.response.body);
    }
    return { success: false, error };
  }
}

// 1. Password Reset Email (for ESP32 devices with 6-digit code)
async function sendPasswordResetEmail(user, resetCode, deviceId = null) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-reset-password', {
    username: user.username,
    resetCode: resetCode,
    resetUrl: `${frontendUrl}/reset-password?token=${resetCode}`,
    deviceId: deviceId || 'Unknown Device',
    changeTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '🔐 Your Password Reset Code',
    html
  );
}

// 2. Password Reset Email (for Web users - same template, different context)
async function sendPasswordResetWebEmail(user, resetCode) {
  const resetUrl = `${process.env.FRONTEND_URL || 'https://3c0-exe.github.io'}/reset-password?token=${resetCode}`;
  
  const html = await loadTemplate('email-reset-password', {
    username: user.username,
    resetCode: resetCode,
    resetUrl: resetUrl,
    deviceId: 'Web Browser',
    changeTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '🔐 Reset Your AVONIC Password',
    html
  );
}

// 3. Password Updated Confirmation
async function sendPasswordChangedEmail(user, deviceId = null) {
  const html = await loadTemplate('email-password-updated', {
    username: user.username,
    deviceId: deviceId || 'Unknown Device',
    changeTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '✅ Password Successfully Changed',
    html
  );
}

// 4. Welcome Email (Account Created)
async function sendWelcomeEmail(user) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-account-created', {
    username: user.username,
    email: user.email,
    verifyUrl: `${frontendUrl}/verify?email=${user.email}`,
    createdTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '🌱 Welcome to AVONIC - Let\'s Get Growing!',
    html
  );
}

// 5. Account Synced (after ESP registration) - uses same template
async function sendAccountSyncedEmail(user, espID) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-account-created', {
    username: user.username,
    email: user.email,
    verifyUrl: `${frontendUrl}/dashboard`,
    createdTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '✅ Your Device is Synced!',
    html
  );
}

// 6. Device Claimed
async function sendDeviceClaimedEmail(user, device) {
  const html = await loadTemplate('email-bin-claimed', {
    username: user.username,
    deviceId: device.espID,
    deviceName: device.name || 'AVONIC Compost Bin',
    claimTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '🔗 New Device Claimed Successfully',
    html
  );
}

// 7. Device Unclaimed
async function sendDeviceUnclaimedEmail(user, device) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-bin-unclaimed', {
    username: user.username,
    deviceId: device.espID,
    deviceName: device.name || 'AVONIC Compost Bin',
    tutorialsUrl: `${frontendUrl}/tutorials`,
    unclaimTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    })
  });
  
  return await sendEmail(
    user.email,
    '🔓 Device Unclaimed from Your Account',
    html
  );
}

// 8. Suspicious Activity Alert
async function sendSuspiciousActivityEmail(user, activity) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-suspicious-activity', {
    username: user.username,
    activityType: activity.type || 'Unknown Activity',
    activityTime: activity.timestamp || new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    }),
    ipAddress: activity.ipAddress || 'Unknown IP',
    location: activity.location || 'Unknown Location',
    deviceInfo: activity.deviceInfo || 'Unknown Device',
    changePasswordUrl: `${frontendUrl}/change-password`
  });
  
  return await sendEmail(
    user.email,
    '⚠️ Suspicious Activity Detected on Your Account',
    html
  );
}

// 9. Email Changed Confirmation
async function sendEmailChangedEmail(user, oldEmail, newEmail) {
  const frontendUrl = process.env.FRONTEND_URL || 'https://3c0-exe.github.io';
  
  const html = await loadTemplate('email-changed', {
    username: user.username,
    oldEmail: oldEmail,
    newEmail: newEmail,
    changeTime: new Date().toLocaleString('en-US', { 
      dateStyle: 'full', 
      timeStyle: 'short' 
    }),
    changePasswordUrl: `${frontendUrl}/avonic-dashboard/#/settings`
  });
  
  // Send to BOTH old and new email addresses for security
  await sendEmail(
    oldEmail,
    '⚠️ Your AVONIC Email Address Was Changed',
    html
  );
  
  return await sendEmail(
    newEmail,
    '✅ Email Address Successfully Updated',
    html
  );
}

module.exports = {
  initializeEmailService,
  sendPasswordResetEmail,
  sendPasswordResetWebEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
  sendAccountSyncedEmail,
  sendDeviceClaimedEmail,
  sendDeviceUnclaimedEmail,
  sendSuspiciousActivityEmail,
  sendEmailChangedEmail,
};