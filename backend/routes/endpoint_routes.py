from flask import Blueprint, request, jsonify
from models import db, RitPrefix, Endpoint, Log
from sqlalchemy.orm import joinedload
from datetime import datetime
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

endpoint_bp = Blueprint('endpoint_routes', __name__)

def log_action(action, entity, entity_id, technician_name, details=""):
    """Add a log entry to the database."""
    try:
        log_entry = Log(
            action=action,
            entity=entity,
            entity_id=entity_id,
            technician_name=technician_name,
            timestamp=datetime.utcnow(),
            details=details
        )
        db.session.add(log_entry)
        db.session.commit()
        logging.info(f"Logged action: {action} on {entity} ID {entity_id}")
    except Exception as e:
        logging.error(f"Failed to log action {action} on {entity} ID {entity_id}: {e}")

# קבלת כל נקודות הקצה
@endpoint_bp.route('/', methods=['GET'])
def get_endpoints():
    try:
        endpoints = Endpoint.query.options(joinedload(Endpoint.rit_prefix)).all()
        result = [{
            'id': endpoint.id,
            'technician_name': endpoint.technician_name,
            'point_location': endpoint.point_location,
            'destination_room': endpoint.destination_room,
            'connected_port_number': endpoint.connected_port_number,
            'rit_port_number': endpoint.rit_port_number,
            'rit_prefix': endpoint.rit_prefix.prefix if endpoint.rit_prefix else None,
            'network_color': endpoint.network_color,
            'router_id': endpoint.router_id
        } for endpoint in endpoints]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching endpoints: {e}")
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
            rit_port_number=data.get('rit_port_number'),
            rit_prefix_id=data.get('rit_prefix_id'),
            network_color=data.get('network_color', '#FFFFFF'),
            router_id=data['router_id']
        )
        db.session.add(new_endpoint)
        db.session.commit()

        log_action(
            action="Add",
            entity="Endpoint",
            entity_id=new_endpoint.id,
            technician_name=data['technician_name'],
            details=f"Added endpoint with ID {new_endpoint.id}"
        )

        return jsonify({
            'id': new_endpoint.id,
            'technician_name': new_endpoint.technician_name,
            'point_location': new_endpoint.point_location,
            'destination_room': new_endpoint.destination_room,
            'connected_port_number': new_endpoint.connected_port_number,
            'rit_port_number': new_endpoint.rit_port_number,
            'rit_prefix': new_endpoint.rit_prefix.prefix if new_endpoint.rit_prefix else None,
            'network_color': new_endpoint.network_color,
            'router_id': new_endpoint.router_id
        }), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error adding endpoint: {e}")
        return jsonify({'error': str(e)}), 400

# עדכון נקודת קצה קיימת
@endpoint_bp.route('/<int:id>', methods=['PUT'])
def update_endpoint(id):
    try:
        data = request.json
        endpoint = Endpoint.query.get_or_404(id)

        old_values = {
            'technician_name': endpoint.technician_name,
            'point_location': endpoint.point_location,
            'destination_room': endpoint.destination_room,
            'connected_port_number': endpoint.connected_port_number,
            'rit_port_number': endpoint.rit_port_number,
            'rit_prefix_id': endpoint.rit_prefix_id,
            'router_id': endpoint.router_id
        }

        endpoint.technician_name = data['technician_name']
        endpoint.point_location = data['point_location']
        endpoint.destination_room = data['destination_room']
        endpoint.connected_port_number = data['connected_port_number']
        endpoint.rit_port_number = data.get('rit_port_number')

        rit_prefix_id = data.get('rit_prefix_id')
        if rit_prefix_id is not None:
            rit_prefix = RitPrefix.query.get(rit_prefix_id)
            if not rit_prefix:
                return jsonify({'error': 'Invalid RIT Prefix ID'}), 400
            endpoint.rit_prefix_id = rit_prefix_id

        endpoint.router_id = data.get('router_id', endpoint.router_id)

        db.session.commit()

        changes = []
        for key, old_value in old_values.items():
            new_value = getattr(endpoint, key)
            if old_value != new_value:
                changes.append(f"{key}: '{old_value}' -> '{new_value}'")

        log_action(
            action="Update",
            entity="Endpoint",
            entity_id=endpoint.id,
            technician_name=data['technician_name'],
            details=f"Updated endpoint with changes: {', '.join(changes)}"
        )

        return jsonify({
            'id': endpoint.id,
            'technician_name': endpoint.technician_name,
            'point_location': endpoint.point_location,
            'destination_room': endpoint.destination_room,
            'connected_port_number': endpoint.connected_port_number,
            'rit_port_number': endpoint.rit_port_number,
            'rit_prefix': endpoint.rit_prefix.prefix if endpoint.rit_prefix else None,
            'network_color': endpoint.network_color,
            'router_id': endpoint.router_id
        }), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error updating endpoint {id}: {e}")
        return jsonify({'error': str(e)}), 400

# מחיקת נקודת קצה
@endpoint_bp.route('/<int:id>', methods=['DELETE'])
def delete_endpoint(id):
    try:
        endpoint = Endpoint.query.get_or_404(id)
        technician_name = endpoint.technician_name
        db.session.delete(endpoint)
        db.session.commit()

        log_action(
            action="Delete",
            entity="Endpoint",
            entity_id=id,
            technician_name=technician_name,
            details=f"Deleted endpoint with ID {id}"
        )

        return jsonify({'message': 'Endpoint deleted successfully!'}), 200
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error deleting endpoint {id}: {e}")
        return jsonify({'error': str(e)}), 400

# קבלת כל התחיליות
@endpoint_bp.route('/rit-prefixes', methods=['GET'])
def get_rit_prefixes():
    try:
        prefixes = RitPrefix.query.all()
        result = [{'id': p.id, 'prefix': p.prefix} for p in prefixes]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching RIT prefixes: {e}")
        return jsonify({'error': str(e)}), 500

# הוספת תחילית חדשה
@endpoint_bp.route('/rit-prefixes', methods=['POST'])
def add_rit_prefix():
    data = request.get_json()
    if not data.get('prefix'):
        return jsonify({'error': 'Prefix is required'}), 400
    try:
        new_prefix = RitPrefix(prefix=data['prefix'])
        db.session.add(new_prefix)
        db.session.commit()

        log_action(
            action="Add",
            entity="RitPrefix",
            entity_id=new_prefix.id,
            technician_name="System",
            details=f"Added RIT prefix with ID {new_prefix.id}"
        )

        return jsonify({'message': 'RIT prefix added successfully', 'id': new_prefix.id}), 201
    except Exception as e:
        db.session.rollback()
        logging.error(f"Error adding RIT prefix: {e}")
        return jsonify({'error': str(e)}), 500

# קבלת כל הנקודות עבור ראוטר מסוים
@endpoint_bp.route('/api/routers/<int:router_id>/connections', methods=['GET'])
def get_router_connections(router_id):
    try:
        connections = Endpoint.query.filter_by(router_id=router_id).options(joinedload(Endpoint.rit_prefix)).all()
        result = [
            {
                'id': conn.id,
                'technician_name': conn.technician_name,
                'point_location': conn.point_location,
                'destination_room': conn.destination_room,
                'connected_port_number': conn.connected_port_number,
                'rit_port_number': conn.rit_port_number,
                'rit_prefix': conn.rit_prefix.prefix if conn.rit_prefix else None,
                'network_color': conn.network_color or '#FFFFFF',
                'router_name': conn.router.name if conn.router else None
            }
            for conn in connections
        ]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching connections for router {router_id}: {e}")
        return jsonify({'error': str(e)}), 500
