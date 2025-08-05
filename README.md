# Ceylon Tea Corner

A full-stack inventory and sales management system for a Sri Lankan tea shop with Django REST API backend and React Native mobile frontend.

## 🚀 Quick Start

### Prerequisites
- Python 3.12+
- Node.js 18+
- PostgreSQL
- Expo CLI (`npm install -g @expo/cli`)

### Backend Setup
```bash
cd backend/
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend/ceylon-tea-mobile/
npm install
npm start
```

## 📁 Project Structure

```
├── backend/                 # Django REST API
│   ├── ceylon_tea_corner/  # Project settings
│   ├── inventory/          # Main app (models, views, serializers)
│   ├── manage.py
│   └── requirements.txt
├── frontend/               # React Native Mobile App
│   └── ceylon-tea-mobile/
│       ├── src/
│       │   ├── components/ # Reusable UI components
│       │   ├── screens/    # Screen components
│       │   ├── services/   # API services
│       │   ├── context/    # React Context
│       │   ├── navigation/ # Navigation setup
│       │   └── utils/      # Utility functions
│       └── package.json
└── README.md
```

## 🛠 Tech Stack

**Backend:**
- Django 4.2.7 + Django REST Framework 3.14.0
- PostgreSQL with psycopg2-binary 2.9.7
- JWT Authentication (djangorestframework-simplejwt)
- CORS Headers support

**Frontend:**
- React Native 0.79.5 with Expo ~53.0.20
- React Navigation 7.x for routing
- Axios for HTTP requests
- AsyncStorage for local persistence

## 🔌 API Endpoints

- `POST /api/login/` - User authentication
- `GET /api/teas/` - List teas (with category filtering)
- `POST /api/sales/` - Record sales
- `GET /api/reports/` - Sales reports

## 🔧 Configuration

### Database Setup
1. Create PostgreSQL database
2. Update `backend/ceylon_tea_corner/settings.py` with your database credentials
3. Run migrations: `python manage.py migrate`

### Frontend API Configuration
Update the API base URL in `frontend/ceylon-tea-mobile/src/utils/constants.js`:
```javascript
export const API_BASE_URL = 'http://your-backend-url:8000/api';
```

## ✨ Features

- **User Authentication** with JWT tokens
- **Tea Inventory Management** with categories
- **Sales Recording** and tracking
- **Sales Reports** and analytics
- **Admin Interface** for data management
- **Mobile-First Design** with React Native

## 📱 Development

### Backend Development
```bash
cd backend/
python manage.py runserver  # Runs on http://localhost:8000
```

### Frontend Development
```bash
cd frontend/ceylon-tea-mobile/
npm start  # Opens Expo developer tools
```

### Package Management
The project supports both pip and pipenv:
- `pip install -r requirements.txt` OR
- `pipenv install` (if you prefer pipenv)

## 🏗 Development Status

✅ **Complete**
- Backend API with Django REST Framework
- Authentication system with JWT
- Database models and migrations
- React Native project setup with Expo
- Navigation and project structure
