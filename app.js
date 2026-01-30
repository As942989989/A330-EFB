/* ==========================================================================
   A330 EFB v4.7 - MERGED APPLICATION CORE
   Contains: Utils, Generator, Roster, Dispatch, Performance, UI Controller
   ========================================================================== */

// ==========================================
// [SECTION 1] UTILS (工具函式)
// ==========================================
function safeGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }
function safeRem(k) { try { localStorage.removeItem(k); } catch(e) {} }
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1) ) + min; }

function interpolate(w, t) {
    if (w <= t[0][0]) { let l = t[0]; return {v1: l[1], vr: l[2], v2: l[3]}; }
    if (w >= t[t.length-1][0]) { let l = t[t.length-1]; return {v1: l[1], vr: l[2], v2: l[3]}; }
    for(let i=0; i<t.length-1; i++) {
        if(w >= t[i][0] && w <= t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return {
                v1: Math.round(t[i][1]+r*(t[i+1][1]-t[i][1])), 
                vr: Math.round(t[i][2]+r*(t[i+1][2]-t[i][2])), 
                v2: Math.round(t[i][3]+r*(t[i+1][3]-t[i][3]))
            };
        }
    }
    let l=t[t.length-1]; return {v1:l[1],vr:l[2],v2:l[3]};
}

function interpolateVLS(w, t) {
    if (w <= t[0][0]) return t[0][1];
    if (w >= t[t.length-1][0]) return t[t.length-1][1];
    for(let i=0; i<t.length-1; i++) {
        if(w >= t[i][0] && w <= t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return Math.round(t[i][1] + r * (t[i+1][1] - t[i][1]));
        }
    }
    return t[t.length-1][1];
}

// ==========================================
// [SECTION 2] GENERATOR (生涯引擎)
// ==========================================
const Generator = {
    state: {
        base: "LSZH", location: "LSZH", maintCounter: 0, totalHours: 0,
        lastFlightNum: null, history: []
    },
    rnd: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    load: () => {
        let s = localStorage.getItem('a330_career_state');
        if(s) Generator.state = JSON.parse(s);
    },
    save: () => {
        localStorage.setItem('a330_career_state', JSON.stringify(Generator.state));
    },
    reset: (base) => {
        Generator.state = {
            base: base || "LSZH", location: base || "LSZH", maintCounter: 0,
            totalHours: 0, lastFlightNum: null, history: []
        };
        Generator.save();
    },
    generateMonth: function() {
        let roster = {};
        let dayCounter = 1;
        if (Generator.state.history.length === 0) Generator.state.location = Generator.state.base;

        while(dayCounter <= 30) {
            let flight = Generator.createDailyFlight(dayCounter);
            if(flight) {
                roster[flight.id] = flight;
                Generator.state.location = flight.dest;
                Generator.state.totalHours += (flight.time / 60);
                if (flight.tags.includes("MAINT")) Generator.state.maintCounter = 0;
                else Generator.state.maintCounter += (flight.time / 60);
                
                if(!flight.tags.includes("FERRY") && !flight.tags.includes("MAINT")) {
                     Generator.state.lastFlightNum = parseInt(flight.id.replace("LX","")) || null;
                }
            }
            dayCounter++;
        }
        Generator.save();
        return roster;
    },
    createDailyFlight: function(day) {
        let s = Generator.state;
        let db = window.routeDB;
        let flightId = `Day ${String(day).padStart(2, '0')}`;
        
        if (s.maintCounter > 500) return Generator.createMaintFlight(flightId, s.location, s.base);

        let candidates = db.regular.filter(r => r.route.startsWith(s.location));
        if (!["LSZH", "LSGG"].includes(s.location)) {
            if (s.lastFlightNum) {
                let targetNum = s.lastFlightNum % 2 === 0 ? s.lastFlightNum + 1 : s.lastFlightNum; 
                let match = candidates.find(c => c.inbound.includes(targetNum));
                if (match) return Generator.buildFlight(flightId, match, "INBOUND", targetNum);
            }
            let randomReturn = candidates[Generator.rnd(0, candidates.length - 1)];
            if(randomReturn) {
                 let fNum = randomReturn.inbound[Generator.rnd(0, randomReturn.inbound.length-1)];
                 return Generator.buildFlight(flightId, randomReturn, "INBOUND", fNum);
            }
            return Generator.createFerryFlight(flightId, s.location, s.base);
        }

        let dice = Generator.rnd(1, 100);
        if (dice <= 5) {
            let charterDest = db.charters[Generator.rnd(0, db.charters.length-1)];
            return Generator.createCharterFlight(flightId, s.location, charterDest);
        }

        let potentialRoutes = db.regular.filter(r => r.route.startsWith(s.location));
        if(potentialRoutes.length > 0) {
            let selectedRoute = potentialRoutes[Generator.rnd(0, potentialRoutes.length-1)];
            let fNum = selectedRoute.outbound[Generator.rnd(0, selectedRoute.outbound.length-1)];
            let isPreighter = false;
            if (selectedRoute.isCargoHotspot && Generator.rnd(1, 100) <= 15) isPreighter = true;
            return Generator.buildFlight(flightId, selectedRoute, "OUTBOUND", fNum, isPreighter);
        } else {
            let targetHub = s.location === "LSZH" ? "LSGG" : "LSZH";
            return Generator.createShuttleFlight(flightId, s.location, targetHub);
        }
    },
    buildFlight: function(id, routeData, dir, fNum, isPreighter) {
        let dest = routeData.route.split('-')[1];
        let tags = [];
        if (routeData.type === "SHUTTLE") tags.push("SHUTTLE");
        else if (routeData.type === "LONG") tags.push("LONG");
        else tags.push("SHORT");
        if (isPreighter) tags.push("PREIGHTER"); else tags.push("PAX");

        return {
            day: id, id: "LX" + fNum, r: routeData.route,
            dist: Math.round(routeData.time * 8), time: routeData.time,
            type: isPreighter ? "CGO" : "PAX", profile: isPreighter ? "CARGO" : "BIZ",
            dest: dest, tags: tags, d: `${tags.join(' | ')}`
        };
    },
    createMaintFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "MAINT", profile: "FERRY", dest: to, tags: ["MAINT", "FERRY"],
            d: "🛠️ MANDATORY MAINTENANCE FERRY"
        };
    },
    createFerryFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "FERRY", profile: "FERRY", dest: to, tags: ["FERRY"],
            d: "⚠️ POSITIONING FLIGHT"
        };
    },
    createShuttleFlight: function(id, from, to) {
         let num = "LX" + Generator.rnd(2800, 2819);
         return {
            day: id, id: num, r: `${from}-${to}`, dist: 125, time: 45,
            type: "PAX", profile: "BIZ", dest: to, tags: ["SHUTTLE"],
            d: "🇨🇭 HUB SHUTTLE"
        };
    },
    createCharterFlight: function(id, from, destObj) {
        let num = "LX" + Generator.rnd(8000, 8999);
        return {
            day: id, id: num, r: `${from}-${destObj.dest}`, dist: Math.round(destObj.time * 8), time: destObj.time,
            type: "PAX", profile: "LEISURE", dest: destObj.dest, tags: ["CHARTER"],
            d: `🏖️ CHARTER: ${destObj.name}`
        };
    }
};

// ==========================================
// [SECTION 3] ROSTER LOADER (讀取器)
// ==========================================
function loadRosterFromStorage() {
    let savedRoster = localStorage.getItem('a330_roster_data');
    if (savedRoster) {
        window.flightDB = JSON.parse(savedRoster);
    } else {
        window.flightDB = {};
    }
}

// ==========================================
// [SECTION 4] DISPATCH LOGIC (派簽)
// ==========================================
let currentDispatchState = {
    flightId: null, dist: 0, ci: 0, pax: 0, cgoF: 0, cgoA: 0, fuel: 0, warnings: [], isSaved: false, tags: []
};

function getStorageKey(flightId) { return 'dsp_save_' + flightId; }

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
    let currentZFW = oew + paxWt;
    let mzfw = 175000;
    let roomForCargo = mzfw - currentZFW;
    let maxCargoStruct = 20000; 
    
    if (tags.includes("PREIGHTER")) {
        let target = roomForCargo - 500;
        target = Math.min(target, 35000);
        currentDispatchState.cgoTotal = target;
    } else if (tags.includes("FERRY") || tags.includes("MAINT")) {
        currentDispatchState.cgoTotal = 0;
    } else {
        let cargoSpace = Math.min(roomForCargo, maxCargoStruct);
        currentDispatchState.cgoTotal = Math.floor(cargoSpace * (rnd(40, 90)/100));
    }

    let fwdRatio = tags.includes("PREIGHTER") ? 0.52 : 0.55;
    currentDispatchState.cgoF = Math.floor(currentDispatchState.cgoTotal * fwdRatio);
    currentDispatchState.cgoA = currentDispatchState.cgoTotal - currentDispatchState.cgoF;

    if (tags.includes("SHUTTLE")) currentDispatchState.ci = 80;
    else currentDispatchState.ci = rnd(20, 60);

    let tripFuel = (f.dist * 12.5) + (currentDispatchState.cgoTotal/1000 * 0.04 * f.dist);
    currentDispatchState.fuel = Math.round(tripFuel + 5500);

    saveDispatchToStorage(flightId);
}

function saveDispatchToStorage(flightId) {
    let dataToSave = {
        ci: currentDispatchState.ci, pax: currentDispatchState.pax,
        cgoF: currentDispatchState.cgoF, cgoA: currentDispatchState.cgoA,
        fuel: currentDispatchState.fuel, warnings: currentDispatchState.warnings
    };
    safeSet(getStorageKey(flightId), JSON.stringify(dataToSave));
}

// ==========================================
// [SECTION 5] PERFORMANCE CALCULATOR (性能)
// ==========================================
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
    let cf = parseFloat(document.getElementById('cargo-fwd').value)||0;
    let ca = parseFloat(document.getElementById('cargo-aft').value)||0;
    let fuel = parseFloat(document.getElementById('fuel-total').value)||0;
    
    let tow = oew + pax + cf + ca + fuel;
    if (tow > window.weightDB.limits.mtow) document.getElementById('res-tow').style.color="red";
    else document.getElementById('res-tow').style.color="lime";
    document.getElementById('res-tow').innerText = tow.toLocaleString();

    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    if(isWet) spd.v1 -= 5;

    let v2_slope_corr = slope > 0 ? 0 : 2; 
    let v2_elev_corr = Math.floor(elev/1000);
    spd.v2 += (v2_slope_corr + v2_elev_corr);

    document.getElementById('res-v1').innerText = spd.v1;
    document.getElementById('res-vr').innerText = spd.vr;
    document.getElementById('res-v2').innerText = spd.v2;

    let t = window.perfDB.trim_physics;
    let cg = computeInternalZFWCG();
    let fuelEffect = (fuel - 5000) * t.fuel_cg_effect;
    let toc = cg + fuelEffect; 
    let delta = toc - t.ref_cg;
    let trimVal = (delta / t.deg_to_pct_factor) * t.step + (t.deg_to_pct_bias / 10);
    let trimStr = trimVal > 0 ? "UP " + Math.abs(trimVal).toFixed(1) : "DN " + Math.abs(trimVal).toFixed(1);
    document.getElementById('res-trim').innerText = trimStr;
    
    let flex = oat + 35;
    if (flex > 65) flex = 65;
    document.getElementById('res-flex').innerText = "F" + flex;

    saveInputs();
    switchTab('takeoff');
}

function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    let rwyLen = parseFloat(document.getElementById('ldg-rwy-len').value)||10000;
    let isWet = document.getElementById('ldg-rwy-cond').value === 'WET';
    let rev = document.getElementById('ldg-rev').value === 'YES';
    
    let oew = window.weightDB.oew;
    let pax = parseFloat(document.getElementById('pax-weight').value)||0;
    let cf = parseFloat(document.getElementById('cargo-fwd').value)||0;
    let ca = parseFloat(document.getElementById('cargo-aft').value)||0;
    let tripFuel = parseFloat(document.getElementById('trip-fuel').value)||0;
    let blockFuel = parseFloat(document.getElementById('fuel-total').value)||0;
    
    let ldw = oew + pax + cf + ca + (blockFuel - tripFuel);
    document.getElementById('res-ldw').innerText = ldw.toLocaleString() + " KG";

    let vapp = interpolateVLS(ldw, window.perfDB.landing_speeds) + 5;
    
    let baseDist = window.perfDB.dist_physics.base_ld_dist_ft;
    let wFactor = (ldw - 180000)/1000 * 25; 
    let wetFactor = isWet ? 1.15 : 1.0;
    let revFactor = rev ? 0.95 : 1.0;

    let configs = [
        {conf: 'FULL', ab: 'MAX', dec: 0},
        {conf: 'FULL', ab: 'MED', dec: 400},
        {conf: '3',    ab: 'MED', dec: 450},
        {conf: 'FULL', ab: 'LO',  dec: 900}
    ];

    let matrixResults = configs.map(c => {
        let dist = (baseDist + wFactor + c.dec) * wetFactor * revFactor;
        let margin = rwyLen - dist;
        let color = margin > 1000 ? "#2ecc71" : (margin > 0 ? "#f1c40f" : "#e74c3c");
        return {
            conf: c.conf,
            ab: c.ab,
            vapp: vapp + (c.conf==='3'?4:0),
            dist: Math.round(dist),
            status: margin > 0 ? "OK" : "LOW",
            color: color
        };
    });

    let tableHTML = `<table class="matrix-table"><thead><tr><th>CONF</th><th>BRK</th><th>VAPP</th><th>DIST</th><th></th></tr></thead><tbody>`;
    matrixResults.forEach(r => {
        tableHTML += `<tr><td style="color:${r.conf==='3'?'#ffcc00':'#fff'}">${r.conf}</td><td>${r.ab}</td><td style="color:#00bfff">${r.vapp}</td><td>${r.dist}</td><td style="font-weight:bold; color:${r.color}">${r.status}</td></tr>`;
    });
    tableHTML += `</tbody></table>`;
    document.querySelector('#tab-landing .perf-section').innerHTML = `<div class="perf-title" style="color:#ffcc00;">LANDING DISTANCE MATRIX (RLD)</div>${tableHTML}`;
    
    saveInputs();
}

// ==========================================
// [SECTION 6] UI CONTROLLER (主程式)
// ==========================================
let completedFlights = JSON.parse(safeGet('a330_completed_v4')) || {};

window.onload = function() {
    loadRosterFromStorage(); // Roster Logic
    if(window.Generator) Generator.load(); // Generator Logic

    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        titleEl.innerHTML = `A330 EFB <span style="font-size:12px; color:#00ff00;">v4.7 MERGED</span>` + 
                            `<button class="reset-btn" onclick="clearAllData()">RESET</button>`;
    }

    if (!window.routeDB || !window.weightDB) alert("⚠️ DB Error! Ensure airports/routes/weights JS are loaded.");
    
    updateGeneratorUI();
    renderRoster();
    try { loadInputs(); } catch(e) {}
};

// UI Helpers
function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

function updateGeneratorUI() {
    let s = Generator.state;
    let statusEl = document.getElementById('gen-status-text');
    if(statusEl) {
        statusEl.innerHTML = `LOC: <span style="color:#00bfff">${s.location}</span> | HRS: ${s.totalHours.toFixed(1)} | MAINT: ${s.maintCounter.toFixed(1)}/500`;
    }
    let btnCont = document.getElementById('btn-continue-career');
    if(btnCont) btnCont.disabled = (s.totalHours === 0);
}

function startNewCareer() {
    let base = document.getElementById('base-select').value;
    if(confirm(`Start new career at ${base}?`)) {
        Generator.reset(base);
        generateAndLoad();
    }
}

function continueCareer() { generateAndLoad(); }

function generateAndLoad() {
    logToConsole("🔄 Generating Roster...");
    let newRoster = Generator.generateMonth();
    localStorage.setItem('a330_roster_data', JSON.stringify(newRoster));
    loadRosterFromStorage(); 
    renderRoster();
    updateGeneratorUI();
    logToConsole(`✅ Generated ${Object.keys(newRoster).length} flights.`);
    switchTab('roster');
}

function logToConsole(msg) {
    let el = document.getElementById('gen-console');
    if(el) { el.innerHTML += `<div>> ${msg}</div>`; el.scrollTop = el.scrollHeight; }
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    if(!list) return;
    list.innerHTML = '';
    
    if(!window.flightDB || Object.keys(window.flightDB).length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">NO ROSTER DATA<br>Go to GENERATOR tab.</div>`;
        return;
    }

    for (const [k, v] of Object.entries(window.flightDB)) {
        let badgeColor = "#00bfff";
        let icon = "✈️";
        if (v.tags.includes("MAINT")) { badgeColor = "#e74c3c"; icon = "🛠️"; }
        else if (v.tags.includes("PREIGHTER")) { badgeColor = "#9b59b6"; icon = "📦"; }
        else if (v.tags.includes("SHUTTLE")) { badgeColor = "#95a5a6"; icon = "🚌"; }
        else if (v.tags.includes("CHARTER")) { badgeColor = "#f1c40f"; icon = "🏖️"; }

        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = () => loadFlight(k); 
        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day" style="color:${badgeColor}">${v.day} | ${v.id}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:11px; color:#aaa; margin-top:4px;">${icon} ${v.d}</div>
            </div>
            <button class="check-btn" onclick="event.stopPropagation(); toggle('${k}')">✓</button>
        `;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('a330_completed_v4', JSON.stringify(completedFlights));
    renderRoster();
}

function loadFlight(k) {
    if(!window.flightDB[k]) return;
    const d = window.flightDB[k];
    ['to-flight-title', 'ldg-flight-desc', 'dsp-flight'].forEach(id => {
        let el = document.getElementById(id); if(el) el.innerText = d.id + " (" + d.r + ")";
    });
    initDispatchSession(k); 
    switchTab('dispatch'); 
}

function clearAllData() {
    if(confirm("FULL RESET?")) { localStorage.clear(); location.reload(); }
}

// Dispatch UI Update (Helper)
function updateDispatchDisplay() {
    let s = currentDispatchState;
    document.getElementById('pax-count').value = s.pax;
    
    // 客改貨 UI 標題切換
    let paxLabel = document.querySelector('label[for="pax-count"]');
    if(paxLabel) paxLabel.innerText = s.tags.includes("PREIGHTER") ? "CABIN CARGO (BOXES)" : "PASSENGERS";
    
    document.getElementById('pax-weight').value = s.pax * 77;
    document.getElementById('cargo-fwd').value = s.cgoF;
    document.getElementById('cargo-aft').value = s.cgoA;
    document.getElementById('fuel-total').value = s.fuel;
    document.getElementById('trip-fuel').value = Math.round(s.fuel - 5500);
    
    let warnEl = document.getElementById('dsp-warnings');
    if(warnEl) {
        warnEl.innerHTML = s.warnings.map(w => `<div style="color:orange">${w}</div>`).join('');
    }
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
    }
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-oat','to-rwy-slope', 
                 'ldg-rwy-len','ldg-rwy-cond','ldg-rev'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('a330_calc_inputs_v25', JSON.stringify(data));
}
