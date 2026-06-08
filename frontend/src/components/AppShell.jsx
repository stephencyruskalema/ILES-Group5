import { GraduationCap, LogOut, RefreshCcw, Search, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { NAV_ITEMS } from '../data/navigation'
import { initials, labelize } from '../utils/format'
import { Badge } from './Badge'
import { IconButton } from './IconButton'

export function AppShell({
  activePath,
  user,
  onLogout,
  children,
  search,
  setSearch,
  loading,
  refreshData,
  placements,
  logs,
}) {
  const navigate = useNavigate()
  const activePlacements = placements.filter((placement) => placement.status === 'active')

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="workspace-card">
          <div className="workspace-icon">
            <GraduationCap size={24} />
          </div>
          <div>
            <strong>ILES Portal</strong>
            <span>{user.role}</span>
          </div>
        </div>

        <nav className="main-nav" aria-label="Main navigation">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                className={activePath === item.path ? 'active' : ''}
                type="button"
                onClick={() => navigate(item.path)}
              >
                <Icon size={20} />
                {item.label}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-section">
          <div className="section-title">
            <span>My Reviews</span>
            <Badge tone="blue">{logs.filter((log) => log.status === 'submitted').length}</Badge>
          </div>
          <div className="mini-list">
            {logs.slice(0, 4).map((log) => (
              <button key={log.id} type="button" onClick={() => navigate('/logbook')}>
                <span className={`dot ${log.status}`} />
                <span>
                  {log.title}
                  <small>{labelize(log.status)}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="sidebar-section">
          <div className="section-title">
            <span>Placements</span>
            <span>{activePlacements.length}</span>
          </div>
          <div className="mini-list">
            {activePlacements.slice(0, 4).map((placement) => (
              <button key={placement.id} type="button" onClick={() => navigate('/placements')}>
                <span className="dot active" />
                <span>
                  {placement.student_name}
                  <small>{placement.company_name}</small>
                </span>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <div className="global-search">
            <Search size={20} />
            <input
              value={search}
              placeholder="Search students, companies, logs..."
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="topbar-actions">
            <IconButton icon={RefreshCcw} label="Refresh data" onClick={refreshData} />
            <IconButton icon={Sun} label="Theme" onClick={() => document.body.classList.toggle('light-mode')} />
            <div className="avatar" title={user.email}>
              {initials(user.name)}
            </div>
            <IconButton icon={LogOut} label="Sign out" onClick={onLogout} />
          </div>
        </header>

        <main className="content">
          {loading ? (
            <div className="loading-panel">
              <RefreshCcw size={28} />
              <span>Loading internship workspace...</span>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  )
}
