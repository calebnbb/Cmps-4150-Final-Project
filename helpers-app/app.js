// app.js — main entry point
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const path = require('path');
const db = require('./config/database');

const app = express();

// Connect to DB via Singleton
db.connect();

// View engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'helpers-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
}));

app.use(flash());

// Make session user available in all views
app.use((req, res, next) => {
  res.locals.sessionUser = req.session.username || null;
  next();
});

// Routes
app.use('/', require('./routes/index'));

// 404
app.use((req, res) => {
  res.status(404).render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Helpers app running on port ${PORT}`));

module.exports = app;
