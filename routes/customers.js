const express = require('express');
const router = express.Router();

// all customers route
router.get('/', (req, res) => {
  res.render('customers/index')
});

// new customer route
router.get('/new', (req, res) => {
  res.render('customers/new')
});

// create customer route
router.post('/', (req, res) => {
  res.send('Create')
});

module.exports = router;
