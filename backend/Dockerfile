# Stage 1: Build dependencies 

FROM node:18-alpine AS build

WORKDIR /app

RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev


COPY package.json package-lock.json ./

RUN npm ci --omit=dev  

# Stage 2: Production runtime - clean and minimal 

FROM node:18-alpine AS runtime

WORKDIR /app

# Install runtime system dependencies (non-dev versions)
RUN apk add --no-cache \
    cairo \
    jpeg \
    pango \
    giflib

# Copy built dependencies from build stage
COPY --from=build /app/node_modules ./node_modules

# Copy application source
COPY . .

# Create non-root user and set permissions
RUN chown -R node:node /app
USER node

EXPOSE 5000 

CMD ["npm", "start"]