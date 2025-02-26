import random
from datetime import datetime, timedelta, timezone
from models import db, Log
from app import app  # או שם הקובץ שבו מוגדרת האפליקציה Flask שלך


# פעולה ליצירת לוגים רנדומליים
def generate_random_logs():
    actions = ["create", "update", "delete"]
    entities = ["Network", "Router", "Endpoint"]
    technicians = ["Alice", "Bob", "Charlie", "David", "Eve", "Lir", "Kerry", "Dani"]

    with app.app_context():
        for _ in range(20):
            log = Log(
                action=random.choice(actions),
                entity=random.choice(entities),
                entity_id=random.randint(1, 50),  # מזהה ישות רנדומלי
                technician_name=random.choice(technicians),
                timestamp=datetime.now(timezone.utc) - timedelta(days=random.randint(0, 30)),  # תאריך רנדומלי מהחודש האחרון
                details=f"Random log entry for testing. Action: {random.choice(actions)}."
            )
            db.session.add(log)
        db.session.commit()
        print("8 random logs added successfully!")


# קריאה לפונקציה
if __name__ == "__main__":
    generate_random_logs()
