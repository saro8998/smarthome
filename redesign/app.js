'use strict';

// This page is a static GitHub Pages site. Only the enquiry form sends data.
// The home controls are an illustrative demo; no real devices are connected.
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
$('#year').textContent = new Date().getFullYear();

const menuButton = $('.menu-toggle');
const navigation = $('#main-nav');
function closeMenu(returnFocus = false) {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  navigation.classList.remove('open');
  document.body.classList.remove('menu-open');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navigation.classList.toggle('open', open);
  document.body.classList.toggle('menu-open', open);
});
$$('#main-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (navigation.classList.contains('open') && !event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const scenes = {
  evening: {lights: '65%', temperature: '24°', security: 'Home', caption: 'Welcome to your\nfavourite time of day.'},
  movie: {lights: '15%', temperature: '23°', security: 'Home', caption: 'Settle in.\nThe evening is yours.'},
  night: {lights: 'Off', temperature: '25°', security: 'Armed', caption: 'One less thing\nbetween you and sleep.'}
};
$$('[data-scene].scene-button').forEach(button => {
  button.addEventListener('click', () => {
    const key = button.dataset.scene;
    const scene = scenes[key];
    $('#home-visual').dataset.scene = key;
    $('#scene-lights').textContent = scene.lights;
    $('#scene-temperature').textContent = scene.temperature;
    $('#scene-security').textContent = scene.security;
    const caption = $('#scene-caption');
    caption.replaceChildren();
    const lines = scene.caption.split('\n');
    caption.append(document.createTextNode(lines[0]), document.createElement('br'), document.createTextNode(lines[1]));
    $$('.scene-button').forEach(item => {
      const active = item === button;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });
  });
});

// Every demo is visible; only the one the visitor chooses starts downloading.
const featureVideos = $$('.feature-video');
const tourVideo = $('#tour-video');
const allVideos = [...featureVideos, tourVideo];
function pauseOtherVideos(active) {
  allVideos.forEach(item => { if (item !== active) item.pause(); });
}
async function playVideo(item) {
  try { await item.play(); }
  catch { /* Native controls and the direct link remain available. */ }
}
featureVideos.forEach(item => {
  const card = item.closest('.film-card');
  const play = card.querySelector('.video-play');
  const error = card.querySelector('.video-error');
  function updatePlay() {
    play.hidden = Boolean(item.error) || (!item.paused && !item.ended);
    const name = item.getAttribute('aria-label').replace(' demonstration', '').toLowerCase();
    play.setAttribute('aria-label', `${item.ended ? 'Replay' : 'Play'} ${name} demo`);
  }
  play.addEventListener('click', () => playVideo(item));
  item.addEventListener('play', () => { pauseOtherVideos(item); updatePlay(); });
  ['pause', 'ended'].forEach(event => item.addEventListener(event, updatePlay));
  item.addEventListener('error', () => { error.hidden = false; updatePlay(); });
});
$$('[data-watch]').forEach(link => link.addEventListener('click', event => {
  const card = document.getElementById(`demo-${link.dataset.watch}`);
  if (!card) return;
  event.preventDefault();
  history.replaceState(null, '', `#${card.id}`);
  card.scrollIntoView({behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start'});
  const item = card.querySelector('video');
  item.focus({preventScroll: true});
  playVideo(item);
}));
const tourDialog = $('#home-tour-dialog');
$$('[data-tour]').forEach(button => button.addEventListener('click', () => {
  tourDialog.showModal();
  document.body.classList.add('tour-open');
  playVideo(tourVideo);
}));
$('#close-tour').addEventListener('click', () => tourDialog.close());
$('.tour-explore').addEventListener('click', () => tourDialog.close());
tourDialog.addEventListener('close', () => {
  tourVideo.pause();
  document.body.classList.remove('tour-open');
});
tourDialog.addEventListener('click', event => {
  if (event.target !== tourDialog) return;
  const bounds = tourDialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) tourDialog.close();
});
tourVideo.addEventListener('play', () => pauseOtherVideos(tourVideo));
tourVideo.addEventListener('error', () => { $('#tour-error').hidden = false; });
document.addEventListener('visibilitychange', () => {
  if (document.hidden) allVideos.forEach(item => item.pause());
});
// Pause a gallery clip when it leaves view; scrolling never starts playback.
if ('IntersectionObserver' in window) {
  const videoObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, {threshold: 0});
  featureVideos.forEach(item => videoObserver.observe(item));
}

const planKey = 'smarthome-cairns-redesign-plan-v1';
const allowedFeatures = [...new Set($$('.add-feature, .builder-checkbox').map(control => control.dataset.feature))];
const allowedPackages = $$('.package-choice').map(button => button.dataset.package);
const selectedFeatures = new Set();
let selectedPackage = '';
try {
  const saved = JSON.parse(localStorage.getItem(planKey) || 'null');
  if (Array.isArray(saved?.features)) saved.features.filter(item => allowedFeatures.includes(item)).forEach(item => selectedFeatures.add(item));
  if (allowedPackages.includes(saved?.package)) selectedPackage = saved.package;
} catch { /* Selection still works when local storage is unavailable. */ }

let toastTimer;
function toast(message) {
  const element = $('#toast');
  clearTimeout(toastTimer);
  element.textContent = message;
  element.classList.add('visible');
  toastTimer = setTimeout(() => element.classList.remove('visible'), 3000);
}
function icon(name) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('icon');
  svg.setAttribute('aria-hidden', 'true');
  const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
  use.setAttribute('href', `#i-${name}`);
  svg.append(use);
  return svg;
}
function renderPlan() {
  const choices = [...selectedFeatures];
  $$('.add-feature').forEach(button => {
    if (!button.dataset.originalLabel) button.dataset.originalLabel = button.querySelector('span').textContent;
    const added = selectedFeatures.has(button.dataset.feature);
    button.setAttribute('aria-pressed', String(added));
    button.querySelector('span').textContent = added ? 'Added to my plan' : button.dataset.originalLabel;
    button.setAttribute('aria-label', `${added ? 'Remove' : 'Add'} ${button.dataset.feature.toLowerCase()} ${added ? 'from' : 'to'} my plan`);
    button.querySelector('use').setAttribute('href', added ? '#i-check' : '#i-plus');
  });
  $$('.builder-checkbox').forEach(checkbox => {
    checkbox.checked = selectedFeatures.has(checkbox.dataset.feature);
  });
  $('.selection-count').textContent = String(choices.length);
  $('.selection-count').setAttribute('aria-label', `${choices.length} selected features`);
  $('#plan-status').textContent = choices.length ? `${choices.length} ${choices.length === 1 ? 'idea' : 'ideas'} in your plan. Your home is taking shape.` : 'A few ideas or a whole wish list. Make it yours.';
  $('#features-input').value = choices.join(', ') || 'No features selected — discuss during consultation';
  $('#package-input').value = selectedPackage || 'Not sure yet';
  $('#empty-plan').hidden = choices.length > 0 || !!selectedPackage;
  $('#clear-plan').hidden = !choices.length && !selectedPackage;
  $('#builder-empty').hidden = choices.length > 0 || !!selectedPackage;
  $('#builder-clear-plan').hidden = !choices.length && !selectedPackage;
  $('#builder-selection-status').textContent = choices.length
    ? `${choices.length} ${choices.length === 1 ? 'idea' : 'ideas'} in your wish list`
    : selectedPackage ? 'A package to start from' : 'Your wish list is ready to begin.';
  ['#selected-features', '#builder-selected-features'].forEach(selector => {
    const chips = $(selector);
    chips.replaceChildren();
    choices.forEach(feature => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'feature-chip';
      button.setAttribute('aria-label', `Remove ${feature.toLowerCase()} from my plan`);
      button.append(document.createTextNode(feature), icon('close'));
      button.addEventListener('click', () => {
        selectedFeatures.delete(feature);
        renderPlan();
        toast(`${feature} removed from your plan.`);
        // Keep keyboard focus in the summary the visitor is currently using.
        const fallback = selector.startsWith('#builder') ? $('.builder-quote-link') : $('#name');
        ($(`${selector} button`) || fallback).focus({preventScroll: true});
      });
      chips.append(button);
    });
  });
  ['#selected-package', '#builder-selected-package'].forEach(selector => {
    const packageElement = $(selector);
    packageElement.replaceChildren();
    packageElement.hidden = !selectedPackage;
    if (selectedPackage) {
      const label = document.createElement('span');
      label.textContent = selectedPackage;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remove selected package');
      remove.append(icon('close'));
      remove.addEventListener('click', () => {
        selectedPackage = '';
        renderPlan();
        toast('Package removed. Your selected features are still in your plan.');
        const fallback = selector.startsWith('#builder') ? $('.builder-quote-link') : $('#name');
        fallback.focus({preventScroll: true});
      });
      packageElement.append(label, remove);
    }
  });
  $$('.package-choice').forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.package === selectedPackage));
  });
  try { localStorage.setItem(planKey, JSON.stringify({features: choices, package: selectedPackage})); } catch { /* No personal details are stored. */ }
}
$$('.add-feature').forEach(button => button.addEventListener('click', () => {
  const feature = button.dataset.feature;
  const added = !selectedFeatures.has(feature);
  if (added) selectedFeatures.add(feature); else selectedFeatures.delete(feature);
  renderPlan();
  toast(`${feature} ${added ? 'added to' : 'removed from'} your plan.`);
}));
$$('.builder-checkbox').forEach(checkbox => checkbox.addEventListener('change', () => {
  const feature = checkbox.dataset.feature;
  const added = checkbox.checked;
  if (added) selectedFeatures.add(feature); else selectedFeatures.delete(feature);
  renderPlan();
  toast(`${feature} ${added ? 'added to' : 'removed from'} your plan.`);
}));
$$('.package-choice').forEach(button => button.addEventListener('click', () => {
  selectedPackage = button.dataset.package;
  renderPlan();
  $('#contact').scrollIntoView({behavior: reduceMotion.matches ? 'instant' : 'smooth'});
  $('#name').focus({preventScroll: true});
  toast('Package added. Let’s talk about the details.');
}));
$$('#clear-plan, #builder-clear-plan').forEach(button => button.addEventListener('click', () => {
  selectedFeatures.clear();
  selectedPackage = '';
  renderPlan();
  (button.id === 'builder-clear-plan' ? $('.builder-checkbox') : $('#name')).focus({preventScroll: true});
  toast('Your plan has been cleared.');
}));
renderPlan();

const form = $('#quote-form');
const submitButton = $('#submit-button');
const feedback = $('#form-feedback');
let submitting = false;
form.addEventListener('submit', async event => {
  event.preventDefault();
  if (submitting || !form.reportValidity()) return;
  if ($('#website').value) return;
  submitting = true;
  const payload = new FormData(form);
  submitButton.disabled = true;
  submitButton.querySelector('span').textContent = 'Sending your enquiry…';
  form.setAttribute('aria-busy', 'true');
  feedback.hidden = true;
  feedback.classList.remove('error');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(form.action, {method: 'POST', body: payload, headers: {Accept: 'application/json'}, signal: controller.signal});
    if (!response.ok) throw new Error('Your enquiry could not be sent. Your details are still here — please try again shortly.');
    feedback.textContent = 'Thank you — your enquiry has been sent. We’ll be in touch to talk about your home.';
    form.reset();
    // Keep the wish list visible after sending, and reset only the contact fields.
    renderPlan();
  } catch (error) {
    feedback.classList.add('error');
    feedback.textContent = error.name === 'AbortError'
      ? 'We couldn’t confirm whether your enquiry was received. Your details are still here. Please check your connection before trying again.'
      : 'Your enquiry could not be sent. Your details are still here — please check your connection and try again shortly.';
  } finally {
    clearTimeout(timeout);
    submitting = false;
    submitButton.disabled = false;
    submitButton.querySelector('span').textContent = 'Let’s plan my smart home';
    form.removeAttribute('aria-busy');
    feedback.hidden = false;
    feedback.focus({preventScroll: true});
    feedback.scrollIntoView({behavior: reduceMotion.matches ? 'instant' : 'smooth', block: 'nearest'});
  }
});

// Decorative inline icons should not repeat adjacent labels for screen readers.
$$('svg:not(.svg-library)').forEach(svg => svg.setAttribute('aria-hidden', 'true'));
