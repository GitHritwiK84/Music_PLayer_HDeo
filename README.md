# Mentor Music Player Project

This project delivers a complete, production-quality web music player built entirely with semantic HTML, modern CSS, and 100% vanilla JavaScript, strictly adhering to the provided project specifications.

## Project Description

A fully functional, single-page web application that serves as a modern music player. It features robust playback controls, a dynamic, reorderable playlist, advanced modes (shuffle and repeat), volume persistence, and full keyboard accessibility.

## Features

### 🎵 Core Player Features
* **Clean UI:** Modern, responsive design with an easy-to-read color palette.
* **Playback Controls:** Dedicated Play/Pause, Next, and Previous track buttons.
* **Progress Bar:** Displays track progress, with seeking functionality via a range slider that includes a visual fill.
* **Time Display:** Shows current playback time and total track duration (MM:SS format).
* **Volume Control:** Volume slider with the ability to mute. Volume level is saved to and loaded from `localStorage`.
* **Track Info Display:** Shows Album Art, Track Title, Artist, and Album.

### 📁 Playlist Features
* **Sidebar Playlist:** Displays Title, Artist, Album, Cover, and Duration for each track.
* **Dynamic Actions:** Placeholder button to **Add new track** and a button to **Remove track** from the playlist.
* **Current Track Highlight:** The currently playing track is visually highlighted and **scrolls into view** when playback begins.
* **Persistence:** The **playlist order is saved** to `localStorage`.

### 🔄 Advanced Player Features
* **Shuffle Mode:** Toggles random playback order.
* **Repeat Mode:** Toggles between **Repeat None**, **Repeat One (loop current track)**, and **Repeat All (loop playlist)**.
* **Drag-and-Drop:** Tracks can be reordered in the playlist using standard drag-and-drop functionality.

### ♿ Accessibility & UX
* **Keyboard Control:**
    * **Spacebar:** Toggles Play/Pause globally (when focus is not on an input/button).
    * **ArrowLeft / ArrowRight:** Seeks backward/forward by **±5 seconds**.
* **ARIA Labels:** All controls and interactive elements have appropriate `aria-labels` and roles for screen reader compatibility.
* **Responsive Layout:** The main player and playlist sidebar adapt gracefully, with the playlist collapsing below the player on mobile viewports.
* **Error Handling:** Graceful handling of missing audio files (skipping to next track) and browser autoplay errors (showing a small, non-blocking message instead of `alert()`).
* **No Autoplay:** Playback only begins after a user interaction (e.g., clicking the play button or a track).

## Folder Structure

The project adheres to the specified file and folder organization: