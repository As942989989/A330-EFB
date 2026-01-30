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

    // --- 1. Pax Calculation (The Phantom Logic) ---
    
    // 預設值
    let basePax = 441;
    let lf = rnd(70, 95) / 100;
    
    if (tags.includes("PREIGHTER")) {
        // 📦 客改貨：乘客數代表 "客艙貨物箱"
        // 塞好塞滿，模擬最大結構重量
        currentDispatchState.pax = rnd(280, 310); 
        currentDispatchState.warnings.push("📦 PREIGHTER MODE ACTIVE");
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.pax = 0;
    } 
    else {
        // 一般客運
        if (f.profile === "BIZ") lf = rnd(60, 85) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf);
    }

    // --- 2. Cargo Calculation ---
    
    let paxWt = currentDispatchState.pax * 77;
    let oew = 129855;
    let currentZFW = oew + paxWt;
    let mzfw = 175000;
    let roomForCargo = mzfw - currentZFW; // 剩餘載重空間
    
    // 結構限制
    let maxCargoStruct = 20000; 
    
    // Preighter 模式下，腹艙全滿
    if (tags.includes("PREIGHTER")) {
        // 嘗試填滿所有剩餘空間
        let target = roomForCargo - 500; // 留一點裕度
        target = Math.min(target, 35000); // A330 腹艙物理極限約 30-40噸
        currentDispatchState.cgoTotal = target;
    } 
    else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.cgoTotal = 0;
    } 
    else {
        // 一般客運：隨機貨物
        let cargoSpace = Math.min(roomForCargo, maxCargoStruct);
        currentDispatchState.cgoTotal = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }

    // 前後配平 (Preighter 偏前)
    let fwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;
    currentDispatchState.cgoF = Math.floor(currentDispatchState.cgoTotal * fwdRatio);
    currentDispatchState.cgoA = currentDispatchState.cgoTotal - currentDispatchState.cgoF;

    // --- 3. Fuel & CI ---
    if (tags.includes("SHUTTLE")) currentDispatchState.ci = 80;
    else currentDispatchState.ci = rnd(20, 60);

    let tripFuel = (f.dist * 12.5) + (currentDispatchState.cgoTotal/1000 * 0.04 * f.dist);
    currentDispatchState.fuel = Math.round(tripFuel + 5500);

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
