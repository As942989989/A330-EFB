// ==========================================
// 📱 A330 EFB Main Controller (UI & Events)
// ==========================================

let completedFlights = JSON.parse(safeGet('a330_roster_v25')) || {};

window.onload = function() {
    const baseVersion = "v32.0 (Modular)"; 
    let dateStr = "Dev";
    try {
        let d = new Date(document.lastModified);
        dateStr = (d.getMonth()+1) + "/" + d.getDate() + " " + d.getHours() + ":" + String(d.getMinutes()).padStart(2, '0');
    } catch(e) {}

    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        let btnHTML = titleEl.innerHTML.match(/<button.*<\/button>/)[0];
        titleEl.innerHTML = `A330 OPT <span style="font-size:12px; color:#00ff00;">${baseVersion} (${dateStr})</span>` + btnHTML;
    }

    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ DB Error! Ensure all JS files are loaded.");
    } else {
        renderRoster();
        try { loadInputs(); } catch(e) { console.log("No prev inputs"); }
    }
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    
    const tab = document.getElementById('tab-' + t);
    const btn = document.getElementById('btn-' + t);
    
    if(tab) tab.classList.add('active');
    if(btn) btn.classList.add('active');
}

// --- Roster UI ---
function renderRoster() {
    const list = document.getElementById('roster-list');
    if(!list) return;
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        const infoTag = v.type === "PAX" ? "PAX" : (v.type === "CGO" ? "CGO" : "FERRY");
        
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = () => loadFlight(k); 
        d.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${v.day} | ${k}</div>
                <div class="flight-route">${v.r}</div>
                <div style="font-size:12px; color:#00bfff; margin-bottom:4px; font-weight:bold;">
                    ${infoTag} | ${v.dist || 0} NM
                </div>
                <div class="flight-desc">${v.d}</div>
            </div>
            <button class="check-btn" onclick="event.stopPropagation(); toggle('${k}')">✓</button>
        `;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('a330_roster_v25', JSON.stringify(completedFlights));
    renderRoster();
}

function loadFlight(k) {
    if(!window.flightDB[k]) return;
    const d = window.flightDB[k];
    
    let t1 = document.getElementById('to-flight-title');
    let t2 = document.getElementById('ldg-flight-desc');
    let t3 = document.getElementById('dsp-flight');
    
    if(t1) t1.innerText = k + " (" + d.r + ")";
    if(t2) t2.innerText = k + " (" + d.r + ")";
    if(t3) t3.innerText = k + " (" + d.r + ")";

    let route = d.r.toUpperCase();
    let dep = route.split('-')[0].trim();
    let arr = route.split('-')[1].trim();
    
    let oatEl = document.getElementById('to-oat');
    if(oatEl) oatEl.value = ""; 

    if(window.airportDB) {
        if(window.airportDB[dep]) document.getElementById('to-elev-disp').innerText = window.airportDB[dep].elev || 0;
        if(window.airportDB[arr]) document.getElementById('ldg-elev-disp').innerText = window.airportDB[arr].elev || 0;
    }

    populateRunways('to-rwy-select', dep);
    populateRunways('ldg-rwy-select', arr);
    
    applyRunway('to'); 
    applyRunway('ldg');
    
    initDispatchSession(k); 
    switchTab('dispatch'); 
}

// --- Runway UI ---
function populateRunways(selectId, icao) {
    const sel = document.getElementById(selectId);
    if(!sel) return;
    sel.innerHTML = '<option value="">MANUAL INPUT</option>';
    if (window.airportDB && window.airportDB[icao]) {
        const apt = window.airportDB[icao];
        for (const [rwyID, data] of Object.entries(apt.runways)) {
            let opt = document.createElement('option');
            opt.value = rwyID; 
            opt.innerText = `${rwyID} (${data.len}ft)`;
            opt.dataset.len = data.len;
            opt.dataset.hdg = data.hdg;
            opt.dataset.slope = data.slope !== undefined ? data.slope : 0;
            sel.appendChild(opt);
        }
    }
}

function applyRunway(prefix) {
    const sel = document.getElementById(prefix + '-rwy-select');
    if(!sel) return;
    const opt = sel.options[sel.selectedIndex];
    const manualDiv = document.getElementById(prefix + '-manual-data');
    const infoDiv = document.getElementById(prefix + '-rwy-info');

    if (opt.value !== "") {
        document.getElementById(prefix + '-rwy-len').value = opt.dataset.len;
        document.getElementById(prefix + '-rwy-hdg').value = opt.dataset.hdg;
        let slopeInput = document.getElementById(prefix + '-rwy-slope');
        if(slopeInput) slopeInput.value = opt.dataset.slope;

        if(infoDiv) {
            infoDiv.style.display = 'flex'; 
            infoDiv.innerHTML = `
                <div>LEN: <span style="color:#00bfff">${opt.dataset.len}</span> FT</div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>HDG: <span style="color:#00bfff">${opt.dataset.hdg}°</span></div>
                <div style="border-left:1px solid #444; margin:0 5px;"></div>
                <div>SLOPE: <span style="color:#00bfff">${opt.dataset.slope}%</span></div>
            `;
        }
        if(manualDiv) manualDiv.style.display = 'none';
    } else {
        if(manualDiv) manualDiv.style.display = 'block';
        if(infoDiv) infoDiv.style.display = 'none';
    }
}

// --- Dispatch UI ---
function updateDispatchDisplay() {
    if(!window.weightDB) return;

    // PAX
    let pax = currentDispatchState.pax;
    let paxWt = pax * window.weightDB.pax_unit;
    let bagWt = pax * 13; 
    let totalPaxLoad = paxWt + bagWt;

    document.getElementById('dsp-pax-count').innerText = pax;
    document.getElementById('dsp-pax-total-wt').innerText = totalPaxLoad;
    
    let paxPct = (pax / 441) * 100;
    document.getElementById('bar-pax').style.width = paxPct + "%";

    // Cargo
    let cgoF = currentDispatchState.cgoF;
    let cgoA = currentDispatchState.cgoA;
    let totalCgo = cgoF + cgoA;

    document.getElementById('dsp-cgo-total').innerText = totalCgo;
    document.getElementById('dsp-cgo-fwd-val').innerText = cgoF;
    document.getElementById('dsp-cgo-aft-val').innerText = cgoA;

    let pctF = totalCgo > 0 ? Math.round((cgoF / totalCgo) * 100) : 50;
    let pctA = totalCgo > 0 ? (100 - pctF) : 50;

    document.getElementById('bar-cgo-fwd').style.width = pctF + "%";
    document.getElementById('bar-cgo-aft').style.width = pctA + "%";
    document.getElementById('dsp-cgo-fwd-pct').innerText = pctF + "%";
    document.getElementById('dsp-cgo-aft-pct').innerText = pctA + "%";

    // CI & Status
    let ciEl = document.getElementById('dsp-ci-val');
    if(ciEl) ciEl.innerText = currentDispatchState.ci;

    let flightDisp = document.getElementById('dsp-flight');
    if(currentDispatchState.flightId) {
        let fInfo = window.flightDB[currentDispatchState.flightId];
        let statusTag = currentDispatchState.isSaved ? " <span style='color:#888; font-size:10px;'>[SAVED]</span>" : " <span style='color:#00ff00; font-size:10px;'>[NEW]</span>";
        flightDisp.innerHTML = currentDispatchState.flightId + " (" + fInfo.r + ")" + statusTag;
    }

    // Fuel & Weights
    let fuel = currentDispatchState.fuel;
    document.getElementById('dsp-est-fuel').innerText = fuel;

    let totalLoad = totalPaxLoad + totalCgo;
    let zfw = window.weightDB.oew + totalLoad;
    let tow = zfw + fuel;
    let tripBurn = Math.round(currentDispatchState.dist * 12.5);
    let lw = tow - tripBurn;

    document.getElementById('dsp-res-zfw').innerText = Math.round(zfw);
    document.getElementById('dsp-res-tow').innerText = Math.round(tow);
    document.getElementById('dsp-res-lw').innerText = Math.round(lw);

    let limitTOW = 242000; 
    document.getElementById('dsp-limit-tow').innerText = (limitTOW/1000) + "T";
    
    let statusEl = document.getElementById('dsp-rwy-status');
    if (currentDispatchState.warnings.length > 0) {
        statusEl.innerText = currentDispatchState.warnings.join(" | ");
        statusEl.style.color = "#f1c40f";
    } else {
        statusEl.innerText = "UNRESTRICTED";
        statusEl.style.color = "#2ecc71";
    }

    let underload = limitTOW - tow;
    let ulEl = document.getElementById('dsp-underload');
    ulEl.innerText = (underload >= 0 ? "+" : "") + Math.round(underload);
    ulEl.style.color = (underload < 0) ? "#e74c3c" : "#00bfff";
}

function confirmDispatch() {
    document.getElementById('pax-count').value = currentDispatchState.pax;
    document.getElementById('cargo-fwd').value = currentDispatchState.cgoF;
    document.getElementById('cargo-aft').value = currentDispatchState.cgoA;
    document.getElementById('fuel-total').value = currentDispatchState.fuel;
    
    let estTrip = Math.round(currentDispatchState.dist * 12.5);
    document.getElementById('trip-fuel').value = estTrip;
    
    updatePaxWeight();
    updateTotalCargo();
    saveInputs();

    switchTab('takeoff');
}

function updatePaxWeight(){
    if(!window.weightDB) return;
    let count = parseFloat(document.getElementById("pax-count").value) || 0;
    let unit = window.weightDB.pax_unit; 
    let totalWeight = count * unit;
    document.getElementById("pax-weight").value = totalWeight;
    let dispEl = document.getElementById("pax-weight-disp");
    if(dispEl) dispEl.innerText = totalWeight;
}

function updateTotalCargo(){
    document.getElementById("cargo-total").value=(parseFloat(document.getElementById("cargo-fwd").value)||0)+(parseFloat(document.getElementById("cargo-aft").value)||0);
}

// --- Data Persistence ---
function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg','to-oat',
                 'to-rwy-slope', 
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg',
                 'ldg-rwy-slope', 'ldg-rev', 
                 'ldg-gw-input'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('a330_calc_inputs_v25', JSON.stringify(data));
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
        updatePaxWeight(); updateTotalCargo();
        
        applyRunway('to');
        applyRunway('ldg');
    }
}

function clearAllData() {
    if(confirm("RESET ALL DATA?")) { 
        safeRem('a330_calc_inputs_v25'); 
        safeRem('a330_roster_v25'); 
        location.reload(); 
    }
}
