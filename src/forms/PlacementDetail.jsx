import { BriefcaseBusiness, CalendarDays, Users } from 'lucide-react'
import { Badge } from '../components/Badge'
import { Modal } from '../components/Modal'
import { formatDate, initials, labelize } from '../utils/format'

export function PlacementDetail({ 
  placement, 
  logs, 
  evaluations, 
  documents, 
  visits, 
  onClose, 
  userRole // Added prop
}) {
  // Normalize role
  const role = (userRole || '').toUpperCase()
  const isStudent = role.includes('STUDENT')

  const placementLogs = logs.filter((log) => log.placement === placement.id)
  const placementEvaluations = evaluations.filter((evaluation) => evaluation.placement === placement.id)
  const placementDocuments = documents.filter((document) => document.placement === placement.id)
  const placementVisits = visits.filter((visit) => visit.placement === placement.id)

  return (
    <Modal title="Placement Details" onClose={onClose}>
      <div className="detail-layout">
        <div className="detail-hero">
          <div className="person-avatar large">{initials(placement.student_name)}</div>
          <div>
            <h3>{placement.student_name}</h3>
            <p>{placement.title}</p>
            <Badge tone={placement.status === 'flagged' ? 'red' : 'green'}>{labelize(placement.status)}</Badge>
          </div>
        </div>
        
        <div className="detail-grid">
          <span><BriefcaseBusiness size={16} /> Company <strong>{placement.company_name}</strong></span>
          <span><Users size={16} /> Department <strong>{placement.department_code}</strong></span>
          <span><CalendarDays size={16} /> Start <strong>{formatDate(placement.start_date)}</strong></span>
          <span><CalendarDays size={16} /> End <strong>{formatDate(placement.end_date)}</strong></span>
        </div>

        <p className="detail-copy">{placement.objectives}</p>

        <div className="detail-tabs">
          <article>
            <h4>Logs</h4>
            {placementLogs.map((log) => (
              <span key={log.id}>{log.title} - {labelize(log.status)}</span>
            ))}
          </article>
          
          {/* Only show evaluations to staff/supervisors */}
          {!isStudent && (
            <article>
              <h4>Evaluations</h4>
              {placementEvaluations.map((evaluation) => (
                <span key={evaluation.id}>{evaluation.period} - {evaluation.score}</span>
              ))}
            </article>
          )}

          <article>
            <h4>Documents</h4>
            {placementDocuments.map((document) => (
              <span key={document.id}>{document.title} - {labelize(document.status)}</span>
            ))}
          </article>

          {/* Only show visits to staff */}
          {!isStudent && (
            <article>
              <h4>Visits</h4>
              {placementVisits.map((visit) => (
                <span key={visit.id}>{formatDate(visit.scheduled_for)} - {labelize(visit.status)}</span>
              ))}
            </article>
          )}
        </div>
      </div>
    </Modal>
  )
}