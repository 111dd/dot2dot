from flask import Blueprint, request, jsonify
from models import db, Router, Network, RouterModel
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)

router_bp = Blueprint('router_routes', __name__)
model_bp = Blueprint('model_routes', __name__)  # Separate blueprint for router models

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

        # Update router details
        router.name = data.get('name', router.name)
        router.model_id = data.get('model_id', router.model_id)
        router.ip_address = data.get('ip_address', router.ip_address)
        router.floor = int(data.get('floor', router.floor))
        router.building = data.get('building', router.building)
        router.connection_speed = data.get('connection_speed', router.connection_speed)

        network_id = data.get('network_id')
        if network_id:
            network = Network.query.get(network_id)
            if not network:
                logging.warning(f"Network ID {network_id} not found.")
                return jsonify({'error': 'Network not found'}), 404
            router.network_id = network_id

        router.is_stack = data.get('is_stack', router.is_stack)
        router.ports_count = int(data.get('ports_count', router.ports_count))
        router.slots_count = int(data.get('slots_count', router.slots_count))

        db.session.commit()
        logging.info(f"Router with ID {id} updated successfully.")
        return jsonify({'message': 'Router updated successfully'}), 200

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
