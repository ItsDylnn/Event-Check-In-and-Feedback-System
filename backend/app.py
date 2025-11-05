from flask import Flask, jsonify
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from models import db
from config import Config
from routes.auth_routes import auth_bp
from routes.event_routes import event_bp
from routes.feedback_routes import feedback_bp


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    app.config['PROPAGATE_EXCEPTIONS'] = True
    app.config['JSON_SORT_KEYS'] = False

    db.init_app(app)
    JWTManager(app)

    # ✅ Apply CORS BEFORE registering blueprints
    cors = CORS(
        app,
        resources={r"/*": {"origins": [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://boisterous-entremet-58dbc6.netlify.app"  # ✅ Your deployed Netlify site
        ]}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"]
    )

    # ✅ Register all blueprints AFTER CORS is set up
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(event_bp, url_prefix='/events')
    app.register_blueprint(feedback_bp, url_prefix='/feedback')

    @app.route('/')
    def index():
        return jsonify({"message": "Event API running"})

    # ✅ Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(422)
    def unprocessable_entity(error):
        return jsonify({"error": "Unprocessable Entity", "message": str(error)}), 422

    @app.errorhandler(500)
    def server_error(error):
        return jsonify({"error": "Internal Server Error", "message": str(error)}), 500

    return app


# ✅ Expose app for Render (Gunicorn)
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
