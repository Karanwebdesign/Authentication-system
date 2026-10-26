# SecureGate — Authentication System

Week 2, Task 3: Full Stack Development assignment.

A responsive authentication demo with account registration, login, password hashing, session management, a protected API route, and logout.

## Features
- Register with name, email, and password
- Validate required fields, email format, and minimum password length
- Hash passwords with `bcryptjs` (12 salt rounds); plain-text passwords are never stored
- Login with email and password
- Server-side session cookie using `express-session`
- Protected endpoint at `GET /api/protected`
- Check current session at `GET /api/auth/me`
- Logout and destroy the session
- SQLite-compatible local database using `sql.js`
- Responsive interface for desktop and mobile

## Requirements
- Node.js 18 or newer
- npm

## Run locally
1. Extract this project folder.
2. Open a terminal in the `authentication-system` folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Open `http://localhost:3000` in Chrome.

The database file `users.sqlite` is created automatically when the server starts. Do not commit it to GitHub.

## API endpoint documentation
See [`docs/API_ENDPOINTS.md`](docs/API_ENDPOINTS.md).

## Database schema
See [`docs/schema.sql`](docs/schema.sql). The app creates this table automatically at startup.

## Demo video / screenshots
For the assignment demo, record these steps in the browser:
1. Try opening the protected area while logged out (API returns 401).
2. Create an account with a valid name, email, and password.
3. Show that the protected area opens after registration/login.
4. Log out.
5. Log in again using the same credentials.
6. Log out and show the sign-in screen.

Capture screenshots of registration, logged-in dashboard, protected content, and logout/sign-in state.

## Security notes
- Passwords are hashed with bcryptjs and never returned by API responses.
- Login errors do not reveal whether an email exists.
- Session cookies are `HttpOnly` and use `SameSite=Lax`.
- `secure` cookies are enabled when `NODE_ENV=production`.
- Set a strong `SESSION_SECRET` environment variable for deployment.
- This is an educational assignment starter. For production, add HTTPS, CSRF protection, rate limiting, a production-grade persistent session store, account recovery, and monitoring.
- The included `sql.js` database is written to a local file. Some cloud hosts have ephemeral filesystems; configure a persistent disk or managed database before relying on account data in production.
