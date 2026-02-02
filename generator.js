// ==========================================
// ⚙️ A330 Career Generator (The Engine)
// ==========================================

const Generator = {
    // 系統狀態
    state: {
        base: "LSZH",           // 生涯基地
        location: "LSZH",       // 目前飛機位置
        maintCounter: 0,        // 累積維修時數
        totalHours: 0,          // 生涯總時數
        lastFlightNum: null,    // 上一腿班號 (用於接續)
        history: []             // 簡單歷史紀錄
    },

    // 隨機工具
    rnd: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    
    // 存取狀態
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
            maintCounter: 0,
            totalHours: 0,
            lastFlightNum: null,
            history: []
        };
        Generator.save();
    },

    // --- 核心生成迴圈 (30天) ---
    generateMonth: function() {
        let roster = {};
        let dayCounter = 1;
        
        // 如果是新生涯，第一天必須從基地出發
        if (Generator.state.history.length === 0) {
            Generator.state.location = Generator.state.base;
        }

        while(dayCounter <= 30) {
            let flight = Generator.createDailyFlight(dayCounter);
            
            if(flight) {
                // 如果是維修或長時間過夜，可能佔用多天 (此處簡化為1天1腿)
                roster[flight.id] = flight;
                
                // 更新狀態
                Generator.state.location = flight.dest;
                Generator.state.totalHours += (flight.time / 60);
                
                if (flight.tags.includes("MAINT")) {
                    Generator.state.maintCounter = 0; // 重置維修
                } else {
                    Generator.state.maintCounter += (flight.time / 60);
                }
                
                // 記錄班號 (僅限常規航班)
                if(!flight.tags.includes("FERRY") && !flight.tags.includes("MAINT")) {
                     Generator.state.lastFlightNum = parseInt(flight.id.replace("LX","")) || null;
                }
            }
            dayCounter++;
        }
        
        Generator.save();
        return roster;
    },

    // --- 每日決策樹 (Decision Tree) ---
    createDailyFlight: function(day) {
        let s = Generator.state;
        let db = window.routeDB;
        let flight = null;
        let flightId = `Day ${String(day).padStart(2, '0')}`;
        
        // 1. 維修強制判定 (Priority 1)
        if (s.maintCounter > 500) {
            return Generator.createMaintFlight(flightId, s.location, s.base);
        }

        // 2. 雙基地調機判定 (Priority 2)
        // 假設：有 10% 機率需要換基地任務，或者被迫調機
        // 簡化：如果人在 LSGG 但抽到 LSZH 任務 (下一步驟判定)，這裡先處理 "Shuttle"
        
        // 3. 尋找可用航班 (Filter)
        // 找出所有從當前位置出發的航班
        let candidates = db.regular.filter(r => r.route.startsWith(s.location));
        
        // 如果在外站 (Outstation)，必須回家 (Return to Hub)
        if (!["LSZH", "LSGG"].includes(s.location)) {
            // 嘗試尋找完美接續 (n+1)
            if (s.lastFlightNum) {
                let targetNum = s.lastFlightNum % 2 === 0 ? s.lastFlightNum + 1 : s.lastFlightNum; 
                // 瑞航慣例：偶數去，奇數回。如果上一班是974(偶)，這班找975(奇)
                
                let match = candidates.find(c => c.inbound.includes(targetNum));
                if (match) {
                    return Generator.buildFlight(flightId, match, "INBOUND", targetNum);
                }
            }
            // 若無完美接續，隨機回程
            let randomReturn = candidates[Generator.rnd(0, candidates.length - 1)];
            if(randomReturn) {
                 // 隨機挑一個奇數班號
                 let fNum = randomReturn.inbound[Generator.rnd(0, randomReturn.inbound.length-1)];
                 return Generator.buildFlight(flightId, randomReturn, "INBOUND", fNum);
            }
            
            // 真的找不到路？觸發調機回基地
            return Generator.createFerryFlight(flightId, s.location, s.base);
        }

        // --- 在基地 (Hub) ---
        
        // 4. 特殊事件判定 (Special Events)
        let dice = Generator.rnd(1, 100);
        
        // A. 包機 (5%)
        if (dice <= 5) {
            let charterDest = db.charters[Generator.rnd(0, db.charters.length-1)];
            return Generator.createCharterFlight(flightId, s.location, charterDest);
        }

        // B. 正常排班
        // 從基地出發，隨機選一個目的地
        let potentialRoutes = db.regular.filter(r => r.route.startsWith(s.location));
        
        // 如果目前在 LSGG，但隨機選到了 LSZH 出發的表 (邏輯保護)
        // 這裡簡化：只選出發地符合的
        
        if(potentialRoutes.length > 0) {
            let selectedRoute = potentialRoutes[Generator.rnd(0, potentialRoutes.length-1)];
            let fNum = selectedRoute.outbound[Generator.rnd(0, selectedRoute.outbound.length-1)];
            
            // C. 客改貨判定 (Preighter) - 15%
            let isPreighter = false;
            if (selectedRoute.isCargoHotspot && Generator.rnd(1, 100) <= 15) {
                isPreighter = true;
            }

            return Generator.buildFlight(flightId, selectedRoute, "OUTBOUND", fNum, isPreighter);
        } else {
            // 在基地卻無處可去？調機去另一個基地
            let targetHub = s.location === "LSZH" ? "LSGG" : "LSZH";
            return Generator.createShuttleFlight(flightId, s.location, targetHub);
        }
    },

    // --- 輔助建構函數 ---
    buildFlight: function(id, routeData, dir, fNum, isPreighter) {
        let dest = routeData.route.split('-')[1];
        let tags = [];
        
        if (routeData.type === "SHUTTLE") tags.push("SHUTTLE");
        else if (routeData.type === "LONG") tags.push("LONG");
        else tags.push("SHORT");

        if (isPreighter) tags.push("PREIGHTER"); // 📦 關鍵標籤
        else tags.push("PAX");

        let depTime = "08:00"; // 簡化時間
        
        return {
            day: id,
            id: "LX" + fNum,
            r: routeData.route,
            dist: Math.round(routeData.time * 8), // 估算距離
            time: routeData.time,
            type: isPreighter ? "CGO" : "PAX",
            profile: isPreighter ? "CARGO" : "BIZ",
            dest: dest,
            tags: tags,
            d: `${tags.join(' | ')}`
        };
    },

    createMaintFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "MAINT", profile: "FERRY", dest: to, tags: ["MAINT", "FERRY"],
            d: "🛠️ MANDATORY MAINTENANCE FERRY"
        };
    },
    
    createFerryFlight: function(id, from, to) {
        let num = "LX" + Generator.rnd(9000, 9999);
        return {
            day: id, id: num, r: `${from}-${to}`, dist: 0, time: 120,
            type: "FERRY", profile: "FERRY", dest: to, tags: ["FERRY"],
            d: "⚠️ POSITIONING FLIGHT"
        };
    },
    
    createShuttleFlight: function(id, from, to) {
         // 使用真實區段
         let num = "LX" + Generator.rnd(2800, 2819);
         return {
            day: id, id: num, r: `${from}-${to}`, dist: 125, time: 45,
            type: "PAX", profile: "BIZ", dest: to, tags: ["SHUTTLE"],
            d: "🇨🇭 HUB SHUTTLE"
        };
    },

    createCharterFlight: function(id, from, destObj) {
        let num = "LX" + Generator.rnd(8000, 8999);
        return {
            day: id, id: num, r: `${from}-${destObj.dest}`, dist: Math.round(destObj.time * 8), time: destObj.time,
            type: "PAX", profile: "LEISURE", dest: destObj.dest, tags: ["CHARTER"],
            d: `🏖️ CHARTER: ${destObj.name}`
        };
    }
};
