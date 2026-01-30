// ==========================================
// 📅 Roster Loader (Connects Generator to UI)
// ==========================================

function loadRosterFromStorage() {
    let savedRoster = localStorage.getItem('a330_roster_data');
    if (savedRoster) {
        window.flightDB = JSON.parse(savedRoster);
        console.log("✅ Roster loaded from storage.");
    } else {
        window.flightDB = {};
        console.log("⚠️ No roster found. Please generate one.");
    }
}

// 頁面載入時自動執行
loadRosterFromStorage();
