from flask import Blueprint, jsonify, request
from models import db, Log
from datetime import datetime, timezone
import logging

# הגדרת לוגים לשרת
logging.basicConfig(level=logging.INFO)

log_bp = Blueprint('log_routes', __name__)

# קבלת כל הלוגים
@log_bp.route('/', methods=['GET'])
def get_logs():
    logging.info("Handling GET request for logs.")
    try:
        logs = Log.query.order_by(Log.timestamp.desc()).all()  # מיון לפי זמן פעולה
        result = [
            {
                'id': log.id,
                'action': log.action,
                'entity': log.entity,
                'entity_id': log.entity_id,
                'technician_name': log.technician_name,
                'timestamp': log.timestamp.strftime('%Y-%m-%d %H:%M:%S'),
                'details': log.details,
            }
            for log in logs
        ]
        logging.info(f"Fetched {len(result)} logs successfully.")
        return jsonify(result), 200
    except Exception as e:
        logging.error(f"Failed to fetch logs: {e}")
        return jsonify({'error': 'Failed to fetch logs', 'details': str(e)}), 500

# הוספת לוג חדש
@log_bp.route('/', methods=['POST'])
def add_log():
    logging.info("Handling POST request to add a log.")
    try:
        data = request.get_json()
        new_log = Log(
            action=data['action'],
            entity=data['entity'],
            entity_id=data['entity_id'],
            technician_name=data['technician_name'],
            timestamp=datetime.now(timezone.utc),
            details=data.get('details', ''),
        )
        db.session.add(new_log)
        db.session.commit()
        logging.info(f"Log added successfully: {new_log}")
        return jsonify({'message': 'Log added successfully'}), 201
    except Exception as e:
        logging.error(f"Failed to add log: {e}")
        return jsonify({'error': 'Failed to add log', 'details': str(e)}), 500

# מחיקת לוג לפי ID
@log_bp.route('/<int:log_id>', methods=['DELETE'])  # תיקון הנתיב למחיקה
def delete_log(log_id):
    logging.info(f"Handling DELETE request for log ID: {log_id}")
    try:
        log = Log.query.get(log_id)
        if not log:
            logging.warning(f"Log with ID {log_id} not found.")
            return jsonify({'error': 'Log not found'}), 404

        db.session.delete(log)
        db.session.commit()
        logging.info(f"Log with ID {log_id} deleted successfully.")
        return jsonify({'message': 'Log deleted successfully'}), 200
    except Exception as e:
        logging.error(f"Failed to delete log with ID {log_id}: {e}")
        return jsonify({'error': 'Failed to delete log', 'details': str(e)}), 500
