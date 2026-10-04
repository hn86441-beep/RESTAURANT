/* ===== الإعدادات: عدّلها لكل عميل ===== */
const CONFIG = {
  name: "مطعم الذواقة",
  phone: "201000000000",   // رقم واتساب بالصيغة الدولية بدون +
  pin: "1234",             // الرمز السري للوحة التحكم
  currency: "ج.م",
  open: 12, close: 25      // 25 = 1 صباحاً
};

const DEFAULT_MENU = [
  {id:1,name:"برجر لحم أنجوس",desc:"قطعة لحم 200 جم مع جبنة شيدر وصوص خاص",price:140,cat:"الأطباق الرئيسية",emoji:"🍔"},
  {id:2,name:"بيتزا مارغريتا",desc:"عجينة طازجة، موتزاريلا وريحان",price:120,cat:"الأطباق الرئيسية",emoji:"🍕"},
  {id:3,name:"ستيك مشوي",desc:"شريحة ستيك مع خضار مشوية وبطاطس",price:260,cat:"الأطباق الرئيسية",emoji:"🥩"},
  {id:4,name:"سلطة سيزر",desc:"خس، دجاج مشوي، parmesan وصوص سيزر",price:75,cat:"المقبلات",emoji:"🥗"},
  {id:5,name:"أصابع الموتزاريلا",desc:"مقرمشة مع صوص طماطم",price:65,cat:"المقبلات",emoji:"🧀"},
  {id:6,name:"عصير مانجو طازج",desc:"مانجو طبيعي 100%",price:45,cat:"المشروبات",emoji:"🥭"},
  {id:7,name:"قهوة اسبريسو",desc:"بن مختص محمص يومياً",price:35,cat:"المشروبات",emoji:"☕"},
  {id:8,name:"تشيز كيك",desc:"بصوص التوت البري",price:80,cat:"الحلويات",emoji:"🍰"}
];

const $ = s => document.querySelector(s);
const store = {
  get(k, d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d }catch{ return d } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)) }catch{ toast("المساحة ممتلئة، استخدم صوراً أصغر") } }
};
let menu = store.get("menu", DEFAULT_MENU);
let cart = store.get("cart", {});
let cat = "الكل", q = "", editId = null, imgData = "";

const save = () => store.set("menu", menu);
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function toast(t){ const e=$("#toast"); e.textContent=t; e.classList.add("show"); setTimeout(()=>e.classList.remove("show"),2200) }

/* ===== العرض ===== */
function render(){
  const cats = ["الكل", ...new Set(menu.map(i=>i.cat))];
  $("#chips").innerHTML = cats.map(c=>`<button class="chip ${c===cat?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  $("#cats").innerHTML = cats.slice(1).map(c=>`<option value="${esc(c)}">`).join("");
  const items = menu.filter(i => (cat==="الكل"||i.cat===cat) && (i.name+i.desc).includes(q));
  $("#grid").innerHTML = items.length ? items.map(i=>`
    <article class="card reveal in">
      <div class="pic">${i.img?`<img src="${i.img}" alt="${esc(i.name)}" loading="lazy">`:(i.emoji||"🍽️")}</div>
      <div class="cb"><h3>${esc(i.name)}</h3><p>${esc(i.desc||"")}</p>
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
  store.set("cart", cart);
}
function sendOrder(){
  const rows = Object.entries(cart).map(([id,n])=>[menu.find(i=>i.id==id),n]).filter(([i])=>i);
  if(!rows.length) return toast("السلة فارغة");
  const total = rows.reduce((s,[i,n])=>s+i.price*n,0);
  const msg = `🍽️ *طلب جديد - ${CONFIG.name}*\n\n` +
    rows.map(([i,n])=>`• ${i.name} × ${n} = ${i.price*n}`).join("\n") +
    `\n\n💰 *الإجمالي:* ${total} ${CONFIG.currency}\n👤 ${$("#custName").value||"-"}\n📍 ${$("#custAddr").value||"-"}`;
  window.open(`https://wa.me/${CONFIG.phone}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ===== لوحة التحكم ===== */
function renderList(){
  $("#list").innerHTML = menu.map(i=>`<div class="li"><span>${i.emoji||"🍽️"} ${esc(i.name)} — ${i.price}</span>
    <button data-edit="${i.id}">✏️</button><button data-del="${i.id}">🗑️</button></div>`).join("");
}
function resetForm(){ editId=null; imgData=""; $("#form").reset(); $("#saveBtn").textContent="➕ إضافة الصنف" }
$("#form").onsubmit = e => {
  e.preventDefault();
  const item = {name:$("#fName").value.trim(), desc:$("#fDesc").value.trim(), price:+$("#fPrice").value,
    cat:$("#fCat").value.trim(), emoji:$("#fEmoji").value.trim()};
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
    $("#fName").value=i.name; $("#fDesc").value=i.desc||""; $("#fPrice").value=i.price; $("#fCat").value=i.cat; $("#fEmoji").value=i.emoji||"";
    $("#saveBtn").textContent="💾 حفظ التعديل"; $("#panel").scrollTo?.(0,0) }
  if(t.hasAttribute("data-close")) { $("#cart").classList.remove("open"); $("#admin").classList.remove("open") }
  if(t===$("#admin")) $("#admin").classList.remove("open");
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

render();
