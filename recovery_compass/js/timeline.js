import { CAPTIONS } from './config.js';

const STEP_MS   = 1100;
const ICON_PLAY = `<svg viewBox="0 0 10 10" fill="currentColor"><polygon points="2,1 9,5 2,9"/></svg>`;
const ICON_PAUS = `<svg viewBox="0 0 10 10" fill="currentColor"><rect x="1.5" y="1" width="2.8" height="8" rx="0.5"/><rect x="5.7" y="1" width="2.8" height="8" rx="0.5"/></svg>`;

// Bind the year slider, play/pause button, and keyboard arrow keys to `updateFn`.
// Returns a `stopPlay` function so other modules (e.g. drag) can halt playback.
export function setupTimeline(updateFn, initialYear) {
  const $slider = document.getElementById('year-slider');
  const $btn    = document.getElementById('btn-play');
  let playTimer   = null;
  let currentYear = initialYear;

  function stopPlay() {
    if (playTimer) { clearTimeout(playTimer); playTimer = null; }
    $btn.innerHTML = ICON_PLAY;
  }

  function scheduleNext(fromYear) {
    const next = fromYear + 1;
    if (next > 2024) { stopPlay(); return; }
    playTimer = setTimeout(() => {
      currentYear   = next;
      $slider.value = next;
      updateFn(next);
      playTimer = setTimeout(() => scheduleNext(next), STEP_MS);
    }, STEP_MS);
  }

  function startPlay() {
    $btn.innerHTML = ICON_PAUS;
    if (currentYear >= 2024) {
      currentYear   = 2019;
      $slider.value = 2019;
      updateFn(2019);
    }
    scheduleNext(currentYear);
  }

  $slider.addEventListener('input', () => {
    stopPlay();
    currentYear = +$slider.value;
    updateFn(currentYear);
  });

  $btn.addEventListener('click', () => {
    if (playTimer) stopPlay(); else startPlay();
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && currentYear < 2024) {
      stopPlay();
      currentYear++;
      $slider.value = currentYear;
      updateFn(currentYear);
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && currentYear > 2019) {
      stopPlay();
      currentYear--;
      $slider.value = currentYear;
      updateFn(currentYear);
      e.preventDefault();
    }
  });

  return stopPlay;
}

// Update the year label and annotation text below the compass.
export function setCaption(year) {
  const c = CAPTIONS[year] || {};
  document.getElementById('yc-year').textContent = year;
  document.getElementById('yc-text').textContent = c.text || '';
}
