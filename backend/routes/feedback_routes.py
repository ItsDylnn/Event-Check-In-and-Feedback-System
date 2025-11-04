from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Feedback

feedback_bp = Blueprint('feedback', __name__)


@feedback_bp.route('', methods=['GET'])
@jwt_required()
def get_feedback():
    user = get_jwt_identity()
    if user['role'] != 'admin':
        return jsonify({'msg': 'Admin only'}), 403

    feedbacks = Feedback.query.all()
    data = [
        {
            'id': f.id,
            'user_id': f.user_id,
            'event_id': f.event_id,
            'rating': f.rating,
            'comment': f.comment
        }
        for f in feedbacks
    ]
    return jsonify(data)
