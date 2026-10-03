"use client";

import { useEffect, useMemo, useState } from "react";
import type { Project } from "../lib/projects";
import { parseList } from "../lib/projects";

const categories = ["All", "Corporate", "E-commerce", "Product Catalog", "Restaurant", "Spa & Wellness", "Technology"];

export default function Portfolio({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const filtered = useMemo(() => active === "All" ? projects : projects.filter((p) => p.category === active), [active, projects]);
  useEffect(() => {
    if (!selected) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", closeOnEscape); };
  }, [selected]);
  function openProject(project: Project) { setSelected(project); }

  return <main>
    <header className="topbar">
      <a className="brand" href="#top" aria-label="PIYAIDEA home">PIYA<span>IDEA</span><i>®</i></a>
      <nav className={menuOpen ? "nav open" : "nav"}>
        <a href="#work" onClick={() => setMenuOpen(false)}>Selected work <sup>06</sup></a>
        <a href="#services" onClick={() => setMenuOpen(false)}>What I do</a>
        <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
        <a className="nav-contact" href="mailto:hello@piyaidea.com">Start a project <span>↗</span></a>
      </nav>
      <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "×" : "☰"}</button>
    </header>

    <section id="top" className="hero">
      <div className="hero-topline"><span>Independent designer & developer</span><span>Based in Bangkok, Thailand <b>↗</b></span></div>
      <h1>THINK<span className="hero-dot">.</span><br />DESIGN<span className="hero-dot">.</span><br /><em>SCALE.</em></h1>
      <div className="hero-bottom">
        <p>Creative technology<br />+ digital identity</p>
        <p className="hero-intro">I design purposeful digital experiences that help ambitious brands show up, stand out and grow.</p>
        <a className="round-arrow" href="#work" aria-label="Explore selected work">↓</a>
      </div>
      <div className="hero-stamp"><span>PIYAIDEA<br />CREATIVE STUDIO</span><b>26</b><small>EST. MMXXVI</small></div>
    </section>

    <section className="manifesto" id="about"><div className="section-kicker"><span>01 / The approach</span><span>Good design moves business forward.</span></div><p>We create <em>visually compelling</em> websites with thoughtful UI design, built around real people, clear ideas and the details that make a brand feel like itself.</p><div className="manifesto-sign">PIYAIDEA <span>— Bangkok, TH</span></div></section>

    <section id="work" className="work-section">
      <div className="section-heading"><div><span className="eyebrow">02 / A selection of projects</span><h2>Selected work<span className="hero-dot">.</span></h2></div><span className="work-count">{String(filtered.length).padStart(2,"0")} / {String(projects.length).padStart(2,"0")}</span></div>
      <div className="filter-row" role="tablist" aria-label="Filter projects">{categories.map((category) => <button key={category} className={active === category ? "filter active" : "filter"} onClick={() => setActive(category)}>{category}</button>)}</div>
      <div className="project-grid">{filtered.map((project, index) => {
        const gallery = parseList(project.gallery);
        return <button key={project.id} className={`project-card card-${index % 2}`} onClick={() => openProject(project)}>
          <div className="project-image"><img src={gallery[0] || "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1500&q=85"} alt={`${project.title} project preview`} loading={index > 1 ? "lazy" : "eager"} /><span className="image-index">{String(index + 1).padStart(2,"0")}</span><span className="view-project">View project ↗</span></div>
          <div className="project-meta"><div><h3>{project.title}</h3><p>{project.category} <span>·</span> {project.year}</p></div><span className="project-arrow">↗</span></div>
        </button>;
      })}</div>
      {!filtered.length && <div className="empty-state">No projects in this category yet.</div>}
    </section>

    <section className="services" id="services"><div className="section-kicker"><span>03 / The toolkit</span><span>From first sketch to launch day</span></div><h2>Good ideas deserve<br /><em>great execution.</em></h2><div className="service-list">
      <article><span>01</span><div><h3>Web design</h3><p>Digital experiences with clear structure, thoughtful details and a distinct point of view.</p></div><div className="service-tags">UI/UX · Responsive · Prototyping</div><b>↗</b></article>
      <article><span>02</span><div><h3>WordPress development</h3><p>Flexible, fast websites that are easy to manage and ready to grow with your business.</p></div><div className="service-tags">Custom theme · CMS · Performance</div><b>↗</b></article>
      <article><span>03</span><div><h3>Brand & graphics</h3><p>A cohesive visual language that brings your brand to life across every touchpoint.</p></div><div className="service-tags">Identity · Logo · Social · Print</div><b>↗</b></article>
    </div></section>

    <section className="testimonial"><span className="eyebrow">A note from a client</span><blockquote>“The freelancer is incredibly professional. They work quickly and efficiently, requiring minimal revisions because the final product is beautiful and exactly what I wanted.”</blockquote><div className="quote-by"><span className="quote-mark">“</span><span>Zak Reid <small>Client on Fastwork</small></span><span className="quote-stars">★★★★★</span></div></section>
    <footer className="footer"><a className="brand footer-brand" href="#top">PIYA<span>IDEA</span><i>®</i></a><div><span>Have a good one in mind?</span><a href="mailto:hello@piyaidea.com">Let’s make it real <b>↗</b></a></div><div className="footer-bottom"><span>Bangkok, Thailand · Available worldwide</span><span>© PIYAIDEA 2026</span><a href="/admin">Manage portfolio ↗</a></div></footer>

    {selected && <div className="modal-backdrop" role="presentation" onClick={() => setSelected(null)}><article className="project-modal" role="dialog" aria-modal="true" aria-label={selected.title} onClick={(e) => e.stopPropagation()}><div className="project-gallery-panel">{parseList(selected.gallery).map((src, index) => <img key={src} src={src} alt={`${selected.title} — full page ${index + 1}`} />)}</div><aside className="modal-content"><div className="modal-topline"><span className="eyebrow">PROJECT DETAILS</span><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close project details">×</button></div><div className="modal-title"><div><span className="eyebrow">{selected.category} / {selected.year}</span><h2>{selected.title}</h2></div></div><span className="modal-location">{selected.location}</span><p>{selected.description || selected.summary}</p><div className="modal-services">{parseList(selected.services).map((item) => <span key={item}>{item}</span>)}</div><div className="modal-project-index"><span>PROJECT</span><b>{selected.year}</b></div></aside></article></div>}
  </main>;
}
