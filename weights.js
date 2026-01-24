// ==========================================
// ⚖️ A330-300 重量與限制資料庫
// ==========================================

window.weightDB = {
    // --- 基礎重量 (單位: KG) ---
    oew: 129855,        // 空機重量 (Operating Empty Weight)
    pax_unit: 44,       // 單一乘客標準重量 (含手提行李)
    
    // --- 結構限制 (用於顯示警告) ---
    limits: {
        mtow: 242000,   // 最大起飛重 (Max Takeoff Weight)
        mlw: 182000,    // 最大落地重 (Max Landing Weight)
        mzfw: 175000    // 最大零油重 (Max Zero Fuel Weight)
    }
};
