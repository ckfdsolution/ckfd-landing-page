// === MOBILE MENU ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// Close on outside click
document.addEventListener('click', (e) => {
  if (mobileMenu && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// === NAVBAR SCROLL EFFECT ===
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.style.background = 'rgba(8, 12, 16, 0.97)';
    } else {
      navbar.style.background = 'rgba(8, 12, 16, 0.85)';
    }
  });
}

// === SMOOTH SCROLL FOR ANCHOR LINKS ===
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    }
  });
});

// === CONTACT FORM ===
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const WEBHOOK_URL = 'https://n8n.srv1380598.hstgr.cloud/webhook/lead-form';

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Basic validation
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const sujet = document.getElementById('sujet').value;
    const message = document.getElementById('message').value.trim();

    if (!nom || !email || !sujet || !message) {
      showMessage('error', 'Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('error', 'Veuillez entrer une adresse email valide.');
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'envoi en cours...';
    hideMessage();

    const payload = {
      nom,
      email,
      entreprise: document.getElementById('entreprise').value.trim(),
      telephone: document.getElementById('telephone').value.trim(),
      sujet,
      message,
      source: 'landing-page',
      date: new Date().toISOString(),
    };

    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok || res.status === 200) {
        showMessage('success', '✅ Message envoyé ! Nous vous répondons sous 24h ouvrées.');
        contactForm.reset();
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      showMessage('error', 'Une erreur est survenue. Réessayez ou contactez-nous directement par email.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'envoyer le message';
    }
  });

  function showMessage(type, text) {
    formMessage.className = `form-message ${type}`;
    formMessage.textContent = text;
    formMessage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideMessage() {
    formMessage.className = 'form-message';
    formMessage.textContent = '';
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}

// === SCROLL REVEAL ANIMATION ===
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px',
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

// Apply to cards and step items
document.querySelectorAll('.service-card, .usecase-card, .step-item, .value-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
  observer.observe(el);
});
