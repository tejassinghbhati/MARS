import './Header.css';
import { SYSTEM_STATS } from '../../data/mock';

export default function Header({ activePanel }) {
  const now = new Date();
  const ts = now.toISOString().replace('T', ' ').slice(0, 19);

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-logo">
          <span className="logo-mark">▸</span>
          <span className="logo-text">MARS</span>
        </span>
        <span className="header-divider">│</span>
        <span className="header-sub">Modular Agent Runtime System</span>
        <span className="header-divider">│</span>
        <span className="header-session">
          <span className="dim">session</span>
          <span className="accent">&nbsp;#{SYSTEM_STATS.session}</span>
        </span>
      </div>

      <div className="header-center">
        <span className="header-model">
          <span className="dot green" style={{ marginRight: 6 }} />
          {SYSTEM_STATS.model}
        </span>
      </div>

      <div className="header-right">
        <span className="header-stat">
          <span className="dim">uptime</span>
          <span>&nbsp;{SYSTEM_STATS.uptime}</span>
        </span>
        <span className="header-divider">│</span>
        <span className="header-stat dim">{ts} UTC</span>
      </div>
    </header>
  );
}
