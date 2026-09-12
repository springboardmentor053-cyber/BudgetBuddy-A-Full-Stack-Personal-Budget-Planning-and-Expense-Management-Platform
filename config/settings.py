"""
Django settings for config project.
"""

import os
import dj_database_url

from pathlib import Path

from dotenv import load_dotenv


# =====================================================
# BASE DIRECTORY
# =====================================================

BASE_DIR = Path(__file__).resolve().parent.parent


# =====================================================
# LOAD ENVIRONMENT VARIABLES
# =====================================================

# Only load .env for local development.
# On Render, environment variables are injected directly.
_env_path = BASE_DIR / ".env"
if _env_path.exists():
    load_dotenv(_env_path)

# =====================================================
# SECURITY
# =====================================================

SECRET_KEY = os.getenv(
    "SECRET_KEY"
)

DEBUG = os.getenv(
    "DEBUG",
    "False"
).lower() == "true"


# =====================================================
# ALLOWED HOSTS
# =====================================================

ALLOWED_HOSTS = [
    "localhost",
    "127.0.0.1",
    ".onrender.com",
]

if os.getenv("RENDER_EXTERNAL_HOSTNAME"):
    ALLOWED_HOSTS.append(os.getenv("RENDER_EXTERNAL_HOSTNAME"))


# =====================================================
# APPLICATIONS
# =====================================================

INSTALLED_APPS = [

    "django.contrib.admin",

    "django.contrib.auth",

    "django.contrib.contenttypes",

    "django.contrib.sessions",

    "django.contrib.messages",

    "django.contrib.staticfiles",


    # Third-party

    "rest_framework",

    "corsheaders",


    # Project apps

    "users",

    "expenses",

    "budgets",

    "reports",

    "income",

    "savings",

    "notifications",

    "analytics",

]


# =====================================================
# MIDDLEWARE
# =====================================================

MIDDLEWARE = [

    "django.middleware.security.SecurityMiddleware",

    "whitenoise.middleware.WhiteNoiseMiddleware",

    "corsheaders.middleware.CorsMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",

    "django.middleware.common.CommonMiddleware",

    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",

    "django.contrib.messages.middleware.MessageMiddleware",

    "django.middleware.clickjacking.XFrameOptionsMiddleware",

]


# =====================================================
# URL CONFIGURATION
# =====================================================

ROOT_URLCONF = "config.urls"


# =====================================================
# TEMPLATES
# =====================================================

TEMPLATES = [

    {

        "BACKEND":
            "django.template.backends.django.DjangoTemplates",

        "DIRS": [],

        "APP_DIRS": True,

        "OPTIONS": {

            "context_processors": [

                "django.template.context_processors.request",

                "django.contrib.auth.context_processors.auth",

                "django.contrib.messages.context_processors.messages",

            ],

        },

    },

]


# =====================================================
# WSGI
# =====================================================

WSGI_APPLICATION = "config.wsgi.application"


# =====================================================
# DATABASE
# =====================================================

# Render injects DATABASE_URL automatically.
# Locally, fall back to individual DB_* vars from .env.

_database_url = os.environ.get("DATABASE_URL")

# psycopg2 requires 'postgresql://' not 'postgres://'
if _database_url and _database_url.startswith("postgres://"):
    _database_url = _database_url.replace("postgres://", "postgresql://", 1)

if _database_url:
    DATABASES = {
        "default": dj_database_url.parse(
            _database_url,
            conn_max_age=600,
            ssl_require=not DEBUG,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "budgetbuddy"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", ""),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }


# =====================================================
# PASSWORD VALIDATION
# =====================================================

AUTH_PASSWORD_VALIDATORS = [

    {

        "NAME":
            "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",

    },

    {

        "NAME":
            "django.contrib.auth.password_validation.MinimumLengthValidator",

    },

    {

        "NAME":
            "django.contrib.auth.password_validation.CommonPasswordValidator",

    },

    {

        "NAME":
            "django.contrib.auth.password_validation.NumericPasswordValidator",

    },

]


# =====================================================
# INTERNATIONALIZATION
# =====================================================

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_I18N = True

USE_TZ = True


# =====================================================
# STATIC FILES
# =====================================================

STATIC_URL = "static/"

STATIC_ROOT = BASE_DIR / "staticfiles"

STATICFILES_STORAGE = (
    "whitenoise.storage.CompressedManifestStaticFilesStorage"
)


# =====================================================
# REST FRAMEWORK
# =====================================================

REST_FRAMEWORK = {

    "DEFAULT_AUTHENTICATION_CLASSES": (

        "rest_framework_simplejwt.authentication.JWTAuthentication",

    ),

}


# =====================================================
# CORS
# =====================================================

CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOWED_ORIGINS",
        "http://localhost:5173"
    ).split(",")
    if origin.strip()
]

CORS_ALLOW_CREDENTIALS = True


# =====================================================
# EMAIL
# =====================================================

EMAIL_BACKEND = (
    "django.core.mail.backends.smtp.EmailBackend"
)

EMAIL_HOST = "smtp.gmail.com"

EMAIL_PORT = 465

EMAIL_USE_TLS = False
EMAIL_USE_SSL = True

EMAIL_HOST_USER = os.getenv(
    "EMAIL_HOST_USER"
)

EMAIL_HOST_PASSWORD = os.getenv(
    "EMAIL_HOST_PASSWORD"
)

DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL"
)
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"