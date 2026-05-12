FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
RUN npm install -g typescript
COPY . .
RUN cat tsconfig.json

# On compile le TypeScript en JavaScript
RUN npm run build
ENV PORT=3000 
# Très important !
EXPOSE 3000 
# Très important !
CMD ["npm", "start"]
