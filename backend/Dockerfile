FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=development
ENV NPM_CONFIG_PRODUCTION=false
COPY package*.json ./
RUN npm install --include=dev
COPY . .
CMD ["npm", "run", "dev"]
