# School Data Backend

A Django REST Framework backend for managing student data with PostgreSQL database.

## Features

- **Django 4.2** - Modern Python web framework
- **Django REST Framework** - Powerful API toolkit
- **PostgreSQL** - Robust relational database
- **CORS Support** - Cross-origin resource sharing for frontend integration
- **Admin Interface** - Full-featured admin panel for managing student data

## Project Structure

```
backend/
|-- manage.py                 # Django management script
|-- requirements.txt          # Python dependencies
|-- .env.example              # Environment variables template
|-- schooldata/               # Django project settings
|   |-- __init__.py
|   |-- settings.py           # Project settings
|   |-- urls.py               # Main URL configuration
|   |-- wsgi.py               # WSGI application
|-- students/                 # Students app
    |-- __init__.py
    |-- admin.py              # Admin configuration
    |-- apps.py               # App configuration
    |-- models.py             # Database models
    |-- serializers.py        # API serializers
    |-- urls.py               # App URL routes
    |-- views.py              # API views
    |-- migrations/           # Database migrations
        |-- __init__.py
```

## Prerequisites

- Python 3.9+
- PostgreSQL 12+
- pip (Python package manager)

## Installation

### 1. Create a Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# or
venv\Scripts\activate     # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Set Up PostgreSQL Database

Create a PostgreSQL database:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create database
CREATE DATABASE schooldata;

-- Create user (optional)
CREATE USER schooluser WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE schooldata TO schooluser;
```

### 4. Configure Environment Variables

Copy the example environment file and update with your settings:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=schooldata
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

### 5. Run Database Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Admin Superuser

```bash
python manage.py createsuperuser
```

Follow the prompts to create an admin user.

### 7. Run the Development Server

```bash
python manage.py runserver
```

The API will be available at `http://localhost:8000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/` | API root with available endpoints |
| GET | `/api/students/` | List all students |
| POST | `/api/students/` | Create a new student |
| GET | `/api/students/{id}/` | Retrieve a specific student |
| PUT | `/api/students/{id}/` | Update a student |
| PATCH | `/api/students/{id}/` | Partially update a student |
| DELETE | `/api/students/{id}/` | Delete a student |
| GET | `/api/students/stats/` | Get student statistics |
| GET | `/api/students/departments/` | Get list of departments |
| GET | `/api/students/export/` | Export all student data |

### Query Parameters for Filtering

- `department` - Filter by department
- `year_of_study` - Filter by year of study
- `plan` - Filter by plan after graduation
- `career_goal` - Filter by career goal type
- `internship=true` - Filter students interested in internship
- `abroad=true` - Filter students interested in studying abroad
- `search` - Search by name or email

### Example API Request

```bash
# Create a new student
curl -X POST http://localhost:8000/api/students/ \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "John Doe",
    "fatherName": "James Doe",
    "email": "john.doe@example.com",
    "mobileNumber": "9876543210",
    "collegeCode": "COL001",
    "department": "Computer Science",
    "academicYear": "2023-2024",
    "yearOfStudy": "3rd Year",
    "cgpa": "8.5",
    "reasonForCourse": ["Career Growth", "Interest in Technology"],
    "areaOfInterest": ["AI/ML", "Web Development"],
    "skillsToDevelop": ["Python", "JavaScript"],
    "planAfterGraduation": "job",
    "interestedInAbroad": true,
    "preferredCountry": "USA",
    "careerGoalType": "technical",
    "internshipCompleted": false,
    "interestedInInternship": true,
    "hasCertifications": false
  }'
```

## Admin Interface

Access the admin panel at `http://localhost:8000/admin/`

Login with the superuser credentials created in step 6.

### Admin Features

- View all submitted student data
- Filter students by various criteria
- Search students by name, email, etc.
- Export student data as CSV
- Bulk actions for managing students
- Color-coded CGPA display

## Connecting with Frontend

The backend is configured with CORS support to allow connections from the frontend development server (typically running on `http://localhost:5173`).

Update the frontend to make API calls to `http://localhost:8000/api/students/`.

## Production Deployment

For production deployment:

1. Set `DEBUG=False` in `.env`
2. Use a proper `SECRET_KEY`
3. Configure `ALLOWED_HOSTS` with your domain
4. Use a production WSGI server (Gunicorn, uWSGI)
5. Set up proper CORS settings
6. Use HTTPS
7. Configure static file serving

Example Gunicorn setup:

```bash
pip install gunicorn
gunicorn schooldata.wsgi:application --bind 0.0.0.0:8000
```

## License

This project is for educational purposes.