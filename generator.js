// ==========================================
// 🎲 A330-300 Flight Generator (v2.1 - With Gates)
// ==========================================

window.generator = {
    
    // --- 輔助工具：從陣列隨機取一個 ---
    randomChoice: function(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    },

    // --- 核心：機位分配邏輯 ---
    // 根據機場、任務類型和權重來選擇最真實的機位
    assignGate: function(icao, flightType) {
        // 1. 檢查資料庫是否存在
        if (!window.gateDB || !window.gateDB[icao]) return "TBD";
        
        const airportData = window.gateDB[icao];
        const zones = Object.keys(airportData); // 取得該機場所有區域 (例如 ["Dock E", "Apron", ...])
        let candidateZones = [];

        // --- 蘇黎世 (LSZH) 專用邏輯 ---
        if (icao === 'LSZH') {
            if (flightType === 'LONG') {
                // 長程客機：優先 Dock E (非申根)，其次 Dock B
                candidateZones = zones.filter(z => z.includes('Dock E'));
                if (candidateZones.length === 0) candidateZones = zones.filter(z => z.includes('Dock B'));
            } else if (flightType === 'SHORT') {
                // 短程客機：優先 Dock A/B/D (申根區)
                candidateZones = zones.filter(z => z.includes('Dock A') || z.includes('Dock B'));
            } else {
                // 貨運/維修/飛渡：優先 Remote 或 Apron
                candidateZones = zones.filter(z => z.includes('Remote') || z.includes('Apron') || z.includes('Maint'));
            }
        } 
        // --- 外站通用邏輯 ---
        else {
            if (['CARGO', 'FERRY', 'MAINT'].includes(flightType)) {
                // 非客運：優先找機坪、貨運區
                candidateZones = zones.filter(z => 
                    z.toLowerCase().includes('apron') || 
                    z.toLowerCase().includes('remote') || 
                    z.toLowerCase().includes('cargo')
                );
            } else {
                // 客運：優先找航廈、空橋
                candidateZones = zones.filter(z => 
                    z.toLowerCase().includes('terminal') || 
                    z.toLowerCase().includes('concourse') || 
                    z.toLowerCase().includes('gate') ||
                    z.toLowerCase().includes('dock')
                );
            }
        }

        // --- 兜底機制 (Fallback) ---
        // 如果上述篩選找不到任何區域 (或資料庫命名不標準)，則使用該機場所有可用區域
        if (candidateZones.length === 0) {
            candidateZones = zones;
        }

        // 2. 從候選區域中選一個區域
        const selectedZoneName = this.randomChoice(candidateZones);
        const selectedZoneGates = airportData[selectedZoneName];

        // 3. 從該區域的機位清單中隨機選一個機位
        // 如果該區域是空的 (防呆)，回傳 TBD
        if (!selectedZoneGates || selectedZoneGates.length === 0) return "TBD";

        return this.randomChoice(selectedZoneGates);
    },

    // --- 生成班表主程序 ---
    generateSchedule: function() {
        if (!window.routes || !window.roster) {
            console.error("Missing routes or roster database.");
            return;
        }

        // 清空現有班表
        window.roster.flights = [];
        const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        
        // 簡單的權重生成 (範例：生成 5-8 個航班)
        const numFlights = Math.floor(Math.random() * 4) + 5; 

        for (let i = 0; i < numFlights; i++) {
            // 隨機選一條航線
            const routeKey = this.randomChoice(Object.keys(window.routes));
            const routeData = window.routes[routeKey];
            
            // 決定日期
            const day = this.randomChoice(days);

            // 解析起降機場
            const [depICAO, arrICAO] = routeKey.split('-');

            // --- 新增：分配機位 ---
            // 根據 flightType (例如 LONG, SHORT) 分配
            // 如果 routes.js 沒有定義 type，預設為 LONG (A330 常用)
            const fType = routeData.type || 'LONG'; 
            
            const gateDep = this.assignGate(depICAO, fType);
            const gateArr = this.assignGate(arrICAO, fType);

            // 建立航班物件
            let newFlight = {
                id: "LX" + (Math.floor(Math.random() * 899) + 100), // 隨機航班號 LX100-LX999
                route: routeKey,
                std: routeData.std || "1000", // 若無定義則給預設值
                sta: routeData.sta || "1800",
                day: day,
                type: fType,
                gateDep: gateDep, // 新增欄位
                gateArr: gateArr  // 新增欄位
            };

            window.roster.flights.push(newFlight);
        }

        // 依照日期排序 (簡單邏輯：Mon -> Sun)
        const dayOrder = { "Mon": 1, "Tue": 2, "Wed": 3, "Thu": 4, "Fri": 5, "Sat": 6, "Sun": 7 };
        window.roster.flights.sort((a, b) => dayOrder[a.day] - dayOrder[b.day]);

        console.log(`Generated ${window.roster.flights.length} flights with gate assignments.`);
    }
};
