import { useState, useEffect } from "react";
import { db, fbReady } from "./firebase";
import {
  collection, addDoc, onSnapshot, updateDoc,
  doc, increment, serverTimestamp, query, orderBy,
} from "firebase/firestore";

/* ─── Palette ───────────────────────────────────────────────── */
const C = {
  navy:"#0d1b2a", mid:"#1b2d3e", teal:"#00b4d8",
  amber:"#fca311", cream:"#f4f1eb", muted:"#7a8794",
  border:"#d8d3cb", red:"#e63946",
};

/* ─── Global CSS ─────────────────────────────────────────────── */
const _s = document.createElement("style");
_s.textContent = `
*{box-sizing:border-box;margin:0;padding:0}
body{background:${C.cream};font-family:'DM Sans',sans-serif}
.card{transition:box-shadow .18s,transform .18s}
.card:hover{box-shadow:0 8px 32px rgba(0,180,216,.13)!important;transform:translateY(-2px)}
.btn{border:none;cursor:pointer;transition:filter .15s}
.btn:hover{filter:brightness(1.1)}
.btn:active{transform:scale(.97)}
@keyframes fu{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.fu{animation:fu .25s ease}
@keyframes spin{to{transform:rotate(360deg)}}
.spin{animation:spin .7s linear infinite}
::-webkit-scrollbar{width:4px}
::-webkit-scrollbar-thumb{background:${C.border};border-radius:9px}
`;
document.head.appendChild(_s);
document.head.insertAdjacentHTML("beforeend",
  `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"/>`
);

/* ─── Constants ──────────────────────────────────────────────── */
const CATS = [
  "Semua","Infrastruktur","Kebersihan","Keselamatan",
  "Utiliti","Persekitaran","Sosial","Lain-lain",
];
const DAERAHS = [
  "Kota Bharu","Pasir Mas","Tumpat","Pasir Puteh",
  "Bachok","Machang","Tanah Merah","Kuala Krai","Gua Musang","Jeli",
];

/* Seed posts shown on first run */
const SEEDS = [
  {
    title:"Jambatan Reput Kg Laut, Tumpat",
    description:"Jambatan kayu di Kg Laut telah reput dan berbahaya. Kanak-kanak terpaksa meredah sungai ke sekolah setiap hari. Sudah dilaporkan kepada PBT tetapi tiada tindakan selama 4 bulan.",
    category:"Infrastruktur", daerah:"Tumpat", likes:189,
  },
  {
    title:"Air Paip Keruh 2 Minggu — Wakaf Che Yeh",
    description:"Penduduk Wakaf Che Yeh menerima air berwarna coklat sejak 2 minggu lepas. AKSB tidak memberi respons. Bayi dan warga emas terjejas teruk.",
    category:"Utiliti", daerah:"Kota Bharu", likes:312,
  },
  {
    title:"Pencemaran Sungai Golok oleh Kilang Haram",
    description:"Sungai Golok di Rantau Panjang dicemari operasi kilang tidak berlesen. Ikan mati terapung. Nelayan kehilangan punca rezeki.",
    category:"Persekitaran", daerah:"Pasir Mas", likes:247,
  },
];

/* ─── Helpers ────────────────────────────────────────────────── */
const timeAgo = (ts) => {
  if (!ts?.toMillis) return "";
  const s = Math.floor((Date.now() - ts.toMillis()) / 1000);
  if (s < 60)    return "baru sahaja";
  if (s < 3600)  return `${Math.floor(s / 60)} minit lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return `${Math.floor(s / 86400)} hari lalu`;
};

/* Per-device like tracking */
const getLiked  = () => { try { return new Set(JSON.parse(localStorage.getItem("k_liked") || "[]")); } catch { return new Set(); } };
const saveLiked = (s) => localStorage.setItem("k_liked", JSON.stringify([...s]));

/* Demo-mode localStorage helpers */
const LS_KEY = "komit_demo_posts";
const lsLoad = () => { try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; } };
const lsSave = (p) => localStorage.setItem(LS_KEY, JSON.stringify(p));

/* Style tokens */
const INP = {
  display:"block", width:"100%", padding:"10px 14px",
  borderRadius:10, border:`1.5px solid ${C.border}`,
  fontSize:14, background:"#fff", color:C.navy,
  outline:"none", marginTop:6,
};
const SEL = { ...INP, cursor:"pointer" };

/* ─── App ────────────────────────────────────────────────────── */
export default function App() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [cat,        setCat]        = useState("Semua");
  const [showCreate, setShowCreate] = useState(false);
  const [donatePost, setDonatePost] = useState(null);
  const [liked,      setLiked]      = useState(getLiked);

  /* ── Subscribe to posts ── */
  useEffect(() => {
    if (fbReady) {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      return onSnapshot(q, async (snap) => {
        if (snap.empty) {
          await Promise.all(
            SEEDS.map((s) => addDoc(collection(db, "posts"), { ...s, createdAt: serverTimestamp() }))
          );
        } else {
          setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        }
      });
    } else {
      let stored = lsLoad();
      if (!stored.length) {
        stored = SEEDS.map((s, i) => ({
          ...s,
          id: `demo-${i}`,
          createdAt: { toMillis: () => Date.now() - i * 7_200_000 },
        }));
        lsSave(stored);
      }
      setPosts(stored);
      setLoading(false);
    }
  }, []);

  /* ── Like / unlike ── */
  const handleLike = async (postId) => {
    const next = new Set(liked);
    const dir  = next.has(postId) ? -1 : 1;
    dir > 0 ? next.add(postId) : next.delete(postId);
    setLiked(next);
    saveLiked(next);
    if (fbReady) {
      await updateDoc(doc(db, "posts", postId), { likes: increment(dir) });
    } else {
      const updated = lsLoad().map((p) =>
        p.id === postId ? { ...p, likes: (p.likes || 0) + dir } : p
      );
      lsSave(updated);
      setPosts(updated);
    }
  };

  /* ── New post (demo mode) ── */
  const handleCreated = (post) => {
    if (!fbReady) {
      const updated = [post, ...lsLoad()];
      lsSave(updated);
      setPosts(updated);
    }
  };

  const filtered = cat === "Semua" ? posts : posts.filter((p) => p.category === cat);

  return (
    <div style={{ minHeight:"100vh" }}>

      {/* ── Header ── */}
      <header style={{ background:C.navy, padding:"14px 20px", position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,.35)" }}>
        <div style={{ maxWidth:680, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:22, fontWeight:800, color:C.amber, letterSpacing:1 }}>KOMIT</div>
            <div style={{ fontSize:11, color:C.muted, marginTop:1 }}>Komuniti Integriti Kelantan</div>
          </div>
          <button className="btn" onClick={() => setShowCreate(true)}
            style={{ background:C.amber, color:C.navy, borderRadius:24, padding:"8px 18px", fontWeight:700, fontSize:14 }}>
            + Lapor
          </button>
        </div>
      </header>

      {/* ── Category filter ── */}
      <div style={{ overflowX:"auto", background:C.mid, padding:"10px 0" }}>
        <div style={{ display:"flex", gap:8, padding:"0 20px", maxWidth:680, margin:"0 auto" }}>
          {CATS.map((c) => (
            <button key={c} className="btn" onClick={() => setCat(c)} style={{
              whiteSpace:"nowrap", padding:"6px 14px", borderRadius:20,
              background: cat === c ? C.amber : "rgba(255,255,255,.08)",
              color:      cat === c ? C.navy  : C.cream,
              fontWeight: cat === c ? 700     : 500,
              fontSize:13,
            }}>{c}</button>
          ))}
        </div>
      </div>

      {/* ── Feed ── */}
      <main style={{ maxWidth:680, margin:"0 auto", padding:"16px 16px 80px" }}>
        {!fbReady && (
          <div style={{ background:"#fff7e0", border:`1px solid ${C.amber}`, borderRadius:12, padding:"10px 16px", marginBottom:16, fontSize:13, color:C.mid }}>
            ⚠️ <strong>Demo Mode</strong> — Data tersimpan di peranti ini sahaja.
            Tambah Firebase env vars untuk simpanan bersama semua pengguna.
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <div className="spin" style={{ width:32, height:32, border:`3px solid ${C.border}`, borderTopColor:C.teal, borderRadius:"50%", margin:"0 auto" }}/>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:60, color:C.muted }}>
            <div style={{ fontSize:40, marginBottom:12 }}>📭</div>
            <div style={{ fontWeight:600 }}>Tiada aduan lagi</div>
            <div style={{ fontSize:14, marginTop:6 }}>Jadilah yang pertama melaporkan!</div>
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              liked={liked.has(post.id)}
              onLike={() => handleLike(post.id)}
              onDonate={() => setDonatePost(post)}
            />
          ))
        )}
      </main>

      {/* ── Floating action button ── */}
      <button className="btn" onClick={() => setShowCreate(true)} style={{
        position:"fixed", bottom:24, right:24, zIndex:90,
        width:56, height:56, borderRadius:"50%",
        background:C.amber, color:C.navy,
        fontSize:28, fontWeight:700,
        boxShadow:"0 4px 20px rgba(252,163,17,.45)",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>+</button>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={handleCreated}/>}
      {donatePost && <DonateModal post={donatePost} onClose={() => setDonatePost(null)}/>}
    </div>
  );
}

/* ─── PostCard ───────────────────────────────────────────────── */
function PostCard({ post, liked, onLike, onDonate }) {
  const [expanded, setExpanded] = useState(false);
  const desc   = post.description || "";
  const isLong = desc.length > 160;

  return (
    <article className="card fu" style={{
      background:"#fff", borderRadius:16, padding:20, marginBottom:14,
      boxShadow:"0 2px 8px rgba(0,0,0,.06)", border:`1px solid ${C.border}`,
    }}>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
        <span style={{ background:C.teal+"22", color:C.teal, padding:"3px 10px", borderRadius:12, fontSize:12, fontWeight:600 }}>{post.category}</span>
        <span style={{ background:C.amber+"22", color:C.mid,  padding:"3px 10px", borderRadius:12, fontSize:12, fontWeight:600 }}>{post.daerah}</span>
        <span style={{ marginLeft:"auto", color:C.muted, fontSize:12 }}>{timeAgo(post.createdAt)}</span>
      </div>

      <h2 style={{ fontSize:16, fontWeight:700, color:C.navy, marginBottom:8, lineHeight:1.4 }}>{post.title}</h2>

      <p style={{ fontSize:14, color:"#444", lineHeight:1.6, marginBottom:12 }}>
        {isLong && !expanded ? desc.slice(0, 160) + "…" : desc}
        {isLong && (
          <button className="btn" onClick={() => setExpanded(!expanded)}
            style={{ color:C.teal, background:"none", marginLeft:4, fontSize:13, fontWeight:600 }}>
            {expanded ? "Sembunyikan" : "Baca lagi"}
          </button>
        )}
      </p>

      <div style={{ display:"flex", gap:10, borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
        <button className="btn" onClick={onLike} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"7px 16px", borderRadius:20,
          background: liked ? C.red+"18" : C.cream,
          color:       liked ? C.red      : C.muted,
          fontWeight:600, fontSize:14,
        }}>{liked ? "❤️" : "🤍"} {post.likes || 0}</button>

        <button className="btn" onClick={onDonate} style={{
          display:"flex", alignItems:"center", gap:6,
          padding:"7px 18px", borderRadius:20,
          background:C.amber, color:C.navy,
          fontWeight:700, fontSize:14, marginLeft:"auto",
        }}>💛 Derma</button>
      </div>
    </article>
  );
}

/* ─── CreateModal ────────────────────────────────────────────── */
function CreateModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ title:"", description:"", category:CATS[1], daerah:DAERAHS[0] });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      const data = { ...form, title:form.title.trim(), description:form.description.trim(), likes:0 };
      if (fbReady) {
        await addDoc(collection(db, "posts"), { ...data, createdAt: serverTimestamp() });
      } else {
        onCreated({ ...data, id:`u-${Date.now()}`, createdAt:{ toMillis: () => Date.now() } });
      }
      setDone(true);
      setTimeout(onClose, 1600);
    } catch {
      setBusy(false);
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:480 }}>
        {done ? (
          <div style={{ textAlign:"center", padding:"24px 0" }}>
            <div style={{ fontSize:52, marginBottom:12 }}>✅</div>
            <div style={{ fontWeight:700, color:C.navy, fontSize:18 }}>Aduan Dihantar!</div>
            <div style={{ color:C.muted, marginTop:8, fontSize:14 }}>Terima kasih kerana melaporkan.</div>
          </div>
        ) : (
          <form onSubmit={submit}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
              <h2 style={{ fontSize:18, fontWeight:800, color:C.navy }}>Lapor Isu</h2>
              <button type="button" className="btn" onClick={onClose}
                style={{ background:C.cream, borderRadius:"50%", width:32, height:32, color:C.muted, fontWeight:700 }}>✕</button>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:4 }}>
              <FieldLabel text="Kategori">
                <select value={form.category} onChange={set("category")} style={SEL}>
                  {CATS.slice(1).map((c) => <option key={c}>{c}</option>)}
                </select>
              </FieldLabel>
              <FieldLabel text="Daerah">
                <select value={form.daerah} onChange={set("daerah")} style={SEL}>
                  {DAERAHS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </FieldLabel>
            </div>

            <FieldLabel text="Tajuk Aduan *">
              <input value={form.title} onChange={set("title")} placeholder="Ringkasan isu..." required style={INP}/>
            </FieldLabel>

            <FieldLabel text="Huraian">
              <textarea value={form.description} onChange={set("description")}
                placeholder="Terangkan isu secara terperinci..." rows={4} style={{ ...INP, resize:"vertical" }}/>
            </FieldLabel>

            <div style={{ background:C.cream, borderRadius:10, padding:"10px 14px", margin:"16px 0", fontSize:13, color:C.muted }}>
              🔒 Aduan anda adalah <strong>tanpa nama</strong>. Tiada maklumat peribadi disimpan.
            </div>

            <button type="submit" className="btn" disabled={busy || !form.title.trim()} style={{
              width:"100%", padding:13, borderRadius:12,
              background: busy ? C.muted : C.amber,
              color:C.navy, fontWeight:700, fontSize:16,
            }}>{busy ? "Menghantar…" : "Hantar Aduan"}</button>
          </form>
        )}
      </div>
    </Overlay>
  );
}

/* ─── DonateModal ────────────────────────────────────────────── */
function DonateModal({ post, onClose }) {
  const [amt, setAmt] = useState(10);
  const PRESETS = [5, 10, 20, 50, 100];

  const donationLink = import.meta.env.VITE_DONATION_LINK;
  const bank = {
    name:    import.meta.env.VITE_BANK_NAME    || "Maybank",
    account: import.meta.env.VITE_BANK_ACCOUNT || "—",
    holder:  import.meta.env.VITE_BANK_HOLDER  || "KOMIT Kelantan",
  };

  const handlePay = () => {
    if (donationLink) {
      window.open(`${donationLink}?amount=${amt}&ref=${post.id}`, "_blank");
    } else {
      alert("Sila buat pemindahan bank ke akaun di bawah dan hantar bukti kepada admin KOMIT.");
    }
  };

  return (
    <Overlay onClose={onClose}>
      <div style={{ background:"#fff", borderRadius:20, padding:28, width:"100%", maxWidth:400 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
          <h2 style={{ fontSize:18, fontWeight:800, color:C.navy }}>💛 Derma</h2>
          <button className="btn" onClick={onClose}
            style={{ background:C.cream, borderRadius:"50%", width:32, height:32, color:C.muted, fontWeight:700 }}>✕</button>
        </div>

        <div style={{ background:C.cream, borderRadius:12, padding:"12px 16px", marginBottom:16 }}>
          <div style={{ fontSize:12, color:C.muted, marginBottom:4 }}>Isu</div>
          <div style={{ fontWeight:700, color:C.navy, fontSize:14 }}>{post.title}</div>
        </div>

        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:13, fontWeight:600, color:C.navy, marginBottom:10 }}>Pilih Jumlah (RM)</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 }}>
            {PRESETS.map((a) => (
              <button key={a} className="btn" onClick={() => setAmt(a)} style={{
                padding:"7px 14px", borderRadius:20, fontSize:14, fontWeight:700,
                background: amt === a ? C.amber : C.cream,
                color:       amt === a ? C.navy  : C.muted,
                border:`2px solid ${amt === a ? C.amber : C.border}`,
              }}>RM {a}</button>
            ))}
          </div>
          <input type="number" value={amt} min={1} onChange={(e) => setAmt(Number(e.target.value))}
            style={{ ...INP, width:"100%" }} placeholder="Jumlah lain (RM)"/>
        </div>

        <div style={{ background:"#f8f8f8", border:`1px solid ${C.border}`, borderRadius:12, padding:"14px 16px", marginBottom:16, fontSize:13 }}>
          <div style={{ fontWeight:700, color:C.navy, marginBottom:8 }}>Maklumat Akaun Bank</div>
          <div style={{ lineHeight:2, color:"#444" }}>
            <div><strong>Bank:</strong> {bank.name}</div>
            <div><strong>No. Akaun:</strong> {bank.account}</div>
            <div><strong>Nama:</strong> {bank.holder}</div>
            <div><strong>Rujukan:</strong> {post.id}</div>
          </div>
        </div>

        <button className="btn" onClick={handlePay} style={{
          width:"100%", padding:14, borderRadius:12,
          background:C.amber, color:C.navy, fontWeight:700, fontSize:16, marginBottom:8,
        }}>Bayar Sekarang — RM {amt}</button>

        <button className="btn" onClick={onClose} style={{
          width:"100%", padding:12, borderRadius:12,
          background:"none", color:C.muted, fontWeight:600, fontSize:14,
        }}>Batal</button>
      </div>
    </Overlay>
  );
}

/* ─── Shared ─────────────────────────────────────────────────── */
function Overlay({ children, onClose }) {
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(13,27,42,.75)", backdropFilter:"blur(4px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:16,
    }}>{children}</div>
  );
}

function FieldLabel({ text, children }) {
  return (
    <label style={{ fontSize:13, fontWeight:600, color:C.navy, display:"block", marginBottom:14 }}>
      {text}{children}
    </label>
  );
}
