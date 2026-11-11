document.documentElement.classList.add('js');

// MENU HAMBURGER MOBILE
document.addEventListener('DOMContentLoaded', () => {
  const burger      = document.querySelector('.nav-burger');
  const mobileMenu  = document.getElementById('mobile-menu');
  const overlay     = document.querySelector('.mobile-menu-overlay');
  const closeBtn    = document.querySelector('.mobile-menu-close');
  const mobileLinks = document.querySelectorAll('.mobile-menu a');

  function openMenu() {
    burger.classList.add('is-open');
    mobileMenu.classList.add('is-open');
    overlay.style.display = 'block';
    requestAnimationFrame(() => overlay.classList.add('is-open'));
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    burger.classList.remove('is-open');
    mobileMenu.classList.remove('is-open');
    overlay.classList.remove('is-open');
    overlay.addEventListener('transitionend', () => { overlay.style.display = ''; }, { once: true });
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('is-open') ? closeMenu() : openMenu();
  });
  closeBtn.addEventListener('click', closeMenu);
  overlay.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && burger.classList.contains('is-open')) closeMenu(); });
});

// FORMULAIRE DE CONTACT (EmailJS) ───────────────────────────────────────────
// Tant que les 3 clés sont vides, le formulaire ouvre la messagerie du visiteur
// avec le message déjà rédigé (rien ne se perd).
(function () {
  const EMAILJS_PUBLIC_KEY  = '';
  const EMAILJS_SERVICE_ID  = '';
  const EMAILJS_TEMPLATE_ID = '';

  const form     = document.getElementById('contact-form');
  if (!form) return;

  const emailjsReady = EMAILJS_PUBLIC_KEY && EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && window.emailjs;
  if (emailjsReady) emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });

  const btn      = form.querySelector('.form-submit-btn');
  const label    = form.querySelector('.form-submit-label');
  const feedback = document.getElementById('form-feedback');

  function setFeedback(msg, type) {
    feedback.textContent = msg;
    feedback.className   = 'form-feedback form-feedback--' + type;
    feedback.hidden      = false;
  }

  function setLoading(on) {
    btn.disabled = on;
    label.textContent = on ? 'Envoi en cours...' : 'Envoyer ma demande';
  }

  form.querySelectorAll('[required]').forEach(f => f.addEventListener('input', () => f.removeAttribute('aria-invalid')));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.querySelector('.hp').value) return; // piège à robots

    const name    = form.querySelector('#name').value.trim();
    const email   = form.querySelector('#email').value.trim();
    const phone   = form.querySelector('#phone').value.trim();
    const commune = form.querySelector('#commune').value.trim();
    const message = form.querySelector('#message').value.trim();
    const demande = form.querySelector('input[name="demande"]:checked').value;

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    form.querySelector('#name').setAttribute('aria-invalid', String(!name));
    form.querySelector('#email').setAttribute('aria-invalid', String(!emailOk));
    form.querySelector('#message').setAttribute('aria-invalid', String(!message));

    if (!name || !message) {
      setFeedback('Merci d\'indiquer votre nom, votre adresse e-mail et votre projet (cases en rouge).', 'err');
      form.querySelector('[aria-invalid="true"]').focus();
      return;
    }
    if (!emailOk) {
      setFeedback('L\'adresse e-mail ne semble pas correcte. Exemple : jean.dupont@gmail.com', 'err');
      form.querySelector('#email').focus();
      return;
    }

    /* Pas encore de clés EmailJS : on passe par la messagerie du visiteur */
    if (!emailjsReady) {
      const corps = `${message}\n\n---\nNom : ${name}\nTéléphone : ${phone || '-'}\nCommune du chantier : ${commune || '-'}\nE-mail : ${email}`;
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Site MT2M : ' + demande)}&body=${encodeURIComponent(corps)}`;
      setFeedback('Votre messagerie va s\'ouvrir avec votre message déjà rédigé : il ne reste plus qu\'à cliquer sur « Envoyer ».', 'ok');
      return;
    }

    setLoading(true);
    feedback.hidden = true;

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        demande: demande,
        name: name,
        email: email,
        phone: phone,
        commune: commune,
        message: message,
      });

      form.reset();
      setFeedback('Merci, votre demande est bien envoyée. Florent Martin vous répondra rapidement.', 'ok');

    } catch (_) {
      setFeedback(`L'envoi n'a pas fonctionné. Réessayez, ou appelez directement le ${CONTACT.telephone}.`, 'err');
    } finally {
      setLoading(false);
    }
  });
})();

// NAV (SECTION ACTIVE)
(function () {
  const navLinks = Array.from(document.querySelectorAll('.nav a'));
  if (!navLinks.length || !('IntersectionObserver' in window)) return;

  const sections = navLinks
    .map(link => document.getElementById(link.getAttribute('data-section')))
    .filter(Boolean);

  function setActive(id) {
    navLinks.forEach(link => {
      link.classList.toggle('is-active', link.getAttribute('data-section') === id);
    });
  }

  const sectionObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(section => sectionObs.observe(section));
  sectionObs.observe(document.getElementById('accueil'));
})();

// SCROLL PROGRESS (MOBILE) ──────────────────────────────────────────────────
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;

  let ticking = false;

  function updateProgress() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? window.scrollY / scrollable : 0;
    bar.style.width = (ratio * 100) + '%';
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(updateProgress);
    }
  }, { passive: true });

  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
})();


// VISIONNEUSE PHOTO ─────────────────────────────────────────────────────────
const Lightbox = (function () {
  const box     = document.getElementById('lightbox');
  const img     = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  const count   = document.getElementById('lightbox-count');
  const prev    = box.querySelector('[data-lb-prev]');
  const next    = box.querySelector('[data-lb-next]');
  let items = [], index = 0, lastFocus = null;

  function show(i) {
    if (i < 0 || i >= items.length) return;
    index = i;
    img.src             = items[i].src;
    img.alt             = items[i].caption || '';
    caption.textContent = items[i].caption || '';
    count.textContent   = items.length > 1 ? `Photo ${i + 1} sur ${items.length}` : '';
    prev.style.visibility = i > 0 ? 'visible' : 'hidden';
    next.style.visibility = i < items.length - 1 ? 'visible' : 'hidden';
  }

  function close() {
    box.classList.remove('open');
    if (lastFocus) lastFocus.focus();
  }

  box.querySelector('[data-lb-close]').addEventListener('click', close);
  prev.addEventListener('click', () => show(index - 1));
  next.addEventListener('click', () => show(index + 1));
  box.addEventListener('click', e => { if (e.target === box || e.target.classList.contains('lightbox-img')) close(); });

  document.addEventListener('keydown', e => {
    if (!box.classList.contains('open')) return;
    if (e.key === 'Escape')     { e.stopImmediatePropagation(); close(); }
    if (e.key === 'ArrowLeft')  show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  }, true);

  return {
    open(list, i) {
      items = list;
      lastFocus = document.activeElement;
      show(i || 0);
      box.classList.add('open');
      box.querySelector('[data-lb-close]').focus();
    }
  };
})();

document.addEventListener('click', e => {
  const target = e.target.closest('img[data-zoom]');
  if (!target) return;
  const group = Array.from(document.querySelectorAll(`img[data-zoom="${target.dataset.zoom}"]`));
  Lightbox.open(group.map(im => ({ src: im.currentSrc || im.src, caption: im.dataset.legende || im.alt })), group.indexOf(target));
});

// LE FIL DU CHANTIER (Avant / Pendant / Après) ──────────────────────────────
const ETAPES = { avant: 'Avant', pendant: 'Pendant', apres: 'Après' };

function filHtml(etapes, titre) {
  const n = etapes.length;
  return `
  <div class="fil${n > 4 ? ' fil--long' : ''}" data-fil style="--n:${n}">
    <div class="fil-scene">
      <span class="fil-badge" data-etape="${etapes[0].etape}">${ETAPES[etapes[0].etape] || ''}</span>
      ${etapes.map((e, i) => `<img class="fil-img${i === 0 ? ' is-active' : ''}" src="${e.image}" alt="${titre} : ${e.legende}" data-etape="${e.etape}" data-legende="${e.legende}" loading="lazy" decoding="async">`).join('')}
      <button class="fil-zoom" type="button">Agrandir la photo</button>
    </div>
    <p class="fil-caption" aria-live="polite">${etapes[0].legende}</p>
    <ol class="fil-steps">
      ${etapes.map((e, i) => `
      <li class="fil-step${i === 0 ? ' is-active' : ''}">
        <button type="button" aria-pressed="${i === 0}">
          <span class="fil-step-num"><span class="fil-step-word">Étape </span>${i + 1}</span>
          <span class="fil-step-name">${ETAPES[e.etape] || ''}</span>
        </button>
      </li>`).join('')}
    </ol>
    <div class="fil-rule" aria-hidden="true"><span class="fil-rule-fill"></span><span class="fil-cursor"></span></div>
  </div>`;
}

function initFil(fil) {
  const imgs    = Array.from(fil.querySelectorAll('.fil-img'));
  const steps   = Array.from(fil.querySelectorAll('.fil-step'));
  const badge   = fil.querySelector('.fil-badge');
  const caption = fil.querySelector('.fil-caption');
  const cursor  = fil.querySelector('.fil-cursor');
  const fill    = fil.querySelector('.fil-rule-fill');
  const n = imgs.length;
  let current = 0;

  function show(i) {
    if (i < 0 || i >= n) return;
    current = i;
    const pos = ((i + .5) / n * 100) + '%';
    imgs.forEach((im, k) => im.classList.toggle('is-active', k === i));
    steps.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.querySelector('button').setAttribute('aria-pressed', String(k === i));
    });
    badge.dataset.etape   = imgs[i].dataset.etape;
    badge.textContent     = ETAPES[imgs[i].dataset.etape] || '';
    caption.textContent   = imgs[i].dataset.legende;
    cursor.style.left     = pos;
    fill.style.width      = pos;
  }

  steps.forEach((s, k) => s.querySelector('button').addEventListener('click', () => show(k)));

  const zoom = () => Lightbox.open(imgs.map(im => ({
    src: im.src, caption: `${ETAPES[im.dataset.etape] || ''} · ${im.dataset.legende}`
  })), current);
  fil.querySelector('.fil-zoom').addEventListener('click', zoom);
  imgs.forEach(im => im.addEventListener('click', zoom));

  /* balayage au doigt */
  const scene = fil.querySelector('.fil-scene');
  let x0 = null;
  scene.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  scene.addEventListener('touchend', e => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });

  show(0);
}

/* ═══════════════════════════════════════════════════════════
   CHARGEMENT CONTENU -> fichiers JSON (CMS Sveltia)
═══════════════════════════════════════════════════════════ */

function el(id) { return document.getElementById(id); }

function pad2(n) { return String(n).padStart(2, '0'); }

function bodyToHtml(body) {
  return body.split('\n\n').map(para => `<p>${para.replace(/\n/g, '<br>')}</p>`).join('');
}

function telHref(tel) { return 'tel:+33' + tel.replace(/\s/g, '').replace(/^0/, ''); }

/* Coordonnées par défaut */
const CONTACT = { telephone: '06 84 78 99 84', email: 'mt2m.flo@gmail.com' };

/* Pictos domaines (même dessins du logo) */
const ICONES = {
  fenetre:     '<path d="M5 21V10a7 7 0 0 1 14 0v11z"/><path d="M12 3v18M5 13h14"/>',
  porte:       '<path d="M6 21V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v16"/><path d="M9 7h6v5H9zM9 15h6v3H9zM4 21h16"/>',
  boiserie:    '<path d="M3 8h18M3 20h18"/><rect x="5" y="10.5" width="6" height="7" rx=".5"/><rect x="13" y="10.5" width="6" height="7" rx=".5"/>',
  parquet:     '<path d="M3 6h18M3 10h18M3 14h18M3 18h18M8 6v4M15 10v4M6 14v4M17 6v4M11 14v4M14 18v3"/>',
  ebenisterie: '<path d="M7 3h10M6 21h12M9 3v2c0 2-3 2.5-3 5s3 3 3 5v6M15 3v2c0 2 3 2.5 3 5s-3 3-3 5v6"/>'
};

function renderContact(c) {
  Object.assign(CONTACT, c);
  document.querySelectorAll('[data-tel]').forEach(a => {
    a.href = telHref(c.telephone);
    a.textContent = (a.getAttribute('data-tel') || '') + c.telephone;
  });
  document.querySelectorAll('[data-tel-dock]').forEach(a => { a.href = telHref(c.telephone); });
  document.querySelectorAll('[data-mail]').forEach(a => { a.href = 'mailto:' + c.email; a.textContent = c.email; });
  if (el('contact-gerant'))  el('contact-gerant').textContent  = c.gerant;
  if (el('contact-adresse')) el('contact-adresse').innerHTML   = `MT2M<br>${c.adresse}<br>${c.ville}`;
  if (el('contact-zone'))    el('contact-zone').textContent    = c.zone;
  if (el('footer-adresse'))  el('footer-adresse').textContent  = `${c.adresse}, ${c.ville}`;
}

function renderAccueil(d, chantiers) {
  const h = d.hero;
  if (el('hero-label'))         el('hero-label').textContent         = h.label;
  if (el('hero-h1'))            el('hero-h1').innerHTML              = `${h.h1} <em>${h.h1_italique}</em>`;
  if (el('hero-lead'))          el('hero-lead').textContent          = h.lead;
  if (el('hero-cta-primary'))   el('hero-cta-primary').textContent   = h.cta_primary;
  if (el('hero-cta-secondary')) el('hero-cta-secondary').textContent = h.cta_secondary;
  if (el('hero-tag'))           el('hero-tag').innerHTML             = `<span class="tag-num">${h.etiquette_titre}</span><strong>${h.etiquette_lieu}</strong>`;
  if (el('hero-image') && !el('hero-image').src.endsWith(h.image)) el('hero-image').src = h.image;
  if (el('hero-image'))         el('hero-image').alt                 = h.image_alt;

  if (el('domaines-items')) {
    el('domaines-items').innerHTML = d.domaines.map(dom => `
      <li><svg viewBox="0 0 24 24" aria-hidden="true">${ICONES[dom.icone] || ICONES.boiserie}</svg>${dom.nom}</li>`
    ).join('');
  }

  const v = d.vitrine;
  if (el('vitrine-label')) el('vitrine-label').textContent = v.label;
  if (el('vitrine-h2'))    el('vitrine-h2').textContent    = v.h2;
  if (el('vitrine-lead'))  el('vitrine-lead').textContent  = v.lead;
  if (el('vitrine-lien'))  el('vitrine-lien').href         = '#chantier/' + v.chantier;

  const c = chantiers.find(x => x.id === v.chantier);
  const o = c && c.ouvrages[(v.ouvrage || 1) - 1];
  if (o && el('vitrine-fil')) {
    el('vitrine-fil').innerHTML = filHtml(o.etapes, o.titre);
    initFil(el('vitrine-fil').querySelector('[data-fil]'));
  }
}

function renderSavoirFaire(d) {
  if (el('sf-label')) el('sf-label').textContent = d.label;
  if (el('sf-h2'))    el('sf-h2').textContent    = d.h2;
  if (el('sf-lead'))  el('sf-lead').textContent  = d.lead;

  if (el('sf-items')) {
    el('sf-items').innerHTML = d.items.map(s => `
      <article class="savoir">
        <div class="arch">${s.image
          ? `<img src="${s.image}" alt="${s.legende}" data-legende="${s.legende}" data-zoom="savoir-faire" loading="lazy">`
          : '<span class="savoir-attente">Photo à venir</span>'}</div>
        <h3>${s.titre}</h3>
        <p>${s.texte}</p>
        <ul class="points">${s.points.map(p => `<li>${p}</li>`).join('')}</ul>
      </article>`
    ).join('');
  }
}

function renderChantiers(d) {
  if (el('real-label')) el('real-label').textContent = d.label;
  if (el('real-h2'))    el('real-h2').textContent    = d.h2;
  if (el('real-lead'))  el('real-lead').textContent  = d.lead;

  if (el('real-items')) {
    el('real-items').innerHTML = d.chantiers.map((c, i) => `
      <a class="chantier" href="#chantier/${c.id}" id="carte-${c.id}">
        <div class="chantier-photo">
          <div class="arch"><img src="${c.couverture}" alt="${c.titre}" loading="lazy"></div>
          <span class="tag"><span class="tag-body">
            <span class="tag-num">Chantier n° ${pad2(i + 1)}</span>
            <strong>${c.titre}</strong>
            <small>${c.commune || c.lieu}</small>
          </span></span>
        </div>
        <p>${c.resume}</p>
        <span class="link-arrow">Voir le chantier</span>
      </a>`
    ).join('');
  }
}

function renderAtelier(d) {
  if (el('atelier-label')) el('atelier-label').textContent = d.label;
  if (el('atelier-h2'))    el('atelier-h2').textContent    = d.h2;

  const p = d.presentation;
  if (el('atelier-copy'))    el('atelier-copy').innerHTML      = p.paragraphes.map(t => `<p>${t}</p>`).join('');
  if (el('atelier-image'))   { el('atelier-image').src = p.image; el('atelier-image').alt = p.legende; el('atelier-image').dataset.legende = p.legende; }
  if (el('atelier-legende')) el('atelier-legende').textContent = p.legende;

  const pa = d.parcours;
  if (el('parcours-label')) el('parcours-label').textContent = pa.label;
  if (el('parcours-h3'))    el('parcours-h3').textContent    = pa.h3;
  if (el('parcours-items')) {
    el('parcours-items').innerHTML = pa.etapes.map(e => {
      const texte = e.lien_texte && e.lien_url
        ? e.texte.replace(e.lien_texte, `<a href="${e.lien_url}" target="_blank" rel="noopener">${e.lien_texte}</a>`)
        : e.texte;
      return `<li><h4>${e.titre}</h4><p>${texte}</p></li>`;
    }).join('');
  }

  const t = d.techniques;
  if (el('techniques-label')) el('techniques-label').textContent = t.label;
  if (el('techniques-items')) {
    el('techniques-items').innerHTML = t.items.map(item => `
      <article class="technique">
        <div class="arch"><img src="${item.image}" alt="${item.titre}" data-legende="${item.titre}" data-zoom="techniques" loading="lazy"></div>
        <h3>${item.titre}</h3>
        <p>${item.texte}</p>
      </article>`
    ).join('');
  }

  const pr = d.principes;
  if (el('principes-citation')) el('principes-citation').textContent = pr.citation;
  if (el('principes-items')) {
    el('principes-items').innerHTML = pr.items.map(item => `
      <div class="principe"><h3>${item.titre}</h3><p>${item.texte}</p></div>`
    ).join('');
  }
}

function renderLegal(d) {
  if (el('legal-title')) el('legal-title').textContent = d.title;
  if (el('legal-sections')) {
    el('legal-sections').innerHTML = d.sections.map((s, i) => {
      const extra = i === 0 ? `<p>E-mail : <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>` : '';
      return `<div class="legal-section"><h3>${s.heading}</h3>${bodyToHtml(s.body)}${extra}</div>`;
    }).join('');
  }
}

function renderPrivacy(d) {
  if (el('privacy-title')) el('privacy-title').textContent = d.title;
  if (el('privacy-sections')) {
    el('privacy-sections').innerHTML = d.sections.map((s, i) => {
      const extra = i === 0
        ? `<p>E-mail : <a href="mailto:${CONTACT.email}">${CONTACT.email}</a></p>`
        : (i === d.sections.length - 1 ? `<p>Pour exercer ces droits, écrivez à <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.</p>` : '');
      return `<div class="legal-section"><h3>${s.heading}</h3>${bodyToHtml(s.body)}${extra}</div>`;
    }).join('');
  }
}

/* ═══════════════════════════════════════════════════════════
   FICHE CHANTIER : #chantier (shared links)
═══════════════════════════════════════════════════════════ */

let CHANTIERS = [];
let carteRetour = null;

function renderFiche(c, i) {
  const suivant = CHANTIERS[(i + 1) % CHANTIERS.length];

  const ouvrages = c.ouvrages.filter(o => o.etapes && o.etapes.length).map((o, k, all) => `
    <section class="ouvrage">
      <div class="ouvrage-head">
        <div class="label">${all.length > 1 ? `Ouvrage ${k + 1} sur ${all.length}` : 'L\'ouvrage'}</div>
        <h3>${o.titre}</h3>
        ${o.texte ? `<p class="intro">${o.texte}</p>` : ''}
      </div>
      ${filHtml(o.etapes, o.titre)}
    </section>`).join('');

  const galerie = c.galerie && c.galerie.length ? `
    <section class="ouvrage">
      <div class="ouvrage-head"><div class="label">En images</div><h3>Autres photos du chantier</h3></div>
      <div class="galerie">${c.galerie.map(g => `<img src="${g.image}" alt="${g.legende}" data-legende="${g.legende}" data-zoom="galerie" loading="lazy">`).join('')}</div>
    </section>` : '';

  el('fiche-bar-titre').textContent = c.titre;
  el('fiche-contenu').innerHTML = `
    <div class="container">
      <header class="fiche-head">
        <div>
          <div class="label">Chantier n° ${pad2(i + 1)}</div>
          <h2 id="fiche-titre">${c.titre}</h2>
          <p class="intro">${c.resume}</p>
        </div>
        <div class="fiche-infos">
          <dl>
            ${c.lieu ? `<div><dt>Lieu</dt><dd>${c.lieu}</dd></div>` : ''}
            ${c.commune ? `<div><dt>Commune</dt><dd>${c.commune}</dd></div>` : ''}
            ${c.architecte ? `<div><dt>Architecte de l'édifice</dt><dd>${c.architecte}</dd></div>` : ''}
            ${c.ouvrages.length > 1 ? `<div><dt>Ouvrages présentés</dt><dd>${c.ouvrages.length}</dd></div>` : ''}
          </dl>
        </div>
      </header>

      <figure class="fiche-cover"><img src="${c.couverture}" alt="${c.titre}" data-legende="${c.titre}" data-zoom="couverture"></figure>

      ${c.contexte || c.travaux.length ? `
      <div class="fiche-context">
        <div>${c.contexte ? `<div class="label">Le contexte</div><p class="intro">${c.contexte}</p>` : ''}</div>
        <div>${c.travaux.length ? `<div class="label">Travaux réalisés</div><ul class="travaux">${c.travaux.map(t => `<li>${t}</li>`).join('')}</ul>` : ''}</div>
      </div>` : ''}

      ${ouvrages}
      ${galerie}

      <nav class="fiche-suite" aria-label="Suite de la visite">
        <button class="btn" type="button" onclick="fermerFiche()">← Toutes les réalisations</button>
        ${CHANTIERS.length > 1 ? `<a class="btn primary" href="#chantier/${suivant.id}">Chantier suivant : ${suivant.titre} →</a>` : ''}
        <a class="btn" href="#contact">Demander un devis</a>
      </nav>
    </div>`;

  el('fiche-contenu').querySelectorAll('[data-fil]').forEach(initFil);
}

function ouvrirFiche(id) {
  const i = CHANTIERS.findIndex(c => c.id === id);
  if (i < 0) return;
  renderFiche(CHANTIERS[i], i);
  document.title = `${CHANTIERS[i].titre} | MT2M`;
  el('fiche').hidden = false;
  el('fiche-scroll').scrollTop = 0;
  document.body.style.overflow = 'hidden';
  document.querySelector('.fiche-retour').focus();
}

function cacherFiche() {
  if (el('fiche').hidden) return;
  el('fiche').hidden = true;
  el('fiche-contenu').innerHTML = '';
  document.title = TITRE_PAGE;
  document.body.style.overflow = '';
}

function fermerFiche() {
  carteRetour = location.hash.replace('#chantier/', '');
  history.replaceState(null, '', '#realisations');
  router();
}

const TITRE_PAGE = document.title;

function router() {
  const hash = location.hash;
  if (hash.startsWith('#chantier/')) {
    ouvrirFiche(decodeURIComponent(hash.slice(10)));
    return;
  }
  const wasOpen = !el('fiche').hidden;
  cacherFiche();
  const carte = carteRetour && el('carte-' + carteRetour);
  const cible = hash && document.getElementById(hash.slice(1));
  if (carte) {
    carte.scrollIntoView({ block: 'center' });
    carte.focus({ preventScroll: true });
  } else if (wasOpen && cible) {
    cible.scrollIntoView();
  }
  carteRetour = null;
}

window.addEventListener('hashchange', router);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !el('fiche').hidden && !el('lightbox').classList.contains('open')) fermerFiche();
});

/* Année pied de page */
document.querySelectorAll('[data-annee]').forEach(span => { span.textContent = new Date().getFullYear(); });

/* Charge tous les fichiers */
Promise.all([
  fetch('content/contact.json').then(r => r.json()),
  fetch('content/accueil.json').then(r => r.json()),
  fetch('content/savoir-faire.json').then(r => r.json()),
  fetch('content/chantiers.json').then(r => r.json()),
  fetch('content/atelier.json').then(r => r.json()),
  fetch('content/legal.json').then(r => r.json()),
  fetch('content/privacy.json').then(r => r.json()),
]).then(([contact, accueil, savoirFaire, chantiers, atelier, legal, privacy]) => {
  CHANTIERS = chantiers.chantiers;
  renderContact(contact);
  renderAccueil(accueil, CHANTIERS);
  renderSavoirFaire(savoirFaire);
  renderChantiers(chantiers);
  renderAtelier(atelier);
  renderLegal(legal);
  renderPrivacy(privacy);
  router();
}).catch(err => console.error('Erreur chargement contenu :', err));
