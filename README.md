# REX Token - Full Stack Application

A modern full-stack cryptocurrency token platform built with React, Vite, TailwindCSS, Express.js, and MongoDB.

## 🚀 Tech Stack

### Frontend
- **React 19** - UI Library
- **Vite** - Build Tool & Dev Server
- **TailwindCSS 4** - Styling
- **Framer Motion** - Animations
- **Ethers.js** - Web3 Integration
- **React Router** - Routing
- **Axios** - HTTP Client

### Backend
- **Express.js** - Web Framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **Bcrypt** - Password Hashing
- **Helmet** - Security

## 📁 Project Structure

```
REXToken/
├── src/                 # Frontend source code
├── server/             # Backend API
│   ├── config/        # Database configuration
│   ├── controllers/   # Route controllers
│   ├── models/        # Mongoose models
│   ├── routes/        # API routes
│   ├── middleware/    # Custom middleware
│   └── server.js      # Express server
├── public/            # Static assets
└── dist/              # Production build (generated)
```

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your credentials:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

The API will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the root directory:
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env`:
```env
VITE_API_URL=http://localhost:5000
```

5. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

## 🚀 Deployment to Vercel

This project requires **two separate Vercel deployments**:
1. Backend API (from `/server` directory)
2. Frontend App (from root directory)

### Step 1: Deploy Backend API

1. **Install Vercel CLI** (if not already installed):
```bash
npm install -g vercel
```

2. **Navigate to server directory**:
```bash
cd server
```

3. **Deploy to Vercel**:
```bash
vercel
```

4. **Configure Environment Variables** in Vercel Dashboard:
   - Go to your project settings
   - Add these environment variables:
     - `MONGO_URI` - Your MongoDB connection string
     - `JWT_SECRET` - Your JWT secret key
     - `NODE_ENV` - Set to `production`

5. **Note your API URL** (e.g., `https://your-api.vercel.app`)

### Step 2: Deploy Frontend

1. **Navigate to root directory**:
```bash
cd ..
```

2. **Update environment variable**:
   - Create `.env.production` or set in Vercel:
   ```env
   VITE_API_URL=https://your-api.vercel.app
   ```

3. **Deploy to Vercel**:
```bash
vercel
```

4. **Configure Environment Variables** in Vercel Dashboard:
   - `VITE_API_URL` - Your backend API URL from Step 1

### Alternative: Deploy via Vercel Dashboard

1. **Push to GitHub**:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy **twice** (once for root, once for `/server`)

3. **Configure each deployment**:
   - **Backend**: Set root directory to `server`
   - **Frontend**: Use default root directory
   - Add environment variables as mentioned above

## 🔐 Security Notes

- Never commit `.env` files to Git
- Use strong JWT secrets in production
- Enable MongoDB IP whitelist
- Use HTTPS in production
- Keep dependencies updated

## 📝 API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/users/profile` - Get user profile
- `GET /api/packages` - Get available packages
- `POST /api/investments` - Create investment
- `GET /api/transactions` - Get transactions
- And more...

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For support, email your-email@example.com or open an issue in the repository.
