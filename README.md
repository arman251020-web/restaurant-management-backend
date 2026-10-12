# Restaurant Management Backend API

A RESTful backend API for a restaurant management system built with **Node.js, Express.js, MongoDB, and Mongoose**. It supports customer authentication, menu management, and food ordering with role-based access control for administrators.

## Features

- Customer registration and login
- Password hashing using bcrypt
- JWT authentication using HTTP-only cookies
- Role-based authorization for admin and customer
- View, search, and filter menu items
- Admin-only menu creation, updates, and deletion
- Place food orders and view personal order history
- Admin access to all orders
- Update order status
- Server-side order total calculation
- MongoDB database integration

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- bcrypt
- cookie-parser
- dotenv

## Project Structure

```text
restaurant-management-backend/
├── config/
│   └── db.js
├── middleware/
│   ├── auth.js
│   └── admin.js
├── models/
│   ├── User.js
│   ├── Menu.js
│   ├── Order.js
│   └── OrderItem.js
├── routes/
│   ├── authRoutes.js
│   ├── menuRoutes.js
│   └── orderRoutes.js
├── .env
├── .gitignore
├── package.json
└── server.js
```

## Installation

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd restaurant-management-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/restaurant_db
JWT_SECRET=your_long_random_secret
```

Make sure MongoDB is running. If you use MongoDB Atlas, replace the local connection string with your Atlas URI.

**Important:** Never commit your `.env` file or expose your database credentials or JWT secret.

### 4. Start the server

Development mode:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The API will run at:

`http://localhost:5000`

## API Endpoints

### Authentication

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/signup` | Public | Register a customer |
| POST | `/login` | Public | Log in |
| POST | `/logout` | Public | Log out |

Example signup request:

```json
{
  "name": "Test Customer",
  "email": "customer@restaurant.com",
  "password": "Customer@12345"
}
```

Example login request:

```json
{
  "email": "customer@restaurant.com",
  "password": "Customer@12345"
}
```

Public signup creates customer accounts. Admin access should be assigned only to trusted accounts.

### Menu Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/menu` | Public | View available menu items |
| GET | `/menu?search=paneer` | Public | Search menu items |
| GET | `/menu?category=Starter` | Public | Filter by category |
| POST | `/menu` | Admin | Add a menu item |
| PUT | `/menu/:id` | Admin | Update a menu item |
| DELETE | `/menu/:id` | Admin | Delete a menu item |

Example create-menu request:

```json
{
  "name": "Paneer Tikka",
  "category": "Starter",
  "price": 250,
  "description": "Grilled paneer with Indian spices",
  "image_url": "https://example.com/paneer.jpg",
  "is_available": true
}
```

Valid categories:

- Starter
- Main Course
- Dessert
- Drinks

Example update-menu request:

```json
{
  "price": 280,
  "description": "Spicy grilled paneer tikka"
}
```

### Order Management

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/order` | Authenticated customer | Place an order |
| GET | `/order/my-orders` | Authenticated customer | View personal orders |
| GET | `/order` | Admin | View all orders |
| PUT | `/order/:id/status` | Admin | Update order status |

Example place-order request:

```json
{
  "items": [
    {
      "food_id": "REPLACE_WITH_MENU_ITEM_ID",
      "quantity": 2
    }
  ]
}
```

The server calculates the total from the menu prices. Do not send a client-calculated total as a trusted value.

Available order statuses:

- Pending
- Preparing
- Out for delivery
- Delivered

Example status update request:

```json
{
  "status": "Preparing"
}
```

Replace the placeholder IDs with actual MongoDB document IDs returned by your API.

## Admin Account Setup

For development, first register an account through `/signup`. Then use `mongosh` to promote that trusted account:

```javascript
use restaurant_db

db.users.updateOne(
  { email: "admin@restaurant.com" },
  { $set: { role: "admin" } }
)
```

Log in again after changing the role so that the newly issued JWT includes the updated role.

## Testing with Postman

1. Register a customer using `POST /signup`.
2. Log in using `POST /login`.
3. Create a trusted admin account and assign the admin role in the development database.
4. Log in as admin and test menu creation, viewing, updating, and deletion.
5. Log in as a customer and test menu listing, searching, and category filtering.
6. Place an order using `POST /order`.
7. Check the customer's order history using `GET /order/my-orders`.
8. Log in as admin and test `GET /order` and `PUT /order/:id/status`.
9. Verify that customers cannot access admin-only routes.

Postman should retain the `token` cookie after login. Use separate cookie sessions when switching between admin and customer accounts.

## Security

- Store passwords as bcrypt hashes.
- Keep secrets in environment variables.
- Protect admin routes with authentication and role checks.
- Use HTTPS and secure cookie settings in production.
- Consider rate limiting, stricter validation, centralized error handling, and database transactions before production deployment.

