FROM node:lts AS base
WORKDIR /app

FROM base AS backend
COPY backend/package*.json ./
RUN npm i
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM base AS frontend
# Install dependencies for Playwright Chrome
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    procps \
    libxss1 \
    libgconf-2-4 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libcairo-gobject2 \
    libgtk-3-0 \
    libgdk-pixbuf2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrender1 \
    libxtst6 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    && rm -rf /var/lib/apt/lists/*

COPY frontend/package*.json ./
RUN npm i

# Install Playwright browsers after npm install
RUN npx playwright install chromium
RUN npx playwright install-deps chromium

EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]