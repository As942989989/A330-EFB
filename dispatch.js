// ==========================================
// 🧠 A330 Dispatch Logic (v4.7 Preighter Support)
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

    // 呼叫顯示函數 (原本代碼這裡呼叫了，但函數未定義)
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

    // --- 1. Pax Calculation ---
    let basePax = 441; // A330 High Density
    let lf = rnd(70, 95) / 100;
    
    if (tags.includes("PREIGHTER")) {
        currentDispatchState.pax = rnd(280, 310); 
        currentDispatchState.warnings.push("📦 PREIGHTER MODE ACTIVE");
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.pax = 0;
    } 
    else {
        if (f.profile === "BIZ") lf = rnd(60, 85) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf);
    }

    // --- 2. Cargo Calculation ---
    let paxWt = currentDispatchState.pax * 77;
    let oew = 129855;
    let currentZFW = oew + paxWt;
    let mzfw = 175000;
    let roomForCargo = mzfw - currentZFW; 
    
    let maxCargoStruct = 35000; // 提升結構限制以符合 A330 能力
    
    if (tags.includes("PREIGHTER")) {
        let target = roomForCargo - 500; 
        target = Math.min(target, 40000); 
        currentDispatchState.cgoTotal = Math.max(0, Math.floor(target));
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.cgoTotal = 0;
    } 
    else {
        let cargoSpace = Math.min(roomForCargo, 20000); // 客機模式貨物較少
        currentDispatchState.cgoTotal = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }

    // 分配前後艙
    let fwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;
    currentDispatchState.cgoF = Math.floor(currentDispatchState.cgoTotal * fwdRatio);
    currentDispatchState.cgoA = currentDispatchState.cgoTotal - currentDispatchState.cgoF;

    // --- 3. Fuel & CI ---
    if (tags.includes("SHUTTLE")) currentDispatchState.ci = 80;
    else currentDispatchState.ci = rnd(20, 60);

    // 燃油計算
    let tripFuel = (f.dist * 12.5) + (currentDispatchState.cgoTotal/1000 * 0.04 * f.dist);
    currentDispatchState.fuel = Math.round(tripFuel + 5500); // + Reserves

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

// ==========================================
// 👇 這裡是你原本缺少的關鍵 UI 更新函數
// ==========================================

function updateDispatchDisplay() {
    let s = currentDispatchState;
    if(!s.flightId) return;

    // 1. 基礎數據顯示
    document.getElementById('dsp-ci-val').innerText = s.ci;
    document.getElementById('dsp-dist-disp').innerText = s.dist + " NM";
    document.getElementById('dsp-pax-count').innerText = s.pax;
    
    // 計算乘客總重
    let paxWt = s.pax * (window.weightDB ? window.weightDB.pax_unit : 77);
    document.getElementById('dsp-pax-total-wt').innerText = paxWt;

    // 更新乘客進度條 (假設滿載 441 人)
    let paxPct = Math.min(100, (s.pax / 441) * 100);
    document.getElementById('bar-pax').style.width = paxPct + "%";

    // 2. 貨物數據
    let cgoTotal = s.cgoF + s.cgoA;
    document.getElementById('dsp-cgo-total').innerText = cgoTotal;
    document.getElementById('dsp-cgo-fwd-val').innerText = s.cgoF;
    document.getElementById('dsp-cgo-aft-val').innerText = s.cgoA;

    // 貨物比例條
    let fwdPct = cgoTotal > 0 ? (s.cgoF / cgoTotal) * 100 : 50;
    let aftPct = 100 - fwdPct;
    document.getElementById('bar-cgo-fwd').style.width = fwdPct + "%";
    document.getElementById('bar-cgo-aft').style.width = aftPct + "%";
    
    // 更新文字百分比
    document.getElementById('dsp-cgo-fwd-pct').innerText = Math.round(fwdPct) + "%";
    document.getElementById('dsp-cgo-aft-pct').innerText = Math.round(aftPct) + "%";

    // 3. 燃油數據
    document.getElementById('dsp-est-fuel').innerText = s.fuel;

    // 4. 重量計算 (TOW / ZFW / LW)
    let oew = window.weightDB ? window.weightDB.oew : 129855;
    let zfw = oew + paxWt + cgoTotal;
    let tow = zfw + s.fuel;
    
    // 估算落地油量 (假設 Trip Fuel 約為總油量 - 5.5噸儲備)
    let estTripFuel = Math.max(0, s.fuel - 5500);
    let lw = tow - estTripFuel;

    // 顯示重量
    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw/1000) + "T";
    document.getElementById('dsp-res-tow').innerText = Math.round(tow/1000) + "T";
    document.getElementById('dsp-res-lw').innerText = Math.round(lw/1000) + "T";

    // 5. 限制檢查 (Underload)
    let mtow = window.weightDB ? window.weightDB.limits.mtow : 242000;
    let underload = mtow - tow;
    let ulEl = document.getElementById('dsp-underload');
    ulEl.innerText = underload;
    ulEl.style.color = underload >= 0 ? "#fff" : "#e74c3c"; // 超重變紅
    
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

// ==========================================
// 👇 這是確認按鈕的功能 (將數據填入 PERF 頁面)
// ==========================================

function confirmDispatch() {
    let s = currentDispatchState;
    
    // 將 Dispatch 數據填入 Takeoff 頁面的 Input 欄位
    // 確保 ID 與 index.html 中的 input 對應
    if(document.getElementById('pax-count')) 
        document.getElementById('pax-count').value = s.pax;
    
    if(document.getElementById('cargo-fwd')) 
        document.getElementById('cargo-fwd').value = s.cgoF;
    
    if(document.getElementById('cargo-aft')) 
        document.getElementById('cargo-aft').value = s.cgoA;
    
    if(document.getElementById('fuel-total')) 
        document.getElementById('fuel-total').value = s.fuel;

    // 估算 Trip Fuel (簡單扣除儲備油量)
    let estTrip = Math.max(0, s.fuel - 5500);
    if(document.getElementById('trip-fuel')) 
        document.getElementById('trip-fuel').value = estTrip;

    // 觸發輸入框的自動計算 (如果有綁定 oninput 事件)
    if(typeof updatePaxWeight === 'function') updatePaxWeight();
    if(typeof updateTotalCargo === 'function') updateTotalCargo();
    if(typeof saveInputs === 'function') saveInputs();

    // 切換到 PERF 頁面
    if(typeof switchTab === 'function') switchTab('takeoff');
    
    alert("✅ LOAD SHEET ACCEPTED\nWeights transferred to Performance Tool.");
}
