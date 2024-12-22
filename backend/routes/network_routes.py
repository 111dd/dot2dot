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
                'color': network.color,  # וודא ששדה זה נכלל
                'created_at': network.created_at
            } for network in networks
        ]), 200
    except Exception as e:
        logging.error(f"Error fetching networks: {e}")
        return jsonify({'error': str(e)}), 500




# הוספת רשת חדשה
# הוספת רשת חדשה
@network_bp.route('/', methods=['POST'])
def add_network():
    try:
        data = request.get_json()
        logging.info(f"Received network data: {data}")  # בדיקת נתוני הקלט

        if not data.get('name'):
            return jsonify({'error': 'Network name is required'}), 400

        # בדיקת ערך צבע
        color = data.get('color', '#FFFFFF')  # ברירת מחדל אם לא נשלח צבע
        logging.info(f"Using color: {color}")

        new_network = Network(
            name=data['name'],
            description=data.get('description'),
            color=color  # שמירת הצבע שנשלח
        )
        db.session.add(new_network)
        db.session.commit()

        logging.info(f"Network added with color: {new_network.color}")  # בדיקת צבע בנתונים שנשמרו

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



@network_bp.route('/<int:network_id>', methods=['PUT'])
def update_network(network_id):
    try:
        data = request.get_json()
        network = Network.query.get_or_404(network_id)

        # עדכון נתוני הרשת
        network.name = data.get('name', network.name)
        network.description = data.get('description', network.description)
        network.color = data.get('color', network.color)

        db.session.commit()

        return jsonify({
            "message": "Network updated successfully",
            "id": network.id,
            "name": network.name,
            "description": network.description,
            "color": network.color,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# @network_bp.route('/<int:network_id>', methods=['OPTIONS', 'PUT'])
# def network_options(network_id):
#     if request.method == 'OPTIONS':
#         return '', 200  # מאשר Preflight
#
#     @network_bp.route('/<int:id>', methods=['OPTIONS'])
#     def handle_options(id):
#         return '', 204

