import {
  AlertTriangle,
  BriefcaseBusiness,
  GraduationCap,
  MessageSquareText,
  Plus,
  Send,
  Star,
  Lock,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { formatNumber, labelize } from '../utils/format'

export function DashboardPage({ stats, placements, logs, evaluations, onSelectPlacement, userRole }) {
  const navigate = useNavigate()
  
  // Normalize role and authorize Coordinators and Supervisors
  const role = (userRole || '').toUpperCase()
  const isAuthorized = role.includes('COORDINATOR') || role.includes('ACADEMIC') || role.includes('INDUSTRY')

  const active = stats?.active_placements || 0
  const pending = stats?.pending_logs || 0
  const reviewed = stats?.reviewed_logs || 0
  const averageScore = stats?.average_score || 0
  const recentLogs = stats?.recent_logs?.length ? stats.recent_logs : logs.slice(0, 5)
  const flagged = stats?.flagged_placements?.length
    ? stats.flagged_placements
    : placements.filter((item) => item.status === 'flagged')

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title={isAuthorized ? "Internship Control Center" : "My Dashboard"}
        subtitle={isAuthorized ? "Monitor placements, logbook submissions, visits, and evaluations." : "Overview of your internship progress."}
        action={
          <button className="primary-button" type="button" onClick={() => navigate('/logbook')}>
            <Plus size={18} />
            New Log
          </button>
        }
      />

      {!isAuthorized ? (
        <EmptyState 
          icon={Lock}
          title="Administrative Access Only" 
          message="The Dashboard is intended for internship coordination and supervision management." 
        />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard icon={GraduationCap} label="Students" value={formatNumber(stats?.total_students)} detail="registered interns" />
            <StatCard icon={BriefcaseBusiness} label="Active Placements" value={active} detail="currently on attachment" tone="green" />
            <StatCard icon={Send} label="Pending Logs" value={pending} detail="awaiting supervisor review" tone="amber" />
            <StatCard icon={Star} label="Average Score" value={averageScore} detail="evaluation rating" tone="purple" />
          </section>

          <section className="dashboard-grid">
            {/* Panel components remain the same */}
            <article className="panel wide">
              <div className="panel-header">
                <h2>Placement Overview</h2>
                <button type="button" onClick={() => navigate('/placements')}>View all</button>
              </div>
              <div className="placement-list">
                {placements.slice(0, 4).map((placement) => (
                  <button key={placement.id} className="placement-row" type="button" onClick={() => onSelectPlacement(placement)}>
                    <div>
                      <strong>{placement.student_name}</strong>
                      <span>{placement.title}</span>
                      <small>{placement.company_name} - {placement.department_code}</small>
                    </div>
                    <div className="progress-cell">
                      <Badge tone={placement.status === 'flagged' ? 'red' : 'green'}>{labelize(placement.status)}</Badge>
                      <span>{placement.progress}%</span>
                      <div className="progress-track"><span style={{ width: `${placement.progress}%` }} /></div>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Review Queue</h2>
                <Badge tone="blue">{pending}</Badge>
              </div>
              <div className="stack-list">
                {recentLogs.map((log) => (
                  <button key={log.id} type="button" onClick={() => navigate('/logbook')}>
                    <div className="list-icon"><MessageSquareText size={18} /></div>
                    <span>
                      <strong>{log.title}</strong>
                      <small>{log.student_name} - Week {log.week_number}</small>
                    </span>
                    <Badge tone={log.status === 'reviewed' ? 'green' : log.status === 'rejected' ? 'red' : 'amber'}>
                      {labelize(log.status)}
                    </Badge>
                  </button>
                ))}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Exceptions</h2>
                <Badge tone="red">{flagged.length + (stats?.overdue_visits || 0)}</Badge>
              </div>
              <div className="stack-list">
                {flagged.map((placement) => (
                  <button key={placement.id} type="button" onClick={() => onSelectPlacement(placement)}>
                    <div className="list-icon red"><AlertTriangle size={18} /></div>
                    <span>
                      <strong>{placement.student_name}</strong>
                      <small>{placement.company_name}</small>
                    </span>
                    <Badge tone="red">Action</Badge>
                  </button>
                ))}
                {!flagged.length && <EmptyState title="No exceptions" message="All active placements are currently within review expectations." />}
              </div>
            </article>

            <article className="panel">
              <div className="panel-header">
                <h2>Evaluation Snapshot</h2>
                <button type="button" onClick={() => navigate('/evaluations')}>Open</button>
              </div>
              <div className="score-ring"><strong>{averageScore}</strong><span>Average rating</span></div>
              <div className="mini-metrics">
                <span>{evaluations.length} evaluations</span>
                <span>{reviewed} reviewed logs</span>
              </div>
            </article>
          </section>
        </>
      )}
    </>
  )
}