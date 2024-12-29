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


# טבלת דגמי נתבים
class RouterModel(db.Model):
    __tablename__ = 'router_models'
    id = db.Column(db.Integer, primary_key=True)
    model_name = db.Column(db.String(100), unique=True, nullable=True)  # שם הדגם

    # קשר לנתבים שמשתמשים בדגם הזה
    routers = db.relationship('Router', backref='router_model', lazy=True)  # שם ה-backref הוא 'router_model'


# טבלת נתבים
class Router(db.Model):
    __tablename__ = 'routers'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # שם הנתב (ייחודי)
    model_id = db.Column(db.Integer, db.ForeignKey('router_models.id'), nullable=True)  # Foreign Key לדגם
    ip_address = db.Column(db.String(15), unique=True, nullable=False)  # כתובת IP
    floor = db.Column(db.Integer, nullable=False)  # קומה
    building = db.Column(db.String(50), nullable=False)  # בניין
    connection_speed = db.Column(db.String(50), nullable=False)  # מהירות חיבור
    ports_count = db.Column(db.Integer, default=8)  # מספר פורטים
    is_stack = db.Column(db.Boolean, default=False)  # האם זה stack
    slots_count = db.Column(db.Integer, default=0)  # מספר ה-Slots
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך יצירה

    # קשר לרשת (מפתח זר לטבלת networks)
    network_id = db.Column(db.Integer, db.ForeignKey('networks.id'), nullable=False)

    # קשר לנקודות קצה
    endpoints = db.relationship('Endpoint', backref='router', lazy=True)

    # קשר לסוויצ'ים
    switches = db.relationship('Switch', backref='router', lazy=True)


# טבלת סוויצ'ים
class Switch(db.Model):
    __tablename__ = 'switches'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)  # שם הסוויץ' (ייחודי)
    model = db.Column(db.String(100), nullable=False)  # דגם הסוויץ'
    ip_address = db.Column(db.String(15), unique=True, nullable=False)  # כתובת IP
    router_id = db.Column(db.Integer, db.ForeignKey('routers.id'), nullable=False)  # קשר לנתב
    connection_port = db.Column(db.Integer, nullable=False)  # מספר פורט המחבר לנתב
    created_at = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך יצירה

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
    rit_port_number = db.Column(db.Integer, nullable=True, default=0)  # מספר פורט RIT
    network = db.Column(db.String(100), nullable=True)  # רשת משויכת

# טבלת לוגים
class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True)
    action = db.Column(db.String(50), nullable=False)  # פעולה שבוצעה
    entity = db.Column(db.String(50), nullable=False)  # סוג היישות (Router/Endpoint/Switch)
    entity_id = db.Column(db.Integer, nullable=False)  # מזהה היישות
    technician_name = db.Column(db.String(100), nullable=False)  # שם הטכנאי
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)  # תאריך הפעולה
    details = db.Column(db.Text, nullable=True)  # פרטים נוספים
