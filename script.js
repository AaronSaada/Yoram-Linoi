document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initEditorialCarousel();

  // Mairie
  initMairieSlideshow();
  initMairieTimer();

  // Houppa
  initHouppaSlideshow();
  initHouppaTimer();

  initRSVPForm();
  initScrollAnimations();

  // Musique de fond
  initBackgroundMusic();
  
  // Sélecteurs
  initCustomSelect();
});

/**
 * 1. Gestion de la Navigation & du Menu Mobile
 */
function initNavbar() {
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = navMenu.querySelectorAll('a');

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/**
 * 2. Décomptes intégrés aux cartes (Mairie à 14h00 & Houppa à 17h30)
 */
function initCountdown() {
  const targetMairie = new Date('2027-07-07T14:00:00+02:00').getTime();
  const targetHouppa = new Date('2027-07-07T17:30:00+02:00').getTime();

  const mairieEls = {
    days: document.getElementById('mairie-days'),
    hours: document.getElementById('mairie-hours'),
    minutes: document.getElementById('mairie-minutes'),
    seconds: document.getElementById('mairie-seconds'),
  };

  const houppaEls = {
    days: document.getElementById('houppa-days'),
    hours: document.getElementById('houppa-hours'),
    minutes: document.getElementById('houppa-minutes'),
    seconds: document.getElementById('houppa-seconds'),
  };

  function updateCardTimer(targetDate, elements) {
    if (!elements.days) return;

    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      elements.days.textContent = '00';
      elements.hours.textContent = '00';
      elements.minutes.textContent = '00';
      elements.seconds.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    elements.days.textContent = String(days).padStart(2, '0');
    elements.hours.textContent = String(hours).padStart(2, '0');
    elements.minutes.textContent = String(minutes).padStart(2, '0');
    elements.seconds.textContent = String(seconds).padStart(2, '0');
  }

  function tick() {
    updateCardTimer(targetMairie, mairieEls);
    updateCardTimer(targetHouppa, houppaEls);
  }

  tick();
  setInterval(tick, 1000);
}

/**
 * 3. Validation & Traitement du Formulaire RSVP
 */
function initRSVPForm() {
  const form = document.getElementById('rsvpForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');
  const attendingRadios = form.elements['attending'];
  const plusOneGroup = document.getElementById('plusOneGroup');
  const dietGroup = document.getElementById('dietGroup');

  Array.from(attendingRadios).forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const isAttending = e.target.value === 'yes';
      plusOneGroup.style.display = isAttending ? 'flex' : 'none';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.guestName.value.trim();
    const email = form.guestEmail.value.trim();
    const phone = form.guestPhone ? form.guestPhone.value.trim() : '';

    if (!name || !email || !phone) {
      statusEl.className = 'form-status error';
      statusEl.textContent =
        "Veuillez renseigner les champs requis marqués d'un astérisque.";
      return;
    }

    submitBtn.disabled = true;
    const initialText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Transmission en cours...';
    statusEl.textContent = '';

    const formData = {
      name: name,
      email: email,
      phone: phone,
      attending: form.attending.value,
      guestCount: form.guestCount ? form.guestCount.value : '0',
      message: form.guestMessage.value.trim(),
      timestamp: new Date().toISOString(),
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log('Données RSVP :', formData);

      statusEl.className = 'form-status success';
      statusEl.textContent =
        'Votre confirmation a bien été enregistrée. Merci pour votre délicatesse.';
      form.reset();

      plusOneGroup.style.display = 'flex';
      dietGroup.style.display = 'flex';
    } catch (err) {
      statusEl.className = 'form-status error';
      statusEl.textContent =
        "Une erreur est survenue lors de l'envoi. Veuillez réessayer ultérieurement.";
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = initialText;
    }
  });
}

/**
 * 4. Micro-interactions et Révélations au Défilement
 */
function initScrollAnimations() {
  const elementsToAnimate = document.querySelectorAll(
    '.event-card-single, .editorial-body, .card-countdown'
  );

  elementsToAnimate.forEach((el) => el.classList.add('reveal-init'));

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          obs.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px',
    }
  );

  elementsToAnimate.forEach((el) => observer.observe(el));
}

/**
 * Carrousel Infini avec glissement fluide (Inertie & Lerp)
 */
function initEditorialCarousel() {
  const carousel = document.getElementById('editorialCarousel');
  const track = document.getElementById('carouselTrack');
  if (!carousel || !track) return;

  const initialSlides = Array.from(track.children);
  if (initialSlides.length === 0) return;

  // Cloner deux fois le lot d'origine pour obtenir 3 jeux continus [Set A, Set B, Set C]
  initialSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));
  initialSlides.forEach(slide => track.appendChild(slide.cloneNode(true)));

  let singleSetWidth = 0;

  function updateSetWidth() {
    singleSetWidth = track.scrollWidth / 3;
  }

  updateSetWidth();
  window.addEventListener('resize', updateSetWidth);
  window.addEventListener('load', updateSetWidth);

  // Positionnement au centre (sur le deuxième jeu)
  let currentX = -singleSetWidth;
  let targetX = -singleSetWidth;

  // Variables de glissement & vitesse autonome
  let isDragging = false;
  let lastX = 0;
  let velocity = 0;

  // Vitesse de croisière automatique (~0.45 px par frame pour un mouvement discret)
  const autoSpeed = 0.45;

  // Optionnel : mettre à true pour suspendre le défilement au survol de la souris
  const pauseOnHover = false;
  let isHovered = false;

  if (pauseOnHover) {
    carousel.addEventListener('mouseenter', () => { isHovered = true; });
    carousel.addEventListener('mouseleave', () => { isHovered = false; });
  }

  // Événements Souris (Desktop)
  carousel.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    velocity = 0;
    carousel.classList.add('is-dragging');
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const delta = e.clientX - lastX;
    lastX = e.clientX;
    targetX += delta;
    velocity = delta;
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    carousel.classList.remove('is-dragging');
    // Relance douce d'inertie au relâchement
    targetX += velocity * 3.5;
  });

  // Événements Tactiles (Mobile)
  carousel.addEventListener('touchstart', (e) => {
    isDragging = true;
    lastX = e.touches[0].clientX;
    velocity = 0;
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || !e.touches[0]) return;
    const currentTouchX = e.touches[0].clientX;
    const delta = currentTouchX - lastX;
    lastX = currentTouchX;
    targetX += delta;
    velocity = delta;
  }, { passive: true });

  window.addEventListener('touchend', () => {
    if (!isDragging) return;
    isDragging = false;
    targetX += velocity * 3.5;
  });

  // Gestion du Trackpad (Swipe horizontal à 2 doigts / Shift + Molette)
  carousel.addEventListener('wheel', (e) => {
    const isHorizontalSwipe = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    const isShiftScroll = e.shiftKey && e.deltaY !== 0;

    if (isHorizontalSwipe || isShiftScroll) {
      e.preventDefault();
      const delta = isHorizontalSwipe ? e.deltaX : e.deltaY;
      targetX -= delta * 1.1;
      velocity = -delta * 0.35;
    }
  }, { passive: false });

  // Boucle d'animation fluide
  function animate() {
    if (singleSetWidth > 0) {
      if (!isDragging) {
        // Avance automatique continue si l'utilisateur ne manipule pas la piste
        if (!pauseOnHover || !isHovered) {
          targetX -= autoSpeed;
        }

        // Amortissement de la vélocité après un geste utilisateur (swipe ou drag)
        if (Math.abs(velocity) > 0.05) {
          velocity *= 0.92;
          targetX += velocity;
        }
      }

      // Interpolation linéaire feutrée (Lerp)
      currentX += (targetX - currentX) * 0.08;

      // Boucle infinie invisible : recentrage instantané
      if (currentX > -0.2 * singleSetWidth) {
        currentX -= singleSetWidth;
        targetX -= singleSetWidth;
      } else if (currentX < -1.8 * singleSetWidth) {
        currentX += singleSetWidth;
        targetX += singleSetWidth;
      }

      track.style.transform = `translate3d(${currentX.toFixed(2)}px, 0, 0)`;
    }

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}

/**
 * Diaporama Mairie avec transition douce et animation de zoom
 */
function initMairieSlideshow() {
  const slideshow = document.getElementById('mairieSlideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.ceremony-slide');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const slideDuration = 4500;

  setInterval(() => {
    slides[currentIndex].classList.remove('is-active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('is-active');
  }, slideDuration);
}

/**
 * Compte à rebours Mairie fiabilisé
 */
function initMairieTimer() {
  const daysEl = document.getElementById('timer-days');
  const hoursEl = document.getElementById('timer-hours');
  const minEl = document.getElementById('timer-minutes');
  const secEl = document.getElementById('timer-seconds');

  if (!daysEl || !hoursEl || !minEl || !secEl) return;

  const targetDate = new Date(2027, 5, 30, 14, 30, 0).getTime();

  function updateTimer() {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minEl.textContent = '00';
      secEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minEl.textContent = String(minutes).padStart(2, '0');
    secEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/**
 * Diaporama Houppa (Cycle 4500ms, zoom linéaire et fondu flou)
 */
function initHouppaSlideshow() {
  const slideshow = document.getElementById('houppaSlideshow');
  if (!slideshow) return;

  const slides = slideshow.querySelectorAll('.ceremony-slide');
  if (slides.length <= 1) return;

  let currentIndex = 0;
  const slideDuration = 4500;

  setInterval(() => {
    slides[currentIndex].classList.remove('is-active');
    currentIndex = (currentIndex + 1) % slides.length;
    slides[currentIndex].classList.add('is-active');
  }, slideDuration);
}

/**
 * Compte à rebours Houppa
 */
function initHouppaTimer() {
  const daysEl = document.getElementById('houppa-timer-days');
  const hoursEl = document.getElementById('houppa-timer-hours');
  const minEl = document.getElementById('houppa-timer-minutes');
  const secEl = document.getElementById('houppa-timer-seconds');

  if (!daysEl || !hoursEl || !minEl || !secEl) return;

  const targetDate = new Date(2027, 6, 7, 18, 30, 0).getTime();

  function updateTimer() {
    const now = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minEl.textContent = '00';
      secEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minEl.textContent = String(minutes).padStart(2, '0');
    secEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
}

/**
 * Gestion de la musique de fond & du bouton flottant
 */
function initBackgroundMusic() {
  const music = document.getElementById('bgMusic');
  const toggleBtn = document.getElementById('audioToggle');
  const label = document.getElementById('audioLabel');

  if (!music || !toggleBtn || !label) return;

  music.volume = 0.35;

  function setPlayingState() {
    toggleBtn.classList.remove('is-muted');
    label.textContent = 'COUPER LA MUSIQUE';
  }

  function setMutedState() {
    toggleBtn.classList.add('is-muted');
    label.textContent = 'ACTIVER LA MUSIQUE';
  }

  // 1. Tentative de lecture immédiate
  music
    .play()
    .then(setPlayingState)
    .catch(() => {
      // Autoplay bloqué : activation au tout premier contact
      setMutedState();

      function unlockAudio() {
        music
          .play()
          .then(() => {
            setPlayingState();
          })
          .catch(() => {});

        document.removeEventListener('pointerdown', unlockAudio);
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('click', unlockAudio);
      }

      document.addEventListener('pointerdown', unlockAudio, { once: true });
      document.addEventListener('touchstart', unlockAudio, { once: true });
      document.addEventListener('click', unlockAudio, { once: true });
    });

  // 2. Clic manuel sur le bouton flottant
  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    if (music.paused) {
      music.play();
      setPlayingState();
    } else {
      music.pause();
      setMutedState();
    }
  });
}

/**
 * Initialisation du Select Haute Couture
 */
function initCustomSelect() {
  const wrapper = document.querySelector('.select-wrapper');
  if (!wrapper) return;

  const select = wrapper.querySelector('select');
  if (!select) return;

  wrapper.classList.add('custom-select');

  // 1. Création du bouton visible
  const trigger = document.createElement('div');
  trigger.className = 'custom-select-trigger';
  trigger.innerHTML = `
    <span class="custom-select-value">${select.options[select.selectedIndex]?.text || ''}</span>
    <span class="custom-select-arrow" aria-hidden="true"></span>
  `;
  wrapper.appendChild(trigger);

  // 2. Création de la liste personnalisée
  const menu = document.createElement('ul');
  menu.className = 'custom-select-menu';

  Array.from(select.options).forEach((opt, idx) => {
    const li = document.createElement('li');
    li.className = 'custom-select-option';
    li.textContent = opt.text;
    li.dataset.value = opt.value;
    if (idx === select.selectedIndex) li.classList.add('is-selected');

    li.addEventListener('click', () => {
      select.value = opt.value;
      select.dispatchEvent(new Event('change')); // Maintient les écouteurs natifs
      trigger.querySelector('.custom-select-value').textContent = opt.text;

      menu.querySelectorAll('.custom-select-option').forEach(el => el.classList.remove('is-selected'));
      li.classList.add('is-selected');

      wrapper.classList.remove('is-open');
    });

    menu.appendChild(li);
  });

  wrapper.appendChild(menu);

  // 3. Ouverture / Fermeture au clic
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    wrapper.classList.toggle('is-open');
  });

  // Fermeture si on clique ailleurs sur la page
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      wrapper.classList.remove('is-open');
    }
  });
}