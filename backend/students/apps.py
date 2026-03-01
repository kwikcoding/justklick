from django.apps import AppConfig


class StudentsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'students'
    verbose_name = 'Student Management'
    
    def ready(self):
        """Import signal handlers when app is ready."""
        try:
            import students.signals  # noqa
        except ImportError:
            pass