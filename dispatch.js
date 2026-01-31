// ==========================================
// 🧠 A330 Dispatch Logic (v5.0 Realism Physics)
// ==========================================

let currentDispatchState = {
    flightId: null,
    dist: 0,
    ci: 0,
    pax: 0,
    cgoF: 0,
    cgoA: 0,
    fuel: 0,
    warnings: [],
    isSaved: false,
    tags: []
};

function getStorageKey(flightId) {
    return 'dsp_save_' + flightId;
}

function initDispatchSession(flightId) {
    const f = window.flightDB[flightId];
    if(!f) return;

    currentDispatchState.flightId = flightId;
    currentDispatchState.dist = f.dist;
    currentDispatchState.tags = f.tags || [];

    let savedData = safeGet(getStorageKey(flightId));
    
    if (savedData) {
        let parsed = JSON.parse(savedData);
        currentDispatchState = { ...currentDispatchState, ...parsed };
        currentDispatchState.isSaved = true;
    } else {
        generateNewDispatch(flightId);
    }

    if(typeof updateDispatchDisplay === 'function') updateDispatchDisplay();
}

function forceNewDispatch() {
    if(!currentDispatchState.flightId) return;
    if(confirm("RE-CALCULATE LOADSHEET?")) {
        generateNewDispatch(currentDispatchState.flightId);
        if(typeof updateDispatchDisplay === 'function') updateDispatchDisplay();
    }
}

function generateNewDispatch(flightId) {
    const f = window.flightDB[flightId];
    currentDispatchState.warnings = [];
    currentDispatchState.isSaved = false;
    let tags = f.tags || [];

    // --- 1. Pax Calculation (Simulating Cargo via Pax slots for Preighter) ---
    let basePax = 441; // A330 High Density
    let lf = rnd(70, 95) / 100;
    
    if (tags.includes("PREIGHTER")) {
        // 客改貨模式：利用高乘客數模擬貨物重量
        currentDispatchState.pax = rnd(280, 310); 
        currentDispatchState.warnings.push("📦 PREIGHTER MODE (PAX AS CARGO)");
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.pax = 0;
    } 
    else {
        if (f.profile === "BIZ") lf = rnd(60, 85) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf);
    }

    // --- 2. Cargo Calculation (Belly Cargo) ---
    let paxWt = currentDispatchState.pax * (window.weightDB ? window.weightDB.pax_unit : 77);
    let oew = 129855;
    let currentZFW = oew + paxWt;
    let mzfw = 175000;
    let roomForCargo = mzfw - currentZFW; 
    
    if (tags.includes("PREIGHTER")) {
        // Preighter 模式下，腹艙也盡量塞滿
        let target = roomForCargo - 500; 
        target = Math.min(target, 40000); 
        currentDispatchState.cgoTotal = Math.max(0, Math.floor(target));
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.cgoTotal = 0;
    } 
    else {
        let cargoSpace = Math.min(roomForCargo, 20000); 
        currentDispatchState.cgoTotal = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }

    // 分配前後艙 (A330 Trim Strategy: Aft bias for efficiency)
    let fwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;
    currentDispatchState.cgoF = Math.floor(currentDispatchState.cgoTotal * fwdRatio);
    currentDispatchState.cgoA = currentDispatchState.cgoTotal - currentDispatchState.cgoF;

    // --- 3. Fuel & CI (Physics Optimized) ---
    if (tags.includes("SHUTTLE")) currentDispatchState.ci = 80;
    else currentDispatchState.ci = rnd(20, 60);

    // [REALISM UPDATE] Advanced Fuel Physics
    // 1. 計算預估 ZFW (用於判斷是否為重載)
    let estimatedZFW = currentZFW + currentDispatchState.cgoTotal;
    
    // 2. 重量懲罰係數 (Weight Factor)
    // 基準 170T，每多 10T 油耗增加約 3% (非線性物理)
    let weightFactor = 1.0 + ((estimatedZFW - 170000) / 10000 * 0.03);
    
    // 3. 風向係數 (Wind Factor)
    // 隨機模擬高空風：0.95 (大順風) ~ 1.10 (強頂風)
    let windFactor = 1.0 + (rnd(-5, 10) / 100); 

    // 4. 基礎燃油率 (Base Burn)
    // A330-300 平均約 5.8T/hr，換算約 12.0 kg/nm
    let baseBurn = 12.0; 
    
    // 5. 航程油耗計算
    let tripFuel = f.dist * baseBurn * weightFactor * windFactor;

    // 6. 最終油量結構：Trip + Taxi + Reserves (5%) + Alternate/Hold
    let reserves = 400 + (tripFuel * 0.05) + 3000; 
    
    // 確保如果是短程 Shuttle，油量不會太低導致警告
    let minBlock = 6000; 

    currentDispatchState.fuel = Math.max(minBlock, Math.round(tripFuel + reserves));

    saveDispatchToStorage(flightId);
}

function saveDispatchToStorage(flightId) {
    let dataToSave = {
        ci: currentDispatchState.ci,
        pax: currentDispatchState.pax,
        cgoF: currentDispatchState.cgoF,
        cgoA: currentDispatchState.cgoA,
        fuel: currentDispatchState.fuel,
        warnings: currentDispatchState.warnings
    };
    safeSet(getStorageKey(flightId), JSON.stringify(dataToSave));
}

function updateDispatchDisplay() {
    let s = currentDispatchState;
    if(!s.flightId) return;

    // 1. 基礎數據
    document.getElementById('dsp-ci-val').innerText = s.ci;
    document.getElementById('dsp-dist-disp').innerText = s.dist + " NM";
    document.getElementById('dsp-pax-count').innerText = s.pax;
    
    let paxWt = s.pax * (window.weightDB ? window.weightDB.pax_unit : 77);
    document.getElementById('dsp-pax-total-wt').innerText = paxWt;

    let paxPct = Math.min(100, (s.pax / 441) * 100);
    document.getElementById('bar-pax').style.width = paxPct + "%";

    // 2. 貨物數據
    let cgoTotal = s.cgoF + s.cgoA;
    document.getElementById('dsp-cgo-total').innerText = cgoTotal;
    document.getElementById('dsp-cgo-fwd-val').innerText = s.cgoF;
    document.getElementById('dsp-cgo-aft-val').innerText = s.cgoA;

    let fwdPct = cgoTotal > 0 ? (s.cgoF / cgoTotal) * 100 : 50;
    let aftPct = 100 - fwdPct;
    document.getElementById('bar-cgo-fwd').style.width = fwdPct + "%";
    document.getElementById('bar-cgo-aft').style.width = aftPct + "%";
    
    document.getElementById('dsp-cgo-fwd-pct').innerText = Math.round(fwdPct) + "%";
    document.getElementById('dsp-cgo-aft-pct').innerText = Math.round(aftPct) + "%";

    // 3. 燃油數據
    document.getElementById('dsp-est-fuel').innerText = s.fuel;

    // 4. 重量計算
    let oew = window.weightDB ? window.weightDB.oew : 129855;
    let zfw = oew + paxWt + cgoTotal;
    let tow = zfw + s.fuel;
    
    let estTripFuel = Math.max(0, s.fuel - 5500);
    let lw = tow - estTripFuel;

    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw/1000) + "T";
    document.getElementById('dsp-res-tow').innerText = Math.round(tow/1000) + "T";
    document.getElementById('dsp-res-lw').innerText = Math.round(lw/1000) + "T";

    // 5. 限制檢查
    let mtow = window.weightDB ? window.weightDB.limits.mtow : 242000;
    let underload = mtow - tow;
    let ulEl = document.getElementById('dsp-underload');
    ulEl.innerText = underload;
    ulEl.style.color = underload >= 0 ? "#fff" : "#e74c3c";
    
    // 6. 警告顯示
    let statusEl = document.getElementById('dsp-rwy-status');
    if(s.warnings.length > 0) {
        statusEl.innerText = s.warnings[0];
        statusEl.style.color = "#f1c40f";
    } else {
        statusEl.innerText = "STD OPS";
        statusEl.style.color = "#2ecc71";
    }
}

function confirmDispatch() {
    let s = currentDispatchState;
    
    if(document.getElementById('pax-count')) 
        document.getElementById('pax-count').value = s.pax;
    
    if(document.getElementById('cargo-fwd')) 
        document.getElementById('cargo-fwd').value = s.cgoF;
    
    if(document.getElementById('cargo-aft')) 
        document.getElementById('cargo-aft').value = s.cgoA;
    
    if(document.getElementById('fuel-total')) 
        document.getElementById('fuel-total').value = s.fuel;

    let estTrip = Math.max(0, s.fuel - 5500);
    if(document.getElementById('trip-fuel')) 
        document.getElementById('trip-fuel').value = estTrip;

    if(typeof updatePaxWeight === 'function') updatePaxWeight();
    if(typeof updateTotalCargo === 'function') updateTotalCargo();
    if(typeof saveInputs === 'function') saveInputs();

    if(typeof switchTab === 'function') switchTab('takeoff');
    
    alert("✅ LOAD SHEET ACCEPTED\nWeights transferred to Performance Tool.");
}
