########################################## Stage 1: Build dependencies ############################################

FROM node:18-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

############################### Stage 2: Production runtime - clean and minimal #################################

FROM node:18-alpine AS runtime

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules

COPY . .

EXPOSE 5000 

CMD ["npm", "run", "dev"]
