from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS, cross_origin
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

    # ✅ Allow both localhost and your deployed frontend
    CORS(
        app,
        origins=[
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://boisterous-entremet-58dbc6.netlify.app",
        ],
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # ✅ Register routes after CORS
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(event_bp, url_prefix="/events")
    app.register_blueprint(feedback_bp, url_prefix="/feedback")

    @app.route("/")
    @cross_origin()
    def index():
        return jsonify({"message": "Event API running"})

    # ✅ Explicitly handle OPTIONS preflight requests
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            response = app.make_default_options_response()
            headers = response.headers
            headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
            headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            headers["Access-Control-Allow-Credentials"] = "true"
            return response

    # ✅ Error handlers
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


# ✅ Expose for Render (Gunicorn)
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)
