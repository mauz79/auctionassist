// Soglie badge
const AFF_HIGH    = 75;  // Affidabilità 2024 ≥ 75
const FM24_HIGH   = 6.7; // Fantamedia 2024 > 6.7
const MV_STOR_HIGH= 6.1; // MV media storico > 6.1
const FM_STOR_HIGH= 6.7; // FM media storico > 6.7

const state = { idx: [], s2025: null, s2024: null, storico: null };

// --- Tema chiaro/scuro (salvato in localStorage) ---
(function initTheme(){
  const saved = localStorage.getItem('theme');
  if(saved==='light' || saved==='dark') document.body.setAttribute('data-theme', saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    document.body.setAttribute('data-theme','light');
  }
  const btn = document.getElementById('themeToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      const cur = document.body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.body.setAttribute('data-theme', cur);
      localStorage.setItem('theme', cur);
    });
  }
})();

async function loadJSON(p){ const r = await fetch(p); if(!r.ok) throw new Error('Load '+p); return r.json(); }

async function bootstrap(){
  [state.idx, state.s2025, state.s2024, state.storico] = await Promise.all([
    loadJSON('data/index.json'),  // indice ricerca (dalla 2025)
    loadJSON('data/2025.json'),
    loadJSON('data/2024.json'),
    loadJSON('data/storico.json')
  ]);
  mountEvents();
}

function searchByName(q){
  q = q.trim().toLowerCase();
  if(q.length < 2) return [];
  return state.idx.filter(r => r.nome && r.nome.toLowerCase().includes(q)).slice(0,24);
}
function getByCod(arr,cod){ return arr.find(x => x.cod === cod); }
function formatLabelSeason(y){ const next = Number(y)+1; return `${y} (${y}–${next})`; }

function renderBadges(p2024, stor){
  const badges = [];
  const aff = stor?.affidabilita_2024;
  if (aff != null && Number(aff) >= AFF_HIGH)    badges.push(`<span class="badge good">Affidabilità 2024 alta (${Number(aff)})</span>`);
  const mv24 = Number(p2024?.mv);
  if (!Number.isNaN(mv24) && mv24 > 6)           badges.push(`<span class="badge good">MV ${formatLabelSeason(2024)} > 6</span>`);
  const fm24 = Number(p2024?.fm);
  if (!Number.isNaN(fm24) && fm24 > FM24_HIGH)   badges.push(`<span class="badge good">FM ${formatLabelSeason(2024)} > ${FM24_HIGH}</span>`);
  const mvMed = Number(stor?.mv_media);
  if (!Number.isNaN(mvMed) && mvMed > MV_STOR_HIGH) badges.push(`<span class="badge good">MV media storico > ${MV_STOR_HIGH}</span>`);
  const fmMed = Number(stor?.fm_media);
  if (!Number.isNaN(fmMed) && fmMed > FM_STOR_HIGH) badges.push(`<span class="badge good">FM media storico > ${FM_STOR_HIGH}</span>`);
  return badges.length ? `<div class="badges">${badges.join('')}</div>` : '';
}

function renderSection(y, rec, isKeeper){
  const rows = [];
  const push = (k,v)=>rows.push(`<div class="kv"><div class="k">${k}</div><div class="v">${v ?? '—'}</div></div>`);
  push('Squadra', rec?.squadra); push('Ruolo', rec?.ruolo); push('Presenze', rec?.presenze);
  push('Media Voto', rec?.mv);   push('Fantamedia', rec?.fm);
  if (isKeeper){ push('Gol Subiti', rec?.gs); push('Rigori Parati', rec?.rp); }
  else { push('Gol', rec?.gol); push('Assist', rec?.assist); push('Ammonizioni', rec?.ammonizioni); push('Espulsioni', rec?.espulsioni); }
  return `<div class="section"><h2>${formatLabelSeason(y)}</h2><div class="grid">${rows.join('')}</div></div>`;
}

function renderStorico(st){
  if (!st) return '';
  const rows=[]; const push=(k,v)=>rows.push(`<div class="kv"><div class="k">${k}</div><div class="v">${v ?? '—'}</div></div>`);
  push('MV media', st.mv_media); push('FM media', st.fm_media); push('Gol medi', st.gol_medi);
  push('Assist medi', st.assist_medi); push('Ammonizioni medie', st.ammonizioni_medie); push('Espulsioni medie', st.espulsioni_medie);
  return `<div class="section"><h2>Storico (medie ultime stagioni)</h2><div class="grid">${rows.join('')}</div></div>`;
}

// Foto: prova img/<COD>.jpg → .jpeg → .png → .webp, poi placeholder
function loadPlayerPhoto(cod){
  const img = document.getElementById(`photo-${cod}`);
  if(!img) return;
  const base = `img/${cod}`; const candidates = [`${base}.jpg`,`${base}.jpeg`,`${base}.png`,`${base}.webp`];
  let i=0; const fallback='img/placeholder.svg';
  img.onerror = () => { i++; img.src = (i < candidates.length) ? candidates[i] : fallback; };
  img.src = candidates[0];
}

function renderPlayer(cod){
  const p2025 = getByCod(state.s2025, cod); if (!p2025) return '<p class="muted">Giocatore non trovato nella stagione 2025.</p>';
  const p2024 = getByCod(state.s2024, cod);
  const stor  = state.storico[String(cod)] || state.storico[cod];
  const isKeeper = (p2025.ruolo||'').toUpperCase().startsWith('P');

  const header = `
    <div class="section">
      <h2>${p2025.nome}</h2>
      <div class="photo">
        <img id="photo-${p2025.cod}" alt="Foto ${p2025.nome}"/>
        <div class="grid">
          <div class="kv"><div class="k">COD</div><div class="v">${p2025.cod}</div></div>
          <div class="kv"><div class="k">Ruolo (2025)</div><div class="v">${p2025.ruolo ?? '—'}</div></div>
          <div class="kv"><div class="k">Squadra (2025)</div><div class="v">${p2025.squadra ?? '—'}</div></div>
          <div class="kv"><div class="k">Ruolo (2024)</div><div class="v">${p2024?.ruolo ?? '—'}</div></div>
          <div class="kv"><div class="k">Squadra (2024)</div><div class="v">${p2024?.squadra ?? '—'}</div></div>
        </div>
      </div>
      ${renderBadges(p2024, stor)}
    </div>`;
  const s25 = renderSection(2025, p2025, isKeeper);
  const s24 = renderSection(2024, p2024, isKeeper);
  const st  = renderStorico(stor);

  setTimeout(()=> loadPlayerPhoto(p2025.cod), 0);
  return header + s25 + s24 + st;
}

function mountEvents(){
  const input = document.getElementById('search');
  const list  = document.getElementById('suggestions');
  const out   = document.getElementById('content');

  input.addEventListener('input', e => {
    const q=e.target.value; const res = searchByName(q);
    list.innerHTML = res.map(r => `<li data-cod="${r.cod}">${r.nome}</li>`).join('');
    list.classList.toggle('show', res.length>0 && q.length>=2);
  });

  document.addEventListener('click', e => {
    const li = e.target.closest('li[data-cod]'); if (!li) return;
    const cod = Number(li.getAttribute('data-cod'));
    out.innerHTML = renderPlayer(cod);
    list.classList.remove('show');
  });
}

bootstrap().catch(err => {
  document.getElementById('content').innerHTML = `<p class="muted">Errore: ${err.message}</p>`;
});
