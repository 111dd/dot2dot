from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()

# טבלת רשתות
class Network(db.Model):
    __tablename__ = 'networks'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text, nullable=True)
    color = db.Column(db.String(7), nullable=False, default='#FFFFFF')
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    # קשר לנתבים
    routers = db.relationship('Router', backref='network', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'color': self.color,
            'created_at': self.created_at.isoformat()
        }

# טבלת דגמי נתבים
class RouterModel(db.Model):
    __tablename__ = 'router_models'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    model_name = db.Column(db.String(100), unique=True, nullable=True)

    # קשר לנתבים
    routers = db.relationship('Router', backref='router_model', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'model_name': self.model_name
        }

# טבלת נתבים
class Router(db.Model):
    __tablename__ = 'routers'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    model_id = db.Column(db.Integer, db.ForeignKey('router_models.id'), nullable=True)
    ip_address = db.Column(db.String(15), unique=True, nullable=False)
    floor = db.Column(db.Integer, nullable=False)
    building = db.Column(db.String(50), nullable=False)
    connection_speed = db.Column(db.String(50), nullable=False)
    ports_count = db.Column(db.Integer, default=8)
    is_stack = db.Column(db.Boolean, default=False)
    slots_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    network_id = db.Column(db.Integer, db.ForeignKey('networks.id'), nullable=False)

    # קשר לנקודות קצה
    endpoints = db.relationship('Endpoint', backref='router', lazy=True)

    # קשר לסוויצ'ים
    switches = db.relationship('Switch', backref='router', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model_id': self.model_id,
            'ip_address': self.ip_address,
            'floor': self.floor,
            'building': self.building,
            'connection_speed': self.connection_speed,
            'ports_count': self.ports_count,
            'is_stack': self.is_stack,
            'slots_count': self.slots_count,
            'created_at': self.created_at.isoformat(),
            'network_id': self.network_id
        }

# טבלת סוויצ'ים
class Switch(db.Model):
    __tablename__ = 'switches'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    model = db.Column(db.String(100), nullable=False)
    ip_address = db.Column(db.String(15), unique=True, nullable=False)
    router_id = db.Column(db.Integer, db.ForeignKey('routers.id'), nullable=False)
    connection_port = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'model': self.model,
            'ip_address': self.ip_address,
            'router_id': self.router_id,
            'connection_port': self.connection_port,
            'created_at': self.created_at.isoformat()
        }

# טבלת RIT Prefix
class RitPrefix(db.Model):
    __tablename__ = 'rit_prefixes'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    prefix = db.Column(db.String(10), unique=True, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'prefix': self.prefix
        }

    def __repr__(self):
        return f"<RitPrefix {self.prefix}>"

# טבלת נקודות קצה
class Endpoint(db.Model):
    __tablename__ = 'endpoints'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    technician_name = db.Column(db.String(255), nullable=False)
    point_location = db.Column(db.String(255), nullable=False)
    destination_room = db.Column(db.String(255), nullable=False)
    connected_port_number = db.Column(db.Integer, nullable=False)
    rit_port_number = db.Column(db.String(50), nullable=True)  # שילוב של RIT prefix ומספר
    network_color = db.Column(db.String(7), nullable=True)
    router_id = db.Column(db.Integer, db.ForeignKey('routers.id'), nullable=False)

    # קשר ל-RIT Prefix
    rit_prefix_id = db.Column(db.Integer, db.ForeignKey('rit_prefixes.id'), nullable=True)
    rit_prefix = db.relationship('RitPrefix', backref='endpoints')

    def to_dict(self):
        return {
            'id': self.id,
            'technician_name': self.technician_name,
            'point_location': self.point_location,
            'destination_room': self.destination_room,
            'connected_port_number': self.connected_port_number,
            'rit_port_number': self.rit_port_number,
            'network_color': self.network_color,
            'router_id': self.router_id,
            'rit_prefix_id': self.rit_prefix_id
        }

    def __repr__(self):
        return f"<Endpoint {self.id}, RIT: {self.rit_port_number}>"

# טבלת לוגים
class Log(db.Model):
    __tablename__ = 'logs'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    action = db.Column(db.String(50), nullable=False)
    entity = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(db.Integer, nullable=False)
    technician_name = db.Column(db.String(100), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    details = db.Column(db.Text, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'action': self.action,
            'entity': self.entity,
            'entity_id': self.entity_id,
            'technician_name': self.technician_name,
            'timestamp': self.timestamp.isoformat(),
            'details': self.details
        }