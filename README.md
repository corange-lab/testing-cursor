# Authentication System

A Node.js authentication system built with Fastify, TypeScript, JWT, and Google OAuth2, featuring role-based access control (User, Manager, Admin).

## Features

- 🔐 Google OAuth2 authentication
- 🎫 JWT token-based authentication
- 👥 Role-based access control (User, Manager, Admin)
- 🛡️ Protected routes with role middleware
- 🍪 Cookie-based token storage
- 📝 TypeScript support

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Google OAuth2 credentials (Client ID and Secret)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   HOST=0.0.0.0
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
   APP_URL=http://localhost:3000
   ```

3. **Get Google OAuth2 credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable Google+ API
   - Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
   - Set authorized redirect URI to: `http://localhost:3000/auth/google/callback`
   - Copy the Client ID and Client Secret to your `.env` file

## Running the Application

**Development mode:**
```bash
npm run dev
```

**Build and run:**
```bash
npm run build
npm start
```

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - Google OAuth callback (handled automatically)
- `GET /auth/success` - Authentication success page
- `GET /auth/me` - Get current authenticated user
- `POST /auth/logout` - Logout user

### User Routes

- `GET /users/me` - Get current user profile (requires authentication)
- `GET /users` - Get all users (Admin only)
- `PATCH /users/:id/role` - Update user role (Admin only)
  ```json
  {
    "role": "manager" // or "user" or "admin"
  }
  ```

### Protected Routes

- `GET /dashboard` - User dashboard (all authenticated users)
- `GET /manager/dashboard` - Manager dashboard (Manager and Admin)
- `GET /admin/dashboard` - Admin dashboard (Admin only)

## Role-Based Access Control

The system supports three roles:

1. **User** - Basic authenticated user access
2. **Manager** - Can access manager-level resources
3. **Admin** - Full access, can manage users and roles

## Usage Example

1. **Login:**
   - Navigate to `http://localhost:3000/auth/google`
   - Complete Google OAuth flow
   - You'll be redirected and authenticated

2. **Access protected routes:**
   - Use the JWT token from cookies
   - Or include token in Authorization header: `Bearer <token>`

3. **Check your role:**
   ```bash
   curl http://localhost:3000/auth/me \
     -H "Cookie: token=<your-jwt-token>"
   ```

4. **Update user role (Admin only):**
   ```bash
   curl -X PATCH http://localhost:3000/users/<user-id>/role \
     -H "Cookie: token=<admin-jwt-token>" \
     -H "Content-Type: application/json" \
     -d '{"role": "manager"}'
   ```

## Project Structure

```
src/
├── index.ts              # Main server file
├── config.ts             # Configuration
├── models/
│   └── user.ts          # User model and storage
├── middleware/
│   └── auth.ts          # Authentication and authorization middleware
└── routes/
    ├── auth.ts          # Authentication routes
    └── user.ts          # User routes
```

## Notes

- Current implementation uses in-memory storage for users
- For production, replace with a proper database (PostgreSQL, MongoDB, etc.)
- Update JWT_SECRET to a strong random string in production
- Configure CORS properly for your frontend domain
- Use HTTPS in production

## License

ISC

