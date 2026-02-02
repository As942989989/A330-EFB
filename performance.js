// ==========================================
// 🛫 A330 Performance Calculator (v5.0 Realism Physics)
// ==========================================

function computeInternalZFWCG() {
    const BASE_CG = 24.0;
    let paxWt = parseFloat(document.getElementById('pax-weight').value) || 0;
    let fwdWt = parseFloat(document.getElementById('cargo-fwd').value) || 0;
    let aftWt = parseFloat(document.getElementById('cargo-aft').value) || 0;
    // 重心公式
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
        
        // Slope Physics
        if (slope > 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor));
        if (slope < 0) baseTOD *= (1 + (slope * window.perfDB.runway_physics.slope_dist_factor * 0.5));
        
        // [REALISM UPDATE] Altitude Penalty (Exponential)
        // 氣壓固定 1013 下，標高即壓力高度。
        // 空氣稀薄對噴氣引擎是致命的：每 1000ft 增加約 8% 距離，且呈現指數增長
        let altFactor = 1 + (elev / 1000 * 0.08) + Math.pow(elev / 1000, 2) * 0.01;
        baseTOD *= altFactor;

        // 濕地懲罰 (Wet Physics)
        if (isWet) baseTOD *= 1.15;

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
        alert("⚠️ PERFORMANCE LIMIT EXCEEDED (Too Heavy / High Alt / Short Rwy)");
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
    if(typeof saveInputs === 'function') saveInputs();
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
    
    // Wind Component Calculation
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
        
        // [REALISM UPDATE] Airbus Standard Vapp Logic
        // Vapp = VLS + Max(5, min(20, 1/3 HW))
        let windCorr = Math.max(5, Math.min(20, hw / 3));
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

    if(typeof saveInputs === 'function') saveInputs();
}
