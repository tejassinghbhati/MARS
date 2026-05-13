import { useState } from 'react';
import { CRON_JOBS, AUDIT_LOG } from '../../data/mock';
import './SchedulerMonitor.css';

function StatusBadge({ status }) {
  const map = { active: 'green', paused: 'yellow', error: 'red' };
  return <span className={`badge ${map[status] || 'muted'}`}>{status.toUpperCase()}</span>;
}

function AuditEventBadge({ event }) {
  const map = {
    RUN_COMPLETE: 'green',
    RUN_ERROR:    'red',
    PAUSED:       'yellow',
  };
  return <span className={`badge ${map[event] || 'muted'}`}>{event}</span>;
}

export default function SchedulerMonitor() {
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobs, setJobs] = useState(CRON_JOBS);

  function toggleJob(name) {
    setJobs(prev => prev.map(j =>
      j.name === name
        ? { ...j, status: j.status === 'active' ? 'paused' : 'active' }
        : j
    ));
  }

  const selected = jobs.find(j => j.name === selectedJob);
  const activeCount = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="scheduler-monitor">
      <div className="section-header">
        <span className="accent">◷</span>
        <span>Scheduler Monitor</span>
        <span className="rule" />
        <span className={`badge ${activeCount === jobs.length ? 'green' : 'yellow'}`}>
          {activeCount}/{jobs.length} active
        </span>
        <span className="dim" style={{ fontSize: 10.5 }}>Reactive Execution Fabric</span>
      </div>

      <div className="scheduler-body">
        <div className="scheduler-left">
          <div className="panel-label">Cron Jobs</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Schedule</th>
                <th>Status</th>
                <th>Last Run</th>
                <th>Next Run</th>
                <th>Runs</th>
                <th>Failures</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr
                  key={job.name}
                  className={selectedJob === job.name ? 'selected-row' : ''}
                  onClick={() => setSelectedJob(job.name === selectedJob ? null : job.name)}
                >
                  <td className="job-name">{job.name}</td>
                  <td className="job-cron">{job.cron}</td>
                  <td><StatusBadge status={job.status} /></td>
                  <td className="cell-ts">{job.last_run.slice(11)}</td>
                  <td className="cell-ts">{job.next_run === '—' ? '—' : job.next_run.slice(11)}</td>
                  <td className="num-cell">{job.runs.toLocaleString()}</td>
                  <td className={`num-cell ${job.failures > 0 ? 'failure-num' : ''}`}>
                    {job.failures}
                  </td>
                  <td>
                    <button
                      className={`toggle-btn ${job.status === 'active' ? 'pause' : 'resume'}`}
                      onClick={e => { e.stopPropagation(); toggleJob(job.name); }}
                    >
                      {job.status === 'active' ? 'PAUSE' : 'RESUME'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected && (
            <div className="job-detail">
              <div className="detail-header">
                <span className="accent">{selected.name}</span>
                <StatusBadge status={selected.status} />
              </div>
              <p className="job-description">{selected.description}</p>
              <div className="job-meta-grid">
                <div className="detail-field">
                  <div className="detail-label">cron expression</div>
                  <div className="cron-display">{selected.cron}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">total runs</div>
                  <div className="detail-value accent">{selected.runs.toLocaleString()}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">last run</div>
                  <div className="detail-value">{selected.last_run}</div>
                </div>
                <div className="detail-field">
                  <div className="detail-label">next run</div>
                  <div className="detail-value">{selected.next_run}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="audit-panel">
          <div className="panel-label">Audit Log</div>
          <div className="audit-log">
            {AUDIT_LOG.map((entry, i) => (
              <div key={i} className="audit-entry">
                <span className="audit-ts">{entry.ts}</span>
                <span className="audit-job">{entry.job}</span>
                <AuditEventBadge event={entry.event} />
                {entry.ms != null && (
                  <span className="audit-ms dim">{entry.ms}ms</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
