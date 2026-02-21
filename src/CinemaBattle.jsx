import { useState, useEffect, useRef } from "react";

// =============================================================================
// ⚙️  CONFIGURATION — edit these before deploying
// =============================================================================
//
// Get a free OMDB key at https://www.omdbapi.com/apikey.aspx (1,000 req/day free)
// Then either paste it here directly, or (recommended) set VITE_OMDB_KEY in .env
const OMDB_API_KEY = import.meta.env.VITE_OMDB_KEY || "YOUR_OMDB_KEY_HERE";

// Storage mode:
//   "local"    → localStorage, per-browser (no backend needed, rankings not shared)
//   "supabase" → shared across all users (requires Supabase setup — see README)
const STORAGE_MODE = "supabase";

// If STORAGE_MODE === "supabase", fill these in:
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || "";

// Storage keys (bump version suffix to reset all data)
const MK = "cb-movies-v1";
const PK = "cb-posters-v1";

// =============================================================================
// SEED DATA  —  IMDb Top 100
// =============================================================================
const SEED_MOVIES = [
  { id: 1,   title: "The Shawshank Redemption",                          year: 1994, imdb: 9.3 },
  { id: 2,   title: "The Godfather",                                      year: 1972, imdb: 9.2 },
  { id: 3,   title: "The Dark Knight",                                    year: 2008, imdb: 9.1 },
  { id: 4,   title: "Schindler's List",                                   year: 1993, imdb: 9.0 },
  { id: 5,   title: "The Lord of the Rings: The Return of the King",     year: 2003, imdb: 9.0 },
  { id: 6,   title: "12 Angry Men",                                       year: 1957, imdb: 9.0 },
  { id: 7,   title: "The Godfather Part II",                              year: 1974, imdb: 9.0 },
  { id: 8,   title: "The Lord of the Rings: The Fellowship of the Ring",  year: 2001, imdb: 8.9 },
  { id: 9,   title: "Inception",                                          year: 2010, imdb: 8.8 },
  { id: 10,  title: "Pulp Fiction",                                       year: 1994, imdb: 8.8 },
  { id: 11,  title: "Forrest Gump",                                       year: 1994, imdb: 8.8 },
  { id: 12,  title: "Fight Club",                                         year: 1999, imdb: 8.8 },
  { id: 13,  title: "The Lord of the Rings: The Two Towers",             year: 2002, imdb: 8.8 },
  { id: 14,  title: "The Good, the Bad and the Ugly",                    year: 1966, imdb: 8.8 },
  { id: 15,  title: "Interstellar",                                       year: 2014, imdb: 8.7 },
  { id: 16,  title: "The Matrix",                                         year: 1999, imdb: 8.7 },
  { id: 17,  title: "Goodfellas",                                         year: 1990, imdb: 8.7 },
  { id: 18,  title: "12th Fail",                                          year: 2023, imdb: 8.7 },
  { id: 19,  title: "The Empire Strikes Back",                            year: 1980, imdb: 8.7 },
  { id: 20,  title: "The Silence of the Lambs",                          year: 1991, imdb: 8.6 },
  { id: 21,  title: "Se7en",                                              year: 1995, imdb: 8.6 },
  { id: 22,  title: "The Green Mile",                                     year: 1999, imdb: 8.6 },
  { id: 23,  title: "City of God",                                        year: 2002, imdb: 8.6 },
  { id: 24,  title: "Saving Private Ryan",                                year: 1998, imdb: 8.6 },
  { id: 25,  title: "Life Is Beautiful",                                  year: 1997, imdb: 8.6 },
  { id: 26,  title: "Spirited Away",                                      year: 2001, imdb: 8.6 },
  { id: 27,  title: "One Flew Over the Cuckoo's Nest",                   year: 1975, imdb: 8.6 },
  { id: 28,  title: "Star Wars",                                          year: 1977, imdb: 8.6 },
  { id: 29,  title: "Terminator 2: Judgment Day",                         year: 1991, imdb: 8.6 },
  { id: 30,  title: "It's a Wonderful Life",                              year: 1946, imdb: 8.6 },
  { id: 31,  title: "Seven Samurai",                                      year: 1954, imdb: 8.6 },
  { id: 32,  title: "Harakiri",                                           year: 1962, imdb: 8.6 },
  { id: 33,  title: "Casablanca",                                         year: 1942, imdb: 8.5 },
  { id: 34,  title: "The Prestige",                                       year: 2006, imdb: 8.5 },
  { id: 35,  title: "The Departed",                                       year: 2006, imdb: 8.5 },
  { id: 36,  title: "Parasite",                                           year: 2019, imdb: 8.5 },
  { id: 37,  title: "Django Unchained",                                   year: 2012, imdb: 8.5 },
  { id: 38,  title: "Whiplash",                                           year: 2014, imdb: 8.5 },
  { id: 39,  title: "The Usual Suspects",                                 year: 1995, imdb: 8.5 },
  { id: 40,  title: "Spider-Man: Across the Spider-Verse",               year: 2023, imdb: 8.5 },
  { id: 41,  title: "Gladiator",                                          year: 2000, imdb: 8.5 },
  { id: 42,  title: "Back to the Future",                                 year: 1985, imdb: 8.5 },
  { id: 43,  title: "Leon: The Professional",                             year: 1994, imdb: 8.5 },
  { id: 44,  title: "The Pianist",                                        year: 2002, imdb: 8.5 },
  { id: 45,  title: "The Intouchables",                                   year: 2011, imdb: 8.5 },
  { id: 46,  title: "Alien",                                              year: 1979, imdb: 8.5 },
  { id: 47,  title: "The Lion King",                                      year: 1994, imdb: 8.5 },
  { id: 48,  title: "American History X",                                 year: 1998, imdb: 8.5 },
  { id: 49,  title: "Grave of the Fireflies",                             year: 1988, imdb: 8.5 },
  { id: 50,  title: "Psycho",                                             year: 1960, imdb: 8.5 },
  { id: 51,  title: "Cinema Paradiso",                                    year: 1988, imdb: 8.5 },
  { id: 52,  title: "Once Upon a Time in the West",                      year: 1968, imdb: 8.5 },
  { id: 53,  title: "Rear Window",                                        year: 1954, imdb: 8.5 },
  { id: 54,  title: "Modern Times",                                       year: 1936, imdb: 8.5 },
  { id: 55,  title: "City Lights",                                        year: 1931, imdb: 8.5 },
  { id: 56,  title: "Inglourious Basterds",                               year: 2009, imdb: 8.4 },
  { id: 57,  title: "Good Will Hunting",                                  year: 1997, imdb: 8.4 },
  { id: 58,  title: "Dune: Part Two",                                     year: 2024, imdb: 8.4 },
  { id: 59,  title: "Memento",                                            year: 2000, imdb: 8.4 },
  { id: 60,  title: "The Shining",                                        year: 1980, imdb: 8.4 },
  { id: 61,  title: "Spider-Man: Into the Spider-Verse",                 year: 2018, imdb: 8.4 },
  { id: 62,  title: "Avengers: Endgame",                                  year: 2019, imdb: 8.4 },
  { id: 63,  title: "The Dark Knight Rises",                              year: 2012, imdb: 8.4 },
  { id: 64,  title: "Apocalypse Now",                                     year: 1979, imdb: 8.4 },
  { id: 65,  title: "Your Name",                                          year: 2016, imdb: 8.4 },
  { id: 66,  title: "Avengers: Infinity War",                             year: 2018, imdb: 8.4 },
  { id: 67,  title: "Raiders of the Lost Ark",                            year: 1981, imdb: 8.4 },
  { id: 68,  title: "The Lives of Others",                                year: 2006, imdb: 8.4 },
  { id: 69,  title: "Amadeus",                                            year: 1984, imdb: 8.4 },
  { id: 70,  title: "WALL-E",                                             year: 2008, imdb: 8.4 },
  { id: 71,  title: "Coco",                                               year: 2017, imdb: 8.4 },
  { id: 72,  title: "Aliens",                                             year: 1986, imdb: 8.4 },
  { id: 73,  title: "3 Idiots",                                           year: 2009, imdb: 8.4 },
  { id: 74,  title: "Capernaum",                                          year: 2018, imdb: 8.4 },
  { id: 75,  title: "Sunset Boulevard",                                   year: 1950, imdb: 8.4 },
  { id: 76,  title: "Paths of Glory",                                     year: 1957, imdb: 8.4 },
  { id: 77,  title: "High and Low",                                       year: 1963, imdb: 8.4 },
  { id: 78,  title: "Witness for the Prosecution",                        year: 1957, imdb: 8.4 },
  { id: 79,  title: "The Great Dictator",                                 year: 1940, imdb: 8.4 },
  { id: 80,  title: "Eternal Sunshine of the Spotless Mind",             year: 2004, imdb: 8.3 },
  { id: 81,  title: "Oldboy",                                             year: 2003, imdb: 8.3 },
  { id: 82,  title: "Requiem for a Dream",                                year: 2000, imdb: 8.3 },
  { id: 83,  title: "The Hunt",                                           year: 2012, imdb: 8.3 },
  { id: 84,  title: "Braveheart",                                         year: 1995, imdb: 8.3 },
  { id: 85,  title: "American Beauty",                                    year: 1999, imdb: 8.3 },
  { id: 86,  title: "Incendies",                                          year: 2010, imdb: 8.3 },
  { id: 87,  title: "Toy Story",                                          year: 1995, imdb: 8.3 },
  { id: 88,  title: "2001: A Space Odyssey",                              year: 1968, imdb: 8.3 },
  { id: 89,  title: "Joker",                                              year: 2019, imdb: 8.3 },
  { id: 90,  title: "Once Upon a Time in America",                       year: 1984, imdb: 8.3 },
  { id: 91,  title: "Come and See",                                       year: 1985, imdb: 8.3 },
  { id: 92,  title: "Princess Mononoke",                                  year: 1997, imdb: 8.3 },
  { id: 93,  title: "Toy Story 3",                                        year: 2010, imdb: 8.3 },
  { id: 94,  title: "Dr. Strangelove",                                    year: 1964, imdb: 8.3 },
  { id: 95,  title: "Lawrence of Arabia",                                 year: 1962, imdb: 8.3 },
  { id: 96,  title: "Return of the Jedi",                                 year: 1983, imdb: 8.3 },
  { id: 97,  title: "The Apartment",                                      year: 1960, imdb: 8.3 },
  { id: 98,  title: "Das Boot",                                           year: 1981, imdb: 8.3 },
  { id: 99,  title: "Singin' in the Rain",                               year: 1952, imdb: 8.3 },
  { id: 100, title: "Ikiru",                                              year: 1952, imdb: 8.3 },
];

// =============================================================================
// STORAGE  —  localStorage (local mode) or Supabase (shared mode)
// =============================================================================

// --- Local (localStorage) ---
function localGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function localSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

// --- Supabase (shared) ---
// Minimal Supabase REST client — no SDK needed.
// Table schema (run once in your Supabase SQL editor):
//
//   create table cinema_battle (
//     key text primary key,
//     value text not null,
//     updated_at timestamptz default now()
//   );
//   alter table cinema_battle enable row level security;
//   create policy "public read"  on cinema_battle for select using (true);
//   create policy "public write" on cinema_battle for all    using (true);
//
async function supabaseGet(key) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/cinema_battle?key=eq.${encodeURIComponent(key)}&select=value`, {
      headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` },
    });
    const rows = await res.json();
    return rows?.[0]?.value ? JSON.parse(rows[0].value) : null;
  } catch { return null; }
}
async function supabaseSet(key, val) {
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/cinema_battle`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}`,
        "Content-Type": "application/json", Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ key, value: JSON.stringify(val) }),
    });
  } catch {}
}

// Unified storage API
async function sget(key) {
  return STORAGE_MODE === "supabase" ? supabaseGet(key) : localGet(key);
}
async function sset(key, val) {
  return STORAGE_MODE === "supabase" ? supabaseSet(key, val) : localSet(key, val);
}

// =============================================================================
// POSTER FETCHING  —  OMDB API
// =============================================================================
// OMDB is a proper REST API with no CORS restrictions on real websites.
// Free tier: 1,000 requests/day — enough for all 100 seed movies plus cache.
// Posters are cached in storage so each film is only fetched once ever.

async function fetchOMDBPoster(title, year) {
  if (!OMDB_API_KEY || OMDB_API_KEY === "YOUR_OMDB_KEY_HERE") return null;
  try {
    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(title)}&y=${year}&type=movie&apikey=${OMDB_API_KEY}`;
    const res  = await fetch(url);
    const data = await res.json();
    if (data?.Poster && data.Poster !== "N/A") return data.Poster;
    // Retry without year if no result
    if (year) {
      const res2  = await fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&type=movie&apikey=${OMDB_API_KEY}`);
      const data2 = await res2.json();
      if (data2?.Poster && data2.Poster !== "N/A") return data2.Poster;
    }
    return null;
  } catch { return null; }
}

// =============================================================================
// ELO
// =============================================================================
const K = 32;
function calcElo(wElo, lElo) {
  const e = 1 / (1 + Math.pow(10, (lElo - wElo) / 400));
  return { wNew: Math.round(wElo + K * (1 - e)), lNew: Math.round(lElo + K * -e) };
}

// =============================================================================
// GENERATIVE COLOR PALETTE
// =============================================================================
function pal(id) {
  const h = (id * 137.508) % 360, ac = (h + 190) % 360;
  return {
    grad:   `linear-gradient(155deg,hsl(${h},42%,8%) 0%,hsl(${(h+40)%360},52%,18%) 100%)`,
    border: `hsl(${ac},55%,38%)`,
    glow:   `hsl(${ac},70%,55%)`,
    accent: `hsl(${ac},80%,70%)`,
  };
}

// =============================================================================
// PAIR SELECTION  —  55% Elo-adjacent, 45% random, session deduplication
// =============================================================================
function pickPair(movies, seen) {
  const s = [...movies].sort((a, b) => b.elo - a.elo);
  for (let t = 0; t < 150; t++) {
    let a, b;
    if (Math.random() < 0.55 && s.length > 4) {
      const i   = Math.floor(Math.random() * (s.length - 1));
      const off = 1 + Math.floor(Math.random() * Math.min(6, s.length - i - 1));
      a = s[i]; b = s[Math.min(i + off, s.length - 1)];
    } else {
      const i = Math.floor(Math.random() * movies.length);
      let j   = Math.floor(Math.random() * movies.length);
      while (j === i) j = Math.floor(Math.random() * movies.length);
      a = movies[i]; b = movies[j];
    }
    if (!a || !b || a.id === b.id) continue;
    const key = [a.id, b.id].sort().join("_");
    if (!seen.has(key)) { seen.add(key); return [a, b]; }
  }
  return [movies[0], movies[1]];
}

// =============================================================================
// GLOBAL CSS
// =============================================================================
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{height:100%;background:#06060c;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:#080810;}
::-webkit-scrollbar-thumb{background:#222232;border-radius:3px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
@keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
@keyframes pls{0%,100%{opacity:.3;}50%{opacity:.9;}}
@keyframes scaleIn{from{transform:scale(.93);opacity:0;}to{transform:scale(1);opacity:1;}}
@keyframes spin{to{transform:rotate(360deg);}}
@keyframes grain{
  0%,100%{transform:translate(0,0);}10%{transform:translate(-2%,-3%);}
  20%{transform:translate(3%,1%);}30%{transform:translate(-1%,4%);}
  40%{transform:translate(4%,-2%);}50%{transform:translate(-3%,3%);}
  60%{transform:translate(2%,-4%);}70%{transform:translate(-4%,1%);}
  80%{transform:translate(1%,3%);}90%{transform:translate(-2%,-1%);}
}
.ci{cursor:pointer;transition:transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .3s;}
.ci:hover{transform:translateY(-7px) scale(1.026)!important;}
.ci:hover .hr{opacity:1!important;}
.ci:hover .vc{opacity:1!important;transform:translate(-50%,-50%)!important;}
.bg:hover{opacity:.85!important;transform:translateY(-1px)!important;}
.gh:hover{background:rgba(255,255,255,.09)!important;}
.sk:hover{border-color:rgba(255,255,255,.3)!important;color:rgba(255,255,255,.65)!important;}
.rr:hover{background:rgba(255,255,255,.04)!important;}
`;

// =============================================================================
// POSTER COMPONENT
// =============================================================================
function Poster({ url, title, p, mini = false }) {
  // url: undefined = fetching, null = not found, string = ready
  const [phase, setPhase] = useState(url === undefined ? "wait" : url ? "img" : "none");

  useEffect(() => {
    if (url === undefined) setPhase("wait");
    else if (!url)         setPhase("none");
    else                   setPhase("img");
  }, [url]);

  if (phase === "wait") return (
    <div style={{ width:"100%",height:"100%",background:p.grad,display:"flex",alignItems:"center",justifyContent:"center" }}>
      <div style={{ width:mini?14:22,height:mini?14:22,borderRadius:"50%",border:`2px solid ${p.glow}40`,borderTopColor:p.glow,animation:"spin .9s linear infinite" }} />
    </div>
  );

  if (phase === "none" || !url) return (
    <div style={{ width:"100%",height:"100%",background:p.grad,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6 }}>
      <span style={{ fontSize:mini?16:32,opacity:.15,color:p.glow }}>✦</span>
      {!mini && <span style={{ fontFamily:"'DM Mono',monospace",fontSize:"8px",letterSpacing:"2px",color:"rgba(255,255,255,.1)" }}>NO POSTER</span>}
    </div>
  );

  return (
    <img
      src={url}
      alt={title}
      onError={() => setPhase("none")}
      style={{ width:"100%",height:"100%",objectFit:"cover",display:"block" }}
    />
  );
}

// =============================================================================
// BATTLE CARD
// =============================================================================
function Card({ movie, posterUrl, state, onClick }) {
  const p    = pal(movie.id);
  const win  = state === "winner", lose = state === "loser", idle = state === "idle";
  const tot  = (movie.wins||0) + (movie.losses||0);
  const wr   = tot > 0 ? Math.round((movie.wins / tot) * 100) : null;
  const fs   = movie.title.length > 32 ? "14px" : movie.title.length > 22 ? "18px" : "22px";

  return (
    <div
      onClick={idle ? onClick : undefined}
      className={idle ? "ci" : ""}
      style={{
        flex:1, borderRadius:20, overflow:"hidden", position:"relative",
        minHeight:440, display:"flex", flexDirection:"column", userSelect:"none",
        border: win ? `2px solid ${p.glow}` : `1px solid ${p.border}40`,
        boxShadow: win
          ? `0 0 0 1px ${p.glow}80,0 0 80px ${p.glow}50,0 20px 60px rgba(0,0,0,.7)`
          : "0 8px 40px rgba(0,0,0,.55)",
        transform: win ? "scale(1.04)" : lose ? "scale(0.91)" : "scale(1)",
        opacity: lose ? 0.2 : 1,
        transition: "transform .4s cubic-bezier(.34,1.56,.64,1),opacity .4s,box-shadow .4s",
        animation: idle ? "scaleIn .38s ease both" : undefined,
      }}
    >
      {/* Poster */}
      <div style={{ position:"absolute",inset:0 }}>
        <Poster url={posterUrl} title={movie.title} p={p} />
      </div>

      {/* Vignette */}
      <div style={{ position:"absolute",inset:0,background:"linear-gradient(to top,#000000f8 0%,#00000080 42%,#00000018 76%,transparent 100%)" }} />

      {/* Hover ring */}
      {idle && <div className="hr" style={{ position:"absolute",inset:0,borderRadius:19,border:`2px solid ${p.glow}`,background:`${p.glow}0c`,opacity:0,transition:"opacity .25s" }} />}

      {/* Badges */}
      <div style={{ position:"absolute",top:14,left:14,right:14,display:"flex",justifyContent:"space-between",zIndex:3 }}>
        {movie.imdb
          ? <div style={{ background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)",borderRadius:8,padding:"5px 11px",display:"flex",alignItems:"center",gap:5,border:"1px solid rgba(212,175,55,.35)" }}>
              <span style={{ color:"#D4AF37",fontSize:11 }}>★</span>
              <span style={{ color:"#D4AF37",fontSize:11,fontFamily:"'DM Mono',monospace",fontWeight:500 }}>{movie.imdb}</span>
            </div>
          : <div />}
        <div style={{ background:"rgba(0,0,0,.75)",backdropFilter:"blur(10px)",borderRadius:8,padding:"5px 11px",fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,.55)",border:"1px solid rgba(255,255,255,.1)" }}>{movie.year}</div>
      </div>

      {/* Vote chip on hover */}
      {idle && (
        <div className="vc" style={{ position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,calc(-50% + 10px))",opacity:0,transition:"opacity .25s,transform .25s",zIndex:4,whiteSpace:"nowrap",background:"rgba(0,0,0,.82)",backdropFilter:"blur(14px)",border:`1px solid ${p.glow}60`,borderRadius:10,padding:"9px 20px",fontFamily:"'DM Mono',monospace",fontSize:11,color:p.accent,letterSpacing:"2px" }}>
          VOTE FOR THIS FILM
        </div>
      )}

      {/* Winner flash */}
      {win && (
        <div style={{ position:"absolute",inset:0,zIndex:5,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.32)",animation:"fadeIn .2s ease" }}>
          <div style={{ background:p.glow,color:"#000",fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:500,padding:"14px 30px",borderRadius:12,letterSpacing:"3px",boxShadow:`0 0 60px ${p.glow}` }}>WINNER ✦</div>
        </div>
      )}

      {/* Bottom */}
      <div style={{ position:"absolute",bottom:0,left:0,right:0,padding:"22px 18px",zIndex:3 }}>
        <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:fs,fontWeight:700,lineHeight:1.2,color:"#fff",marginBottom:8,textShadow:"0 2px 16px #000,0 0 40px rgba(0,0,0,.8)" }}>{movie.title}</h2>
        {wr !== null
          ? <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.5)",background:"rgba(0,0,0,.6)",backdropFilter:"blur(4px)",padding:"3px 9px",borderRadius:5,border:"1px solid rgba(255,255,255,.1)" }}>{wr}% wins · {tot} battles</span>
          : <span style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.25)" }}>no battles yet</span>}
      </div>
    </div>
  );
}

// =============================================================================
// HOME
// =============================================================================
function Home({ movies, total, onStart, onResults, onAdd }) {
  const top3 = [...movies].sort((a, b) => b.elo - a.elo).slice(0, 3);
  const gh   = { background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,fontFamily:"'DM Mono',monospace",cursor:"pointer",transition:"all .2s",letterSpacing:"1.5px",color:"rgba(255,255,255,.6)" };
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"40px 20px",background:"#06060c" }}>
      <div style={{ textAlign:"center",maxWidth:560,animation:"fadeUp .55s ease both" }}>
        <div style={{ marginBottom:24 }}>
          <span style={{ display:"inline-flex",alignItems:"center",gap:8,background:"rgba(212,175,55,.08)",border:"1px solid rgba(212,175,55,.18)",borderRadius:100,padding:"6px 18px",fontSize:10,letterSpacing:"3px",color:"#D4AF37",fontFamily:"'DM Mono',monospace" }}>✦ CINEMA BATTLE ✦</span>
        </div>
        <h1 style={{ fontFamily:"'Playfair Display',serif",fontSize:"clamp(48px,10vw,84px)",fontWeight:900,lineHeight:.95,color:"#fff",letterSpacing:"-1px" }}>
          Which film<br /><em style={{ color:"#D4AF37" }}>reigns supreme?</em>
        </h1>
        <p style={{ color:"rgba(255,255,255,.38)",fontSize:15,fontFamily:"'DM Mono',monospace",marginTop:24,marginBottom:44,lineHeight:1.75,letterSpacing:".3px" }}>
          Vote head-to-head. The crowd decides.<br />Skip anything you haven't seen.
        </p>
        <div style={{ display:"flex",justifyContent:"center",gap:44,marginBottom:44,flexWrap:"wrap" }}>
          {[{l:"Films",v:movies.length},{l:"Battles Cast",v:total.toLocaleString()}].map(s => (
            <div key={s.l} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:36,fontWeight:700,color:"#D4AF37" }}>{s.v}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:"rgba(255,255,255,.22)",letterSpacing:"2.5px",marginTop:4 }}>{s.l.toUpperCase()}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:10,alignItems:"center" }}>
          <button onClick={onStart} className="bg" style={{ background:"#D4AF37",color:"#06060c",border:"none",borderRadius:14,padding:"18px 48px",fontSize:14,fontFamily:"'DM Mono',monospace",letterSpacing:"2px",fontWeight:500,cursor:"pointer",transition:"all .2s",width:"100%",maxWidth:320 }}>START VOTING →</button>
          <div style={{ display:"flex",gap:10,width:"100%",maxWidth:320 }}>
            <button onClick={onResults} className="gh" style={{ ...gh,flex:1,padding:14,fontSize:11 }}>RANKINGS</button>
            <button onClick={onAdd}    className="gh" style={{ ...gh,flex:1,padding:14,fontSize:11 }}>+ ADD FILM</button>
          </div>
        </div>
      </div>

      {top3.length > 0 && (
        <div style={{ marginTop:60,width:"100%",maxWidth:440,animation:"fadeUp .7s .25s ease both",opacity:0 }}>
          <div style={{ textAlign:"center",marginBottom:14,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"3px",color:"rgba(255,255,255,.18)" }}>CURRENT LEADERS</div>
          {top3.map((m, i) => {
            const p = pal(m.id);
            return (
              <div key={m.id} style={{ display:"flex",alignItems:"center",gap:14,background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.06)",borderRadius:12,padding:"12px 16px",marginBottom:8 }}>
                <span style={{ fontSize:22 }}>{"🥇🥈🥉"[i]}</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontFamily:"'Playfair Display',serif",fontSize:15,color:"#fff",fontWeight:600 }}>{m.title}</div>
                  <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.28)",marginTop:2 }}>{m.year}</div>
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:p.accent }}>{m.elo}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// =============================================================================
// BATTLE
// =============================================================================
function Battle({ pair, posters, winner, sess, skips, onPick, onSkip, onOut }) {
  const [key, setKey] = useState(0);
  const prev = useRef("");
  useEffect(() => {
    if (!pair) return;
    const k = `${pair[0].id}_${pair[1].id}`;
    if (k !== prev.current) { setKey(n => n + 1); prev.current = k; }
  }, [pair]);
  if (!pair) return null;
  const [a, b] = pair;

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",background:"#06060c" }}>
      {/* Header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 20px",borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.18)",letterSpacing:"2px" }}>✦ CINEMA BATTLE</div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.28)" }}>
          {sess} voted{skips > 0 ? ` · ${skips} skipped` : ""}
        </div>
        <button onClick={onOut} className="gh" style={{ background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:8,padding:"7px 16px",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px",color:"rgba(255,255,255,.38)",cursor:"pointer",transition:"all .2s" }}>TAP OUT</button>
      </div>

      <div style={{ textAlign:"center",padding:"20px 0 14px" }}>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"3px",color:"rgba(255,255,255,.18)" }}>WHICH IS THE GREATER FILM?</div>
      </div>

      {/* Cards */}
      <div key={key} style={{ display:"flex",gap:14,flex:1,maxWidth:940,margin:"0 auto",width:"100%",padding:"0 16px",alignItems:"stretch" }}>
        <Card movie={a} posterUrl={posters[a.id]} state={winner===null?"idle":winner===a.id?"winner":"loser"} onClick={() => onPick(a.id)} />
        <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",flexShrink:0,width:38 }}>
          <div style={{ flex:1,width:1,background:"linear-gradient(to bottom,transparent,rgba(212,175,55,.2),transparent)" }} />
          <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:900,fontSize:17,color:"#D4AF37",opacity:.6,writingMode:"vertical-rl",padding:"14px 0",letterSpacing:"3px" }}>VS</div>
          <div style={{ flex:1,width:1,background:"linear-gradient(to bottom,rgba(212,175,55,.2),transparent)" }} />
        </div>
        <Card movie={b} posterUrl={posters[b.id]} state={winner===null?"idle":winner===b.id?"winner":"loser"} onClick={() => onPick(b.id)} />
      </div>

      {/* Bottom */}
      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:14,padding:"18px 0 28px" }}>
        {winner === null ? (
          <>
            <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"2px",color:"rgba(255,255,255,.16)",animation:"pls 2.5s ease-in-out infinite" }}>TAP A POSTER TO VOTE</div>
            <button onClick={onSkip} className="sk" style={{ background:"transparent",border:"1px solid rgba(255,255,255,.12)",borderRadius:100,padding:"9px 26px",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"2px",color:"rgba(255,255,255,.28)",cursor:"pointer",transition:"all .2s",display:"flex",alignItems:"center",gap:8 }}>
              <span style={{ fontSize:13,opacity:.55 }}>⟳</span> SKIP — HAVEN'T SEEN BOTH
            </button>
          </>
        ) : (
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"2px",color:"rgba(255,255,255,.18)",animation:"pls 1s ease-in-out infinite" }}>NEXT MATCHUP LOADING…</div>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// RESULTS
// =============================================================================
function Results({ movies, posters, onBack, onBattle }) {
  const [q, setQ] = useState("");
  const sorted   = [...movies].sort((a, b) => b.elo - a.elo);
  const filtered = q ? sorted.filter(m => m.title.toLowerCase().includes(q.toLowerCase()) || String(m.year).includes(q)) : sorted;
  const medals   = ["🥇","🥈","🥉"];

  return (
    <div style={{ minHeight:"100vh",background:"#06060c",display:"flex",flexDirection:"column" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 24px",borderBottom:"1px solid rgba(255,255,255,.05)",position:"sticky",top:0,background:"#06060cee",backdropFilter:"blur(12px)",zIndex:10 }}>
        <button onClick={onBack} className="gh" style={{ background:"transparent",border:"none",color:"rgba(255,255,255,.38)",fontFamily:"'DM Mono',monospace",fontSize:11,cursor:"pointer",letterSpacing:"1px",transition:"all .2s" }}>← BACK</button>
        <div style={{ fontFamily:"'Playfair Display',serif",fontWeight:700,fontSize:18,color:"#fff" }}>The Definitive List</div>
        <button onClick={onBattle} className="bg" style={{ background:"#D4AF37",color:"#06060c",border:"none",borderRadius:8,padding:"8px 18px",fontSize:10,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px",fontWeight:500,cursor:"pointer",transition:"all .2s" }}>KEEP VOTING</button>
      </div>

      <div style={{ padding:"14px 24px 6px" }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search films…" style={{ width:"100%",maxWidth:360,background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:10,padding:"11px 16px",fontSize:13,color:"#fff",fontFamily:"'DM Mono',monospace",outline:"none" }} />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"46px 44px 1fr 68px 64px 60px",padding:"10px 24px",gap:10,borderBottom:"1px solid rgba(255,255,255,.05)" }}>
        {["#","","FILM","ELO","W-L","BATTLES"].map(h => (
          <div key={h} style={{ fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:"2px",color:"rgba(255,255,255,.18)" }}>{h}</div>
        ))}
      </div>

      <div style={{ flex:1,overflowY:"auto" }}>
        {filtered.map(m => {
          const rank = sorted.indexOf(m); const p = pal(m.id); const tot = (m.wins||0)+(m.losses||0); const top = rank < 3;
          return (
            <div key={m.id} className="rr" style={{ display:"grid",gridTemplateColumns:"46px 44px 1fr 68px 64px 60px",padding:"11px 24px",gap:10,alignItems:"center",borderBottom:"1px solid rgba(255,255,255,.04)",transition:"background .15s" }}>
              <div style={{ fontFamily:"'Playfair Display',serif",fontSize:top?20:13,fontWeight:top?700:400,color:top?"#D4AF37":"rgba(255,255,255,.2)" }}>{rank < 3 ? medals[rank] : rank + 1}</div>
              <div style={{ width:32,height:48,borderRadius:5,overflow:"hidden",border:`1px solid ${p.border}40`,position:"relative",flexShrink:0 }}>
                <Poster url={posters[m.id]} title={m.title} p={p} mini />
              </div>
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:top?600:400,color:top?"#fff":"rgba(255,255,255,.72)",lineHeight:1.3 }}>
                  {m.title}{m.userAdded && <span style={{ marginLeft:6,fontSize:9,color:p.accent,fontFamily:"'DM Mono',monospace",letterSpacing:"1px" }}>★ USER</span>}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:"rgba(255,255,255,.2)",marginTop:2 }}>{m.year}{m.imdb ? ` · ★ ${m.imdb}` : ""}</div>
              </div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:p.accent,fontWeight:500 }}>{m.elo}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,.38)" }}>{m.wins}-{m.losses}</div>
              <div style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,.22)" }}>{tot || "—"}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// =============================================================================
// ADD MOVIE
// =============================================================================
function AddMovie({ onCancel, onSubmit }) {
  const [title, setTitle] = useState(""); const [year, setYear] = useState(""); const [err, setErr] = useState("");
  const inp = { width:"100%",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.12)",borderRadius:12,padding:"16px 18px",fontSize:15,color:"#fff",fontFamily:"'Playfair Display',serif",outline:"none" };
  const go  = () => { if (!title.trim()) { setErr("Please enter a title."); return; } onSubmit(title.trim(), year ? parseInt(year) : new Date().getFullYear()); };
  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:"#06060c",padding:"40px 20px" }}>
      <div style={{ width:"100%",maxWidth:480,animation:"scaleIn .3s ease" }}>
        <div style={{ marginBottom:32 }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,letterSpacing:"3px",color:"#D4AF37",marginBottom:12 }}>✦ ADD A FILM</div>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:34,fontWeight:700,color:"#fff",lineHeight:1.15 }}>Nominate a<br /><em>new contender</em></h2>
          <p style={{ fontFamily:"'DM Mono',monospace",fontSize:11,color:"rgba(255,255,255,.32)",marginTop:14,lineHeight:1.75 }}>Enters at 1500 ELO, rankings saved locally. Poster fetched from OMDB.</p>
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <input value={title} onChange={e => { setTitle(e.target.value); setErr(""); }} placeholder="Movie title" autoFocus style={inp} onKeyDown={e => e.key === "Enter" && go()} />
          <input value={year}  onChange={e => setYear(e.target.value)} placeholder="Year (optional)" type="number" style={{...inp,fontFamily:"'DM Mono',monospace"}} onKeyDown={e => e.key === "Enter" && go()} />
          {err && <div style={{ color:"#ff6b6b",fontFamily:"'DM Mono',monospace",fontSize:12 }}>{err}</div>}
          <div style={{ display:"flex",gap:12,marginTop:8 }}>
            <button onClick={onCancel} className="gh" style={{ flex:1,background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,padding:16,fontSize:11,fontFamily:"'DM Mono',monospace",letterSpacing:"1.5px",color:"rgba(255,255,255,.45)",cursor:"pointer",transition:"all .2s" }}>CANCEL</button>
            <button onClick={go}       className="bg" style={{ flex:2,background:"#D4AF37",color:"#06060c",border:"none",borderRadius:12,padding:16,fontSize:12,fontFamily:"'DM Mono',monospace",letterSpacing:"2px",fontWeight:500,cursor:"pointer",transition:"all .2s" }}>ADD TO BATTLE →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// APP
// =============================================================================
export default function CinemaBattle() {
  const [view,    setView]    = useState("loading");
  const [movies,  setMovies]  = useState([]);
  const [posters, setPosters] = useState({});  // id → url | null | undefined
  const [pair,    setPair]    = useState(null);
  const [winner,  setWinner]  = useState(null);
  const [sess,    setSess]    = useState(0);
  const [skips,   setSkips]   = useState(0);
  const [locked,  setLocked]  = useState(false);
  const seen       = useRef(new Set());
  const postersRef = useRef({});

  useEffect(() => { postersRef.current = posters; }, [posters]);

  // Inject CSS + fonts
  useEffect(() => {
    const s = document.createElement("style"); s.textContent = CSS; document.head.appendChild(s);
    const l = document.createElement("link"); l.rel = "stylesheet";
    l.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,900;1,400&family=DM+Mono:wght@300;400;500&display=swap";
    document.head.appendChild(l);
    return () => { try { document.head.removeChild(s); document.head.removeChild(l); } catch {} };
  }, []);

  useEffect(() => { init(); }, []);

  async function init() {
    // Load or seed movies
    const stored = await sget(MK);
    const ms = (stored && Array.isArray(stored) && stored.length > 0)
      ? stored
      : SEED_MOVIES.map(m => ({ ...m, elo:1500, wins:0, losses:0 }));
    if (!stored) await sset(MK, ms);
    setMovies(ms);

    // Load cached posters — anything not cached starts as undefined (fetching)
    const cachedPosters = (await sget(PK)) || {};
    const initMap = {};
    for (const m of ms) initMap[m.id] = cachedPosters[m.id];  // undefined if not yet fetched
    setPosters(initMap);
    postersRef.current = initMap;

    setView("home");

    // Background-fetch all missing posters in batches
    fetchInBackground(ms, cachedPosters);
  }

  async function fetchInBackground(ms, existing) {
    const BATCH     = 5;    // parallel requests per batch
    const allCache  = { ...existing };
    const needed    = ms.filter(m => allCache[m.id] === undefined);

    for (let i = 0; i < needed.length; i += BATCH) {
      const chunk = needed.slice(i, i + BATCH);
      const results = await Promise.all(
        chunk.map(async m => {
          const url = await fetchOMDBPoster(m.title, m.year);
          return [m.id, url];
        })
      );

      for (const [id, url] of results) allCache[id] = url;

      // Update state after each batch so cards populate progressively
      const next = { ...postersRef.current };
      for (const [id, url] of results) next[id] = url;
      setPosters(next);
      postersRef.current = next;
      await sset(PK, allCache);
    }
  }

  async function ensurePosters(ids) {
    const needed = ids.filter(id => postersRef.current[id] === undefined);
    if (!needed.length) return;
    const ms = movies.filter(m => needed.includes(m.id));
    const results = await Promise.all(ms.map(async m => [m.id, await fetchOMDBPoster(m.title, m.year)]));
    const next = { ...postersRef.current };
    for (const [id, url] of results) next[id] = url;
    setPosters(next); postersRef.current = next;
    const cache = (await sget(PK)) || {};
    for (const [id, url] of results) cache[id] = url;
    await sset(PK, cache);
  }

  function startBattle(pool) {
    const p = pickPair(pool || movies, seen.current);
    setPair(p); setWinner(null); setView("battle");
    ensurePosters([p[0].id, p[1].id]);
  }

  async function handlePick(winId) {
    if (locked || winner !== null) return;
    setLocked(true); setWinner(winId);
    const loseId = pair[0].id === winId ? pair[1].id : pair[0].id;
    await new Promise(r => setTimeout(r, 1200));
    const cur = (await sget(MK)) || movies;
    const wm  = cur.find(m => m.id === winId), lm = cur.find(m => m.id === loseId);
    if (wm && lm) {
      const { wNew, lNew } = calcElo(wm.elo, lm.elo);
      const updated = cur.map(m =>
        m.id === winId   ? { ...m, elo:wNew,  wins:(m.wins||0)+1 }   :
        m.id === loseId  ? { ...m, elo:lNew, losses:(m.losses||0)+1 } : m
      );
      await sset(MK, updated);
      setMovies(updated);
      setSess(c => c + 1);
      const next = pickPair(updated, seen.current);
      setPair(next); setWinner(null);
      ensurePosters([next[0].id, next[1].id]);
    }
    setLocked(false);
  }

  function handleSkip() {
    if (locked || winner !== null) return;
    setSkips(c => c + 1);
    const next = pickPair(movies, seen.current);
    setPair(next);
    ensurePosters([next[0].id, next[1].id]);
  }

  async function handleAdd(title, year) {
    const cur = (await sget(MK)) || movies;
    if (cur.find(m => m.title.toLowerCase() === title.toLowerCase())) return;
    const newId = Math.max(...cur.map(m => m.id), 100) + 1;
    const newM  = { id:newId, title, year:year||new Date().getFullYear(), imdb:null, elo:1500, wins:0, losses:0, userAdded:true };
    const updated = [...cur, newM];
    await sset(MK, updated);
    setMovies(updated);
    setPosters(p => ({ ...p, [newId]: undefined }));
    // Fetch poster for new film
    fetchOMDBPoster(title, year).then(async url => {
      const next = { ...postersRef.current, [newId]: url };
      setPosters(next); postersRef.current = next;
      const cache = (await sget(PK)) || {}; cache[newId] = url; await sset(PK, cache);
    });
    setView("home");
  }

  const totalBattles = movies.reduce((s, m) => s + (m.wins||0), 0);

  if (view === "loading") return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:28,background:"#06060c" }}>
      <div style={{ fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#fff",fontStyle:"italic" }}>Cinema Battle</div>
      <div style={{ fontFamily:"'DM Mono',monospace",fontSize:11,letterSpacing:"3px",color:"#D4AF37",animation:"pls 1.4s ease-in-out infinite" }}>LOADING…</div>
    </div>
  );

  return (
    <>
      {/* Film grain overlay */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:999,opacity:.022,
        backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize:"128px",animation:"grain .8s steps(1) infinite" }} />

      {view==="home"    && <Home    movies={movies} total={totalBattles} onStart={() => startBattle(movies)} onResults={async () => { const s = await sget(MK); if (s) setMovies(s); setView("results"); }} onAdd={() => setView("add")} />}
      {view==="battle"  && <Battle  pair={pair} posters={posters} winner={winner} sess={sess} skips={skips} onPick={handlePick} onSkip={handleSkip} onOut={async () => { const s = await sget(MK); if (s) setMovies(s); setView("results"); }} />}
      {view==="results" && <Results movies={movies} posters={posters} onBack={() => setView("home")} onBattle={() => startBattle(movies)} />}
      {view==="add"     && <AddMovie onCancel={() => setView("home")} onSubmit={handleAdd} />}
    </>
  );
}
