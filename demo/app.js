// リボンコンプ支援ツール（モック実装）
// - 仕様: spec.md / db_doc.md を簡易に反映
// - 保存: localStorage（自動保存）

(function () {
  'use strict';

  // ------------------------------
  // モックデータ
  // ------------------------------
  const generations = [
    { id: '00000001', name: '第3世代' },
    { id: '00000002', name: '第4世代' },
    { id: '00000003', name: '第8世代' },
  ];

  const species = [
    { id: '000001', name: 'フシギダネ', limitLegend: false, availableGens: ['00000001', '00000002'] },
    { id: '000002', name: 'ピカチュウ', limitLegend: false, availableGens: ['00000001', '00000002', '00000003'] },
    { id: '000003', name: 'レックウザ', limitLegend: true, availableGens: ['00000001', '00000002', '00000003'] },
    { id: '000004', name: 'カイオーガ', limitLegend: true, availableGens: ['00000001', '00000002', '00000003'] },
  ];

  const ribbonsByGen = {
    '00000001': [
      { id: 'R000001', name: 'バトルタワーリボン', route: 'バトルタワーで勝利', limitLegend: true },
      { id: 'R000002', name: 'コンテスト・クール', route: 'クール部門で優勝', limitLegend: false, levelLimit: 20 },
      { id: 'R000003', name: '制限ありリボン', route: '特別ルール対象', limitLegend: true },
    ],
    '00000002': [
      { id: 'R000101', name: 'ハードバトルリボン', route: '上級バトルで勝利', limitLegend: true, levelLimit: 50 },
      { id: 'R000102', name: '努力リボン', route: 'なつき度MAX', limitLegend: false },
    ],
    '00000003': [
      { id: 'R000201', name: 'ランクバトルリボン', route: 'ランクバトル達成', limitLegend: false },
    ],
  };

  // ------------------------------
  // ユーティリティ
  // ------------------------------
  const STORAGE_KEY = 'user_pokemons_v1';
  const $ = (id) => document.getElementById(id);
  const byId = (arr, id) => arr.find((x) => x.id === id) || null;
  const genName = (id) => (byId(generations, id)?.name || '未設定');
  const spName = (id) => (byId(species, id)?.name || '未設定');
  const defer = (fn) => setTimeout(fn, 0);

  const load = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { return []; }
  };
  const save = (data) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };
  const uid = () => 'U' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  // ------------------------------
  // アプリ状態
  // ------------------------------
  let userPokemons = load();
  let selectedId = userPokemons[0]?.id || null;

  // ------------------------------
  // DOM参照
  // ------------------------------
  const leftPane = $('leftPane');
  const rightPane = $('rightPane');
  const addBtn = $('addBtn');
  const backBtn = $('backBtn');
  const searchInput = $('searchInput');
  const listEl = $('pokemonList');
  const speciesInput = $('speciesInput');
  const speciesDatalist = $('speciesDatalist');
  const generationSelect = $('generationSelect');
  const progressBadge = $('progressBadge');
  const nicknameInput = $('nicknameInput');
  const levelInput = $('levelInput');
  const legendBadge = $('legendBadge');
  const ribbonList = $('ribbonList');
  const checkAllBtn = $('checkAllBtn');
  const uncheckAllBtn = $('uncheckAllBtn');
  const themeToggleBtnLeft = document.getElementById('themeToggleBtnLeft');
  const themeToggleBtnRight = document.getElementById('themeToggleBtnRight');

  // ------------------------------
  // テーマ適用
  // ------------------------------
  const THEME_KEY = 'ui_theme_v1';
  function getTheme() {
    const v = localStorage.getItem(THEME_KEY);
    return v === 'light' ? 'light' : 'dark';
  }
  function applyTheme(theme) {
    const root = document.documentElement; // <html>
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme'); // デフォルト（ダーク）
    }
    const label = `テーマ: ${theme === 'light' ? 'ライト' : 'ダーク'}`;
    if (themeToggleBtnLeft) themeToggleBtnLeft.textContent = label;
    if (themeToggleBtnRight) themeToggleBtnRight.textContent = label;
  }
  function toggleTheme() {
    const next = getTheme() === 'light' ? 'dark' : 'light';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  // ------------------------------
  // レンダリング（左）
  // ------------------------------
  function filterBySearch(p) {
    const q = (searchInput.value || '').trim();
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      (p.nickname || '').toLowerCase().includes(s) ||
      spName(p.speciesId).toLowerCase().includes(s)
    );
  }

  function computeCounts(p) {
    const genId = p.now_generation_id;
    if (!genId) return { obtained: 0, total: 0 };
    const all = ribbonsByGen[genId] || [];
    const enabledIds = all
      .filter((r) => canObtainRibbon(p, r).ok)
      .map((r) => r.id);
    const progress = (p.progress?.[genId] || []).filter((id) => enabledIds.includes(id));
    return { obtained: progress.length, total: enabledIds.length };
  }

  function renderLeft() {
    listEl.innerHTML = '';
    const items = userPokemons.filter(filterBySearch);
    if (items.length === 0) {
      const div = document.createElement('div');
      div.className = 'empty';
      div.textContent = 'ポケモンが未登録です。新規追加から開始してください。';
      listEl.appendChild(div);
      return;
    }
    for (const p of items) {
      const card = document.createElement('div');
      card.className = 'card' + (p.id === selectedId ? ' active' : '');
      const title = document.createElement('div');
      const name = p.nickname || spName(p.speciesId) || '未設定';
      title.textContent = name;

      // 削除ボタン（カードの右上）
      const delBtn = document.createElement('button');
      delBtn.className = 'icon-btn delete';
      delBtn.type = 'button';
      delBtn.title = '削除';
      delBtn.textContent = '削除';
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ok = window.confirm('このポケモンを削除します。よろしいですか？');
        if (!ok) return;
        userPokemons = userPokemons.filter((x) => x.id !== p.id);
        if (selectedId === p.id) {
          selectedId = userPokemons[0]?.id || null;
        }
        persistAndRerender();
        if (isMobile()) {
          if (selectedId) gotoRight(); else gotoLeft();
        }
      });

      const meta = document.createElement('div');
      meta.className = 'meta';
      const counts = computeCounts(p);
      meta.innerHTML = `${genName(p.now_generation_id)} ・ <span class="count">${counts.obtained}/${counts.total}</span>`;

      card.appendChild(title);
      card.appendChild(delBtn);
      card.appendChild(meta);
      card.addEventListener('click', () => {
        selectedId = p.id;
        renderAll();
        gotoRight();
      });
      listEl.appendChild(card);
    }
  }

  // ------------------------------
  // レンダリング（右）
  // ------------------------------
  function setLegendBadge(p) {
    const sp = byId(species, p.speciesId);
    if (!sp) {
      legendBadge.textContent = '未設定';
      legendBadge.className = 'badge';
      return;
    }
    legendBadge.textContent = sp.limitLegend ? 'はい' : 'いいえ';
    legendBadge.className = 'badge ' + (sp.limitLegend ? 'warn' : 'ok');
  }

  function populateGenerationSelect(p) {
    generationSelect.innerHTML = '';
    const sp = byId(species, p.speciesId);
    const gens = sp ? sp.availableGens : [];
    for (const gid of gens) {
      const opt = document.createElement('option');
      opt.value = gid; opt.textContent = genName(gid);
      generationSelect.appendChild(opt);
    }
    if (gens.length === 0) {
      const opt = document.createElement('option');
      opt.value = ''; opt.textContent = '世代未選択';
      generationSelect.appendChild(opt);
    }
    generationSelect.value = p.now_generation_id || gens[0] || '';
    p.now_generation_id = generationSelect.value || null;
  }

  function canObtainRibbon(p, ribbon) {
    const sp = byId(species, p.speciesId);
    if (!sp) return { ok: false, reason: '種族未設定' };
    if (ribbon.limitLegend && sp.limitLegend) return { ok: false, reason: '禁止伝説は対象外' };
    const lvl = Number(p.met_level || 0);
    if (typeof ribbon.levelLimit === 'number' && lvl < ribbon.levelLimit) {
      return { ok: false, reason: `レベル不足: ${ribbon.levelLimit}以上` };
    }
    return { ok: true };
  }

  function renderRibbons(p) {
    ribbonList.innerHTML = '';
    const genId = p.now_generation_id;
    const list = (genId && ribbonsByGen[genId]) || [];
    const current = new Set(p.progress?.[genId] || []);
    for (const r of list) {
      const row = document.createElement('div');
      const cond = canObtainRibbon(p, r);
      row.className = 'ribbon-item' + (cond.ok ? '' : ' disabled');

      const cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.disabled = !cond.ok;
      cb.checked = current.has(r.id);
      cb.title = cond.ok ? '取得済みフラグ' : cond.reason;
      cb.addEventListener('change', () => {
        const set = new Set(p.progress?.[genId] || []);
        if (cb.checked) set.add(r.id); else set.delete(r.id);
        p.progress = p.progress || {};
        p.progress[genId] = Array.from(set);
        persistAndRerender();
      });

      const body = document.createElement('div');
      const name = document.createElement('div');
      name.textContent = r.name;
      const desc = document.createElement('div');
      desc.className = 'desc';
      let reason = '';
      if (!cond.ok) reason = `（${cond.reason}）`;
      const levelText = typeof r.levelLimit === 'number' ? ` / Lv${r.levelLimit}+` : '';
      desc.textContent = `${r.route}${levelText}${reason}`;

      body.appendChild(name);
      body.appendChild(desc);
      row.appendChild(cb);
      row.appendChild(body);
      ribbonList.appendChild(row);
    }
  }

  function renderProgress(p) {
    const { obtained, total } = computeCounts(p);
    progressBadge.textContent = `${obtained}/${total}`;
  }

  function renderRight() {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p) {
      // 右ペインを初期化
      speciesInput.value = '';
      generationSelect.innerHTML = '';
      nicknameInput.value = '';
      levelInput.value = '';
      legendBadge.textContent = '未設定';
      legendBadge.className = 'badge';
      ribbonList.innerHTML = '';
      progressBadge.textContent = '0/0';
      return;
    }

    speciesInput.value = spName(p.speciesId) || '';
    nicknameInput.value = p.nickname || '';
    levelInput.value = Number(p.met_level || 50);
    setLegendBadge(p);
    populateGenerationSelect(p);
    renderRibbons(p);
    renderProgress(p);
  }

  function renderAll() {
    renderLeft();
    renderRight();
  }

  // ------------------------------
  // 交互作用
  // ------------------------------
  function persistAndRerender() {
    save(userPokemons);
    renderAll();
  }

  addBtn.addEventListener('click', () => {
    const p = {
      id: uid(),
      nickname: '',
      speciesId: null,
      met_level: 50,
      now_generation_id: null,
      progress: {},
    };
    userPokemons.unshift(p);
    selectedId = p.id;
    persistAndRerender();
    gotoRight();
  });

  backBtn.addEventListener('click', gotoLeft);

  searchInput.addEventListener('input', () => {
    renderLeft();
  });

  nicknameInput.addEventListener('input', () => {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p) return;
    p.nickname = nicknameInput.value || '';
    persistAndRerender();
  });

  levelInput.addEventListener('change', () => {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p) return;
    let v = Number(levelInput.value || 0);
    if (!Number.isFinite(v)) v = 1;
    v = Math.max(1, Math.min(100, Math.floor(v)));
    p.met_level = v;
    persistAndRerender();
  });

  // 種族サジェスト（入力3文字以上で候補）
  speciesInput.addEventListener('input', () => {
    const q = speciesInput.value.trim();
    speciesDatalist.innerHTML = '';
    if (q.length < 1) return;
    const lc = q.toLowerCase();
    const hit = species.filter((s) => s.name.toLowerCase().includes(lc)).slice(0, 20);
    for (const s of hit) {
      const opt = document.createElement('option');
      opt.value = s.name;
      speciesDatalist.appendChild(opt);
    }
  });

  // datalistからの確定をchangeで拾う（完全一致したら確定）
  speciesInput.addEventListener('change', () => {
    const name = speciesInput.value.trim();
    const sp = species.find((s) => s.name === name);
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p) return;
    if (!sp) return; // 未知の入力は無視
    if (p.speciesId && p.speciesId !== sp.id) {
      const ok = window.confirm('種族を変更すると現在の進捗・設定がリセットされます。続行しますか？');
      if (!ok) {
        // 入力を元に戻す
        defer(() => { speciesInput.value = spName(p.speciesId) || ''; });
        return;
      }
      // リセット
      p.nickname = '';
      p.met_level = 50;
      p.progress = {};
      p.now_generation_id = null;
    }
    p.speciesId = sp.id;
    persistAndRerender();
  });

  generationSelect.addEventListener('change', () => {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p) return;
    p.now_generation_id = generationSelect.value || null;
    persistAndRerender();
  });

  checkAllBtn.addEventListener('click', () => {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p || !p.now_generation_id) return;
    const list = ribbonsByGen[p.now_generation_id] || [];
    const enable = list.filter((r) => canObtainRibbon(p, r).ok).map((r) => r.id);
    p.progress = p.progress || {};
    p.progress[p.now_generation_id] = enable.slice();
    persistAndRerender();
  });

  uncheckAllBtn.addEventListener('click', () => {
    const p = userPokemons.find((x) => x.id === selectedId);
    if (!p || !p.now_generation_id) return;
    p.progress = p.progress || {};
    p.progress[p.now_generation_id] = [];
    persistAndRerender();
  });

  // テーマ切替ボタン
  if (themeToggleBtnLeft) themeToggleBtnLeft.addEventListener('click', toggleTheme);
  if (themeToggleBtnRight) themeToggleBtnRight.addEventListener('click', toggleTheme);

  // ------------------------------
  // レイアウト切替（モバイル）
  // ------------------------------
  function isMobile() {
    return window.matchMedia('(max-width: 840px)').matches;
  }
  function gotoLeft() {
    if (!isMobile()) return; // PCでは常時2ペイン
    leftPane.classList.add('show');
    rightPane.classList.remove('show');
  }
  function gotoRight() {
    if (!isMobile()) return; // PCでは常時2ペイン
    leftPane.classList.remove('show');
    rightPane.classList.add('show');
  }
  function ensureInitialPane() {
    if (isMobile()) {
      if (selectedId) gotoRight(); else gotoLeft();
    } else {
      leftPane.classList.add('show');
      rightPane.classList.add('show');
    }
  }
  window.addEventListener('resize', ensureInitialPane);

  // 初期描画
  renderAll();
  ensureInitialPane();
  // 初期テーマ適用
  applyTheme(getTheme());
})();
