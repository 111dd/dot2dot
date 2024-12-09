from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from sqlalchemy.dialects.postgresql import ENUM

db = SQLAlchemy()

# רשימת הרשתות
NETWORK_TYPES = ('שביל החלב', 'נתיב רקיע', 'ממד"ס', 'קליקנט',
                 'למדן', 'רומ"ח', 'רואי', 'ארמי',
                 'לב', 'ארמי TS', 'אליס')

# טבלת נתבים
class Router(db.Model):
    __tablename__ = 'routers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(15), unique=True, nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    building = db.Column(db.String(50), nullable=False)
    connection_speed = db.Column(db.String(50), nullable=False)
    network_type = db.Column(db.String(50), nullable=True)  # או מה שיש בשדה `network`

    ports_count = db.Column(db.Integer, default=8)  # מספר פורטים עם ברירת מחדל
    is_stack = db.Column(db.Boolean, default=False)  # האם זה stack
    slots_count = db.Column(db.Integer, default=1)  # מספר ה-Slots עם ברירת מחדל
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # קשר לנקודות קצה
    endpoints = db.relationship('Endpoint', backref='router', lazy=True)

# טבלת נקודות קצה
class Endpoint(db.Model):
    __tablename__ = 'endpoints'
    id = db.Column(db.Integer, primary_key=True)
    network = db.Column(db.String(100), nullable=False)
    technician_name = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(15), nullable=False)
    port_number = db.Column(db.Integer, nullable=False)
    point_location = db.Column(db.String(100), nullable=False)
    destination_room = db.Column(db.String(100), nullable=False)
    router_id = db.Column(db.Integer, db.ForeignKey('routers.id'), nullable=False)

# טבלת לוגים
class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)
    entity = db.Column(db.String(50), nullable=False)  # Router or Endpoint
    technician_name = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    details = db.Column(db.Text, nullable=True)
