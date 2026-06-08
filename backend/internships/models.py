from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils import timezone


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Department(TimeStampedModel):
    name = models.CharField(max_length=120, unique=True)
    code = models.CharField(max_length=20, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class AccountProfile(TimeStampedModel):
    COORDINATOR = "Coordinator"
    ACADEMIC_SUPERVISOR = "Academic Supervisor"
    INDUSTRY_SUPERVISOR = "Industry Supervisor"
    STUDENT = "Student"
    ROLE_CHOICES = [
        (COORDINATOR, "Coordinator"),
        (ACADEMIC_SUPERVISOR, "Academic Supervisor"),
        (INDUSTRY_SUPERVISOR, "Industry Supervisor"),
        (STUDENT, "Student"),
    ]

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="internship_profile")
    role = models.CharField(max_length=40, choices=ROLE_CHOICES, default=STUDENT)

    class Meta:
        ordering = ["user__first_name", "user__last_name"]

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.role}"


class Company(TimeStampedModel):
    name = models.CharField(max_length=180)
    industry = models.CharField(max_length=120)
    location = models.CharField(max_length=180)
    contact_person = models.CharField(max_length=120, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=40, blank=True)

    class Meta:
        ordering = ["name"]
        verbose_name_plural = "companies"

    def __str__(self):
        return self.name


class Supervisor(TimeStampedModel):
    ACADEMIC = "academic"
    INDUSTRY = "industry"
    ROLE_CHOICES = [
        (ACADEMIC, "Academic Supervisor"),
        (INDUSTRY, "Industry Supervisor"),
    ]

    name = models.CharField(max_length=140)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=40, blank=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    department = models.ForeignKey(Department, on_delete=models.SET_NULL, null=True, blank=True)
    company = models.ForeignKey(Company, on_delete=models.SET_NULL, null=True, blank=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Student(TimeStampedModel):
    PENDING = "pending"
    PLACED = "placed"
    ACTIVE = "active"
    COMPLETED = "completed"
    FLAGGED = "flagged"
    STATUS_CHOICES = [
        (PENDING, "Pending Placement"),
        (PLACED, "Placed"),
        (ACTIVE, "Active"),
        (COMPLETED, "Completed"),
        (FLAGGED, "Flagged"),
    ]

    first_name = models.CharField(max_length=80)
    last_name = models.CharField(max_length=80)
    registration_no = models.CharField(max_length=40, unique=True)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=40, blank=True)
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name="students")
    year_of_study = models.PositiveSmallIntegerField(default=3, validators=[MinValueValidator(1), MaxValueValidator(6)])
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    class Meta:
        ordering = ["last_name", "first_name"]
        indexes = [
            models.Index(fields=["registration_no"]),
            models.Index(fields=["status"]),
        ]

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.registration_no})"


class Placement(TimeStampedModel):
    PENDING = "pending"
    ACTIVE = "active"
    COMPLETED = "completed"
    FLAGGED = "flagged"
    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (ACTIVE, "Active"),
        (COMPLETED, "Completed"),
        (FLAGGED, "Flagged"),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name="placements")
    company = models.ForeignKey(Company, on_delete=models.PROTECT, related_name="placements")
    academic_supervisor = models.ForeignKey(
        Supervisor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="academic_placements",
        limit_choices_to={"role": Supervisor.ACADEMIC},
    )
    industry_supervisor = models.ForeignKey(
        Supervisor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="industry_placements",
        limit_choices_to={"role": Supervisor.INDUSTRY},
    )
    title = models.CharField(max_length=160)
    start_date = models.DateField()
    end_date = models.DateField()
    objectives = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=ACTIVE)

    class Meta:
        ordering = ["-start_date", "student__last_name"]
        indexes = [
            models.Index(fields=["status", "start_date"]),
            models.Index(fields=["end_date"]),
        ]

    @property
    def progress(self):
        if self.status == self.COMPLETED:
            return 100
        total_logs = self.logs.count()
        reviewed_logs = self.logs.filter(status=LogEntry.REVIEWED).count()
        if total_logs == 0:
            return 0
        return round((reviewed_logs / total_logs) * 100)

    def __str__(self):
        return f"{self.student.full_name} - {self.company.name}"


class LogEntry(TimeStampedModel):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    REVIEWED = "reviewed"
    REJECTED = "rejected"
    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted"),
        (REVIEWED, "Reviewed"),
        (REJECTED, "Needs Revision"),
    ]

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE, related_name="logs")
    week_number = models.PositiveSmallIntegerField()
    date = models.DateField(default=timezone.now)
    title = models.CharField(max_length=180)
    activities = models.TextField()
    skills_gained = models.TextField(blank=True)
    challenges = models.TextField(blank=True)
    hours_worked = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)
    supervisor_feedback = models.TextField(blank=True)

    class Meta:
        ordering = ["-date", "-created_at"]
        unique_together = ["placement", "week_number", "date"]
        verbose_name_plural = "log entries"
        indexes = [
            models.Index(fields=["status", "date"]),
            models.Index(fields=["placement", "week_number"]),
        ]

    def __str__(self):
        return f"Week {self.week_number}: {self.title}"


class Evaluation(TimeStampedModel):
    DRAFT = "draft"
    SUBMITTED = "submitted"
    APPROVED = "approved"
    STATUS_CHOICES = [
        (DRAFT, "Draft"),
        (SUBMITTED, "Submitted"),
        (APPROVED, "Approved"),
    ]

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE, related_name="evaluations")
    evaluator_name = models.CharField(max_length=140)
    evaluator_role = models.CharField(max_length=20, choices=Supervisor.ROLE_CHOICES)
    period = models.CharField(max_length=80, default="Midterm")
    professionalism = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    technical_skill = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    communication = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    problem_solving = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    attendance = models.PositiveSmallIntegerField(default=0, validators=[MinValueValidator(0), MaxValueValidator(5)])
    remarks = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=DRAFT)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "period"]),
        ]

    @property
    def score(self):
        values = [
            self.professionalism,
            self.technical_skill,
            self.communication,
            self.problem_solving,
            self.attendance,
        ]
        return round(sum(values) / len(values), 1)

    def __str__(self):
        return f"{self.period} evaluation for {self.placement.student.full_name}"


class Visit(TimeStampedModel):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    MISSED = "missed"
    STATUS_CHOICES = [
        (SCHEDULED, "Scheduled"),
        (COMPLETED, "Completed"),
        (MISSED, "Missed"),
    ]

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE, related_name="visits")
    supervisor = models.ForeignKey(Supervisor, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_for = models.DateField()
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=SCHEDULED)

    class Meta:
        ordering = ["scheduled_for"]
        indexes = [
            models.Index(fields=["status", "scheduled_for"]),
        ]

    def __str__(self):
        return f"Visit on {self.scheduled_for}"


class Document(TimeStampedModel):
    OFFER_LETTER = "offer_letter"
    LOGBOOK = "logbook"
    EVALUATION = "evaluation"
    REPORT = "report"
    KIND_CHOICES = [
        (OFFER_LETTER, "Offer Letter"),
        (LOGBOOK, "Logbook"),
        (EVALUATION, "Evaluation"),
        (REPORT, "Final Report"),
    ]

    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    STATUS_CHOICES = [
        (PENDING, "Pending"),
        (APPROVED, "Approved"),
        (REJECTED, "Rejected"),
    ]

    placement = models.ForeignKey(Placement, on_delete=models.CASCADE, related_name="documents")
    kind = models.CharField(max_length=30, choices=KIND_CHOICES)
    title = models.CharField(max_length=180)
    file_url = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=PENDING)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["kind", "status"]),
        ]

    def __str__(self):
        return self.title

