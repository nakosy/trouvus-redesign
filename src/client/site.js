(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduced) {
    const enableMotion = () => {
      document.body.classList.add('motion-ready');
      ['pointermove', 'touchstart'].forEach((eventName) => window.removeEventListener(eventName, enableMotion));
    };
    ['pointermove', 'touchstart'].forEach((eventName) => window.addEventListener(eventName, enableMotion, { passive: true }));
  }

  const header = document.querySelector('[data-header]');
  const menuButton = document.querySelector('[data-menu-button]');
  const menu = document.querySelector('[data-menu]');
  if (header && menuButton && menu) {
    const close = () => {
      header.classList.remove('nav-open');
      menuButton.setAttribute('aria-expanded', 'false');
    };
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') === 'true';
      header.classList.toggle('nav-open', !open);
      menuButton.setAttribute('aria-expanded', String(!open));
    });
    menu.addEventListener('click', (event) => {
      if (event.target.closest('a')) close();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        close();
        menuButton.focus();
      }
    });
    window.matchMedia('(min-width: 921px)').addEventListener('change', close);
  }

  document.querySelectorAll('.stepper').forEach((stepper) => {
    const tabs = [...stepper.querySelectorAll('.stepper-tab')];
    const panels = [...stepper.querySelectorAll('.stepper-panel')];
    const select = (index, focus = false) => {
      tabs.forEach((tab, i) => {
        const active = i === index;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.setAttribute('tabindex', active ? '0' : '-1');
        panels[i]?.classList.toggle('active', active);
        if (panels[i]) panels[i].hidden = !active;
      });
      if (focus) tabs[index]?.focus();
    };
    stepper.querySelector('.stepper-tabs')?.setAttribute('role', 'tablist');
    tabs.forEach((tab, index) => {
      const id = `journey-tab-${index + 1}`;
      const panelId = `journey-panel-${index + 1}`;
      tab.id = id;
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', panelId);
      if (panels[index]) {
        panels[index].id = panelId;
        panels[index].setAttribute('role', 'tabpanel');
        panels[index].setAttribute('aria-labelledby', id);
      }
      tab.addEventListener('click', () => select(index));
      tab.addEventListener('keydown', (event) => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(next, true);
      });
    });
    select(0);
  });

  const filterButtons = [...document.querySelectorAll('[data-filter]')];
  if (filterButtons.length) {
    filterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        filterButtons.forEach((item) => {
          item.classList.toggle('active', item === button);
          item.setAttribute('aria-pressed', String(item === button));
        });
        const filter = button.dataset.filter;
        document.querySelectorAll('[data-tags]').forEach((card) => {
          const visible = filter === 'all' || card.dataset.tags.split(' ').includes(filter);
          card.hidden = !visible;
        });
      });
    });
  }

  const tocLinks = [...document.querySelectorAll('.toc a[href^="#"]')];
  if (tocLinks.length) {
    const headings = tocLinks.map((link) => document.querySelector(link.hash)).filter(Boolean);
    const updateToc = () => {
      let active = 0;
      headings.forEach((heading, index) => {
        if (heading.getBoundingClientRect().top <= 150) active = index;
      });
      tocLinks.forEach((link, index) => link.classList.toggle('active', index === active));
    };
    updateToc();
    document.addEventListener('scroll', updateToc, { passive: true });
  }

  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    document.querySelectorAll('.glass').forEach((card) => {
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -4;
        const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 4;
        card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }

  const canvasColors = { blue: '143,127,255', green: '79,211,154', amber: '255,184,0' };
  document.querySelectorAll('canvas.hero-canvas').forEach((canvas) => {
    const context = canvas.getContext('2d');
    if (!context || reduced) return;
    const section = canvas.parentElement;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0, height = 0, frame = 0, mouseX = -9999, mouseY = -9999, queued = false;
    const variant = canvas.dataset.variant || 'network';
    const particles = Array.from({ length: variant === 'network' ? 28 : 22 }, (_, index) => ({
      x: Math.random(), y: Math.random(), vx: (Math.random() - .5) * .00042, vy: (Math.random() - .5) * .0003,
      radius: Math.random() * 1.7 + .9, color: index % 8 === 0 ? canvasColors.amber : index % 3 === 0 ? canvasColors.green : canvasColors.blue,
    }));
    let draw = () => {};
    const paint = () => {
      queued = false;
      context.clearRect(0, 0, width, height);
      draw();
      frame += 1;
    };
    const requestDraw = () => {
      if (!queued) { queued = true; requestAnimationFrame(paint); }
    };
    const resize = () => {
      width = section.clientWidth; height = section.clientHeight;
      canvas.width = width * ratio; canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      requestDraw();
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    section.addEventListener('pointermove', (event) => {
      const rect = canvas.getBoundingClientRect(); mouseX = event.clientX - rect.left; mouseY = event.clientY - rect.top; requestDraw();
    });
    section.addEventListener('pointerleave', () => { mouseX = mouseY = -9999; requestDraw(); });

    const network = () => {
      const points = particles.map((particle) => {
        particle.x = (particle.x + particle.vx + 1) % 1; particle.y = (particle.y + particle.vy + 1) % 1;
        let x = particle.x * width, y = particle.y * height;
        const dx = x - mouseX, dy = y - mouseY, distanceSquared = dx * dx + dy * dy;
        if (distanceSquared < 18000) { const force = (18000 - distanceSquared) / 18000 * 7; const distance = Math.sqrt(distanceSquared) || 1; x += dx / distance * force; y += dy / distance * force; }
        return { x, y, ...particle };
      });
      points.forEach((point, index) => {
        for (let offset = 1; offset <= 3; offset += 1) {
          const other = points[(index + offset) % points.length];
          const dx = point.x - other.x, dy = point.y - other.y, distanceSquared = dx * dx + dy * dy;
          if (distanceSquared < 52000) { context.strokeStyle = `rgba(${canvasColors.blue},${.12 * (1 - distanceSquared / 52000)})`; context.beginPath(); context.moveTo(point.x, point.y); context.lineTo(other.x, other.y); context.stroke(); }
        }
      });
      points.forEach((point) => {
        context.fillStyle = `rgba(${point.color},.86)`; context.beginPath(); context.arc(point.x, point.y, point.radius, 0, Math.PI * 2); context.fill();
        context.fillStyle = `rgba(${point.color},.11)`; context.beginPath(); context.arc(point.x, point.y, point.radius * 3.6, 0, Math.PI * 2); context.fill();
      });
    };
    const waves = () => {
      for (let row = 0; row < 7; row++) {
        const base = height * (.18 + .11 * row), amplitude = 14 + row * 4, speed = frame * .008 + row * .9;
        const color = row % 3 === 0 ? canvasColors.green : canvasColors.blue;
        context.strokeStyle = `rgba(${color},${row % 3 === 0 ? .17 : .1})`; context.lineWidth = 1.3; context.beginPath();
        for (let x = 0; x <= width; x += 16) {
          const influence = Math.exp(-Math.pow((x - mouseX) / 220, 2)) * ((mouseY / height) - .5) * 30;
          const y = base + Math.sin(x * .008 + speed) * amplitude + Math.sin(x * .017 + speed * 1.7) * amplitude * .4 + influence;
          x === 0 ? context.moveTo(x, y) : context.lineTo(x, y);
        }
        context.stroke();
      }
    };
    const pipeline = () => {
      for (let lane = 0; lane < 4; lane++) {
        const y = height * (.22 + .18 * lane);
        context.strokeStyle = `rgba(${canvasColors.blue},.14)`; context.beginPath(); context.moveTo(0, y); context.lineTo(width, y); context.stroke();
        for (let node = 0; node < 5; node++) { const x = width * (node + .5) / 5; context.fillStyle = `rgba(${canvasColors.blue},.28)`; context.beginPath(); context.arc(x, y, 3.2, 0, Math.PI * 2); context.fill(); }
        const x = ((frame * (.9 + lane * .25)) % 160) / 160 * width;
        const color = lane % 3 === 0 ? canvasColors.green : lane % 3 === 1 ? canvasColors.blue : canvasColors.amber;
        const gradient = context.createRadialGradient(x, y, 0, x, y, 26); gradient.addColorStop(0, `rgba(${color},.8)`); gradient.addColorStop(1, `rgba(${color},0)`);
        context.fillStyle = gradient; context.beginPath(); context.arc(x, y, 26, 0, Math.PI * 2); context.fill();
        context.fillStyle = '#fff'; context.beginPath(); context.arc(x, y, 2.3, 0, Math.PI * 2); context.fill();
      }
    };
    draw = variant === 'waves' ? waves : variant === 'pipeline' ? pipeline : network;
    requestDraw();
  });

  const contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    const interest = new URLSearchParams(window.location.search).get('interest');
    const interestMap = {
      diagnostic: 'Executive AI Value Diagnostic',
      briefing: 'AI strategy and roadmap',
      education: 'Executive education',
      speaking: 'Other',
    };
    const challengeSelect = contactForm.querySelector('[name="challenge"]');
    if (interest && interestMap[interest] && challengeSelect) challengeSelect.value = interestMap[interest];
    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const status = contactForm.querySelector('[data-form-status]');
      if (!contactForm.reportValidity()) return;
      const data = new FormData(contactForm);
      const subject = encodeURIComponent(`Trouvus Executive AI Value Diagnostic request — ${data.get('organization') || `${data.get('first_name')} ${data.get('last_name')}`}`);
      const body = encodeURIComponent([
        `Name: ${data.get('first_name')} ${data.get('last_name')}`,
        `Work email: ${data.get('email')}`,
        `Organization: ${data.get('organization') || 'Not provided'}`,
        `Role: ${data.get('role') || 'Not provided'}`,
        `Challenge: ${data.get('challenge')}`,
        '',
        String(data.get('message') || ''),
      ].join('\n'));
      status.textContent = 'Opening your email application with a prepared diagnostic request…';
      status.className = 'form-status success';
      window.location.href = `mailto:info@trouvus.com?subject=${subject}&body=${body}`;
    });
  }
})();
