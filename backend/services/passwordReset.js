// services/passwordReset.js
const { User, ResetToken } = require('../models');
const { sha256 } = require('../utils/helpers');

async function createPasswordResetToken(email) {
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return null;
  
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  const tokenHash = sha256(resetCode);
  
  const resetToken = new ResetToken({
    user_id: user._id,
    token: tokenHash,
    expires_at: new Date(Date.now() + 15 * 60 * 1000)
  });
  await resetToken.save();
  
  return { user, resetCode };
}

async function resetPasswordWithToken(token, newPasswordHash) {
  const tokenHash = sha256(token);
  const resetToken = await ResetToken.findOne({
    token: tokenHash,
    used: false,
    expires_at: { $gt: new Date() }
  });
  
  if (!resetToken) return null;
  
  const user = await User.findById(resetToken.user_id);
  if (!user) return null;
  
  user.password_hash = newPasswordHash;
  await user.save();
  
  resetToken.used = true;
  await resetToken.save();
  
  return user;
}

module.exports = {
  createPasswordResetToken,
  resetPasswordWithToken
};