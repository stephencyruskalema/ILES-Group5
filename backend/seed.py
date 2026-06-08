#!/usr/bin/env python3
"""Backend-level seeding helper.

Usage:
  python backend/seed.py [--noinput] [--demo] [--username USERNAME --email EMAIL --password PASSWORD]

This script will:
- run Django migrations
- optionally run the `seed_demo` management command
- optionally create a superuser (idempotent)

It invokes `manage.py` in the backend package and uses Django's ORM
to create a superuser in-process.
"""
from __future__ import annotations

import argparse
import os
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parent
MANAGE_PY = ROOT / "manage.py"


def run_manage_cmd(*args: str) -> None:
    cmd = [sys.executable, str(MANAGE_PY), *args]
    print(f"Running: {' '.join(cmd)}")
    subprocess.run(cmd, check=True)


def ensure_migrations() -> None:
    run_manage_cmd("migrate", "--noinput")


def run_seed_demo() -> None:
    run_manage_cmd("seed_demo")


def create_superuser(username: str, email: str, password: str) -> None:
    # Ensure backend package is importable (so settings/backend modules resolve)
    backend_path = str(ROOT)
    if backend_path not in sys.path:
        sys.path.insert(0, backend_path)

    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

    try:
        import django

        django.setup()
        from django.contrib.auth import get_user_model

        User = get_user_model()
        if User.objects.filter(username=username).exists():
            print(f"Superuser '{username}' already exists — skipping creation.")
            return

        print(f"Creating superuser '{username}'...")
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Superuser created.")
    except Exception as exc:
        print("Failed to create superuser in-process:", exc)
        print("Falling back to `createsuperuser --noinput` via manage.py")
        env = os.environ.copy()
        env.update(
            {
                "DJANGO_SUPERUSER_USERNAME": username,
                "DJANGO_SUPERUSER_EMAIL": email,
                "DJANGO_SUPERUSER_PASSWORD": password,
            }
        )
        cmd = [sys.executable, str(MANAGE_PY), "createsuperuser", "--noinput"]
        subprocess.run(cmd, check=True, env=env)


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed the database and create a superuser.")
    parser.add_argument("--noinput", action="store_true", help="Skip prompts and interactive steps")
    parser.add_argument("--demo", action="store_true", help="Run the demo seeding command (seed_demo)")
    parser.add_argument("--username", help="Superuser username to create")
    parser.add_argument("--email", help="Superuser email")
    parser.add_argument("--password", help="Superuser password")

    args = parser.parse_args()

    # 1. Migrate
    ensure_migrations()

    # 2. Run demo seed if requested
    if args.demo:
        run_seed_demo()

    # 3. Create superuser if credentials provided (or interactive when not --noinput)
    if args.username and args.email and args.password:
        create_superuser(args.username, args.email, args.password)
    elif not args.noinput and not (args.username or args.email or args.password):
        # Offer interactive creation
        try:
            resp = input("Create an admin superuser now? [y/N]: ")
        except KeyboardInterrupt:
            resp = "n"
        if resp.lower().startswith("y"):
            uname = input("username: ")
            mail = input("email: ")
            pwd = input("password: ")
            create_superuser(uname, mail, pwd)


if __name__ == "__main__":
    main()
