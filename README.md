# dot2dot

## Project Overview
**dot2dot** is a web-based system for managing and documenting network infrastructure, including routers, endpoints, and networks. The project provides a user-friendly interface for adding, editing, and tracking network devices and their connections.

The system includes:
- A **Flask-based backend** with PostgreSQL as the database.
- A **React-based frontend** using Tailwind CSS for styling.
- API endpoints to manage routers, networks, endpoints, and logs.
- Docker support for easy deployment.

## Features
- 📌 **Router and Endpoint Management** – Add, edit, and delete routers and endpoints.
flask- 📜 **Logs and History Tracking** – Maintain a log of all actions performed.
- 🌐 **Multi-Language Support** – Hebrew and English translations.
- 🎨 **Interactive UI** – Built with React, TailwindCSS, and modern UI principles.

---
## Installation & Setup
### 1️⃣ Prerequisites
Ensure you have the following installed:
- [Python 3.9+](https://www.python.org/downloads/)
- [Node.js 18+](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- PostgreSQL database

### 2️⃣ Clone the Repository
```sh
 git clone https://github.com/your-username/dot2dot.git
 cd dot2dot
```

### 3️⃣ Backend Setup
#### 🔧 Virtual Environment
```sh
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows use: .venv\Scripts\activate
pip install -r requirements.txt
```
#### 🛠️ Set Up Environment Variables
Create a `.env` file in the `backend` directory:
```ini
FLASK_APP=app.py
FLASK_ENV=development
SQLALCHEMY_DATABASE_URI=postgresql://dordavid:your_password@localhost/network_db
```
#### 🚀 Run Flask Backend
```sh
flask run
```
By default, the backend runs on `http://127.0.0.1:5000/`.

### 4️⃣ Frontend Setup
#### 📦 Install Dependencies
```sh
cd ../frontend
npm install
```
#### 🏃 Run the Frontend
```sh
npm start
```
The frontend will start at `http://localhost:3000/`.

---
## Running with Docker 🐳
### 1️⃣ Build and Start the Containers
```sh
docker-compose up --build
```
This will:
- Start a PostgreSQL database container.
- Run the Flask backend.
- Serve the React frontend.

To stop the containers:
```sh
docker-compose down
```

---
## API Endpoints 📡
| Method | Endpoint               | Description                    |
|--------|------------------------|--------------------------------|
| GET    | `/api/routers`         | Retrieve all routers          |
| POST   | `/api/routers`         | Add a new router              |
| GET    | `/api/endpoints`       | Retrieve all endpoints        |
| POST   | `/api/endpoints`       | Add a new endpoint            |
| GET    | `/api/networks`        | Retrieve all networks         |
| POST   | `/api/networks`        | Add a new network             |
| GET    | `/api/logs`            | Retrieve logs                 |

---
## Technologies Used 🛠️
- **Backend:** Flask, SQLAlchemy, PostgreSQL
- **Frontend:** React, Tailwind CSS, React Router
- **State Management:** React Hooks
- **Logging:** API-based logging for all actions
- **Containerization:** Docker & Docker Compose

---
## Future Improvements 🚀
- 🌍 WebSocket support for real-time updates
- 📡 Improved logging system with filters
- 🛡️ Authentication and user roles

---

---
## License 📜
This project is licensed under the MIT License.

