from flask import Blueprint, request, jsonify
from models import db, Endpoint

endpoint_bp = Blueprint('endpoint_routes', __name__)

# קבלת כל נקודות הקצה
@endpoint_bp.route('/', methods=['GET'])
def get_endpoints():
    try:
        endpoints = Endpoint.query.all()
        result = [{
            'id': endpoint.id,
            'technician_name': endpoint.technician_name,
            'point_location': endpoint.point_location,
            'destination_room': endpoint.destination_room,
            'connected_port_number': endpoint.connected_port_number,
            'rit_port_number': endpoint.rit_port_number,
            'network_color': endpoint.network_color,
            'router_id': endpoint.router_id
        } for endpoint in endpoints]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# הוספת נקודת קצה חדשה
@endpoint_bp.route('/', methods=['POST'])
def add_endpoint():
    try:
        data = request.json
        new_endpoint = Endpoint(
            technician_name=data['technician_name'],
            point_location=data['point_location'],
            destination_room=data['destination_room'],
            connected_port_number=data['connected_port_number'],
            rit_port_number=data.get('rit_port_number'),  # אופציונלי
            network_color=data.get('network_color', '#FFFFFF'),  # ערך ברירת מחדל
            router_id=data['router_id']
        )
        db.session.add(new_endpoint)
        db.session.commit()
        return jsonify({'message': 'Endpoint added successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# עדכון נקודת קצה קיימת
@endpoint_bp.route('/<int:id>', methods=['PUT'])
def update_endpoint(id):
    try:
        data = request.json
        endpoint = Endpoint.query.get_or_404(id)
        endpoint.technician_name = data['technician_name']
        endpoint.point_location = data['point_location']
        endpoint.destination_room = data['destination_room']
        endpoint.connected_port_number = data['connected_port_number']
        endpoint.rit_port_number = data.get('rit_port_number')  # אופציונלי
        endpoint.network_color = data.get('network_color', endpoint.network_color)  # שמירה על ערך קיים אם לא נשלח חדש
        endpoint.router_id = data['router_id']
        db.session.commit()
        return jsonify({'message': 'Endpoint updated successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

# מחיקת נקודת קצה
@endpoint_bp.route('/<int:id>', methods=['DELETE'])
def delete_endpoint(id):
    try:
        endpoint = Endpoint.query.get_or_404(id)
        db.session.delete(endpoint)
        db.session.commit()
        return jsonify({'message': 'Endpoint deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400
