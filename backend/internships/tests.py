from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient

from .models import Company, Department, Evaluation, LogEntry, Placement, Student


class InternshipApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.department = Department.objects.create(name="Computer Science", code="CS")
        self.company = Company.objects.create(name="Cloud Labs", industry="Cloud", location="Nairobi")
        self.student = Student.objects.create(
            first_name="Amina",
            last_name="Kamau",
            registration_no="STU-100",
            email="amina@example.com",
            department=self.department,
            status=Student.ACTIVE,
        )
        self.placement = Placement.objects.create(
            student=self.student,
            company=self.company,
            title="Backend intern",
            start_date="2026-01-01",
            end_date="2026-03-31",
            status=Placement.ACTIVE,
        )

    def test_stats_endpoint_returns_core_counts(self):
        LogEntry.objects.create(
            placement=self.placement,
            week_number=1,
            date="2026-01-08",
            title="Week one",
            activities="Set up tools",
            status=LogEntry.SUBMITTED,
            hours_worked=32,
        )

        response = self.client.get(reverse("dashboard-stats"))

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["total_students"], 1)
        self.assertEqual(response.data["active_placements"], 1)
        self.assertEqual(response.data["pending_logs"], 1)
        self.assertEqual(response.data["total_hours"], 32.0)

    def test_rejects_invalid_placement_dates(self):
        response = self.client.post(
            "/api/placements/",
            {
                "student": self.student.id,
                "company": self.company.id,
                "title": "Invalid placement",
                "start_date": "2026-04-01",
                "end_date": "2026-03-01",
                "status": Placement.ACTIVE,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("end_date", response.data)

    def test_updates_log_status(self):
        log = LogEntry.objects.create(
            placement=self.placement,
            week_number=1,
            date="2026-01-08",
            title="Week one",
            activities="Set up tools",
            status=LogEntry.SUBMITTED,
            hours_worked=32,
        )

        response = self.client.patch(f"/api/logs/{log.id}/", {"status": LogEntry.REVIEWED}, format="json")

        self.assertEqual(response.status_code, 200)
        log.refresh_from_db()
        self.assertEqual(log.status, LogEntry.REVIEWED)

    def test_evaluation_score_is_average_of_criteria(self):
        evaluation = Evaluation.objects.create(
            placement=self.placement,
            evaluator_name="Alex Smith",
            evaluator_role="industry",
            period="Midterm",
            professionalism=4,
            technical_skill=5,
            communication=4,
            problem_solving=3,
            attendance=4,
        )

        self.assertEqual(evaluation.score, 4.0)

    def test_signup_then_login_returns_user_profile(self):
        payload = {
            "first_name": "Mary",
            "last_name": "Otieno",
            "email": "mary.otieno@example.com",
            "password": "secret123",
            "role": "Student",
        }

        signup_response = self.client.post("/api/auth/signup/", payload, format="json")
        login_response = self.client.post(
            "/api/auth/login/",
            {"email": payload["email"], "password": payload["password"]},
            format="json",
        )

        self.assertEqual(signup_response.status_code, 201)
        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(login_response.data["name"], "Mary Otieno")
        self.assertEqual(login_response.data["role"], "Student")
