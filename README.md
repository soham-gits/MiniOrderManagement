# Order Management API

A complete **Order Management System** built using **Node.js, Express, TypeScript, and MongoDB**.  
This API allows users to register, log in, manage carts, place orders, and make payments — while admins can manage products and track orders.

---

## Features

### Authentication
- User registration and login using JWT
- Secured routes with token-based authentication

### User Endpoints
- **Add to Cart**
- **Delete Cart Item**
- **List Cart Items**
- **Checkout Order**
- **Pay for Order**
- **View Order History**
- **Get Order by ID**

### Admin Endpoints
- **Add Product**
- **List Products**
- **Update Product**
- **Delete Product**
- **View All Orders**
- **Update Order Status**

---

## Tech Stack

| Component | Technology |
|------------|-------------|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB with Mongoose |
| Auth | JWT (JSON Web Token) |
| API Testing | Postman |

---

## Installation & Setup

### Clone the repository
```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd order-management
```
Install dependencies
```bash
npm install
```
Setup environment variables

Create a .env file in the root directory and add:
```bash
MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=3000
JWT_SECRET=your_jwt_secret_here

REDIS_URL=Redis server connection URL
ORDER_PAYMENT_GRACE_MINUTES=15

# Mailtrap SMTP configuration
SMTP_HOST=SMTP host for sending emails (Mailtrap)
SMTP_PORT=PORT number
SMTP_USER=username
SMTP_PASS=password

```
Start the server
```bash
npm run dev
```

 ## API Documentation (Postman)

You can easily test all endpoints using the provided Postman collection.

 Import this file into Postman:
```bash
Order Management API CRUD.postman_collection.json
```

 Base URL:
```bash
http://localhost:3000
```
## Environment Variables (in Postman)
| Variable    | Example                          |
| ----------- | -------------------------------- |
| `baseUrl`   | `http://localhost:3000`          |
| `token`     | Your JWT Token                   |
| `orderId`   | Generated from checkout response |
| `productId` | Generated from product creation  |

## API Endpoints Summary
 Authentication
| Method | Endpoint       | Description         |
| ------ | -------------- | ------------------- |
| POST   | /auth/register | Register new user   |
| POST   | /auth/login    | Login and get token |

 Cart (User)
| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| POST   | /cart/add           | Add product to cart    |
| GET    | /cart               | List all items in cart |
| DELETE | /cart/items/:itemId | Remove item from cart  |

 Orders (User)
| Method | Endpoint             | Description                    |
| ------ | -------------------- | ------------------------------ |
| POST   | /orders/checkout     | Checkout cart and create order |
| POST   | /orders/:orderId/pay | Pay for order                  |
| GET    | /orders              | List user’s orders             |
| GET    | /orders/:id          | Get specific order details     |

 Admin
| Method | Endpoint                 | Description                                    |
| ------ | ------------------------ | ---------------------------------------------- |
| POST   | /products                | Add new product                                |
| GET    | /admin/products          | List all products                              |
| PUT    | /products/:id            | Update product details                         |
| DELETE | /products/:id            | Delete a product                               |
| GET    | /admin/orders            | View all orders                                |
| PATCH  | /admin/orders/:id/status | Update order status (e.g., SHIPPED, DELIVERED) |

## Example Workflow

1️Register a user → /auth/register
2️ Login → Get JWT token
3️Add Product (Admin) → /products
4️Add to Cart (User) → /cart/add
5️Checkout Order → /orders/checkout
6️Pay for Order → /orders/:orderId/pay
7️Admin Updates Order Status → /admin/orders/:id/status

## Order Status Flow
NEW → PENDING_PAYMENT → PAID → SHIPPED → DELIVERED
                   ↳ CANCELLED / FAILED (if payment fails)

## Developer Notes

Uses JWT middleware for route protection.

Admin and user functionalities are separated logically.

All routes tested using Postman collection (included in repo).

MongoDB is the main data store — configure via .env.

## Branch Info

Branch: feature/order-management-api
Includes:

CRUD APIs for Product, Cart, and Order

Authentication module

MongoDB integration

Postman collection

README documentation
