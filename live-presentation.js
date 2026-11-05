/* Presentation only: no database writes, score calculations or transport changes. */
(function (global) {
  'use strict';
  const t = global.LiveI18n.t;
  const preferences = new Map();
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numeric = value => typeof value === 'number' && Number.isFinite(value);
  function summarize(data, mode) {
    const players = (Array.isArray(data.players) ? data.players : []).slice()
      .sort((a,b) => (numeric(b.totalPoints) ? b.totalPoints : 0) - (numeric(a.totalPoints) ? a.totalPoints : 0));
    let lastPoints, rank = 0;
    const ranked = players.map((p,index) => {
      const points = numeric(p.totalPoints) ? p.totalPoints : 0;
      if (index === 0 || points !== lastPoints) rank = index + 1;
      lastPoints = points;
      return {...p, points, rank};
    });
    const matches = Array.isArray(data.matches) ? data.matches : [];
    const pointsPerRound = data.pointsPerRound ?? data.pointsperround;
    const played = matches.filter(m => numeric(m.scoreA) && (numeric(m.scoreB) || (mode === 'mexicano' && numeric(pointsPerRound))));
    const rounds = new Set(played.map(m => m.round ?? m.roundIndex).filter(r => numeric(r) && r > 0));
    return {ranked, games:played.length, rounds:rounds.size,
      points:played.reduce((sum,m) => sum + m.scoreA + (numeric(m.scoreB) ? m.scoreB : pointsPerRound - m.scoreA),0),
      finished: !!(data.isFinished ?? data.isfinished)};
  }
  function finalMarkup(summary) {
    const podium = summary.ranked.filter(p => p.rank <= 3);
    return `<div class="final-hero"><div><p class="eyebrow">${t('finalEyebrow')}</p><h2>${t('finalStandings')}</h2><p>${t('thanks')}</p></div><img class="final-mascot" src="bueno-mascot.png" alt="${t('mascot')}" width="160" height="200"></div>
      <div class="final-stats" aria-label="${t('stats')}">${[[summary.ranked.length,t('participants')],[summary.games,t('playedMatches')],[summary.rounds,t('playedRounds')],[summary.points,t('playedPoints')]].map(([n,label])=>`<div><strong>${n}</strong><span>${label}</span></div>`).join('')}</div>
      ${podium.length ? `<div class="podium" aria-label="${t('awards')}">${podium.map(p=>`<article class="podium-place place-${p.rank}"><span class="medal" aria-label="${t('rank')} ${p.rank}">${p.rank === 1 ? '♛' : p.rank}</span><span class="podium-rank">${t('place', {rank:p.rank})}</span><h3>${escape(p.name || '–')}</h3><p>${p.points} <span>${t('pointsWord')}</span></p></article>`).join('')}</div>` : `<p class="empty-results">${t('emptyResults')}</p>`}
      <h3 class="section-heading final-table-heading">${t('allStandings')}</h3><table class="final-table" aria-label="${t('finalLabel')}"><thead><tr><th>${t('rank')}</th><th>${t('playerTeam')}</th><th class="right">${t('points')}</th><th class="right">±50</th></tr></thead><tbody>${summary.ranked.map(p=>`<tr><td>${p.rank}.</td><td>${escape(p.name || '–')}</td><td class="right">${p.points}</td><td class="right">${escape(p.pm50 ?? '–')}</td></tr>`).join('')}</tbody></table><p class="ranking-note">${t('ties')}</p>
      <div class="final-partners" aria-label="Bueno Padel, Seinä-Joe Padel &amp; Bueno Sport Bar"><img src="bueno-padel.png" alt="Bueno Padel" width="512" height="205"><img src="seina-joe.png" alt="Seinä-Joe Padel" width="512" height="512"><span><img src="bueno-sport-bar.png" alt="Bueno Sport Bar" width="512" height="512"></span></div>`;
  }
  function update(data, mode) {
    const main = document.querySelector('main');
    const table = mode === 'americano' ? document.getElementById('rows')?.closest('table') : document.querySelector('#root table');
    if (!main || !table) return;
    const summary = summarize(data, mode);
    const key = `gonapadel:standings:${mode}:${new URLSearchParams(location.search).get('id') || ''}`;
    let details = document.getElementById('standings-toggle');
    if (!details) {
      details = document.createElement('details');
      details.id = 'standings-toggle'; details.className = 'standings-toggle';
      const heading = document.createElement('summary');
      heading.innerHTML = `<span>${t('standings')}</span><span class="toggle-label"><span class="when-open">${t('hide')}</span><span class="when-closed">${t('show')}</span><span class="toggle-chevron" aria-hidden="true">⌄</span></span>`;
      details.append(heading);
      const content = mode === 'mexicano' ? table.closest('.card') : table;
      content.before(details); details.append(content);
      if (mode === 'americano') {
        document.getElementById('standings-heading')?.remove();
      }
      if (!preferences.has(key)) {
        let open = true;
        try { open = sessionStorage.getItem(key) !== 'hidden'; } catch (_) { /* Private mode */ }
        preferences.set(key, open);
      }
      details.open = preferences.get(key);
      details.addEventListener('toggle', () => {
        if (!details.isConnected) return;
        preferences.set(key,details.open);
        try { sessionStorage.setItem(key, details.open ? 'visible' : 'hidden'); } catch (_) { /* Private mode */ }
      });
    }
    details.hidden = summary.finished;
    let finale = document.getElementById('tournament-finale');
    if (summary.finished) {
      if (!finale) { finale = document.createElement('section'); finale.id = 'tournament-finale'; finale.className = 'tournament-finale'; finale.setAttribute('aria-label',t('finalLabel')); details.before(finale); }
      const html = finalMarkup(summary);
      if (finale.innerHTML !== html) finale.innerHTML = html;
    } else if (finale) finale.remove();
  }
  global.LivePresentation = {update,summarize,finalMarkup};
})(typeof window !== 'undefined' ? window : globalThis);
