########################################
# Stage 1: Build
########################################
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install  # Install all deps including dev

COPY . .  # Include source code

RUN npm run build  # Build your app (assumes output in /app/dist)

########################################
# Stage 2: Production Runtime
########################################
FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev  # Install only prod deps

COPY --from=build /app/dist ./dist  # Copy built app

# If you need public files or assets
# COPY --from=build /app/public ./public

EXPOSE 5000

CMD ["node", "dist/index.js"]  # Adjust this to your entry point
