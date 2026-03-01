from django.db import models


class Student(models.Model):
    """
    Student model to store all student form data.
    """
    
    # Personal Information
    full_name = models.CharField(max_length=255, verbose_name="Full Name")
    father_name = models.CharField(max_length=255, verbose_name="Father's Name")
    email = models.EmailField(unique=True, verbose_name="Email Address")
    mobile_number = models.CharField(max_length=15, verbose_name="Mobile Number")
    
    GENDER_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
    ]
    gender = models.CharField(
        max_length=10,
        choices=GENDER_CHOICES,
        default='Male',
        verbose_name="Gender"
    )
    
    # Academic Information
    college_code = models.CharField(max_length=50, verbose_name="College Code")
    department = models.CharField(max_length=100, verbose_name="Department")
    academic_year = models.CharField(max_length=20, verbose_name="Academic Year")
    year_of_study = models.CharField(max_length=20, verbose_name="Year of Study")
    cgpa = models.DecimalField(max_digits=4, decimal_places=2, verbose_name="CGPA")
    
    # Course Interest & Skills (stored as JSON arrays)
    reason_for_course = models.JSONField(default=list, verbose_name="Reasons for Course")
    area_of_interest = models.JSONField(default=list, verbose_name="Areas of Interest")
    skills_to_develop = models.JSONField(default=list, verbose_name="Skills to Develop")
    
    # Future Plans
    PLAN_CHOICES = [
        ('Higher Studies in India', 'Higher Studies in India'),
        ('Higher Studies Abroad', 'Higher Studies Abroad'),
        ('Job in India', 'Job in India'),
        ('Job Abroad', 'Job Abroad'),
        ('Start a Business', 'Start a Business'),
        ('Competitive Exams', 'Competitive Exams'),
        ('Not Decided', 'Not Decided'),
    ]
    plan_after_graduation = models.CharField(
        max_length=100, 
        choices=PLAN_CHOICES, 
        verbose_name="Plan After Graduation"
    )
    
    interested_in_abroad = models.BooleanField(
        default=False, 
        verbose_name="Interested in Studying Abroad"
    )
    preferred_country = models.CharField(
        max_length=100, 
        blank=True, 
        null=True, 
        verbose_name="Preferred Country"
    )
    
    CAREER_GOAL_CHOICES = [
        ('Technical Career', 'Technical Career'),
        ('Management Career', 'Management Career'),
        ('Research Career', 'Research Career'),
        ('Government Sector', 'Government Sector'),
        ('Business / Startup', 'Business / Startup'),
        ('Undecided', 'Undecided'),
    ]
    career_goal_type = models.CharField(
        max_length=100, 
        choices=CAREER_GOAL_CHOICES, 
        verbose_name="Career Goal Type"
    )
    
    # Additional Information
    internship_completed = models.BooleanField(
        default=False, 
        verbose_name="Internship Completed"
    )
    interested_in_internship = models.BooleanField(
        default=True, 
        verbose_name="Interested in Internship"
    )
    has_certifications = models.BooleanField(
        default=False, 
        verbose_name="Has Certifications"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created At")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated At")
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Student"
        verbose_name_plural = "Students"
    
    def __str__(self):
        return f"{self.full_name} - {self.department}"
    
    def get_plan_after_graduation_display(self):
        """Return human-readable plan after graduation."""
        return dict(self.PLAN_CHOICES).get(self.plan_after_graduation, self.plan_after_graduation)
    
    def get_career_goal_type_display(self):
        """Return human-readable career goal type."""
        return dict(self.CAREER_GOAL_CHOICES).get(self.career_goal_type, self.career_goal_type)
