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
        return jsonify([{
            'id': network.id,
            'name': network.name,
            'description': network.description,
            'created_at': network.created_at
        } for network in networks]), 200
    except Exception as e:
        logging.error(f"Error fetching networks: {e}")
        return jsonify({'error': str(e)}), 500


# הוספת רשת חדשה
@network_bp.route('/', methods=['POST'])
def add_network():
    try:
        data = request.get_json()
        if not data.get('name'):
            return jsonify({'error': 'Network name is required'}), 400

        new_network = Network(
            name=data['name'],
            description=data.get('description', '')  # הוסף תיאור אופציונלי
        )
        db.session.add(new_network)
        db.session.commit()
        logging.info(f"Network added: {new_network.name}")
        return jsonify({'message': 'Network added successfully', 'id': new_network.id}), 201
    except Exception as e:
        logging.error(f"Error adding network: {e}")
        return jsonify({'error': 'Failed to add network'}), 500
