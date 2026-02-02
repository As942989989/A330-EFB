// ==========================================
// ✈️ SWISS (LX) Master Route Database v4.7
// ==========================================

window.routeDB = {
    // ----------------------------------------------------
    // 1. [無中生有] 特殊航班生成規則
    // ----------------------------------------------------
    rules: {
        maintenancePattern: "LX9###", // 維修飛渡
        baselPattern: "LX7###",       // 巴塞爾維修
        charterPattern: "LX8###"      // 包機
    },

    // ----------------------------------------------------
    // 2. [內建隱藏菜單] 包機航點池
    // ----------------------------------------------------
    charters: [
        { dest: "VRMM", time: 540, name: "Maldives (Male)" },
        { dest: "EFRO", time: 210, name: "Rovaniemi (Lapland)" },
        { dest: "FACT", time: 690, name: "Cape Town" },
        { dest: "HEGN", time: 260, name: "Hurghada" },
        { dest: "LGRP", time: 180, name: "Rhodes" }
    ],

    // ----------------------------------------------------
    // 3. [真實資料] 定期航班 (含客改貨熱點)
    // ----------------------------------------------------
    regular: [
        // === 🇨🇭 樞紐接駁 ===
        {
            route: "LSZH-LSGG", time: 45, type: "SHUTTLE",
            outbound: [2800, 2802, 2804, 2806, 2808, 2810, 2812, 2814, 2816, 2818], 
            inbound: [2801, 2803, 2805, 2807, 2809, 2811, 2813, 2815, 2817, 2819]
        },
        
        // === 🇺🇸 北美長程 (Cargo Hotspots) ===
        // isCargoHotspot: true 代表這條線可能觸發 "客艙載貨" 模式
        { route: "LSZH-KJFK", time: 530, type: "LONG", outbound: [14, 16], inbound: [15, 17], isCargoHotspot: true },
        { route: "LSZH-KEWR", time: 540, type: "LONG", outbound: [18], inbound: [19] },
        { route: "LSZH-KBOS", time: 500, type: "LONG", outbound: [52], inbound: [53] },
        { route: "LSZH-KORD", time: 600, type: "LONG", outbound: [8], inbound: [9], isCargoHotspot: true },
        { route: "LSZH-KMIA", time: 630, type: "LONG", outbound: [64], inbound: [65] },
        { route: "LSZH-KIAD", time: 560, type: "LONG", outbound: [72], inbound: [73] },
        { route: "LSZH-CYUL", time: 490, type: "LONG", outbound: [86], inbound: [87], isCargoHotspot: true },
        { route: "LSZH-CYYZ", time: 510, type: "LONG", outbound: [80], inbound: [81] },
        
        // === 🌏 亞洲/中東 (Cargo Hotspots) ===
        { route: "LSZH-VABB", time: 460, type: "LONG", outbound: [154], inbound: [155], isCargoHotspot: true },
        { route: "LSZH-HECA", time: 240, type: "LONG", outbound: [238], inbound: [239] },

        // 日內瓦長程
        { route: "LSGG-KJFK", time: 520, type: "LONG", outbound: [22], inbound: [23] },

        // === 🇪🇺 歐洲短程 ===
        { route: "LSZH-EGLL", time: 105, type: "SHORT", outbound: [316, 318, 324, 326, 332, 338], inbound: [317, 319, 325, 327, 333, 339] },
        { route: "LSZH-LFPG", time: 85,  type: "SHORT", outbound: [632, 638, 646, 656], inbound: [633, 639, 647, 657] },
        { route: "LSZH-EDDF", time: 60,  type: "SHORT", outbound: [1068, 1072, 1074, 1076], inbound: [1069, 1073, 1075, 1077] },
        { route: "LSZH-EDDB", time: 85,  type: "SHORT", outbound: [974, 980, 982], inbound: [977, 981, 983] },
        { route: "LSZH-LIRF", time: 90,  type: "SHORT", outbound: [1726, 1732, 1736], inbound: [1727, 1733, 1737] },
        { route: "LSZH-LEMD", time: 145, type: "SHORT", outbound: [2020, 2026, 2032], inbound: [2021, 2027, 2033] },
        { route: "LSZH-EIDW", time: 135, type: "SHORT", outbound: [400, 404], inbound: [401, 405] },
        { route: "LSZH-EHAM", time: 95,  type: "SHORT", outbound: [724, 728, 734, 736], inbound: [729, 735, 737] },
        { route: "LSZH-LGAV", time: 160, type: "SHORT", outbound: [1830, 1838, 1842], inbound: [1831, 1839, 1843] },
        { route: "LSZH-LPPT", time: 170, type: "SHORT", outbound: [2084, 2086], inbound: [2085, 2087] },
        { route: "LSZH-LEBL", time: 105, type: "SHORT", outbound: [1950, 1952, 1954, 1956], inbound: [1955] }, 
        
        // 日內瓦歐洲線
        { route: "LSGG-EGLL", time: 100, type: "SHORT", outbound: [352, 354, 358], inbound: [353, 355, 359] },
        { route: "LSGG-LEBL", time: 90,  type: "SHORT", outbound: [1942, 1946], inbound: [1943, 1947] },
        { route: "LSGG-LPPT", time: 160, type: "SHORT", outbound: [2092], inbound: [2093] }
    ],

    // ----------------------------------------------------
    // 4. [鎖鏈任務] 第五航權
    // ----------------------------------------------------
    chains: [
        {
            name: "Middle East Connection", base: "LSZH",
            outbound: [
                { flt: "LX242", dep: "LSZH", arr: "OMDB", time: 370 },
                { flt: "LX242", dep: "OMDB", arr: "OOMS", time: 65 }
            ],
            inbound: [
                { flt: "LX243", dep: "OOMS", arr: "OMDB", time: 70 },
                { flt: "LX243", dep: "OMDB", arr: "LSZH", time: 400 }
            ]
        }
    ]
};
