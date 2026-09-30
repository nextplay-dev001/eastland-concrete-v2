const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
  });

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

const wizard = document.getElementById('quoteWizard');

if (wizard) {
  const STORAGE_KEY = 'eastlandQuoteDraftV1';
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

  let step = 1;
  const values = {};

  const getPanel = (n) => panels.find((panel) => String(panel.dataset.step) === String(n));
  const activePanel = () => getPanel(step);

  function saveDraft() {
    const safe = { ...values };
    delete safe.photos;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
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
          item.classList.toggle('selected', item.dataset.value === saved.projectType);
        });
      }
    } catch (_) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function setStep(nextStep) {
    panels.forEach((panel) => panel.classList.remove('active'));
    step = nextStep;

    const panel = getPanel(step);
    if (panel) panel.classList.add('active');
    error.textContent = '';

    if (step !== 'success') {
      label.textContent = `STEP ${step} OF 5`;
      progress.style.width = `${step * 20}%`;
      backButton.style.visibility = step === 1 ? 'hidden' : 'visible';
      nextButton.textContent = step === 5 ? 'Prepare Email Request →' : 'Continue →';
      if (step === 5) renderSummary();
    }
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
        error.textContent = 'Please complete the required fields before continuing.';
        field.focus();
        return false;
      }

      if (field.type === 'email' && !field.checkValidity()) {
        error.textContent = 'Enter a valid email address.';
        field.focus();
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
  }

  function renderSummary() {
    collectFields();
    const location = [values.city, values.zip].filter(Boolean).join(', ');
    const lines = [
      values.projectType || 'Project',
      location || null,
      values.timeframe || null
    ].filter(Boolean);

    summary.replaceChildren();
    const heading = document.createElement('strong');
    heading.textContent = 'REQUEST SUMMARY';
    const detail = document.createElement('div');
    detail.textContent = lines.join(' • ');
    summary.append(heading, detail);
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
      'Submitted from Eastland Concrete V2 GitHub Pages test build.'
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
      });

      button.classList.add('selected');
      saveDraft();
      error.textContent = '';
    });
  });

  wizard.addEventListener('input', () => collectFields());
  wizard.addEventListener('change', () => collectFields());

  nextButton.addEventListener('click', () => {
    collectFields();
    if (!validateStep()) return;

    if (step < 5) {
      setStep(step + 1);
      return;
    }

    openEmailHandoff();
    wizard.classList.add('submitted');
    localStorage.removeItem(STORAGE_KEY);
    setStep('success');
  });

  backButton.addEventListener('click', () => {
    if (typeof step === 'number' && step > 1) setStep(step - 1);
  });

  wizard.querySelectorAll('[data-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (step < 5) setStep(step + 1);
    });
  });

  if (photos) {
    photos.addEventListener('change', () => {
      const files = [...photos.files].slice(0, 8);
      preview.replaceChildren();
      files.forEach((file) => {
        const chip = document.createElement('span');
        chip.className = 'photo-chip';
        chip.textContent = file.name;
        preview.appendChild(chip);
      });
    });
  }

  startOver.addEventListener('click', () => {
    wizard.reset();
    Object.keys(values).forEach((key) => delete values[key]);
    localStorage.removeItem(STORAGE_KEY);

    wizard.querySelectorAll('.choice-button').forEach((item) => item.classList.remove('selected'));
    preview.replaceChildren();
    wizard.classList.remove('submitted');
    setStep(1);
  });

  restoreDraft();
  setStep(1);
}
