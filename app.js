// --- 安全存取 ---
function safeGet(k){try{return localStorage.getItem(k)}catch(e){return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function safeRem(k){try{localStorage.removeItem(k)}catch(e){}}
let completedFlights = JSON.parse(safeGet('tk_roster_v15')) || {};

window.onload = function() {
    // 檢查資料庫完整性
    if (!window.flightDB || !window.perfDB || !window.weightDB) {
        alert("⚠️ 錯誤：資料庫不完整！\n請確認 roster.js, perf_db.js, weights.js 皆已存在。");
    } else {
        renderRoster();
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
    safeSet('tk_roster_v15', JSON.stringify(completedFlights));
    renderRoster();
}

function loadFlight(k) {
    const d = window.flightDB[k];
    document.getElementById('pax-count').value = d.pax;
    document.getElementById('cargo-fwd').value = d.f;
    document.getElementById('cargo-aft').value = d.a;
    
    document.getElementById('to-flight-title').innerText = k;
    document.getElementById('ldg-flight-desc').innerText = k + " (" + d.r + ")";
    
    updatePaxWeight(); updateTotalCargo(); saveInputs(); switchTab('takeoff');
}

// 使用外部重量資料庫
function updatePaxWeight(){
    if(!window.weightDB) return;
    let unit = window.weightDB.pax_unit; // 84 kg
    document.getElementById("pax-weight").value=(parseFloat(document.getElementById("pax-count").value)||0)*unit;
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

// --- 起飛計算 ---
function calculateTakeoff() {
    if(!window.perfDB || !window.weightDB) return;
    
    // 從 DB 讀取 OEW
    let oew = window.weightDB.oew; 
    
    let pax=parseFloat(document.getElementById('pax-weight').value)||0, cgo=parseFloat(document.getElementById('cargo-total').value)||0, fuel=parseFloat(document.getElementById('fuel-total').value)||0;
    let tow = (oew+pax+cgo+fuel)/1000;

    let len=parseFloat(document.getElementById('to-rwy-len').value)||3000, wet=document.getElementById('to-rwy-cond').value==='WET';
    let wdir=parseFloat(document.getElementById('to-wind-dir').value)||0, wspd=parseFloat(document.getElementById('to-wind-spd').value)||0, hdg=parseFloat(document.getElementById('to-rwy-hdg').value)||0;
    let hw = Math.cos(Math.abs(hdg-wdir)*(Math.PI/180))*wspd;

    let spd = interpolate(tow, window.perfDB.takeoff_speeds);
    let conf = (len<2400||tow>230)?"2":"1+F";
    let corr = window.perfDB.conf_correction[conf] || {v1:0,vr:0,v2:0};
    
    let v1=spd.v1+corr.v1, vr=spd.vr+corr.vr, v2=spd.v2+corr.v2;
    if(len<2200) v1-=4;
    if(wet) v1-=2;

    let fd=window.perfDB.flex_data;
    let flex=Math.floor(fd.base_temp+(fd.mtow-tow)*fd.slope_weight+Math.max(0,(len-2500)*fd.slope_runway)+Math.max(0,hw*0.5));
    if(flex>fd.max_temp) flex=fd.max_temp;
    if(len<2000||(wet&&len<2400)) flex="TOGA";

    let trimVal=(window.perfDB.trim_data.ref_cg-28.5)*window.perfDB.trim_data.step;
    let trimStr=(trimVal>=0?"UP ":"DN ")+Math.abs(trimVal).toFixed(1);

    document.getElementById('res-tow').innerText=tow.toFixed(1)+" T";
    
    // MTOW 超重檢查
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

// --- 降落計算 ---
function calculateLanding() {
    if(!window.perfDB || !window.weightDB) return;
    
    let oew = window.weightDB.oew;

    let pax=parseFloat(document.getElementById('pax-weight').value)||0, cgo=parseFloat(document.getElementById('cargo-total').value)||0, fuel=parseFloat(document.getElementById('fuel-total').value)||0, trip=parseFloat(document.getElementById('trip-fuel').value)||0;
    let ldw = ((oew+pax+cgo+fuel) - trip)/1000;

    let len=parseFloat(document.getElementById('ldg-rwy-len').value)||3000, wet=document.getElementById('ldg-rwy-cond').value==='WET';
    let wdir=parseFloat(document.getElementById('ldg-wind-dir').value)||0, wspd=parseFloat(document.getElementById('ldg-wind-spd').value)||0, hdg=parseFloat(document.getElementById('ldg-rwy-hdg').value)||0;
    let hw = Math.cos(Math.abs(hdg-wdir)*(Math.PI/180))*wspd;

    let vls = interpolateVLS(ldw, window.perfDB.landing_vls_full);
    let vapp = Math.round(vls + Math.max(5, Math.min(15, hw/3)));
    let ab = (len<2400||wet)?"MED":"LO";

    document.getElementById('res-ldw').innerText=ldw.toFixed(1)+" T";

    // MLW 超重檢查
    if(ldw*1000 > window.weightDB.limits.mlw) document.getElementById('res-ldw').style.color = "#e74c3c";
    else document.getElementById('res-ldw').style.color = "#fff";

    document.getElementById('res-vapp').innerText=vapp;
    document.getElementById('res-autobrake').innerText=ab;
    document.getElementById('disp-trip').value = "-" + (trip/1000).toFixed(1) + " T";
    
    saveInputs();
}

function saveInputs() {
    const ids = ['pax-count','cargo-fwd','cargo-aft','fuel-total','trip-fuel',
                 'to-rwy-len','to-rwy-cond','to-wind-dir','to-wind-spd','to-rwy-hdg',
                 'ldg-rwy-len','ldg-rwy-cond','ldg-wind-dir','ldg-wind-spd','ldg-rwy-hdg'];
    let data = {};
    ids.forEach(id => { let el=document.getElementById(id); if(el) data[id]=el.value; });
    data.title = document.getElementById('to-flight-title').innerText;
    data.desc = document.getElementById('ldg-flight-desc').innerText;
    safeSet('tk_calc_inputs_v15', JSON.stringify(data));
}

function loadInputs() {
    const d = JSON.parse(safeGet('tk_calc_inputs_v15'));
    if(d) {
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
    if(confirm("RESET ALL?")) { safeRem('tk_calc_inputs_v15'); safeRem('tk_roster_v15'); location.reload(); }
}
