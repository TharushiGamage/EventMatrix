# Smart Campus Event — Backend API Specification

> **Version:** 1.0  
> **Base URL:** `/api/v1`  
> **Content-Type:** `application/json`

---

## Data Model

### Event

| Field              | Type      | Required | Description                              |
|--------------------|-----------|----------|------------------------------------------|
| `id`               | `string`  | Auto     | UUID, generated server-side              |
| `name`             | `string`  | ✅       | Event name (max 200 chars)               |
| `date`             | `string`  | ✅       | ISO date format `YYYY-MM-DD`             |
| `time`             | `string`  | ✅       | 24h format `HH:mm`                       |
| `venue`            | `string`  | ✅       | Event venue / location (max 300 chars)   |
| `organizedBy`      | `string`  | ✅       | Organizing department / club             |
| `maxParticipants`  | `integer` | ✅       | Maximum participation count (min: 1)     |
| `isPaid`           | `boolean` | ✅       | `true` = Paid, `false` = Free            |
| `ticketPrice`      | `number`  | Cond.    | Required & > 0 when `isPaid` is `true`   |
| `description`      | `string`  | ✅       | Event description (max 2000 chars)       |
| `createdAt`        | `string`  | Auto     | ISO 8601 timestamp                       |
| `updatedAt`        | `string`  | Auto     | ISO 8601 timestamp                       |

---

## Endpoints

### 1. List All Events

```
GET /api/v1/events
```

**Query Parameters**

| Param    | Type     | Default | Description                                      |
|----------|----------|---------|--------------------------------------------------|
| `search` | `string` | —       | Search by name, venue, or organizer (case-insensitive) |
| `filter` | `string` | `all`   | `all` \| `paid` \| `free`                        |
| `page`   | `integer`| `1`     | Page number for pagination                        |
| `limit`  | `integer`| `12`    | Items per page (max 50)                           |
| `sortBy` | `string` | `date`  | `date` \| `name` \| `createdAt`                  |
| `order`  | `string` | `asc`   | `asc` \| `desc`                                  |

**Response `200 OK`**

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Annual Tech Symposium 2026",
        "date": "2026-03-15",
        "time": "09:00",
        "venue": "Main Auditorium, Block A",
        "organizedBy": "Computer Science Department",
        "maxParticipants": 300,
        "isPaid": true,
        "ticketPrice": 200,
        "description": "A full-day symposium on emerging technologies...",
        "createdAt": "2026-02-20T10:30:00Z",
        "updatedAt": "2026-02-20T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 42,
      "totalPages": 4
    }
  }
}
```

---

### 2. Get Single Event

```
GET /api/v1/events/:id
```

**Response `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Annual Tech Symposium 2026",
    "date": "2026-03-15",
    "time": "09:00",
    "venue": "Main Auditorium, Block A",
    "organizedBy": "Computer Science Department",
    "maxParticipants": 300,
    "isPaid": true,
    "ticketPrice": 200,
    "description": "A full-day symposium on emerging technologies...",
    "createdAt": "2026-02-20T10:30:00Z",
    "updatedAt": "2026-02-20T10:30:00Z"
  }
}
```

**Response `404 Not Found`**

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID '550e8400...' not found"
  }
}
```

---

### 3. Create Event

```
POST /api/v1/events
```

**Request Body**

```json
{
  "name": "Hackathon — Code Sprint",
  "date": "2026-03-22",
  "time": "10:00",
  "venue": "Innovation Lab, Block C",
  "organizedBy": "Coding Club",
  "maxParticipants": 120,
  "isPaid": true,
  "ticketPrice": 100,
  "description": "24-hour hackathon challenging teams..."
}
```

**Response `201 Created`**

```json
{
  "success": true,
  "data": {
    "id": "generated-uuid",
    "name": "Hackathon — Code Sprint",
    "...": "...all fields...",
    "createdAt": "2026-02-26T17:30:00Z",
    "updatedAt": "2026-02-26T17:30:00Z"
  }
}
```

**Response `400 Bad Request`** — Validation error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "name", "message": "Event name is required" },
      { "field": "ticketPrice", "message": "Ticket price must be > 0 for paid events" }
    ]
  }
}
```

---

### 4. Update Event

```
PUT /api/v1/events/:id
```

**Request Body** — Same schema as Create (all fields required)

**Response `200 OK`**

```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "...": "...updated fields...",
    "updatedAt": "2026-02-26T18:00:00Z"
  }
}
```

**Response `404 Not Found`** — Same as Get Single Event

---

### 5. Delete Event

```
DELETE /api/v1/events/:id
```

**Response `200 OK`**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Response `404 Not Found`** — Same as Get Single Event

---

### 6. Get Dashboard Stats

```
GET /api/v1/events/stats
```

**Response `200 OK`**

```json
{
  "success": true,
  "data": {
    "totalEvents": 42,
    "upcomingEvents": 18,
    "paidEvents": 15,
    "freeEvents": 27
  }
}
```

---

## Validation Rules

| Field             | Rules                                                                 |
|-------------------|-----------------------------------------------------------------------|
| `name`            | Required, non-empty, max 200 characters                              |
| `date`            | Required, valid `YYYY-MM-DD` format                                  |
| `time`            | Required, valid `HH:mm` (24h) format                                 |
| `venue`           | Required, non-empty, max 300 characters                              |
| `organizedBy`     | Required, non-empty, max 200 characters                              |
| `maxParticipants` | Required, integer ≥ 1                                                |
| `isPaid`          | Required, boolean                                                    |
| `ticketPrice`     | Required if `isPaid === true`, must be > 0                           |
| `description`     | Required, non-empty, max 2000 characters                             |

---

## Error Response Format

All error responses follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": []
  }
}
```

**Standard Error Codes**

| HTTP Status | Code                 | Description                    |
|-------------|----------------------|--------------------------------|
| `400`       | `VALIDATION_ERROR`   | Request body validation failed |
| `404`       | `EVENT_NOT_FOUND`    | Event ID does not exist        |
| `500`       | `INTERNAL_ERROR`     | Unexpected server error        |

---

## Frontend Integration Map

Maps each frontend feature to the endpoint it should call:

| Frontend Feature              | Method   | Endpoint               |
|-------------------------------|----------|------------------------|
| Dashboard — load event list   | `GET`    | `/api/v1/events`       |
| Dashboard — stats bar         | `GET`    | `/api/v1/events/stats` |
| Dashboard — search & filter   | `GET`    | `/api/v1/events?search=...&filter=...` |
| Dashboard — delete event      | `DELETE` | `/api/v1/events/:id`   |
| Create Event form — submit    | `POST`   | `/api/v1/events`       |
| Edit Event form — load data   | `GET`    | `/api/v1/events/:id`   |
| Edit Event form — submit      | `PUT`    | `/api/v1/events/:id`   |
