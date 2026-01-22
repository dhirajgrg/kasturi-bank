const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const verifyToken = (token) => jwt.verify(token, process.env.JWT_SECRET_KEY);

module.exports = {
  generateToken,
  verifyToken,
};
