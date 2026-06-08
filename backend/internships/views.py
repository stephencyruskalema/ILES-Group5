import logging

from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import Company, Department, Document, Evaluation, LogEntry, Placement, Student, Supervisor, Visit
from .selectors import dashboard_payload
from .serializers import (
    AccountLoginSerializer,
    AccountSerializer,
    AccountSignupSerializer,
    CompanySerializer,
    DepartmentSerializer,
    DocumentSerializer,
    EvaluationSerializer,
    LogEntrySerializer,
    PlacementSerializer,
    StudentSerializer,
    SupervisorSerializer,
    VisitSerializer,
)

logger = logging.getLogger(__name__)


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class CompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer


class SupervisorViewSet(viewsets.ModelViewSet):
    queryset = Supervisor.objects.select_related("department", "company")
    serializer_class = SupervisorSerializer


class StudentViewSet(viewsets.ModelViewSet):
    queryset = Student.objects.select_related("department")
    serializer_class = StudentSerializer


class PlacementViewSet(viewsets.ModelViewSet):
    queryset = Placement.objects.select_related(
        "student",
        "student__department",
        "company",
        "academic_supervisor",
        "industry_supervisor",
    ).prefetch_related("logs", "evaluations", "visits", "documents")
    serializer_class = PlacementSerializer


class LogEntryViewSet(viewsets.ModelViewSet):
    queryset = LogEntry.objects.select_related("placement", "placement__student", "placement__company")
    serializer_class = LogEntrySerializer


class EvaluationViewSet(viewsets.ModelViewSet):
    queryset = Evaluation.objects.select_related("placement", "placement__student", "placement__company")
    serializer_class = EvaluationSerializer


class VisitViewSet(viewsets.ModelViewSet):
    queryset = Visit.objects.select_related("placement", "placement__student", "supervisor")
    serializer_class = VisitSerializer


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related("placement", "placement__student")
    serializer_class = DocumentSerializer


@api_view(["GET"])
def health_check(_request):
    return Response({"status": "ok", "service": "internship-logging-evaluation"})


@api_view(["POST"])
def signup(request):
    logger.info("Signup attempt from %s; keys=%s", request.META.get("REMOTE_ADDR"), list(request.data.keys()))
    try:
        serializer = AccountSignupSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        logger.info("Signup successful: %s (id=%s)", user.email, getattr(user, "id", None))
        return Response(AccountSerializer(user).data, status=status.HTTP_201_CREATED)
    except Exception:
        logger.exception("Signup failed for request from %s", request.META.get("REMOTE_ADDR"))
        raise


@api_view(["POST"])
def login(request):
    serializer = AccountLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    return Response(AccountSerializer(serializer.validated_data["user"]).data)


@api_view(["GET"])
def dashboard_stats(_request):
    payload = dashboard_payload()
    return Response(
        {
            **{key: value for key, value in payload.items() if key not in {"recent_logs", "flagged_placements"}},
            "recent_logs": LogEntrySerializer(payload["recent_logs"], many=True).data,
            "flagged_placements": PlacementSerializer(payload["flagged_placements"], many=True).data,
        }
    )
