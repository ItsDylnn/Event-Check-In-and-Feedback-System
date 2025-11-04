from app import create_app
from models import db, Event

app = create_app()

with app.app_context():
    db.create_all()
    
    # Create a test event
    test_event = Event(
        title='Test Event',
        date='2025-11-04',
        venue='Test Venue',
        description='Test Description'
    )
    
    try:
        db.session.add(test_event)
        db.session.commit()
        print("Test event created successfully!")
    except Exception as e:
        print(f"Error creating test event: {str(e)}")
        db.session.rollback()