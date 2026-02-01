// ==========================================
// 📅 A330 Career System (Generator Logic v2)
// ==========================================

const Generator = {
    state: {
        base: "LSZH",           // 生涯基地
        location: "LSZH",       // 目前飛機位置
        lastGate: null,         // [New] 上一腿的停機位 (確保連貫性)
        maintCounter: 0,        // 累積維修時數
        totalHours: 0,          // 生涯總時數
        lastFlightNum: null,    // 上一腿班號
        history: []             
    },
    rnd: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    load: () => {
        let s = localStorage.getItem('a330_career_state');
        if(s) Generator.state = JSON.parse(s);
    },
    
    save: () => {
        localStorage.setItem('a330_career_state', JSON.stringify(Generator.state));
    },
    
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
    
    // --- 核心生成邏輯 ---
    generateMonth: function() {
        let roster = {};
        let dayCounter = 1;
        
        // 如果是全新生涯，先隨機給一個初始機位
        if (!Generator.state.lastGate) {
            Generator.state.lastGate = Generator.assignGate(Generator.state.location, "PAX", [], "ARR");
        }

        while(dayCounter <= 30) {
            let flight = Generator.createDailyFlight(dayCounter);
            if(flight) {
                roster[flight.id] = flight;
                
                // 更新狀態
                Generator.state.location = flight.dest;
                Generator.state.lastGate = flight.arrGate; // 紀錄落地機位供下一腿使用
                
                Generator.state.totalHours += (flight.time / 60);
                if (flight.tags.includes("MAINT")) Generator.state.maintCounter = 0; 
                else Generator.state.maintCounter += (flight.time / 60);
                
                if(!flight.tags.includes("FERRY") && !flight.tags.includes("MAINT")) {
                     Generator.state.lastFlightNum = parseInt(flight.id.replace("LX","")) || null;
                }
            }
            dayCounter++;
        }
        Generator.save();
        return roster;
    },
    
    createDailyFlight: function(day) {
        let s = Generator.state;
        let db = window.routeDB;
        let flightId = `Day ${String(day).padStart(2, '0')}`;
        
        // 1. 強制維修
        if (s.maintCounter > 500) return Generator.createMaintFlight(flightId, s.location, s.base);

        let candidates = db.regular.filter(r => r.route.startsWith(s.location));
        
        // 2. 在外站
        if (!["LSZH", "LSGG"].includes(s.location)) {
            if (s.lastFlightNum) {
                let targetNum = s.lastFlightNum % 2 === 0 ? s.lastFlightNum + 1 : s.lastFlightNum; 
                let match = candidates.find(c => c.inbound.includes(targetNum));
                if (match) return Generator.buildFlight(flightId, match, "INBOUND", targetNum);
            }
            let randomReturn = candidates[Generator.rnd(0, candidates.length - 1)];
            if(randomReturn) {
                 let fNum = randomReturn.inbound[Generator.rnd(0, randomReturn.inbound.length-1)];
                 return Generator.buildFlight(flightId, randomReturn, "INBOUND", fNum);
            }
            return Generator.createFerryFlight(flightId, s.location, s.base);
        }

        // 3. 在基地 (LSZH/LSGG)
        let dice = Generator.rnd(1, 100);
        if (dice <= 5) {
            let charterDest = db.charters[Generator.rnd(0, db.charters.length-1)];
            return Generator.createCharterFlight(flightId, s.location, charterDest);
        }

        let potentialRoutes = db.regular.filter(r => r.route.startsWith(s.location));
        if(potentialRoutes.length > 0) {
            let selectedRoute = potentialRoutes[Generator.rnd(0, potentialRoutes.length-1)];
            let fNum = selectedRoute.outbound[Generator.rnd(0, selectedRoute.outbound.length-1)];
            let isPreighter = (selectedRoute.isCargoHotspot && Generator.rnd(1, 100) <= 15);
            return Generator.buildFlight(flightId, selectedRoute, "OUTBOUND", fNum, isPreighter);
        } else {
            let targetHub = s.location === "LSZH" ? "LSGG" : "LSZH";
            return Generator.createShuttleFlight(flightId, s.location, targetHub);
        }
    },
    
    // --- 航班物件建構器 (含機位分配) ---
    buildFlight: function(id, routeData, dir, fNum, isPreighter) {
        let dest = routeData.route.split('-')[1];
        let origin = routeData.route.split('-')[0];
        
        let tags = [];
        if (routeData.type === "SHUTTLE") tags.push("SHUTTLE");
        else if (routeData.type === "LONG") tags.push("LONG");
        else tags.push("SHORT");
        if (isPreighter) tags.push("PREIGHTER"); else tags.push("PAX");

        // [New] 機位分配邏輯
        // 出發機位：如果是從目前所在地出發，強制使用上一腿的停機位 (連貫性)
        let depGate = (Generator.state.location === origin && Generator.state.lastGate) 
                      ? Generator.state.lastGate 
                      : Generator.assignGate(origin, routeData.type, tags, "DEP");
                      
        // 抵達機位：重新分配
        let arrGate = Generator.assignGate(dest, routeData.type, tags, "ARR");

        return {
            day: id, id: "LX" + fNum, r: routeData.route,
            dist: Math.round(routeData.time * 8), time: routeData.time,
            type: isPreighter ? "CGO" : "PAX", profile: isPreighter ? "CARGO" : "BIZ",
            dest: dest, tags: tags, d: `${tags.join(' | ')}`,
            depGate: depGate, arrGate: arrGate // 儲存機位
        };
    },
    
    // --- 特殊航班生成 ---
    createMaintFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        let tags = ["MAINT", "FERRY"];
        let depGate = (Generator.state.lastGate) ? Generator.state.lastGate : "APRON";
        let arrGate = Generator.assignGate(to, "SHORT", tags, "ARR"); // 維修通常去 General/Apron

        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "MAINT", profile: "FERRY", dest: to, tags: tags, d: "🛠️ MANDATORY MAINTENANCE",
            depGate: depGate, arrGate: arrGate
        };
    },
    
    createFerryFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        let tags = ["FERRY"];
        let depGate = Generator.state.lastGate || "APRON";
        let arrGate = Generator.assignGate(to, "SHORT", tags, "ARR");

        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "FERRY", profile: "FERRY", dest: to, tags: tags, d: "⚠️ POSITIONING FLIGHT",
            depGate: depGate, arrGate: arrGate
        };
    },
    
    createShuttleFlight: function(id, from, to) {
         let num = "LX" + Generator.rnd(2800, 2819);
         let tags = ["SHUTTLE", "PAX"];
         let depGate = Generator.state.lastGate || Generator.assignGate(from, "SHORT", tags, "DEP");
         let arrGate = Generator.assignGate(to, "SHORT", tags, "ARR");

         return {
            day: id, id: num, r: `${from}-${to}`, dist: 125, time: 45,
            type: "PAX", profile: "BIZ", dest: to, tags: tags, d: "🇨🇭 HUB SHUTTLE",
            depGate: depGate, arrGate: arrGate
        };
    },
    
    createCharterFlight: function(id, from, destObj) {
        let num = "LX" + Generator.rnd(8000, 8999);
        let tags = ["CHARTER", "PAX", "LONG"];
        let depGate = Generator.state.lastGate || Generator.assignGate(from, "LONG", tags, "DEP");
        let arrGate = Generator.assignGate(destObj.dest, "LONG", tags, "ARR");

        return {
            day: id, id: num, r: `${from}-${destObj.dest}`, dist: Math.round(destObj.time * 8), time: destObj.time,
            type: "PAX", profile: "LEISURE", dest: destObj.dest, tags: tags, d: `🏖️ CHARTER: ${destObj.name}`,
            depGate: depGate, arrGate: arrGate
        };
    },

    // =======================================================
    // 🧠 智慧機位分配系統 (Smart Gate Logic)
    // =======================================================
    assignGate: function(icao, type, tags, mode) {
        let ap = window.airportDB[icao];
        if (!ap || !ap.gates) return "APRON"; // 無資料時的回退

        let candidates = [];
        let allGates = [];
        
        // 收集所有機位以備不時之需
        for (let grp in ap.gates) allGates = allGates.concat(ap.gates[grp]);

        // -----------------------
        // 1. 蘇黎世 (LSZH) 邏輯
        // -----------------------
        if (icao === "LSZH") {
            // A. 維修/貨運 (高機率去遠端，低機率去客運)
            if (tags.includes("MAINT") || tags.includes("PREIGHTER")) {
                let isCargoInCabin = (tags.includes("PREIGHTER") && Generator.rnd(1,100) <= 30); // 30% 機率停客運航廈
                
                if (isCargoInCabin) {
                    // 停 Dock B 或 E
                    if (ap.gates["Dock B"]) candidates = candidates.concat(ap.gates["Dock B"]);
                    if (ap.gates["Dock E"]) candidates = candidates.concat(ap.gates["Dock E"]);
                } else {
                    // 停 General
                    if (ap.gates["General"]) candidates = candidates.concat(ap.gates["General"]);
                }
            }
            // B. 長程/非申根 -> Dock E (首選) > Dock B
            else if (type === "LONG") {
                if (ap.gates["Dock E"]) candidates = candidates.concat(ap.gates["Dock E"]);
                // 如果 Dock E 滿了(或是隨機)，備選 Dock B
                if (candidates.length === 0 || Generator.rnd(1,100) < 20) {
                    if (ap.gates["Dock B"]) candidates = candidates.concat(ap.gates["Dock B"]);
                }
            }
            // C. 短程/申根 -> Dock A > Dock B
            else {
                if (ap.gates["Dock A"]) candidates = candidates.concat(ap.gates["Dock A"]);
                if (ap.gates["Dock B"]) candidates = candidates.concat(ap.gates["Dock B"]);
            }
        }
        
        // -----------------------
        // 2. 日內瓦 (LSGG) 邏輯
        // -----------------------
        else if (icao === "LSGG") {
            if (type === "LONG") {
                if (ap.gates["East Wing"]) candidates = candidates.concat(ap.gates["East Wing"]);
                if (ap.gates["Main Terminal"]) candidates = candidates.concat(ap.gates["Main Terminal"]);
            } else {
                if (ap.gates["Main Terminal"]) candidates = candidates.concat(ap.gates["Main Terminal"]);
            }
        }

        // -----------------------
        // 3. 通用外站 (Outstations)
        // -----------------------
        else {
            // 嘗試尋找關鍵字 (Star Alliance 常用航廈)
            let prefKeys = ["Terminal 1", "Terminal 2", "Concourse A", "Main"];
            
            // 特例處理 (星盟樞紐)
            if (icao === "EGLL") prefKeys = ["Terminal 2"]; // 希斯洛 T2
            if (icao === "KJFK") prefKeys = ["Terminal 1", "Terminal 4"];
            if (icao === "EDDF") prefKeys = ["Concourse A", "Concourse B"]; // 漢莎樞紐
            if (icao === "EDDM") prefKeys = ["Terminal 2"]; // 慕尼黑 T2
            if (icao === "OMDB") prefKeys = ["Concourse D"]; 

            // 搜尋匹配的群組
            for (let grp in ap.gates) {
                for (let key of prefKeys) {
                    if (grp.includes(key)) {
                        candidates = candidates.concat(ap.gates[grp]);
                    }
                }
            }
        }

        // 如果上述規則都沒找到機位，就用所有機位
        if (candidates.length === 0) candidates = allGates;
        
        // 從候選名單中隨機選一個
        if (candidates.length > 0) {
            return candidates[Generator.rnd(0, candidates.length - 1)];
        }
        
        return "APRON";
    }
};
