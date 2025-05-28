# Song API Documentation

This document provides details for the Song API routes.

## 1. Get All Songs

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/songs`
*   **Description:** Retrieves a list of all songs available in the database.
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
      },
      {
        "_id": "60c72b0f9b1e8a3f7c8d40c7",
        "title": "Song Title 2",
        "artist": "Artist Name 2",
        "album": "Album Name 2",
        "genre": "Genre 2",
        "year": 2024,
        "coverImage": "cover2.jpg",
        "audioFile": "song2.mp3"
      }
    ]
    ```

## 2. Upload a New Song

*   **HTTP Method:** POST
*   **Full URL Path:** `http://localhost:3000/songs/upload`
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
*   **Description:** Streams the audio file of a specific song.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song to stream.
*   **Request Body:** None
*   **Example Response:** The response will be the audio stream itself, with appropriate `Content-Type` (e.g., `audio/mpeg`) and `Content-Length` headers. The actual body will be the binary audio data.

## 4. Get a Song's Cover Image

*   **HTTP Method:** GET
*   **Full URL Path:** `http://localhost:3000/songs/cover/:songId`
*   **Description:** Retrieves the cover image of a specific song.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song whose cover image is to be retrieved.
*   **Request Body:** None
*   **Example Response:** The response will be the image file itself, with appropriate `Content-Type` (e.g., `image/jpeg`, `image/png`) and `Content-Length` headers. The actual body will be the binary image data.

## 5. Delete a Song

*   **HTTP Method:** DELETE
*   **Full URL Path:** `http://localhost:3000/songs/:songId`
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
*   **Description:** Updates the metadata (title, artist, album, etc.) of an existing song. It can also optionally update the cover image and/or audio file.
*   **Parameters:**
    *   `songId`: Path parameter (string, MongoDB ObjectId) - The ID of the song to update.
*   **Request Body:** `multipart/form-data` (if `coverImage` or `audioFile` are being updated, otherwise `application/json` might also be acceptable if only metadata is updated, though the controller seems set up for `multipart/form-data` due to `upload.fields`).
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
        "coverImage": "updated_cover.jpg", // or original if not updated
        "audioFile": "updated_song.mp3"   // or original if not updated
      }
    }
    ```
