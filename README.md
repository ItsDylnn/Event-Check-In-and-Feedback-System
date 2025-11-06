# Event Check-In and Feedback System

A full-stack web application built using **Flask (Python)** for the backend and **React (Vite)** for the frontend.  
This system allows admins to create and manage events, employees to register and check in, and users to submit feedback.

---

## 🚀 Features

### 👩‍💼 Admin
- Create, edit, and delete events.
- View all registered participants.
- Collect and view feedback.

### 👨‍💼 Employee
- Register for events.
- Check in and view upcoming events.
- Submit event feedback after attending.

---

## 🧩 Tech Stack

**Frontend:** React (Vite), Axios, Standard CSS  
**Backend:** Flask, Flask-SQLAlchemy, Flask-JWT-Extended, Flask-CORS  
**Database:** SQLite (development)  
**Deployment:** Render (backend) + Netlify (frontend)

---

## ⚙️ Setup Instructions (Local)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/event-checkin-system.git
cd event-checkin-system
```

### 2️⃣ Setup the Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate     # On Windows
# or
source venv/bin/activate    # On macOS/Linux

pip install -r requirements.txt
```

### 3️⃣ Initialize the Database
```bash
python create_users.py
```

### 4️⃣ Run the Flask Server
```bash
flask run
```
Server should start at: **http://127.0.0.1:5000**

### 5️⃣ Setup the Frontend
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will run at: **http://localhost:3000**

---

## 🧠 Troubleshooting

- **Database locked:** close any app using the database (e.g., VS Code preview or SQLite browser).
- **Invalid credentials:** re-run `python create_users.py` to create the default accounts.
- **CORS issues:** make sure your frontend URL matches the `origins` list in `app.py`.

---

## 👥 Default Users

| Role     | Email              | Password    |
|-----------|--------------------|--------------|
| Admin     | admin@example.com  | admin123     |
| Employee  | employee@example.com | employee123 |

---

## 📁 Project Structure

```
EVENT-CHECK-IN-AND-FEEDBACK/
├── backend/
│   ├── routes/
│   │   ├── auth_routes.py
│   │   ├── event_routes.py
│   │   └── feedback_routes.py
│   ├── app.py
│   ├── config.py
│   ├── create_test_event.py
│   ├── create_users.py
│   ├── init_db.py
│   ├── models.py
│   ├── requirements.txt
│   └── Procfile
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AdminFeedbackPage.jsx
│   │   │   ├── AdminPage.jsx
│   │   │   ├── EventsPage.jsx
│   │   │   ├── FeedbackPage.jsx
│   │   │   ├── LoginRegister.jsx
│   │   │   └── MyFeedbackPage.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── auth.js
│   │   ├── index.js
│   │   └── styles.css
├── .env
├── package-lock.json
├── package.json
├── .gitignore
└── README.md

```

---

## 🏁 License
This project is for educational use only.
