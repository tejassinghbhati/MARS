import './Sidebar.css';
import { SYSTEM_STATS } from '../../data/mock';

const NAV_ITEMS = [
  { id: 'agent',     label: 'Agent Console',      glyph: '⬡', shortLabel: 'CONSOLE'   },
  { id: 'memory',   label: 'Memory Explorer',     glyph: '◈', shortLabel: 'MEMORY'    },
  { id: 'scheduler',label: 'Scheduler Monitor',   glyph: '◷', shortLabel: 'SCHEDULER' },
  { id: 'extensions',label:'Extension Registry',  glyph: '⬧', shortLabel: 'EXTENSIONS'},
];

const STATS = [
  { label: 'Mem Entries',  value: SYSTEM_STATS.memory_entries },
  { label: 'Active Jobs',  value: SYSTEM_STATS.active_jobs },
  { label: 'Extensions',   value: SYSTEM_STATS.loaded_extensions },
  { label: 'Iterations',   value: SYSTEM_STATS.agent_iterations_today },
];

export default function Sidebar({ activePanel, onNavigate }) {
  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Modules</div>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activePanel === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-glyph">{item.glyph}</span>
            <span className="nav-label">{item.shortLabel}</span>
            {activePanel === item.id && <span className="nav-indicator" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-divider" />

      <div className="sidebar-stats">
        <div className="sidebar-section-label">System</div>
        {STATS.map(s => (
          <div key={s.label} className="stat-row">
            <span className="stat-label">{s.label}</span>
            <span className="stat-value">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="dim">v0.8.1-alpha</span>
      </div>
    </aside>
  );
}
