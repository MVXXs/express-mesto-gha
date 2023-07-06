const Card = require('../models/card');
const {
  ERROR_CODE,
  SERVER_ERROR,
  NOT_FOUND,
  STATUS_OK,
  CREATE_OK,
} = require('../utils/errors');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.status(STATUS_OK).send(cards);
    })
    .catch(() => {
      res.status(SERVER_ERROR).send({ message: 'Server Error' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;

  return Card.create({ name, link, owner: req.user._id })
    .then((newCard) => {
      res.status(CREATE_OK).send(newCard);
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

const deleteCard = (req, res) => {
  const { id } = req.params;

  Card.findByIdAndDelete(id)
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Bad request' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Bad request' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        return res.status(NOT_FOUND).send({ message: 'Not found' });
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERROR_CODE).send({ message: 'Bad request' });
      } else {
        res.status(SERVER_ERROR).send({ message: 'Server Error' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
