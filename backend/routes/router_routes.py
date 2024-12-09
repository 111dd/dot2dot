from flask import Blueprint, request, jsonify
from models import db, Router
import logging

# הגדרת הלוגים
logging.basicConfig(level=logging.INFO)

router_bp = Blueprint('router_routes', __name__)

# קבלת כל הנתבים
@router_bp.route('/', methods=['GET'])
def get_routers():
    routers = Router.query.all()
    return jsonify([
        {
            'id': router.id,
            'name': router.name,
            'ip_address': router.ip_address,
            'floor': router.floor,
            'building': router.building,
            'connection_speed': router.connection_speed,
            'network_type': router.network_type,  # הצגת סוג הרשת
            'ports_count': router.ports_count,
            'is_stack': router.is_stack,
            'slots_count': router.slots_count,
        } for router in routers
    ]), 200


# הוספת נתב חדש
@router_bp.route('/', methods=['POST'])
def add_router():
    try:
        data = request.get_json()

        # בדיקת שדות חובה
        required_fields = ['name', 'ip_address', 'floor', 'building', 'connection_speed', 'network_type']
        for field in required_fields:
            if field not in data or not data[field]:
                return jsonify({'error': f'{field} is required.'}), 400

        # יצירת נתב חדש
        new_router = Router(
            name=data['name'],
            ip_address=data['ip_address'],
            floor=int(data['floor']),
            building=data['building'],
            connection_speed=data['connection_speed'],
            network_type=data['network_type'],
            ports_count=int(data.get('ports_count', 0)),  # ערך ברירת מחדל
            is_stack=bool(data.get('is_stack', False)),
            slots_count=int(data.get('slots_count', 0)),
        )
        db.session.add(new_router)
        db.session.commit()

        logging.info(f"Router added: {new_router.id}")
        return jsonify({'message': 'Router added successfully'}), 201

    except Exception as e:
        logging.error(f"Error adding router: {e}")
        return jsonify({'error': str(e)}), 500


# עדכון נתב קיים
@router_bp.route('/<int:id>', methods=['PUT'])
def update_router(id):
    try:
        data = request.get_json()
        router = Router.query.get(id)
        if not router:
            return jsonify({'error': 'Router not found'}), 404

        # עדכון שדות עם ולידציה
        router.name = data.get('name', router.name)
        router.ip_address = data.get('ip_address', router.ip_address)
        router.floor = int(data.get('floor', router.floor))
        router.building = data.get('building', router.building)
        router.connection_speed = data.get('connection_speed', router.connection_speed)
        router.network = data.get('network', router.network)
        router.is_stack = data.get('is_stack', router.is_stack)

        # המרת ports_count למספר שלם
        ports_count = data.get('ports_count')
        if ports_count is not None:
            router.ports_count = int(ports_count)

        # המרת slots_count למספר שלם
        slots_count = data.get('slots_count')
        if slots_count is not None:
            router.slots_count = int(slots_count)

        db.session.commit()
        logging.info(f"Router {id} updated")
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
        router = Router.query.get(id)
        if not router:
            return jsonify({'error': 'Router not found'}), 404

        db.session.delete(router)
        db.session.commit()

        logging.info(f"Router {id} deleted")
        return jsonify({'message': 'Router deleted successfully'}), 200

    except Exception as e:
        logging.error(f"Error deleting router {id}: {e}")
        return jsonify({'error': str(e)}), 500


# קבלת נתב לפי ID
@router_bp.route('/<int:id>', methods=['GET'])
def get_router_by_id(id):
    try:
        router = Router.query.get(id)
        if not router:
            return jsonify({'error': 'Router not found'}), 404

        return jsonify({
            'id': router.id,
            'name': router.name,
            'ip_address': router.ip_address,
            'floor': router.floor,
            'building': router.building,
            'connection_speed': router.connection_speed,
            'network_type': router.network_type,  # סוג הרשת
            'ports_count': router.ports_count,
            'is_stack': router.is_stack,
            'slots_count': router.slots_count,
        }), 200

    except Exception as e:
        logging.error(f"Error fetching router {id}: {e}")
        return jsonify({'error': str(e)}), 500
