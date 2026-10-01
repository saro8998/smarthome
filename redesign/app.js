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

const demos = {
  lighting: {file: '../smart-lights.mp4.mp4', poster: './assets/lighting-poster.jpg', label: 'Smart lighting', feature: 'Smart lighting', action: 'Add lighting to my plan', description: 'Set the mood from the sofa. Adjust your lights with a tap.', number: '01'},
  climate: {file: '../remote-ac-smart-home.mp4.mp4', poster: './assets/climate-poster.jpg', label: 'Climate control', feature: 'Climate control', action: 'Add climate to my plan', description: 'A cooler welcome. Switch on your AC before you arrive home.', number: '02'},
  garage: {file: '../garage-control.mp4.mp4', poster: './assets/garage-poster.jpg', label: 'Garage control', feature: 'Garage control', action: 'Add garage to my plan', description: 'Arrive on your terms. Open the garage from your phone.', number: '03'},
  goodnight: {file: '../good-night-smart-home.mp4.mp4', poster: './assets/goodnight-poster.jpg', label: 'Good night routine', feature: 'Good night routine', action: 'Add this routine to my plan', description: 'Wind down with one routine for your lights, comfort and security.', number: '04'}
};
const video = $('#demo-video');
const playButton = $('#video-play');
const tabs = $$('.demo-tab');
let currentDemo = 'lighting';
let videoRevision = 0;
function updatePlayButton() {
  playButton.hidden = !video.paused && !video.ended;
  playButton.setAttribute('aria-label', `${video.ended ? 'Replay' : 'Play'} ${demos[currentDemo].label.toLowerCase()} demo`);
}
async function playDemo() {
  const revision = videoRevision;
  try { await video.play(); }
  catch (error) {
    // An aborted play is normal when someone selects a different clip.
    if (error.name !== 'AbortError' && revision === videoRevision) updatePlayButton();
  }
}
function selectDemo(button) {
  const key = button.dataset.demo;
  if (key === currentDemo) return;
  videoRevision += 1;
  video.pause();
  currentDemo = key;
  const demo = demos[key];
  video.poster = demo.poster;
  video.src = demo.file;
  video.setAttribute('aria-label', `${demo.label} demonstration`);
  $('#video-description').textContent = demo.description;
  $('#video-number').textContent = `${demo.number} / 04`;
  $('#video-panel').setAttribute('aria-labelledby', button.id);
  $('#video-direct-link').href = demo.file;
  $('#video-error-link').href = demo.file;
  $('#video-error').hidden = true;
  tabs.forEach(item => {
    const active = item === button;
    item.classList.toggle('active', active);
    item.setAttribute('aria-selected', String(active));
    item.tabIndex = active ? 0 : -1;
  });
  video.load();
  updatePlayButton();
  $('#demo-add-feature').dataset.feature = demo.feature;
  $('#demo-add-feature').dataset.originalLabel = demo.action;
  renderPlan();
}
tabs.forEach((button, index) => {
  button.addEventListener('click', () => selectDemo(button));
  button.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    tabs[next].focus();
    selectDemo(tabs[next]);
  });
});
playButton.addEventListener('click', playDemo);
['play', 'pause', 'ended'].forEach(event => video.addEventListener(event, updatePlayButton));
video.addEventListener('error', () => {
  $('#video-error').hidden = false;
  playButton.hidden = true;
});
document.addEventListener('visibilitychange', () => { if (document.hidden) video.pause(); });

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
