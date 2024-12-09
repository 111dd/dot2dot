from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate  # הוספת Flask-Migrate
from config import Config
from models import db
from routes.router_routes import router_bp
from routes.endpoint_routes import endpoint_bp

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
