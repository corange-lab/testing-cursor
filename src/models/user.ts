export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: 'user' | 'manager' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPayload {
  id: string;
  email: string;
  role: 'user' | 'manager' | 'admin';
}

// In-memory user store (replace with database in production)
const users: Map<string, User> = new Map();

export function createUser(data: {
  email: string;
  name: string;
  picture?: string;
  role?: 'user' | 'manager' | 'admin';
}): User {
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const user: User = {
    id,
    email: data.email,
    name: data.name,
    picture: data.picture,
    role: data.role || 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  users.set(id, user);
  return user;
}

export function getUserByEmail(email: string): User | undefined {
  return Array.from(users.values()).find((u) => u.email === email);
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function updateUserRole(id: string, role: 'user' | 'manager' | 'admin'): User | null {
  const user = users.get(id);
  if (!user) return null;
  user.role = role;
  user.updatedAt = new Date();
  users.set(id, user);
  return user;
}

export function getAllUsers(): User[] {
  return Array.from(users.values());
}

