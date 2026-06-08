from django.contrib import admin

from .models import (
    AccountProfile,
    Company,
    Department,
    Document,
    Evaluation,
    LogEntry,
    Placement,
    Student,
    Supervisor,
    Visit,
)


@admin.register(AccountProfile)
class AccountProfileAdmin(admin.ModelAdmin):
    list_display = ("user", "role", "created_at")
    list_filter = ("role",)
    search_fields = ("user__first_name", "user__last_name", "user__email")


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ("name", "code")
    search_fields = ("name", "code")


@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ("name", "industry", "location", "contact_person")
    search_fields = ("name", "industry", "location")


@admin.register(Supervisor)
class SupervisorAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "role", "department", "company")
    list_filter = ("role",)
    search_fields = ("name", "email")


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "registration_no", "department", "year_of_study", "status")
    list_filter = ("department", "status", "year_of_study")
    search_fields = ("first_name", "last_name", "registration_no", "email")


@admin.register(Placement)
class PlacementAdmin(admin.ModelAdmin):
    list_display = ("student", "company", "title", "start_date", "end_date", "status")
    list_filter = ("status", "company")
    search_fields = ("student__first_name", "student__last_name", "company__name", "title")


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    list_display = ("title", "placement", "week_number", "date", "hours_worked", "status")
    list_filter = ("status", "week_number")
    search_fields = ("title", "activities", "placement__student__first_name", "placement__student__last_name")


@admin.register(Evaluation)
class EvaluationAdmin(admin.ModelAdmin):
    list_display = ("placement", "evaluator_name", "evaluator_role", "period", "score", "status")
    list_filter = ("evaluator_role", "status", "period")


@admin.register(Visit)
class VisitAdmin(admin.ModelAdmin):
    list_display = ("placement", "supervisor", "scheduled_for", "status")
    list_filter = ("status", "scheduled_for")


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("title", "placement", "kind", "status")
    list_filter = ("kind", "status")
