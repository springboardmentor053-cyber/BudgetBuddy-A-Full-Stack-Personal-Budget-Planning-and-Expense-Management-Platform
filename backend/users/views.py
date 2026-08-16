from django.contrib.auth.models import User

from drf_spectacular.utils import (
    extend_schema,
    inline_serializer,
)

from rest_framework import serializers, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
)
from rest_framework.permissions import (
    AllowAny,
    IsAuthenticated,
)
from rest_framework.response import Response


# =====================================================
# REGISTER SERIALIZERS
# =====================================================

RegisterRequestSerializer = inline_serializer(
    name="RegisterRequest",
    fields={
        "username": serializers.CharField(),
        "email": serializers.EmailField(),
        "password": serializers.CharField(
            write_only=True
        ),
    },
)


MessageResponseSerializer = inline_serializer(
    name="UserMessageResponse",
    fields={
        "message": serializers.CharField(),
    },
)


ErrorResponseSerializer = inline_serializer(
    name="UserErrorResponse",
    fields={
        "error": serializers.CharField(),
    },
)


# =====================================================
# USER PROFILE SERIALIZER
# =====================================================

UserProfileSerializer = inline_serializer(
    name="UserProfileResponse",
    fields={
        "id": serializers.IntegerField(),
        "username": serializers.CharField(),
        "email": serializers.EmailField(),
    },
)


# =====================================================
# REGISTER
# =====================================================

@extend_schema(
    request=RegisterRequestSerializer,
    responses={
        201: MessageResponseSerializer,
        400: ErrorResponseSerializer,
    },
    auth=[],
    description="Register a new BudgetBuddy user.",
)
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):

    username = request.data.get("username")
    email = request.data.get("email")
    password = request.data.get("password")

    # -------------------------------------------------
    # CHECK REQUIRED FIELDS
    # -------------------------------------------------

    if not username or not email or not password:
        return Response(
            {
                "error": "All fields are required."
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -------------------------------------------------
    # CHECK USERNAME
    # -------------------------------------------------

    if User.objects.filter(
        username=username
    ).exists():

        return Response(
            {
                "error": "Username already exists"
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    # -------------------------------------------------
    # CREATE USER
    # -------------------------------------------------

    User.objects.create_user(
        username=username,
        email=email,
        password=password,
    )

    return Response(
        {
            "message": "User registered successfully"
        },
        status=status.HTTP_201_CREATED,
    )


# =====================================================
# CURRENT USER
# =====================================================

@extend_schema(
    responses={
        200: UserProfileSerializer,
    },
    description=(
        "Return the currently authenticated user's "
        "profile."
    ),
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):

    user = request.user

    return Response(
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        },
        status=status.HTTP_200_OK,
    )


# =====================================================
# PROTECTED TEST VIEW
# =====================================================

@extend_schema(
    responses={
        200: MessageResponseSerializer
    },
    description=(
        "Confirm that the supplied JWT access "
        "token is valid."
    ),
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):

    return Response(
        {
            "message": "You are authenticated"
        },
        status=status.HTTP_200_OK,
    )