module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret_dev',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};