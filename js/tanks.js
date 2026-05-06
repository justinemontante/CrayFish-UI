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
const STOCK_POOL_KEY = 'craycare_stock_pool';
const BREED_GROUPS_KEY = 'craycare_breed_groups';
const ISO_BOXES_KEY = 'craycare_iso_boxes';

function saveStockPool() {
    try { localStorage.setItem(STOCK_POOL_KEY, JSON.stringify(stockPool)); } catch(e) {}
}
function saveBreedGroups() {
    try { localStorage.setItem(BREED_GROUPS_KEY, JSON.stringify(breedGroups)); } catch(e) {}
}
function saveIsoBBoxes() {
    try { localStorage.setItem(ISO_BOXES_KEY, JSON.stringify(isoBBoxes)); } catch(e) {}
}

function loadStockPool() {
    try {
        const data = localStorage.getItem(STOCK_POOL_KEY);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}
function loadBreedGroups() {
    try {
        const data = localStorage.getItem(BREED_GROUPS_KEY);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}
function loadIsoBBoxes() {
    try {
        const data = localStorage.getItem(ISO_BOXES_KEY);
        return data ? JSON.parse(data) : null;
    } catch(e) { return null; }
}

let stockPool = loadStockPool() || [];
let breedGroups = loadBreedGroups() || [];
let isoBBoxes = loadIsoBBoxes() || [
    { name: 'Box A', occupant: '', date: '', completed: false },
    { name: 'Box B', occupant: '', date: '', completed: false },
];

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
                : `<img src="${getDefaultPhoto('male')}" alt="" />`;
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
                : `<img src="${getDefaultPhoto('female')}" alt="" />`;
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
            saveStockPool();
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

function getDefaultPhoto(gender) {
    return gender === 'male'
        ? 'resources/images/Male_Crayfish.png'
        : 'resources/images/Female_Cryfish.png';
}

function openStockModal() {
    setStockPhoto(getDefaultPhoto(stockGender));
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
    stockEditIndex = null;
    document.getElementById('stock-modal-title').textContent = 'Add Male';
    document.getElementById('stock-id-label').textContent = 'Male ID';
    document.getElementById('stock-id-field').value = getNextStockId('male');
    document.getElementById('stock-save-btn').textContent = 'Add to Stock';
    openStockModal();
});
document.getElementById('stock-add-female').addEventListener('click', () => {
    stockGender = 'female';
    stockEditIndex = null;
    document.getElementById('stock-modal-title').textContent = 'Add Female';
    document.getElementById('stock-id-label').textContent = 'Female ID';
    document.getElementById('stock-id-field').value = getNextStockId('female');
    document.getElementById('stock-save-btn').textContent = 'Add to Stock';
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
    const id = document.getElementById('stock-id-field').value.trim();
    const idField = document.getElementById('stock-id-field');
    if (!id) {
        idField.style.borderColor = '#E63946';
        return;
    }
    idField.style.borderColor = '';
    const duplicate = stockPool.find((s, idx) => s.id === id && idx !== stockEditIndex);
    if (duplicate) {
        idField.style.borderColor = '#E63946';
        idField.placeholder = 'ID already exists!';
        setTimeout(() => { idField.placeholder = `e.g. ${getNextStockId(stockGender)}`; }, 2000);
        return;
    }
    if (stockEditIndex !== null) {
        stockPool[stockEditIndex].id = id;
        stockPool[stockEditIndex].photo = stockCurrentPhoto;
        stockEditIndex = null;
    } else {
        stockPool.push({ id, gender: stockGender, color: '', age: null, photo: stockCurrentPhoto, inGroup: null });
    }
    saveStockPool();
    renderStock();
    closeStockModal();
});

renderStock();

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
              <span class="hatch-label berried">Berried</span>
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

// ─── BREEDING GROUPS RENDER ──────────────────────────────────

function getGroupStatus(g) {
    const berried = g.berriedTags || [];
    if (berried.length === 0) return { label: 'Active', cls: 'active' };

    const totalFemales = g.femaleTags.length;
    const isolated = berried.length;

    // Check if all isolation boxes for this group are completed
    const allCompleted = berried.every(f => {
        return isoBBoxes.some(b => b.occupant.includes(f) && b.completed);
    });

    if (allCompleted && isolated === totalFemales) {
        return { label: 'Cycle Complete', cls: 'complete' };
    }
    if (isolated === totalFemales) {
        return { label: 'All Isolated', cls: 'isolated' };
    }
    if (isolated > 0) {
        return { label: `Partial Isolation (${isolated}/${totalFemales})`, cls: 'isolated' };
    }
    return { label: 'Active', cls: 'active' };
}

function renderGroups() {
    const list = document.getElementById('breed-group-list');
    list.innerHTML = breedGroups.map((g, i) => {
        const status = getGroupStatus(g);
        const femalePills = g.femaleTags.map(f => {
            const isBerried = g.berriedTags && g.berriedTags.includes(f);
            if (isBerried) {
                let boxName = '';
                for (let bi = 0; bi < isoBBoxes.length; bi++) {
                    if (isoBBoxes[bi].occupant.includes(f) && !isoBBoxes[bi].completed) {
                        boxName = isoBBoxes[bi].name;
                        break;
                    }
                }
                return `<span class="breed-female-tag berried"><i class="bi bi-egg-fill"></i> ${f}<span class="berried-sep">·</span> Isolated<span class="berried-box-name">${boxName ? ' in ' + boxName : ''}</span></span>`;
            }
            return `
            <span class="breed-female-row">
              <span class="breed-female-tag">${f}</span>
              <button class="berried-tag-btn" data-group="${i}" data-female="${f}"><i class="bi bi-egg-fill"></i> Isolate (Has Eggs)</button>
            </span>`;
        }).join('');
        const dateStr = g.date
            ? new Date(g.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
            : '—';
        const photoHTML = g.photo
            ? `<img src="${g.photo}" alt="Group photo" style="width:100%;height:100%;object-fit:cover;border-radius:12px" />`
            : `<img src="${getDefaultGroupPhoto()}" alt="" />`;
        return `
        <div class="breed-group-card" data-index="${i}" style="cursor:pointer">
          <div class="breed-group-photo">${photoHTML}</div>
          <div class="breed-group-info">
            <div class="breed-group-top">
              <span class="breed-group-name">${g.name}</span>
              <div class="breed-group-right">
                <span class="group-status-badge ${status.cls}"><span class="status-dot"></span>${status.label}</span>
                <div class="breed-group-actions">
                  <button class="breed-icon-btn edit" data-index="${i}"><i class="bi bi-pencil-fill"></i></button>
                  <button class="breed-icon-btn delete" data-index="${i}"><i class="bi bi-trash-fill"></i></button>
                </div>
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
    const status = getGroupStatus(g);

    // header
    document.getElementById('grp-detail-name').textContent = g.name;
    document.getElementById('grp-detail-status').innerHTML =
        `<span class="group-status-badge ${status.cls}"><span class="status-dot"></span>${status.label}</span>`;

    const photoEl = document.getElementById('grp-detail-photo');
    photoEl.innerHTML = g.photo
        ? `<img src="${g.photo}" alt="" style="width:100%;height:100%;object-fit:cover" />`
        : `<img src="${getDefaultGroupPhoto()}" alt="" style="width:100%;height:100%;object-fit:cover" />`;
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

    // hatching status — per female summary
    const hatchEl = document.getElementById('grp-detail-hatch');
    const hatchSummary = g.femaleTags.map(f => {
        const isBerried = berried.includes(f);
        if (!isBerried) {
            return `<div class="grp-hatch-item"><span class="grp-hatch-name">${f}</span><span class="grp-hatch-badge inactive">Not isolated</span></div>`;
        }
        const box = isoBBoxes.find(b => b.occupant.includes(f));
        if (!box) {
            return `<div class="grp-hatch-item"><span class="grp-hatch-name">${f}</span><span class="grp-hatch-badge incomplete">No box assigned</span></div>`;
        }
        const placed = new Date(box.date + 'T00:00:00');
        const dayIn  = Math.max(Math.floor((today - placed) / 86400000), 0);
        const total  = 25;
        const past   = dayIn > total;
        const etaDate = new Date(placed);
        etaDate.setDate(etaDate.getDate() + total);
        const eta = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const statusBadge = box.completed
            ? `<span class="grp-hatch-badge complete"><i class="bi bi-check-circle-fill"></i> Completed</span>`
            : `<span class="grp-hatch-badge${past ? ' past' : ''}">Day ${dayIn}${past ? ' · Past estimate' : ''}</span>`;
        return `
        <div class="grp-hatch-item">
          <div class="grp-hatch-top">
            <span class="grp-hatch-name">${f} → ${box.name}</span>
            ${statusBadge}
          </div>
          <p class="grp-hatch-eta"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</p>
        </div>`;
    }).join('');
    hatchEl.innerHTML = hatchSummary;

    // AI insights
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

    const paramIssues = [];
    if (!tempOk && !isNaN(tempNum)) paramIssues.push(`Temp is ${temp}°C (ideal: 24-30°C)`);
    if (!phOk && !isNaN(phNum)) paramIssues.push(`pH is ${ph} (ideal: 7.0-8.5)`);
    if (!doOk && !isNaN(doNum)) paramIssues.push(`DO is ${doV} mg/L (ideal: >5.0)`);

    const isoHatchItems = isoBBoxes.filter(b => b.occupant && b.date && berried.some(f => b.occupant.includes(f)));
    const berriedCount = berried.length;

    let insights = [];
    if (status.cls === 'complete') {
        insights.push(`This group's cycle is complete. All females have finished incubation. Members are free to start a new cycle.`);
    } else if (isoHatchItems.length > 0) {
        const dayIns = isoHatchItems.map(b => Math.max(Math.floor((new Date() - new Date(b.date + 'T00:00:00')) / 86400000), 0));
        const avgDay = Math.round(dayIns.reduce((a, c) => a + c, 0) / dayIns.length);
        insights.push(`${berriedCount} berried female${berriedCount > 1 ? 's' : ''} from this group, avg Day ${avgDay} incubation.`);
    } else if (berriedCount > 0) {
        insights.push(`${berriedCount} female${berriedCount > 1 ? 's' : ''} marked as berried but not yet in isolation.`);
    } else {
        insights.push(`No berried females yet. Monitor for egg-carrying behavior after mating.`);
    }

    if (paramIssues.length > 0) {
        insights.push(`Water alert: ${paramIssues.join(', ')}.`);
    } else if (!isNaN(tempNum)) {
        insights.push(`Water is optimal for this group — Temp ${temp}°C, pH ${ph}, DO ${doV} mg/L.`);
    }

    document.getElementById('grp-ai-msg').textContent = `"${insights.join(' ')}"`;

    // Store current index for "Start New Cycle"
    grpDetailModal.dataset.index = index;

    grpDetailOverlay.classList.add('show');
    grpDetailModal.classList.add('show');
}

function closeGroupDetail() {
    grpDetailOverlay.classList.remove('show');
    grpDetailModal.classList.remove('show');
}

grpDetailOverlay.addEventListener('click', closeGroupDetail);
document.getElementById('grp-detail-close').addEventListener('click', closeGroupDetail);

document.getElementById('grp-detail-new-cycle').addEventListener('click', () => {
    const index = parseInt(grpDetailModal.dataset.index);
    const g = breedGroups[index];
    if (!confirm(`Start a new cycle for "${g.name}"? This will free all members for new group assignments.`)) return;

    // Free all members
    stockPool.forEach(s => {
        if (s.id === g.maleTag || g.femaleTags.includes(s.id)) {
            s.inGroup = null;
        }
    });

    // Clear berried tags
    g.berriedTags = [];

    saveBreedGroups();
    saveStockPool();
    renderGroups();
    renderStock();
    closeGroupDetail();
});

// ─── BERRIED ASSIGN MODAL ────────────────────────────────────
const berriedOverlay = document.getElementById('berried-overlay');
const berriedModal   = document.getElementById('berried-modal');
let berriedContext   = { groupIndex: null, femaleTag: null };

function openBerriedModal(groupIndex, femaleTag) {
    berriedContext = { groupIndex, femaleTag };
    document.getElementById('berried-modal-title').innerHTML = `Isolate ${femaleTag}`;
    document.getElementById('berried-modal-sub').textContent = 'Select an available isolation box to assign her to.';

    const availableBoxes = isoBBoxes.filter(b => b.occupant.trim() === '' && !b.completed);
    const boxList = document.getElementById('berried-box-list');

    if (availableBoxes.length === 0) {
        boxList.innerHTML = `<p class="berried-no-boxes">No available boxes.<br>Add or free up an isolation box first.</p>`;
    } else {
        boxList.innerHTML = availableBoxes.map(b => {
            const idx = isoBBoxes.indexOf(b);
            return `<button class="berried-box-btn" data-box-index="${idx}">
                <span><i class="bi bi-box-seam"></i> ${b.name}</span>
                <span>Available <i class="bi bi-arrow-right"></i> Assign</span>
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
    if (!breedGroups[groupIndex].berriedTags) breedGroups[groupIndex].berriedTags = [];
    breedGroups[groupIndex].berriedTags.push(femaleTag);
    const today = new Date().toISOString().split('T')[0];
    isoBBoxes[boxIndex].occupant = `Female ${femaleTag}`;
    isoBBoxes[boxIndex].date = today;
    isoBBoxes[boxIndex].completed = false;
    saveBreedGroups();
    saveIsoBBoxes();
    renderGroups();
    renderIsoBoxes();
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

function getDefaultGroupPhoto() {
    return 'resources/images/Crayfish_Group1.webp';
}

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
            males.map(m => `<option value="${m.id}"${m.id === g.maleTag ? ' selected' : ''}>${m.id}</option>`).join('');
    } else {
        document.getElementById('bm-name').value = '';
        document.getElementById('bm-date').value = '';
        bmSelectedFemales = [];

        const males = stockPool.filter(s => s.gender === 'male' && !s.inGroup);
        document.getElementById('bm-male-select').innerHTML = `<option value="">— Select male —</option>` +
            males.map(m => `<option value="${m.id}">${m.id}</option>`).join('');
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

    saveBreedGroups();
    saveStockPool();
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
        saveBreedGroups();
        saveStockPool();
    } else {
        isoBBoxes.splice(deleteContext.index, 1);
        renderIsoBoxes();
        saveIsoBBoxes();
    }
    closeDeleteModal();
});

renderGroups();

// ─── ISOLATION GENERAL AI PANEL ──────────────────────────────
function updateIsoAI() {
    document.getElementById('iso-ai-msg').textContent = 'AI insights will show here';
}

document.querySelectorAll('.breed-tab').forEach(tab => {
    if (tab.dataset.breed === 'isolation') tab.addEventListener('click', updateIsoAI);
});
updateIsoAI();

// ─── ISOLATION BOXES RENDER ──────────────────────────────────
function renderIsoBoxes() {
    const grid = document.getElementById('iso-box-grid');
    const today = new Date();
    grid.innerHTML = isoBBoxes.map((b, i) => {
        const isCompleted = b.completed === true;
        const occupied    = b.occupant.trim() !== '' && !isCompleted;
        const statusClass = isCompleted ? 'completed' : (occupied ? 'occupied' : 'available');
        const statusLabel = isCompleted ? 'Completed' : (occupied ? 'Berried' : 'Available');
        const dateStr     = b.date
            ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';

        let dayInfoHTML = '';
        if (occupied && b.date) {
            const placed  = new Date(b.date + 'T00:00:00');
            const dayIn   = Math.max(Math.floor((today - placed) / 86400000), 0);
            const total   = 25;
            const past    = dayIn > total;
            const etaDate = new Date(placed);
            etaDate.setDate(etaDate.getDate() + total);
            const eta = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            dayInfoHTML = `
            <div class="iso-day-info">
                <span class="iso-day-count${past ? ' past' : ''}">Day ${dayIn}${past ? ' · Past estimate' : ''}</span>
                <span class="iso-est-hatch"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</span>
            </div>`;
        }

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
          ${dayInfoHTML}
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
        ? '<span style="color:#c97d08"><i class="bi bi-circle-fill" style="font-size:8px"></i> Occupied</span>'
        : '<span style="color:#2d9e5f"><i class="bi bi-circle-fill" style="font-size:8px"></i> Available</span>';
    document.getElementById('iso-detail-occupant').textContent = occupied ? b.occupant : '— Empty —';
    document.getElementById('iso-detail-date').textContent     = occupied ? dateStr : '—';

    const hatchSection = document.getElementById('iso-detail-hatch-section');
    const aiSection    = document.getElementById('iso-detail-ai-section');

    if (!occupied) {
        hatchSection.innerHTML = '';
        aiSection.innerHTML    = '';
    } else {
        const placed  = new Date(b.date + 'T00:00:00');
        const dayIn   = Math.max(Math.floor((today - placed) / 86400000), 0);
        const total   = 25;
        const past    = dayIn > total;
        const etaDate = new Date(placed);
        etaDate.setDate(etaDate.getDate() + total);
        const eta = etaDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const pastBanner = past
            ? `<div style="margin-top:8px;padding:8px 10px;background:rgba(230,57,70,0.08);border-radius:10px;font-size:10px;font-weight:700;color:#E63946">
                <i class="bi bi-exclamation-triangle-fill"></i> Past estimated hatch date — check if hatched
               </div>` : '';

        hatchSection.innerHTML = `
        <div class="grp-detail-section" style="margin-top:12px">
          <p class="grp-detail-section-title"><i class="bi bi-clock-history"></i> Hatching Status</p>
          <div class="grp-hatch-item">
            <div class="grp-hatch-top">
              <span class="grp-hatch-name">${b.occupant}</span>
              <span class="grp-hatch-badge${past ? ' past' : ''}">Day ${dayIn}${past ? ' · Past estimate' : ''}</span>
            </div>
            <p class="grp-hatch-eta"><i class="bi bi-calendar-check"></i> Est. Hatch: ${eta}</p>
            ${pastBanner}
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
        isoBBoxes.push({ name, occupant: '', date: '', completed: false });
    }
    saveIsoBBoxes();
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
    const box = isoBBoxes[index];
    box.completed = true;
    saveIsoBBoxes();

    // Check if any group cycle is now complete
    breedGroups.forEach(g => {
        const berried = g.berriedTags || [];
        if (berried.length === 0) return;

        const allCompleted = berried.every(f =>
            isoBBoxes.some(b => b.occupant.includes(f) && b.completed)
        );

        if (allCompleted && berried.length === g.femaleTags.length) {
            // Auto-free members
            stockPool.forEach(s => {
                if (s.id === g.maleTag || g.femaleTags.includes(s.id)) {
                    s.inGroup = null;
                }
            });
        }
    });

    saveStockPool();
    renderIsoBoxes();
    renderGroups();
    renderStock();
    closeIsoUnlock();
});

renderIsoBoxes();
renderHatchCards();

// ─── TANK 2: NURSERY ─────────────────────────────────────────
const NURSERY_KEY = 'craycare_nursery';

function loadNursery() {
    try {
        const d = localStorage.getItem(NURSERY_KEY);
        return d ? JSON.parse(d) : [];
    } catch(e) { return []; }
}
function saveNursery() {
    try { localStorage.setItem(NURSERY_KEY, JSON.stringify(nurseryEntries)); } catch(e) {}
}

let nurseryEntries = loadNursery();

function renderNursery() {
    const container = document.getElementById('nursery-entries');
    const sourceEl = document.getElementById('nursery-source');
    const emptyEl = document.getElementById('nursery-empty');

    if (nurseryEntries.length === 0) {
        container.innerHTML = '';
        sourceEl.textContent = 'Juveniles from isolation';
        emptyEl.style.display = 'flex';
        document.getElementById('nursery-add-btn').style.display = 'flex';
        return;
    }

    emptyEl.style.display = 'none';
    sourceEl.textContent = `${nurseryEntries.length} juvenile${nurseryEntries.length > 1 ? 's' : ''} in nursery`;
    document.getElementById('nursery-add-btn').style.display = 'flex';

    const today = new Date();
    container.innerHTML = nurseryEntries.map((entry, i) => {
        const start = new Date(entry.date + 'T00:00:00');
        const day = Math.max(Math.floor((today - start) / 86400000), 0);
        const pct = Math.min(Math.round((day / 30) * 100), 100);
        const dateStr = entry.date
            ? new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '--';

        let contentHTML = '';
        if (day < 7) {
            contentHTML = `
            <div class="nursery-locked-card">
                <div class="nursery-locked-icon"><i class="bi bi-lock-fill"></i></div>
                <p class="nursery-locked-text">Counting available after Day 7</p>
            </div>`;
        } else if (entry.actualCount === null) {
            contentHTML = `
            <div class="nursery-count-section">
                <p class="nursery-count-label">Enter Actual Count</p>
                <input type="number" class="nursery-count-input" id="nursery-input-${i}" placeholder="0" min="0" />
                <button class="nursery-save-btn" data-index="${i}"><i class="bi bi-check-circle-fill"></i> Save Count</button>
            </div>`;
        } else {
            contentHTML = `
            <div class="nursery-summary-section">
                <p class="nursery-actual-val" id="nursery-actual-${i}">${entry.actualCount}</p>
                <p class="nursery-actual-sub">Estimated: ${entry.estCount || '200–300'}</p>
                <button class="nursery-update-btn" data-index="${i}"><i class="bi bi-pencil-fill"></i> Update Count</button>
            </div>`;
        }

        return `
        <div class="nursery-entry-card">
          <div class="nursery-entry-header">
            <div>
              <p class="nursery-entry-title">${entry.source} → ${entry.boxName}</p>
              <p class="nursery-entry-date"><i class="bi bi-calendar3"></i> ${dateStr}</p>
            </div>
            <span class="nursery-day-badge">${day}</span>
          </div>
          <div class="nursery-entry-body">
            <p class="nursery-entry-label">Estimated Count</p>
            <p class="nursery-entry-est">${entry.estCount || '200–300'}</p>
          </div>
          ${contentHTML}
          <div class="nursery-entry-progress">
            <div class="tank-progress-label">
              <span>Nursery (30 days)</span>
              <span>${pct}%</span>
            </div>
            <div class="tank-progress-bar"><div class="tank-progress-fill green" style="width:${pct}%"></div></div>
          </div>
          <div style="display:flex;gap:6px;margin-top:4px">
            ${day >= 30 ? `<button class="nursery-move-btn" data-index="${i}" style="flex:1"><i class="bi bi-arrow-right-circle-fill"></i> Move to Grow-out</button>` : ''}
            <button class="nursery-remove-btn" data-index="${i}"><i class="bi bi-trash-fill"></i> Remove</button>
          </div>
        </div>`;
    }).join('');

    container.querySelectorAll('.nursery-save-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const input = document.getElementById(`nursery-input-${idx}`);
            const val = parseInt(input.value);
            if (!val || val <= 0) return;
            nurseryEntries[idx].actualCount = val;
            saveNursery();
            renderNursery();
        });
    });

    container.querySelectorAll('.nursery-update-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const entry = nurseryEntries[idx];
            const body = btn.closest('.nursery-entry-card').querySelector('.nursery-entry-body');
            body.insertAdjacentHTML('afterend', `
            <div class="nursery-count-section">
                <input type="number" class="nursery-count-input" id="nursery-input-${idx}" placeholder="0" min="0" value="${entry.actualCount || ''}" />
                <button class="nursery-save-btn" data-index="${idx}"><i class="bi bi-check-circle-fill"></i> Update</button>
            </div>`);
            btn.closest('.nursery-summary-section').style.display = 'none';
            container.querySelector(`.nursery-save-btn[data-index="${idx}"]`).addEventListener('click', e2 => {
                e2.stopPropagation();
                const val2 = parseInt(document.getElementById(`nursery-input-${idx}`).value);
                if (!val2 || val2 <= 0) return;
                nurseryEntries[idx].actualCount = val2;
                saveNursery();
                renderNursery();
            });
        });
    });

    container.querySelectorAll('.nursery-move-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            const idx = parseInt(btn.dataset.index);
            const entry = nurseryEntries[idx];
            alert(`Move "${entry.boxName}" (${entry.actualCount || 'uncounted'}) from ${entry.source} to Grow-out?`);
        });
    });

    container.querySelectorAll('.nursery-remove-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.stopPropagation();
            if (confirm('Remove this entry from Nursery?')) {
                nurseryEntries.splice(parseInt(btn.dataset.index), 1);
                saveNursery();
                renderNursery();
            }
        });
    });
}

// ─── NURSERY ADD ENTRY MODAL ──────────────────────────────────
const nurseryAddOverlay = document.getElementById('nursery-add-overlay');
const nurseryAddModal   = document.getElementById('nursery-add-modal');

document.getElementById('nursery-add-btn').addEventListener('click', () => {
    document.getElementById('nursery-add-source').value = '';
    document.getElementById('nursery-add-female').value = '';
    document.getElementById('nursery-add-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('nursery-add-est').value = '200–300';
    nurseryAddOverlay.classList.add('show');
    nurseryAddModal.classList.add('show');
});

function closeNurseryAdd() {
    nurseryAddOverlay.classList.remove('show');
    nurseryAddModal.classList.remove('show');
}

nurseryAddOverlay.addEventListener('click', closeNurseryAdd);
document.getElementById('nursery-add-cancel').addEventListener('click', closeNurseryAdd);

document.getElementById('nursery-add-confirm').addEventListener('click', () => {
    const source = document.getElementById('nursery-add-source').value.trim();
    const female = document.getElementById('nursery-add-female').value.trim();
    const date   = document.getElementById('nursery-add-date').value;
    const est    = document.getElementById('nursery-add-est').value.trim() || '200–300';

    if (!source || !female || !date) {
        if (!source) document.getElementById('nursery-add-source').style.borderColor = '#E63946';
        if (!female) document.getElementById('nursery-add-female').style.borderColor = '#E63946';
        if (!date) document.getElementById('nursery-add-date').style.borderColor = '#E63946';
        return;
    }

    nurseryEntries.push({
        source: source,
        boxName: female,
        date: date,
        estCount: est,
        actualCount: null
    });
    saveNursery();
    renderNursery();
    closeNurseryAdd();
});

renderNursery();

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
