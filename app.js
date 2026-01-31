// ==========================================
// 📱 A330 EFB App Controller v4.7 (Fixed)
// ==========================================

let completedFlights = JSON.parse(safeGet('a330_completed_v4')) || {};

window.onload = function() {
    // 1. 載入 Generator 狀態
    if(window.Generator) Generator.load();

    // 2. 更新標題
    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        titleEl.innerHTML = `A330 EFB <span style="font-size:12px; color:#00ff00;">v4.7 CAREER</span>` + 
                            `<button class="reset-btn" onclick="clearAllData()">RESET</button>`;
    }

    // 3. 檢查資料庫完整性
    if (!window.routeDB || !window.airportDB) alert("⚠️ Critical Databases missing!");
    
    // 4. 初始化 UI
    updateGeneratorUI(); 
    loadRosterFromStorage(); 
    renderRoster(); 

    // 5. 載入上次輸入 (若有)
    try { if(typeof loadInputs === 'function') loadInputs(); } catch(e) {}
};

// --- Generator UI Logic ---
function updateGeneratorUI() {
    let s = Generator.state;
    let statusEl = document.getElementById('gen-status-text');
    
    if(statusEl) {
        statusEl.innerHTML = `
            LOCATION: <span style="color:#00bfff">${s.location}</span> | 
            HOURS: ${s.totalHours.toFixed(1)} | 
            MAINT: ${s.maintCounter.toFixed(1)}/500h
        `;
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

// --- Roster UI ---
function renderRoster() {
    const list = document.getElementById('roster-list');
    if(!list) return;
    list.innerHTML = '';
    
    if(!window.flightDB || Object.keys(window.flightDB).length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:20px; color:#666;">
            NO ROSTER DATA<br>Go to GENERATOR tab to start.
        </div>`;
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
                <div style="font-size:11px; color:#aaa; margin-top:4px;">
                    ${icon} ${v.d}
                </div>
            </div>
            <button class="check-btn" onclick="event.stopPropagation(); toggle('${k}')">✓</button>
        `;
        list.appendChild(d);
    }
}

// --- Core App Functions ---

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('a330_completed_v4', JSON.stringify(completedFlights));
    renderRoster();
}

function loadFlight(k) {
    if(!window.flightDB[k]) return;
    const d = window.flightDB[k];
    
    // 更新標題
    ['to-flight-title', 'ldg-flight-desc', 'dsp-flight'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.innerText = d.id + " (" + d.r + ")";
    });

    // 🟢 關鍵修正：更新跑道列表
    updateRunwayLists(k);

    // 啟動 Dispatch 模組
    initDispatchSession(k); 
    switchTab('dispatch'); 
}

function clearAllData() {
    if(confirm("FULL RESET?")) { 
        localStorage.clear(); 
        location.reload(); 
    }
}

// ==========================================
// 補：跑道選擇與介面邏輯 (UI Logic)
// ==========================================

// 1. 更新跑道列表
function updateRunwayLists(flightId) {
    let f = window.flightDB[flightId];
    if(!f) return;
    
    // 解析起降機場 (例如 "LSZH-KJFK")
    let pair = f.r.split('-');
    let depICAO = pair[0];
    let arrICAO = pair[1];

    populateDropdown('to-rwy-select', depICAO);
    populateDropdown('ldg-rwy-select', arrICAO);
}

// 2. 填充下拉選單
function populateDropdown(elmId, icao) {
    let el = document.getElementById(elmId);
    if(!el) return;
    
    // 清空並重設
    el.innerHTML = '<option value="">MANUAL INPUT</option>';
    
    let airport = window.airportDB[icao];
    if(!airport) return;

    // 建立選項
    for(let rwy in airport.runways) {
        let opt = document.createElement('option');
        opt.value = rwy;
        opt.innerText = `RWY ${rwy}`;
        el.appendChild(opt);
    }
}

// 3. 應用跑道數據 (HTML onchange 呼叫)
function applyRunway(type) {
    // type: 'to' (起飛) 或 'ldg' (降落)
    let selectId = type + '-rwy-select';
    let rwyCode = document.getElementById(selectId).value;
    
    // 找出目前的機場 ICAO
    let flightId = currentDispatchState.flightId;
    if(!flightId) return;
    let f = window.flightDB[flightId];
    let pair = f.r.split('-');
    let icao = (type === 'to') ? pair[0] : pair[1];

    let airport = window.airportDB[icao];
    if(!airport) return;

    // 顯示標高
    document.getElementById(type + '-elev-disp').innerText = airport.elev;

    if(rwyCode === "") {
        document.getElementById(type + '-rwy-info').style.display = 'none';
        return;
    }

    let rwyData = airport.runways[rwyCode];
    if(rwyData) {
        // 填入數據
        document.getElementById(type + '-rwy-len').value = rwyData.len;
        document.getElementById(type + '-rwy-hdg').value = rwyData.hdg;
        document.getElementById(type + '-rwy-slope').value = rwyData.slope;
        
        // 顯示資訊列
        let infoEl = document.getElementById(type + '-rwy-info');
        infoEl.style.display = 'flex';
        infoEl.innerHTML = `
            <div>ID: ${icao}</div>
            <div>RWY: ${rwyCode}</div>
            <div>ELEV: ${airport.elev}'</div>
        `;
    }
    saveInputs();
}

function saveInputs() {
    // 這裡可以保留擴充空間，目前留空即可
}
