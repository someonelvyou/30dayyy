// Create an invisible audio element that persists across page navigation
(function() {
    // Check if the audio element already exists in localStorage
    if (!sessionStorage.getItem('audioInitialized')) {
        // Initialize audio state
        sessionStorage.setItem('audioInitialized', 'true');
        sessionStorage.setItem('musicPlaying', 'false');
        sessionStorage.setItem('musicCurrentTime', '0');
    }
    
    // Main page check (where we want to show the control)
    const isMainPage = window.location.pathname === '/' || 
                       window.location.pathname === '/index.html' || 
                       window.location.pathname.endsWith('/index.html');
    
    // Only add the toggle button on the main page
    if (isMainPage) {
        // Add music player control to main page
        window.addEventListener('DOMContentLoaded', function() {
            const musicToggle = document.getElementById('musicToggle');
            
            if (musicToggle) {
                musicToggle.addEventListener('click', function() {
                    const isPlaying = sessionStorage.getItem('musicPlaying') === 'true';
                    
                    if (isPlaying) {
                        // Pause music
                        window.postMessage({ type: 'AUDIO_CONTROL', action: 'pause' }, '*');
                        musicToggle.innerHTML = '<i class="fas fa-music"></i> Putar Musik';
                        sessionStorage.setItem('musicPlaying', 'false');
                    } else {
                        // Play music
                        window.postMessage({ type: 'AUDIO_CONTROL', action: 'play' }, '*');
                        musicToggle.innerHTML = '<i class="fas fa-pause"></i> Jeda Musik';
                        sessionStorage.setItem('musicPlaying', 'true');
                    }
                });
                
                // Update button text based on current state
                if (sessionStorage.getItem('musicPlaying') === 'true') {
                    musicToggle.innerHTML = '<i class="fas fa-pause"></i> Jeda Musik';
                }
            }
        });
    }
    
    // Create hidden audio wrapper if it doesn't exist
    if (!document.getElementById('persistent-audio-wrapper')) {
        const audioWrapper = document.createElement('div');
        audioWrapper.id = 'persistent-audio-wrapper';
        audioWrapper.style.display = 'none';
        
        const audio = document.createElement('audio');
        audio.id = 'persistentAudio';
        audio.loop = true;
        
        const source = document.createElement('source');
        source.src = 'muaic.mp3';  // Make sure this path is correct
        source.type = 'audio/mpeg';
        
        audio.appendChild(source);
        audioWrapper.appendChild(audio);
        document.body.appendChild(audioWrapper);
        
        // Restore audio position from sessionStorage
        const savedTime = sessionStorage.getItem('musicCurrentTime');
        if (savedTime) {
            audio.currentTime = parseFloat(savedTime);
        }
        
        // If music was playing, resume it
        if (sessionStorage.getItem('musicPlaying') === 'true') {
            audio.play().catch(error => {
                console.log('Autoplay prevented:', error);
                // Browser blocked autoplay, update state
                sessionStorage.setItem('musicPlaying', 'false');
            });
        }
        
        // Save current time regularly
        setInterval(() => {
            if (!audio.paused) {
                sessionStorage.setItem('musicCurrentTime', audio.currentTime.toString());
            }
        }, 1000);
        
        // Listen for control messages
        window.addEventListener('message', function(event) {
            if (event.data.type === 'AUDIO_CONTROL') {
                if (event.data.action === 'play') {
                    audio.play();
                } else if (event.data.action === 'pause') {
                    audio.pause();
                }
            }
        });
    }
})();