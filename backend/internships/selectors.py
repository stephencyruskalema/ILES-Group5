from django.db.models import Count, Q, Sum

from .models import Evaluation, LogEntry, Placement, Student, Visit


def dashboard_payload():
    evaluations = Evaluation.objects.all()
    scores = [evaluation.score for evaluation in evaluations]
    average_score = round(sum(scores) / len(scores), 1) if scores else 0

    recent_logs = LogEntry.objects.select_related("placement__student", "placement__company")[:5]
    flagged_placements = (
        Placement.objects.select_related("student", "student__department", "company", "academic_supervisor", "industry_supervisor")
        .prefetch_related("logs", "evaluations", "visits", "documents")
        .filter(Q(status=Placement.FLAGGED) | Q(logs__status=LogEntry.REJECTED))
        .distinct()[:5]
    )

    return {
        "total_students": Student.objects.count(),
        "active_placements": Placement.objects.filter(status=Placement.ACTIVE).count(),
        "pending_logs": LogEntry.objects.filter(status=LogEntry.SUBMITTED).count(),
        "reviewed_logs": LogEntry.objects.filter(status=LogEntry.REVIEWED).count(),
        "overdue_visits": Visit.objects.filter(status=Visit.MISSED).count(),
        "total_hours": float(LogEntry.objects.aggregate(total=Sum("hours_worked"))["total"] or 0),
        "average_score": average_score,
        "status_breakdown": list(Student.objects.values("status").annotate(count=Count("id")).order_by("status")),
        "department_breakdown": list(
            Student.objects.values("department__code", "department__name")
            .annotate(count=Count("id"))
            .order_by("department__code")
        ),
        "recent_logs": recent_logs,
        "flagged_placements": flagged_placements,
    }
