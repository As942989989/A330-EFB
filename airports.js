// ==========================================
// 🌍 TK A330 全球航點資料庫 (Full Version)
// ==========================================
// 包含：標高 (Elev ft), 跑道長度 (Len ft), 航向 (Hdg)
// 更新：v22.0 (Complete Database)

window.airportDB = {
    // === 土耳其國內 (Domestic) ===
    "LTFM": { name: "Istanbul", elev: 325, runways: { 
        "34L": {len: 12303, hdg: 343}, "16R": {len: 12303, hdg: 163},
        "34R": {len: 12303, hdg: 343}, "16L": {len: 12303, hdg: 163},
        "35L": {len: 13451, hdg: 353}, "17R": {len: 13451, hdg: 173},
        "35R": {len: 12303, hdg: 353}, "17L": {len: 12303, hdg: 173},
        "36":  {len: 12303, hdg: 353}, "18":  {len: 12303, hdg: 173} 
    }},
    "LTAI": { name: "Antalya", elev: 177, runways: { 
        "18C": {len: 11155, hdg: 179}, "36C": {len: 11155, hdg: 359},
        "18L": {len: 9810, hdg: 179},  "36R": {len: 9810, hdg: 359},
        "18R": {len: 9810, hdg: 179},  "36L": {len: 9810, hdg: 359}
    }},
    "LTBJ": { name: "Izmir", elev: 410, runways: { 
        "16L": {len: 10630, hdg: 164}, "34R": {len: 10630, hdg: 344},
        "16R": {len: 10630, hdg: 164}, "34L": {len: 10630, hdg: 344} 
    }},
    "LTFE": { name: "Milas-Bodrum", elev: 20, runways: { 
        "10": {len: 9843, hdg: 104}, "28": {len: 9843, hdg: 284} 
    }},
    "LTCG": { name: "Trabzon", elev: 104, runways: { 
        "11": {len: 8661, hdg: 108}, "29": {len: 8661, hdg: 288} 
    }},

    // === 歐洲 (Europe) ===
    "EGLL": { name: "London Heathrow", elev: 83, runways: { 
        "09L": {len: 12799, hdg: 90}, "27R": {len: 12799, hdg: 270},
        "09R": {len: 12008, hdg: 90}, "27L": {len: 12008, hdg: 270} 
    }},
    "EGKK": { name: "London Gatwick", elev: 203, runways: { 
        "08R": {len: 10879, hdg: 80}, "26L": {len: 10879, hdg: 260},
        "08L": {len: 8415, hdg: 80},  "26R": {len: 8415, hdg: 260} 
    }},
    "EGCC": { name: "Manchester", elev: 257, runways: { 
        "05L": {len: 10000, hdg: 51}, "23R": {len: 10000, hdg: 231},
        "05R": {len: 10000, hdg: 51}, "23L": {len: 10000, hdg: 231} 
    }},
    "EGBB": { name: "Birmingham", elev: 325, runways: { 
        "15": {len: 10013, hdg: 149}, "33": {len: 10013, hdg: 329} 
    }},
    "EGPH": { name: "Edinburgh", elev: 135, runways: { 
        "06": {len: 8386, hdg: 62}, "24": {len: 8386, hdg: 242} 
    }},
    "EIDW": { name: "Dublin", elev: 242, runways: { 
        "10R": {len: 8652, hdg: 99}, "28L": {len: 8652, hdg: 279},
        "10L": {len: 10171, hdg: 99}, "28R": {len: 10171, hdg: 279},
        "16":  {len: 6791, hdg: 159}, "34":  {len: 6791, hdg: 339} 
    }},
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
    "EDDL": { name: "Dusseldorf", elev: 147, runways: { 
        "05R": {len: 9843, hdg: 53}, "23L": {len: 9843, hdg: 233},
        "05L": {len: 8858, hdg: 53}, "23R": {len: 8858, hdg: 233} 
    }},
    "EDDH": { name: "Hamburg", elev: 53, runways: { 
        "05": {len: 10712, hdg: 48}, "23": {len: 10712, hdg: 228},
        "15": {len: 11975, hdg: 154}, "33": {len: 11975, hdg: 334} 
    }},
    "EDDB": { name: "Berlin", elev: 157, runways: { 
        "07L": {len: 12631, hdg: 67}, "25R": {len: 12631, hdg: 247},
        "07R": {len: 13123, hdg: 67}, "25L": {len: 13123, hdg: 247} 
    }},
    "EDDK": { name: "Cologne", elev: 302, runways: { 
        "14L": {len: 12516, hdg: 136}, "32R": {len: 12516, hdg: 316},
        "14R": {len: 6112, hdg: 136},  "32L": {len: 6112, hdg: 316},
        "06":  {len: 8068, hdg: 63},   "24":  {len: 8068, hdg: 243} 
    }},
    "EDDS": { name: "Stuttgart", elev: 1267, runways: { 
        "07": {len: 10974, hdg: 72}, "25": {len: 10974, hdg: 252} 
    }},
    "EDDV": { name: "Hannover", elev: 183, runways: { 
        "09L": {len: 12467, hdg: 90}, "27R": {len: 12467, hdg: 270},
        "09R": {len: 7677, hdg: 90},  "27L": {len: 7677, hdg: 270} 
    }},
    "EDDN": { name: "Nuremberg", elev: 1046, runways: { 
        "10": {len: 8858, hdg: 100}, "28": {len: 8858, hdg: 280} 
    }},
    "LFPG": { name: "Paris CDG", elev: 392, runways: { 
        "08L": {len: 13829, hdg: 86}, "26R": {len: 13829, hdg: 266},
        "08R": {len: 8858, hdg: 86},  "26L": {len: 8858, hdg: 266},
        "09L": {len: 9514, hdg: 86},  "27R": {len: 9514, hdg: 266},
        "09R": {len: 13780, hdg: 86}, "27L": {len: 13780, hdg: 266} 
    }},
    "LFMN": { name: "Nice", elev: 12, runways: { 
        "04L": {len: 8432, hdg: 43}, "22R": {len: 8432, hdg: 223},
        "04R": {len: 9744, hdg: 43}, "22L": {len: 9744, hdg: 223} 
    }},
    "LFML": { name: "Marseille", elev: 74, runways: { 
        "13L": {len: 11483, hdg: 134}, "31R": {len: 11483, hdg: 314},
        "13R": {len: 7776, hdg: 134},  "31L": {len: 7776, hdg: 314} 
    }},
    "LFBO": { name: "Toulouse", elev: 499, runways: { 
        "14L": {len: 9843, hdg: 143}, "32R": {len: 9843, hdg: 323},
        "14R": {len: 11483, hdg: 143}, "32L": {len: 11483, hdg: 323} 
    }},
    "EHAM": { name: "Amsterdam", elev: -11, runways: { 
        "06": {len: 11483, hdg: 58},  "24": {len: 11483, hdg: 238},
        "09": {len: 11329, hdg: 87},  "27": {len: 11329, hdg: 267},
        "18L": {len: 11155, hdg: 183}, "36R": {len: 11155, hdg: 3},
        "18C": {len: 10827, hdg: 183}, "36C": {len: 10827, hdg: 3},
        "18R": {len: 12467, hdg: 183}, "36L": {len: 12467, hdg: 3} 
    }},
    "EBBR": { name: "Brussels", elev: 184, runways: { 
        "01": {len: 9783, hdg: 8},   "19": {len: 9783, hdg: 188},
        "07L": {len: 10535, hdg: 69}, "25R": {len: 10535, hdg: 249},
        "07R": {len: 11936, hdg: 69}, "25L": {len: 11936, hdg: 249} 
    }},
    "LSZH": { name: "Zurich", elev: 1416, runways: { 
        "10": {len: 8202, hdg: 103}, "28": {len: 8202, hdg: 283},
        "14": {len: 10827, hdg: 136}, "32": {len: 10827, hdg: 316},
        "16": {len: 12139, hdg: 157}, "34": {len: 12139, hdg: 337} 
    }},
    "LSGG": { name: "Geneva", elev: 1411, runways: { 
        "04": {len: 12795, hdg: 44}, "22": {len: 12795, hdg: 224} 
    }},
    "LFSB": { name: "Basel", elev: 885, runways: { 
        "15": {len: 12795, hdg: 154}, "33": {len: 12795, hdg: 334},
        "08": {len: 5971, hdg: 80},   "26": {len: 5971, hdg: 260}
    }},
    "LOWW": { name: "Vienna", elev: 600, runways: { 
        "11": {len: 11483, hdg: 113}, "29": {len: 11483, hdg: 293},
        "16": {len: 11811, hdg: 164}, "34": {len: 11811, hdg: 344} 
    }},
    "EKCH": { name: "Copenhagen", elev: 17, runways: { 
        "04L": {len: 11811, hdg: 42}, "22R": {len: 11811, hdg: 222},
        "04R": {len: 10827, hdg: 42}, "22L": {len: 10827, hdg: 222},
        "12": {len: 9186, hdg: 122},  "30": {len: 9186, hdg: 302} 
    }},
    "ESSA": { name: "Stockholm Arlanda", elev: 137, runways: { 
        "01L": {len: 10830, hdg: 7}, "19R": {len: 10830, hdg: 187},
        "01R": {len: 8202, hdg: 7},  "19L": {len: 8202, hdg: 187},
        "08": {len: 8202, hdg: 77},  "26": {len: 8202, hdg: 257} 
    }},
    "EFHK": { name: "Helsinki", elev: 179, runways: { 
        "04L": {len: 10039, hdg: 44}, "22R": {len: 10039, hdg: 224},
        "04R": {len: 11286, hdg: 44}, "22L": {len: 11286, hdg: 224},
        "15": {len: 9514, hdg: 148},  "33": {len: 9514, hdg: 328} 
    }},
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
    "LEVC": { name: "Valencia", elev: 240, runways: { 
        "12": {len: 10548, hdg: 118}, "30": {len: 10548, hdg: 298} 
    }},
    "LPPT": { name: "Lisbon", elev: 374, runways: { 
        "03": {len: 12484, hdg: 27}, "21": {len: 12484, hdg: 207},
        "17": {len: 7890, hdg: 168}, "35": {len: 7890, hdg: 348} 
    }},
    "LPPR": { name: "Porto", elev: 228, runways: { 
        "17": {len: 11417, hdg: 168}, "35": {len: 11417, hdg: 348} 
    }},
    "LIRF": { name: "Rome FCO", elev: 14, runways: { 
        "07": {len: 10850, hdg: 73},  "25": {len: 10850, hdg: 253},
        "16L": {len: 12795, hdg: 164}, "34R": {len: 12795, hdg: 344},
        "16R": {len: 12795, hdg: 164}, "34L": {len: 12795, hdg: 344} 
    }},
    "LIMC": { name: "Milan Malpensa", elev: 768, runways: { 
        "17L": {len: 12861, hdg: 173}, "35R": {len: 12861, hdg: 353},
        "17R": {len: 12861, hdg: 173}, "35L": {len: 12861, hdg: 353} 
    }},
    "LIPZ": { name: "Venice", elev: 7, runways: { 
        "04L": {len: 9121, hdg: 43}, "22R": {len: 9121, hdg: 223},
        "04R": {len: 10827, hdg: 43}, "22L": {len: 10827, hdg: 223} 
    }},
    "LICC": { name: "Catania", elev: 39, runways: { 
        "08": {len: 8064, hdg: 78}, "26": {len: 8064, hdg: 258} 
    }},
    "LGAV": { name: "Athens", elev: 308, runways: { 
        "03L": {len: 12467, hdg: 34}, "21R": {len: 12467, hdg: 214},
        "03R": {len: 13123, hdg: 34}, "21L": {len: 13123, hdg: 214} 
    }},
    "LKPR": { name: "Prague", elev: 1247, runways: { 
        "06": {len: 12188, hdg: 63}, "24": {len: 12188, hdg: 243},
        "12": {len: 10663, hdg: 123}, "30": {len: 10663, hdg: 303} 
    }},
    "EPWA": { name: "Warsaw", elev: 361, runways: { 
        "11": {len: 9186, hdg: 109}, "29": {len: 9186, hdg: 289},
        "15": {len: 12106, hdg: 154}, "33": {len: 12106, hdg: 334} 
    }},
    "LQSA": { name: "Sarajevo", elev: 1675, runways: { 
        "11": {len: 8530, hdg: 114}, "29": {len: 8530, hdg: 294} 
    }},
    "LWSK": { name: "Skopje", elev: 781, runways: { 
        "16": {len: 9678, hdg: 162}, "34": {len: 9678, hdg: 342} 
    }},

    // === 俄羅斯與獨立國協 (CIS) ===
    "UUDD": { name: "Moscow DME", elev: 588, runways: { 
        "14L": {len: 12444, hdg: 137}, "32R": {len: 12444, hdg: 317},
        "14R": {len: 11483, hdg: 137}, "32L": {len: 11483, hdg: 317} 
    }},
    "UNNT": { name: "Novosibirsk", elev: 365, runways: { 
        "07": {len: 11795, hdg: 72}, "25": {len: 11795, hdg: 252},
        "16": {len: 11811, hdg: 161}, "34": {len: 11811, hdg: 341} 
    }},
    "UWWW": { name: "Samara", elev: 476, runways: { 
        "05": {len: 9843, hdg: 50}, "23": {len: 9843, hdg: 230},
        "15": {len: 9843, hdg: 151}, "33": {len: 9843, hdg: 331} 
    }},
    "UAAA": { name: "Almaty", elev: 2235, runways: { 
        "05L": {len: 14436, hdg: 52}, "23R": {len: 14436, hdg: 232},
        "05R": {len: 14764, hdg: 52}, "23L": {len: 14764, hdg: 232} 
    }},
    "UCFM": { name: "Bishkek", elev: 2058, runways: { 
        "08": {len: 10499, hdg: 80}, "26": {len: 10499, hdg: 260} 
    }},
    "UTAA": { name: "Ashgabat", elev: 692, runways: { 
        "11": {len: 12467, hdg: 108}, "29": {len: 12467, hdg: 288},
        "12L": {len: 12467, hdg: 117}, "30R": {len: 12467, hdg: 297},
        "12R": {len: 9843, hdg: 117}, "30L": {len: 9843, hdg: 297} 
    }},
    "UBBB": { name: "Baku", elev: 10, runways: { 
        "16": {len: 13123, hdg: 160}, "34": {len: 13123, hdg: 340},
        "17": {len: 10499, hdg: 174}, "35": {len: 10499, hdg: 354} 
    }},

    // === 中東 (Middle East) ===
    "OEJN": { name: "Jeddah", elev: 48, runways: { 
        "16C": {len: 10823, hdg: 161}, "34C": {len: 10823, hdg: 341},
        "16L": {len: 12303, hdg: 161}, "34R": {len: 12303, hdg: 341},
        "16R": {len: 13123, hdg: 161}, "34L": {len: 13123, hdg: 341} 
    }},
    "OERK": { name: "Riyadh", elev: 2049, runways: { 
        "15L": {len: 13796, hdg: 151}, "33R": {len: 13796, hdg: 331},
        "15R": {len: 13796, hdg: 151}, "33L": {len: 13796, hdg: 331} 
    }},
    "OEMA": { name: "Medina", elev: 2151, runways: { 
        "17": {len: 14239, hdg: 168}, "35": {len: 14239, hdg: 348},
        "18": {len: 9941, hdg: 180},  "36": {len: 9941, hdg: 360} 
    }},
    "OEDF": { name: "Dammam", elev: 50, runways: { 
        "16L": {len: 13123, hdg: 160}, "34R": {len: 13123, hdg: 340},
        "16R": {len: 13123, hdg: 160}, "34L": {len: 13123, hdg: 340} 
    }},
    "OEBA": { name: "Taif", elev: 4839, runways: { 
        "07": {len: 12467, hdg: 69}, "25": {len: 12467, hdg: 249} 
    }},
    "OEYN": { name: "Yanbu", elev: 26, runways: { 
        "10": {len: 10564, hdg: 99}, "28": {len: 10564, hdg: 279} 
    }},
    "OEGS": { name: "Gassim", elev: 2126, runways: { 
        "15": {len: 9843, hdg: 153}, "33": {len: 9843, hdg: 333} 
    }},
    "OETR": { name: "Tabuk", elev: 2548, runways: { 
        "13": {len: 10991, hdg: 128}, "31": {len: 10991, hdg: 308} 
    }},
    "OMDB": { name: "Dubai", elev: 62, runways: { 
        "12L": {len: 13123, hdg: 119}, "30R": {len: 13123, hdg: 299},
        "12R": {len: 14590, hdg: 119}, "30L": {len: 14590, hdg: 299} 
    }},
    "OMAA": { name: "Abu Dhabi", elev: 88, runways: { 
        "13L": {len: 13451, hdg: 129}, "31R": {len: 13451, hdg: 309},
        "13R": {len: 13451, hdg: 129}, "31L": {len: 13451, hdg: 309} 
    }},
    "OTHH": { name: "Doha", elev: 11, runways: { 
        "16L": {len: 15912, hdg: 156}, "34R": {len: 15912, hdg: 336},
        "16R": {len: 13944, hdg: 156}, "34L": {len: 13944, hdg: 336} 
    }},
    "OKKK": { name: "Kuwait", elev: 206, runways: { 
        "15L": {len: 11483, hdg: 152}, "33R": {len: 11483, hdg: 332},
        "15R": {len: 15650, hdg: 152}, "33L": {len: 15650, hdg: 332} 
    }},
    "OBBI": { name: "Bahrain", elev: 6, runways: { 
        "12L": {len: 12992, hdg: 123}, "30R": {len: 12992, hdg: 303},
        "12R": {len: 8300, hdg: 123},  "30L": {len: 8300, hdg: 303} 
    }},
    "OOMS": { name: "Muscat", elev: 48, runways: { 
        "08L": {len: 11755, hdg: 78}, "26R": {len: 11755, hdg: 258},
        "08R": {len: 13123, hdg: 78}, "26L": {len: 13123, hdg: 258} 
    }},
    "OJAI": { name: "Amman", elev: 2395, runways: { 
        "08L": {len: 12008, hdg: 78}, "26R": {len: 12008, hdg: 258},
        "08R": {len: 12008, hdg: 78}, "26L": {len: 12008, hdg: 258} 
    }},
    "OIIE": { name: "Tehran IKA", elev: 3305, runways: { 
        "11L": {len: 13773, hdg: 109}, "29R": {len: 13773, hdg: 289},
        "11R": {len: 13921, hdg: 109}, "29L": {len: 13921, hdg: 289} 
    }},

    // === 亞洲 (Asia) ===
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
    "ZGGG": { name: "Guangzhou", elev: 50, runways: { 
        "01":  {len: 11811, hdg: 13},  "19":  {len: 11811, hdg: 193},
        "02L": {len: 12467, hdg: 23},  "20R": {len: 12467, hdg: 203},
        "02R": {len: 12467, hdg: 23},  "20L": {len: 12467, hdg: 203} 
    }},
    "ZGSZ": { name: "Shenzhen", elev: 20, runways: { 
        "15": {len: 11155, hdg: 151}, "33": {len: 11155, hdg: 331},
        "16": {len: 12467, hdg: 156}, "34": {len: 12467, hdg: 336} 
    }},
    "VHHH": { name: "Hong Kong", elev: 28, runways: { 
        "07L": {len: 12467, hdg: 73}, "25R": {len: 12467, hdg: 253},
        "07R": {len: 12467, hdg: 73}, "25L": {len: 12467, hdg: 253},
        "07C": {len: 12467, hdg: 73}, "25C": {len: 12467, hdg: 253}
    }},
    "RCTP": { name: "Taipei", elev: 106, runways: { 
        "05L": {len: 12008, hdg: 53}, "23R": {len: 12008, hdg: 233},
        "05R": {len: 12467, hdg: 53}, "23L": {len: 12467, hdg: 233} 
    }},
    "RJTT": { name: "Tokyo Haneda", elev: 21, runways: { 
        "16L": {len: 9843, hdg: 157}, "34R": {len: 9843, hdg: 337},
        "16R": {len: 8202, hdg: 157}, "34L": {len: 8202, hdg: 337},
        "04":  {len: 8202, hdg: 40},  "22":  {len: 8202, hdg: 220},
        "05":  {len: 8202, hdg: 52},  "23":  {len: 8202, hdg: 232} 
    }},
    "RJAA": { name: "Tokyo Narita", elev: 135, runways: { 
        "16L": {len: 8202, hdg: 156}, "34R": {len: 8202, hdg: 336},
        "16R": {len: 13123, hdg: 156}, "34L": {len: 13123, hdg: 336} 
    }},
    "RKSI": { name: "Seoul Incheon", elev: 23, runways: { 
        "15L": {len: 12303, hdg: 156}, "33R": {len: 12303, hdg: 336},
        "15R": {len: 12303, hdg: 156}, "33L": {len: 12303, hdg: 336},
        "16":  {len: 13123, hdg: 164}, "34":  {len: 13123, hdg: 344} 
    }},
    "WSSS": { name: "Singapore", elev: 22, runways: { 
        "02L": {len: 13123, hdg: 23}, "20R": {len: 13123, hdg: 203},
        "02C": {len: 13123, hdg: 23}, "20C": {len: 13123, hdg: 203},
        "02R": {len: 8990, hdg: 23},  "20L": {len: 8990, hdg: 203} 
    }},
    "VTBS": { name: "Bangkok BKK", elev: 5, runways: { 
        "01L": {len: 12139, hdg: 13}, "19R": {len: 12139, hdg: 193},
        "01R": {len: 13123, hdg: 13}, "19L": {len: 13123, hdg: 193} 
    }},
    "WIII": { name: "Jakarta", elev: 34, runways: { 
        "07L": {len: 11811, hdg: 72}, "25R": {len: 11811, hdg: 252},
        "07R": {len: 12008, hdg: 72}, "25L": {len: 12008, hdg: 252} 
    }},
    "WADD": { name: "Bali", elev: 14, runways: { 
        "09": {len: 9843, hdg: 90}, "27": {len: 9843, hdg: 270} 
    }},
    "VVTS": { name: "Ho Chi Minh", elev: 33, runways: { 
        "07L": {len: 10000, hdg: 72}, "25R": {len: 10000, hdg: 252},
        "07R": {len: 12467, hdg: 72}, "25L": {len: 12467, hdg: 252} 
    }},
    "RPLL": { name: "Manila", elev: 75, runways: { 
        "06": {len: 12254, hdg: 61}, "24": {len: 12254, hdg: 241},
        "13": {len: 8530, hdg: 136}, "31": {len: 8530, hdg: 316} 
    }},
    "VRMM": { name: "Male", elev: 6, runways: { 
        "18": {len: 11155, hdg: 181}, "36": {len: 11155, hdg: 1} 
    }},
    "VCBI": { name: "Colombo", elev: 27, runways: { 
        "04": {len: 11007, hdg: 42}, "22": {len: 11007, hdg: 222} 
    }},
    "VNKT": { name: "Kathmandu", elev: 4390, runways: { 
        "02": {len: 9925, hdg: 21}, "20": {len: 9925, hdg: 201} 
    }},
    "VABB": { name: "Mumbai", elev: 37, runways: { 
        "09": {len: 12008, hdg: 91}, "27": {len: 12008, hdg: 271},
        "14": {len: 9557, hdg: 140}, "32": {len: 9557, hdg: 320} 
    }},
    "OPLA": { name: "Lahore", elev: 712, runways: { 
        "18L": {len: 10991, hdg: 182}, "36R": {len: 10991, hdg: 2},
        "18R": {len: 8999, hdg: 182}, "36L": {len: 8999, hdg: 2} 
    }},
    "OPKC": { name: "Karachi", elev: 100, runways: { 
        "07L": {len: 11155, hdg: 73}, "25R": {len: 11155, hdg: 253},
        "07R": {len: 10500, hdg: 73}, "25L": {len: 10500, hdg: 253} 
    }},
    "ZMCK": { name: "Ulaanbaatar", elev: 4482, runways: { 
        "11": {len: 11811, hdg: 112}, "29": {len: 11811, hdg: 292} 
    }},

    // === 非洲 (Africa) ===
    "HECA": { name: "Cairo", elev: 382, runways: { 
        "05C": {len: 13120, hdg: 53}, "23C": {len: 13120, hdg: 233},
        "05L": {len: 10830, hdg: 53}, "23R": {len: 10830, hdg: 233},
        "05R": {len: 13120, hdg: 53}, "23L": {len: 13120, hdg: 233} 
    }},
    "HEGN": { name: "Hurghada", elev: 52, runways: { 
        "16L": {len: 13123, hdg: 160}, "34R": {len: 13123, hdg: 340},
        "16R": {len: 13123, hdg: 160}, "34L": {len: 13123, hdg: 340} 
    }},
    "FACT": { name: "Cape Town", elev: 151, runways: { 
        "01": {len: 10502, hdg: 13}, "19": {len: 10502, hdg: 193},
        "16": {len: 5577, hdg: 164}, "34": {len: 5577, hdg: 344} 
    }},
    "FAOR": { name: "Johannesburg", elev: 5558, runways: { 
        "03L": {len: 14495, hdg: 34}, "21R": {len: 14495, hdg: 214},
        "03R": {len: 11155, hdg: 34}, "21L": {len: 11155, hdg: 214} 
    }},
    "FALE": { name: "Durban", elev: 295, runways: { 
        "06": {len: 12139, hdg: 61}, "24": {len: 12139, hdg: 241} 
    }},
    "HAAB": { name: "Addis Ababa", elev: 7656, runways: { 
        "07L": {len: 12467, hdg: 71}, "25R": {len: 12467, hdg: 251},
        "07R": {len: 12139, hdg: 71}, "25L": {len: 12139, hdg: 251} 
    }},
    "HKJK": { name: "Nairobi", elev: 5327, runways: { 
        "06": {len: 13507, hdg: 57}, "24": {len: 13507, hdg: 237} 
    }},
    "HKMO": { name: "Mombasa", elev: 200, runways: { 
        "03": {len: 10991, hdg: 26}, "21": {len: 10991, hdg: 206} 
    }},
    "HTDA": { name: "Dar Es Salaam", elev: 182, runways: { 
        "05": {len: 9843, hdg: 48}, "23": {len: 9843, hdg: 228},
        "14": {len: 5577, hdg: 138}, "32": {len: 5577, hdg: 318} 
    }},
    "HTZA": { name: "Zanzibar", elev: 54, runways: { 
        "18": {len: 9908, hdg: 181}, "36": {len: 9908, hdg: 1} 
    }},
    "HTKJ": { name: "Kilimanjaro", elev: 2932, runways: { 
        "09": {len: 11811, hdg: 88}, "27": {len: 11811, hdg: 268} 
    }},
    "DNAA": { name: "Abuja", elev: 1123, runways: { 
        "04": {len: 11844, hdg: 43}, "22": {len: 11844, hdg: 223} 
    }},
    "DNPO": { name: "Port Harcourt", elev: 87, runways: { 
        "03": {len: 9846, hdg: 31}, "21": {len: 9846, hdg: 211} 
    }},
    "DGAA": { name: "Accra", elev: 205, runways: { 
        "03": {len: 11165, hdg: 28}, "21": {len: 11165, hdg: 208} 
    }},
    "GOBD": { name: "Dakar", elev: 291, runways: { 
        "01": {len: 10171, hdg: 10}, "19": {len: 10171, hdg: 190} 
    }},
    "DIAP": { name: "Abidjan", elev: 21, runways: { 
        "03": {len: 8858, hdg: 30}, "21": {len: 8858, hdg: 210} 
    }},
    "FKKD": { name: "Douala", elev: 33, runways: { 
        "12": {len: 9347, hdg: 120}, "30": {len: 9347, hdg: 300} 
    }},
    "FKYS": { name: "Yaounde", elev: 2277, runways: { 
        "01": {len: 11155, hdg: 8}, "19": {len: 11155, hdg: 188} 
    }},
    "FZAA": { name: "Kinshasa", elev: 1027, runways: { 
        "06": {len: 13123, hdg: 58}, "24": {len: 13123, hdg: 238} 
    }},
    "FOOL": { name: "Libreville", elev: 39, runways: { 
        "16": {len: 9843, hdg: 161}, "34": {len: 9843, hdg: 341} 
    }},
    "FNLU": { name: "Luanda", elev: 243, runways: { 
        "05": {len: 12139, hdg: 52}, "23": {len: 12139, hdg: 232},
        "07": {len: 8202, hdg: 72},  "25": {len: 8202, hdg: 252} 
    }},
    "HRYR": { name: "Kigali", elev: 4891, runways: { 
        "10": {len: 11483, hdg: 98}, "28": {len: 11483, hdg: 278} 
    }},
    "DAAG": { name: "Algiers", elev: 82, runways: { 
        "05": {len: 11483, hdg: 50}, "23": {len: 11483, hdg: 230},
        "09": {len: 11483, hdg: 90}, "27": {len: 11483, hdg: 270} 
    }},
    "GMMN": { name: "Casablanca", elev: 656, runways: { 
        "17L": {len: 12139, hdg: 169}, "35R": {len: 12139, hdg: 349},
        "17R": {len: 12139, hdg: 169}, "35L": {len: 12139, hdg: 349} 
    }},
    "HLLM": { name: "Mitiga", elev: 36, runways: { 
        "11": {len: 11099, hdg: 107}, "29": {len: 11099, hdg: 287},
        "03": {len: 5905, hdg: 28},   "21": {len: 5905, hdg: 208} 
    }},
    "FIMP": { name: "Mauritius", elev: 186, runways: { 
        "14": {len: 11056, hdg: 137}, "32": {len: 11056, hdg: 317} 
    }},
    "FSIA": { name: "Seychelles", elev: 10, runways: { 
        "13": {len: 9800, hdg: 129}, "31": {len: 9800, hdg: 309} 
    }},
    "FMMI": { name: "Antananarivo", elev: 4198, runways: { 
        "11": {len: 10171, hdg: 111}, "29": {len: 10171, hdg: 291} 
    }},
    "GABS": { name: "Bamako", elev: 1247, runways: { 
        "06": {len: 10443, hdg: 62}, "24": {len: 10443, hdg: 242} 
    }},
    "DFFD": { name: "Ouagadougou", elev: 1037, runways: { 
        "04L": {len: 9918, hdg: 42}, "22R": {len: 9918, hdg: 222},
        "04R": {len: 6243, hdg: 42}, "22L": {len: 6243, hdg: 222} 
    }},
    "FGSL": { name: "Malabo", elev: 76, runways: { 
        "04": {len: 9646, hdg: 40}, "22": {len: 9646, hdg: 220} 
    }},

    // === 美洲 (Americas) ===
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
    "KIAD": { name: "Washington Dulles", elev: 312, runways: { 
        "01C": {len: 11500, hdg: 11}, "19C": {len: 11500, hdg: 191},
        "01L": {len: 9400, hdg: 11},  "19R": {len: 9400, hdg: 191},
        "01R": {len: 11500, hdg: 11}, "19L": {len: 11500, hdg: 191},
        "12":  {len: 10501, hdg: 125}, "30":  {len: 10501, hdg: 305} 
    }},
    "KORD": { name: "Chicago O'Hare", elev: 668, runways: { 
        "10L": {len: 13000, hdg: 93}, "28R": {len: 13000, hdg: 273},
        "09C": {len: 11245, hdg: 93}, "27C": {len: 11245, hdg: 273},
        "10C": {len: 10800, hdg: 93}, "28C": {len: 10800, hdg: 273},
        "09R": {len: 7500, hdg: 93},  "27L": {len: 7500, hdg: 273},
        "04R": {len: 8075, hdg: 44},  "22L": {len: 8075, hdg: 224},
        "09L": {len: 7967, hdg: 93},  "27R": {len: 7967, hdg: 273} 
    }},
    "KATL": { name: "Atlanta", elev: 1026, runways: { 
        "09L": {len: 12390, hdg: 95}, "27R": {len: 12390, hdg: 275},
        "08L": {len: 9000, hdg: 95},  "26R": {len: 9000, hdg: 275},
        "09R": {len: 9000, hdg: 95},  "27L": {len: 9000, hdg: 275},
        "08R": {len: 10000, hdg: 95}, "26L": {len: 10000, hdg: 275},
        "10":  {len: 9000, hdg: 95},  "28":  {len: 9000, hdg: 275} 
    }},
    "KMIA": { name: "Miami", elev: 9, runways: { 
        "08R": {len: 10506, hdg: 92}, "26L": {len: 10506, hdg: 272},
        "09":  {len: 13016, hdg: 92}, "27":  {len: 13016, hdg: 272},
        "12":  {len: 9355, hdg: 124}, "30":  {len: 9355, hdg: 304},
        "08L": {len: 8600, hdg: 92},  "26R": {len: 8600, hdg: 272} 
    }},
    "KIAH": { name: "Houston", elev: 97, runways: { 
        "15L": {len: 12001, hdg: 151}, "33R": {len: 12001, hdg: 331},
        "15R": {len: 10000, hdg: 151}, "33L": {len: 10000, hdg: 331},
        "08L": {len: 9000, hdg: 87},   "26R": {len: 9000, hdg: 267},
        "08R": {len: 9402, hdg: 87},   "26L": {len: 9402, hdg: 267},
        "09":  {len: 10000, hdg: 87},  "27":  {len: 10000, hdg: 267} 
    }},
    "CYYZ": { name: "Toronto", elev: 569, runways: { 
        "05":  {len: 11120, hdg: 57},  "23":  {len: 11120, hdg: 237},
        "15L": {len: 11050, hdg: 157}, "33R": {len: 11050, hdg: 337},
        "15R": {len: 9088, hdg: 157},  "33L": {len: 9088, hdg: 337},
        "06L": {len: 9697, hdg: 66},   "24R": {len: 9697, hdg: 246},
        "06R": {len: 9000, hdg: 66},   "24L": {len: 9000, hdg: 246} 
    }},
    "CYUL": { name: "Montreal", elev: 118, runways: { 
        "06L": {len: 11000, hdg: 68}, "24R": {len: 11000, hdg: 248},
        "06R": {len: 9600, hdg: 68},  "24L": {len: 9600, hdg: 248} 
    }},
    "CYVR": { name: "Vancouver", elev: 14, runways: { 
        "08L": {len: 9940, hdg: 89},  "26R": {len: 9940, hdg: 269},
        "08R": {len: 11500, hdg: 89}, "26L": {len: 11500, hdg: 269} 
    }},
    "SBGR": { name: "Sao Paulo", elev: 2461, runways: { 
        "09L": {len: 12140, hdg: 93}, "27R": {len: 12140, hdg: 273},
        "09R": {len: 9843, hdg: 93},  "27L": {len: 9843, hdg: 273} 
    }},
    "SAEZ": { name: "Buenos Aires", elev: 86, runways: { 
        "11": {len: 10827, hdg: 106}, "29": {len: 10827, hdg: 286},
        "17": {len: 8858, hdg: 167},  "35": {len: 8858, hdg: 347} 
    }},
    "SKBO": { name: "Bogota", elev: 8360, runways: { 
        "13L": {len: 12467, hdg: 135}, "31R": {len: 12467, hdg: 315},
        "13R": {len: 12467, hdg: 136}, "31L": {len: 12467, hdg: 316} 
    }},
    "MPTO": { name: "Panama City", elev: 135, runways: { 
        "03L": {len: 8799, hdg: 30}, "21R": {len: 8799, hdg: 210},
        "03R": {len: 10007, hdg: 30}, "21L": {len: 10007, hdg: 210} 
    }},
    "SVMI": { name: "Caracas", elev: 234, runways: { 
        "10": {len: 11483, hdg: 98}, "28": {len: 11483, hdg: 278},
        "09": {len: 10827, hdg: 88}, "27": {len: 10827, hdg: 268} 
    }},
    "MUHA": { name: "Havana", elev: 210, runways: { 
        "06": {len: 13123, hdg: 58}, "24": {len: 13123, hdg: 238} 
    }}
};
