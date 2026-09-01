// === MENU MOBILE ===
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    mobileMenu.classList.toggle('open');
  });
  // Fermer le menu quand on clique un lien
  mobileMenu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });
}

function closeMobileMenu() {
  if (mobileMenu) mobileMenu.classList.remove('open');
}

// Fermer au clic à l'extérieur
document.addEventListener('click', (e) => {
  if (mobileMenu && mobileMenu.classList.contains('open') &&
      !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    mobileMenu.classList.remove('open');
  }
});

// === OMBRE DE LA NAVBAR AU DÉFILEMENT ===
const navbar = document.querySelector('.navbar');
if (navbar) {
  const onScroll = () => {
    navbar.style.boxShadow = window.scrollY > 20
      ? '0 4px 20px rgba(26,26,26,.07)'
      : 'none';
  };
  window.addEventListener('scroll', onScroll);
  onScroll();
}

// === DÉFILEMENT DOUX POUR LES ANCRES INTERNES ===
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href');
    if (id.length < 2) return;
    const target = document.querySelector(id);
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      closeMobileMenu();
    }
  });
});

// === FORMULAIRE DE CONTACT ===
// Le payload est synchronisé avec le workflow n8n "CKFD - Capture lead landing page avec IA"
// (id FGPfYR2SYdifxJRF). Toute modification des clés ci-dessous doit être répercutée
// dans les nœuds Sheets / OpenAI / Gmail de ce workflow, sinon les champs arrivent vides.
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('submitBtn');
  const formMessage = document.getElementById('formMessage');
  const WEBHOOK_URL = 'https://n8n.srv1380598.hstgr.cloud/webhook/lead-form';

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validation basique
    const prenom = document.getElementById('prenom').value.trim();
    const nom = document.getElementById('nom').value.trim();
    const email = document.getElementById('email').value.trim();
    const telephone = document.getElementById('telephone').value.trim();
    const metier = document.getElementById('metier').value.trim();
    const sujet = document.getElementById('sujet').value;
    const message = document.getElementById('message').value.trim();
    const consent = document.getElementById('consent').checked;

    if (!prenom || !nom || !email || !telephone || !metier || !sujet || !message) {
      showMessage('error', 'Veuillez remplir tous les champs obligatoires (*).');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('error', 'Veuillez entrer une adresse email valide.');
      return;
    }

    if (!isValidPhone(telephone)) {
      showMessage('error', 'Veuillez entrer un numéro de téléphone valide (ex. 06 12 34 56 78).');
      return;
    }

    if (!consent) {
      showMessage('error', 'Veuillez accepter la politique de confidentialité pour envoyer votre message.');
      return;
    }

    // État de chargement
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    hideMessage();

    const CONSENT_TEXT = "J'accepte que mes données soient utilisées par CKFD Solution pour traiter ma demande, conformément à la politique de confidentialité.";

    const payload = {
      prenom,
      nom,
      metier,
      entreprise: document.getElementById('entreprise').value.trim(),
      email,
      telephone,
      sujet,
      message,
      consentement: true,
      consentement_texte: CONSENT_TEXT,
      consentement_date: new Date().toISOString(),
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
      submitBtn.textContent = 'Envoyer le message';
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

  // Accepte 06 12 34 56 78, 0612345678, +33 6 12 34 56 78, (0)6...
  function isValidPhone(tel) {
    const digits = tel.replace(/[^0-9]/g, '');
    return /^[+0-9][0-9\s.\-()]{6,}$/.test(tel) && digits.length >= 9 && digits.length <= 15;
  }
}

// === ANIMATION D'APPARITION AU DÉFILEMENT ===
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.transitionDelay = `${(i % 4) * 0.06}s`;
        entry.target.classList.add('in');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('in'));
}
