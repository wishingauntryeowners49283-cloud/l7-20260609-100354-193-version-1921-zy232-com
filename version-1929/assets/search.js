import { movieIndex } from './search-index.js';

const form = document.querySelector('[data-search-form]');
const input = document.querySelector('[data-search-input]');
const results = document.querySelector('[data-search-results]');
const status = document.querySelector('[data-search-status]');
const panel = document.querySelector('[data-filter-panel]');
const params = new URLSearchParams(window.location.search);

if (input) {
  input.value = params.get('q') || '';
}

const escapeHtml = function (value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const card = function (movie) {
  const tags = (movie.tags || []).slice(0, 3).map(function (tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  return '<article class="movie-card">'
    + '<a class="poster-link" href="' + escapeHtml(movie.url) + '" aria-label="' + escapeHtml(movie.title) + '">'
    + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">'
    + '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>'
    + '<span class="poster-year">' + escapeHtml(movie.year) + '</span>'
    + '</a>'
    + '<div class="movie-card-body">'
    + '<h3><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h3>'
    + '<p>' + escapeHtml(movie.oneLine) + '</p>'
    + '<div class="movie-meta-line"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.genre) + '</span></div>'
    + '<div class="tag-row">' + tags + '</div>'
    + '</div>'
    + '</article>';
};

const selected = function (name) {
  const el = panel ? panel.querySelector('[data-filter-select="' + name + '"]') : null;
  return el ? el.value : '';
};

const render = function () {
  if (!results) {
    return;
  }

  const term = (input ? input.value : '').trim().toLowerCase();
  const year = selected('year');
  const type = selected('type');
  const category = selected('category');

  let list = movieIndex.filter(function (movie) {
    const haystack = [
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.categoryName,
      movie.oneLine,
      (movie.tags || []).join(' ')
    ].join(' ').toLowerCase();

    return (!term || haystack.includes(term))
      && (!year || movie.year === year)
      && (!type || String(movie.type || '').includes(type))
      && (!category || movie.category === category);
  });

  if (!term && !year && !type && !category) {
    list = movieIndex.slice().sort(function (a, b) {
      return b.views - a.views;
    }).slice(0, 72);
  }

  status.textContent = term ? '搜索结果' : '热门内容';
  results.innerHTML = list.map(card).join('') || '<div class="text-block"><h2>暂无匹配内容</h2><p>可尝试更换关键词、年份、类型或分类。</p></div>';
};

if (form) {
  form.addEventListener('submit', function (event) {
    event.preventDefault();
    render();
    const next = new URL(window.location.href);
    const value = input ? input.value.trim() : '';
    if (value) {
      next.searchParams.set('q', value);
    } else {
      next.searchParams.delete('q');
    }
    window.history.replaceState({}, '', next.toString());
  });
}

if (input) {
  input.addEventListener('input', render);
}

if (panel) {
  Array.from(panel.querySelectorAll('select')).forEach(function (select) {
    select.addEventListener('change', render);
  });
}

render();
