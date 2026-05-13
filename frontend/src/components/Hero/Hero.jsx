import { useState, useEffect, useRef } from 'react';
import './Hero.css';

const BOOT_SEQUENCE = [
  { text: 'Initializing MARS runtime...', delay: 0 },
  { text: 'Loading cognitive memory substrate...', delay: 420 },
  { text: '  ✓  SQLite episodic store          [OK]', delay: 860 },
  { text: '  ✓  ChromaDB semantic index        [OK]', delay: 1100 },
  { text: '  ✓  Xenova embedding model         [OK]', delay: 1320 },
  { text: 'Attaching execution pipeline...', delay: 1700 },
  { text: '  ✓  Tool registry (7 tools)        [OK]', delay: 2020 },
  { text: '  ✓  Iteration bound set to 12      [OK]', delay: 2240 },
  { text: 'Binding communication channels...', delay: 2600 },
  { text: '  ✓  Discord relay v1.2.1           [OK]', delay: 2900 },
  { text: '  ⚠  Telegram relay                [PAUSED]', delay: 3100 },
  { text: 'Starting reactive execution fabric...', delay: 3500 },
  { text: '  ✓  Scheduler: 4/5 jobs active     [OK]', delay: 3800 },
  { text: '  ✓  Probes attached                [OK]', delay: 4020 },
  { text: 'Loading runtime extension engine...', delay: 4400 },
  { text: '  ✓  4 extensions sandboxed         [OK]', delay: 4720 },
  { text: '', delay: 5100 },
  { text: 'All subsystems nominal. Session #4182 ready.', delay: 5300 },
];

const ASCII_MARS = `
███╗   ███╗ █████╗ ██████╗ ███████╗
████╗ ████║██╔══██╗██╔══██╗██╔════╝
██╔████╔██║███████║██████╔╝███████╗
██║╚██╔╝██║██╔══██║██╔══██╗╚════██║
██║ ╚═╝ ██║██║  ██║██║  ██║███████║
╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝`.trim();

export default function Hero({ onEnter }) {
  const [lines, setLines]         = useState([]);
  const [ready, setReady]         = useState(false);
  const [exiting, setExiting]     = useState(false);
  const [showCursor, setShowCursor] = useState(true);
  const timeouts = useRef([]);

  useEffect(() => {
    BOOT_SEQUENCE.forEach(({ text, delay }) => {
      const t = setTimeout(() => {
        setLines(prev => [...prev, text]);
      }, delay);
      timeouts.current.push(t);
    });

    const readyT = setTimeout(() => setReady(true), 5900);
    timeouts.current.push(readyT);

    return () => timeouts.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setShowCursor(c => !c), 530);
    return () => clearInterval(t);
  }, []);

  function handleEnter() {
    setExiting(true);
    setTimeout(onEnter, 700);
  }

  function handleKey(e) {
    if (ready && (e.key === 'Enter' || e.key === ' ')) handleEnter();
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [ready]);

  return (
    <div className={`hero-overlay ${exiting ? 'hero-exit' : ''}`}>
      <div className="hero-inner">

        <div className="hero-ascii">
          {ASCII_MARS.split('\n').map((line, i) => (
            <div key={i} className="ascii-line" style={{ animationDelay: `${i * 60}ms` }}>
              {line}
            </div>
          ))}
        </div>

        <div className="hero-subtitle">
          <span className="dim">Modular Agent Runtime System</span>
          <span className="hero-sep">·</span>
          <span className="dim">v0.8.1-alpha</span>
          <span className="hero-sep">·</span>
          <span className="dim">Research Programme 2026</span>
        </div>

        <div className="hero-divider">
          <span>{'─'.repeat(56)}</span>
        </div>

        <div className="boot-log">
          {lines.map((line, i) => (
            <div
              key={i}
              className={`boot-line ${
                line.includes('[OK]')     ? 'ok'      :
                line.includes('[PAUSED]') ? 'warn'    :
                line.includes('[ERROR]')  ? 'err'     :
                line === ''               ? 'spacer'  : ''
              }`}
            >
              {line || ' '}
            </div>
          ))}
          {!ready && (
            <div className="boot-line boot-cursor">
              {showCursor ? '█' : ' '}
            </div>
          )}
        </div>

        {ready && (
          <div className="hero-cta">
            <button className="enter-btn" onClick={handleEnter}>
              <span className="enter-glyph">▸</span>
              ENTER SYSTEM
            </button>
            <span className="enter-hint dim">or press Enter</span>
          </div>
        )}

        <div className="hero-footer">
          <span className="dim">SESSION</span>
          <span className="accent">&nbsp;#4182</span>
          <span className="hero-sep">·</span>
          <span className="dim">NODE 18+</span>
          <span className="hero-sep">·</span>
          <span className="dim">ANTHROPIC claude-sonnet-4-6</span>
          <span className="hero-sep">·</span>
          <span className="dim">LOCAL-FIRST · NO TELEMETRY</span>
        </div>
      </div>
    </div>
  );
}
