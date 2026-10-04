/* ===== الإعدادات: عدّلها لكل عميل ===== */
const CONFIG = {
  name: "مطعم الذواقة",
  tagline: "مكوّنات طازجة، وصفات أصيلة، ولمسة إبداع في كل طبق.",
  about: "نؤمن أن الطعام الجيد يصنع الذكريات. نختار مكوّناتنا يومياً ونطهوها بشغف لنقدّم لك طعماً أصيلاً في أجواء دافئة.",
  phone: "201000000000",   // واتساب بالصيغة الدولية بدون +
  pin: "123454321",        // كلمة سر لوحة التحكم
  currency: "ج.م",
  countryCode: "20",       // لتحويل 010... إلى +2010...
  address: "", maps: "", instagram: "", facebook: "",
  color: "#d4a24c",        // اللون الرئيسي للموقع
  font: "Cairo",           // Cairo / Tajawal / Almarai / Amiri / Changa
  tables: 10,              // عدد الطاولات (لرموز QR)
  open: 12, close: 25,     // 25 = 1 صباحاً
  lucky: true,             // ماكينة اختيار الوجبة
  lowCal: 400              // الحد الأعلى لـ "قليل السعرات"
};

const DEFAULT_MENU = [
  {id:1,name:"برجر لحم أنجوس",desc:"قطعة لحم 200 جم مع جبنة شيدر وصوص خاص",price:140,cat:"الأطباق الرئيسية",emoji:"🍔",cal:780,tags:[]},
  {id:2,name:"بيتزا مارغريتا",desc:"عجينة طازجة، موتزاريلا وريحان",price:120,cat:"الأطباق الرئيسية",emoji:"🍕",cal:650,tags:[]},
  {id:3,name:"ستيك مشوي",desc:"شريحة ستيك مع خضار مشوية",price:260,cat:"الأطباق الرئيسية",emoji:"🥩",cal:520,tags:["keto","gf","df"]},
  {id:10,name:"دجاج مشوي بالأعشاب",desc:"صدر دجاج متبّل مع خضار سوتيه",price:150,cat:"الأطباق الرئيسية",emoji:"🍗",cal:420,tags:["keto","gf","df"]},
  {id:4,name:"سلطة سيزر",desc:"خس، دجاج مشوي، بارميزان وصوص سيزر",price:75,cat:"المقبلات",emoji:"🥗",cal:310,tags:["keto"]},
  {id:5,name:"أصابع الموتزاريلا",desc:"مقرمشة مع صوص طماطم",price:65,cat:"المقبلات",emoji:"🧀",cal:420,tags:[]},
  {id:9,name:"سلطة خضار مشوية",desc:"كوسا، فلفل وباذنجان بزيت الزيتون",price:70,cat:"المقبلات",emoji:"🥬",cal:180,tags:["vegan","keto","gf","df"]},
  {id:6,name:"عصير مانجو طازج",desc:"مانجو طبيعي 100%",price:45,cat:"المشروبات",emoji:"🥭",cal:140,tags:["vegan","gf","df"]},
  {id:11,name:"ليمون بالنعناع",desc:"منعش وبدون سكر مضاف",price:40,cat:"المشروبات",emoji:"🍋",cal:90,tags:["vegan","gf","df"]},
  {id:7,name:"قهوة اسبريسو",desc:"بن مختص محمص يومياً",price:35,cat:"المشروبات",emoji:"☕",cal:5,tags:["vegan","keto","gf","df"]},
  {id:8,name:"تشيز كيك",desc:"بصوص التوت البري",price:80,cat:"الحلويات",emoji:"🍰",cal:450,tags:[]},
  {id:12,name:"سلطة فواكه",desc:"فواكه الموسم الطازجة",price:50,cat:"الحلويات",emoji:"🍓",cal:160,tags:["vegan","gf","df"]}
];

const $ = s => document.querySelector(s);
const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch{ toast("المساحة ممتلئة، استخدم صوراً أصغر") } }
};
Object.assign(CONFIG, store.get("settings", {}));
let menu = store.get("menu", DEFAULT_MENU);
let cart = store.get("cart", {});
let cat = "الكل", q = "", editId = null, imgData = "";
const DIETS=[["keto","🥑 كيتو"],["vegan","🌱 نباتي"],["gf","🌾 بدون جلوتين"],["df","🥛 بدون ألبان"],["low","🔥 قليل السعرات"]];
const TAGN={keto:"🥑 كيتو",vegan:"🌱 نباتي",gf:"🌾 بدون جلوتين",df:"🥛 بدون ألبان"};
const diets=new Set();
const okDiet=i=>[...diets].every(d=>d==="low"?(i.cal&&i.cal<=CONFIG.lowCal):(i.tags||[]).includes(d));

const save = () => store.set("menu", menu);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){ const e=$("#toast"); e.textContent=t; e.classList.add("show"); setTimeout(()=>e.classList.remove("show"),2200) }

/* ===== العرض ===== */
function render(){
  const cats = ["الكل", ...new Set(menu.map(i=>i.cat))];
  $("#diet").innerHTML=DIETS.map(([k,l])=>`<button class="chip ${diets.has(k)?"on":""}" data-d="${k}">${l}</button>`).join("");
  $("#chips").innerHTML = cats.map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $("#cats").innerHTML = cats.slice(1).map(c=>`<option value="${esc(c)}">`).join("");
  const items = menu.filter(i => (cat==="الكل"||i.cat===cat) && (i.name+i.desc).includes(q) && okDiet(i));
  $("#grid").innerHTML = items.length ? items.map(i=>`
    <article class="card reveal in">
      <div class="pic">${i.img?`<img src="${i.img}" alt="${esc(i.name)}" loading="lazy">`:(i.emoji||"🍽️")}</div>
      <div class="cb"><h3>${esc(i.name)}</h3><p>${esc(i.desc||"")}</p><div class="bd">${i.cal?`<span>🔥 ${i.cal} سعرة</span>`:""}${(i.tags||[]).map(t=>`<span>${TAGN[t]||""}</span>`).join("")}</div>
        <div class="pr"><b>${i.price} ${CONFIG.currency}</b><button class="add" data-add="${i.id}" aria-label="أضف">+</button></div>
      </div></article>`).join("") : `<p class="empty">لا توجد أصناف مطابقة 🍃</p>`;
  renderCart(); renderList();
}

/* ===== السلة ===== */
function renderCart(){
  const rows = Object.entries(cart).map(([id,n])=>[menu.find(i=>i.id==id),n]).filter(([i])=>i);
  $("#cartItems").innerHTML = rows.length ? rows.map(([i,n])=>`
    <div class="ci"><span>${esc(i.name)}<br><small>${i.price*n} ${CONFIG.currency}</small></span>
    <span class="q"><button data-m="${i.id}">−</button> ${n} <button data-p="${i.id}">+</button></span></div>`).join("") : "<p class='empty'>السلة فارغة</p>";
  const total = rows.reduce((s,[i,n])=>s+i.price*n,0);
  $("#total").textContent = total + " " + CONFIG.currency;
  $("#cartCount").textContent = rows.reduce((s,[,n])=>s+n,0);
  store.set("cart", cart); if(typeof renderPair==="function") renderPair();
}
const normPhone = p => { p=p.replace(/[\s\-()]/g,""); if(p.startsWith("+")) return p; if(p.startsWith("00")) return "+"+p.slice(2); return p.startsWith("0") ? "+"+CONFIG.countryCode+p.slice(1) : "+"+p };
const TABLE = new URLSearchParams(location.search).get("table");
async function post(d){ try{ const r=await fetch("/api/order",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)}); return (await r.json()).ok }catch{ return false } }
async function ping(text){ const ok=await post({kind:"note",text}); if(!ok) window.open(`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(text)}`,"_blank"); return ok }
async function sendOrder(){
  const rows = Object.entries(cart).map(([id,n])=>[menu.find(i=>i.id==id),n]).filter(([i])=>i);
  if(!rows.length) return toast("السلة فارغة");
  const raw=$("#custPhone").value.trim(), phone=raw?normPhone(raw):"";
  if((!TABLE||raw) && !/^\+\d{10,15}$/.test(phone)) return toast("أدخل رقم هاتف صحيح 📱");
  const total=rows.reduce((s,[i,n])=>s+i.price*n,0);
  const payload={kind:"order",name:$("#custName").value,phone,addr:$("#custAddr").value,table:TABLE,total:total+" "+CONFIG.currency,items:rows.map(([i,n])=>({name:i.name,n}))};
  const btn=$("#sendOrder"); btn.disabled=true; btn.textContent="جارٍ الإرسال...";
  const ok=await post(payload);
  if(!ok){
    const msg=`🍽️ *طلب جديد - ${CONFIG.name}*${TABLE?` (طاولة ${TABLE})`:""}\n\n`+rows.map(([i,n])=>`• ${i.name} × ${n} = ${i.price*n}`).join("\n")+
      `\n\n💰 *الإجمالي:* ${total} ${CONFIG.currency}\n👤 ${payload.name||"-"}\n📞 ${phone||"-"}\n📍 ${payload.addr||"-"}`;
    window.open(`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(msg)}`,"_blank");
  }
  toast(ok?"✅ تم إرسال طلبك":"تم فتح واتساب لإتمام الطلب");
  learn(Object.keys(cart)); trackOrder(payload); confetti(); cart={}; renderCart(); $("#cart").classList.remove("open");
  btn.disabled=false; btn.textContent="إرسال الطلب 📲";
}

/* ===== ماكينة اختيار الوجبة ===== */
let combo=[];
const pick = a => a[Math.floor(Math.random()*a.length)];
function spin(){
  if(menu.length<3) return toast("أضف 3 أصناف على الأقل");
  const cats=[...new Set(menu.map(i=>i.cat))].sort(()=>Math.random()-.5);
  combo=cats.slice(0,3).map(c=>pick(menu.filter(i=>i.cat===c)));
  while(combo.length<3) combo.push(pick(menu));
  $("#spinBtn").disabled=true; $("#luckyAdd").hidden=true; $("#luckyRes").textContent="";
  [0,1,2].forEach(k=>{ const r=$("#r"+k); r.classList.add("spin");
    const t=setInterval(()=>r.textContent=pick(menu).emoji||"🍽️",90);
    setTimeout(()=>{ clearInterval(t); r.classList.remove("spin"); r.textContent=combo[k].emoji||"🍽️";
      if(k===2){ const sum=combo.reduce((s,i)=>s+i.price,0);
        $("#luckyRes").innerHTML=combo.map(i=>`<div>${esc(i.name)} — ${i.price}</div>`).join("")+`<div class="win">${sum} ${CONFIG.currency}</div>`;
        $("#spinBtn").disabled=false; $("#spinBtn").textContent="🔁 لفّة أخرى"; $("#luckyAdd").hidden=false; confetti(60) } },1000+k*600) });
}
$("#luckBtn").onclick=()=>$("#lucky").classList.add("open");
$("#spinBtn").onclick=spin;
$("#luckyAdd").onclick=()=>{ combo.forEach(i=>cart[i.id]=(cart[i.id]||0)+1); renderCart(); $("#lucky").classList.remove("open"); $("#cart").classList.add("open"); toast("أُضيفت الوجبة 🎉") };

/* ===== قصاصات احتفال ===== */
function confetti(n=140){
  const c=$("#fx"), x=c.getContext("2d"); c.width=innerWidth; c.height=innerHeight;
  const P=Array.from({length:n},()=>({x:innerWidth/2,y:innerHeight*.6,vx:(Math.random()-.5)*16,vy:-Math.random()*16-4,s:Math.random()*8+4,c:pick(["#d4a24c","#f2cf8a","#b5442f","#fff","#6bc48a"]),r:Math.random()*6}));
  (function f(){ x.clearRect(0,0,c.width,c.height); let live=0;
    P.forEach(p=>{ p.vy+=.45; p.x+=p.vx; p.y+=p.vy; p.r+=.2; if(p.y<c.height){live++; x.save(); x.translate(p.x,p.y); x.rotate(p.r); x.fillStyle=p.c; x.fillRect(-p.s/2,-p.s/2,p.s,p.s*.6); x.restore()} });
    if(live) requestAnimationFrame(f); else x.clearRect(0,0,c.width,c.height) })();
}
if(!CONFIG.lucky) $("#luckBtn").hidden=true;

/* ===== لوحة التحكم ===== */
function renderList(){
  $("#list").innerHTML = menu.map(i=>`<div class="li"><span>${i.emoji||"🍽️"} ${esc(i.name)} — ${i.price}</span>
    <button data-edit="${i.id}">✏️</button><button data-del="${i.id}">🗑️</button></div>`).join("");
}
function resetForm(){ editId=null; imgData=""; $("#form").reset(); $("#saveBtn").textContent="➕ إضافة الصنف" }
$("#form").onsubmit = e => {
  e.preventDefault();
  const item = {name:$("#fName").value.trim(), desc:$("#fDesc").value.trim(), price:+$("#fPrice").value,
    cat:$("#fCat").value.trim(), emoji:$("#fEmoji").value.trim(), cal:+$("#fCal").value||0, tags:[...document.querySelectorAll("#fTags input:checked")].map(x=>x.value)};
  if(editId){ const o=menu.find(i=>i.id===editId); Object.assign(o,item); if(imgData)o.img=imgData }
  else menu.push({id:Date.now(), ...item, img:imgData});
  save(); toast(editId?"تم التعديل ✓":"تمت الإضافة ✓"); resetForm(); render();
};
$("#fImg").onchange = e => { // ضغط الصورة لتوفير المساحة
  const f=e.target.files[0]; if(!f) return;
  const r=new FileReader();
  r.onload=()=>{ const im=new Image(); im.onload=()=>{
    const c=document.createElement("canvas"), k=Math.min(1,600/im.width);
    c.width=im.width*k; c.height=im.height*k; c.getContext("2d").drawImage(im,0,0,c.width,c.height);
    imgData=c.toDataURL("image/jpeg",.75); toast("تم تحميل الصورة 📷") }; im.src=r.result };
  r.readAsDataURL(f);
};
$("#exportBtn").onclick = () => {
  const a=document.createElement("a");
  a.href=URL.createObjectURL(new Blob([JSON.stringify(menu)],{type:"application/json"}));
  a.download="menu-backup.json"; a.click();
};
$("#importFile").onchange = e => {
  const r=new FileReader();
  r.onload=()=>{ try{ menu=JSON.parse(r.result); save(); render(); toast("تم الاستيراد ✓") }catch{ toast("ملف غير صالح") } };
  r.readAsText(e.target.files[0]);
};
$("#resetBtn").onclick = () => { if(confirm("استرجاع القائمة الافتراضية؟")){ menu=DEFAULT_MENU; save(); render() } };
$("#loginBtn").onclick = () => {
  if($("#pin").value===CONFIG.pin){ $("#login").hidden=true; $("#panel").hidden=false }
  else toast("رمز خاطئ ❌");
};

/* ===== الأحداث العامة ===== */
document.addEventListener("click", e => {
  const t=e.target, d=k=>t.dataset[k];
  if(d("c")){ cat=d("c"); render() }
  if(d("add")){ cart[d("add")]=(cart[d("add")]||0)+1; renderCart(); toast("أُضيف للسلة 🛒") }
  if(d("p")) { cart[d("p")]++; renderCart() }
  if(d("m")) { if(--cart[d("m")]<=0) delete cart[d("m")]; renderCart() }
  if(d("del") && confirm("حذف هذا الصنف؟")){ menu=menu.filter(i=>i.id!=d("del")); save(); render(); toast("تم الحذف") }
  if(d("edit")){ const i=menu.find(x=>x.id==d("edit")); editId=i.id;
    $("#fName").value=i.name; $("#fDesc").value=i.desc||""; $("#fPrice").value=i.price; $("#fCat").value=i.cat; $("#fEmoji").value=i.emoji||""; $("#fCal").value=i.cal||""; document.querySelectorAll("#fTags input").forEach(x=>x.checked=(i.tags||[]).includes(x.value));
    $("#saveBtn").textContent="💾 حفظ التعديل"; $("#panel").scrollTo?.(0,0) }
  if(t.hasAttribute("data-close")) document.querySelectorAll(".modal.open,.drawer.open").forEach(x=>x.classList.remove("open"));
  if(t.classList.contains("modal")) t.classList.remove("open");
});
$("#search").oninput = e => { q=e.target.value; render() };
$("#cartBtn").onclick = () => $("#cart").classList.add("open");
$("#sendOrder").onclick = sendOrder;
$("#adminBtn").onclick = () => $("#admin").classList.add("open");
$("#themeBtn").onclick = () => {
  const r=document.documentElement, n=r.dataset.theme==="light"?"dark":"light"; r.dataset.theme=n; store.set("theme",n);
};
document.documentElement.dataset.theme = store.get("theme","dark");

/* ===== لمسات إضافية ===== */
$("#rName").textContent = CONFIG.name;
$("#heroTitle").textContent = CONFIG.name;
document.title = CONFIG.name + " | قائمة الطعام";
$("#phoneLine").innerHTML = `📞 <a href="tel:+${CONFIG.phone}" style="color:var(--gold)">+${CONFIG.phone}</a>`;
$("#yr").textContent = new Date().getFullYear();
const h=new Date().getHours(), isOpen = h>=CONFIG.open || h<CONFIG.close-24;
$("#openState").innerHTML = isOpen ? "🟢 مفتوح الآن" : "🔴 مغلق حالياً";

const io = new IntersectionObserver(es=>es.forEach(x=>{ if(x.isIntersecting){ x.target.classList.add("in");
  x.target.querySelectorAll("[data-n]").forEach(c=>{ const n=+c.dataset.n; let v=0, s=Math.ceil(n/60);
    const t=setInterval(()=>{ v=Math.min(n,v+s); c.textContent=v.toLocaleString("ar-EG")+"+"; if(v>=n)clearInterval(t) },20) });
  io.unobserve(x.target) }}),{threshold:.2});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));

/* ===== تخصيص الموقع من لوحة التحكم ===== */
const FIELDS=[["name","اسم المطعم"],["tagline","الوصف تحت العنوان"],["about","نبذة عنّا","textarea"],["phone","واتساب (دولي بدون +)"],["address","العنوان"],["maps","رابط خرائط جوجل"],["instagram","رابط انستجرام"],["facebook","رابط فيسبوك"],["color","اللون الرئيسي","color"],["font","الخط","font"],["currency","العملة"],["tables","عدد الطاولات","number"],["lowCal","حد السعرات المنخفضة","number"],["open","ساعة الفتح (0-24)","number"],["close","ساعة الإغلاق (25 = 1 ص)","number"],["pin","كلمة سر اللوحة"]];
const FONTS=["Cairo","Tajawal","Almarai","Amiri","Changa"];
const fmtH=h=>{h%=24; return (h%12||12)+(h<12?" ص":" م")};
function applySettings(){
  const r=document.documentElement.style;
  r.setProperty("--gold",CONFIG.color); r.setProperty("--gold2",`color-mix(in srgb, ${CONFIG.color} 55%, #fff)`);
  let l=$("#fl"); if(!l){ l=document.createElement("link"); l.id="fl"; l.rel="stylesheet"; document.head.appendChild(l) }
  l.href=`https://fonts.googleapis.com/css2?family=${CONFIG.font}:wght@400;600;800&display=swap`;
  document.body.style.fontFamily=`${CONFIG.font},Cairo,Tahoma,sans-serif`;
  $("#rName").textContent=$("#heroTitle").textContent=CONFIG.name; document.title=CONFIG.name+" | قائمة الطعام";
  $("#subTxt").textContent=CONFIG.tagline; $("#aboutTxt").textContent=CONFIG.about;
  $("#phoneLine").innerHTML=`📞 <a href="tel:+${CONFIG.phone}" style="color:var(--gold)">+${CONFIG.phone}</a>`;
  $("#addrLine").textContent=CONFIG.address?"📍 "+CONFIG.address:"";
  $("#hoursLine").textContent=`🕑 يومياً من ${fmtH(CONFIG.open)} حتى ${fmtH(CONFIG.close)}`;
  const h=new Date().getHours(), o=CONFIG.open, c=CONFIG.close, on=c>24?(h>=o||h<c-24):(h>=o&&h<c);
  $("#openState").innerHTML=on?"🟢 مفتوح الآن":"🔴 مغلق حالياً";
  buildHub();
}
$("#setForm").innerHTML=FIELDS.map(([k,l,t])=>t==="textarea"?`<label>${l}<textarea id="s_${k}" rows="3"></textarea></label>`:t==="font"?`<label>${l}<select id="s_${k}">${FONTS.map(f=>`<option>${f}</option>`).join("")}</select></label>`:`<label>${l}<input id="s_${k}" type="${t||"text"}"></label>`).join("")+`<button class="btn full">💾 حفظ التخصيص</button>`;
FIELDS.forEach(([k])=>$("#s_"+k).value=CONFIG[k]);
$("#setForm").onsubmit=e=>{ e.preventDefault(); const s={}; FIELDS.forEach(([k,,t])=>{ const v=$("#s_"+k).value; s[k]=t==="number"?+v:v }); store.set("settings",s); Object.assign(CONFIG,s); applySettings(); renderQR(); toast("تم الحفظ ✓") };

/* ===== طاولات QR ===== */
const qrUrl=(n,s=300)=>`https://api.qrserver.com/v1/create-qr-code/?size=${s}x${s}&data=${encodeURIComponent(location.origin+"/?table="+n)}`;
function renderQR(){
  const n=CONFIG.tables||0;
  $("#qrBox").innerHTML=n?`<p class="small" style="color:var(--mut)">اطبع الرمز وضعه على الطاولة: الزبون يمسحه فيطلب مباشرة ويصلك الطلب برقم طاولته.</p><div class="qrs">`+Array.from({length:n},(_,i)=>`<div><img loading="lazy" width="110" height="110" alt="" src="${qrUrl(i+1,160)}"><br>طاولة ${i+1}</div>`).join("")+`</div><button class="btn full" id="qrPrint">🖨️ طباعة الكل</button>`:"حدد عدد الطاولات أولاً";
}

/* ===== مركز التواصل الذكي ===== */
function buildHub(){
  const L=[["🟢","واتساب",`https://wa.me/${CONFIG.phone}`],["📞","اتصل بنا",`tel:+${CONFIG.phone}`]];
  if(CONFIG.maps) L.push(["📍","الاتجاهات",CONFIG.maps]);
  if(CONFIG.instagram) L.push(["📸","انستجرام",CONFIG.instagram]);
  if(CONFIG.facebook) L.push(["👍","فيسبوك",CONFIG.facebook]);
  L.push(["📅","احجز طاولة","#reserve"]); L.push(["🧮","قسّم الفاتورة","#split"]); if(store.get("myOrder")) L.push(["📦","تتبع طلبي","#track"]);
  if(TABLE){ L.push(["🛎️","نداء النادل","#waiter"]); L.push(["🧾","اطلب الحساب","#bill"]) }
  $("#hubList").innerHTML=L.map(([i,t,u])=>`<a class="hub-i" href="${esc(u)}" ${u[0]==="#"?`data-act="${u.slice(1)}"`:'target="_blank" rel="noopener"'}>${t} ${i}</a>`).join("");
}
let cool=0;
document.addEventListener("click",e=>{
  if(e.target.closest("#hubBtn")) return $("#hub").classList.toggle("open");
  const a=e.target.closest("[data-act]");
  if(a){ e.preventDefault(); $("#hub").classList.remove("open"); const k=a.dataset.act;
    if(k==="reserve") return $("#reserve").classList.add("open");
    if(k==="split") return openSplit();
    if(k==="track") return openTrack();
    if(Date.now()<cool) return toast("تم إبلاغ النادل، لحظات من فضلك ⏳");
    cool=Date.now()+30000;
    ping(k==="waiter"?`🛎️ طاولة ${TABLE} تطلب النادل`:`🧾 طاولة ${TABLE} تطلب الحساب`); toast("تم إبلاغ النادل ✓") }
  else if(!e.target.closest("#hub")) $("#hub").classList.remove("open");
  if(e.target.id==="qrPrint"){ const w=window.open("","_blank");
    w.document.write(`<html dir="rtl"><body style="font-family:sans-serif;text-align:center">`+Array.from({length:CONFIG.tables},(_,i)=>`<div style="display:inline-block;width:300px;margin:20px;page-break-inside:avoid"><h2>${esc(CONFIG.name)}</h2><img src="${qrUrl(i+1)}" width="260"><h3>طاولة ${i+1}</h3><p>امسح الرمز واطلب من طاولتك 📱</p></div>`).join("")+`<script>onload=()=>setTimeout(print,800)<\/script></body></html>`); w.document.close() }
});
$("#rSend").onclick=()=>{
  const n=$("#rN").value.trim(), p=$("#rPhone").value.trim(), g=$("#rGuests").value, w=$("#rWhen").value;
  if(!n||!p||!g||!w) return toast("أكمل بيانات الحجز");
  ping(`📅 حجز طاولة جديد\n👤 ${n}\n📞 ${p}\n👥 ${g} أشخاص\n🕒 ${w.replace("T"," ")}`); toast("تم إرسال طلب الحجز ✓"); $("#reserve").classList.remove("open");
};
if(TABLE){ $("#tableBanner").hidden=false; $("#tableBanner").textContent=`🪑 أنت تطلب من طاولة رقم ${TABLE} — اطلب وسيصلك الطعام إلى طاولتك`; $("#custAddr").value="طاولة "+TABLE; $("#custPhone").placeholder="رقم هاتفك (اختياري)" }
applySettings(); renderQR();

/* ===== ميزانيتي ===== */
const cartTotal=()=>Object.entries(cart).reduce((s,[id,n])=>s+(menu.find(i=>i.id==id)?.price||0)*n,0);
const S=a=>a.reduce((s,i)=>s+i.price,0);
let bc=[];
function planBudget(){
  const amt=+$("#bAmt").value, ppl=Math.max(1,+$("#bPpl").value||1), per=amt/ppl;
  if(!amt) return toast("أدخل ميزانيتك 💰");
  const pool=menu.filter(okDiet), cats=[...new Set(pool.map(i=>i.cat))], seen=new Map(), main=cats.find(c=>/رئيسية/.test(c));
  for(let t=0;t<400&&cats.length;t++){
    const cs=cats.slice().sort(()=>Math.random()-.5).slice(0,2+Math.floor(Math.random()*3));
    if(main&&!cs.includes(main)) cs[0]=main;
    const set=[...new Set(cs)].map(c=>pick(pool.filter(i=>i.cat===c)));
    if(S(set)<=per) seen.set(set.map(i=>i.id).sort().join(),set);
  }
  bc=[...seen.values()].sort((a,b)=>S(b)-S(a)).slice(0,3);
  $("#bRes").innerHTML=bc.length?bc.map((c,i)=>`<div class="combo"><div>${c.map(x=>(x.emoji||"🍽️")+" "+esc(x.name)).join(" + ")}</div><small>${S(c)*ppl} ${CONFIG.currency}${ppl>1?` (${ppl} أشخاص)`:""}${c.every(x=>x.cal)?` · 🔥 ${c.reduce((s,x)=>s+x.cal,0)} سعرة للفرد`:""} · يتبقى ${amt-S(c)*ppl}</small><button class="btn full" data-combo="${i}">🛒 أضف للسلة</button></div>`).join(""):`<p class="empty">الميزانية لا تكفي${pool.length?` — أرخص صنف ${Math.min(...pool.map(i=>i.price))} ${CONFIG.currency}`:" أو لا توجد أصناف تناسب الفلتر"}</p>`;
}
$("#budgetBtn").onclick=()=>{ $("#bNote").textContent=diets.size?"✓ سيتم تطبيق فلتر الغذاء المختار":""; $("#budget").classList.add("open") };
$("#bGo").onclick=planBudget;

/* ===== قسمة الفاتورة ===== */
function calcSplit(){ const a=+$("#sAmt").value||0, p=Math.max(1,+$("#sPpl").value||1), tot=a*(1+(+$("#sTip").value)/100);
  $("#sRes").innerHTML=`الإجمالي مع الإكرامية: <b>${tot.toFixed(2)}</b><br>على كل فرد: <b class="big">${(tot/p).toFixed(2)} ${CONFIG.currency}</b>` }
function openSplit(){ $("#sAmt").value=cartTotal()||""; $("#split").classList.add("open"); calcSplit() }
["sAmt","sPpl","sTip"].forEach(id=>$("#"+id).oninput=calcSplit);
$("#splitBtn").onclick=openSplit;

/* ===== اقتراح التزاوج (يتعلم من الطلبات) ===== */
const pairs=store.get("pairs",{});
function learn(ids){ ids.forEach(a=>ids.forEach(b=>{ if(a!=b){ const k=a+"|"+b; pairs[k]=(pairs[k]||0)+1 } })); store.set("pairs",pairs) }
function suggest(){
  const ids=Object.keys(cart), rest=menu.filter(m=>!cart[m.id]); if(!ids.length||!rest.length) return null;
  const sc=m=>ids.reduce((s,a)=>s+(pairs[a+"|"+m.id]||0),0), top=rest.slice().sort((a,b)=>sc(b)-sc(a))[0];
  if(sc(top)>0) return {m:top,why:"الأكثر طلباً مع اختيارك"};
  const has=r=>ids.some(id=>r.test(menu.find(i=>i.id==id)?.cat||""));
  const need=!has(/مشروب/)?/مشروب/:!has(/حلو/)?/حلو/:null, c=need&&rest.filter(m=>need.test(m.cat));
  return c&&c.length?{m:pick(c),why:need.test("مشروب")?"مشروب ينسجم مع طبقك":"ختامها حلو 🍰"}:null;
}
function renderPair(){ const s=suggest(); $("#pairBox").innerHTML=s?`<div class="pair">💡 <span><b>${esc(s.m.name)}</b> — ${s.why}</span><button class="add" data-add="${s.m.id}">+</button></div>`:"" }

/* ===== تتبع الطلب مباشرة ===== */
const STEPS=["📥 تم الاستلام","👨‍🍳 جاري التحضير","🔥 في الفرن","🛵 مع الدليفري","✅ تم التسليم"];
const STEPS_T=["📥 تم الاستلام","👨‍🍳 جاري التحضير","🔥 في الفرن","🍽️ في الطريق لطاولتك","✅ تم التقديم"];
const lo={g:()=>store.get("orders",{}),s:o=>store.set("orders",o)};
async function api(path,body){ try{ const r=await fetch("/api/status"+(body?"":path),body?{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)}:undefined); if(!r.ok) throw 0; return await r.json() }catch{ return null } }
const ST={
  async create(o){ if(!await api("",{action:"create",...o})){ const a=lo.g(); a[o.id]={...o,status:0,t:Date.now()}; lo.s(a) } },
  async get(id){ const r=await api("?id="+id); if(r) return r; const o=lo.g()[id]; return o?{...o,_local:1}:null },
  async list(){ const r=await api("?list=1&pin="+encodeURIComponent(CONFIG.pin)); return r?r.orders:Object.values(lo.g()).sort((a,b)=>b.t-a.t) },
  async set(id,status){ if(!await api("",{action:"set",id,status,pin:CONFIG.pin})){ const a=lo.g(); if(a[id]){ a[id].status=status; lo.s(a) } } }
};
async function trackOrder(p){
  const id=Date.now().toString(36)+Math.random().toString(36).slice(2,5);
  await ST.create({id,table:!!p.table,name:p.name,addr:p.addr,total:p.total,items:p.items});
  store.set("myOrder",id); buildHub(); openTrack();
}
async function drawTrack(){
  const id=store.get("myOrder"), o=id&&await ST.get(id), el=$("#trackBody");
  if(!o){ el.innerHTML="<p class='empty'>لا يوجد طلب نشط</p>"; return }
  el.innerHTML=`<p class="small" style="color:var(--mut)">طلب #${esc(o.id.slice(-4).toUpperCase())} · ${esc(o.total)}</p><div class="tl">`+(o.table?STEPS_T:STEPS).map((s,i)=>`<div class="st ${i<o.status||o.status>=4?"done":i==o.status?"now":""}"><i>${i<o.status||o.status>=4?"✓":i+1}</i>${s}</div>`).join("")+`</div>`+(o._local?`<p class="small" style="color:var(--mut)">⚠️ وضع تجريبي محلي — التتبع بين الأجهزة يحتاج ربط قاعدة البيانات.</p>`:"")+(o.status>=4?`<button class="btn full" id="newOrd">طلب جديد</button>`:"");
}
let tmr;
function openTrack(){ $("#track").classList.add("open"); drawTrack(); clearInterval(tmr); tmr=setInterval(()=>{ $("#track").classList.contains("open")?drawTrack():clearInterval(tmr) },5000) }
async function drawKitchen(){
  const L=await ST.list();
  $("#kitchen").innerHTML=(L.length?L.slice(0,20).map(o=>`<div class="ko"><b>#${esc(o.id.slice(-4).toUpperCase())} ${o.table?"🪑":"🛵"} ${esc(o.addr||"")}</b><div class="small" style="color:var(--mut)">${(o.items||[]).map(i=>esc(i.name)+" ×"+esc(i.n)).join("، ")} — ${esc(o.total)}</div><div class="kb">${(o.table?STEPS_T:STEPS).map((s,i)=>`<button data-ks="${esc(o.id)}|${i}" class="${i==o.status?"on":""}">${s}</button>`).join("")}</div></div>`).join(""):"<p class='empty'>لا توجد طلبات بعد</p>")+`<button class="btn full" id="kRef">🔄 تحديث</button>`;
}
let kt; $("#kDet").ontoggle=()=>{ if($("#kDet").open){ drawKitchen(); clearInterval(kt); kt=setInterval(()=>$("#kDet").open?drawKitchen():clearInterval(kt),8000) } };

document.addEventListener("click",async e=>{
  const t=e.target, d=t.dataset;
  if(d.d){ diets.has(d.d)?diets.delete(d.d):diets.add(d.d); render() }
  if(d.combo!==undefined){ const p=Math.max(1,+$("#bPpl").value||1); bc[d.combo].forEach(i=>cart[i.id]=(cart[i.id]||0)+p); renderCart(); $("#budget").classList.remove("open"); $("#cart").classList.add("open"); toast("أُضيفت الوجبة 🎉") }
  if(d.add) setTimeout(()=>{ const s=suggest(); if(s) toast("💡 جرّب معه: "+s.m.name) },1500);
  if(d.ks){ const [id,s]=d.ks.split("|"); await ST.set(id,+s); drawKitchen() }
  if(t.id==="kRef") drawKitchen();
  if(t.id==="newOrd"){ store.set("myOrder",null); $("#track").classList.remove("open"); buildHub() }
});
buildHub();

render();
