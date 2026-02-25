# API Quick Reference

## Base URL
Development: `http://localhost:3000`  
Production: `https://yourdomain.com`

---

## Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123",
  "name": "John Doe"
}

Response: { accessToken, refreshToken, user }
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response: { accessToken, refreshToken, user }
```

### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "jwt_refresh_token"
}

Response: { accessToken }
```

---

## Menu Management

### Get All Menu Items
```
GET /api/menu

Response: Array of menu items
```

### Create Menu Item (Admin)
```
POST /api/menu
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Nyama Choma",
  "category": "mains",
  "price": 1500,
  "description": "Grilled meat",
  "image": "base64_encoded_image"
}

Response: Created menu item
```

### Update Menu Item (Admin)
```
PUT /api/menu/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated name",
  "price": 2000
}

Response: Updated menu item
```

### Delete Menu Item (Admin)
```
DELETE /api/menu/{id}
Authorization: Bearer {accessToken}
```

---

## Room Management

### Get All Rooms
```
GET /api/rooms

Response: Array of rooms with booking availability
```

### Create Room (Admin)
```
POST /api/rooms
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Deluxe Suite",
  "roomNumber": "101",
  "maxOccupancy": 4,
  "pricePerNight": 8000,
  "amenities": ["WiFi", "AC", "TV"],
  "images": ["base64_image1", "base64_image2"]
}

Response: Created room
```

### Update Room (Admin)
```
PUT /api/rooms/{id}
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Updated name",
  "pricePerNight": 9000
}

Response: Updated room
```

### Delete Room (Admin)
```
DELETE /api/rooms/{id}
Authorization: Bearer {accessToken}
```

---

## Hall & Event Management

### Get All Halls
```
GET /api/halls

Response: Array of event halls
```

### Create Hall (Admin)
```
POST /api/halls
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "name": "Grand Ballroom",
  "capacity": 500,
  "pricePerDay": 50000,
  "amenities": ["Projector", "Sound system", "Catering"],
  "images": ["base64_image1", "base64_image2"]
}

Response: Created hall
```

### Update Hall (Admin)
```
PUT /api/halls/{id}
Authorization: Bearer {accessToken}

{
  "name": "Updated name",
  "pricePerDay": 55000
}

Response: Updated hall
```

### Delete Hall (Admin)
```
DELETE /api/halls/{id}
Authorization: Bearer {accessToken}
```

---

## Bookings

### Get All Bookings
```
GET /api/bookings
Authorization: Bearer {accessToken}

Response: Array of bookings
```

### Create Room Booking
```
POST /api/bookings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "roomId": "room_uuid",
  "checkInDate": "2026-03-01",
  "checkOutDate": "2026-03-03",
  "numberOfGuests": 2,
  "notes": "Special requests"
}

Response: Created booking with total price
```

### Create Hall Booking
```
POST /api/bookings
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "hallId": "hall_uuid",
  "eventDate": "2026-04-15",
  "expectedGuests": 300,
  "eventType": "Wedding",
  "notes": "Catering required"
}

Response: Created booking with quote
```

### Update Booking
```
PUT /api/bookings/{id}
Authorization: Bearer {accessToken}

{
  "checkOutDate": "2026-03-04"
}

Response: Updated booking
```

### Cancel Booking
```
DELETE /api/bookings/{id}
Authorization: Bearer {accessToken}
```

---

## Orders

### Get All Orders
```
GET /api/orders
Authorization: Bearer {accessToken}

Response: Array of food orders
```

### Create Order
```
POST /api/orders
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "items": [
    {"menuItemId": "item_uuid", "quantity": 2},
    {"menuItemId": "item_uuid2", "quantity": 1}
  ],
  "specialRequests": "No onions"
}

Response: Created order with total
```

### Update Order Status (Admin)
```
PUT /api/orders/{id}
Authorization: Bearer {accessToken}

{
  "status": "preparing"
}

Response: Updated order
```

### Delete Order
```
DELETE /api/orders/{id}
Authorization: Bearer {accessToken}
```

---

## Payments

### Create Payment Intent
```
POST /api/payments/create-intent
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bookingId": "booking_uuid",
  "amount": 8000
}

Response: { clientSecret } (for Stripe)
```

### M-Pesa Payment
```
POST /api/payments/mpesa
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "bookingId": "booking_uuid",
  "phone": "+254712345678",
  "amount": 8000
}

Response: { checkoutRequestId }
```

---

## Admin Users

### Get Admin Users (Admin Only)
```
GET /api/admin/users
Authorization: Bearer {accessToken}

Response: Array of admin users
```

### Create Admin User (Super Admin Only)
```
POST /api/admin/users
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "email": "admin@megapark.com",
  "password": "SecurePassword123",
  "name": "Admin Name",
  "role": "admin"
}

Response: Created admin user
```

---

## API Documentation

Interactive API documentation available at:
```
GET /api/docs
```

Displays Swagger/OpenAPI documentation with:
- All endpoints
- Request/response schemas
- Try it out functionality
- Authentication examples

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Validation error",
  "details": ["field error descriptions"]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials" or "Missing token"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "server_error"
}
```

---

## Authentication

All protected endpoints require:
```
Authorization: Bearer {accessToken}
```

Get accessToken from `/api/auth/login` or `/api/auth/register`

---

## Rate Limiting

- Global: 100 requests/15 minutes
- Auth endpoints: 5 requests/15 minutes
- API endpoints: 30 requests/minute

Limits are per IP address.

---

## Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'

# Login  
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'

# Get rooms
curl http://localhost:3000/api/rooms

# Create room (requires token)
curl -X POST http://localhost:3000/api/rooms \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"name":"Suite","roomNumber":"101","maxOccupancy":2,"pricePerNight":5000}'
```

---

## Support

For API issues:
1. Check request format matches documentation
2. Verify authorization token is valid
3. Review error message details
4. Check server logs
5. Test with cURL or Postman
