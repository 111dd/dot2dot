from flask import Blueprint, request, jsonify
from models import db, Network, Log, Router
import logging
from datetime import datetime

network_bp = Blueprint('network_routes', __name__)
logging.basicConfig(level=logging.INFO)

def log_action(action, entity, entity_id, technician_name, details):
    logging.info(f"Attempting to log action: {action}, entity: {entity}, ID: {entity_id}, technician: {technician_name}")
    """Adds a log entry to the database."""
    try:
        if not action or not entity or not entity_id or not technician_name:
            raise ValueError("Missing required log parameters.")
        new_log = Log(
            action=action,
            entity=entity,
            entity_id=entity_id,
            technician_name=technician_name,
            timestamp=datetime.utcnow(),
            details=details
        )
        db.session.add(new_log)
        db.session.commit()
        logging.info(f"Log created: {action} on {entity} with ID {entity_id}")
    except ValueError as ve:
        logging.error(f"Validation error in log_action: {ve}")
    except Exception as e:
        logging.error(f"Error creating log: {e}")
        db.session.rollback()


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

        # יצירת לוג
        technician_name = request.headers.get('Technician-Name', 'Unknown')
        log_action(
            action="create",
            entity="Network",
            entity_id=new_network.id,
            technician_name=technician_name,
            details=f"Network '{new_network.name}' added."
        )

        logging.info(f"Network added with ID: {new_network.id}")

        return jsonify({
            'message': 'Network added successfully',
            'id': new_network.id,
            'name': new_network.name,
            'description': new_network.description,
            'color': new_network.color
        }), 201
    except Exception as e:
        logging.error(f"Error adding network: {e}")
        db.session.rollback()
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

        # בדיקת שינויים ושמירה של פרטים ללוג
        changes = []
        if 'name' in data and data['name'] != network.name:
            changes.append(f"Name: '{network.name}' -> '{data['name']}'")
            network.name = data['name']

        if 'description' in data and data['description'] != network.description:
            changes.append(f"Description: '{network.description}' -> '{data['description']}'")
            network.description = data['description']

        if 'color' in data and data['color'] != network.color:
            changes.append(f"Color: '{network.color}' -> '{data['color']}'")
            network.color = data['color']

        if not changes:
            return jsonify({"message": "No changes detected."}), 200

        # עדכון נתונים בבסיס הנתונים
        db.session.commit()
        logging.info(f"Network ID {network_id} updated successfully.")

        # יצירת לוג עם פירוט השינויים
        try:
            technician_name = request.headers.get('Technician-Name', 'Unknown')
            log_action(
                action="update",
                entity="Network",
                entity_id=network.id,
                technician_name=technician_name,
                details=f"Updated fields: {', '.join(changes)}"
            )
        except Exception as log_error:
            logging.error(f"Failed to log action for network update: {log_error}")

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



# מחיקת רשת
@network_bp.route('/<int:network_id>', methods=['DELETE'])
def delete_network(network_id):
    try:
        # חיפוש הרשת לפי ID
        network = Network.query.get(network_id)
        if not network:
            logging.warning(f"Network ID {network_id} not found.")
            return jsonify({"error": "Network not found"}), 404

        # בדיקה אם יש ראוטרים שמשתמשים ברשת זו
        routers = Router.query.filter_by(network_id=network_id).all()
        if routers:
            logging.warning(f"Cannot delete network ID {network_id} with connected routers.")
            return jsonify({"error": "Cannot delete network with connected routers"}), 400

        # מחיקת הרשת
        db.session.delete(network)
        db.session.commit()

        # יצירת לוג
        technician_name = request.headers.get('Technician-Name', 'Unknown')
        log_action(
            action="delete",
            entity="Network",
            entity_id=network.id,
            technician_name=technician_name,
            details=f"Network '{network.name}' deleted."
        )

        logging.info(f"Network ID {network_id} deleted successfully.")

        return jsonify({"message": f"Network with ID {network_id} deleted successfully"}), 200
    except Exception as e:
        logging.error(f"Error deleting network ID {network_id}: {e}")
        db.session.rollback()
        return jsonify({"error": f"Failed to delete network: {str(e)}"}), 500
