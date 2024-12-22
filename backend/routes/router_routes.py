from flask import Blueprint, request, jsonify
from models import db, Router, Network
import logging

# הגדרת הלוגים
logging.basicConfig(level=logging.INFO)

router_bp = Blueprint('router_routes', __name__)

# קבלת כל הנתבים
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

        result = [
            {
                'id': router.id,
                'name': router.name,
                'ip_address': router.ip_address,
                'floor': router.floor,
                'building': router.building,
                'connection_speed': router.connection_speed,
                'network_id': router.network_id,
                'ports_count': router.ports_count,
                'is_stack': router.is_stack,
                'slots_count': router.slots_count,
            } for router in routers
        ]
        logging.debug(f"Fetched routers: {result}")
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching routers: {e}")
        return jsonify({'error': 'Failed to fetch routers'}), 500


# קבלת נתבים לפי בניין
@router_bp.route('/building/<string:building>', methods=['GET'])
def get_routers_by_building(building):
    try:
        logging.info(f"Fetching routers for building: {building}")
        routers = Router.query.filter_by(building=building).order_by(Router.floor).all()
        result = [
            {
                'id': router.id,
                'name': router.name,
                'ip_address': router.ip_address,
                'floor': router.floor,
                'building': router.building,
                'connection_speed': router.connection_speed,
                'network_id': router.network_id,
                'ports_count': router.ports_count,
                'is_stack': router.is_stack,
                'slots_count': router.slots_count,
            } for router in routers
        ]
        logging.debug(f"Fetched routers for building {building}: {result}")
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Error fetching routers for building {building}: {e}")
        return jsonify({'error': 'Failed to fetch routers for the building'}), 500


# הוספת נתב חדש
@router_bp.route('/', methods=['POST'])
def add_router():
    try:
        data = request.get_json()
        logging.info(f"Received data: {data}")

        # בדיקות תקינות
        if not all(key in data for key in ('name', 'ip_address', 'floor', 'building', 'network_id')):
            return jsonify({'error': 'Missing required fields'}), 400

        slots_count = data.get('slots_count', 0) if data.get('is_stack') else 0

        new_router = Router(
            name=data['name'],
            ip_address=data['ip_address'],
            floor=int(data['floor']),
            building=data['building'],
            connection_speed=data.get('connection_speed', '10M'),
            ports_count=int(data.get('ports_count', 8)),
            is_stack=bool(data.get('is_stack', False)),
            slots_count=int(slots_count),
            network_id=int(data['network_id']),
        )

        db.session.add(new_router)
        db.session.commit()

        return jsonify({'message': 'Router added successfully', 'id': new_router.id}), 201
    except Exception as e:
        logging.error(f"Error adding router: {e}")
        return jsonify({'error': str(e)}), 500


# עדכון נתב קיים
@router_bp.route('/<int:id>', methods=['PUT'])
def update_router(id):
    try:
        logging.info(f"Handling PUT request to update router with ID: {id}")
        data = request.get_json()
        logging.debug(f"Received update data: {data}")
        router = Router.query.get(id)
        if not router:
            logging.warning(f"Router with ID {id} not found.")
            return jsonify({'error': 'Router not found'}), 404

        router.name = data.get('name', router.name)
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

        ports_count = data.get('ports_count')
        if ports_count is not None:
            router.ports_count = int(ports_count)

        slots_count = data.get('slots_count')
        if slots_count is not None:
            router.slots_count = int(slots_count)

        db.session.commit()
        logging.info(f"Router with ID {id} updated successfully.")
        return jsonify({'message': 'Router updated successfully'}), 200

    except ValueError as ve:
        logging.error(f"ValueError updating router {id}: {ve}")
        return jsonify({'error': f'Invalid data format: {ve}'}), 400

    except Exception as e:
        logging.error(f"Error updating router {id}: {e}")
        return jsonify({'error': str(e)}), 500


# מחיקת נתב
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


# קבלת נתב לפי ID
@router_bp.route('/<int:id>', methods=['GET'])
def get_router_by_id(id):
    try:
        logging.info(f"Handling GET request for router with ID: {id}")
        router = Router.query.get(id)
        if not router:
            logging.warning(f"Router with ID {id} not found.")
            return jsonify({'error': 'Router not found'}), 404

        result = {
            'id': router.id,
            'name': router.name,
            'ip_address': router.ip_address,
            'floor': router.floor,
            'building': router.building,
            'connection_speed': router.connection_speed,
            'network_id': router.network_id,
            'ports_count': router.ports_count,
            'is_stack': router.is_stack,
            'slots_count': router.slots_count,
        }
        logging.debug(f"Fetched router data: {result}")
        return jsonify(result), 200

    except Exception as e:
        logging.error(f"Error fetching router with ID {id}: {e}")
        return jsonify({'error': str(e)}), 500
