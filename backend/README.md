# Expense Tracker API

A RESTful API built with Node.js, Express, and MongoDB for tracking income and expenses.

## Features

- 🔐 User authentication with JWT
- 💰 Income and expense management
- 📊 Dashboard analytics
- 🔒 Secure password hashing with bcrypt
- ✅ Input validation
- 📁 Excel export functionality
- 🌐 CORS enabled

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** validator
- **File Export:** xlsx

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB database (local or cloud)
- npm or yarn

### Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables in `.env`:
```env
PORT=4000
NODE_ENV=development
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_random_string
JWT_EXPIRATION=24h
```

### Generate JWT Secret

To generate a secure JWT secret, run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Running the Server

Development mode (with auto-restart):
```bash
npm start
```

The server will start on `http://localhost:4000` (or your configured PORT).

## API Endpoints

### Authentication

#### Register User
- **POST** `/api/user/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object and JWT token

#### Login User
- **POST** `/api/user/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** User object and JWT token

#### Get User Profile
- **GET** `/api/user/me`
- **Headers:** `Authorization: Bearer <token>`
- **Response:** User profile data

#### Update Profile
- **PUT** `/api/user/profile`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "John Updated",
    "email": "john.updated@example.com"
  }
  ```

### Income Management

All income endpoints require authentication.

#### Get All Incomes
- **GET** `/api/income`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?period=month&month=1&year=2024`

#### Add Income
- **POST** `/api/income`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "description": "Salary",
    "amount": 5000,
    "category": "Salary",
    "date": "2024-01-15"
  }
  ```

#### Update Income
- **PUT** `/api/income/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Income
- **DELETE** `/api/income/:id`
- **Headers:** `Authorization: Bearer <token>`

### Expense Management

All expense endpoints require authentication.

#### Get All Expenses
- **GET** `/api/expense`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?period=month&month=1&year=2024`

#### Add Expense
- **POST** `/api/expense`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "description": "Groceries",
    "amount": 150,
    "category": "Food",
    "date": "2024-01-15"
  }
  ```

#### Update Expense
- **PUT** `/api/expense/:id`
- **Headers:** `Authorization: Bearer <token>`

#### Delete Expense
- **DELETE** `/api/expense/:id`
- **Headers:** `Authorization: Bearer <token>`

### Dashboard

#### Get Dashboard Data
- **GET** `/api/dashboard`
- **Headers:** `Authorization: Bearer <token>`
- **Query Params:** `?period=month&month=1&year=2024`
- **Response:** Aggregated financial data

## Project Structure

```
backend/
├── config/
│   └── db.js              # Database connection
├── controllers/
│   ├── userController.js   # User authentication & profile logic
│   ├── incomeController.js # Income management logic
│   ├── expenseController.js# Expense management logic
│   └── dashboardController.js # Dashboard analytics logic
├── middleware/
│   └── auth.js            # JWT authentication middleware
├── models/
│   ├── userModel.js       # User schema
│   ├── incomeModel.js     # Income schema
│   └── expenseModel.js    # Expense schema
├── routes/
│   ├── userRoutes.js      # User routes
│   ├── incomeRoutes.js    # Income routes
│   ├── expenseRoutes.js   # Expense routes
│   └── dashboardRoutes.js # Dashboard routes
├── utils/
│   └── dateFilter.js      # Date filtering utilities
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── server.js              # Application entry point
```

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port number | `4000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT signing | Random 32-byte hex string |
| `JWT_EXPIRATION` | Token expiration time | `24h`, `7d`, etc. |

## Security Features

- Password hashing with bcrypt (10 rounds)
- JWT-based authentication
- Protected routes with authentication middleware
- Email validation
- Password strength requirements (minimum 8 characters)
- CORS configuration

## Error Handling

The API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

## Development

### Scripts

- `npm start` - Start the server with nodemon (auto-restart on changes)

### Dependencies

- **express** - Web framework
- **mongoose** - MongoDB ODM
- **jsonwebtoken** - JWT implementation
- **bcryptjs** - Password hashing
- **validator** - String validation
- **cors** - CORS middleware
- **dotenv** - Environment variable management
- **xlsx** - Excel file generation
- **nodemon** - Development auto-restart

## License

ISC

## Author

Ishita Agrawal
