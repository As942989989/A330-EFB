// ==========================================
// ✈️ TK A330 Dispatch Scenarios (Dynamic Task Definitions)
// ==========================================
// 此檔案僅定義任務架構，數值由 DSP 演算法動態生成

window.flightDB = {
    // === Day 01 ===
    "LX250": { day: "Day 01-1", r: "LSZH-LEMD", dist: 805, type: "PAX", profile: "BIZ", d: "Stand E26 -> 377 | 🇪🇺 商務幹線" },
    "LX117": { day: "Day 01-2", r: "LEMD-LSZH", dist: 805, type: "PAX", profile: "BIZ", d: "Stand 377 -> B 35 | 🇪🇺 返程" },

    // === Day 02 ===
    "LX462": { day: "Day 02-1", r: "LSZH-LIRF", dist: 380, type: "PAX", profile: "BIZ", d: "Stand B 35 -> 206 | 🇮🇹 短程商務" },
    "LX545": { day: "Day 02-2", r: "LIRF-LSZH", dist: 380, type: "PAX", profile: "BIZ", d: "Stand 206 -> B 43 | 🇮🇹 返程" },

    // === Day 03 ===
    "LX115": { day: "Day 03-1", r: "LSZH-LFPG", dist: 265, type: "PAX", profile: "BIZ", d: "Stand B 43 -> E 10 | 🇫🇷 巴黎快線" },
    "LX448": { day: "Day 03-2", r: "LFPG-LSZH", dist: 265, type: "PAX", profile: "BIZ", d: "Stand E 10 -> B 38 | 🇫🇷 返程" },

    // === Day 04 (Long Haul) ===
    "LX340": { day: "Day 04-1", r: "LSZH-KORD", dist: 3950, type: "PAX", profile: "BIZ", d: "Stand B 38 -> H 15 | 🇺🇸 芝加哥長程" },
    "LX993": { day: "Day 04-2", r: "KORD-LSZH", dist: 3950, type: "PAX", profile: "BIZ", d: "Stand H 15 -> E 56 | 🇺🇸 返程" },

    // === Day 05 ===
    "LX341": { day: "Day 05-1", r: "LSZH-LFPG", dist: 265, type: "PAX", profile: "BIZ", d: "Stand E 56 -> A 3 | 🇫🇷 晨間航班" },
    "LX650": { day: "Day 05-2", r: "LFPG-LSZH", dist: 265, type: "PAX", profile: "BIZ", d: "Stand A 3 -> B 38 | 🇫🇷 返程" },

    // === Day 06 (Preighter) ===
    "LX331": { day: "Day 06-1", r: "LSZH-LEMD", dist: 805, type: "CGO", profile: "MEDICAL", d: "Stand B 38 -> 211 | 📦 客改貨 (醫療物資)" },
    "LX932": { day: "Day 06-2", r: "LEMD-LSZH", dist: 805, type: "PAX", profile: "BIZ", d: "Stand 211 -> B 43 | 🇪🇺 返程" },

    // === Day 07 ===
    "LX908": { day: "Day 07-1", r: "LSZH-LIRF", dist: 380, type: "PAX", profile: "BIZ", d: "Stand B 43 -> 607 | 🇮🇹 羅馬連線" },
    "LX569": { day: "Day 07-2", r: "LIRF-LSZH", dist: 380, type: "PAX", profile: "BIZ", d: "Stand 607 -> B 35 | 🇮🇹 返程" },

    // === Day 08 (China) ===
    "LX947": { day: "Day 08-1", r: "LSZH-ZBAA", dist: 4400, type: "PAX", profile: "BIZ", d: "Stand B 35 -> W 111 | 🇨🇳 北京長程" },
    "LX494": { day: "Day 08-2", r: "ZBAA-LSZH", dist: 4400, type: "PAX", profile: "BIZ", d: "Stand W 111 -> E 27 | 🇨🇳 返程" },

    // === Day 09 ===
    "LX168": { day: "Day 09-1", r: "LSZH-EHAM", dist: 330, type: "PAX", profile: "BIZ", d: "Stand E 27 -> G 79 | 🇳🇱 阿姆斯特丹" },
    "LX527": { day: "Day 09-2", r: "EHAM-LSZH", dist: 330, type: "PAX", profile: "BIZ", d: "Stand G 79 -> B 35 | 🇳🇱 返程" },

    // === Day 10 (Preighter) ===
    "LX495": { day: "Day 10-1", r: "LSZH-LEMD", dist: 805, type: "CGO", profile: "MEDICAL", d: "Stand B 35 -> 604 | 📦 客改貨" },
    "LX511": { day: "Day 10-2", r: "LEMD-LSZH", dist: 805, type: "PAX", profile: "BIZ", d: "Stand 604 -> B 39 | 🇪🇺 返程" },

    // === Day 11 ===
    "LX355": { day: "Day 11-1", r: "LSZH-EHAM", dist: 330, type: "PAX", profile: "BIZ", d: "Stand B 39 -> G 9 | 🇳🇱 歐陸幹線" },
    "LX778": { day: "Day 11-2", r: "EHAM-LSZH", dist: 330, type: "PAX", profile: "BIZ", d: "Stand G 9 -> B 38 | 🇳🇱 返程" },

    // === Day 12 (Long Haul Cgo) ===
    "LX276": { day: "Day 12-1", r: "LSZH-KORD", dist: 3950, type: "CGO", profile: "CARGO", d: "Stand B 38 -> SW 2 | 📦 長程純貨運" },
    "LX519": { day: "Day 12-2", r: "KORD-LSZH", dist: 3950, type: "PAX", profile: "BIZ", d: "Stand SW 2 -> E 19 | 🇺🇸 返程" },

    // === Day 13 ===
    "LX979": { day: "Day 13-1", r: "LSZH-LEMD", dist: 805, type: "PAX", profile: "BIZ", d: "Stand E 19 -> 73 | 🇪🇺 馬德里" },
    "LX768": { day: "Day 13-2", r: "LEMD-LSZH", dist: 805, type: "PAX", profile: "BIZ", d: "Stand 73 -> B 38 | 🇪🇺 返程" },

    // === Day 14 ===
    "LX462": { day: "Day 14-1", r: "LSZH-EHAM", dist: 330, type: "PAX", profile: "BIZ", d: "Stand B 38 -> G 3 | 🇳🇱 荷蘭連線" },
    "LX846": { day: "Day 14-2", r: "EHAM-LSZH", dist: 330, type: "PAX", profile: "BIZ", d: "Stand G 3 -> B 35 | 🇳🇱 返程" },

    // === Day 15 (Preighter) ===
    "LX267": { day: "Day 15-1", r: "LSZH-EHAM", dist: 330, type: "CGO", profile: "MEDICAL", d: "Stand B 35 -> G 73 | 📦 客改貨" },
    "LX204": { day: "Day 15-2", r: "EHAM-LSZH", dist: 330, type: "PAX", profile: "BIZ", d: "Stand G 73 -> B 34 | 🇳🇱 返程" },

    // === Day 16 ===
    "LX641": { day: "Day 16-1", r: "LSZH-KORD", dist: 3950, type: "PAX", profile: "BIZ", d: "Stand B 34 -> M 12 | 🇺🇸 跨大西洋" },
    "LX996": { day: "Day 16-2", r: "KORD-LSZH", dist: 3950, type: "PAX", profile: "BIZ", d: "Stand M 12 -> E 57 | 🇺🇸 返程" },

    // === Day 17 (Preighter UK) ===
    "LX486": { day: "Day 17-1", r: "LSZH-EGLL", dist: 420, type: "CGO", profile: "MEDICAL", d: "Stand E 57 -> 233 | 📦 客改貨 (倫敦)" },
    "LX446": { day: "Day 17-2", r: "EGLL-LSZH", dist: 420, type: "PAX", profile: "BIZ", d: "Stand 233 -> B 39 | 🇬🇧 返程" },

    // === Day 18 ===
    "LX351": { day: "Day 18-1", r: "LSZH-LFPG", dist: 265, type: "PAX", profile: "BIZ", d: "Stand B 39 -> A 1 | 🇫🇷 巴黎" },
    "LX841": { day: "Day 18-2", r: "LFPG-LSZH", dist: 265, type: "PAX", profile: "BIZ", d: "Stand A 1 -> B 35 | 🇫🇷 返程" },

    // === Day 19 ===
    "LX621": { day: "Day 19-1", r: "LSZH-LEMD", dist: 805, type: "PAX", profile: "BIZ", d: "Stand B 35 -> 159 | 🇪🇺 伊比利半島" },
    "LX120": { day: "Day 19-2", r: "LEMD-LSZH", dist: 805, type: "PAX", profile: "BIZ", d: "Stand 159 -> B 34 | 🇪🇺 返程" },

    // === Day 20 (Miami Leisure) ===
    "LX818": { day: "Day 20-1", r: "LSZH-KMIA", dist: 4200, type: "PAX", profile: "LEISURE", d: "Stand B 34 -> H 12 | 🏖️ 佛州假期 (高行李量)" },
    "LX398": { day: "Day 20-2", r: "KMIA-LSZH", dist: 4200, type: "PAX", profile: "BIZ", d: "Stand H 12 -> E 56 | 🇺🇸 返程" },

    // === Day 21 ===
    "LX360": { day: "Day 21-1", r: "LSZH-EDDF", dist: 160, type: "PAX", profile: "BIZ", d: "Stand E 56 -> B 48 | 🇩🇪 法蘭克福短程" },
    "LX517": { day: "Day 21-2", r: "EDDF-LSZH", dist: 160, type: "PAX", profile: "BIZ", d: "Stand B 48 -> B 35 | 🇩🇪 返程" },

    // === Day 22 (Preighter) ===
    "LX136": { day: "Day 22-1", r: "LSZH-LFPG", dist: 265, type: "CGO", profile: "MEDICAL", d: "Stand B 35 -> E 32 | 📦 客改貨" },
    "LX166": { day: "Day 22-2", r: "LFPG-LSZH", dist: 265, type: "PAX", profile: "BIZ", d: "Stand E 32 -> B 43 | 🇫🇷 返程" },

    // === Day 23 (Greece) ===
    "LX108": { day: "Day 23-1", r: "LSZH-LGAV", dist: 910, type: "PAX", profile: "BIZ", d: "Stand B 43 -> A 42 | 🇬🇷 雅典" },
    "LX871": { day: "Day 23-2", r: "LGAV-LSZH", dist: 910, type: "PAX", profile: "BIZ", d: "Stand A 42 -> B 34 | 🇬🇷 返程" },

    // === Day 24 (China) ===
    "LX937": { day: "Day 24-1", r: "LSZH-ZBAA", dist: 4400, type: "PAX", profile: "BIZ", d: "Stand B 34 -> 611 | 🇨🇳 北京" },
    "LX856": { day: "Day 24-2", r: "ZBAA-LSZH", dist: 4400, type: "PAX", profile: "BIZ", d: "Stand 611 -> E 35 | 🇨🇳 返程" },

    // === Day 25 ===
    "LX110": { day: "Day 25-1", r: "LSZH-LFPG", dist: 265, type: "PAX", profile: "BIZ", d: "Stand E 35 -> C 2 | 🇫🇷 巴黎" },
    "LX602": { day: "Day 25-2", r: "LFPG-LSZH", dist: 265, type: "PAX", profile: "BIZ", d: "Stand C 2 -> B 38 | 🇫🇷 返程" },

    // === Day 26 ===
    "LX193": { day: "Day 26-1", r: "LSZH-LGAV", dist: 910, type: "PAX", profile: "BIZ", d: "Stand B 38 -> A 50 | 🇬🇷 雅典連線" },
    "LX866": { day: "Day 26-2", r: "LGAV-LSZH", dist: 910, type: "PAX", profile: "BIZ", d: "Stand A 50 -> B 35 | 🇬🇷 返程" },

    // === Day 27 (UK) ===
    "LX332": { day: "Day 27-1", r: "LSZH-EGLL", dist: 420, type: "PAX", profile: "BIZ", d: "Stand B 35 -> 251 | 🇬🇧 希斯洛" },
    "LX405": { day: "Day 27-2", r: "EGLL-LSZH", dist: 420, type: "PAX", profile: "BIZ", d: "Stand 251 -> B 39 | 🇬🇧 返程" },

    // === Day 28 (Miami Leisure) ===
    "LX383": { day: "Day 28-1", r: "LSZH-KMIA", dist: 4200, type: "PAX", profile: "LEISURE", d: "Stand B 39 -> E 30 | 🏖️ 邁阿密" },
    "LX282": { day: "Day 28-2", r: "KMIA-LSZH", dist: 4200, type: "PAX", profile: "BIZ", d: "Stand E 30 -> E 43 | 🇺🇸 返程" },

    // === Day 29 (Preighter) ===
    "LX321": { day: "Day 29-1", r: "LSZH-LGAV", dist: 910, type: "CGO", profile: "MEDICAL", d: "Stand E 43 -> 2F | 📦 客改貨" },
    "LX604": { day: "Day 29-2", r: "LGAV-LSZH", dist: 910, type: "PAX", profile: "BIZ", d: "Stand 2F -> B 39 | 🇬🇷 返程" },

    // === Day 30 (Preighter) ===
    "LX244": { day: "Day 30-1", r: "LSZH-LIRF", dist: 380, type: "CGO", profile: "MEDICAL", d: "Stand B 39 -> 822 | 📦 客改貨" },
    "LX568": { day: "Day 30-2", r: "LIRF-LSZH", dist: 380, type: "PAX", profile: "BIZ", d: "Stand 822 -> B 43 | 🇮🇹 返程" }
};
