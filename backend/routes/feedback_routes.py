from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from models import Feedback, User

feedback_bp = Blueprint('feedback', __name__)

@feedback_bp.route('', methods=['GET'])
@jwt_required()
def get_feedback():
    user_id = get_jwt_identity()
    claims = get_jwt()

    if claims.get('role') != 'admin':
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
    return jsonify(data), 200


@feedback_bp.route('/my', methods=['GET'])
@jwt_required()
def get_my_feedback():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"msg": "User not found"}), 404

    feedback_list = Feedback.query.filter_by(user_id=user.id).all()
    data = [
        {
            "event_title": f.event.title if f.event else "Unknown Event",
            "rating": f.rating,
            "comment": f.comment,
            
        }
        for f in feedback_list
    ]

    return jsonify(data), 200
