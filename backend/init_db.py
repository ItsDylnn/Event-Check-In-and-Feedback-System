from app import create_app
from models import db, Event
import os

def init_db():
    app = create_app()
    
    # Ensure the instance folder exists
    if not os.path.exists('instance'):
        os.makedirs('instance')
    
    with app.app_context():
        # Drop and recreate all tables
        print("Dropping all tables...")
        db.drop_all()
        print("Creating all tables...")
        db.create_all()
        
        # Create test events
        events = [
            Event(
                title='Company Holiday Party',
                date='2025-12-25',
                venue='Main Conference Room',
                description='Annual company holiday celebration'
            ),
            Event(
                title='Team Building Workshop',
                date='2025-11-15',
                venue='Recreation Center',
                description='Interactive team building activities'
            ),
            Event(
                title='Quarterly Review Meeting',
                date='2025-11-30',
                venue='Board Room',
                description='Q4 2025 performance review'
            )
        ]
        
        # Add all events to the session
        print("Adding test events...")
        for event in events:
            db.session.add(event)
        
        try:
            # Commit the changes
            db.session.commit()
            print("Test events created successfully!")
            
            # Verify events were created
            all_events = Event.query.all()
            print(f"\nVerifying events in database:")
            for event in all_events:
                print(f"- {event.title} on {event.date} at {event.venue}")
                
        except Exception as e:
            print(f"Error creating test events: {str(e)}")
            db.session.rollback()

if __name__ == '__main__':
    init_db()