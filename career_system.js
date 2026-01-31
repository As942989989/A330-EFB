// ==========================================
// 📅 A330 Career System (Generator + Roster UI)
// ==========================================

// --- Roster State ---
let completedFlights = JSON.parse(safeGet('a330_completed_v4')) || {};

// --- Generator Logic ---
const Generator = {
    state: {
        base: "LSZH",           // 生涯基地
        location: "LSZH",       // 目前飛機位置
        maintCounter: 0,        // 累積維修時數
        totalHours: 0,          // 生涯總時數
        lastFlightNum: null,    // 上一腿班號
        history: []             
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
            base: base || "LSZH",
            location: base || "LSZH",
            maintCounter: 0,
            totalHours: 0,
            lastFlightNum: null,
            history: []
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
            let isPreighter = (selectedRoute.isCargoHotspot && Generator.rnd(1, 100) <= 15);
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
            type: "MAINT", profile: "FERRY", dest: to, tags: ["MAINT", "FERRY"], d: "🛠️ MANDATORY MAINTENANCE"
        };
    },
    createFerryFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "FERRY", profile: "FERRY", dest: to, tags: ["FERRY"], d: "⚠️ POSITIONING FLIGHT"
        };
    },
    createShuttleFlight: function(id, from, to) {
         let num = "LX" + Generator.rnd(2800, 2819);
         return {
            day: id, id: num, r: `${from}-${to}`, dist: 125, time: 45,
            type: "PAX", profile: "BIZ", dest: to, tags: ["SHUTTLE"], d: "🇨🇭 HUB SHUTTLE"
        };
    },
    createCharterFlight: function(id, from, destObj) {
        let num = "LX" + Generator.rnd(8000, 8999);
        return {
            day: id, id: num, r: `${from}-${destObj.dest}`, dist: Math.round(destObj.time * 8), time: destObj.time,
            type: "PAX", profile: "LEISURE", dest: destObj.dest, tags: ["CHARTER"], d: `🏖️ CHARTER: ${destObj.name}`
        };
    }
};

// --- Roster Management & UI ---
function loadRosterFromStorage() {
    let savedRoster = localStorage.getItem('a330_roster_data');
    if (savedRoster) {
        window.flightDB = JSON.parse(savedRoster);
        console.log("✅ Roster loaded.");
    } else {
        window.flightDB = {};
        console.log("⚠️ No roster found.");
    }
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

// --- Generator UI Functions ---
function updateGeneratorUI() {
    let s = Generator.state;
    let statusEl = document.getElementById('gen-status-text');
    if(statusEl) {
        statusEl.innerHTML = `Loc: <span style="color:#00bfff">${s.location}</span> | Hrs: ${s.totalHours.toFixed(1)} | Maint: ${s.maintCounter.toFixed(1)}/500h`;
    }
    let btnCont = document.getElementById('btn-continue-career');
    if(btnCont) btnCont.disabled = (s.totalHours === 0);
}

function startNewCareer() {
    let base = document.getElementById('base-select').value;
    if(confirm(`Start new career at ${base}? Previous data will be lost.`)) {
        Generator.reset(base);
        generateAndLoad();
    }
}

function continueCareer() {
    generateAndLoad();
}

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
    if(el) {
        el.innerHTML += `<div>> ${msg}</div>`;
        el.scrollTop = el.scrollHeight;
    }
}
