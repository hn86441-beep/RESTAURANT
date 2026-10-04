// تتبع حالة الطلب مباشرة — يحتاج قاعدة Upstash Redis (مجانية)
const U = process.env.UPSTASH_REDIS_REST_URL, T = process.env.UPSTASH_REDIS_REST_TOKEN;
const cmd = async (...c) => (await (await fetch(U, { method: "POST", headers: { Authorization: `Bearer ${T}` }, body: JSON.stringify(c) })).json()).result;

module.exports = async (req, res) => {
  if (!U || !T) return res.status(501).json({ ok: false });
  const pin = process.env.ADMIN_PIN || "123454321";
  try {
    if (req.method === "GET") {
      const { id, list, pin: p } = req.query;
      if (list) {
        if (p !== pin) return res.status(401).json({});
        const ids = await cmd("LRANGE", "orders", 0, 29), out = [];
        for (const i of ids) { const v = await cmd("GET", "order:" + i); if (v) out.push(JSON.parse(v)); }
        return res.json({ orders: out });
      }
      const v = await cmd("GET", "order:" + id);
      return v ? res.json(JSON.parse(v)) : res.status(404).json({});
    }
    const b = req.body || {};
    if (b.action === "create" && b.id) {
      const o = { id: String(b.id).slice(0, 20), table: !!b.table, name: b.name, addr: b.addr, total: b.total, items: b.items, status: 0, t: Date.now() };
      await cmd("SET", "order:" + o.id, JSON.stringify(o), "EX", 86400);
      await cmd("LPUSH", "orders", o.id); await cmd("LTRIM", "orders", 0, 49);
      return res.json({ ok: true });
    }
    if (b.action === "set") {
      if (b.pin !== pin) return res.status(401).json({});
      const v = await cmd("GET", "order:" + b.id);
      if (!v) return res.status(404).json({});
      const o = JSON.parse(v); o.status = +b.status;
      await cmd("SET", "order:" + b.id, JSON.stringify(o), "EX", 86400);
      return res.json({ ok: true });
    }
  } catch { return res.status(500).json({}); }
  res.status(400).json({});
};
