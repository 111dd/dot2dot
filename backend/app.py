from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from config import Config
from models import db
from routes.router_routes import router_bp, model_bp  # נתיבים לנתבים ודגמי נתבים
from routes.endpoint_routes import endpoint_bp
from routes.network_routes import network_bp
from routes.log_routes import log_bp  # נתיבים ללוגים
import logging


# יצירת האפליקציה
app = Flask(__name__)
app.config.from_object(Config)

# חיבור SQLAlchemy ו-Flask-Migrate
db.init_app(app)
migrate = Migrate(app, db)

# לאפשר CORS
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logging.info("Starting Flask application...")

# רישום נתיבים
app.register_blueprint(router_bp, url_prefix='/api/routers')
app.register_blueprint(endpoint_bp, url_prefix='/api/endpoints')
app.register_blueprint(network_bp, url_prefix='/api/networks')
app.register_blueprint(model_bp, url_prefix='/api/router_models')
app.register_blueprint(log_bp, url_prefix='/api/logs')  # רישום נתיבי הלוגים

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
