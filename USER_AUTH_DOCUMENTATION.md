# User Authentication Routes Documentation

This document provides details for the User Authentication routes, which manage user login, logout, and registration, including session management. The application is assumed to run on `http://localhost:3000`.

## 1. Process User Login

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/login`
*   **Description:** Processes the user's login attempt. It verifies the provided email and password against the database. If successful, it creates a user session by storing `userId` and `email` in `req.session` and then redirects the user to the `/inicio` page. If authentication fails (incorrect email/password or user not found), it re-renders the `login` page with an error message.
*   **Request Body:** `application/x-www-form-urlencoded` or `application/json`
    *   `email`: String (required) - The user's email address.
    *   `password`: String (required) - The user's password.
*   **Session Management:**
    *   On successful login, `req.session.userId` (the user's MongoDB `_id`) and `req.session.email` are set.
*   **Responses:**
    *   On success: Redirect to `/inicio`.
    *   On authentication failure: Re-renders the `login.ejs` view with a 401 status and an error message "Correo o contraseña incorrectos".
    *   On server error: Re-renders the `login.ejs` view with a 500 status and an error message "Error del servidor".

## 2. User Logout

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/logout`
*   **Description:** Logs out the currently authenticated user by destroying their session. After destroying the session, it redirects the user to the `/login` page.
*   **Request Body:** None
*   **Session Management:**
    *   Calls `req.session.destroy()` to clear the user's session.
*   **Responses:**
    *   On success: Redirect to `/login`.
    *   On error during session destruction: Sends a 500 status with the text message "No se pudo cerrar sesión".

## 3. Display Registration Page

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/registro`
*   **Description:** Renders the user registration page (`registro.ejs`), which contains a form for new users to sign up.
*   **Request Body:** None
*   **Session Management:** No direct session manipulation, but this route is a key part of the overall authentication flow.
*   **Response:** Renders the `registro.ejs` HTML page.

## 4. Process User Registration

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/registro`
*   **Description:** Processes the data submitted from the registration form. It checks if a user with the provided email already exists in the database. If the email is unique, it creates a new user record with the given email, username, and password, and saves it. After successful registration, it redirects the user to the `/login` page to then log in.
*   **Request Body:** `application/x-www-form-urlencoded` or `application/json`
    *   `email`: String (required) - The email address for the new user. This must be unique.
    *   `username`: String (required) - The chosen username for the new user. (Note: The `routes/users.js` file processes `username` and includes it when creating a `new User()`. However, the provided `models/User.js` schema only defines `email` and `password`. Depending on Mongoose's strict schema settings, `username` might not be persisted to the database unless the schema is updated to include it.)
    *   `password`: String (required) - The password for the new user.
*   **Session Management:** No session is created upon registration; the user is redirected to the `/login` page.
*   **Responses:**
    *   On successful creation of a new user: Redirect to `/login`.
    *   If a user with the given email already exists: Re-renders the `registro.ejs` view with a 400 status and an error message "Ya existe un usuario con ese correo.".
    *   On server error during the registration process: Re-renders the `registro.ejs` view with a 500 status and an error message "Error al registrar el usuario.".
