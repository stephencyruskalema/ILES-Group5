export const usePermissions = (role) => {
  return {
    isStudent: role === 'student',
    isCoordinator: role === 'coordinator',
    isAcademicSupervisor: role === 'academic_supervisor',
    isIndustrySupervisor: role === 'industry_supervisor',
    canManageAll: role === 'coordinator', // Only coordinators get full access
  };
};