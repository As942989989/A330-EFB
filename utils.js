// ==========================================
// 🛠️ A330 EFB Utilities (Math & Storage)
// ==========================================

// --- 本地存儲工具 ---
function safeGet(k) { try { return localStorage.getItem(k); } catch(e) { return null; } }
function safeSet(k, v) { try { localStorage.setItem(k, v); } catch(e) {} }
function safeRem(k) { try { localStorage.removeItem(k); } catch(e) {} }

// --- 數學工具 ---
function rnd(min, max) { return Math.floor(Math.random() * (max - min + 1) ) + min; }

// 線性差值計算 (Linear Interpolation)
function interpolate(w, t) {
    if (w <= t[0][0]) { let l = t[0]; return {v1: l[1], vr: l[2], v2: l[3]}; }
    if (w >= t[t.length-1][0]) { let l = t[t.length-1]; return {v1: l[1], vr: l[2], v2: l[3]}; }

    for(let i=0; i<t.length-1; i++) {
        if(w >= t[i][0] && w <= t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return {
                v1: Math.round(t[i][1]+r*(t[i+1][1]-t[i][1])), 
                vr: Math.round(t[i][2]+r*(t[i+1][2]-t[i][2])), 
                v2: Math.round(t[i][3]+r*(t[i+1][3]-t[i][3]))
            };
        }
    }
    let l=t[t.length-1]; return {v1:l[1],vr:l[2],v2:l[3]};
}

// 降落速度差值 (VLS)
function interpolateVLS(w, t) {
    if (w <= t[0][0]) return t[0][1];
    if (w >= t[t.length-1][0]) return t[t.length-1][1];
    for(let i=0; i<t.length-1; i++) {
        if(w >= t[i][0] && w <= t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return Math.round(t[i][1]+r*(t[i+1][1]-t[i][1]));
        }
    }
    return 160;
}

// 配平計算 (Trim Wheel Physics)
function calculateTHS(cg) {
    if(!window.perfDB) return { deg: 0, text: "ERR", raw: 0 };
    let tp = window.perfDB.trim_physics;
    let val = (tp.ref_cg - cg) * tp.step; 
    let dir = (val >= 0) ? "UP " : "DN ";
    return { deg: Math.abs(val), text: dir + Math.abs(val).toFixed(1), raw: val };
}

// 轉換為 IF 模擬器輸入值 (0-100%)
function convertToIF(degRaw) {
    let result = (degRaw > 0) ? 15 + (degRaw * 8) : 15 - (Math.abs(degRaw) * 8);
    return Math.max(0, Math.min(100, Math.round(result)));
}
