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

  const getPanel = (n) =>
    panels.find((panel) => String(panel.dataset.step) === String(n));

  const activePanel = () => getPanel(step);

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
      nextButton.textContent =
        step === 5 ? 'Request My Free Estimate →' : 'Continue →';

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
        error.textContent =
          'Please complete the required fields before continuing.';
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
      values[field.name] =
        field.type === 'checkbox' ? field.checked : field.value;
    });
  }

  function renderSummary() {
    collectFields();
    const location = [values.city, values.zip].filter(Boolean).join(', ');

    summary.innerHTML =
      '<strong>REQUEST SUMMARY</strong>' +
      (values.projectType || 'Project') +
      (location ? ` • ${location}` : '') +
      (values.timeframe ? ` • ${values.timeframe}` : '');
  }

  wizard.querySelectorAll('.choice-button').forEach((button) => {
    button.addEventListener('click', () => {
      const field = button.dataset.field;
      values[field] = button.dataset.value;

      wizard
        .querySelectorAll(`[data-field="${field}"]`)
        .forEach((item) => item.classList.remove('selected'));

      button.classList.add('selected');
      error.textContent = '';
    });
  });

  nextButton.addEventListener('click', () => {
    collectFields();
    if (!validateStep()) return;

    if (step < 5) {
      setStep(step + 1);
      return;
    }

    // UI prototype only.
    // Production will POST to a secure server-side endpoint that:
    // 1. validates the request,
    // 2. stores or links uploaded photos,
    // 3. emails a structured lead to Eastland.
    wizard.classList.add('submitted');
    setStep('success');
  });

  backButton.addEventListener('click', () => {
    if (typeof step === 'number' && step > 1) {
      setStep(step - 1);
    }
  });

  wizard.querySelectorAll('[data-next]').forEach((button) => {
    button.addEventListener('click', () => {
      if (step < 5) setStep(step + 1);
    });
  });

  if (photos) {
    photos.addEventListener('change', () => {
      const files = [...photos.files].slice(0, 8);
      preview.innerHTML = files.length
        ? files
            .map((file) => `<span class="photo-chip">${file.name}</span>`)
            .join('')
        : '';
    });
  }

  startOver.addEventListener('click', () => {
    wizard.reset();
    Object.keys(values).forEach((key) => delete values[key]);

    wizard
      .querySelectorAll('.choice-button')
      .forEach((item) => item.classList.remove('selected'));

    preview.innerHTML = '';
    wizard.classList.remove('submitted');
    setStep(1);
  });

  setStep(1);
}
