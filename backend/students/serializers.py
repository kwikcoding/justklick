from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    """
    Serializer for the Student model.
    Handles conversion between JSON and Student instances.
    """
    
    # Map frontend field names to backend field names
    fullName = serializers.CharField(source='full_name', required=True)
    fatherName = serializers.CharField(source='father_name', required=True)
    mobileNumber = serializers.CharField(source='mobile_number', required=True)
    gender = serializers.CharField(required=True)
    collegeCode = serializers.CharField(source='college_code', required=True)
    academicYear = serializers.CharField(source='academic_year', required=True)
    yearOfStudy = serializers.CharField(source='year_of_study', required=True)
    reasonForCourse = serializers.ListField(
        source='reason_for_course', 
        child=serializers.CharField(),
        required=False,
        default=list
    )
    areaOfInterest = serializers.ListField(
        source='area_of_interest', 
        child=serializers.CharField(),
        required=False,
        default=list
    )
    skillsToDevelop = serializers.ListField(
        source='skills_to_develop', 
        child=serializers.CharField(),
        required=False,
        default=list
    )
    planAfterGraduation = serializers.CharField(source='plan_after_graduation', required=True)
    interestedInAbroad = serializers.BooleanField(source='interested_in_abroad', default=False)
    preferredCountry = serializers.CharField(source='preferred_country', required=False, allow_null=True, allow_blank=True)
    careerGoalType = serializers.CharField(source='career_goal_type', required=True)
    internshipCompleted = serializers.BooleanField(source='internship_completed', default=False)
    interestedInInternship = serializers.BooleanField(source='interested_in_internship', default=True)
    hasCertifications = serializers.BooleanField(source='has_certifications', default=False)
    
    # Read-only computed fields
    planAfterGraduationDisplay = serializers.CharField(
        source='get_plan_after_graduation_display', 
        read_only=True
    )
    careerGoalTypeDisplay = serializers.CharField(
        source='get_career_goal_type_display', 
        read_only=True
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id',
            # Personal Information
            'fullName', 'fatherName', 'email', 'mobileNumber', 'gender',
            # Academic Information
            'collegeCode', 'department', 'academicYear', 'yearOfStudy', 'cgpa',
            # Course Interest & Skills
            'reasonForCourse', 'areaOfInterest', 'skillsToDevelop',
            # Future Plans
            'planAfterGraduation', 'interestedInAbroad', 'preferredCountry', 'careerGoalType',
            # Additional Information
            'internshipCompleted', 'interestedInInternship', 'hasCertifications',
            # Read-only fields
            'planAfterGraduationDisplay', 'careerGoalTypeDisplay',
            'createdAt', 'updatedAt',
        ]
    
    def validate_cgpa(self, value):
        """Validate CGPA is between 0 and 10."""
        if value < 0 or value > 10:
            raise serializers.ValidationError("CGPA must be between 0 and 10.")
        return value
    
    def validate_mobileNumber(self, value):
        """Validate mobile number format."""
        if not value.isdigit():
            raise serializers.ValidationError("Mobile number must contain only digits.")
        if len(value) < 10 or len(value) > 15:
            raise serializers.ValidationError("Mobile number must be between 10 and 15 digits.")
        return value
    
    def validate(self, data):
        """Cross-field validation."""
        # If interested in abroad, preferred country should be provided
        if data.get('interested_in_abroad') and not data.get('preferred_country'):
            raise serializers.ValidationError({
                'preferredCountry': 'Preferred country is required when interested in studying abroad.'
            })
        return data


class StudentListSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for listing students.
    """
    fullName = serializers.CharField(source='full_name')
    mobileNumber = serializers.CharField(source='mobile_number')
    yearOfStudy = serializers.CharField(source='year_of_study')
    planAfterGraduationDisplay = serializers.CharField(
        source='get_plan_after_graduation_display', 
        read_only=True
    )
    careerGoalTypeDisplay = serializers.CharField(
        source='get_career_goal_type_display', 
        read_only=True
    )
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    class Meta:
        model = Student
        fields = [
            'id', 'fullName', 'email', 'mobileNumber', 'department', 
            'yearOfStudy', 'cgpa', 'planAfterGraduationDisplay', 
            'careerGoalTypeDisplay', 'createdAt'
        ]