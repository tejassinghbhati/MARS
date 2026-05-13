import { useState, useRef, useEffect } from 'react';
import ToolCallBlock from './ToolCallBlock';
import { AGENT_MESSAGES } from '../../data/mock';
import './AgentConsole.css';

const ROLE_META = {
  system:    { label: 'SYS',  cls: 'role-sys'  },
  user:      { label: 'USR',  cls: 'role-user' },
  assistant: { label: 'AGT',  cls: 'role-agt'  },
  tool_call: { label: 'TOOL', cls: 'role-tool' },
};

function MessageRow({ msg }) {
  if (msg.role === 'tool_call') {
    return (
      <div className="msg-row tool-row">
        <ToolCallBlock msg={msg} />
      </div>
    );
  }

  const meta = ROLE_META[msg.role] || ROLE_META.system;

  return (
    <div className={`msg-row ${msg.role === 'user' ? 'msg-user' : ''}`}>
      <div className="msg-meta">
        <span className={`msg-role-badge ${meta.cls}`}>{meta.label}</span>
        <span className="msg-ts">{msg.ts}</span>
        {msg.iteration != null && (
          <span className="msg-iter">iter/{msg.iteration}</span>
        )}
      </div>
      <div className="msg-content">{msg.content}</div>
    </div>
  );
}

export default function AgentConsole() {
  const [messages, setMessages] = useState(AGENT_MESSAGES);
  const [input, setInput] = useState('');
  const [iterBound] = useState(12);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text) return;

    const ts = new Date().toTimeString().slice(0, 8);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), role: 'user', content: text, ts },
    ]);
    setInput('');

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: '[Mock] Agent response not connected to live runtime. Start the MARS backend and wire the API endpoint.',
          ts: new Date().toTimeString().slice(0, 8),
          iteration: 1,
        },
      ]);
    }, 600);
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const systemCount  = messages.filter(m => m.role === 'system').length;
  const toolCount    = messages.filter(m => m.role === 'tool_call').length;
  const assistantCount = messages.filter(m => m.role === 'assistant').length;

  return (
    <div className="agent-console">
      <div className="console-topbar">
        <div className="section-header">
          <span className="accent">⬡</span>
          <span>Agent Execution Console</span>
          <span className="rule" />
          <span className="dim">iter bound&nbsp;</span>
          <span className="accent">{iterBound}</span>
          <span className="header-divider">·</span>
          <span className="dim">tool calls&nbsp;</span>
          <span>{toolCount}</span>
          <span className="header-divider">·</span>
          <span className="dim">responses&nbsp;</span>
          <span>{assistantCount}</span>
        </div>
      </div>

      <div className="console-thread">
        {messages.map(msg => (
          <MessageRow key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="console-input-area">
        <div className="input-prompt-indicator cursor-blink" />
        <textarea
          className="console-input"
          rows={2}
          placeholder="Enter prompt… (Shift+Enter for newline)"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
        />
        <button className="send-btn" onClick={handleSend}>
          SEND ▸
        </button>
      </div>
    </div>
  );
}
