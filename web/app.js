/* Amiros Football Analytics — Mini App */

(function () {
  'use strict';

  const tg = window.Telegram && window.Telegram.WebApp ? window.Telegram.WebApp : null;

  // ---- State --------------------------------------------------------
  const state = {
    config: null,
    matches: { today: [], featured: [] },
    predictions: [],
    demoData: false,
    currentFilter: 'All',
    loaded: { matches: false, predictions: false, premium: false, stats: false },
  };

  // ---- Telegram init ------------------------------------------------
  function initTelegram() {
    if (!tg) return;
    try {
      tg.ready();
      tg.expand();
      // Best-effort theme integration; the CSS already defines a safe dark default.
      if (tg.setHeaderColor) {
        try { tg.setHeaderColor('#0a0f1c'); } catch (_) {}
      }
      if (tg.setBackgroundColor) {
        try { tg.setBackgroundColor('#0a0f1c'); } catch (_) {}
      }
    } catch (err) {
      console.warn('[app] Telegram init failed:', err);
    }
  }

  // ---- Helpers ------------------------------------------------------
  function el(id) { return document.getElementById(id); }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function api(path, options) {
    const opts = Object.assign({ headers: { 'Content-Type': 'application/json' } }, options || {});
    const res = await fetch(path, opts);
    if (!res.ok) {
      let body = null;
      try { body = await res.json(); } catch (_) {}
      const message = body && body.error ? body.error : 'Unable to load data.';
      throw new Error(message);
    }
    return res.json();
  }

  function confidenceClass(confidence) {
    const c = (confidence || '').toLowerCase();
    if (c === 'high') return 'pill-high';
    if (c === 'low') return 'pill-low';
    return 'pill-medium';
  }

  function formBadges(form) {
    if (!form) return '';
    return form
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 6)
      .map(function (r) {
        const letter = r[0].toUpperCase();
        return '<span class="form-badge form-' + escapeHtml(letter) + '">' + escapeHtml(letter) + '</span>';
      })
      .join('');
  }

  function openExternal(url) {
    if (!url) return;
    if (tg && tg.openTelegramLink) {
      try { tg.openTelegramLink(url); return; } catch (_) {}
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  // ---- Rendering ----------------------------------------------------
  function renderMatchCard(match, options) {
    const opts = options || {};
    const pred = match.prediction;
    const league = escapeHtml(match.league);
    const home = escapeHtml(match.homeTeam);
    const away = escapeHtml(match.awayTeam);
    const time = escapeHtml((match.matchTime || '').slice(0, 5));

    let predictionHtml = '';
    if (pred) {
      predictionHtml =
        '<div class="prediction-line">' +
          '<span class="label">Prediction:</span>' +
          '<strong>' + escapeHtml(pred.selection) + '</strong>' +
          '<span class="pill ' + confidenceClass(pred.confidence) + '">' + escapeHtml(pred.confidence) + '</span>' +
        '</div>' +
        (pred.reason
          ? '<div class="reason">' + escapeHtml(pred.reason) + '</div>'
          : '');
    }

    return (
      '<div class="card" data-match-id="' + match.id + '">' +
        '<div class="card-top">' +
          '<div class="league">' + league + '</div>' +
          '<div class="time-badge">' + (time || '--:--') + '</div>' +
        '</div>' +
        '<div class="teams">' +
          '<div class="team home">' + home + '</div>' +
          '<div class="vs">vs</div>' +
          '<div class="team away">' + away + '</div>' +
        '</div>' +
        predictionHtml +
        '<div class="btn-row">' +
          '<button class="btn btn-primary" data-action="analysis" data-match-id="' + match.id + '">View Analysis</button>' +
        '</div>' +
      '</div>'
    );
  }

  function renderFeatured() {
    const list = el('featuredList');
    const items = state.matches.featured && state.matches.featured.length
      ? state.matches.featured
      : state.matches.today.slice(0, 4);

    if (!items || items.length === 0) {
      list.innerHTML = '<div class="empty">No matches available right now.</div>';
      return;
    }
    list.innerHTML = items.map(function (m) { return renderMatchCard(m); }).join('');
  }

  function renderMatches() {
    const list = el('matchesList');
    if (!state.matches.today || state.matches.today.length === 0) {
      list.innerHTML = '<div class="empty">No matches available right now.</div>';
      return;
    }
    list.innerHTML = state.matches.today.map(function (m) { return renderMatchCard(m); }).join('');
  }

  function renderPredictions() {
    const list = el('predictionsList');
    let items = state.predictions || [];
    if (state.currentFilter !== 'All') {
      items = items.filter(function (p) { return p.market === state.currentFilter; });
    }
    if (items.length === 0) {
      list.innerHTML = '<div class="empty">No predictions available right now.</div>';
      return;
    }
    list.innerHTML = items.map(function (p) {
      const match = p.match || {};
      const home = escapeHtml(match.homeTeam || 'Match');
      const away = escapeHtml(match.awayTeam || '');
      const time = escapeHtml((match.matchTime || '').slice(0, 5));
      const league = escapeHtml(match.league || '');
      return (
        '<div class="card">' +
          '<div class="card-top">' +
            '<div class="league">' + league + '</div>' +
            '<div class="time-badge">' + (time || '') + '</div>' +
          '</div>' +
          '<div class="teams">' +
            '<div class="team home">' + home + '</div>' +
            '<div class="vs">vs</div>' +
            '<div class="team away">' + away + '</div>' +
          '</div>' +
          '<div class="rowline"><span class="label">Market:</span><span class="value">' + escapeHtml(p.market) + '</span></div>' +
          '<div class="rowline"><span class="label">Selection:</span><span class="value">' + escapeHtml(p.selection) + '</span></div>' +
          '<div class="prediction-line">' +
            '<span class="label">Analytical Confidence:</span>' +
            '<span class="pill ' + confidenceClass(p.confidence) + '">' + escapeHtml(p.confidence) + '</span>' +
          '</div>' +
          (p.reason ? '<div class="reason">' + escapeHtml(p.reason) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  function renderStats() {
    const list = el('statsList');
    // The statistics screen derives from matches list (each match has stats via /api/matches/:id).
    // We fetch details lazily when the user opens "View Analysis".
    if (!state.matches.today || state.matches.today.length === 0) {
      list.innerHTML = '<div class="empty">No statistics available right now.</div>';
      return;
    }
    list.innerHTML =
      '<div class="card">' +
        '<div class="muted">Select a match on the Matches tab and tap "View Analysis" to see detailed statistics (form, goals, possession, xG).</div>' +
      '</div>' +
      state.matches.today.slice(0, 6).map(function (m) {
        return (
          '<div class="card">' +
            '<div class="card-top">' +
              '<div class="league">' + escapeHtml(m.league) + '</div>' +
              '<div class="time-badge">' + escapeHtml((m.matchTime || '').slice(0, 5)) + '</div>' +
            '</div>' +
            '<div class="teams">' +
              '<div class="team home">' + escapeHtml(m.homeTeam) + '</div>' +
              '<div class="vs">vs</div>' +
              '<div class="team away">' + escapeHtml(m.awayTeam) + '</div>' +
            '</div>' +
            '<div class="btn-row">' +
              '<button class="btn btn-outline" data-action="analysis" data-match-id="' + m.id + '">View Analysis</button>' +
            '</div>' +
          '</div>'
        );
      }).join('');
  }

  function renderPremium() {
    const list = el('premiumList');
    const items = state.premium || [];
    if (items.length === 0) {
      list.innerHTML = '<div class="empty">Premium content is currently unavailable.</div>';
      return;
    }
    list.innerHTML = items.map(function (item) {
      return (
        '<div class="card">' +
          '<div class="league">' + escapeHtml(item.title) + '</div>' +
          '<div>' + escapeHtml(item.content) + '</div>' +
        '</div>'
      );
    }).join('');
  }

  function renderDemoNotice() {
    const notice = el('demoNotice');
    if (state.demoData) notice.hidden = false;
    else notice.hidden = true;
  }

  function updateAdminUsername() {
    if (state.config && state.config.adminUsername) {
      const label = '@' + state.config.adminUsername;
      el('adminUsername').textContent = label;
      el('contactAdmin').textContent = '💬 Message ' + label;
    }
  }

  // ---- Analysis modal ----------------------------------------------
  async function openAnalysis(matchId) {
    const modal = el('modal');
    const title = el('modalTitle');
    const body = el('modalBody');
    modal.hidden = false;
    title.textContent = 'Match Analysis';
    body.innerHTML = '<div class="empty">Loading analysis…</div>';

    try {
      const data = await api('/api/matches/' + encodeURIComponent(matchId));
      const match = data.match;
      if (!match) throw new Error('Match not found.');

      title.textContent = match.homeTeam + ' vs ' + match.awayTeam;

      const stats = match.statistics;
      const pred = match.prediction;

      const formHtml = stats
        ? '<div class="stat"><div class="k">Home Form</div><div class="form-badges">' + formBadges(stats.homeForm) + '</div></div>' +
          '<div class="stat"><div class="k">Away Form</div><div class="form-badges">' + formBadges(stats.awayForm) + '</div></div>'
        : '';

      const statsHtml = stats
        ? '<div class="stat-grid">' +
            '<div class="stat"><div class="k">Home Goals</div><div class="v">' + stats.homeGoals + '</div></div>' +
            '<div class="stat"><div class="k">Away Goals</div><div class="v">' + stats.awayGoals + '</div></div>' +
            '<div class="stat"><div class="k">Home Possession</div><div class="v">' + stats.homePossession + '%</div></div>' +
            '<div class="stat"><div class="k">Away Possession</div><div class="v">' + stats.awayPossession + '%</div></div>' +
            '<div class="stat"><div class="k">Home xG</div><div class="v">' + stats.homeXg.toFixed(1) + '</div></div>' +
            '<div class="stat"><div class="k">Away xG</div><div class="v">' + stats.awayXg.toFixed(1) + '</div></div>' +
          '</div>'
        : '<div class="empty">No statistics available for this match.</div>';

      const predHtml = pred
        ? '<div class="card">' +
            '<div class="rowline"><span class="label">Market:</span><span class="value">' + escapeHtml(pred.market) + '</span></div>' +
            '<div class="rowline"><span class="label">Selection:</span><span class="value">' + escapeHtml(pred.selection) + '</span></div>' +
            '<div class="prediction-line"><span class="label">Analytical Confidence:</span>' +
              '<span class="pill ' + confidenceClass(pred.confidence) + '">' + escapeHtml(pred.confidence) + '</span></div>' +
            (pred.reason ? '<div class="reason">' + escapeHtml(pred.reason) + '</div>' : '') +
          '</div>'
        : '';

      body.innerHTML =
        '<div class="card">' +
          '<div class="card-top">' +
            '<div class="league">' + escapeHtml(match.league) + '</div>' +
            '<div class="time-badge">' + escapeHtml((match.matchTime || '').slice(0, 5)) + '</div>' +
          '</div>' +
          '<div class="teams">' +
            '<div class="team home">' + escapeHtml(match.homeTeam) + '</div>' +
            '<div class="vs">vs</div>' +
            '<div class="team away">' + escapeHtml(match.awayTeam) + '</div>' +
          '</div>' +
        '</div>' +
        '<h3 class="section-title">Match Overview</h3>' +
        '<div class="stat-grid">' +
          '<div class="stat"><div class="k">Date</div><div class="v">' + escapeHtml(match.matchDate) + '</div></div>' +
          '<div class="stat"><div class="k">Time</div><div class="v">' + escapeHtml((match.matchTime || '').slice(0, 5)) + '</div></div>' +
          '<div class="stat"><div class="k">Status</div><div class="v">' + escapeHtml(match.status) + '</div></div>' +
          '<div class="stat"><div class="k">League</div><div class="v" style="font-size:12px">' + escapeHtml(match.league) + '</div></div>' +
        '</div>' +
        '<h3 class="section-title">Recent Form</h3>' +
        '<div class="stat-grid">' + formHtml + '</div>' +
        '<h3 class="section-title">Statistics</h3>' +
        statsHtml +
        '<h3 class="section-title">Prediction &amp; Reasoning</h3>' +
        predHtml +
        '<p class="muted small">Analysis only — no outcome is guaranteed.</p>';
    } catch (err) {
      body.innerHTML = '<div class="empty">Unable to load match information. Please try again.</div>';
      console.warn('[app] analysis error:', err);
    }
  }

  function closeModal() {
    el('modal').hidden = true;
    el('modalBody').innerHTML = '';
  }

  // ---- Loading ------------------------------------------------------
  async function loadConfig() {
    try {
      state.config = await api('/api/config');
      updateAdminUsername();
    } catch (err) {
      console.warn('[app] config load failed:', err);
    }
  }

  async function loadMatches() {
    if (state.loaded.matches) return;
    try {
      const data = await api('/api/matches');
      state.matches = { today: data.today || [], featured: data.featured || [] };
      state.demoData = !!data.demoData;
      state.loaded.matches = true;
      renderFeatured();
      renderMatches();
      renderStats();
      renderDemoNotice();
    } catch (err) {
      el('featuredList').innerHTML = '<div class="empty">Unable to load match information. Please try again.</div>';
      el('matchesList').innerHTML = '<div class="empty">Unable to load match information. Please try again.</div>';
      el('statsList').innerHTML = '<div class="empty">Unable to load match information. Please try again.</div>';
      console.warn('[app] matches error:', err);
    }
  }

  async function loadPredictions() {
    if (state.loaded.predictions) return;
    try {
      const data = await api('/api/predictions');
      state.predictions = data.predictions || [];
      state.demoData = state.demoData || !!data.demoData;
      state.loaded.predictions = true;
      renderPredictions();
      renderDemoNotice();
    } catch (err) {
      el('predictionsList').innerHTML = '<div class="empty">Unable to load predictions. Please try again.</div>';
      console.warn('[app] predictions error:', err);
    }
  }

  async function loadPremium() {
    if (state.loaded.premium) return;
    try {
      const data = await api('/api/premium');
      state.premium = data.items || [];
      state.demoData = state.demoData || !!data.demoData;
      state.loaded.premium = true;
      renderPremium();
      renderDemoNotice();
    } catch (err) {
      el('premiumList').innerHTML = '<div class="empty">Premium content is currently unavailable.</div>';
      console.warn('[app] premium error:', err);
    }
  }

  async function registerUser() {
    if (!tg || !tg.initData) return;
    try {
      await api('/api/users', {
        method: 'POST',
        body: JSON.stringify({ initData: tg.initData }),
      });
    } catch (err) {
      console.warn('[app] user registration failed:', err);
    }
  }

  // ---- Tabs ---------------------------------------------------------
  function setTab(name) {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.classList.toggle('active', tab.dataset.tab === name);
    });
    document.querySelectorAll('.panel').forEach(function (panel) {
      panel.classList.toggle('active', panel.id === 'panel-' + name);
    });
    if (name === 'matches') loadMatches();
    if (name === 'predictions') loadPredictions();
    if (name === 'premium') loadPremium();
    if (name === 'home') loadMatches();
  }

  function bindTabs() {
    document.querySelectorAll('.tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        setTab(tab.dataset.tab);
      });
    });
  }

  function bindChips() {
    document.querySelectorAll('#predictionFilters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('#predictionFilters .chip').forEach(function (c) {
          c.classList.remove('active');
        });
        chip.classList.add('active');
        state.currentFilter = chip.dataset.filter || 'All';
        renderPredictions();
      });
    });
  }

  function bindActions() {
    // Delegated click for "View Analysis"
    document.addEventListener('click', function (event) {
      const target = event.target.closest('[data-action="analysis"]');
      if (target) {
        const id = Number(target.getAttribute('data-match-id'));
        if (Number.isInteger(id) && id > 0) openAnalysis(id);
      }
    });

    el('modalClose').addEventListener('click', closeModal);
    el('modal').addEventListener('click', function (event) {
      if (event.target === el('modal')) closeModal();
    });

    const contactButtons = ['contactAdmin', 'premiumContact'];
    contactButtons.forEach(function (id) {
      const btn = el(id);
      if (btn) {
        btn.addEventListener('click', function () {
          const url = state.config && state.config.adminChatUrl
            ? state.config.adminChatUrl
            : 'https://t.me/Amiros10';
          openExternal(url);
        });
      }
    });

    const channelButtons = ['joinChannelTop', 'premiumChannel', 'contactChannel', 'footerChannel'];
    channelButtons.forEach(function (id) {
      const btn = el(id);
      if (btn) {
        btn.addEventListener('click', function () {
          const url = state.config && state.config.channelUrl
            ? state.config.channelUrl
            : 'https://t.me/Amiros_1';
          openExternal(url);
        });
      }
    });
  }

  // ---- Boot ---------------------------------------------------------
  async function boot() {
    initTelegram();
    bindTabs();
    bindChips();
    bindActions();
    await loadConfig();
    await Promise.all([loadMatches(), loadPredictions(), loadPremium()]);
    registerUser();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
