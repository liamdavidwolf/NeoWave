document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById('playlistContainer');
    const nowTitle = document.getElementById('now-title');
    const nowArtist = document.getElementById('now-artist');
    const nowCover = document.getElementById('now-cover');
    const audio = document.getElementById('now-audio');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const songList = document.getElementById('songList');
  
    let currentPlaylist = [];
    let currentIndex = 0;
  
    function playSong(index) {
      const song = currentPlaylist[index];
      if (!song || !song.filename) {
        alert("No se pudo cargar la canción.");
        return;
      }
  
      console.log("🎧 Canción seleccionada:", song);
      console.log("🎵 Intentando reproducir:", `/songs/${song.filename}`);
  
      audio.src = `/songs/${song.filename}`;
      nowCover.src = song.cover ? `/uploads/covers/${song.cover}` : 'https://via.placeholder.com/150';
      nowTitle.textContent = song.title;
      nowArtist.textContent = song.artist;
      audio.play().catch(err => {
        console.error("⛔ Error al reproducir:", err);
        alert("No se pudo reproducir la canción.");
      });
  
      playPauseBtn.innerHTML = `<i class="bi bi-pause-fill"></i>`;
  
      localStorage.setItem("currentSong", JSON.stringify({
        title: song.title,
        artist: song.artist,
        file: song.filename,
        cover: song.cover
      }));
  
      // Actualizar lista "A continuación"
      songList.innerHTML = '';
      for (let i = index + 1; i < currentPlaylist.length; i++) {
        const nextSong = currentPlaylist[i];
        const li = document.createElement('li');
        li.textContent = nextSong.title;
        li.style.cursor = 'pointer';
        li.addEventListener('click', () => {
          currentIndex = i;
          playSong(currentIndex);
        });
        songList.appendChild(li);
      }
    }
  
    function togglePlayPause() {
      if (audio.paused) {
        audio.play();
        playPauseBtn.innerHTML = `<i class="bi bi-pause-fill"></i>`;
      } else {
        audio.pause();
        playPauseBtn.innerHTML = `<i class="bi bi-play-fill"></i>`;
      }
    }
  
    function playNext() {
      if (currentIndex < currentPlaylist.length - 1) {
        currentIndex++;
        playSong(currentIndex);
      }
    }
  
    function playPrev() {
      if (currentIndex > 0) {
        currentIndex--;
        playSong(currentIndex);
      }
    }
  
    playPauseBtn.addEventListener('click', togglePlayPause);
    nextBtn.addEventListener('click', playNext);
    prevBtn.addEventListener('click', playPrev);
  
    try {
      const res = await fetch('/api/playlists');
      const playlists = await res.json();
  
      playlists.forEach((pl, index) => {
        const div = document.createElement('div');
        div.className = 'col';
        div.innerHTML = `
          <img src="${pl.cover ? pl.cover : 'https://via.placeholder.com/150'}"
               class="album-cover playlist-cover"
               data-index="${index}"
               alt="${pl.name}">
          <p class="text-center mt-2 fw-semibold text-white mb-0">${pl.name}</p>
          <small class="text-center d-block artist-name">${pl.songs[0]?.artist || 'Artista desconocido'}</small>
        `;
        container.appendChild(div);
      });
  
      container.addEventListener('click', (e) => {
        const target = e.target;
        if (target.classList.contains('playlist-cover')) {
          const index = target.getAttribute('data-index');
          const selected = playlists[index];
  
          if (!selected.songs.length) {
            alert('Esta playlist no tiene canciones');
            return;
          }
  
          currentPlaylist = selected.songs;
          currentIndex = 0;
          playSong(currentIndex);
        }
      });
  
      audio.addEventListener('ended', playNext);
  
      const savedSong = localStorage.getItem("currentSong");
      if (savedSong) {
        const song = JSON.parse(savedSong);
        nowTitle.textContent = song.title;
        nowArtist.textContent = song.artist;
        nowCover.src = song.cover ? `/uploads/covers/${song.cover}` : 'https://via.placeholder.com/150';
        audio.src = `/songs/${song.file}`;
  
        const allPlaylistsRes = await fetch('/api/playlists');
        const allPlaylists = await allPlaylistsRes.json();
  
        let found = false;
        for (const pl of allPlaylists) {
          const index = pl.songs.findIndex(s => s.title === song.title && s.filename === song.file);
          if (index !== -1) {
            currentPlaylist = pl.songs;
            currentIndex = index;
            found = true;
            break;
          }
        }
  
        if (!found) {
          currentPlaylist = [song];
          currentIndex = 0;
        }
      }
  
      await cargarPlaylistsAleatorias();
      await cargarPlaylistsAleatoriasExtra();
  
    } catch (err) {
      console.error('Error cargando playlists:', err);
    }
  
    async function cargarPlaylistsAleatorias() {
      try {
        const res = await fetch('/api/playlists/random/5');
        const playlists = await res.json();
        const container = document.getElementById('randomPlaylists');
        container.innerHTML = '';
  
        playlists.forEach((p, index) => {
          const col = document.createElement('div');
          col.className = 'col';
          col.innerHTML = `
            <img src="${p.cover || 'https://via.placeholder.com/150'}"
                 class="album-cover random-cover"
                 data-index="${index}"
                 alt="${p.name}"
                 style="cursor:pointer;">
            <p class="text-center mt-2 fw-semibold text-white mb-0">${p.name}</p>
            <small class="text-center d-block artist-name">${p.songs[0]?.artist || 'Artista desconocido'}</small>
          `;
          container.appendChild(col);
        });
  
        container.addEventListener('click', (e) => {
          const target = e.target;
          if (target.classList.contains('random-cover')) {
            const index = target.getAttribute('data-index');
            const selected = playlists[index];
            if (!selected.songs.length) {
              alert('Esta playlist no tiene canciones');
              return;
            }
  
            currentPlaylist = selected.songs;
            currentIndex = 0;
            playSong(currentIndex);
          }
        });
      } catch (err) {
        console.error('❌ Error al cargar playlists aleatorias:', err);
      }
    }
  
    async function cargarPlaylistsAleatoriasExtra() {
      try {
        const res = await fetch('/api/playlists/random/5');
        const playlists = await res.json();
        const container = document.getElementById('randomPlaylists2');
        container.innerHTML = '';
  
        playlists.forEach((p, index) => {
          const col = document.createElement('div');
          col.className = 'col';
          col.innerHTML = `
            <img src="${p.cover || 'https://via.placeholder.com/150'}"
                 class="album-cover random2-cover"
                 data-index="${index}"
                 alt="${p.name}"
                 style="cursor:pointer;">
            <p class="text-center mt-2 fw-semibold text-white mb-0">${p.name}</p>
            <small class="text-center d-block artist-name">${p.songs[0]?.artist || 'Artista desconocido'}</small>
          `;
          container.appendChild(col);
        });
  
        container.addEventListener('click', (e) => {
          const target = e.target;
          if (target.classList.contains('random2-cover')) {
            const index = target.getAttribute('data-index');
            const selected = playlists[index];
            if (!selected.songs.length) {
              alert('Esta playlist no tiene canciones');
              return;
            }
  
            currentPlaylist = selected.songs;
            currentIndex = 0;
            playSong(currentIndex);
          }
        });
      } catch (err) {
        console.error('❌ Error al cargar playlists aleatorias (extra):', err);
      }
    }
  });
  