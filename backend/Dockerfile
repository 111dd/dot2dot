FROM python:3.11-slim

# התקנת תלותים
COPY requirements.txt .
RUN apt-get update && apt-get install -y \
    netcat-openbsd iputils-ping \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir -r requirements.txt

# העתקת קוד הפרויקט
COPY . /app
WORKDIR /app

# הגדרת משתנים נחוצים להרצת flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# בדיקת זמינות PostgreSQL לפני הרצת Flask
CMD ["sh", "-c", "until nc -zv db 5432; do echo 'Waiting for Postgres...'; sleep 2; done && flask run"]