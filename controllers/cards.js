const Card = require('../models/card');
const {
  STATUS_OK,
  CREATE_OK,
} = require('../utils/status');
const {
  BadRequestError, // 400
  ForbiddenError, // 403
  NotFoundError, // 404
} = require('../errors/errors');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.status(STATUS_OK).send(cards);
    })
    .catch((err) => {
      next(err);
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;

  return Card.create({ name, link, owner: req.user._id })
    .then((newCard) => {
      res.status(CREATE_OK).send(newCard);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(`${Object.values(err.errors)
          .map((error) => error.message)
          .join(', ')}`);
      } else {
        next(err);
      }
    });
};

const deleteCard = (req, res, next) => {
  const { id } = req.params;

  Card.findByIdAndDelete(id)
    .then((card) => {
      if (!card) {
        next(new NotFoundError('Карточка не найдена'));
      }
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Запрещено удалять чужие карточки');
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Bad request'));
      } else {
        next(err);
      }
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $addToSet: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Bad request');
      } else {
        next();
      }
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(req.params.cardId, { $pull: { likes: req.user._id } }, { new: true })
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка не найдена');
      }
      return res.status(STATUS_OK).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError('Bad request');
      } else {
        next();
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
