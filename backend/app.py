from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db
from routes.router_routes import router_bp, model_bp
from routes.endpoint_routes import endpoint_bp
from routes.network_routes import network_bp
from routes.log_routes import log_bp
import logging
import os  # הוסף את זה

app = Flask(__name__)
app.config.from_object(Config)

# הדפס את ה-DATABASE_URL כדי לבדוק שהוא נטען נכון
print(f"DATABASE_URL: {os.getenv('DATABASE_URL')}")  # הוסף שורה זו

# השבת הפניות אוטומטיות עבור סלאשים
app.url_map.strict_slashes = False

# חיבור SQLAlchemy ו-Flask-Migrate
db.init_app(app)
migrate = Migrate(app, db)

# הגדרת CORS
CORS(app, resources={r"/api/*": {
    "origins": ["http://localhost:3000", "*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["Content-Type", "Authorization"],
    "supports_credentials": False
}})

# הוספת כותרות CORS לכל התגובות, כולל שגיאות
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# טיפול בשגיאות
@app.errorhandler(403)
def forbidden(error):
    response = jsonify({"error": "Forbidden"})
    response.status_code = 403
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response

@app.errorhandler(404)
def not_found(error):
    response = jsonify({"error": "Not found"})
    response.status_code = 404
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response

@app.errorhandler(500)
def server_error(error):
    response = jsonify({"error": "Internal server error"})
    response.status_code = 500
    response.headers['Access-Control-Allow-Origin'] = 'http://localhost:3000'
    return response

logging.basicConfig(level=logging.INFO)
logging.info("Starting Flask application...")

# רישום נתיבים
app.register_blueprint(router_bp, url_prefix='/api/routers')
app.register_blueprint(endpoint_bp, url_prefix='/api/endpoints')
app.register_blueprint(network_bp, url_prefix='/api/networks')
app.register_blueprint(model_bp, url_prefix='/api/models')
app.register_blueprint(log_bp, url_prefix='/api/logs')

if __name__ == '__main__':
    app.run(host='localhost', port=5000, debug=True)  # השאר כפי שהיה, כי זה לא משפיע בתוך Docker