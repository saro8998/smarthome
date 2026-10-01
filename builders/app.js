'use strict';

// Independent builder enquiry flow. No device connections or personal-data storage.
document.documentElement.classList.add('js');
const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
$('#year').textContent = new Date().getFullYear();

const menu = $('#main-nav');
const menuButton = $('.menu-toggle');
function closeMenu(returnFocus = false) {
  menu.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open menu');
  if (returnFocus) menuButton.focus();
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menu.classList.toggle('open', open);
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
$$('#main-nav a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.site-header')) closeMenu();
});
window.matchMedia('(min-width: 761px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

const demos = $$('.demo-video');
const tour = $('#tour-video');
const videos = [...demos, tour];
function pauseOthers(active) { videos.forEach(video => { if (video !== active) video.pause(); }); }
async function play(video) {
  try { await video.play(); }
  catch { /* User can still use native controls or the direct video links. */ }
}
demos.forEach(video => {
  const card = video.closest('.demo-card');
  const overlay = card.querySelector('.video-play');
  const error = card.querySelector('.video-error');
  const originalLabel = overlay.getAttribute('aria-label');
  function refresh() {
    overlay.hidden = Boolean(video.error) || (!video.paused && !video.ended);
    overlay.setAttribute('aria-label', video.ended ? originalLabel.replace('Play', 'Replay') : originalLabel);
  }
  overlay.addEventListener('click', () => play(video));
  video.addEventListener('play', () => { pauseOthers(video); refresh(); });
  ['pause', 'ended'].forEach(event => video.addEventListener(event, refresh));
  video.addEventListener('error', () => { error.hidden = false; refresh(); });
});
tour.addEventListener('play', () => pauseOthers(tour));
tour.addEventListener('error', () => { $('#tour-error').hidden = false; });

const dialog = $('#tour-dialog');
let tourOpener;
$$('[data-tour]').forEach(button => button.addEventListener('click', () => {
  tourOpener = button;
  dialog.showModal();
  document.body.classList.add('tour-open');
  play(tour);
}));
$('#close-tour').addEventListener('click', () => dialog.close());
$('#explore-demos').addEventListener('click', () => dialog.close());
dialog.addEventListener('close', () => {
  tour.pause();
  document.body.classList.remove('tour-open');
  if (tourOpener) tourOpener.focus({preventScroll: true});
});
dialog.addEventListener('click', event => {
  if (event.target !== dialog) return;
  const bounds = dialog.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
});

$$('[data-watch]').forEach(link => link.addEventListener('click', event => {
  const card = document.getElementById(`demo-${link.dataset.watch}`);
  if (!card) return;
  event.preventDefault();
  history.replaceState(null, '', `#${card.id}`);
  card.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start'});
  const video = card.querySelector('video');
  video.focus({preventScroll: true});
  play(video);
}));
// Stop background/off-screen playback, but allow a requested demo time to scroll into view.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (!entry.isIntersecting) entry.target.pause(); });
  }, {rootMargin: '100px', threshold: 0});
  demos.forEach(video => observer.observe(video));
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach(video => video.pause());
});

const interest = $('#interest');
$$('[data-option]').forEach(link => link.addEventListener('click', () => {
  const choice = [...interest.options].find(option => option.value === link.dataset.option);
  if (choice) interest.value = choice.value;
}));

const form = $('#builder-form');
const submit = $('#submit-button');
const feedback = $('#form-feedback');
const submitText = submit.querySelector('span');
let submitting = false;
form.addEventListener('submit', async event => {
  if (!window.fetch || !window.FormData) return; // Native POST is a progressive fallback.
  event.preventDefault();
  if (submitting || !form.reportValidity()) return;
  if (form.elements._gotcha.value) return;
  submitting = true;
  submit.disabled = true;
  submitText.textContent = 'Sending your enquiry…';
  feedback.hidden = true;
  feedback.classList.remove('error');
  const abort = new AbortController();
  const timeout = window.setTimeout(() => abort.abort(), 20000);
  try {
    const response = await fetch(form.action, {method: 'POST', body: new FormData(form), headers: {Accept: 'application/json'}, signal: abort.signal});
    if (!response.ok) throw new Error('The enquiry service did not accept the request.');
    feedback.textContent = 'Thanks — your builder enquiry has been sent. We’ll be in touch to talk through your project.';
    form.reset();
  } catch {
    feedback.classList.add('error');
    feedback.textContent = 'We couldn’t confirm that your enquiry was sent. Your details are still here. Please try again.';
  } finally {
    clearTimeout(timeout);
    submitting = false;
    submit.disabled = false;
    submitText.textContent = 'Start the conversation';
    feedback.hidden = false;
    feedback.focus({preventScroll: true});
  }
});
