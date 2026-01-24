// ==========================================
// 🧠 TK A330 EFB Core v24.0 (Final Polished)
// ==========================================

// --- 安全存取 LocalStorage ---
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('tk_roster_v24')) || {};

window.onload = function() {
    // 檢查資料庫完整性
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ DB Error! Ensure all JS files (roster, perf, weights, airports) are loaded.");
    } else {
        renderRoster();
    }
    loadInputs();
};

// --- 分頁切換邏輯 ---
function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

// --- 班表渲染 ---
function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        // 點擊卡片載入，點擊勾勾標記完成
        d.onclick = (e) => { if(!e.target.classList.contains('check-btn')) loadFlight(k); };
        d.innerHTML = `<div class="flight-info"><div class="flight-day">${v.day} | ${k}</div><div class="flight-route">${v.r}</div><div class="flight-desc">${v.d}</div></div><button class="check-btn" onclick="toggle('${k}')">✓</button>`;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('tk_roster_v24', JSON.stringify(completedFlights));
    renderRoster();
}

// --- 載入航班與環境數據 ---
function loadFlight(k) {
    const d = window.flightDB[k];
    // 填入載重
    document.getElementById('pax-count').value = d.pax;
    document.getElementById('cargo-fwd').value = d.f;
    document.getElementById('cargo-aft').value = d.a;
    
    // 更新標題
    document.getElementById('to-flight-title').innerText = k + " (" + d.r + ")";
    document.getElementById('ldg-flight-desc').innerText = k + " (" + d.r + ")";

    // 解析航路 (例如 LTFM-EGLL)
    let route = d.r.toUpperCase();
    let dep = route.split('-')[0].trim();
    let arr = route.split('-')[1].trim();

    // 自動填入機場標高 (Elev)
    if(window.airportDB) {
        if(window.airportDB[dep]) {
            document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        }
        if(window.airportDB[arr]) {
            document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
        }
    }

    // 填入跑道選單
    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);

    // 觸發計算
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
            // 存入 data 屬性供讀取
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

// --- 核心運算：重心估算 (ZFW CG) ---
// 根據乘客與前後貨艙重量，估算零油重心
function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    const PAX_FACTOR = 0.00020;
    const FWD_FACTOR = -0.00050; // 前艙重 -> 重心前移
    const AFT_FACTOR = 0.00070;  // 後艙重 -> 重心後移

    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;

    let cg = BASE_CG + (paxWt * PAX_FACTOR) + (fwdWt * FWD_FACTOR) + (aftWt * AFT_FACTOR);

    // 安全限制
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

// --- 核心運算：線性插值 ---
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

// --- 核心運算：Trim 轉換 (CG -> THS -> IF%) ---
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
    let result = 15; // Base Trim (0 deg)
    if(degRaw > 0) { // UP
        result = 15 + (degRaw * 8); 
    } else { // DN
        result = 15 - (Math.abs(degRaw) * 8);
    }
    return Math.max(0, Math.min(100, Math.round(result)));
}

// ============================================
// 🛫 起飛計算 (Takeoff Calculation)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 1. 載重計算 (KG)
    let oew = window.weightDB.oew; 
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel; 

    // 2. 環境參數
    let len = parseFloat(document.getElementById('to-rwy-len').value)||10000;
    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('to-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('to-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('to-rwy-hdg').value)||0;
    let oat = parseFloat(document.getElementById('to-oat').value)||15; // OAT
    let elev = parseFloat(document.getElementById('to-elev-disp').innerText)||0; // Elev

    let hw = Math.cos(Math.abs(rhdg-wdir)*(Math.PI/180))*wspd;
    let tw = (hw < 0) ? Math.abs(hw) : 0;

    // 3. 構型決策
    let stress = tow / len; 
    let conf = "1+F";
    // 跑道短(<8000ft) 或 重載(>235T) 或 壓力大 -> Config 2
    if (len < 8000 || tow > 235000 || stress > 25) conf = "2";

    // 4. Flex 溫度與大氣物理
    let fd = window.perfDB.flex_data;
    let baseFlex = fd.base_temp + (fd.mtow - tow)*fd.slope_weight + Math.max(0, (len-8200)*fd.slope_runway) + Math.max(0, hw*0.5);
    
    // 計算 ISA 與 修正
    let isa = 15 - (elev / 1000 * 2);
    let altPenalty = (elev / 1000) * fd.elev_penalty; 
    let tempPenalty = 0;
    if (oat > isa) {
        tempPenalty = (oat - isa) * fd.delta_t_penalty;
    }

    let flex = Math.floor(baseFlex - altPenalty - tempPenalty);

    // TOGA 強制條件
    if (flex <= oat) flex = "TOGA"; 
    else if (flex > fd.max_temp) flex = fd.max_temp;
    else if (flex < oat + 5 && flex !== "TOGA") flex = "TOGA"; 

    // 物理極限 (極短跑道/大順風)
    if (len < 7200 || (isWet && len < 8500) || tw > 10 || tow > 240000) flex = "TOGA";

    // 5. N1 轉速計算
    let n1 = window.perfDB.n1_physics.base_n1; // 預設 TOGA N1
    if (flex !== "TOGA") {
        let deltaFlex = flex - oat;
        n1 -= (deltaFlex * window.perfDB.n1_physics.flex_correction);
    }

    // 6. 速度計算
    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    let v1 = spd.v1 + corr.v1;
    let vr = spd.vr + corr.vr;
    let v2 = spd.v2 + corr.v2;
    
    // 速度修正
    if (len < 7200) v1 -= 5;
    if (isWet) v1 -= 6;
    if (v1 < 115) v1 = 115;

    // 7. 重心 (TOW CG) 與配平
    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = zfwCG + fuelEffect;
    if(towCG > 42) towCG = 42;

    let ths = calculateTHS(towCG);
    let ifTrim = convertToIF(ths.raw);

    // --- 輸出結果至 DOM ---
    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";

    document.getElementById('res-conf').innerText = conf;
    let flexEl = document.getElementById('res-flex');
    flexEl.innerText = (flex === "TOGA") ? "TOGA" : flex + "°";
    flexEl.style.color = (flex === "TOGA") ? "#e74c3c" : "#00bfff";

    document.getElementById('res-n1').innerText = n1.toFixed(1) + "%";

    // 顯示合併後的 Trim 與 CG
    document.getElementById('res-trim').innerText = `${ths.text} (${ifTrim}%)`;
    document.getElementById('res-tow-cg-display').innerText = towCG.toFixed(1) + "%";

    document.getElementById('res-v1').innerText = Math.round(v1);
    document.getElementById('res-vr').innerText = Math.round(vr);
    document.getElementById('res-v2').innerText = Math.round(v2);
    
    // 自動填入降落預估重
    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);

    saveInputs();
}

// ============================================
// 🛬 降落計算 (Landing Calculation)
// ============================================
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 1. 取得降落重
    let ldw = parseFloat(document.getElementById('ldg-gw-input').value);
    // 防呆：如果沒值，嘗試用起飛重推算
    if(!ldw) {
        let oew = window.weightDB.oew;
        let pax = parseFloat(document.getElementById('pax-weight').value)||0;
        let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
        let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
        let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
        ldw = (oew + pax + cgo + fuel) - trip;
        document.getElementById('ldg-gw-input').value = Math.round(ldw);
    }

    // 2. 環境
    let len = parseFloat(document.getElementById('ldg-rwy-len').value)||10000;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let wdir = parseFloat(document.getElementById('ldg-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('ldg-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    
    let angleRad = Math.abs(rhdg - wdir) * (Math.PI / 180);
    let hw = Math.cos(angleRad) * wspd;
    let xw = Math.abs(Math.sin(angleRad) * wspd); // 側風

    // 3. 襟翼與煞車
    let conf = "FULL";
    let vrefAdd = 0;
    if (xw > 20) { // 側風大於 20kt 建議 Conf 3
        conf = "3";
        vrefAdd = window.perfDB.landing_conf3_add;
    }

    let ab = "LO";
    if (len < 8200) ab = "MED"; 
    if (isWet) ab = "MED";
    if (len < 6200) ab = "MAX"; 

    // 4. 速度 Vapp
    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let windCorr = Math.max(5, Math.min(15, hw / 3)); // 風修正 5-15kt
    let vapp = Math.round(vls + vrefAdd + windCorr);

    // 5. [v24 New] 降落重心 (LDG CG) 與 配平
    let zfwCG = computeInternalZFWCG();
    // 假設降落時燃油少，重心會比 ZFW 稍微前移一點點
    let ldgCG = zfwCG - 0.5; 
    
    let ldgTHS = calculateTHS(ldgCG);
    // IF 降落優化：+5% Trim 輔助 Flare
    let ldgIF = convertToIF(ldgTHS.raw) + 5; 
    if(ldgIF > 100) ldgIF = 100;

    // --- 輸出結果至 DOM ---
    document.getElementById('res-ldw').innerText = Math.round(ldw) + " KG";
    document.getElementById('res-ldw').style.color = (ldw > window.weightDB.limits.mlw) ? "#e74c3c" : "#fff";

    let confEl = document.getElementById('res-conf-ldg');
    confEl.innerText = conf;
    confEl.style.color = (conf === "3") ? "#e74c3c" : "#fff";

    document.getElementById('res-vapp').innerText = vapp;
    document.getElementById('res-autobrake').innerText = ab;
    
    // [v24 New] 顯示合併後的 Trim 與 CG (對應 v24 HTML 結構)
    document.getElementById('res-ldg-trim-display').innerText = `${ldgTHS.text} (${ldgIF}%)`;
    document.getElementById('res-ldg-cg-display').innerText = ldgCG.toFixed(1) + "%";
    
    saveInputs();
}

// --- 資料存取 ---
function saveInputs() {
    // 儲存所有輸入框狀態
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg','to-oat',
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-gw-input'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('tk_calc_inputs_v24', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v24'));
    if(d) {
        for(let k in d) {
            let el = document.getElementById(k);
            if(el) el.value = d[k];
        }
        if(d.title) document.getElementById('to-flight-title').innerText = d.title;
        if(d.desc) document.getElementById('ldg-flight-desc').innerText = d.desc;
        // 載入後重新觸發一次運算更新
        updatePaxWeight(); updateTotalCargo();
    }
}

function clearAllData() {
    if(confirm("RESET ALL DATA?")) { 
        safeRem('tk_calc_inputs_v24'); 
        safeRem('tk_roster_v24'); 
        location.reload(); 
    }
}
