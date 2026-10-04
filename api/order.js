// Vercel Serverless Function: يرسل رسالة SMS للزبون وللمطعم (Twilio) + إشعار تيليجرام (اختياري)
module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const { name, phone, addr, items, total, discount } = req.body || {};
  if (!phone || !items?.length) return res.status(400).json({ ok: false, error: "بيانات ناقصة" });

  const E = process.env;
  const R = E.RESTAURANT_NAME || "المطعم";
  const lines = items.map(i => `• ${i.name} × ${i.n}`).join("\n");
  const toCustomer = `✅ ${R}\nأهلاً ${name || ""}، تم استلام طلبك:\n${lines}\nالإجمالي: ${total}${discount ? ` (خصم ${discount}%)` : ""}\nسنتواصل معك قريباً 🍽️`;
  const toOwner = `🔔 طلب جديد\n${lines}\nالإجمالي: ${total}\n👤 ${name || "-"}\n📞 ${phone}\n📍 ${addr || "-"}`;

  const sms = async (to, body) => {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${E.TWILIO_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${E.TWILIO_SID}:${E.TWILIO_TOKEN}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({ To: to, From: E.TWILIO_FROM, Body: body })
    });
    return r.ok;
  };
  const tg = async text => {
    const r = await fetch(`https://api.telegram.org/bot${E.TG_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: E.TG_CHAT, text })
    });
    return r.ok;
  };

  const jobs = [];
  if (E.TWILIO_SID && E.TWILIO_TOKEN && E.TWILIO_FROM) {
    jobs.push(sms(phone, toCustomer));
    if (E.OWNER_PHONE) jobs.push(sms(E.OWNER_PHONE, toOwner));
  }
  if (E.TG_TOKEN && E.TG_CHAT) jobs.push(tg(toOwner));

  if (!jobs.length) return res.status(501).json({ ok: false, error: "لم يتم إعداد خدمة الرسائل" });
  const out = await Promise.allSettled(jobs);
  res.json({ ok: out.some(o => o.status === "fulfilled" && o.value) });
}
