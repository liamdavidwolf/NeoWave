# Playlist API Documentation

This document provides details for the Playlist API routes, assuming the application runs on `http://localhost:3000`.

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
      // ... more playlists
    ]
    ```

## 2. Create a New Playlist

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/api/playlists`
*   **Description:** Creates a new playlist. Requires user ID, playlist name, and a list of song IDs. An optional cover image can be uploaded.
*   **Parameters:** None
*   **Request Body:** `multipart/form-data`
    *   `userId`: String (MongoDB ObjectId, required according to the Playlist schema `models/Playlist.js`)
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
        "cover": "/covers/generated_filename.jpg", // Path if a cover was uploaded
        "createdAt": "2023-10-27T10:00:00.000Z" // Timestamp of creation
      }
    }
    ```
*   **Example Response (on error - missing data):**
    ```json
    {
      "error": "Faltan datos en la solicitud"
    }
    ```
*   **Example Response (on error - server-side):**
    ```json
    {
      "error": "Error al guardar la playlist"
    }
    ```

## 3. Update a Playlist

*   **HTTP Method:** PUT
*   **Full URL Path:** `http://localhost:3000/api/playlists/:id`
*   **Description:** Updates an existing playlist's information, such as its name or the songs it contains. Note: This endpoint, as written in `routes/playlists.js`, handles `application/json` and does not use `multer` for file uploads. To change the cover image, you would typically send a new URL path for the `cover` field.
*   **Parameters:**
    *   `id`: Path parameter (string, MongoDB ObjectId) - The ID of the playlist to update.
*   **Request Body:** `application/json`
    *   `name`: String (optional) - The new name for the playlist.
    *   `songs`: Array of Strings (MongoDB ObjectIds) (optional) - The new list of song IDs for the playlist.
    *   `cover`: String (optional) - The new URL or path for the playlist's cover image.
    *   `userId`: String (MongoDB ObjectId) (optional) - To change the owner of the playlist (if application logic supports this).
*   **Example Response (on success):**
    ```json
    {
      "_id": "playlistIdToUpdate",
      "userId": "userIdAssociatedWithPlaylist",
      "name": "Updated Playlist Name",
      "songs": ["newSongId1", "newSongId2"],
      "cover": "/covers/new_cover_path.jpg", // Or existing if not changed
      "createdAt": "2023-10-26T08:00:00.000Z",
      "__v": 1 // Version key might be present
    }
    ```
*   **Example Response (on error - invalid ID):**
    ```
    ID inválido 
    ``` 
    (Note: This is a plain text response, status 400)
*   **Example Response (on error - server-side):**
    ```json
    {
      "error": "No se pudo actualizar la playlist"
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
*   **Example Response (on error - server-side):**
    ```json
    {
      "error": "No se pudo eliminar la playlist"
    }
    ```

## 5. Get Random Playlists

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/api/playlists/random/:num`
*   **Description:** Retrieves a specified number of random playlists. Songs within these playlists are populated with their title, artist, filename, and cover.
*   **Parameters:**
    *   `num`: Path parameter (integer) - The number of random playlists to retrieve. If not provided or invalid, the backend defaults to 5.
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
          // ... other songs in this playlist
        ],
        "cover": "/covers/playlist_cover_random1.jpg",
        "createdAt": "2023-09-15T14:00:00.000Z"
      }
      // ... potentially more playlists, up to the :num specified
    ]
    ```
*   **Example Response (on error - server-side):**
    ```json
    {
      "error": "Error al obtener playlists aleatorias"
    }
    ```

---

## User-Specific Playlist Routes (View Rendering)

The following routes are specific to logged-in users for managing their playlists. They primarily render views or redirect, rather than returning JSON data directly, and require active session-based authentication.

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
