'use strict';

const spaceCanvas = document.querySelector('[data-space-canvas]');

if (spaceCanvas) {
  const spaceContext = spaceCanvas.getContext('2d');
  const purple = { red: 194, green: 166, blue: 255 };
  const stars = [];
  let spaceWidth = 0;
  let spaceHeight = 0;
  let pixelRatio = 1;

  const resizeSpace = () => {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    spaceWidth = window.innerWidth;
    spaceHeight = window.innerHeight;
    spaceCanvas.width = Math.floor(spaceWidth * pixelRatio);
    spaceCanvas.height = Math.floor(spaceHeight * pixelRatio);
    spaceContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const starCount = Math.min(150, Math.max(70, Math.floor((spaceWidth * spaceHeight) / 11000)));
    stars.length = 0;
    for (let index = 0; index < starCount; index += 1) {
      stars.push({
        x: Math.random() * spaceWidth,
        y: Math.random() * spaceHeight,
        radius: Math.random() * 1.6 + .35,
        alpha: Math.random() * .55 + .25,
        drift: (Math.random() - .5) * .08,
        twinkle: Math.random() * Math.PI * 2,
      });
    }
  };

  // Draw the wallpaper only on load/resize, not continuously behind glass panels.
  const drawSpace = () => {
    spaceContext.clearRect(0, 0, spaceWidth, spaceHeight);

    const glow = spaceContext.createRadialGradient(
      spaceWidth * .52, spaceHeight * .35, 0,
      spaceWidth * .52, spaceHeight * .35, Math.max(spaceWidth, spaceHeight) * .72,
    );
    glow.addColorStop(0, 'rgba(92, 48, 150, .16)');
    glow.addColorStop(.5, 'rgba(28, 12, 54, .08)');
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    spaceContext.fillStyle = glow;
    spaceContext.fillRect(0, 0, spaceWidth, spaceHeight);

    stars.forEach((star, index) => {
      const pulse = star.alpha;
      spaceContext.beginPath();
      spaceContext.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      spaceContext.fillStyle = `rgba(${purple.red}, ${purple.green}, ${purple.blue}, ${Math.max(.08, pulse)})`;
      spaceContext.fill();

      for (let next = index + 1; next < stars.length; next += 1) {
        const other = stars[next];
        const distance = Math.hypot(star.x - other.x, star.y - other.y);
        if (distance < 115) {
          spaceContext.strokeStyle = `rgba(${purple.red}, ${purple.green}, ${purple.blue}, ${(.12 * (1 - distance / 115)).toFixed(3)})`;
          spaceContext.lineWidth = .5;
          spaceContext.beginPath();
          spaceContext.moveTo(star.x, star.y);
          spaceContext.lineTo(other.x, other.y);
          spaceContext.stroke();
        }
      }
    });

  };

  resizeSpace();
  drawSpace();
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      resizeSpace();
      drawSpace();
    }, 150);
  }, { passive: true });
}

const toggle = (element) => element?.classList.toggle('active');

const sidebar = document.querySelector('[data-sidebar]');
document.querySelector('[data-sidebar-btn]')?.addEventListener('click', () => toggle(sidebar));

const terminalToggle = document.querySelector('[data-terminal-toggle]');
const cliPanel = document.getElementById('portfolio-terminal');
const setCliExpanded = (expanded) => {
  document.body.classList.toggle('cli-open', expanded);
  if (cliPanel) cliPanel.hidden = !expanded;
  if (terminalToggle) {
    terminalToggle.setAttribute('aria-expanded', String(expanded));
    const label = expanded ? 'Hide CLI' : 'Show CLI';
    terminalToggle.setAttribute('aria-label', label);
    terminalToggle.title = label;
  }
};
setCliExpanded(false);
terminalToggle?.addEventListener('click', () => {
  setCliExpanded(!document.body.classList.contains('cli-open'));
});

const themeToggle = document.querySelector('[data-theme-toggle]');
const initialTheme = document.documentElement.dataset.theme ||
  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

const setTheme = (theme) => {
  const isDark = theme === 'dark';
  document.body.dataset.theme = theme;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  if (themeToggle) {
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.title = isDark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.querySelector('span').textContent = isDark ? 'Light' : 'Dark';
    themeToggle.querySelector('ion-icon').setAttribute('name', isDark ? 'sunny-outline' : 'moon-outline');
  }
};

setTheme(initialTheme);
themeToggle?.addEventListener('click', () => {
  const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  try { window.localStorage.setItem('portfolio-theme', nextTheme); } catch {}
  setTheme(nextTheme);
});

const filterItems = document.querySelectorAll('[data-filter-item]');
const filterSelect = document.querySelector('[data-select]');
const filterValue = document.querySelector('[data-selecct-value]');
const filterButtons = document.querySelectorAll('[data-filter-btn]');

const filterProjects = (category) => {
  filterItems.forEach((item) => {
    item.classList.toggle('active', category === 'all' || item.dataset.category === category);
  });
};

const selectCategory = (button) => {
  const category = button.textContent.trim().toLowerCase();
  if (filterValue) filterValue.textContent = button.textContent;
  filterProjects(category);
};

filterSelect?.addEventListener('click', () => toggle(filterSelect));
document.querySelectorAll('[data-select-item]').forEach((item) => {
  item.addEventListener('click', () => {
    selectCategory(item);
    toggle(filterSelect);
  });
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    selectCategory(button);
    filterButtons.forEach((filterButton) => filterButton.classList.toggle('active', filterButton === button));
  });
});

const projectGallery = document.querySelector('[data-project-gallery]');

// Keep the experience timeline in the same order as the PDF resume.
const experienceList = [...document.querySelectorAll('.resume .timeline')]
  .find((section) => section.querySelector('h3')?.textContent.trim() === 'Experience')
  ?.querySelector('.timeline-list');
if (experienceList) {
  const experienceOrder = [
    'SDSU Cyber Defense Team',
    'SDSU Infrastructure Lab',
    'Regional Collegiate Penetration Testing Competition',
    'San Diego Yacht Club',
    'Homelab',
  ];
  [...experienceList.querySelectorAll('.timeline-item')]
    .sort((first, second) => experienceOrder.indexOf(first.querySelector('.timeline-item-title')?.textContent.trim())
      - experienceOrder.indexOf(second.querySelector('.timeline-item-title')?.textContent.trim()))
    .forEach((item) => experienceList.append(item));
}

const resumeTrack = document.querySelector('.resume-track');
if (resumeTrack) {
  const desktopResume = window.matchMedia('(min-width: 768px)');
  resumeTrack.querySelectorAll('.timeline-list').forEach((list) => {
    const heading = list.closest('.timeline')?.querySelector('h3')?.textContent.trim();
    list.tabIndex = 0;
    list.setAttribute('aria-label', `${heading || 'Resume section'} details`);
  });

  resumeTrack.addEventListener('keydown', (event) => {
    if (event.target !== resumeTrack || !desktopResume.matches || resumeTrack.scrollWidth <= resumeTrack.clientWidth + 1) return;
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const distance = Math.max(240, resumeTrack.clientWidth * .82);
    if (event.key === 'Home') resumeTrack.scrollTo({ left: 0, behavior: 'smooth' });
    else if (event.key === 'End') resumeTrack.scrollTo({ left: resumeTrack.scrollWidth, behavior: 'smooth' });
    else resumeTrack.scrollBy({ left: event.key === 'ArrowRight' ? distance : -distance, behavior: 'smooth' });
  });

  resumeTrack.addEventListener('wheel', (event) => {
    if (!desktopResume.matches || resumeTrack.scrollWidth <= resumeTrack.clientWidth + 1) return;
    // Let the long Experience panel scroll vertically when the pointer is over its list.
    const list = event.target.closest('.timeline-list');
    if (list && list.scrollHeight > list.clientHeight + 1) return;
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX) || event.ctrlKey) return;
    event.preventDefault();
    resumeTrack.scrollBy({ left: event.deltaY, behavior: 'auto' });
  }, { passive: false });
}

if (projectGallery) {
  const list = projectGallery.querySelector('[data-project-list]');
  const cards = [...list.querySelectorAll('.project-item')]
    .sort((first, second) => Number(first.dataset.order) - Number(second.dataset.order));
  const previous = projectGallery.querySelector('[data-project-previous]');
  const next = projectGallery.querySelector('[data-project-next]');
  const position = projectGallery.querySelector('[data-project-position]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const mouseNavigation = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)');
  let currentCard = cards[0];
  let requestedCard = null;
  let settleTimer;
  let wheelTimer;
  let wheelGesture = false;
  let wheelDistance = 0;
  let animationFrame = null;
  let scrollFrame;
  let previousWidth = 0;

  projectGallery.querySelector('[data-project-navigation]').hidden = false;

  const visibleCards = () => cards.filter((card) => card.classList.contains('active'));
  const cardLeft = (card) => {
    const padding = parseFloat(getComputedStyle(list).paddingLeft) || 0;
    const left = card.getBoundingClientRect().left - list.getBoundingClientRect().left + list.scrollLeft - padding;
    return Math.max(0, Math.min(left, list.scrollWidth - list.clientWidth));
  };

  const updateNavigation = (card) => {
    if (!card) return;
    const available = visibleCards();
    const index = available.indexOf(card);
    previous.disabled = index <= 0;
    next.disabled = index === available.length - 1;
    const label = `${index + 1} / ${available.length}`;
    if (position.textContent !== label) position.textContent = label;
  };

  const selectCard = (card) => {
    if (!card) return;
    currentCard = card;
    cards.forEach((item) => item.classList.toggle('is-current', item === card));
    updateNavigation(card);
  };

  const nearestCard = () => visibleCards().reduce((nearest, card) => (
    !nearest || Math.abs(cardLeft(card) - list.scrollLeft) < Math.abs(cardLeft(nearest) - list.scrollLeft)
      ? card : nearest
  ), null);

  const settle = () => {
    clearTimeout(settleTimer);
    if (!list.clientWidth || requestedCard) return;
    const card = nearestCard();
    if (!card) return;
    selectCard(card);
  };

  const cancelNavigation = (resumeSnap = true) => {
    cancelAnimationFrame(animationFrame);
    cancelAnimationFrame(scrollFrame);
    animationFrame = null;
    requestedCard = null;
    if (resumeSnap) list.classList.remove('is-navigating');
    clearTimeout(settleTimer);
  };

  const goToCard = (card) => {
    if (!card || !list.clientWidth) return;
    // Retarget without briefly re-enabling snap in the middle of an existing slide.
    cancelNavigation(false);
    list.classList.add('is-navigating');
    const start = list.scrollLeft;
    const destination = cardLeft(card);
    const distance = destination - start;
    requestedCard = card;
    updateNavigation(card);

    const finish = () => {
      list.scrollLeft = destination;
      animationFrame = null;
      requestedCard = null;
      list.classList.remove('is-navigating');
      selectCard(card);
    };

    if (reducedMotion.matches || Math.abs(distance) < 1) {
      finish();
      return;
    }

    // One animation owns the scroll position; native snap resumes at the destination.
    const duration = Math.min(520, 360 + Math.abs(distance) * .06);
    let startedAt;
    const animate = (time) => {
      if (startedAt === undefined) startedAt = time;
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      list.scrollLeft = start + distance * eased;
      if (progress < 1) animationFrame = requestAnimationFrame(animate);
      else finish();
    };
    animationFrame = requestAnimationFrame(animate);
  };

  const move = (direction) => {
    const available = visibleCards();
    const index = available.indexOf(requestedCard || currentCard);
    goToCard(available[Math.max(0, Math.min(index + direction, available.length - 1))]);
  };

  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  list.addEventListener('keydown', (event) => {
    if (event.target !== list || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Home') goToCard(visibleCards()[0]);
    else if (event.key === 'End') goToCard(visibleCards().at(-1));
    else move(event.key === 'ArrowRight' ? 1 : -1);
  });

  list.addEventListener('wheel', (event) => {
    // A horizontal trackpad gesture stays native and can interrupt an arrow slide.
    if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
      if (event.deltaX) cancelNavigation();
      return;
    }
    // Touch devices keep vertical scrolling for reading taller project cards.
    if (!mouseNavigation.matches || event.ctrlKey || !event.deltaY) return;
    const direction = Math.sign(event.deltaY);
    const available = visibleCards();
    const index = available.indexOf(requestedCard || currentCard);
    if (!wheelGesture && (index + direction < 0 || index + direction >= available.length)) return;
    if (!wheelGesture) {
      // Finish reading the current card before the next wheel gesture changes it.
      const bounds = currentCard.getBoundingClientRect();
      if (direction > 0 && bounds.bottom > window.innerHeight - 16) return;
      if (direction < 0 && bounds.top < 16) return;
    }
    event.preventDefault();
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      wheelGesture = false;
      wheelDistance = 0;
    }, 240);
    if (wheelGesture) return;
    if (Math.sign(wheelDistance) !== direction) wheelDistance = 0;
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? list.clientHeight : 1;
    wheelDistance += event.deltaY * unit;
    if (Math.abs(wheelDistance) < 40) return;
    wheelGesture = true;
    move(direction);
  }, { passive: false });

  list.addEventListener('pointerdown', () => {
    cancelNavigation();
    selectCard(nearestCard());
  }, { passive: true });
  list.addEventListener('scroll', () => {
    if (requestedCard) return;
    cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(() => selectCard(nearestCard()));
    clearTimeout(settleTimer);
    settleTimer = setTimeout(settle, 160);
  }, { passive: true });
  list.addEventListener('scrollend', settle);

  const refreshLayout = () => {
    if (!list.clientWidth) return;
    const selected = requestedCard || currentCard;
    cancelNavigation();
    const available = visibleCards();
    currentCard = available.includes(selected) ? selected : available[0];
    selectCard(currentCard);
    if (currentCard) list.scrollLeft = cardLeft(currentCard);
    previousWidth = list.clientWidth;
  };

  const resizeObserver = new ResizeObserver(() => {
    if (list.clientWidth !== previousWidth) refreshLayout();
  });
  resizeObserver.observe(list);
  new MutationObserver(() => {
    if (projectGallery.closest('article').classList.contains('active')) requestAnimationFrame(refreshLayout);
  }).observe(projectGallery.closest('article'), { attributes: true, attributeFilter: ['class'] });
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && requestedCard) goToCard(requestedCard);
  });
  document.fonts?.ready.then(refreshLayout);
  refreshLayout();
}

const form = document.querySelector('[data-form]');
const formButton = document.querySelector('[data-form-btn]');
form?.addEventListener('input', () => {
  if (formButton) formButton.disabled = !form.checkValidity();
});

form?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const formData = new FormData(form);
  const subject = `Portfolio contact from ${formData.get('fullname')}`;
  const body = [
    `Name: ${formData.get('fullname')}`,
    `Email: ${formData.get('email')}`,
    '',
    formData.get('message'),
  ].join('\n');
  const mailtoUrl = `mailto:james.clarke.mail@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const status = document.querySelector('[data-form-status]');
  if (status) status.textContent = 'Your default mail app should open with your message ready. Review it, then send.';
  // mailto: is handled by the operating system/browser's preferred mail client.
  window.location.assign(mailtoUrl);
});

const mapBox = document.querySelector('[data-mapbox]');
let mapState = 'idle';
let mapAttempt = 0;
const loadContactMap = () => {
  if (!mapBox || mapState === 'loading' || mapState === 'loaded') return;
  const attempt = ++mapAttempt;
  const oldFrame = mapBox.querySelector('iframe');
  const frame = oldFrame.cloneNode(false);
  const status = mapBox.querySelector('[data-map-status]');
  const message = mapBox.querySelector('[data-map-message]');
  const retry = mapBox.querySelector('[data-map-retry]');
  mapState = 'loading';
  mapBox.classList.remove('map-loaded');
  status.hidden = false;
  retry.hidden = true;
  message.textContent = 'Loading map…';
  // A new frame per attempt prevents stale requests from completing a retry.
  const timeout = setTimeout(() => {
    if (attempt !== mapAttempt || mapState !== 'loading') return;
    mapState = 'slow';
    message.textContent = 'Google Maps is still loading. You can keep waiting or retry.';
    retry.hidden = false;
  }, 10000);
  frame.addEventListener('load', () => {
    if (attempt !== mapAttempt || !['loading', 'slow'].includes(mapState) || !frame.hasAttribute('src')) return;
    clearTimeout(timeout);
    mapState = 'loaded';
    status.hidden = true;
    mapBox.classList.add('map-loaded');
  }, { once: true });
  frame.src = frame.dataset.mapSrc;
  oldFrame.replaceWith(frame);
};
document.querySelector('[data-map-retry]')?.addEventListener('click', loadContactMap);

const pages = document.querySelectorAll('[data-page]');
document.querySelectorAll('[data-nav-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const page = link.textContent.trim().toLowerCase();
    document.body.classList.toggle('about-page', page === 'about');
    pages.forEach((section) => section.classList.toggle('active', section.dataset.page === page));
    // Start only after the contact panel has a visible layout.
    if (page === 'contact' && mapState === 'idle') requestAnimationFrame(loadContactMap);
    document.querySelectorAll('[data-nav-link]').forEach((navLink) => {
      navLink.classList.toggle('active', navLink.textContent.trim().toLowerCase() === page);
    });
    history.replaceState(null, '', `${window.location.pathname}#${page}`);
    window.scrollTo(0, 0);
  });
});

const initialPage = window.location.hash.slice(1);
if (window.location.search) {
  history.replaceState(null, '', `${window.location.pathname}${window.location.hash}`);
}

if ([...pages].some((page) => page.dataset.page === initialPage)) {
  document.body.classList.toggle('about-page', initialPage === 'about');
  [...document.querySelectorAll('[data-nav-link]')]
    .find((link) => link.textContent.trim().toLowerCase() === initialPage)
    ?.click();
  document.querySelectorAll('[data-nav-link]').forEach((link) => {
    const isActive = link.textContent.trim().toLowerCase() === initialPage;
    link.classList.toggle('active', isActive);
  });
  pages.forEach((page) => page.classList.toggle('active', page.dataset.page === initialPage));
}

const terminalForm = document.querySelector('[data-terminal-form]');
const terminalInput = document.querySelector('[data-terminal-input]');
const terminalOutput = document.querySelector('[data-terminal-output]');
const terminalPrompt = document.querySelector('[data-terminal-prompt]');
const terminalHistory = [];
const terminalCommandNames = ['help', 'whoami', 'pwd', 'hostname', 'date', 'uname', 'history', 'which', 'ls', 'tree', 'cd', 'cat', 'head', 'tail', 'less', 'more', 'wc', 'file', 'echo', 'projects', 'resume', 'contact', 'nextpage', 'previouspage', 'prevpage', 'clear'];
let historyIndex = 0;
let lastTabValue = '';
let currentDirectory = [];

const terminalFileSystem = {
  type: 'directory',
  children: {
    'about.txt': {
      type: 'file',
      content: 'James Clarke\nDeputy System Administrator with the SDSU Cyber Defense Team.\nGoogle Cybersecurity Professional Certificate.\nAspiring Incident Response Analyst.',
    },
    projects: {
      type: 'directory',
      name: 'projects',
      children: {
        'linux-homelab-infrastructure': {
          type: 'directory',
          name: 'Linux Homelab Infrastructure',
          children: {
            'README.md': {
              type: 'file',
              content: [
                '# Linux Homelab Infrastructure',
                '',
                'Built a Debian-based Proxmox homelab on Apple T2 hardware for systems administration, networking, and security experimentation.',
                '',
                '## Services & Access',
                'An Ubuntu VM hosts Samba file sharing. A 20-year-old Acer Aspire running Puppy Linux provides WireGuard VPN access.',
                '',
                '## Virtualization & Resource Pools',
                'Dedicated Proxmox resource pools organize core infrastructure, networking, security tooling, monitoring, and disposable testing systems.',
                '',
                '## Security & Operations',
                'Uses iptables firewall rules and CLI troubleshooting. Designed for security monitoring, detection engineering, incident response, and vulnerability management, with telemetry across the lab.',
                '',
                '## Automation & Delivery',
                'Designed for Infrastructure as Code, configuration management, CI/CD, GitOps, and security automation across the environment.',
                '',
                '## Testing & Validation',
                'Isolated VMs support technical writeups and a repeatable workflow: investigate incidents, apply remediation, repeat attacks, and validate detection and mitigation.',
                '',
                '## Design Goals',
                'Systems administration · Network engineering · Network security · Container security · Cloud-native infrastructure',
                '',
                '## Technology',
                'Debian · Proxmox · Apple T2 hardware · Ubuntu · Samba · Puppy Linux · WireGuard · iptables · Docker · Kubernetes · Ansible · Proxmox resource pools · Virtual machines',
              ].join('\n'),
            },
          },
        },
        'sdsu-infrastructure-lab': {
          type: 'directory',
          name: 'SDSU Infrastructure Lab',
          children: {
            'README.md': {
              type: 'file',
              content: [
                '# SDSU Infrastructure Lab',
                '',
                'System Administrator · January 2026 — May 2026',
                '',
                'Built a multi-OS lab with DNS, LDAP, PKI, SMTP/IMAP, NFS, nginx/Docker, and centralized logging.',
                '',
                'Configured UNIX/Linux servers for authentication, mail, file sharing, web hosting, containers, and remote access.',
                '',
                'Deployed a multi-node Kubernetes cluster with fault-tolerant web services and automated failover.',
              ].join('\n'),
            },
          },
        },
        'sdyc-employee-security-systems': {
          type: 'directory',
          name: 'San Diego Yacht Club Employee Security Systems',
          children: {
            'README.md': {
              type: 'file',
              content: [
                '# San Diego Yacht Club Employee Security Systems',
                '',
                'September 2026 — December 2026',
                '',
                'Conducting a cybersecurity risk assessment of staff technology practices, systems, workflows, training, and security controls.',
                '',
                'Evaluating confidentiality, integrity, availability, access controls, and least-privilege practices.',
                '',
                'Collaborating with a team to document observations and recommend improvements to the organization\'s security posture.',
              ].join('\n'),
            },
          },
        },
      },
    },
    'resume.pdf': {
      type: 'file',
      content: 'This is a PDF document. Use `open resume.pdf` to view or download it.',
      href: './Resume.pdf',
    },
    contact: {
      type: 'directory',
      name: 'contact',
      children: {
        'email.txt': {
          type: 'file',
          content: 'james.clarke.mail@icloud.com',
          href: 'mailto:james.clarke.mail@icloud.com',
        },
        'linkedin.url': {
          type: 'file',
          content: 'https://www.linkedin.com/in/james-clarke-673750353/',
          href: 'https://www.linkedin.com/in/james-clarke-673750353/',
        },
      },
    },
  },
};

const writeTerminalLine = (text, className = '') => {
  if (!terminalOutput) return;
  const line = document.createElement('p');
  line.className = `terminal-line ${className}`.trim();
  line.textContent = text;
  terminalOutput.append(line);
  while (terminalOutput.children.length > 8) terminalOutput.firstElementChild?.remove();
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
};

const terminalCommands = {
  help: 'Commands: echo, pwd, ls, cd, cat, head, tail, less, more, wc, file, tree, history, date, uname, hostname, which, whoami, clear\nNavigation: projects, resume, contact, nextpage, previouspage\nTry: cd projects/Linux Homelab Infrastructure, then ls and cat README.md.',
  whoami: 'James Clarke — Deputy System Administrator with SDSU Cyber Defense Team.',
  hostname: 'james-portfolio',
  uname: 'PortfolioOS (simulated terminal)',
  'uname -a': 'PortfolioOS james-portfolio browser x86_64 simulated',
  projects: 'Opening the Projects page...',
  resume: 'Opening the Resume page...',
  contact: 'Opening the Contact page...',
  nextpage: 'Opening the next page...',
  previouspage: 'Opening the previous page...',
  prevpage: 'Opening the previous page...',
};

const updateTerminalPrompt = () => {
  const path = currentDirectory.map((_, index) => terminalPathName(currentDirectory.slice(0, index + 1))).join('/');
  if (terminalPrompt) terminalPrompt.textContent = `portfolio: ${path ? `~/${path}` : '~'} james$`;
};

const terminalNavigate = (page) => {
  const link = [...document.querySelectorAll('[data-nav-link]')]
    .find((navLink) => navLink.textContent.trim().toLowerCase() === page);
  link?.click();
};

const terminalNavigateRelative = (direction) => {
  const pageNames = [...pages].map((page) => page.dataset.page);
  const activeIndex = pageNames.findIndex((page) => document.querySelector(`[data-page="${page}"]`)?.classList.contains('active'));
  if (activeIndex < 0) return;
  const nextIndex = (activeIndex + direction + pageNames.length) % pageNames.length;
  terminalNavigate(pageNames[nextIndex]);
};

const terminalPathName = (path) => {
  let node = terminalFileSystem;
  for (const segment of path) {
    node = node.children?.[segment];
    if (!node) return path.at(-1);
  }
  return node.name ?? path.at(-1);
};

const terminalParseArgs = (input) => {
  const args = [];
  const pattern = /"((?:\\.|[^"])*)"|'((?:\\.|[^'])*)'|(\S+)/g;
  for (const match of input.matchAll(pattern)) {
    args.push((match[1] ?? match[2] ?? match[3]).replace(/\\(["'\\])/g, '$1'));
  }
  return args;
};

const terminalResolvePath = (input, basePath = currentDirectory) => {
  if (!input || input === '~' || input === '/') return { node: terminalFileSystem, path: [] };

  const absolute = input.startsWith('/') || input.startsWith('~');
  const path = absolute ? [] : [...basePath];
  const segments = input.replace(/^~\/?/, '').split('/').filter(Boolean);

  for (const [index, segment] of segments.entries()) {
    if (segment === '.') continue;
    if (segment === '..') {
      path.pop();
      continue;
    }

    let parent = terminalFileSystem;
    for (const key of path) parent = parent.children[key];
    const matchingKey = Object.keys(parent.children ?? {}).find((key) => {
      const entry = parent.children[key];
      return key.toLowerCase() === segment.toLowerCase()
        || (entry.name ?? key).toLowerCase() === segment.toLowerCase();
    });
    if (!matchingKey) return null;
    path.push(matchingKey);
    let node = terminalFileSystem;
    for (const key of path) node = node.children[key];
    if (node.type !== 'directory' && index < segments.length - 1) return null;
  }

  let node = terminalFileSystem;
  for (const key of path) node = node.children[key];
  return { node, path };
};

const terminalSetDirectory = (path) => {
  const resolved = terminalResolvePath(path);
  if (!resolved || resolved.node.type !== 'directory') return false;
  currentDirectory = resolved.path;
  updateTerminalPrompt();
  return true;
};

const terminalListDirectory = (node, path) => {
  if (node.type !== 'directory') return terminalPathName(path);
  const entries = Object.entries(node.children ?? {}).map(([key, entry]) => {
    const name = entry.name ?? key;
    return entry.type === 'directory' ? `${name}/` : name;
  });
  return entries.length ? entries.join('  ') : '(empty directory)';
};

const terminalCompletePath = (input, directoryOnly) => {
  const lastSlash = input.lastIndexOf('/');
  const parentPath = lastSlash >= 0 ? input.slice(0, lastSlash) : '';
  const partial = lastSlash >= 0 ? input.slice(lastSlash + 1) : input;
  const resolvedParent = terminalResolvePath(parentPath || '.');
  if (!resolvedParent || resolvedParent.node.type !== 'directory') return [];
  const matches = Object.entries(resolvedParent.node.children ?? {})
    .filter(([key, entry]) => {
      if (directoryOnly && entry.type !== 'directory') return false;
      const name = entry.name ?? key;
      return key.toLowerCase().startsWith(partial.toLowerCase())
        || name.toLowerCase().startsWith(partial.toLowerCase());
    })
    .map(([key, entry]) => `${key}${entry.type === 'directory' ? '/' : ''}`);
  if (!input && directoryOnly) matches.push('..', '~');
  return matches;
};

const terminalReadFile = (path, commandName) => {
  const resolved = terminalResolvePath(path);
  if (!resolved) return { error: `${commandName}: ${path}: no such file or directory` };
  if (resolved.node.type === 'directory') return { error: `${commandName}: ${path}: is a directory` };
  return { content: resolved.node.content ?? '' };
};

const terminalTreeLines = (node, prefix = '') => {
  if (node.type !== 'directory') return [];
  const entries = Object.entries(node.children ?? {});
  return entries.flatMap(([key, entry], index) => {
    const last = index === entries.length - 1;
    const name = entry.name ?? key;
    const lines = [`${prefix}${last ? '└── ' : '├── '}${entry.type === 'directory' ? `${name}/` : name}`];
    if (entry.type === 'directory') {
      lines.push(...terminalTreeLines(entry, `${prefix}${last ? '    ' : '│   '}`));
    }
    return lines;
  });
};

const terminalOpenFile = (node, path) => {
  if (node.type === 'directory') {
    currentDirectory = path;
    updateTerminalPrompt();
    return `Opened ${path.map((_, index) => terminalPathName(path.slice(0, index + 1))).join('/') || '~'}/`;
  }
  if (!node.href) return node.content;
  window.open(node.href, '_blank', 'noopener,noreferrer');
  return `Opening ${path.at(-1)}...`;
};

terminalForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!terminalInput) return;

  const command = terminalInput.value.trim();
  if (!command) return;
  writeTerminalLine(command, 'command');
  terminalInput.value = '';
  terminalHistory.push(command);
  historyIndex = terminalHistory.length;

  const [commandName, ...args] = terminalParseArgs(command);
  const normalizedCommand = commandName.toLowerCase();
  if (normalizedCommand === 'clear' && args.length === 0) {
    terminalOutput?.replaceChildren();
    return;
  }

  let response;
  if (normalizedCommand === 'pwd' && args.length === 0) {
    response = `~${currentDirectory.map((_, index) => terminalPathName(currentDirectory.slice(0, index + 1))).reduce((path, name) => `${path}/${name}`, '')}`;
  } else if (normalizedCommand === 'ls') {
    const path = args.join(' ') || '.';
    const resolved = terminalResolvePath(path);
    response = resolved ? terminalListDirectory(resolved.node, resolved.path) : `ls: no such path: ${path}`;
  } else if (normalizedCommand === 'echo') {
    response = args.join(' ');
  } else if (normalizedCommand === 'date' && args.length === 0) {
    response = new Date().toString();
  } else if (normalizedCommand === 'uname' && (args.length === 0 || args.length === 1 && args[0] === '-a')) {
    response = terminalCommands[args.length ? 'uname -a' : 'uname'];
  } else if (normalizedCommand === 'history' && args.length === 0) {
    const firstVisibleEntry = Math.max(0, terminalHistory.length - 8);
    response = terminalHistory.slice(firstVisibleEntry)
      .map((entry, index) => `${firstVisibleEntry + index + 1}  ${entry}`)
      .join('\n');
  } else if (normalizedCommand === 'which' && args.length === 1) {
    response = terminalCommandNames.includes(args[0]) ? `/usr/bin/${args[0]}` : `which: no ${args[0]} in simulated PATH`;
  } else if (normalizedCommand === 'tree' && args.length <= 1) {
    const path = args[0] ?? '.';
    const resolved = terminalResolvePath(path);
    response = !resolved
      ? `tree: ${path}: no such directory`
      : resolved.node.type !== 'directory'
        ? `tree: ${path}: not a directory`
        : [path === '.' ? '.' : path, ...terminalTreeLines(resolved.node)].join('\n');
  } else if (['cat', 'head', 'tail', 'less', 'more', 'wc', 'file'].includes(normalizedCommand)) {
    const countOption = ['head', 'tail'].includes(normalizedCommand) && args[0] === '-n';
    const count = countOption ? Number(args[1]) : 10;
    const path = countOption ? args[2] : args[0];
    if ((normalizedCommand === 'head' || normalizedCommand === 'tail') && (!Number.isInteger(count) || count < 0)) {
      response = `${normalizedCommand}: invalid line count`;
    } else if (!path || (countOption ? args.length !== 3 : args.length !== 1)) {
      response = `${normalizedCommand}: expected ${normalizedCommand === 'head' || normalizedCommand === 'tail' ? '[-n count] ' : ''}<file>`;
    } else {
      const result = terminalReadFile(path, normalizedCommand);
      if (result.error) response = result.error;
      else if (normalizedCommand === 'file') {
        const fileType = path.toLowerCase().endsWith('.pdf') ? 'PDF document' : 'ASCII text';
        response = `${path}: ${fileType}`;
      }
      else if (normalizedCommand === 'wc') {
        const lines = result.content ? result.content.split('\n').length : 0;
        const words = result.content.trim() ? result.content.trim().split(/\s+/).length : 0;
        response = `${lines} ${words} ${new TextEncoder().encode(result.content).length} ${path}`;
      } else if (normalizedCommand === 'head' || normalizedCommand === 'tail') {
        const lines = result.content.split('\n');
        response = (normalizedCommand === 'head' ? lines.slice(0, count) : lines.slice(-count || lines.length)).join('\n');
      } else {
        response = result.content;
      }
    }
  } else if (normalizedCommand === 'cd') {
    const path = args.join(' ') || '~';
    response = terminalSetDirectory(path) ? '' : `cd: no such directory: ${path}`;
  } else if (['cat', 'open'].includes(normalizedCommand) && args.length > 0) {
    const path = args.join(' ');
    const resolved = terminalResolvePath(path);
    if (!resolved) response = `${normalizedCommand}: no such file or directory: ${path}`;
    else if (normalizedCommand === 'cat' && resolved.node.type === 'directory') response = `cat: ${path}: is a directory`;
    else response = normalizedCommand === 'cat'
      ? resolved.node.content ?? `${path}: no readable content`
      : terminalOpenFile(resolved.node, resolved.path);
  } else if (args.length === 0 && Object.prototype.hasOwnProperty.call(terminalCommands, normalizedCommand)) {
    response = terminalCommands[normalizedCommand];
  }

  if (response || normalizedCommand === 'echo') writeTerminalLine(response ?? '');
  else if (response === undefined) writeTerminalLine(`command not found or invalid arguments: ${command}. Type 'help' to see available commands.`);
  if (['projects', 'resume', 'contact'].includes(normalizedCommand)) {
    terminalNavigate(normalizedCommand === 'projects' ? 'portfolio' : normalizedCommand);
  } else if (normalizedCommand === 'nextpage' && args.length === 0) {
    terminalNavigateRelative(1);
  } else if (['previouspage', 'prevpage'].includes(normalizedCommand) && args.length === 0) {
    terminalNavigateRelative(-1);
  }
});

terminalInput?.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    event.preventDefault();
    const value = terminalInput.value;
    const cursor = terminalInput.selectionStart;
    if (cursor !== value.length) return;

    const separatorIndex = value.search(/\s/);
    const isCompletingArgument = separatorIndex >= 0;
    const command = isCompletingArgument ? value.slice(0, separatorIndex) : '';
    const argumentStart = isCompletingArgument ? separatorIndex + 1 : 0;
    const slashIndex = value.lastIndexOf('/');
    const tokenStart = isCompletingArgument
      ? Math.max(argumentStart, slashIndex + 1)
      : 0;
    const token = value.slice(tokenStart).replace(/\/$/, '');
    const candidates = isCompletingArgument
        ? ['cd', 'cat', 'head', 'tail', 'less', 'more', 'wc', 'file', 'open', 'tree', 'ls'].includes(command.toLowerCase())
        ? terminalCompletePath(value.slice(argumentStart, slashIndex >= argumentStart ? slashIndex + 1 : value.length), command.toLowerCase() === 'cd')
        : []
      : terminalCommandNames;
    const matches = candidates.filter((candidate) => candidate.toLowerCase().startsWith(token.toLowerCase()));

    if (matches.length === 1) {
      terminalInput.value = `${value.slice(0, tokenStart)}${matches[0]}${isCompletingArgument || matches[0].endsWith('/') ? '' : ' '}`;
      lastTabValue = '';
    } else if (matches.length > 1) {
      const commonPrefix = matches.reduce((prefix, candidate) => {
        let length = 0;
        while (length < prefix.length && prefix[length] === candidate[length]) length += 1;
        return prefix.slice(0, length);
      });

      if (commonPrefix.length > token.length) {
        terminalInput.value = `${value.slice(0, tokenStart)}${commonPrefix}`;
        lastTabValue = '';
      } else if (lastTabValue === value) {
        writeTerminalLine(matches.join('  '));
        lastTabValue = '';
      } else {
        lastTabValue = value;
      }
    } else {
      lastTabValue = '';
    }
    return;
  }

  lastTabValue = '';
  if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
  event.preventDefault();
  historyIndex = event.key === 'ArrowUp'
    ? Math.max(0, historyIndex - 1)
    : Math.min(terminalHistory.length, historyIndex + 1);
  terminalInput.value = terminalHistory[historyIndex] ?? '';
});
