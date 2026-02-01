// ==========================================
// 📅 A330 Career System (Generator Logic v4.0 FIXED)
// ==========================================
// 包含：班表生成、機位分配 (GateDB)、維修邏輯

const Generator = {
    state: {
        base: "LSZH",           // 生涯基地
        location: "LSZH",       // 目前飛機位置
        lastGate: null,         // 上一腿的停機位 (確保連貫性)
        maintCounter: 0,        // 累積維修時數
        totalHours: 0,          // 生涯總時數
        lastFlightNum: null,    // 上一腿班號
        history: []             
    },

    // 工具：隨機整數
    rnd: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // 讀取存檔
    load: () => {
        let s = localStorage.getItem('a330_career_state');
        if(s) Generator.state = JSON.parse(s);
    },
    
    // 儲存進度
    save: () => {
        localStorage.setItem('a330_career_state', JSON.stringify(Generator.state));
    },
    
    // 重置生涯
    reset: (base) => {
        Generator.state = {
            base: base || "LSZH",
            location: base || "LSZH",
            lastGate: null,
            maintCounter: 0,
            totalHours: 0,
            lastFlightNum: null,
            history: []
        };
        Generator.save();
    },
    
    // --- 核心：生成整月班表 (修正為 30 天) ---
    generateMonth: function() {
        let roster = {};
        let dayCounter = 1;
        
        // 如果是新開局，確保位置在基地
        if (Generator.state.history.length === 0) Generator.state.location = Generator.state.base;

        let currentLocation = Generator.state.location;
        let currentMaint = Generator.state.maintCounter;

        // [FIX] 這裡設定生成天數，改為 30
        while (dayCounter <= 30) {
            
            // 1. 強制維修邏輯 (每 100 小時)
            if (currentMaint >= 100) {
                if (currentLocation !== "LSZH") {
                    // 如果不在基地，必須飛回 LSZH
                    let ferry = Generator.createMaintFlight(dayCounter, currentLocation, "LSZH");
                    roster[`day_${dayCounter}`] = [ferry]; // 存為陣列以防擴充
                    currentLocation = "LSZH";
                } else {
                    // 已在基地，進行維修 (地面停留)
                    roster[`day_${dayCounter}`] = [{
                        day: dayCounter, id: "MAINT", r: "ZURICH GROUND", 
                        time: 0, type: "OFF", info: "🛠️ A-CHECK MAINTENANCE", 
                        dep: "LSZH", arr: "LSZH", tags: ["MAINT"]
                    }];
                    currentMaint = 0; // 重置維修計數
                }
                dayCounter++;
                continue;
            }

            // 2. 隨機排休 (20% 機率，但在外站時降低機率)
            let offChance = (currentLocation === "LSZH") ? 20 : 5;
            if (Generator.rnd(1, 100) <= offChance) {
                roster[`day_${dayCounter}`] = [{
                    day: dayCounter, id: "OFF", r: currentLocation, 
                    time: 0, type: "OFF", info: "🏖️ OFF DAY", 
                    dep: currentLocation, arr: currentLocation, tags: ["OFF"]
                }];
                dayCounter++;
                continue;
            }

            // 3. 生成航班
            let flight = Generator.createFlight(dayCounter, currentLocation);
            if (flight) {
                roster[`day_${dayCounter}`] = [flight]; // 存為陣列
                currentLocation = flight.arr;
                currentMaint += (flight.time / 60); // 累加飛行時數
            } else {
                // 找不到航班 (罕見)，強制休假
                roster[`day_${dayCounter}`] = [{
                    day: dayCounter, id: "ERR", r: currentLocation,
                    time: 0, type: "OFF", info: "⚠️ NO ROUTE AVAIL", 
                    dep: currentLocation, arr: currentLocation, tags: ["OFF"]
                }];
            }
            dayCounter++;
        }
        
        return roster;
    },

    // --- 輔助：建立單一航班 ---
    createFlight: function(day, from) {
        if (!window.routeDB || !window.routeDB.regular) return null;

        // 從 routeDB 尋找可用航線
        let possibleRoutes = window.routeDB.regular.filter(r => r.route.startsWith(from + "-"));
        
        // 如果沒有定期航班，嘗試生成調機回基地
        if (possibleRoutes.length === 0) {
            if (from !== "LSZH") {
                return Generator.createFerryFlight(day, from, "LSZH"); 
            }
            return null; // 已經在基地且無航班，交給上層排休
        }

        // 隨機選一條航線
        let routeData = possibleRoutes[Generator.rnd(0, possibleRoutes.length - 1)];
        
        // 隨機選班號
        let flightNum = "LX" + routeData.outbound[Generator.rnd(0, routeData.outbound.length - 1)];
        
        // 判斷是否為客改貨 (Preighter)
        let isPreighter = (routeData.type === "LONG" && Generator.rnd(1, 100) <= 15); 
        let tags = [routeData.type];
        if (isPreighter) tags.push("PREIGHTER");

        // 分配機位
        let depGate = Generator.assignGate(from, routeData.type, tags, "DEP");
        let arrIcao = routeData.route.split("-")[1];
        let arrGate = Generator.assignGate(arrIcao, routeData.type, tags, "ARR");

        return {
            day: day,
            id: flightNum,
            r: routeData.route,
            dep: from,
            arr: arrIcao,
            dist: 0, // 距離會在 flight_computer 計算時補上
            time: routeData.time,
            type: isPreighter ? "CARGO" : "PAX",
            tags: tags,
            d: isPreighter ? "PREIGHTER (CGO)" : "PASSENGER",
            depGate: depGate,
            arrGate: arrGate
        };
    },

    // --- 輔助：建立調機航班 ---
    createFerryFlight: function(day, from, to) {
        return {
            day: day,
            id: "LX99" + Generator.rnd(10, 99),
            r: `${from}-${to}`,
            dep: from,
            arr: to,
            time: 120, // 估算值
            type: "FERRY",
            tags: ["FERRY"],
            d: "FERRY FLIGHT",
            depGate: Generator.assignGate(from, "SHORT", [], "DEP"),
            arrGate: Generator.assignGate(to, "SHORT", [], "ARR")
        };
    },

    createMaintFlight: function(day, from, to) {
        let f = Generator.createFerryFlight(day, from, to);
        f.id = "LX7" + Generator.rnd(100, 999);
        f.d = "MAINT FERRY";
        f.tags.push("MAINT");
        return f;
    },

    // --- 機位分配系統 (從 GateDB 抓取) ---
    assignGate: function(icao, type, tags, mode) {
        if (!window.gateDB || !window.gateDB[icao]) return "RAMP"; // 無資料時預設

        let candidates = [];
        let gateData = window.gateDB[icao];

        // LSZH (蘇黎世) 特殊邏輯
        if (icao === "LSZH") {
            if (tags.includes("LONG") || type === "LONG") {
                 // 長程線優先使用 Dock E
                 if (gateData["Dock E"]) candidates = candidates.concat(gateData["Dock E"]);
            } else {
                 // 短程線優先使用 Dock A, B
                 if (gateData["Dock A"]) candidates = candidates.concat(gateData["Dock A"]);
                 if (gateData["Dock B"]) candidates = candidates.concat(gateData["Dock B"]);
            }
        } 
        // 一般外站邏輯
        else {
            // 將該機場所有區域的機位都加入候選
            for (let zone in gateData) {
                candidates = candidates.concat(gateData[zone]);
            }
        }

        // 如果篩選後沒有機位，使用預設
        if (candidates.length === 0) return "APRON";

        // 隨機選一個
        return candidates[Generator.rnd(0, candidates.length - 1)];
    }
};

window.Generator = Generator;
