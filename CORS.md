# Cross-Origin Resource Sharing (CORS) Implementation

This document explains how Cross-Origin Resource Sharing (CORS) is implemented in our Task Manager application.

## Architecture Overview

CORS is handled through multiple layers in this application:

```
Frontend (port 3000) <---> Nginx (port 9000) <---> Backend (PHP-FPM)
```

## 1. Nginx Configuration (Primary CORS Handler)

The main CORS handling happens in the Nginx configuration (`nginx/default.conf`), which:

### Adding CORS Headers

```nginx
# Add CORS headers
add_header 'Access-Control-Allow-Origin' '*' always;
add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH' always;
add_header 'Access-Control-Allow-Headers' 'Authorization, X-Requested-With, Content-Type, Accept, Origin, X-XSRF-TOKEN' always;
add_header 'Access-Control-Allow-Credentials' 'true' always;
add_header 'Access-Control-Expose-Headers' 'Authorization' always;
add_header 'Access-Control-Max-Age' '86400' always;
```

### Handling Preflight Requests

```nginx
# Handle preflight OPTIONS requests
if ($request_method = 'OPTIONS') {
    add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS, PATCH';
    add_header 'Access-Control-Allow-Headers' 'Authorization, X-Requested-With, Content-Type, Accept, Origin, X-XSRF-TOKEN';
    add_header 'Access-Control-Allow-Credentials' 'true';
    add_header 'Access-Control-Expose-Headers' 'Authorization';
    add_header 'Access-Control-Max-Age' '86400';
    add_header 'Content-Type' 'text/plain; charset=utf-8';
    add_header 'Content-Length' 0;
    return 204;
}
```

### Preventing Duplicate Headers

```nginx
# Remove CORS headers from backend to prevent duplication
fastcgi_hide_header 'Access-Control-Allow-Origin';
fastcgi_hide_header 'Access-Control-Allow-Methods';
fastcgi_hide_header 'Access-Control-Allow-Headers';
fastcgi_hide_header 'Access-Control-Allow-Credentials';
fastcgi_hide_header 'Access-Control-Expose-Headers';
fastcgi_hide_header 'Access-Control-Max-Age';
```

## 2. Laravel CORS Configuration

Laravel has its own CORS handling through the configuration file `backend/config/cors.php`:

```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['*'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
```

This is implemented using Laravel's CORS middleware (from the `fruitcake/laravel-cors` package), which automatically handles CORS requests for API routes. However, since Nginx is handling CORS at the gateway level and removing these headers from backend responses, the Laravel CORS configuration is somewhat redundant but provides a fallback if Nginx configuration is changed.

## 3. Frontend Configuration

The frontend doesn't require specific CORS handling in its axios configuration:

```javascript
export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:9000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});
```

The frontend service simply makes requests to the backend API, and CORS is handled transparently by Nginx.

## CORS Request Flow

1. **Simple Requests**:
   - Frontend makes a request to the backend API (localhost:9000)
   - Nginx forwards the request to the backend service
   - Backend processes the request and returns a response
   - Nginx adds CORS headers to the response before sending it back to the client
   - Any CORS headers from Laravel are removed to prevent duplication

2. **Preflight Requests** (OPTIONS method):
   - Browser sends an OPTIONS request before making the actual request
   - Nginx intercepts and responds directly with appropriate CORS headers and 204 status
   - The actual request never reaches the backend for preflight checks
   - This improves performance by handling preflight at the gateway level

## Security Considerations

- Current configuration uses `Access-Control-Allow-Origin: '*'` which allows any origin to access the API
- For production environments with stricter security requirements, consider:
  - Limiting allowed origins to specific domains
  - Reviewing the list of allowed headers and methods
  - Configuring proper credentials handling

## Troubleshooting CORS Issues

If you encounter CORS issues:

1. Check browser console for specific CORS error messages
2. Verify Nginx configuration is correctly applied
3. Ensure preflight requests (OPTIONS) are handled correctly
4. Confirm the frontend is making requests to the correct API endpoint
5. Validate that the necessary CORS headers are present in responses (using browser network tab)

This multi-layered approach ensures robust CORS handling throughout the application architecture. 