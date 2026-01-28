{
type: uploaded file
fileName: roster.js
fullContent:
// ==========================================
// ✈️ TK A330 Dispatch Scenarios v28.0 (Realistic Profiles)
// ==========================================
// Type: PAX (客運), PREIGHTER (客改貨)
// Demand: HIGH (95-100%), MED (75-90%), LOW (50-70%)
// Profile: BUSINESS (行李少), LEISURE (行李多), VFR (返鄉/高密度)

window.flightDB = {
    // === 🇪🇺 歐洲區域航線 (短程/高頻) ===
    "LX250": { day: "Day 01", r: "LSZH-LEMD", ci: 48, type: "PAX", profile: "BUSINESS", demand: "MED" },
    "LX117": { day: "Day 01", r: "LEMD-LSZH", ci: 45, type: "PAX", profile: "BUSINESS", demand: "HIGH" },
    "LX462": { day: "Day 02", r: "LSZH-LIRF", ci: 38, type: "PAX", profile: "LEISURE",  demand: "HIGH" },
    "LX115": { day: "Day 03", r: "LSZH-LFPG", ci: 33, type: "PAX", profile: "BUSINESS", demand: "MED" },
    "LX168": { day: "Day 09", r: "LSZH-EHAM", ci: 31, type: "PAX", profile: "BUSINESS", demand: "LOW" },
    "LX108": { day: "Day 23", r: "LSZH-LGAV", ci: 49, type: "PAX", profile: "LEISURE",  demand: "MED" },

    // === 🇺🇸 北美長程航線 (油量與業載博弈) ===
    "LX340": { day: "Day 04", r: "LSZH-KORD", ci: 14, type: "PAX", profile: "BUSINESS", demand: "HIGH" }, // 油重，業載受限
    "LX993": { day: "Day 04", r: "KORD-LSZH", ci: 45, type: "PAX", profile: "BUSINESS", demand: "MED" },
    "LX818": { day: "Day 20", r: "LSZH-KMIA", ci: 14, type: "PAX", profile: "LEISURE",  demand: "HIGH" },
    "LX332": { day: "Day 27", r: "LSZH-EGLL", ci: 44, type: "PAX", profile: "BUSINESS", demand: "HIGH" }, // 雖然是EGLL但用長程機材

    // === 🌏 亞洲/中東航線 (極限航程) ===
    "LX947": { day: "Day 08", r: "LSZH-ZBAA", ci: 10, type: "PAX", profile: "BUSINESS", demand: "HIGH" }, // 北京，油量極高
    "LX494": { day: "Day 08", r: "ZBAA-LSZH", ci: 45, type: "PAX", profile: "BUSINESS", demand: "HIGH" },

    // === 📦 客改貨 / 純貨運 (Preighter) ===
    "LX331": { day: "Day 06", r: "LSZH-LEMD", ci: 20, type: "PREIGHTER", profile: "CARGO", demand: "HIGH" },
    "LX495": { day: "Day 10", r: "LSZH-LEMD", ci: 20, type: "PREIGHTER", profile: "CARGO", demand: "MED" },
    "LX276": { day: "Day 12", r: "LSZH-KORD", ci: 5,  type: "PREIGHTER", profile: "CARGO", demand: "HIGH" }, // 長程貨運
    "LX267": { day: "Day 15", r: "LSZH-EHAM", ci: 20, type: "PREIGHTER", profile: "CARGO", demand: "LOW" },
    
    // === 🛠️ 測試航班 (極限跑道/高溫) ===
    "LX999": { day: "TEST",   r: "LSZH-LFSB", ci: 80, type: "PAX", profile: "LEISURE", demand: "HIGH" } // 巴塞爾短跑道測試
};
}
