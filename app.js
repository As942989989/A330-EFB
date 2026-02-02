// ==========================================
// 📱 A330-300 EFB App Logic (Partial Update)
// ==========================================

// ... (保留原本的變數定義與初始化代碼) ...

function renderRoster() {
    const container = document.getElementById('roster-list'); // 確保你的 HTML 容器 ID 正確
    if (!container) return;
    
    container.innerHTML = '';
    const flights = window.roster ? window.roster.flights : [];

    if (flights.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:#666;padding:20px;">No flights scheduled.</div>';
        return;
    }

    flights.forEach((flight, index) => {
        // --- 新增：機位顯示邏輯 ---
        // 如果機位存在，顯示；否則顯示 TBD 或隱藏
        // 我們使用 small 標籤與 CSS class 來美化
        const depGateHTML = flight.gateDep ? `<span class="gate-tag">${flight.gateDep}</span>` : `<span class="gate-tag tbd">TBD</span>`;
        const arrGateHTML = flight.gateArr ? `<span class="gate-tag">${flight.gateArr}</span>` : `<span class="gate-tag tbd">TBD</span>`;
        
        // 解析航線
        const [dep, arr] = flight.route.split('-');

        const card = document.createElement('div');
        card.className = `flight-card ${flight.completed ? 'completed' : ''}`;
        card.onclick = () => loadFlight(index); // 假設原本有 loadFlight 函數

        // 更新後的 HTML 結構
        card.innerHTML = `
            <div class="flight-info">
                <div class="flight-day">${flight.day} • ${flight.id}</div>
                
                <div class="flight-route">
                    <span class="route-point">${dep} ${depGateHTML}</span>
                    <span class="route-arrow">➔</span>
                    <span class="route-point">${arr} ${arrGateHTML}</span>
                </div>
                
                <div class="flight-desc">
                    STD: ${flight.std}z &nbsp;|&nbsp; STA: ${flight.sta}z<br>
                    Type: ${flight.type || 'N/A'}
                </div>
            </div>
            <button class="check-btn" onclick="toggleComplete(event, ${index})">
                ${flight.completed ? '✔' : ''}
            </button>
        `;
        container.appendChild(card);
    });
}

// ... (保留原本的其他函數，如 loadFlight, toggleComplete, calculatePerf 等) ...
