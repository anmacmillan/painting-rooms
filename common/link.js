// Two players in one level, through the family Firebase Realtime Database (the one Wizard Chess and the score board use).
// No direct connection between the two devices is needed, only the internet.
//
//   const link = new Link('sargent', myName);          // a room name, and a name unique to this player
//   link.on('open', () => ...)                          // the other player is there (fires on both sides)
//   link.on('state', s => ...)                          // the other player's latest state (whatever she passed to setState)
//   link.on('event', e => ...)                          // something the other player did (whatever she passed to send), in order, once each
//   link.on('close', () => ...)                         // she has gone quiet for 12 seconds
//   const isHost = await link.start();                  // the first to arrive hosts; the second joins her
//   link.setState({ x, z, yaw, ... })                   // call every frame if you like: it is sent at most about 8 times a second
//   link.send({ type: 'lit', id: 3 })                   // an event: delivered once, in order
//   link.close()
//
// State is one small record per player, overwritten; events are messages in the other player's inbox, deleted as they are read.
const DB = 'https://wizard-chess-manon-default-rtdb.europe-west1.firebasedatabase.app/owlq/ARCADE2026/pr';
export class Link {
  constructor(room, me) { this.root = `${DB}/${String(room).replace(/[^a-z0-9_-]/gi, '')}`; this.me = String(me).replace(/[^a-z0-9_-]/gi, '') || 'p' + Math.random().toString(36).slice(2, 8);
    this.id = Math.random().toString(36).slice(2); this.h = {}; this.streams = []; this.open = false; this.isHost = false; this.peer = null; this.last = 0; this.heard = 0; }
  call(path, method = 'GET', body) { return fetch(`${this.root}/${path}.json`, { method, body: body === undefined ? undefined : JSON.stringify(body), cache: 'no-store' }).then(r => r.json()); }
  on(e, fn) { (this.h[e] ||= []).push(fn); return this; }
  emit(e, d) { (this.h[e] || []).forEach(fn => { try { fn(d); } catch (err) { console.error(err); } }); }
  async start() {
    const host = await this.call('host'), live = host && host.t && Date.now() - host.t < 15000 && host.id !== this.id;
    if (!live) {
      await Promise.all([this.call('toHost', 'DELETE'), this.call('toGuest', 'DELETE'), this.call('state', 'DELETE')]);
      await this.call('host', 'PUT', { name: this.me, id: this.id, t: Date.now() }); await new Promise(r => setTimeout(r, 500));
      const now = await this.call('host');                       // if both arrived at once, the later write wins and the other joins her
      if (now && now.id === this.id) { this.isHost = true; this.beat = setInterval(() => this.call('host/t', 'PUT', Date.now()).catch(() => {}), 5000); this.listen('toHost'); this.watchdog(); return true; }
      return this.join(now);
    }
    return this.join(host);
  }
  async join(host) {
    this.peer = host.name; await this.call('toGuest', 'DELETE'); this.listen('toGuest'); this.watch(host.name);
    await this.call('toHost', 'POST', { __join: this.me }); setTimeout(() => { this.open = true; this.heard = Date.now(); this.emit('open'); }, 400); this.watchdog(); return false;
  }
  listen(box) {
    const es = new EventSource(`${this.root}/${box}.json`), seen = new Set();
    const take = (k, m) => { if (!m || seen.has(k)) return; seen.add(k); this.call(`${box}/${k}`, 'DELETE').catch(() => {}); this.heard = Date.now();
      if (m.__join) { this.peer = m.__join; this.watch(this.peer); this.open = true; this.emit('open'); } else this.emit('event', m); };
    es.addEventListener('put', e => { const { path, data } = JSON.parse(e.data); if (data == null) return; const parts = path.split('/').filter(Boolean); if (!parts.length) Object.keys(data).sort().forEach(k => take(k, data[k])); else if (parts.length === 1) take(parts[0], data); });
    this.streams.push(es);
  }
  watch(name) { if (this.watching === name) return; this.watching = name; const es = new EventSource(`${this.root}/state/${name}.json`); es.addEventListener('put', e => { const { data } = JSON.parse(e.data); if (data) { this.heard = Date.now(); this.emit('state', data); } }); this.streams.push(es); }
  watchdog() { this.dog = setInterval(() => { if (this.open && Date.now() - this.heard > 12000) { this.open = false; this.emit('close'); } }, 3000); }
  setState(s) { const now = Date.now(); if (now - this.last < 120) return; this.last = now; this.call(`state/${this.me}`, 'PUT', s).catch(() => {}); }
  send(m) { this.call(this.isHost ? 'toGuest' : 'toHost', 'POST', m).catch(err => this.emit('error', err)); }
  close() { this.open = false; clearInterval(this.beat); clearInterval(this.dog); this.streams.forEach(s => s.close()); this.streams = []; if (this.isHost) this.call('host', 'DELETE').catch(() => {}); }
}
