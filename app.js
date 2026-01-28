// ==========================================
// 🧠 A330-300 EFB Core v28.1 (Full Logic)
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

// --------------------------------------------
// Roster & UI Helper Functions
// --------------------------------------------
function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        // [MOD] 顯示距離與類型
        const infoTag = v.type === "PAX" ? "PAX" : (v.type === "CGO" ? "CGO" : "FERRY");
        
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = () => loadFlight(k); 
        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${v.day} | ${k}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:12px; color:#00bfff; margin-bottom:4px; font-weight:bold;">
                    ${infoTag} | ${v.dist || 0} NM | CI: ${v.ci}
                </div>
                <div class="flight-desc">${v.d}</div>
            </div>
            <button class="check-btn" onclick="event.stopPropagation(); toggle('${k}')">✓</button>
        `;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('a330_roster_v25', JSON.stringify(completedFlights));
    renderRoster();
}

// [MODIFIED] 新版 loadFlight：不再直接去計算頁，而是初始化 Dispatch
function loadFlight(k) {
    const d = window.flightDB[k];
    
    // UI 標題更新
    document.getElementById('to-flight-title').innerText = k + " (" + d.r + ")";
    document.getElementById('ldg-flight-desc').innerText = k + " (" + d.r + ")";
    
    // 更新 Dispatch 標題 (如果元素存在)
    let dspTitle = document.getElementById('dsp-flight');
    if(dspTitle) dspTitle.innerText = k + " (" + d.r + ")";

    let route = d.r.toUpperCase();
    let dep = route.split('-')[0].trim();
    let arr = route.split('-')[1].trim();
    
    // 機場與跑道初始化
    document.getElementById('to-oat').value = ""; 
    if(window.airportDB) {
        if(window.airportDB[dep]) document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        if(window.airportDB[arr]) document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
    }

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);
    
    // 預設跑道邏輯
    applyRunway('to'); 
    applyRunway('ldg');
    
    // *** [CRITICAL] 初始化 Dispatch 簽派作業 ***
    initDispatchSession(k); 
    switchTab('dispatch'); // 強制跳轉至 Dispatch 頁面
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

function applyRunway(prefix) {
    const sel = document.getElementById(prefix + '-rwy-select');
    const opt = sel.options[sel.selectedIndex];
    const manualDiv = document.getElementById(prefix + '-manual-data');
    const infoDiv = document.getElementById(prefix + '-rwy-info');

    if (opt.value !== "") {
        document.getElementById(prefix + '-rwy-len').value = opt.dataset.len;
        document.getElementById(prefix + '-rwy-hdg').value = opt.dataset.hdg;
        let slopeInput = document.getElementById(prefix + '-rwy-slope');
        if(slopeInput) slopeInput.value = opt.dataset.slope;

        if(infoDiv) {
            infoDiv.style.display = 'flex'; 
            infoDiv.innerHTML = `
                <div>LEN: <span style="color:#00bfff">${opt.dataset.len}</span> FT</div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>HDG: <span style="color:#00bfff">${opt.dataset.hdg}°</span></div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>SLOPE: <span style="color:#00bfff">${opt.dataset.slope}%</span></div>
            `;
        }
        if(manualDiv) manualDiv.style.display = 'none';
    } else {
        if(manualDiv) manualDiv.style.display = 'block';
        if(infoDiv) infoDiv.style.display = 'none';
    }
    // 注意：這裡不呼叫 saveInputs() 避免 Dispatch 初始化時覆寫
}

function updatePaxWeight(){
    if(!window.weightDB) return;
    let count = parseFloat(document.getElementById("pax-count").value) || 0;
    let unit = window.weightDB.pax_unit; 
    let totalWeight = count * unit;
    document.getElementById("pax-weight").value = totalWeight;
    let dispEl = document.getElementById("pax-weight-disp");
    if(dispEl) dispEl.innerText = totalWeight;
}

function updateTotalCargo(){
    document.getElementById("cargo-total").value=(parseFloat(document.getElementById("cargo-fwd").value)||0)+(parseFloat(document.getElementById("cargo-aft").value)||0);
}

// --------------------------------------------
// Physics Helper Functions
// --------------------------------------------
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
    let result = (degRaw > 0) ? 15 + (degRaw * 8) : 15 - (Math.abs(degRaw) * 8);
    return Math.max(0, Math.min(100, Math.round(result)));
}

function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;
    let cg = BASE_CG + (paxWt * 0.00020) + (fwdWt * -0.00050) + (aftWt * 0.00070);
    return Math.max(18, Math.min(42, cg));
}

// ============================================
// 🛫 OPT 起飛優化邏輯 (Iterative Calculation)
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;

    // --- 1. 讀取輸入 ---
    let oat = parseFloat(document.getElementById('to-oat').value);
    if(isNaN(oat)) { alert("⚠️ Please Enter OAT"); return; }
    
    let rwyLen = parseFloat(document.getElementById('to-rwy-len').value)||10000;
    let slope = parseFloat(document.getElementById('to-rwy-slope').value) || 0;
    let isWet = document.getElementById('to-rwy-cond').value === 'WET';
    let elev = parseFloat(document.getElementById('to-elev-disp').innerText)||0;

    let oew = window.weightDB.oew;
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = oew + pax + cgo + fuel;
    
    function computePerformance(tryFlex, tryConf) {
        let isToga = (tryFlex === "TOGA");
        let tempForCalc = isToga ? oat : tryFlex;
        let fd = window.perfDB.flex_data;
        let flexDelta = isToga ? 0 : (tempForCalc - fd.base_temp); 
        if (!isToga && tempForCalc < oat) return { valid: false, reason: "Flex < OAT" };

        let thrustPenaltyFactor = 1.0;
        if (!isToga && flexDelta > 0) {
            thrustPenaltyFactor += (flexDelta * fd.flex_dist_penalty);
        }

        let spd = interpolate(tow, window.perfDB.takeoff_speeds);
        let corr = window.perfDB.conf_correction[tryConf];
        let v1 = spd.v1 + corr.v1;
        let vr = spd.vr + corr.vr;
        let v2 = spd.v2 + corr.v2;

        if (slope < 0) v1 -= (Math.abs(slope) * window.perfDB.runway_physics.slope_v1_factor);
        if (isWet) v1 -= 8;
        if (v1 < 112) v1 = 112; 
        if (v1 > vr) v1 = vr;

        let dp = window.perfDB.dist_physics;
        let baseTOD = dp.base_to_dist_ft * Math.pow((tow / 200000), 2);
        
        baseTOD *= thrustPenaltyFactor;
        baseTOD *= corr.dist_factor;
        
        if (slope > 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor));
        if (slope < 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor * 0.5));
        baseTOD *= (1 + (elev/1000 * 0.05));

        if (isWet) baseTOD *= 1.1;

        let margin = rwyLen - baseTOD;
        
        return {
            valid: margin > 0,
            margin: margin,
            tod: Math.round(baseTOD),
            v1: Math.round(v1),
            vr: Math.round(vr),
            v2: Math.round(v2),
            flex: tryFlex,
            conf: tryConf
        };
    }

    let configsToTry = ["1+F", "2", "3"];
    let bestResult = null;
    let maxFlex = window.perfDB.flex_data.max_temp;

    loop_outer:
    for (let conf of configsToTry) {
        for (let t = maxFlex; t >= oat; t--) {
            let res = computePerformance(t, conf);
            if (res.valid) {
                bestResult = res;
                break loop_outer; 
            }
        }
        let togaRes = computePerformance("TOGA", conf);
        if (togaRes.valid) {
            bestResult = togaRes;
            break loop_outer; 
        }
    }

    if (!bestResult) {
        alert("⚠️ PERFORMANCE LIMIT EXCEEDED (Too Heavy or Runway Short)");
        document.getElementById('res-tow').style.color = "red";
        document.getElementById('res-tow').innerText = "LIMIT EXCEEDED";
        return;
    }

    let n1 = window.perfDB.n1_physics.base_n1;
    if (bestResult.flex !== "TOGA") {
        let delta = bestResult.flex - oat;
        n1 -= (delta * window.perfDB.n1_physics.flex_correction);
    }
    n1 -= window.perfDB.bleed_penalty.packs_on;

    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = Math.min(42, zfwCG + fuelEffect);
    let ths = calculateTHS(towCG);
    let ifTrim = convertToIF(ths.raw);

    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";
    
    document.getElementById('res-conf').innerText = bestResult.conf;
    let flexEl = document.getElementById('res-flex');
    flexEl.innerText = (bestResult.flex === "TOGA") ? "TOGA" : bestResult.flex + "°";
    flexEl.style.color = (bestResult.flex === "TOGA") ? "#e74c3c" : "#00bfff";
    
    document.getElementById('res-n1').innerText = n1.toFixed(1) + "%";
    document.getElementById('res-trim').innerText = `${ths.text} (${ifTrim}%)`;
    document.getElementById('res-tow-cg-display').innerText = towCG.toFixed(1) + "%";
    
    document.getElementById('res-v1').innerText = bestResult.v1;
    document.getElementById('res-vr').innerText = bestResult.vr;
    document.getElementById('res-v2').innerText = bestResult.v2;
    document.getElementById('res-to-dist').innerText = bestResult.tod + " FT";
    
    let gd = Math.round(0.6 * (tow/1000) + 135);
    document.getElementById('res-green-dot').innerText = gd + " KT";

    let marginEl = document.getElementById('res-stop-margin');
    if (marginEl) {
        let marginVal = Math.round(bestResult.margin);
        marginEl.innerText = (marginVal >= 0 ? "+" : "") + marginVal + " FT";
        marginEl.style.color = (marginVal < 800) ? "orange" : "#2ecc71";
    }

    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);
    saveInputs();
}

// ============================================
// 🛬 OPT 降落矩陣邏輯 (Matrix Calculation)
// ============================================
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;

    let ldw = parseFloat(document.getElementById('ldg-gw-input').value) || 0;
    let rwyLen = parseFloat(document.getElementById('ldg-rwy-len').value)||10000;
    let slope = parseFloat(document.getElementById('ldg-rwy-slope').value) || 0;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let revMode = document.getElementById('ldg-rev').value;
    let hasRev = (revMode === 'max');

    let wdir = parseFloat(document.getElementById('ldg-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('ldg-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    
    let angleRad = Math.abs(rhdg - wdir) * (Math.PI / 180);
    let hw = Math.cos(angleRad) * wspd;

    let scenarios = [
        { conf: 'FULL', ab: 'MAX' },
        { conf: 'FULL', ab: 'MED' },
        { conf: 'FULL', ab: 'LO' },
        { conf: '3',    ab: 'MED' }
    ];

    let matrixResults = [];
    let bestOption = null;

    let dp = window.perfDB.dist_physics;
    let decel = window.perfDB.decel_physics;

    scenarios.forEach(sc => {
        let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
        if (sc.conf === '3') vls += window.perfDB.landing_conf3_add;
        let windCorr = Math.max(5, Math.min(15, hw / 3)); 
        let vapp = Math.round(vls + windCorr);

        let dist = dp.base_ld_dist_ft * (ldw / 180000); 

        dist *= decel.autobrake[sc.ab]; 
        if (sc.conf === '3') dist *= decel.conf3_penalty; 

        if (slope < 0) dist *= (1 + (Math.abs(slope) * 0.10)); // 下坡
        
        let revFactor = isWet ? decel.rev_credit.wet : decel.rev_credit.dry;
        if (hasRev) dist *= (1 - revFactor);
        
        let safety = isWet ? decel.safety_margin.wet : decel.safety_margin.dry;
        let rld = Math.round(dist * safety);
        let margin = rwyLen - rld;

        let status = (margin >= 0) ? "GO" : "NO";
        let color = (margin >= 0) ? "#00ff00" : "#e74c3c";

        matrixResults.push({
            conf: sc.conf,
            ab: sc.ab,
            vapp: vapp,
            dist: rld,
            status: status,
            color: color
        });

        if (status === "GO" && !bestOption) bestOption = matrixResults[matrixResults.length-1];
        if (status === "GO" && sc.conf === "FULL" && sc.ab === "MED") bestOption = matrixResults[matrixResults.length-1];
    });

    if (!bestOption) bestOption = matrixResults[0]; 

    let zfwCG = computeInternalZFWCG();
    let ldgCG = zfwCG - 0.5;
    let ldgTHS = calculateTHS(ldgCG);
    let ldgIF = convertToIF(ldgTHS.raw) + 5;

    document.getElementById('res-ldw').innerText = Math.round(ldw) + " KG";
    document.getElementById('res-ldw').style.color = (ldw > window.weightDB.limits.mlw) ? "#e74c3c" : "#fff";

    let tableHTML = `
        <table class="matrix-table">
            <thead>
                <tr>
                    <th>CONF</th>
                    <th>BRK</th>
                    <th>VAPP</th>
                    <th>DIST</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
    `;
    
    matrixResults.forEach(r => {
        tableHTML += `
            <tr>
                <td style="color:${r.conf==='3'?'#ffcc00':'#fff'}">${r.conf}</td>
                <td>${r.ab}</td>
                <td style="color:#00bfff">${r.vapp}</td>
                <td>${r.dist}</td>
                <td style="font-weight:bold; color:${r.color}">${r.status}</td>
            </tr>
        `;
    });
    tableHTML += `</tbody></table>`;

    let perfSection = document.querySelector('#tab-landing .perf-section');
    perfSection.innerHTML = `
        <div class="perf-title" style="color:#ffcc00;">LANDING DISTANCE MATRIX (RLD)</div>
        ${tableHTML}
        <div style="border-bottom:1px solid #333;margin:8px 0;"></div>
        <div class="data-grid" style="grid-template-columns: 1fr 1fr;">
             <div class="data-item"><div>TRIM (THS)</div><div id="res-ldg-trim">${ldgTHS.text} (${Math.min(100, ldgIF)}%)</div></div>
             <div class="data-item"><div>LDG CG</div><div id="res-ldg-cg-display">${ldgCG.toFixed(1)}%</div></div>
        </div>
    `;

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

// ============================================
// 📝 REALISTIC DISPATCH LOGIC (v28.1)
// ============================================

let currentDispatchState = {
    flightId: null,
    dist: 0,
    type: "PAX",
    profile: "BIZ",
    limitTOW: 242000,
    bagsPerPax: 13,
    trimMode: "STD"
};

function initDispatchSession(flightId) {
    const f = window.flightDB[flightId];
    if(!f) return;

    // 1. 設定狀態
    currentDispatchState.flightId = flightId;
    currentDispatchState.dist = f.dist || 500;
    currentDispatchState.type = f.type || "PAX";
    currentDispatchState.profile = f.profile || "BIZ";

    // 2. 更新 UI 標籤與滑桿範圍
    const paxSlider = document.getElementById('slider-dsp-pax');
    const cgoSlider = document.getElementById('slider-dsp-cgo');
    const lblPax = document.getElementById('lbl-dsp-pax');
    const tagProfile = document.getElementById('dsp-profile-tag');
    const tagTrim = document.getElementById('dsp-trim-tag');
    const distDisp = document.getElementById('dsp-dist-disp');

    if(distDisp) distDisp.innerText = f.dist + " NM";
    if(tagProfile) tagProfile.innerText = f.profile;

    // 3. 根據 Profile 設定預設值 (Type & Profile Logic)
    if (f.type === "PAX") {
        lblPax.innerHTML = "PAX";
        paxSlider.max = 441;
        
        if (f.profile === "LEISURE") {
            // 觀光: 高載客, 重行李, 重心偏後
            currentDispatchState.bagsPerPax = 20;
            currentDispatchState.trimMode = "AFT";
            paxSlider.value = 400; // ~90% LF
            tagTrim.innerText = "AFT (40:60)";
        } else {
            // 商務: 標準載客, 輕行李
            currentDispatchState.bagsPerPax = 13;
            currentDispatchState.trimMode = "STD";
            paxSlider.value = 350; // ~80% LF
            tagTrim.innerText = "STD (55:45)";
        }
        cgoSlider.value = 12000; // 預設貨物

    } else if (f.type === "CGO") {
        // 客改貨
        lblPax.innerHTML = "CABIN CGO";
        paxSlider.max = 300; // 模擬客艙載貨單位
        paxSlider.value = 150;
        
        cgoSlider.value = 20000; // 腹艙滿載
        currentDispatchState.bagsPerPax = 0; // 無行李
        currentDispatchState.trimMode = "FWD"; // 客艙貨物導致重心前移
        tagTrim.innerText = "FWD CORR";

    } else {
        // Ferry / Maint
        paxSlider.value = 0;
        cgoSlider.value = 0;
        currentDispatchState.bagsPerPax = 0;
        tagTrim.innerText = "NEUTRAL";
    }

    // 4. 清空與重置
    document.getElementById('inp-dsp-fuel').value = ""; // 清空燃油讓系統計算 Min
    updateDispatchCalc(); // 觸發第一次計算
}

function updateDispatchCalc() {
    if(!window.weightDB) return;

    // --- A. 讀取滑桿數據 ---
    let paxVal = parseInt(document.getElementById('slider-dsp-pax').value) || 0;
    let cgoVal = parseInt(document.getElementById('slider-dsp-cgo').value) || 0;
    
    // 顯示數值
    document.getElementById('val-dsp-pax').innerText = paxVal;
    document.getElementById('val-dsp-cgo').innerText = (cgoVal/1000).toFixed(1);

    // --- B. 計算 ZFW (Zero Fuel Weight) ---
    // PAX: 77kg, Bags: 動態, Cargo: 滑桿
    let paxWt = paxVal * 77;
    let bagWt = (currentDispatchState.type === "PAX") ? (paxVal * currentDispatchState.bagsPerPax) : 0;
    // 如果是 CGO 模式，Pax Slider 代表客艙貨物 (假設每單位 77kg 模擬)
    
    let zfw = window.weightDB.oew + paxWt + bagWt + cgoVal;

    // --- C. 跑道限重檢查 (RTOW Analysis) ---
    let limitTOW = 242000; // Default MTOW
    let rwyLimitMsg = "UNRESTRICTED";
    let isLimited = false;

    // 嘗試從 Performance Tab 的選擇中獲取跑道長度 (若有)
    let toLen = parseFloat(document.getElementById('to-rwy-len').value) || 12000;
    let ldgLen = parseFloat(document.getElementById('ldg-rwy-len').value) || 12000;
    let minLen = Math.min(toLen, ldgLen);

    if (minLen < 8000) {
        limitTOW = 195000;
        rwyLimitMsg = "SEVERE (<8000')";
        isLimited = true;
    } else if (minLen < 9000) {
        limitTOW = 220000;
        rwyLimitMsg = "LIMITED (<9000')";
        isLimited = true;
    }

    let dspLimit = document.getElementById('dsp-limit-tow');
    if(dspLimit) {
        dspLimit.innerText = (limitTOW/1000) + "T (" + rwyLimitMsg + ")";
        dspLimit.style.color = isLimited ? "#f1c40f" : "#2ecc71";
    }

    // --- D. 燃油計算 (Fuel Math) ---
    let dist = currentDispatchState.dist;
    // 1. 載重成本: 每噸載重每 1000nm 多燒 40kg
    let payloadTons = (zfw - window.weightDB.oew) / 1000;
    let weightPenalty = payloadTons * 0.04 * dist;
    
    // 2. 基礎航程油耗 (Base Burn 12.5 kg/nm) + 懲罰
    let tripFuel = (dist * 12.5) + weightPenalty;
    
    // 3. 法規儲備 (Contingency 5% + Final 30min + Alt 2500 + Taxi 600)
    let minBlock = Math.round(tripFuel * 1.05 + 2400 + 2500 + 600);

    // 更新 UI
    document.getElementById('dsp-trip-fuel').innerText = Math.round(tripFuel);
    document.getElementById('dsp-min-fuel').innerText = minBlock;

    // --- E. 減載邏輯 (Shedding Hierarchy) ---
    let userFuel = parseFloat(document.getElementById('inp-dsp-fuel').value);
    
    // 如果使用者還沒輸入，暫時用 MinBlock 當作 TOW 計算基礎
    let calcFuel = userFuel || minBlock; 
    let currentTOW = zfw + calcFuel;

    let alertBox = document.getElementById('dsp-alert-box');
    
    if (currentTOW > limitTOW) {
        // 超重了！執行減載
        if(alertBox) alertBox.style.display = 'block';
        
        // 1. 先砍貨
        if (cgoVal > 0) {
            let reduce = currentTOW - limitTOW;
            cgoVal = Math.max(0, cgoVal - reduce);
            document.getElementById('slider-dsp-cgo').value = cgoVal;
            // 遞迴呼叫自己重新計算
            return updateDispatchCalc(); 
        }
        
        // 2. 貨沒了還超重，砍人
        if (cgoVal === 0 && paxVal > 0) {
            // 估算需要減少多少人 (每人+行李約 100kg)
            let paxUnitWt = 77 + currentDispatchState.bagsPerPax;
            let reduceKg = currentTOW - limitTOW;
            let reducePax = Math.ceil(reduceKg / paxUnitWt);
            paxVal = Math.max(0, paxVal - reducePax);
            document.getElementById('slider-dsp-pax').value = paxVal;
            return updateDispatchCalc();
        }
    } else {
        if(alertBox) alertBox.style.display = 'none';
    }

    // --- F. 最終結果顯示 ---
    let estLW = currentTOW - tripFuel;

    let elZfw = document.getElementById('dsp-res-zfw');
    let elTow = document.getElementById('dsp-res-tow');
    let elLw = document.getElementById('dsp-res-lw');

    elZfw.innerText = Math.round(zfw);
    elTow.innerText = Math.round(currentTOW);
    elLw.innerText = Math.round(estLW);

    // 顏色警告
    elZfw.style.color = (zfw > window.weightDB.limits.mzfw) ? "red" : "#fff";
    elTow.style.color = (currentTOW > window.weightDB.limits.mtow) ? "red" : "#fff";
    elLw.style.color = (estLW > window.weightDB.limits.mlw) ? "orange" : "#fff"; 
    
    // 燃油警告
    let fuelInput = document.getElementById('inp-dsp-fuel');
    if (userFuel && userFuel < minBlock) {
        fuelInput.style.color = "red";
        fuelInput.style.borderColor = "red";
    } else {
        fuelInput.style.color = "#00ff00";
        fuelInput.style.borderColor = "#444";
    }
}

function confirmDispatch() {
    // 1. 獲取最終數據
    let paxVal = document.getElementById('slider-dsp-pax').value;
    let cgoVal = parseFloat(document.getElementById('slider-dsp-cgo').value);
    let fuelVal = document.getElementById('inp-dsp-fuel').value;

    if (!fuelVal) {
        alert("⚠️ Please enter BLOCK FUEL before dispatching.");
        return;
    }

    // 2. 計算貨物分艙 (依照 Trim Mode)
    let fwdRatio = 0.5; // Default 50:50
    if (currentDispatchState.trimMode === "STD") fwdRatio = 0.55; // 55% FWD
    if (currentDispatchState.trimMode === "AFT") fwdRatio = 0.40; // 40% FWD
    // CGO 模式下 Belly 鎖定 50:50 
    if (currentDispatchState.type === "CGO") fwdRatio = 0.50; 

    let fwdCgo = Math.round(cgoVal * fwdRatio);
    let aftCgo = cgoVal - fwdCgo;

    // 3. 填入 Performance 頁面
    document.getElementById('pax-count').value = paxVal;
    document.getElementById('cargo-fwd').value = fwdCgo;
    document.getElementById('cargo-aft').value = aftCgo;
    document.getElementById('fuel-total').value = fuelVal;
    
    // 自動填入 Trip Fuel (從 Dispatch 計算結果)
    let trip = document.getElementById('dsp-trip-fuel').innerText;
    document.getElementById('trip-fuel').value = trip;

    // 觸發 Performance 頁面的計算更新
    updatePaxWeight();
    updateTotalCargo();
    saveInputs();

    // 4. 跳轉
    switchTab('takeoff');
}
