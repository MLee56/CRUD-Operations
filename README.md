# CRUD Microservice

## Description

The CRUD Microservice provides generic Create, Read, Update, and Delete (CRUD) operations for any resource type. It stores items in MongoDB and supports multiple applications by using a `type` field to categorize items (e.g., "exercise", "note", "task") and a `data` object for arbitrary JSON.

**Features:**
- Create, read, update, and delete items
- Filter items by `type` (optional query parameter)
- Authentication required: all requests must include an `Authorization` header with a valid token
- Items are scoped to the authenticated user (username extracted from token)
- Base URL: `http://localhost:5000` (configurable via `PORT` env var)

---

## Authentication

All endpoints require the `Authorization` header with a token in the format `{username}-token` (e.g., `mike-token`). Obtain this token from the Auth microservice after logging in.

**Example:** `Authorization: mike-token`

---

## How to REQUEST Data from the Microservice

### Create an Item

- **Method:** POST
- **URL:** `http://localhost:5000/items`
- **Headers:** `Content-Type: application/json`, `Authorization: {username}-token`
- **Body:** `{ "type": string, "data": object }`

**Example Request (JavaScript fetch):**

```javascript
fetch("http://localhost:5000/items", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "mike-token"
  },
  body: JSON.stringify({
    type: "exercise",
    data: { name: "Push-ups", reps: 20, weight: 0, unit: "lbs", date: "2026-02-23" }
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Read Items (List All or Filter by Type)

- **Method:** GET
- **URL:** `http://localhost:5000/items` or `http://localhost:5000/items?type=exercise`
- **Headers:** `Authorization: {username}-token`
- **Query (optional):** `type` – filter items by resource type

**Example Request (JavaScript fetch):**

```javascript
fetch("http://localhost:5000/items?type=exercise", {
  headers: { "Authorization": "mike-token" }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Update an Item

- **Method:** PUT
- **URL:** `http://localhost:5000/items/:id`
- **Headers:** `Content-Type: application/json`, `Authorization: {username}-token`
- **Body:** `{ "type"?: string, "data"?: object }` (include at least one of `type` or `data`)

**Example Request (JavaScript fetch):**

```javascript
fetch("http://localhost:5000/items/507f1f77bcf86cd799439011", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "mike-token"
  },
  body: JSON.stringify({
    type: "exercise",
    data: { name: "Push-ups", reps: 30, weight: 0, unit: "lbs", date: "2026-02-23" }
  })
})
  .then(res => res.json())
  .then(data => console.log(data));
```

### Delete an Item

- **Method:** DELETE
- **URL:** `http://localhost:5000/items/:id`
- **Headers:** `Authorization: {username}-token`

**Example Request (JavaScript fetch):**

```javascript
fetch("http://localhost:5000/items/507f1f77bcf86cd799439011", {
  method: "DELETE",
  headers: { "Authorization": "mike-token" }
})
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## How to RECEIVE Data from the Microservice

### Create Response

**Success (HTTP 200):**

```json
{
  "message": "Item created",
  "item": {
    "id": "507f1f77bcf86cd799439011",
    "username": "mike",
    "type": "exercise",
    "data": {
      "name": "Push-ups",
      "reps": 20,
      "weight": 0,
      "unit": "lbs",
      "date": "2026-02-23"
    }
  }
}
```

**Failure (HTTP 400):**

```json
{
  "error": "Request must include 'type' and 'data'"
}
```

**Failure (HTTP 401):**

```json
{
  "error": "No token provided"
}
```

```json
{
  "error": "Invalid token"
}
```

### Read Response

**Success (HTTP 200):** Returns an array of items for the authenticated user (optionally filtered by `type`).

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "username": "mike",
    "type": "exercise",
    "data": {
      "name": "Push-ups",
      "reps": 20,
      "weight": 0,
      "unit": "lbs",
      "date": "2026-02-23"
    }
  }
]
```

**Note:** The `_id` field is MongoDB's ObjectId (may appear as string or object depending on serialization). Use `_id` to identify items for PUT and DELETE.

### Update Response

**Success (HTTP 200):**

```json
{
  "message": "Item updated",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "mike",
    "type": "exercise",
    "data": {
      "name": "Push-ups",
      "reps": 30,
      "weight": 0,
      "unit": "lbs",
      "date": "2026-02-23"
    }
  }
}
```

**Failure (HTTP 404):**

```json
{
  "error": "Item not found or not owned by user"
}
```

### Delete Response

**Success (HTTP 200):**

```json
{
  "message": "Item deleted",
  "item": {
    "_id": "507f1f77bcf86cd799439011",
    "username": "mike",
    "type": "exercise",
    "data": { ... }
  }
}
```

**Failure (HTTP 404):**

```json
{
  "error": "Item not found or not owned by user"
}
```

## Setup

1. Create a `.env` file with:
   - `MONGO_URI` – MongoDB connection string
   - `PORT` (optional) – default is 5000
2. Install dependencies: `npm install`
3. Run the service: `npm start`
4. Service runs at `http://localhost:5000` (or configured port)
