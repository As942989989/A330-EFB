// ==========================================
// 🧠 A330-300 EFB Core v28.2 (Fixed Logic)
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
        // 嘗試載入上次輸入，但不要報錯
        try { loadInputs(); } catch(e) { console.log("No prev inputs"); }
    }
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    const tab = document.getElementById('tab-' + t);
    const btn = document.getElementById('btn-' + t);
    
    if(tab) tab.classList.add('active');
    if(btn) btn.classList.add('active');
}

// --------------------------------------------
// Roster & UI Helper Functions
// --------------------------------------------
function renderRoster() {
    const list = document.getElementById('roster-list');
    if(!list) return;
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
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

function loadFlight(k) {
    if(!window.flightDB[k]) return;
    const d = window.flightDB[k];
    
    // UI 標題更新
    let t1 = document.getElementById('to-flight-title');
    let t2 = document.getElementById('ldg-flight-desc');
    let t3 = document.getElementById('dsp-flight');
    
    if(t1) t1.innerText = k + " (" + d.r + ")";
    if(t2) t2.innerText = k + " (" + d.r + ")";
    if(t3) t3.innerText = k + " (" + d.r + ")";

    let route = d.r.toUpperCase();
    let dep = route.split('-')[0].trim();
    let arr = route.split('-')[1].trim();
    
    // 清空舊數據
    let oatEl = document.getElementById('to-oat');
    if(oatEl) oatEl.value = ""; 

    if(window.airportDB) {
        if(window.airportDB[dep]) document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        if(window.airportDB[arr]) document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
    }

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);
    
    applyRunway('to'); 
    applyRunway('ldg');
    
    // *** 初始化 Dispatch ***
    initDispatchSession(k); 
    switchTab('dispatch'); 
}

function populateRunways(selectId, icao) {
    const sel = document.getElementById(selectId);
    if(!sel) return;
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
    if(!sel) return;
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

// --------------------------------------------
// Legacy Helper Wrappers (Compatible)
// --------------------------------------------
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

// ============================================
// 📝 DISPATCH LOGIC (v28.2 Fixed)
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

    // 1. 初始化狀態
    currentDispatchState.flightId = flightId;
    currentDispatchState.dist = f.dist || 500;
    currentDispatchState.type = f.type || "PAX";
    currentDispatchState.profile = f.profile || "BIZ";

    // 2. 取得 UI 元素
    const paxSlider = document.getElementById('slider-dsp-pax');
    const cgoSlider = document.getElementById('slider-dsp-cgo');
    const profileTag = document.getElementById('dsp-profile-tag');
    const trimTag = document.getElementById('dsp-trim-tag');
    const distDisp = document.getElementById('dsp-dist-disp');
    
    if(profileTag) profileTag.innerText = currentDispatchState.profile;
    if(distDisp) distDisp.innerText = currentDispatchState.dist + " NM";

    // 3. 設定 Slider 與參數
    if (f.type === "PAX") {
        paxSlider.max = 441;
        
        if (f.profile === "LEISURE") {
            currentDispatchState.bagsPerPax = 20;
            currentDispatchState.trimMode = "AFT";
            paxSlider.value = 400; 
            cgoSlider.value = 5000;
        } else {
            currentDispatchState.bagsPerPax = 13;
            currentDispatchState.trimMode = "STD";
            paxSlider.value = 350; 
            cgoSlider.value = 10000;
        }
    } else if (f.type === "CGO") {
        paxSlider.max = 0; // 貨機無客
        paxSlider.value = 0;
        currentDispatchState.bagsPerPax = 0;
        currentDispatchState.trimMode = "FWD"; 
        cgoSlider.value = 35000; // 較高預設值
    } else {
        // Ferry
        paxSlider.value = 0;
        cgoSlider.value = 0;
        currentDispatchState.bagsPerPax = 0;
        currentDispatchState.trimMode = "NEUTRAL";
    }

    if(trimTag) trimTag.innerText = currentDispatchState.trimMode;

    // 4. 重置燃油並計算
    document.getElementById('inp-dsp-fuel').value = "";
    updateDispatchCalc(); // 修正呼叫名稱
}

// 核心計算函數：名稱必須與 HTML oninput 一致
function updateDispatchCalc() {
    if(!window.weightDB) return;

    // --- A. 讀取滑桿數據 ---
    let paxSlider = document.getElementById('slider-dsp-pax');
    let cgoSlider = document.getElementById('slider-dsp-cgo');
    
    let paxVal = parseInt(paxSlider.value) || 0;
    let cgoVal = parseInt(cgoSlider.value) || 0;

    // 更新顯示文字
    document.getElementById('val-dsp-pax').innerText = paxVal;
    document.getElementById('val-dsp-cgo').innerText = cgoVal;

    // --- B. 計算重量 ---
    let paxWt = paxVal * 77;
    let bagWt = paxVal * currentDispatchState.bagsPerPax;
    
    // 更新細項顯示 (注意：HTML 必須有這些 ID)
    let elPaxWt = document.getElementById('dsp-pax-wt');
    let elBagWt = document.getElementById('dsp-bag-wt');
    let elCgoWt = document.getElementById('dsp-cgo-wt');
    
    if(elPaxWt) elPaxWt.innerText = paxWt;
    if(elBagWt) elBagWt.innerText = bagWt;
    if(elCgoWt) elCgoWt.innerText = cgoVal;

    let totalLoad = paxWt + bagWt + cgoVal;
    let elTotal = document.getElementById('dsp-total-load');
    if(elTotal) elTotal.innerText = totalLoad;

    let zfw = window.weightDB.oew + totalLoad;
    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw);

    // --- C. 跑道限重分析 ---
    let toLen = parseFloat(document.getElementById('to-rwy-len').value) || 12000;
    let ldgLen = parseFloat(document.getElementById('ldg-rwy-len').value) || 12000;
    let minLen = Math.min(toLen, ldgLen);
    
    let limitTOW = 242000;
    let rwyMsg = "UNRESTRICTED";
    
    if (minLen < 8000) {
        limitTOW = 195000;
        rwyMsg = "SEVERE (<8000')";
    } else if (minLen < 9000) {
        limitTOW = 220000;
        rwyMsg = "LIMITED (<9000')";
    }
    
    document.getElementById('dsp-limit-tow').innerText = (limitTOW/1000) + "T";
    let statusEl = document.getElementById('dsp-rwy-status');
    if(statusEl) {
        statusEl.innerText = rwyMsg;
        statusEl.style.color = limitTOW < 242000 ? "#f1c40f" : "#2ecc71";
    }

    // --- D. 燃油計算 ---
    let dist = currentDispatchState.dist;
    // 1. 載重成本: 每噸載重每 1000nm 多燒 40kg
    let payloadTons = totalLoad / 1000;
    let weightPenalty = payloadTons * 0.04 * dist;
    
    // 2. 基礎航程油耗 (Base Burn 12.5 kg/nm) + 懲罰
    let tripFuel = (dist * 12.5) + weightPenalty;
    
    // 3. 法規儲備 (Contingency 5% + Final 30min + Alt 2500 + Taxi 600)
    let minBlock = Math.round(tripFuel * 1.05 + 2400 + 2500 + 600);

    let fuelStatusEl = document.getElementById('dsp-fuel-status');
    if(fuelStatusEl) fuelStatusEl.innerText = "MIN REQ: " + minBlock;

    // --- E. 最終結果 ---
    let userFuel = parseFloat(document.getElementById('inp-dsp-fuel').value) || minBlock;
    let tow = zfw + userFuel;
    let tripBurn = Math.round(tripFuel);
    let lw = tow - tripBurn;

    document.getElementById('dsp-res-tow').innerText = Math.round(tow);
    document.getElementById('dsp-res-lw').innerText = Math.round(lw);

    // Underload (剩餘載重能力)
    let underload = limitTOW - tow;
    let ulEl = document.getElementById('dsp-underload');
    if(ulEl) {
        ulEl.innerText = (underload >= 0 ? "+" : "") + Math.round(underload);
        ulEl.style.color = (underload < 0) ? "#e74c3c" : "#00bfff";
    }

    // 燃油輸入框警告
    let fuelInput = document.getElementById('inp-dsp-fuel');
    if (document.getElementById('inp-dsp-fuel').value && userFuel < minBlock) {
        fuelInput.style.borderColor = "red";
        fuelInput.style.color = "red";
    } else {
        fuelInput.style.borderColor = "#444";
        fuelInput.style.color = "#00ff00";
    }
    
    // 儲存臨時 trip fuel 供稍後使用
    currentDispatchState.calcTripFuel = tripBurn;
}

function confirmDispatch() {
    let paxVal = document.getElementById('slider-dsp-pax').value;
    let fuelVal = document.getElementById('inp-dsp-fuel').value;
    
    // 從 DOM 讀取計算好的 Cargo (或者直接讀 Slider)
    let cgoVal = parseInt(document.getElementById('slider-dsp-cgo').value) || 0;

    if (!fuelVal) {
        alert("⚠️ Please enter BLOCK FUEL before dispatching.");
        return;
    }

    // 計算貨物分艙
    let fwdRatio = 0.5; 
    if (currentDispatchState.trimMode === "STD") fwdRatio = 0.55; 
    if (currentDispatchState.trimMode === "AFT") fwdRatio = 0.40; 
    if (currentDispatchState.type === "CGO") fwdRatio = 0.50; 

    let fwdCgo = Math.round(cgoVal * fwdRatio);
    let aftCgo = cgoVal - fwdCgo;

    // 填入 Performance 頁面
    document.getElementById('pax-count').value = paxVal;
    document.getElementById('cargo-fwd').value = fwdCgo;
    document.getElementById('cargo-aft').value = aftCgo;
    document.getElementById('fuel-total').value = fuelVal;
    
    // 自動填入 Trip Fuel
    if(currentDispatchState.calcTripFuel) {
        document.getElementById('trip-fuel').value = currentDispatchState.calcTripFuel;
    }
    
    // 觸發 Performance 計算
    updatePaxWeight();
    updateTotalCargo();
    saveInputs();

    switchTab('takeoff');
}

// ============================================
// 🛫 OPT 起飛優化邏輯
// ============================================
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;

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
// 🛬 OPT 降落矩陣邏輯
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

        if (slope < 0) dist *= (1 + (Math.abs(slope) * 0.10)); 
        
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
