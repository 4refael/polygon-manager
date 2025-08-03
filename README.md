# Polygon Manager

### Stack
- TypeScript
- NestJS (NodeJS)
- SQLite (DB)
- VueJS
- Tailwind CSS

### Installation
1. **Clone Repository**

2. **Start Application with Docker**
   ```bash
   docker-compose build
   docker-compose up
   ```
   This starts both backend and frontend services in detached mode.

3. **Access Applications**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:3000/api

4. **Stop Application**
   ```bash
   docker-compose down
   ```

### Testing

```bash
# Ensure application is running
docker-compose up

# Backend unit tests
docker exec polygon-manager-backend npm test

# Frontend e2e
docker exec polygon-manager-frontend npm test
```

### API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/polygons` | List all polygons |
| `POST` | `/api/polygons` | Create new polygon |
| `GET` | `/api/polygons/:id` | Get specific polygon |
| `DELETE` | `/api/polygons/:id` | Delete polygon |

### Request/Response Examples

**Create Polygon**
```bash
POST /api/polygons
Content-Type: application/json

{
  "name": "Triangle",
  "points": [[10, 10], [20, 10], [15, 20]]
}
```

**Response**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Triangle",
  "points": [[10, 10], [20, 10], [15, 20]]
}
```