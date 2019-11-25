if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const users = [];

const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');

const expressLayouts = require('express-ejs-layouts');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const customerRouter = require('./routes/customers');

const initializePassport = require('./passport-config');
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id=> users.find(user => user.id === id)
);


app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.set('layout', 'layouts/layout');
app.use(expressLayouts);
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}));
app.use(express.json());
app.use('/public', express.static('public'));

app.post('/users/login', async (req, res) => {
  const user = users.find(user => user.name = req.body.name);
  if(user == null){
    return res.status(400).send('cannot find user')
  }
  //this is where we are actaully going to do the comparison for our password
  try{
    if(await bcrypt.compare(req.body.password, user.password)){
      res.send('Success')
    }else{
      res.send('Not A Match')
    }
  }catch{
    res.status(500).send()

  }
});

app.set('view-engine', 'ejs');
app.use(express.urlencoded({extended: false}));
app.use(flash());
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

app.get('/', checkAuthenticateed, (req, res) => {
  res.render('index.ejs', {name: req.user.name})
});

app.get('/login', checkNotAuthenticated, (req, res) => {
  res.render('login.ejs')
});

app.post('/login', checkNotAuthenticated, passport.authenticate('local',{
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/register', checkNotAuthenticated, (req, res) => {
  res.render('register.ejs')
});

app.post('/register', checkNotAuthenticated, async (req, res) => {
  try{
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    });
    res.redirect('/login')
  }catch{
    req.redirect('/register')
  }
});

app.delete('/logout', (req, res) => {
  req.logOut();
  res.redirect('/login')
});


const mongoose = require('mongoose');
//connection string, cant hard code connection
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log('Connected to Mongoose'));

app.use('/', indexRouter);
app.use('/customers', customerRouter);

function checkAuthenticateed(req, res, next){
  if(req.isAuthenticated()) {
    return next()
  }

  res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
  if(req.isAuthenticated()) {
    return res.redirect('/')
  }
  next()
}


app.listen(process.env.PORT || 3000);
