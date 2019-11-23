const express = require('express');
const router = express.Router();
const Customer = require('../models/customer'); //this is going to give us access to that customer model

// all customers route
router.get('/', async (req, res) => {
  let searchOptions = {}
  if (req.query.name != null && req.query.name !== ' ') {
    searchOptions.name = new RegExp(req.query.name, 'i')
  }
  try{
    const customers = await Customer.find(searchOptions);
    res.render('customers/index', {
      customers: customers,
      searchOptions: req.query})
  }catch {
    res.redirect('/')
  }
});

// new customer route
router.get('/new', (req, res) => {
  res.render('customers/new', { customer: new Customer() })
});

// create customer route
router.post('/', async (req, res) => {
  const customer = new Customer({
    name: req.body.name // we want to make sure we explicitly set the data we want to be sent to the server
  });
  try{
    const newCustomer = await customer.save();
    //res.redirect('customers/${newCustomer.id}')
    res.redirect('customers')
  }catch {
    res.render('customers/new', {
      customer: customer,
      errorMessage: 'Error creating customer'
    })
  }
});

module.exports = router;
