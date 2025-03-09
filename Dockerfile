FROM node:18-alpine

WORKDIR /app/sport-store

# Instalar dependencias y herramientas
RUN apk add --no-cache bash netcat-openbsd

# Copiar el script PRIMERO y dar permisos
COPY wait-for-db.sh ./
RUN chmod +x wait-for-db.sh

# Copiar el resto de archivos
COPY package*.json ./
COPY tsconfig.json ./
COPY .eslintrc ./
COPY .env ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run compile

EXPOSE 3000

CMD ["./wait-for-db.sh", "mongo", "27017", "npm", "run", "populate-db", "&&", "npm", "start"]