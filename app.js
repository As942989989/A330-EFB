const PAX_UNIT_WEIGHT = 44; 
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('tk_roster_v16')) || {};

window.onload = function() {
    if (!window.flightDB || !window.perfDB || !window.weightDB || !window.airportDB) {
        alert("⚠️ 錯誤：資料庫不完整！\n請確認 roster, perf_db, weights, airports 四個檔案都存在。");
    } else {
        renderRoster();
        populateAirports(); // 初始化機場選單
    }
    loadInputs();
};

function switchTab(t) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + t).classList.add('active');
    document.getElementById('btn-' + t).classList.add('active');
}

function renderRoster() {
    const list = document.getElementById('roster-list');
    list.innerHTML = '';
    if(!window.flightDB) return;
    for (const [k, v] of Object.entries(window.flightDB)) {
        const d = document.createElement('div');
        d.className = `flight-card ${completedFlights[k]?'completed':''}`;
        d.onclick = (e) => { if(!e.target.classList.contains('check-btn')) loadFlight(k); };
        d.innerHTML = `<div class="flight-info"><div class="flight-day">${v.day} | ${k}</div><div class="flight-route">${v.r}</div><div class="flight-desc">${v.d}</div></div><button class="check-btn" onclick="toggle('${k}')">✓</button>`;
        list.appendChild(d);
    }
}

function toggle(k) {
    if(completedFlights[k]) delete completedFlights[k]; else completedFlights[k]=true;
    safeSet('tk_roster_v16', JSON.stringify(completedFlights));
    renderRoster();
}

// === 機場資料庫連動邏輯 ===

// 1. 初始化機場選單
function populateAirports() {
    const toSel = document.getElementById('to-airport-sel');
    const ldgSel = document.getElementById('ldg-airport-sel');
    if(!window.airportDB) return;
    
    // 清空舊選項 (保留第一個 MANUAL)
    toSel.innerHTML = '<option value="">MANUAL</option>';
    ldgSel.innerHTML = '<option value="">MANUAL</option>';

    // 排序並加入選項
    Object.keys(window.airportDB).sort().forEach(icao => {
        let name = window.airportDB[icao].name;
        let opt1 = new Option(`${icao} - ${name}`, icao);
        let opt2 = new Option(`${icao} - ${name}`, icao);
        toSel.add(opt1);
        ldgSel.add(opt2);
    });
}

// 2. 更新跑道清單
function updateRunways(type) {
    const aptIcao = document.getElementById(`${type}-airport-sel`).value;
    const rwySel = document.getElementById(`${type}-rwy-sel`);
    rwySel.innerHTML = '<option value="">SELECT...</option>'; // 重置

    if (aptIcao && window.airportDB[aptIcao]) {
        const rwys = window.airportDB[aptIcao].rwys;
        Object.keys(rwys).forEach(r => {
            rwySel.add(new Option(r, r)); // 顯示: 35L, 值: 35L
        });
    }
}

// 3. 填入跑道數據
function fillRunwayData(type) {
    const aptIcao = document.getElementById(`${type}-airport-sel`).value;
    const rwyId = document.getElementById(`${type}-rwy-sel`).value;
    
    if (aptIcao && rwyId && window.airportDB[aptIcao]) {
        const data = window.airportDB[aptIcao].rwys[rwyId];
        document.getElementById(`${type}-rwy-len`).value = data.l; // 長度 (Feet)
        document.getElementById(`${type}-rwy-hdg`).value = data.h; // 航向
        saveInputs(); // 自動存檔
    }
}

// 4. 解析班表自動選擇機場
function autoSelectAirports(flightNo) {
    // 簡單解析：TK1971 (LTFM-EGLL)
    const routeStr = window.flightDB[flightNo].r; 
    const match = routeStr.match(/([A-Z]{4})-([A-Z]{4})/);
    
    if(match) {
        const dep = match[1];
        const arr = match[2];
        
        // 設定起飛機場
        const toSel = document.getElementById('to-airport-sel');
        if(window.airportDB[dep]) {
            toSel.value = dep;
            updateRunways('to'); // 觸發跑道更新
        }

        // 設定降落機場
        const ldgSel = document.getElementById('ldg-airport-sel');
        if(window.airportDB[arr]) {
            ldgSel.value = arr;
            updateRunways('ldg');
        }
    }
}

// === 主流程 ===

function loadFlight(k) {
    const d = window.flightDB[k];
    document.getElementById('pax-count').value = d.pax;
    document.getElementById('cargo-fwd').value = d.f;
    document.getElementById('cargo-aft').value = d.a;
    
    document.getElementById('to-flight-title').innerText = k;
    document.getElementById('ldg-flight-desc').innerText = k + " (" + d.r + ")";
    
    updatePaxWeight(); updateTotalCargo(); 
    autoSelectAirports(k); // 自動帶入機場
    saveInputs(); 
    switchTab('takeoff');
}

function updatePaxWeight(){
    if(!window.weightDB) return;
    document.getElementById("pax-weight").value=(parseFloat(document.getElementById("pax-count").value)||0)*window.weightDB.pax_unit;
}
function updateTotalCargo(){document.getElementById("cargo-total").value=(parseFloat(document.getElementById("cargo-fwd").value)||0)+(parseFloat(document.getElementById("cargo-aft").value)||0);}

function interpolate(w, t) {
    for(let i=0; i<t.length-1; i++) {
        if(w>=t[i][0] && w<=t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return {v1: t[i][1]+r*(t[i+1][1]-t[i][1]), vr: t[i][2]+r*(t[i+1][2]-t[i][2]), v2: t[i][3]+r*(t[i+1][3]-t[i][3])};
        }
    }
    let l=t[t.length-1]; return {v1:l[1],vr:l[2],v2:l[3]};
}

function interpolateVLS(w, t) {
    for(let i=0; i<t.length-1; i++) {
        if(w>=t[i][0] && w<=t[i+1][0]) {
            let r = (w-t[i][0])/(t[i+1][0]-t[i][0]);
            return t[i][1]+r*(t[i+1][1]-t[i][1]);
        }
    }
    return 160;
}

// --- 起飛計算 (含單位換算) ---
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    let oew = window.weightDB.oew; 
    let pax=parseFloat(document.getElementById('pax-weight').value)||0, cgo=parseFloat(document.getElementById('cargo-total').value)||0, fuel=parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = (oew+pax+cgo+fuel)/1000;

    // [換算] 英呎 -> 公尺
    let lenFt = parseFloat(document.getElementById('to-rwy-len').value)||9842;
    let lenM = lenFt * 0.3048; // 轉成公尺給算法用

    let wet=document.getElementById('to-rwy-cond').value==='WET';
    let wdir=parseFloat(document.getElementById('to-wind-dir').value)||0, wspd=parseFloat(document.getElementById('to-wind-spd').value)||0, hdg=parseFloat(document.getElementById('to-rwy-hdg').value)||0;
    let hw = Math.cos(Math.abs(hdg-wdir)*(Math.PI/180))*wspd;

    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    
    // 用公尺判斷跑道長短
    let conf = (lenM<2400||tow>230)?"2":"1+F";
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    
    let v1=spd.v1+corr.v1, vr=spd.vr+corr.vr, v2=spd.v2+corr.v2;
    if(lenM<2200) v1-=4;
    if(wet) v1-=2;

    let fd=window.perfDB.flex_data;
    let flex=Math.floor(fd.base_temp+(fd.mtow-tow)*fd.slope_weight+Math.max(0,(lenM-2500)*fd.slope_runway)+Math.max(0,hw*0.5));
    if(flex>fd.max_temp) flex=fd.max_temp;
    if(lenM<2000||(wet&&lenM<2400)) flex="TOGA";

    let trimVal=(window.perfDB.trim_data.ref_cg-28.5)*window.perfDB.trim_data.step;
    let trimStr=(trimVal>=0?"UP ":"DN ")+Math.abs(trimVal).toFixed(1);

    document.getElementById('res-tow').innerText=tow.toFixed(1)+" T";
    if(tow*1000 > window.weightDB.limits.mtow) document.getElementById('res-tow').style.color = "#e74c3c";
    else document.getElementById('res-tow').style.color = "#fff";

    document.getElementById('res-conf').innerText=conf;
    document.getElementById('res-flex').innerText=(flex==="TOGA")?"TOGA":flex+"°";
    document.getElementById('res-trim').innerText=trimStr;
    document.getElementById('res-v1').innerText=Math.round(v1);
    document.getElementById('res-vr').innerText=Math.round(vr);
    document.getElementById('res-v2').innerText=Math.round(v2);
    
    document.getElementById('disp-tow').value = tow.toFixed(1) + " T";
    saveInputs();
}

// --- 降落計算 (含單位換算) ---
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    let oew = window.weightDB.oew;
    let pax=parseFloat(document.getElementById('pax-weight').value)||0, cgo=parseFloat(document.getElementById('cargo-total').value)||0, fuel=parseFloat(document.getElementById('fuel-total').value)||0, trip=parseFloat(document.getElementById('trip-fuel').value)||0;
    let ldw = ((oew+pax+cgo+fuel) - trip)/1000;

    // [換算] 英呎 -> 公尺
    let lenFt = parseFloat(document.getElementById('ldg-rwy-len').value)||9842;
    let lenM = lenFt * 0.3048;

    let wet=document.getElementById('ldg-rwy-cond').value==='WET';
    let wdir=parseFloat(document.getElementById('ldg-wind-dir').value)||0, wspd=parseFloat(document.getElementById('ldg-wind-spd').value)||0, hdg=parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    let hw = Math.cos(Math.abs(hdg-wdir)*(Math.PI/180))*wspd;

    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let vapp = Math.round(vls + Math.max(5, Math.min(15, hw/3)));
    
    // 用公尺判斷煞車
    let ab = (lenM<2400||wet)?"MED":"LO";

    document.getElementById('res-ldw').innerText=ldw.toFixed(1)+" T";
    if(ldw*1000 > window.weightDB.limits.mlw) document.getElementById('res-ldw').style.color = "#e74c3c";
    else document.getElementById('res-ldw').style.color = "#fff";

    document.getElementById('res-vapp').innerText=vapp;
    document.getElementById('res-autobrake').innerText=ab;
    document.getElementById('disp-trip').value = "-" + (trip/1000).toFixed(1) + " T";
    
    saveInputs();
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-airport-sel','to-rwy-sel','to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg',
                 'ldg-airport-sel','ldg-rwy-sel','ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('tk_calc_inputs_v16', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v16'));
    if(d) {
        // 先載入下拉選單的值
        if(d['to-airport-sel']) {
            document.getElementById('to-airport-sel').value = d['to-airport-sel'];
            updateRunways('to'); // 恢復跑道選項
        }
        if(d['ldg-airport-sel']) {
            document.getElementById('ldg-airport-sel').value = d['ldg-airport-sel'];
            updateRunways('ldg');
        }

        // 再載入其他數值
        for(let k in d) {
            let el = document.getElementById(k);
            if(el) el.value = d[k];
        }

        if(d.title) document.getElementById('to-flight-title').innerText = d.title;
        if(d.desc) document.getElementById('ldg-flight-desc').innerText = d.desc;
        updatePaxWeight(); updateTotalCargo();
        if(d['fuel-total'] && window.weightDB) {
            let tow = (window.weightDB.oew + parseFloat(document.getElementById('pax-weight').value) + parseFloat(document.getElementById('cargo-total').value) + parseFloat(d['fuel-total']))/1000;
            document.getElementById('disp-tow').value = tow.toFixed(1) + " T";
            if(d['trip-fuel']) document.getElementById('disp-trip').value = "-" + (parseFloat(d['trip-fuel'])/1000).toFixed(1) + " T";
        }
    }
}

function clearAllData() {
    if(confirm("RESET ALL?")) { safeRem('tk_calc_inputs_v16'); safeRem('tk_roster_v16'); location.reload(); }
}
