import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'

import { API_BASE_URL, createResource as apiCreateResource, fetchWorkspace, patchResource } from './api/client'
import { AppShell } from './components/AppShell'
import { Modal } from './components/Modal'
import { EvaluationForm } from './forms/EvaluationForm'
import { LogForm } from './forms/LogForm'
import { PlacementDetail } from './forms/PlacementDetail'
import { PlacementForm } from './forms/PlacementForm'
import { StudentForm } from './forms/StudentForm'
import { CompaniesPage } from './pages/CompaniesPage'
import { DashboardPage } from './pages/DashboardPage'
import { EvaluationsPage } from './pages/EvaluationsPage'
import { HomePage } from './pages/HomePage'
import { LogbookPage } from './pages/LogbookPage'
import { LoginPage } from './pages/LoginPage'
import { MaintenancePage } from './pages/MaintenancePage'
import { PlacementsPage } from './pages/PlacementsPage'
import { ReportsPage } from './pages/ReportsPage'
import './App.css'

const USER_KEY = 'iles_user'

function readStoredUser() {
  try {
    const storedUser = JSON.parse(localStorage.getItem(USER_KEY) || 'null')
    return storedUser?.source === 'server' ? storedUser : null
  } catch {
    localStorage.removeItem(USER_KEY)
    return null
  }
}

function AuthenticatedApp({ user, onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()

  // Normalize role for robust detection
  const rawRole = (user?.role || '').toUpperCase()
  const isCoordinator = rawRole.includes('COORDINATOR')
  const isAcademicSupervisor = rawRole.includes('ACADEMIC')
  const isIndustrySupervisor = rawRole.includes('INDUSTRY')
  const isStudent = rawRole.includes('STUDENT')

  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedPlacement, setSelectedPlacement] = useState(null)

  const [stats, setStats] = useState(null)
  const [departments, setDepartments] = useState([])
  const [companies, setCompanies] = useState([])
  const [supervisors, setSupervisors] = useState([])
  const [students, setStudents] = useState([])
  const [placements, setPlacements] = useState([])
  const [logs, setLogs] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [documents, setDocuments] = useState([])
  const [visits, setVisits] = useState([])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const workspace = await fetchWorkspace()
      setStats(workspace.stats)
      setDepartments(workspace.departments)
      setCompanies(workspace.companies)
      setSupervisors(workspace.supervisors)
      setStudents(workspace.students)
      setPlacements(workspace.placements)
      setLogs(workspace.logs)
      setEvaluations(workspace.evaluations)
      setDocuments(workspace.documents)
      setVisits(workspace.visits)
    } catch {
      setError(`API unavailable at ${API_BASE_URL}. Start Django and seed the database.`)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [loadData])

  const createResource = async (resource, payload) => {
    setSaving(true)
    setError('')
    try {
      await apiCreateResource(resource, payload)
      setModal(null)
      await loadData()
    } catch (requestError) {
      const details = requestError.response?.data ? JSON.stringify(requestError.response.data) : requestError.message
      setError(`Could not save record: ${details}`)
    } finally {
      setSaving(false)
    }
  }

  const updateResource = async (resource, id, payload) => {
    setSaving(true)
    setError('')
    try {
      await patchResource(resource, id, payload)
      await loadData()
    } catch (requestError) {
      setError(`Could not update record: ${requestError.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateLogStatus = (log, status) => updateResource('logs', log.id, { status })
  const approveEvaluation = (evaluation) => updateResource('evaluations', evaluation.id, { status: 'approved' })

  return (
    <>
      <AppShell
        activePath={location.pathname}
        user={user}
        onLogout={onLogout}
        search={search}
        setSearch={setSearch}
        loading={loading}
        refreshData={loadData}
        placements={placements}
        logs={logs}
      >
        {error && (
          <div className="error-banner">
            <AlertTriangle size={18} /> {error}
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<HomePage user={user} stats={stats} />} />
          
          {/* Admin & Coordinator access */}
          {isCoordinator && (
            <>
              <Route
                path="/dashboard"
                element={
                  <DashboardPage
                    stats={stats}
                    placements={placements}
                    logs={logs}
                    evaluations={evaluations}
                    onSelectPlacement={setSelectedPlacement}
                    userRole={rawRole}
                  />
                }
              />
              <Route
                path="/reports"
                element={
                  <ReportsPage
                    stats={stats}
                    placements={placements}
                    logs={logs}
                    evaluations={evaluations}
                    documents={documents}
                    visits={visits}
                    userRole={rawRole}
                  />
                }
              />
              <Route
                path="/companies"
                element={<CompaniesPage companies={companies} supervisors={supervisors} search={search} userRole={rawRole} />}
              />
              <Route path="/maintenance" element={<MaintenancePage search={search} userRole={rawRole} />} />
            </>
          )}

          {/* Shared Routes */}
          <Route
            path="/placements"
            element={
              <PlacementsPage
                placements={placements}
                students={students}
                companies={companies}
                supervisors={supervisors}
                search={search}
                onOpenModal={setModal}
                onSelectPlacement={setSelectedPlacement}
                userRole={rawRole}
                userEmail={user?.email}
              />
            }
          />
          <Route
            path="/logbook"
            element={
              <LogbookPage
                logs={logs}
                placements={placements}
                search={search}
                onOpenModal={setModal}
                onUpdateLogStatus={updateLogStatus}
                userRole={rawRole}
                userEmail={user?.email}
              />
            }
          />
          <Route
            path="/evaluations"
            element={
              <EvaluationsPage
                evaluations={evaluations}
                search={search}
                onOpenModal={setModal}
                onApproveEvaluation={approveEvaluation}
                userRole={rawRole}
              />
            }
          />

          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </AppShell>

      {/* Conditional Modals */}
      {isCoordinator && (
        <>
          {modal === 'student' && (
            <Modal title="Create Student" onClose={() => setModal(null)}>
              <StudentForm departments={departments} saving={saving} onClose={() => setModal(null)} onSubmit={(payload) => createResource('students', payload)} />
            </Modal>
          )}
          {modal === 'placement' && (
            <Modal title="Create Placement" onClose={() => setModal(null)}>
              <PlacementForm students={students} companies={companies} supervisors={supervisors} saving={saving} onClose={() => setModal(null)} onSubmit={(payload) => createResource('placements', payload)} />
            </Modal>
          )}
        </>
      )}
      {modal === 'log' && (
        <Modal title="Create Weekly Log" onClose={() => setModal(null)}>
          <LogForm placements={placements} saving={saving} onClose={() => setModal(null)} onSubmit={(payload) => createResource('logs', payload)} />
        </Modal>
      )}
      {modal === 'evaluation' && (
        <Modal title="Create Evaluation" onClose={() => setModal(null)}>
          <EvaluationForm placements={placements} saving={saving} onClose={() => setModal(null)} onSubmit={(payload) => createResource('evaluations', payload)} />
        </Modal>
      )}
      {selectedPlacement && (
        <PlacementDetail
          placement={selectedPlacement}
          logs={logs}
          evaluations={evaluations}
          documents={documents}
          visits={visits}
          onClose={() => setSelectedPlacement(null)}
        />
      )}
    </>
  )
}

function App() {
  const [user, setUser] = useState(readStoredUser)
  const navigate = useNavigate()

  const login = (nextUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser))
    setUser(nextUser)
    navigate('/home', { replace: true })
  }

  const logout = () => {
    localStorage.removeItem(USER_KEY)
    setUser(null)
    navigate('/login', { replace: true })
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return <AuthenticatedApp user={user} onLogout={logout} />
}

export default App