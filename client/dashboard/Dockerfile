FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG CORE_API_URL=http://core:4000
ENV CORE_API_URL=$CORE_API_URL
RUN npm run build
USER node
EXPOSE 3000
CMD ["npm", "start"]
