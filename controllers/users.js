const User = require('../models/user');
const {
  ERROR_CODE,
  SERVER_ERROR,
  NOT_FOUND,
  STATUS_OK,
  CREATE_OK,
} = require('../utils/errors');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => {
      res.status(STATUS_OK).send(users);
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

const getUserById = (req, res) => {
  const { id } = req.params;

  User.findById(id)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send(user);
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

const createUser = (req, res) => {
  const newUserData = req.body;

  return User.create(newUserData)
    .then((newUser) => {
      res.status(CREATE_OK).send(newUser);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({
          message: `${Object.values(err.errors).map((error) => error.message).join(', ')}`,
        });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

const updateUserById = (req, res) => {
  const { name, about } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send('The user was successfully updated');
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({
          message: `${Object.values(err.errors).map((error) => error.message).join(', ')}`,
        });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

const updateUserAvatar = (req, res) => {
  const { avatar } = req.body;
  const id = req.user._id;

  User.findByIdAndUpdate(id, { avatar }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send('The user avatar was successfully updated');
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERROR_CODE).send({
          message: `${Object.values(err.errors).map((error) => error.message).join(', ')}`,
        });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

const deleteUserById = (req, res) => {
  const { id } = req.params;

  User.findByIdAndDelete(id)
    .then((user) => {
      if (!user) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send('The user was successfully deleted');
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUserById,
  deleteUserById,
  updateUserAvatar,
};
