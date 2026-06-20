# API Documentation

Complete API reference for the Project Management Web App.

## Base URL

```
Development: http://localhost:5000/api
Production: https://your-backend-url.com/api
```

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

### Success Response
```json
{
  "_id": "...",
  "name": "John Doe",
  "email": "john@example.com"
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new  user (student or teacher).

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "student",
  "semester": 5,
  "department": "Computer Science"
}
```

**Response (201):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "semester": 5,
  "department": "Computer Science",
  "token": "jwt_token_here"
}
```

### POST /api/auth/login

Login user.

**Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "token": "jwt_token_here"
}
```

### GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "user_id",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "student",
  "semester": 5,
  "department": "Computer Science",
  "projects": []
}
```

---

## Project Endpoints

### POST /api/projects/request

Submit a new project request (Students only).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "title": "E-Commerce Platform",
  "description": "A full-stack e-commerce solution with payment integration",
  "semester": 7,
  "guideId": "teacher_id_here"
}
```

**Response (201):**
```json
{
  "_id": "project_id",
  "title": "E-Commerce Platform",
  "description": "A full-stack e-commerce solution...",
  "guide": "teacher_id",
  "students": ["student_id"],
  "semester": 7,
  "status": "pending",
  "progress": 0,
  "createdAt": "2024-01-15T10:00:00.000Z"
}
```

### GET /api/projects/student

Get all projects for the authenticated student.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "project_id",
    "title": "E-Commerce Platform",
    "description": "...",
    "guide": {
      "_id": "teacher_id",
      "name": "Dr. Smith",
      "email": "smith@university.edu"
    },
    "status": "approved",
    "progress": 50,
    "semester": 7
  }
]
```

### GET /api/projects/teacher

Get all projects for the authenticated teacher.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "project_id",
    "title": "E-Commerce Platform",
    "students": [
      {
        "_id": "student_id",
        "name": "John Doe",
        "email": "john@example.com",
        "semester": 5,
        "department": "Computer Science"
      }
    ],
    "status": "approved",
    "progress": 50
  }
]
```

### GET /api/projects/:id

Get project details by ID.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "project_id",
  "title": "E-Commerce Platform",
  "description": "Full description...",
  "guide": {
    "_id": "teacher_id",
    "name": "Dr. Smith",
    "email": "smith@university.edu"
  },
  "students": [
    {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com"
    }
  ],
  "semester": 7,
  "status": "approved",
  "progress": 50,
  "startDate": "2024-01-15T10:00:00.000Z",
  "createdAt": "2024-01-10T10:00:00.000Z",
  "updatedAt": "2024-01-20T10:00:00.000Z"
}
```

### POST /api/projects/:id/approve

Approve a pending project (Teachers only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "project_id",
  "status": "approved",
  "startDate": "2024-01-20T10:00:00.000Z"
}
```

### POST /api/projects/:id/reject

Reject a project (Teachers only).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "reason": "Project scope is too broad for a single semester"
}
```

**Response (200):**
```json
{
  "_id": "project_id",
  "status": "rejected"
}
```

### PATCH /api/projects/:id/progress

Update project progress.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "progress": 60
}
```

**Response (200):**
```json
{
  "_id": "project_id",
  "progress": 60
}
```

### POST /api/projects/:id/complete

Mark project as completed (Teachers only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "project_id",
  "status": "completed",
  "progress": 100,
  "endDate": "2024-05-15T10:00:00.000Z"
}
```

---

## WPR (Weekly Progress Report) Endpoints

### POST /api/wpr/:projectId/submit

Submit a weekly progress report (Students only).

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "weekNumber": 3,
  "progressDescription": "Completed user authentication module and database integration",
  "file": "path/to/file.pdf"
}
```

**Response (201):**
```json
{
  "_id": "wpr_id",
  "project": "project_id",
  "weekNumber": 3,
  "progressDescription": "Completed user authentication...",
  "submittedBy": "student_id",
  "date": "2024-02-01T10:00:00.000Z"
}
```

### GET /api/wpr/:projectId

Get all WPRs for a project.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "_id": "wpr_id",
    "project": "project_id",
    "weekNumber": 1,
    "progressDescription": "Initial setup and requirements gathering",
    "submittedBy": {
      "_id": "student_id",
      "name": "John Doe",
      "email": "john@example.com"
    },
    "date": "2024-01-20T10:00:00.000Z"
  }
]
```

### GET /api/wpr/:projectId/:id

Get a specific WPR.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "_id": "wpr_id",
  "project": "project_id",
  "weekNumber": 3,
  "progressDescription": "Completed user authentication...",
  "submittedBy": {
    "_id": "student_id",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "file": "uploads/wpr-1234567890-report.pdf",
  "date": "2024-02-01T10:00:00.000Z"
}
```

### DELETE /api/wpr/:projectId/:id

Delete a WPR (Teachers only).

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "WPR deleted successfully"
}
```

---

## Analytics Endpoints

### GET /api/analytics/teacher

Get comprehensive analytics for a teacher.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "statistics": {
    "totalProjects": 12,
    "pendingProjects": 3,
    "approvedProjects": 5,
    "completedProjects": 3,
    "rejectedProjects": 1,
    "avgProgress": 45
  },
  "pendingApprovals": [
    {
      "_id": "project_id",
      "title": "New Project",
      "students": [...],
      "semester": 5
    }
  ],
  "recentWPRs": [...],
  "charts": {
    "statusDistribution": {
      "pending": 3,
      "approved": 5,
      "completed": 3,
      "rejected": 1
    },
    "progressRanges": {
      "0-25%": 4,
      "26-50%": 3,
      "51-75%": 3,
      "76-100%": 2
    }
  },
  "projects": [...]
}
```

### GET /api/analytics/student/:studentId

Get analytics for a student.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "statistics": {
    "totalProjects": 2,
    "activeProjects": 1,
    "completedProjects": 0,
    "pendingProjects": 1,
    "avgProgress": 35,
    "totalWPRs": 4
  },
  "recentWPRs": [...],
  "projects": [...]
}
```

### GET /api/analytics/dashboard

Get quick dashboard statistics.

**Headers:** `Authorization: Bearer <token>`

**Response (200) - Student:**
```json
{
  "activeProjects": 1,
  "completedProjects": 0,
  "totalProjects": 2,
  "avgProgress": 35
}
```

**Response (200) - Teacher:**
```json
{
  "pendingApprovals": 3,
  "activeProjects": 5,
  "totalProjects": 12
}
```

---

## Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Server Error |

## Rate Limiting

Currently no rate limiting is implemented. For production, consider adding rate limiting middleware.
