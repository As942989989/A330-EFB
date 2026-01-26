// ==========================================
// 🌍 A330-300 全球航點資料庫 (With Real Slopes)
// ==========================================
// 包含：標高 (ft), 長度 (ft), 航向, 坡度 (%)
// 更新：v26.0 Physics Ready

window.airportDB = {
    // === 🇨🇭 瑞士與基地 (Home) ===
    "LSZH": { name: "Zurich", elev: 1416, runways: { 
        "16": {len: 12139, hdg: 157, slope: -0.4}, // 下坡
        "34": {len: 12139, hdg: 337, slope: 0.4}, 
        "14": {len: 10827, hdg: 136, slope: -0.6}, // 顯著下坡
        "32": {len: 10827, hdg: 316, slope: 0.6},
        "10": {len: 8202, hdg: 103, slope: -0.1},  
        "28": {len: 8202, hdg: 283, slope: 0.1} 
    }},
    "LSGG": { name: "Geneva", elev: 1411, runways: { 
        "04": {len: 12795, hdg: 44, slope: 0.4}, 
        "22": {len: 12795, hdg: 224, slope: -0.4} 
    }},
    "LFSB": { name: "Basel", elev: 885, runways: { 
        "15": {len: 12795, hdg: 154, slope: -0.2}, 
        "33": {len: 12795, hdg: 334, slope: 0.2},
        "08": {len: 5971, hdg: 80, slope: 0.0},   
        "26": {len: 5971, hdg: 260, slope: 0.0}
    }},

    // === 🇪🇺 西歐與南歐 ===
    "EGLL": { name: "London Heathrow", elev: 83, runways: { 
        "09L": {len: 12799, hdg: 90, slope: 0.0}, 
        "27R": {len: 12799, hdg: 270, slope: 0.0},
        "09R": {len: 12008, hdg: 90, slope: 0.0}, 
        "27L": {len: 12008, hdg: 270, slope: 0.0} 
    }},
    "EGCC": { name: "Manchester", elev: 257, runways: { 
        "05L": {len: 10000, hdg: 51, slope: -0.3}, 
        "23R": {len: 10000, hdg: 231, slope: 0.3},
        "05R": {len: 10000, hdg: 51, slope: 0.1}, 
        "23L": {len: 10000, hdg: 231, slope: -0.1} 
    }},
    "EIDW": { name: "Dublin", elev: 242, runways: { 
        "10R": {len: 8652, hdg: 99, slope: -0.1}, 
        "28L": {len: 8652, hdg: 279, slope: 0.1},
        "10L": {len: 10171, hdg: 99, slope: -0.1}, 
        "28R": {len: 10171, hdg: 279, slope: 0.1}
    }},
    "LFPG": { name: "Paris CDG", elev: 392, runways: { 
        "08L": {len: 13829, hdg: 86, slope: 0.1}, "26R": {len: 13829, hdg: 266, slope: -0.1},
        "09R": {len: 13780, hdg: 86, slope: 0.0}, "27L": {len: 13780, hdg: 266, slope: 0.0} 
    }},
    "LFBD": { name: "Bordeaux", elev: 162, runways: { 
        "05": {len: 10171, hdg: 49, slope: -0.2}, "23": {len: 10171, hdg: 229, slope: 0.2},
        "11": {len: 7923, hdg: 107, slope: 0.3},  "29": {len: 7923, hdg: 287, slope: -0.3}
    }},
    "LEMD": { name: "Madrid", elev: 2000, runways: { 
        "14L": {len: 11483, hdg: 143, slope: -0.5}, "32R": {len: 11483, hdg: 323, slope: 0.5},
        "18R": {len: 13711, hdg: 183, slope: -0.3}, "36L": {len: 13711, hdg: 3, slope: 0.3} 
    }},
    "LEBL": { name: "Barcelona", elev: 14, runways: { 
        "06L": {len: 10997, hdg: 65, slope: 0.2}, "24R": {len: 10997, hdg: 245, slope: -0.2},
        "02": {len: 8284, hdg: 20, slope: 0.0},   "20": {len: 8284, hdg: 200, slope: 0.0} 
    }},
    "LEMG": { name: "Malaga", elev: 52, runways: { 
        "13": {len: 10500, hdg: 130, slope: 0.6}, "31": {len: 10500, hdg: 310, slope: -0.6} 
    }},
    "LEPA": { name: "Palma de Mallorca", elev: 24, runways: { 
        "06L": {len: 10728, hdg: 59, slope: -0.1}, "24R": {len: 10728, hdg: 239, slope: 0.1}
    }},
    "LEIB": { name: "Ibiza", elev: 24, runways: { 
        "06": {len: 9186, hdg: 60, slope: 0.0}, "24": {len: 9186, hdg: 240, slope: 0.0}
    }},
    "LEZL": { name: "Seville", elev: 112, runways: { 
        "09": {len: 11043, hdg: 88, slope: 0.1}, "27": {len: 11043, hdg: 268, slope: -0.1}
    }},
    "LPPT": { name: "Lisbon", elev: 374, runways: { 
        "03": {len: 12484, hdg: 27, slope: -0.4}, "21": {len: 12484, hdg: 207, slope: 0.4}
    }},
    "LPPR": { name: "Porto", elev: 228, runways: { 
        "17": {len: 11417, hdg: 168, slope: 0.2}, "35": {len: 11417, hdg: 348, slope: -0.2} 
    }},
    "LIRF": { name: "Rome FCO", elev: 14, runways: { 
        "16R": {len: 12795, hdg: 164, slope: -0.1}, "34L": {len: 12795, hdg: 344, slope: 0.1},
        "25": {len: 10850, hdg: 253, slope: 0.0}
    }},
    "EHAM": { name: "Amsterdam", elev: -11, runways: { 
        "06": {len: 11483, hdg: 58, slope: 0.0}, "24": {len: 11483, hdg: 238, slope: 0.0},
        "09": {len: 11329, hdg: 87, slope: 0.0}, "27": {len: 11329, hdg: 267, slope: 0.0},
        "18R": {len: 12467, hdg: 183, slope: 0.0}, "36L": {len: 12467, hdg: 3, slope: 0.0} 
    }},
    "LGAV": { name: "Athens", elev: 308, runways: { 
        "03R": {len: 13123, hdg: 34, slope: -0.2}, "21L": {len: 13123, hdg: 214, slope: 0.2} 
    }},
    "LGRP": { name: "Rhodes", elev: 19, runways: { 
        "07": {len: 10846, hdg: 65, slope: 0.3}, "25": {len: 10846, hdg: 245, slope: -0.3}
    }},

    // === 🇪🇺 中歐、北歐與東歐 ===
    "EDDF": { name: "Frankfurt", elev: 364, runways: { 
        "07C": {len: 13123, hdg: 69, slope: 0.0}, "25C": {len: 13123, hdg: 249, slope: 0.0},
        "18":  {len: 13123, hdg: 179, slope: -0.3} // RWY 18 著名下坡
    }},
    "EDDM": { name: "Munich", elev: 1487, runways: { 
        "08L": {len: 13123, hdg: 82, slope: 0.0}, "26R": {len: 13123, hdg: 262, slope: 0.0}
    }},
    "EDDB": { name: "Berlin", elev: 157, runways: { 
        "07L": {len: 12631, hdg: 67, slope: 0.1}, "25R": {len: 12631, hdg: 247, slope: -0.1}
    }},
    "EDDH": { name: "Hamburg", elev: 53, runways: { 
        "15": {len: 11975, hdg: 154, slope: 0.0}, "33": {len: 11975, hdg: 334, slope: 0.0} 
    }},
    "EDDS": { name: "Stuttgart", elev: 1267, runways: { 
        "07": {len: 10974, hdg: 72, slope: -0.7}, "25": {len: 10974, hdg: 252, slope: 0.7} // 顯著坡度
    }},
    "BIKF": { name: "Keflavik", elev: 171, runways: { 
        "01": {len: 10020, hdg: 11, slope: 0.3}, "19": {len: 10020, hdg: 191, slope: -0.3}
    }},
    "UBBB": { name: "Baku", elev: 10, runways: { 
        "16": {len: 13123, hdg: 160, slope: -0.1}, "34": {len: 13123, hdg: 340, slope: 0.1}
    }},
    "UUDD": { name: "Moscow DME", elev: 588, runways: { 
        "14L": {len: 12444, hdg: 137, slope: 0.0}, "32R": {len: 12444, hdg: 317, slope: 0.0} 
    }},

    // === 🇺🇸/🇨🇦 北美洲 ===
    "KJFK": { name: "New York JFK", elev: 13, runways: { 
        "13R": {len: 14511, hdg: 134, slope: -0.1}, "31L": {len: 14511, hdg: 314, slope: 0.1},
        "04L": {len: 12079, hdg: 44, slope: 0.0},  "22R": {len: 12079, hdg: 224, slope: 0.0}
    }},
    "KEWR": { name: "Newark", elev: 18, runways: { 
        "04L": {len: 11000, hdg: 39, slope: 0.0}, "22R": {len: 11000, hdg: 219, slope: 0.0}
    }},
    "KBOS": { name: "Boston", elev: 20, runways: { 
        "04R": {len: 10005, hdg: 35, slope: 0.0}, "22L": {len: 10005, hdg: 215, slope: 0.0}
    }},
    "KORD": { name: "Chicago O'Hare", elev: 668, runways: { 
        "10L": {len: 13000, hdg: 93, slope: -0.1}, "28R": {len: 13000, hdg: 273, slope: 0.1},
        "09C": {len: 11245, hdg: 93, slope: 0.0}, "27C": {len: 11245, hdg: 273, slope: 0.0}
    }},
    "KMIA": { name: "Miami", elev: 9, runways: { 
        "08R": {len: 10506, hdg: 92, slope: 0.0}, "26L": {len: 10506, hdg: 272, slope: 0.0}
    }},
    "KIAD": { name: "Washington Dulles", elev: 312, runways: { 
        "01C": {len: 11500, hdg: 11, slope: -0.2}, "19C": {len: 11500, hdg: 191, slope: 0.2}
    }},
    "CYUL": { name: "Montreal", elev: 118, runways: { 
        "06L": {len: 11000, hdg: 68, slope: -0.1}, "24R": {len: 11000, hdg: 248, slope: 0.1}
    }},
    "CYYZ": { name: "Toronto", elev: 569, runways: { 
        "05":  {len: 11120, hdg: 57, slope: -0.3},  "23":  {len: 11120, hdg: 237, slope: 0.3},
        "15L": {len: 11050, hdg: 157, slope: -0.4}, "33R": {len: 11050, hdg: 337, slope: 0.4}
    }},

    // === 🌏 中東、亞洲與非洲 ===
    "OMDB": { name: "Dubai", elev: 62, runways: { 
        "12L": {len: 13123, hdg: 119, slope: -0.1}, "30R": {len: 13123, hdg: 299, slope: 0.1},
        "12R": {len: 14590, hdg: 119, slope: -0.1}, "30L": {len: 14590, hdg: 299, slope: 0.1} 
    }},
    "OOMS": { name: "Muscat", elev: 48, runways: { 
        "08L": {len: 11755, hdg: 78, slope: 0.2}, "26R": {len: 11755, hdg: 258, slope: -0.2} 
    }},
    "VABB": { name: "Mumbai", elev: 37, runways: { 
        "09": {len: 12008, hdg: 91, slope: 0.0}, "27": {len: 12008, hdg: 271, slope: 0.0}
    }},
    "OJAI": { name: "Amman", elev: 2395, runways: { 
        "08L": {len: 12008, hdg: 78, slope: -0.4}, "26R": {len: 12008, hdg: 258, slope: 0.4} 
    }},
    "HECA": { name: "Cairo", elev: 382, runways: { 
        "05C": {len: 13120, hdg: 53, slope: 0.1}, "23C": {len: 13120, hdg: 233, slope: -0.1}
    }},
    "HEGN": { name: "Hurghada", elev: 52, runways: { 
        "16L": {len: 13123, hdg: 160, slope: 0.3}, "34R": {len: 13123, hdg: 340, slope: -0.3}
    }},
    "ZBAA": { name: "Beijing Capital", elev: 116, runways: { 
        "18R": {len: 14993, hdg: 179, slope: 0.0}, "36L": {len: 14993, hdg: 359, slope: 0.0},
        "01":  {len: 12467, hdg: 12, slope: 0.1},  "19":  {len: 12467, hdg: 192, slope: -0.1} 
    }},
    "ZSPD": { name: "Shanghai Pudong", elev: 13, runways: { 
        "16L": {len: 12467, hdg: 161, slope: 0.0}, "34R": {len: 12467, hdg: 341, slope: 0.0},
        "17L": {len: 13123, hdg: 172, slope: 0.0}, "35R": {len: 13123, hdg: 352, slope: 0.0} 
    }},
    "ZSNJ": { name: "Nanjing", elev: 49, runways: { 
        "06": {len: 11811, hdg: 60, slope: 0.0}, "24": {len: 11811, hdg: 240, slope: 0.0}
    }}
};
