// ==========================================
// 🌍 TK A330 全球航點資料庫 (Swiss & Network Focus)
// ==========================================
// 包含：標高 (Elev ft), 跑道長度 (Len ft), 航向 (Hdg)
// 說明：專注於瑞士基地、歐洲航點與洲際長程

window.airportDB = {
    // === 🇨🇭 瑞士與基地 (Home & Maintenance) ===
    "LSZH": { name: "Zurich", elev: 1416, runways: { 
        "16": {len: 12139, hdg: 157}, "34": {len: 12139, hdg: 337},
        "14": {len: 10827, hdg: 136}, "32": {len: 10827, hdg: 316},
        "10": {len: 8202, hdg: 103},  "28": {len: 8202, hdg: 283} 
    }},
    "LSGG": { name: "Geneva", elev: 1411, runways: { 
        "04": {len: 12795, hdg: 44}, "22": {len: 12795, hdg: 224} 
    }},
    "LFSB": { name: "Basel", elev: 885, runways: { 
        "15": {len: 12795, hdg: 154}, "33": {len: 12795, hdg: 334},
        "08": {len: 5971, hdg: 80},   "26": {len: 5971, hdg: 260}
    }},

    // === 🇪🇺 西歐與南歐 (Western & Southern Europe) ===
    // 🇬🇧 英國 / 🇮🇪 愛爾蘭
    "EGLL": { name: "London Heathrow", elev: 83, runways: { 
        "09L": {len: 12799, hdg: 90}, "27R": {len: 12799, hdg: 270},
        "09R": {len: 12008, hdg: 90}, "27L": {len: 12008, hdg: 270} 
    }},
    "EGCC": { name: "Manchester", elev: 257, runways: { 
        "05L": {len: 10000, hdg: 51}, "23R": {len: 10000, hdg: 231},
        "05R": {len: 10000, hdg: 51}, "23L": {len: 10000, hdg: 231} 
    }},
    "EIDW": { name: "Dublin", elev: 242, runways: { 
        "10R": {len: 8652, hdg: 99}, "28L": {len: 8652, hdg: 279},
        "10L": {len: 10171, hdg: 99}, "28R": {len: 10171, hdg: 279},
        "16":  {len: 6791, hdg: 159}, "34":  {len: 6791, hdg: 339} 
    }},
    
    // 🇫🇷 法國
    "LFPG": { name: "Paris CDG", elev: 392, runways: { 
        "08L": {len: 13829, hdg: 86}, "26R": {len: 13829, hdg: 266},
        "08R": {len: 8858, hdg: 86},  "26L": {len: 8858, hdg: 266},
        "09L": {len: 9514, hdg: 86},  "27R": {len: 9514, hdg: 266},
        "09R": {len: 13780, hdg: 86}, "27L": {len: 13780, hdg: 266} 
    }},
    "LFBD": { name: "Bordeaux", elev: 162, runways: { 
        "05": {len: 10171, hdg: 49}, "23": {len: 10171, hdg: 229},
        "11": {len: 7923, hdg: 107}, "29": {len: 7923, hdg: 287}
    }},

    // 🇪🇸 西班牙 / 🇵🇹 葡萄牙
    "LEMD": { name: "Madrid", elev: 2000, runways: { 
        "14L": {len: 11483, hdg: 143}, "32R": {len: 11483, hdg: 323},
        "14R": {len: 13711, hdg: 143}, "32L": {len: 13711, hdg: 323},
        "18L": {len: 11483, hdg: 183}, "36R": {len: 11483, hdg: 3},
        "18R": {len: 13711, hdg: 183}, "36L": {len: 13711, hdg: 3} 
    }},
    "LEBL": { name: "Barcelona", elev: 14, runways: { 
        "06L": {len: 10997, hdg: 65}, "24R": {len: 10997, hdg: 245},
        "06R": {len: 8727, hdg: 65},  "24L": {len: 8727, hdg: 245},
        "02": {len: 8284, hdg: 20},   "20": {len: 8284, hdg: 200} 
    }},
    "LEMG": { name: "Malaga", elev: 52, runways: { 
        "12": {len: 9022, hdg: 118}, "30": {len: 9022, hdg: 298},
        "13": {len: 10500, hdg: 130}, "31": {len: 10500, hdg: 310} 
    }},
    "LEPA": { name: "Palma de Mallorca", elev: 24, runways: { 
        "06L": {len: 10728, hdg: 59}, "24R": {len: 10728, hdg: 239},
        "06R": {len: 9842, hdg: 59},  "24L": {len: 9842, hdg: 239}
    }},
    "LEIB": { name: "Ibiza", elev: 24, runways: { 
        "06": {len: 9186, hdg: 60}, "24": {len: 9186, hdg: 240}
    }},
    "LEZL": { name: "Seville", elev: 112, runways: { 
        "09": {len: 11043, hdg: 88}, "27": {len: 11043, hdg: 268}
    }},
    "LPPT": { name: "Lisbon", elev: 374, runways: { 
        "03": {len: 12484, hdg: 27}, "21": {len: 12484, hdg: 207},
        "17": {len: 7890, hdg: 168}, "35": {len: 7890, hdg: 348} 
    }},
    "LPPR": { name: "Porto", elev: 228, runways: { 
        "17": {len: 11417, hdg: 168}, "35": {len: 11417, hdg: 348} 
    }},

    // 🇮🇹 義大利 / 🇳🇱 荷蘭 / 🇬🇷 希臘
    "LIRF": { name: "Rome FCO", elev: 14, runways: { 
        "07": {len: 10850, hdg: 73},  "25": {len: 10850, hdg: 253},
        "16L": {len: 12795, hdg: 164}, "34R": {len: 12795, hdg: 344},
        "16R": {len: 12795, hdg: 164}, "34L": {len: 12795, hdg: 344} 
    }},
    "EHAM": { name: "Amsterdam", elev: -11, runways: { 
        "06": {len: 11483, hdg: 58},  "24": {len: 11483, hdg: 238},
        "09": {len: 11329, hdg: 87},  "27": {len: 11329, hdg: 267},
        "18L": {len: 11155, hdg: 183}, "36R": {len: 11155, hdg: 3},
        "18C": {len: 10827, hdg: 183}, "36C": {len: 10827, hdg: 3},
        "18R": {len: 12467, hdg: 183}, "36L": {len: 12467, hdg: 3} 
    }},
    "LGAV": { name: "Athens", elev: 308, runways: { 
        "03L": {len: 12467, hdg: 34}, "21R": {len: 12467, hdg: 214},
        "03R": {len: 13123, hdg: 34}, "21L": {len: 13123, hdg: 214} 
    }},
    "LGRP": { name: "Rhodes", elev: 19, runways: { 
        "07": {len: 10846, hdg: 65}, "25": {len: 10846, hdg: 245}
    }},

    // === 🇪🇺 中歐、北歐與東歐 (Central, Northern & Eastern Europe) ===
    // 🇩🇪 德國
    "EDDF": { name: "Frankfurt", elev: 364, runways: { 
        "07C": {len: 13123, hdg: 69}, "25C": {len: 13123, hdg: 249},
        "07R": {len: 13123, hdg: 69}, "25L": {len: 13123, hdg: 249},
        "07L": {len: 9186, hdg: 69},  "25R": {len: 9186, hdg: 249},
        "18":  {len: 13123, hdg: 179} 
    }},
    "EDDM": { name: "Munich", elev: 1487, runways: { 
        "08L": {len: 13123, hdg: 82}, "26R": {len: 13123, hdg: 262},
        "08R": {len: 13123, hdg: 82}, "26L": {len: 13123, hdg: 262} 
    }},
    "EDDB": { name: "Berlin", elev: 157, runways: { 
        "07L": {len: 12631, hdg: 67}, "25R": {len: 12631, hdg: 247},
        "07R": {len: 13123, hdg: 67}, "25L": {len: 13123, hdg: 247} 
    }},
    "EDDH": { name: "Hamburg", elev: 53, runways: { 
        "05": {len: 10712, hdg: 48}, "23": {len: 10712, hdg: 228},
        "15": {len: 11975, hdg: 154}, "33": {len: 11975, hdg: 334} 
    }},
    "EDDS": { name: "Stuttgart", elev: 1267, runways: { 
        "07": {len: 10974, hdg: 72}, "25": {len: 10974, hdg: 252} 
    }},
    
    // 🇮🇸 冰島 / 🇦🇿 亞塞拜然 / 🇷🇺 俄羅斯
    "BIKF": { name: "Keflavik", elev: 171, runways: { 
        "01": {len: 10020, hdg: 11}, "19": {len: 10020, hdg: 191},
        "10": {len: 10056, hdg: 101}, "28": {len: 10056, hdg: 281}
    }},
    "UBBB": { name: "Baku", elev: 10, runways: { 
        "16": {len: 13123, hdg: 160}, "34": {len: 13123, hdg: 340},
        "17": {len: 10499, hdg: 174}, "35": {len: 10499, hdg: 354} 
    }},
    "UUDD": { name: "Moscow DME", elev: 588, runways: { 
        "14L": {len: 12444, hdg: 137}, "32R": {len: 12444, hdg: 317},
        "14R": {len: 11483, hdg: 137}, "32L": {len: 11483, hdg: 317} 
    }},

    // === 🇺🇸/🇨🇦 北美洲 (North America) ===
    "KJFK": { name: "New York JFK", elev: 13, runways: { 
        "13R": {len: 14511, hdg: 134}, "31L": {len: 14511, hdg: 314},
        "04L": {len: 12079, hdg: 44},  "22R": {len: 12079, hdg: 224},
        "13L": {len: 10000, hdg: 134}, "31R": {len: 10000, hdg: 314},
        "04R": {len: 8400, hdg: 44},   "22L": {len: 8400, hdg: 224} 
    }},
    "KEWR": { name: "Newark", elev: 18, runways: { 
        "04L": {len: 11000, hdg: 39}, "22R": {len: 11000, hdg: 219},
        "04R": {len: 10000, hdg: 39}, "22L": {len: 10000, hdg: 219},
        "11":  {len: 6726, hdg: 109}, "29":  {len: 6726, hdg: 289} 
    }},
    "KBOS": { name: "Boston", elev: 20, runways: { 
        "04R": {len: 10005, hdg: 35}, "22L": {len: 10005, hdg: 215},
        "15R": {len: 10083, hdg: 151}, "33L": {len: 10083, hdg: 331},
        "04L": {len: 7861, hdg: 35},  "22R": {len: 7861, hdg: 215},
        "09":  {len: 7000, hdg: 92},  "27":  {len: 7000, hdg: 272} 
    }},
    "KORD": { name: "Chicago O'Hare", elev: 668, runways: { 
        "10L": {len: 13000, hdg: 93}, "28R": {len: 13000, hdg: 273},
        "09C": {len: 11245, hdg: 93}, "27C": {len: 11245, hdg: 273},
        "10C": {len: 10800, hdg: 93}, "28C": {len: 10800, hdg: 273},
        "09R": {len: 7500, hdg: 93},  "27L": {len: 7500, hdg: 273},
        "04R": {len: 8075, hdg: 44},  "22L": {len: 8075, hdg: 224},
        "09L": {len: 7967, hdg: 93},  "27R": {len: 7967, hdg: 273} 
    }},
    "KMIA": { name: "Miami", elev: 9, runways: { 
        "08R": {len: 10506, hdg: 92}, "26L": {len: 10506, hdg: 272},
        "09":  {len: 13016, hdg: 92}, "27":  {len: 13016, hdg: 272},
        "12":  {len: 9355, hdg: 124}, "30":  {len: 9355, hdg: 304},
        "08L": {len: 8600, hdg: 92},  "26R": {len: 8600, hdg: 272} 
    }},
    "KIAD": { name: "Washington Dulles", elev: 312, runways: { 
        "01C": {len: 11500, hdg: 11}, "19C": {len: 11500, hdg: 191},
        "01L": {len: 9400, hdg: 11},  "19R": {len: 9400, hdg: 191},
        "01R": {len: 11500, hdg: 11}, "19L": {len: 11500, hdg: 191},
        "12":  {len: 10501, hdg: 125}, "30":  {len: 10501, hdg: 305} 
    }},
    "CYUL": { name: "Montreal", elev: 118, runways: { 
        "06L": {len: 11000, hdg: 68}, "24R": {len: 11000, hdg: 248},
        "06R": {len: 9600, hdg: 68},  "24L": {len: 9600, hdg: 248} 
    }},
    "CYYZ": { name: "Toronto", elev: 569, runways: { 
        "05":  {len: 11120, hdg: 57},  "23":  {len: 11120, hdg: 237},
        "15L": {len: 11050, hdg: 157}, "33R": {len: 11050, hdg: 337},
        "15R": {len: 9088, hdg: 157},  "33L": {len: 9088, hdg: 337},
        "06L": {len: 9697, hdg: 66},   "24R": {len: 9697, hdg: 246},
        "06R": {len: 9000, hdg: 66},   "24L": {len: 9000, hdg: 246} 
    }},

    // === 🌏 中東、亞洲與非洲 (Middle East, Asia & Africa) ===
    "OMDB": { name: "Dubai", elev: 62, runways: { 
        "12L": {len: 13123, hdg: 119}, "30R": {len: 13123, hdg: 299},
        "12R": {len: 14590, hdg: 119}, "30L": {len: 14590, hdg: 299} 
    }},
    "OOMS": { name: "Muscat", elev: 48, runways: { 
        "08L": {len: 11755, hdg: 78}, "26R": {len: 11755, hdg: 258},
        "08R": {len: 13123, hdg: 78}, "26L": {len: 13123, hdg: 258} 
    }},
    "VABB": { name: "Mumbai", elev: 37, runways: { 
        "09": {len: 12008, hdg: 91}, "27": {len: 12008, hdg: 271},
        "14": {len: 9557, hdg: 140}, "32": {len: 9557, hdg: 320} 
    }},
    "OJAI": { name: "Amman", elev: 2395, runways: { 
        "08L": {len: 12008, hdg: 78}, "26R": {len: 12008, hdg: 258},
        "08R": {len: 12008, hdg: 78}, "26L": {len: 12008, hdg: 258} 
    }},
    "HECA": { name: "Cairo", elev: 382, runways: { 
        "05C": {len: 13120, hdg: 53}, "23C": {len: 13120, hdg: 233},
        "05L": {len: 10830, hdg: 53}, "23R": {len: 10830, hdg: 233},
        "05R": {len: 13120, hdg: 53}, "23L": {len: 13120, hdg: 233} 
    }},
    "HEGN": { name: "Hurghada", elev: 52, runways: { 
        "16L": {len: 13123, hdg: 160}, "34R": {len: 13123, hdg: 340},
        "16R": {len: 13123, hdg: 160}, "34L": {len: 13123, hdg: 340} 
    }},
    "ZBAA": { name: "Beijing Capital", elev: 116, runways: { 
        "18L": {len: 12467, hdg: 179}, "36R": {len: 12467, hdg: 359},
        "18R": {len: 14993, hdg: 179}, "36L": {len: 14993, hdg: 359},
        "01":  {len: 12467, hdg: 12},  "19":  {len: 12467, hdg: 192} 
    }},
    "ZSPD": { name: "Shanghai Pudong", elev: 13, runways: { 
        "16L": {len: 12467, hdg: 161}, "34R": {len: 12467, hdg: 341},
        "16R": {len: 12467, hdg: 161}, "34L": {len: 12467, hdg: 341},
        "17L": {len: 13123, hdg: 172}, "35R": {len: 13123, hdg: 352},
        "17R": {len: 11155, hdg: 172}, "35L": {len: 11155, hdg: 352} 
    }},
    "ZSNJ": { name: "Nanjing", elev: 49, runways: { 
        "06": {len: 11811, hdg: 60}, "24": {len: 11811, hdg: 240},
        "07": {len: 11811, hdg: 70}, "25": {len: 11811, hdg: 250}
    }}
};
