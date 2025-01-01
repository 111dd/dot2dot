from sqlalchemy import create_engine, MetaData
from eralchemy import render_er

# עדכן את כתובת החיבור ל-PostgreSQL
database_url = "postgresql://dordavid:your_password@localhost/network_db"
engine = create_engine(database_url)

# טען את ה-Metadata
metadata = MetaData()
metadata.reflect(bind=engine)

# צור ERD
render_er(metadata, 'erd_diagram.png')
print("ERD saved as 'erd_diagram.png'")
