from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CompanyViewSet,
    DepartmentViewSet,
    DocumentViewSet,
    EvaluationViewSet,
    LogEntryViewSet,
    PlacementViewSet,
    StudentViewSet,
    SupervisorViewSet,
    VisitViewSet,
    dashboard_stats,
    health_check,
    login_view,
    logout_view,
    signup,
)

# Register your ViewSets for CRUD operations
router = DefaultRouter()
router.register("departments", DepartmentViewSet)
router.register("companies", CompanyViewSet)
router.register("supervisors", SupervisorViewSet)
router.register("students", StudentViewSet)
router.register("placements", PlacementViewSet)
router.register("logs", LogEntryViewSet)
router.register("evaluations", EvaluationViewSet)
router.register("visits", VisitViewSet)
router.register("documents", DocumentViewSet)

urlpatterns = [
    # Health Check
    path("health/", health_check, name="health-check"),
    
    # Auth Endpoints
    path("auth/signup/", signup, name="auth-signup"),
    path("auth/login/", login_view, name="auth-login"),
    path("auth/logout/", logout_view, name="auth-logout"),
    
    # Dashboard Stats
    path("stats/", dashboard_stats, name="dashboard-stats"),
    
    # Resource endpoints (CRUD)
    path("", include(router.urls)),
]