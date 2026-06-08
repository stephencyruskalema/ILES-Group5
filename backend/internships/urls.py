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
    login,
    signup,
)

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
    path("health/", health_check, name="health-check"),
    path("auth/signup/", signup, name="auth-signup"),
    path("auth/login/", login, name="auth-login"),
    path("stats/", dashboard_stats, name="dashboard-stats"),
    path("", include(router.urls)),
]
