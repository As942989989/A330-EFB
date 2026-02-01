// ==========================================
// 🧠 A330 Flight Computer (Lite Version)
// 包含: Dispatch 生成器 (含 Strict Cargo Logic) & 簡易 N1/Trim 計算器
// ==========================================

// --- 1. Dispatch Logic ---
let currentDispatchState = {
    flightId: null, dist: 0, ci: 0, pax: 0, 
    cgoF: 0, cgoA: 0, cgoTotal: 0, 
    baseFwdRatio: 0.55, // 預設前艙比例
    fuel: 0, warnings: [], isSaved: false
};

function initDispatchSession(flightId) {
    const f = window.flightDB[flightId];
    if(!f) return;
    currentDispatchState.flightId = flightId;
    currentDispatchState.dist = f.dist;
    
    let savedData = safeGet('dsp_save_' + flightId);
    if (savedData) {
        currentDispatchState = { ...currentDispatchState, ...JSON.parse(savedData), isSaved: true };
    } else {
        generateNewDispatch(flightId);
    }
    updateDispatchDisplay();
}

function forceNewDispatch() {
    if(!currentDispatchState.flightId) return;
    if(confirm("RE-CALCULATE LOADSHEET?")) {
        generateNewDispatch(currentDispatchState.flightId);
        updateDispatchDisplay();
    }
}

function generateNewDispatch(flightId) {
    const f = window.flightDB[flightId];
    currentDispatchState.warnings = [];
    currentDispatchState.isSaved = false;
    let tags = f.tags || [];

    // A. Pax Generation
    let basePax = 441;
    let lf = rnd(70, 95) / 100;
    if (tags.includes("PREIGHTER")) {
        currentDispatchState.pax = rnd(280, 310); 
    } else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.pax = 0;
    } else {
        if (f.profile === "BIZ") lf = rnd(60, 85) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf);
    }

    // B. Cargo Generation
    let paxWt = currentDispatchState.pax * 77;
    let oew = 129855;
    let roomForCargo = 175000 - (oew + paxWt);
    let cgoTarget = 0;

    if (tags.includes("PREIGHTER")) {
        cgoTarget = Math.min(roomForCargo - 500, 40000);
    } else if (!tags.includes("FERRY")) {
        let cargoSpace = Math.min(roomForCargo, 20000);
        cgoTarget = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }
    
    // 設定基礎比例 (PREIGHTER 偏前 52%，客機偏前 55%)
    currentDispatchState.baseFwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;

    // 初次分配 (應用 10k 限制)
    let totalCgo = Math.max(0, Math.floor(cgoTarget));
    distributeCargo(totalCgo); // 使用共用分配邏輯

    // C. Fuel Generation
    currentDispatchState.ci = tags.includes("SHUTTLE") ? 80 : rnd(20, 60);
    let tripFuel = (f.dist * 12.5) + (currentDispatchState.cgoTotal/1000 * 0.04 * f.dist);
    currentDispatchState.fuel = Math.round(tripFuel + 5500); 

    saveDispatchToStorage(flightId);
}

// 🟢 核心邏輯：貨物分配 (Strict Mode - Option A)
function distributeCargo(totalInput) {
    // 1. 強制總上限 20,000kg (兩個艙各 10k)
    let total = Math.min(20000, Math.max(0, totalInput));
    
    // 2. 依比例計算理想值
    let ratio = currentDispatchState.baseFwdRatio || 0.55;
    let idealFwd = Math.floor(total * ratio);
    let idealAft = total - idealFwd;

    // 3. 檢查 FWD 溢流 -> 擠去 AFT
    if (idealFwd > 10000) {
        let overflow = idealFwd - 10000;
        idealFwd = 10000;
        idealAft += overflow;
    }

    // 4. 檢查 AFT 溢流 -> 擠回 FWD
    if (idealAft > 10000) {
        let overflow = idealAft - 10000;
        idealAft = 10000;
        idealFwd += overflow;
    }

    // 5. 最終安全檢查 (防止來回溢流導致 FWD 又爆)
    if (idealFwd > 10000) idealFwd = 10000;

    // 更新狀態
    currentDispatchState.cgoTotal = total;
    currentDispatchState.cgoF = idealFwd;
    currentDispatchState.cgoA = idealAft;
}

// 🟢 用戶手動修改總重時觸發
function updateCargoFromTotal() {
    let inputEl = document.getElementById('dsp-cgo-total-input');
    if (!inputEl) return;
    
    let newTotal = parseInt(inputEl.value) || 0;
    
    // 重新分配並更新 UI
    distributeCargo(newTotal);
    updateDispatchDisplay(true); // true 代表是手動觸發，不要重寫 input 游標
    saveDispatchToStorage(currentDispatchState.flightId);
}

function saveDispatchToStorage(flightId) {
    safeSet('dsp_save_' + flightId, JSON.stringify(currentDispatchState));
}

function updateDispatchDisplay(isManualEdit = false) {
    let s = currentDispatchState;
    if(!s.flightId) return;

    document.getElementById('dsp-ci-val').innerText = s.ci;
    document.getElementById('dsp-dist-disp').innerText = s.dist + " NM";
    document.getElementById('dsp-pax-count').innerText = s.pax;
    
    let paxWt = s.pax * 77;
    document.getElementById('dsp-pax-total-wt').innerText = paxWt;
    document.getElementById('bar-pax').style.width = Math.min(100, (s.pax / 441) * 100) + "%";

    // 更新貨物區塊
    // 如果不是正在打字，才更新輸入框數值 (避免游標跳掉)
    if (!isManualEdit) {
        document.getElementById('dsp-cgo-total-input').value = s.cgoTotal;
    }
    
    document.getElementById('dsp-cgo-fwd-val').innerText = s.cgoF;
    document.getElementById('dsp-cgo-aft-val').innerText = s.cgoA;
    
    let fwdPct = s.cgoTotal > 0 ? (s.cgoF / s.cgoTotal) * 100 : 50;
    document.getElementById('bar-cgo-fwd').style.width = fwdPct + "%";
    document.getElementById('bar-cgo-aft').style.width = (100 - fwdPct) + "%";
    document.getElementById('dsp-cgo-fwd-pct').innerText = Math.round(fwdPct) + "%";
    document.getElementById('dsp-cgo-aft-pct').innerText = Math.round(100 - fwdPct) + "%";

    document.getElementById('dsp-est-fuel').innerText = s.fuel;
    
    // 計算重量
    let oew = 129855;
    let zfw = oew + paxWt + s.cgoTotal;
    let tow = zfw + s.fuel;
    let lw = tow - Math.max(0, s.fuel - 5500);

    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw/1000) + "T";
    document.getElementById('dsp-res-tow').innerText = Math.round(tow/1000) + "T";
    document.getElementById('dsp-res-lw').innerText = Math.round(lw/1000) + "T";
    
    let ulEl = document.getElementById('dsp-underload');
    let underload = 242000 - tow;
    ulEl.innerText = underload;
    ulEl.style.color = underload >= 0 ? "#fff" : "#e74c3c";
}

function confirmDispatch() {
    let s = currentDispatchState;
    
    // 傳輸數據到 Perf 頁面
    let paxInput = document.getElementById('pax-count');
    if(paxInput) paxInput.value = s.pax;

    let fwdInput = document.getElementById('cargo-fwd');
    let aftInput = document.getElementById('cargo-aft');
    if(fwdInput) fwdInput.value = s.cgoF;
    if(aftInput) aftInput.value = s.cgoA;

    let fuelInput = document.getElementById('fuel-total');
    if(fuelInput) fuelInput.value = s.fuel;
    
    let tripInput = document.getElementById('trip-fuel');
    if(tripInput) {
        let estTrip = Math.max(0, s.fuel - 5500);
        tripInput.value = estTrip;
    }

    updatePaxWeight();
    updateTotalCargo();
    
    if(typeof saveInputs === 'function') saveInputs();
    switchTab('takeoff');
    alert("✅ LOAD SHEET ACCEPTED & TRANSFERRED");
}

// ==========================================
// 🚀 Simplified Performance Logic (N1 & Trim)
// ==========================================

function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;
    
    let cg = BASE_CG + (paxWt * 0.00020) + (fwdWt * -0.00050) + (aftWt * 0.00070);
    return Math.max(18, Math.min(42, cg));
}

function calculatePerformance() {
    updatePaxWeight();
    updateTotalCargo();

    let oat = parseFloat(document.getElementById('to-oat').value);
    let flex = parseFloat(document.getElementById('to-flex').value);
    
    // N1 Logic
    let n1Display = "--%";
    if (!isNaN(oat) && !isNaN(flex)) {
        let baseN1 = 98.2; 
        let correction = 0.22;
        let tempDiff = flex - oat;
        if (tempDiff < 0) {
            alert("⚠️ Flex Temp cannot be lower than OAT");
            n1Display = "ERR";
        } else {
            let n1 = baseN1 - (tempDiff * correction) - 0.8;
            n1Display = n1.toFixed(1) + "%";
        }
    }
    document.getElementById('res-n1').innerText = n1Display;

    // Trim Logic
    let oew = 129855;
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuelBlock = parseFloat(document.getElementById('fuel-total').value)||0;
    let fuelTrip = parseFloat(document.getElementById('trip-fuel').value)||0;

    let zfw = oew + pax + cgo;
    let tow = zfw + fuelBlock;
    let lw = tow - fuelTrip;

    let zfwCG = computeInternalZFWCG();
    const FUEL_CG_FACTOR = 0.00004; 

    let towCG = zfwCG + (fuelBlock * FUEL_CG_FACTOR);
    towCG = Math.max(18, Math.min(42, towCG));
    let toThs = calculateTHS(towCG);

    let fuelAtLanding = Math.max(0, fuelBlock - fuelTrip);
    let ldgCG = zfwCG + (fuelAtLanding * FUEL_CG_FACTOR);
    ldgCG = Math.max(18, Math.min(42, ldgCG));
    let ldgThs = calculateTHS(ldgCG);

    // Update UI (顯示 IF %)
    document.getElementById('res-zfw-disp').innerText = Math.round(zfw);
    document.getElementById('res-to-trim').innerText = `${convertToIF(toThs.raw)}%`;
    document.getElementById('res-tow-disp').innerText = `TOW: ${Math.round(tow)} KG`;
    document.getElementById('res-ldg-trim').innerText = `${convertToIF(ldgThs.raw)}%`;
    document.getElementById('res-lw-disp').innerText = `EST LW: ${Math.round(lw)} KG`;

    if(typeof saveInputs === 'function') saveInputs();
}

function updatePaxWeight() {
    let countEl = document.getElementById('pax-count');
    if(!countEl) return;
    let count = parseFloat(countEl.value) || 0;
    let total = count * 77;
    let hiddenEl = document.getElementById('pax-weight');
    if(hiddenEl) hiddenEl.value = total;
}

function updateTotalCargo() {
    let fwd = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aft = parseFloat(document.getElementById('cargo-aft').value) || 0;
    let total = fwd + aft;
    let hiddenEl = document.getElementById('cargo-total');
    if(hiddenEl) hiddenEl.value = total;
}
