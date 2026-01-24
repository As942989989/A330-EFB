// --- 基礎設定 ---
const PAX_UNIT_WEIGHT = 44; 

// --- 安全存取 ---
function safeGet(key) { try { return localStorage.getItem(key); } catch(e) { return null; } }
function safeSet(key, val) { try { localStorage.setItem(key, val); } catch(e) {} }
function safeRem(key) { try { localStorage.removeItem(key); } catch(e) {} }

// --- 初始化 ---
let completedFlights = JSON.parse(safeGet('tk_roster_v14')) || {};

window.onload = function() {
    if (!window.flightDB || !window.perfDB) {
        alert("⚠️ 錯誤：資料庫未載入！\n請檢查 roster.js 與 perf_db.js");
    } else {
        renderRoster();
    }
    loadInputs();
};

// --- 分頁與介面邏輯 ---
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabName).classList.add('active');
    document.getElementById('btn-' + tabName).classList.add('active');
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;

    for (const [flightNo, data] of Object.entries(window.flightDB)) {
        const isDone = completedFlights[flightNo] === true;
        const card = document.createElement('div');
        card.className = `flight-card ${isDone ? 'completed' : ''}`;
        card.onclick = (e) => {
            if(e.target.classList.contains('check-btn')) return;
            loadFlightToCalc(flightNo);
        };
        card.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${data.day} | ${flightNo}</div>
                <div class="flight-route">${data.r}</div>
                <div class="flight-desc">${data.d}</div>
            </div>
            <button class="check-btn" onclick="toggleComplete('${flightNo}')">✓</button>
        `;
        list.appendChild(card);
    }
}

function toggleComplete(flightNo) {
    if (completedFlights[flightNo]) delete completedFlights[flightNo];
    else completedFlights[flightNo] = true;
    safeSet('tk_roster_v14', JSON.stringify(completedFlights));
    renderRoster();
}

function loadFlightToCalc(flightNo) {
    const data = window.flightDB[flightNo];
    if (!data) return;
    document.getElementById('pax-count').value = data.pax;
    document.getElementById('cargo-fwd').value = data.f;
    document.getElementById('cargo-aft').value = data.a;
    document.getElementById('calc-flight-title').innerText = `${flightNo}`;
    document.getElementById('calc-flight-desc').innerText = data.r + " | " + data.d;
    updatePaxWeight(); updateTotalCargo(); saveInputs(); switchTab('calc');
}

function updatePaxWeight() { document.getElementById("pax-weight").value = (parseFloat(document.getElementById("pax-count").value) || 0) * PAX_UNIT_WEIGHT; }
function updateTotalCargo() { document.getElementById("cargo-total").value = (parseFloat(document.getElementById("cargo-fwd").value) || 0) + (parseFloat(document.getElementById("cargo-aft").value) || 0); }

// --- 核心算法 ---
function interpolate(weight, table) {
    for (let i = 0; i < table.length - 1; i++) {
        let lower = table[i], upper = table[i+1];
        if (weight >= lower[0] && weight <= upper[0]) {
            let ratio = (weight - lower[0]) / (upper[0] - lower[0]);
            return { v1: lower[1] + ratio * (upper[1] - lower[1]), vr: lower[2] + ratio * (upper[2] - lower[2]), v2: lower[3] + ratio * (upper[3] - lower[3]) };
        }
    }
    let last = table[table.length-1];
    return { v1:last[1], vr:last[2], v2:last[3] };
}

function interpolateVLS(weight, table) {
    for (let i = 0; i < table.length - 1; i++) {
        let lower = table[i], upper = table[i+1];
        if (weight >= lower[0] && weight <= upper[0]) {
            let ratio = (weight - lower[0]) / (upper[0] - lower[0]);
            return lower[1] + ratio * (upper[1] - lower[1]);
        }
    }
    return 160;
}

function calculate() {
    if(!window.perfDB) return alert("Perf DB missing");
    let oew = 129855, paxWt = parseFloat(document.getElementById('pax-weight').value)||0, cargo = parseFloat(document.getElementById('cargo-total').value)||0, fuel = parseFloat(document.getElementById('fuel-total').value)||0, trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    let tow = (oew + paxWt + cargo + fuel) / 1000, ldw = (tow * 1000 - trip) / 1000;
    let rwyLen = parseFloat(document.getElementById('rwy-len').value)||3000, isWet = document.getElementById('rwy-cond').value === 'WET';
    let windDir = parseFloat(document.getElementById('wind-dir').value)||0, windSpd = parseFloat(document.getElementById('wind-spd').value)||0, rwyHdg = parseFloat(document.getElementById('rwy-hdg').value)||0;
    let headwind = Math.cos(Math.abs(rwyHdg - windDir) * (Math.PI / 180)) * windSpd;

    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let conf = (rwyLen < 2400 || tow > 230) ? "2" : "1+F";
    let corr = window.perfDB.conf_correction[conf] || {v1:0, vr:0, v2:0};
    let v1 = spd.v1 + corr.v1, vr = spd.vr + corr.vr, v2 = spd.v2 + corr.v2;

    if (rwyLen < 2200) v1 -= 4;
    if (isWet) v1 -= 2;

    let fd = window.perfDB.flex_data;
    let flex = Math.floor(fd.base_temp + (fd.mtow - tow) * fd.slope_weight + Math.max(0, (rwyLen - 2500) * fd.slope_runway) + Math.max(0, headwind * 0.5));
    if (flex > fd.max_temp) flex = fd.max_temp;
    if (rwyLen < 2000 || (isWet && rwyLen < 2400)) flex = "TOGA";

    let cg = 28.5;
    let trimVal = (window.perfDB.trim_data.ref_cg - cg) * window.perfDB.trim_data.step;
    let trimStr = (trimVal >= 0 ? "UP " : "DN ") + Math.abs(trimVal).toFixed(1);

    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let vapp = Math.round(vls + Math.max(5, Math.min(15, headwind / 3)));
    let autobrake = (rwyLen < 2400 || isWet) ? "MED" : "LO";

    document.getElementById('res-tow').innerText = tow.toFixed(1) + " T";
    document.getElementById('res-ldw').innerText = ldw.toFixed(1) + " T";
    document.getElementById('res-conf').innerText = conf;
    document.getElementById('res-flex').innerText = (flex === "TOGA") ? "TOGA" : flex + "°";
    document.getElementById('res-trim').innerText = trimStr;
    document.getElementById('res-v1').innerText = Math.round(v1);
    document.getElementById('res-vr').innerText = Math.round(vr);
    document.getElementById('res-v2').innerText = Math.round(v2);
    document.getElementById('res-vapp').innerText = vapp;
    document.getElementById('res-autobrake').innerText = autobrake;

    saveInputs();
}

function saveInputs() {
    const data = {
        pax: document.getElementById('pax-count').value,
        fwd: document.getElementById('cargo-fwd').value,
        aft: document.getElementById('cargo-aft').value,
        fuel: document.getElementById('fuel-total').value,
        trip: document.getElementById('trip-fuel').value,
        rwyLen: document.getElementById('rwy-len').value,
        rwyCond: document.getElementById('rwy-cond').value,
        windDir: document.getElementById('wind-dir').value,
        windSpd: document.getElementById('wind-spd').value,
        rwyHdg: document.getElementById('rwy-hdg').value,
        title: document.getElementById('calc-flight-title').innerText,
        desc: document.getElementById('calc-flight-desc').innerText
    };
    safeSet('tk_calc_inputs_v14', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v14'));
    if (d) {
        if(d.pax) document.getElementById('pax-count').value = d.pax;
        if(d.fwd) document.getElementById('cargo-fwd').value = d.fwd;
        if(d.aft) document.getElementById('cargo-aft').value = d.aft;
        if(d.fuel) document.getElementById('fuel-total').value = d.fuel;
        if(d.trip) document.getElementById('trip-fuel').value = d.trip;
        if(d.rwyLen) document.getElementById('rwy-len').value = d.rwyLen;
        if(d.rwyCond) document.getElementById('rwy-cond').value = d.rwyCond;
        if(d.windDir) document.getElementById('wind-dir').value = d.windDir;
        if(d.windSpd) document.getElementById('wind-spd').value = d.windSpd;
        if(d.rwyHdg) document.getElementById('rwy-hdg').value = d.rwyHdg;
        if(d.title) document.getElementById('calc-flight-title').innerText = d.title;
        if(d.desc) document.getElementById('calc-flight-desc').innerText = d.desc;
        updatePaxWeight(); updateTotalCargo();
    }
}

function clearAllData() {
    if(confirm("RESET ALL?")) { safeRem('tk_calc_inputs_v14'); safeRem('tk_roster_v14'); location.reload(); }
}
