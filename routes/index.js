const express = require('express');
const router = express.Router();

function enterName()
{
  var element = document.createElement("input");
}
router.get('/', (req, res) => {
  res.render('index')
});


module.exports = router;
