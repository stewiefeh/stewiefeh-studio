// stewiefeh studio — aurora & chrome motion layer

(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches && "ontouchstart" in window === false;

  root.classList.add("js");
  if (reduce) root.classList.add("rm");
  if (finePointer && !reduce) root.classList.add("fine-pointer");

  /* ---------- preloader ---------- */

  var pre = document.getElementById("preloader");
  var preCount = document.getElementById("preCount");
  if (pre && !reduce) {
    var n = 0;
    var tick = setInterval(function () {
      n = Math.min(100, n + Math.ceil(Math.random() * 14));
      preCount.textContent = n;
      if (n >= 100) {
        clearInterval(tick);
        setTimeout(function () { pre.classList.add("done"); }, 220);
        setTimeout(function () { pre.remove(); }, 1300);
      }
    }, 90);
  } else if (pre) {
    pre.remove();
  }

  /* ---------- reveals ---------- */

  var revealed = document.querySelectorAll("[data-reveal]");
  if (!reduce && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.15 });
    revealed.forEach(function (t) { io.observe(t); });
  } else {
    revealed.forEach(function (t) { t.classList.add("is-in"); });
  }

  /* ---------- hero title char split ---------- */

  var title = document.getElementById("heroTitle");
  if (title && !reduce) {
    var walk = function (node) {
      var out = [];
      node.childNodes.forEach(function (child) {
        if (child.nodeType === 3) {
          child.textContent.split("").forEach(function (c) {
            var s = document.createElement("span");
            s.className = "ch";
            s.textContent = c === " " ? "\u00A0" : c;
            out.push(s);
          });
        } else if (child.nodeType === 1) {
          var inner = walk(child);
          child.textContent = "";
          inner.forEach(function (s) { child.appendChild(s); });
        }
      });
      return out;
    };
    walk(title);
    var chars = title.querySelectorAll(".ch");
    chars.forEach(function (s, i) { s.style.transitionDelay = (0.15 + i * 0.014) + "s"; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { title.classList.add("ready"); }); });
  } else if (title) {
    title.classList.add("ready");
  }

  /* ---------- scroll progress + nav state ---------- */

  var progress = document.getElementById("progress");
  var nav = document.getElementById("nav");
  var onScroll = function () {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? h.scrollTop / max : 0;
    if (progress) progress.style.width = (p * 100) + "%";
    if (nav) nav.classList.toggle("scrolled", h.scrollTop > 40);
  };
  document.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- menu overlay ---------- */

  var menuBtn = document.getElementById("menuBtn");
  var menu = document.getElementById("menu");
  var setMenu = function (open) {
    menu.classList.toggle("open", open);
    menu.setAttribute("aria-hidden", String(!open));
    menuBtn.setAttribute("aria-expanded", String(open));
    document.body.style.overflow = open ? "hidden" : "";
  };
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(!menu.classList.contains("open"));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  /* ---------- custom cursor ---------- */

  if (finePointer && !reduce) {
    var dot = document.getElementById("cDot");
    var ring = document.getElementById("cRing");
    var label = document.getElementById("cLabel");
    var mx = -100, my = -100, rx = -100, ry = -100;
    document.addEventListener("mousemove", function (e) { mx = e.clientX; my = e.clientY; });
    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform = "translate(" + (mx - 3.5) + "px," + (my - 3.5) + "px)";
      ring.style.transform = "translate(" + (rx - ring.offsetWidth / 2) + "px," + (ry - ring.offsetHeight / 2) + "px)";
      requestAnimationFrame(loop);
    })();
    document.querySelectorAll("[data-cursor]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        ring.classList.add("big");
        label.textContent = el.getAttribute("data-cursor");
      });
      el.addEventListener("mouseleave", function () {
        ring.classList.remove("big");
        label.textContent = "";
      });
    });
  }

  /* ---------- magnetic buttons ---------- */

  if (finePointer && !reduce) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + x * 0.22 + "px," + y * 0.3 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 3D tilt cards ---------- */

  if (finePointer && !reduce) {
    document.querySelectorAll(".tilt").forEach(function (card) {
      var strength = card.hasAttribute("data-tilt-soft") ? 3 : 6;
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + px * strength + "deg) rotateX(" + -py * strength + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }

  /* ---------- aurora background (silk shader) ---------- */

  var bgCanvas = document.getElementById("bg");
  if (bgCanvas) {
    var gl = bgCanvas.getContext("webgl", { antialias: false, alpha: false });
    if (gl) {
      var vertSrc = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
      var fragSrc = [
        "precision highp float;",
        "uniform float uTime;uniform vec2 uRes;",
        "float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}",
        "float glow(vec2 p,vec2 c,float r){return exp(-r*dot(p-c,p-c));}",
        "void main(){",
        "vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;",
        "float t=uTime*.05;",
        "vec2 c1=vec2(-.62+.28*sin(t*.9), .34+.22*cos(t*.6));",
        "vec2 c2=vec2(.62+.2*cos(t*.7+.8), -.28+.26*sin(t*.5+.4));",
        "vec2 c3=vec2(.1+.34*sin(t*.45+2.1), .5+.18*cos(t*.8+1.2));",
        "vec2 c4=vec2(-.25+.3*cos(t*.55+3.4), -.42+.2*sin(t*.75+.9));",
        "vec3 col=vec3(.062,.048,.094);",
        "col+=vec3(1.0,.30,.56)*glow(uv,c1,2.4)*.85;",
        "col+=vec3(.55,.36,.96)*glow(uv,c2,2.6)*.85;",
        "col+=vec3(.18,.85,.78)*glow(uv,c3,3.0)*.55;",
        "col+=vec3(1.0,.62,.30)*glow(uv,c4,3.2)*.45;",
        "float band=sin(uv.x*1.8+t*3.0)*cos(uv.y*2.2-t*2.2);",
        "col+=vec3(.10,.06,.20)*band*.5;",
        "col*=1.0-.42*dot(uv,uv);",
        "col+=(hash(gl_FragCoord.xy+fract(t))-.5)*.035;",
        "gl_FragColor=vec4(col,1.);",
        "}"
      ].join("\n");
      var sh = function (type, src) {
        var s = gl.createShader(type);
        gl.shaderSource(s, src);
        gl.compileShader(s);
        return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
      };
      var vs = sh(gl.VERTEX_SHADER, vertSrc);
      var fs = sh(gl.FRAGMENT_SHADER, fragSrc);
      if (vs && fs) {
        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
        var loc = gl.getAttribLocation(prog, "p");
        gl.enableVertexAttribArray(loc);
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        var uTime = gl.getUniformLocation(prog, "uTime");
        var uRes = gl.getUniformLocation(prog, "uRes");
        var resize = function () {
          var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
          bgCanvas.width = Math.floor(innerWidth * dpr);
          bgCanvas.height = Math.floor(innerHeight * dpr);
          gl.viewport(0, 0, bgCanvas.width, bgCanvas.height);
          gl.uniform2f(uRes, bgCanvas.width, bgCanvas.height);
        };
        resize();
        window.addEventListener("resize", resize);
        var start = performance.now();
        var drawBg = function () {
          gl.uniform1f(uTime, (performance.now() - start) / 1000);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        };
        if (reduce) { drawBg(); }
        else {
          var bgVisible = true;
          document.addEventListener("visibilitychange", function () { bgVisible = !document.hidden; });
          (function bgLoop() {
            if (bgVisible) drawBg();
            requestAnimationFrame(bgLoop);
          })();
        }
      } else {
        bgCanvas.style.background = "radial-gradient(900px 600px at 20% 20%, rgba(255,77,143,.4), transparent 60%), radial-gradient(900px 700px at 80% 30%, rgba(139,92,246,.4), transparent 60%), radial-gradient(800px 600px at 50% 90%, rgba(47,216,200,.3), transparent 60%), #120E1A";
      }
    } else {
      bgCanvas.style.background = "radial-gradient(900px 600px at 20% 20%, rgba(255,77,143,.4), transparent 60%), radial-gradient(900px 700px at 80% 30%, rgba(139,92,246,.4), transparent 60%), radial-gradient(800px 600px at 50% 90%, rgba(47,216,200,.3), transparent 60%), #120E1A";
    }
  }

  /* ---------- chrome gem (three.js, graceful fallback) ---------- */

  var gemCanvas = document.getElementById("gem");
  var gemFallback = document.querySelector(".gem-fallback");
  var showFallback = function () { if (gemFallback) gemFallback.classList.add("show"); };

  if (gemCanvas && !reduce && (window.WebGL2RenderingContext || window.WebGLRenderingContext)) {
    import("https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js").then(function (THREE) {
      var renderer = new THREE.WebGLRenderer({ canvas: gemCanvas, alpha: true, antialias: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.8));
      var scene = new THREE.Scene();
      var camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
      camera.position.z = 4.9;

      // procedural environment from a vertical gradient canvas
      var envCanvas = document.createElement("canvas");
      envCanvas.width = 64; envCanvas.height = 256;
      var ctx = envCanvas.getContext("2d");
      var g = ctx.createLinearGradient(0, 0, 0, 256);
      g.addColorStop(0, "#FF4D8F");
      g.addColorStop(0.16, "#3A1030");
      g.addColorStop(0.3, "#8B5CF6");
      g.addColorStop(0.44, "#14101F");
      g.addColorStop(0.58, "#2FD8C8");
      g.addColorStop(0.72, "#1A0F2E");
      g.addColorStop(0.86, "#FF9E4D");
      g.addColorStop(1, "#2A0F2E");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 256);
      ctx.fillStyle = "rgba(255,255,255,0.95)";
      ctx.fillRect(0, 56, 64, 10);
      ctx.fillRect(0, 148, 64, 6);
      var envTex = new THREE.CanvasTexture(envCanvas);
      envTex.mapping = THREE.EquirectangularReflectionMapping;
      envTex.colorSpace = THREE.SRGBColorSpace;
      scene.environment = envTex;

      var gem = new THREE.Mesh(
        new THREE.IcosahedronGeometry(1.15, 0),
        new THREE.MeshPhysicalMaterial({
          color: 0xEDEAE4,
          metalness: 1.0,
          roughness: 0.12,
          flatShading: true,
          envMapIntensity: 2.0,
          clearcoat: 0.6,
          clearcoatRoughness: 0.2
        })
      );
      var ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.68, 0.035, 16, 120),
        new THREE.MeshStandardMaterial({ color: 0xF4F1EA, metalness: 1, roughness: 0.3, envMapIntensity: 1.2 })
      );
      ring2.rotation.x = Math.PI / 2.4;
      ring2.rotation.y = 0.4;
      var group = new THREE.Group();
      group.add(gem);
      group.add(ring2);
      scene.add(group);

      scene.add(new THREE.AmbientLight(0xffffff, 0.35));
      var key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(3, 4, 5);
      scene.add(key);

      var size = function () {
        var w = gemCanvas.clientWidth || 480;
        var h = gemCanvas.clientHeight || 480;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
      };
      size();
      window.addEventListener("resize", size);

      var tiltX = 0, tiltY = 0;
      if (finePointer) {
        document.addEventListener("mousemove", function (e) {
          tiltY = (e.clientX / innerWidth - 0.5) * 0.5;
          tiltX = (e.clientY / innerHeight - 0.5) * 0.35;
        });
      }

      var visible = true;
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; }, { threshold: 0 }).observe(gemCanvas);
      var running = true;
      document.addEventListener("visibilitychange", function () { running = !document.hidden; });

      var clock = new THREE.Clock();
      (function loop() {
        requestAnimationFrame(loop);
        if (!running || !visible) return;
        var t = clock.getElapsedTime();
        gem.rotation.y = t * 0.35;
        gem.rotation.x = Math.sin(t * 0.4) * 0.22;
        ring2.rotation.z = t * 0.22;
        group.position.y = Math.sin(t * 0.8) * 0.12;
        group.rotation.y += (tiltY - group.rotation.y) * 0.04;
        group.rotation.x += (tiltX - group.rotation.x) * 0.04;
        renderer.render(scene, camera);
      })();
    }).catch(showFallback);
  } else {
    showFallback();
  }
})();
