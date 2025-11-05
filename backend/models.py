from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

db = SQLAlchemy()


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    role = db.Column(db.String(20), default='employee')

    # ✅ Relationships
    feedbacks = db.relationship('Feedback', backref='user', cascade='all, delete-orphan')
    registrations = db.relationship('Registration', backref='user', cascade='all, delete-orphan')

    def set_password(self, pw):
        self.password = generate_password_hash(pw)

    def check_password(self, pw):
        return check_password_hash(self.password, pw)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    date = db.Column(db.String(100), nullable=False)
    venue = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # ✅ Add cascading deletes
    feedbacks = db.relationship('Feedback', backref='event', cascade='all, delete-orphan')
    registrations = db.relationship('Registration', backref='event', cascade='all, delete-orphan')

    def __init__(self, title=None, date=None, venue=None, description=None):
        if title is not None:
            self.title = title
        if date is not None:
            self.date = date
        if venue is not None:
            self.venue = venue
        if description is not None:
            self.description = description

    def to_dict(self):
        """Convert event to dictionary, handling None values"""
        data = {
            'id': self.id,
            'title': self.title or '',
            'date': self.date or '',
            'venue': self.venue or ''
        }
        if self.description is not None:
            data['description'] = self.description
        return data


class Feedback(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # ✅ Added for timestamp


class Registration(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    email = db.Column(db.String(120))
    phone = db.Column(db.String(20))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
