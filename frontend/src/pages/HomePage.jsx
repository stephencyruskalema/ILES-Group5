import {
  ArrowRight,
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HomePage({ user, stats }) {
  const navigate = useNavigate()
  
  // Normalize role for robust detection
  const role = (user?.role || '').toUpperCase()
  
  const isStudent = role.includes('STUDENT')
  const isCoordinator = role.includes('COORDINATOR')

  const allFeatures = [
    {
      icon: GraduationCap,
      title: 'Student Placements',
      description: 'Manage internship allocations, track progress, and coordinate between students and host organizations.',
      path: '/placements',
      roles: ['STUDENT', 'COORDINATOR', 'ACADEMIC', 'INDUSTRY'],
    },
    {
      icon: BookOpen,
      title: 'Weekly Logbook',
      description: 'Students submit weekly activity logs. Supervisors review, approve, or request revisions.',
      path: '/logbook',
      roles: ['STUDENT', 'COORDINATOR', 'ACADEMIC', 'INDUSTRY'],
    },
    {
      icon: ClipboardCheck,
      title: 'Evaluations',
      description: 'Academic and industry supervisors capture structured assessments for each placement period.',
      path: '/evaluations',
      roles: ['COORDINATOR', 'ACADEMIC', 'INDUSTRY'],
    },
    {
      icon: Building2,
      title: 'Host Companies',
      description: 'Maintain a directory of partner organizations and their industry supervision contacts.',
      path: '/companies',
      roles: ['COORDINATOR', 'ACADEMIC'],
    },
  ]

  // Filter features based on if the current role includes any of the allowed roles
  const visibleFeatures = allFeatures.filter(f => f.roles.some(r => role.includes(r)))

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">Internship Logging &amp; Evaluation System</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}</h1>
          <p>
            A central platform for managing student internship placements, weekly activity logs,
            supervisor evaluations, and maintenance requests across your institution.
          </p>
          <div className="hero-actions">
            {!isStudent && (
              <button className="primary-button" type="button" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
                <ArrowRight size={18} />
              </button>
            )}
            <button className={isStudent ? "primary-button" : "secondary-button"} type="button" onClick={() => navigate('/placements')}>
              {isStudent ? "View My Placement" : "View Placements"}
            </button>
          </div>
        </div>

        {!isStudent && (
          <div className="hero-stats">
            <div className="hero-stat">
              <strong>{stats?.total_students ?? '—'}</strong>
              <span>Registered Students</span>
            </div>
            <div className="hero-stat">
              <strong>{stats?.active_placements ?? '—'}</strong>
              <span>Active Placements</span>
            </div>
            <div className="hero-stat">
              <strong>{stats?.pending_logs ?? '—'}</strong>
              <span>Pending Log Reviews</span>
            </div>
          </div>
        )}
      </section>

      <section className="features-section">
        <h2>System Features</h2>
        <div className="feature-grid">
          {visibleFeatures.map((feature) => {
            const Icon = feature.icon
            return (
              <article className="feature-card" key={feature.path}>
                <div className="feature-icon">
                  <Icon size={28} />
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <button type="button" onClick={() => navigate(feature.path)}>
                  Open <ArrowRight size={15} />
                </button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="role-section">
        <div className="role-card">
          <ShieldCheck size={22} />
          <div>
            <strong>Your Role: {user?.role}</strong>
            <span>
              {isStudent && 'Submit weekly logs and track your internship progress.'}
              {isCoordinator && 'Oversee all placements, approve evaluations, and manage records.'}
              {role.includes('ACADEMIC') && 'Review student logs and submit midterm or final evaluations.'}
              {role.includes('INDUSTRY') && 'Provide workplace evaluations and log feedback for assigned students.'}
            </span>
          </div>
        </div>
      </section>
    </div>
  )
}