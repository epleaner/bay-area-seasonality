const state = {
  data: null,
  view: 'now',
  filter: 'all',
  query: '',
  sort: 'peak',
  month: new Date().getMonth() + 1
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function normalized(value) {
  return value.toLocaleLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filteredProduce(month = null) {
  const query = normalized(state.query.trim());
  return state.data.produce.filter((item) => {
    const matchesMonth = month === null || item.months.includes(month);
    const matchesFilter = state.filter === 'all' || item.category === state.filter;
    const matchesQuery = !query || normalized(item.name).includes(query) || normalized(item.id).includes(query);
    return matchesMonth && matchesFilter && matchesQuery;
  });
}

function sortedProduce(items, month) {
  return [...items].sort((a, b) => {
    if (state.sort === 'peak') {
      const peakDifference = Number(b.peak.includes(month)) - Number(a.peak.includes(month));
      if (peakDifference) return peakDifference;
    }
    return normalized(a.name).localeCompare(normalized(b.name));
  });
}

function monthById(id) {
  return state.data.months.find((month) => month.id === id);
}

function renderMonthRail() {
  $('#month-rail').innerHTML = state.data.months.map((month) => `
    <button class="month-button ${month.id === state.month ? 'is-active' : ''} ${month.id === new Date().getMonth() + 1 ? 'is-current' : ''}"
      type="button" role="tab" aria-selected="${month.id === state.month}" aria-label="${month.name}"
      data-month="${month.id}">${month.short}</button>
  `).join('');
}

function itemMarkup(item, month) {
  const isPeak = item.peak.includes(month);
  return `<li class="produce-item"><span class="produce-name">${item.name}</span><span class="season-chip ${isPeak ? 'is-peak' : ''}">${isPeak ? '' : 'in season'}</span></li>`;
}

const CATEGORY_LABELS = { fruit: 'Fruit', vegetable: 'Vegetables', herb: 'Herbs', nut: 'Nuts' };

function groupMarkup(category, items) {
  return `<section class="produce-group" aria-labelledby="${category}-heading">
    <div class="produce-group__head"><span class="category-label" data-category="${category}" id="${category}-heading">${CATEGORY_LABELS[category]}</span><span class="category-total">${items.length} listed</span></div>
    <ul class="produce-list">${items.map((item) => itemMarkup(item, state.month)).join('')}</ul>
  </section>`;
}

function renderNow() {
  const month = monthById(state.month);
  const items = sortedProduce(filteredProduce(state.month), state.month);
  const grouped = Object.keys(CATEGORY_LABELS).map((category) => [category, items.filter((item) => item.category === category)]);
  $('#selected-month-season').textContent = `${month.season} / ${month.id.toString().padStart(2, '0')}`;
  $('#selected-month-title').textContent = month.name;
  $('#now-result-count').textContent = `${items.length} ${items.length === 1 ? 'item' : 'items'}`;
  $('#now-groups').innerHTML = grouped.filter(([, categoryItems]) => categoryItems.length).map(([category, categoryItems]) => groupMarkup(category, categoryItems)).join('');
}

function monthCardMarkup(month) {
  const items = sortedProduce(filteredProduce(month.id), month.id);
  const grouped = Object.keys(CATEGORY_LABELS).map((category) => [category, items.filter((item) => item.category === category)]);
  const list = (group) => group.map((item) => `<span>${item.name}</span>`).join('');
  return `<article class="month-card ${month.id === state.month ? 'is-selected' : ''}" data-month-card="${month.id}" tabindex="0" role="button" aria-label="Browse ${month.name}">
    <div class="month-card__head"><span class="month-card__name">${month.name}</span><span class="month-card__count">${items.length} items</span></div>
    ${grouped.filter(([, categoryItems]) => categoryItems.length).map(([category, categoryItems]) => `<div class="month-card__section"><p class="month-card__label">${CATEGORY_LABELS[category]}</p><p class="month-card__items">${list(categoryItems)}</p></div>`).join('')}
    ${!items.length ? '<p class="month-card__items">No matches</p>' : ''}
  </article>`;
}


function renderAll() {
  $('#all-result-count').textContent = `${filteredProduce().length} of ${state.data.produce.length} produce shown`;
  $('#month-overview').innerHTML = state.data.months.map(monthCardMarkup).join('');
}

function matrixCategory() {
  return state.filter === 'all' ? 'fruit' : state.filter;
}

function matrixItems() {
  return sortedProduce(filteredProduce().filter((item) => item.category === matrixCategory()), state.month);
}

function matrixCellMarkup(item, month) {
  const isPeak = item.peak.includes(month.id);
  const isInSeason = item.months.includes(month.id);
  const status = isPeak ? 'peak' : isInSeason ? 'in-season' : 'off';
  const label = isPeak ? 'Peak' : isInSeason ? 'In season' : 'Off season';
  return `<td class="matrix-cell matrix-cell--${status}" data-state="${status}" aria-label="${month.name}: ${label}" title="${month.name}: ${label}"><span class="sr-only">${label}</span></td>`;
}

function renderMatrix() {
  const category = matrixCategory();
  const items = matrixItems();
  $('#matrix-title').textContent = `${CATEGORY_LABELS[category]} by month`;
  $('#matrix-result-count').textContent = `${items.length} ${items.length === 1 ? 'row' : 'rows'}`;
  $('#matrix-shell').innerHTML = `<table class="matrix-table">
    <caption class="sr-only">${CATEGORY_LABELS[category]} seasonality by month</caption>
    <thead><tr><th scope="col">Produce</th>${state.data.months.map((month) => `<th scope="col">${month.short}</th>`).join('')}</tr></thead>
    <tbody>${items.map((item) => `<tr><th scope="row">${item.name}</th>${state.data.months.map((month) => matrixCellMarkup(item, month)).join('')}</tr>`).join('')}</tbody>
  </table>`;
}


function renderCounts() {
  const monthItems = state.data.produce.filter((item) => item.months.includes(state.month));
  $('#count-all').textContent = monthItems.length;
  $('#count-fruit').textContent = monthItems.filter((item) => item.category === 'fruit').length;
  $('#count-vegetable').textContent = monthItems.filter((item) => item.category === 'vegetable').length;
  $('#count-herb').textContent = monthItems.filter((item) => item.category === 'herb').length;
  $('#count-nut').textContent = monthItems.filter((item) => item.category === 'nut').length;
}

function render() {
  renderMonthRail();
  renderCounts();
  renderNow();
  renderAll();
  renderMatrix();
  const hasResults = state.view === 'now'
    ? filteredProduce(state.month).length > 0
    : state.view === 'matrix'
      ? matrixItems().length > 0
      : filteredProduce().length > 0;
  $('#empty-state').hidden = hasResults;
  $('#now-view').hidden = state.view !== 'now';
  $('#all-view').hidden = state.view !== 'all';
  $('#matrix-view').hidden = state.view !== 'matrix';
}
function setView(view) {
  state.view = view;
  $$('.view-tab').forEach((tab) => {
    const active = tab.dataset.view === view;
    tab.classList.toggle('is-active', active);
    tab.setAttribute('aria-selected', active.toString());
  });
  render();
}

function setFilter(filter) {
  state.filter = filter;
  $$('.filter-button').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', active.toString());
  });
  render();
}

function setSort(sort) {
  state.sort = sort;
  render();
}

function selectMonth(month) {
  state.month = Number(month);
  render();
  if (state.view === 'now') $('#now-view').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSources() {
  $('#source-list').innerHTML = state.data.sources.map((source) => `<div class="source-list__item">
    <div class="source-list__meta">${source.publisher} · ${source.published ? `Published ${source.published}` : `Updated ${source.updated}`}</div>
    <p class="source-list__title"><a href="${source.url}" target="_blank" rel="noopener">${source.title} ↗</a></p>
    <div class="source-list__meta">${source.usedFor}</div>
  </div>`).join('');
}

$('#month-rail').addEventListener('click', (event) => {
  const button = event.target.closest('[data-month]');
  if (button) selectMonth(button.dataset.month);
});

$('#month-overview').addEventListener('click', (event) => {
  const card = event.target.closest('[data-month-card]');
  if (card) { state.month = Number(card.dataset.monthCard); setView('now'); }
});
$('#month-overview').addEventListener('keydown', (event) => {
  const card = event.target.closest('[data-month-card]');
  if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); state.month = Number(card.dataset.monthCard); setView('now'); }
});
$$('.view-tab').forEach((tab) => tab.addEventListener('click', () => setView(tab.dataset.view)));
$$('.filter-button').forEach((button) => button.addEventListener('click', () => setFilter(button.dataset.filter)));
$('#sort-select').addEventListener('change', (event) => setSort(event.target.value));
$('#search-input').addEventListener('input', (event) => { state.query = event.target.value; render(); });
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && document.activeElement !== $('#search-input')) { event.preventDefault(); $('#search-input').focus(); }
  if (event.key === 'Escape' && document.activeElement === $('#search-input')) { $('#search-input').value = ''; state.query = ''; render(); }
});

const dialog = $('#sources-dialog');
$('#sources-button').addEventListener('click', () => dialog.showModal());
$('#sources-close').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });

try {
  const response = await fetch('/data/produce.json');
  if (!response.ok) throw new Error(`Could not load data (${response.status})`);
  state.data = await response.json();
  renderSources();
  render();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
} catch (error) {
  console.error(error);
  $('#now-groups').innerHTML = '<p class="empty-state">The seasonal notes could not be loaded. Refresh to try again.</p>';
}
