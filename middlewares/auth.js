const jwt = require('jsonwebtoken');
const {
  UnauthorizedError, // 400
} = require('../errors/errors');

const auth = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    throw new UnauthorizedError('Нет доступа');
  }

  const token = authorization.replace('Bearer ', '');

  let payload;

  try {
    payload = jwt.verify(token, 'unique-secret-key');
  } catch (err) {
    throw new UnauthorizedError('Нет доступа');
  }

  req.user = payload;

  next();
};

module.exports = auth;
