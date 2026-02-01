// ==========================================
// 🧠 A330 Flight Computer (Lite Version)
// 包含: Dispatch 生成器 & 簡易 N1/Trim 計算器
// ==========================================

// --- 1. Dispatch Logic (保留 DSP 計算功能) ---
let currentDispatchState = {
    flightId: null, dist: 0, ci: 0, pax: 0, cgoF: 0, cgoA: 0, fuel: 0, warnings: [], isSaved: false
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

    // Pax Generation
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

    // Cargo Generation
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
    
    // Split Cargo
    let totalCgo = Math.max(0, Math.floor(cgoTarget));
    let rawFwd = Math.floor(totalCgo * 0.55);
    currentDispatchState.cgoF = Math.min(rawFwd, 10000);
    currentDispatchState.cgoA = Math.min(totalCgo - rawFwd, 10000);
    currentDispatchState.cgoTotal = currentDispatchState.cgoF + currentDispatchState.cgoA;

    // Fuel Generation
    currentDispatchState.ci = tags.includes("SHUTTLE") ? 80 : rnd(20, 60);
    let tripFuel = (f.dist * 12.5) + (currentDispatchState.cgoTotal/1000 * 0.04 * f.dist);
    currentDispatchState.fuel = Math.round(tripFuel + 5500); 

    saveDispatchToStorage(flightId);
}

function saveDispatchToStorage(flightId) {
    safeSet('dsp_save_' + flightId, JSON.stringify(currentDispatchState));
}

function updateDispatchDisplay() {
    let s = currentDispatchState;
    if(!s.flightId) return;

    document.getElementById('dsp-ci-val').innerText = s.ci;
    document.getElementById('dsp-dist-disp').innerText = s.dist + " NM";
    document.getElementById('dsp-pax-count').innerText = s.pax;
    
    let paxWt = s.pax * 77;
    document.getElementById('dsp-pax-total-wt').innerText = paxWt;
    document.getElementById('bar-pax').style.width = Math.min(100, (s.pax / 441) * 100) + "%";

    let cgoTotal = s.cgoF + s.cgoA;
    document.getElementById('dsp-cgo-total').innerText = cgoTotal;
    document.getElementById('dsp-cgo-fwd-val').innerText = s.cgoF;
    document.getElementById('dsp-cgo-aft-val').innerText = s.cgoA;
    
    let fwdPct = cgoTotal > 0 ? (s.cgoF / cgoTotal) * 100 : 50;
    document.getElementById('bar-cgo-fwd').style.width = fwdPct + "%";
    document.getElementById('bar-cgo-aft').style.width = (100 - fwdPct) + "%";
    document.getElementById('dsp-cgo-fwd-pct').innerText = Math.round(fwdPct) + "%";
    document.getElementById('dsp-cgo-aft-pct').innerText = Math.round(100 - fwdPct) + "%";

    document.getElementById('dsp-est-fuel').innerText = s.fuel;
    
    // DSP Page Totals
    let oew = 129855;
    let zfw = oew + paxWt + cgoTotal;
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

// 🟢 關鍵功能：將 DSP 數據傳輸到 Takeoff 頁面
function confirmDispatch() {
    let s = currentDispatchState;
    
    // 1. 將 Pax 填入
    let paxInput = document.getElementById('pax-count');
    if(paxInput) paxInput.value = s.pax;

    // 2. 將貨物填入
    let fwdInput = document.getElementById('cargo-fwd');
    let aftInput = document.getElementById('cargo-aft');
    if(fwdInput) fwdInput.value = s.cgoF;
    if(aftInput) aftInput.value = s.cgoA;

    // 3. 將總油量填入
    let fuelInput = document.getElementById('fuel-total');
    if(fuelInput) fuelInput.value = s.fuel;
    
    // 4. 自動估算 Trip Fuel (總油量 - 5.5噸 備用油)
    let tripInput = document.getElementById('trip-fuel');
    if(tripInput) {
        let estTrip = Math.max(0, s.fuel - 5500);
        tripInput.value = estTrip;
    }

    // 5. 觸發一次更新，確保隱藏的 Total Weight 欄位同步
    updatePaxWeight();
    updateTotalCargo();
    
    // 6. 存檔並切換頁面
    if(typeof saveInputs === 'function') saveInputs();
    switchTab('takeoff');
    alert("✅ LOAD SHEET ACCEPTED & TRANSFERRED");
}

// ==========================================
// 🚀 Simplified Performance Logic (N1 & Trim)
// ==========================================

function computeInternalZFWCG() {
    // 基礎重心與力矩計算
    const BASE_CG = 24.0;
    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;
    
    // 簡易力矩公式
    let cg = BASE_CG + (paxWt * 0.00020) + (fwdWt * -0.00050) + (aftWt * 0.00070);
    return Math.max(18, Math.min(42, cg));
}

function calculatePerformance() {
    // 1. 確保隱藏欄位數據最新
    updatePaxWeight();
    updateTotalCargo();

    // 2. 獲取 N1 輸入
    let oat = parseFloat(document.getElementById('to-oat').value);
    let flex = parseFloat(document.getElementById('to-flex').value);
    
    // N1 計算邏輯 (GE CF6 簡易模型)
    let n1Display = "--%";
    if (!isNaN(oat) && !isNaN(flex)) {
        let baseN1 = 98.2; // TOGA N1
        let correction = 0.22; // 每度 Flex 減少的 N1
        
        let tempDiff = flex - oat;
        if (tempDiff < 0) {
            alert("⚠️ Flex Temp cannot be lower than OAT");
            n1Display = "ERR";
        } else {
            let n1 = baseN1 - (tempDiff * correction) - 0.8; // -0.8 for Packs ON
            n1Display = n1.toFixed(1) + "%";
        }
    } else {
        // 如果沒輸入溫度，只提示但不報錯，讓用戶可以只算 Trim
        n1Display = "--%";
    }
    document.getElementById('res-n1').innerText = n1Display;

    // 3. 獲取重量與燃油輸入 (支持手動修改後的值)
    let oew = 129855;
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cgo = parseFloat(document.getElementById('cargo-total').value)||0;
    let fuelBlock = parseFloat(document.getElementById('fuel-total').value)||0;
    let fuelTrip = parseFloat(document.getElementById('trip-fuel').value)||0;

    let zfw = oew + pax + cgo;
    let tow = zfw + fuelBlock;
    let lw = tow - fuelTrip; // Landing Weight = TOW - Trip Fuel

    // 4. 配平計算 (Trim Calculations)
    let zfwCG = computeInternalZFWCG();
    
    // Fuel CG Effect (油量對重心的影響係數)
    const FUEL_CG_FACTOR = 0.00004; 

    // A. 起飛配平 (TOW Trim)
    let towCG = zfwCG + (fuelBlock * FUEL_CG_FACTOR);
    towCG = Math.max(18, Math.min(42, towCG)); // 限制範圍
    let toThs = calculateTHS(towCG);

    // B. 降落配平 (Landing Trim)
    // 落地時油量 = 起飛油量 - 航程耗油
    let fuelAtLanding = Math.max(0, fuelBlock - fuelTrip);
    let ldgCG = zfwCG + (fuelAtLanding * FUEL_CG_FACTOR);
    ldgCG = Math.max(18, Math.min(42, ldgCG)); // 限制範圍
    let ldgThs = calculateTHS(ldgCG);

    // 5. 更新 UI
    document.getElementById('res-zfw-disp').innerText = Math.round(zfw);
    
    // Update Takeoff Results
    document.getElementById('res-to-trim').innerText = `${toThs.text}`;
    document.getElementById('res-tow-disp').innerText = `TOW: ${Math.round(tow)} KG`;

    // Update Landing Results
    document.getElementById('res-ldg-trim').innerText = `${ldgThs.text}`;
    document.getElementById('res-lw-disp').innerText = `EST LW: ${Math.round(lw)} KG`;

    // 儲存輸入以便下次使用
    if(typeof saveInputs === 'function') saveInputs();
}

// 輔助功能: 更新乘客重量 (DOM Event Listener)
function updatePaxWeight() {
    let countEl = document.getElementById('pax-count');
    if(!countEl) return;
    let count = parseFloat(countEl.value) || 0;
    let total = count * 77;
    
    let hiddenEl = document.getElementById('pax-weight');
    if(hiddenEl) hiddenEl.value = total;
}

// 輔助功能: 更新貨物總重 (DOM Event Listener)
function updateTotalCargo() {
    let fwd = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aft = parseFloat(document.getElementById('cargo-aft').value) || 0;
    let total = fwd + aft;

    let hiddenEl = document.getElementById('cargo-total');
    if(hiddenEl) hiddenEl.value = total;
}
