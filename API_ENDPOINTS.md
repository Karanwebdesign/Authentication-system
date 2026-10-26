# Authentication API Endpoints

Base URL locally: `http://localhost:3000`

All JSON requests should use `Content-Type: application/json`. Keep the session cookie returned by the server for authenticated requests.

## 1. Register
- **Method:** `POST`
- **Path:** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "Demo User",
    "email": "demo@example.com",
    "password": "ExamplePass123"
  }
  ```
- **Success:** `201 Created`, user object and message. Session starts automatically.
- **Validation:** all fields required; valid email; password at least 8 characters; duplicate email returns `409`.

## 2. Login
- **Method:** `POST`
- **Path:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "demo@example.com",
    "password": "ExamplePass123"
  }
  ```
- **Success:** `200 OK`, user object and message.
- **Invalid credentials:** `401 Unauthorized`.

## 3. Current session
- **Method:** `GET`
- **Path:** `/api/auth/me`
- **Success:** `200 OK`, returns `{ "authenticated": true, "user": {...} }` when logged in, otherwise `{ "authenticated": false, "user": null }`.

## 4. Protected resource
- **Method:** `GET`
- **Path:** `/api/protected`
- **Requires:** valid login session cookie.
- **Success:** `200 OK` with protected content.
- **Without login:** `401 Unauthorized`.

## 5. Logout
- **Method:** `POST`
- **Path:** `/api/auth/logout`
- **Body:** empty JSON object `{}`.
- **Success:** `200 OK`, session destroyed and cookie cleared.
