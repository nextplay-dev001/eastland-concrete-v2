const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const iconBase = (document.querySelector('link[href$="styles.css"]')?.getAttribute('href') || 'styles.css').replace('styles.css', '') + 'assets/icons.svg';
const iconSvg = (name) => `<svg class="icon" aria-hidden="true" focusable="false"><use href="${iconBase}#i-${name}"/></svg>`;

/* ------------------------------------------------------------------ Header + mobile nav */
const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

if (header) {
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

if (menuButton && mobileNav) {
  const setMenu = (open) => {
    mobileNav.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('nav-open', open);
  };

  menuButton.addEventListener('click', () => setMenu(!mobileNav.classList.contains('open')));

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
      setMenu(false);
      menuButton.focus();
    }
  });

  window.matchMedia('(min-width: 981px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });
}

/* ------------------------------------------------------------------ Scroll reveals + hero parallax */
const revealItems = document.querySelectorAll('[data-reveal]');

if (!prefersReducedMotion && 'IntersectionObserver' in window && revealItems.length) {
  document.documentElement.classList.add('js-motion');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

  revealItems.forEach((item) => {
    // Anything already on screen at load is shown immediately.
    if (item.getBoundingClientRect().top < window.innerHeight) item.classList.add('is-visible');
    else revealObserver.observe(item);
  });
}

const heroImage = document.querySelector('.hero-media img');

if (heroImage && !prefersReducedMotion) {
  let ticking = false;
  const parallax = () => {
    const y = Math.min(window.scrollY, window.innerHeight);
    heroImage.style.transform = `translate3d(0, ${y * -0.12}px, 0)`;
    ticking = false;
  };
  heroImage.addEventListener('animationend', () => {
    heroImage.style.animation = 'none';
    parallax();
  }, { once: true });
  window.addEventListener('scroll', () => {
    if (!ticking && window.innerWidth > 700) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }, { passive: true });
}

/* ------------------------------------------------------------------ Reviews feed / carousel
   The static testimonial in the HTML is the fallback. When a production endpoint is
   configured (window.EASTLAND_REVIEWS_ENDPOINT), reviews are loaded from it and only
   those at or above data-min-rating are shown. See docs/reviews-feed.md. */
const reviewTrack = document.getElementById('reviewTrack');

if (reviewTrack) {
  const REVIEWS_ENDPOINT = window.EASTLAND_REVIEWS_ENDPOINT || '';
  const minRating = Number(reviewTrack.dataset.minRating || 4);
  const controls = document.getElementById('reviewControls');
  const prev = document.getElementById('reviewPrev');
  const next = document.getElementById('reviewNext');
  const count = document.getElementById('reviewCount');

  const googleMark = '<svg class="g-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h6.2a5.3 5.3 0 0 1-2.3 3.5v2.9h3.7c2.2-2 3.4-5 3.4-8.5z"/><path fill="#34A853" d="M12 23.5c3.1 0 5.7-1 7.6-2.8l-3.7-2.9c-1 .7-2.4 1.1-3.9 1.1-3 0-5.5-2-6.4-4.7H1.8v3A11.5 11.5 0 0 0 12 23.5z"/><path fill="#FBBC05" d="M5.6 14.2a6.9 6.9 0 0 1 0-4.4v-3H1.8a11.5 11.5 0 0 0 0 10.4z"/><path fill="#EA4335" d="M12 5c1.7 0 3.2.6 4.4 1.7l3.3-3.3A11.5 11.5 0 0 0 1.8 6.8l3.8 3C6.5 7 9 5 12 5z"/></svg>';

  const buildCard = (review) => {
    const rating = Math.max(0, Math.min(5, Math.round(Number(review.rating) || 0)));
    const card = document.createElement('article');
    card.className = 'review-card';
    card.dataset.rating = String(rating);
    card.dataset.source = review.source || 'google';

    const head = document.createElement('div');
    head.className = 'review-card-head';
    const stars = document.createElement('div');
    stars.className = 'stars';
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `${rating} out of 5 stars`);
    stars.innerHTML = Array.from({ length: 5 }, (_, i) => iconSvg('star').replace('class="icon"', `class="icon${i < rating ? '' : ' off'}"`)).join('');
    const source = document.createElement(review.url ? 'a' : 'span');
    source.className = 'review-source';
    if (review.url) { source.href = review.url; source.target = '_blank'; source.rel = 'noopener'; }
    source.innerHTML = (card.dataset.source === 'google' ? googleMark : '') + '<span></span>';
    source.lastChild.textContent = card.dataset.source === 'google' ? 'Google review' : 'Customer review';
    head.append(stars, source);

    const quote = document.createElement('blockquote');
    quote.textContent = `“${String(review.text || '').trim()}”`;

    const author = document.createElement('div');
    author.className = 'review-author';
    const avatar = document.createElement('span');
    avatar.className = 'review-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    if (review.avatar) {
      const img = document.createElement('img');
      img.src = review.avatar; img.alt = ''; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
      avatar.append(img);
    } else {
      avatar.textContent = String(review.author || 'E').trim().charAt(0).toUpperCase();
    }
    const who = document.createElement('div');
    const name = document.createElement('strong');
    name.textContent = review.author || 'Eastland customer';
    const when = document.createElement('span');
    when.textContent = review.relativeTime || review.date || '';
    who.append(name, when);
    author.append(avatar, who);

    card.append(head, quote, author);
    return card;
  };

  const cards = () => [...reviewTrack.querySelectorAll('.review-card')];

  const updateControls = () => {
    const all = cards();
    reviewTrack.dataset.count = String(all.length);
    if (!controls) return;
    controls.hidden = all.length < 2;
    if (all.length < 2) return;
    const index = Math.round(reviewTrack.scrollLeft / (all[0].offsetWidth + 18));
    prev.disabled = reviewTrack.scrollLeft <= 4;
    next.disabled = reviewTrack.scrollLeft + reviewTrack.clientWidth >= reviewTrack.scrollWidth - 4;
    count.textContent = `${String(Math.min(index + 1, all.length)).padStart(2, '0')} / ${String(all.length).padStart(2, '0')}`;
  };

  const step = (dir) => {
    const first = cards()[0];
    if (first) reviewTrack.scrollBy({ left: dir * (first.offsetWidth + 18), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  prev?.addEventListener('click', () => step(-1));
  next?.addEventListener('click', () => step(1));
  reviewTrack.addEventListener('scroll', () => requestAnimationFrame(updateControls), { passive: true });
  reviewTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') { event.preventDefault(); step(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); step(-1); }
  });
  window.addEventListener('resize', updateControls);

  async function loadReviews() {
    if (!REVIEWS_ENDPOINT) return;
    try {
      const response = await fetch(REVIEWS_ENDPOINT, { headers: { Accept: 'application/json' } });
      if (!response.ok) return;
      const data = await response.json();
      const list = (Array.isArray(data) ? data : data.reviews || [])
        .filter((review) => Number(review.rating) >= minRating && String(review.text || '').trim());
      if (!list.length) return; // keep the static fallback
      reviewTrack.replaceChildren(...list.map(buildCard));
      reviewTrack.scrollLeft = 0;
      updateControls();
    } catch (_) {
      // Keep the static testimonial if the feed is unavailable.
    }
  }

  updateControls();
  loadReviews();
}

/* ------------------------------------------------------------------ Project lightbox */
const lightbox = document.getElementById('lightbox');

if (lightbox && typeof lightbox.showModal === 'function') {
  const lbImg = document.createElement('img');
  lightbox.querySelector('figure').prepend(lbImg);
  const lbCap = lightbox.querySelector('figcaption');
  let opener = null;

  document.querySelectorAll('[data-lightbox]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      opener = trigger;
      const thumb = trigger.querySelector('img');
      lbImg.src = trigger.dataset.lightbox;
      lbImg.alt = thumb ? thumb.alt : '';
      lbCap.textContent = trigger.dataset.caption || '';
      lightbox.showModal();
    });
  });

  const close = () => { lightbox.close(); };
  lightbox.querySelector('.lightbox-close').addEventListener('click', close);
  lightbox.addEventListener('click', (event) => { if (event.target === lightbox || event.target.tagName === 'FIGURE') close(); });
  lightbox.addEventListener('close', () => { lbImg.removeAttribute('src'); opener?.focus(); });
}

/* ------------------------------------------------------------------ Quote wizard
   Lead-capture behavior is documented in docs/lead-capture.md — keep it intact:
   - draft saved to localStorage (STORAGE_KEY) on every change, photos excluded
   - one lead ID per wizard session (eastlandLeadId), reused for completion
   - debounced partial-lead upsert to window.EASTLAND_PARTIAL_LEAD_ENDPOINT once a
     first name plus a valid phone or email exists
   - completion clears the draft and lead ID after the email handoff */
const wizard = document.getElementById('quoteWizard');

if (wizard) {
  const STORAGE_KEY = 'eastlandQuoteDraftV1';
  const PARTIAL_ENDPOINT = window.EASTLAND_PARTIAL_LEAD_ENDPOINT || '';
  const PARTIAL_DEBOUNCE_MS = 2500;
  const TOTAL_STEPS = 5;
  let partialSaveTimer = null;
  let leadId = localStorage.getItem('eastlandLeadId') || '';

  function ensureLeadId() {
    if (!leadId) {
      leadId = 'lead_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 10);
      localStorage.setItem('eastlandLeadId', leadId);
    }
    return leadId;
  }

  function validPartialContact() {
    const firstName = String(values.firstName || '').trim();
    const phone = String(values.phone || '').trim();
    const email = String(values.email || '').trim();
    const hasPhone = phone.replace(/\D/g, '').length >= 10;
    const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    return Boolean(firstName && (hasPhone || hasEmail));
  }

  async function savePartialLead() {
    if (!PARTIAL_ENDPOINT || !validPartialContact()) return;

    const payload = {
      leadId: ensureLeadId(),
      status: 'partial',
      source: 'eastland-website',
      capturedAt: new Date().toISOString(),
      fields: { ...values }
    };

    try {
      await fetch(PARTIAL_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      });
    } catch (_) {
      // Do not interrupt the customer if the draft save fails.
    }
  }

  function schedulePartialLeadSave() {
    if (!PARTIAL_ENDPOINT || !validPartialContact()) return;
    clearTimeout(partialSaveTimer);
    partialSaveTimer = setTimeout(savePartialLead, PARTIAL_DEBOUNCE_MS);
  }
  const panels = [...wizard.querySelectorAll('.wizard-panel[data-step]')];
  const nextButton = document.getElementById('wizardNext');
  const backButton = document.getElementById('wizardBack');
  const label = document.getElementById('wizardStepLabel');
  const progress = document.getElementById('wizardProgress');
  const error = document.getElementById('wizardError');
  const photos = document.getElementById('projectPhotos');
  const preview = document.getElementById('uploadPreview');
  const summary = document.getElementById('leadSummary');
  const startOver = document.getElementById('startOver');
  const stepList = document.getElementById('wizardSteps');
  const saveNote = document.getElementById('wizardSaveNote');
  let furthestStep = 1;
  let saveNoteTimer = null;
  let previewUrls = [];

  let step = 1;
  const values = {};

  const getPanel = (n) => panels.find((panel) => String(panel.dataset.step) === String(n));
  const activePanel = () => getPanel(step);

  function saveDraft() {
    const safe = { ...values };
    delete safe.photos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
    flashSaveNote();
  }

  function flashSaveNote() {
    if (!saveNote) return;
    saveNote.classList.add('is-saving');
    saveNote.textContent = 'Saving…';
    clearTimeout(saveNoteTimer);
    saveNoteTimer = setTimeout(() => {
      saveNote.classList.remove('is-saving');
      saveNote.textContent = 'Your progress is saved';
    }, 700);
  }

  function restoreDraft() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      Object.assign(values, saved);

      [...wizard.elements].forEach((field) => {
        if (!field.name || field.type === 'file' || !(field.name in saved)) return;
        if (field.type === 'checkbox') field.checked = Boolean(saved[field.name]);
        else field.value = saved[field.name] ?? '';
      });

      if (saved.projectType) {
        wizard.querySelectorAll('[data-field="projectType"]').forEach((item) => {
          const selected = item.dataset.value === saved.projectType;
          item.classList.toggle('selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function updateStepList() {
    if (!stepList) return;
    stepList.querySelectorAll('li').forEach((item) => {
      const n = Number(item.dataset.stepIndex);
      const button = item.querySelector('button');
      const done = typeof step === 'number' && n < step;
      const reachable = typeof step === 'number' && n <= furthestStep && n !== step;
      item.classList.toggle('is-done', done || (typeof step === 'number' && n < furthestStep && n !== step));
      item.classList.toggle('is-current', n === step);
      button.tabIndex = reachable ? 0 : -1;
      if (n === step) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
  }

  function setStep(nextStep, options = {}) {
    const goingBack = typeof nextStep === 'number' && typeof step === 'number' && nextStep < step;
    panels.forEach((panel) => panel.classList.remove('active', 'is-back'));
    step = nextStep;

    const panel = getPanel(step);
    if (panel) {
      panel.classList.add('active');
      if (goingBack) panel.classList.add('is-back');
    }
    error.textContent = '';

    if (step !== 'success') {
      furthestStep = Math.max(furthestStep, step);
      label.textContent = `STEP ${step} OF ${TOTAL_STEPS}`;
      progress.style.width = `${step * 20}%`;
      wizard.style.setProperty('--wizard-pct', `${step * 20}%`);
      backButton.style.visibility = step === 1 ? 'hidden' : 'visible';
      nextButton.textContent = step === TOTAL_STEPS ? 'Send Estimate Request →' : 'Continue →';
      if (step === TOTAL_STEPS) renderSummary();
    } else {
      wizard.style.setProperty('--wizard-pct', '100%');
    }
    updateStepList();

    // Keep the active step in view on small screens, and move focus for keyboard/screen-reader users.
    if (options.focus && panel) {
      const heading = panel.querySelector('h3');
      if (heading) {
        heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
      const top = wizard.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) {
        const offset = (header ? header.offsetHeight : 0) + 12;
        window.scrollTo({ top: window.scrollY + top - offset, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
    }
  }

  function markInvalid(field, message) {
    field.setAttribute('aria-invalid', 'true');
    error.textContent = message;
    field.focus();
  }

  function validateStep() {
    if (step === 1) {
      if (!values.projectType) {
        error.textContent = 'Choose a project type to continue.';
        return false;
      }
      return true;
    }

    const panel = activePanel();
    const required = [...panel.querySelectorAll('[required]')];

    for (const field of required) {
      if (!field.value.trim()) {
        markInvalid(field, 'Please complete the required fields before continuing.');
        return false;
      }

      if (field.type === 'email' && !field.checkValidity()) {
        markInvalid(field, 'Enter a valid email address.');
        return false;
      }
    }

    return true;
  }

  function collectFields() {
    [...wizard.elements].forEach((field) => {
      if (!field.name || field.type === 'file') return;
      values[field.name] = field.type === 'checkbox' ? field.checked : field.value;
    });
    saveDraft();
    schedulePartialLeadSave();
  }

  function renderSummary() {
    collectFields();
    const location = [values.city, values.zip].filter(Boolean).join(', ');
    const name = [values.firstName, values.lastName].filter(Boolean).join(' ');
    const contact = [values.phone, values.email].filter(Boolean).join(' · ');
    const details = [values.projectCondition, values.timeframe, values.size].filter(Boolean).join(' · ');
    const rows = [
      ['Project', values.projectType, 1],
      ['Contact', [name, contact].filter(Boolean).join(' — '), 2],
      ['Location', [location, values.address].filter(Boolean).join(' — '), 3],
      ['Details', details, 4],
      ['Description', values.details, 4]
    ];

    summary.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = 'REQUEST SUMMARY';
    const list = document.createElement('dl');
    list.className = 'summary-list';

    rows.forEach(([term, value, target]) => {
      const row = document.createElement('div');
      row.className = 'summary-row';
      const dt = document.createElement('dt');
      dt.textContent = term;
      const dd = document.createElement('dd');
      const text = String(value || '').trim();
      dd.textContent = text.length > 180 ? text.slice(0, 177) + '…' : (text || 'Not provided');
      if (!text) dd.classList.add('is-missing');
      const edit = document.createElement('button');
      edit.type = 'button';
      edit.className = 'summary-edit';
      edit.textContent = 'Edit';
      edit.setAttribute('aria-label', `Edit ${term.toLowerCase()}`);
      edit.addEventListener('click', () => setStep(target, { focus: true }));
      row.append(dt, dd, edit);
      list.append(row);
    });

    summary.append(heading, list);
  }

  function buildEmailBody() {
    collectFields();

    const selectedPhotos = photos ? [...photos.files].map((file) => file.name) : [];
    const yesNo = (v) => (v ? 'Yes' : 'No');

    return [
      'New website estimate request',
      '',
      `Project type: ${values.projectType || ''}`,
      `City: ${values.city || ''}`,
      `ZIP: ${values.zip || ''}`,
      `Address: ${values.address || ''}`,
      `Own/manage property: ${yesNo(values.propertyOwner)}`,
      `Project condition: ${values.projectCondition || ''}`,
      `Desired timeframe: ${values.timeframe || ''}`,
      `Approximate size: ${values.size || ''}`,
      '',
      'Project details:',
      values.details || '',
      '',
      `Customer: ${values.firstName || ''} ${values.lastName || ''}`,
      `Phone: ${values.phone || ''}`,
      `Email: ${values.email || ''}`,
      `Okay to text: ${yesNo(values.textOkay)}`,
      '',
      selectedPhotos.length
        ? `Selected photos (test mode cannot auto-attach): ${selectedPhotos.join(', ')}`
        : 'Photos selected: none',
      '',
      'Submitted from the Eastland Concrete website.'
    ].join('\n');
  }

  function openEmailHandoff() {
    const subjectParts = [
      'Website estimate request',
      values.projectType,
      values.city
    ].filter(Boolean);

    const mailto =
      'mailto:info@eastlandconcretekc.com' +
      '?subject=' + encodeURIComponent(subjectParts.join(' - ')) +
      '&body=' + encodeURIComponent(buildEmailBody());

    window.location.href = mailto;
  }

  wizard.querySelectorAll('.choice-button').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.dataset.field;
      values[field] = button.dataset.value;

      wizard.querySelectorAll(`[data-field="${field}"]`).forEach((item) => {
        item.classList.remove('selected');
        item.setAttribute('aria-pressed', 'false');
      });

      button.classList.add('selected');
      button.setAttribute('aria-pressed', 'true');
      saveDraft();
      error.textContent = '';
    });
  });

  wizard.addEventListener('input', (event) => {
    if (event.target.getAttribute('aria-invalid') === 'true' && String(event.target.value).trim()) {
      event.target.removeAttribute('aria-invalid');
      error.textContent = '';
    }
    collectFields();
  });
  wizard.addEventListener('change', () => collectFields());

  // Enter in a single-line field advances the step instead of doing nothing.
  wizard.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.matches('input:not([type=checkbox]):not([type=file])')) {
      event.preventDefault();
      nextButton.click();
    }
  });

  nextButton.addEventListener('click', () => {
    collectFields();
    if (!validateStep()) return;

    if (step < TOTAL_STEPS) {
      setStep(step + 1, { focus: true });
      return;
    }

    openEmailHandoff();
    wizard.classList.add('submitted');
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('eastlandLeadId');
    setStep('success', { focus: true });
  });

  backButton.addEventListener('click', () => {
    if (typeof step === 'number' && step > 1) setStep(step - 1, { focus: true });
  });

  if (stepList) {
    stepList.querySelectorAll('li').forEach((item) => {
      item.querySelector('button').addEventListener('click', () => {
        const n = Number(item.dataset.stepIndex);
        if (typeof step === 'number' && n <= furthestStep && n !== step) setStep(n, { focus: true });
      });
    });
  }

  wizard.querySelectorAll('[data-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (step < TOTAL_STEPS) setStep(step + 1);
    });
  });

  function renderPhotoPreview() {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    previewUrls = [];
    preview.replaceChildren();
    const all = [...photos.files];
    const files = all.slice(0, 8);
    files.forEach((file) => {
      const chip = document.createElement('span');
      chip.className = 'photo-chip';
      if (file.type.startsWith('image/')) {
        const url = URL.createObjectURL(file);
        previewUrls.push(url);
        const thumb = document.createElement('img');
        thumb.src = url;
        thumb.alt = '';
        chip.append(thumb);
      }
      const name = document.createElement('span');
      name.textContent = file.name;
      chip.append(name);
      preview.appendChild(chip);
    });
    if (all.length) {
      const note = document.createElement('span');
      note.className = 'upload-count';
      note.textContent = `${all.length} photo${all.length === 1 ? '' : 's'} selected`;
      preview.appendChild(note);
    }
  }

  if (photos) {
    photos.addEventListener('change', renderPhotoPreview);

    const zone = photos.closest('.upload-zone');
    if (zone) {
      ['dragenter', 'dragover'].forEach((type) => zone.addEventListener(type, (event) => {
        event.preventDefault();
        zone.classList.add('is-dragging');
      }));
      ['dragleave', 'dragend', 'drop'].forEach((type) => zone.addEventListener(type, () => zone.classList.remove('is-dragging')));
      zone.addEventListener('drop', (event) => {
        event.preventDefault();
        if (event.dataTransfer?.files?.length) {
          photos.files = event.dataTransfer.files;
          renderPhotoPreview();
        }
      });
    }
  }

  startOver.addEventListener('click', () => {
    wizard.reset();
    Object.keys(values).forEach((key) => delete values[key]);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('eastlandLeadId');
    leadId = '';

    wizard.querySelectorAll('.choice-button').forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    wizard.querySelectorAll('[aria-invalid]').forEach((field) => field.removeAttribute('aria-invalid'));
    preview.replaceChildren();
    wizard.classList.remove('submitted');
    furthestStep = 1;
    setStep(1, { focus: true });
  });

  restoreDraft();
  setStep(1);
}
