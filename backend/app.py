from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate  # הוספת Flask-Migrate
from config import Config
from models import db
from routes.router_routes import router_bp
from routes.endpoint_routes import endpoint_bp
from routes.network_routes import network_bp
from routes.router_routes import model_bp  # ייבוא הנתיבים של דגמי נתבים


app = Flask(__name__)
app.config.from_object(Config)

# חיבור SQLAlchemy ו-Flask-Migrate
db.init_app(app)
migrate = Migrate(app, db)  # הוספת מיגרציות

CORS(app, resources={r"/*": {"origins": "*"}})
# לאפשר גישה לפרונטאנד

# רישום נתיבים
app.register_blueprint(router_bp, url_prefix='/api/routers')
app.register_blueprint(endpoint_bp, url_prefix='/api/endpoints')
app.register_blueprint(network_bp, url_prefix='/api/networks')
app.register_blueprint(model_bp, url_prefix='/api/models')  # רישום נתיבי דגמי נתבים

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
