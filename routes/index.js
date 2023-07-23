const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const auth = require('../middlewares/auth');
const { login, createUser } = require('../controllers/users');
const {
  NotFoundError,
} = require('../errors/errors');
const regexUrl = require('../utils/regex');

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), login);
router.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().regex(regexUrl),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
}), createUser);

router.use(auth);

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);

router.all('*', (req, res, next) => {
  next(new NotFoundError('Page not found'));
});

module.exports = router;
