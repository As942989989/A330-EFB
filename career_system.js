// ==========================================
// 📅 A330 Career System (Generator Logic v4.0)
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
    
    // --- 核心：生成整月班表 ---
    generateMonth: function() {
        let roster = {};
        let dayCounter = 1;
        
        // 如果是新開局，確保位置在基地
        if (Generator.state.history.length === 0) Generator.state.location = Generator.state.base;

        let currentLocation = Generator.state.location;
        let currentMaint = Generator.state.maintCounter;

        while (dayCounter <= 30) {
            // 1. 強制維修邏輯 (每 100 小時)
            if (currentMaint >= 100) {
                if (currentLocation !== "LSZH") {
                    // 如果不在基地，必須飛回 LSZH
                    let ferry = Generator.createMaintFlight(dayCounter, currentLocation, "LSZH");
                    roster[`day_${dayCounter}`] = ferry;
                    currentLocation = "LSZH";
                } else {
                    // 已在基地，進行維修 (地面停留)
                    roster[`day_${dayCounter}`] = {
                        day: dayCounter, type: "OFF", info: "🛠️ A-CHECK MAINTENANCE", location: "LSZH"
                    };
                    currentMaint = 0; // 重置維修計數
                }
                dayCounter++;
                continue;
            }

            // 2. 隨機排休 (20% 機率)
            if (Generator.rnd(1, 100) <= 20) {
                roster[`day_${dayCounter}`] = {
                    day: dayCounter, type: "OFF", info: "🏖️ OFF DAY", location: currentLocation
                };
                dayCounter++;
                continue;
            }

            // 3. 生成航班
            let flight = Generator.createFlight(dayCounter, currentLocation);
            if (flight) {
                roster[`day_${dayCounter}`] = flight;
                currentLocation = flight.dest;
                currentMaint += (flight.time / 60); // 累加飛行時數
            } else {
                // 找不到航班 (罕見)，強制休假
                roster[`day_${dayCounter}`] = {
                    day: dayCounter, type: "OFF", info: "⚠️ NO ROUTE AVAIL", location: currentLocation
                };
            }
            dayCounter++;
        }
        
        return roster;
    },

    // --- 輔助：建立單一航班 ---
    createFlight: function(day, from) {
        // 從 routeDB 尋找可用航線
        let possibleRoutes = window.routeDB.regular.filter(r => r.route.startsWith(from + "-"));
        
        // 如果沒有定期航班，嘗試生成包機或調機
        if (possibleRoutes.length === 0) {
            if (from !== "LSZH") {
                return Generator.createFerryFlight(day, from, "LSZH"); // 回基地
            }
            return null;
        }

        // 隨機選一條航線
        let routeData = possibleRoutes[Generator.rnd(0, possibleRoutes.length - 1)];
        let dest = routeData.route.split("-")[1];
        
        // 隨機選班號
        let flightNum = "LX" + routeData.outbound[Generator.rnd(0, routeData.outbound.length - 1)];
        
        // 判斷是否為客改貨 (Preighter)
        let isPreighter = (routeData.type === "LONG" && Generator.rnd(1, 100) <= 15); 
        let tags = [routeData.type];
        if (isPreighter) tags.push("PREIGHTER");

        // 分配機位 (使用新的 GateDB)
        let gate = Generator.assignGate(from, routeData.type, tags, "DEP");

        return {
            day: day,
            id: flightNum,
            r: routeData.route,
            dist: 0, // 距離會在 flight_computer 計算時補上
            time: routeData.time,
            type: isPreighter ? "CGO" : "PAX",
            profile: isPreighter ? "CARGO" : "BIZ",
            dest: dest,
            gate: gate,
            tags: tags,
            d: `${tags.join(' | ')}`
        };
    },
    
    createMaintFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        let gate = Generator.assignGate(from, "FERRY", ["MAINT"], "DEP");
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "MAINT", profile: "FERRY", dest: to, gate: gate, tags: ["MAINT", "FERRY"], d: "🛠️ MAINT FERRY"
        };
    },
    
    createFerryFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        let gate = Generator.assignGate(from, "FERRY", ["FERRY"], "DEP");
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "FERRY", profile: "FERRY", dest: to, gate: gate, tags: ["FERRY"], d: "⚠️ POSITIONING"
        };
    },

    // =======================================================
    // 🧠 智慧機位分配系統 (v4.0 - Read from gates.js)
    // =======================================================
    assignGate: function(icao, type, tags, mode) {
        // [關鍵修改] 改讀取獨立的 gateDB (gates.js)，而非 airportDB
        // 如果找不到該機場的機位資料，直接回傳 APRON
        let gateData = window.gateDB ? window.gateDB[icao] : null;
        if (!gateData) return "APRON";

        let candidates = [];
        let allGates = [];
        
        // 收集該機場所有可用機位 (Flatten Object values)
        for (let grp in gateData) allGates = allGates.concat(gateData[grp]);

        // -----------------------
        // 1. 蘇黎世 (LSZH) - 基地邏輯
        // -----------------------
        if (icao === "LSZH") {
            // 維修或客改貨 (Preighter)
            if (tags.includes("MAINT") || tags.includes("PREIGHTER")) {
                let isCargoInCabin = (tags.includes("PREIGHTER") && Generator.rnd(1,100) <= 30);
                if (isCargoInCabin) {
                    // 有載貨的客機停航廈
                    if (gateData["Dock E"]) candidates = candidates.concat(gateData["Dock E"]);
                    if (gateData["Dock B"]) candidates = candidates.concat(gateData["Dock B"]);
                } else {
                    // 純維修或過夜停遠端 (General)
                    if (gateData["General"]) candidates = candidates.concat(gateData["General"]);
                }
            } else {
                // 正常客運航班
                if (type === "LONG") {
                    // 長程線優先 Dock E (80%)，其次 Dock B (20%)
                    if (gateData["Dock E"]) candidates = candidates.concat(gateData["Dock E"]);
                    if (candidates.length === 0 || Generator.rnd(1,100) <= 20) {
                        if (gateData["Dock B"]) candidates = candidates.concat(gateData["Dock B"]);
                    }
                } else {
                    // 短程線優先 Dock B (70%)，其次 Dock E (30%)
                    if (gateData["Dock B"]) candidates = candidates.concat(gateData["Dock B"]);
                    if (candidates.length === 0 || Generator.rnd(1,100) <= 30) {
                         if (gateData["Dock E"]) candidates = candidates.concat(gateData["Dock E"]);
                    }
                }
            }
        }
        
        // -----------------------
        // 2. 日內瓦 (LSGG) - 樞紐邏輯
        // -----------------------
        else if (icao === "LSGG") {
            if (type === "LONG") {
                if (gateData["East Wing"]) candidates = candidates.concat(gateData["East Wing"]);
                if (gateData["Main Terminal"]) candidates = candidates.concat(gateData["Main Terminal"]);
            } else {
                if (gateData["Main Terminal"]) candidates = candidates.concat(gateData["Main Terminal"]);
            }
        }

        // -----------------------
        // 3. 通用外站 (Outstations)
        // -----------------------
        else {
            // 優先尋找符合星空聯盟或適合 A330 的關鍵字區域
            let prefKeys = ["Terminal 1", "Terminal 2", "Concourse A", "Main", "Dock"];
            
            // 特殊機場偏好設定
            if (icao === "EGLL") prefKeys = ["Terminal 2"]; // 希斯洛 T2 (星盟)
            if (icao === "KJFK") prefKeys = ["Terminal 1", "Terminal 4"];
            if (icao === "EDDF") prefKeys = ["Concourse A", "Concourse B"]; // 法蘭克福 (漢莎)
            if (icao === "EDDM") prefKeys = ["Terminal 2"]; // 慕尼黑 T2
            if (icao === "OMDB") prefKeys = ["Concourse D"]; 

            // 在新的 gateData 中搜尋
            for (let grp in gateData) {
                for (let key of prefKeys) {
                    if (grp.includes(key)) {
                        candidates = candidates.concat(gateData[grp]);
                    }
                }
            }
        }

        // 如果上述規則都沒找到特定機位，就開放使用該機場所有機位
        if (candidates.length === 0) candidates = allGates;
        
        // 隨機抽選一個
        if (candidates.length > 0) {
            return candidates[Generator.rnd(0, candidates.length - 1)];
        }
        
        return "APRON"; // 真的都沒有就停坪
    }
};
