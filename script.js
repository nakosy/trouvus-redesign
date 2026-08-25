/* Trouvus — all page interaction. No dependencies.
   Every module is guarded by the presence of its own markup, so one file serves every page. */
(function(){
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function $(id){ return document.getElementById(id); }
  function all(sel, root){ return Array.prototype.slice.call((root||document).querySelectorAll(sel)); }

  /* ---------- the decision chain (homepage) ---------- */
  (function(){
    var wrapEl = $("steps"); if (!wrapEl) return;
    var steps = all(".step", wrapEl);
    var trace = $("trace"), verd = $("verdict");
    var mClean = $("mode-clean"), mDirty = $("mode-dirty");
    var bStep = $("stepbtn"), bRun = $("runbtn"), bReset = $("resetbtn");
    var GATE = 1, idx = 0, dirty = false, finished = false, timers = [];

    function stop(){ timers.forEach(clearTimeout); timers = []; }
    function paint(){ bStep.disabled = finished; bRun.disabled = finished; }

    function setMode(d){
      dirty = d;
      mClean.setAttribute("aria-pressed", d ? "false" : "true");
      mDirty.setAttribute("aria-pressed", d ? "true" : "false");
    }
    function reset(){
      stop(); idx = 0; finished = false;
      steps.forEach(function(s){ s.setAttribute("data-state","idle"); s.classList.remove("halted"); });
      trace.textContent = "Idle. Step through the chain, or corrupt the feed and watch it stop.";
      verd.textContent = "—"; verd.setAttribute("data-kind","idle");
      paint();
    }
    function halt(){
      steps[GATE].setAttribute("data-state","done");
      steps[GATE].classList.add("halted");
      for (var k = GATE + 1; k < steps.length; k++) steps[k].setAttribute("data-state","skipped");
      finished = true;
      verd.textContent = "BLOCKED"; verd.setAttribute("data-kind","blocked");
      trace.innerHTML = "Integrity check failed → <b>chain halted at step 02</b>. No score, target or tier may be shown beside this state.";
      paint();
    }
    function complete(){
      finished = true;
      verd.textContent = "BUY ON TRIGGER"; verd.setAttribute("data-kind","answer");
      trace.innerHTML = "Chain complete → label emitted → <b>awaiting the named human</b>.";
      paint();
    }
    function step(){
      if (finished) return;
      if (dirty && idx === GATE){ halt(); return; }
      steps[idx].setAttribute("data-state","done");
      trace.textContent = "Step " + steps[idx].querySelector(".n").textContent.replace(" · GATE","")
                        + " — " + steps[idx].querySelector(".t").textContent + " — passed.";
      idx++;
      if (idx >= steps.length) complete();
      paint();
    }
    function runAll(){
      if (finished) reset();
      if (reduce){ while (!finished) step(); return; }
      (function loop(){
        if (finished) return;
        step();
        if (!finished) timers.push(setTimeout(loop, 420));
      })();
    }

    mClean.addEventListener("click", function(){ setMode(false); reset(); });
    mDirty.addEventListener("click", function(){ setMode(true);  reset(); });
    bStep.addEventListener("click", function(){ stop(); step(); });
    bRun.addEventListener("click", runAll);
    bReset.addEventListener("click", reset);
    paint();
  })();

  /* ---------- the action-label set (homepage) ---------- */
  (function(){
    var box = $("labels"); if (!box) return;
    var labs = all(".lab", box), cap = $("labcap");
    var ok = $("feed-ok"), bad = $("feed-bad");
    function setFeed(verified){
      ok.setAttribute("aria-pressed",  verified ? "true"  : "false");
      bad.setAttribute("aria-pressed", verified ? "false" : "true");
      labs.forEach(function(l){
        var isBlocked = l.getAttribute("data-l") === "blocked";
        l.classList.toggle("lit", verified ? (l.textContent === "BUY ON TRIGGER") : isBlocked);
      });
      cap.textContent = verified
        ? "A closed label set. Adding one requires a schema change, a contract test, and a rendering test."
        : "Eight answers are now unavailable. Mock or fallback data cannot produce an actionable label at all.";
    }
    ok.addEventListener("click",  function(){ setFeed(true);  });
    bad.addEventListener("click", function(){ setFeed(false); });
  })();

  /* ---------- the cost curves (homepage) ---------- */
  (function(){
    var curve = $("curve"); if (!curve) return;
    if (reduce || !("IntersectionObserver" in window)){ curve.classList.add("drawn"); return; }
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ curve.classList.add("drawn"); io.disconnect(); }
      });
    }, {threshold:.35});
    io.observe(curve);
  })();

  /* ---------- the Leap and the Grid boundary (/baseline) ---------- */
  (function(){
    var lg = $("lg"); if (!lg) return;
    var held = $("lg-held"), drift = $("lg-drift");
    function set(isDrift){
      lg.classList.toggle("drift", isDrift);
      held.setAttribute("aria-pressed",  isDrift ? "false" : "true");
      drift.setAttribute("aria-pressed", isDrift ? "true"  : "false");
    }
    held.addEventListener("click",  function(){ set(false); });
    drift.addEventListener("click", function(){ set(true);  });
  })();

  /* ---------- principle tracing (/architecture) ---------- */
  (function(){
    var op = $("op"); if (!op) return;
    var rows = all(".row", op);
    var btns = all(".ctl[data-row]");
    var walk = $("op-walk"), clear = $("op-clear");
    var timers = [];
    function stop(){ timers.forEach(clearTimeout); timers = []; }
    function show(n){
      op.classList.toggle("focused", !!n);
      rows.forEach(function(r){ r.classList.toggle("on", r.getAttribute("data-row") === String(n)); });
      btns.forEach(function(b){ b.setAttribute("aria-pressed", b.getAttribute("data-row") === String(n) ? "true" : "false"); });
    }
    btns.forEach(function(b){
      b.addEventListener("click", function(){
        stop();
        show(b.getAttribute("aria-pressed") === "true" ? 0 : b.getAttribute("data-row"));
      });
    });
    rows.forEach(function(r){
      r.addEventListener("click", function(){
        stop();
        show(r.classList.contains("on") ? 0 : r.getAttribute("data-row"));
      });
    });
    clear.addEventListener("click", function(){ stop(); show(0); });
    walk.addEventListener("click", function(){
      stop();
      if (reduce){ show(0); return; }
      for (var i = 1; i <= 6; i++){
        (function(n){ timers.push(setTimeout(function(){ show(n); }, (n - 1) * 900)); })(i);
      }
      timers.push(setTimeout(function(){ show(0); }, 6 * 900 + 400));
    });
  })();
})();
