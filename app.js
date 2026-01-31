// ==========================================
// 📱 A330 EFB App Controller
// ==========================================

window.onload = function() {
    // 1. 初始化 Generator
    if(window.Generator) Generator.load();

    // 2. 設置標題
    let titleEl = document.querySelector('.nav-header');
    if(titleEl) {
        titleEl.innerHTML = `A330 EFB <span style="font-size:12px; color:#00ff00;">v4.7 CAREER</span>` + 
                            `<button class="reset-btn" onclick="clearAllData()">RESET</button>`;
    }

    // 3. 檢查資料庫完整性
    if (!window.routeDB || !window.airportDB) alert("⚠️ Critical Databases missing!");
    
    // 4. 初始化 UI
    updateGeneratorUI(); // from career_system.js
    loadRosterFromStorage(); // from career_system.js
    renderRoster(); // from career_system.js

    // 5. 載入上次輸入 (若有)
    try { if(typeof loadInputs === 'function') loadInputs(); } catch(e) {}
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

function loadFlight(k) {
    if(!window.flightDB[k]) return;
    const d = window.flightDB[k];
    
    // 更新所有相關的標題
    ['to-flight-title', 'ldg-flight-desc', 'dsp-flight'].forEach(id => {
        let el = document.getElementById(id);
        if(el) el.innerText = d.id + " (" + d.r + ")";
    });

    // 啟動 Dispatch 模組
    initDispatchSession(k); // from flight_computer.js
    switchTab('dispatch'); 
}

function clearAllData() {
    if(confirm("FULL RESET?")) { 
        localStorage.clear(); 
        location.reload(); 
    }
}
