# Usa una imagen base de Node.js con la versión que necesitas
FROM node:22-alpine

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de tu proyecto al contenedor
COPY package*.json ./

# Instala las dependencias del proyecto
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que tu aplicación usa 
EXPOSE 3000

# Define el comando que se ejecutará al iniciar el contenedor
CMD ["npm", "run", "start"]