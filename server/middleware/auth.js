const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith('Bearer '))
      return res.status(401).json({ message: 'Not authenticated.' });

    const decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    const user    = await User.findById(decoded.userId);
    if (!user) return res.status(401).json({ message: 'User not found.' });

    req.user = user;
    next();
  } catch (e) {
    const msg = e.name === 'TokenExpiredError'
      ? 'Session expired. Please log in again.'
      : 'Invalid token.';
    res.status(401).json({ message: msg });
  }
};
