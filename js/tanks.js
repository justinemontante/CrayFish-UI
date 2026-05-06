// TANKS — Lifecycle Management

// ─── TAB SWITCHING ───────────────────────────────────────────
document.querySelectorAll('.tank-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tank-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tank-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tank-panel-${tab.dataset.tank}`).classList.add('active');
    });
});

// ─── TANK 1: BREEDING INNER TABS ─────────────────────────────
document.querySelectorAll('.breed-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.breed-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.breed-panel').forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`breed-${tab.dataset.breed}`).classList.add('active');
    });
});

// ─── STOCK POOL ──────────────────────────────────────────────
let stockPool = [];

function getNextStockId(gender) {
    const prefix = gender === 'male' ? 'M' : 'F';
    const nums = stockPool.filter(s => s.gender === gender).map(s => parseInt(s.id.replace(prefix, '')));
    return prefix + (nums.length > 0 ? Math.max(...nums) + 1 : 1);
}

function renderStock() {
    const grid = document.getElementById('stock-pool-grid');
    if (stockPool.length === 0) {
        grid.innerHTML = `<p class="stock-pool-empty"><i class="bi bi-inbox"></i> No crayfish yet. Add your first one!</p>`;
        return;
    }
    const males = stockPool.filter(s => s.gender === 'male');
    const females = stockPool.filter(s => s.gender === 'female');
    let html = '';
    if (males.length > 0) {
        html += `<p class="stock-group-label"><i class="bi bi-gender-male"></i> Males (${males.length})</p>`;
        males.forEach((s) => {
            const i = stockPool.indexOf(s);
            const photoHTML = s.photo
                ? `<img src="${s.photo}" alt="" />`
                : `<div class="stock-photo-placeholder"><i class="bi bi-camera"></i></div>`;
            html += `
            <div class="stock-card">
                <div class="stock-card-photo">${photoHTML}</div>
                <div class="stock-card-info">
                    <div class="stock-card-top">
                        <span class="stock-card-tag male">Male ${s.id}</span>
                        <div class="stock-card-actions">
                            <button class="stock-card-edit" data-index="${i}"><i class="bi bi-pencil-fill"></i></button>
                            <button class="stock-card-remove" data-index="${i}"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    if (females.length > 0) {
        html += `<p class="stock-group-label"><i class="bi bi-gender-female"></i> Females (${females.length})</p>`;
        females.forEach((s) => {
            const i = stockPool.indexOf(s);
            const photoHTML = s.photo
                ? `<img src="${s.photo}" alt="" />`
                : `<div class="stock-photo-placeholder"><i class="bi bi-camera"></i></div>`;
            html += `
            <div class="stock-card">
                <div class="stock-card-photo">${photoHTML}</div>
                <div class="stock-card-info">
                    <div class="stock-card-top">
                        <span class="stock-card-tag female">Female ${s.id}</span>
                        <div class="stock-card-actions">
                            <button class="stock-card-edit" data-index="${i}"><i class="bi bi-pencil-fill"></i></button>
                            <button class="stock-card-remove" data-index="${i}"><i class="bi bi-trash-fill"></i></button>
                        </div>
                    </div>
                </div>
            </div>`;
        });
    }
    grid.innerHTML = html;

    grid.querySelectorAll('.stock-card-remove').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            stockPool.splice(parseInt(btn.dataset.index), 1);
            renderStock();
        });
    });

    grid.querySelectorAll('.stock-card-edit').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            openEditStockModal(parseInt(btn.dataset.index));
        });
    });
}

let stockEditIndex = null;

function openStockModal() {
    stockEditIndex = null;
    document.getElementById('stock-id-field').value = getNextStockId(stockGender);
    document.getElementById('stock-save-btn').textContent = 'Add to Stock';
    setStockPhoto(null);
    stockOverlay.classList.add('show');
    stockModal.classList.add('show');
}

function openEditStockModal(index) {
    const s = stockPool[index];
    stockEditIndex = index;
    stockGender = s.gender;
    document.getElementById('stock-modal-title').textContent = 'Edit ' + (s.gender === 'male' ? 'Male' : 'Female');
    document.getElementById('stock-id-label').textContent = (s.gender === 'male' ? 'Male' : 'Female') + ' ID';
    document.getElementById('stock-id-field').value = s.id;
    document.getElementById('stock-save-btn').textContent = 'Save Changes';
    setStockPhoto(s.photo || null);
    stockOverlay.classList.add('show');
    stockModal.classList.add('show');
}

// ── STOCK ADD MODAL ──
const stockOverlay = document.getElementById('stock-overlay');
const stockModal = document.getElementById('stock-modal');
let stockGender = 'male';
let stockCurrentPhoto = null;

const stockPhotoInput = document.getElementById('stock-photo-input');
const stockPhotoImg = document.getElementById('stock-photo-img');
const stockPhotoIcon = document.getElementById('stock-photo-icon');
const stockPhotoRemove = document.getElementById('stock-photo-remove');

document.getElementById('stock-photo-btn').addEventListener('click', () => stockPhotoInput.click());
document.getElementById('stock-camera-btn').addEventListener('click', () => {
    stockPhotoInput.setAttribute('capture', 'environment');
    stockPhotoInput.click();
});

stockPhotoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setStockPhoto(e.target.result);
    reader.readAsDataURL(file);
    this.value = '';
});

stockPhotoRemove.addEventListener('click', () => setStockPhoto(null));

function setStockPhoto(src) {
    stockCurrentPhoto = src;
    if (src) {
        stockPhotoImg.src = src;
        stockPhotoImg.style.display = 'block';
        stockPhotoIcon.style.display = 'none';
        stockPhotoRemove.style.display = 'inline-flex';
    } else {
        stockPhotoImg.src = '';
        stockPhotoImg.style.display = 'none';
        stockPhotoIcon.style.display = 'block';
        stockPhotoRemove.style.display = 'none';
    }
}

document.getElementById('stock-add-male').addEventListener('click', () => {
    stockGender = 'male';
    document.getElementById('stock-modal-title').textContent = 'Add Male';
    document.getElementById('stock-id-label').textContent = 'Male ID';
    document.getElementById('stock-id-field').value = getNextStockId('male');
    openStockModal();
});
document.getElementById('stock-add-female').addEventListener('click', () => {
    stockGender = 'female';
    document.getElementById('stock-modal-title').textContent = 'Add Female';
    document.getElementById('stock-id-label').textContent = 'Female ID';
    document.getElementById('stock-id-field').value = getNextStockId('female');
    openStockModal();
});

function openStockModal() {
    setStockPhoto(null);
    stockOverlay.classList.add('show');
    stockModal.classList.add('show');
}

function closeStockModal() {
    stockOverlay.classList.remove('show');
    stockModal.classList.remove('show');
}

stockOverlay.addEventListener('click', closeStockModal);
document.getElementById('stock-cancel-btn').addEventListener('click', closeStockModal);

document.getElementById('stock-save-btn').addEventListener('click', () => {
    const id = document.getElementById('stock-id-field').value;
    if (stockEditIndex !== null) {
        stockPool[stockEditIndex].id = id;
        stockPool[stockEditIndex].photo = stockCurrentPhoto;
        stockEditIndex = null;
    } else {
        stockPool.push({ id, gender: stockGender, color: '', age: null, photo: stockCurrentPhoto, inGroup: null });
    }
    renderStock();
    closeStockModal();
});

renderStock();

// ── BERRIED BRIDGE SECTION ──
function renderBerriedBridge() {
    const list = document.getElementById('berried-bridge-list');
    if (!list) return;
    const occupied = isoBBoxes.filter(b => b.occupant.trim() !== '' && b.date && !b.completed);

    if (occupied.length === 0) {
        list.innerHTML = `<p class="bridge-empty"><i class="bi bi-egg-fill"></i> No berried females in isolation yet.</p>`;
        return;
    }

    const today = new Date();
    list.innerHTML = occupied.map(b => {
        const placed = new Date(b.date + 'T00:00:00');
        const dayIn = Math.max(Math.floor((today - placed) / 86400000), 0);
        const total = 25;
        const pct = Math.min(Math.round((dayIn / total) * 100), 100);
        const ready = dayIn >= 18;
        const boxIdx = isoBBoxes.indexOf(b);

        let fromGroup = '';
        for (let gi = 0; gi < breedGroups.length; gi++) {
            const g = breedGroups[gi];
            if ((g.berriedTags || []).some(f => b.occupant.includes(f))) {
                fromGroup = g.name;
                break;
            }
        }

        return `
        <div class="berried-bridge-card${ready ? ' ready' : ''}" data-box-index="${boxIdx}">
            <div class="bridge-left">
                <span class="bridge-female-tag"><i class="bi bi-egg-fill"></i> ${b.occupant}</span>
                ${fromGroup ? `<span class="bridge-from">From: ${fromGroup}</span>` : ''}
            </div>
            <div class="bridge-arrow"><i class="bi bi-arrow-right"></i></div>
            <div class="bridge-right">
                <span class="bridge-box-tag">📦 ${b.name}</span>
                <span class="bridge-day">Day ${dayIn}/${total}</span>
            </div>
            <div class="bridge-progress-wrap">
                <div class="tank-progress-bar"><div class="tank-progress-fill teal" style="width:${pct}%"></div></div>
                <span class="bridge-pct">${pct}%</span>
            </div>
            ${ready ? `<div class="bridge-ready-banner"><i class="bi bi-check-circle-fill"></i> Ready to transfer</div>` : ''}
        </div>`;
    }).join('');

    list.querySelectorAll('.berried-bridge-card').forEach(card => {
        card.addEventListener('click', () => openIsoDetail(parseInt(card.dataset.boxIndex)));
    });
}

// ─── HATCHING MINI CHARTS ─────────────────────────────────────
const hatchChartInstances = {};

function initHatchChart(id, data) {
    const ctx = document.getElementById(id);
    if (!ctx) return;
    if (hatchChartInstances[id]) hatchChartInstances[id].destroy();
    hatchChartInstances[id] = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map((_, i) => `D${i + 1}`),
            datasets: [{ data, borderColor: '#1fa5a5', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(31,165,165,0.08)' }]
        },
        options: { plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } }, animation: false }
    });
}

function renderHatchCards() {
    const container = document.getElementById('hatch-card-list');
    const banner    = document.getElementById('hatch-transfer-banner');
    const occupied  = isoBBoxes.filter(b => b.occupant.trim() !== '' && b.date);

    if (occupied.length === 0) {
        container.innerHTML = `<p style="font-size:11px;color:var(--dark-text);opacity:0.35;text-align:center;padding:20px 0">No females in isolation yet.</p>`;
        banner.style.display = 'none';
        return;
    }

    const today = new Date();
    let hasReadyToTransfer = false;

    container.innerHTML = occupied.map((b, idx) => {
        const placed  = new Date(b.date + 'T00:00:00');
        const dayIn   = Math.max(Math.floor((today - placed) / 86400000), 0);
        const total   = 25;
        const pct     = Math.min(Math.round((dayIn / total) * 100), 100);
        const etaDate = new Date(placed);
        etaDate.setDate(etaDate.getDate() + total);
        const eta     = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const chartId = `hatch-chart-${idx}`;
        if (dayIn >= 18) hasReadyToTransfer = true;
        return `
        <div class="hatch-card">
          <div class="hatch-card-top">
            <div>
              <p class="hatch-female">${b.occupant} – ${b.name}</p>
              <span class="hatch-label incubating">Incubating</span>
            </div>
            <div class="hatch-day-badge">Day ${dayIn} / ${total}</div>
          </div>
          <div class="hatch-progress-wrap">
            <div class="tank-progress-bar">
              <div class="tank-progress-fill teal" style="width:${pct}%"></div>
            </div>
            <span class="hatch-pct">${pct}%</span>
          </div>
          <p class="hatch-eta"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</p>
          <canvas class="hatch-mini-chart" id="${chartId}" height="50"></canvas>
        </div>`;
    }).join('');

    // init mini charts after render
    occupied.forEach((b, idx) => {
        const placed = new Date(b.date + 'T00:00:00');
        const dayIn  = Math.max(Math.floor((today - placed) / 86400000), 0);
        const data   = Array.from({ length: dayIn + 1 }, (_, i) => Math.round((i / 25) * 100));
        initHatchChart(`hatch-chart-${idx}`, data);
    });

    banner.style.display = hasReadyToTransfer ? 'flex' : 'none';
}

initHatchChart('hatch-chart-f2', []);
initHatchChart('hatch-chart-f4', []);

// ─── BREEDING GROUPS DATA & RENDER ───────────────────────────
let breedGroups = [];

function renderGroups() {
    const list = document.getElementById('breed-group-list');
    list.innerHTML = breedGroups.map((g, i) => {
        const femalePills = g.femaleTags.map(f => {
            const isBerried = g.berriedTags && g.berriedTags.includes(f);
            if (isBerried) {
                return `<span class="breed-female-tag berried">${f} <i class="bi bi-egg-fill"></i></span>`;
            }
            return `
            <span class="breed-female-row">
              <span class="breed-female-tag">${f}</span>
              <button class="berried-tag-btn" data-group="${i}" data-female="${f}"><i class="bi bi-egg-fill"></i> Berried</button>
            </span>`;
        }).join('');
        const dateStr = g.date
            ? new Date(g.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : '—';
        const photoHTML = g.photo
            ? `<img src="${g.photo}" alt="Group photo" style="width:100%;height:100%;object-fit:cover;border-radius:12px" />`
            : `<div class="breed-group-photo-placeholder"><i class="bi bi-camera"></i></div>`;
        return `
        <div class="breed-group-card" data-index="${i}" style="cursor:pointer">
          <div class="breed-group-photo">${photoHTML}</div>
          <div class="breed-group-info">
            <div class="breed-group-top">
              <span class="breed-group-name">${g.name}</span>
              <div class="breed-group-actions">
                <button class="breed-icon-btn edit" data-index="${i}"><i class="bi bi-pencil-fill"></i></button>
                <button class="breed-icon-btn delete" data-index="${i}"><i class="bi bi-trash-fill"></i></button>
              </div>
            </div>
            <div class="breed-group-members">
              <span class="breed-member-tag male">♂ 1 Male (${g.maleTag})</span>
              <span class="breed-member-tag female">♀ ${g.femaleTags.length} Female${g.femaleTags.length !== 1 ? 's' : ''}</span>
            </div>
            <div class="breed-female-tags">
              ${g.femaleTags.length > 0 ? '<p class="breed-female-list-label">Females:</p>' : ''}
              ${femalePills}
            </div>
            <div class="breed-group-meta"><i class="bi bi-calendar3"></i><span>Mating Date: ${dateStr}</span></div>
          </div>
        </div>`;
    }).join('');

    list.querySelectorAll('.breed-icon-btn.edit').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openGroupModal(parseInt(btn.dataset.index)); });
    });
    list.querySelectorAll('.breed-icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openDeleteModal('group', parseInt(btn.dataset.index)); });
    });
    list.querySelectorAll('.berried-tag-btn').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openBerriedModal(parseInt(btn.dataset.group), btn.dataset.female); });
    });
    list.querySelectorAll('.breed-group-card').forEach(card => {
        card.addEventListener('click', () => openGroupDetail(parseInt(card.dataset.index)));
    });
}

// ─── FEMALE CHECKBOX LIST (for group modal) ──────────────────
let bmSelectedFemales = [];

function renderFemaleChecks(isEdit = false, currentGroupName = '') {
    const container = document.getElementById('bm-female-checks');
    let available;
    if (isEdit) {
        available = stockPool.filter(s => s.gender === 'female' && (!s.inGroup || s.inGroup === currentGroupName));
    } else {
        available = stockPool.filter(s => s.gender === 'female' && !s.inGroup);
    }
    if (available.length === 0) {
        container.innerHTML = `<p class="stock-check-empty">No available females in stock.</p>`;
        return;
    }
    container.innerHTML = available.map(f => {
        const checked = bmSelectedFemales.includes(f.id);
        return `
        <div class="stock-check-item${checked ? ' checked' : ''}" data-id="${f.id}">
            <div class="stock-check-box"><i class="bi bi-check"></i></div>
            <span class="stock-check-label">${f.id}</span>
            <span class="stock-check-detail">${f.color || '—'} · ${f.age ? f.age + 'd' : '—'}</span>
        </div>`;
    }).join('');

    container.querySelectorAll('.stock-check-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            if (bmSelectedFemales.includes(id)) {
                bmSelectedFemales = bmSelectedFemales.filter(f => f !== id);
            } else {
                bmSelectedFemales.push(id);
            }
            renderFemaleChecks(isEdit, currentGroupName);
        });
    });
}

// ─── GROUP DETAIL MODAL ──────────────────────────────────────
const grpDetailOverlay = document.getElementById('grp-detail-overlay');
const grpDetailModal   = document.getElementById('grp-detail-modal');

function openGroupDetail(index) {
    const g = breedGroups[index];
    const today = new Date();

    // header
    document.getElementById('grp-detail-name').textContent = g.name;
    const photoEl = document.getElementById('grp-detail-photo');
    photoEl.innerHTML = g.photo
        ? `<img src="${g.photo}" alt="" style="width:100%;height:100%;object-fit:cover" />`
        : `<i class="bi bi-camera"></i>`;
    document.getElementById('grp-detail-members').innerHTML =
        `<span class="breed-member-tag male">♂ 1 Male (${g.maleTag})</span>
         <span class="breed-member-tag female">♀ ${g.femaleTags.length} Female${g.femaleTags.length !== 1 ? 's' : ''}</span>`;
    const dateStr = g.date
        ? new Date(g.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '—';
    document.getElementById('grp-detail-date').innerHTML =
        `<i class="bi bi-calendar3"></i><span>Mating Date: ${dateStr}</span>`;

    // berried females
    const berried = g.berriedTags || [];
    const berriedEl = document.getElementById('grp-detail-berried');
    berriedEl.innerHTML = berried.length > 0
        ? berried.map(f => `<span class="grp-berried-tag"><i class="bi bi-egg-fill"></i> ${f}</span>`).join(' ')
        : `<p class="grp-berried-empty">No berried females yet.</p>`;

    // hatching status
    const hatchEl = document.getElementById('grp-detail-hatch');
    const hatchItems = isoBBoxes.filter(b => b.occupant && b.date && berried.some(f => b.occupant.includes(f)));
    if (hatchItems.length === 0) {
        hatchEl.innerHTML = `<p class="grp-berried-empty">No females in isolation yet.</p>`;
    } else {
        hatchEl.innerHTML = hatchItems.map(b => {
            const placed  = new Date(b.date + 'T00:00:00');
            const dayIn   = Math.max(Math.floor((today - placed) / 86400000), 0);
            const total   = 25;
            const pct     = Math.min(Math.round((dayIn / total) * 100), 100);
            const etaDate = new Date(placed);
            etaDate.setDate(etaDate.getDate() + total);
            const eta = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            return `
            <div class="grp-hatch-item">
              <div class="grp-hatch-top">
                <span class="grp-hatch-name">${b.occupant} – ${b.name}</span>
                <span class="grp-hatch-badge">Day ${dayIn} / ${total}</span>
              </div>
              <div class="hatch-progress-wrap">
                <div class="tank-progress-bar"><div class="tank-progress-fill teal" style="width:${pct}%"></div></div>
                <span class="hatch-pct">${pct}%</span>
              </div>
              <p class="grp-hatch-eta"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</p>
            </div>`;
        }).join('');
    }

    // AI insights from live sensor values
    const temp = document.getElementById('val-temp')?.textContent || '--';
    const ph   = document.getElementById('val-ph')?.textContent  || '--';
    const doV  = document.getElementById('val-do')?.textContent  || '--';
    const tempNum = parseFloat(temp), phNum = parseFloat(ph), doNum = parseFloat(doV);
    const tempOk = !isNaN(tempNum) && tempNum >= 24 && tempNum <= 30;
    const phOk   = !isNaN(phNum)   && phNum   >= 7.0 && phNum   <= 8.5;
    const doOk   = !isNaN(doNum)   && doNum   >= 5.0;

    document.getElementById('grp-ai-temp').textContent = isNaN(tempNum) ? '--' : temp + '°C';
    document.getElementById('grp-ai-ph').textContent   = isNaN(phNum)   ? '--' : ph;
    document.getElementById('grp-ai-do').textContent   = isNaN(doNum)   ? '--' : doV + ' mg/L';

    const setBadge = (id, ok) => {
        const el = document.getElementById(id);
        el.textContent = ok ? 'Ideal' : 'Check';
        el.className   = `ai-param-badge ${ok ? 'ideal' : 'warn'}`;
        el.closest('.ai-param-card').className = `ai-param-card ${ok ? 'ideal' : 'warn'}`;
    };
    setBadge('grp-ai-temp-badge', tempOk);
    setBadge('grp-ai-ph-badge',   phOk);
    setBadge('grp-ai-do-badge',   doOk);

    const allOk  = tempOk && phOk && doOk;
    const someOk = tempOk || phOk || doOk;
    document.getElementById('grp-ai-msg').textContent = allOk
        ? '"All conditions are optimal for breeding and egg development."'
        : someOk
        ? '"Some parameters need attention. Monitor closely for best results."'
        : '"Water conditions are not ideal. Adjust before breeding."';

    grpDetailOverlay.classList.add('show');
    grpDetailModal.classList.add('show');
}

function closeGroupDetail() {
    grpDetailOverlay.classList.remove('show');
    grpDetailModal.classList.remove('show');
}

grpDetailOverlay.addEventListener('click', closeGroupDetail);
document.getElementById('grp-detail-close').addEventListener('click', closeGroupDetail);

// ─── BERRIED ASSIGN MODAL ────────────────────────────────────
const berriedOverlay = document.getElementById('berried-overlay');
const berriedModal   = document.getElementById('berried-modal');
let berriedContext   = { groupIndex: null, femaleTag: null };

function openBerriedModal(groupIndex, femaleTag) {
    berriedContext = { groupIndex, femaleTag };
    document.getElementById('berried-modal-title').innerHTML = `<i class="bi bi-egg-fill"></i> Mark ${femaleTag} as Berried`;
    document.getElementById('berried-modal-sub').textContent = 'Select an available isolation box to assign her to.';

    const availableBoxes = isoBBoxes.filter(b => b.occupant.trim() === '' && !b.completed);
    const boxList = document.getElementById('berried-box-list');

    if (availableBoxes.length === 0) {
        boxList.innerHTML = `<p class="berried-no-boxes">No available boxes.<br>Add or free up an isolation box first.</p>`;
    } else {
        boxList.innerHTML = availableBoxes.map(b => {
            const idx = isoBBoxes.indexOf(b);
            return `<button class="berried-box-btn" data-box-index="${idx}">
                <span>📦 ${b.name}</span>
                <span>Available → Assign</span>
            </button>`;
        }).join('');
        boxList.querySelectorAll('.berried-box-btn').forEach(btn => {
            btn.addEventListener('click', () => confirmBerriedAssign(parseInt(btn.dataset.boxIndex)));
        });
    }

    berriedOverlay.classList.add('show');
    berriedModal.classList.add('show');
}

function closeBerriedModal() {
    berriedOverlay.classList.remove('show');
    berriedModal.classList.remove('show');
}

function confirmBerriedAssign(boxIndex) {
    const { groupIndex, femaleTag } = berriedContext;
    // mark female as berried in group
    if (!breedGroups[groupIndex].berriedTags) breedGroups[groupIndex].berriedTags = [];
    breedGroups[groupIndex].berriedTags.push(femaleTag);
    // assign to isolation box
    const today = new Date().toISOString().split('T')[0];
    isoBBoxes[boxIndex].occupant = `Female ${femaleTag}`;
    isoBBoxes[boxIndex].date = today;
    isoBBoxes[boxIndex].completed = false;
    // re-render both
    renderGroups();
    renderIsoBoxes();
    renderBerriedBridge();
    closeBerriedModal();
}

berriedOverlay.addEventListener('click', closeBerriedModal);
document.getElementById('berried-cancel-btn').addEventListener('click', closeBerriedModal);

// ─── GROUP MODAL ─────────────────────────────────────────────
const breedOverlay  = document.getElementById('breed-modal-overlay');
const breedModal    = document.getElementById('breed-modal');
let bmCurrentPhoto  = null;

const bmPhotoInput  = document.getElementById('bm-photo-input');
const bmPhotoImg    = document.getElementById('bm-photo-img');
const bmPhotoIcon   = document.getElementById('bm-photo-icon');
const bmPhotoRemove = document.getElementById('bm-photo-remove');

document.getElementById('bm-photo-btn').addEventListener('click', () => bmPhotoInput.click());

bmPhotoInput.addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => setModalPhoto(e.target.result);
    reader.readAsDataURL(file);
    this.value = '';
});

bmPhotoRemove.addEventListener('click', () => setModalPhoto(null));

function setModalPhoto(src) {
    bmCurrentPhoto = src;
    if (src) {
        bmPhotoImg.src = src;
        bmPhotoImg.style.display = 'block';
        bmPhotoIcon.style.display = 'none';
        bmPhotoRemove.style.display = 'inline-flex';
    } else {
        bmPhotoImg.src = '';
        bmPhotoImg.style.display = 'none';
        bmPhotoIcon.style.display = 'block';
        bmPhotoRemove.style.display = 'none';
    }
}

function openGroupModal(editIndex = null) {
    const isEdit = editIndex !== null;
    document.getElementById('breed-modal-title').textContent = isEdit ? 'Edit Group' : 'Create Group';
    document.getElementById('bm-edit-index').value = isEdit ? editIndex : '';
    if (isEdit) {
        const g = breedGroups[editIndex];
        document.getElementById('bm-name').value = g.name;
        document.getElementById('bm-date').value = g.date;
        bmSelectedFemales = [...g.femaleTags];

        const maleSelect = document.getElementById('bm-male-select');
        const males = stockPool.filter(s => s.gender === 'male' && (!s.inGroup || s.inGroup === g.name));
        maleSelect.innerHTML = `<option value="">— Select male —</option>` +
            males.map(m => `<option value="${m.id}"${m.id === g.maleTag ? ' selected' : ''}>${m.id} ${m.color ? '· ' + m.color : ''}</option>`).join('');
    } else {
        document.getElementById('bm-name').value = '';
        document.getElementById('bm-date').value = '';
        bmSelectedFemales = [];

        const males = stockPool.filter(s => s.gender === 'male' && !s.inGroup);
        document.getElementById('bm-male-select').innerHTML = `<option value="">— Select male —</option>` +
            males.map(m => `<option value="${m.id}">${m.id} ${m.color ? '· ' + m.color : ''}</option>`).join('');
    }
    renderFemaleChecks(isEdit, isEdit ? breedGroups[editIndex].name : '');
    setModalPhoto(null);
    breedOverlay.classList.add('show');
    breedModal.classList.add('show');
}

function closeGroupModal() {
    breedOverlay.classList.remove('show');
    breedModal.classList.remove('show');
}

document.getElementById('add-group-btn').addEventListener('click', () => openGroupModal());
breedOverlay.addEventListener('click', closeGroupModal);
document.getElementById('bm-cancel-btn').addEventListener('click', closeGroupModal);

document.getElementById('bm-save-btn').addEventListener('click', () => {
    const name = document.getElementById('bm-name').value.trim();
    const maleTag = document.getElementById('bm-male-select').value;
    const femaleTags = [...bmSelectedFemales];
    const date = document.getElementById('bm-date').value;
    const photo = bmCurrentPhoto;

    const nameEl = document.getElementById('bm-name');
    const maleEl = document.getElementById('bm-male-select');
    const dateEl = document.getElementById('bm-date');
    [nameEl, maleEl, dateEl].forEach(el => el.style.borderColor = '');

    let valid = true;
    if (!name) { nameEl.style.borderColor = '#E63946'; valid = false; }
    if (!maleTag) { maleEl.style.borderColor = '#E63946'; valid = false; }
    if (!date) { dateEl.style.borderColor = '#E63946'; valid = false; }
    if (femaleTags.length === 0) {
        document.getElementById('bm-female-checks').style.borderColor = '#E63946';
        valid = false;
    } else {
        document.getElementById('bm-female-checks').style.borderColor = '';
    }
    if (!valid) return;

    const editIndex = document.getElementById('bm-edit-index').value;

    if (editIndex !== '') {
        const oldGroup = breedGroups[parseInt(editIndex)];
        stockPool.forEach(s => {
            if (s.id === oldGroup.maleTag || oldGroup.femaleTags.includes(s.id)) {
                if (!femaleTags.includes(s.id) && s.id !== maleTag) s.inGroup = null;
            }
        });
        breedGroups[parseInt(editIndex)] = { name, maleTag, femaleTags, date, photo, berriedTags: breedGroups[parseInt(editIndex)].berriedTags || [] };
    } else {
        breedGroups.push({ name, maleTag, femaleTags, date, photo, berriedTags: [] });
    }

    stockPool.forEach(s => {
        if (s.id === maleTag) s.inGroup = name;
        if (femaleTags.includes(s.id)) s.inGroup = name;
    });

    renderGroups();
    renderStock();
    closeGroupModal();
});

// ─── SHARED DELETE MODAL ──────────────────────────────────────
const deleteOverlay = document.getElementById('breed-delete-overlay');
const deleteModal   = document.getElementById('breed-delete-modal');
let deleteContext   = { type: null, index: null };

function openDeleteModal(type, index) {
    deleteContext = { type, index };
    const titleEl = document.querySelector('#breed-delete-modal .mortality-title');
    const subEl   = document.querySelector('#breed-delete-modal .mortality-sub');
    if (type === 'group') {
        titleEl.textContent = 'Delete Group';
        subEl.textContent   = 'Are you sure you want to delete this group?';
    } else {
        titleEl.textContent = 'Delete Box';
        subEl.textContent   = `Delete "${isoBBoxes[index].name}"? This cannot be undone.`;
    }
    deleteOverlay.classList.add('show');
    deleteModal.classList.add('show');
}

function closeDeleteModal() {
    deleteOverlay.classList.remove('show');
    deleteModal.classList.remove('show');
}

deleteOverlay.addEventListener('click', closeDeleteModal);
document.getElementById('bd-cancel-btn').addEventListener('click', closeDeleteModal);
document.getElementById('bd-confirm-btn').addEventListener('click', () => {
    if (deleteContext.type === 'group') {
        const g = breedGroups[deleteContext.index];
        stockPool.forEach(s => {
            if (s.id === g.maleTag || g.femaleTags.includes(s.id)) s.inGroup = null;
        });
        breedGroups.splice(deleteContext.index, 1);
        renderGroups();
        renderStock();
    } else {
        isoBBoxes.splice(deleteContext.index, 1);
        renderIsoBoxes();
        renderBerriedBridge();
    }
    closeDeleteModal();
});

renderGroups();

// ─── ISOLATION GENERAL AI PANEL ──────────────────────────────
function updateIsoAI() {
    const temp = document.getElementById('val-temp')?.textContent || '--';
    const ph   = document.getElementById('val-ph')?.textContent  || '--';
    const doV  = document.getElementById('val-do')?.textContent  || '--';
    const tempNum = parseFloat(temp), phNum = parseFloat(ph), doNum = parseFloat(doV);
    const tempOk = !isNaN(tempNum) && tempNum >= 24 && tempNum <= 30;
    const phOk   = !isNaN(phNum)   && phNum   >= 7.0 && phNum   <= 8.5;
    const doOk   = !isNaN(doNum)   && doNum   >= 5.0;

    const setCard = (valId, badgeId, cardId, val, ok) => {
        document.getElementById(valId).textContent = val;
        const badge = document.getElementById(badgeId);
        badge.textContent = ok ? 'Ideal' : 'Check';
        badge.className   = `ai-param-badge ${ok ? 'ideal' : 'warn'}`;
        document.getElementById(cardId).className = `ai-param-card ${ok ? 'ideal' : 'warn'}`;
    };
    setCard('iso-ai-temp', 'iso-ai-temp-badge', 'iso-ai-temp-card', isNaN(tempNum) ? '--' : temp + '°C', tempOk);
    setCard('iso-ai-ph',   'iso-ai-ph-badge',   'iso-ai-ph-card',   isNaN(phNum)   ? '--' : ph,             phOk);
    setCard('iso-ai-do',   'iso-ai-do-badge',   'iso-ai-do-card',   isNaN(doNum)   ? '--' : doV + ' mg/L',  doOk);

    const allOk  = tempOk && phOk && doOk;
    const someOk = tempOk || phOk || doOk;
    document.getElementById('iso-ai-msg').textContent = allOk
        ? '"All conditions are optimal for egg incubation."'
        : someOk
        ? '"Some parameters need attention. Monitor closely."'
        : '"Water conditions are not ideal. Adjust parameters."';
}

document.querySelectorAll('.breed-tab').forEach(tab => {
    if (tab.dataset.breed === 'isolation') tab.addEventListener('click', updateIsoAI);
});
updateIsoAI();

// ─── ISOLATION BOXES DATA & RENDER ───────────────────────────
let isoBBoxes = [];

function renderIsoBoxes() {
    const grid = document.getElementById('iso-box-grid');
    grid.innerHTML = isoBBoxes.map((b, i) => {
        const isCompleted = b.completed === true;
        const occupied    = b.occupant.trim() !== '' && !isCompleted;
        const statusClass = isCompleted ? 'completed' : (occupied ? 'occupied' : 'available');
        const statusLabel = isCompleted ? 'Completed' : (occupied ? 'Incubating' : 'Available');
        const dateStr     = b.date
            ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';

        let actionBtn = '';
        if (isCompleted) {
            actionBtn = `<button class="iso-btn completed-btn" data-index="${i}"><i class="bi bi-check-circle-fill"></i> Completed</button>`;
        } else if (occupied) {
            actionBtn = `<button class="iso-btn unlock" data-index="${i}"><i class="bi bi-box-arrow-up"></i> Release</button>`;
        } else {
            actionBtn = `<button class="iso-btn assign" data-index="${i}"><i class="bi bi-person-plus-fill"></i> Assign</button>`;
        }

        return `
        <div class="iso-box ${statusClass}" data-index="${i}" style="cursor:pointer">
          <div class="iso-box-header">
            <span class="iso-box-name">${b.name}</span>
            <div style="display:flex;gap:4px;align-items:center">
              <span class="iso-status ${statusClass}"><span class="iso-dot"></span>${statusLabel}</span>
              <button class="breed-icon-btn edit" data-index="${i}" style="width:24px;height:24px;font-size:10px"><i class="bi bi-pencil-fill"></i></button>
              <button class="breed-icon-btn delete" data-index="${i}" style="width:24px;height:24px;font-size:10px"><i class="bi bi-trash-fill"></i></button>
            </div>
          </div>
          <p class="iso-occupant${occupied ? '' : ' empty'}">${b.occupant || '— Empty —'}</p>
          <p class="iso-date">${dateStr ? '<i class="bi bi-calendar3"></i> ' + dateStr : ''}</p>
          <div class="iso-actions">${actionBtn}</div>
        </div>`;
    }).join('');

    grid.querySelectorAll('.iso-btn.assign').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openIsoModal(parseInt(btn.dataset.index)); });
    });
    grid.querySelectorAll('.iso-btn.unlock').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openIsoUnlock(parseInt(btn.dataset.index)); });
    });
    grid.querySelectorAll('.breed-icon-btn.edit').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openIsoModal(parseInt(btn.dataset.index)); });
    });
    grid.querySelectorAll('.breed-icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', e => { e.stopPropagation(); openDeleteModal('iso', parseInt(btn.dataset.index)); });
    });
    grid.querySelectorAll('.iso-box').forEach(card => {
        card.addEventListener('click', () => openIsoDetail(parseInt(card.dataset.index)));
    });
}

// ─── ISO DETAIL MODAL ────────────────────────────────────────
const isoDetailOverlay = document.getElementById('iso-detail-overlay');
const isoDetailModal   = document.getElementById('iso-detail-modal');

function openIsoDetail(index) {
    const b        = isoBBoxes[index];
    const occupied = b.occupant.trim() !== '';
    const today    = new Date();
    const dateStr  = b.date
        ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '—';

    document.getElementById('iso-detail-name').textContent     = b.name;
    document.getElementById('iso-detail-status').innerHTML     = occupied
        ? '<span style="color:#c97d08">🟠 Occupied</span>'
        : '<span style="color:#2d9e5f">🟢 Available</span>';
    document.getElementById('iso-detail-occupant').textContent = occupied ? b.occupant : '— Empty —';
    document.getElementById('iso-detail-date').textContent     = occupied ? dateStr : '—';

    const hatchSection = document.getElementById('iso-detail-hatch-section');
    const aiSection    = document.getElementById('iso-detail-ai-section');

    if (!occupied) {
        hatchSection.innerHTML = '';
        aiSection.innerHTML    = '';
    } else {
        // hatching
        const placed  = new Date(b.date + 'T00:00:00');
        const dayIn   = Math.max(Math.floor((today - placed) / 86400000), 0);
        const total   = 25;
        const pct     = Math.min(Math.round((dayIn / total) * 100), 100);
        const etaDate = new Date(placed);
        etaDate.setDate(etaDate.getDate() + total);
        const eta = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const readyBanner = dayIn >= 18
            ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(31,165,165,0.08);border-radius:10px;font-size:10px;font-weight:700;color:var(--primary-teal)">
                <i class="bi bi-arrow-right-circle-fill"></i> Ready to Transfer to Nursery
               </div>` : '';

        hatchSection.innerHTML = `
        <div class="grp-detail-section" style="margin-top:12px">
          <p class="grp-detail-section-title"><i class="bi bi-clock-history"></i> Hatching Status</p>
          <div class="grp-hatch-item">
            <div class="grp-hatch-top">
              <span class="grp-hatch-name">${b.occupant}</span>
              <span class="grp-hatch-badge">Day ${dayIn} / ${total}</span>
            </div>
            <div class="hatch-progress-wrap">
              <div class="tank-progress-bar"><div class="tank-progress-fill teal" style="width:${pct}%"></div></div>
              <span class="hatch-pct">${pct}%</span>
            </div>
            <p class="grp-hatch-eta"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</p>
            ${readyBanner}
          </div>
        </div>`;
        aiSection.innerHTML = '';
    }

    isoDetailOverlay.classList.add('show');
    isoDetailModal.classList.add('show');
}

function closeIsoDetail() {
    isoDetailOverlay.classList.remove('show');
    isoDetailModal.classList.remove('show');
}

isoDetailOverlay.addEventListener('click', closeIsoDetail);
document.getElementById('iso-detail-close').addEventListener('click', closeIsoDetail);

// ─── ISO ADD/EDIT MODAL ───────────────────────────────────────
const isoModalOverlay = document.getElementById('iso-modal-overlay');
const isoModal        = document.getElementById('iso-modal');

function openIsoModal(editIndex = null) {
    const isEdit = editIndex !== null;
    document.getElementById('iso-modal-title').textContent = isEdit ? 'Edit Box' : 'Add Box';
    document.getElementById('iso-edit-index').value = isEdit ? editIndex : '';
    document.getElementById('iso-name').value = isEdit ? isoBBoxes[editIndex].name : '';
    isoModalOverlay.classList.add('show');
    isoModal.classList.add('show');
}

function closeIsoModal() {
    isoModalOverlay.classList.remove('show');
    isoModal.classList.remove('show');
}

document.getElementById('add-box-btn').addEventListener('click', () => openIsoModal());
isoModalOverlay.addEventListener('click', closeIsoModal);
document.getElementById('iso-cancel-btn').addEventListener('click', closeIsoModal);

document.getElementById('iso-save-btn').addEventListener('click', () => {
    const name = document.getElementById('iso-name').value.trim();
    if (!name) {
        document.getElementById('iso-name').style.borderColor = '#E63946';
        return;
    }
    document.getElementById('iso-name').style.borderColor = '';
    const editIndex = document.getElementById('iso-edit-index').value;
    if (editIndex !== '') {
        isoBBoxes[parseInt(editIndex)].name = name;
    } else {
        isoBBoxes.push({ name, occupant: '', date: '' });
    }
    renderIsoBoxes();
    renderHatchCards();
    closeIsoModal();
});

// ─── ISO UNLOCK MODAL ────────────────────────────────────────
const isoUnlockOverlay = document.getElementById('iso-unlock-overlay');
const isoUnlockModal   = document.getElementById('iso-unlock-modal');

function openIsoUnlock(index) {
    document.getElementById('iso-unlock-index').value = index;
    document.getElementById('iso-unlock-sub').textContent =
        `Release "${isoBBoxes[index].occupant}" from ${isoBBoxes[index].name}?`;
    isoUnlockOverlay.classList.add('show');
    isoUnlockModal.classList.add('show');
}

function closeIsoUnlock() {
    isoUnlockOverlay.classList.remove('show');
    isoUnlockModal.classList.remove('show');
}

isoUnlockOverlay.addEventListener('click', closeIsoUnlock);
document.getElementById('iso-unlock-cancel').addEventListener('click', closeIsoUnlock);
document.getElementById('iso-unlock-confirm').addEventListener('click', () => {
    const index = parseInt(document.getElementById('iso-unlock-index').value);
    // Mark as completed instead of clearing
    isoBBoxes[index].completed = true;
    renderIsoBoxes();
    renderBerriedBridge();
    closeIsoUnlock();
});

renderIsoBoxes();
renderHatchCards();
renderBerriedBridge();

// ─── TANK 2: NURSERY ─────────────────────────────────────────
let lengthVal = 0.0;

document.querySelectorAll('.counter-btn[data-target="length"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') lengthVal = +(lengthVal + 0.1).toFixed(1);
        else if (lengthVal > 0) lengthVal = +(lengthVal - 0.1).toFixed(1);
        document.getElementById('length-val').textContent = lengthVal.toFixed(1);
    });
});

document.getElementById('nursery-date').addEventListener('change', function () {
    const transfer = new Date(this.value);
    const today = new Date();
    const age = Math.max(Math.floor((today - transfer) / 86400000), 0);
    const daysLeft = Math.max(30 - age, 0);
    const pct = Math.min((age / 30) * 100, 100);

    document.getElementById('nursery-age').textContent = age;
    document.getElementById('nursery-days-left').textContent = daysLeft;
    document.getElementById('nursery-pct').textContent = Math.round(pct) + '%';
    document.getElementById('nursery-fill').style.width = pct + '%';
});

// ─── TANK 3: GROW-OUT ────────────────────────────────────────
let stockCount = 100;
let mortalityCount = 0;

function updateLiveCount() {
    const live = stockCount - mortalityCount;
    document.getElementById('live-count').textContent = live;
    document.getElementById('mortality-count').textContent = mortalityCount;
    document.getElementById('sample-size').textContent = Math.ceil(live * 0.1);
}

document.querySelectorAll('.counter-btn[data-target="stock"]').forEach(btn => {
    btn.addEventListener('click', () => {
        if (btn.dataset.action === 'inc') stockCount++;
        else if (stockCount > mortalityCount) stockCount--;
        document.getElementById('stock-count').textContent = stockCount;
        updateLiveCount();
    });
});

document.getElementById('sampling-days').textContent = '7 days left';
document.getElementById('sampling-fill').style.width = '50%';

document.getElementById('compute-btn').addEventListener('click', () => {
    const weight = parseFloat(document.getElementById('sample-weight').value);
    if (!weight || weight <= 0) return;

    const live = stockCount - mortalityCount;
    const sampleSize = Math.ceil(live * 0.1);
    const abw = +(weight / sampleSize).toFixed(2);
    const biomass = +(live * abw).toFixed(1);
    const feedRation = +(biomass * 0.03).toFixed(1);

    document.getElementById('abw-val').textContent = abw;
    document.getElementById('feed-ration-val').textContent = feedRation;
    document.getElementById('biomass-val').textContent = biomass;
    document.getElementById('abw-result').classList.remove('hidden');

    const feederRationEl = document.getElementById('feeder-ration');
    if (feederRationEl) {
        feederRationEl.textContent = `System will dispense ${feedRation}g today based on 3% Total Biomass`;
    }
});

// ─── MORTALITY MODAL ─────────────────────────────────────────
const mortOverlay = document.getElementById('mortality-overlay');
const mortModal   = document.getElementById('mortality-modal');
let mortInputVal  = 1;

document.getElementById('log-mortality-btn').addEventListener('click', () => {
    mortInputVal = 1;
    document.getElementById('mort-input-val').textContent = mortInputVal;
    mortOverlay.classList.add('show');
    mortModal.classList.add('show');
});

document.getElementById('mort-inc').addEventListener('click', () => {
    const live = stockCount - mortalityCount;
    if (mortInputVal < live) mortInputVal++;
    document.getElementById('mort-input-val').textContent = mortInputVal;
});

document.getElementById('mort-dec').addEventListener('click', () => {
    if (mortInputVal > 1) mortInputVal--;
    document.getElementById('mort-input-val').textContent = mortInputVal;
});

document.getElementById('mort-confirm').addEventListener('click', () => {
    mortalityCount += mortInputVal;
    updateLiveCount();
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

document.getElementById('mort-cancel').addEventListener('click', () => {
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

mortOverlay.addEventListener('click', () => {
    mortOverlay.classList.remove('show');
    mortModal.classList.remove('show');
});

updateLiveCount();
