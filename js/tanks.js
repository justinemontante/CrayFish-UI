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
        <div class="breed-group-card">
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
        btn.addEventListener('click', () => openGroupModal(parseInt(btn.dataset.index)));
    });
    list.querySelectorAll('.breed-icon-btn.delete').forEach(btn => {
        btn.addEventListener('click', () => openDeleteModal('group', parseInt(btn.dataset.index)));
    });
    list.querySelectorAll('.berried-tag-btn').forEach(btn => {
        btn.addEventListener('click', () => openBerriedModal(parseInt(btn.dataset.group), btn.dataset.female));
    });
}

// ─── TAG INPUT (Female Tags) ─────────────────────────────────
let bmFemaleTags = [];

function renderTagChips() {
    const chips = document.getElementById('bm-tag-chips');
    chips.innerHTML = bmFemaleTags.map((tag, i) => `
        <span class="tag-chip">${tag}
          <button type="button" class="tag-chip-remove" data-i="${i}"><i class="bi bi-x"></i></button>
        </span>`).join('');
    chips.querySelectorAll('.tag-chip-remove').forEach(btn => {
        btn.addEventListener('click', () => {
            bmFemaleTags.splice(parseInt(btn.dataset.i), 1);
            renderTagChips();
        });
    });
}

function addFemaleTag() {
    const field = document.getElementById('bm-tag-field');
    const val = field.value.trim();
    if (!val || bmFemaleTags.includes(val)) { field.value = ''; return; }
    bmFemaleTags.push(val);
    field.value = '';
    renderTagChips();
}

document.getElementById('bm-tag-add').addEventListener('click', addFemaleTag);
document.getElementById('bm-tag-field').addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addFemaleTag(); }
});

// ─── BERRIED ASSIGN MODAL ────────────────────────────────────
const berriedOverlay = document.getElementById('berried-overlay');
const berriedModal   = document.getElementById('berried-modal');
let berriedContext   = { groupIndex: null, femaleTag: null };

function openBerriedModal(groupIndex, femaleTag) {
    berriedContext = { groupIndex, femaleTag };
    document.getElementById('berried-modal-title').innerHTML = `<i class="bi bi-egg-fill"></i> Mark ${femaleTag} as Berried`;
    document.getElementById('berried-modal-sub').textContent = 'Select an available isolation box to assign her to.';

    const availableBoxes = isoBBoxes.filter(b => b.occupant.trim() === '');
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
    // re-render both
    renderGroups();
    renderIsoBoxes();
    renderHatchCards();
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
    document.getElementById('breed-modal-title').textContent = isEdit ? 'Edit Group' : 'Add Group';
    document.getElementById('bm-edit-index').value = isEdit ? editIndex : '';
    if (isEdit) {
        const g = breedGroups[editIndex];
        document.getElementById('bm-name').value     = g.name;
        document.getElementById('bm-male-tag').value = g.maleTag;
        document.getElementById('bm-date').value     = g.date;
        bmFemaleTags = [...g.femaleTags];
        renderTagChips();
        setModalPhoto(g.photo || null);
    } else {
        document.getElementById('bm-name').value     = '';
        document.getElementById('bm-male-tag').value = '';
        document.getElementById('bm-date').value     = '';
        bmFemaleTags = [];
        renderTagChips();
        setModalPhoto(null);
    }
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
    const name       = document.getElementById('bm-name').value.trim();
    const maleTag    = document.getElementById('bm-male-tag').value.trim();
    const femaleTags = [...bmFemaleTags];
    const date       = document.getElementById('bm-date').value;
    const photo      = bmCurrentPhoto;

    // validation
    const nameEl    = document.getElementById('bm-name');
    const maleEl    = document.getElementById('bm-male-tag');
    const dateEl    = document.getElementById('bm-date');
    [nameEl, maleEl, dateEl].forEach(el => el.style.borderColor = '');

    let valid = true;
    if (!name)          { nameEl.style.borderColor = '#E63946'; valid = false; }
    if (!maleTag)       { maleEl.style.borderColor = '#E63946'; valid = false; }
    if (!date)          { dateEl.style.borderColor = '#E63946'; valid = false; }
    if (femaleTags.length === 0) {
        document.getElementById('bm-tag-wrap').style.borderColor = '#E63946';
        valid = false;
    } else {
        document.getElementById('bm-tag-wrap').style.borderColor = '';
    }
    if (!valid) return;

    const editIndex = document.getElementById('bm-edit-index').value;
    if (editIndex !== '') {
        breedGroups[parseInt(editIndex)] = { name, maleTag, femaleTags, date, photo };
    } else {
        breedGroups.push({ name, maleTag, femaleTags, date, photo });
    }
    renderGroups();
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
        breedGroups.splice(deleteContext.index, 1);
        renderGroups();
    } else {
        isoBBoxes.splice(deleteContext.index, 1);
        renderIsoBoxes();
    }
    closeDeleteModal();
});

renderGroups();

// ─── ISOLATION BOXES DATA & RENDER ───────────────────────────
let isoBBoxes = [];

function renderIsoBoxes() {
    const grid = document.getElementById('iso-box-grid');
    grid.innerHTML = isoBBoxes.map((b, i) => {
        const occupied    = b.occupant.trim() !== '';
        const statusClass = occupied ? 'occupied' : 'available';
        const statusLabel = occupied ? 'Occupied' : 'Available';
        const dateStr     = b.date
            ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : '';
        const actionBtn = occupied
            ? `<button class="iso-btn unlock" data-index="${i}"><i class="bi bi-unlock-fill"></i> Unlock</button>`
            : `<button class="iso-btn assign" data-index="${i}"><i class="bi bi-person-plus-fill"></i> Assign</button>`;
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
          <p class="iso-occupant${occupied ? '' : ' empty'}">${occupied ? b.occupant : '— Empty —'}</p>
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
    const dateStr  = b.date
        ? new Date(b.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
        : '—';
    document.getElementById('iso-detail-name').textContent     = b.name;
    document.getElementById('iso-detail-status').innerHTML     = occupied
        ? '<span style="color:#c97d08">🟠 Occupied</span>'
        : '<span style="color:#2d9e5f">🟢 Available</span>';
    document.getElementById('iso-detail-occupant').textContent = occupied ? b.occupant : '— Empty —';
    document.getElementById('iso-detail-date').textContent     = occupied ? dateStr : '—';
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
    isoBBoxes[index].occupant = '';
    isoBBoxes[index].date = '';
    renderIsoBoxes();
    renderHatchCards();
    closeIsoUnlock();
});

renderIsoBoxes();
renderHatchCards();

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
