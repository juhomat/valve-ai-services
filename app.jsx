/* App.jsx — Valve One internal reference app */
const { useState, useEffect, useMemo, useRef } = React;

const SERVICES = [
  {
    id: 'sales',
    name: 'AI Powered Sales',
    short: 'Sales',
    summary: 'AI in every stage of the B2B sales process — prospecting to closing — built on HubSpot.',
    stages: ['Prospecting', 'Research & Qualification', 'Meeting Preparation', 'Offer Building', 'Closing'],
    framework: 'Five-stage HubSpot sales motion',
  },
  {
    id: 'marketing',
    name: 'AI Powered Marketing',
    short: 'Marketing',
    summary: 'AI across CRM data, segmentation, content, monitoring, and reporting — structured around HubSpot Loop Marketing.',
    stages: ['Express', 'Tailor', 'Amplify', 'Evolve'],
    framework: 'HubSpot Loop Marketing framework',
  },
  {
    id: 'service',
    name: 'AI Powered Service',
    short: 'Service',
    summary: 'AI for ticket resolution, self-service, health scoring, and feedback analysis — built on HubSpot Service Hub.',
    stages: ['Ticket Management', 'Self-Service', 'Health Scoring', 'Feedback', 'Reporting'],
    framework: 'HubSpot Service Hub backbone',
  },
];

const DOC_TITLES = [
  'What It Is',
  'Who Buys It',
  'How We Sell It',
  'How We Deliver It',
  'How We Prove It Works',
  'What Are the Exact Tasks We Complete',
];

const DOC_SHORT = [
  'What It Is',
  'Who Buys It',
  'How We Sell It',
  'How We Deliver It',
  'How We Prove It Works',
  'Exact Tasks',
];

function svcSuffix(serviceId) {
  if (serviceId === 'sales') return 'AI Powered Sales';
  if (serviceId === 'marketing') return 'AI Powered Marketing';
  return 'AI Powered Service';
}

function fileFor(serviceId, docIdx) {
  return `content/${docIdx + 1}. ${DOC_TITLES[docIdx]} - ${svcSuffix(serviceId)}.md`;
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ---------- Routing ----------
function parseHash() {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (!h) return { route: 'home' };
  const [path, anchor] = h.split('#');
  const parts = path.split('/').filter(Boolean);
  if (parts.length === 0) return { route: 'home' };
  const serviceId = parts[0];
  if (!SERVICES.find(s => s.id === serviceId)) return { route: 'home' };
  let docIdx = 0;
  if (parts[1]) {
    const n = parseInt(parts[1], 10);
    if (!isNaN(n) && n >= 1 && n <= 6) docIdx = n - 1;
  }
  return { route: 'doc', serviceId, docIdx, anchor: anchor || null };
}

function navigate(path) {
  window.location.hash = path;
}

// ---------- Markdown rendering ----------
function configureMarked() {
  // Custom renderer to add anchors to headings + wrap tables + add owner badges
  const renderer = new marked.Renderer();
  const usedSlugs = new Map();
  function uniqueSlug(text) {
    const base = slugify(text);
    const n = (usedSlugs.get(base) || 0) + 1;
    usedSlugs.set(base, n);
    return n === 1 ? base : `${base}-${n}`;
  }

  renderer.heading = function (text, level) {
    // text is already rendered HTML (inline). Strip tags for slug + anchor copy.
    const plain = text.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, '');
    const slug = uniqueSlug(plain);
    const anchorLink = `<a class="anchor" href="#${slug}" aria-label="Anchor">¶</a>`;
    return `<h${level} id="${slug}" data-toc-level="${level}" data-toc-text="${plain.replace(/"/g, '&quot;')}">${text}${anchorLink}</h${level}>\n`;
  };

  renderer.table = function (header, body) {
    return `<div class="table-wrap"><table>\n<thead>\n${header}</thead>\n<tbody>\n${body}</tbody>\n</table></div>\n`;
  };

  renderer.tablecell = function (content, flags) {
    const tag = flags.header ? 'th' : 'td';
    const align = flags.align ? ` style="text-align:${flags.align}"` : '';
    // Detect Owner-cell tokens
    const trimmed = content.trim();
    if (!flags.header && (trimmed === 'We' || trimmed === 'Customer' || trimmed === 'Together')) {
      const cls = trimmed.toLowerCase();
      return `<${tag}${align}><span class="owner-badge ${cls}">${trimmed}</span></${tag}>\n`;
    }
    return `<${tag}${align}>${content}</${tag}>\n`;
  };

  // Reset slug counter per render
  return {
    render: (md) => {
      usedSlugs.clear();
      return marked.parse(md, { renderer, mangle: false, headerIds: false, gfm: true, breaks: false });
    },
  };
}

const md = configureMarked();

// ---------- Components ----------
function Header({ route }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-inner">
        <a href="#/" className="logo" aria-label="Valve One — Home">
          <span className="logo-mark">V</span>
          <span>Valve One</span>
          <span className="logo-sub">AI Powered Services</span>
        </a>
        <nav className="header-nav" aria-label="Services">
          {SERVICES.map(s => (
            <a
              key={s.id}
              href={`#/${s.id}`}
              className={route.route === 'doc' && route.serviceId === s.id ? 'active' : ''}
            >
              <span className={`svc-dot ${s.id}`} aria-hidden="true"></span>
              {s.name}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

function Home() {
  return (
    <main className="shell">
      <section className="home-hero">
        <div className="eyebrow">Internal reference · v1</div>
        <h1 className="hero-title">
          Three services. <em>One backbone.</em><br />AI built on HubSpot.
        </h1>
        <p className="hero-lede">
          A working reference for the Valve One team — what each AI Powered service is,
          who it's for, how we sell it, how we deliver it, and how we prove it works.
          Six documents per service. Two clicks to anything.
        </p>
      </section>

      <section className="home-meta">
        <div className="meta-cell">
          <div className="meta-label">Services</div>
          <div className="meta-val">3</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">Documents</div>
          <div className="meta-val">18</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">Backbone</div>
          <div className="meta-val">HubSpot</div>
        </div>
        <div className="meta-cell">
          <div className="meta-label">Audience</div>
          <div className="meta-val">€30–100M B2B</div>
        </div>
      </section>

      <section className="service-grid" aria-label="Services">
        {SERVICES.map((s, i) => (
          <article className="service-card" key={s.id}>
            <div className="card-num">Service {String(i + 1).padStart(2, '0')}</div>
            <h2>
              <span className={`svc-dot ${s.id}`} aria-hidden="true"></span>
              {s.name}
            </h2>
            <p className="card-desc">{s.summary}</p>

            <div className="card-doclist" aria-label={`${s.name} documents`}>
              {DOC_TITLES.map((t, di) => (
                <a
                  key={di}
                  className="card-doclink"
                  href={`#/${s.id}/${di + 1}`}
                  title={t}
                >
                  <span className="doc-num">{String(di + 1).padStart(2, '0')}</span>
                  <span>{DOC_SHORT[di]}</span>
                  <span className="doc-arrow">→</span>
                </a>
              ))}
            </div>

            <a className="card-cta" href={`#/${s.id}`}>
              View service <span aria-hidden="true">→</span>
            </a>
          </article>
        ))}
      </section>
    </main>
  );
}

function DocNav({ serviceId, docIdx }) {
  const svc = SERVICES.find(s => s.id === serviceId);
  return (
    <aside className="doc-nav" aria-label="Documents">
      <div className="doc-nav-title">Service</div>
      <a href={`#/${svc.id}`} className="doc-nav-svc">
        <span className="svc-tag">
          <span className={`svc-dot ${svc.id}`}></span>
          {svc.short}
        </span>
        {svc.name}
      </a>
      <ul className="doc-nav-list">
        {DOC_TITLES.map((t, i) => (
          <li key={i}>
            <a
              href={`#/${serviceId}/${i + 1}`}
              className={i === docIdx ? 'active' : ''}
            >
              <span className="doc-num">{String(i + 1).padStart(2, '0')}</span>
              <span>{DOC_SHORT[i]}</span>
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function TOC({ headings, activeId }) {
  if (!headings || headings.length === 0) return <aside className="toc-col"></aside>;
  return (
    <aside className="toc-col" aria-label="On this page">
      <div className="toc-title">On this page</div>
      <ul className="toc-list">
        {headings.map(h => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`${h.level === 3 ? 'h3' : h.level === 4 ? 'h4' : ''} ${activeId === h.id ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                const el = document.getElementById(h.id);
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY - 88;
                  window.scrollTo({ top, behavior: 'smooth' });
                  history.replaceState(null, '', `#${window.location.hash.split('#').slice(0,2).join('#')}#${h.id}`);
                }
              }}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}

function DocPage({ serviceId, docIdx, anchor }) {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const contentRef = useRef(null);
  const svc = SERVICES.find(s => s.id === serviceId);

  // Load file
  useEffect(() => {
    let cancelled = false;
    setRaw(null); setError(null);
    fetch(fileFor(serviceId, docIdx))
      .then(r => { if (!r.ok) throw new Error('Could not load document'); return r.text(); })
      .then(text => { if (!cancelled) setRaw(text); })
      .catch(err => { if (!cancelled) setError(err.message); });
    return () => { cancelled = true; };
  }, [serviceId, docIdx]);

  // Render markdown
  const html = useMemo(() => raw ? md.render(raw) : '', [raw]);

  // Extract headings for TOC after render
  const [headings, setHeadings] = useState([]);
  useEffect(() => {
    if (!contentRef.current || !html) return;
    const hs = Array.from(contentRef.current.querySelectorAll('h2, h3, h4'));
    const list = hs.map(h => ({
      id: h.id,
      text: h.getAttribute('data-toc-text') || h.textContent.replace(/¶$/, '').trim(),
      level: parseInt(h.tagName.substring(1), 10),
    })).filter(h => h.id);
    setHeadings(list);
  }, [html]);

  // Scroll to anchor on initial load OR scroll to top when changing doc
  useEffect(() => {
    if (!html) return;
    requestAnimationFrame(() => {
      if (anchor) {
        const el = document.getElementById(anchor);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY - 88;
          window.scrollTo({ top, behavior: 'auto' });
          return;
        }
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }, [html, anchor, serviceId, docIdx]);

  // IntersectionObserver for active TOC item
  useEffect(() => {
    if (!contentRef.current || headings.length === 0) return;
    const els = headings.map(h => document.getElementById(h.id)).filter(Boolean);
    const observer = new IntersectionObserver((entries) => {
      // Find the topmost intersecting entry
      const visible = entries.filter(e => e.isIntersecting)
        .sort((a, b) => a.target.getBoundingClientRect().top - b.target.getBoundingClientRect().top);
      if (visible.length > 0) {
        setActiveId(visible[0].target.id);
      }
    }, {
      rootMargin: '-100px 0px -65% 0px',
      threshold: 0,
    });
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, [headings]);

  // Title from first H1
  const title = useMemo(() => {
    if (!raw) return DOC_TITLES[docIdx];
    const m = raw.match(/^#\s+(.+)$/m);
    return m ? m[1].trim() : DOC_TITLES[docIdx];
  }, [raw, docIdx]);

  // Word count + reading time
  const stats = useMemo(() => {
    if (!raw) return { words: 0, mins: 0 };
    const words = raw.replace(/[#*`>|_-]/g, ' ').split(/\s+/).filter(Boolean).length;
    return { words, mins: Math.max(1, Math.round(words / 220)) };
  }, [raw]);

  const prevIdx = docIdx > 0 ? docIdx - 1 : null;
  const nextIdx = docIdx < 5 ? docIdx + 1 : null;

  return (
    <div className="service-page">
      <DocNav serviceId={serviceId} docIdx={docIdx} />

      <main className="doc-main">
        <div className="doc-breadcrumb">
          <a href="#/">Home</a>
          <span className="sep">/</span>
          <a href={`#/${serviceId}`}>{svc.name}</a>
          <span className="sep">/</span>
          <span>{DOC_SHORT[docIdx]}</span>
        </div>

        <div className="doc-meta-row">
          <span className="doc-meta-pill primary">
            <span className={`svc-dot ${svc.id}`} aria-hidden="true"></span>
            {svc.short}
          </span>
          <span className="doc-meta-pill">Doc {String(docIdx + 1).padStart(2, '0')} of 06</span>
          {stats.words > 0 && <span className="doc-meta-pill">{stats.mins} min read</span>}
        </div>

        {!raw && !error && (
          <div className="loading-state"><div className="loading-bar"></div><div style={{marginTop: 12}}>Loading document…</div></div>
        )}
        {error && (
          <div className="loading-state" style={{ color: 'var(--color-accent)' }}>
            Could not load <code>{fileFor(serviceId, docIdx)}</code>. {error}.
          </div>
        )}
        {raw && (
          <article
            ref={contentRef}
            className="md"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        )}

        {raw && (
          <nav className="doc-footer" aria-label="Document navigation">
            {prevIdx !== null ? (
              <a className="doc-footer-link prev" href={`#/${serviceId}/${prevIdx + 1}`}>
                <span className="lbl">← Previous · {String(prevIdx + 1).padStart(2, '0')}</span>
                <span className="ttl">{DOC_SHORT[prevIdx]}</span>
              </a>
            ) : <span className="doc-footer-link disabled"><span className="lbl">Start of service</span><span className="ttl">—</span></span>}
            {nextIdx !== null ? (
              <a className="doc-footer-link next" href={`#/${serviceId}/${nextIdx + 1}`}>
                <span className="lbl">Next · {String(nextIdx + 1).padStart(2, '0')} →</span>
                <span className="ttl">{DOC_SHORT[nextIdx]}</span>
              </a>
            ) : <span className="doc-footer-link next disabled"><span className="lbl">End of service</span><span className="ttl">—</span></span>}
          </nav>
        )}
      </main>

      <TOC headings={headings} activeId={activeId} />
    </div>
  );
}

function App() {
  const [route, setRoute] = useState(parseHash());
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Update document title
  useEffect(() => {
    if (route.route === 'home') {
      document.title = 'Valve One — AI Powered Services';
    } else {
      const svc = SERVICES.find(s => s.id === route.serviceId);
      document.title = `${DOC_SHORT[route.docIdx]} · ${svc.name} · Valve One`;
    }
  }, [route]);

  return (
    <>
      <Header route={route} />
      {route.route === 'home'
        ? <Home />
        : <DocPage
            serviceId={route.serviceId}
            docIdx={route.docIdx}
            anchor={route.anchor}
            key={`${route.serviceId}-${route.docIdx}`}
          />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
