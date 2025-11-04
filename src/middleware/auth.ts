import { FastifyRequest, FastifyReply } from 'fastify';
import { UserPayload } from '../models/user';

export interface AuthenticatedRequest extends FastifyRequest {
  userPayload?: UserPayload;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    await request.jwtVerify();
    const req = request as AuthenticatedRequest;
    req.userPayload = request.user as UserPayload;
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}

export function requireRole(allowedRoles: ('user' | 'manager' | 'admin')[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const req = request as AuthenticatedRequest;
    
    if (!req.userPayload) {
      reply.status(401).send({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(req.userPayload.role)) {
      reply.status(403).send({ 
        error: 'Forbidden', 
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}` 
      });
      return;
    }
  };
}

export const requireUser = requireRole(['user', 'manager', 'admin']);
export const requireManager = requireRole(['manager', 'admin']);
export const requireAdmin = requireRole(['admin']);

