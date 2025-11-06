from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager
from flask_sqlalchemy import SQLAlchemy
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

    # ✅ Register routes
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(event_bp, url_prefix="/events")
    app.register_blueprint(feedback_bp, url_prefix="/feedback")

    @app.route("/")
    def index():
        return jsonify({"message": "Event API running"})

    # ✅ Manually add CORS headers to every response
    @app.after_request
    def add_cors_headers(response):
        origin = request.headers.get("Origin")
        allowed = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "https://boisterous-entremet-58dbc6.netlify.app"
        ]
        if origin in allowed:
            response.headers["Access-Control-Allow-Origin"] = origin
        else:
            response.headers["Access-Control-Allow-Origin"] = "https://boisterous-entremet-58dbc6.netlify.app"

        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response

    # ✅ Handle OPTIONS requests globally
    @app.before_request
    def handle_options():
        if request.method == "OPTIONS":
            resp = app.make_response("")
            resp.status_code = 200
            return resp

    return app


# ✅ For Render (Gunicorn)
app = create_app()

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True, host="0.0.0.0", port=5000)
