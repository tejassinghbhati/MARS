import { useState } from 'react';
import { EXTENSIONS } from '../../data/mock';
import './ExtensionRegistry.css';

function StatusDot({ status }) {
  const map = { active: 'green', inactive: 'muted' };
  return <span className={`dot ${map[status] || 'muted'}`} />;
}

export default function ExtensionRegistry() {
  const [selected, setSelected] = useState(null);
  const [extensions, setExtensions] = useState(EXTENSIONS);

  function toggleExt(id) {
    setExtensions(prev => prev.map(e =>
      e.id === id
        ? { ...e, status: e.status === 'active' ? 'inactive' : 'active', loaded_at: e.status === 'inactive' ? new Date().toISOString().replace('T', ' ').slice(0, 19) : null }
        : e
    ));
  }

  const selectedExt = extensions.find(e => e.id === selected);
  const activeCount = extensions.filter(e => e.status === 'active').length;

  return (
    <div className="extension-registry">
      <div className="section-header">
        <span className="accent">⬧</span>
        <span>Extension Registry</span>
        <span className="rule" />
        <span className={`badge ${activeCount > 0 ? 'green' : 'muted'}`}>
          {activeCount}/{extensions.length} loaded
        </span>
        <span className="dim" style={{ fontSize: 10.5 }}>Runtime Extension Engine · sandboxed skill loader</span>
      </div>

      <div className="registry-body">
        <div className="registry-list">
          {extensions.map(ext => (
            <div
              key={ext.id}
              className={`ext-card ${ext.status === 'inactive' ? 'ext-inactive' : ''} ${selected === ext.id ? 'ext-selected' : ''}`}
              onClick={() => setSelected(ext.id === selected ? null : ext.id)}
            >
              <div className="ext-card-header">
                <StatusDot status={ext.status} />
                <span className="ext-name">{ext.name}</span>
                <span className="ext-version dim">v{ext.version}</span>

                <div className="ext-tags">
                  {ext.sandboxed
                    ? <span className="badge cyan">sandboxed</span>
                    : <span className="badge red">trusted</span>
                  }
                  {ext.hot_reload && (
                    <span className="badge green">hot-reload</span>
                  )}
                </div>

                <button
                  className={`toggle-btn ${ext.status === 'active' ? 'pause' : 'resume'}`}
                  onClick={e => { e.stopPropagation(); toggleExt(ext.id); }}
                >
                  {ext.status === 'active' ? 'UNLOAD' : 'LOAD'}
                </button>
              </div>

              <div className="ext-desc">{ext.description}</div>

              <div className="ext-meta">
                <span className="ext-file dim">{ext.file}</span>
                {ext.loaded_at && (
                  <span className="ext-loaded dim">loaded {ext.loaded_at}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {selectedExt && (
          <div className="ext-detail">
            <div className="detail-header">
              <StatusDot status={selectedExt.status} />
              <span className="accent ext-name">{selectedExt.name}</span>
              <button className="close-btn dim" onClick={() => setSelected(null)}>✕</button>
            </div>

            <p className="ext-full-desc">{selectedExt.description}</p>

            <div className="detail-grid">
              <div className="detail-field">
                <div className="detail-label">version</div>
                <div className="detail-value">v{selectedExt.version}</div>
              </div>
              <div className="detail-field">
                <div className="detail-label">status</div>
                <span className={`badge ${selectedExt.status === 'active' ? 'green' : 'muted'}`}>
                  {selectedExt.status}
                </span>
              </div>
              <div className="detail-field">
                <div className="detail-label">sandbox</div>
                <span className={`badge ${selectedExt.sandboxed ? 'cyan' : 'red'}`}>
                  {selectedExt.sandboxed ? 'yes' : 'no — trusted'}
                </span>
              </div>
              <div className="detail-field">
                <div className="detail-label">hot reload</div>
                <span className={`badge ${selectedExt.hot_reload ? 'green' : 'muted'}`}>
                  {selectedExt.hot_reload ? 'enabled' : 'disabled'}
                </span>
              </div>
            </div>

            <div className="detail-field">
              <div className="detail-label">entry file</div>
              <div className="detail-value file-path">{selectedExt.file}</div>
            </div>

            <div className="detail-field">
              <div className="detail-label">exported symbols</div>
              <div className="exports-list">
                {selectedExt.exports.map(sym => (
                  <span key={sym} className="export-tag">{sym}</span>
                ))}
              </div>
            </div>

            {selectedExt.loaded_at && (
              <div className="detail-field">
                <div className="detail-label">loaded at</div>
                <div className="detail-value">{selectedExt.loaded_at}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
