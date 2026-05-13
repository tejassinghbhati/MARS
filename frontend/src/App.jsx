import { useState } from 'react';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import StatusBar from './components/Layout/StatusBar';
import AgentConsole from './components/AgentConsole/AgentConsole';
import MemoryExplorer from './components/MemoryExplorer/MemoryExplorer';
import SchedulerMonitor from './components/SchedulerMonitor/SchedulerMonitor';
import ExtensionRegistry from './components/ExtensionRegistry/ExtensionRegistry';
import Hero from './components/Hero/Hero';
import './styles/global.css';
import './App.css';

const PANELS = {
  agent:      AgentConsole,
  memory:     MemoryExplorer,
  scheduler:  SchedulerMonitor,
  extensions: ExtensionRegistry,
};

export default function App() {
  const [showHero, setShowHero]   = useState(true);
  const [activePanel, setActivePanel] = useState('agent');
  const Panel = PANELS[activePanel];

  return (
    <>
      {showHero && <Hero onEnter={() => setShowHero(false)} />}
      <div className={`app-shell ${showHero ? 'app-hidden' : 'app-visible'}`}>
        <Header activePanel={activePanel} />
        <div className="app-body">
          <Sidebar activePanel={activePanel} onNavigate={setActivePanel} />
          <main className="main-content">
            <Panel />
          </main>
        </div>
        <StatusBar activePanel={activePanel} />
      </div>
    </>
  );
}
