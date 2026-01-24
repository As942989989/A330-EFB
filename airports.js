// ==========================================
// 🌍 TK A330 全球航點跑道資料庫
// ==========================================
// 說明：僅收錄適合 A330 起降之主跑道
// 單位：長度(英呎 FT), 航向(磁方位)

window.airportDB = {
    // === 土耳其國內 (Domestic / Hub) ===
    "LTFM": { name: "Istanbul (New)", runways: { 
        "35L": {len: 13451, hdg: 353}, "35R": {len: 12303, hdg: 353},
        "17L": {len: 12303, hdg: 173}, "17R": {len: 13451, hdg: 173},
        "34L": {len: 12303, hdg: 343}, "34R": {len: 12303, hdg: 343},
        "16L": {len: 12303, hdg: 163}, "16R": {len: 12303, hdg: 163}
    }},
    "LTAI": { name: "Antalya", runways: { "36C": {len: 11155, hdg: 359}, "18C": {len: 11155, hdg: 179}, "36R": {len: 9810, hdg: 359}, "18L": {len: 9810, hdg: 179} }},
    "LTBJ": { name: "Izmir", runways: { "34R": {len: 10630, hdg: 344}, "16L": {len: 10630, hdg: 164} }},
    "LTFE": { name: "Milas-Bodrum", runways: { "28": {len: 9843, hdg: 284}, "10": {len: 9843, hdg: 104} }},
    "LTCG": { name: "Trabzon", runways: { "11": {len: 8661, hdg: 108}, "29": {len: 8661, hdg: 288} }},

    // === 歐洲 (Europe) ===
    "EGLL": { name: "London Heathrow", runways: { "27L": {len: 12008, hdg: 271}, "27R": {len: 12802, hdg: 271}, "09L": {len: 12802, hdg: 91}, "09R": {len: 12008, hdg: 91} }},
    "EGKK": { name: "London Gatwick", runways: { "26L": {len: 10879, hdg: 259}, "08R": {len: 10879, hdg: 79} }},
    "EGCC": { name: "Manchester", runways: { "23R": {len: 10000, hdg: 233}, "05L": {len: 10000, hdg: 53} }},
    "EDDF": { name: "Frankfurt", runways: { "25C": {len: 13123, hdg: 249}, "07C": {len: 13123, hdg: 69}, "25L": {len: 13123, hdg: 249}, "18": {len: 13123, hdg: 179} }},
    "EDDM": { name: "Munich", runways: { "26L": {len: 13123, hdg: 263}, "08R": {len: 13123, hdg: 83}, "26R": {len: 13123, hdg: 263} }},
    "LFPG": { name: "Paris CDG", runways: { "26R": {len: 13829, hdg: 266}, "08L": {len: 13829, hdg: 86}, "27L": {len: 13780, hdg: 266}, "09R": {len: 13780, hdg: 86} }},
    "EHAM": { name: "Amsterdam", runways: { "36L": {len: 12467, hdg: 358}, "18R": {len: 12467, hdg: 178}, "24": {len: 11483, hdg: 238}, "06": {len: 11483, hdg: 58} }},
    "LSZH": { name: "Zurich", runways: { "16": {len: 12139, hdg: 158}, "34": {len: 12139, hdg: 338}, "14": {len: 10827, hdg: 138} }},
    "LOWW": { name: "Vienna", runways: { "29": {len: 11483, hdg: 292}, "11": {len: 11483, hdg: 112}, "16": {len: 11811, hdg: 163} }},
    "LEMD": { name: "Madrid", runways: { "36L": {len: 13711, hdg: 359}, "18R": {len: 13711, hdg: 179}, "32L": {len: 11483, hdg: 322} }},
    "LIRF": { name: "Rome FCO", runways: { "16R": {len: 12795, hdg: 164}, "34L": {len: 12795, hdg: 344}, "25": {len: 10850, hdg: 248} }},

    // === 亞洲 (Asia) ===
    "RCTP": { name: "Taipei", runways: { 
        "05L": {len: 12008, hdg: 53}, "23R": {len: 12008, hdg: 233},
        "05R": {len: 12467, hdg: 53}, "23L": {len: 12467, hdg: 233}
    }},
    "VHHH": { name: "Hong Kong", runways: { "07L": {len: 12467, hdg: 73}, "25R": {len: 12467, hdg: 253}, "07R": {len: 12467, hdg: 73}, "25L": {len: 12467, hdg: 253} }},
    "RJTT": { name: "Tokyo Haneda", runways: { "16L": {len: 9843, hdg: 157}, "34R": {len: 9843, hdg: 337}, "05": {len: 8202, hdg: 52} }},
    "RJAA": { name: "Tokyo Narita", runways: { "16R": {len: 13123, hdg: 156}, "34L": {len: 13123, hdg: 336} }},
    "RKSI": { name: "Seoul Incheon", runways: { "15R": {len: 12303, hdg: 156}, "33L": {len: 12303, hdg: 336}, "16": {len: 13123, hdg: 164} }},
    "VTBS": { name: "Bangkok BKK", runways: { "01R": {len: 13123, hdg: 13}, "19L": {len: 13123, hdg: 193}, "01L": {len: 12139, hdg: 13}, "19R": {len: 12139, hdg: 193} }},
    "WSSS": { name: "Singapore", runways: { "02L": {len: 13123, hdg: 23}, "20R": {len: 13123, hdg: 203}, "02C": {len: 13123, hdg: 23} }},
    "ZBAA": { name: "Beijing Capital", runways: { "36R": {len: 12467, hdg: 359}, "18L": {len: 12467, hdg: 179}, "01": {len: 12467, hdg: 12} }},
    "ZSPD": { name: "Shanghai Pudong", runways: { "35L": {len: 13123, hdg: 352}, "17R": {len: 13123, hdg: 172}, "34L": {len: 12467, hdg: 341} }},
    "ZGGG": { name: "Guangzhou", runways: { "02L": {len: 12467, hdg: 23}, "20R": {len: 12467, hdg: 203}, "01": {len: 11811, hdg: 13} }},
    "VABB": { name: "Mumbai", runways: { "27": {len: 12008, hdg: 271}, "09": {len: 12008, hdg: 91} }},

    // === 美洲 (Americas) ===
    "KJFK": { name: "New York JFK", runways: { "13R": {len: 14511, hdg: 134}, "31L": {len: 14511, hdg: 314}, "04L": {len: 12079, hdg: 44}, "22R": {len: 12079, hdg: 224} }},
    "KORD": { name: "Chicago O'Hare", runways: { "10L": {len: 13000, hdg: 93}, "28R": {len: 13000, hdg: 273}, "09R": {len: 10801, hdg: 93} }},
    "KIAH": { name: "Houston", runways: { "15L": {len: 12001, hdg: 151}, "33R": {len: 12001, hdg: 331}, "15R": {len: 10000, hdg: 151} }},
    "KMIA": { name: "Miami", runways: { "08R": {len: 10506, hdg: 92}, "26L": {len: 10506, hdg: 272}, "09": {len: 13016, hdg: 92} }},
    "CYYZ": { name: "Toronto", runways: { "05": {len: 11120, hdg: 57}, "23": {len: 11120, hdg: 237}, "15L": {len: 11050, hdg: 157} }},
    "SBGR": { name: "Sao Paulo", runways: { "09L": {len: 12139, hdg: 93}, "27R": {len: 12139, hdg: 273}, "09R": {len: 9843, hdg: 93} }},
    
    // === 中東 & CIS (Middle East & Russia) ===
    "OMDB": { name: "Dubai", runways: { "12L": {len: 13123, hdg: 119}, "30R": {len: 13123, hdg: 299}, "12R": {len: 14567, hdg: 119}, "30L": {len: 14567, hdg: 299} }},
    "OTHH": { name: "Doha", runways: { "16L": {len: 15912, hdg: 156}, "34R": {len: 15912, hdg: 336}, "16R": {len: 13944, hdg: 156} }},
    "UUDD": { name: "Moscow DME", runways: { "14L": {len: 12441, hdg: 137}, "32R": {len: 12441, hdg: 317}, "14R": {len: 11483, hdg: 137} }},
    "OEJN": { name: "Jeddah", runways: { "34L": {len: 13123, hdg: 341}, "16R": {len: 13123, hdg: 161}, "34C": {len: 10823, hdg: 341} }},
    "OIIE": { name: "Tehran IKA", runways: { "29R": {len: 13773, hdg: 289}, "11L": {len: 13773, hdg: 109} }},

    // === 非洲 (Africa) ===
    "HECA": { name: "Cairo", runways: { "05C": {len: 13123, hdg: 53}, "23C": {len: 13123, hdg: 233}, "05R": {len: 13123, hdg: 53} }},
    "FAOR": { name: "Johannesburg", runways: { "03L": {len: 14495, hdg: 34}, "21R": {len: 14495, hdg: 214}, "03R": {len: 11155, hdg: 34} }},
    "FACT": { name: "Cape Town", runways: { "01": {len: 10502, hdg: 13}, "19": {len: 10502, hdg: 193} }},
    "HAAB": { name: "Addis Ababa", runways: { "07R": {len: 12467, hdg: 71}, "25L": {len: 12467, hdg: 251} }},
    "HKJK": { name: "Nairobi", runways: { "06": {len: 13507, hdg: 57}, "24": {len: 13507, hdg: 237} }}
};
