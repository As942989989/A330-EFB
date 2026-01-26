// ==========================================
// 🧠 A330-300 EFB Core v26.1 (MCDU Physics + High Temp Fix)
// ==========================================

function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('a330_roster_v25')) || {};

window.onload = function() {
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ DB Error! Ensure all JS files are loaded.");
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
        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${v.day} | ${k}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:11px; color:#00ff00; margin-bottom:4px; font-family:monospace;">Pax: ${v.pax} | Fwd: ${v.f} | Aft: ${v.a}</div>
                <div class="flight-desc">${v.d}</div>
            </div>
            <button class="check-btn" onclick="toggle('${k}')">✓</button>
        `;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('a330_roster_v25', JSON.stringify(completedFlights));
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

    document.getElementById('to-oat').value = ""; // Force manual OAT

    if(window.airportDB) {
        if(window.airportDB[dep]) document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        if(window.airportDB[arr]) document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
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
            // [v26] Store Slope in dataset for Auto-fill
            opt.dataset.slope = data.slope !== undefined ? data.slope : 0;
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
        
        // [v26 Auto-fill] 自動填入坡度 (如果欄位存在)
        let slopeInput = document.getElementById(prefix + '-rwy-slope');
        if(slopeInput) {
            slopeInput.value = opt.dataset.slope;
        }
    }
    saveInputs();
}

function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    const PAX_FACTOR = 0.00020;
    const FWD_FACTOR = -0.00050;
    const AFT_FACTOR = 0.00070;
    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;
    let cg = BASE_CG + (paxWt * PAX_FACTOR) + (fwdWt * FWD_FACTOR) + (aftWt * AFT_FACTOR);
    return Math.max(18, Math.min(42, cg));
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
    return { deg: Math.abs(val), text: dir + Math.abs(val).toFixed(1), raw: val };
}

function convertToIF(degRaw) {
    let tp = window.perfDB.trim_physics;
    let result = (degRaw > 0) ? 15 + (degRaw * 8) : 15 - (Math.abs(degRaw) * 8);
    return Math.max(0, Math.min(100, Math.round(result)));
}

// [v26] Green Dot
function calculateGreenDot(weightTons) {
    return Math.round(0.6 * weightTons + 135);
}

// ============================================
// 🛫 MCDU 級起飛計算 (v26 Physics)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 1. OAT 檢查
    let oatStr = document.getElementById('to-oat').value;
    if(oatStr === "" || oatStr === null) { alert("⚠️ Enter OAT"); return; }
    let oat = parseFloat(oatStr);

    // 2. 獲取輸入 (含隱藏變數)
    // [Physics] QNH=1013, Packs=ON, Anti-Ice=OFF (Default)
    let qnh = 1013;
    let slope = parseFloat(document.getElementById('to-rwy-slope').value) || 0;
    // [Physics] 對正損失 60m (約200ft)
    let lineup = 60; 

    // 3. 載重
    let oew = window.weightDB.oew; 
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel; 
    let towTons = tow / 1000;

    // 4. 有效跑道長度 (Effective TORA)
    let rwyLen = parseFloat(document.getElementById('to-rwy-len').value)||10000;
    // [Physics] 上坡每 +1% 視為跑道物理縮短 8% (加速慢)
    let slopePenalty = (slope > 0) ? (rwyLen * slope * 0.08) : 0; 
    // [Physics] 扣除 Line-Up (200ft)
    let effLen = rwyLen - 200 - slopePenalty;

    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let elev = parseFloat(document.getElementById('to-elev-disp').innerText)||0; 

    // 5. Flex & N1 物理運算 (修正版: 含高溫衰減)
    let fd = window.perfDB.flex_data;
    let bp = window.perfDB.bleed_penalty;
    
    // [Physics] 固定扣除 Packs ON (0.8%)
    let bleedLoss = bp.packs_on; 

    // 基礎 Flex (基於重量與跑道長度)
    let baseFlex = fd.base_temp + (fd.mtow - tow)*fd.slope_weight + Math.max(0, (effLen-8000)*fd.slope_runway);
    
    // [v26 FIX] 加入氣溫對性能的懲罰 (Flat Rating Physics)
    // 當 OAT 超過 T_REF (30度)，每高 1 度，性能餘裕就會減少，Flex 必須降低 (推力要增加)
    let tempPenalty = 0;
    if (oat > fd.t_ref) {
        tempPenalty = (oat - fd.t_ref) * fd.delta_t_penalty;
    }

    let isa = 15 - (elev / 1000 * 2);
    let altPenalty = (elev / 1000) * fd.elev_penalty; 
    
    // [v26 FIX] 將 tempPenalty 加入扣減公式
    let flex = Math.floor(baseFlex - altPenalty - tempPenalty);

    // [Physics] 上坡 > 0.5% 強制 TOGA (加速太慢)
    if (flex <= oat) flex = "TOGA"; 
    else if (flex > fd.max_temp) flex = fd.max_temp;
    if (effLen < 6500 || slope > 0.5) flex = "TOGA";

    // N1 計算
    let n1 = window.perfDB.n1_physics.base_n1; 
    if (flex !== "TOGA") {
        let deltaFlex = flex - oat;
        n1 -= (deltaFlex * window.perfDB.n1_physics.flex_correction);
    }
    // [Physics] 扣除隱藏損耗 (Packs)
    n1 = n1 - bleedLoss;

    // 6. V-Speeds 動態滑動
    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let conf = "1+F";
    if (effLen < 7500 || tow > 235000) conf = "2";
    
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    let v1 = spd.v1 + corr.v1;
    let vr = spd.vr + corr.vr;
    let v2 = spd.v2 + corr.v2;

    // [Physics] 下坡 V1 懲罰 (煞車難)
    if (slope < 0) {
        v1 -= (Math.abs(slope) * window.perfDB.runway_physics.slope_v1_factor);
    }
    // [Physics] 濕滑跑道 V1 懲罰
    if (isWet) v1 -= 8;

    if (v1 < 112) v1 = 112; 
    if (v1 > vr) v1 = vr;

    // 7. 重心與其他
    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = zfwCG + fuelEffect;
    if(towCG > 42) towCG = 42;
    let ths = calculateTHS(towCG);
    let ifTrim = convertToIF(ths.raw);
    let greenDot = calculateGreenDot(towTons);

    // --- 輸出 ---
    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";
    document.getElementById('res-conf').innerText = conf;
    let flexEl = document.getElementById('res-flex');
    flexEl.innerText = (flex === "TOGA") ? "TOGA" : flex + "°";
    flexEl.style.color = (flex === "TOGA") ? "#e74c3c" : "#00bfff";
    document.getElementById('res-n1').innerText = n1.toFixed(1) + "%";
    document.getElementById('res-trim').innerText = `${ths.text} (${ifTrim}%)`;
    document.getElementById('res-tow-cg-display').innerText = towCG.toFixed(1) + "%";
    document.getElementById('res-v1').innerText = Math.round(v1);
    document.getElementById('res-vr').innerText = Math.round(vr);
    document.getElementById('res-v2').innerText = Math.round(v2);
    
    // [UI] 若 HTML 有 Green Dot 則顯示
    let gdEl = document.getElementById('res-green-dot');
    if(gdEl) gdEl.innerText = greenDot + " KT";

    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);
    saveInputs();
}

// ============================================
// 🛬 MCDU 級降落計算 (v26 Physics)
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
    let slope = parseFloat(document.getElementById('ldg-rwy-slope').value) || 0;
    // [Physics] 取得反推設定 (若無 UI 則預設 IDLE)
    let revEl = document.getElementById('ldg-rev');
    let useMaxRev = (revEl && revEl.value === 'max');
    
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

    // [Physics] Vapp 堆疊 (VLS + Wind)
    // Anti-Ice 隱藏設定為 OFF -> IceCorr = 0
    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let windCorr = Math.max(5, Math.min(15, hw / 3)); 
    let vapp = Math.round(vls + vrefAdd + windCorr);

    // [Physics] RLD 法規距離與 Autobrake
    // 1. 基準距離 (ALD) 模擬
    let baseDist = 1500 * (ldw / 180000); 
    // 2. 坡度修正 (下坡煞車距離增加 10% per 1%)
    if (slope < 0) baseDist *= (1 + (Math.abs(slope) * 0.10)); 
    // 3. 反推修正 (僅影響濕地)
    if (isWet && useMaxRev) baseDist *= 0.9; // Max Rev 優惠
    if (isWet && !useMaxRev) baseDist *= 1.1; // Idle Rev 懲罰

    // 4. 計算 RLD (法規需求)
    let safetyFactor = isWet ? 1.92 : 1.67;
    let rld = baseDist * safetyFactor;
    
    let margin = len - rld;

    let ab = "LO";
    if (margin < 2000 || isWet || slope < -0.5) ab = "MED";
    // 餘裕過小強制 MAX
    if (margin < 500) ab = "MAX"; 

    // [UI] 若 RLD 超過跑道，顯示警告
    let abEl = document.getElementById('res-autobrake');
    if (margin < 0) {
        abEl.innerText = "NO LND";
        abEl.style.color = "red";
    } else {
        abEl.innerText = ab;
        abEl.style.color = "#fff";
    }

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
    document.getElementById('res-ldg-trim').innerText = `${ldgTHS.text} (${ldgIF}%)`;
    document.getElementById('res-ldg-cg-display').innerText = ldgCG.toFixed(1) + "%";
    
    saveInputs();
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg','to-oat',
                 'to-rwy-slope', // Auto-filled
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-rwy-slope', 'ldg-rev', // Auto-filled / New
                 'ldg-gw-input'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('a330_calc_inputs_v25', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('a330_calc_inputs_v25'));
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
    if(confirm("RESET ALL DATA?")) { 
        safeRem('a330_calc_inputs_v25'); 
        safeRem('a330_roster_v25'); 
        location.reload(); 
    }
}
