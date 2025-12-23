// Unified Mentor Music Player - Patched app.js

// ====================================================================
// 1. DATA & STATE MANAGEMENT
// ====================================================================

// Placeholder Playlist Data
const initialPlaylist = [
    {
        id: 1,
        title: "I'm Done",
        artist: "Maan Panu",
        album: " I-Popstar Season 1",
        cover: "assets/img/cover1.jpg",
        audio: "assets/audio/track1.mp3",
        duration: "3:47"
    },
    {
        id: 2,
        title: "Sadiyan",
        artist: "Abhijay Sharma",
        album: "I-Popstar Season 1",
        cover: "assets/img/cover2.jpg",
        audio: "assets/audio/track2.mp3",
        duration: "3:29"
    },
    {
        id: 3,
        title: "Tu",
        artist: "Sanjoy, Talwiinder",
        album: "Official Music Video",
        cover: "assets/img/cover3.jpg",
        audio: "assets/audio/track3.mp3",
        duration: "2:32"
    },

    {
        id: 4,
        title: "Tum Ho Toh",
        artist: "Vishal Mishra, Hansika Pareek",
        album: "Official Music Video",
        cover: "assets/img/cover4.jpg",
        audio: "assets/audio/track4.mp3",
        duration: "3:2"
    }
];

// Application State
let currentPlaylist = [];
let trackIndex = 0;
let isPlaying = false;
let isShuffle = false;
// Repeat modes: 0=None, 1=One, 2=All
let repeatMode = 2; // Default to Repeat All

// Local storage keys
const LOCAL_STORAGE_VOLUME = 'musicPlayerVolume';
const LOCAL_STORAGE_PLAYLIST = 'musicPlayerPlaylist';

// ====================================================================
// 2. DOM ELEMENT CACHE
// ====================================================================

const audio = document.getElementById('audio-player');
const coverArt = document.getElementById('cover-art');
const trackTitle = document.getElementById('track-title');
const trackArtist = document.getElementById('track-artist');
const trackAlbum = document.getElementById('track-album');
const currentTimeDisplay = document.getElementById('current-time');
const totalDurationDisplay = document.getElementById('total-duration');
const seekSlider = document.getElementById('seek-slider');
const volumeSlider = document.getElementById('volume-slider');
const playlistList = document.getElementById('playlist-list');
const errorMessage = document.getElementById('error-message');

// Control Buttons
const playPauseBtn = document.getElementById('play-pause-btn');
const playIcon = document.getElementById('play-icon');
const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const shuffleBtn = document.getElementById('shuffle-btn');
const repeatBtn = document.getElementById('repeat-btn');
const repeatIcon = document.getElementById('repeat-icon');
const muteBtn = document.getElementById('mute-btn');
const volumeIcon = document.getElementById('volume-icon');
const addTrackBtn = document.getElementById('add-track-btn');


// ====================================================================
// 3. UTILITY FUNCTIONS
// ====================================================================

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
}

function showNonBlockingMessage(msg) {
    errorMessage.textContent = msg;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// ====================================================================
// 4. CORE PLAYER FUNCTIONS
// ====================================================================

function loadTrack(shouldPlay = false) {
    const track = currentPlaylist[trackIndex];

    if (!track) {
        trackTitle.textContent = "No Track Loaded";
        trackArtist.textContent = "";
        trackAlbum.textContent = "";
        coverArt.src = "";
        audio.src = "";
        audio.dataset.trackId = '';
        totalDurationDisplay.textContent = "0:00";
        seekSlider.value = 0;
        seekSlider.style.setProperty('--fill-percentage', '0%');
        playIcon.className = 'fas fa-play';
        isPlaying = false;
        return;
    }

    audio.onerror = () => {
        showNonBlockingMessage(`Error loading audio file: ${track.audio}. Skipping to next track.`);
        setTimeout(nextTrack, 1000);
    };

    trackTitle.textContent = track.title;
    trackArtist.textContent = track.artist;
    trackAlbum.textContent = track.album;
    coverArt.src = track.cover;
    coverArt.alt = `Album cover for ${track.title} by ${track.artist}`;
    audio.src = track.audio;

    // Attach reliable id to audio element for future reference
    audio.dataset.trackId = track.id;

    // Reset UI elements
    currentTimeDisplay.textContent = "0:00";
    seekSlider.value = 0;
    seekSlider.max = 0;
    seekSlider.style.setProperty('--fill-percentage', '0%');
    
    // Update the playlist UI to highlight the currently playing track
    highlightPlayingTrack();

    if (shouldPlay) {
        audio.load();
        audio.play().then(() => {
            isPlaying = true;
            playIcon.className = 'fas fa-pause';
            playPauseBtn.setAttribute('aria-label', 'Pause');
        }).catch(error => {
            if (error.name === "NotAllowedError") {
                showNonBlockingMessage("Playback started, but was paused by browser's autoplay policy. Click play to continue.");
            } else {
                showNonBlockingMessage(`Playback failed: ${error.message}`);
            }
            isPlaying = false;
            playIcon.className = 'fas fa-play';
            playPauseBtn.setAttribute('aria-label', 'Play');
        });
    }
}

// Improved playPause: resume if possible, otherwise load and play
function playPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
        playIcon.className = 'fas fa-play';
        playPauseBtn.setAttribute('aria-label', 'Play');
    } else {
        // If audio has a src and is paused, resume instead of reloading.
        if (audio.src && audio.src !== '') {
            audio.play().then(() => {
                isPlaying = true;
                playIcon.className = 'fas fa-pause';
                playPauseBtn.setAttribute('aria-label', 'Pause');
            }).catch(error => {
                console.warn('Resume play failed, reloading:', error);
                // fallback to loadTrack which will try to load & play
                loadTrack(true);
            });
        } else {
            // No source loaded yet — load the current track and play.
            loadTrack(true);
        }
    }
}

function nextTrack() {
    if (currentPlaylist.length === 0) return;

    if (isShuffle) {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * currentPlaylist.length);
        } while (newIndex === trackIndex && currentPlaylist.length > 1);
        trackIndex = newIndex;
    } else {
        trackIndex = (trackIndex + 1) % currentPlaylist.length;
    }
    loadTrack(true);
}

function prevTrack() {
    if (currentPlaylist.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
        return;
    }

    trackIndex = (trackIndex - 1 + currentPlaylist.length) % currentPlaylist.length;
    loadTrack(true);
}

// ====================================================================
// 5. UI UPDATES & EVENT HANDLERS
// ====================================================================

function updateProgress() {
    const totalDuration = audio.duration;
    const currentTime = audio.currentTime;

    if (!isNaN(totalDuration) && isFinite(totalDuration) && totalDuration > 0) {
        if (seekSlider.max !== totalDuration) {
            seekSlider.max = totalDuration;
            totalDurationDisplay.textContent = formatTime(totalDuration);
        }

        currentTimeDisplay.textContent = formatTime(currentTime);
        seekSlider.value = currentTime;

        const percentage = (currentTime / totalDuration) * 100;
        seekSlider.style.setProperty('--fill-percentage', `${percentage}%`);
        seekSlider.setAttribute('aria-valuenow', Math.round(percentage));
    }
}

function seekTo() {
    const seekTime = parseFloat(seekSlider.value);
    if (!isNaN(seekTime)) {
        audio.currentTime = seekTime;
    }
}

function handleTrackEnd() {
    if (currentPlaylist.length === 0) return;

    if (repeatMode === 1) {
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Repeat One play error:', e));
    } else if (repeatMode === 2) {
        nextTrack();
    } else {
        if (trackIndex === currentPlaylist.length - 1) {
            isPlaying = false;
            playIcon.className = 'fas fa-play';
            playPauseBtn.setAttribute('aria-label', 'Play');
            audio.currentTime = 0;
            trackIndex = 0;
            highlightPlayingTrack();
        } else {
            nextTrack();
        }
    }
}

// ====================================================================
// 6. VOLUME PERSISTENCE & CONTROL
// ====================================================================

function initVolume() {
    const savedVolume = localStorage.getItem(LOCAL_STORAGE_VOLUME);
    const volume = savedVolume !== null ? parseFloat(savedVolume) : 100;
    
    audio.volume = volume / 100;
    volumeSlider.value = volume;
    
    updateVolumeIcon(volume / 100);
}

function changeVolume() {
    const volume = parseFloat(volumeSlider.value);
    audio.volume = volume / 100;
    localStorage.setItem(LOCAL_STORAGE_VOLUME, volume);
    updateVolumeIcon(audio.volume);
}

function toggleMute() {
    if (audio.muted) {
        audio.muted = false;
        if (audio.volume === 0) {
            audio.volume = parseFloat(localStorage.getItem(LOCAL_STORAGE_VOLUME) || 50) / 100;
            volumeSlider.value = audio.volume * 100;
        }
    } else {
        audio.muted = true;
    }
    updateVolumeIcon(audio.volume);
}

function updateVolumeIcon(vol) {
    if (audio.muted || vol === 0) {
        volumeIcon.className = 'fas fa-volume-mute';
        muteBtn.setAttribute('aria-label', 'Unmute');
    } else if (vol < 0.5) {
        volumeIcon.className = 'fas fa-volume-down';
        muteBtn.setAttribute('aria-label', 'Mute');
    } else {
        volumeIcon.className = 'fas fa-volume-up';
        muteBtn.setAttribute('aria-label', 'Mute');
    }
}

// ====================================================================
// 7. ADVANCED PLAYER MODES (SHUFFLE/REPEAT)
// ====================================================================

function toggleShuffle() {
    isShuffle = !isShuffle;
    shuffleBtn.classList.toggle('active', isShuffle);
    shuffleBtn.setAttribute('aria-pressed', isShuffle);
}

function toggleRepeat() {
    repeatMode = (repeatMode + 1) % 3;
    
    if (repeatMode === 0) {
        repeatIcon.className = 'fas fa-repeat';
        repeatBtn.classList.remove('active');
        repeatBtn.setAttribute('aria-label', 'Toggle repeat mode: Repeat all');
    } else if (repeatMode === 1) {
        repeatIcon.className = 'fas fa-repeat-one';
        repeatBtn.classList.add('active');
        repeatBtn.setAttribute('aria-label', 'Toggle repeat mode: Repeat one');
    } else {
        repeatIcon.className = 'fas fa-repeat';
        repeatBtn.classList.add('active');
        repeatBtn.setAttribute('aria-label', 'Toggle repeat mode: Repeat none');
    }
    repeatBtn.setAttribute('aria-pressed', repeatMode !== 0);
}

// ====================================================================
// 8. PLAYLIST MANAGEMENT & UI
// ====================================================================

function renderPlaylist() {
    playlistList.innerHTML = '';
    currentPlaylist.forEach((track, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('playlist-item');
        listItem.setAttribute('role', 'option');
        listItem.setAttribute('aria-selected', index === trackIndex ? 'true' : 'false');
        listItem.setAttribute('tabindex', '0');
        listItem.setAttribute('draggable', 'true');
        listItem.dataset.index = index;
        listItem.dataset.id = track.id;

        listItem.innerHTML = `
            <img src="${track.cover}" alt="Cover" class="playlist-cover" onerror="this.onerror=null;this.src='assets/img/default.jpg';">
            <div class="playlist-details">
                <p class="playlist-title-small">${track.title}</p>
                <p class="playlist-artist-small">${track.artist} - ${track.album}</p>
            </div>
            <span class="playlist-duration">${track.duration}</span>
            <button class="remove-btn" aria-label="Remove ${track.title} from playlist" data-id="${track.id}"><i class="fas fa-trash-alt"></i></button>
        `;
        
        listItem.addEventListener('click', (e) => {
            if (e.target.closest('.remove-btn')) return;
            trackIndex = parseInt(listItem.dataset.index);
            loadTrack(true);
        });

        addDragEventListeners(listItem);

        playlistList.appendChild(listItem);
    });

    highlightPlayingTrack(false);
}

function highlightPlayingTrack(shouldScroll = true) {
    const items = playlistList.querySelectorAll('.playlist-item');
    items.forEach((item, index) => {
        const isCurrent = index === trackIndex;
        item.classList.toggle('playing', isCurrent);
        item.setAttribute('aria-selected', isCurrent ? 'true' : 'false');
        
        if (isCurrent && shouldScroll) {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Updated addTrackPlaceholder to avoid reusing the same audio file repeatedly
function addTrackPlaceholder() {
    const newId = Math.max(...currentPlaylist.map(t => t.id), 0) + 1;
    const sample = initialPlaylist[(newId - 1) % initialPlaylist.length];

    const newTrack = {
        id: newId,
        title: `New Track #${newId}`,
        artist: "New Artist",
        album: "New Album",
        cover: sample.cover,
        audio: sample.audio,
        duration: sample.duration || "0:00"
    };

    currentPlaylist.push(newTrack);
    savePlaylist();
    renderPlaylist();
    showNonBlockingMessage(`Added placeholder track: ${newTrack.title}`);
}

function removeTrack(trackId) {
    const initialLength = currentPlaylist.length;
    const removedIndex = currentPlaylist.findIndex(track => track.id === trackId);
    
    if (removedIndex === -1) return;

    currentPlaylist.splice(removedIndex, 1);
    
    if (removedIndex === trackIndex) {
        trackIndex = Math.min(trackIndex, currentPlaylist.length - 1);
        if (isPlaying || audio.paused) {
            loadTrack(isPlaying);
        }
    } else if (removedIndex < trackIndex) {
        trackIndex--;
    }

    savePlaylist();
    renderPlaylist();
    if (initialLength > 0 && currentPlaylist.length === 0) {
        loadTrack(false);
    }
}

function savePlaylist() {
    localStorage.setItem(LOCAL_STORAGE_PLAYLIST, JSON.stringify(currentPlaylist));
}

function loadPlaylist() {
    const savedPlaylist = localStorage.getItem(LOCAL_STORAGE_PLAYLIST);
    if (savedPlaylist) {
        try {
            currentPlaylist = JSON.parse(savedPlaylist);
            currentPlaylist = currentPlaylist.map((track, idx) => ({ 
                ...track, 
                id: track.id || (idx + 1)
            }));
            return;
        } catch (e) {
            console.error("Failed to parse saved playlist, using default.", e);
            localStorage.removeItem(LOCAL_STORAGE_PLAYLIST);
        }
    }
    currentPlaylist = JSON.parse(JSON.stringify(initialPlaylist));
}

// ====================================================================
// 9. DRAG-AND-DROP REORDERING
// ====================================================================

let draggedItem = null;

function addDragEventListeners(item) {
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('dragleave', handleDragLeave);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);
}

function handleDragStart(e) {
    draggedItem = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.dataset.id);
    setTimeout(() => this.classList.add('dragging'), 0);
}

function handleDragOver(e) {
    if (draggedItem && draggedItem !== this) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const rect = this.getBoundingClientRect();
        const y = e.clientY - rect.top;
        this.classList.remove('drag-over-top', 'drag-over-bottom');

        if (y < rect.height / 2) {
            this.classList.add('drag-over-top');
        } else {
            this.classList.add('drag-over-bottom');
        }
    }
}

function handleDragLeave() {
    this.classList.remove('drag-over-top', 'drag-over-bottom');
}

function handleDrop(e) {
    e.preventDefault();
    this.classList.remove('drag-over-top', 'drag-over-bottom');
    
    if (draggedItem && draggedItem !== this) {
        const draggedIndex = parseInt(draggedItem.dataset.index);
        let dropIndex = parseInt(this.dataset.index);
        
        const rect = this.getBoundingClientRect();
        const y = e.clientY - rect.top;
        if (y > rect.height / 2) {
            dropIndex = dropIndex + 1;
        }

        const trackToMove = currentPlaylist.splice(draggedIndex, 1)[0];
        const targetIndex = dropIndex > draggedIndex ? dropIndex - 1 : dropIndex;
        currentPlaylist.splice(targetIndex, 0, trackToMove);

        // Re-find the index of the currently playing track by id (safer)
        const currentTrackId = parseInt(audio.dataset.trackId || currentPlaylist[trackIndex]?.id);
        const newCurrentIndex = currentPlaylist.findIndex(t => t.id === currentTrackId);
        if (newCurrentIndex !== -1) {
            trackIndex = newCurrentIndex;
        }

        savePlaylist();
        renderPlaylist();
    }
}

function handleDragEnd() {
    playlistList.querySelectorAll('.playlist-item').forEach(item => {
        item.classList.remove('dragging', 'drag-over-top', 'drag-over-bottom');
    });
    draggedItem = null;
}

// ====================================================================
// 10. KEYBOARD ACCESSIBILITY
// ====================================================================

function handleKeyDown(e) {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
        return;
    }

    switch (e.code) {
        case 'Space':
            e.preventDefault();
            playPause();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            audio.currentTime = Math.max(0, audio.currentTime - 5);
            updateProgress();
            break;
        case 'ArrowRight':
            e.preventDefault();
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
            updateProgress();
            break;
        default:
            return;
    }
}

// ====================================================================
// 11. INITIALIZATION & EVENT LISTENERS
// ====================================================================

function init() {
    loadPlaylist();
    initVolume();

    renderPlaylist();
    
    if (currentPlaylist.length > 0) {
        loadTrack(false);
    }
    
    playPauseBtn.addEventListener('click', playPause);
    prevBtn.addEventListener('click', prevTrack);
    nextBtn.addEventListener('click', nextTrack);
    shuffleBtn.addEventListener('click', toggleShuffle);
    repeatBtn.addEventListener('click', toggleRepeat);
    muteBtn.addEventListener('click', toggleMute);
    addTrackBtn.addEventListener('click', addTrackPlaceholder);
    
    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('loadedmetadata', updateProgress);
    audio.addEventListener('ended', handleTrackEnd);
    seekSlider.addEventListener('input', updateProgress);
    seekSlider.addEventListener('change', seekTo);

    volumeSlider.addEventListener('input', changeVolume);
    
    playlistList.addEventListener('click', (e) => {
        const removeButton = e.target.closest('.remove-btn');
        if (removeButton) {
            e.stopPropagation();
            const trackId = parseInt(removeButton.dataset.id);
            removeTrack(trackId);
        }
    });

    document.addEventListener('keydown', handleKeyDown);

    shuffleBtn.classList.toggle('active', isShuffle);
    // Ensure repeat button is in a consistent known state; set to "All" only if repeatMode === 2
    // Avoid calling toggleRepeat multiple times during init which can produce unexpected state
    if (repeatMode === 2) {
        repeatIcon.className = 'fas fa-repeat';
        repeatBtn.classList.add('active');
        repeatBtn.setAttribute('aria-pressed', 'true');
    } else if (repeatMode === 1) {
        repeatIcon.className = 'fas fa-repeat-one';
        repeatBtn.classList.add('active');
        repeatBtn.setAttribute('aria-pressed', 'true');
    } else {
        repeatIcon.className = 'fas fa-repeat';
        repeatBtn.classList.remove('active');
        repeatBtn.setAttribute('aria-pressed', 'false');
    }
}

document.addEventListener('DOMContentLoaded', init);
