from flask import Blueprint, jsonify, request
from models import db, Event, Feedback
from flask_jwt_extended import jwt_required, get_jwt_identity

event_bp = Blueprint('events', __name__)


@event_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_events():
    events = Event.query.all()
    return jsonify([
        {
            'id': e.id,
            'title': e.title,
            'date': e.date,
            'venue': e.venue,
            'description': e.description
        }
        for e in events
    ])


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
