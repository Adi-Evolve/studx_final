import { google } from 'googleapis';

export default async function handler(req, res) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // You should securely store tokens for the user/session
    res.status(200).json(tokens);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
