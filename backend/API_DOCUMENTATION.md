# Smart Campus Event API Documentation

**Base URL:** `http://localhost:5000`  
**Content-Type:** `application/json` (or `multipart/form-data` for endpoints supporting file upload)

---

## Table of Contents

- [Health Check](#health-check)
- [Feed Endpoints](#feed-endpoints) _(public, read-only)_
  - [Get Feed Events](#get-feed-events)
  - [Get Feed Event Detail](#get-feed-event-detail)
  - [Get Calendar Events](#get-calendar-events)
  - [Get Event Image](#get-event-image)
- [Event Management Endpoints](#event-management-endpoints) _(admin CRUD)_
  - [Get All Events](#get-all-events)
  - [Get Event Stats](#get-event-stats)
  - [Get Event by ID](#get-event-by-id)
  - [Create Event](#create-event)
  - [Update Event](#update-event)
  - [Delete Event](#delete-event)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Health Check

### `GET /`

Returns server health status.

**Response:**
```json
{
  "success": true,
  "message": "Smart Campus Event API is running"
}
```

---

## Feed Endpoints

Public, read-only endpoints optimized for the event feed UI.

### Get Feed Events

```
GET /api/v1/feed
```

Returns a paginated list of events with a **slim payload** (only the fields needed for feed cards).  
Defaults to **upcoming events** sorted by ascending date.

#### Query Parameters

| Parameter  | Type     | Default    | Options                     | Description                         |
|------------|----------|------------|-----------------------------|-------------------------------------|
| `search`   | `string` | `""`       | any text                    | Search across name, venue, organizer |
| `filter`   | `string` | `all`      | `all` · `paid` · `free`    | Filter by ticket type               |
| `category` | `string` | `upcoming` | `upcoming` · `past` · `all`| Time-based filter                   |
| `page`     | `number` | `1`        | ≥ 1                        | Page number                         |
| `limit`    | `number` | `20`       | 1–50                       | Items per page                      |

#### Example Request

```
GET /api/v1/feed?search=tech&filter=paid&category=upcoming&page=1&limit=10
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "name": "Tech Summit 2026",
        "date": "2026-03-15",
        "startTime": "09:00",
        "endTime": "11:00",
        "venue": "Main Auditorium",
        "organizedBy": "CS Department",
        "isPaid": true,
        "ticketTypes": [
          {
            "name": "General Admission",
            "price": 500,
            "totalCount": 100,
            "issuingDates": "2026-03-01 to 2026-03-10",
            "issuingTimes": "09:00 to 17:00",
            "issuingVenues": "Main Campus Office"
          }
        ],
        "image": "1678234567890-123456789.jpg"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalItems": 1,
      "totalPages": 1
    }
  }
}
```

---

### Get Feed Event Detail

```
GET /api/v1/feed/:id
```

Returns **all fields** for a single event. Use this when a user taps on a feed item to see full details.

#### Path Parameters

| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `id`      | `string` | UUID of the event        |

#### Example Request

```
GET /api/v1/feed/a1b2c3d4-e5f6-7890-abcd-ef1234567890
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Tech Summit 2026",
    "date": "2026-03-15",
    "startTime": "09:00",
    "endTime": "11:00",
    "venue": "Main Auditorium",
    "organizedBy": "CS Department",
    "maxParticipants": 200,
    "isPaid": true,
    "ticketTypes": [
      {
        "name": "General Admission",
        "price": 500,
        "totalCount": 100,
        "issuingDates": "2026-03-01 to 2026-03-10",
        "issuingTimes": "09:00 to 17:00",
        "issuingVenues": "Main Campus Office"
      }
    ],
    "description": "Annual technology summit featuring keynotes, workshops, and networking sessions.",
    "createdAt": "2026-02-20T10:30:00.000Z",
    "updatedAt": "2026-02-20T10:30:00.000Z"
  }
}
```

#### Error Response — `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID 'nonexistent-id' not found"
  }
}
```

---

### Get Calendar Events

```
GET /api/v1/feed/calendar
```

Returns all events for a given month, **grouped by date**. Designed for rendering a calendar UI where each date cell shows its events.

#### Query Parameters

| Parameter | Type     | Required | Constraints  | Description              |
|-----------|----------|----------|--------------|--------------------------|
| `month`   | `number` | ✅       | 1–12         | Month to query           |
| `year`    | `number` | ✅       | 2000–2100    | Year to query            |

#### Example Request

```
GET /api/v1/feed/calendar?month=3&year=2026
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2026,
    "totalEvents": 2,
    "events": {
      "2026-03-05": [
        {
          "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          "name": "Workshop: Intro to AI",
          "date": "2026-03-05",
          "startTime": "10:00",
          "endTime": "12:00",
          "venue": "Lab 3",
          "isPaid": false
        }
      ],
      "2026-03-15": [
        {
          "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
          "name": "Tech Summit 2026",
          "date": "2026-03-15",
          "startTime": "09:00",
          "endTime": "11:00",
          "venue": "Main Auditorium",
          "isPaid": true
        }
      ]
    }
  }
}
```

> **Note:** Dates with no events are omitted from the `events` object.

#### Validation Error — `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "month and year are required query parameters"
  }
}
```

---

### Get Event Image

```
GET /api/v1/feed/:id/image
```

Returns the image details (filename and URL) for a specific event. Use this to retrieve the uploaded image associated with an event.

#### Path Parameters

| Parameter | Type     | Description              |
|-----------|----------|--------------------------|
| `id`      | `string` | UUID of the event        |

#### Example Request

```
GET /api/v1/feed/a1b2c3d4-e5f6-7890-abcd-ef1234567890/image
```

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "eventId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "image": "1678234567890-123456789.jpg",
    "imageUrl": "/uploaded_images/1678234567890-123456789.jpg"
  }
}
```

> **Tip:** To display the image, use the full URL: `http://localhost:5000/uploaded_images/1678234567890-123456789.jpg`

#### Error Response — `404 Not Found` (Event not found)

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID 'nonexistent-id' not found"
  }
}
```

#### Error Response — `404 Not Found` (No image uploaded)

```json
{
  "success": false,
  "error": {
    "code": "IMAGE_NOT_FOUND",
    "message": "No image uploaded for event 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'"
  }
}
```

---

## Event Management Endpoints

Admin endpoints for full CRUD operations on events.

### Get All Events

```
GET /api/v1/events
```

Returns a paginated list of **all event fields** with search, filter, and sort capabilities.

#### Query Parameters

| Parameter | Type     | Default | Options                    | Description                        |
|-----------|----------|---------|----------------------------|------------------------------------|
| `search`  | `string` | `""`    | any text                   | Search name, venue, organizer      |
| `filter`  | `string` | `all`   | `all` · `paid` · `free`   | Filter by ticket type              |
| `page`    | `number` | `1`     | ≥ 1                       | Page number                        |
| `limit`   | `number` | `12`    | 1–50                      | Items per page                     |
| `sortBy`  | `string` | `date`  | `date` · `name` · `createdAt` | Sort field                     |
| `order`   | `string` | `asc`   | `asc` · `desc`            | Sort direction                     |

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "events": [ { /* full event objects */ } ],
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 25,
      "totalPages": 3
    }
  }
}
```

---

### Get Event Stats

```
GET /api/v1/events/stats
```

Returns aggregate counts for the dashboard.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "totalEvents": 25,
    "upcomingEvents": 10,
    "paidEvents": 8,
    "freeEvents": 17
  }
}
```

---

### Get Event by ID

```
GET /api/v1/events/:id
```

Returns full details for a single event.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": { /* full event object */ }
}
```

#### Error Response — `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID '...' not found"
  }
}
```

---

### Check Event Time Overlap

```
GET /api/v1/events/check-overlap
```

Checks if a proposed event intersects with existing events on the same date.

#### Query Parameters

| Parameter   | Type     | Required | Description                     |
|-------------|----------|----------|---------------------------------|
| `date`      | `string` | ✅       | `YYYY-MM-DD` format             |
| `startTime` | `string` | ✅       | `HH:mm` 24-hour format          |
| `endTime`   | `string` | ✅       | `HH:mm` 24-hour format          |

#### Success Response — `200 OK` (No overlap)

```json
{
  "success": true,
  "data": {
    "hasOverlap": false,
    "conflicts": []
  }
}
```

#### Success Response — `200 OK` (Overlap detected)

```json
{
  "success": true,
  "data": {
    "hasOverlap": true,
    "conflicts": [
      {
        "id": "existing-event-id",
        "name": "Another Event",
        "startTime": "10:00",
        "endTime": "12:00",
        "venue": "Room 101"
      }
    ]
  }
}
```

---

### Create Event

```
POST /api/v1/events
```

Creates a new event. To upload an image, send this request as `multipart/form-data`. Otherwise, `application/json` is fine. All fields are validated by the `validateEvent` middleware.

#### Request Body

| Field             | Type      | Required | Constraints                          |
|-------------------|-----------|----------|--------------------------------------|
| `name`            | `string`  | ✅       | max 200 characters                   |
| `date`            | `string`  | ✅       | `YYYY-MM-DD` format                  |
| `startTime`       | `string`  | ✅       | `HH:mm` 24-hour format               |
| `endTime`         | `string`  | ✅       | `HH:mm` 24-hour format (after start) |
| `venue`           | `string`  | ✅       | max 300 characters                   |
| `organizedBy`     | `string`  | ✅       | max 200 characters                   |
| `maxParticipants` | `number`  | ✅       | integer ≥ 1                          |
| `isPaid`          | `boolean` | ✅       |                                      |
| `ticketPrice`     | `number`  | if paid  | (legacy) required & > 0 if `ticketTypes` missing|
| `ticketTypes`     | `array`   | if paid  | array of objects; required if `isPaid` is true|
| `description`     | `string`  | ✅       | max 2000 characters                  |
| `image`           | `file`    | ❌       | optional image (JPEG/PNG/WEBP, max 5MB)|

> **Note:** When using `multipart/form-data`, array/object fields like `ticketTypes` must be sent as stringified JSON. Number/boolean fields are automatically coerced.

#### Example Request

```json
{
  "name": "Tech Summit 2026",
  "date": "2026-03-15",
  "startTime": "09:00",
  "endTime": "11:00",
  "venue": "Main Auditorium",
  "organizedBy": "CS Department",
  "maxParticipants": 200,
  "isPaid": true,
  "ticketTypes": [
    {
      "name": "General Admission",
      "price": 500,
      "totalCount": 100,
      "issuingDates": "2026-03-01 to 2026-03-10",
      "issuingTimes": "09:00 to 17:00",
      "issuingVenues": "Main Campus Office"
    }
  ],
  "description": "Annual technology summit featuring keynotes, workshops, and networking."
}
```

#### Success Response — `201 Created`

```json
{
  "success": true,
  "data": { /* created event object with generated id */ }
}
```

#### Validation Error — `400 Bad Request`

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      { "field": "name", "message": "Event name is required" },
      { "field": "date", "message": "Date must be in YYYY-MM-DD format" }
    ]
  }
}
```

---

### Update Event

```
PUT /api/v1/events/:id
```

Updates all fields of an existing event. The full request body is required (same as [Create Event](#create-event)). Like creation, use `multipart/form-data` to upload/replace the event's `image`.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "data": { /* updated event object */ }
}
```

#### Error Responses

- `400` — Validation error (same shape as Create)
- `404` — Event not found

---

### Delete Event

```
DELETE /api/v1/events/:id
```

Permanently deletes an event.

#### Success Response — `200 OK`

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

#### Error Response — `404 Not Found`

```json
{
  "success": false,
  "error": {
    "code": "EVENT_NOT_FOUND",
    "message": "Event with ID '...' not found"
  }
}
```

---

## Data Models

### Event

| Field             | Type        | Description                                |
|-------------------|-------------|--------------------------------------------|
| `id`              | `string`    | Auto-generated UUID v4                     |
| `name`            | `string`    | Event name (max 200 chars)                 |
| `date`            | `string`    | Date in `YYYY-MM-DD` format               |
| `startTime`       | `string`    | Start time in `HH:mm` 24-hour format      |
| `endTime`         | `string`    | End time in `HH:mm` 24-hour format        |
| `venue`           | `string`    | Event location (max 300 chars)             |
| `organizedBy`     | `string`    | Organizer name (max 200 chars)             |
| `maxParticipants` | `number`    | Maximum attendees (integer ≥ 1)            |
| `isPaid`          | `boolean`   | Whether the event requires a ticket        |
| `ticketPrice`     | `number`    | Legacy ticket cost (null for free events)  |
| `ticketTypes`     | `array`     | Array of ticket objects (General, VIP, etc)|
| `description`     | `string`    | Full description (max 2000 chars)          |
| `image`           | `string`    | Image filename. Available at `/uploaded_images/<filename>` |
| `createdAt`       | `datetime`  | Auto-generated creation timestamp          |
| `updatedAt`       | `datetime`  | Auto-generated last-update timestamp       |

> **Note:** `_id` and `__v` are hidden from all API responses.

---

## Error Handling

All error responses follow a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description",
    "details": []
  }
}
```

### Error Codes

| Code               | HTTP Status | Description                    |
|--------------------|-------------|--------------------------------|
| `VALIDATION_ERROR` | `400`       | Request body validation failed |
| `EVENT_NOT_FOUND`  | `404`       | No event matches the given ID  |
| `IMAGE_NOT_FOUND`  | `404`       | No image uploaded for the event|
| `INTERNAL_ERROR`   | `500`       | Unexpected server error        |
