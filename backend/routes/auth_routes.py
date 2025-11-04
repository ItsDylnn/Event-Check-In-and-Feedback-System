from flask import Blueprint, request, jsonify
from models import db, User
from flask_jwt_extended import create_access_token

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    pw = data.get('password')

    if not all([name, email, pw]):
        return jsonify({'msg': 'Missing fields'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'msg': 'Email already exists'}), 400

    user = User(name=name, email=email)
    user.set_password(pw)
    db.session.add(user)
    db.session.commit()

    return jsonify({'msg': 'User registered successfully'}), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    pw = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user or not user.check_password(pw):
        return jsonify({'msg': 'Invalid credentials'}), 401

    # ✅ FIXED: identity must be a string; extra info goes into additional_claims
    token = create_access_token(
        identity=str(user.id),
        additional_claims={
            'role': user.role,
            'name': user.name
        }
    )

    return jsonify({
        'access_token': token,
        'role': user.role,
        'name': user.name
    }), 200
