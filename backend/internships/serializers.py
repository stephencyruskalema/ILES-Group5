from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import AccountProfile, Company, Department, Document, Evaluation, LogEntry, Placement, Student, Supervisor, Visit

User = get_user_model()


class AccountSignupSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=80)
    last_name = serializers.CharField(max_length=80)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=6, write_only=True)
    role = serializers.ChoiceField(choices=AccountProfile.ROLE_CHOICES)

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists() or User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError("An account already exists for this email.")
        return email

    def create(self, validated_data):
        role = validated_data.pop("role")
        user = User.objects.create_user(
            username=validated_data["email"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data["first_name"],
            last_name=validated_data["last_name"],
        )
        AccountProfile.objects.create(user=user, role=role)
        return user


class AccountLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs["email"].strip().lower()
        user = authenticate(username=email, password=attrs["password"])
        if not user:
            raise serializers.ValidationError("Create an account first, then sign in with the same email and password.")
        attrs["user"] = user
        return attrs


class AccountSerializer(serializers.Serializer):
    name = serializers.SerializerMethodField()
    email = serializers.EmailField()
    role = serializers.SerializerMethodField()
    source = serializers.SerializerMethodField()

    def get_name(self, user):
        return user.get_full_name() or user.email

    def get_role(self, user):
        return getattr(getattr(user, "internship_profile", None), "role", AccountProfile.STUDENT)

    def get_source(self, _user):
        return "server"


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ["id", "name", "code", "created_at", "updated_at"]


class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "industry",
            "location",
            "contact_person",
            "contact_email",
            "contact_phone",
            "created_at",
            "updated_at",
        ]


class SupervisorSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source="department.name", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)

    class Meta:
        model = Supervisor
        fields = [
            "id",
            "name",
            "email",
            "phone",
            "role",
            "department",
            "department_name",
            "company",
            "company_name",
            "created_at",
            "updated_at",
        ]


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    department_name = serializers.CharField(source="department.name", read_only=True)
    department_code = serializers.CharField(source="department.code", read_only=True)

    class Meta:
        model = Student
        fields = [
            "id",
            "first_name",
            "last_name",
            "full_name",
            "registration_no",
            "email",
            "phone",
            "department",
            "department_name",
            "department_code",
            "year_of_study",
            "status",
            "created_at",
            "updated_at",
        ]


class PlacementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="student.full_name", read_only=True)
    registration_no = serializers.CharField(source="student.registration_no", read_only=True)
    department_code = serializers.CharField(source="student.department.code", read_only=True)
    company_name = serializers.CharField(source="company.name", read_only=True)
    company_location = serializers.CharField(source="company.location", read_only=True)
    academic_supervisor_name = serializers.CharField(source="academic_supervisor.name", read_only=True)
    industry_supervisor_name = serializers.CharField(source="industry_supervisor.name", read_only=True)
    progress = serializers.IntegerField(read_only=True)
    log_count = serializers.IntegerField(source="logs.count", read_only=True)
    evaluation_count = serializers.IntegerField(source="evaluations.count", read_only=True)

    class Meta:
        model = Placement
        fields = [
            "id",
            "student",
            "student_name",
            "registration_no",
            "department_code",
            "company",
            "company_name",
            "company_location",
            "academic_supervisor",
            "academic_supervisor_name",
            "industry_supervisor",
            "industry_supervisor_name",
            "title",
            "start_date",
            "end_date",
            "objectives",
            "status",
            "progress",
            "log_count",
            "evaluation_count",
            "created_at",
            "updated_at",
        ]

    def validate(self, attrs):
        start_date = attrs.get("start_date", getattr(self.instance, "start_date", None))
        end_date = attrs.get("end_date", getattr(self.instance, "end_date", None))
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date must be after the start date."})
        return attrs


class LogEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="placement.student.full_name", read_only=True)
    company_name = serializers.CharField(source="placement.company.name", read_only=True)

    class Meta:
        model = LogEntry
        fields = [
            "id",
            "placement",
            "student_name",
            "company_name",
            "week_number",
            "date",
            "title",
            "activities",
            "skills_gained",
            "challenges",
            "hours_worked",
            "status",
            "supervisor_feedback",
            "created_at",
            "updated_at",
        ]

    def validate_hours_worked(self, value):
        if value < 0:
            raise serializers.ValidationError("Hours worked cannot be negative.")
        return value


class EvaluationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="placement.student.full_name", read_only=True)
    company_name = serializers.CharField(source="placement.company.name", read_only=True)
    score = serializers.FloatField(read_only=True)

    class Meta:
        model = Evaluation
        fields = [
            "id",
            "placement",
            "student_name",
            "company_name",
            "evaluator_name",
            "evaluator_role",
            "period",
            "professionalism",
            "technical_skill",
            "communication",
            "problem_solving",
            "attendance",
            "score",
            "remarks",
            "status",
            "created_at",
            "updated_at",
        ]


class VisitSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="placement.student.full_name", read_only=True)
    supervisor_name = serializers.CharField(source="supervisor.name", read_only=True)

    class Meta:
        model = Visit
        fields = [
            "id",
            "placement",
            "student_name",
            "supervisor",
            "supervisor_name",
            "scheduled_for",
            "notes",
            "status",
            "created_at",
            "updated_at",
        ]


class DocumentSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source="placement.student.full_name", read_only=True)

    class Meta:
        model = Document
        fields = [
            "id",
            "placement",
            "student_name",
            "kind",
            "title",
            "file_url",
            "status",
            "created_at",
            "updated_at",
        ]
