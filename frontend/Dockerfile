FROM node:20-alpine

WORKDIR /app

# העתק קבצי תלויות
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000

# העתק את כל הפרויקט
COPY . .

# 🟢 הגדר את משתנה הסביבה לפני הבנייה
ENV REACT_APP_API_BASE=http://localhost:5000

# 🔨 בנה את האפליקציה עם המשתנה
RUN yarn build

# 🧊 שלב NGINX
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]