########################################
# Stage 1: Build
########################################
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install  # Install all deps including dev

COPY . . 

RUN npm run build  # Build your app (assumes output in /app/dist)

########################################
# Stage 2: Production Runtime
########################################
FROM node:18-alpine AS runtime

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev  # Install only prod deps

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/public ./public
COPY --from=build /app/.next/static ./.next/static

# If you need public files or assets
# COPY --from=build /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]  # Adjust this to your entry point
