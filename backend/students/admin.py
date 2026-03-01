from django.contrib import admin
from django.utils.html import format_html
from .models import Student


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    """
    Admin configuration for the Student model.
    Provides a comprehensive interface for viewing and managing student data.
    """
    
    # List display configuration
    list_display = [
        'id', 'full_name', 'email', 'mobile_number', 'department',
        'year_of_study', 'cgpa_display', 'plan_after_graduation', 
        'career_goal_type', 'created_at_display'
    ]
    
    list_display_links = ['id', 'full_name']
    
    # Filtering options
    list_filter = [
        'department', 'year_of_study', 'plan_after_graduation',
        'career_goal_type', 'interested_in_abroad', 'internship_completed',
        'interested_in_internship', 'has_certifications', 'created_at'
    ]
    
    # Search fields
    search_fields = [
        'full_name', 'father_name', 'email', 'mobile_number',
        'college_code', 'preferred_country'
    ]
    
    # Ordering
    ordering = ['-created_at']
    
    # Pagination
    list_per_page = 25
    list_max_show_all = 100
    
    # Read-only fields
    readonly_fields = ['created_at', 'updated_at', 'id']
    
    # Fieldsets for detailed view
    fieldsets = (
        ('Personal Information', {
            'fields': ('full_name', 'father_name', 'email', 'mobile_number'),
            'classes': ('wide',),
        }),
        ('Academic Information', {
            'fields': ('college_code', 'department', 'academic_year', 'year_of_study', 'cgpa'),
            'classes': ('wide',),
        }),
        ('Course Interest & Skills', {
            'fields': ('reason_for_course', 'area_of_interest', 'skills_to_develop'),
            'classes': ('wide',),
            'description': 'These fields are stored as JSON arrays.',
        }),
        ('Future Plans', {
            'fields': ('plan_after_graduation', 'interested_in_abroad', 'preferred_country', 'career_goal_type'),
            'classes': ('wide',),
        }),
        ('Additional Information', {
            'fields': ('internship_completed', 'interested_in_internship', 'has_certifications'),
            'classes': ('wide',),
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Custom display methods
    def cgpa_display(self, obj):
        """Display CGPA with color coding."""
        cgpa = float(obj.cgpa)
        if cgpa >= 9.0:
            color = 'green'
        elif cgpa >= 7.0:
            color = 'blue'
        elif cgpa >= 5.0:
            color = 'orange'
        else:
            color = 'red'
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            color, f'{cgpa:.2f}'
        )
    cgpa_display.short_description = 'CGPA'
    cgpa_display.admin_order_field = 'cgpa'
    
    def created_at_display(self, obj):
        """Display created date in readable format."""
        return obj.created_at.strftime('%Y-%m-%d %H:%M')
    created_at_display.short_description = 'Registered On'
    created_at_display.admin_order_field = 'created_at'
    
    # Actions
    actions = ['export_as_csv', 'mark_as_internship_interested']
    
    def export_as_csv(self, request, queryset):
        """Export selected students as CSV."""
        import csv
        from django.http import HttpResponse
        
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="students.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Full Name', 'Father Name', 'Email', 'Mobile Number',
            'College Code', 'Department', 'Academic Year', 'Year of Study', 'CGPA',
            'Plan After Graduation', 'Career Goal', 'Interested in Abroad',
            'Preferred Country', 'Internship Completed', 'Created At'
        ])
        
        for student in queryset:
            writer.writerow([
                student.id, student.full_name, student.father_name,
                student.email, student.mobile_number, student.college_code,
                student.department, student.academic_year, student.year_of_study,
                student.cgpa, student.get_plan_after_graduation_display(),
                student.get_career_goal_type_display(),
                'Yes' if student.interested_in_abroad else 'No',
                student.preferred_country or 'N/A',
                'Yes' if student.internship_completed else 'No',
                student.created_at.strftime('%Y-%m-%d %H:%M')
            ])
        
        return response
    export_as_csv.short_description = 'Export selected students as CSV'
    
    def mark_as_internship_interested(self, request, queryset):
        """Mark selected students as interested in internship."""
        count = queryset.update(interested_in_internship=True)
        self.message_user(request, f'{count} student(s) marked as interested in internship.')
    mark_as_internship_interested.short_description = 'Mark as internship interested'
    
    # Customize admin site headers
    class Media:
        css = {
            'all': ('admin/css/custom.css',)
        }


# Customize admin site
admin.site.site_header = "School Data Administration"
admin.site.site_title = "School Data Admin"
admin.site.index_title = "Welcome to School Data Management Portal"