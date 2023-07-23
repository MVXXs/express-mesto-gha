const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const {
  STATUS_OK,
  CREATE_OK,
} = require('../utils/status');
const {
  BadRequestError, // 400
  ConflictError, // 409
  ForbiddenError, // 403
  NotFoundError, // 404
} = require('../errors/errors');

const JWT_SECRET = 'unique-secret-key';

const SALT_ROUNDS = 10;

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => {
      res.status(STATUS_OK).send(users);
    })
    .catch(() => {
      next();
    });
};

const getUserById = (req, res, next) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Bad request');
      } else {
        next();
      }
    });
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, SALT_ROUNDS)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(CREATE_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      }
      if (err.code === 11000) {
        throw new ConflictError('Такой пользователь уже зарегистрирован');
      } else {
        next();
      }
    });
};

const updateUserById = (req, res, next) => {
  const { name, about } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      } else {
        next();
      }
    });
};

const updateUserAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      } else {
        next();
      }
    });
};

const deleteUserById = (req, res, next) => {
  const { id } = req.params;

  User.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send('The user was successfully deleted');
    })
    .catch(() => {
      next();
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError('Не передан логин или пароль');
  }

  return User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new ForbiddenError('Пользователь не найден');
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            throw new ForbiddenError('Неправильный логин или пароль');
          }

          const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
          return res.status(STATUS_OK).send({ token });
        })
        .catch(() => {
          next();
        });
    });
};

const getCurrentUser = (req, res, next) => {
  const id = req.user._id;

  User.findById(id)
    .then((currentUser) => {
      if (!currentUser) {
        throw new NotFoundError('Пользователь не найден');
      }
      return res.status(STATUS_OK).send(currentUser);
    })
    .catch(() => {
      next();
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  updateUserAvatar,
  login,
  getCurrentUser,
};
