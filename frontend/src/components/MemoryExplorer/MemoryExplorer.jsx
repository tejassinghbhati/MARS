import { useState } from 'react';
import { MEMORY_ENTRIES } from '../../data/mock';
import './MemoryExplorer.css';

const TYPE_BADGE = {
  episodic: 'blue',
  semantic: 'cyan',
};

const ROLE_BADGE = {
  user:      'yellow',
  assistant: 'green',
  system:    'muted',
};

export default function MemoryExplorer() {
  const [query, setQuery]     = useState('');
  const [selected, setSelected] = useState(null);
  const [filter, setFilter]   = useState('all');

  const filtered = MEMORY_ENTRIES.filter(m => {
    const matchType = filter === 'all' || m.type === filter;
    const matchQuery = query === '' ||
      m.preview.toLowerCase().includes(query.toLowerCase()) ||
      m.id.toLowerCase().includes(query.toLowerCase());
    return matchType && matchQuery;
  });

  const selectedEntry = MEMORY_ENTRIES.find(m => m.id === selected);

  return (
    <div className="memory-explorer">
      <div className="memory-topbar">
        <div className="section-header">
          <span className="accent">◈</span>
          <span>Memory Explorer</span>
          <span className="rule" />
          <span className="dim">episodic (SQLite)&nbsp;·&nbsp;semantic (ChromaDB)</span>
        </div>
        <div className="memory-controls">
          <div className="search-box">
            <span className="search-icon dim">⌕</span>
            <input
              type="text"
              placeholder="Search memory entries…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
            {query && (
              <button className="clear-btn dim" onClick={() => setQuery('')}>✕</button>
            )}
          </div>
          <div className="filter-tabs">
            {['all', 'episodic', 'semantic'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <span className="result-count dim">{filtered.length} entries</span>
        </div>
      </div>

      <div className="memory-body">
        <div className="memory-list">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Role</th>
                <th>Session</th>
                <th>Timestamp</th>
                <th>Preview</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr
                  key={m.id}
                  className={selected === m.id ? 'selected-row' : ''}
                  onClick={() => setSelected(m.id === selected ? null : m.id)}
                >
                  <td className="cell-id">{m.id}</td>
                  <td><span className={`badge ${TYPE_BADGE[m.type]}`}>{m.type}</span></td>
                  <td><span className={`badge ${ROLE_BADGE[m.role] || 'muted'}`}>{m.role}</span></td>
                  <td className="dim">{m.session}</td>
                  <td className="cell-ts">{m.ts}</td>
                  <td className="cell-preview">{m.preview}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="empty-state">No entries match query.</div>
          )}
        </div>

        {selectedEntry && (
          <div className="memory-detail">
            <div className="detail-header">
              <span className="accent">{selectedEntry.id}</span>
              <button className="close-btn dim" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="detail-grid">
              <div className="detail-field">
                <div className="detail-label">type</div>
                <span className={`badge ${TYPE_BADGE[selectedEntry.type]}`}>{selectedEntry.type}</span>
              </div>
              <div className="detail-field">
                <div className="detail-label">role</div>
                <span className={`badge ${ROLE_BADGE[selectedEntry.role] || 'muted'}`}>{selectedEntry.role}</span>
              </div>
              <div className="detail-field">
                <div className="detail-label">session</div>
                <div className="detail-value">{selectedEntry.session}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">timestamp</div>
                <div className="detail-value">{selectedEntry.ts}</div>
              </div>
            </div>

            <div className="detail-field full-width">
              <div className="detail-label">content</div>
              <div className="detail-content">{selectedEntry.preview}</div>
            </div>

            {selectedEntry.type === 'semantic' && (
              <div className="detail-field full-width">
                <div className="detail-label">vector similarity (mock)</div>
                <div className="similarity-bar-wrapper">
                  <div className="similarity-bar" style={{ width: '87%' }}>
                    <span>0.87</span>
                  </div>
                </div>
              </div>
            )}

            <div className="detail-actions">
              <button className="action-btn red">Erase Entry</button>
              <button className="action-btn muted">Copy ID</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
