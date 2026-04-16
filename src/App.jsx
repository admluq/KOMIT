import { useState } from "react";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700&display=swap";
document.head.appendChild(fontLink);

const B = {
  navy:"#0d1b2a", navyMid:"#1b2d3e", teal:"#00b4d8", tealDim:"#0096b4",
  amber:"#fca311", amberDim:"#d98900", cream:"#f4f1eb", white:"#ffffff",
  muted:"#7a8794", border:"#d8d3cb", bg:"#f4f1eb", dark:"#0d1b2a",
};

const styleEl = document.createElement("style");
styleEl.textContent = `
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:${B.bg};}
  @keyframes fadeUp{from{opacity:0;transform:translateY(12px);}to{opacity:1;transform:translateY(0);}}
  @keyframes toastIn{from{opacity:0;transform:translate(-50%,12px);}to{opacity:1;transform:translate(-50%,0);}}
  .kcard{transition:all 0.18s ease;cursor:pointer;}
  .kcard:hover{border-color:${B.teal}!important;box-shadow:0 8px 32px rgba(0,180,216,0.13)!important;transform:translateY(-1px);}
  .kbtn{transition:filter 0.15s;}
  .kbtn:hover{filter:brightness(1.1);}
  ::-webkit-scrollbar{width:5px;height:5px;}
  ::-webkit-scrollbar-thumb{background:${B.border};border-radius:99px;}
`;
document.head.appendChild(styleEl);

const CATEGORIES = ["Infrastruktur","Kebersihan","Keselamatan","Utiliti","Persekitaran","Sosial","Lain-lain"];
const DAERAH = ["Kota Bharu","Pasir Mas","Tumpat","Pasir Puteh","Bachok","Machang","Tanah Merah","Kuala Krai","Gua Musang","Jeli"];
const STATUSES = ["Baru","Disahkan","Dalam Siasatan","Selesai","Ditolak"];
const SC = {Baru:"#fca311",Disahkan:"#00b4d8","Dalam Siasatan":"#7c3aed",Selesai:"#16a34a",Ditolak:"#e63946"};
const CHANNELS = [
  {id:"vc1",name:"Kelantan Today",type:"Media",followers:12400,av:"KT"},
  {id:"vc2",name:"Peduli Kelantan",type:"NGO",followers:8900,av:"PK"},
  {id:"vc3",name:"Komuniti KB",type:"Komuniti",followers:5200,av:"KK"},
];
const TICKETS = [
  {id:"KMT-001",title:"Jambatan Reput Kg Laut, Tumpat",
   description:"Jambatan kayu di Kg Laut telah reput dan berbahaya. Kanak-kanak terpaksa meredah sungai ke sekolah setiap hari. Sudah dilaporkan kepada PBT tetapi tiada tindakan selama 4 bulan.",
   category:"Infrastruktur",daerah:"Tumpat",status:"Dalam Siasatan",
   likes:189,reposts:67,verifiedBoosts:["vc1","vc2"],date:"2026-04-01",donTarget:5000,donRaised:3240,
   updates:["03 Apr: Pasukan KOMIT telah lawat tapak.","08 Apr: Laporan teknikal difailkan ke JKR Kelantan.","11 Apr: JKR sahkan bajet diluluskan untuk pembaikan."]},
  {id:"KMT-002",title:"Air Paip Keruh 2 Minggu — Wakaf Che Yeh",
   description:"Penduduk Wakaf Che Yeh menerima air berwarna coklat sejak 2 minggu lepas. AKSB tidak memberi respons. Bayi dan warga emas terjejas teruk.",
   category:"Utiliti",daerah:"Kota Bharu",status:"Disahkan",
   likes:312,reposts:98,verifiedBoosts:["vc2"],date:"2026-04-06",donTarget:2000,donRaised:890,
   updates:["09 Apr: Aduan disahkan. Sampel air dihantar ke makmal."]},
  {id:"KMT-003",title:"Pencemaran Sungai Golok oleh Kilang Haram",
   description:"Sungai Golok di Rantau Panjang dicemari operasi kilang tidak berlesen. Ikan mati terapung. Nelayan kehilangan punca rezeki. Perlu tindakan segera.",
   category:"Persekitaran",daerah:"Pasir Mas",status:"Baru",
   likes:78,reposts:31,verifiedBoosts:[],date:"2026-04-12",donTarget:3000,donRaised:150,updates:[]},
  {id:"KMT-004",title:"SK Machang Tiada Elektrik 3 Hari",
   description:"Kabel elektrik dicuri menyebabkan SK Machang Jaya tidak ada bekalan. Murid belajar dalam keadaan gelap dan panas. Pihak TNB lambat bertindak.",
   category:"Utiliti",daerah:"Machang",status:"Selesai",
   likes:445,reposts:167,verifiedBoosts:["vc1","vc2","vc3"],date:"2026-03-25",donTarget:1500,donRaised:1500,
   updates:["27 Mar: Pasukan KOMIT tiba di lokasi.","29 Mar: TNB didesak melalui saluran rasmi.","02 Apr: Bekalan elektrik dipulihkan. Selesai!"]},
];

let tkCount = 5;
const anonId = email => {
  let h=0; for(let c of email) h=(h*31+c.charCodeAt(0))&0xffffffff;
  return `KMT#${Math.abs(h)%90000+10000}`;
};

const F = {dm:"'DM Sans',sans-serif", bebas:"'Bebas Neue',sans-serif"};

export default function App() {
  const [view,setView] = useState("board");
  const [tickets,setTickets] = useState(TICKETS);
  const [selected,setSelected] = useState(null);
  const [user,setUser] = useState(null);
  const [liked,setLiked] = useState({});
  const [reposted,setReposted] = useState({});
  const [fCat,setFCat] = useState("Semua");
  const [fDaerah,setFDaerah] = useState("Semua");
  const [fStatus,setFStatus] = useState("Semua");
  const [sortBy,setSortBy] = useState("popular");
  const [search,setSearch] = useState("");
  const [lEmail,setLEmail] = useState("");
  const [lStep,setLStep] = useState("email");
  const [lOtp,setLOtp] = useState("");
  const [lErr,setLErr] = useState("");
  const [lIntent,setLIntent] = useState("general");
  const [donTid,setDonTid] = useState(null);
  const [donAmt,setDonAmt] = useState("");
  const [donMethod,setDonMethod] = useState("fpx");
  const [donDone,setDonDone] = useState(false);
  const [form,setForm] = useState({title:"",desc:"",category:"",daerah:"",location:""});
  const [fSubmit,setFSubmit] = useState(false);
  const [fErr,setFErr] = useState("");
  const [toast,setToast] = useState(null);

  const showToast = (msg,type="info") => { setToast({msg,type}); setTimeout(()=>setToast(null),3200); };
  const requireAuth = (intent,cb) => {
    if(user){cb();return;}
    setLIntent(intent);setLStep("email");setLEmail("");setLOtp("");setLErr("");setView("login");
  };
  const doLoginEmail = () => {
    if(!lEmail.includes("@")){setLErr("Sila masukkan Gmail yang sah.");return;}
    setLStep("otp");setLErr("");showToast("OTP dihantar! (Demo: 123456)","info");
  };
  const doLoginOtp = () => {
    if(lOtp!=="123456"){setLErr("OTP tidak sah. Cuba: 123456");return;}
    const id=anonId(lEmail);
    const isVC=lEmail.includes("media@")||lEmail.includes("ngo@")||lEmail.includes("channel@");
    const u={email:lEmail,anonId:id,isVC};
    setUser(u);setLStep("done");setLErr("");showToast(`Selamat datang, ${id}!`,"success");
    if(lIntent==="donate"&&donTid) setTimeout(()=>setView("donate"),400);
    else if(lIntent==="submit") setTimeout(()=>setView("submit"),400);
    else setTimeout(()=>setView("board"),400);
  };
  const doLike = id => {
    if(!user){requireAuth("general",()=>{});return;}
    if(liked[id]){showToast("Anda sudah sokong tiket ini.","warn");return;}
    setLiked(l=>({...l,[id]:true}));
    setTickets(ts=>ts.map(t=>t.id===id?{...t,likes:t.likes+1}:t));
    showToast("Sokongan direkod! ▲","success");
  };
  const doRepost = id => {
    if(!user){requireAuth("general",()=>{});return;}
    if(reposted[id]){showToast("Anda sudah kongsikan tiket ini.","warn");return;}
    setReposted(r=>({...r,[id]:true}));
    const boost=user.isVC?5:1;
    setTickets(ts=>ts.map(t=>t.id===id?{...t,reposts:t.reposts+boost}:t));
    showToast(user.isVC?"⚡ Verified Boost! +5 skor":"Tiket dikongsi!","success");
  };
  const doShareWA = t => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`🚨 *${t.id}: ${t.title}*\n📍 ${t.daerah}, Kelantan\nhttps://komit.my/tiket/${t.id}`)}`,"_blank");
  };
  const doShareTG = t => {
    window.open(`https://t.me/share/url?url=${encodeURIComponent(`https://komit.my/tiket/${t.id}`)}&text=${encodeURIComponent(`🚨 ${t.id}: ${t.title} — ${t.daerah}`)}`,"_blank");
  };
  const doDonate = id => {
    setDonTid(id);setDonDone(false);setDonAmt("");requireAuth("donate",()=>setView("donate"));
  };
  const doDonateSubmit = () => {
    if(!donAmt||isNaN(donAmt)||Number(donAmt)<1){showToast("Amaun tidak sah.","warn");return;}
    setTickets(ts=>ts.map(t=>t.id===donTid?{...t,donRaised:Math.min(t.donRaised+Number(donAmt),t.donTarget)}:t));
    setDonDone(true);showToast(`Derma RM${donAmt} berjaya! Terima kasih 💛`,"success");
  };
  const doSubmit = () => {
    if(!form.title||!form.desc||!form.category||!form.daerah||!form.location){setFErr("Sila lengkapkan semua maklumat.");return;}
    setTickets(ts=>[{id:`KMT-00${tkCount++}`,title:form.title,description:form.desc,category:form.category,
      daerah:form.daerah,location:form.location,status:"Baru",likes:0,reposts:0,verifiedBoosts:[],
      date:new Date().toISOString().slice(0,10),donTarget:2000,donRaised:0,updates:[]},...ts]);
    setFSubmit(true);setForm({title:"",desc:"",category:"",daerah:"",location:""});setFErr("");
  };

  const filtered = tickets
    .filter(t=>fCat==="Semua"||t.category===fCat)
    .filter(t=>fDaerah==="Semua"||t.daerah===fDaerah)
    .filter(t=>fStatus==="Semua"||t.status===fStatus)
    .filter(t=>!search||t.title.toLowerCase().includes(search.toLowerCase())||t.daerah.toLowerCase().includes(search.toLowerCase()))
    .sort((a,b)=>{
      if(sortBy==="terkini") return new Date(b.date)-new Date(a.date);
      return (b.likes+b.reposts*2+b.verifiedBoosts.length*10)-(a.likes+a.reposts*2+a.verifiedBoosts.length*10);
    });

  const totalDon = tickets.reduce((s,t)=>s+t.donRaised,0);
  const resolved = tickets.filter(t=>t.status==="Selesai").length;

  // helpers
  const pill = (color,extra={}) => ({background:color+"22",color,border:`1px solid ${color}44`,borderRadius:99,padding:"2px 10px",fontSize:10.5,fontFamily:F.dm,fontWeight:700,whiteSpace:"nowrap",...extra});
  const inp = {width:"100%",padding:"10px 14px",border:`1.5px solid ${B.border}`,borderRadius:8,fontFamily:F.dm,fontSize:14,outline:"none",background:"#fff",color:B.dark,marginBottom:12};
  const lbl = {display:"block",fontSize:11,fontWeight:700,fontFamily:F.dm,marginBottom:6,color:B.muted,letterSpacing:"0.1em",textTransform:"uppercase"};
  const navBtnStyle = active => ({background:active?B.amber:"transparent",color:active?B.navy:"rgba(255,255,255,0.75)",border:"none",borderRadius:6,padding:"7px 16px",cursor:"pointer",fontFamily:F.dm,fontSize:13,fontWeight:700,letterSpacing:"0.03em",whiteSpace:"nowrap"});
  const barBtn = (active,color) => ({display:"flex",alignItems:"center",gap:4,padding:"5px 12px",borderRadius:99,border:`1.5px solid ${active?color:B.border}`,background:active?color+"20":"transparent",color:active?color:B.muted,cursor:"pointer",fontSize:12,fontFamily:F.dm,fontWeight:700});
  const donBar = pct => (
    <div style={{height:6,background:"#e8e4dc",borderRadius:99,overflow:"hidden"}}>
      <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${B.amber},${B.teal})`,borderRadius:99,transition:"width 0.5s"}}/>
    </div>
  );

  // NAVBAR
  const NavBar = () => (
    <header style={{background:B.navy,borderBottom:`3px solid ${B.amber}`,position:"sticky",top:0,zIndex:200,height:60,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 20px"}}>
      <div style={{display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setView("board")}>
        <div style={{width:40,height:40,background:B.amber,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:F.bebas,fontSize:22,color:B.navy,letterSpacing:1}}>K</span>
        </div>
        <div>
          <div style={{fontFamily:F.bebas,fontSize:22,letterSpacing:"0.2em",color:"#fff",lineHeight:1}}>KOMIT</div>
          <div style={{fontFamily:F.dm,fontSize:9,color:"rgba(255,255,255,0.4)",letterSpacing:"0.2em",textTransform:"uppercase"}}>Komuniti Integriti · Kelantan</div>
        </div>
      </div>
      <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
        <button style={navBtnStyle(view==="board")} onClick={()=>setView("board")}>Papan Aduan</button>
        <button style={navBtnStyle(view==="submit")} onClick={()=>requireAuth("submit",()=>setView("submit"))}>+ Aduan</button>
        {user ? (
          <div style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:99,padding:"5px 14px",fontSize:12,fontFamily:F.dm,color:"rgba(255,255,255,0.75)",display:"flex",alignItems:"center",gap:7}}>
            {user.isVC&&<span style={{background:B.amber,color:B.navy,borderRadius:99,padding:"1px 8px",fontSize:9.5,fontWeight:800}}>⚡VER</span>}
            {user.anonId}
          </div>
        ):(
          <button style={{...navBtnStyle(false),border:`1.5px solid rgba(252,163,17,0.5)`,color:B.amber}} onClick={()=>requireAuth("general",()=>{})}>Masuk Gmail</button>
        )}
      </div>
    </header>
  );

  const Toast = () => toast ? (
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",zIndex:9999,
      background:toast.type==="success"?B.teal:toast.type==="warn"?B.amber:B.navy,
      color:toast.type==="warn"?B.navy:"#fff",padding:"10px 24px",borderRadius:99,
      fontFamily:F.dm,fontSize:13,fontWeight:600,boxShadow:"0 8px 32px rgba(0,0,0,0.25)",
      whiteSpace:"nowrap",animation:"toastIn 0.2s ease",letterSpacing:"0.02em"}}>
      {toast.msg}
    </div>
  ):null;

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  if(view==="login") return (
    <div style={{minHeight:"100vh",background:B.bg,fontFamily:F.dm}}>
      <NavBar/><Toast/>
      <div style={{position:"fixed",inset:0,background:"rgba(13,27,42,0.75)",zIndex:300,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={()=>setView("board")}>
        <div style={{background:"#fff",borderRadius:16,padding:"36px 32px",maxWidth:420,width:"100%",boxShadow:"0 24px 64px rgba(0,0,0,0.35)",border:`2px solid ${B.amber}`,animation:"fadeUp 0.2s ease"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20}}>
            <div style={{width:44,height:44,background:B.navy,borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <span style={{fontFamily:F.bebas,fontSize:26,color:B.amber,letterSpacing:2}}>K</span>
            </div>
            <div>
              <div style={{fontFamily:F.bebas,fontSize:26,letterSpacing:"0.18em",color:B.navy}}>KOMIT</div>
              <div style={{fontSize:10,color:B.muted,letterSpacing:"0.14em",textTransform:"uppercase",fontFamily:F.dm}}>Log Masuk Selamat</div>
            </div>
          </div>
          <div style={{fontSize:13.5,color:B.muted,lineHeight:1.65,marginBottom:16,fontFamily:F.dm}}>Identiti anda dilindungi. Gmail hanya untuk sahkan anda bukan bot.</div>
          <div style={{background:B.teal+"15",border:`1.5px solid ${B.teal}30`,borderRadius:8,padding:"10px 14px",fontSize:13,color:B.tealDim,marginBottom:20,fontWeight:600,fontFamily:F.dm}}>
            🛡️ ID awam anda: <strong style={{color:B.navy}}>{lEmail?anonId(lEmail):"KMT#XXXXX"}</strong>
          </div>
          {lStep==="email"&&<>
            <label style={lbl}>ALAMAT GMAIL</label>
            <input style={inp} type="email" placeholder="nama@gmail.com" value={lEmail} onChange={e=>setLEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLoginEmail()}/>
            {lErr&&<div style={{color:"#e63946",fontSize:12,fontFamily:F.dm,marginBottom:10}}>⚠ {lErr}</div>}
            <button className="kbtn" style={{width:"100%",background:B.navy,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontSize:14,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={doLoginEmail}>Hantar Kod OTP →</button>
            <button className="kbtn" style={{width:"100%",background:"transparent",color:B.muted,border:`1.5px solid ${B.border}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,fontFamily:F.dm,cursor:"pointer",marginTop:8}} onClick={()=>setView("board")}>Batal</button>
          </>}
          {lStep==="otp"&&<>
            <div style={{fontSize:13,color:B.muted,marginBottom:12,fontFamily:F.dm}}>OTP dihantar ke <strong>{lEmail}</strong>. <span style={{color:B.teal}}>Demo: 123456</span></div>
            <label style={lbl}>KOD OTP</label>
            <input style={inp} type="text" placeholder="123456" maxLength={6} value={lOtp} onChange={e=>setLOtp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&doLoginOtp()}/>
            {lErr&&<div style={{color:"#e63946",fontSize:12,fontFamily:F.dm,marginBottom:10}}>⚠ {lErr}</div>}
            <button className="kbtn" style={{width:"100%",background:B.teal,color:"#fff",border:"none",borderRadius:8,padding:"12px",fontSize:14,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={doLoginOtp}>Sahkan & Masuk ✓</button>
            <button className="kbtn" style={{width:"100%",background:"transparent",color:B.muted,border:`1.5px solid ${B.border}`,borderRadius:8,padding:"10px",fontSize:13,fontWeight:600,fontFamily:F.dm,cursor:"pointer",marginTop:8}} onClick={()=>setLStep("email")}>← Tukar E-mel</button>
          </>}
          {lStep==="done"&&(
            <div style={{textAlign:"center",padding:"20px 0"}}>
              <div style={{fontSize:44}}>✅</div>
              <div style={{fontFamily:F.bebas,fontSize:28,letterSpacing:"0.12em",color:B.teal,marginTop:10}}>LOG MASUK BERJAYA</div>
              <div style={{fontSize:13,color:B.muted,marginTop:6,fontFamily:F.dm}}>ID awam: <strong style={{color:B.navy}}>{user?.anonId}</strong></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── DONATE ────────────────────────────────────────────────────────────────
  if(view==="donate"&&user) {
    const t=tickets.find(tk=>tk.id===donTid);
    const pct=t?Math.round((t.donRaised/t.donTarget)*100):0;
    return (
      <div style={{minHeight:"100vh",background:B.bg,fontFamily:F.dm}}>
        <NavBar/><Toast/>
        <div style={{maxWidth:500,margin:"0 auto",padding:"28px 16px 80px"}}>
          <button className="kbtn" style={{background:"none",border:"none",color:B.teal,cursor:"pointer",fontFamily:F.dm,fontWeight:700,fontSize:13,marginBottom:20,padding:0}} onClick={()=>setView("board")}>← Kembali</button>
          {!donDone?(
            <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:28,boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
              <div style={{borderBottom:`1px solid ${B.border}`,paddingBottom:16,marginBottom:20}}>
                <div style={{fontSize:10,fontFamily:"monospace",color:B.muted,marginBottom:6}}>{t?.id}</div>
                <div style={{fontFamily:F.bebas,fontSize:20,letterSpacing:"0.04em",color:B.navy,marginBottom:4}}>{t?.title}</div>
                <div style={{fontSize:12,color:B.muted}}>📍 {t?.daerah}, Kelantan</div>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:12.5,marginBottom:6}}>
                <span style={{fontWeight:700,color:B.amber}}>RM{t?.donRaised?.toLocaleString()} terkumpul</span>
                <span style={{color:B.muted}}>Sasaran RM{t?.donTarget?.toLocaleString()}</span>
              </div>
              {donBar(pct)}
              <div style={{fontSize:11.5,color:B.teal,fontWeight:700,marginTop:5,marginBottom:22}}>{pct}% mencapai sasaran</div>
              <label style={lbl}>PILIH AMAUN (RM)</label>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
                {[10,20,50,100,200,500].map(p=>(
                  <button key={p} className="kbtn" style={{padding:"10px",border:`2px solid ${Number(donAmt)===p?B.amber:B.border}`,borderRadius:8,background:Number(donAmt)===p?B.amber+"22":"#fff",fontFamily:F.dm,fontWeight:700,fontSize:14,cursor:"pointer",color:Number(donAmt)===p?B.amberDim:B.dark}} onClick={()=>setDonAmt(String(p))}>RM{p}</button>
                ))}
              </div>
              <label style={lbl}>ATAU AMAUN LAIN</label>
              <input style={inp} type="number" placeholder="RM 0.00" value={donAmt} onChange={e=>setDonAmt(e.target.value)}/>
              <label style={lbl}>KAEDAH PEMBAYARAN</label>
              <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"}}>
                {[["fpx","🏦 FPX"],["card","💳 Kad"],["ewallet","📱 e-Wallet"]].map(([k,l])=>(
                  <button key={k} className="kbtn" style={{flex:1,padding:"9px 6px",border:`2px solid ${donMethod===k?B.teal:B.border}`,borderRadius:8,background:donMethod===k?B.teal+"18":"#fff",fontFamily:F.dm,fontSize:12.5,fontWeight:700,cursor:"pointer",color:donMethod===k?B.tealDim:B.muted}} onClick={()=>setDonMethod(k)}>{l}</button>
                ))}
              </div>
              <div style={{background:B.amber+"18",border:`1.5px solid ${B.amber}40`,borderRadius:8,padding:"10px 14px",fontSize:12.5,color:"#7a5500",marginBottom:18,lineHeight:1.6}}>
                💛 Derma anda <strong>tanpa nama</strong>. Hanya jumlah keseluruhan dipaparkan. Resit ke <strong>{user.email.replace(/(.{3}).*(@.*)/,"$1***$2")}</strong>.
              </div>
              <button className="kbtn" style={{width:"100%",background:B.amber,color:B.navy,border:"none",borderRadius:8,padding:"13px",fontSize:15,fontWeight:800,fontFamily:F.dm,cursor:"pointer"}} onClick={doDonateSubmit}>
                Derma RM{donAmt||"0"} Sekarang →
              </button>
              <div style={{fontSize:11,color:B.muted,textAlign:"center",marginTop:10}}>Diproses via ToyyibPay · SSL · Dana ke akaun NGO berdaftar</div>
            </div>
          ):(
            <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:"48px 28px",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:52,marginBottom:12}}>🌟</div>
              <div style={{fontFamily:F.bebas,fontSize:32,letterSpacing:"0.12em",color:B.teal}}>TERIMA KASIH!</div>
              <div style={{fontSize:14,color:B.muted,lineHeight:1.65,marginTop:10,marginBottom:6,fontFamily:F.dm}}>Derma RM{donAmt} berjaya diproses.</div>
              <div style={{fontSize:13,color:B.muted,marginBottom:28,fontFamily:F.dm}}>Resit dihantar ke <strong>{user.email.replace(/(.{3}).*(@.*)/,"$1***$2")}</strong></div>
              <button className="kbtn" style={{background:B.navy,color:"#fff",border:"none",borderRadius:8,padding:"12px 32px",fontSize:14,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={()=>setView("board")}>Kembali ke Papan Aduan</button>
            </div>
          )}
        </div>
        <footer style={{background:B.navy,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:16,fontFamily:F.dm,fontSize:11.5,letterSpacing:"0.06em"}}>© 2026 KOMIT · Komuniti Integriti Kelantan · Semua derma diaudit</footer>
      </div>
    );
  }

  // ── DETAIL ────────────────────────────────────────────────────────────────
  if(view==="detail"&&selected) {
    const t=tickets.find(tk=>tk.id===selected.id)||selected;
    const pct=Math.round((t.donRaised/t.donTarget)*100);
    const boostedCh=CHANNELS.filter(vc=>t.verifiedBoosts.includes(vc.id));
    return (
      <div style={{minHeight:"100vh",background:B.bg,fontFamily:F.dm}}>
        <NavBar/><Toast/>
        <div style={{maxWidth:740,margin:"0 auto",padding:"24px 14px 80px"}}>
          <button className="kbtn" style={{background:"none",border:"none",color:B.teal,cursor:"pointer",fontFamily:F.dm,fontWeight:700,fontSize:13,marginBottom:20,padding:0}} onClick={()=>setView("board")}>← Papan Aduan</button>
          <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:28,marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
              <span style={{fontSize:10,fontFamily:"monospace",color:B.muted}}>{t.id}</span>
              <span style={pill(B.teal)}>{t.category}</span>
              <span style={pill(SC[t.status])}>{t.status}</span>
              {t.verifiedBoosts.length>0&&<span style={pill(B.amber)}>⚡ VERIFIED BOOST</span>}
              <span style={{marginLeft:"auto",fontSize:12,color:B.muted}}>📍 {t.daerah}, Kelantan</span>
            </div>
            <h2 style={{fontFamily:F.bebas,fontSize:28,letterSpacing:"0.05em",lineHeight:1.2,color:B.navy,marginBottom:14}}>{t.title}</h2>
            <p style={{fontSize:14,color:"#444",lineHeight:1.7,marginBottom:20,fontFamily:F.dm}}>{t.description}</p>
            <div style={{background:B.navy+"08",borderRadius:12,padding:"14px 16px",marginBottom:18}}>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:8}}>
                <span style={{fontWeight:700,color:B.amber,fontFamily:F.dm}}>RM{t.donRaised.toLocaleString()} terkumpul</span>
                <span style={{color:B.muted,fontFamily:F.dm}}>Sasaran RM{t.donTarget.toLocaleString()}</span>
              </div>
              <div style={{height:10,background:"#e8e4dc",borderRadius:99,overflow:"hidden"}}>
                <div style={{height:"100%",width:`${Math.min(pct,100)}%`,background:`linear-gradient(90deg,${B.amber},${B.teal})`,borderRadius:99,transition:"width 0.5s"}}/>
              </div>
              <div style={{fontSize:12,color:B.teal,fontWeight:700,marginTop:6,fontFamily:F.dm}}>{pct}% mencapai sasaran</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",borderTop:`1px solid ${B.border}`,paddingTop:16}}>
              <button className="kbtn" style={barBtn(liked[t.id],B.amber)} onClick={()=>doLike(t.id)}>{liked[t.id]?"▲":"△"} {t.likes} Sokong</button>
              <button className="kbtn" style={barBtn(reposted[t.id],B.teal)} onClick={()=>doRepost(t.id)}>⟲ {t.reposts} Kongsi</button>
              <button className="kbtn" style={{...barBtn(false,"#25D366"),color:"#25D366",border:`1.5px solid ${B.border}`}} onClick={()=>doShareWA(t)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.999-1.312A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                WhatsApp
              </button>
              <button className="kbtn" style={{...barBtn(false,"#229ED9"),color:"#229ED9",border:`1.5px solid ${B.border}`}} onClick={()=>doShareTG(t)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#229ED9"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.668l-2.96-.924c-.643-.204-.658-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.891z"/></svg>
                Telegram
              </button>
              <button className="kbtn" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,padding:"8px 18px",borderRadius:99,border:`2px solid ${B.amber}`,background:B.amber,color:B.navy,cursor:"pointer",fontSize:13,fontFamily:F.dm,fontWeight:800}} onClick={()=>doDonate(t.id)}>💛 Derma Sekarang</button>
            </div>
          </div>
          {boostedCh.length>0&&(
            <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:"20px 24px",marginBottom:14,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{fontFamily:F.dm,fontSize:11,fontWeight:700,color:B.amber,letterSpacing:"0.15em",textTransform:"uppercase",marginBottom:14}}>⚡ Disokong Saluran Disahkan</div>
              {boostedCh.map(vc=>(
                <div key={vc.id} style={{display:"flex",alignItems:"center",gap:12,marginBottom:12}}>
                  <div style={{width:34,height:34,borderRadius:"50%",background:B.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:B.amber,fontFamily:F.dm,flexShrink:0}}>{vc.av}</div>
                  <div>
                    <div style={{fontSize:14,fontWeight:700,fontFamily:F.dm}}>{vc.name}</div>
                    <div style={{fontSize:11.5,color:B.muted,fontFamily:F.dm}}>{vc.type} · {vc.followers.toLocaleString()} pengikut</div>
                  </div>
                  <span style={{marginLeft:"auto",...pill(B.amber),fontSize:11,padding:"3px 10px"}}>⚡ VERIFIED</span>
                </div>
              ))}
            </div>
          )}
          <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:24,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
            <div style={{fontFamily:F.bebas,fontSize:18,letterSpacing:"0.15em",color:B.navy,marginBottom:16}}>LOG TINDAKAN KOMIT</div>
            {t.updates.length===0
              ?<div style={{fontSize:13.5,color:B.muted,fontStyle:"italic",fontFamily:F.dm}}>Tiada kemaskini lagi. Pasukan KOMIT sedang menilai aduan ini.</div>
              :t.updates.map((u,i)=>(
                <div key={i} style={{display:"flex",gap:14,paddingBottom:16}}>
                  <div style={{width:10,height:10,borderRadius:"50%",background:B.teal,marginTop:5,flexShrink:0}}/>
                  <div style={{fontSize:13.5,color:"#333",lineHeight:1.55,fontFamily:F.dm}}>{u}</div>
                </div>
              ))}
          </div>
        </div>
        <footer style={{background:B.navy,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:16,fontFamily:F.dm,fontSize:11.5,letterSpacing:"0.06em"}}>© 2026 KOMIT · Laporkan. Sokong. Ubah. · Maklumat peribadi dilindungi</footer>
      </div>
    );
  }

  // ── SUBMIT ────────────────────────────────────────────────────────────────
  if(view==="submit") {
    if(!user){setView("login");return null;}
    return (
      <div style={{minHeight:"100vh",background:B.bg,fontFamily:F.dm}}>
        <NavBar/><Toast/>
        <div style={{maxWidth:640,margin:"0 auto",padding:"28px 16px 80px"}}>
          <div style={{marginBottom:24}}>
            <div style={{fontFamily:F.bebas,fontSize:38,letterSpacing:"0.08em",color:B.navy,lineHeight:1}}>HANTAR ADUAN</div>
            <div style={{fontSize:13.5,color:B.muted,marginTop:8,lineHeight:1.65,fontFamily:F.dm}}>Log masuk sebagai <strong style={{color:B.navy}}>{user.anonId}</strong>. Aduan diterbitkan tanpa nama. Pasukan KOMIT bertindak dalam 48 jam.</div>
          </div>
          {fSubmit?(
            <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:"44px 28px",textAlign:"center",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{fontSize:52,marginBottom:12}}>✅</div>
              <div style={{fontFamily:F.bebas,fontSize:30,letterSpacing:"0.1em",color:B.teal}}>ADUAN BERJAYA DIHANTAR!</div>
              <div style={{fontSize:13.5,color:B.muted,marginTop:12,lineHeight:1.65,marginBottom:24,fontFamily:F.dm}}>Tiket awam diterbitkan. Resit pengesahan dihantar ke Gmail anda.</div>
              <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
                <button className="kbtn" style={{background:B.navy,color:"#fff",border:"none",borderRadius:8,padding:"11px 24px",fontSize:14,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={()=>setView("board")}>Lihat Papan Aduan</button>
                <button className="kbtn" style={{background:B.amber,color:B.navy,border:"none",borderRadius:8,padding:"11px 24px",fontSize:14,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={()=>setFSubmit(false)}>+ Aduan Lain</button>
              </div>
            </div>
          ):(
            <div style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:16,padding:28,boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
              <div style={{background:B.teal+"15",border:`1.5px solid ${B.teal}30`,borderRadius:8,padding:"10px 14px",fontSize:12.5,color:B.tealDim,marginBottom:22,fontWeight:600}}>
                🔒 Gmail: <strong>{user.email.replace(/(.{3}).*(@.*)/,"$1***$2")}</strong> · Identiti dilindungi · Resit akan dihantar
              </div>
              {[["TAJUK ISU *","title","input","Ringkasan isu dalam satu ayat..."],["PENERANGAN TERPERINCI *","desc","textarea","Huraikan isu — bila berlaku, siapa terjejas, kesan kepada komuniti..."]].map(([l,k,type,ph])=>(
                <div key={k} style={{marginBottom:18}}>
                  <label style={lbl}>{l}</label>
                  {type==="textarea"
                    ?<textarea style={{...inp,minHeight:110,resize:"vertical"}} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>
                    :<input style={inp} placeholder={ph} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}/>}
                </div>
              ))}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:18}}>
                {[["KATEGORI *","category",CATEGORIES],["DAERAH *","daerah",DAERAH]].map(([l,k,opts])=>(
                  <div key={k}>
                    <label style={lbl}>{l}</label>
                    <select style={{...inp,cursor:"pointer"}} value={form[k]} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))}>
                      <option value="">Pilih...</option>
                      {opts.map(o=><option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{marginBottom:22}}>
                <label style={lbl}>LOKASI SPESIFIK *</label>
                <input style={inp} placeholder="Nama jalan / kampung / kawasan..." value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))}/>
              </div>
              {fErr&&<div style={{color:"#e63946",fontSize:12.5,marginBottom:14,fontFamily:F.dm}}>⚠ {fErr}</div>}
              <button className="kbtn" style={{width:"100%",background:B.navy,color:"#fff",border:"none",borderRadius:8,padding:"13px",fontSize:15,fontWeight:700,fontFamily:F.dm,cursor:"pointer"}} onClick={doSubmit}>Hantar Aduan Secara Tanpa Nama →</button>
            </div>
          )}
        </div>
        <footer style={{background:B.navy,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:16,fontFamily:F.dm,fontSize:11.5,letterSpacing:"0.06em"}}>© 2026 KOMIT · Gmail anda tidak didedahkan kepada sesiapa</footer>
      </div>
    );
  }

  // ── BOARD ─────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:B.bg,fontFamily:F.dm,color:B.dark}}>
      <NavBar/><Toast/>

      {/* HERO */}
      <div style={{background:B.navy,color:"#fff",padding:"52px 20px 40px",textAlign:"center",borderBottom:`3px solid ${B.amber}`,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,opacity:0.03,backgroundImage:"linear-gradient(rgba(255,255,255,0.9) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.9) 1px,transparent 1px)",backgroundSize:"40px 40px"}}/>
        <div style={{position:"absolute",top:-80,left:"50%",transform:"translateX(-50%)",width:700,height:400,background:B.teal,opacity:0.05,borderRadius:"50%",filter:"blur(80px)"}}/>
        <div style={{position:"relative"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(252,163,17,0.15)",border:`1px solid rgba(252,163,17,0.35)`,borderRadius:99,padding:"5px 16px",marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:B.amber}}/>
            <span style={{fontFamily:F.dm,fontSize:11,fontWeight:700,letterSpacing:"0.2em",textTransform:"uppercase",color:B.amber}}>Platform NGO Berdaftar · Kelantan</span>
          </div>
          <h1 style={{fontFamily:F.bebas,fontSize:"clamp(52px,9vw,88px)",letterSpacing:"0.06em",lineHeight:0.9,marginBottom:10}}>
            KOMIT<br/><span style={{color:B.teal,fontSize:"clamp(26px,4.5vw,48px)",letterSpacing:"0.1em"}}>KOMUNITI INTEGRITI</span>
          </h1>
          <p style={{fontSize:14.5,opacity:0.65,fontFamily:F.dm,maxWidth:500,margin:"16px auto 20px",lineHeight:1.7}}>
            Laporkan isu secara tanpa nama. Sahkan dengan Gmail. Sokong dengan like. Derma untuk bantu. Pasukan KOMIT akan bertindak.
          </p>
          <div style={{fontFamily:F.bebas,fontSize:15,letterSpacing:"0.5em",color:B.amber,marginBottom:30}}>LAPORKAN · SOKONG · UBAH</div>
          <div style={{display:"flex",justifyContent:"center",gap:0,flexWrap:"wrap",borderTop:"1px solid rgba(255,255,255,0.08)",paddingTop:24}}>
            {[[tickets.length,"Jumlah Aduan"],[resolved,"Diselesaikan"],[`RM${totalDon.toLocaleString()}`,"Terkumpul"],[tickets.reduce((s,t)=>s+t.likes,0),"Sokongan"]].map(([n,l],i)=>(
              <div key={l} style={{textAlign:"center",padding:"0 24px",borderRight:i<3?"1px solid rgba(255,255,255,0.08)":"none"}}>
                <div style={{fontFamily:F.bebas,fontSize:36,color:B.amber,letterSpacing:"0.04em"}}>{n}</div>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"0.2em",textTransform:"uppercase",fontFamily:F.dm}}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CHANNEL BAR */}
      <div style={{background:B.navyMid,borderBottom:`1px solid rgba(252,163,17,0.2)`,padding:"9px 20px",display:"flex",alignItems:"center",gap:12,overflowX:"auto"}}>
        <div style={{fontSize:10,fontFamily:F.dm,fontWeight:700,letterSpacing:"0.22em",textTransform:"uppercase",color:B.amber,whiteSpace:"nowrap"}}>⚡ SALURAN DISAHKAN</div>
        {CHANNELS.map(vc=>(
          <div key={vc.id} style={{display:"flex",alignItems:"center",gap:8,background:"rgba(255,255,255,0.06)",border:"1px solid rgba(252,163,17,0.18)",borderRadius:99,padding:"5px 14px",whiteSpace:"nowrap"}}>
            <div style={{width:22,height:22,borderRadius:"50%",background:B.amber,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:900,color:B.navy,fontFamily:F.dm,flexShrink:0}}>{vc.av}</div>
            <div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",fontFamily:F.dm,fontWeight:600}}>{vc.name}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",fontFamily:F.dm}}>{vc.type} · {vc.followers.toLocaleString()}</div>
            </div>
          </div>
        ))}
        <div style={{marginLeft:"auto",fontSize:10.5,color:"rgba(255,255,255,0.2)",fontFamily:F.dm,whiteSpace:"nowrap"}}>Boost ×5 pada tiket</div>
      </div>

      {/* TOOLBAR */}
      <div style={{background:"#fff",borderBottom:`1px solid ${B.border}`,padding:"10px 20px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",position:"sticky",top:60,zIndex:150}}>
        <input style={{flex:1,minWidth:150,padding:"8px 14px",border:`1.5px solid ${B.border}`,borderRadius:8,fontFamily:F.dm,fontSize:13,outline:"none",background:B.bg,color:B.dark}} placeholder="🔍 Cari isu atau lokasi..." value={search} onChange={e=>setSearch(e.target.value)}/>
        {[[fDaerah,setFDaerah,["Semua Daerah",...DAERAH],"Semua Daerah"],[fCat,setFCat,["Semua Kategori",...CATEGORIES],"Semua Kategori"],[fStatus,setFStatus,["Semua Status",...STATUSES],"Semua Status"],[sortBy,setSortBy,["popular","terkini"],"popular"]].map(([val,set,opts,def],i)=>(
          <select key={i} style={{padding:"8px 12px",border:`1.5px solid ${B.border}`,borderRadius:8,fontFamily:F.dm,fontSize:12.5,background:B.bg,cursor:"pointer",color:B.dark,outline:"none"}} value={val} onChange={e=>set(e.target.value)}>
            {opts.map(o=><option key={o} value={o}>{o==="popular"?"Paling Popular":o==="terkini"?"Terkini":o}</option>)}
          </select>
        ))}
      </div>

      {/* BOARD */}
      <div style={{maxWidth:900,margin:"0 auto",padding:"20px 14px 80px",display:"flex",flexDirection:"column",gap:14}}>
        {filtered.length===0?(
          <div style={{textAlign:"center",padding:"72px 24px",color:B.muted}}>
            <div style={{fontSize:44,marginBottom:14}}>📭</div>
            <div style={{fontFamily:F.bebas,fontSize:24,letterSpacing:"0.1em",color:B.navy,marginBottom:8}}>TIADA ADUAN DIJUMPAI</div>
            <div style={{fontSize:13.5,fontFamily:F.dm}}>Cuba tukar penapis atau{" "}
              <button style={{background:"none",border:"none",color:B.teal,cursor:"pointer",fontWeight:700,fontSize:13.5,fontFamily:F.dm}} onClick={()=>requireAuth("submit",()=>setView("submit"))}>hantar aduan baharu</button>.
            </div>
          </div>
        ):filtered.map(t=>{
          const pct=Math.round((t.donRaised/t.donTarget)*100);
          const score=t.likes+t.reposts*2+t.verifiedBoosts.length*10;
          return (
            <div key={t.id} className="kcard"
              style={{background:"#fff",border:`1.5px solid ${B.border}`,borderRadius:14,padding:"18px 20px 14px",position:"relative",overflow:"hidden"}}
              onClick={()=>{setSelected(t);setView("detail");}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:5,background:SC[t.status]||"#ccc",borderRadius:"14px 0 0 14px"}}/>
              <div style={{paddingLeft:10}}>
                <div style={{display:"flex",gap:7,marginBottom:8,flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{fontSize:10,fontFamily:"monospace",color:B.muted}}>{t.id}</span>
                  <span style={pill(B.teal)}>{t.category}</span>
                  <span style={pill(SC[t.status])}>{t.status}</span>
                  {t.verifiedBoosts.length>0&&<span style={pill(B.amber)}>⚡ VERIFIED</span>}
                  <span style={{marginLeft:"auto",fontSize:11,color:B.muted}}>📍 {t.daerah}</span>
                </div>
                <div style={{fontFamily:F.bebas,fontSize:20,letterSpacing:"0.04em",lineHeight:1.2,color:B.navy,marginBottom:6}}>{t.title}</div>
                <div style={{fontSize:13,color:"#555",lineHeight:1.55,marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden",fontFamily:F.dm}}>{t.description}</div>
                <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",fontSize:11.5,color:B.muted,marginBottom:8,fontFamily:F.dm}}>
                  <span>{new Date(t.date).toLocaleDateString("ms-MY",{day:"numeric",month:"short"})}</span>
                  {t.updates.length>0&&<span style={{color:"#16a34a",fontWeight:700}}>✓ {t.updates.length} kemaskini</span>}
                  <span style={{marginLeft:"auto",fontWeight:700,color:B.amber}}>RM{t.donRaised.toLocaleString()} / RM{t.donTarget.toLocaleString()}</span>
                </div>
                {donBar(pct)}
                <div style={{display:"flex",gap:6,borderTop:`1px solid ${B.border}`,paddingTop:10,marginTop:10,alignItems:"center",flexWrap:"wrap"}} onClick={e=>e.stopPropagation()}>
                  <button className="kbtn" style={barBtn(liked[t.id],B.amber)} onClick={()=>doLike(t.id)}>{liked[t.id]?"▲":"△"} {t.likes}</button>
                  <button className="kbtn" style={barBtn(reposted[t.id],B.teal)} onClick={()=>doRepost(t.id)}>⟲ {t.reposts}</button>
                  <button className="kbtn" style={{...barBtn(false,B.border),color:"#25D366",border:`1.5px solid ${B.border}`}} onClick={()=>doShareWA(t)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.999-1.312A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                    WA
                  </button>
                  <button className="kbtn" style={{...barBtn(false,B.border),color:"#229ED9",border:`1.5px solid ${B.border}`}} onClick={()=>doShareTG(t)}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="#229ED9"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.668l-2.96-.924c-.643-.204-.658-.643.136-.953l11.57-4.461c.537-.194 1.006.131.958.891z"/></svg>
                    TG
                  </button>
                  <button className="kbtn" style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:4,padding:"5px 14px",borderRadius:99,border:`2px solid ${B.amber}`,background:B.amber+"22",color:B.amberDim,cursor:"pointer",fontSize:12,fontFamily:F.dm,fontWeight:800}} onClick={()=>doDonate(t.id)}>💛 Derma</button>
                  <span style={{fontSize:10.5,fontFamily:"monospace",color:"#ccc"}}>#{score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <footer style={{background:B.navy,color:"rgba(255,255,255,0.3)",textAlign:"center",padding:20,fontFamily:F.dm,fontSize:11.5,letterSpacing:"0.06em"}}>
        <div style={{fontFamily:F.bebas,fontSize:20,letterSpacing:"0.35em",color:B.amber,marginBottom:6}}>KOMIT</div>
        © 2026 Komuniti Integriti Kelantan · Platform NGO Bebas · Semua aduan tanpa nama · Derma diaudit
      </footer>
    </div>
  );
}
