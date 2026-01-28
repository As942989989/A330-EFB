// ==========================================
// ✈️ TK A330 Dispatch Scenarios v28.1 (Master Plan Ready)
// ==========================================

window.flightDB = {
    // === 🇪🇺 歐洲區域航線 ===
    "LX250": { 
        day: "Day 01-1", type: "PAX", profile: "BIZ", dist: 805, // LSZH-LEMD
        r: "LSZH-LEMD", ci: 48, d: "Stand E26 -> 377 | 🇪🇺 商務客流 (高頻)" 
    },
    "LX462": { 
        day: "Day 02-1", type: "PAX", profile: "LEISURE", dist: 380, // LSZH-LIRF
        r: "LSZH-LIRF", ci: 38, d: "Stand B 35 -> 206 | 🇮🇹 觀光客流 (行李多)" 
    },
    "LX168": { 
        day: "Day 09-1", type: "PAX", profile: "BIZ", dist: 330, // LSZH-EHAM
        r: "LSZH-EHAM", ci: 31, d: "Stand A 09 -> D22 | 🇳🇱 商務通勤" 
    },

    // === 🇺🇸 北美長程航線 ===
    "LX340": { 
        day: "Day 04-1", type: "PAX", profile: "BIZ", dist: 3950, // LSZH-KORD (約)
        r: "LSZH-KORD", ci: 14, d: "Stand E 67 -> M11 | 🇺🇸 跨大西洋 (重載)" 
    },
    "LX818": { 
        day: "Day 20-1", type: "PAX", profile: "LEISURE", dist: 4200, // LSZH-KMIA (約)
        r: "LSZH-KMIA", ci: 14, d: "Stand E 34 -> J05 | 🏖️ 佛州假期" 
    },

    // === 📦 客改貨 / 純貨運 (Preighter) ===
    "LX331": { 
        day: "Day 06-1", type: "CGO", profile: "MEDICAL", dist: 805, 
        r: "LSZH-LEMD", ci: 44, d: "Stand B 38 -> 211 | 📦 醫療物資急運" 
    },
    "LX276": { 
        day: "Day 12-1", type: "CGO", profile: "MEDICAL", dist: 3950, 
        r: "LSZH-KORD", ci: 10, d: "Stand W 12 -> C2  | 📦 跨洋貨運" 
    },

    // === 🛠️ 維修飛渡 ===
    "LX999": { 
        day: "MAINT", type: "MAINT", profile: "FERRY", dist: 380, 
        r: "LSZH-LIRF", ci: 0, d: "Stand 39 -> Hangar | 🛠️ 維修飛渡 (空機)" 
    }
};
