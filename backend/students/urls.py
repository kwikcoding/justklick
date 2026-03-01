from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.views.decorators.csrf import csrf_exempt
from .views import StudentViewSet, send_otp, verify_otp

# Create a router and register the StudentViewSet
router = DefaultRouter()
router.register(r'', StudentViewSet, basename='student')

# The router will automatically generate the following URL patterns:
# - GET    /                   -> list all students
# - POST   /                   -> create a new student
# - GET    /{id}/              -> retrieve a specific student
# - PUT    /{id}/              -> update a student
# - PATCH  /{id}/              -> partially update a student
# - DELETE /{id}/              -> delete a student
# - GET    /stats/             -> get statistics (custom action)
# - GET    /departments/       -> get departments list (custom action)
# - GET    /export/            -> export all data (custom action)

urlpatterns = [
    path('send-otp/', csrf_exempt(send_otp), name='send-otp'),
    path('verify-otp/', csrf_exempt(verify_otp), name='verify-otp'),
    path('', include(router.urls)),
]