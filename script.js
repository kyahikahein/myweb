document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  let savedTheme = localStorage.getItem('theme') || 'light';
  let aboutWindow = null;
  let isDragging = false;
  let initialX = 0;
  let initialY = 0;

  // --- THEME LOGIC ---
  function applyTheme(theme) {
    body.classList.remove('light-theme', 'dark-theme');
    if (theme === 'light') {
      body.classList.add('light-theme');
    } else {
      body.classList.add('dark-theme');
    }
    localStorage.setItem('theme', theme);
  }

  function toggleTheme() {
    const newTheme = body.classList.contains('light-theme') ? 'dark' : 'light';
    applyTheme(newTheme);
  }

  // --- ENHANCED CAT INTERACTIONS ---
  const kikiCat = document.getElementById('kikiCat');
  if (kikiCat) {
    let catMood = 'normal';
    let petCount = 0;
    
    // Theme switching with cat reactions
    kikiCat.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      toggleTheme();
      const catSpeech = document.getElementById('catSpeech');
      
      petCount++;
      
      if (petCount % 5 === 0) {
        catSpeech.textContent = 'purr purr~ ❤️';
        catMood = 'happy';
      } else if (petCount % 3 === 0) {
        catSpeech.textContent = body.classList.contains('light-theme') ? 'bright!' : 'cozy~';
      } else {
        catSpeech.textContent = body.classList.contains('light-theme') ? 'light mode!' : 'dark mode!';
      }
      
      kikiCat.classList.add('speaking');
      
      // Add special animations for mood changes
      if (catMood === 'happy') {
        kikiCat.style.animation = 'cat-excited 0.8s ease-in-out infinite';
        setTimeout(() => {
          kikiCat.style.animation = '';
          catMood = 'normal';
        }, 3000);
      }
      
      setTimeout(() => {
        kikiCat.classList.remove('speaking');
        catSpeech.textContent = 'click me to change theme!';
      }, 2000);
    });

    // Mouse follow for eyes (simplified)
    let mouseFollowTimeout;
    document.addEventListener('mousemove', (e) => {
      clearTimeout(mouseFollowTimeout);
      
      const pupils = kikiCat.querySelectorAll('.pupil');
      const catRect = kikiCat.getBoundingClientRect();
      const catCenterX = catRect.left + catRect.width / 2;
      const catCenterY = catRect.top + catRect.height / 2;
      
      const angle = Math.atan2(e.clientY - catCenterY, e.clientX - catCenterX);
      const distance = Math.min(2, Math.sqrt((e.clientX - catCenterX) ** 2 + (e.clientY - catCenterY) ** 2) / 100);
      
      pupils.forEach(pupil => {
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;
        pupil.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
      });
      
      // Reset after mouse stops moving
      mouseFollowTimeout = setTimeout(() => {
        pupils.forEach(pupil => {
          pupil.style.transform = '';
        });
      }, 2000);
    });

    // Random cat behaviors
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance every 5 seconds
        const behaviors = ['meow?', '*stretches*', '*yawns*', 'mrow~', '*blinks slowly*'];
        const behavior = behaviors[Math.floor(Math.random() * behaviors.length)];
        
        const catSpeech = document.getElementById('catSpeech');
        catSpeech.textContent = behavior;
        kikiCat.classList.add('speaking');
        
        setTimeout(() => {
          kikiCat.classList.remove('speaking');
          catSpeech.textContent = 'click me to change theme!';
        }, 1500);
      }
    }, 5000);
  }
  
  applyTheme(savedTheme);

  // --- ABOUT WINDOW LOGIC ---
  function createAboutWindow() {
    if (aboutWindow) {
      aboutWindow.remove();
      aboutWindow = null;
      return;
    }

    aboutWindow = document.createElement('div');
    aboutWindow.className = 'about-window';
    aboutWindow.innerHTML = `
      <div class="window-header" id="aboutWindowHeader">
        <span>about</span>
        <button class="close-btn" id="aboutCloseBtn">[x]</button>
      </div>
      <div class="window-content">
        <div class="profile-section">
          <img src="https://pbs.twimg.com/profile_images/1961017381423386625/9m6XriRP_400x400.jpg" alt="Profile" class="profile-image">
          <div class="profile-info">
            <h3 class="haku-text">haku</h3>
            <p class="profile-subtitle"> IoT (Embedded Systems) Dual Degree Student


</p>
          </div>
        </div>
        <div class="about-content">
          <p>hi, i’m <strong>haku</strong>. right now i’m studying a b.tech + m.tech dual degree in iot, a 5-year course that mixes electronics, communication, and a bit of computer science.</p>
    <p>i’m also learning python and trying to connect the dots between coding and hardware. this site is part <em>portfolio</em>, part <em>personal blog</em> — a place where i put down projects i’m working on, ideas i’m exploring, and sometimes just random thoughts that i don’t want to lose.</p>

    <p>outside studies, you’ll most likely find me at the gym or playin games. i don’t claim to have everything figured out yet, but i’m learning, experimenting, and building as i go. this space is basically my way of sharing that journey.</p>
        </div>
      </div>
    `;
    body.appendChild(aboutWindow);
    
    // Prevent body scroll when about window is open
    body.style.overflow = 'hidden';
    
    setTimeout(() => aboutWindow.classList.add('visible'), 10);

    const header = aboutWindow.querySelector('#aboutWindowHeader');
    const closeBtn = aboutWindow.querySelector('#aboutCloseBtn');

    function closeAboutWindow() {
      aboutWindow.classList.remove('visible');
      body.style.overflow = ''; // Restore body scroll
      setTimeout(() => {
        if (aboutWindow) {
          aboutWindow.remove();
          aboutWindow = null;
        }
      }, 400);
    }

    closeBtn.addEventListener('click', closeAboutWindow);

    // Close window when clicking outside
    aboutWindow.addEventListener('click', (e) => {
      if (e.target === aboutWindow) {
        closeAboutWindow();
      }
    });

    // Close with Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape' && aboutWindow) {
        closeAboutWindow();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    header.addEventListener('mousedown', startDrag);
    header.addEventListener('touchstart', startDragTouch, { passive: false });

    function startDrag(e) {
      if (e.target.classList.contains('close-btn')) return;
      isDragging = true;
      const rect = aboutWindow.getBoundingClientRect();
      initialX = e.clientX - rect.left;
      initialY = e.clientY - rect.top;
      document.addEventListener('mousemove', dragMove);
      document.addEventListener('mouseup', dragEnd);
      e.preventDefault();
    }

    function startDragTouch(e) {
      if (e.target.classList.contains('close-btn')) return;
      e.preventDefault();
      isDragging = true;
      const rect = aboutWindow.getBoundingClientRect();
      const touch = e.touches[0];
      initialX = touch.clientX - rect.left;
      initialY = touch.clientY - rect.top;
      document.addEventListener('touchmove', dragMoveTouch, { passive: false });
      document.addEventListener('touchend', dragEndTouch);
    }
  }

  function dragMove(e) {
    if (isDragging && aboutWindow) {
      e.preventDefault();
      requestAnimationFrame(() => {
        if (!aboutWindow) return;
        
        let newX = e.clientX - initialX;
        let newY = e.clientY - initialY;
        
        // Constrain to viewport
        const windowRect = aboutWindow.getBoundingClientRect();
        const maxX = window.innerWidth - windowRect.width;
        const maxY = window.innerHeight - windowRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        aboutWindow.style.left = `${newX}px`;
        aboutWindow.style.top = `${newY}px`;
        aboutWindow.style.transform = 'none';
        aboutWindow.style.margin = '0';
      });
    }
  }

  function dragMoveTouch(e) {
    if (isDragging && aboutWindow) {
      e.preventDefault();
      const touch = e.touches[0];
      requestAnimationFrame(() => {
        if (!aboutWindow) return;
        
        let newX = touch.clientX - initialX;
        let newY = touch.clientY - initialY;
        
        // Constrain to viewport
        const windowRect = aboutWindow.getBoundingClientRect();
        const maxX = window.innerWidth - windowRect.width;
        const maxY = window.innerHeight - windowRect.height;
        
        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        aboutWindow.style.left = `${newX}px`;
        aboutWindow.style.top = `${newY}px`;
        aboutWindow.style.transform = 'none';
        aboutWindow.style.margin = '0';
      });
    }
  }

  function dragEnd() {
    isDragging = false;
    document.removeEventListener('mousemove', dragMove);
    document.removeEventListener('mouseup', dragEnd);
  }

  function dragEndTouch() {
    isDragging = false;
    document.removeEventListener('touchmove', dragMoveTouch);
    document.removeEventListener('touchend', dragEndTouch);
  }

  const aboutBtn = document.getElementById('aboutBtn');
  const hakuLink = document.getElementById('hakuLink');
  if (aboutBtn) aboutBtn.addEventListener('click', createAboutWindow);
  if (hakuLink) hakuLink.addEventListener('click', createAboutWindow);

  // Contact button functionality
  const contactBtn = document.getElementById('contactBtn');
  if (contactBtn) {
    contactBtn.addEventListener('click', () => {
      window.location.href = 'mailto:dhanrazx@proton.me';
    });
  }

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
});
