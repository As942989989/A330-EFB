// ==========================================
// ✈️ TK A330 Dispatch Scenarios (30-Day Roster)
// ==========================================

window.flightDB = {
    // === Day 01 ===
    "LX250": { 
        day: "Day 01-1", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LSZH-LEMD", ci: 48, d: "Stand E26 -> 377 | 🇪🇺 客運 (Pax: 378)" 
    },
    "LX117": { 
        day: "Day 01-2", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LEMD-LSZH", ci: 45, d: "Stand 377 -> B 35 | 🇪🇺 返程 (Pax: 420)" 
    },

    // === Day 02 ===
    "LX462": { 
        day: "Day 02-1", type: "PAX", profile: "BIZ", dist: 380, 
        r: "LSZH-LIRF", ci: 38, d: "Stand B 35 -> 206 | 🇪🇺 客運 (Pax: 385)" 
    },
    "LX545": { 
        day: "Day 02-2", type: "PAX", profile: "BIZ", dist: 380, 
        r: "LIRF-LSZH", ci: 45, d: "Stand 206 -> B 43 | 🇪🇺 返程 (Pax: 349)" 
    },

    // === Day 03 ===
    "LX115": { 
        day: "Day 03-1", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LSZH-LFPG", ci: 33, d: "Stand B 43 -> E 10 | 🇪🇺 客運 (Pax: 331)" 
    },
    "LX448": { 
        day: "Day 03-2", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LFPG-LSZH", ci: 45, d: "Stand E 10 -> B 38 | 🇪🇺 返程 (Pax: 403)" 
    },

    // === Day 04 (Long Haul) ===
    "LX340": { 
        day: "Day 04-1", type: "PAX", profile: "BIZ", dist: 3950, 
        r: "LSZH-KORD", ci: 14, d: "Stand B 38 -> H 15 | 🇺🇸 長程客運 (Pax: 331)" 
    },
    "LX993": { 
        day: "Day 04-2", type: "PAX", profile: "BIZ", dist: 3950, 
        r: "KORD-LSZH", ci: 45, d: "Stand H 15 -> E 56 | 🇺🇸 返程 (Pax: 339)" 
    },

    // === Day 05 ===
    "LX341": { 
        day: "Day 05-1", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LSZH-LFPG", ci: 41, d: "Stand E 56 -> A 3 | 🇪🇺 客運 (Pax: 436)" 
    },
    "LX650": { 
        day: "Day 05-2", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LFPG-LSZH", ci: 45, d: "Stand A 3 -> B 38 | 🇪🇺 返程 (Pax: 347)" 
    },

    // === Day 06 (Preighter) ===
    "LX331": { 
        day: "Day 06-1", type: "CGO", profile: "MEDICAL", dist: 805, 
        r: "LSZH-LEMD", ci: 44, d: "Stand B 38 -> 211 | 📦 客改貨 (High Cargo)" 
    },
    "LX932": { 
        day: "Day 06-2", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LEMD-LSZH", ci: 45, d: "Stand 211 -> B 43 | 🇪🇺 返程 (Pax: 365)" 
    },

    // === Day 07 ===
    "LX908": { 
        day: "Day 07-1", type: "PAX", profile: "BIZ", dist: 380, 
        r: "LSZH-LIRF", ci: 38, d: "Stand B 43 -> 607 | 🇪🇺 客運 (Pax: 374)" 
    },
    "LX569": { 
        day: "Day 07-2", type: "PAX", profile: "BIZ", dist: 380, 
        r: "LIRF-LSZH", ci: 45, d: "Stand 607 -> B 35 | 🇪🇺 返程 (Pax: 412)" 
    },

    // === Day 08 (Long Haul China) ===
    "LX947": { 
        day: "Day 08-1", type: "PAX", profile: "BIZ", dist: 4400, 
        r: "LSZH-ZBAA", ci: 10, d: "Stand B 35 -> W 111 | 🇨🇳 長程客運 (Pax: 395)" 
    },
    "LX494": { 
        day: "Day 08-2", type: "PAX", profile: "BIZ", dist: 4400, 
        r: "ZBAA-LSZH", ci: 45, d: "Stand W 111 -> E 27 | 🇨🇳 返程 (Pax: 421)" 
    },

    // === Day 09 ===
    "LX168": { 
        day: "Day 09-1", type: "PAX", profile: "BIZ", dist: 330, 
        r: "LSZH-EHAM", ci: 31, d: "Stand E 27 -> G 79 | 🇪🇺 客運 (Pax: 322)" 
    },
    "LX527": { 
        day: "Day 09-2", type: "PAX", profile: "BIZ", dist: 330, 
        r: "EHAM-LSZH", ci: 45, d: "Stand G 79 -> B 35 | 🇪🇺 返程 (Pax: 318)" 
    },

    // === Day 10 (Preighter) ===
    "LX495": { 
        day: "Day 10-1", type: "CGO", profile: "MEDICAL", dist: 805, 
        r: "LSZH-LEMD", ci: 33, d: "Stand B 35 -> 604 | 📦 客改貨 (High Cargo)" 
    },
    "LX511": { 
        day: "Day 10-2", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LEMD-LSZH", ci: 45, d: "Stand 604 -> B 39 | 🇪🇺 返程 (Pax: 367)" 
    },

    // === Day 11 ===
    "LX355": { 
        day: "Day 11-1", type: "PAX", profile: "BIZ", dist: 330, 
        r: "LSZH-EHAM", ci: 50, d: "Stand B 39 -> G 9 | 🇪🇺 客運 (Pax: 422)" 
    },
    "LX778": { 
        day: "Day 11-2", type: "PAX", profile: "BIZ", dist: 330, 
        r: "EHAM-LSZH", ci: 45, d: "Stand G 9 -> B 38 | 🇪🇺 返程 (Pax: 403)" 
    },

    // === Day 12 (Long Haul Cargo) ===
    "LX276": { 
        day: "Day 12-1", type: "CGO", profile: "CARGO", dist: 3950, 
        r: "LSZH-KORD", ci: 14, d: "Stand B 38 -> SW 2 | 📦 長程貨運" 
    },
    "LX519": { 
        day: "Day 12-2", type: "PAX", profile: "BIZ", dist: 3950, 
        r: "KORD-LSZH", ci: 45, d: "Stand SW 2 -> E 19 | 🇺🇸 返程 (Pax: 371)" 
    },

    // === Day 13 ===
    "LX979": { 
        day: "Day 13-1", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LSZH-LEMD", ci: 50, d: "Stand E 19 -> 73 | 🇪🇺 客運 (Pax: 412)" 
    },
    "LX768": { 
        day: "Day 13-2", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LEMD-LSZH", ci: 45, d: "Stand 73 -> B 38 | 🇪🇺 返程 (Pax: 305)" 
    },

    // === Day 14 ===
    "LX462": { 
        day: "Day 14-1", type: "PAX", profile: "BIZ", dist: 330, 
        r: "LSZH-EHAM", ci: 48, d: "Stand B 38 -> G 3 | 🇪🇺 客運 (Pax: 302)" 
    },
    "LX846": { 
        day: "Day 14-2", type: "PAX", profile: "BIZ", dist: 330, 
        r: "EHAM-LSZH", ci: 45, d: "Stand G 3 -> B 35 | 🇪🇺 返程 (Pax: 419)" 
    },

    // === Day 15 (Preighter) ===
    "LX267": { 
        day: "Day 15-1", type: "CGO", profile: "MEDICAL", dist: 330, 
        r: "LSZH-EHAM", ci: 47, d: "Stand B 35 -> G 73 | 📦 客改貨" 
    },
    "LX204": { 
        day: "Day 15-2", type: "PAX", profile: "BIZ", dist: 330, 
        r: "EHAM-LSZH", ci: 45, d: "Stand G 73 -> B 34 | 🇪🇺 返程 (Pax: 343)" 
    },

    // === Day 16 (Long Haul) ===
    "LX641": { 
        day: "Day 16-1", type: "PAX", profile: "BIZ", dist: 3950, 
        r: "LSZH-KORD", ci: 5, d: "Stand B 34 -> M 12 | 🇺🇸 長程客運 (Pax: 289)" 
    },
    "LX996": { 
        day: "Day 16-2", type: "PAX", profile: "BIZ", dist: 3950, 
        r: "KORD-LSZH", ci: 45, d: "Stand M 12 -> E 57 | 🇺🇸 返程 (Pax: 334)" 
    },

    // === Day 17 (Preighter UK) ===
    "LX486": { 
        day: "Day 17-1", type: "CGO", profile: "MEDICAL", dist: 420, 
        r: "LSZH-EGLL", ci: 33, d: "Stand E 57 -> 233 | 📦 客改貨" 
    },
    "LX446": { 
        day: "Day 17-2", type: "PAX", profile: "BIZ", dist: 420, 
        r: "EGLL-LSZH", ci: 45, d: "Stand 233 -> B 39 | 🇬🇧 返程 (Pax: 417)" 
    },

    // === Day 18 ===
    "LX351": { 
        day: "Day 18-1", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LSZH-LFPG", ci: 32, d: "Stand B 39 -> A 1 | 🇪🇺 客運 (Pax: 391)" 
    },
    "LX841": { 
        day: "Day 18-2", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LFPG-LSZH", ci: 45, d: "Stand A 1 -> B 35 | 🇪🇺 返程 (Pax: 377)" 
    },

    // === Day 19 ===
    "LX621": { 
        day: "Day 19-1", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LSZH-LEMD", ci: 43, d: "Stand B 35 -> 159 | 🇪🇺 客運 (Pax: 419)" 
    },
    "LX120": { 
        day: "Day 19-2", type: "PAX", profile: "BIZ", dist: 805, 
        r: "LEMD-LSZH", ci: 45, d: "Stand 159 -> B 34 | 🇪🇺 返程 (Pax: 405)" 
    },

    // === Day 20 (Miami) ===
    "LX818": { 
        day: "Day 20-1", type: "PAX", profile: "LEISURE", dist: 4200, 
        r: "LSZH-KMIA", ci: 14, d: "Stand B 34 -> H 12 | 🏖️ 佛州假期 (Pax: 352)" 
    },
    "LX398": { 
        day: "Day 20-2", type: "PAX", profile: "BIZ", dist: 4200, 
        r: "KMIA-LSZH", ci: 45, d: "Stand H 12 -> E 56 | 🇺🇸 返程 (Pax: 305)" 
    },

    // === Day 21 ===
    "LX360": { 
        day: "Day 21-1", type: "PAX", profile: "BIZ", dist: 160, 
        r: "LSZH-EDDF", ci: 37, d: "Stand E 56 -> B 48 | 🇩🇪 客運 (Pax: 304)" 
    },
    "LX517": { 
        day: "Day 21-2", type: "PAX", profile: "BIZ", dist: 160, 
        r: "EDDF-LSZH", ci: 45, d: "Stand B 48 -> B 35 | 🇩🇪 返程 (Pax: 313)" 
    },

    // === Day 22 (Preighter) ===
    "LX136": { 
        day: "Day 22-1", type: "CGO", profile: "MEDICAL", dist: 265, 
        r: "LSZH-LFPG", ci: 36, d: "Stand B 35 -> E 32 | 📦 客改貨" 
    },
    "LX166": { 
        day: "Day 22-2", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LFPG-LSZH", ci: 45, d: "Stand E 32 -> B 43 | 🇪🇺 返程 (Pax: 334)" 
    },

    // === Day 23 (Athens) ===
    "LX108": { 
        day: "Day 23-1", type: "PAX", profile: "BIZ", dist: 910, 
        r: "LSZH-LGAV", ci: 49, d: "Stand B 43 -> A 42 | 🇬🇷 客運 (Pax: 354)" 
    },
    "LX871": { 
        day: "Day 23-2", type: "PAX", profile: "BIZ", dist: 910, 
        r: "LGAV-LSZH", ci: 45, d: "Stand A 42 -> B 34 | 🇬🇷 返程 (Pax: 436)" 
    },

    // === Day 24 (Long Haul China) ===
    "LX937": { 
        day: "Day 24-1", type: "PAX", profile: "BIZ", dist: 4400, 
        r: "LSZH-ZBAA", ci: 8, d: "Stand B 34 -> 611 | 🇨🇳 長程客運 (Pax: 407)" 
    },
    "LX856": { 
        day: "Day 24-2", type: "PAX", profile: "BIZ", dist: 4400, 
        r: "ZBAA-LSZH", ci: 45, d: "Stand 611 -> E 35 | 🇨🇳 返程 (Pax: 319)" 
    },

    // === Day 25 ===
    "LX110": { 
        day: "Day 25-1", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LSZH-LFPG", ci: 48, d: "Stand E 35 -> C 2 | 🇪🇺 客運 (Pax: 416)" 
    },
    "LX602": { 
        day: "Day 25-2", type: "PAX", profile: "BIZ", dist: 265, 
        r: "LFPG-LSZH", ci: 45, d: "Stand C 2 -> B 38 | 🇪🇺 返程 (Pax: 372)" 
    },

    // === Day 26 ===
    "LX193": { 
        day: "Day 26-1", type: "PAX", profile: "BIZ", dist: 910, 
        r: "LSZH-LGAV", ci: 49, d: "Stand B 38 -> A 50 | 🇬🇷 客運 (Pax: 315)" 
    },
    "LX866": { 
        day: "Day 26-2", type: "PAX", profile: "BIZ", dist: 910, 
        r: "LGAV-LSZH", ci: 45, d: "Stand A 50 -> B 35 | 🇬🇷 返程 (Pax: 352)" 
    },

    // === Day 27 ===
    "LX332": { 
        day: "Day 27-1", type: "PAX", profile: "BIZ", dist: 420, 
        r: "LSZH-EGLL", ci: 44, d: "Stand B 35 -> 251 | 🇬🇧 客運 (Pax: 373)" 
    },
    "LX405": { 
        day: "Day 27-2", type: "PAX", profile: "BIZ", dist: 420, 
        r: "EGLL-LSZH", ci: 45, d: "Stand 251 -> B 39 | 🇬🇧 返程 (Pax: 399)" 
    },

    // === Day 28 (Miami) ===
    "LX383": { 
        day: "Day 28-1", type: "PAX", profile: "LEISURE", dist: 4200, 
        r: "LSZH-KMIA", ci: 9, d: "Stand B 39 -> E 30 | 🏖️ 佛州假期 (Pax: 320)" 
    },
    "LX282": { 
        day: "Day 28-2", type: "PAX", profile: "BIZ", dist: 4200, 
        r: "KMIA-LSZH", ci: 45, d: "Stand E 30 -> E 43 | 🇺🇸 返程 (Pax: 317)" 
    },

    // === Day 29 (Preighter) ===
    "LX321": { 
        day: "Day 29-1", type: "CGO", profile: "MEDICAL", dist: 910, 
        r: "LSZH-LGAV", ci: 33, d: "Stand E 43 -> 2F | 📦 客改貨" 
    },
    "LX604": { 
        day: "Day 29-2", type: "PAX", profile: "BIZ", dist: 910, 
        r: "LGAV-LSZH", ci: 45, d: "Stand 2F -> B 39 | 🇬🇷 返程 (Pax: 376)" 
    },

    // === Day 30 (Preighter) ===
    "LX244": { 
        day: "Day 30-1", type: "CGO", profile: "MEDICAL", dist: 380, 
        r: "LSZH-LIRF", ci: 36, d: "Stand B 39 -> 822 | 📦 客改貨" 
    },
    "LX568": { 
        day: "Day 30-2", type: "PAX", profile: "BIZ", dist: 380, 
        r: "LIRF-LSZH", ci: 45, d: "Stand 822 -> B 43 | 🇮🇹 返程 (Pax: 376)" 
    }
};
