from flask import Blueprint, request, jsonify
from models import db, Network
import logging

network_bp = Blueprint('network_routes', __name__)
logging.basicConfig(level=logging.INFO)

# קבלת כל הרשתות
@network_bp.route('/', methods=['GET'])
def get_networks():
    try:
        logging.info("Fetching all networks from the database.")
        networks = Network.query.all()
        if not networks:
            logging.warning("No networks found.")
        return jsonify([
            {
                'id': network.id,
                'name': network.name,
                'description': network.description,
                'color': network.color,
                'created_at': network.created_at
            } for network in networks
        ]), 200
    except Exception as e:
        logging.error(f"Error fetching networks: {e}")
        return jsonify({'error': str(e)}), 500

# הוספת רשת חדשה
@network_bp.route('/', methods=['POST'])
def add_network():
    try:
        data = request.get_json()
        logging.info(f"Received network data: {data}")

        if not data.get('name'):
            return jsonify({'error': 'Network name is required'}), 400

        # בדיקת ערך צבע
        color = data.get('color', '#FFFFFF')  # ברירת מחדל אם לא נשלח צבע
        logging.info(f"Using color: {color}")

        new_network = Network(
            name=data['name'],
            description=data.get('description'),
            color=color
        )
        db.session.add(new_network)
        db.session.commit()

        logging.info(f"Network added with color: {new_network.color}")

        return jsonify({
            'message': 'Network added successfully',
            'id': new_network.id,
            'name': new_network.name,
            'description': new_network.description,
            'color': new_network.color
        }), 201
    except Exception as e:
        logging.error(f"Error adding network: {e}")
        return jsonify({'error': f'Failed to add network: {str(e)}'}), 500

# עדכון רשת קיימת
@network_bp.route('/<int:network_id>', methods=['PUT'])
def update_network(network_id):
    try:
        data = request.get_json()
        logging.info(f"Updating network ID {network_id} with data: {data}")

        network = Network.query.get(network_id)
        if not network:
            logging.warning(f"Network ID {network_id} not found.")
            return jsonify({"error": "Network not found"}), 404

        # עדכון השדות
        network.name = data.get('name', network.name)
        network.description = data.get('description', network.description)
        network.color = data.get('color', network.color)

        db.session.commit()
        logging.info(f"Network ID {network_id} updated successfully.")

        return jsonify({
            "message": "Network updated successfully",
            "network": {
                'id': network.id,
                'name': network.name,
                'description': network.description,
                'color': network.color,
                'created_at': network.created_at
            }
        }), 200
    except Exception as e:
        logging.error(f"Error updating network ID {network_id}: {e}")
        db.session.rollback()
        return jsonify({"error": f"Failed to update network: {str(e)}"}), 500

# מחיקת רשת קיימת
# מחיקת רשת
@network_bp.route('/<int:network_id>', methods=['DELETE'])
def delete_network(network_id):
    try:
        # חיפוש הרשת לפי ID
        network = Network.query.get(network_id)
        if not network:
            return jsonify({"error": "Network not found"}), 404

        # בדיקה אם יש ראוטרים שמשתמשים ברשת זו
        routers = Router.query.filter_by(network_id=network_id).all()
        if routers:
            return jsonify({"error": "Cannot delete network with connected routers"}), 400

        # מחיקת הרשת
        db.session.delete(network)
        db.session.commit()
        return jsonify({"message": f"Network with ID {network_id} deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete network: {str(e)}"}), 500
