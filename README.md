# Angular Auth Boilerplate - Full Stack Authentication System

A complete authentication system built with Angular 21 and Node.js, featuring email verification, JWT authentication, refresh tokens, role-based authorization (Admin/User), password reset functionality, and profile management.

## 🚀 Live Demo

| Application | URL |
|-------------|-----|
| **Frontend Application** | [https://klykly-auth-frontend.onrender.com](https://klykly-auth-frontend.onrender.com) |
| **Backend API** | [https://klykly-auth-backend.onrender.com](https://klykly-auth-backend.onrender.com) |
| **API Documentation (Swagger)** | [https://klykly-auth-backend.onrender.com/api-docs](https://klykly-auth-backend.onrender.com/api-docs) |

## 📋 Features

### Authentication & Authorization
- ✅ User Registration with Email Verification
- ✅ Login with JWT Authentication
- ✅ Refresh Token Mechanism (Automatic token refresh)
- ✅ Role-Based Access Control (Admin & User roles)
- ✅ Forgot Password / Reset Password functionality

### User Management
- ✅ Profile Management (View/Update Profile)
- ✅ Delete Account option
- ✅ Admin Panel for managing all user accounts
- ✅ Admin can Create, Edit, and Delete any user

### Technical Features
- ✅ Persistent user session with localStorage
- ✅ Protected routes with AuthGuard
- ✅ HTTP Interceptors for JWT tokens
- ✅ Responsive UI with Bootstrap 5
- ✅ Swagger API Documentation

## 🛠️ Technology Stack

### Frontend
- **Framework:** Angular 21
- **Styling:** Bootstrap 5, Custom CSS
- **Authentication:** JWT Tokens, HTTP-only cookies
- **Deployment:** Render (Static Site)

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (Aiven Cloud)
- **Authentication:** JWT, bcrypt
- **Email Service:** Brevo (Sendinblue)
- **Documentation:** Swagger/OpenAPI
- **Deployment:** Render (Web Service)

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MySQL database (or use Aiven cloud)

2. Install dependencies:
npm install
3. Configure environment:
Update src/environments/environment.ts for development:
export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000'

};
Update src/environments/environment.prod.ts for production:
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-url.onrender.com'
};
4. Run development server:
ng serve
Navigate to http://localhost:4200
5. Build for production:
ng build --prod
Build artifacts will be in the dist/ directory.

**Backend Setup**
__Install dependencies:_
npm install
_Configure environment variables:_
Create a .env file:
# Server
PORT=4000
NODE_ENV=development

# Database
DB_HOST=your-database-host
DB_PORT=3306
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=15m

# Email (Brevo)
BREVO_API_KEY=your-brevo-api-key
EMAIL_FROM=noreply@yourdomain.com

# Frontend URL
FRONTEND_URL=http://localhost:4200

🔐 User Roles
Role	Permissions
Admin	Full access to Admin Panel, can view, create, edit, and delete all user accounts
User	Can only view and update their own profile
Note: The first account registered automatically gets the Admin role. All subsequent accounts are assigned the User role.

📁 Project Structure
Frontend Structure
text
src/
├── app/
│   ├── _components/     # Reusable components (Alert)
│   ├── _helpers/        # Guards, interceptors, validators
│   ├── _models/         # TypeScript interfaces/enums
│   ├── _services/       # API services (Account, Alert)
│   ├── account/         # Authentication pages
│   ├── admin/           # Admin-only pages
│   ├── home/            # Home page
│   └── profile/         # User profile pages
├── environments/        # Environment configuration
└── styles.css          # Global styles
Backend Structure
text
src/
├── config/              # Database configuration
├── controllers/         # Request handlers
├── middleware/          # Auth middleware
├── models/              # Database models
├── routes/              # API routes
├── utils/               # Utility functions (email, jwt)
└── swagger.js          # Swagger configuration
📡 API Endpoints
Method	Endpoint	Description	Access
POST	/accounts/register	Register new user	Public
POST	/accounts/verify-email	Verify email with token	Public
POST	/accounts/authenticate	Login user	Public
POST	/accounts/refresh-token	Refresh JWT token	Public
POST	/accounts/revoke-token	Logout (revoke token)	Authenticated
POST	/accounts/forgot-password	Request password reset	Public
POST	/accounts/validate-reset-token	Validate reset token	Public
POST	/accounts/reset-password	Reset password	Public
GET	/accounts	Get all users	Admin only
GET	/accounts/:id	Get user by ID	Authenticated
PUT	/accounts/:id	Update user	Authenticated
DELETE	/accounts/:id	Delete user	Authenticated
Interactive API Documentation: Visit /api-docs on the backend URL

🧪 Testing the Application
Register a new account
Navigate to /account/register

Fill in your details and submit

Check your email for verification link

Click the verification link to activate your account

Login
Navigate to /account/login

Enter your email and password

Upon success, you'll be redirected to the home page

Admin Access
The first account registered becomes an Admin

Admins can access /admin to manage all users

Password Reset
Click "Forgot Password" on the login page

Enter your email

Check your email for reset link

Set a new password

Profile Management
Click "Profile" in the navigation bar

View your account details

Click "Edit Profile" to update information

Click "Delete Account" to remove your account

🚀 Deployment
Frontend (Render Static Site)
Render Configuration:

Build Command: npm install && ng build --prod

Publish Directory: dist/angular-auth-boilerplate/browser

Rewrite Rule: /* → /index.html (Action: Rewrite)

Backend (Render Web Service)
Render Configuration:

Build Command: npm install

Start Command: npm start

Environment Variables: Configure all .env variables in Render dashboard

📝 Environment Variables
Backend Required Variables
Variable	Description
PORT	Server port (default: 4000)
DB_HOST	MySQL database host
DB_PORT	MySQL database port
DB_USER	MySQL database user
DB_PASSWORD	MySQL database password
DB_NAME	MySQL database name
JWT_SECRET	Secret key for JWT tokens
BREVO_API_KEY	Brevo email service API key
EMAIL_FROM	Sender email address
FRONTEND_URL	Frontend application URL
🔗 Related Repositories
Repository	URL
Frontend	https://github.com/Kly-kly/angular-auth-boilerplate-frontend
Backend	https://github.com/Kly-kly/angular-auth-boilerplate-backend
🤝 Contributing
Fork the repository

Create your feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add some amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

👨‍💻 Author
Klein Ople










