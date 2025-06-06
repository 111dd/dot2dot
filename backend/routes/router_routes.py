from flask import Blueprint, request, jsonify
from models import db, Router, Network, RouterModel, Endpoint, Log, RitPrefix
import logging
from datetime import datetime, timezone


# Set up logging
logging.basicConfig(level=logging.INFO)

router_bp = Blueprint('router_routes', __name__)
model_bp = Blueprint('model_routes', __name__)  # Separate blueprint for router models


def log_action(action, entity, entity_id, technician_name, details=""):
    """Helper function to log actions to the database."""
    new_log = Log(
        action=action,
        entity=entity,
        entity_id=entity_id,
        technician_name=technician_name,
        timestamp=datetime.now(timezone.utc),
        details=details,
    )
    db.session.add(new_log)
    db.session.commit()


def format_router(router):
    """Helper function to format router data"""
    return {
        'id': router.id,
        'name': router.name,
        'model': router.router_model.model_name if router.router_model else None,  # קבלת שם הדגם אם קיים
        'ip_address': router.ip_address,
        'floor': router.floor,
        'building': router.building,
        'connection_speed': router.connection_speed,
        'network_id': router.network_id,
        'ports_count': router.ports_count,
        'is_stack': router.is_stack,
        'slots_count': router.slots_count,
    }

# Fetch all routers
@router_bp.route('/', methods=['GET'])
def get_routers():
    try:
        logging.info("Handling GET request for all routers.")
        building = request.args.get('building')
        if building:
            logging.info(f"Filtering routers by building: {building}")
            routers = Router.query.filter_by(building=building).order_by(Router.floor).all()
        else:
            logging.info("Fetching all routers without filters.")
            routers = Router.query.all()

        result = [format_router(router) for router in routers]
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching routers: {e}")
        return jsonify({'error': 'Failed to fetch routers', 'details': str(e)}), 500

# Fetch routers by building
@router_bp.route('/building/<string:building>', methods=['GET'])
def get_routers_by_building(building):
    try:
        logging.info(f"Fetching routers for building: {building}")

        valid_buildings = ['South', 'North', 'Pit']
        if building not in valid_buildings:
            logging.warning(f"Invalid building name: {building}")
            return jsonify({'error': 'Invalid building name'}), 404

        routers = Router.query.filter(Router.building.ilike(building)).all()
        if not routers:
            logging.info(f"No routers found for building: {building}")
            return jsonify([]), 200

        result = [
            format_router(router) for router in routers
        ]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching routers for building {building}: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

# Add a new router
# Add a new router
@router_bp.route('/', methods=['POST'])
def add_router():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")

        required_fields = {'name', 'model_id', 'ip_address', 'floor', 'building', 'network_id'}
        missing_fields = required_fields - set(data.keys())
        if missing_fields:
            logging.warning(f"Missing fields: {missing_fields}")
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400

        model_id = data.get('model_id')
        if not RouterModel.query.get(model_id):
            return jsonify({'error': 'Model does not exist. Please add it first.'}), 400

        new_router = Router(
            name=data['name'],
            model_id=model_id,
            ip_address=data['ip_address'],
            floor=int(data['floor']),
            building=data['building'],
            connection_speed=data.get('connection_speed', '10M'),
            ports_count=int(data.get('ports_count', 8)),
            is_stack=bool(data.get('is_stack', False)),
            slots_count=int(data.get('slots_count', 0)),
            network_id=int(data['network_id']),
        )
        db.session.add(new_router)
        db.session.commit()

        # Add to logs
        log_action(
            action="create",
            entity="Router",
            entity_id=new_router.id,
            technician_name="Admin",  # Replace with the actual technician
            details=f"Router {new_router.name} added.",
        )

        logging.info(f"Router added successfully with ID: {new_router.id}")
        return jsonify({'message': 'Router added successfully', 'id': new_router.id}), 201
    except Exception as e:
        logging.error(f"Error adding router: {e}")
        return jsonify({'error': 'Failed to add router', 'details': str(e)}), 500


# Update an existing router
@router_bp.route('/<int:id>', methods=['PUT'])
def update_router(id):
    try:
        logging.info(f"Handling PUT request to update router with ID: {id}")
        data = request.get_json()
        router = Router.query.get(id)
        if not router:
            logging.warning(f"Router with ID {id} not found.")
            return jsonify({'error': 'Router not found'}), 404

        # שמירה על הערכים הישנים להשוואה
        old_values = {
            'name': router.name,
            'model_id': router.model_id,
            'ip_address': router.ip_address,
            'floor': router.floor,
            'building': router.building,
            'connection_speed': router.connection_speed,
            'network_id': router.network_id,
            'is_stack': router.is_stack,
            'ports_count': router.ports_count,
            'slots_count': router.slots_count,
        }

        # עדכון פרטי הראוטר
        router.name = data.get('name', router.name)
        router.model_id = data.get('model_id', router.model_id)
        router.ip_address = data.get('ip_address', router.ip_address)
        router.floor = int(data['floor']) if data.get('floor') is not None else router.floor
        router.building = data.get('building', router.building)
        router.connection_speed = data.get('connection_speed', router.connection_speed)

        network_id = data.get('network_id')
        if network_id is not None:
            network = Network.query.get(network_id)
            if not network:
                logging.warning(f"Network ID {network_id} not found.")
                return jsonify({'error': 'Network not found'}), 404
            router.network_id = network_id

        router.is_stack = data.get('is_stack', router.is_stack)
        router.ports_count = int(data['ports_count']) if data.get('ports_count') is not None else router.ports_count
        router.slots_count = int(data['slots_count']) if data.get('slots_count') is not None else router.slots_count

        db.session.commit()

        # בדיקת שינויים והוספה ללוגים
        changes = []
        for key, old_value in old_values.items():
            new_value = getattr(router, key)
            if old_value != new_value:
                changes.append(f"{key}: '{old_value}' -> '{new_value}'")

        if changes:
            change_details = "; ".join(changes)
            log_details = f"Updated fields: {change_details}"
        else:
            log_details = "No changes made."

        log_action(
            action="update",
            entity="Router",
            entity_id=id,
            technician_name="Admin",  # החלף בשם הטכנאי בפועל
            details=log_details,
        )

        logging.info(f"Router with ID {id} updated successfully with changes: {log_details}")
        return jsonify({'message': 'Router updated successfully', 'details': log_details}), 200

    except ValueError as ve:
        logging.error(f"ValueError updating router {id}: {ve}")
        return jsonify({'error': f'Invalid data format: {ve}'}), 400

    except Exception as e:
        logging.error(f"Error updating router {id}: {e}")
        return jsonify({'error': str(e)}), 500


# Delete a router
@router_bp.route('/<int:id>', methods=['DELETE'])
def delete_router(id):
    try:
        logging.info(f"Handling DELETE request for router with ID: {id}")
        router = Router.query.get(id)
        if not router:
            logging.warning(f"Router with ID {id} not found.")
            return jsonify({'error': 'Router not found'}), 404

        db.session.delete(router)
        db.session.commit()
        logging.info(f"Router with ID {id} deleted successfully.")
        return jsonify({'message': 'Router deleted successfully'}), 200

    except Exception as e:
        logging.error(f"Error deleting router {id}: {e}")
        return jsonify({'error': str(e)}), 500

# Fetch a router by ID
@router_bp.route('/<int:id>', methods=['GET'])
def get_router_by_id(id):
    try:
        logging.info(f"Handling GET request for router with ID: {id}")
        router = Router.query.get(id)
        if not router:
            logging.warning(f"Router with ID {id} not found.")
            return jsonify({'error': 'Router not found'}), 404

        result = format_router(router)
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching router with ID {id}: {e}")
        return jsonify({'error': str(e)}), 500

# Fetch all router models
# נתיב הבקשה למודלים
@model_bp.route('/', methods=['GET'])
def get_router_models():
    try:
        logging.info("Fetching all router models.")
        models = RouterModel.query.all()  # הבדיקה מפנה למודל router_models
        result = [{'id': model.id, 'model_name': model.model_name} for model in models]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Failed to fetch router models: {e}")
        return jsonify({'error': 'Failed to fetch router models', 'details': str(e)}), 500

# הוספת מודל חדש
@model_bp.route('/', methods=['POST'])
def add_router_model():
    try:
        data = request.get_json()
        model_name = data.get('model_name')
        if not model_name:
            return jsonify({'error': 'Model name is required'}), 400

        # הוספה למודל הקיים
        new_model = RouterModel(model_name=model_name)
        db.session.add(new_model)
        db.session.commit()

        return jsonify({'message': 'Model added successfully', 'id': new_model.id}), 201
    except Exception as e:
        logging.error(f"Failed to add router model: {e}")
        return jsonify({'error': 'Failed to add router model', 'details': str(e)}), 500


from sqlalchemy.orm import joinedload

@router_bp.route('/<int:router_id>/connections', methods=['GET'])
def get_router_connections(router_id):
    try:
        # חיפוש כל החיבורים עבור הנתב עם ה-ID שנשלח עם הצטרפות ל-RIT Prefix
        connections = Endpoint.query.filter_by(router_id=router_id).options(joinedload(Endpoint.rit_prefix)).all()

        # עיבוד הנתונים לפורמט JSON
        result = [
            {
                'id': conn.id,
                'technician_name': conn.technician_name,
                'point_location': conn.point_location,
                'destination_room': conn.destination_room,
                'connected_port_number': conn.connected_port_number,
                'rit_port_number': conn.rit_port_number or '-',
                'rit_prefix': conn.rit_prefix.prefix if conn.rit_prefix else None,  # הוספת התחילית
                'network_color': conn.network_color or '#FFFFFF',  # צבע ברירת מחדל
            } for conn in connections
        ]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching connections for router {router_id}: {e}")
        return jsonify({'error': 'Failed to fetch connections', 'details': str(e)}), 500


@router_bp.route('/all', methods=['GET'])
def get_all_routers():
    """Retrieve all routers with minimal details."""
    try:
        routers = Router.query.all()
        result = [
            {
                'id': router.id,
                'name': router.name,
                'floor': router.floor,
                'building': router.building,
                'ip_address': router.ip_address

            }
            for router in routers
        ]
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching routers: {e}")
        return jsonify({'error': 'Failed to fetch routers', 'details': str(e)}), 500

