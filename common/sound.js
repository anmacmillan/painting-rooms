/* Sound for the painting rooms. Nothing is recorded: it is all played live in the browser.
   Slow chords swell and fade underneath; over them single bell notes ring out at uneven intervals in a large hall.
   A bell here is three pure tones at the ratios a struck metal bar gives (1 : 2.756 : 5.404), each dying away at its own rate.
     Sound.start({chords: [[midi notes]...], scale: [midi notes]})   call from a tap or key press
     Sound.update(busy, wind)        every frame; both 0..1
     Sound.bell(i, vol, delay)       i is a step of the scale
     Sound.puff(vol), Sound.hiss(), Sound.whoosh(vol), Sound.setMuted(bool) */
window.Sound = (() => {
  let ac = null, master, wet, dry, pads, windGain, windBand, noise, muted = false;
  let chords = [], scale = [], nextChord = 0, nextBell = 0, chordI = 0, walk = 4, track = null, trackBuf = null, nextTrack = 0, trackGain = null, first = true;
  const hz = m => 440 * Math.pow(2, (m - 69) / 12);
  function start(opts) {
    chords = opts.chords; scale = opts.scale;
    if (ac) { ac.resume(); if (opts.track && opts.track !== track) setTrack(opts.track, 2); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ac = new AC();
    master = ac.createGain(); master.gain.value = muted ? 0 : 0.9;
    const comp = ac.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ac.destination);
    // The hall: a few seconds of fading noise, used as the echo of a big room.
    const len = Math.floor(ac.sampleRate * 3.6), ir = ac.createBuffer(2, len, ac.sampleRate);
    for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6) * (1 - Math.exp(-i / 400)); }
    const hall = ac.createConvolver(); hall.buffer = ir;
    wet = ac.createGain(); wet.gain.value = 0.55; dry = ac.createGain(); dry.gain.value = 0.75;
    wet.connect(hall); hall.connect(master); dry.connect(master);
    pads = ac.createBiquadFilter(); pads.type = 'lowpass'; pads.frequency.value = 1300; pads.Q.value = 0.3;
    pads.connect(wet); pads.connect(dry);
    noise = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noise.getChannelData(0); let g = 0; for (let i = 0; i < d.length; i++) { g = g * 0.96 + (Math.random() * 2 - 1) * 0.2; d[i] = g; }
    const src = ac.createBufferSource(); src.buffer = noise; src.loop = true;
    windBand = ac.createBiquadFilter(); windBand.type = 'bandpass'; windBand.frequency.value = 480; windBand.Q.value = 0.7;
    windGain = ac.createGain(); windGain.gain.value = 0;
    src.connect(windBand); windBand.connect(windGain); windGain.connect(dry); windGain.connect(wet); src.start();
    nextChord = ac.currentTime + 0.1; nextBell = ac.currentTime + 2.5;
    // A recorded score (opts.track) replaces the pads and the wandering bells; it loops with a slow cross-fade. If it fails to load, the pads carry on.
    if (opts.track) setTrack(opts.track, 0);
  }
  // Change the recorded score: the old one fades out over `fade` seconds while the new one loads and comes in.
  function setTrack(url, fade) {
    if (!ac) return; const old = trackGain; if (old) { old.gain.setTargetAtTime(0.0001, ac.currentTime, Math.max(0.05, (fade || 0) / 3)); setTimeout(() => old.disconnect(), ((fade || 0) + 1) * 1000); }
    trackGain = ac.createGain(); trackGain.gain.value = 0.5; trackGain.connect(master); const mine = trackGain; track = url; trackBuf = null; first = true;
    fetch(url).then(r => r.arrayBuffer()).then(b => new Promise((ok, no) => ac.decodeAudioData(b, ok, no))).then(b => { if (trackGain === mine) { trackBuf = b; nextTrack = ac.currentTime + 0.05; } }).catch(() => { if (trackGain === mine) track = null; });
  }
  function playTrack(t) {
    const X = 5, s = ac.createBufferSource(), g = ac.createGain(), d = trackBuf.duration; s.buffer = trackBuf;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(1, t + (first ? 2.5 : X)); first = false; g.gain.setValueAtTime(1, t + d - X); g.gain.linearRampToValueAtTime(0.0001, t + d);
    s.connect(g); g.connect(trackGain); s.start(t); nextTrack = t + d - X;
  }
  function pad(f, t, dur, vol, type) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = f; o.detune.value = (Math.random() - 0.5) * 9;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 2.2);
    g.gain.setValueAtTime(vol, t + Math.max(2.2, dur - 3.2)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(pads); o.start(t); o.stop(t + dur + 0.1);
  }
  function bellAt(midi, vol, delay) {
    if (!ac) return;
    const t = ac.currentTime + (delay || 0), out = ac.createGain();
    if (ac.createStereoPanner) { const p = ac.createStereoPanner(); p.pan.value = Math.random() * 1.6 - 0.8; out.connect(p); p.connect(wet); p.connect(dry); }
    else { out.connect(wet); out.connect(dry); }
    for (const [ratio, amp, ring] of [[1, 1, 2.6], [2.756, 0.28, 1.2], [5.404, 0.1, 0.5]]) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.frequency.value = hz(midi) * ratio;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol * amp, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + ring);
      o.connect(g); g.connect(out); o.start(t); o.stop(t + ring + 0.05);
    }
  }
  function burst(vol, dur, type, f0, f1, rate) {
    if (!ac) return;
    const t = ac.currentTime, s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = noise; s.playbackRate.value = rate || 1; f.type = type; f.Q.value = 0.7;
    f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(dry); s.start(t, Math.random(), dur + 0.05);
  }
  return {
    start,
    update(busy, wind) {
      if (!ac || ac.state !== 'running') return;
      const now = ac.currentTime;
      if (trackBuf && now >= nextTrack - 0.2) playTrack(Math.max(now, nextTrack));
      if (!track && now >= nextChord) {
        chords[chordI++ % chords.length].forEach((m, i) => {
          pad(hz(m), now, 12.5, i === 0 ? 0.055 : 0.028, i === 0 ? 'sine' : 'triangle');
          if (i > 0) pad(hz(m + 12), now + 0.4, 11.5, 0.007, 'sine');
        });
        nextChord = now + 9;
      }
      if (!track && now >= nextBell) {
        walk = Math.max(0, Math.min(scale.length - 1, walk + Math.floor(Math.random() * 7) - 3));
        bellAt(scale[walk], 0.026 + Math.random() * 0.02);
        if (Math.random() < 0.35) bellAt(scale[Math.floor(Math.random() * scale.length)], 0.02, 0.22 + Math.random() * 0.3);
        nextBell = now + (1.4 + Math.random() * 3.4) * (1.25 - 0.55 * (busy || 0));
      }
      windGain.gain.setTargetAtTime(Math.min(0.05, (wind || 0) * 0.05), now, 0.25);
      windBand.frequency.setTargetAtTime(380 + (wind || 0) * 500, now, 0.3);
    },
    bell(i, vol, delay) { if (scale.length) bellAt(scale[Math.max(0, Math.min(scale.length - 1, i))], vol || 0.06, delay); },
    puff(vol) { burst(vol || 0.03, 0.09, 'lowpass', 900, 250, 1); },
    whoosh(vol) { burst(vol || 0.08, 0.32, 'bandpass', 260, 800, 0.9); },
    hiss() { burst(0.09, 0.7, 'highpass', 3200, 5200, 3); },
    setTrack,
    setMuted(m) { muted = m; if (ac) master.gain.setTargetAtTime(m ? 0 : 0.9, ac.currentTime, 0.08); },
  };
})();
