// ==========================================
// 📱 A330 EFB App Controller v5.0 (Roster View Fixed)
// ==========================================

let completedFlights = JSON.parse(safeGet('a330_completed_v4')) || {};

// 輔助工具
function safeGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }

window.onload = function() {
    // 1. 載入 Generator 狀態
    if(window.Generator) Generator.load();

    // 2. 設置標題
    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        titleEl.innerHTML = `A330 EFB <span style="font-size:12px; color:#00ff00;">v5.0</span>` + 
                            `<button class="reset-btn" onclick="clearAllData()">RESET</button>`;
    }

    // 3. 檢查資料庫
    if (!window.routeDB || !window.airportDB) console.warn("⚠️ Database missing?");
    
    // 4. 初始化 UI
    updateGeneratorUI(); 
    loadRosterFromStorage(); 
    renderRoster(); // 渲染班表

    // 5. 恢復上次活躍的航班
    let lastActiveFlight = localStorage.getItem('a330_active_flight');
    if (lastActiveFlight && window.flightDB && window.flightDB[lastActiveFlight]) {
        // 這裡可以加入自動跳轉邏輯
    }
    
    // 6. 載入輸入
    if(typeof loadInputs === 'function') loadInputs();
};

// --- Generator UI Logic ---
function updateGeneratorUI() {
    if (!window.Generator) return;
    let s = Generator.state;
    let statusEl = document.getElementById('gen-status-text');
    
    if(statusEl) {
        statusEl.innerHTML = `
            LOC: <span style="color:#00bfff">${s.location}</span> | 
            HRS: ${s.totalHours.toFixed(1)} | 
            MAINT: ${s.maintCounter.toFixed(0)}/100h
        `;
    }
    
    let btnCont = document.getElementById('btn-continue-career');
    if(btnCont) btnCont.disabled = (s.totalHours === 0);
}

// 產生新班表並存檔
function generateAndLoad() {
    if (!window.Generator) return;
    console.log("🔄 Generating Roster...");
    
    // 呼叫 30 天生成邏輯
    let newRoster = Generator.generateMonth(); 
    
    // 存入 LocalStorage
    localStorage.setItem('a330_roster_data', JSON.stringify(newRoster));
    
    // 更新記憶體中的數據
    loadRosterFromStorage();
    
    // 重新渲染畫面
    renderRoster();
    updateGeneratorUI();
    
    // 切換分頁
    switchTab('roster');
}

function startNewCareer() {
    let base = document.getElementById('base-select').value;
    if(confirm(`Start new career at ${base}?`)) {
        Generator.reset(base);
        generateAndLoad();
    }
}

function continueCareer() {
    generateAndLoad();
}

function clearAllData() {
    if(confirm("RESET ALL DATA?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- Roster Logic (關鍵修正) ---

function loadRosterFromStorage() {
    let savedRoster = localStorage.getItem('a330_roster_data');
    if (savedRoster) {
        window.flightDB = JSON.parse(savedRoster);
    } else {
        window.flightDB = {};
    }
}

// [FIX] 動態渲染函數：自動適應任何天數
function renderRoster() {
    const list = document.getElementById('roster-list');
    if(!list) return;
    list.innerHTML = ''; // 清空
    
    if(!window.flightDB || Object.keys(window.flightDB).length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:40px; color:#666;">
            NO ROSTER DATA<br><br>
            Please go to <b>GEN</b> tab to generate a new schedule.
        </div>`;
        return;
    }

    // 將天數排序 (Day 1, Day 2, ..., Day 30)
    let days = Object.keys(window.flightDB).sort((a, b) => {
        return parseInt(a.replace('day_', '')) - parseInt(b.replace('day_', ''));
    });

    days.forEach(dayKey => {
        let flights = window.flightDB[dayKey];
        if (!Array.isArray(flights)) flights = [flights]; // 相容舊格式

        flights.forEach(v => {
            // 樣式設定
            let badgeColor = "#00bfff";
            let icon = "✈️";
            
            if (v.tags && v.tags.includes("MAINT")) { badgeColor = "#e74c3c"; icon = "🛠️"; }
            else if (v.tags && v.tags.includes("OFF")) { badgeColor = "#555"; icon = "🛌"; }
            else if (v.tags && v.tags.includes("PREIGHTER")) { badgeColor = "#9b59b6"; icon = "📦"; }
            
            // 跳過純休假且無資訊的顯示 (可選)
            // if (v.id === "OFF") ... 

            let depGateDisp = v.depGate ? v.depGate : "--";
            let arrGateDisp = v.arrGate ? v.arrGate : "--";

            const d = document.createElement('div');
            d.className = `flight-card ${completedFlights[v.id]?'completed':''}`;
            
            // 點擊事件
            if (v.id !== "OFF" && v.id !== "MAINT") {
                d.onclick = () => loadFlight(dayKey, v); 
            }

            d.innerHTML = `
                <div class="flight-info">
                    <div class="flight-day" style="color:${badgeColor}">DAY ${v.day} | ${v.id}</div>
                    <div class="flight-route">${v.r || v.info}</div>
                    
                    ${ (v.id !== "OFF" && v.id !== "MAINT") ? `
                    <div style="font-size:12px; color:#fff; font-family:monospace; margin-top:6px; background:#222; padding:4px 8px; border-radius:4px; display:inline-block; border:1px solid #444;">
                        GATE ${depGateDisp} &nbsp;➝&nbsp; GATE ${arrGateDisp}
                    </div>
                    ` : '' }

                    <div style="font-size:11px; color:#aaa; margin-top:6px;">
                        ${icon} ${v.d || v.info}
                    </div>
                </div>
            `;
            list.appendChild(d);
        });
    });
}

// 載入單一航班到 Dispatch 頁面 (簡易版)
function loadFlight(dayKey, flightData) {
    if (!flightData) return;
    
    // 儲存為當前航班
    localStorage.setItem('a330_active_flight', JSON.stringify(flightData));
    
    // 嘗試呼叫 flight_computer.js 的初始化
    if (typeof initDispatchSession === 'function') {
        initDispatchSession(flightData); 
    }
    
    switchTab('dispatch');
}

function switchTab(tabId) {
    // 隱藏所有 tab-content
    document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
    // 顯示目標
    let target = document.getElementById(tabId + '-view'); // 假設 HTML ID 是 roster-view
    if(target) target.style.display = 'block';
    
    // 更新按鈕狀態
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    let btn = document.getElementById('btn-' + tabId);
    if(btn) btn.classList.add('active');
}
