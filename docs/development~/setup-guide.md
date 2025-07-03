# TechShop Cloud - Setup Guide

## Prerequisites

### System Requirements

**Operating System:**
- macOS 12+
- Ubuntu 20.04+
- Windows 10+ with WSL2

**Hardware Requirements:**
- 8 GB RAM minimum (16 GB recommended)
- 4 CPU cores minimum
- 20 GB free disk space
- Internet connection

### Required Software

#### Core Tools
- **Node.js**: 18.x or 20.x LTS
- **npm**: 9.x+ (comes with Node.js)
- **Git**: 2.30+
- **Docker**: 24.0+
- **Docker Compose**: 2.0+

#### Recommended Tools
- **Visual Studio Code**: Latest version
- **Postman**: For API testing
- **MongoDB Compass**: Database GUI
- **Redis CLI**: Cache management

## Installation Steps

### 1. Install Node.js and npm

#### Using Node Version Manager (Recommended)

**macOS/Linux:**
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Restart terminal or source profile
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts
nvm alias default node

# Verify installation
node --version  # Should show v18.x.x or v20.x.x
npm --version   # Should show 9.x.x or higher
```

**Windows:**
```cmd
# Download and install Node.js LTS from https://nodejs.org
# Or use Chocolatey
choco install nodejs-lts

# Verify installation
node --version
npm --version
```

#### Alternative: Direct Installation
Download from [nodejs.org](https://nodejs.org) and install the LTS version.

### 2. Install Docker

#### macOS
```bash
# Download Docker Desktop from https://docker.com
# Or use Homebrew
brew install --cask docker
```

#### Ubuntu/Linux
```bash
# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker
```

#### Windows
```cmd
# Download Docker Desktop from https://docker.com
# Or use Chocolatey
choco install docker-desktop
```

### 3. Install Git

#### macOS
```bash
# Using Homebrew
brew install git

# Or download from https://git-scm.com
```

#### Ubuntu/Linux
```bash
sudo apt update
sudo apt install git
```

#### Windows
```cmd
# Download from https://git-scm.com
# Or use Chocolatey
choco install git
```

### 4. Install Development Tools

#### Visual Studio Code
```bash
# macOS
brew install --cask visual-studio-code

# Ubuntu
sudo snap install code --classic

# Windows
choco install vscode
```

#### Required VS Code Extensions
Install these extensions for optimal development experience:

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-jest",
    "humao.rest-client",
    "ms-vscode-remote.remote-containers",
    "redhat.vscode-yaml",
    "ms-kubernetes-tools.vscode-kubernetes-tools"
  ]
}
```

## Project Setup

### 1. Clone Repository

```bash
# Clone the repository
git clone https://github.com/your-org/techshop-cloud.git
cd techshop-cloud

# Create and switch to development branch
git checkout -b feature/your-feature-name
```

### 2. Environment Configuration

#### Create Environment Files

```bash
# Copy example environment file
cp .env.example .env.development

# Create test environment file
cp .env.example .env.test
```

#### Configure .env.development

```bash
# Application Configuration
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/techshop_dev
MONGODB_TEST_URI=mongodb://localhost:27017/techshop_test

# Redis Configuration
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=techshop:dev:

# JWT Configuration
JWT_SECRET=development-jwt-secret-change-in-production
JWT_REFRESH_SECRET=development-refresh-secret-change-in-production
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000

# AES Encryption
AES_SECRET_KEY=dev-32-character-secret-key-here

# Email Configuration (Development)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@techshop-dev.local

# Logging
LOG_LEVEL=debug
LOG_FORMAT=dev

# Development Features
HOT_RELOAD=true
AUTO_RESTART=true
DEBUG_MODE=true

# Testing
TEST_TIMEOUT=10000
COVERAGE_THRESHOLD=80
```

### 3. Install Dependencies

```bash
# Install project dependencies
npm install

# Install global tools
npm install -g nodemon typescript ts-node

# Verify installation
npm ls --depth=0
```

### 4. Database Setup

#### Option A: Using Docker (Recommended)

```bash
# Start MongoDB and Redis with Docker Compose
docker-compose up -d mongodb redis

# Verify services are running
docker-compose ps

# Check logs if needed
docker-compose logs mongodb
docker-compose logs redis
```

#### Option B: Local Installation

**MongoDB:**
```bash
# macOS
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community

# Ubuntu
sudo apt install mongodb
sudo systemctl start mongod
sudo systemctl enable mongod

# Windows
# Download from https://www.mongodb.com/try/download/community
```

**Redis:**
```bash
# macOS
brew install redis
brew services start redis

# Ubuntu
sudo apt install redis-server
sudo systemctl start redis-server

# Windows
# Download from https://github.com/microsoftarchive/redis/releases
```

### 5. Database Initialization

```bash
# Run database migrations
npm run db:migrate

# Seed development data
npm run db:seed

# Verify database setup
npm run db:verify
```

### 6. Build and Start Application

```bash
# Development mode (with hot reload)
npm run dev

# Build for production
npm run build

# Start production build
npm start

# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## VS Code Configuration

### 1. Workspace Settings

Create `.vscode/settings.json`:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "files.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/.git": true,
    "**/coverage": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/dist": true,
    "**/coverage": true
  },
  "typescript.suggest.autoImports": true,
  "typescript.preferences.includePackageJsonAutoImports": "auto",
  "jest.autoEnable": true,
  "jest.showCoverageOnLoad": true,
  "rest-client.environmentVariables": {
    "local": {
      "baseUrl": "http://localhost:3000",
      "apiVersion": "v1"
    }
  }
}
```

### 2. Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Launch Application",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/dist/index.js",
      "outFiles": ["${workspaceFolder}/dist/**/*.js"],
      "env": {
        "NODE_ENV": "development"
      },
      "console": "integratedTerminal",
      "envFile": "${workspaceFolder}/.env.development"
    },
    {
      "name": "Debug Tests",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      },
      "envFile": "${workspaceFolder}/.env.test"
    },
    {
      "name": "Debug Current Test File",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/.bin/jest",
      "args": ["${fileBasenameNoExtension}", "--runInBand", "--no-cache"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "test"
      },
      "envFile": "${workspaceFolder}/.env.test"
    }
  ]
}
```

### 3. Tasks Configuration

Create `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Build",
      "type": "npm",
      "script": "build",
      "group": {
        "kind": "build",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "silent",
        "focus": false,
        "panel": "shared"
      },
      "problemMatcher": "$tsc"
    },
    {
      "label": "Test",
      "type": "npm",
      "script": "test",
      "group": {
        "kind": "test",
        "isDefault": true
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel": "shared"
      }
    },
    {
      "label": "Start Development",
      "type": "npm",
      "script": "dev",
      "runOptions": {
        "runOn": "folderOpen"
      },
      "presentation": {
        "echo": true,
        "reveal": "always",
        "focus": false,
        "panel