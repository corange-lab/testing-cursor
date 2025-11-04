import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUser, getUserByEmail } from '../models/user';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}

export async function authRoutes(fastify: FastifyInstance) {
  // Google OAuth callback
  fastify.get('/auth/google/callback', async (request: FastifyRequest, reply: FastifyReply) => {
    const oauth2Instance = (fastify as any).googleOAuth2;
    if (!oauth2Instance) {
      return reply.status(500).send({ error: 'OAuth2 not configured' });
    }

    const { token } = await oauth2Instance.getAccessTokenFromAuthorizationCodeFlow(request);

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });

    const googleUser = await userInfoResponse.json() as GoogleUserInfo;

    // Find or create user
    let user = getUserByEmail(googleUser.email);
    
    if (!user) {
      // Create new user with default role 'user'
      user = createUser({
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
        role: 'user',
      });
    }

    // Generate JWT token
    const jwtToken = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Set cookie and redirect
    reply.setCookie('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    const appUrl = (fastify as any).config?.APP_URL || process.env.APP_URL || 'http://localhost:3000';
    reply.redirect(`${appUrl}/auth/success`);
  });

  // Auth success page
  fastify.get('/auth/success', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = await request.jwtVerify();
      reply.send({
        success: true,
        message: 'Authentication successful',
        user,
      });
    } catch (err) {
      reply.status(401).send({ error: 'Unauthorized' });
    }
  });

  // Logout
  fastify.post('/auth/logout', async (request: FastifyRequest, reply: FastifyReply) => {
    reply.clearCookie('token');
    reply.send({ success: true, message: 'Logged out successfully' });
  });

  // Get current user
  fastify.get('/auth/me', {
    preHandler: authenticate,
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    const req = request as AuthenticatedRequest;
    reply.send({ user: req.userPayload });
  });
}

