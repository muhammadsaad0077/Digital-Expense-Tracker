import { Router } from 'express';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { newOAuthClient, SCOPES } from '../services/google.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/google', (_req, res) => {
  const url = newOAuthClient().generateAuthUrl({
    access_type: 'offline', // refresh token lets us sync later
    prompt: 'consent',
    scope: SCOPES,
  });
  res.redirect(url);
});

router.get('/google/callback', async (req, res, next) => {
  try {
    if (req.query.error) return res.redirect(`${process.env.CLIENT_URL}/?error=denied`);
    const client = newOAuthClient();
    const { tokens } = await client.getToken(req.query.code);
    client.setCredentials(tokens);
    // Google lets users untick individual permissions; make sure Gmail access was granted
    if (!tokens.scope?.includes('gmail.readonly')) return res.redirect(`${process.env.CLIENT_URL}/?error=scope`);
    const { data: profile } = await google.oauth2({ version: 'v2', auth: client }).userinfo.get();

    const update = { email: profile.email, name: profile.name, picture: profile.picture };
    if (tokens.refresh_token) update.refreshToken = tokens.refresh_token;
    const user = await User.findOneAndUpdate({ googleId: profile.id }, update, { upsert: true, new: true });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 30 * 86400e3 });
    res.redirect(`${process.env.CLIENT_URL}/dashboard`);
  } catch (e) {
    next(e);
  }
});

router.get('/me', requireAuth, (req, res) => {
  const { email, name, picture, lastSyncAt } = req.user;
  res.json({ email, name, picture, lastSyncAt });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

export default router;
