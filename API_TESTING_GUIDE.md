# Neowave Application - API and Testing Guide

This document provides a comprehensive guide to the Neowave application's API routes and general testing procedures.

---
# API Testing Guidance

This section provides general guidance for testing the API routes of the Neowave application.

## 1. Tools for Testing

You can use various tools to make HTTP requests to the API endpoints:

*   **Postman:** A popular GUI tool for API testing, allowing you to easily construct requests, manage environments, and view responses.
*   **curl:** A command-line tool for transferring data with URLs. Suitable for scripting and quick tests.
*   **Insomnia:** Another GUI tool similar to Postman.
*   **Web Browser Developer Tools:** The network tab in your browser's developer tools can be used to inspect requests made by the front-end, which can be helpful for understanding how the API is used, especially for session-based routes.

## 2. Base URL

All API routes documented assume a base URL of `http://localhost:3000`. If your application is running on a different port or host, please adjust the URLs accordingly. For example, a route like `GET /api/playlists` would be `http://localhost:3000/api/playlists`. User-facing routes like `/login` or `/mis-playlists`, and song routes like `/songs`, are also relative to this base URL.

## 3. MongoDB ObjectIds

Many API routes interact with specific database records (e.g., songs, playlists) identified by their MongoDB `_id`. When testing routes like:

*   `GET /songs/stream/:songId`
*   `GET /songs/cover/:songId`
*   `DELETE /songs/:songId`
*   `PUT /songs/:songId`
*   `PUT /api/playlists/:id`
*   `DELETE /api/playlists/:id`

You must replace `:songId` or `:id` in the path with a valid, existing MongoDB ObjectId for a document in the respective collection. Using an invalid or non-existent ID will likely result in a `404 Not Found` or an error response.

## 4. File Uploads (Multipart/Form-Data)

Certain routes require file uploads (like audio or images) and use `multipart/form-data` for the request body.

*   **For `POST /songs/upload` and `PUT /songs/:songId` (when updating files):**
    *   The `audioFile` (e.g., an MP3 file) and `coverImage` (e.g., a JPG/PNG file) must be sent as files in the `multipart/form-data` request.
    *   Other metadata should be sent as form fields in the same request:
        *   `title`: String (required for POST)
        *   `artist`: String (required for POST)
        *   `album`: String
        *   `genre`: String
        *   `year`: Number

*   **For `POST /api/playlists` (when uploading a playlist cover):**
    *   The optional `cover` (an image file) should be sent as a file in the `multipart/form-data` request.
    *   Other data should be sent as form fields:
        *   `userId`: String (MongoDB ObjectId, required)
        *   `name`: String (required)
        *   `songs`: Array of song ObjectIds (e.g., `songs[]: songId1`, `songs[]: songId2` or a single `songs: songId1` if only one). Check how your tool sends arrays in multipart forms.

When using tools like Postman, you can typically specify the type of a form field as "File" or "Text".

## 5. JSON Payloads

For routes that create or update data without file uploads, or where files are optional and not included, the request body should typically be JSON.

*   **For `POST /api/playlists` (if not uploading a cover image):**
    *   The route `POST /api/playlists` is configured with `upload.single('cover')` which primarily expects `multipart/form-data`. If no cover file is being uploaded, you should still use `multipart/form-data` and simply omit the `cover` file field. Sending pure JSON to this endpoint might not work as expected due to the `multer` middleware anticipating `multipart/form-data`.
    *   If sending `multipart/form-data` without a file:
        *   `userId`: (text field) "someUserId"
        *   `name`: (text field) "My Awesome Playlist"
        *   `songs[]`: (text field) "songObjectId1"
        *   `songs[]`: (text field) "songObjectId2" (for multiple songs)

*   **For `PUT /api/playlists/:id`:**
    *   The request body should be `application/json`.
    *   Example payload:
        ```json
        {
          "name": "Updated Playlist Name",
          "songs": ["newSongObjectId1", "newSongObjectId2"],
          "cover": "/path/to/new_cover_if_any.jpg"
        }
        ```

## 6. Content-Type Headers

*   When sending JSON payloads, ensure your request includes the `Content-Type: application/json` header.
*   When sending `multipart/form-data` (for file uploads), tools like Postman or `curl` usually set the correct `Content-Type` header (e.g., `multipart/form-data; boundary=----WebKitFormBoundary...`) automatically. You typically don't need to set this manually.

## 7. Checking Responses

Always check the HTTP status code and the response body after making a request:

*   **Status Codes:**
    *   `200 OK`: Standard response for successful HTTP requests.
    *   `201 Created`: The request has been fulfilled and resulted in a new resource being created.
    *   `204 No Content`: The server successfully processed the request but is not returning any content.
    *   `302 Found`: Standard redirect status code (relevant for web routes like login/logout).
    *   `400 Bad Request`: Client error (e.g., malformed request, missing required fields).
    *   `401 Unauthorized`: Authentication is required and has failed or has not yet been provided.
    *   `403 Forbidden`: The server understood the request but refuses to authorize it.
    *   `404 Not Found`: The server can't find the requested resource.
    *   `500 Internal Server Error`: An unexpected server condition.
*   **Response Body:** The body may contain the requested data (for GET), a confirmation message, error details, or the newly created/updated resource. For redirect responses (302), check the `Location` header for the redirect URL.

## 8. Authentication for User Routes (Web Routes)

Routes like:

*   `POST /login`
*   `GET /logout`
*   `GET /registro`
*   `POST /registro`
*   `GET /mis-playlists`
*   `POST /mis-playlists`

are primarily designed for web browser interaction and rely on **session cookies** for authentication and state management.

*   Testing these routes directly as stateless API calls (like with `curl` or Postman without cookie management) might not reflect actual user experience or may fail if session data is expected.
*   For `POST /login`, after a successful login, the server will typically set a session cookie in the response (`Set-Cookie` header). Subsequent requests from a browser will automatically include this cookie.
*   Tools like Postman can be configured to store and send cookies automatically, which can help in testing these routes.
*   Alternatively, testing these flows through a web browser is often the most straightforward way to ensure they work as intended from a user's perspective.

The `/api/*` routes (e.g., `/api/playlists`) are generally designed to be more stateless. However, some `/api/*` routes in this application (like creating a playlist) require a `userId` in the request body, implying that the client obtaining this `userId` (likely from a session after login) is responsible for including it.

---
# Song API Documentation

This document provides details for the Song API routes. Note: The base path for these routes is directly under the main URL (e.g. `http://localhost:3000/songs` not `/api/songs`).

## 1. Get All Songs

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/songs`
*   **Description:** Retrieves a list of all songs available in the database. (Note: based on `app.js`, this route is not explicitly defined. `app.use('/api/songs', songRoutes);` suggests song routes are under `/api/songs`. The original documentation might have a typo. Assuming `/api/songs` for consistency with `app.js`.)
    *Path Correction: Based on `app.js` (`app.use('/api/songs', songRoutes);`), the actual path should be `http://localhost:3000/api/songs`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs`
*   **Parameters:** None
*   **Request Body:** None
*   **Example Response:** (Assuming a successful response with a list of songs)
    ```json
    [
      {
        "_id": "60c72b0f9b1e8a3f7c8d40c6",
        "title": "Song Title 1",
        "artist": "Artist Name 1",
        "album": "Album Name 1",
        "genre": "Genre 1",
        "year": 2023,
        "coverImage": "cover1.jpg",
        "audioFile": "song1.mp3"
      }
    ]
    ```

## 2. Upload a New Song

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/songs/upload`
    *Path Correction: Based on `app.js`, this should be `http://localhost:3000/api/songs/upload`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs/upload`
*   **Description:** Uploads a new song, including its audio file and cover image.
*   **Parameters:** None
*   **Request Body:** `multipart/form-data`
    *   `title`: String (required)
    *   `artist`: String (required)
    *   `album`: String
    *   `genre`: String
    *   `year`: Number
    *   `coverImage`: File (image file, e.g., .jpg, .png) (required)
    *   `audioFile`: File (audio file, e.g., .mp3, .wav) (required)
*   **Example Response:** (Assuming a successful upload)
    ```json
    {
      "message": "Song uploaded successfully",
      "song": {
        "_id": "60c72b0f9b1e8a3f7c8d40c8",
        "title": "New Song Title",
        "artist": "New Artist",
        "album": "New Album",
        "genre": "New Genre",
        "year": 2024,
        "coverImage": "new_cover.jpg",
        "audioFile": "new_song.mp3"
      }
    }
    ```

## 3. Stream a Song's Audio

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/songs/stream/:songId`
    *Path Correction: Based on `app.js`, this should be `http://localhost:3000/api/songs/stream/:songId`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs/stream/:songId`
*   **Description:** Streams the audio file of a specific song.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song to stream.
*   **Request Body:** None
*   **Example Response:** The response will be the audio stream itself, with appropriate `Content-Type` (e.g., `audio/mpeg`) and `Content-Length` headers. The actual body will be the binary audio data.

## 4. Get a Song's Cover Image

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/songs/cover/:songId`
    *Path Correction: Based on `app.js`, this should be `http://localhost:3000/api/songs/cover/:songId`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs/cover/:songId`
*   **Description:** Retrieves the cover image of a specific song.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song whose cover image is to be retrieved.
*   **Request Body:** None
*   **Example Response:** The response will be the image file itself, with appropriate `Content-Type` (e.g., `image/jpeg`, `image/png`) and `Content-Length` headers. The actual body will be the binary image data.

## 5. Delete a Song

*   **HTTP Method:** DELETE
*   **Full URL Path:** `http://localhost:3000/songs/:songId`
    *Path Correction: Based on `app.js`, this should be `http://localhost:3000/api/songs/:songId`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs/:songId`
*   **Description:** Deletes a specific song from the database and removes its associated audio and cover image files.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song to delete.
*   **Request Body:** None
*   **Example Response:** (Assuming successful deletion)
    ```json
    {
      "message": "Song deleted successfully"
    }
    ```
    (If song not found)
    ```json
    {
      "message": "Song not found"
    }
    ```

## 6. Update a Song

*   **HTTP Method:** PUT
*   **Full URL Path:** `http://localhost:3000/songs/:songId`
    *Path Correction: Based on `app.js`, this should be `http://localhost:3000/api/songs/:songId`.*
*   **Corrected Full URL Path:** `http://localhost:3000/api/songs/:songId`
*   **Description:** Updates the metadata (title, artist, album, etc.) of an existing song. It can also optionally update the cover image and/or audio file.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song to update.
*   **Request Body:** `multipart/form-data` (The controller `songController.js` uses `upload.fields`, suggesting `multipart/form-data` is expected for all updates, even if only metadata is changing).
    *   `title`: String
    *   `artist`: String
    *   `album`: String
    *   `genre`: String
    *   `year`: Number
    *   `coverImage`: File (image file, e.g., .jpg, .png) (optional)
    *   `audioFile`: File (audio file, e.g., .mp3, .wav) (optional)
*   **Example Response:** (Assuming a successful update)
    ```json
    {
      "message": "Song updated successfully",
      "song": {
        "_id": "60c72b0f9b1e8a3f7c8d40c6",
        "title": "Updated Song Title",
        "artist": "Updated Artist",
        "album": "Updated Album",
        "genre": "Updated Genre",
        "year": 2025,
        "coverImage": "updated_cover.jpg",
        "audioFile": "updated_song.mp3"
      }
    }
    ```

---
# Playlist API Documentation

This document provides details for the Playlist API routes, assuming the application runs on `http://localhost:3000`. Playlist API routes are prefixed with `/api`.

## 1. Get All Playlists

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/api/playlists`
*   **Description:** Retrieves a list of all playlists. The songs within each playlist are populated with their details.
*   **Parameters:** None
*   **Request Body:** None
*   **Example Response:**
    ```json
    [
      {
        "_id": "playlistId1",
        "userId": "userId1",
        "name": "My Favorite Jams",
        "songs": [
          {
            "_id": "songId1",
            "title": "Song Title 1",
            "artist": "Artist 1",
            "filename": "song1.mp3",
            "cover": "/covers/song_cover1.jpg",
            "createdAt": "2023-01-01T00:00:00.000Z"
          }
        ],
        "cover": "/covers/playlist_cover1.jpg",
        "createdAt": "2023-01-10T00:00:00.000Z"
      }
    ]
    ```

## 2. Create a New Playlist

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/api/playlists`
*   **Description:** Creates a new playlist. Requires user ID, playlist name, and a list of song IDs. An optional cover image can be uploaded.
*   **Parameters:** None
*   **Request Body:** `multipart/form-data`
    *   `userId`: String (MongoDB ObjectId, **required**)
    *   `name`: String (required)
    *   `songs`: Array of Strings (MongoDB ObjectIds corresponding to songs, required). If sending from a form and only one song, it might be sent as a single string which the backend handles.
    *   `cover`: File (image file, e.g., .jpg, .png) (optional)
*   **Example Response (on success):**
    ```json
    {
      "message": "Playlist guardada correctamente",
      "playlist": {
        "_id": "newPlaylistIdGeneratedByMongo",
        "userId": "userIdProvidedInRequest",
        "name": "Awesome New Playlist",
        "songs": ["songId1FromRequest", "songId2FromRequest"],
        "cover": "/covers/generated_filename.jpg",
        "createdAt": "2023-10-27T10:00:00.000Z"
      }
    }
    ```
*   **Example Response (on error - missing data):**
    ```json
    {
      "error": "Faltan datos en la solicitud: nombre es requerido. canciones son requeridas. userId es requerido."
    }
    ```

## 3. Update a Playlist

*   **HTTP Method:** PUT
*   **Full URL Path:** `http://localhost:3000/api/playlists/:id`
*   **Description:** Updates an existing playlist's information, such as its name or the songs it contains. This endpoint expects `application/json` and does not use `multer` for file uploads. To change the cover image, send a new URL path for the `cover` field.
*   **Parameters:**
    *   `id`: Path parameter (string, MongoDB ObjectId) - The ID of the playlist to update.
*   **Request Body:** `application/json`
    *   `name`: String (optional) - The new name for the playlist.
    *   `songs`: Array of Strings (MongoDB ObjectIds) (optional) - The new list of song IDs for the playlist.
    *   `cover`: String (optional) - The new URL or path for the playlist's cover image.
    *   `userId`: String (MongoDB ObjectId) (optional) - To change the owner of the playlist.
*   **Example Response (on success):**
    ```json
    {
      "_id": "playlistIdToUpdate",
      "userId": "userIdAssociatedWithPlaylist",
      "name": "Updated Playlist Name",
      "songs": ["newSongId1", "newSongId2"],
      "cover": "/covers/new_cover_path.jpg",
      "createdAt": "2023-10-26T08:00:00.000Z",
      "__v": 1
    }
    ```

## 4. Delete a Playlist

*   **HTTP Method:** DELETE
*   **Full URL Path:** `http://localhost:3000/api/playlists/:id`
*   **Description:** Deletes a specific playlist by its ID.
*   **Parameters:**
    *   `id`: Path parameter (string, MongoDB ObjectId) - The ID of the playlist to delete.
*   **Request Body:** None
*   **Example Response (on success):**
    ```json
    {
      "message": "Playlist eliminada"
    }
    ```

## 5. Get Random Playlists

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/api/playlists/random/:num`
*   **Description:** Retrieves a specified number of random playlists. Songs within these playlists are populated with their title, artist, filename, and cover.
*   **Parameters:**
    *   `num`: Path parameter (integer) - The number of random playlists to retrieve. Defaults to 5 if not provided or invalid.
*   **Request Body:** None
*   **Example Response:**
    ```json
    [
      {
        "_id": "randomPlaylistId1",
        "userId": "someUserId",
        "name": "A Random Mix",
        "songs": [
          {
            "_id": "songIdA",
            "title": "Cool Song Title",
            "artist": "Some Artist",
            "filename": "cool_song.mp3",
            "cover": "/covers/song_cover_a.jpg"
          }
        ],
        "cover": "/covers/playlist_cover_random1.jpg",
        "createdAt": "2023-09-15T14:00:00.000Z"
      }
    ]
    ```

---
## User-Specific Playlist Routes (View Rendering)

The following routes are specific to logged-in users for managing their playlists. They primarily render views or redirect, rather than returning JSON data directly, and require active session-based authentication. These routes are relative to the base URL (e.g. `http://localhost:3000/mis-playlists`).

### 1. Get User's Playlists Page

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/mis-playlists`
*   **Description:** Retrieves and displays the page listing all playlists created by the currently logged-in user.
*   **Authentication:** Required (session-based). The route uses `isAuthenticated` middleware which checks for `req.session.userId`. If not authenticated, the user is redirected to `/login`. Playlists are fetched using `Playlist.find({ userId: req.session.userId })`.
*   **Request Body:** None
*   **Response:** Renders the `PlaylistUsuarios.ejs` HTML page with the user's playlists. In case of a server error, it sends a 500 status with the message 'Error al cargar playlists'.

### 2. Create a New Playlist (for User)

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/mis-playlists`
*   **Description:** Creates a new playlist for the currently logged-in user. The playlist is initialized with a name provided by the user and an empty list of songs.
*   **Authentication:** Required (session-based). The route uses `isAuthenticated` middleware. The `userId` for the new playlist is taken directly from `req.session.userId`. If not authenticated, the user is redirected to `/login`.
*   **Request Body:** `application/x-www-form-urlencoded` (typically from a form submission) or `application/json`.
    *   `name`: String (required) - The name for the new playlist.
*   **Response:** On successful creation, redirects to `/mis-playlists`. If the `name` is not provided, it returns a 400 status with the message 'El nombre es obligatorio'. In case of a server error during creation, it sends a 500 status with the message 'Error al crear playlist'.

---
# User Authentication Routes Documentation

This document provides details for the User Authentication routes, which manage user login, logout, and registration, including session management. These routes are relative to the base URL (e.g. `http://localhost:3000/login`).

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
    *   On success: Redirect to `/inicio`. (Status code 302)
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
    *   On success: Redirect to `/login`. (Status code 302)
    *   On error during session destruction: Sends a 500 status with the text message "No se pudo cerrar sesión".

## 3. Display Registration Page

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/registro`
*   **Description:** Renders the user registration page (`registro.ejs`), which contains a form for new users to sign up.
*   **Request Body:** None
*   **Session Management:** No direct session manipulation, but this route is a key part of the overall authentication flow.
*   **Response:** Renders the `registro.ejs` HTML page. (Status code 200)

## 4. Process User Registration

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/registro`
*   **Description:** Processes the data submitted from the registration form. It checks if a user with the provided email already exists in the database. If the email is unique, it creates a new user record with the given email, username, and password, and saves it. After successful registration, it redirects the user to the `/login` page to then log in.
*   **Request Body:** `application/x-www-form-urlencoded` or `application/json`
    *   `email`: String (required) - The email address for the new user. This must be unique.
    *   `username`: String (required) - The chosen username for the new user. (Note: The `routes/users.js` file processes `username`. The `models/User.js` schema only defines `email` and `password`. `username` might not be persisted unless the User schema is updated.)
    *   `password`: String (required) - The password for the new user.
*   **Session Management:** No session is created upon registration; the user is redirected to the `/login` page.
*   **Responses:**
    *   On successful creation of a new user: Redirect to `/login`. (Status code 302)
    *   If a user with the given email already exists: Re-renders the `registro.ejs` view with a 400 status and an error message "Ya existe un usuario con ese correo.".
    *   On server error during the registration process: Re-renders the `registro.ejs` view with a 500 status and an error message "Error al registrar el usuario.".
---
