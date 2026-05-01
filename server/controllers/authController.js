const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const sign = (id) => jwt.sign({ userId: id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });
    if (await User.findOne({ email }))
      return res.status(409).json({ message: 'Email already registered.' });
    const user = await User.create({ name, email, password });
    res.status(201).json({ token: sign(user._id), user: user.toJSON() });
  } catch (e) {
    const msg = e.name === 'ValidationError'
      ? Object.values(e.errors)[0].message
      : 'Server error. Please try again.';
    res.status(400).json({ message: msg });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required.' });
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid email or password.' });
    res.json({ token: sign(user._id), user: user.toJSON() });
  } catch {
    res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

exports.me = (req, res) => res.json({ user: req.user.toJSON() });
