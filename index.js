var express = require('express');
var expressSession = require('express-session');
var MongoStore = require('connect-mongo')(expressSession);
var mongoose = require('mongoose');
var passport = require('passport');
var bodyParser = require('body-parser');
var LocalStrategy = require('passport-local');
var User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/leboncoin');

var app = express();
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

// Activer la gestion de la session
app.use(expressSession({
  secret: 'glhf',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection})
}));

// Activer `passport`
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // JSON.stringify
passport.deserializeUser(User.deserializeUser()); // JSON.parse

// ... Les routes seront ici ...

app.get('/', function(req, res) {
    res.render('home');
  });
  
  app.get('/secret', function(req, res) {
    if (req.isAuthenticated()) {
      console.log(req.user);
      res.render('secret');
    } else {
      res.redirect('/');
    }
  });
  
  app.get('/register', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/secret');
    } else {
      res.render('register');
    }
  });
  
  app.post('/register', function(req, res) {
    // Créer un utilisateur, en utilisant le model defini
    // Nous aurons besoin de `req.body.username` et `req.body.password`
    User.register(
      new User({
        username: req.body.username,
        // D'autres champs peuvent être ajoutés ici
      }),
      req.body.password, // password will be hashed
      function(err, user) {
        if (err) {
          console.log(err);
          return res.render('register');
        } else {
          passport.authenticate('local')(req, res, function() {
            res.redirect('/secret');
          });
        }
      }
    );
  });
  
  app.get('/login', function(req, res) {
    if (req.isAuthenticated()) {
      res.redirect('/secret');
    } else {
      res.render('login');
    }
  });
  
  app.post('/login', passport.authenticate('local', {
    successRedirect: '/secret',
    failureRedirect: '/login'
  }));
  
  app.get("/logout", function(req, res) {
    req.logout();
    res.redirect('/');
  });

app.listen(3000, function() {
  console.log('we listen to you');
});
