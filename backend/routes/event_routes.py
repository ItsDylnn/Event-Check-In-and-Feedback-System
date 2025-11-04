from flask import Blueprint, jsonify, request
from models import db, Event, Feedback
from flask_jwt_extended import jwt_required, get_jwt_identity

event_bp = Blueprint('events', __name__)


from flask import current_app

@event_bp.route('', methods=['GET'])
def get_events():
    """Get all events without JWT requirement"""
    try:
        print("Attempting to get events...")  # Basic console log
        
        try:
            # Try to get all events from database
            events = Event.query.all()
            print(f"Found {len(events) if events else 0} events in database")
            
            # Return empty list if no events found
            if not events:
                return jsonify([])
            
            # Convert events to list of dictionaries
            events_data = []
            for event in events:
                print(f"Processing event: {event.id}")  # Log each event being processed
                event_data = {
                    'id': event.id,
                    'title': event.title,
                    'date': event.date,
                    'venue': event.venue
                }
                # Only add description if it exists
                if event.description:
                    event_data['description'] = event.description
                events_data.append(event_data)
            
            return jsonify(events_data)
            
        except Exception as e:
            print(f"Database error: {str(e)}")  # Log database errors
            return jsonify({"error": "Database error", "message": str(e)}), 500
            
    except Exception as e:
        print(f"Unexpected error: {str(e)}")  # Log unexpected errors
        return jsonify({"error": "Server error", "message": str(e)}), 500


@event_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    data = request.get_json()
    e = Event(
        title=data['title'],
        date=data['date'],
        venue=data['venue'],
        description=data.get('description')
    )

    db.session.add(e)
    db.session.commit()
    return jsonify({'msg': 'Event created'})


@event_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    ev = Event.query.get_or_404(event_id)
    db.session.delete(ev)
    db.session.commit()
    return jsonify({'msg': 'Event deleted'})


@event_bp.route('/<int:event_id>/feedback', methods=['POST'])
@jwt_required()
def submit_feedback(event_id):
    user = get_jwt_identity()
    if user['role'] != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    data = request.get_json()
    f = Feedback(
        user_id=user['id'],
        event_id=event_id,
        rating=data['rating'],
        comment=data.get('comment', '')
    )

    db.session.add(f)
    db.session.commit()
    return jsonify({'msg': 'Feedback submitted'})
