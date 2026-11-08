document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initCountdown();
  initRSVPForm();
  initScrollAnimations();
});

/**
 * 1. Gestion de la Navigation & du Menu Mobile
 */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = navMenu.querySelectorAll('a');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });

  navToggle.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('active');
    navToggle.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      navToggle.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

/**
 * 2. Compte à Rebours Dynamique (07 Juillet 2027)
 */
function initCountdown() {
  const targetDate = new Date('2027-07-07T15:30:00+02:00').getTime();

  const daysEl = document.getElementById('days');
  const hoursEl = document.getElementById('hours');
  const minutesEl = document.getElementById('minutes');
  const secondsEl = document.getElementById('seconds');

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    if (distance <= 0) {
      daysEl.textContent = '00';
      hoursEl.textContent = '00';
      minutesEl.textContent = '00';
      secondsEl.textContent = '00';
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
  }

  updateTimer();
  setInterval(updateTimer, 1000);
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

  Array.from(attendingRadios).forEach(radio => {
    radio.addEventListener('change', (e) => {
      const isAttending = e.target.value === 'yes';
      plusOneGroup.style.display = isAttending ? 'flex' : 'none';
      dietGroup.style.display = isAttending ? 'flex' : 'none';
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.guestName.value.trim();
    const email = form.guestEmail.value.trim();

    if (!name || !email) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Veuillez renseigner les champs requis marqués d\'un astérisque.';
      return;
    }

    submitBtn.disabled = true;
    const initialText = submitBtn.querySelector('span').textContent;
    submitBtn.querySelector('span').textContent = 'Transmission en cours...';
    statusEl.textContent = '';

    const formData = {
      name: name,
      email: email,
      attending: form.attending.value,
      guestCount: form.guestCount ? form.guestCount.value : '0',
      diet: form.dietRestrictions.value.trim(),
      message: form.guestMessage.value.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      console.log('Données RSVP :', formData);

      statusEl.className = 'form-status success';
      statusEl.textContent = 'Votre confirmation a bien été enregistrée. Merci pour votre délicatesse.';
      form.reset();

      plusOneGroup.style.display = 'flex';
      dietGroup.style.display = 'flex';
    } catch (err) {
      statusEl.className = 'form-status error';
      statusEl.textContent = 'Une erreur est survenue lors de l\'envoi. Veuillez réessayer ultérieurement.';
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
    '.timeline-entry, .place-card, .editorial-body, .countdown-grid'
  );

  elementsToAnimate.forEach(el => el.classList.add('reveal-init'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-active');
        obs.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  elementsToAnimate.forEach(el => observer.observe(el));
}