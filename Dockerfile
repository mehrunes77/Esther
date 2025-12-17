FROM node:20-alpine

WORKDIR /app

# Install build dependencies
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package.json package-lock.json ./
COPY backend/package.json backend/package-lock.json ./backend/
COPY frontend/package.json frontend/package-lock.json ./frontend/

# Install all dependencies
RUN npm ci
RUN cd backend && npm ci
RUN cd frontend && npm ci

# Copy source code
COPY . .

# Build backend
RUN cd backend && npm run build

# Build frontend
RUN cd frontend && npm run build

# Expose ports
EXPOSE 3001 5001

# Start both backend and frontend
CMD ["sh", "-c", "cd backend && npm run dev & cd frontend && npm run preview"]
