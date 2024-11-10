// middleware/auth.js
const jwt = require('jsonwebtoken');

// responseHandler.js

const responseHandler = (res, data = null, message = null, status = 200) => {
  if (status >= 200 && status < 300) {
    // Respons sukses
    return res.status(status).json({
      success: true,
      data,
      message,
    });
  } else {
    // Respons kesalahan
    return res.status(status).json({
      success: false,
      message: message || 'Terjadi kesalahan',
    });
  }
};

module.exports = responseHandler;

module.exports = {
  responseHandler,
};
