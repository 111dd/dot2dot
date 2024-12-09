from flask import Blueprint, request, jsonify
from models import db, Endpoint

endpoint_bp = Blueprint('endpoint_routes', __name__)

# קבלת כל נקודות הקצה
@endpoint_bp.route('/', methods=['GET'])
def get_endpoints():
    endpoints = Endpoint.query.all()
    return jsonify([{
        'id': endpoint.id,
        'network': endpoint.network,
        'technician_name': endpoint.technician_name,
        'ip_address': endpoint.ip_address,
        'port_number': endpoint.port_number,
        'point_location': endpoint.point_location,
        'destination_room': endpoint.destination_room,
        'router_id': endpoint.router_id
    } for endpoint in endpoints])

# הוספת נקודת קצה חדשה
@endpoint_bp.route('/', methods=['POST'])
def add_endpoint():
    data = request.json
    new_endpoint = Endpoint(
        network=data['network'],
        technician_name=data['technician_name'],
        ip_address=data['ip_address'],
        port_number=data['port_number'],
        point_location=data['point_location'],
        destination_room=data['destination_room'],
        router_id=data['router_id']
    )
    db.session.add(new_endpoint)
    db.session.commit()
    return jsonify({'message': 'Endpoint added successfully!'})

# עדכון נקודת קצה קיימת
@endpoint_bp.route('/<int:id>', methods=['PUT'])
def update_endpoint(id):
    data = request.json
    endpoint = Endpoint.query.get_or_404(id)
    endpoint.network = data['network']
    endpoint.technician_name = data['technician_name']
    endpoint.ip_address = data['ip_address']
    endpoint.port_number = data['port_number']
    endpoint.point_location = data['point_location']
    endpoint.destination_room = data['destination_room']
    endpoint.router_id = data['router_id']
    db.session.commit()
    return jsonify({'message': 'Endpoint updated successfully!'})

# מחיקת נקודת קצה
@endpoint_bp.route('/<int:id>', methods=['DELETE'])
def delete_endpoint(id):
    endpoint = Endpoint.query.get_or_404(id)
    db.session.delete(endpoint)
    db.session.commit()
    return jsonify({'message': 'Endpoint deleted successfully!'})
