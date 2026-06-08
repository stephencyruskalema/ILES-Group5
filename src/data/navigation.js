import {
  BarChart3,
  BookOpen,
  Building2,
  ClipboardCheck,
  GraduationCap,
  LayoutDashboard,
  Wrench,
} from 'lucide-react'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { id: 'placements', label: 'Placements', path: '/placements', icon: GraduationCap },
  { id: 'logbook', label: 'Logbook', path: '/logbook', icon: BookOpen },
  { id: 'evaluations', label: 'Evaluations', path: '/evaluations', icon: ClipboardCheck },
  { id: 'companies', label: 'Companies', path: '/companies', icon: Building2 },
  { id: 'maintenance', label: 'Maintenance', path: '/maintenance', icon: Wrench },
  { id: 'reports', label: 'Reports', path: '/reports', icon: BarChart3 },
]

export const STATUS_LABELS = {
  active: 'Active',
  approved: 'Approved',
  completed: 'Completed',
  draft: 'Draft',
  flagged: 'Flagged',
  industry: 'Industry',
  academic: 'Academic',
  missed: 'Missed',
  open: 'Open',
  pending: 'Pending',
  placed: 'Placed',
  rejected: 'Needs Revision',
  resolved: 'Resolved',
  reviewed: 'Reviewed',
  scheduled: 'Scheduled',
  submitted: 'Submitted',
  technical_skill: 'Technical Skill',
  problem_solving: 'Problem Solving',
}
