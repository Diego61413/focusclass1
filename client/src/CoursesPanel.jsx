// client/src/CoursesPanel.jsx
import { useState, useMemo } from "react";
import API from "./api.js";

const CATS = ["Todos","Matemáticas","Tecnología","Historia","Ciencias","Idiomas","Arte","Negocios"];

const MOCK_COURSES = [
  { id:"cr1", title:"Álgebra Lineal Completo", instructor:"Prof. Martínez", category:"Matemáticas", price:299, free:false, rating:4.8, students:1240, thumb:"🔢", duration:"12h", lessons:48, level:"Intermedio", tags:["álgebra","vectores","matrices"], published:true },
  { id:"cr2", title:"Introducción a la Programación", instructor:"Prof. García", category:"Tecnología", price:0, free:true, rating:4.9, students:3820, thumb:"💻", duration:"8h", lessons:32, level:"Principiante", tags:["python","lógica","código"], published:true },
  { id:"cr3", title:"Historia Universal Moderna", instructor:"Prof. López", category:"Historia", price:199, free:false, rating:4.6, students:890, thumb:"🌍", duration:"15h", lessons:60, level:"Todos", tags:["historia","cultura","política"], published:true },
  { id:"cr4", title:"Química Orgánica Avanzada", instructor:"Prof. Torres", category:"Ciencias", price:349, free:false, rating:4.7, students:560, thumb:"⚗️", duration:"20h", lessons:80, level:"Avanzado", tags:["química","orgánica","reacciones"], published:true },
  { id:"cr5", title:"Inglés Conversacional B2", instructor:"Prof. Smith", category:"Idiomas", price:0, free:true, rating:4.5, students:5100, thumb:"🗣️", duration:"10h", lessons:40, level:"Intermedio", tags:["inglés","conversación","gramática"], published:true },
  { id:"cr6", title:"Física Cuántica Básica", instructor:"Prof. Ramírez", category:"Ciencias", price:249, free:false, rating:4.9, students:430, thumb:"⚛️", duration:"18h", lessons:72, level:"Avanzado", tags:["física","cuántica","partículas"], published:true },
];

const uid = () => Math.random().toString(36).slice(2,9);

const S = `
.cp-root{width:100%;font-family:'DM Sans',sans-serif}

/* Tabs internos */
.cp-tabs{display:flex;gap:4px;background:rgba(13,20,38,.8);border:1px solid rgba(99,102,241,.14);border-radius:12px;padding:4px;margin-bottom:24px;width:fit-content}
.cp-tab{font-size:12px;font-weight:600;padding:7px 16px;border-radius:9px;cursor:pointer;border:none;background:transparent;color:#8fa0c8;transition:all .18s;font-family:'DM Sans',sans-serif}
.cp-tab.active{background:linear-gradient(160deg,#6366f1,#4338ca);color:#fff;box-shadow:0 4px 12px rgba(99,102,241,.3)}

/* Buscador */
.cp-search-row{display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap}
.cp-search{flex:1;min-width:200px;background:#060914;border:1px solid rgba(99,102,241,.18);border-radius:10px;padding:10px 14px;font-family:'DM Sans',sans-serif;font-size:13px;color:#e8eeff;outline:none;transition:border-color .2s}
.cp-search:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
.cp-search::placeholder{color:#4e6090}

/* Chips categoría */
.cp-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px}
.cp-cat{font-size:11px;font-weight:500;padding:5px 12px;border-radius:999px;border:1px solid rgba(99,102,241,.2);background:transparent;color:#8fa0c8;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
.cp-cat.active{background:rgba(99,102,241,.15);border-color:#6366f1;color:#c7d2fe}

/* Grid de cursos */
.cp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:16px;margin-bottom:24px}

/* Card de curso */
.cp-card{background:linear-gradient(160deg,rgba(255,255,255,.03),transparent),#0d1426;border:1px solid rgba(99,102,241,.14);border-radius:16px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative}
.cp-card:hover{transform:translateY(-4px);border-color:rgba(99,102,241,.32);box-shadow:0 16px 40px rgba(0,0,0,.5)}
.cp-card-thumb{height:130px;display:flex;align-items:center;justify-content:center;background:linear-gradient(160deg,rgba(99,102,241,.1),rgba(67,56,202,.05));position:relative;font-size:52px}
.cp-card-badge{position:absolute;top:10px;right:10px;font-family:'DM Mono',monospace;font-size:10px;font-weight:500;padding:3px 9px;border-radius:999px}
.cp-card-badge.free{background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399}
.cp-card-badge.paid{background:rgba(240,192,96,.12);border:1px solid rgba(240,192,96,.3);color:#f0c060}
.cp-card-body{padding:14px}
.cp-card-cat{font-family:'DM Mono',monospace;font-size:10px;color:#6366f1;text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
.cp-card-title{font-size:14px;font-weight:600;line-height:1.35;margin-bottom:4px;color:#e8eeff}
.cp-card-instructor{font-size:11px;color:#4e6090;margin-bottom:8px}
.cp-card-meta{display:flex;align-items:center;gap:10px;font-size:10px;color:#4e6090;margin-bottom:10px;font-family:'DM Mono',monospace}
.cp-card-rating{color:#f0c060;font-weight:700}
.cp-card-footer{display:flex;align-items:center;justify-content:space-between}
.cp-card-price{font-size:16px;font-weight:700;color:#e8eeff}
.cp-card-price.free-p{color:#34d399;font-size:13px}
.cp-enroll-btn{font-size:11px;font-weight:600;padding:6px 12px;border-radius:8px;border:none;cursor:pointer;transition:all .18s;font-family:'DM Sans',sans-serif}
.cp-enroll-btn.paid-b{background:linear-gradient(160deg,#f0c060,#d4943a);color:#080c18}
.cp-enroll-btn.free-b{background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#34d399}
.cp-enroll-btn.enrolled{background:rgba(52,211,153,.1);border:1px solid #34d399;color:#34d399}

/* Mis cursos (alumno) */
.cp-my-course{display:flex;gap:14px;padding:14px;background:#0d1426;border:1px solid rgba(99,102,241,.14);border-radius:12px;margin-bottom:10px;align-items:center;flex-wrap:wrap}
.cp-my-thumb{width:48px;height:48px;border-radius:10px;background:linear-gradient(135deg,rgba(99,102,241,.2),rgba(67,56,202,.1));display:grid;place-items:center;font-size:24px;flex-shrink:0}
.cp-my-info{flex:1;min-width:160px}
.cp-my-title{font-size:14px;font-weight:600;margin-bottom:2px}
.cp-my-meta{font-size:11px;color:#4e6090;font-family:'DM Mono',monospace}
.cp-progress{height:4px;background:rgba(255,255,255,.06);border-radius:999px;overflow:hidden;margin-top:7px}
.cp-progress-fill{height:100%;border-radius:999px;background:linear-gradient(90deg,#6366f1,#f0c060)}
.cp-pct{font-size:10px;color:#6366f1;font-family:'DM Mono',monospace;margin-top:3px}

/* Crear curso */
.cp-form-card{background:linear-gradient(160deg,rgba(255,255,255,.03),transparent),#0d1426;border:1px solid rgba(99,102,241,.18);border-radius:16px;padding:24px;margin-bottom:16px;position:relative;overflow:hidden}
.cp-form-card::before{content:'';position:absolute;top:0;left:20px;right:20px;height:1px;background:linear-gradient(90deg,transparent,rgba(99,102,241,.5),rgba(240,192,96,.3),transparent)}
.cp-form-title{font-family:'Instrument Serif',serif;font-style:italic;font-size:18px;margin-bottom:4px}
.cp-form-sub{font-size:12px;color:#8fa0c8;margin-bottom:18px}
.cp-form-row{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
.cp-form-group{display:flex;flex-direction:column;gap:5px}
.cp-form-label{font-family:'DM Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#4e6090}
.cp-form-input{background:#060914;border:1px solid rgba(99,102,241,.18);border-radius:9px;padding:9px 12px;font-family:'DM Sans',sans-serif;font-size:13px;color:#e8eeff;outline:none;transition:border-color .2s;width:100%}
.cp-form-input:focus{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.1)}
.cp-form-input::placeholder{color:#4e6090}

/* Módulos */
.cp-module{display:flex;align-items:center;gap:10px;padding:10px 12px;background:#060914;border:1px solid rgba(99,102,241,.12);border-radius:9px;margin-bottom:7px;font-size:12px;color:#8fa0c8}
.cp-module-name{flex:1}
.cp-module-del{color:#f87171;cursor:pointer;font-size:14px;opacity:.6;transition:opacity .2s;background:none;border:none}
.cp-module-del:hover{opacity:1}

/* Upload zone */
.cp-upload{border:2px dashed rgba(99,102,241,.22);border-radius:12px;padding:24px;text-align:center;cursor:pointer;transition:all .2s;margin-bottom:12px}
.cp-upload:hover{border-color:rgba(99,102,241,.45);background:rgba(99,102,241,.03)}

/* Botones */
.cp-btn{display:inline-flex;align-items:center;gap:6px;font-family:'DM Sans',sans-serif;font-size:12px;font-weight:600;border:none;border-radius:9px;padding:9px 16px;cursor:pointer;transition:all .18s}
.cp-btn.primary{background:linear-gradient(160deg,#6366f1,#4338ca);color:#fff;box-shadow:0 4px 14px rgba(99,102,241,.25)}
.cp-btn.primary:hover{transform:translateY(-1px);filter:brightness(1.08)}
.cp-btn.ghost{background:rgba(13,20,38,.6);color:#8fa0c8;border:1px solid rgba(99,102,241,.18)}
.cp-btn.ghost:hover{border-color:rgba(99,102,241,.32);color:#e8eeff}
.cp-btn.gold{background:linear-gradient(160deg,#f0c060,#d4943a);color:#080c18;font-weight:700}
.cp-btn.gold:hover{transform:translateY(-1px);filter:brightness(1.06)}

/* Mis cursos creados (profesor) */
.cp-created-card{display:flex;gap:14px;padding:14px;background:#0d1426;border:1px solid rgba(99,102,241,.14);border-radius:12px;margin-bottom:10px;align-items:center;flex-wrap:wrap}
.cp-created-actions{display:flex;gap:8px;flex-shrink:0}

/* Empty */
.cp-empty{text-align:center;padding:40px 20px;color:#4e6090}
.cp-empty-icon{font-size:40px;display:block;margin-bottom:10px}
`;

if (!document.getElementById("cp-styles")) {
  const el = document.createElement("style");
  el.id = "cp-styles";
  el.textContent = S;
  document.head.appendChild(el);
}

/* ─── Sub-vista: Explorar cursos ─── */
function ExplorarCursos({ enrolled, setEnrolled, mode }) {
  const [cat, setCat] = useState("Todos");
  const [search, setSearch] = useState("");
  const [courses] = useState(MOCK_COURSES);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return courses.filter(c => {
      const okCat = cat === "Todos" || c.category === cat;
      const okQ = !q || c.title.toLowerCase().includes(q) || c.instructor.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [courses, cat, search]);

  return (
    <div>
      <div className="cp-search-row">
        <input className="cp-search" placeholder="🔍 Buscar cursos, instructores..." value={search} onChange={e=>setSearch(e.target.value)}/>
      </div>
      <div className="cp-cats">
        {CATS.map(c=>(
          <button key={c} className={`cp-cat${cat===c?" active":""}`} onClick={()=>setCat(c)}>{c}</button>
        ))}
      </div>
      <div style={{fontSize:11,color:"#4e6090",fontFamily:"'DM Mono',monospace",marginBottom:14}}>{filtered.length} cursos disponibles</div>
      {filtered.length === 0 && (
        <div className="cp-empty">
          <span className="cp-empty-icon">🔍</span>
          <div>Sin resultados para esta búsqueda</div>
        </div>
      )}
      <div className="cp-grid">
        {filtered.map(course => {
          const isEnrolled = enrolled.includes(course.id);
          return (
            <div key={course.id} className="cp-card">
              <div className="cp-card-thumb">
                {course.thumb}
                <span className={`cp-card-badge ${course.free?"free":"paid"}`}>
                  {course.free ? "GRATIS" : `$${course.price} MXN`}
                </span>
              </div>
              <div className="cp-card-body">
                <div className="cp-card-cat">{course.category}</div>
                <div className="cp-card-title">{course.title}</div>
                <div className="cp-card-instructor">por {course.instructor}</div>
                <div className="cp-card-meta">
                  <span className="cp-card-rating">★ {course.rating}</span>
                  <span>·</span>
                  <span>{course.students.toLocaleString()} alumnos</span>
                  <span>·</span>
                  <span>{course.duration}</span>
                </div>
                <div className="cp-card-footer">
                  <div className={`cp-card-price ${course.free?"free-p":""}`}>
                    {course.free ? "Gratuito" : `$${course.price}`}
                  </div>
                  <button
                    className={`cp-enroll-btn ${isEnrolled ? "enrolled" : course.free ? "free-b" : "paid-b"}`}
                    onClick={() => setEnrolled(e => isEnrolled ? e : [...e, course.id])}
                  >
                    {isEnrolled ? "✓ Inscrito" : course.free ? "Inscribirse" : "Comprar"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sub-vista: Mis cursos inscritos ─── */
function MisCursos({ enrolled, setEnrolled }) {
  const myCourses = MOCK_COURSES.filter(c => enrolled.includes(c.id));
  const PROGRESS = { cr1:65, cr2:100, cr3:30, cr4:10, cr5:80, cr6:45 };

  if (myCourses.length === 0) return (
    <div className="cp-empty">
      <span className="cp-empty-icon">📭</span>
      <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:18,color:"#8fa0c8",marginBottom:8}}>Sin cursos inscritos</div>
      <div style={{fontSize:12}}>Explora el catálogo e inscríbete en cursos</div>
    </div>
  );

  return (
    <div>
      {myCourses.map((c,i) => (
        <div key={c.id} className="cp-my-course">
          <div className="cp-my-thumb">{c.thumb}</div>
          <div className="cp-my-info">
            <div className="cp-my-title">{c.title}</div>
            <div className="cp-my-meta">{c.instructor} · {c.lessons} lecciones · {c.duration}</div>
            <div className="cp-progress">
              <div className="cp-progress-fill" style={{width:`${PROGRESS[c.id]||20}%`}}/>
            </div>
            <div className="cp-pct">{PROGRESS[c.id]||20}% completado</div>
          </div>
          <button className="cp-btn primary" style={{fontSize:11,padding:"7px 14px"}}>
            {(PROGRESS[c.id]||0) >= 100 ? "✓ Completado" : "Continuar →"}
          </button>
        </div>
      ))}
    </div>
  );
}

/* ─── Sub-vista: Crear curso (solo profesor) ─── */
function CrearCurso({ showToast }) {
  const [myCourses, setMyCourses] = useState([
    { id:"mc1", title:"Introducción a React", category:"Tecnología", price:0, free:true, thumb:"⚛️", lessons:12, students:45, published:true },
  ]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title:"", category:"Tecnología", price:"0", level:"Principiante", description:"" });
  const [modules, setModules] = useState([
    { id:"mod1", icon:"🎬", name:"Introducción al curso", meta:"Video · 5 min" },
    { id:"mod2", icon:"📄", name:"Material de lectura", meta:"PDF · 2.3 MB" },
  ]);
  const [newMod, setNewMod] = useState({ type:"video", name:"" });

  const addModule = (type) => {
    const icons = { video:"🎬", pdf:"📄", quiz:"📝", url:"🔗" };
    const metas = { video:"Video", pdf:"PDF", quiz:"Quiz", url:"Link" };
    setModules(m => [...m, { id:uid(), icon:icons[type], name:`Nuevo ${metas[type]}`, meta:`${metas[type]}` }]);
  };

  const publishCourse = () => {
    if (!form.title.trim()) { showToast && showToast("Escribe un título para el curso","err"); return; }
    const nuevo = {
      id: uid(), title:form.title, category:form.category,
      price: Number(form.price)||0, free: Number(form.price)===0,
      thumb:"📘", lessons:modules.length, students:0, published:true
    };
    setMyCourses(c => [nuevo, ...c]);
    setCreating(false);
    setForm({ title:"", category:"Tecnología", price:"0", level:"Principiante", description:"" });
    setModules([]);
    showToast && showToast("¡Curso publicado exitosamente! 🎉");
  };

  if (creating) return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:20}}>Crear nuevo curso</div>
        <button className="cp-btn ghost" onClick={()=>setCreating(false)}>← Cancelar</button>
      </div>

      <div className="cp-form-card">
        <div className="cp-form-title">Información básica</div>
        <div className="cp-form-sub">Define el título, categoría y precio de tu curso.</div>
        <div className="cp-form-row">
          <div className="cp-form-group">
            <label className="cp-form-label">Título del curso</label>
            <input className="cp-form-input" placeholder="ej. Álgebra para Ingeniería" value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))}/>
          </div>
          <div className="cp-form-group">
            <label className="cp-form-label">Categoría</label>
            <select className="cp-form-input" value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} style={{cursor:"pointer"}}>
              {CATS.filter(c=>c!=="Todos").map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="cp-form-row">
          <div className="cp-form-group">
            <label className="cp-form-label">Precio (MXN) — 0 = Gratis</label>
            <input className="cp-form-input" type="number" placeholder="0" value={form.price} onChange={e=>setForm(f=>({...f,price:e.target.value}))}/>
          </div>
          <div className="cp-form-group">
            <label className="cp-form-label">Nivel</label>
            <select className="cp-form-input" value={form.level} onChange={e=>setForm(f=>({...f,level:e.target.value}))} style={{cursor:"pointer"}}>
              {["Principiante","Intermedio","Avanzado","Todos"].map(l=><option key={l}>{l}</option>)}
            </select>
          </div>
        </div>
        <div className="cp-form-group">
          <label className="cp-form-label">Descripción</label>
          <textarea className="cp-form-input" rows={3} placeholder="¿Qué aprenderán los estudiantes?" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} style={{resize:"vertical"}}/>
        </div>
      </div>

      <div className="cp-form-card">
        <div className="cp-form-title">Contenido del curso</div>
        <div className="cp-form-sub">Agrega lecciones, videos, PDFs y cuestionarios.</div>
        {modules.map(m => (
          <div key={m.id} className="cp-module">
            <span style={{fontSize:16}}>{m.icon}</span>
            <div className="cp-module-name">
              <div style={{fontSize:12,color:"#e8eeff"}}>{m.name}</div>
              <div style={{fontSize:10,color:"#4e6090"}}>{m.meta}</div>
            </div>
            <button className="cp-module-del" onClick={()=>setModules(ms=>ms.filter(x=>x.id!==m.id))}>✕</button>
          </div>
        ))}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          {[["video","🎬 Video URL"],["upload","📤 Subir video"],["pdf","📄 Subir PDF"],["quiz","📝 Cuestionario"]].map(([type,label])=>(
            <button key={type} className="cp-btn ghost" style={{fontSize:11}} onClick={()=>addModule(type)}>{label}</button>
          ))}
        </div>
        <div className="cp-upload">
          <div style={{fontSize:28,marginBottom:6}}>☁️</div>
          <div style={{fontSize:12,color:"#8fa0c8"}}>Arrastra archivos aquí o haz clic para seleccionar</div>
          <div style={{fontSize:10,color:"#4e6090",marginTop:3,fontFamily:"'DM Mono',monospace"}}>MP4, PDF, DOCX — máx. 500 MB</div>
        </div>
      </div>

      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button className="cp-btn ghost">Guardar borrador</button>
        <button className="cp-btn gold" onClick={publishCourse}>🚀 Publicar curso</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
        <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:20}}>Mis cursos creados</div>
        <button className="cp-btn primary" onClick={()=>setCreating(true)}>+ Crear nuevo curso</button>
      </div>
      {myCourses.length === 0 && (
        <div className="cp-empty">
          <span className="cp-empty-icon">📘</span>
          <div style={{fontFamily:"'Instrument Serif',serif",fontStyle:"italic",fontSize:16,color:"#8fa0c8",marginBottom:8}}>Aún no has creado cursos</div>
          <div style={{fontSize:12,marginBottom:16}}>Comparte tu conocimiento con la comunidad EduTec</div>
          <button className="cp-btn primary" onClick={()=>setCreating(true)}>Crear mi primer curso</button>
        </div>
      )}
      {myCourses.map(c => (
        <div key={c.id} className="cp-created-card">
          <div className="cp-my-thumb">{c.thumb}</div>
          <div className="cp-my-info">
            <div className="cp-my-title">{c.title}</div>
            <div className="cp-my-meta">{c.category} · {c.lessons} lecciones · {c.students} estudiantes · {c.free?"Gratuito":`$${c.price} MXN`}</div>
          </div>
          <div className="cp-created-actions">
            <span style={{fontSize:10,padding:"4px 10px",borderRadius:999,background:c.published?"rgba(52,211,153,.15)":"rgba(251,191,36,.1)",border:`1px solid ${c.published?"rgba(52,211,153,.3)":"rgba(251,191,36,.25)"}`,color:c.published?"#34d399":"#fbbf24",fontFamily:"'DM Mono',monospace",display:"flex",alignItems:"center"}}>
              {c.published?"Publicado":"Borrador"}
            </span>
            <button className="cp-btn ghost" style={{fontSize:11}}>✏️ Editar</button>
            <button className="cp-btn ghost" style={{fontSize:11}}>📊 Stats</button>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Componente principal exportado ─── */
export default function CoursesPanel({ mode = "student", showToast }) {
  // mode: "student" | "professor"
  const [tab, setTab] = useState("explorar");
  const [enrolled, setEnrolled] = useState(["cr1","cr2"]);

  const tabs = mode === "professor"
    ? [["explorar","🔍 Explorar"],["mis-cursos","📚 Mis inscritos"],["crear","✏️ Crear curso"]]
    : [["explorar","🔍 Explorar"],["mis-cursos","📚 Mis cursos"]];

  return (
    <div className="cp-root">
      <div className="cp-tabs">
        {tabs.map(([id,label]) => (
          <button key={id} className={`cp-tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === "explorar"   && <ExplorarCursos enrolled={enrolled} setEnrolled={setEnrolled} mode={mode}/>}
      {tab === "mis-cursos" && <MisCursos enrolled={enrolled} setEnrolled={setEnrolled}/>}
      {tab === "crear"      && mode === "professor" && <CrearCurso showToast={showToast}/>}
    </div>
  );
}