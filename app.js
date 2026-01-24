// ==========================================
// 🧠 TK A330 EFB Core v17.0 (Smart Logic)
// ==========================================

// --- 安全存取 ---
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('tk_roster_v17')) || {};

window.onload = function() {
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ DB Error! Ensure all JS files are loaded.");
    } else {
        renderRoster();
    }
    loadInputs();
};

// --- 分頁與介面 ---
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
    safeSet('tk_roster_v17', JSON.stringify(completedFlights));
    renderRoster();
}

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

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);

    updatePaxWeight(); updateTotalCargo(); saveInputs(); switchTab('takeoff');
}

function populateRunways(selectId, icao) {
    const sel = document.getElementById(selectId);
    sel.innerHTML = '<option value="">MANUAL INPUT</option>';
    if (window.airportDB && window.airportDB[icao]) {
        const apt = window.airportDB[icao];
        for (const [rwyID, data] of Object.entries(apt.runways)) {
            let opt = document.createElement('option');
            opt.value = rwyID; 
            opt.innerText = `${rwyID} (${data.len}m)`;
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

// --- 輔助計算 ---
function updatePaxWeight(){
    if(!window.weightDB) return;
    document.getElementById("pax-weight").value=(parseFloat(document.getElementById("pax-count").value)||0)*window.weightDB.pax_unit;
}
function updateTotalCargo(){document.getElementById("cargo-total").value=(parseFloat(document.getElementById("cargo-fwd").value)||0)+(parseFloat(document.getElementById("cargo-aft").value)||0);}

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

// ============================================
// 🛫 智慧起飛計算 (Smart Takeoff Logic)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 1. 獲取數據
    let oew = window.weightDB.oew; 
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel; // KG

    let len = parseFloat(document.getElementById('to-rwy-len').value)||3000;
    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('to-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('to-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('to-rwy-hdg').value)||0;

    // 2. 風向分解 (Wind Components)
    let angleRad = Math.abs(rhdg - wdir) * (Math.PI / 180);
    let hw = Math.cos(angleRad) * wspd; // 頂風
    let tw = (hw < 0) ? Math.abs(hw) : 0; // 順風

    // 3. 決策：襟翼構型 (Flap Config)
    // 邏輯：如果跑道短 (<2400) 或 極重 (>235T) 或 壓力係數高 -> 用 CONF 2
    let stress = tow / len; // 壓力係數 (KG/m)
    let conf = "1+F";
    if (len < 2400 || tow > 235000 || stress > 80) {
        conf = "2";
    }

    // 4. 決策：推力模式 (Flex vs TOGA)
    let fd = window.perfDB.flex_data;
    // 基礎 Flex 計算
    let calcFlex = fd.base_temp + (fd.mtow - tow)*fd.slope_weight + Math.max(0, (len-2500)*fd.slope_runway) + Math.max(0, hw*0.5);
    let flex = Math.floor(calcFlex);

    // 強制 TOGA 的條件
    if (len < 2200) flex = "TOGA";      // 跑道太短
    if (isWet && len < 2600) flex = "TOGA"; // 濕滑且不夠長
    if (tw > 10) flex = "TOGA";         // 順風超過 10kt
    if (tow > 240000) flex = "TOGA";    // 接近 MTOW
    if (flex > fd.max_temp) flex = fd.max_temp; // 上限
    if (flex < 45 && flex !== "TOGA") flex = "TOGA"; // 如果算出來 Flex 太低(沒省多少)，直接 TOGA 安全

    // 5. 速度查表與修正
    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    
    let v1 = spd.v1 + corr.v1;
    let vr = spd.vr + corr.vr;
    let v2 = spd.v2 + corr.v2;

    // V1 修正 (濕滑或短跑道 V1 提前)
    if (len < 2200) v1 -= 5;
    if (isWet) v1 -= 6;
    if (v1 < 115) v1 = 115; // 最小限制

    // 6. 配平
    let trimVal = (window.perfDB.trim_data.ref_cg - 28.5) * window.perfDB.trim_data.step;
    let trimStr = (trimVal >= 0 ? "UP " : "DN ") + Math.abs(trimVal).toFixed(1);

    // 7. 輸出結果
    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";

    document.getElementById('res-conf').innerText = conf;
    // 如果是 TOGA 顯示紅色，FLEX 顯示藍色
    let flexEl = document.getElementById('res-flex');
    flexEl.innerText = (flex === "TOGA") ? "TOGA" : flex + "°";
    flexEl.style.color = (flex === "TOGA") ? "#e74c3c" : "#00bfff";

    document.getElementById('res-trim').innerText = trimStr;
    document.getElementById('res-v1').innerText = Math.round(v1);
    document.getElementById('res-vr').innerText = Math.round(vr);
    document.getElementById('res-v2').innerText = Math.round(v2);

    // 自動填入降落預估重
    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);

    saveInputs();
}

// ============================================
// 🛬 智慧降落計算 (Smart Landing Logic)
// ============================================
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    
    let ldw = parseFloat(document.getElementById('ldg-gw-input').value);
    if(!ldw) {
        // Fallback 計算
        let oew = window.weightDB.oew;
        let pax = parseFloat(document.getElementById('pax-weight').value)||0;
        let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
        let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
        let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
        ldw = (oew + pax + cgo + fuel) - trip;
        document.getElementById('ldg-gw-input').value = Math.round(ldw);
    }

    let len = parseFloat(document.getElementById('ldg-rwy-len').value)||3000;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('ldg-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('ldg-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    
    // 風向分解
    let angleRad = Math.abs(rhdg - wdir) * (Math.PI / 180);
    let hw = Math.cos(angleRad) * wspd;
    let xw = Math.abs(Math.sin(angleRad) * wspd); // 側風分量

    // 1. 決策：降落襟翼 (CONF 3 vs FULL)
    // 邏輯：側風 > 20kt 或 風切 (假設使用者知情) -> CONF 3
    let conf = "FULL";
    let vrefAdd = 0;
    if (xw > 20) {
        conf = "3";
        vrefAdd = window.perfDB.landing_conf3_add; // +4kt
    }

    // 2. 決策：自動煞車 (Autobrake)
    // 邏輯：濕地 -> MED, 短跑道 -> MED, 極短 -> MAX
    let ab = "LO";
    if (len < 2500) ab = "MED";
    if (isWet) ab = "MED";
    if (len < 1900) ab = "MAX"; // 緊急

    // 3. 速度計算
    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    // Vapp = VLS + Config修正 + 風修正(最小5, 最大15)
    let windCorr = Math.max(5, Math.min(15, hw / 3));
    let vapp = Math.round(vls + vrefAdd + windCorr);

    // 4. 輸出結果
    document.getElementById('res-ldw').innerText = Math.round(ldw) + " KG";
    document.getElementById('res-ldw').style.color = (ldw > window.weightDB.limits.mlw) ? "#e74c3c" : "#fff";

    let confEl = document.getElementById('res-conf-ldg');
    confEl.innerText = conf;
    // 如果是 CONF 3 (非標準)，顯示黃色提醒
    confEl.style.color = (conf === "3") ? "#e74c3c" : "#fff";

    document.getElementById('res-vapp').innerText = vapp;
    document.getElementById('res-autobrake').innerText = ab;
    
    saveInputs();
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg',
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-gw-input'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('tk_calc_inputs_v17', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v17'));
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
    if(confirm("RESET ALL?")) { safeRem('tk_calc_inputs_v17'); safeRem('tk_roster_v17'); location.reload(); }
}
