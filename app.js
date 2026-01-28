{
type: uploaded file
fileName: app.js
fullContent:
// ==========================================
// 🧠 A330-300 EFB Core v28.0 (Hyper-Realism Dispatch)
// ==========================================

function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('a330_roster_v25')) || {};
let dispatchState = null; // 暫存 Dispatch 數據

window.onload = function() {
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ DB Error! Ensure all JS files are loaded.");
    } else {
        renderRoster();
    }
    // 預設載入 Input，若在 dispatch 狀態則保持
    loadInputs(); 
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    
    // 處理 Nav 按鈕高亮 (Dispatch 可能沒有按鈕，視設計而定)
    let btn = document.getElementById('btn-' + t);
    if(btn) btn.classList.add('active');
}

// --------------------------------------------
// 1. Roster Logic
// --------------------------------------------
function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        // v28: 不再顯示具體重量，改顯示情境
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = (e) => { if(!e.target.classList.contains('check-btn')) initDispatch(k); };
        
        let icon = v.type === 'PAX' ? '🇪🇺' : '📦';
        if(v.ci < 20) icon = '🌎'; // 長程

        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${v.day} | ${k}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:12px; color:#00bfff; margin-bottom:4px; font-weight:bold;">
                    ${icon} ${v.type} | ${v.profile} | DEMAND: ${v.demand}
                </div>
                <div class="flight-desc">Tap to Dispatch</div>
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

// --------------------------------------------
// 2. Dispatch Logic (The New Brain)
// --------------------------------------------

// A. 跑道能量分析 (Runway Energy Scoring)
function calculateEFL(icao, oat) {
    if (!window.airportDB || !window.airportDB[icao]) return { factor: 1.0, msg: "NO DATA", color: "#666" };
    
    let apt = window.airportDB[icao];
    // 找最長跑道
    let maxLen = 0;
    for (let r in apt.runways) {
        if (apt.runways[r].len > maxLen) maxLen = apt.runways[r].len;
    }
    
    // 1. 海拔懲罰: 每 1000ft 損失 500ft
    let elevPenalty = (apt.elev / 1000) * 500;
    
    // 2. 溫度懲罰: >30C 每度損失 100ft
    let tempPenalty = Math.max(0, oat - 30) * 100;
    
    let efl = maxLen - elevPenalty - tempPenalty;
    
    let factor = 1.0;
    let msg = "UNRESTRICTED";
    let color = "#2ecc71"; // Green

    if (efl < 8000) {
        factor = 0.60;
        msg = "SEVERE LIMIT";
        color = "#e74c3c"; // Red
    } else if (efl < 9000) {
        factor = 0.85;
        msg = "PERF LIMITED";
        color = "#f1c40f"; // Yellow
    }

    return { factor, msg, color, efl, maxLen };
}

// B. 預估油量 (Trip Fuel Estimation)
function estimateTripFuel(route) {
    let r = route.toUpperCase();
    if (r.includes("ZBAA") || r.includes("PVG") || r.includes("NRT") || r.includes("KORD") || r.includes("JFK") || r.includes("KMIA")) return 85000;
    if (r.includes("DXB") || r.includes("MIA")) return 55000;
    if (r.includes("LHR") || r.includes("CDG") || r.includes("MAD") || r.includes("EHAM")) return 16000;
    if (r.includes("LFSB") || r.includes("LIRF")) return 8000;
    return 15000; // Default
}

// C. 載重生成器 (Yield Management)
function initDispatch(flightId) {
    let f = window.flightDB[flightId];
    if(!f) return;

    // 1. 環境參數
    let oat = 15; // 預設標準溫
    let dep = f.r.split('-')[0];
    let arr = f.r.split('-')[1];

    // 2. 跑道分析 (取起降兩端較嚴格者)
    let depAna = calculateEFL(dep, oat);
    let arrAna = calculateEFL(arr, oat);
    let limitFactor = Math.min(depAna.factor, arrAna.factor);
    let limitMsg = (depAna.factor < arrAna.factor) ? depAna.msg : arrAna.msg;
    let limitColor = (depAna.factor < arrAna.factor) ? depAna.color : arrAna.color;

    // 3. 油量與結構限制
    let tripFuel = estimateTripFuel(f.r);
    let oew = window.weightDB.oew;
    let mzfw = window.weightDB.limits.mzfw;
    let mtow = window.weightDB.limits.mtow;

    let structCap = mzfw - oew; // ZFW 限制空間
    let perfCap = mtow - oew - tripFuel; // TOW 限制空間
    
    // 最終允許業載 (考慮跑道減載係數)
    let allowedLoad = Math.min(structCap, perfCap) * limitFactor;
    
    // 4. 生成內容 (Pax, Bags, Cargo)
    let maxPax = 441;
    let bookedPax = 0;
    
    // Demand 轉換
    if (f.demand === "HIGH") bookedPax = maxPax * (0.95 + Math.random()*0.05);
    else if (f.demand === "MED") bookedPax = maxPax * (0.75 + Math.random()*0.15);
    else bookedPax = maxPax * (0.50 + Math.random()*0.20);
    
    // No-show (0-5%)
    let actualPax = Math.floor(bookedPax * (0.95 + Math.random()*0.05));
    
    // 客改貨特例
    if (f.type === "PREIGHTER") {
        actualPax = Math.floor(150 + Math.random() * 150); // 這裡的 Pax 是貨箱
    }

    // Pax Weight (固定 77kg)
    let paxWt = actualPax * 77;

    // Bags Weight
    let bagFactor = 1.0;
    if (f.profile === "LEISURE") bagFactor = 1.8;
    if (f.profile === "VFR") bagFactor = 2.2;
    if (f.type === "PREIGHTER") bagFactor = 0; // 貨機無行李

    let bagsWt = Math.floor(actualPax * bagFactor * 13);
    
    // 檢查是否已超重 (RANGE LIMITED)
    let rangeLimited = false;
    if (paxWt + bagsWt > allowedLoad) {
        rangeLimited = true;
        // 強制減人
        let ratio = allowedLoad / (paxWt + bagsWt);
        actualPax = Math.floor(actualPax * ratio);
        paxWt = actualPax * 77;
        bagsWt = Math.floor(actualPax * bagFactor * 13);
    }

    // Cargo Generation
    let remaining = allowedLoad - paxWt - bagsWt;
    let cargoWt = 0;
    if (remaining > 0) {
        if (f.type === "PREIGHTER") {
            cargoWt = Math.min(remaining, 20000); // 填滿
        } else {
            // 客機隨機填
            let cargoUtil = (f.profile === "LEISURE") ? 0.8 : 0.4; // 觀光客貨少(因為行李多)，商務客貨少(因為快遞輕)?? 修正: 商務線貨多
            if (f.profile === "BUSINESS") cargoUtil = 0.7;
            cargoWt = Math.floor(remaining * cargoUtil * Math.random());
        }
    }

    // 5. 儲存暫存狀態
    dispatchState = {
        id: flightId,
        route: f.r,
        type: f.type,
        limitMsg: limitMsg,
        limitColor: limitColor,
        tripFuel: tripFuel,
        allowedLoad: allowedLoad,
        actualPax: actualPax,
        paxWt: paxWt,
        bagsWt: bagsWt,
        cargoWt: cargoWt,
        rangeLimited: rangeLimited,
        ci: f.ci
    };

    renderDispatchUI();
    switchTab('dispatch');
}

function renderDispatchUI() {
    if(!dispatchState) return;
    let s = dispatchState;

    document.getElementById('dsp-flight').innerText = s.id + " (" + s.route + ")";
    
    // 跑道狀態
    let rwyEl = document.getElementById('dsp-rwy-status');
    rwyEl.innerText = s.limitMsg;
    rwyEl.style.color = s.limitColor;
    rwyEl.style.borderColor = s.limitColor;

    // 油量狀態
    let fuelEl = document.getElementById('dsp-fuel-status');
    if (s.rangeLimited) {
        fuelEl.innerText = "RANGE LIMITED";
        fuelEl.style.color = "#e74c3c";
    } else {
        fuelEl.innerText = "OK (" + Math.round(s.tripFuel/1000) + "T FUEL)";
        fuelEl.style.color = "#2ecc71";
    }

    // 滑桿設定
    let slider = document.getElementById('dsp-pax-slider');
    slider.max = 441;
    slider.value = s.actualPax;
    document.getElementById('dsp-pax-val').innerText = s.actualPax;
    
    updateDispatchNumbers();
}

function updateFromSlider() {
    if(!dispatchState) return;
    let val = parseInt(document.getElementById('dsp-pax-slider').value);
    dispatchState.actualPax = val;
    dispatchState.paxWt = val * 77;
    // 重新計算行李 (簡單比例)
    let bagFactor = (dispatchState.type === "PREIGHTER") ? 0 : (dispatchState.bagsWt > 0 ? (dispatchState.bagsWt / (dispatchState.paxWt/77)/13) : 1); 
    // 上面這行有點複雜，簡化：如果原本是 PAX，我們假設 BagFactor 不變
    if(dispatchState.type !== "PREIGHTER") {
         // 重新讀取 Profile 比較難，這裡直接用當前比例
         // 簡化：每次拉動滑桿，行李隨之變動
         dispatchState.bagsWt = Math.floor(val * 13 * 1.2); // 假設平均 1.2
    }
    
    document.getElementById('dsp-pax-val').innerText = val;
    updateDispatchNumbers();
}

function updateDispatchNumbers() {
    let s = dispatchState;
    let totalLoad = s.paxWt + s.bagsWt + s.cargoWt;
    let underload = s.allowedLoad - totalLoad;

    document.getElementById('dsp-pax-wt').innerText = s.paxWt;
    document.getElementById('dsp-bag-wt').innerText = s.bagsWt;
    document.getElementById('dsp-cgo-wt').innerText = s.cargoWt;
    document.getElementById('dsp-total-load').innerText = totalLoad;
    
    let ulEl = document.getElementById('dsp-underload');
    ulEl.innerText = Math.round(underload);
    ulEl.style.color = (underload < 0) ? "red" : "#00bfff";
    
    let btn = document.getElementById('btn-confirm-dispatch');
    if (underload < 0) {
        btn.disabled = true;
        btn.style.opacity = 0.5;
        btn.innerText = "OVERWEIGHT";
    } else {
        btn.disabled = false;
        btn.style.opacity = 1;
        btn.innerText = "CONFIRM & DISPATCH";
    }
}

function confirmDispatch() {
    if(!dispatchState) return;
    let s = dispatchState;
    
    // 1. 分配 Cargo (55/45 或 50/50)
    let totalCargo = s.bagsWt + s.cargoWt;
    let fwdRatio = 0.55;
    if (s.type === "PREIGHTER" || totalCargo > 15000) fwdRatio = 0.50;
    
    let fwd = Math.round(totalCargo * fwdRatio);
    let aft = totalCargo - fwd;

    // 2. 填入 Takeoff Inputs
    document.getElementById('pax-count').value = s.actualPax;
    document.getElementById('cargo-fwd').value = fwd;
    document.getElementById('cargo-aft').value = aft;
    document.getElementById('trip-fuel').value = s.tripFuel;
    
    // 油量預設: Trip + 3000 (Reserve) + 1000 (Taxi)
    document.getElementById('fuel-total').value = s.tripFuel + 4000;

    // 3. 觸發計算更新
    updatePaxWeight();
    updateTotalCargo();
    
    // 4. 設定標題與機場
    let dep = s.route.split('-')[0];
    let arr = s.route.split('-')[1];
    document.getElementById('to-flight-title').innerText = s.id + " (" + s.route + ")";
    document.getElementById('ldg-flight-desc').innerText = s.id + " (" + s.route + ")";
    
    // 自動選取機場 (若有)
    if(window.airportDB) {
        populateRunways('to-rwy-select', dep);
        populateRunways('ldg-rwy-select', arr);
        if(window.airportDB[dep]) {
            document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev;
            // 自動選最長跑道
            let bestRwy = ""; let maxL = 0;
            for(let r in window.airportDB[dep].runways) {
                if(window.airportDB[dep].runways[r].len > maxL) { maxL = window.airportDB[dep].runways[r].len; bestRwy = r; }
            }
            document.getElementById('to-rwy-select').value = bestRwy;
        }
    }
    applyRunway('to');
    applyRunway('ldg'); // 預先載入

    // 5. 切換頁面
    switchTab('takeoff');
    saveInputs();
}

// --------------------------------------------
// 3. Takeoff & Landing Logic (保留原有的 v27 核心)
// --------------------------------------------
// ... (保留 calculateTakeoff, calculateLanding 等函數，無需修改) ...
// 為了節省篇幅，這裡假設下方的 calculateTakeoff / calculateLanding / Helpers 
// 與 v27 版本完全一致。請確保將原 app.js 的後半部分貼在後面。

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
    saveInputs();
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

// Physics Helper Functions
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
        <table class="landing-matrix">
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
}
