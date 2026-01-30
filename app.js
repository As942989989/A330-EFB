// ==========================================
// 📱 A330 EFB App Controller v4.7
// ==========================================

let completedFlights = JSON.parse(safeGet('a330_completed_v4')) || {};

window.onload = function() {
    // 載入 Generator 狀態
    if(window.Generator) Generator.load();

    // 更新標題
    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        titleEl.innerHTML = `A330 EFB <span style="font-size:12px; color:#00ff00;">v4.7 CAREER</span>` + 
                            `<button class="reset-btn" onclick="clearAllData()">RESET</button>`;
    }

    // 檢查資料庫
    if (!window.routeDB) alert("⚠️ RouteDB missing!");
    
    updateGeneratorUI();
    renderRoster();
    try { loadInputs(); } catch(e) {}
};

// --- Generator UI Logic ---
function updateGeneratorUI() {
    let s = Generator.state;
    let statusEl = document.getElementById('gen-status-text');
    let logEl = document.getElementById('gen-log');
    
    if(statusEl) {
        statusEl.innerHTML = `
            LOCATION: <span style="color:#00bfff">${s.location}</span> | 
            HOURS: ${s.totalHours.toFixed(1)} | 
            MAINT: ${s.maintCounter.toFixed(1)}/500h
        `;
    }
    
    // 根據是否有存檔，切換按鈕狀態
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
    
    // 存入 LocalStorage 供 Roster.js 讀取
    localStorage.setItem('a330_roster_data', JSON.stringify(newRoster));
    
    // 重新載入 Roster
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

// --- Roster UI (Updated for Tags) ---
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
        // 根據標籤決定顏色與圖示
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

// ... (其餘 switchTab, loadFlight, toggle 等函數維持原樣，無需變動) ...
// 為了節省篇幅，請保留您原本 app.js 的後半段 (loadFlight, switchTab, UI helpers)
// 只要確保 renderRoster 被上面的版本覆蓋即可。

// --- 這裡補上必要的 Helper 以防您直接複製貼上蓋掉 ---
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

    // 處理 DSP
    initDispatchSession(k); 
    switchTab('dispatch'); 
}

function clearAllData() {
    if(confirm("FULL RESET?")) { 
        localStorage.clear(); 
        location.reload(); 
    }
}
