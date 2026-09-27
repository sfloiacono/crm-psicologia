/* ============ Utilidades ============ */
const pad=n=>String(n).padStart(2,'0');
const iso=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
const parse=s=>{const[y,m,d]=s.split('-').map(Number);return new Date(y,m-1,d||1,12)};
const addDays=(s,n)=>{const d=parse(s);d.setDate(d.getDate()+n);return iso(d)};
const mondayOf=s=>{const d=parse(s);d.setDate(d.getDate()-((d.getDay()+6)%7));return iso(d)};
const dow=s=>((parse(s).getDay()+6)%7)+1;
const daysBetween=(a,b)=>Math.round((parse(b)-parse(a))/86400000);
const monthKey=s=>s.slice(0,7);
const lastOfMonth=m=>{const[y,mm]=m.split('-').map(Number);return iso(new Date(y,mm,0,12))};
const addMonths=(m,n)=>{const[y,mm]=m.split('-').map(Number);const d=new Date(y,mm-1+n,1,12);return `${d.getFullYear()}-${pad(d.getMonth()+1)}`};
const TODAY=iso(new Date());
const DIAS=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
const DIAS_C=['lun','mar','mié','jue','vie','sáb','dom'];
const MESES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
const MESES_C=['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
const fmtMoney=new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0});
const money=n=>fmtMoney.format(Math.round(n||0));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-5);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const dayNum=s=>parse(s).getDate();
const monName=s=>MESES[parse(s).getMonth()];
const fmtLong=s=>{const d=parse(s);return `${DIAS[dow(s)-1].toLowerCase()} ${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`};
const fmtShort=s=>{const d=parse(s);return `${d.getDate()}/${d.getMonth()+1}`};
const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);

/* ============ Configuración por defecto ============ */
const LISTS=[
  {key:'estadosSesion',titulo:'Estados de sesión',desc:'Qué pasó con cada sesión. "Se cobra" define si genera honorario. "A elegir" sirve para casos como las cancelaciones tardías: lo decidís en cada sesión.',color:true,extra:[{k:'cobra',label:'Se cobra',type:'select',opts:[['no','Nunca'],['si','Siempre'],['opcional','A elegir en cada sesión']]}]},
  {key:'estadosPago',titulo:'Estados de pago',desc:'Cómo está el cobro de cada sesión.',color:true,extra:[{k:'tipo',label:'Cuenta como',type:'select',opts:[['pendiente','Pendiente'],['cobrado','Cobrado'],['sin_cargo','Sin cargo']]}]},
  {key:'mediosPago',titulo:'Medios de pago',desc:'Transferencias, efectivo, billeteras virtuales, etc.'},
  {key:'facturacion',titulo:'Facturación',desc:'Tipo de comprobante o reintegro.'},
  {key:'instituciones',titulo:'Instituciones y derivaciones',desc:'Quién deriva al paciente y qué porcentaje le corresponde.',extra:[{k:'porcentaje',label:'% institución',type:'number'}]},
  {key:'modalidades',titulo:'Modalidades de atención',desc:'Virtual, presencial y sus variantes.'},
  {key:'estadosPaciente',titulo:'Estados del paciente',desc:'Solo los estados con "En agenda" generan sesiones automáticamente.',color:true,extra:[{k:'agenda',label:'En agenda',type:'bool'}]},
  {key:'frecuencias',titulo:'Frecuencias',desc:'Cada cuántas semanas se repite la sesión.',extra:[{k:'semanas',label:'Cada',suffix:'sem.',type:'number'}]},
  {key:'categoriasGasto',titulo:'Categorías de gasto',desc:'Para clasificar los egresos del consultorio.'},
  {key:'legajos',titulo:'Tipos de legajo',desc:'Dónde guardás la historia clínica.'}
];
const it=(id,nombre,extra={})=>({id,nombre,...extra});
function defaultConfig(){
  return {version:1,general:{profesional:'',finDeSemana:false,inicio:8,fin:21,duracion:50,vistaInicial:'',paleta:'rosa-salvia',fuente:'serena',textura:true},lists:{
    estadosSesion:[
      it('programada','Programada',{color:'#8A9A9C',cobra:'no',fijo:true}),
      it('realizada','Realizada',{color:'#2B6B64',cobra:'si'}),
      it('cancelo_paciente','Canceló paciente',{color:'#C0793A',cobra:'opcional'}),
      it('cancele_yo','Cancelé yo',{color:'#8B5CA8',cobra:'no'}),
      it('feriado','Feriado',{color:'#3F74B5',cobra:'no'}),
      it('vacaciones','Vacaciones',{color:'#4A9BA8',cobra:'no'}),
      it('ausente_aviso','Ausente con aviso',{color:'#B39A2E',cobra:'no'}),
      it('ausente_sin_aviso','Ausente sin aviso',{color:'#B04848',cobra:'si'}),
      it('reprogramada','Reprogramada',{color:'#6D7F99',cobra:'no'}),
      it('enfermedad','Enfermedad',{color:'#9C6B8E',cobra:'no'})
    ],
    estadosPago:[
      it('pendiente','Pendiente de pago',{color:'#B07A2A',tipo:'pendiente',fijo:true}),
      it('pagado','Pagado',{color:'#2E7D4F',tipo:'cobrado'}),
      it('adelantado','Pagado por adelantado',{color:'#3F74B5',tipo:'cobrado'}),
      it('sin_cargo','Sin cargo',{color:'#8A9A9C',tipo:'sin_cargo'})
    ],
    mediosPago:[it('transferencia','Transferencia bancaria'),it('mp','Transferencia MP'),it('efectivo','Efectivo'),it('usd','Dólares')],
    facturacion:[it('recibo_c','Recibo C'),it('reintegro','Reintegro'),it('sin_factura','Sin factura')],
    instituciones:[it('particular','Particular',{porcentaje:0}),it('bellocq','Bellocq',{porcentaje:30}),it('meraki','Meraki',{porcentaje:50})],
    modalidades:[it('virtual','Virtual'),it('presencial','Presencial')],
    estadosPaciente:[
      it('activo','Activo',{color:'#2E7D4F',agenda:true}),
      it('pausa','En pausa',{color:'#B39A2E',agenda:false}),
      it('alta_fin','Alta por finalización',{color:'#3F74B5',agenda:false}),
      it('alta_abandono','Alta por abandono',{color:'#8A9A9C',agenda:false}),
      it('derivacion','Derivación',{color:'#8B5CA8',agenda:false})
    ],
    frecuencias:[it('semanal','Semanal',{semanas:1}),it('quincenal','Quincenal',{semanas:2}),it('mensual','Mensual',{semanas:4})],
    categoriasGasto:[it('supervision','Supervisión'),it('especializacion','Especialización'),it('mala_praxis','Seguro de mala praxis'),it('monotributo','Monotributo'),it('analisis','Análisis personal'),it('alquiler','Alquiler de consultorio')],
    legajos:[it('digital','Digital'),it('papel','Papel')]
  }};
}
function mergeConfig(c){
  const d=defaultConfig();
  c.general={...d.general,...(c.general||{})};
  c.lists=c.lists||{};
  for(const L of LISTS) if(!Array.isArray(c.lists[L.key])) c.lists[L.key]=d.lists[L.key];
  for(const e of c.lists.estadosSesion){ if(typeof e.cobra==='boolean'||e.cobra==null){ e.cobra=e.cobra===true?'si':(e.id==='cancelo_paciente'?'opcional':'no'); } }
  const pend=c.lists.estadosPago.find(i=>i.id==='pendiente');if(pend&&pend.nombre==='Pendiente')pend.nombre='Pendiente de pago';
  return c;
}

/* ============ Estado ============ */
const S={config:null,patients:[],gastos:[],ses:{},view:'agenda',ag:'semana',cursor:TODAY,month:monthKey(TODAY),
  q:'',filtroEstado:'',comps:[],awaitPay:new Set(),visible:{},edit:null,ready:false,downloads:null};
const list=k=>S.config.lists[k]||[];
const item=(k,id)=>list(k).find(i=>i.id===id);
const pat=id=>S.patients.find(p=>p.id===id);
const fullName=p=>p?[p.nombre,p.apellido].filter(Boolean).join(' '):'';
const sortName=p=>p?`${p.apellido||''} ${p.nombre||''}`.trim().toLowerCase():'';
const nameBlock=p=>p?`<span class="nm1">${esc(p.nombre||'')}</span>${p.apellido?`<span class="nm2">${esc(p.apellido)}</span>`:''}`:'<span class="nm1">Paciente eliminado</span>';
const instOf=p=>item('instituciones',p?.institucion);
const montoOf=s=>s.monto!=null?Number(s.monto):Number(pat(s.pid)?.honorario||0);
const porcOf=s=>s.porc!=null?Number(s.porc):Number(instOf(pat(s.pid))?.porcentaje||0);
const colorOf=(k,id)=>item(k,id)?.color||'#8A9A9C';
function options(k,sel,empty){
  let h=empty?`<option value="">${esc(empty)}</option>`:'';
  for(const i of list(k)) h+=`<option value="${esc(i.id)}"${i.id===sel?' selected':''}>${esc(i.nombre)}</option>`;
  if(sel&&!item(k,sel)) h+=`<option value="${esc(sel)}" selected>(eliminado)</option>`;
  return h;
}

/* ============ Almacenamiento ============ */
const LKEY='consultorio-psico-v1';
const Store={mode:'local',col:null,local:{},queue:{},writing:{},revs:{},
  async init(){
    if(window.claude&&typeof window.claude.use==='function'){
      try{
        const [db,user,dl,as]=await Promise.all([claude.use('db'),claude.use('user'),claude.use('downloads'),claude.use('assets')]);
        S.downloads=dl;S.assets=as;
        if(db&&user){const id=await user.id(); if(id){this.col=db.collection('data/users/'+id);this.mode='db';}}
      }catch(e){console.warn(e)}
    }
    if(this.mode==='db'){
      return await new Promise(resolve=>{
        let first=true;
        this.col.onSnapshot(snap=>{
          const docs={};snap.docs.forEach(d=>{docs[d.id]=d.data()});
          if(first){first=false;resolve(docs);return}
          let changed=false;
          for(const ch of snap.docChanges()){
            const id=ch.doc.id;
            if(this.writing[id]||this.queue[id]) continue;
            const data=ch.type==='removed'?null:ch.doc.data();
            const mine=this.revs[id]||0;
            if(mine&&(data?Number(data._rev||0):0)<mine) continue;
            applyDoc(id,data);changed=true;
          }
          if(changed&&!S.dlgOpen&&!(document.activeElement?.dataset?.note)){render();if(S.popId)renderPop()}
        },err=>{console.warn(err);if(first){first=false;this.mode='local';resolve(this.loadLocal())}});
      });
    }
    return this.loadLocal();
  },
  loadLocal(){try{const r=localStorage.getItem(LKEY);if(r)this.local=JSON.parse(r)||{}}catch(e){this.local={}}return JSON.parse(JSON.stringify(this.local))},
  save(id,data){
    const copy=JSON.parse(JSON.stringify(data));
    copy._rev=Math.max(Date.now(),(this.revs[id]||0)+1);this.revs[id]=copy._rev;
    if(this.mode!=='db'){
      this.local[id]=copy;clearTimeout(this.t);
      this.t=setTimeout(()=>{try{localStorage.setItem(LKEY,JSON.stringify(this.local))}catch(e){toast('No se pudo guardar en este navegador.')}},250);
      return;
    }
    this.queue[id]=copy; if(!this.writing[id]) this.flush(id);
  },
  async flush(id){
    this.writing[id]=true;
    while(this.queue[id]){
      const d=this.queue[id];delete this.queue[id];
      try{await this.col.doc(id).set(d)}
      catch(e){
        if(e?.code==='unavailable'){await sleep(700+Math.random()*900);try{await this.col.doc(id).set(d)}catch(e2){toast('No se pudo guardar. Revisá la conexión e intentá de nuevo.')}}
        else if(e?.code==='quota_exceeded') toast('Se alcanzó el límite de almacenamiento.');
        else toast('No se pudo guardar el cambio.');
      }
    }
    this.writing[id]=false;
  },
  async remove(id){
    delete this.revs[id];
    if(this.mode!=='db'){delete this.local[id];try{localStorage.setItem(LKEY,JSON.stringify(this.local))}catch(e){}return}
    try{await this.col.doc(id).delete()}catch(e){toast('No se pudo borrar.')}
  }
};
function applyDoc(id,data){
  data=data?JSON.parse(JSON.stringify(data)):null; // los datos de la cuenta llegan de solo lectura: se trabaja sobre una copia
  if(id==='config') S.config=mergeConfig(data||defaultConfig());
  else if(id==='patients'){ S.patients=(data?.items||[]).map(p=>{ if(p.apellido==null){const t=String(p.nombre||'').trim().split(/\s+/);p={...p,nombre:t.shift()||'',apellido:t.join(' ')}} return p; }).map(p=>({...p,horarios:(p.horarios||[]).map(h=>({...h,id:h.id||('h_'+p.id+'_'+h.dia+'_'+String(h.hora||'').replace(':','')),duracion:Number(h.duracion||S.config?.general?.duracion||50)}))})); }
  else if(id==='gastos') S.gastos=data?.items||[];
  else if(id==='comprobantes') S.comps=data?.items||[];
  else if(id.startsWith('ses-')){ if(data) S.ses[id]=data; else delete S.ses[id]; }
}
const saveConfig=()=>Store.save('config',S.config);
const savePatients=()=>Store.save('patients',{items:S.patients});
const saveGastos=()=>Store.save('gastos',{items:S.gastos});
/* ============ Comprobantes de pago ============ */
const ACCEPT=['image/jpeg','image/png','image/webp','image/gif','application/pdf'];
const compsOf=pid=>S.comps.filter(c=>c.pid===pid).sort((a,b)=>((b.fecha||'')+(b.subido||'')).localeCompare((a.fecha||'')+(a.subido||'')));
const compsOfSes=sid=>S.comps.filter(c=>c.sid===sid);
const compUrl=c=>c.asset?('/_blob/'+c.asset):(c.data||'');
const saveComps=()=>Store.save('comprobantes',{items:S.comps});
const fmtSize=b=>b>1048576?(b/1048576).toFixed(1)+' MB':Math.max(1,Math.round(b/1024))+' KB';
function compChip(c){
  return `<button class="compchip" data-a="comp-view" data-id="${esc(c.id)}" title="Ver comprobante">${c.tipo==='application/pdf'?'PDF':'IMG'}<span>${esc(c.nombre||'Comprobante')}</span></button>`;
}
function sesCompRow(s){
  if(item('estadosPago',s.pago)?.tipo!=='cobrado') return '';
  const cs=compsOfSes(s.id);
  return `<div class="pop-sec"><span class="dual-lbl">Comprobante</span><div class="comp-inline">${cs.map(compChip).join('')}
    <button class="btn sm" data-a="comp-add" data-pid="${esc(s.pid)}" data-sid="${esc(s.id)}">${cs.length?'Adjuntar otro':'Adjuntar comprobante'}</button></div></div>`;
}
/* Oferta después de registrar un pago */
let offerT;
function offerAttach(s){
  if(!s) return;
  const el=document.getElementById('offer');const p=pat(s.pid);
  el.innerHTML=`<span>Pago de ${esc(p?.nombre||'')} registrado. ¿Querés adjuntar el comprobante?</span>
    <button class="btn primary sm" data-a="comp-add" data-pid="${esc(s.pid)}" data-sid="${esc(s.id)}">Adjuntar</button>
    <button class="btn ghost sm" data-a="offer-close">Ahora no</button>`;
  el.hidden=false;clearTimeout(offerT);offerT=setTimeout(()=>{el.hidden=true},10000);
}
function closeOffer(){clearTimeout(offerT);document.getElementById('offer').hidden=true}
/* Selección y carga del archivo */
function pickFile(pid,sid){
  S.attachFor={pid,sid:sid||null};closeOffer();
  const inp=document.getElementById('fileIn');inp.value='';inp.click();
}
async function toJpeg(file){
  try{
    const url=URL.createObjectURL(file);
    const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=url});
    const max=2000;const k=Math.min(1,max/Math.max(img.naturalWidth,img.naturalHeight));
    const c=document.createElement('canvas');c.width=Math.round(img.naturalWidth*k);c.height=Math.round(img.naturalHeight*k);
    c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);
    return await new Promise(r=>c.toBlob(b=>r(b),'image/jpeg',.85));
  }catch(e){return null}
}
const blobToDataUrl=b=>new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(r.result);r.onerror=rej;r.readAsDataURL(b)});
async function handleFile(file){
  const tgt=S.attachFor;S.attachFor=null;if(!file||!tgt) return;
  const isPdf=file.type==='application/pdf'||/\.pdf$/i.test(file.name);
  const isImg=file.type.startsWith('image/')||/\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
  if(!isPdf&&!isImg){toast('Elegí una imagen o un PDF.');return}
  let blob=file,type=isPdf?'application/pdf':file.type;
  if(isImg){const j=await toJpeg(file);if(j){blob=j;type='image/jpeg'}else if(!ACCEPT.includes(type)){toast('No se pudo leer esa imagen. Probá con una captura o un JPG.');return}}
  const s=tgt.sid?(S.visible[tgt.sid]||findSession(tgt.sid)):null;
  const base=(file.name||'comprobante').replace(/\.[^.]+$/,'');
  const rec={id:'c_'+uid(),pid:tgt.pid,sid:tgt.sid,fecha:s?.fecha||TODAY,subido:new Date().toISOString(),nombre:base+(type==='application/pdf'?'.pdf':'.jpg'),tipo:type,size:blob.size};
  toast('Subiendo comprobante…');
  if(S.assets){
    try{const r=await S.assets.upload(blob,{type});rec.asset=r.id;rec.size=r.sizeBytes}
    catch(e){
      const m={too_large:'El archivo es demasiado grande (máximo 20 MB).',unsupported_type:'Ese tipo de archivo no se puede adjuntar. Usá una imagen o un PDF.',quota_or_state:'Se llenó el espacio para archivos.',rate_limited:'Demasiadas subidas seguidas. Esperá un momento.',not_granted:'No tenés permiso para adjuntar archivos en esta app.'};
      if(e?.code==='store_unavailable'){try{const r=await S.assets.upload(blob,{type});rec.asset=r.id;rec.size=r.sizeBytes}catch(e2){toast('No se pudo subir el archivo. Intentá de nuevo.');return}}
      else{toast(m[e?.code]||'No se pudo subir el archivo.');return}
    }
  } else {
    if(blob.size>1.5*1048576){toast('En esta versión sin cuenta, el archivo debe pesar menos de 1,5 MB.');return}
    rec.data=await blobToDataUrl(blob);
  }
  S.comps.push(rec);saveComps();
  toast('Comprobante adjuntado');
  if(dlg.open&&S.edit?.id===tgt.pid&&document.getElementById('pac-form')){readPacForm();renderPacDialog()}
  else if(dlg.open&&S.edit?.id===tgt.sid){sesSheet()}
  else if(S.popId) renderPop();
}
function viewComp(id){
  const c=S.comps.find(x=>x.id===id);if(!c)return;const p=pat(c.pid);const url=compUrl(c);
  const v=document.getElementById('viewer');
  v.innerHTML=`<div class="dlg-head"><div><h2>${esc(c.nombre)}</h2><p class="muted small">${esc(fullName(p))}, sesión del ${fmtShort(c.fecha)}. Subido el ${fmtShort(c.subido.slice(0,10))}, ${fmtSize(c.size||0)}</p></div><button class="btn ghost icon" data-a="viewer-close" aria-label="Cerrar">✕</button></div>
    <div class="viewer-body">${c.tipo==='application/pdf'?`<iframe src="${esc(url)}" title="${esc(c.nombre)}"></iframe>`:`<img src="${esc(url)}" alt="Comprobante de ${esc(fullName(p))}">`}</div>
    <div class="dlg-foot"><button class="btn danger" data-a="comp-del" data-id="${esc(c.id)}">Eliminar comprobante</button><a class="btn" href="${esc(url)}" target="_blank" rel="noopener">Abrir en otra pestaña</a></div>`;
  if(!v.open)v.showModal();
}
async function deleteComp(id){
  const c=S.comps.find(x=>x.id===id);if(!c)return;
  const ok=await confirmBox('Eliminar comprobante',`Se elimina "${c.nombre}" del historial de ${fullName(pat(c.pid))}. No se puede deshacer.`,'Eliminar');
  if(!ok)return;
  if(c.asset&&S.assets){try{await S.assets.delete(c.asset)}catch(e){}}
  S.comps=S.comps.filter(x=>x.id!==id);saveComps();
  const v=document.getElementById('viewer');if(v.open)v.close();
  if(dlg.open&&document.getElementById('pac-form')){readPacForm();renderPacDialog()} else if(S.popId) renderPop();
  toast('Comprobante eliminado');
}
function compSection(pid){
  const cs=compsOf(pid);
  const paid=[];for(const d of Object.values(S.ses)) for(const s of Object.values(d.items||{})) if(s.pid===pid&&!s.oculta&&item('estadosPago',s.pago)?.tipo==='cobrado') paid.push(s);
  paid.sort((a,b)=>b.fecha.localeCompare(a.fecha));
  return `<div class="fieldset-title">Comprobantes de pago</div>
    <div class="full">
      ${cs.length?`<ul class="comp-list">${cs.map(c=>`<li><button class="comp-open" data-a="comp-view" data-id="${esc(c.id)}"><span class="comp-ico">${c.tipo==='application/pdf'?'PDF':'IMG'}</span>
        <span class="comp-txt"><b>${c.sid?`Sesión del ${fmtShort(c.fecha)}`:'Sin sesión asociada'}</b><span>${esc(c.nombre)}, subido el ${fmtShort(c.subido.slice(0,10))}</span></span></button></li>`).join('')}</ul>`:'<p class="hint">Todavía no hay comprobantes. Podés adjuntarlos al registrar un pago o desde acá.</p>'}
      <div class="comp-add"><select class="select sm" id="compSes" aria-label="Sesión del comprobante"><option value="">Sin sesión asociada</option>${paid.map(s=>`<option value="${esc(s.id)}">Sesión del ${fmtShort(s.fecha)}, ${money(montoOf(s))}</option>`).join('')}</select>
      <button class="btn sm" data-a="comp-add-pac" data-pid="${esc(pid)}">Adjuntar comprobante</button></div>
    </div>`;
}


function seedExample(){
  S.config=defaultConfig();
  const pid='p_ejemplo';
  const mon=mondayOf(TODAY);
  const desde=addDays(mon,1-7*4);
  S.patients=[{id:pid,hc:'1',nombre:'Paciente de ejemplo',dni:'',telefono:'',email:'',fechaDerivacion:desde,
    estado:'activo',modalidad:'virtual',institucion:'bellocq',supervisa:false,legajo:'digital',
    honorario:40000,medioPago:'transferencia',facturacion:'recibo_c',
    horarios:[{id:'h_ej1',dia:2,hora:'18:00',duracion:50,frecuencia:'semanal',desde}],
    observaciones:'Paciente ficticio para probar el sistema. Podés editarlo o eliminarlo.'}];
  const ejemplos=[[-4,'realizada','pagado'],[-3,'realizada','pagado'],[-2,'cancelo_paciente','pendiente'],[-1,'realizada','pendiente']];
  for(const [w,estado,pago] of ejemplos){
    const fecha=addDays(mon,1+7*w);
    const id=`${pid}_${fecha}_1800`;
    const k='ses-'+monthKey(fecha);
    (S.ses[k]=S.ses[k]||{items:{}}).items[id]={id,pid,fecha,hora:'18:00',dur:50,estado,pago,medio:'transferencia',monto:40000,porc:30,nota:''};
  }
  const m=monthKey(TODAY);
  S.gastos=[
    {id:uid(),fecha:m+'-05',categoria:'monotributo',descripcion:'Cuota mensual',monto:32000,medio:'transferencia'},
    {id:uid(),fecha:m+'-10',categoria:'supervision',descripcion:'Supervisión de casos',monto:45000,medio:'transferencia'}
  ];
  saveConfig();savePatients();saveGastos();
  for(const k in S.ses) Store.save(k,S.ses[k]);
}


/* ============ Sesiones ============ */
const nowHM=()=>{const d=new Date();return `${pad(d.getHours())}:${pad(d.getMinutes())}`};
const toMin=h=>{if(!h)return null;const[a,b]=h.split(':').map(Number);return a*60+(b||0)};
const fromMin=m=>`${pad(Math.floor(m/60))}:${pad(m%60)}`;
const defDur=()=>Number(S.config.general.duracion||50);
const durOf=s=>Number(s.dur||defDur());
const isPast=s=>s.fecha<TODAY||(s.fecha===TODAY&&!!s.hora&&s.hora<=nowHM());
const firstCobrado=()=>list('estadosPago').find(x=>x.tipo==='cobrado')?.id||'pagado';
const modeOf=e=>(e?.cobra===true||e?.cobra==='si')?'si':e?.cobra==='opcional'?'opcional':'no';
const cobraOf=s=>{const m=modeOf(item('estadosSesion',s.estado));return m==='si'||(m==='opcional'&&!!s.cobrar)};
const realizadaId=()=>item('estadosSesion','realizada')?'realizada':(list('estadosSesion').find(x=>modeOf(x)==='si')?.id||'realizada');

function monthsBetween(from,to){const out=[];let m=monthKey(from);const e=monthKey(to);while(m<=e){out.push(m);m=addMonths(m,1)}return out}
function sessionsInRange(from,to){
  const out=new Map();
  for(const m of monthsBetween(from,to)){
    const doc=S.ses['ses-'+m]; if(!doc) continue;
    for(const s of Object.values(doc.items||{})) if(s.fecha>=from&&s.fecha<=to) out.set(s.id,s);
  }
  for(let d=from;d<=to;d=addDays(d,1)){
    const wd=dow(d);
    for(const p of S.patients){
      if(d>=TODAY&&!item('estadosPaciente',p.estado)?.agenda) continue;
      for(const h of (p.horarios||[])){
        if(Number(h.dia)!==wd||!h.hora) continue;
        if(h.desde&&d<h.desde) continue;
        if(h.hasta&&d>h.hasta) continue;
        const sem=Math.max(1,Number(item('frecuencias',h.frecuencia)?.semanas||1));
        const diff=Math.round(daysBetween(mondayOf(h.ancla||h.desde||d),mondayOf(d))/7);
        if(((diff%sem)+sem)%sem!==0) continue;
        const id=`${p.id}_${d}_${h.hora.replace(':','')}`;
        if(!out.has(id)) out.set(id,{id,pid:p.id,fecha:d,hora:h.hora,dur:Number(h.duracion||defDur()),estado:'programada',pago:'pendiente',virtual:true});
      }
    }
  }
  return [...out.values()].filter(s=>!s.oculta).sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
}
function saveSession(s){
  const p=pat(s.pid);const c={...s};delete c.virtual;delete c.isNew;
  if(c.monto==null||c.monto==='') c.monto=Number(p?.honorario||0);
  if(c.porc==null) c.porc=Number(instOf(p)?.porcentaje||0);
  if(!c.medio) c.medio=p?.medioPago||'';
  if(!c.dur) c.dur=defDur();
  const k='ses-'+monthKey(c.fecha);
  const doc=S.ses[k]||(S.ses[k]={items:{}});doc.items=doc.items||{};doc.items[c.id]=c;
  Store.save(k,doc);
  return c;
}
function deleteSession(s){
  const k='ses-'+monthKey(s.fecha);const doc=S.ses[k];
  if(doc?.items?.[s.id]){delete doc.items[s.id];Store.save(k,doc)}
}
function moveSession(s,fecha,hora){
  if(s.extra){ if(monthKey(s.fecha)!==monthKey(fecha)) deleteSession(s); return saveSession({...s,fecha,hora}); }
  saveSession({...s,estado:item('estadosSesion','reprogramada')?'reprogramada':s.estado,nota:`${s.nota||''} Pasó al ${fmtShort(fecha)} ${hora}.`.trim()});
  return saveSession({id:'x_'+uid(),pid:s.pid,fecha,hora,dur:durOf(s),estado:'programada',pago:'pendiente',extra:true,monto:s.monto??null,nota:`Reprogramada del ${fmtShort(s.fecha)}.`});
}
function markDone(s){return saveSession({...s,estado:realizadaId(),pago:firstCobrado()})}
function stats(arr){
  const r={realizadas:0,total:arr.length,cobrado:0,pendiente:0,inst:0,sinMarcar:0,canceladas:0};
  for(const s of arr){
    const e=item('estadosSesion',s.estado),pg=item('estadosPago',s.pago),m=montoOf(s);
    if(modeOf(e)==='si') r.realizadas++; else if(s.estado!=='programada') r.canceladas++;
    if(s.estado==='programada'&&isPast(s)) r.sinMarcar++;
    if(pg?.tipo==='cobrado'){r.cobrado+=m;r.inst+=m*porcOf(s)/100}
    else if(pg?.tipo!=='sin_cargo'&&cobraOf(s)) r.pendiente+=m;
  }
  return r;
}
const gastosMes=m=>S.gastos.filter(g=>monthKey(g.fecha||'')===m);
const unmarkedList=()=>sessionsInRange(addDays(TODAY,-90),TODAY).filter(s=>s.estado==='programada'&&isPast(s));
function debtList(){
  const arr=[];for(const d of Object.values(S.ses)) for(const s of Object.values(d.items||{})){
    if(s.oculta) continue;
    if(cobraOf(s)&&item('estadosPago',s.pago)?.tipo==='pendiente') arr.push(s);
  }
  return arr.sort((a,b)=>(a.fecha+(a.hora||'')).localeCompare(b.fecha+(b.hora||'')));
}

/* ============ Render ============ */
const ICONS={
  agenda:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
  pendientes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M9 11l2.5 2.5L16 9"/><rect x="3.5" y="3.5" width="17" height="17" rx="3"/></svg>',
  semanas:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V11M9.5 20V6M15 20v-7M20.5 20V9"/></svg>',
  caja:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/></svg>',
  pacientes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.4-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.5c1.9.6 3 2.4 3.5 5.5"/></svg>',
  gastos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3v18M17 7.5c-.6-1.6-2.4-2.5-5-2.5-2.8 0-4.5 1.3-4.5 3.2 0 4.6 10 2.2 10 7 0 2-1.9 3.3-5 3.3-2.7 0-4.7-1-5.5-2.8"/></svg>',
  config:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1"/></svg>',
  info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'
};
const VIEWS=[['agenda','Agenda'],['semanas','Semanas'],['caja','Caja mensual'],['pacientes','Pacientes'],['gastos','Gastos'],['config','Configuración']];
function renderNav(){
  const prof=S.config?.general?.profesional;const n=unmarkedList().length+debtList().length;
  document.getElementById('nav').innerHTML=`
    <div class="brand"><strong>Consultorio</strong><span>${esc(prof||'Organizador de pacientes')}</span></div>
    ${VIEWS.map(([v,l])=>`<button data-a="nav" data-v="${v}" ${S.view===v?'aria-current="page"':''}>${ICONS[v]}<span>${l}</span>${v==='agenda'&&n?`<em class="badge" aria-label="${n} pendientes">${n}</em>`:''}</button>`).join('')}
    <div class="foot">${Store.mode==='db'?'Datos guardados en tu cuenta, visibles solo para vos.':'Datos guardados solo en este navegador.'}</div>`;
}
function applyLook(){
  const g=S.config?.general||{};const r=document.documentElement;
  r.dataset.palette=g.paleta||'rosa-salvia';r.dataset.font=g.fuente||'serena';
  if(g.textura!==false) r.dataset.textura='papel'; else delete r.dataset.textura;
}
function render(){
  if(!S.ready) return;
  applyLook();
  flushNotes();
  renderNav();
  const m=document.getElementById('main');
  S.visible={};
  m.innerHTML=({agenda:viewAgenda,semanas:viewSemanas,caja:viewCaja,pacientes:viewPacientes,gastos:viewGastos,config:viewConfig}[S.view])();
  if(S.view==='agenda'&&S.ag!=='mes') scrollCalToNow();
}

/* ---- Agenda ---- */
const PX=1.1, PXD=3.5;
function agRange(){
  if(S.ag==='dia') return [S.cursor,S.cursor];
  if(S.ag==='semana'){const f=mondayOf(S.cursor);return [f,addDays(f,6)]}
  const m=monthKey(S.cursor);return [m+'-01',lastOfMonth(m)];
}
function agTitle(from,to){
  if(S.ag==='dia') return cap(fmtLong(from));
  if(S.ag==='mes') return `${cap(MESES[parse(from).getMonth()])} ${parse(from).getFullYear()}`;
  const a=parse(from),b=parse(to);
  if(a.getMonth()===b.getMonth()) return `${a.getDate()} al ${b.getDate()} de ${MESES[a.getMonth()]} de ${b.getFullYear()}`;
  return `${a.getDate()} de ${MESES[a.getMonth()]} al ${b.getDate()} de ${MESES[b.getMonth()]} de ${b.getFullYear()}`;
}
function viewAgenda(){
  const [from,to]=agRange();
  const all=sessionsInRange(from,to);const st=stats(all);
  const um=unmarkedList(),debts=debtList();
  const pendCount=um.length+debts.length;
  const panelOpen=S.config.general.panel??(window.innerWidth>=760);
  let body='';
  if(S.ag==='mes') body=monthGrid(from,to,all);
  else{
    let dates=[];
    if(S.ag==='dia') dates=[from];
    else{const n=(S.config.general.finDeSemana||all.some(s=>dow(s.fecha)>=6))?7:5;for(let i=0;i<n;i++)dates.push(addDays(from,i))}
    body=timeGrid(dates,all,S.ag==='dia');
  }
  const seg=[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([v,l])=>`<button data-a="ag-view" data-v="${v}" aria-pressed="${S.ag===v}">${l}</button>`).join('');
  const lbl={dia:'este día',semana:'esta semana',mes:'este mes'}[S.ag];
  const hint={dia:'Elegí el estado y escribí la nota directamente en cada sesión. Tocá un espacio libre para agregar una.',
    semana:'Tocá una sesión para elegir su estado, registrar el pago o agregar una nota. Tocá un espacio libre para agregar una sesión. En computadora, podés arrastrarla para reprogramarla.',
    mes:'Tocá una sesión para elegir su estado y agregar una nota, o tocá el número de un día para verlo en detalle.'}[S.ag];
  return `<div class="view-head"><div><h1>${agTitle(from,to)}</h1><p class="sub">${st.total} ${st.total===1?'sesión':'sesiones'} ${lbl}, ${st.realizadas} realizadas, ${money(st.cobrado)} cobrado${st.pendiente?`, ${money(st.pendiente)} pendiente`:''}</p></div>
    <div class="btn-group"><div class="seg" role="group" aria-label="Vista">${seg}</div>
    <button class="btn icon" data-a="ag-nav" data-n="-1" aria-label="Anterior">‹</button><button class="btn" data-a="ag-nav" data-n="0">Hoy</button><button class="btn icon" data-a="ag-nav" data-n="1" aria-label="Siguiente">›</button>
    <button class="btn${panelOpen?' on':''}" data-a="panel-toggle" aria-expanded="${panelOpen}">Pendientes${pendCount?` <em class="count">${pendCount}</em>`:''}</button></div></div>
    ${S.patients.length?'':`<div class="notice">${ICONS.info}<p>Todavía no cargaste pacientes. Creá uno en Pacientes con su horario y la agenda se completa sola.</p></div>`}
    <div class="ag-layout${panelOpen?' with-panel':''}">
      <div class="ag-main">${body}<p class="hint" style="margin-top:10px">${hint}</p></div>
      ${panelOpen?`<aside class="ag-side" aria-label="Pendientes">${sidePanel(um,debts)}</aside>`:''}
    </div>`;
}
function regEstado(s,val){
  const [estado,cb]=String(val).split('|');
  const saved=saveSession({...s,estado,...(cb!=null?{cobrar:cb==='1'}:{})});const e=item('estadosSesion',estado);
  render();
  if(cobraOf(saved)&&item('estadosPago',saved.pago)?.tipo==='pendiente'){
    toast(`Registrada como ${e.nombre}${modeOf(e)==='opcional'?' (se cobra)':''}. El pago quedó en "Pendientes de pago".`);
    const d=document.querySelector(`.debt-line[data-id="${CSS.escape(saved.id)}"]`);
    if(d){d.scrollIntoView({block:'nearest'});d.classList.add('flash');setTimeout(()=>d.classList.remove('flash'),1800)}
  } else toast(`Registrada como ${e?.nombre||''}`);
}
function estadoOpts(s){
  if(s.estado==='programada'&&isPast(s)) return `<option value="programada" selected>¿Qué pasó? Elegí el estado…</option>`+list('estadosSesion').filter(i=>i.id!=='programada').map(i=>`<option value="${esc(i.id)}">${esc(i.nombre)}</option>`).join('');
  return options('estadosSesion',s.estado);
}
function payApplies(s){return s.estado==='programada'||cobraOf(s)}
function payToggle(s){
  if(s.estado==='programada'&&isPast(s)) return '<span class="no-pay">Se registra después de elegir el estado de la sesión</span>';
  if(modeOf(item('estadosSesion',s.estado))==='opcional'){
    const ct=`<div class="paytg" role="group" aria-label="¿Se cobra?"><button data-a="set-cobrar" data-id="${esc(s.id)}" data-v="0" aria-pressed="${!s.cobrar}">No se cobra</button><button class="is-pend" data-a="set-cobrar" data-id="${esc(s.id)}" data-v="1" aria-pressed="${!!s.cobrar}">Se cobra</button></div>`;
    if(!s.cobrar) return ct;
    return `<div class="stack">${ct}${payButtons(s)}</div>`;
  }
  if(!payApplies(s)) return '<span class="no-pay">No corresponde cobro</span>';
  return payButtons(s);
}
function payButtons(s){
  const pend=list('estadosPago').find(x=>x.tipo==='pendiente');const cob=list('estadosPago').find(x=>x.tipo==='cobrado');
  const opts=[pend,cob].filter(Boolean);const cur=item('estadosPago',s.pago);
  if(cur&&!opts.includes(cur)) opts.push(cur);
  return `<div class="paytg" role="group" aria-label="Pago">${opts.map(o=>`<button class="${o.tipo==='cobrado'?'is-ok':o.tipo==='pendiente'?'is-pend':''}" data-a="set-pago" data-id="${esc(s.id)}" data-v="${esc(o.id)}" aria-pressed="${o.id===s.pago}">${esc(o.nombre)}</button>`).join('')}</div>`;
}
function sidePanel(um,debts){
  const otros=list('estadosSesion').filter(e=>e.id!=='programada');
  const rows=[...um].sort((a,b)=>(b.fecha+(b.hora||'')).localeCompare(a.fecha+(a.hora||'')));
  const umRows=rows.map(s=>{S.visible[s.id]=s;const p=pat(s.pid);
    return `<div class="side-row"><div class="side-top"><button class="side-date" data-a="goto-ses" data-id="${esc(s.id)}" title="Ver en el calendario">${DIAS_C[dow(s.fecha)-1]} ${fmtShort(s.fecha)}, ${esc(s.hora||'')}</button><b>${esc(fullName(p)||'Paciente eliminado')}</b></div>
      <select class="select sm reg" data-c="reg-estado" data-id="${esc(s.id)}" aria-label="Estado de la sesión de ${esc(fullName(p)||'')} del ${fmtShort(s.fecha)}"><option value="">¿Qué pasó? Elegí el estado…</option>${otros.map(o=>modeOf(o)==='opcional'?`<option value="${esc(o.id)}|0">${esc(o.nombre)} (no se cobra)</option><option value="${esc(o.id)}|1">${esc(o.nombre)} (se cobra)</option>`:`<option value="${esc(o.id)}">${esc(o.nombre)}</option>`).join('')}</select></div>`;
  }).join('');
  const byP={};for(const s of debts)(byP[s.pid]=byP[s.pid]||[]).push(s);
  const debtRows=Object.entries(byP).sort((a,b)=>sortName(pat(a[0])).localeCompare(sortName(pat(b[0])))).map(([pid,ss])=>{
    const p=pat(pid);const tot=ss.reduce((a,s)=>a+montoOf(s),0);
    return `<div class="side-row"><div class="side-top"><b>${esc(fullName(p)||'Paciente eliminado')}</b><span class="side-amt">${money(tot)}</span></div>
      <div class="debt-lines">${ss.map(s=>{S.visible[s.id]=s;return `<div class="debt-line" data-id="${esc(s.id)}"><button class="side-date" data-a="goto-ses" data-id="${esc(s.id)}" title="Ver en el calendario">${DIAS_C[dow(s.fecha)-1]} ${fmtShort(s.fecha)}, ${esc(s.hora||'')}</button><span class="small">${money(montoOf(s))}</span><button class="btn sm" data-a="ses-pay" data-id="${esc(s.id)}">Pagado</button></div>`}).join('')}</div>
      ${ss.length>1?`<button class="btn sm" data-a="pay-all" data-pid="${esc(pid)}">Marcar las ${ss.length} como pagadas</button>`:''}</div>`}).join('');
  return `<section class="side-sec"><div class="side-head"><h2>Para registrar</h2><span class="muted small">${rows.length||''}</span></div>
      <p class="side-desc">Sesiones que ya pasaron y todavía no tienen estado. Al elegirlo, la sesión sale de esta lista.</p>
      ${umRows||'<p class="side-empty">Estás al día: todas las sesiones pasadas están registradas.</p>'}
      ${um.length>1?`<div class="side-foot"><button class="btn sm" data-a="all-done">Registrar las ${um.length} como realizadas</button></div>`:''}</section>
    <section class="side-sec"><div class="side-head"><h2>Pendientes de pago</h2><span class="muted small">${debts.length?money(debts.reduce((a,s)=>a+montoOf(s),0)):''}</span></div>
      <p class="side-desc">Sesiones que se cobran y todavía no pagaron. Al marcarlas como pagadas, salen de esta lista.</p>
      ${debtRows||'<p class="side-empty">Nadie te debe sesiones.</p>'}
</section>
    ${um.length||debts.length?'<p class="side-empty side-tip">Tocá una fecha para ver esa sesión en el calendario.</p>':''}`;
}
function gridBounds(all){
  const g=S.config.general;let ini=Number(g.inicio??8),fin=Number(g.fin??21);
  for(const s of all){const m=toMin(s.hora);if(m==null)continue;ini=Math.min(ini,Math.floor(m/60));fin=Math.max(fin,Math.ceil((m+durOf(s))/60))}
  return [ini,Math.max(fin,ini+1)];
}
function layoutDay(ss,ini){
  const items=ss.map(s=>{const st=toMin(s.hora)??ini*60;return{s,st,en:st+durOf(s)}}).sort((a,b)=>a.st-b.st);
  const out=[];let cl=[],clEnd=-1;
  const flush=()=>{const lanes=[];for(const it of cl){let l=lanes.findIndex(e=>e<=it.st);if(l<0){l=lanes.length;lanes.push(0)}lanes[l]=it.en;it.lane=l}cl.forEach(it=>it.lanes=lanes.length);out.push(...cl);cl=[];clEnd=-1};
  for(const it of items){if(cl.length&&it.st>=clEnd)flush();cl.push(it);clEnd=Math.max(clEnd,it.en)}
  if(cl.length)flush();return out;
}
function blk(it,ini,detail,px){
  const s=it.s;S.visible[s.id]=s;
  const p=pat(s.pid),e=item('estadosSesion',s.estado),pg=item('estadosPago',s.pago);
  const unmarked=s.estado==='programada'&&isPast(s);
  const off=modeOf(e)!=='si'&&s.estado!=='programada';
  const paid=pg?.tipo==='cobrado',debe=cobraOf(s)&&pg?.tipo==='pendiente';
  const top=(it.st-ini*60)*px, h=Math.max(durOf(s)*px,detail?170:26)-2;
  const w=100/it.lanes;
  const canDone=s.estado==='programada'&&(isPast(s)||s.fecha===TODAY);
  const estTag=unmarked?'<span class="tag">Sin registrar</span>':s.estado!=='programada'?`<span class="tag est" style="--c:${esc(colorOf('estadosSesion',s.estado))}">${esc(e?.nombre||'')}</span>`:'';
  const payTag=paid?'<span class="tag ok">Pagado</span>':debe?'<span class="tag debe">Debe</span>':'';
  const tag=detail?estTag:(payTag||estTag);
  const note=s.nota?`<span class="tag note" title="${esc(s.nota)}">Nota</span>`:'';
  const pgCls=paid?'pago-cobrado':debe?'pago-pendiente':'';
  const inner=detail?`
    <div class="bl1"><span class="bt">${esc(s.hora||'')}</span><span class="bn inline">${esc(fullName(p)||'Paciente eliminado')}</span>${tag}<span class="bd">${esc(instOf(p)?.nombre||'')}${instOf(p)?', ':''}${money(montoOf(s))}</span></div>
    <div class="bctl">
      <div class="dual-row"><span class="dual-lbl">Sesión</span><select class="select sm" aria-label="Estado de la sesión" data-c="ses-field" data-f="estado" data-id="${esc(s.id)}">${estadoOpts(s)}</select></div>
      <div class="dual-row"><span class="dual-lbl">Pago</span>${payToggle(s)}</div>
    </div>
    <textarea class="input note-in" rows="1" placeholder="Nota" aria-label="Nota de la sesión" data-note="${esc(s.id)}">${esc(s.nota||'')}</textarea>`
  :`<div class="bl1"><span class="bt">${esc(s.hora||'')}</span>${tag}${note}</div>
    <div class="bn two">${nameBlock(p)}</div>
`;
  return `<div class="blk${detail?' detail':''}${unmarked?' unmarked':''}${off?' off':''}" ${detail?'':'role="button" tabindex="0" data-a="open-ses"'} data-id="${esc(s.id)}"
    style="--c:${esc(colorOf('estadosSesion',s.estado))};top:${top}px;height:${h}px;left:calc(${it.lane*w}% + 2px);width:calc(${w}% - 4px)"
    title="${detail?'':esc(`${s.hora||''} ${fullName(p)||''}: ${e?.nombre||''}, ${pg?.nombre||''}${s.nota?'. Nota: '+s.nota:''}`)}">${inner}
    ${detail?`<button class="blk-more" data-a="open-ses" data-id="${esc(s.id)}" aria-label="Más opciones de la sesión" title="Monto, reprogramar y más">⋯</button>`:''}
  </div>`;
}
function timeGrid(dates,all,detail){
  const px=detail?PXD:PX;
  const [ini,fin]=gridBounds(all);const H=(fin-ini)*60*px;const n=dates.length;
  const split=monthKey(dates[0])!==monthKey(dates[n-1]);
  const head=dates.map(d=>`<button class="ch${d===TODAY?' today':''}" data-a="goto-day" data-d="${d}" aria-label="${fmtLong(d)}"><span>${DIAS_C[dow(d)-1]}</span><b>${dayNum(d)}</b>${split||detail?`<small>${MESES_C[parse(d).getMonth()]}</small>`:''}</button>`).join('');
  let gut='';for(let h=ini+1;h<fin;h++) gut+=`<span style="top:${(h-ini)*60*px}px">${pad(h)}:00</span>`;
  const cols=dates.map(d=>{
    const ss=all.filter(s=>s.fecha===d);
    let now='';if(d===TODAY){const m=toMin(nowHM());if(m>=ini*60&&m<=fin*60)now=`<div class="nowline" style="top:${(m-ini*60)*px}px"></div>`}
    return `<div class="tcol${d===TODAY?' today':''}" data-a="grid-add" data-d="${d}" data-ini="${ini}" data-px="${px}" style="height:${H}px;--hh:${60*px}px">${layoutDay(ss,ini).map(it=>blk(it,ini,detail,px)).join('')}${now}</div>`;
  }).join('');
  return `<div class="cal"><div class="cal-scroll${detail?' tall':''}" id="calScroll"><div class="cal-inner${detail?' single':''}" style="--n:${n}">
    <div class="cal-head"><div class="corner"></div>${head}</div>
    <div class="cal-body"><div class="gutter" style="height:${H}px">${gut}</div>${cols}</div></div></div></div>`;
}
function scrollCalToNow(){
  const el=document.getElementById('calScroll');if(!el)return;
  const now=el.querySelector('.nowline');
  const first=[...el.querySelectorAll('.blk')].sort((x,y)=>x.offsetTop-y.offsetTop)[0];
  const target=now?now.offsetTop-160:first?first.offsetTop-40:0;
  el.scrollTop=Math.max(0,target);
}
function monthGrid(from,to,all){
  const start=mondayOf(from);const m=monthKey(from);
  let h=DIAS_C.map(d=>`<div class="mh">${cap(d)}</div>`).join('');
  for(let d=start;d<=to||dow(d)!==1;d=addDays(d,1)){
    const ss=all.filter(s=>s.fecha===d);const out=monthKey(d)!==m;
    const items=ss.slice(0,4).map(s=>{S.visible[s.id]=s;const p=pat(s.pid);const pg=item('estadosPago',s.pago),e=item('estadosSesion',s.estado);
      const mark=pg?.tipo==='cobrado'?'<span class="mk ok" title="Pagada">$</span>':(cobraOf(s)&&pg?.tipo==='pendiente')?'<span class="mk debe" title="Debe">$</span>':'';
      return `<button class="mitem${modeOf(e)!=='si'&&s.estado!=='programada'?' off':''}${s.estado==='programada'&&isPast(s)?' um':''}" style="--c:${esc(colorOf('estadosSesion',s.estado))}" data-a="open-ses" data-id="${esc(s.id)}"><span class="dot"></span><span class="t">${esc(s.hora||'')}</span><span class="n">${esc(fullName(p)||'')}</span>${mark}</button>`}).join('');
    h+=`<div class="mc${out?' out':''}${d===TODAY?' today':''}"><button class="mnum" data-a="goto-day" data-d="${d}" aria-label="${fmtLong(d)}">${dayNum(d)}</button>${out?'':items}${!out&&ss.length>4?`<button class="more" data-a="goto-day" data-d="${d}">${ss.length-4} más</button>`:''}</div>`;
    if(addDays(d,1)>to&&dow(d)===7) break;
  }
  return `<div class="month">${h}</div>`;
}

function focusSession(id){
  const el=document.querySelector(`.blk[data-id="${CSS.escape(id)}"], .mitem[data-id="${CSS.escape(id)}"]`);
  if(!el){toast('No se encontró la sesión en esta vista');return}
  const reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({block:'center',inline:'nearest',behavior:'auto'});
  el.classList.remove('flash');void el.offsetWidth;el.classList.add('flash');
  setTimeout(()=>el.classList.remove('flash'),reduce?0:1800);
  const s=S.visible[id];
  if(el.classList.contains('detail')){el.querySelector('select')?.focus({preventScroll:true})}
  else if(s&&window.innerWidth>=760) openPop(s,el);
  else el.focus?.({preventScroll:true});
}
/* ---- Ficha rápida de sesión (junto a la sesión) ---- */
const pop=()=>document.getElementById('pop');
function openPop(s,anchor){
  S.popId=s.id;S.popAnchor=anchor?anchor.getBoundingClientRect():null;
  renderPop();
}
function renderPop(){
  const s=S.visible[S.popId]||findSession(S.popId);if(!s){closePop();return}
  const p=pat(s.pid),e=item('estadosSesion',s.estado),pg=item('estadosPago',s.pago);
  const done=cobraOf(s)&&pg?.tipo==='cobrado';
  const el=pop();
  el.innerHTML=`<div class="pop-head"><div><b>${esc(fullName(p)||'Paciente eliminado')}</b><p class="muted small">${cap(fmtLong(s.fecha))}, ${esc(s.hora||'')}, ${money(montoOf(s))}</p></div>
      <button class="btn ghost icon" data-a="pop-close" aria-label="Cerrar">✕</button></div>
    <div class="pop-sec"><span class="dual-lbl">Sesión</span><select class="select" data-c="pop-field" data-f="estado">${estadoOpts(s)}</select></div>
    <div class="pop-sec"><span class="dual-lbl">Pago</span>${payToggle(s)}</div>
    ${sesCompRow(s)}
    <label class="field"><span>Nota</span><textarea class="input" rows="3" data-note="${esc(s.id)}" id="popNote" placeholder="Texto libre: avisó por WhatsApp, pagó con recargo, etc.">${esc(s.nota||'')}</textarea></label>
    <p class="save-state muted small" id="noteState">&nbsp;</p>
    <div class="pop-foot"><button class="btn ghost sm" data-a="pop-more">Monto, reprogramar y más</button></div>`;
  el.hidden=false;
  positionPop();
}
function positionPop(){
  const el=pop();const r=S.popAnchor;
  if(window.innerWidth<760||!r){el.classList.add('sheet');el.style.left='';el.style.top='';return}
  el.classList.remove('sheet');
  const w=el.offsetWidth,h=el.offsetHeight,m=10;
  let left=r.right+m;if(left+w>window.innerWidth-m) left=r.left-w-m;
  if(left<m) left=Math.max(m,Math.min(window.innerWidth-w-m,r.left));
  let top=Math.min(Math.max(m,r.top),window.innerHeight-h-m);
  el.style.left=left+'px';el.style.top=top+'px';
}
function closePop(){flushNotes();const el=pop();el.hidden=true;S.popId=null;}
function findSession(id){
  for(const d of Object.values(S.ses)) if(d.items?.[id]) return d.items[id];
  return null;
}
/* Notas: se guardan solas, una escritura por pausa */
const noteTimers={};
function queueNote(id,text){
  clearTimeout(noteTimers[id]);
  const st=document.getElementById('noteState');if(st)st.textContent='Guardando…';
  noteTimers[id]=setTimeout(()=>saveNote(id,text),700);
}
function saveNote(id,text){
  delete noteTimers[id];
  const s=S.visible[id]||findSession(id);if(!s)return;
  if((s.nota||'')===text) {const st=document.getElementById('noteState');if(st)st.textContent='Guardado';return}
  const saved=saveSession({...s,nota:text});S.visible[id]=saved;
  const st=document.getElementById('noteState');if(st)st.textContent='Guardado';
}
function flushNotes(){
  document.querySelectorAll('[data-note]').forEach(t=>{if(noteTimers[t.dataset.note]){clearTimeout(noteTimers[t.dataset.note]);saveNote(t.dataset.note,t.value.trim())}});
}

/* ---- Semanas (análisis semanal) ---- */
function weeksOfMonth(m){
  const first=m+'-01',last=lastOfMonth(m);const out=[];
  for(let d=mondayOf(first);d<=last;d=addDays(d,7)) out.push(d);
  return out;
}
function wkLabel(from){
  const to=addDays(from,6);const a=parse(from),b=parse(to);
  return a.getMonth()===b.getMonth()?`${a.getDate()} al ${b.getDate()} de ${MESES[b.getMonth()]}`:`${a.getDate()} de ${MESES_C[a.getMonth()]} al ${b.getDate()} de ${MESES_C[b.getMonth()]}`;
}
function wkStats(ss){
  const st=stats(ss);
  st.sinRegistrar=ss.filter(s=>s.estado==='programada'&&isPast(s)).length;
  st.futuras=ss.filter(s=>s.estado==='programada'&&!isPast(s)).length;
  st.registradas=ss.filter(s=>s.estado!=='programada').length;
  st.pct=st.registradas?Math.round(st.realizadas/st.registradas*100):null;
  const by={};for(const s of ss) if(s.estado!=='programada'&&modeOf(item('estadosSesion',s.estado))!=='si') by[s.estado]=(by[s.estado]||0)+1;
  st.motivos=by;
  return st;
}
function wkChart(rows){
  const W=720,H=170,pb=40,pt=18;const n=rows.length;const bw=W/n;
  const max=Math.max(1,...rows.map(r=>r.st.total));
  const y=v=>(v/max)*(H-pb-pt);
  let g='';
  rows.forEach((r,i)=>{
    const x=i*bw+bw*.25,w=bw*.5;let base=H-pb;
    const parts=[[r.st.realizadas,'var(--accent)'],[r.st.registradas-r.st.realizadas,'var(--warn)'],[r.st.sinRegistrar+r.st.futuras,'var(--line)']];
    let rects='';for(const [v,c] of parts){if(!v)continue;const hh=y(v);base-=hh;rects+=`<rect x="${x}" y="${base}" width="${w}" height="${hh}" fill="${c}" rx="2"/>`}
    const sel=r.from===S.wkSel;
    g+=`<g class="wkbar${sel?' sel':''}" data-a="wk-sel" data-d="${r.from}" role="button" tabindex="0" aria-label="Semana del ${wkLabel(r.from)}"><title>Semana del ${wkLabel(r.from)}: ${r.st.realizadas} realizadas de ${r.st.total}, ${money(r.st.cobrado)} cobrado</title>
      <rect x="${i*bw+2}" y="0" width="${bw-4}" height="${H}" fill="${sel?'var(--accent-soft)':'transparent'}" rx="8"/>${rects}
      <text x="${i*bw+bw/2}" y="${base-5}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${r.st.total||''}</text>
      <text x="${i*bw+bw/2}" y="${H-22}" text-anchor="middle" font-size="12" fill="var(--muted)">${dayNum(r.from)}/${parse(r.from).getMonth()+1}</text>
      <text x="${i*bw+bw/2}" y="${H-7}" text-anchor="middle" font-size="11" fill="var(--muted)">al ${dayNum(addDays(r.from,6))}/${parse(addDays(r.from,6)).getMonth()+1}</text></g>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sesiones por semana">${g}</svg>
    <div class="legend"><span><i class="dot" style="--c:var(--accent)"></i>Realizadas</span><span><i class="dot" style="--c:var(--warn)"></i>No realizadas</span><span><i class="dot" style="--c:var(--line)"></i>Sin registrar o futuras</span></div>`;
}
function wkCard(s){
  S.visible[s.id]=s;const p=pat(s.pid);const e=item('estadosSesion',s.estado);
  const unreg=s.estado==='programada'&&isPast(s);
  return `<article class="wcard${unreg?' unreg':''}${modeOf(e)!=='si'&&s.estado!=='programada'?' off':''}" style="--c:${esc(colorOf('estadosSesion',s.estado))}" data-id="${esc(s.id)}">
    <div class="wc-top"><span class="time">${esc(s.hora||'')}</span><div class="wc-name">${nameBlock(p)}</div>
      <button class="blk-more static" data-a="open-ses" data-id="${esc(s.id)}" aria-label="Más opciones" title="Monto, reprogramar y más">⋯</button></div>
    <div class="ses-meta">${esc(instOf(p)?.nombre||'')}${instOf(p)?', ':''}${money(montoOf(s))}</div>
    <div class="dual-row"><span class="dual-lbl">Sesión</span><select class="select sm" data-c="ses-field" data-f="estado" data-id="${esc(s.id)}" aria-label="Estado de la sesión">${estadoOpts(s)}</select></div>
    <div class="dual-row"><span class="dual-lbl">Pago</span>${payToggle(s)}</div>
    <textarea class="input note-in" rows="2" placeholder="Nota" aria-label="Nota de la sesión" data-note="${esc(s.id)}">${esc(s.nota||'')}</textarea>
  </article>`;
}
function viewSemanas(){
  const m=S.wkMonth||(S.wkMonth=monthKey(TODAY));
  const weeks=weeksOfMonth(m);
  if(!S.wkSel||!weeks.includes(S.wkSel)) S.wkSel=weeks.includes(mondayOf(TODAY))?mondayOf(TODAY):weeks[0];
  const rows=weeks.map(from=>({from,ss:sessionsInRange(from,addDays(from,6))})).map(r=>({...r,st:wkStats(r.ss)}));
  const [y,mm]=m.split('-');
  const tbl=rows.map(r=>{const st=r.st;const split=monthKey(r.from)!==monthKey(addDays(r.from,6));
    const mot=Object.entries(st.motivos).map(([id,n])=>`<span class="chip sm"><span class="dot" style="--c:${esc(colorOf('estadosSesion',id))}"></span>${esc(item('estadosSesion',id)?.nombre||id)} ${n}</span>`).join(' ');
    return `<tr class="clickable${r.from===S.wkSel?' is-sel':''}" data-a="wk-sel" data-d="${r.from}">
      <td><b>${wkLabel(r.from)}</b>${split?'<div class="small muted">Se reparte entre dos meses</div>':''}</td>
      <td class="num">${st.total}</td><td class="num">${st.realizadas}</td>
      <td>${mot||'<span class="muted">—</span>'}</td>
      <td class="num">${st.pct==null?'—':st.pct+'%'}</td>
      <td class="num">${st.sinRegistrar?`<span style="color:var(--warn)">${st.sinRegistrar}</span>`:'—'}</td>
      <td class="num">${money(st.cobrado)}</td><td class="num">${st.pendiente?`<span style="color:var(--warn)">${money(st.pendiente)}</span>`:'—'}</td></tr>`}).join('');
  const sel=rows.find(r=>r.from===S.wkSel);const st=sel.st;
  const showWE=S.config.general.finDeSemana||sel.ss.some(s=>dow(s.fecha)>=6);
  let days='';
  for(let i=0;i<(showWE?7:5);i++){
    const d=addDays(sel.from,i);const ss=sel.ss.filter(s=>s.fecha===d);
    const other=monthKey(d)!==m;
    days+=`<section class="wday${d===TODAY?' today':''}${other?' other':''}"><div class="wday-head"><div><span class="dname">${DIAS[i]}</span>${other?`<span class="mtag">${cap(monName(d))}</span>`:''}</div><span class="dnum">${dayNum(d)}</span></div>
      <div class="wday-body">${ss.length?ss.map(wkCard).join(''):'<p class="empty-day">Sin sesiones</p>'}</div></section>`;
  }
  return `<div class="view-head"><div><h1>Semanas de ${MESES[Number(mm)-1]} ${y}</h1><p class="sub">Cada semana va de lunes a domingo, con sus fechas. Tocá una semana para ver su detalle.</p></div>
    <div class="btn-group"><button class="btn icon" data-a="wk-month" data-n="-1" aria-label="Mes anterior">‹</button><button class="btn" data-a="wk-month" data-n="0">Este mes</button><button class="btn icon" data-a="wk-month" data-n="1" aria-label="Mes siguiente">›</button></div></div>
    <div class="panel"><div class="panel-head"><h2>Sesiones por semana</h2></div><div class="panel-body chart wkchart">${wkChart(rows)}</div>
    <div class="scroll"><table class="wk-table"><thead><tr><th>Semana</th><th class="num">Sesiones</th><th class="num">Realizadas</th><th>No realizadas</th><th class="num">% realizadas</th><th class="num">Sin registrar</th><th class="num">Cobrado</th><th class="num">Pendiente</th></tr></thead>
    <tbody>${tbl}</tbody></table></div>
    <p class="hint panel-body" style="padding-top:8px">"% realizadas" se calcula sobre las sesiones ya registradas. Las semanas que se reparten entre dos meses muestran sus siete días completos.</p></div>
    <div class="wk-detail-head"><div><h2>Semana del ${wkLabel(sel.from)}</h2><p class="sub">${st.total} sesiones, ${st.realizadas} realizadas${st.sinRegistrar?`, ${st.sinRegistrar} sin registrar`:''}. ${money(st.cobrado)} cobrado${st.pendiente?`, ${money(st.pendiente)} pendiente`:''}${st.inst?`, ${money(st.inst)} para instituciones`:''}.</p></div>
      <div class="btn-group"><button class="btn icon" data-a="wk-step" data-n="-1" aria-label="Semana anterior">‹</button><button class="btn icon" data-a="wk-step" data-n="1" aria-label="Semana siguiente">›</button></div></div>
    <div class="wweek" style="--cols:${showWE?7:5}">${days}</div>`;
}

/* ---- Caja mensual ---- */
function monthNav(){
  return `<div class="btn-group"><button class="btn icon" data-a="month" data-n="-1" aria-label="Mes anterior">‹</button><button class="btn" data-a="month" data-n="0">Este mes</button><button class="btn icon" data-a="month" data-n="1" aria-label="Mes siguiente">›</button></div>`;
}
function pillFor(s){
  S.visible[s.id]=s;
  const e=item('estadosSesion',s.estado),pg=item('estadosPago',s.pago);
  const c=esc(colorOf('estadosSesion',s.estado));
  const t=`${fmtShort(s.fecha)} ${s.hora||''}: ${e?.nombre||''}, ${pg?.nombre||''}`;
  if(pg?.tipo==='cobrado') return `<button class="pill" style="--c:${c}" data-a="open-ses" data-id="${esc(s.id)}" title="${esc(t)}"><span class="dot"></span>${fmtShort(s.fecha)} ${money(montoOf(s))}</button>`;
  if(cobraOf(s)&&pg?.tipo==='pendiente') return `<button class="pill debe" data-a="open-ses" data-id="${esc(s.id)}" title="${esc(t)}">${fmtShort(s.fecha)} debe ${money(montoOf(s))}</button>`;
  return `<button class="pill ${s.estado==='programada'?'soft':''}" style="--c:${c}" data-a="open-ses" data-id="${esc(s.id)}" title="${esc(t)}"><span class="dot"></span>${fmtShort(s.fecha)} ${esc(e?.nombre||'')}</button>`;
}
function viewCaja(){
  const m=S.month,first=m+'-01',last=lastOfMonth(m);
  const all=sessionsInRange(first,last);const st=stats(all);
  const gastos=gastosMes(m).reduce((a,g)=>a+Number(g.monto||0),0);
  const byP={};for(const s of all)(byP[s.pid]=byP[s.pid]||[]).push(s);
  const pids=Object.keys(byP).sort((a,b)=>sortName(pat(a)).localeCompare(sortName(pat(b))));
  const rows=pids.map(pid=>{
    const p=pat(pid);const ss=byP[pid];const r=stats(ss);
    return `<tr><td class="pname">${esc(fullName(p)||'Paciente eliminado')}<div class="small muted">${esc(instOf(p)?.nombre||'')}</div></td>
      <td class="pills-cell">${ss.map(pillFor).join('')}</td>
      <td class="num">${r.realizadas}</td>
      <td class="num">${money(r.cobrado)}</td><td class="num">${r.pendiente?`<span style="color:var(--warn)">${money(r.pendiente)}</span>`:'—'}</td>
      <td class="num">${r.inst?money(r.inst):'—'}</td><td>${esc(item('facturacion',p?.facturacion)?.nombre||'')}</td></tr>`;
  }).join('');
  const [y,mm]=m.split('-');
  return `<div class="view-head"><div><h1>Caja de ${MESES[Number(mm)-1]} ${y}</h1><p class="sub">Del 1 al ${Number(last.slice(8))} de ${MESES[Number(mm)-1]}. Cada sesión cuenta en el mes de su fecha.</p></div>${monthNav()}</div>
    <div class="kpis">
      <div class="kpi"><span>Cobrado</span><b>${money(st.cobrado)}</b></div>
      <div class="kpi ${st.pendiente?'warn':''}"><span>Pendiente de cobro</span><b>${money(st.pendiente)}</b></div>
      <div class="kpi"><span>Para instituciones</span><b>${money(st.inst)}</b></div>
      <div class="kpi"><span>Gastos</span><b>${money(gastos)}</b></div>
      <div class="kpi"><span>Neto del mes</span><b>${money(st.cobrado-st.inst-gastos)}</b></div>
    </div>
    <div class="panel"><div class="scroll"><table class="caja-table">
      <thead><tr><th>Paciente</th><th>Sesiones del mes</th><th class="num">Realizadas</th><th class="num">Cobrado</th><th class="num">Pendiente</th><th class="num">Institución</th><th>Facturación</th></tr></thead>
      <tbody>${rows||'<tr><td colspan="7" class="muted">No hay sesiones en este mes.</td></tr>'}</tbody>
      ${rows?`<tfoot><tr><td>Total</td><td>${st.total} sesiones, ${st.canceladas} sin realizar</td><td class="num">${st.realizadas}</td><td class="num">${money(st.cobrado)}</td><td class="num">${money(st.pendiente)}</td><td class="num">${money(st.inst)}</td><td></td></tr></tfoot>`:''}
    </table></div></div>
    ${yearChart(y)}`;
}
function yearChart(y){
  const data=[];
  for(let i=1;i<=12;i++){
    const m=`${y}-${pad(i)}`;const doc=S.ses['ses-'+m];
    const st=stats(Object.values(doc?.items||{}).filter(s=>!s.oculta));
    const g=gastosMes(m).reduce((a,x)=>a+Number(x.monto||0),0);
    data.push({c:st.cobrado,g,n:st.cobrado-st.inst-g});
  }
  const max=Math.max(1,...data.map(d=>Math.max(d.c,d.g)));
  const W=720,H=200,pl=8,pb=24,bw=(W-pl*2)/12;
  let bars='';
  data.forEach((d,i)=>{
    const x=pl+i*bw;const hc=(d.c/max)*(H-pb-10);const hg=(d.g/max)*(H-pb-10);
    bars+=`<g><title>${cap(MESES[i])}: cobrado ${money(d.c)}, gastos ${money(d.g)}, neto ${money(d.n)}</title>
      <rect x="${x+bw*.18}" y="${H-pb-hc}" width="${bw*.32}" height="${hc}" rx="3" fill="var(--accent)"/>
      <rect x="${x+bw*.52}" y="${H-pb-hg}" width="${bw*.3}" height="${hg}" rx="3" fill="var(--warn)" opacity=".7"/>
      <text x="${x+bw/2}" y="${H-6}" text-anchor="middle" font-size="12" fill="var(--muted)">${MESES_C[i]}</text></g>`;
  });
  return `<div class="panel"><div class="panel-head"><h2>Año ${y}</h2><span class="small muted">Solo cuenta sesiones ya marcadas</span></div>
    <div class="panel-body chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Cobrado y gastos por mes de ${y}">
    <line x1="0" x2="${W}" y1="${H-pb}" y2="${H-pb}" stroke="var(--line)"/>${bars}</svg>
    <div class="legend"><span><i class="dot" style="--c:var(--accent)"></i>Cobrado</span><span><i class="dot" style="--c:var(--warn)"></i>Gastos</span></div></div></div>`;
}

/* ---- Pacientes ---- */
const activeH=p=>(p.horarios||[]).filter(h=>h.hora&&(!h.hasta||h.hasta>=TODAY));
function horarioTxt(p){
  return activeH(p).map(h=>`${DIAS_C[(h.dia||1)-1]} ${h.hora}, ${(item('frecuencias',h.frecuencia)?.nombre||'').toLowerCase()}`).join('; ')||'Sin horario';
}
function patientHistory(pid){
  const arr=[];for(const d of Object.values(S.ses)) for(const s of Object.values(d.items||{})) if(s.pid===pid&&!s.oculta) arr.push(s);
  return stats(arr);
}
function viewPacientes(){
  const q=S.q.trim().toLowerCase();
  const ps=S.patients.filter(p=>(!S.filtroEstado||p.estado===S.filtroEstado)&&(!q||fullName(p).toLowerCase().includes(q)||(p.hc||'').includes(q)))
    .sort((a,b)=>sortName(a).localeCompare(sortName(b)));
  const rows=ps.map(p=>{const h=patientHistory(p.id);const e=item('estadosPaciente',p.estado);
    return `<tr class="clickable" data-a="pac-open" data-id="${esc(p.id)}"><td>${esc(p.hc||'')}</td><td><b>${esc(fullName(p))}</b><div class="small muted">${esc(item('modalidades',p.modalidad)?.nombre||'')}</div></td>
    <td>${esc(horarioTxt(p))}</td><td>${esc(instOf(p)?.nombre||'')}</td><td class="num">${money(p.honorario)}</td>
    <td><span class="chip"><span class="dot" style="--c:${esc(e?.color||'#999')}"></span>${esc(e?.nombre||'Sin estado')}</span></td>
    <td class="num">${h.pendiente?`<span style="color:var(--warn)">${money(h.pendiente)}</span>`:'—'}</td></tr>`}).join('');
  return `<div class="view-head"><div><h1>Pacientes</h1><p class="sub">${S.patients.length} en total, ${S.patients.filter(p=>item('estadosPaciente',p.estado)?.agenda).length} en agenda</p></div>
    <button class="btn primary" data-a="pac-new">Nuevo paciente</button></div>
    <div class="panel"><div class="panel-head"><div class="toolbar">
      <input class="input" type="search" placeholder="Buscar por nombre o HC" value="${esc(S.q)}" data-c="pac-q" aria-label="Buscar paciente">
      <select class="select" data-c="pac-f" aria-label="Filtrar por estado">${options('estadosPaciente',S.filtroEstado,'Todos los estados')}</select></div></div>
    <div class="scroll"><table><thead><tr><th>HC</th><th>Nombre</th><th>Horario</th><th>Institución</th><th class="num">Honorario</th><th>Estado</th><th class="num">Debe</th></tr></thead>
    <tbody>${rows||`<tr><td colspan="7" class="muted">${S.patients.length?'Ningún paciente coincide con la búsqueda.':'Todavía no hay pacientes. Creá el primero con "Nuevo paciente".'}</td></tr>`}</tbody></table></div></div>`;
}

/* ---- Gastos ---- */
function viewGastos(){
  const m=S.month;const gs=gastosMes(m).sort((a,b)=>(a.fecha||'').localeCompare(b.fecha||''));
  const total=gs.reduce((a,g)=>a+Number(g.monto||0),0);
  const prev=gastosMes(addMonths(m,-1));
  const rows=gs.map(g=>`<tr><td>${esc(fmtShort(g.fecha))}</td><td>${esc(item('categoriasGasto',g.categoria)?.nombre||'Sin categoría')}</td><td>${esc(g.descripcion||'')}</td>
    <td>${esc(item('mediosPago',g.medio)?.nombre||'')}</td><td class="num">${money(g.monto)}</td>
    <td class="num"><button class="btn danger icon" data-a="gasto-del" data-id="${esc(g.id)}" aria-label="Eliminar gasto">✕</button></td></tr>`).join('');
  const [y,mm]=m.split('-');
  return `<div class="view-head"><div><h1>Gastos de ${MESES[Number(mm)-1]} ${y}</h1><p class="sub">Total del mes: ${money(total)}</p></div>${monthNav()}</div>
    <div class="panel"><div class="panel-head"><h2>Nuevo gasto</h2>${prev.length&&!gs.length?`<button class="btn" data-a="gasto-copy">Copiar los ${prev.length} gastos del mes anterior</button>`:''}</div>
    <div class="panel-body"><div class="toolbar">
      <input class="input" type="date" id="g_fecha" value="${m===monthKey(TODAY)?TODAY:m+'-01'}" aria-label="Fecha">
      <select class="select" id="g_cat" aria-label="Categoría">${options('categoriasGasto','')}</select>
      <input class="input" id="g_desc" placeholder="Descripción" aria-label="Descripción" style="flex:1;min-width:160px">
      <select class="select" id="g_medio" aria-label="Medio de pago">${options('mediosPago','','Medio de pago')}</select>
      <input class="input" id="g_monto" type="number" min="0" step="100" placeholder="Monto" aria-label="Monto" style="width:130px">
      <button class="btn primary" data-a="gasto-add">Agregar gasto</button></div></div></div>
    <div class="panel"><div class="scroll"><table><thead><tr><th>Fecha</th><th>Categoría</th><th>Descripción</th><th>Medio</th><th class="num">Monto</th><th></th></tr></thead>
    <tbody>${rows||'<tr><td colspan="6" class="muted">No hay gastos cargados en este mes.</td></tr>'}</tbody>
    ${rows?`<tfoot><tr><td colspan="4">Total</td><td class="num">${money(total)}</td><td></td></tr></tfoot>`:''}</table></div></div>`;
}

/* ---- Configuración ---- */
function cfgExtra(L,i){
  return (L.extra||[]).map(x=>{
    if(x.type==='bool') return `<label class="cfg-extra"><input type="checkbox" data-c="cfg" data-list="${L.key}" data-id="${esc(i.id)}" data-k="${x.k}" ${i[x.k]?'checked':''}>${x.label}</label>`;
    if(x.type==='number') return `<label class="cfg-extra">${x.label}<input class="input" type="number" min="0" data-c="cfg" data-list="${L.key}" data-id="${esc(i.id)}" data-k="${x.k}" value="${esc(i[x.k]??0)}">${x.suffix||(x.k==='porcentaje'?'%':'')}</label>`;
    if(x.type==='select') return `<label class="cfg-extra">${x.label}<select class="select" data-c="cfg" data-list="${L.key}" data-id="${esc(i.id)}" data-k="${x.k}">${x.opts.map(([v,t])=>`<option value="${v}"${i[x.k]===v?' selected':''}>${t}</option>`).join('')}</select></label>`;
  }).join('');
}
function hourOpts(sel){let h='';for(let i=0;i<=24;i++)h+=`<option value="${i}"${Number(sel)===i?' selected':''}>${pad(i)}:00</option>`;return h}
const PALETAS=[
  ['rosa-salvia','Rosa y salvia','Fondo rosado, acentos verde salvia',['#F8F3F1','#F6DDE3','#557F66','#33302F']],
  ['rosa','Rosa cuarzo','Todo en rosas suaves',['#FAF3F2','#F7DFE4','#A5566D','#3B2F34']],
  ['salvia','Verde salvia','Verdes calmos y naturales',['#F1F6F1','#DAECDD','#4D7A5D','#2B3A31']],
  ['original','Original','La paleta con la que empezamos',['#EDF1EF','#DDEBE8','#2B6B64','#17272A']]];
const FUENTES=[
  ['serena','Serena','Títulos en Lora y textos en Nunito','"Lora",Georgia,serif'],
  ['suave','Suave','Todo en Nunito, redondeada','"Nunito",system-ui,sans-serif'],
  ['original','Original','Instrument Sans','"Instrument Sans",system-ui,sans-serif']];
function lookPanel(g){
  const pal=g.paleta||'rosa-salvia',fu=g.fuente||'serena';
  return `<section class="panel"><div class="panel-head"><div><h2>Apariencia</h2><p class="small muted" style="margin-top:3px">Se aplica al instante. Probá las combinaciones y quedate con la que te resulte más cómoda.</p></div></div>
    <div class="panel-body">
      <h3 class="lbl">Paleta de colores</h3>
      <div class="look-grid">${PALETAS.map(([id,n,d,c])=>`<button class="look" data-a="look" data-k="paleta" data-v="${id}" aria-pressed="${pal===id}"><span class="sw">${c.map(x=>`<i style="background:${x}"></i>`).join('')}</span><span class="lt"><b>${n}</b><span>${d}</span></span></button>`).join('')}</div>
      <h3 class="lbl" style="margin-top:18px">Tipografía</h3>
      <div class="look-grid">${FUENTES.map(([id,n,d,ff])=>`<button class="look" data-a="look" data-k="fuente" data-v="${id}" aria-pressed="${fu===id}"><span class="lt"><span class="fsample" style="font-family:${ff}">Martes 22 de septiembre</span><b>${n}</b><span>${d}</span></span></button>`).join('')}</div>
      <label class="check" style="margin-top:14px"><input type="checkbox" data-c="gen" data-k="textura" ${g.textura!==false?'checked':''}>Textura de papel sutil en el fondo</label>
    </div></section>`;
}
function viewConfig(){
  const g=S.config.general;
  const panels=LISTS.map(L=>`<section class="panel"><div class="panel-head"><div><h2>${L.titulo}</h2><p class="small muted" style="margin-top:3px">${L.desc}</p></div></div>
    <div class="panel-body">
    ${list(L.key).map(i=>`<div class="cfg-item${L.color?'':' nocolor'}">
      ${L.color?`<input type="color" value="${esc(i.color||'#8A9A9C')}" data-c="cfg" data-list="${L.key}" data-id="${esc(i.id)}" data-k="color" aria-label="Color de ${esc(i.nombre)}">`:''}
      <input class="input" value="${esc(i.nombre)}" data-c="cfg" data-list="${L.key}" data-id="${esc(i.id)}" data-k="nombre" aria-label="Nombre">
      ${i.fijo?'<span class="lock" title="Este valor lo usa el sistema y no se puede eliminar">fijo</span>':`<button class="btn danger icon" data-a="cfg-del" data-list="${L.key}" data-id="${esc(i.id)}" aria-label="Eliminar ${esc(i.nombre)}">✕</button>`}
      <div class="extras">${cfgExtra(L,i)}</div>
    </div>`).join('')}
    <div class="cfg-add"><input class="input" placeholder="Nuevo valor" id="add_${L.key}" aria-label="Nuevo valor para ${L.titulo}" data-enter="cfg-add" data-list="${L.key}"><button class="btn" data-a="cfg-add" data-list="${L.key}">Agregar</button></div>
    </div></section>`).join('');
  return `<div class="view-head"><div><h1>Configuración</h1><p class="sub">Los cambios se guardan automáticamente.</p></div></div>
    ${lookPanel(g)}
    <section class="panel" style="margin-top:16px"><div class="panel-head"><h2>General</h2></div><div class="panel-body"><div class="form cols3">
      <div class="field full"><label for="c_prof">Nombre del profesional o consultorio</label><input class="input" id="c_prof" data-c="gen" data-k="profesional" value="${esc(g.profesional)}" placeholder="Ej.: Lic. Nombre Apellido"></div>
      <div class="field"><label for="c_ini">La agenda empieza a las</label><select class="select" id="c_ini" data-c="gen" data-k="inicio" data-num="1">${hourOpts(g.inicio)}</select></div>
      <div class="field"><label for="c_fin">Y termina a las</label><select class="select" id="c_fin" data-c="gen" data-k="fin" data-num="1">${hourOpts(g.fin)}</select></div>
      <div class="field"><label for="c_dur">Duración habitual de la sesión (min)</label><input class="input" type="number" min="10" step="5" id="c_dur" data-c="gen" data-k="duracion" data-num="1" value="${esc(g.duracion)}"></div>
      <div class="field"><label for="c_vista">Vista inicial de la agenda</label><select class="select" id="c_vista" data-c="gen" data-k="vistaInicial">${[['dia','Día'],['semana','Semana'],['mes','Mes']].map(([v,l])=>`<option value="${v}"${g.vistaInicial===v?' selected':''}>${l}</option>`).join('')}</select></div>
      <div class="field"><label>Fin de semana</label><label class="check"><input type="checkbox" data-c="gen" data-k="finDeSemana" ${g.finDeSemana?'checked':''}>Mostrar sábado y domingo siempre</label></div>
    </div></div></section>
    <div class="cfg-grid" style="margin-top:16px">${panels}</div>
    <section class="panel" style="margin-top:16px"><div class="panel-head"><div><h2>Tus datos</h2><p class="small muted" style="margin-top:3px">${Store.mode==='db'?'Se guardan en tu cuenta y solo vos podés verlos.':'Se guardan solo en este navegador. Descargá copias de seguridad seguido.'}</p></div></div>
    <div class="panel-body btn-group">
      <button class="btn" data-a="export">Descargar copia de seguridad</button>
      <label class="btn">Restaurar desde una copia<input type="file" accept=".json,application/json" data-c="import" hidden></label>
      <button class="btn danger" data-a="reset">Borrar todos los datos</button>
    </div></section>`;
}

/* ============ Diálogos ============ */
const dlg=document.getElementById('dlg');
dlg.addEventListener('close',()=>{S.dlgOpen=false;S.edit=null;render()});
function openDlg(html){dlg.innerHTML=html;if(!dlg.open)dlg.showModal();S.dlgOpen=true}
function closeDlg(){if(dlg.open)dlg.close()}
function confirmBox(title,text,okLabel='Confirmar',danger=true){
  const c=document.getElementById('confirm');
  c.innerHTML=`<div class="dlg-head"><h2>${esc(title)}</h2></div><div class="dlg-body"><p>${esc(text)}</p></div>
    <div class="dlg-foot"><span></span><div class="btn-group"><button class="btn" value="no">Cancelar</button><button class="btn primary" value="ok" style="${danger?'background:var(--danger);border-color:var(--danger)':''}">${esc(okLabel)}</button></div></div>`;
  return new Promise(res=>{
    c.querySelectorAll('button').forEach(b=>b.onclick=()=>{c.close();res(b.value==='ok')});
    c.oncancel=()=>res(false);c.showModal();
  });
}
function chipBtn(f,i,sel){return `<button class="chipbtn" style="--c:${esc(i.color||'var(--accent)')}" data-a="sheet-set" data-f="${f}" data-v="${esc(i.id)}" aria-pressed="${i.id===sel}"><span class="dot"></span>${esc(i.nombre)}</button>`}
function sesSheet(){
  const s=S.edit;const p=pat(s.pid);const pg=item('estadosPago',s.pago);
  const done=cobraOf(s)&&pg?.tipo==='cobrado';
  const detOpen=document.getElementById('sheetMore')?.open;
  openDlg(`<div class="dlg-head"><div><h2>${esc(fullName(p)||'Paciente eliminado')}</h2><p class="muted small">${cap(fmtLong(s.fecha))}, ${esc(s.hora||'sin hora')}, ${durOf(s)} min, ${money(montoOf(s))}</p></div><button class="btn ghost icon" data-a="dlg-close" aria-label="Cerrar">✕</button></div>
  <div class="dlg-body">
    <h3 class="lbl">Sesión: ¿qué pasó?</h3><div class="chips">${list('estadosSesion').map(i=>chipBtn('estado',i,s.estado)).join('')}</div>
    ${modeOf(item('estadosSesion',s.estado))==='opcional'?`<h3 class="lbl">¿Se cobra?</h3><div class="chips"><button class="chipbtn" data-a="set-cobrar" data-id="${esc(s.id)}" data-v="0" aria-pressed="${!s.cobrar}">No se cobra</button><button class="chipbtn" data-a="set-cobrar" data-id="${esc(s.id)}" data-v="1" aria-pressed="${!!s.cobrar}">Se cobra</button></div>`:''}
    <h3 class="lbl">Pago</h3>${payApplies(s)?`<div class="chips">${list('estadosPago').map(i=>chipBtn('pago',i,s.pago)).join('')}</div>`:'<p class="no-pay" style="margin-bottom:16px">Esta sesión no genera honorario, así que no corresponde cobro.</p>'}
 ${sesCompRow(s)?`<div style="margin-bottom:14px">${sesCompRow(s)}</div>`:''}
    <details id="sheetMore" ${detOpen?'open':''}><summary>Monto, medio de pago y nota</summary><div class="form" style="margin-top:12px">
      ${s.extra?`<div class="field"><label for="f_fecha">Fecha</label><input class="input" type="date" id="f_fecha" value="${esc(s.fecha)}"></div>
      <div class="field"><label for="f_hora">Hora</label><input class="input" type="time" id="f_hora" value="${esc(s.hora||'')}"></div>`:''}
      <div class="field"><label for="f_monto">Honorario de esta sesión</label><input class="input" type="number" min="0" step="100" id="f_monto" value="${esc(montoOf(s))}"></div>
      <div class="field"><label for="f_medio">Medio de pago</label><select class="select" id="f_medio">${options('mediosPago',s.medio||p?.medioPago||'','Sin especificar')}</select></div>
      <div class="field full"><label for="f_nota">Nota administrativa</label><textarea class="input" id="f_nota" placeholder="Ej.: avisó por WhatsApp, pagó con recargo">${esc(s.nota||'')}</textarea></div>
      <div class="full"><button class="btn" data-a="sheet-save">Guardar estos datos</button></div></div></details>
    <div id="reprog" hidden><div class="form" style="margin-top:14px">
      <div class="fieldset-title">Reprogramar</div>
      <div class="field"><label for="r_fecha">Nueva fecha</label><input class="input" type="date" id="r_fecha" value="${esc(addDays(s.fecha,1))}"></div>
      <div class="field"><label for="r_hora">Nueva hora</label><input class="input" type="time" id="r_hora" value="${esc(s.hora||'')}"></div>
      <p class="hint full">${s.extra?'La sesión se mueve a la nueva fecha.':'Esta sesión queda como "Reprogramada" y se crea una nueva en la fecha elegida.'}</p>
      <div class="full"><button class="btn primary" data-a="ses-reprog-save">Confirmar reprogramación</button></div></div></div>
  </div>
  <div class="dlg-foot"><div class="btn-group"><button class="btn danger" data-a="ses-hide">${s.extra?'Eliminar sesión':'Quitar de la agenda'}</button><button class="btn ghost" data-a="ses-reprog">Reprogramar</button></div>
    <button class="btn primary" data-a="dlg-close">Listo</button></div>`);
}
function newSesDialog(fecha,hora){
  S.edit={id:'x_'+uid(),fecha,hora:hora||'',extra:true,isNew:true};
  openDlg(`<div class="dlg-head"><div><h2>Nueva sesión</h2><p class="muted small">Sesión fuera del horario habitual, única o de un paciente nuevo</p></div><button class="btn ghost icon" data-a="dlg-close" aria-label="Cerrar">✕</button></div>
  <div class="dlg-body"><div class="form">
    <div class="field full"><label for="f_pid">Paciente</label><select class="select" id="f_pid">${[...S.patients].sort((a,b)=>sortName(a).localeCompare(sortName(b))).map(x=>`<option value="${esc(x.id)}">${esc(fullName(x))}</option>`).join('')}</select></div>
    <div class="field"><label for="f_fecha">Fecha</label><input class="input" type="date" id="f_fecha" value="${esc(fecha)}"></div>
    <div class="field"><label for="f_hora">Hora</label><input class="input" type="time" id="f_hora" value="${esc(hora||'')}"></div>
    <div class="field"><label for="f_dur">Duración (min)</label><input class="input" type="number" min="10" step="5" id="f_dur" value="${defDur()}"></div>
    <div class="field"><label for="f_monto">Honorario</label><input class="input" type="number" min="0" step="100" id="f_monto" placeholder="El habitual del paciente"></div>
    <div class="field"><label for="f_estado">Estado de la sesión</label><select class="select" id="f_estado">${options('estadosSesion','programada')}</select></div>
    <div class="field"><label for="f_pago">Pago</label><select class="select" id="f_pago">${options('estadosPago','pendiente')}</select></div>
    <div class="field full"><label for="f_nota">Nota administrativa</label><textarea class="input" id="f_nota"></textarea></div>
  </div></div>
  <div class="dlg-foot"><span></span><div class="btn-group"><button class="btn" data-a="dlg-close">Cancelar</button><button class="btn primary" data-a="new-save">Agregar sesión</button></div></div>`);
}
function pacDialog(p){
  const isNew=!p;
  S.edit=p?JSON.parse(JSON.stringify(p)):{id:'p_'+uid(),apellido:'',hc:String(S.patients.reduce((a,x)=>Math.max(a,Number(x.hc)||0),0)+1),nombre:'',dni:'',telefono:'',email:'',fechaDerivacion:TODAY,
    estado:list('estadosPaciente')[0]?.id||'',modalidad:list('modalidades')[0]?.id||'',institucion:list('instituciones')[0]?.id||'',supervisa:false,legajo:list('legajos')[0]?.id||'',
    honorario:'',medioPago:list('mediosPago')[0]?.id||'',facturacion:list('facturacion')[0]?.id||'',horarios:[],observaciones:''};
  S.edit.isNew=isNew;
  S.edit.horarios=activeH(S.edit).length||isNew?activeH(S.edit):[];
  if(isNew) S.edit.horarios=[{id:'h_'+uid(),dia:1,hora:'',duracion:defDur(),frecuencia:list('frecuencias')[0]?.id||'',desde:TODAY}];
  renderPacDialog();
}
function renderPacDialog(){
  const e=S.edit;const h=e.isNew?null:patientHistory(e.id);
  const orig=e.isNew?null:pat(e.id);
  const closed=(orig?.horarios||[]).filter(x=>x.hasta&&x.hasta<TODAY);
  const F=(id,label,val,type='text',extra='')=>`<div class="field"><label for="pf_${id}">${label}</label><input class="input" id="pf_${id}" name="${id}" type="${type}" value="${esc(val??'')}" ${extra}></div>`;
  const Sel=(id,label,k,val,empty)=>`<div class="field"><label for="pf_${id}">${label}</label><select class="select" id="pf_${id}" name="${id}">${options(k,val,empty)}</select></div>`;
  openDlg(`<div class="dlg-head"><div><h2>${e.isNew?'Nuevo paciente':esc(fullName(e))}</h2>${e.isNew?'':`<p class="muted small">HC ${esc(e.hc)}</p>`}</div><button class="btn ghost icon" data-a="dlg-close" aria-label="Cerrar">✕</button></div>
  <div class="dlg-body" id="pac-form">
    ${h?`<div class="summary-row"><div><span class="muted">Sesiones realizadas</span><b>${h.realizadas}</b></div><div><span class="muted">Cobrado total</span><b>${money(h.cobrado)}</b></div><div><span class="muted">Pendiente de cobro</span><b style="color:${h.pendiente?'var(--warn)':'inherit'}">${money(h.pendiente)}</b></div></div>`:''}
    <div class="form">
      <div class="fieldset-title">Datos personales</div>
      ${F('nombre','Nombre',e.nombre,'text','required autocomplete="off"')}
      ${F('apellido','Apellido',e.apellido,'text','autocomplete="off"')}
      ${F('hc','N.º de historia clínica',e.hc)}
      ${F('dni','DNI',e.dni,'text','inputmode="numeric"')}
      ${F('telefono','Teléfono',e.telefono,'tel')}
      ${F('email','Email',e.email,'email')}
      ${F('fechaDerivacion','Fecha de derivación o inicio',e.fechaDerivacion,'date')}
      <div class="fieldset-title">Tratamiento</div>
      ${Sel('estado','Estado','estadosPaciente',e.estado)}
      ${Sel('modalidad','Modalidad','modalidades',e.modalidad)}
      ${Sel('institucion','Institución o derivación','instituciones',e.institucion)}
      ${Sel('legajo','Legajo','legajos',e.legajo,'Sin especificar')}
      <div class="field"><label>Supervisión</label><label class="check"><input type="checkbox" name="supervisa" ${e.supervisa?'checked':''}>Se supervisa el caso</label></div>
      <div class="fieldset-title">Cobro</div>
      ${F('honorario','Honorario por sesión',e.honorario,'number','min="0" step="100"')}
      ${Sel('medioPago','Medio de pago habitual','mediosPago',e.medioPago,'Sin especificar')}
      ${Sel('facturacion','Facturación','facturacion',e.facturacion,'Sin especificar')}
      <p class="hint full">Cambiar el honorario no modifica las sesiones que ya marcaste.</p>
      <div class="fieldset-title">Horario habitual</div>
      <div class="full" id="horarios">${(e.horarios||[]).map((h,i)=>`<div class="hor-row" data-i="${i}" data-hid="${esc(h.id||'')}">
        <div class="field"><label>Día</label><select class="select" name="h_dia">${DIAS.map((d,di)=>`<option value="${di+1}"${Number(h.dia)===di+1?' selected':''}>${d}</option>`).join('')}</select></div>
        <div class="field"><label>Hora</label><input class="input" type="time" name="h_hora" value="${esc(h.hora||'')}"></div>
        <div class="field"><label>Minutos</label><input class="input" type="number" min="10" step="5" name="h_dur" value="${esc(h.duracion||defDur())}"></div>
        <div class="field"><label>Frecuencia</label><select class="select" name="h_frec">${options('frecuencias',h.frecuencia)}</select></div>
        <div class="field"><label>Desde</label><input class="input" type="date" name="h_desde" value="${esc(h.desde||'')}"></div>
        <button class="btn danger icon" data-a="hor-del" data-i="${i}" aria-label="Quitar horario">✕</button></div>`).join('')||'<p class="hint">Sin horario fijo. Podés agregar sesiones sueltas desde la agenda.</p>'}
        <button class="btn" data-a="hor-add">Agregar horario</button>
        <p class="hint" style="margin-top:8px">Si cambiás o quitás un horario, el cambio rige desde hoy: las sesiones anteriores quedan como estaban. En quincenal, "Desde" marca la semana de la primera sesión.</p>
        ${closed.length?`<p class="hint" style="margin-top:6px">Horarios anteriores: ${closed.map(x=>`${DIAS_C[x.dia-1]} ${x.hora} ${(item('frecuencias',x.frecuencia)?.nombre||'').toLowerCase()}, hasta el ${fmtShort(x.hasta)}`).join('; ')}.</p>`:''}</div>
      ${e.isNew?'':compSection(e.id)}
      <div class="fieldset-title">Observaciones</div>
      <div class="field full"><textarea class="input" name="observaciones" aria-label="Observaciones">${esc(e.observaciones||'')}</textarea></div>
    </div></div>
  <div class="dlg-foot"><div>${e.isNew?'':'<button class="btn danger" data-a="pac-del">Eliminar paciente</button>'}</div>
    <div class="btn-group"><button class="btn" data-a="dlg-close">Cancelar</button><button class="btn primary" data-a="pac-save">${e.isNew?'Crear paciente':'Guardar cambios'}</button></div></div>`);
}
function readPacForm(){
  const f=document.getElementById('pac-form');if(!f) return;const e=S.edit;
  f.querySelectorAll('[name]').forEach(el=>{
    if(el.name.startsWith('h_')) return;
    e[el.name]=el.type==='checkbox'?el.checked:(el.type==='number'?(el.value===''?'':Number(el.value)):el.value.trim());
  });
  e.horarios=[...f.querySelectorAll('.hor-row')].map(r=>{
    const prev=(e.horarios||[]).find(h=>h.id===r.dataset.hid)||{};
    return {...prev,id:r.dataset.hid||'h_'+uid(),dia:Number(r.querySelector('[name=h_dia]').value),hora:r.querySelector('[name=h_hora]').value,
      duracion:Number(r.querySelector('[name=h_dur]').value||defDur()),frecuencia:r.querySelector('[name=h_frec]').value,desde:r.querySelector('[name=h_desde]').value};
  });
}
function mergeHorarios(origH,edited){
  const y=addDays(TODAY,-1);const out=[];let split=false;
  for(const o of origH){
    if(o.hasta&&o.hasta<TODAY){out.push(o);continue}
    const e=edited.find(x=>x.id===o.id);
    const started=(o.desde||'0000-00-00')<TODAY;
    if(!e){if(started){out.push({...o,hasta:y});split=true}continue}
    const changed=['dia','hora','frecuencia','duracion'].some(k=>String(e[k]??'')!==String(o[k]??''));
    if(changed&&started){
      out.push({...o,hasta:y});split=true;
      const n={...e,id:'h_'+uid(),desde:e.desde&&e.desde>TODAY?e.desde:TODAY};
      if(e.frecuencia===o.frecuencia) n.ancla=o.ancla||o.desde; else delete n.ancla;
      delete n.hasta;out.push(n);
    } else out.push({...o,...e});
  }
  for(const e of edited) if(!origH.find(o=>o.id===e.id)) out.push(e);
  return {horarios:out,split};
}

/* ============ Eventos ============ */
let toastT;
function toast(msg){const t=document.getElementById('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2600)}
const val=id=>document.getElementById(id)?.value;
let suppressClick=false;

document.addEventListener('click',async ev=>{
  if(suppressClick){suppressClick=false;ev.preventDefault();return}
  if(ev.target.closest('select,textarea,input')) return;
  const a=ev.target.closest('[data-a]');
  if(!pop().hidden&&!ev.target.closest('#pop,dialog,#offer')){closePop();if(!a||!['open-ses','set-pago','ses-done','goto-ses','ses-pay','comp-add','comp-view'].includes(a.dataset.a))return}
  if(!a) return;
  const act=a.dataset.a;
  switch(act){
    case 'nav': if(dlg.open)closeDlg();if(!pop().hidden)closePop();S.view=a.dataset.v;render();window.scrollTo(0,0);break;
    case 'ag-view': S.ag=a.dataset.v;render();break;
    case 'ag-nav':{const n=Number(a.dataset.n);
      if(!n) S.cursor=TODAY; else if(S.ag==='dia') S.cursor=addDays(S.cursor,n); else if(S.ag==='semana') S.cursor=addDays(S.cursor,7*n); else S.cursor=addMonths(monthKey(S.cursor),n)+'-01';
      render();break}
    case 'goto-day': S.ag='dia';S.cursor=a.dataset.d;render();break;
    case 'grid-add':{
      if(!S.patients.length){toast('Primero creá un paciente');S.view='pacientes';render();break}
      const r=a.getBoundingClientRect();const ini=Number(a.dataset.ini);const px=Number(a.dataset.px||PX);
      const mins=Math.max(0,Math.round(((ev.clientY-r.top)/px)/15)*15)+ini*60;
      newSesDialog(a.dataset.d,fromMin(Math.min(mins,23*60+45)));break}
    case 'wk-month':{const n=Number(a.dataset.n);S.wkMonth=n?addMonths(S.wkMonth||monthKey(TODAY),n):monthKey(TODAY);S.wkSel=null;render();break}
    case 'wk-sel':{S.wkSel=a.dataset.d;render();document.querySelector('.wk-detail-head')?.scrollIntoView({block:'start'});break}
    case 'wk-step':{const d=addDays(S.wkSel,7*Number(a.dataset.n));const m=monthKey(addDays(d,3));S.wkMonth=m;S.wkSel=d;render();break}
    case 'month':{const n=Number(a.dataset.n);S.month=n?addMonths(S.month,n):monthKey(TODAY);render();break}
    case 'open-ses':{const s=S.visible[a.dataset.id];if(s) openPop(s,a.closest('.blk,.mitem,.side-row')||a);break}
    case 'pop-close': closePop();break;
    case 'goto-ses':{
      const s=S.visible[a.dataset.id]||findSession(a.dataset.id);if(!s)break;
      if(!pop().hidden)closePop();
      S.cursor=s.fecha;render();focusSession(s.id);break}
    case 'pop-done':{const s=S.visible[S.popId]||findSession(S.popId);if(!s)break;S.visible[s.id]=markDone(s);render();renderPop();toast('Realizada y pagada');break}
    case 'pop-more':{const s=S.visible[S.popId]||findSession(S.popId);closePop();if(s){S.edit={...s};sesSheet()}break}
    case 'panel-toggle':{const cur=S.config.general.panel??(window.innerWidth>=760);S.config.general.panel=!cur;saveConfig();render();break}
    case 'ses-done':{const s=S.visible[a.dataset.id];if(!s)break;saveSession({...s,estado:realizadaId()});render();toast('Sesión marcada como realizada');break}
    case 'reg-estado':{const s=S.visible[a.dataset.id]||findSession(a.dataset.id);if(!s)break;regEstado(s,a.dataset.v);break}
    case 'reg-pago':{const s=S.visible[a.dataset.id]||findSession(a.dataset.id);if(!s)break;saveSession({...s,pago:a.dataset.v});S.awaitPay.delete(s.id);render();
      toast(item('estadosPago',a.dataset.v)?.tipo==='cobrado'?'Registrada: realizada y pagada':'Registrada. Quedó en "Pendientes de pago".');break}
    case 'reg-undo':{const s=S.visible[a.dataset.id]||findSession(a.dataset.id);if(!s)break;S.awaitPay.delete(s.id);saveSession({...s,estado:'programada'});render();break}
    case 'look':{S.config.general[a.dataset.k]=a.dataset.v;saveConfig();render();break}
    case 'set-cobrar':{const s=(S.edit&&S.edit.id===a.dataset.id&&dlg.open)?S.edit:(S.visible[a.dataset.id]||findSession(a.dataset.id));if(!s)break;
      const pendId=list('estadosPago').find(x=>x.tipo==='pendiente')?.id||'pendiente';const saved=saveSession({...s,cobrar:a.dataset.v==='1',...(a.dataset.v==='1'?{}:{pago:pendId})});
      if(dlg.open&&S.edit?.id===saved.id){S.edit=saved;sesSheet();break}
      render();S.visible[saved.id]=saved;if(S.popId===saved.id)renderPop();
      toast(a.dataset.v==='1'?'Esta sesión se cobra. Quedó en "Pendientes de pago".':'Esta sesión no se cobra');break}
    case 'set-pago':{const s=S.visible[a.dataset.id]||findSession(a.dataset.id);if(!s)break;const saved=saveSession({...s,pago:a.dataset.v});render();S.visible[saved.id]=saved;if(S.popId===saved.id)renderPop();if(item('estadosPago',a.dataset.v)?.tipo==='cobrado'){if(S.popId!==saved.id)offerAttach(saved)}else toast(`Pago: ${item('estadosPago',a.dataset.v)?.nombre||''}`);break}
    case 'ses-debe':{const s=S.visible[a.dataset.id];if(!s)break;saveSession({...s,estado:realizadaId(),pago:'pendiente'});render();toast('Realizada, queda pendiente el pago');break}
    case 'ses-pay':{const s=S.visible[a.dataset.id];if(!s)break;const saved=saveSession({...s,pago:firstCobrado()});render();offerAttach(saved);break}
    case 'pay-all':{const ss=debtList().filter(s=>s.pid===a.dataset.pid);ss.forEach(s=>saveSession({...s,pago:firstCobrado()}));render();toast(`${ss.length} sesiones marcadas como pagadas`);break}
    case 'all-done':{
      const um=unmarkedList();
      const ok=await confirmBox('Registrar todas como realizadas',`Las ${um.length} sesiones quedan como realizadas y pendientes de pago. Después marcás los pagos en "Pendientes de pago".`,'Registrar',false);
      if(!ok)break;um.forEach(s=>saveSession({...s,estado:realizadaId()}));render();toast('Sesiones marcadas como realizadas');break}
    case 'sheet-done':{markDone(S.edit);closeDlg();toast('Realizada y pagada');break}
    case 'sheet-set':{S.edit=saveSession({...S.edit,[a.dataset.f]:a.dataset.v});sesSheet();renderNav();break}
    case 'comp-add': pickFile(a.dataset.pid,a.dataset.sid);break;
    case 'comp-add-pac': pickFile(a.dataset.pid,document.getElementById('compSes')?.value||null);break;
    case 'comp-view': viewComp(a.dataset.id);break;
    case 'comp-del': deleteComp(a.dataset.id);break;
    case 'viewer-close': document.getElementById('viewer').close();break;
    case 'offer-close': closeOffer();break;
    case 'sheet-save':{
      const e=S.edit;const s={...e};
      if(e.extra){s.fecha=val('f_fecha')||e.fecha;s.hora=val('f_hora')||e.hora}
      s.medio=val('f_medio');s.nota=val('f_nota').trim();const mv=val('f_monto');s.monto=mv===''?null:Number(mv);
      if(e.extra&&monthKey(s.fecha)!==monthKey(e.fecha)) deleteSession(e);
      saveSession(s);closeDlg();toast('Cambios guardados');break}
    case 'new-save':{
      const hora=val('f_hora');if(!hora){toast('Elegí la hora de la sesión');document.getElementById('f_hora').focus();break}
      const mv=val('f_monto');
      saveSession({id:S.edit.id,pid:val('f_pid'),fecha:val('f_fecha'),hora,dur:Number(val('f_dur')||defDur()),estado:val('f_estado'),pago:val('f_pago'),
        monto:mv===''?null:Number(mv),nota:val('f_nota').trim(),extra:true});
      closeDlg();toast('Sesión agregada');break}
    case 'dlg-close': closeDlg();break;
    case 'ses-hide':{
      const e=S.edit;
      const ok=await confirmBox(e.extra?'Eliminar sesión':'Quitar de la agenda',e.extra?'La sesión se borra de la agenda y de la caja.':'Esta sesión deja de aparecer en la agenda y en la caja. El horario habitual del paciente no cambia.',e.extra?'Eliminar':'Quitar');
      if(!ok) break;
      if(e.extra) deleteSession(e); else saveSession({...e,oculta:true});
      closeDlg();toast(e.extra?'Sesión eliminada':'Sesión quitada de la agenda');break}
    case 'ses-reprog':{const r=document.getElementById('reprog');if(r){r.hidden=!r.hidden;if(!r.hidden)document.getElementById('r_fecha').focus()}break}
    case 'ses-reprog-save':{
      const nf=val('r_fecha'),nh=val('r_hora');if(!nf||!nh){toast('Elegí la nueva fecha y hora');break}
      moveSession(S.edit,nf,nh);closeDlg();toast('Sesión reprogramada');break}
    case 'pac-new': pacDialog(null);break;
    case 'pac-open': pacDialog(pat(a.dataset.id));break;
    case 'hor-add': readPacForm();S.edit.horarios.push({id:'h_'+uid(),dia:1,hora:'',duracion:defDur(),frecuencia:list('frecuencias')[0]?.id||'',desde:TODAY});renderPacDialog();break;
    case 'hor-del': readPacForm();S.edit.horarios.splice(Number(a.dataset.i),1);renderPacDialog();break;
    case 'pac-save':{
      readPacForm();const e=S.edit;if(!e.nombre){toast('Escribí el nombre del paciente');document.getElementById('pf_nombre')?.focus();break}
      const p={...e};delete p.isNew;
      const edited=(p.horarios||[]).filter(h=>h.hora);
      const orig=pat(p.id);const {horarios,split}=mergeHorarios(orig?.horarios||[],edited);p.horarios=horarios;
      const i=S.patients.findIndex(x=>x.id===p.id);if(i>=0)S.patients[i]=p;else S.patients.push(p);
      savePatients();closeDlg();toast(e.isNew?'Paciente creado':split?'Ficha actualizada. El nuevo horario rige desde hoy.':'Ficha actualizada');break}
    case 'pac-del':{
      const e=S.edit;
      const ok=await confirmBox('Eliminar paciente',`Se borran la ficha de ${fullName(e)} y todas sus sesiones registradas. Si terminó el tratamiento, conviene cambiar su estado a un alta para conservar el historial.`,'Eliminar');
      if(!ok) break;
      S.patients=S.patients.filter(x=>x.id!==e.id);savePatients();
      for(const [k,d] of Object.entries(S.ses)){let ch=false;for(const id in d.items){if(d.items[id].pid===e.id){delete d.items[id];ch=true}}if(ch)Store.save(k,d)}
      closeDlg();toast('Paciente eliminado');break}
    case 'gasto-add':{
      const monto=Number(val('g_monto'));const fecha=val('g_fecha');
      if(!fecha||!monto){toast('Completá la fecha y el monto');break}
      S.gastos.push({id:uid(),fecha,categoria:val('g_cat'),descripcion:val('g_desc').trim(),medio:val('g_medio'),monto});
      saveGastos();if(monthKey(fecha)!==S.month)S.month=monthKey(fecha);render();toast('Gasto agregado');break}
    case 'gasto-del':{S.gastos=S.gastos.filter(g=>g.id!==a.dataset.id);saveGastos();render();toast('Gasto eliminado');break}
    case 'gasto-copy':{
      const prev=gastosMes(addMonths(S.month,-1));
      for(const g of prev){const day=Math.min(Number(g.fecha.slice(8)),Number(lastOfMonth(S.month).slice(8)));S.gastos.push({...g,id:uid(),fecha:`${S.month}-${pad(day)}`})}
      saveGastos();render();toast(`Se copiaron ${prev.length} gastos. Revisá los montos.`);break}
    case 'cfg-add':{
      const k=a.dataset.list;const inp=document.getElementById('add_'+k);const nombre=inp.value.trim();if(!nombre){inp.focus();break}
      const L=LISTS.find(x=>x.key===k);const ni={id:'c_'+uid(),nombre};
      if(L.color) ni.color='#6D7F99';
      for(const x of (L.extra||[])) ni[x.k]=x.type==='bool'?false:x.type==='number'?(x.k==='semanas'?1:0):x.opts[0][0];
      S.config.lists[k].push(ni);saveConfig();render();document.getElementById('add_'+k)?.focus();toast(`"${nombre}" agregado`);break}
    case 'cfg-del':{
      const k=a.dataset.list,id=a.dataset.id;const i=item(k,id);
      const ok=await confirmBox('Eliminar opción',`¿Eliminar "${i?.nombre}"? Los registros que lo usan van a mostrar "(eliminado)" hasta que les elijas otra opción.`,'Eliminar');
      if(!ok) break;
      S.config.lists[k]=list(k).filter(x=>x.id!==id);saveConfig();render();break}
    case 'export':{
      const docs={config:S.config,patients:{items:S.patients},gastos:{items:S.gastos},comprobantes:{items:S.comps},...S.ses};
      const data=JSON.stringify({app:'consultorio',version:2,exportado:TODAY,docs},null,2);
      const filename=`consultorio-copia-${TODAY}.json`;
      if(S.downloads){try{await S.downloads.save({filename,data})}catch(e){if(e?.code!=='cancelled')toast('No se pudo descargar la copia.')}}
      else{const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));const l=document.createElement('a');l.href=url;l.download=filename;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
      break}
    case 'reset':{
      const ok=await confirmBox('Borrar todos los datos','Se eliminan pacientes, sesiones, gastos y configuración. Esta acción no se puede deshacer. Descargá una copia antes si la necesitás.','Borrar todo');
      if(!ok) break;
      const ids=['config','patients','gastos',...Object.keys(S.ses)];
      S.ses={};S.patients=[];S.gastos=[];S.config=defaultConfig();
      for(const id of ids) await Store.remove(id);
      saveConfig();render();toast('Datos borrados');break}
  }
});

document.addEventListener('change',async ev=>{
  const el=ev.target.closest('[data-c]');if(!el) return;
  const c=el.dataset.c;
  if(c==='reg-estado'){const s=S.visible[el.dataset.id]||findSession(el.dataset.id);if(s&&el.value)regEstado(s,el.value);return}
  if(c==='pop-field'){const s=S.visible[S.popId]||findSession(S.popId);if(!s)return;const saved=saveSession({...s,[el.dataset.f]:el.value});render();S.visible[saved.id]=saved;renderPop();renderNav();return}
  if(c==='ses-field'){const s=S.visible[el.dataset.id];if(!s||!el.value)return;saveSession({...s,[el.dataset.f]:el.value});render();toast('Sesión actualizada')}
  else if(c==='pac-f'){S.filtroEstado=el.value;render()}
  else if(c==='gen'){const k=el.dataset.k;S.config.general[k]=el.type==='checkbox'?el.checked:el.dataset.num?Number(el.value):el.value.trim();saveConfig();renderNav();applyLook()}
  else if(c==='cfg'){
    const i=item(el.dataset.list,el.dataset.id);if(!i)return;const k=el.dataset.k;
    if(k==='nombre'){const v=el.value.trim();if(!v){el.value=i.nombre;return}i.nombre=v}
    else i[k]=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value||0):el.value;
    saveConfig();renderNav();
  }
  else if(c==='import'){
    const file=el.files?.[0];if(!file)return;
    try{
      const j=JSON.parse(await file.text());if(!j?.docs?.config) throw new Error();
      const ok=await confirmBox('Restaurar copia',`Se reemplazan todos los datos actuales por los de la copia del ${j.exportado||'archivo elegido'}.`,'Restaurar');
      if(!ok){el.value='';return}
      for(const id of ['config','patients','gastos',...Object.keys(S.ses)]) if(!(id in j.docs)) await Store.remove(id);
      S.ses={};for(const [id,d] of Object.entries(j.docs)){applyDoc(id,d);Store.save(id,d)}
      render();toast('Copia restaurada');
    }catch(e){toast('El archivo no es una copia válida de esta aplicación.')}
    el.value='';
  }
});
document.getElementById('fileIn').addEventListener('change',ev=>{handleFile(ev.target.files?.[0])});
document.addEventListener('input',ev=>{
  const el=ev.target;
  if(el.dataset?.note){queueNote(el.dataset.note,el.value.trim());return}
  if(el.dataset?.c==='pac-q'){S.q=el.value;clearTimeout(S.qt);S.qt=setTimeout(()=>{const pos=el.selectionStart;render();const n=document.querySelector('[data-c="pac-q"]');if(n){n.focus();n.setSelectionRange(pos,pos)}},200)}
});
document.addEventListener('focusout',ev=>{const el=ev.target;if(el.dataset?.note&&noteTimers[el.dataset.note]){clearTimeout(noteTimers[el.dataset.note]);saveNote(el.dataset.note,el.value.trim())}});
window.addEventListener('resize',()=>{if(!pop().hidden)positionPop()});
document.addEventListener('keydown',ev=>{
  const el=ev.target;
  if(ev.key==='Escape'&&!pop().hidden&&!dlg.open){closePop();return}
  if(ev.key==='Enter'&&el.dataset?.enter==='cfg-add'){ev.preventDefault();document.querySelector(`[data-a="cfg-add"][data-list="${el.dataset.list}"]`)?.click()}
  if((ev.key==='Enter'||ev.key===' ')&&el.getAttribute?.('role')==='button'&&el.dataset.a){ev.preventDefault();el.click()}
});

/* ---- Arrastrar para reprogramar (mouse) ---- */
let drag=null;
document.addEventListener('pointerdown',ev=>{
  const b=ev.target.closest('.blk');
  if(!b||ev.pointerType!=='mouse'||ev.button!==0||ev.target.closest('button,select,textarea,input'))return;
  const r=b.getBoundingClientRect();
  drag={b,id:b.dataset.id,x:ev.clientX,y:ev.clientY,offY:ev.clientY-r.top,moved:false,target:null};
});
document.addEventListener('pointermove',ev=>{
  if(!drag)return;
  if(!drag.moved){if(Math.hypot(ev.clientX-drag.x,ev.clientY-drag.y)<6)return;drag.moved=true;if(!pop().hidden)closePop();drag.b.classList.add('dragging');document.body.classList.add('is-dragging')}
  const col=document.elementsFromPoint(ev.clientX,ev.clientY).find(el=>el.classList?.contains('tcol'));
  if(!col)return;
  const r=col.getBoundingClientRect();const ini=Number(col.dataset.ini);const px=Number(col.dataset.px||PX);
  let mins=Math.round(((ev.clientY-drag.offY-r.top)/px)/15)*15+ini*60;
  mins=Math.max(ini*60,Math.min(mins,23*60+45));
  if(drag.b.parentElement!==col) col.appendChild(drag.b);
  drag.b.style.top=((mins-ini*60)*px)+'px';drag.b.style.left='2px';drag.b.style.width='calc(100% - 4px)';
  drag.target={fecha:col.dataset.d,hora:fromMin(mins)};
  const t=drag.b.querySelector('.bt');if(t)t.textContent=drag.target.hora;
});
document.addEventListener('pointerup',async ()=>{
  if(!drag)return;const d=drag;drag=null;
  if(!d.moved)return;
  suppressClick=true;setTimeout(()=>{suppressClick=false},0);
  document.body.classList.remove('is-dragging');
  const s=S.visible[d.id];
  if(!s||!d.target||(d.target.fecha===s.fecha&&d.target.hora===s.hora)){render();return}
  const p=pat(s.pid);
  const ok=await confirmBox('Reprogramar sesión',`¿Mover la sesión de ${fullName(p)||'este paciente'} al ${fmtLong(d.target.fecha)} a las ${d.target.hora}?`,'Reprogramar',false);
  if(ok){moveSession(s,d.target.fecha,d.target.hora);toast('Sesión reprogramada')}
  render();
});

/* ============ Inicio ============ */
(async function start(){
  const docs=await Store.init();
  if(!docs.config){ seedExample(); }
  else { for(const [id,d] of Object.entries(docs)) applyDoc(id,d); }
  S.ag=S.config.general.vistaInicial||(window.innerWidth<760?'dia':'semana');
  if(window.innerWidth<760&&S.ag==='semana') S.ag='dia';
  S.ready=true;render();
  setInterval(()=>{const f=document.activeElement;if(!S.dlgOpen&&!drag&&pop().hidden&&!(f&&f.dataset?.note)&&S.view==='agenda'&&document.visibilityState==='visible')render()},5*60*1000);
})();


/* ============ App instalable (PWA) ============ */
if('serviceWorker' in navigator && location.protocol.startsWith('http')){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})});
}
