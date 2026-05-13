import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { jwtSecret } from '../config/auth';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const existing = await User.findOne({ where: { username } });
    if (existing) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password_hash, role: 'user' });

    const token = jwt.sign(
      { id: user.get('id'), username: user.get('username'), role: user.get('role') },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return res.status(201).json({ token });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: 'Missing credentials' });
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.get('password_hash') as string);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.get('id'), username: user.get('username'), role: user.get('role') },
      jwtSecret,
      { expiresIn: '8h' }
    );

    return res.json({ token });
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
