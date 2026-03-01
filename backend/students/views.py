from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.db.models import Count, Avg, Q
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from datetime import timedelta
from django.core.cache import cache
import random

from .models import Student
from .serializers import StudentSerializer, StudentListSerializer


# In-memory OTP storage (use Redis in production)
otp_storage = {}


@api_view(['POST'])
def send_otp(request):
    """
    Send OTP to the provided mobile number.
    Endpoint: POST /api/students/send-otp/
    Body: {"mobile": "9848098480"}
    """
    mobile = request.data.get('mobile')
    
    if not mobile:
        return Response({'error': 'Mobile number is required'}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(mobile) != 10 or not mobile.isdigit():
        return Response({'error': 'Please enter a valid 10-digit mobile number'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Generate 4-digit OTP (for demo, always return 1234)
    otp = '1234'
    
    # Store OTP with mobile number (expires in 5 minutes)
    otp_storage[mobile] = {
        'otp': otp,
        'expires_at': timezone.now() + timedelta(minutes=5)
    }
    
    return Response({
        'success': True,
        'message': f'OTP sent successfully to {mobile}',
        # In production, don't return the OTP in response
        'otp': otp  # For demo purposes only
    })


@api_view(['POST'])
def verify_otp(request):
    """
    Verify OTP for the provided mobile number.
    Endpoint: POST /api/students/verify-otp/
    Body: {"mobile": "9848098480", "otp": "1234"}
    """
    mobile = request.data.get('mobile')
    otp = request.data.get('otp')
    
    if not mobile or not otp:
        return Response({'error': 'Mobile number and OTP are required'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP exists
    stored_data = otp_storage.get(mobile)
    
    if not stored_data:
        return Response({'error': 'OTP not found. Please request a new OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Check if OTP expired
    if timezone.now() > stored_data['expires_at']:
        del otp_storage[mobile]
        return Response({'error': 'OTP has expired. Please request a new OTP'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Verify OTP
    if stored_data['otp'] != otp:
        return Response({'error': 'Invalid OTP. Please try again'}, status=status.HTTP_400_BAD_REQUEST)
    
    # OTP verified successfully - remove from storage
    del otp_storage[mobile]
    
    return Response({
        'success': True,
        'message': 'OTP verified successfully',
        'mobile': mobile
    })


@method_decorator(csrf_exempt, name='dispatch')
class StudentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for handling Student CRUD operations.
    
    Provides the following endpoints:
    - GET /api/students/ - List all students
    - POST /api/students/ - Create a new student
    - GET /api/students/{id}/ - Retrieve a specific student
    - PUT /api/students/{id}/ - Update a student
    - PATCH /api/students/{id}/ - Partially update a student
    - DELETE /api/students/{id}/ - Delete a student
    - GET /api/students/stats/ - Get statistics about students
    """
    
    queryset = Student.objects.all()
    
    def get_serializer_class(self):
        """Use different serializers for list and detail views."""
        if self.action == 'list':
            return StudentListSerializer
        return StudentSerializer
    
    def get_queryset(self):
        """Filter queryset based on query parameters."""
        queryset = Student.objects.all()
        
        # Filter by department
        department = self.request.query_params.get('department')
        if department:
            queryset = queryset.filter(department=department)
        
        # Filter by year of study
        year_of_study = self.request.query_params.get('year_of_study')
        if year_of_study:
            queryset = queryset.filter(year_of_study=year_of_study)
        
        # Filter by plan after graduation
        plan = self.request.query_params.get('plan')
        if plan:
            queryset = queryset.filter(plan_after_graduation=plan)
        
        # Filter by career goal
        career_goal = self.request.query_params.get('career_goal')
        if career_goal:
            queryset = queryset.filter(career_goal_type=career_goal)
        
        # Filter by internship interest
        internship = self.request.query_params.get('internship')
        if internship and internship.lower() == 'true':
            queryset = queryset.filter(interested_in_internship=True)
        
        # Filter by abroad interest
        abroad = self.request.query_params.get('abroad')
        if abroad and abroad.lower() == 'true':
            queryset = queryset.filter(interested_in_abroad=True)
        
        # Search by name or email
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(full_name__icontains=search) | 
                Q(email__icontains=search)
            )
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get statistics about students.
        Endpoint: GET /api/students/stats/
        """
        total_students = Student.objects.count()
        
        # Department-wise distribution
        department_stats = Student.objects.values('department').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Year of study distribution
        year_stats = Student.objects.values('year_of_study').annotate(
            count=Count('id')
        ).order_by('year_of_study')
        
        # Plan after graduation distribution
        plan_stats = Student.objects.values('plan_after_graduation').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Career goal distribution
        career_stats = Student.objects.values('career_goal_type').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # Average CGPA
        avg_cgpa = Student.objects.aggregate(avg_cgpa=Avg('cgpa'))['avg_cgpa'] or 0
        
        # Students interested in internship
        internship_count = Student.objects.filter(interested_in_internship=True).count()
        
        # Students interested in abroad
        abroad_count = Student.objects.filter(interested_in_abroad=True).count()
        
        # Recent registrations (last 7 days)
        week_ago = timezone.now() - timedelta(days=7)
        recent_count = Student.objects.filter(created_at__gte=week_ago).count()
        
        return Response({
            'total_students': total_students,
            'average_cgpa': round(avg_cgpa, 2),
            'department_distribution': list(department_stats),
            'year_distribution': list(year_stats),
            'plan_distribution': list(plan_stats),
            'career_goal_distribution': list(career_stats),
            'internship_interested': internship_count,
            'abroad_interested': abroad_count,
            'recent_registrations': recent_count,
        })
    
    @action(detail=False, methods=['get'])
    def departments(self, request):
        """
        Get list of unique departments.
        Endpoint: GET /api/students/departments/
        """
        departments = Student.objects.values_list('department', flat=True).distinct().order_by('department')
        return Response({'departments': list(departments)})
    
    @action(detail=False, methods=['get'])
    def export(self, request):
        """
        Export all student data (for CSV/Excel export on frontend).
        Endpoint: GET /api/students/export/
        """
        students = Student.objects.all()
        serializer = StudentSerializer(students, many=True)
        return Response({
            'count': students.count(),
            'data': serializer.data
        })