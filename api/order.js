// Vercel Serverless Function — يرسل الطلبات والتنبيهات (SMS عبر Twilio + تيليجرام)
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const { kind, name, phone, addr, table, items, total, text } = req.body || {};
  const E = process.env;
  const R = E.RESTAURANT_NAME || "المطعم";

  let toOwner, toCustomer = null;
  if (kind === "note") {
    if (!text) return res.status(400).json({ ok: false });
    toOwner = text;
  } else {
    if (!items?.length) return res.status(400).json({ ok: false });
    const lines = items.map(i => `• ${i.name} × ${i.n}`).join("\n");
    toOwner = `🔔 طلب جديد${table ? ` — طاولة ${table}` : ""}\n${lines}\nالإجمالي: ${total}\n👤 ${name || "-"}\n📞 ${phone || "-"}\n📍 ${addr || "-"}`;
    if (phone) toCustomer = `✅ ${R}\nأهلاً ${name || ""}، تم استلام طلبك:\n${lines}\nالإجمالي: ${total}\nنتمنى لك وجبة شهية 🍽️`;
  }

  const sms = async (to, body) => (await fetch(`https://api.twilio.com/2010-04-01/Accounts/${E.TWILIO_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`${E.TWILIO_SID}:${E.TWILIO_TOKEN}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: E.TWILIO_FROM, Body: body })
  })).ok;
  const tg = async t => (await fetch(`https://api.telegram.org/bot${E.TG_TOKEN}/sendMessage`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: E.TG_CHAT, text: t })
  })).ok;

  const jobs = [];
  if (E.TWILIO_SID && E.TWILIO_TOKEN && E.TWILIO_FROM) {
    if (toCustomer) jobs.push(sms(phone, toCustomer));
    if (E.OWNER_PHONE) jobs.push(sms(E.OWNER_PHONE, toOwner));
  }
  if (E.TG_TOKEN && E.TG_CHAT) jobs.push(tg(toOwner));
  if (!jobs.length) return res.status(501).json({ ok: false });
  const out = await Promise.allSettled(jobs);
  res.json({ ok: out.some(o => o.status === "fulfilled" && o.value) });
};
