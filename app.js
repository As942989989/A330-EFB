// ==========================================
// 🧠 A330-300 EFB Core v26.2 (UI Polish & Flexibility)
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

// [v26.2] 班表顯示優化：增加 CI 與 總貨重
function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        const totalCargo = (v.f || 0) + (v.a || 0); // 計算總貨重
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = (e) => { if(!e.target.classList.contains('check-btn')) loadFlight(k); };
        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${v.day} | ${k}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:12px; color:#00bfff; margin-bottom:4px; font-weight:bold;">
                    CI: ${v.ci} | Total Cargo: ${totalCargo} KG
                </div>
                <div style="font-size:11px; color:#888; margin-bottom:4px; font-family:monospace;">
                    Pax: ${v.pax} | Fwd: ${v.f} | Aft: ${v.a}
                </div>
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

    document.getElementById('to-oat').value = ""; 

    if(window.airportDB) {
        if(window.airportDB[dep]) document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        if(window.airportDB[arr]) document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
    }

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);
    
    // Reset to Manual Mode initially or handle defaults
    applyRunway('to'); 
    applyRunway('ldg');

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
            opt.dataset.slope = data.slope !== undefined ? data.slope : 0;
            sel.appendChild(opt);
        }
    }
}

// [v26.2] 彈性跑道邏輯：切換「資訊顯示」與「手動輸入」
function applyRunway(prefix) {
    const sel = document.getElementById(prefix + '-rwy-select');
    const opt = sel.options[sel.selectedIndex];
    
    // 取得介面區塊 (這些 ID 將在下一步生成的 HTML 中定義)
    const manualDiv = document.getElementById(prefix + '-manual-data');
    const infoDiv = document.getElementById(prefix + '-rwy-info');

    if (opt.value !== "") {
        // === 資料庫模式 ===
        // 1. 填入隱藏的輸入框數值 (為了讓計算邏輯讀取)
        document.getElementById(prefix + '-rwy-len').value = opt.dataset.len;
        document.getElementById(prefix + '-rwy-hdg').value = opt.dataset.hdg;
        let slopeInput = document.getElementById(prefix + '-rwy-slope');
        if(slopeInput) slopeInput.value = opt.dataset.slope;

        // 2. 更新「小字資訊顯示區」
        if(infoDiv) {
            infoDiv.style.display = 'flex'; // 顯示資訊條
            infoDiv.innerHTML = `
                <div>LEN: <span style="color:#00bfff">${opt.dataset.len}</span> FT</div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>HDG: <span style="color:#00bfff">${opt.dataset.hdg}°</span></div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>SLOPE: <span style="color:#00bfff">${opt.dataset.slope}%</span></div>
            `;
        }

        // 3. 隱藏手動輸入框 (保持介面乾淨)
        if(manualDiv) manualDiv.style.display = 'none';

    } else {
        // === 手動模式 (Flexibility) ===
        // 1. 顯示手動輸入框，讓使用者自己打
        if(manualDiv) manualDiv.style.display = 'block';
        
        // 2. 隱藏資訊顯示區
        if(infoDiv) infoDiv.style.display = 'none';
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

function calculateGreenDot(weightTons) {
    return Math.round(0.6 * weightTons + 135);
}

// ============================================
// 🛫 MCDU 級起飛計算 (v26 Physics)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    let oatStr = document.getElementById('to-oat').value;
    if(oatStr === "" || oatStr === null) { alert("⚠️ Enter OAT"); return; }
    let oat = parseFloat(oatStr);

    let qnh = 1013;
    let slope = parseFloat(document.getElementById('to-rwy-slope').value) || 0;
    let lineup = 60; 

    let oew = window.weightDB.oew; 
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel; 
    let towTons = tow / 1000;

    let rwyLen = parseFloat(document.getElementById('to-rwy-len').value)||10000;
    let slopePenalty = (slope > 0) ? (rwyLen * slope * 0.08) : 0; 
    let effLen = rwyLen - 200 - slopePenalty;

    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let elev = parseFloat(document.getElementById('to-elev-disp').innerText)||0; 

    // Flex & N1 物理運算 (含高溫衰減)
    let fd = window.perfDB.flex_data;
    let bp = window.perfDB.bleed_penalty;
    let bleedLoss = bp.packs_on; 

    let baseFlex = fd.base_temp + (fd.mtow - tow)*fd.slope_weight + Math.max(0, (effLen-8000)*fd.slope_runway);
    
    let tempPenalty = 0;
    if (oat > fd.t_ref) {
        tempPenalty = (oat - fd.t_ref) * fd.delta_t_penalty;
    }

    let isa = 15 - (elev / 1000 * 2);
    let altPenalty = (elev / 1000) * fd.elev_penalty; 
    
    let flex = Math.floor(baseFlex - altPenalty - tempPenalty);

    if (flex <= oat) flex = "TOGA"; 
    else if (flex > fd.max_temp) flex = fd.max_temp;
    if (effLen < 6500 || slope > 0.5) flex = "TOGA";

    let n1 = window.perfDB.n1_physics.base_n1; 
    if (flex !== "TOGA") {
        let deltaFlex = flex - oat;
        n1 -= (deltaFlex * window.perfDB.n1_physics.flex_correction);
    }
    n1 = n1 - bleedLoss;

    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let conf = "1+F";
    if (effLen < 7500 || tow > 235000) conf = "2";
    
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    let v1 = spd.v1 + corr.v1;
    let vr = spd.vr + corr.vr;
    let v2 = spd.v2 + corr.v2;

    if (slope < 0) {
        v1 -= (Math.abs(slope) * window.perfDB.runway_physics.slope_v1_factor);
    }
    if (isWet) v1 -= 8;

    if (v1 < 112) v1 = 112; 
    if (v1 > vr) v1 = vr;

    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = zfwCG + fuelEffect;
    if(towCG > 42) towCG = 42;
    let ths = calculateTHS(towCG);
    let ifTrim = convertToIF(ths.raw);
    let greenDot = calculateGreenDot(towTons);

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

    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let windCorr = Math.max(5, Math.min(15, hw / 3)); 
    let vapp = Math.round(vls + vrefAdd + windCorr);

    let baseDist = 1500 * (ldw / 180000); 
    if (slope < 0) baseDist *= (1 + (Math.abs(slope) * 0.10)); 
    if (isWet && useMaxRev) baseDist *= 0.9; 
    if (isWet && !useMaxRev) baseDist *= 1.1; 

    let safetyFactor = isWet ? 1.92 : 1.67;
    let rld = baseDist * safetyFactor;
    
    let margin = len - rld;

    let ab = "LO";
    if (margin < 2000 || isWet || slope < -0.5) ab = "MED";
    if (margin < 500) ab = "MAX"; 

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
                 'to-rwy-slope', 
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-rwy-slope', 'ldg-rev', 
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
        
        // Ensure manual toggle state reflects loaded values
        applyRunway('to');
        applyRunway('ldg');
    }
}

function clearAllData() {
    if(confirm("RESET ALL DATA?")) { 
        safeRem('a330_calc_inputs_v25'); 
        safeRem('a330_roster_v25'); 
        location.reload(); 
    }
}
