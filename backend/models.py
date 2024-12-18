from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

# טבלת רשתות
class Network(db.Model):
    __tablename__ = 'networks'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # שם הרשת
    description = db.Column(db.Text, nullable=True)  # תיאור הרשת
    color = db.Column(db.String(7), nullable=False, default='#FFFFFF')  # צבע (ברירת מחדל לבן)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך יצירה

    # קשר לנתבים שמשויכים לרשת זו
    routers = db.relationship('Router', backref='network', lazy=True)

# טבלת נתבים
class Router(db.Model):
    __tablename__ = 'routers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # שם הנתב
    ip_address = db.Column(db.String(15), unique=True, nullable=False)  # כתובת IP
    floor = db.Column(db.Integer, nullable=False)  # קומה
    building = db.Column(db.String(50), nullable=False)  # בניין
    connection_speed = db.Column(db.String(50), nullable=False)  # מהירות חיבור

    # קשר לרשת (מפתח זר לטבלת networks)
    network_id = db.Column(db.Integer, db.ForeignKey('networks.id'), nullable=False)

    ports_count = db.Column(db.Integer, default=8)  # מספר פורטים
    is_stack = db.Column(db.Boolean, default=False)  # האם זה stack
    slots_count = db.Column(db.Integer, default=1)  # מספר ה-Slots
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך יצירה

    # קשר לנקודות קצה
    endpoints = db.relationship('Endpoint', backref='router', lazy=True)

# טבלת נקודות קצה
class Endpoint(db.Model):
    __tablename__ = 'endpoints'
    id = db.Column(db.Integer, primary_key=True)
    technician_name = db.Column(db.String(100), nullable=False)  # שם הטכנאי
    ip_address = db.Column(db.String(15), nullable=True)  # כתובת IP
    connected_port_number = db.Column(db.Integer, nullable=True)  # מספר פורט בצד השני
    point_location = db.Column(db.String(100), nullable=True)  # מיקום פיזי
    destination_room = db.Column(db.String(100), nullable=True)  # חדר יעד
    router_id = db.Column(db.Integer, db.ForeignKey('routers.id'), nullable=False)  # קשר לנתב

# טבלת לוגים
class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)  # פעולה שבוצעה
    entity = db.Column(db.String(50), nullable=False)  # סוג היישות (Router/Endpoint)
    entity_id = db.Column(db.Integer, nullable=False)  # מזהה היישות
    technician_name = db.Column(db.String(100), nullable=False)  # שם הטכנאי
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך הפעולה
    details = db.Column(db.Text, nullable=True)  # פרטים נוספים
