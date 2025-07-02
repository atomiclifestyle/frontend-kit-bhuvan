# Build stage
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Run stage using Vite preview server
FROM node:18 AS run

WORKDIR /app

COPY --from=build /app /app

EXPOSE 8080

CMD ["npm", "run", "start"]