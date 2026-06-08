import { BookOpen, CheckCircle2, Plus, Send, XCircle } from 'lucide-react'
import { Badge } from '../components/Badge'
import { EmptyState } from '../components/EmptyState'
import { PageHeader } from '../components/PageHeader'
import { StatCard } from '../components/StatCard'
import { labelize } from '../utils/format'

export function LogbookPage({ logs, placements, search, onOpenModal, onUpdateLogStatus, userRole, userEmail }) {
  // Normalize role for robust detection
  const role = (userRole || '').toUpperCase()
  const isStudent = role.includes('STUDENT')

  const filtered = logs.filter((log) => {
    const matchesSearch = [log.title, log.student_name, log.company_name, log.status]
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
    
    // Students only see their own logs; others see all logs
    return isStudent ? matchesSearch && log.student_email === userEmail : matchesSearch
  })

  return (
    <>
      <PageHeader
        eyebrow="Logbook"
        title={isStudent ? "My Weekly Activity Logs" : "Weekly Activity Logs"}
        subtitle={isStudent ? "Submit your weekly tasks for supervisor review." : "Students submit weekly activities; supervisors review, approve, or request revision."}
        action={
          <button className="primary-button" type="button" onClick={() => onOpenModal('log')}>
            <Plus size={18} />
            New Log
          </button>
        }
      />

      {/* Only show stats if the user is NOT a student */}
      {!isStudent && (
        <section className="stat-grid compact">
          <StatCard icon={BookOpen} label="Total Logs" value={logs.length} detail="submitted and draft" />
          <StatCard icon={Send} label="Awaiting Review" value={logs.filter((item) => item.status === 'submitted').length} detail="pending action" tone="amber" />
          <StatCard icon={CheckCircle2} label="Reviewed" value={logs.filter((item) => item.status === 'reviewed').length} detail="accepted entries" tone="green" />
        </section>
      )}

      <section className="table-panel">
        <div className="table-toolbar">
          <strong>{filtered.length} log entries</strong>
          <span>{placements.length} placements tracked</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Week</th>
                <th>Student</th>
                <th>Activity</th>
                <th>Hours</th>
                <th>Status</th>
                {!isStudent && <th>Action</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id}>
                  <td>Week {log.week_number}</td>
                  <td>
                    <strong>{log.student_name}</strong>
                    <span>{log.company_name}</span>
                  </td>
                  <td>
                    <strong>{log.title}</strong>
                    <span>{log.activities}</span>
                  </td>
                  <td>{log.hours_worked}</td>
                  <td>
                    <Badge tone={log.status === 'reviewed' ? 'green' : log.status === 'rejected' ? 'red' : log.status === 'submitted' ? 'amber' : 'neutral'}>
                      {labelize(log.status)}
                    </Badge>
                  </td>
                  {!isStudent && (
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => onUpdateLogStatus(log, 'reviewed')}>
                          <CheckCircle2 size={16} /> Review
                        </button>
                        <button type="button" onClick={() => onUpdateLogStatus(log, 'rejected')}>
                          <XCircle size={16} /> Revise
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState title="No logs found" message="Create a weekly entry or change the search term." />}
        </div>
      </section>
    </>
  )
}