// ==========================================
// 🧠 A330 Flight Computer (Dispatch & Perf)
// ==========================================

// --- Dispatch State & Logic ---
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

    // Pax
    let basePax = 441;
    let lf = rnd(70, 95) / 100;
    if (tags.includes("PREIGHTER")) {
        currentDispatchState.pax = rnd(280, 310); 
        currentDispatchState.warnings.push("📦 PREIGHTER MODE ACTIVE");
    } else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.pax = 0;
    } else {
        if (f.profile === "BIZ") lf = rnd(60, 85) / 100;
        currentDispatchState.pax = Math.floor(basePax * lf);
    }

    // Cargo
    let paxWt = currentDispatchState.pax * 77;
    let oew = 129855;
    let roomForCargo = 175000 - (oew + paxWt); // MZFW Limit
    let cgoTarget = 0;

    if (tags.includes("PREIGHTER")) {
        cgoTarget = Math.min(roomForCargo - 500, 40000);
    } else if (!tags.includes("FERRY") && !tags.includes("MAINT")) {
        let cargoSpace = Math.min(roomForCargo, 20000);
        cgoTarget = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }
    currentDispatchState.cgoTotal = Math.max(0, Math.floor(cgoTarget));

    // Split Cargo
    let fwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;
    currentDispatchState.cgoF = Math.floor(currentDispatchState.cgoTotal * fwdRatio);
    currentDispatchState.cgoA = currentDispatchState.cgoTotal - currentDispatchState.cgoF;

    // Fuel
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
    
    let paxWt = s.pax * (window.weightDB ? window.weightDB.pax_unit : 77);
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

    let oew = window.weightDB ? window.weightDB.oew : 129855;
    let zfw = oew + paxWt + cgoTotal;
    let tow = zfw + s.fuel;
    let lw = tow - Math.max(0, s.fuel - 5500);

    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw/1000) + "T";
    document.getElementById('dsp-res-tow').innerText = Math.round(tow/1000) + "T";
    document.getElementById('dsp-res-lw').innerText = Math.round(lw/1000) + "T";

    let mtow = window.weightDB ? window.weightDB.limits.mtow : 242000;
    let underload = mtow - tow;
    let ulEl = document.getElementById('dsp-underload');
    ulEl.innerText = underload;
    ulEl.style.color = underload >= 0 ? "#fff" : "#e74c3c";
    
    let statusEl = document.getElementById('dsp-rwy-status');
    if(s.warnings.length > 0) {
        statusEl.innerText = s.warnings[0]; statusEl.style.color = "#f1c40f";
    } else {
        statusEl.innerText = "STD OPS"; statusEl.style.color = "#2ecc71";
    }
}

function confirmDispatch() {
    let s = currentDispatchState;
    if(document.getElementById('pax-count')) document.getElementById('pax-count').value = s.pax;
    if(document.getElementById('cargo-fwd')) document.getElementById('cargo-fwd').value = s.cgoF;
    if(document.getElementById('cargo-aft')) document.getElementById('cargo-aft').value = s.cgoA;
    if(document.getElementById('fuel-total')) document.getElementById('fuel-total').value = s.fuel;
    if(document.getElementById('trip-fuel')) document.getElementById('trip-fuel').value = Math.max(0, s.fuel - 5500);

    if(typeof updatePaxWeight === 'function') updatePaxWeight();
    if(typeof updateTotalCargo === 'function') updateTotalCargo();
    if(typeof saveInputs === 'function') saveInputs();

    switchTab('takeoff');
    alert("✅ LOAD SHEET ACCEPTED");
}

// --- Performance Calculations ---

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
    
    // Performance Loop
    function computePerformance(tryFlex, tryConf) {
        let isToga = (tryFlex === "TOGA");
        let tempForCalc = isToga ? oat : tryFlex;
        let fd = window.perfDB.flex_data;
        let flexDelta = isToga ? 0 : (tempForCalc - fd.base_temp); 
        
        if (!isToga && tempForCalc < oat) return { valid: false };

        let thrustPenaltyFactor = 1.0;
        if (!isToga && flexDelta > 0) thrustPenaltyFactor += (flexDelta * fd.flex_dist_penalty);

        let spd = interpolate(tow, window.perfDB.takeoff_speeds);
        let corr = window.perfDB.conf_correction[tryConf];
        let v1 = spd.v1 + corr.v1;
        let vr = spd.vr + corr.vr;
        let v2 = spd.v2 + corr.v2;

        if (slope < 0) v1 -= (Math.abs(slope) * window.perfDB.runway_physics.slope_v1_factor);
        if (isWet) v1 -= 8;
        if (v1 < 112) v1 = 112; 
        if (v1 > vr) v1 = vr;

        let baseTOD = window.perfDB.dist_physics.base_to_dist_ft * Math.pow((tow / 200000), 2); 
        baseTOD *= thrustPenaltyFactor * corr.dist_factor;
        
        if (slope > 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor));
        if (slope < 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor * 0.5));
        baseTOD *= (1 + (elev/1000 * 0.05)); 
        if (isWet) baseTOD *= 1.1;

        let margin = rwyLen - baseTOD;
        return { valid: margin > 0, margin: margin, tod: Math.round(baseTOD), v1: Math.round(v1), vr: Math.round(vr), v2: Math.round(v2), flex: tryFlex, conf: tryConf };
    }

    let configsToTry = ["1+F", "2", "3"];
    let bestResult = null;
    let maxFlex = window.perfDB.flex_data.max_temp;

    loop_outer:
    for (let conf of configsToTry) {
        for (let t = maxFlex; t >= oat; t--) {
            let res = computePerformance(t, conf);
            if (res.valid) { bestResult = res; break loop_outer; }
        }
        let togaRes = computePerformance("TOGA", conf);
        if (togaRes.valid) { bestResult = togaRes; break loop_outer; }
    }

    if (!bestResult) {
        alert("⚠️ PERFORMANCE LIMIT EXCEEDED");
        document.getElementById('res-tow').innerText = "LIMIT EXCEEDED"; document.getElementById('res-tow').style.color = "red";
        return;
    }

    // Output
    let n1 = window.perfDB.n1_physics.base_n1;
    if (bestResult.flex !== "TOGA") n1 -= ((bestResult.flex - oat) * window.perfDB.n1_physics.flex_correction);
    n1 -= window.perfDB.bleed_penalty.packs_on;

    let zfwCG = computeInternalZFWCG();
    let fuelEffect = fuel * window.perfDB.trim_physics.fuel_cg_effect;
    let towCG = Math.min(42, zfwCG + fuelEffect);
    let ths = calculateTHS(towCG);

    document.getElementById('res-tow').innerText = Math.round(tow) + " KG";
    document.getElementById('res-tow').style.color = (tow > window.weightDB.limits.mtow) ? "#e74c3c" : "#fff";
    document.getElementById('res-conf').innerText = bestResult.conf;
    document.getElementById('res-flex').innerText = (bestResult.flex === "TOGA") ? "TOGA" : bestResult.flex + "°";
    document.getElementById('res-n1').innerText = n1.toFixed(1) + "%";
    document.getElementById('res-trim').innerText = `${ths.text} (${convertToIF(ths.raw)}%)`;
    document.getElementById('res-tow-cg-display').innerText = towCG.toFixed(1) + "%";
    
    document.getElementById('res-v1').innerText = bestResult.v1;
    document.getElementById('res-vr').innerText = bestResult.vr;
    document.getElementById('res-v2').innerText = bestResult.v2;
    document.getElementById('res-to-dist').innerText = bestResult.tod + " FT";
    document.getElementById('res-green-dot').innerText = Math.round(0.6 * (tow/1000) + 135) + " KT";

    let marginEl = document.getElementById('res-stop-margin');
    if (marginEl) {
        marginEl.innerText = (bestResult.margin >= 0 ? "+" : "") + Math.round(bestResult.margin) + " FT";
        marginEl.style.color = (bestResult.margin < 800) ? "orange" : "#2ecc71";
    }

    // Auto Transfer to Landing
    let trip = parseFloat(document.getElementById('trip-fuel').value)||0;
    document.getElementById('ldg-gw-input').value = Math.round(tow - trip);
    if(typeof saveInputs === 'function') saveInputs();
}

function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    let ldw = parseFloat(document.getElementById('ldg-gw-input').value) || 0;
    let rwyLen = parseFloat(document.getElementById('ldg-rwy-len').value)||10000;
    let slope = parseFloat(document.getElementById('ldg-rwy-slope').value) || 0;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let revMode = document.getElementById('ldg-rev').value;
    let wdir = parseFloat(document.getElementById('ldg-wind-dir').value)||0;
    let wspd = parseFloat(document.getElementById('ldg-wind-spd').value)||0;
    let rhdg = parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    
    let hw = Math.cos(Math.abs(rhdg - wdir) * (Math.PI / 180)) * wspd;

    let scenarios = [{ conf: 'FULL', ab: 'MAX' }, { conf: 'FULL', ab: 'MED' }, { conf: 'FULL', ab: 'LO' }, { conf: '3', ab: 'MED' }];
    let matrixResults = [];

    scenarios.forEach(sc => {
        let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
        if (sc.conf === '3') vls += window.perfDB.landing_conf3_add;
        let vapp = Math.round(vls + Math.max(5, Math.min(15, hw / 3)));

        let dist = window.perfDB.dist_physics.base_ld_dist_ft * (ldw / 180000); 
        dist *= window.perfDB.decel_physics.autobrake[sc.ab]; 
        if (sc.conf === '3') dist *= window.perfDB.decel_physics.conf3_penalty; 
        if (slope < 0) dist *= (1 + (Math.abs(slope) * 0.10)); 
        
        let revFactor = isWet ? window.perfDB.decel_physics.rev_credit.wet : window.perfDB.decel_physics.rev_credit.dry;
        if (revMode === 'max') dist *= (1 - revFactor);
        
        let safety = isWet ? window.perfDB.decel_physics.safety_margin.wet : window.perfDB.decel_physics.safety_margin.dry;
        let rld = Math.round(dist * safety);
        let margin = rwyLen - rld;

        matrixResults.push({ conf: sc.conf, ab: sc.ab, vapp: vapp, dist: rld, status: (margin >= 0) ? "GO" : "NO", color: (margin >= 0) ? "#00ff00" : "#e74c3c" });
    });

    let zfwCG = computeInternalZFWCG();
    let ldgCG = zfwCG - 0.5;
    let ldgTHS = calculateTHS(ldgCG);

    document.getElementById('res-ldw').innerText = Math.round(ldw) + " KG";
    document.getElementById('res-ldw').style.color = (ldw > window.weightDB.limits.mlw) ? "#e74c3c" : "#fff";

    let tableHTML = `<table class="matrix-table"><thead><tr><th>CONF</th><th>BRK</th><th>VAPP</th><th>DIST</th><th></th></tr></thead><tbody>`;
    matrixResults.forEach(r => {
        tableHTML += `<tr><td style="color:${r.conf==='3'?'#ffcc00':'#fff'}">${r.conf}</td><td>${r.ab}</td><td style="color:#00bfff">${r.vapp}</td><td>${r.dist}</td><td style="font-weight:bold; color:${r.color}">${r.status}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;

    let perfSection = document.querySelector('#tab-landing .perf-section');
    perfSection.innerHTML = `<div class="perf-title" style="color:#ffcc00;">LANDING DISTANCE MATRIX (RLD)</div>${tableHTML}<div style="border-bottom:1px solid #333;margin:8px 0;"></div><div class="data-grid" style="grid-template-columns: 1fr 1fr;"><div class="data-item"><div>TRIM (THS)</div><div id="res-ldg-trim">${ldgTHS.text} (${Math.min(100, convertToIF(ldgTHS.raw) + 5)}%)</div></div><div class="data-item"><div>LDG CG</div><div id="res-ldg-cg-display">${ldgCG.toFixed(1)}%</div></div></div>`;

    if(typeof saveInputs === 'function') saveInputs();
}
