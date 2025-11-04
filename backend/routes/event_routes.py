from flask import Blueprint, jsonify, request
from models import db, Event, Feedback, Registration
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
                'venue': event.venue,
                'description': event.description or ''
            }
            events_data.append(event_data)

        return jsonify(events_data)
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({"error": "Server error", "message": str(e)}), 500


@event_bp.route('', methods=['POST'])
@jwt_required()
def create_event():
    """Admin creates a new event"""
    user_id = get_jwt_identity()
    claims = get_jwt()

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
    """Admin deletes an event"""
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
    """Employee submits feedback for an event"""
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    data = request.get_json()
    f = Feedback(
        user_id=int(user_id),
        event_id=event_id,
        rating=data['rating'],
        comment=data.get('comment', '')
    )

    db.session.add(f)
    db.session.commit()
    return jsonify({'msg': 'Feedback submitted successfully!'}), 201


@event_bp.route('/<int:event_id>/register', methods=['POST'])
@jwt_required()
def register_for_event(event_id):
    """Employee registers for an event with email and phone"""
    user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims.get('role') != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')

    if not email or not phone:
        return jsonify({'msg': 'Email and phone number required'}), 400

    # ✅ Check if already registered
    existing = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({'msg': 'You are already registered for this event'}), 400

    reg = Registration(user_id=user_id, event_id=event_id, email=email, phone=phone)
    db.session.add(reg)
    db.session.commit()

    return jsonify({'msg': 'Successfully registered for event!'}), 201


@event_bp.route('/<int:event_id>/unregister', methods=['DELETE'])
@jwt_required()
def unregister_from_event(event_id):
    """Employee unregisters from an event"""
    user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims.get('role') != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    registration = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()

    if not registration:
        return jsonify({'msg': 'You are not registered for this event'}), 404

    db.session.delete(registration)
    db.session.commit()
    return jsonify({'msg': 'You have been unregistered from this event'}), 200

@event_bp.route('/registrations', methods=['GET'])
@jwt_required()
def get_user_registrations():
    """Get list of event_ids the current user is registered for"""
    user_id = int(get_jwt_identity())

    registrations = Registration.query.filter_by(user_id=user_id).all()
    event_ids = [r.event_id for r in registrations]

    return jsonify({'registered_event_ids': event_ids}), 200

