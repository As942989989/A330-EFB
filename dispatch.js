// ==========================================
// 🧠 A330 Dispatch Logic (Generation & State)
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
    isSaved: false
};

function getStorageKey(flightId) {
    return 'dsp_save_' + flightId;
}

// 初始化簽派 (讀取舊檔 或 生成新檔)
function initDispatchSession(flightId) {
    const f = window.flightDB[flightId];
    if(!f) return;

    currentDispatchState.flightId = flightId;
    currentDispatchState.dist = f.dist;

    let savedData = safeGet(getStorageKey(flightId));
    
    if (savedData) {
        let parsed = JSON.parse(savedData);
        currentDispatchState = { ...currentDispatchState, ...parsed };
        currentDispatchState.isSaved = true;
        console.log("Loaded saved dispatch for " + flightId);
    } else {
        generateNewDispatch(flightId);
    }

    if(typeof updateDispatchDisplay === 'function') updateDispatchDisplay();
}

// 強制重新簽派按鈕
function forceNewDispatch() {
    if(!currentDispatchState.flightId) return;
    if(confirm("RE-CALCULATE LOADSHEET?\nThis will generate new Pax/Cargo/Fuel figures.")) {
        generateNewDispatch(currentDispatchState.flightId);
        if(typeof updateDispatchDisplay === 'function') updateDispatchDisplay();
    }
}

// 核心生成演算法
function generateNewDispatch(flightId) {
    const f = window.flightDB[flightId];
    currentDispatchState.warnings = [];
    currentDispatchState.isSaved = false;

    // --- STEP A: Runway Analysis ---
    let icao = f.r.split('-');
    let dep = icao[0] ? icao[0].trim() : null;
    let arr = icao[1] ? icao[1].trim() : null;
    
    let limitLength = 12000;
    if(window.airportDB && dep && arr && window.airportDB[dep] && window.airportDB[arr]) {
        let maxRwyDep = 0;
        for(let r in window.airportDB[dep].runways) maxRwyDep = Math.max(maxRwyDep, window.airportDB[dep].runways[r].len);
        let maxRwyArr = 0;
        for(let r in window.airportDB[arr].runways) maxRwyArr = Math.max(maxRwyArr, window.airportDB[arr].runways[r].len);
        limitLength = Math.min(maxRwyDep, maxRwyArr);
    }

    let rwyFactor = 1.0;
    let maxCargoStruct = 20000;
    
    if (limitLength < 8000) {
        rwyFactor = 0.60;
        maxCargoStruct = 5000;
        currentDispatchState.warnings.push("⚠️ RWY LIMITED PAYLOAD");
    } else if (limitLength < 9000) {
        rwyFactor = 0.85;
        maxCargoStruct = 15000;
    }

    // --- STEP B: Pax Generation ---
    if (f.type === "FERRY" || f.type === "MAINT") {
        currentDispatchState.pax = 0;
    } else if (f.type === "CGO") {
        currentDispatchState.pax = rnd(100, 350);
    } else {
        let basePax = 441;
        let lf = 0.80;
        if (f.profile === "BIZ") lf = rnd(65, 90) / 100;
        if (f.profile === "LEISURE") lf = rnd(85, 98) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf * rwyFactor);
    }

    // --- STEP C: Cargo & Fuel ---
    let paxWt = currentDispatchState.pax * 77;
    let oew = 129855;
    let currentZFW = oew + paxWt;
    let mzfw = 175000;
    
    let roomForCargo = mzfw - currentZFW;
    let targetCargoLimit = Math.min(roomForCargo, maxCargoStruct);
    
    let targetCargo = 0;
    if (f.type === "FERRY" || f.type === "MAINT") {
        targetCargo = 0;
    } else if (f.type === "CGO") {
        targetCargo = targetCargoLimit * (rnd(95, 100)/100);
    } else {
        let cargoFactor = 0.5;
        if (f.profile === "BIZ") cargoFactor = rnd(40, 70)/100;
        if (f.profile === "LEISURE") cargoFactor = rnd(80, 95)/100;
        targetCargo = Math.floor(targetCargoLimit * cargoFactor);
    }

    if (f.type === "FERRY" || f.type === "CGO") {
        currentDispatchState.ci = rnd(0, 20);
    } else if (f.dist < 1000 || f.profile === "BIZ") {
        currentDispatchState.ci = rnd(60, 90);
    } else {
        currentDispatchState.ci = rnd(30, 50);
    }

    // --- STEP D: Trim & Balance ---
    let fwdRatio = 0.55; 
    if (f.type === "CGO" || targetCargo > 18000) fwdRatio = 0.50; 
    if (f.profile === "LEISURE") fwdRatio = 0.40; 

    currentDispatchState.cgoF = Math.floor(targetCargo * fwdRatio);
    currentDispatchState.cgoA = targetCargo - currentDispatchState.cgoF;

    // --- STEP E: Final Validation ---
    let tripFuel = (f.dist * 12.5) + (targetCargo/1000 * 0.04 * f.dist);
    let rsvFuel = 5500; 
    let estFuel = Math.round(tripFuel + rsvFuel);
    currentDispatchState.fuel = estFuel;

    let estZFW = currentZFW + targetCargo;
    let estTOW = estZFW + estFuel;
    let mtow = 242000;

    if (estTOW > mtow) {
        let overweight = estTOW - mtow;
        let reduce = Math.ceil(overweight);
        let reduceF = Math.ceil(reduce * fwdRatio);
        let reduceA = reduce - reduceF;
        currentDispatchState.cgoF = Math.max(0, currentDispatchState.cgoF - reduceF);
        currentDispatchState.cgoA = Math.max(0, currentDispatchState.cgoA - reduceA);
        currentDispatchState.warnings.push("⚠️ TOW LIMITED (CARGO REDUCED)");
    }

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
