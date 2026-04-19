/* ═══════════════════════════════════════════════
   FOUNDRI v2 — script.js
   Real-time chat • 3D tilt • Network canvas • Forms
   ═══════════════════════════════════════════════ */

// ─── NO CONFIG NEEDED ──────────────────────────
// Chat uses a public open SSE network for real-time messaging,
// meaning it works globally upon deployment with ZERO setup!
// ─── NETWORK CANVAS ───────────────────────────
(function() {
  const canvas = document.getElementById('net');
  const ctx = canvas.getContext('2d');
  let W, H, nodes = [], mouse = { x: -999, y: -999 };
  const N = 55, LINK_DIST = 120, MOUSE_DIST = 160;

  function resize() { W = canvas.width = innerWidth; H = canvas.height = innerHeight; }
  window.addEventListener('resize', resize); resize();
  window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });

  for (let i = 0; i < N; i++) nodes.push({
    x: Math.random() * W, y: Math.random() * H,
    vx: (Math.random() - .5) * .4, vy: (Math.random() - .5) * .4,
    r: Math.random() * 1.5 + .5
  });

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
      const dm = dist(n, mouse);
      if (dm < MOUSE_DIST) { n.x += (n.x - mouse.x) * .015; n.y += (n.y - mouse.y) * .015; }
    });

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const d = dist(nodes[i], nodes[j]);
        if (d < LINK_DIST) {
          const a = (1 - d / LINK_DIST) * .18;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(255,107,43,${a})`;
          ctx.lineWidth = .6;
          ctx.stroke();
        }
      }
      const dm = dist(nodes[i], mouse);
      if (dm < MOUSE_DIST) {
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.strokeStyle = `rgba(255,179,71,${(1 - dm / MOUSE_DIST) * .3})`;
        ctx.lineWidth = .8; ctx.stroke();
      }
      ctx.beginPath();
      ctx.arc(nodes[i].x, nodes[i].y, nodes[i].r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,107,43,.45)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── CUSTOM CURSOR ─────────────────────────────
(function() {
  const cur = document.getElementById('cursor');
  if (!cur || window.innerWidth < 900) { if (cur) cur.style.display = 'none'; return; }
  window.addEventListener('mousemove', e => {
    cur.style.left = e.clientX + 'px';
    cur.style.top  = e.clientY + 'px';
  }, { passive: true });
  document.addEventListener('mousedown', () => { cur.style.width = '30px'; cur.style.height = '30px'; });
  document.addEventListener('mouseup',   () => { cur.style.width = '20px'; cur.style.height = '20px'; });
  document.querySelectorAll('a,button').forEach(el => {
    el.addEventListener('mouseenter', () => { cur.style.width = '36px'; cur.style.height = '36px'; cur.style.opacity = '.6'; });
    el.addEventListener('mouseleave', () => { cur.style.width = '20px'; cur.style.height = '20px'; cur.style.opacity = '1'; });
  });
})();

// ─── NAV SCROLL ────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('nav').classList.toggle('scrolled', scrollY > 40);
}, { passive: true });

// ─── HAMBURGER ─────────────────────────────────
document.getElementById('burger').addEventListener('click', function() {
  this.classList.toggle('open');
  document.getElementById('mobNav').classList.toggle('open');
});
document.querySelectorAll('.mob-nav a').forEach(a => a.addEventListener('click', () => {
  document.getElementById('burger').classList.remove('open');
  document.getElementById('mobNav').classList.remove('open');
}));

// ─── SMOOTH SCROLL ─────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return; e.preventDefault();
    window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 76, behavior: 'smooth' });
  });
});

// ─── SCROLL REVEAL ─────────────────────────────
(function() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
      const idx = siblings.indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('in'), idx * 90);
      io.unobserve(entry.target);
    });
  }, { threshold: .1, rootMargin: '0px 0px -30px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// ─── COUNTER ANIMATION ─────────────────────────
(function() {
  function animCount(el, target, dur = 1600) {
    const start = performance.now();
    const from = Math.floor(target * .5);
    const step = now => {
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (target - from) * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    document.querySelectorAll('.stn[data-to]').forEach(el => {
      animCount(el, parseInt(el.dataset.to));
    });
    io.disconnect();
  }, { threshold: .4 });
  const sec = document.getElementById('stats');
  if (sec) io.observe(sec);
})();

// ─── PROGRESS BAR ──────────────────────────────
(function() {
  const fill = document.getElementById('eaFill');
  if (!fill) return;
  const io = new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    fill.style.width = '84.7%'; io.disconnect();
  }, { threshold: .3 });
  const sec = document.getElementById('early-access');
  if (sec) io.observe(sec);
})();

// ─── 3D CARD TILT ──────────────────────────────
(function() {
  if (window.innerWidth < 900) return;
  document.querySelectorAll('[data-tilt]').forEach(card => {
    const MAX = 8;
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width  - .5;
      const y = (e.clientY - rect.top)  / rect.height - .5;
      card.style.transform = `perspective(900px) rotateX(${-y * MAX}deg) rotateY(${x * MAX}deg) translateZ(8px)`;
      card.style.boxShadow = `${-x*14}px ${-y*14}px 40px rgba(0,0,0,.4), 0 0 30px rgba(255,107,43,.1)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.boxShadow = '';
    });
  });
})();

// ─── EARLY ACCESS FORM & WAITLIST DYNAMIC TRACKING ─────────
(function() {
  const form    = document.getElementById('eaForm');
  const success = document.getElementById('eaSuccess');
  const btn     = document.getElementById('eaBtn');
  
  // Real-time counter logic via NTFY
  const SIGNUP_TOPIC = 'foundri_live_signups_v2';
  const NTFY_SIGNUP_URL = `https://ntfy.sh/${SIGNUP_TOPIC}`;
  
  let localWaitlist = parseInt(localStorage.getItem('foundri_base_signups') || '497');
  
  function updateWaitlistDOM(count) {
     // Waitlist counters
     document.querySelectorAll('.waitlist-count-display').forEach(e => e.textContent = count);
     const eaCount = document.getElementById('eaCount');
     if(eaCount) eaCount.textContent = count;
     
     // Percentage
     document.querySelectorAll('.ea-pct').forEach(e => e.textContent = (count / 10).toFixed(1) + '%');
     
     // Stats grid (need to update data-to so the animation doesn't revert to 497)
     document.querySelectorAll('.stn').forEach(el => {
        if(el.dataset.to == "497" || el.dataset.to == (count-1)) {
           el.dataset.to = count;
           el.textContent = count; // update immediate
        }
     });
     
     // Spots left
     const left = 1000 - count;
     document.querySelectorAll('.stn').forEach(el => {
        if(el.dataset.to == "503" || el.dataset.to == (left+1)) {
           el.dataset.to = left;
           el.textContent = left;
        }
     });
     
     const eaNote = document.querySelector('.ea-pnote strong');
     if(eaNote) eaNote.textContent = left + ' spots';
     
     const fill = document.getElementById('eaFill');
     if(fill) fill.style.width = ((count/1000) * 100) + '%';
     
     // Top hero chip logic
     const hChip = document.querySelector('.h-chip');
     if(hChip) {
         // Rebuild the HTML content to avoid regex backslash mismatches 
         hChip.innerHTML = '<span class="chip-dot"></span>' + count + ' / 1000 Founding Spots Taken';
     }
  }
  
  updateWaitlistDOM(localWaitlist);

  // Listen for realtime signups
  const es = new EventSource(`${NTFY_SIGNUP_URL}/sse`);
  es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if(data.event === 'message') {
         localWaitlist++;
         localStorage.setItem('foundri_base_signups', localWaitlist);
         updateWaitlistDOM(localWaitlist);
      }
  };

  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();
    
    const action = form.getAttribute('action');
    btn.textContent = 'Claiming your spot...';
    btn.disabled = true;
    btn.style.boxShadow = 'none';

    try {
      // Background submit the Web3Form
      if(!action.includes('YOUR_ACCESS_KEY_HERE')) {
         await fetch(action, { method: 'POST', body: new FormData(form) });
      }
      
      // Ping pub/sub for global real-time +1 increment
      await fetch(NTFY_SIGNUP_URL, { method: 'POST', body: 'signup' });
    } catch(err) {
      console.warn("Form submission exception:", err);
    }
    
    form.style.display = 'none';
    if(success) success.classList.remove('hidden');
  });
})();

// ─── REAL-TIME COMMUNITY CHAT ───────────────────
(function() {
  const feed        = document.getElementById('chatFeed');
  const placeholder = document.getElementById('chatPlaceholder');
  const nameInp     = document.getElementById('chatName');
  const msgInp      = document.getElementById('chatMsg');
  const sendBtn     = document.getElementById('chatSend');
  const onlineEl    = document.getElementById('onlineCount');
  const liveEl      = document.getElementById('chatLive');
  if (!feed) return;

  // Rate limiting & Admin
  let lastSent = 0;
  let localLastUid = null;
  const COOLDOWN = 3000;
  let isAdmin = false;

  // The topic serves as our "room ID" on the public pubsub network
  const TOPIC = 'foundri_live_core_chat_v3';
  const NTFY_URL = `https://ntfy.sh/${TOPIC}`;

  // Color palette for auto-assign
  const COLORS = ['#FF6B2B','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4','#EC4899','#14B8A6'];
  function nameToColor(name) {
    let h = 0;
    for (let c of name) h = ((h << 5) - h) + c.charCodeAt(0);
    return COLORS[Math.abs(h) % COLORS.length];
  }

  function relTime(ts) {
    const d = Date.now() - new Date(ts).getTime();
    if (d < 60000) return 'just now';
    if (d < 3600000) return Math.floor(d/60000) + 'm ago';
    return Math.floor(d/3600000) + 'h ago';
  }

  function renderMsg(msg, own = false) {
    const el = document.createElement('div');
    el.className = 'cmsg' + (own ? ' cmsg-own' : '');
    el.id = 'msg-' + msg.uid;
    
    // Check if message is from Devansh or an admin
    const isSpecial = (msg.name && msg.name.toLowerCase().includes('devansh')) || msg.isAdmin;
    
    const initial = (msg.name || 'A')[0].toUpperCase();
    const color   = msg.color || nameToColor(msg.name || 'A');
    
    let adminUI = '';
    let specialStyle = '';
    
    if (isSpecial) {
      adminUI = `<span style="background:var(--fire); color:#fff; font-size:0.55rem; padding:2px 5px; border-radius:4px; margin-left:6px; letter-spacing:0.05em; vertical-align:middle;">ADMIN</span>`;
      specialStyle = `border-color: rgba(255,107,43,0.4); box-shadow: 0 0 15px rgba(255,107,43,0.1); background: linear-gradient(135deg, rgba(255,107,43,0.1), var(--card2));`;
    }
    
    let deleteBtn = '';
    if (isAdmin || own) {
      deleteBtn = `<button onclick="window.delMsg('${msg.uid}')" style="background:none; border:none; color:var(--muted); font-size:0.65rem; cursor:pointer; margin-left:8px; opacity:0.6; transition:opacity 0.2s;" onmouseover="this.style.opacity=1" onmouseout="this.style.opacity=0.6">Delete</button>`;
    }

    el.innerHTML = `
      <div class="cmsg-av" style="--c:${color}">${initial}</div>
      <div class="cmsg-body" style="${specialStyle}">
        <span class="cmsg-name" style="display:flex; align-items:center;">${escHtml(msg.name || 'Anonymous')} ${adminUI}</span>
        <span class="cmsg-text">${escHtml(msg.message)}</span>
        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:4px;">
          <span class="cmsg-time" style="margin-top:0;">${relTime(msg.created_at)}</span>
          ${deleteBtn}
        </div>
      </div>`;
    feed.appendChild(el);
    feed.scrollTop = feed.scrollHeight;
  }

  window.delMsg = async function(uid) {
     const e = document.getElementById('msg-'+uid);
     if(e) e.remove();
     try {
       await fetch(NTFY_URL, { method: 'POST', body: JSON.stringify({ action: 'delete', uid }) });
     } catch(err) {}
  };

  function escHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function showNoMsgs() {
    feed.innerHTML = `<div class="no-msgs"><span>💬</span><p>Be the first to say something to the community!</p></div>`;
  }

  // Load chat system
  initChat();

  function initChat() {
    // Basic mock count of members
    if (onlineEl) onlineEl.textContent = Math.floor(40 + Math.random() * 20) + '+';
    
    // 1. Fetch recent messages
    fetch(`${NTFY_URL}/json?poll=1&since=12h`)
      .then(res => res.text())
      .then(text => {
         const lines = text.split('\\n').filter(Boolean);
         const msgs = lines.map(l => JSON.parse(l))
                           .filter(d => d.event === 'message')
                           .map(d => {
                             try { return JSON.parse(d.message); } catch(e) { return null; }
                           })
                           .filter(Boolean);
         
         if (placeholder) placeholder.remove();
         if (msgs.length === 0) showNoMsgs();
         else msgs.forEach(m => renderMsg(m));
         
         // In case network resets
         if (msgs.length === 0) {
            renderMsg({ name:'Devansh', message:'Welcome to Foundri 🔥 This is where we build together!', color:'#FF6B2B', created_at: new Date(Date.now()-60000).toISOString() });
         }
      })
      .catch(err => {
         console.warn('Could not fetch history', err);
         if (placeholder) placeholder.remove();
         showNoMsgs();
      });
      
    // 2. Subscribe to new real-time messages via Server-Sent Events (SSE)
    const eventSource = new EventSource(`${NTFY_URL}/sse`);
    eventSource.onmessage = (e) => {
       const data = JSON.parse(e.data);
       if (data.event === 'message') {
           const noMsgs = feed.querySelector('.no-msgs');
           if (noMsgs) noMsgs.remove();
           try {
               const msg = JSON.parse(data.message);
               // Handle delete broadcast
               if (msg.action === 'delete') {
                  const mEl = document.getElementById('msg-' + msg.uid);
                  if (mEl) mEl.remove();
                  return;
               }
               // Prevent echoing our own message if we just sent it
               if (msg.uid && msg.uid === localLastUid) return; 
               renderMsg(msg);
           } catch(err) {}
       }
    };
    eventSource.onopen = () => {
       if (liveEl) liveEl.textContent = 'Live';
    };
    
    // Bind send handlers
    sendBtn.addEventListener('click', sendMsg);
    msgInp.addEventListener('keydown', e => { 
        if (e.key === 'Enter' && !e.shiftKey) { 
           e.preventDefault(); 
           // Secret admin mode trigger
           if (msgInp.value.trim() === '/iamadmin') {
              isAdmin = true;
              msgInp.value = '';
              alert('You are now in Admin Mode! You can see delete buttons on all messages.');
              // Re-render chat to reflect new state
              document.querySelectorAll('.cmsg').forEach(e => e.remove());
              initChat(); // Will refetch with new delete buttons because isAdmin=true!
              return;
           }
           sendMsg(); 
        } 
    });
  }

  async function sendMsg() {
    const name = (nameInp.value.trim() || 'Anonymous').slice(0, 40);
    const text = msgInp.value.trim();
    if (!text) return;
    const now = Date.now();
    if (now - lastSent < COOLDOWN) { 
        showCooldown(Math.ceil((COOLDOWN - (now - lastSent))/1000)); return; 
    }
    
    sendBtn.disabled = true;
    const color = nameToColor(name);
    localLastUid = Math.random().toString(36).substring(2, 10);
    const msg = { name, message: text, color, created_at: new Date().toISOString(), uid: localLastUid, isAdmin };
    
    // Optimistic UI Update directly to screen
    renderMsg(msg, true);
    const noMsgs = feed.querySelector('.no-msgs');
    if (noMsgs) noMsgs.remove();
    msgInp.value = ''; 
    lastSent = now;
    
    try {
      await fetch(NTFY_URL, { method: 'POST', body: JSON.stringify(msg) });
    } catch(err) {
      console.warn('Failed to send', err);
    }
    sendBtn.disabled = false;
  }

  function showCooldown(sec) {
    const orig = sendBtn.innerHTML;
    sendBtn.textContent = sec + 's';
    sendBtn.disabled = true;
    const iv = setInterval(() => {
      sec--;
      if (sec <= 0) { clearInterval(iv); sendBtn.innerHTML = orig; sendBtn.disabled = false; }
      else sendBtn.textContent = sec + 's';
    }, 1000);
  }

  // Update timestamps periodically without destroying feed content
  setInterval(() => {
    // Soft update of times can be implemented here
  }, 60000);
})();

// ─── SUPER PREMIUM FEEDBACK FORM ───────────────
(function() {
  const stars  = document.querySelectorAll('#starRating span');
  const input  = document.getElementById('fbRatingVal');
  const form   = document.getElementById('fbForm');
  const succ   = document.getElementById('fbSuccess');
  const btn    = document.getElementById('fbBtn');
  
  if(!stars.length) return;
  
  let rating = 0;
  
  stars.forEach(s => {
    s.addEventListener('mouseover', function() {
       resetStars();
       const val = this.dataset.val;
       for(let i=0; i<val; i++) stars[i].style.color = 'var(--amber)';
    });
    s.addEventListener('mouseout', function() { setStars(rating); });
    s.addEventListener('click', function() {
       rating = this.dataset.val;
       input.value = rating;
       setStars(rating);
       
       // Cool pop effect
       this.style.transform = 'scale(1.3)';
       setTimeout(() => { this.style.transform = 'scale(1)'; }, 150);
    });
  });
  
  function resetStars() {
     stars.forEach(s => { s.style.color = 'var(--dim)'; s.style.transform = 'scale(1)'; });
  }
  function setStars(val) {
     resetStars();
     for(let i=0; i<val; i++) stars[i].style.color = 'var(--amber)';
  }
  
  if(form) {
    form.addEventListener('submit', async e => {
       e.preventDefault();
       if(!rating) { alert("Please tap a star to give a rating!"); return; }
       
       btn.textContent = 'Sending securely...';
       btn.disabled = true;
       
       try {
         await fetch(form.action, { method: 'POST', body: new FormData(form) });
         form.style.display = 'none';
         succ.style.display = 'block';
       } catch(err) {
         btn.textContent = 'Try Again';
         btn.disabled = false;
       }
    });
  }
})();

// ─── PARALLAX BLOBS ─────────────────────────────
(function() {
  if (window.innerWidth < 900) return;
  const rings = document.querySelectorAll('.orb-ring,.orb-core');
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth  - .5) * 20;
    const y = (e.clientY / innerHeight - .5) * 15;
    rings.forEach((r, i) => {
      const d = (i % 2 === 0 ? 1 : -1) * (i + 1) * .4;
      r.style.transform = `translate(${x * d}px, ${y * d}px)`;
    });
  }, { passive: true });
})();

// ─── HERO CARD PARALLAX ─────────────────────────
(function() {
  if (window.innerWidth < 900) return;
  const cards = document.querySelectorAll('.hcard');
  window.addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth  - .5);
    const y = (e.clientY / innerHeight - .5);
    cards.forEach((c, i) => {
      const d = parseFloat(c.dataset.depth || 2);
      c.style.setProperty('transform', `translateX(${x * d * 12}px) translateY(${y * d * 10}px)`);
    });
  }, { passive: true });
})();

// ─── FABULOUS GLOBAL SCROLL ANIMATIONS ──────────
(function() {
  const ob = new IntersectionObserver((es) => {
    es.forEach(e => {
      if(e.isIntersecting) {
        e.target.classList.add('visible');
        ob.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });
  document.querySelectorAll('.reveal').forEach(el => ob.observe(el));
})();
