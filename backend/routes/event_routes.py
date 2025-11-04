from flask import Blueprint, jsonify, request
from models import db, Event, Feedback
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

event_bp = Blueprint('events', __name__)

@event_bp.route('', methods=['GET'])
def get_events():
    """Get all events without JWT requirement"""
    try:
        events = Event.query.all()
        if not events:
            return jsonify([])

        events_data = []
        for event in events:
            event_data = {
                'id': event.id,
                'title': event.title,
                'date': event.date,
                'venue': event.venue
            }
            if event.description:
                event_data['description'] = event.description
            events_data.append(event_data)

        return jsonify(events_data)
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({"error": "Server error", "message": str(e)}), 500


@event_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    user_id = get_jwt_identity()  # ✅ this is now a string
    claims = get_jwt()            # ✅ contains role, name, etc.

    if claims.get('role') != 'admin':
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
    return jsonify({'msg': 'Event created successfully!'}), 201


@event_bp.route('/<int:event_id>', methods=['DELETE'])
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    ev = Event.query.get_or_404(event_id)
    db.session.delete(ev)
    db.session.commit()
    return jsonify({'msg': 'Event deleted successfully!'}), 200


@event_bp.route('/<int:event_id>/feedback', methods=['POST'])
@jwt_required()
def submit_feedback(event_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    data = request.get_json()
    f = Feedback(
        user_id=int(user_id),  # ✅ convert string ID back to integer
        event_id=event_id,
        rating=data['rating'],
        comment=data.get('comment', '')
    )

    db.session.add(f)
    db.session.commit()
    return jsonify({'msg': 'Feedback submitted successfully!'}), 201
