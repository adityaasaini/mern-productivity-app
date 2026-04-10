import UserModel from '../models/User.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'aditya_super_secret_key_123';

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: 'All fields required' });
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already registered' });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await UserModel.create({ name, email, password: hashedPassword });
    const token = jwt.sign({ userId: newUser._id, email: newUser.email }, JWT_SECRET, { expiresIn: '5d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 });
    res.status(201).json({ success: true, user: { id: newUser._id, name: newUser.name, email: newUser.email }, token });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '5d' });
    res.cookie('token', token, { httpOnly: true, maxAge: 5 * 24 * 60 * 60 * 1000 });
    res.status(200).json({ success: true, user: { id: user._id, name: user.name, email: user.email }, token });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

export { signup, login };

