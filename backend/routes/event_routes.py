from flask import Blueprint, jsonify, request
from models import db, Event, Feedback, Registration
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_cors import cross_origin  # ✅ Import CORS

event_bp = Blueprint('events', __name__)

# 🌍 CORS origins for your React app
CORS_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

# 🟢 Public - Get all events
@event_bp.route('', methods=['GET'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
def get_events():
    """Get all events without JWT requirement"""
    try:
        events = Event.query.all()
        if not events:
            return jsonify([])

        events_data = [
            {
                'id': e.id,
                'title': e.title,
                'date': e.date,
                'venue': e.venue,
                'description': e.description or ''
            }
            for e in events
        ]
        return jsonify(events_data)
    except Exception as e:
        print(f"Error fetching events: {e}")
        return jsonify({"error": "Server error", "message": str(e)}), 500


# 🟠 Admin - Create event
@event_bp.route('', methods=['POST'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def create_event():
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


# 🔴 Admin - Delete event
@event_bp.route('/<int:event_id>', methods=['DELETE'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)  # ✅ CORS added here
@jwt_required()
def delete_event(event_id):
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    event = Event.query.get(event_id)
    if not event:
        return jsonify({'msg': 'Event not found'}), 404

    db.session.delete(event)
    db.session.commit()
    return jsonify({'msg': 'Event deleted successfully!'}), 200


# 💬 Employee - Submit feedback
@event_bp.route('/<int:event_id>/feedback', methods=['POST'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def submit_feedback(event_id):
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


# 🟡 Employee - Register for event
@event_bp.route('/<int:event_id>/register', methods=['POST'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def register_for_event(event_id):
    user_id = int(get_jwt_identity())
    claims = get_jwt()

    if claims.get('role') != 'employee':
        return jsonify({'msg': 'Employee only'}), 403

    data = request.get_json()
    email = data.get('email')
    phone = data.get('phone')

    if not email or not phone:
        return jsonify({'msg': 'Email and phone number required'}), 400

    existing = Registration.query.filter_by(user_id=user_id, event_id=event_id).first()
    if existing:
        return jsonify({'msg': 'You are already registered for this event'}), 400

    reg = Registration(user_id=user_id, event_id=event_id, email=email, phone=phone)
    db.session.add(reg)
    db.session.commit()
    return jsonify({'msg': 'Successfully registered for event!'}), 201


# 🔵 Employee - Unregister from event
@event_bp.route('/<int:event_id>/unregister', methods=['DELETE'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def unregister_from_event(event_id):
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


# 🟢 Employee - Get registered events
@event_bp.route('/registrations', methods=['GET'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def get_user_registrations():
    user_id = int(get_jwt_identity())
    registrations = Registration.query.filter_by(user_id=user_id).all()
    event_ids = [r.event_id for r in registrations]
    return jsonify({'registered_event_ids': event_ids}), 200


# 🟣 Admin - View all feedback
@event_bp.route('/feedback/all', methods=['GET'])
@cross_origin(origins=CORS_ORIGINS, supports_credentials=True)
@jwt_required()
def get_all_feedback():
    claims = get_jwt()

    if claims.get('role') != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    from models import User
    feedback_entries = (
        db.session.query(Feedback, Event, User)
        .join(Event, Feedback.event_id == Event.id)
        .join(User, Feedback.user_id == User.id)
        .all()
    )

    feedback_data = [
        {
            'feedback_id': fb.id,
            'event_id': ev.id,
            'event_title': ev.title,
            'rating': fb.rating,
            'comment': fb.comment,
            'user_id': usr.id,
            'user_name': usr.name,
            'user_email': usr.email,
        }
        for fb, ev, usr in feedback_entries
    ]
    return jsonify(feedback_data), 200
