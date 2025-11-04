import { FastifyInstance } from 'fastify';
import { getUserById, updateUserRole, getAllUsers } from '../models/user';
import { authenticate, requireAdmin, requireManager, AuthenticatedRequest } from '../middleware/auth';

export async function userRoutes(fastify: FastifyInstance) {
  // Get current user profile
  fastify.get('/users/me', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const req = request as AuthenticatedRequest;
    if (!req.userPayload) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const user = getUserById(req.userPayload.id);
    
    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send({ user });
  });

  // Get all users (Admin only)
  fastify.get('/users', {
    preHandler: [authenticate, requireAdmin],
  }, async (request, reply) => {
    const users = getAllUsers();
    reply.send({ users });
  });

  // Update user role (Admin only)
  fastify.patch('/users/:id/role', {
    preHandler: [authenticate, requireAdmin],
  }, async (request, reply) => {
    const req = request as any;
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'manager', 'admin'].includes(role)) {
      return reply.status(400).send({ 
        error: 'Invalid role', 
        message: 'Role must be one of: user, manager, admin' 
      });
    }

    const updatedUser = updateUserRole(id, role);
    
    if (!updatedUser) {
      return reply.status(404).send({ error: 'User not found' });
    }

    reply.send({ user: updatedUser });
  });

  // User dashboard (accessible to all authenticated users)
  fastify.get('/dashboard', {
    preHandler: [authenticate],
  }, async (request, reply) => {
    const req = request as AuthenticatedRequest;
    reply.send({ 
      message: 'Welcome to your dashboard',
      user: req.userPayload,
    });
  });

  // Manager dashboard (Manager and Admin only)
  fastify.get('/manager/dashboard', {
    preHandler: [authenticate, requireManager],
  }, async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const users = getAllUsers();
    reply.send({ 
      message: 'Welcome to Manager Dashboard',
      user: req.userPayload,
      totalUsers: users.length,
    });
  });

  // Admin dashboard (Admin only)
  fastify.get('/admin/dashboard', {
    preHandler: [authenticate, requireAdmin],
  }, async (request, reply) => {
    const req = request as AuthenticatedRequest;
    const users = getAllUsers();
    reply.send({ 
      message: 'Welcome to Admin Dashboard',
      user: req.userPayload,
      totalUsers: users.length,
      users: users.map(u => ({ id: u.id, email: u.email, name: u.name, role: u.role })),
    });
  });
}

