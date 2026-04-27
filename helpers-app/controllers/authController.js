// controllers/authController.js
const User = require('../models/User');

const authController = {
  // GET /login
  getLogin(req, res) {
    if (req.session.userId) return res.redirect('/tasks');
    res.render('login', { error: req.flash('error'), success: req.flash('success') });
  },

  // POST /login
  async postLogin(req, res) {
    const { username, password } = req.body;
    try {
      const user = await User.findOne({ username });
      if (!user || !(await user.comparePassword(password))) {
        req.flash('error', 'Invalid username or password');
        return res.redirect('/login');
      }
      req.session.userId = user._id;
      req.session.username = user.username;
      res.redirect('/tasks');
    } catch (err) {
      req.flash('error', 'Login failed');
      res.redirect('/login');
    }
  },

  // GET /register
  getRegister(req, res) {
    res.render('register', { error: req.flash('error') });
  },

  // POST /register
  async postRegister(req, res) {
    const { username, password, confirm } = req.body;
    if (password !== confirm) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }
    try {
      const existing = await User.findOne({ username });
      if (existing) {
        req.flash('error', 'Username already taken');
        return res.redirect('/register');
      }
      const user = new User({ username, password });
      await user.save();
      req.flash('success', 'Account created! Please log in.');
      res.redirect('/login');
    } catch (err) {
      req.flash('error', 'Registration failed');
      res.redirect('/register');
    }
  },

  // GET /logout
  logout(req, res) {
    req.session.destroy(() => res.redirect('/'));
  },
};

module.exports = authController;
