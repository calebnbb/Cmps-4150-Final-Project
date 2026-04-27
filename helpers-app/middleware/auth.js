// middleware/auth.js
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  req.flash('error', 'Please log in first');
  res.redirect('/login');
}

module.exports = { requireAuth };
