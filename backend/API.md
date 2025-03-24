# Task Manager API Documentation

## Base URL
```
http://localhost/api
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_token>
```

## Response Format
All responses are in JSON format and include a `status` field indicating success or error.

### Success Response Format
```json
{
    "status": "success",
    "message": "Optional success message",
    "data": {
        // Response data
    }
}
```

### Error Response Format
```json
{
    "status": "error",
    "message": "Error message",
    "errors": {
        // Validation errors if applicable
    }
}
```

## Authentication Endpoints

### Register User
Create a new user account.

**URL**: `/auth/register`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:
```json
{
    "name": "string",
    "email": "string",
    "password": "string",
    "password_confirmation": "string"
}
```

**Validation Rules**:
- name: required, max:255
- email: required, valid email, unique
- password: required, min:8
- password_confirmation: must match password

**Success Response (200)**:
```json
{
    "status": "success",
    "message": "User created successfully",
    "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
    },
    "authorization": {
        "token": "string",
        "type": "bearer"
    }
}
```

**Error Response (422)**:
```json
{
    "errors": {
        "email": ["The email has already been taken."],
        "password": ["The password must be at least 8 characters."]
    }
}
```

### Login
Authenticate a user and receive a JWT token.

**URL**: `/auth/login`  
**Method**: `POST`  
**Auth required**: No

**Request Body**:
```json
{
    "email": "string",
    "password": "string"
}
```

**Success Response (200)**:
```json
{
    "status": "success",
    "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
    },
    "authorization": {
        "token": "string",
        "type": "bearer"
    }
}
```

**Error Response (401)**:
```json
{
    "status": "error",
    "message": "Unauthorized"
}
```

### Logout
Invalidate the current JWT token.

**URL**: `/auth/logout`  
**Method**: `POST`  
**Auth required**: Yes

**Success Response (200)**:
```json
{
    "status": "success",
    "message": "Successfully logged out"
}
```

### Refresh Token
Get a new JWT token.

**URL**: `/auth/refresh`  
**Method**: `POST`  
**Auth required**: Yes

**Success Response (200)**:
```json
{
    "status": "success",
    "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
    },
    "authorization": {
        "token": "string",
        "type": "bearer"
    }
}
```

### Get User Profile
Get the authenticated user's profile.

**URL**: `/auth/user`  
**Method**: `GET`  
**Auth required**: Yes

**Success Response (200)**:
```json
{
    "status": "success",
    "user": {
        "id": "integer",
        "name": "string",
        "email": "string"
    }
}
```

## Task Endpoints

### List Tasks
Get a paginated list of tasks for the authenticated user.

**URL**: `/tasks`  
**Method**: `GET`  
**Auth required**: Yes

**Query Parameters**:
- search: string (optional) - Search in name and description
- status: string (optional) - Filter by status (To Do, In Progress, Done)
- due_date: date (optional) - Filter by due date
- sort_by: string (optional) - Field to sort by
- sort_direction: string (optional) - Sort direction (asc/desc)

**Success Response (200)**:
```json
{
    "status": "success",
    "tasks": {
        "current_page": "integer",
        "data": [
            {
                "id": "integer",
                "name": "string",
                "description": "string",
                "status": "string",
                "due_date": "datetime",
                "user_id": "integer",
                "created_at": "datetime",
                "updated_at": "datetime"
            }
        ],
        "per_page": "integer",
        "total": "integer"
    }
}
```

### Create Task
Create a new task.

**URL**: `/tasks`  
**Method**: `POST`  
**Auth required**: Yes

**Request Body**:
```json
{
    "name": "string",
    "description": "string",
    "status": "string (To Do, In Progress, Done)",
    "due_date": "datetime"
}
```

**Validation Rules**:
- name: required, max:255
- description: required
- status: required, in:To Do,In Progress,Done
- due_date: required, valid date

**Success Response (201)**:
```json
{
    "status": "success",
    "message": "Task created successfully",
    "task": {
        "id": "integer",
        "name": "string",
        "description": "string",
        "status": "string",
        "due_date": "datetime",
        "user_id": "integer",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
}
```

### Get Task
Get a specific task by ID.

**URL**: `/tasks/{id}`  
**Method**: `GET`  
**Auth required**: Yes

**Success Response (200)**:
```json
{
    "status": "success",
    "task": {
        "id": "integer",
        "name": "string",
        "description": "string",
        "status": "string",
        "due_date": "datetime",
        "user_id": "integer",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
}
```

### Update Task
Update a specific task.

**URL**: `/tasks/{id}`  
**Method**: `PUT`  
**Auth required**: Yes

**Request Body**:
```json
{
    "name": "string",
    "description": "string",
    "status": "string (To Do, In Progress, Done)",
    "due_date": "datetime"
}
```

**Success Response (200)**:
```json
{
    "status": "success",
    "message": "Task updated successfully",
    "task": {
        "id": "integer",
        "name": "string",
        "description": "string",
        "status": "string",
        "due_date": "datetime",
        "user_id": "integer",
        "created_at": "datetime",
        "updated_at": "datetime"
    }
}
```

### Delete Task
Delete a specific task.

**URL**: `/tasks/{id}`  
**Method**: `DELETE`  
**Auth required**: Yes

**Success Response (200)**:
```json
{
    "status": "success",
    "message": "Task deleted successfully"
}
```

## Search & Filtering Endpoints

### Search Tasks
Search and filter tasks with advanced criteria.

**URL**: `/api/tasks/search`  
**Method**: `GET`  
**Auth required**: Yes

**Query Parameters**:
- `q`: string (optional) - Full-text search query across name and description
- `status[]`: array (optional) - Filter by multiple status values (To Do, In Progress, Done)
- `date_from`: date (optional) - Filter tasks due after this date (format: YYYY-MM-DD)
- `date_to`: date (optional) - Filter tasks due before this date (format: YYYY-MM-DD)
- `sort`: string (optional) - Sort field (name, due_date, created_at, status)
- `order`: string (optional) - Sort order (asc, desc)
- `page`: integer (optional) - Page number for pagination (default: 1)
- `per_page`: integer (optional) - Items per page (default: 15, max: 50)

**Example Requests**:
```bash
# Basic search
GET /api/tasks/search?q=project

# Filter by status
GET /api/tasks/search?status[]=To Do&status[]=In Progress

# Date range and sorting
GET /api/tasks/search?date_from=2024-03-01&date_to=2024-03-31&sort=due_date&order=asc

# Combined search with pagination
GET /api/tasks/search?q=project&status[]=In Progress&date_from=2024-03-01&sort=due_date&order=asc&page=1&per_page=15
```

**Success Response (200)**:
```json
{
    "status": "success",
    "data": {
        "tasks": {
            "current_page": 1,
            "data": [
                {
                    "id": "integer",
                    "name": "string",
                    "description": "string",
                    "status": "string",
                    "due_date": "datetime",
                    "user_id": "integer",
                    "created_at": "datetime",
                    "updated_at": "datetime"
                }
            ],
            "first_page_url": "string",
            "from": "integer",
            "last_page": "integer",
            "last_page_url": "string",
            "next_page_url": "string|null",
            "path": "string",
            "per_page": "integer",
            "prev_page_url": "string|null",
            "to": "integer",
            "total": "integer"
        },
        "filters": {
            "search": "string|null",
            "status": "array",
            "date_range": {
                "from": "string|null",
                "to": "string|null"
            },
            "sort": {
                "field": "string",
                "order": "string"
            }
        }
    }
}
```

**Error Response (422)**:
```json
{
    "errors": {
        "sort": ["The selected sort is invalid."],
        "date_from": ["The date from is not a valid date."],
        "status.0": ["The selected status.0 is invalid."]
    }
}
```

### Task Statistics
Get statistics about tasks based on different criteria.

**URL**: `/api/tasks/stats`  
**Method**: `GET`  
**Auth required**: Yes

**Query Parameters**:
- `period`: string (optional) - Time period for statistics (today, week, month, year)
- `group_by`: string (optional) - Group statistics by field (status, due_date)

**Example Requests**:
```bash
# Get monthly statistics
GET /api/tasks/stats?period=month&group_by=status

# Get today's statistics
GET /api/tasks/stats?period=today
```

**Success Response (200)**:
```json
{
    "status": "success",
    "data": {
        "total_tasks": "integer",
        "by_status": {
            "To Do": "integer",
            "In Progress": "integer",
            "Done": "integer"
        },
        "overdue_tasks": "integer",
        "completed_tasks": "integer",
        "completion_rate": "float",
        "period": {
            "start": "datetime",
            "end": "datetime"
        }
    }
}
```

### Task Timeline
Get tasks organized in a timeline format.

**URL**: `/api/tasks/timeline`  
**Method**: `GET`  
**Auth required**: Yes

**Query Parameters**:
- `start_date`: date (required) - Start date for timeline (format: YYYY-MM-DD)
- `end_date`: date (required) - End date for timeline (format: YYYY-MM-DD)
- `group_by`: string (optional) - Group tasks by (day, week, month)

**Example Requests**:
```bash
# Get weekly timeline
GET /api/tasks/timeline?start_date=2024-03-01&end_date=2024-03-31&group_by=week

# Get daily timeline
GET /api/tasks/timeline?start_date=2024-03-01&end_date=2024-03-07&group_by=day
```

**Success Response (200)**:
```json
{
    "status": "success",
    "data": {
        "timeline": [
            {
                "period": {
                    "start": "datetime",
                    "end": "datetime"
                },
                "tasks": [
                    {
                        "id": "integer",
                        "name": "string",
                        "description": "string",
                        "status": "string",
                        "due_date": "datetime"
                    }
                ],
                "total_tasks": "integer",
                "completed_tasks": "integer"
            }
        ],
        "summary": {
            "total_periods": "integer",
            "total_tasks": "integer",
            "avg_tasks_per_period": "float"
        }
    }
}
```

**Error Response (422)**:
```json
{
    "errors": {
        "start_date": ["The start date field is required."],
        "end_date": ["The end date must be a date after or equal to start date."],
        "group_by": ["The selected group by is invalid."]
    }
}
```

## Error Codes
- 200: Success
- 201: Created
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 422: Validation Error
- 500: Server Error

## Testing
You can run the automated tests using:
```bash
php artisan test
```

## Rate Limiting
The API is rate-limited to 60 requests per minute per user/IP. 