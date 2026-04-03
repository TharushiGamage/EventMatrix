# Calendar API Documentation

**Base URL:** `http://localhost:5000`  
**Content-Type:** `application/json`

---

## Table of Contents

- [Get Calendar Events](#get-calendar-events)
- [Data Model](#data-model)
- [Error Handling](#error-handling)

---

## Get Calendar Events

```
GET /api/v1/feed/calendar
```

Returns all events for a given month, **grouped by date**. Designed for rendering a calendar UI where each date cell displays its events.

Events are sorted by `date` (ascending) then `startTime` (ascending) within each date group. Only dates that have events are included in the response — empty dates are omitted.

### Query Parameters

| Parameter | Type     | Required | Constraints | Description        |
|-----------|----------|----------|-------------|--------------------|
| `month`   | `number` | ✅       | 1–12        | Month to query     |
| `year`    | `number` | ✅       | 2000–2100   | Year to query      |

### Example Request

```
GET /api/v1/feed/calendar?month=3&year=2026
```

### Success Response — `200 OK`

```json
{
  "success": true,
  "data": {
    "month": 3,
    "year": 2026,
    "totalEvents": 3,
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
        },
        {
          "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
          "name": "Networking Mixer",
          "date": "2026-03-15",
          "startTime": "14:00",
          "endTime": "16:00",
          "venue": "Student Lounge",
          "isPaid": false
        }
      ]
    }
  }
}
```

### Response Fields

| Field                    | Type     | Description                                         |
|--------------------------|----------|-----------------------------------------------------|
| `data.month`             | `number` | The queried month                                   |
| `data.year`              | `number` | The queried year                                    |
| `data.totalEvents`       | `number` | Total number of events in the month                 |
| `data.events`            | `object` | Dictionary mapping `YYYY-MM-DD` date strings → arrays of event objects |

### Validation Error — `400 Bad Request`

Returned when required parameters are missing or invalid.

**Missing parameters:**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "month and year are required query parameters"
  }
}
```

**Invalid month (outside 1–12):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "month must be between 1 and 12"
  }
}
```

**Invalid year (outside 2000–2100):**

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "year must be between 2000 and 2100"
  }
}
```

---

## Data Model

### Calendar Event (slim payload)

Each event object in the calendar response contains only the fields needed for calendar cell rendering:

| Field       | Type      | Description                           |
|-------------|-----------|---------------------------------------|
| `id`        | `string`  | UUID v4 identifier                    |
| `name`      | `string`  | Event name (max 200 chars)            |
| `date`      | `string`  | Date in `YYYY-MM-DD` format          |
| `startTime` | `string`  | Start time in `HH:mm` 24-hour format |
| `endTime`   | `string`  | End time in `HH:mm` 24-hour format   |
| `venue`     | `string`  | Event location                        |
| `isPaid`    | `boolean` | Whether the event requires a ticket   |

> **Note:** To fetch full event details (description, ticket types, max participants, etc.), use `GET /api/v1/feed/:id` with the event's `id`.

---

## Error Handling

All error responses follow a consistent shape:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description"
  }
}
```

### Error Codes

| Code               | HTTP Status | Description                              |
|--------------------|-------------|------------------------------------------|
| `VALIDATION_ERROR` | `400`       | Missing or invalid query parameters      |
| `INTERNAL_ERROR`   | `500`       | Unexpected server error                  |

---

## Usage Notes

### Frontend Integration

1. **Monthly navigation**: Call the endpoint each time the user navigates to a new month.
2. **Date cell rendering**: Iterate over the calendar grid days; check if `data.events[dateString]` exists to determine if a date has events.
3. **Event count badges**: Use `data.events[dateString].length` to show event count indicators on calendar cells.
4. **Event detail**: When a user clicks an event, use the `id` to call `GET /api/v1/feed/:id` for full details.

### Example Frontend Code

```javascript
// Fetch events for March 2026
const response = await fetch('/api/v1/feed/calendar?month=3&year=2026');
const { data } = await response.json();

// Check if a specific date has events
const dateStr = '2026-03-15';
const hasEvents = data.events[dateStr] !== undefined;
const eventCount = data.events[dateStr]?.length || 0;
```
