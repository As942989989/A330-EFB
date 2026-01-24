// ==========================================
// 🧠 TK A330 EFB Core v22.0 (Atmosphere Logic)
// ==========================================

function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('tk_roster_v22')) || {};

window.onload = function() {
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("DB Missing! Check JS files.");
    } else {
        renderRoster();
    }
    loadInputs();
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = (e) => { if(!e.target.classList.contains('check-btn')) loadFlight(k); };
        d.innerHTML = `<div class="flight-info"><div class="flight-day">${v.day} | ${k}</div><div class="flight-route">${v.r}</div><div class="flight-desc">${v.d}</div></div><button class="check-btn" onclick="toggle('${k}')">✓</button>`;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('tk_roster_v22', JSON.stringify(completedFlights));
    renderRoster();
}

// --- 載入航班與環境數據 ---
function loadFlight(k) {
    const d = window.flightDB[k];
    document.getElementById('pax-count').value = d.pax;
    document.getElementById('cargo-fwd').value = d.f;
    document.getElementById('cargo-aft').value = d.a;
    
    document.getElementById('to-flight-title').innerText = k + " (" + d.r + ")";
    document.getElementById('ldg-flight-desc').innerText = k + " (" + d.r + ")";

    let route = d.r.toUpperCase();
    let dep = route.split('-')[0].trim();
    let arr = route.split('-')[1].trim();

    // [v22 Update] 自動填入機場標高
    if(window.airportDB) {
        if(window.airportDB[dep]) {
            document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        }
        if(window.airportDB[arr]) {
            document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
        }
    }

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);

    updatePaxWeight(); 
    updateTotalCargo(); 
    saveInputs(); 
    switchTab('takeoff');
}

function populateRunways(selectId, icao) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">MANUAL INPUT</option>';
    if (window.airportDB && window.airportDB[icao]) {
        const apt = window.airportDB[icao];
        for (const [rwyID, data] of Object.entries(apt.runways)) {
            let opt = document.createElement('option');
            opt.value = rwyID; 
            opt.innerText = `${rwyID} (${data.len}ft)`;
            opt.dataset.len = data.len;
            opt.dataset.hdg = data.hdg;
            sel.appendChild(opt);
        }
    }
}

function applyRunway(prefix) {
    const sel = document.getElementById(prefix + '-rwy-select');
    const opt = sel.options[sel.selectedIndex];
    if (opt.value !== "") {
        document.getElementById(prefix + '-rwy-len').value = opt.dataset.len;
        document.getElementById(prefix + '-rwy-hdg').value = opt.dataset.hdg;
    }
    saveInputs();
}

// --- 重心估算邏輯 ---
function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    const PAX_FACTOR = 0.00020;
    const FWD_FACTOR = -0.00050;
    const AFT_FACTOR = 0.00070;

    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;

    let cg = BASE_CG + (paxWt * PAX_FACTOR) + (fwdWt * FWD_FACTOR) + (aftWt * AFT_FACTOR);

    if (cg < 18) cg = 18;
    if (cg > 42) cg = 42;
    return cg;
}

function updatePaxWeight(){
    if(!window.weightDB) return;
    document.getElementById("pax-weight").value=(parseFloat(document.getElementById("pax-count").value)||0)*window.weightDB.pax_unit;
}

function updateTotalCargo(){
    document.getElementById("cargo-total").value=(parseFloat(document.getElementById("cargo-fwd").value)||0)+(parseFloat(document.getElementById("cargo-aft").value)||0);
}

function interpolate(w, t) {
    for(let i=0; i<t.length-1; i++) {
        if(w>=t[i][0] && w<=t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return {v1: t[i][1]+r*(t[i+1][1]-t[i][1]), vr: t[i][2]+r*(t[i+1][2]-t[i][2]), v2: t[i][3]+r*(t[i+1][3]-t[i][3])};
        }
    }
    let l=t[t.length-1]; return {v1:l[1],vr:l[2],v2:l[3]};
}

function interpolateVLS(w, t) {
    for(let i=0; i<t.length-1; i++) {
        if(w>=t[i][0] && w<=t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return t[i][1]+r*(t[i+1][1]-t[i][1]);
        }
    }
    return 160;
}

function calculateTHS(cg) {
    let tp = window.perfDB.trim_physics;
    let val = (tp.ref_cg - cg) * tp.step; 
    let dir = (val >= 0) ? "UP " : "DN ";
    return {
        deg: Math.abs(val),
        text: dir + Math.abs(val).toFixed(1),
        raw: val 
    };
}

function convertToIF(degRaw) {
    let tp = window.perfDB.trim_physics;
    let result = 15; 
    if(degRaw > 0) { // UP
        result = 15 + (degRaw * 8); 
    } else { // DN
        result = 15 - (Math.abs(degRaw) * 8);
    }
    return Math.max(0, Math.min(100, Math.round(result)));
}

// ============================================
// 🛫 起飛計算 (含大氣物理模型)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 1. 載重
    let oew = window.weightDB.oew; 
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel; 

    // 2. 環境 (含標高與氣溫)
    let len = parseFloat(document.getElementById('to-rwy-len').value)||10000;
    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('to-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('to-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('to-rwy-hdg').value)||0;
    let oat = parseFloat(document.getElementById('to-oat').value)||15; // [New] OAT
    let elev = parseFloat(document.getElementById('to-elev-disp').innerText)||0; // [New] Elev

    let hw = Math.cos(Math.abs(rhdg-wdir)*(Math.PI/180))*wspd;
    let tw = (hw < 0) ? Math.abs(hw) : 0;

    // 3. 構型決策
    let stress = tow / len; 
    let conf = "1+F";
    if (len < 8000 || tow > 235000 || stress > 25) conf = "2";

    // 4. [v22 New] Flex 物理運算 (Density Altitude Logic)
    let fd = window.perfDB.flex_data;
    
    // 4a. 基礎 Flex (基於載重與跑道)
    let baseFlex = fd.base_temp + (fd.mtow - tow)*fd.slope_weight + Math.max(0, (len-8200)*fd.slope_runway) + Math.max(0, hw*0.5);
    
    // 4b. 計算標準大氣溫度 (ISA)
    // 假設 ISA Sea Level = 15°C, Lapse Rate = 2°C/1000ft
    let isa = 15 - (elev / 1000 * 2);
    
    // 4c. 計算扣減係數 (Penalties)
    // 高度扣減：空氣稀薄導致推力下降
    let altPenalty = (elev / 1000) * fd.elev_penalty; 
    // 溫度扣減：如果比標準大氣還熱，推力更差
    let tempPenalty = 0;
    if (oat > isa) {
        tempPenalty = (oat - isa) * fd.delta_t_penalty;
    }

    let flex = Math.floor(baseFlex - altPenalty - tempPenalty);

    // 4d. TOGA 強制條件 (Golden Rules)
    // 如果計算出的 Flex 小於等於實際氣溫，代表減推力不可行 -> TOGA
    if (flex <= oat) flex = "TOGA"; 
    else if (flex > fd.max_temp) flex = fd.max_temp;
    else if (flex < oat + 5 && flex !== "TOGA") flex = "TOGA"; // 如果只省一點點(5度內)，不如 TOGA 安全

    // 物理極限條件
    if (len < 7200 || (isWet && len < 8500) || tw > 10 || tow > 240000) flex = "TOGA";

    // 5. 速度
    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    
    let v1 = spd.v1 + corr.v1;
    let vr = spd.vr + corr.vr;
    let v2 = spd.v2 + corr.v2;
    // 高海拔速度修正 (TAS 效應，IAS 變化不大，但為了安全V1通常微調)
    // 這裡維持簡單物理：V1 隨跑道縮短而減少
    if (len < 7200) v1 -= 5;
    if (isWet) v1 -= 6;
    if (v1 < 115) v1 = 115;

    // 6. 重心與配平 (TOW CG)
    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = zfwCG + fuelEffect;
    if(towCG > 42) towCG = 42;

    let ths = calculateTHS(towCG);
    let ifTrim = convertToIF(ths.raw);

    // 7. 巡航估算
    let crzCG = towCG + 3.0; 
    if(crzCG > 42) crzCG = 42;
    let crzTHS = calculateTHS(crzCG);
    let crzIF = convertToIF(crzTHS.raw);
    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    let crzGW = tow - (trip * 0.5); 

    // --- 輸出 ---
    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";
    document.getElementById('res-tow-cg').innerText = towCG.toFixed(1) + "%";

    document.getElementById('res-conf').innerText = conf;
    let flexEl = document.getElementById('res-flex');
    flexEl.innerText = (flex === "TOGA") ? "TOGA" : flex + "°";
    flexEl.style.color = (flex === "TOGA") ? "#e74c3c" : "#00bfff";

    document.getElementById('res-trim').innerText = `${ths.text} (${ifTrim}%)`;
    document.getElementById('res-v1').innerText = Math.round(v1);
    document.getElementById('res-vr').innerText = Math.round(vr);
    document.getElementById('res-v2').innerText = Math.round(v2);
    
    document.getElementById('res-crz-trim').innerText = crzTHS.text;
    document.getElementById('res-crz-trim-pct').innerText = crzIF + "%";
    document.getElementById('res-crz-gw').innerText = Math.round(crzGW/1000) + "T";

    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);

    saveInputs();
}

// ============================================
// 🛬 降落計算
// ============================================
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    
    let ldw = parseFloat(document.getElementById('ldg-gw-input').value);
    if(!ldw) {
        let oew = window.weightDB.oew;
        let pax = parseFloat(document.getElementById('pax-weight').value)||0;
        let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
        let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
        let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
        ldw = (oew + pax + cgo + fuel) - trip;
        document.getElementById('ldg-gw-input').value = Math.round(ldw);
    }

    let len = parseFloat(document.getElementById('ldg-rwy-len').value)||10000;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('ldg-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('ldg-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    let angleRad = Math.abs(rhdg - wdir) * (Math.PI / 180);
    let hw = Math.cos(angleRad) * wspd;
    let xw = Math.abs(Math.sin(angleRad) * wspd);

    let conf = "FULL";
    let vrefAdd = 0;
    if (xw > 20) {
        conf = "3";
        vrefAdd = window.perfDB.landing_conf3_add;
    }

    let ab = "LO";
    if (len < 8200) ab = "MED"; 
    if (isWet) ab = "MED";
    if (len < 6200) ab = "MAX"; 

    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let windCorr = Math.max(5, Math.min(15, hw / 3));
    let vapp = Math.round(vls + vrefAdd + windCorr);

    let zfwCG = computeInternalZFWCG();
    let ldgCG = zfwCG - 0.5; 
    let ldgTHS = calculateTHS(ldgCG);
    let ldgIF = convertToIF(ldgTHS.raw) + 5; 
    if(ldgIF > 100) ldgIF = 100;

    document.getElementById('res-ldw').innerText = Math.round(ldw) + " KG";
    document.getElementById('res-ldw').style.color = (ldw > window.weightDB.limits.mlw) ? "#e74c3c" : "#fff";

    let confEl = document.getElementById('res-conf-ldg');
    confEl.innerText = conf;
    confEl.style.color = (conf === "3") ? "#e74c3c" : "#fff";

    document.getElementById('res-vapp').innerText = vapp;
    document.getElementById('res-autobrake').innerText = ab;
    
    document.getElementById('res-ldg-trim').innerText = ldgTHS.text;
    document.getElementById('res-ldg-trim-pct').innerText = ldgIF + "%";
    
    saveInputs();
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg','to-oat',
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-gw-input'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('tk_calc_inputs_v22', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v22'));
    if(d) {
        for(let k in d) {
            let el = document.getElementById(k);
            if(el) el.value = d[k];
        }
        if(d.title) document.getElementById('to-flight-title').innerText = d.title;
        if(d.desc) document.getElementById('ldg-flight-desc').innerText = d.desc;
        updatePaxWeight(); updateTotalCargo();
    }
}

function clearAllData() {
    if(confirm("RESET ALL?")) { safeRem('tk_calc_inputs_v22'); safeRem('tk_roster_v22'); location.reload(); }
}
