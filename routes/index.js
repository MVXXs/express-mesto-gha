const router = require('express').Router();
const userRoutes = require('./users');
const cardRoutes = require('./cards');
const {
  NOT_FOUND,
} = require('../utils/errors');

router.use('/users', userRoutes);
router.use('/cards', cardRoutes);

router.all('*', (req, res) => {
  res.status(NOT_FOUND).send({ message: 'Page Not Found' });
});

module.exports = router;
