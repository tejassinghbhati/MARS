import './StatusBar.css';
import { SYSTEM_STATS } from '../../data/mock';

export default function StatusBar({ activePanel }) {
  const panelLabel = {
    agent: 'Agent Console',
    memory: 'Memory Explorer',
    scheduler: 'Scheduler Monitor',
    extensions: 'Extension Registry',
  }[activePanel] || '';

  return (
    <div className="status-bar">
      <span className="status-item">
        <span className="dot green" />
        &nbsp;RUNTIME ACTIVE
      </span>
      <span className="status-sep">·</span>
      <span className="status-item dim">{panelLabel.toUpperCase()}</span>
      <span className="status-sep">·</span>
      <span className="status-item">
        <span className="dim">model&nbsp;</span>
        {SYSTEM_STATS.model}
      </span>
      <span className="status-sep">·</span>
      <span className="status-item">
        <span className="dim">iter/day&nbsp;</span>
        {SYSTEM_STATS.agent_iterations_today}
      </span>
      <span className="status-right">
        <span className="dim">MARS&nbsp;</span>
        <span>v0.8.1-alpha</span>
        <span className="status-sep">·</span>
        <span className="dim">Node 18+&nbsp;·&nbsp;SQLite&nbsp;·&nbsp;ChromaDB</span>
      </span>
    </div>
  );
}
