'use strict';

const toggle = (element) => element?.classList.toggle('active');

const sidebar = document.querySelector('[data-sidebar]');
document.querySelector('[data-sidebar-btn]')?.addEventListener('click', () => toggle(sidebar));

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
  const fallbackLink = document.querySelector('[data-form-mailto]');

  if (fallbackLink) fallbackLink.href = mailtoUrl;
  if (status) status.textContent = 'Your email app should open with your message ready. Review it, then send.';
  window.location.href = mailtoUrl;
});

const pages = document.querySelectorAll('[data-page]');
document.querySelectorAll('[data-nav-link]').forEach((link) => {
  link.addEventListener('click', () => {
    const page = link.textContent.trim().toLowerCase();
    pages.forEach((section) => section.classList.toggle('active', section.dataset.page === page));
    document.querySelectorAll('[data-nav-link]').forEach((navLink) => {
      navLink.classList.toggle('active', navLink === link);
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
  document.querySelector(`[data-nav-link]`)?.click();
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
                'Built a multi-OS homelab on Apple T2 hardware, with a Puppy Linux WireGuard VPN and an Ubuntu Samba file server.',
                '',
                '## Services & Access',
                'Ran WireGuard VPN on Puppy Linux and hosted Samba file sharing on Ubuntu.',
                '',
                '## Security & Operations',
                'Used iptables firewall rules and CLI-based troubleshooting across the homelab.',
                '',
                '## Technology',
                'Puppy Linux · Ubuntu · Apple T2 hardware · WireGuard · Samba · iptables · CLI',
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
  if (terminalPrompt) terminalPrompt.textContent = `james@portfolio:~${path ? `/${path}` : ''}$`;
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
