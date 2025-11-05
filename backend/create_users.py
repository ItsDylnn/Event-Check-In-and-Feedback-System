from app import create_app, db
from models import User

app = create_app()
with app.app_context():
    admin = User(name="Admin", email="admin@example.com", role="admin")
    admin.set_password("admin123")
    employee = User(name="Employee", email="employee@example.com", role="employee")
    employee.set_password("employee123")

    db.session.add(admin)
    db.session.add(employee)
    db.session.commit()

    print("✅ Admin and employee created successfully!")
