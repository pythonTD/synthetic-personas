/* Fetches news.txt, parses it, and renders entries.
   Format per line:  YYYY-MM-DD | Category | Text
   Lines starting with # or blank lines are ignored. */

async function loadNews() {
  let raw;
  try {
    const res = await fetch('news.txt', { cache: 'no-store' });
    if (!res.ok) throw new Error('not found');
    raw = await res.text();
  } catch (e) {
    return [];
  }

  const items = raw
    .split('\n')
    .map(l => l.trim())
    .filter(l => l && !l.startsWith('#'))
    .map(line => {
      const parts = line.split('|').map(p => p.trim());
      if (parts.length < 3) return null;
      const [date, category, ...rest] = parts;
      return { date, category, text: rest.join('|').trim() };
    })
    .filter(Boolean)
    .sort((a, b) => (a.date < b.date ? 1 : -1)); // newest first

  return items;
}

function formatDate(iso) {
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function renderNewsList(items, container) {
  if (!items.length) {
    container.innerHTML = '<p style="color: var(--slate);">No news items yet.</p>';
    return;
  }
  container.innerHTML = items.map(item => `
    <li class="news-item">
      <div class="news-date">${formatDate(item.date)}</div>
      <div class="news-body">
        <span class="news-tag">${escapeHTML(item.category)}</span>
        <p>${escapeHTML(item.text)}</p>
      </div>
    </li>
  `).join('');
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
