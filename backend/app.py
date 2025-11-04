from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from models import db
from config import Config
from routes.auth_routes import auth_bp
from routes.event_routes import event_bp
from routes.feedback_routes import feedback_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    JWTManager(app)
    CORS(app)

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(event_bp, url_prefix='/events')
    app.register_blueprint(feedback_bp, url_prefix='/feedback')

    @app.route('/')
    def index():
        return jsonify({"message": "Event API running"})

    return app


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)
