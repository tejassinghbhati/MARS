import { useState } from 'react';
import './ToolCallBlock.css';

export default function ToolCallBlock({ msg }) {
  const [expanded, setExpanded] = useState(false);

  const statusColor = msg.output?.error ? 'red' : 'green';
  const outputStr = JSON.stringify(msg.output, null, 2);
  const inputStr  = JSON.stringify(msg.input,  null, 2);

  return (
    <div className="tool-block">
      <button className="tool-header" onClick={() => setExpanded(e => !e)}>
        <span className="tool-chevron">{expanded ? '▾' : '▸'}</span>
        <span className="tool-tag">TOOL</span>
        <span className="tool-name">{msg.tool}</span>
        <span className="tool-sep">→</span>
        <span className={`tool-status ${statusColor}`}>
          {msg.output?.error ? 'ERROR' : 'OK'}
        </span>
        {msg.duration_ms != null && (
          <span className="tool-duration">{msg.duration_ms}ms</span>
        )}
        <span className="tool-ts dim">{msg.ts}</span>
      </button>

      {expanded && (
        <div className="tool-body">
          <div className="tool-pane">
            <div className="tool-pane-label">input</div>
            <pre className="tool-pre">{inputStr}</pre>
          </div>
          <div className="tool-pane">
            <div className="tool-pane-label">output</div>
            <pre className="tool-pre">{outputStr}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
