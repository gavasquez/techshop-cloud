# TechShop Cloud - API Specification

## API Overview

TechShop Cloud expone una API REST que sigue las mejores prácticas de diseño API, incluyendo versionado, autenticación JWT, y documentación OpenAPI.

**Base URL**: `https://api.techshop-cloud.com/v1`

**API Version**: v1

**Authentication**: Bearer Token (JWT)

## API Standards

### HTTP Status Codes

| Status Code | Description | Usage |
|-------------|-------------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource conflict |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Response Format

#### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}
```

#### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "v1"
  }
}
```

### Pagination

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### GET /products/:id

Get product by ID.

**Path Parameters:**
- `id` (string): Product UUID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4070",
    "price": 1299.99,
    "category": "Electronics",
    "stockQuantity": 15,
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

**Response (404):**
```json
{
  "success": false,
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Product not found"
  }
}
```

### POST /products

Create new product (Admin/Provider only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "name": "New Gaming Mouse",
  "description": "Wireless gaming mouse with RGB lighting",
  "price": 79.99,
  "category": "Accessories",
  "stockQuantity": 50
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "New Gaming Mouse",
    "description": "Wireless gaming mouse with RGB lighting",
    "price": 79.99,
    "category": "Accessories",
    "stockQuantity": 50,
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Response (422):**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "price",
        "message": "Price must be greater than 0"
      },
      {
        "field": "name",
        "message": "Name cannot exceed 100 characters"
      }
    ]
  }
}
```

### PUT /products/:id

Update product (Admin/Provider only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Product UUID

**Request Body:**
```json
{
  "name": "Updated Gaming Mouse",
  "description": "Updated description",
  "price": 89.99,
  "stockQuantity": 45
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Updated Gaming Mouse",
    "description": "Updated description",
    "price": 89.99,
    "category": "Accessories",
    "stockQuantity": 45,
    "active": true,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### DELETE /products/:id

Deactivate product (Admin only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Product UUID

**Response (204):** No content

### PATCH /products/:id/stock

Update product stock (Admin/Provider only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Product UUID

**Request Body:**
```json
{
  "operation": "increase", // or "decrease"
  "quantity": 10
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "stockQuantity": 60,
    "updatedAt": "2024-01-15T11:15:00Z"
  }
}
```

## Category Endpoints

### GET /categories

Get all product categories.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "name": "Electronics",
      "description": "Electronic devices and gadgets",
      "productCount": 25
    },
    {
      "name": "Accessories",
      "description": "Computer and gaming accessories",
      "productCount": 15
    }
  ]
}
```

### GET /categories/:name/products

Get products by category.

**Path Parameters:**
- `name` (string): Category name

**Query Parameters:**
Same as `/products` endpoint

**Response (200):**
Same format as `/products` endpoint

## Order Management Endpoints

### GET /orders

Get user orders (or all orders for Admin).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `status` (string): Filter by order status
- `startDate` (string): Filter orders from date
- `endDate` (string): Filter orders to date

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "customerId": "uuid",
        "status": "PENDING",
        "total": 1379.98,
        "items": [
          {
            "productId": "uuid",
            "productName": "Gaming Laptop",
            "quantity": 1,
            "unitPrice": 1299.99,
            "subtotal": 1299.99
          },
          {
            "productId": "uuid",
            "productName": "Gaming Mouse",
            "quantity": 1,
            "unitPrice": 79.99,
            "subtotal": 79.99
          }
        ],
        "shippingAddress": {
          "street": "123 Main St",
          "city": "New York",
          "state": "NY",
          "zipCode": "10001",
          "country": "USA"
        },
        "paymentMethod": "CREDIT_CARD",
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 5,
      "totalPages": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

### GET /orders/:id

Get specific order details.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Order UUID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "status": "CONFIRMED",
    "total": 1379.98,
    "items": [
      {
        "productId": "uuid",
        "productName": "Gaming Laptop",
        "quantity": 1,
        "unitPrice": 1299.99,
        "subtotal": 1299.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "CREDIT_CARD",
    "orderHistory": [
      {
        "status": "PENDING",
        "timestamp": "2024-01-15T09:00:00Z"
      },
      {
        "status": "CONFIRMED",
        "timestamp": "2024-01-15T09:30:00Z"
      }
    ],
    "createdAt": "2024-01-15T09:00:00Z",
    "updatedAt": "2024-01-15T09:30:00Z"
  }
}
```

### POST /orders

Create new order.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "items": [
    {
      "productId": "uuid",
      "quantity": 1
    },
    {
      "productId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "CREDIT_CARD"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "status": "PENDING",
    "total": 1379.98,
    "items": [
      {
        "productId": "uuid",
        "productName": "Gaming Laptop",
        "quantity": 1,
        "unitPrice": 1299.99,
        "subtotal": 1299.99
      }
    ],
    "shippingAddress": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    },
    "paymentMethod": "CREDIT_CARD",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### PUT /orders/:id/status

Update order status (Admin/Provider only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Order UUID

**Request Body:**
```json
{
  "status": "CONFIRMED", // PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED
  "notes": "Order confirmed and being processed"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CONFIRMED",
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### DELETE /orders/:id

Cancel order (if status allows).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): Order UUID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "updatedAt": "2024-01-15T11:30:00Z"
  }
}
```

## Shopping Cart Endpoints

### GET /cart

Get current user's shopping cart.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "items": [
      {
        "productId": "uuid",
        "productName": "Gaming Laptop",
        "productPrice": 1299.99,
        "quantity": 1,
        "subtotal": 1299.99
      }
    ],
    "total": 1299.99,
    "itemCount": 1,
    "updatedAt": "2024-01-15T10:00:00Z"
  }
}
```

### POST /cart/items

Add item to cart.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "productId": "uuid",
  "quantity": 1
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "items": [
      {
        "productId": "uuid",
        "productName": "Gaming Laptop",
        "productPrice": 1299.99,
        "quantity": 1,
        "subtotal": 1299.99
      }
    ],
    "total": 1299.99,
    "itemCount": 1,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /cart/items/:productId

Update cart item quantity.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `productId` (string): Product UUID

**Request Body:**
```json
{
  "quantity": 2
}
```

**Response (200):**
Same format as add item response

### DELETE /cart/items/:productId

Remove item from cart.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `productId` (string): Product UUID

**Response (204):** No content

### DELETE /cart

Clear entire cart.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (204):** No content

## Admin Endpoints

### GET /admin/users

Get all users (Admin only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20): Items per page
- `role` (string): Filter by role
- `active` (boolean): Filter by active status
- `search` (string): Search in name and email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "roles": ["USER"],
        "active": true,
        "emailVerified": true,
        "lastLoginAt": "2024-01-15T09:00:00Z",
        "createdAt": "2024-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### PUT /admin/users/:id/roles

Update user roles (Admin only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): User UUID

**Request Body:**
```json
{
  "roles": ["USER", "PROVIDER"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "roles": ["USER", "PROVIDER"],
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### PUT /admin/users/:id/status

Update user status (Admin only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Path Parameters:**
- `id` (string): User UUID

**Request Body:**
```json
{
  "active": false,
  "reason": "Policy violation"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "active": false,
    "updatedAt": "2024-01-15T11:00:00Z"
  }
}
```

### GET /admin/analytics

Get system analytics (Admin only).

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Query Parameters:**
- `startDate` (string): Start date for analytics
- `endDate` (string): End date for analytics
- `metric` (string): Specific metric to retrieve

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1000,
      "active": 850,
      "newThisMonth": 45
    },
    "products": {
      "total": 200,
      "active": 180,
      "outOfStock": 5
    },
    "orders": {
      "total": 500,
      "pending": 15,
      "completed": 450,
      "cancelled": 35
    },
    "revenue": {
      "total": 125000.00,
      "thisMonth": 15000.00,
      "avgOrderValue": 250.00
    }
  }
}
```

## System Endpoints

### GET /health

Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T12:00:00Z",
    "version": "1.0.0",
    "services": {
      "database": "healthy",
      "cache": "healthy",
      "external_apis": "healthy"
    }
  }
}
```

### GET /metrics

Prometheus metrics endpoint.

**Response (200):**
```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",status="200"} 1000
http_requests_total{method="POST",status="201"} 100
http_requests_total{method="POST",status="400"} 10

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{le="0.1"} 500
http_request_duration_seconds_bucket{le="0.5"} 800
http_request_duration_seconds_bucket{le="1.0"} 950
http_request_duration_seconds_bucket{le="+Inf"} 1000
```

## Error Handling

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| VALIDATION_ERROR | Request validation failed | 422 |
| UNAUTHORIZED | Authentication required | 401 |
| FORBIDDEN | Insufficient permissions | 403 |
| NOT_FOUND | Resource not found | 404 |
| CONFLICT | Resource conflict | 409 |
| RATE_LIMITED | Rate limit exceeded | 429 |
| INTERNAL_ERROR | Internal server error | 500 |

### Validation Error Details

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format",
        "value": "invalid-email"
      },
      {
        "field": "password",
        "message": "Password must be at least 8 characters",
        "value": null
      }
    ]
  }
}
```

## Rate Limiting

API endpoints are rate limited to prevent abuse:

- **Authentication endpoints**: 5 requests per minute per IP
- **General API**: 100 requests per minute per user
- **Admin endpoints**: 200 requests per minute per admin user

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642262400
```

## API Versioning

The API uses URL versioning:
- Current version: `/v1`
- Future versions: `/v2`, `/v3`, etc.

Version compatibility:
- Major versions may have breaking changes
- Minor updates maintain backward compatibility
- Deprecated endpoints will be supported for 12 months

## Security Headers

All API responses include security headers:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'
```

## CORS Configuration

Cross-Origin Resource Sharing is configured to allow:
- Origins: `https://app.techshop-cloud.com`, `https://admin.techshop-cloud.com`
- Methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`
- Headers: `Content-Type, Authorization, X-Requested-With`

## OpenAPI Specification

The complete OpenAPI 3.0 specification is available at:
- Swagger UI: `https://api.techshop-cloud.com/docs`
- JSON: `https://api.techshop-cloud.com/docs/json`
- YAML: `https://api.techshop-cloud.com/docs/yaml`

This API specification provides a comprehensive guide for frontend developers and third-party integrators to interact with the TechShop Cloud platform.
```

## Authentication Endpoints

### POST /auth/login

Authenticate user and obtain JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["USER"],
      "emailVerified": true,
      "active": true
    },
    "tokens": {
      "accessToken": "jwt_access_token",
      "refreshToken": "jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

**Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

### POST /auth/refresh

Refresh access token using refresh token.

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "tokens": {
      "accessToken": "new_jwt_access_token",
      "refreshToken": "new_jwt_refresh_token",
      "expiresIn": 3600
    }
  }
}
```

### POST /auth/logout

Logout user and invalidate tokens.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (204):** No content

### POST /auth/register

Register new user account.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "newuser@example.com",
      "firstName": "Jane",
      "lastName": "Smith",
      "roles": ["USER"],
      "emailVerified": false,
      "active": true
    },
    "message": "Registration successful. Please verify your email."
  }
}
```

## User Management Endpoints

### GET /users/profile

Get current user profile.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "roles": ["USER"],
    "emailVerified": true,
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "lastLoginAt": "2024-01-15T10:00:00Z"
  }
}
```

### PUT /users/profile

Update user profile.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Updated",
    "roles": ["USER"],
    "emailVerified": true,
    "active": true,
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

### PUT /users/password

Change user password.

**Headers:**
```
Authorization: Bearer jwt_access_token
```

**Request Body:**
```json
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewSecurePass456!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Password updated successfully"
  }
}
```

### POST /users/verify-email

Verify user email address.

**Request Body:**
```json
{
  "token": "email_verification_token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message": "Email verified successfully"
  }
}
```

## Product Management Endpoints

### GET /products

Get paginated list of products.

**Query Parameters:**
- `page` (number, default: 1): Page number
- `limit` (number, default: 20, max: 100): Items per page
- `category` (string): Filter by category
- `search` (string): Search in name and description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter products in stock
- `sortBy` (string): Sort field (name, price, createdAt)
- `sortOrder` (string): Sort order (asc, desc)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "uuid",
        "name": "Gaming Laptop",
        "description": "High-performance gaming laptop",
        "price": 1299.99,
        "category": "Electronics",
        "stockQuantity": 15,
        "active": true,
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-15T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3,
      "