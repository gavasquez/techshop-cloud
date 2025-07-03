# TechShop Cloud - Deployment Guide

## Overview

Esta guía proporciona instrucciones detalladas para desplegar TechShop Cloud en diferentes entornos, desde desarrollo local hasta producción en Kubernetes.

## Prerequisites

### Software Requirements

- Docker 24.0+
- Docker Compose 2.0+
- Node.js 18+
- kubectl 1.28+
- Helm 3.12+
- Git

### Infrastructure Requirements

#### Development
- 4 GB RAM
- 2 CPU cores
- 10 GB storage

#### Staging
- 8 GB RAM
- 4 CPU cores
- 50 GB storage
- Kubernetes cluster

#### Production
- 16 GB RAM minimum
- 8 CPU cores minimum
- 200 GB storage minimum
- Multi-node Kubernetes cluster
- Load balancer
- SSL certificates

## Environment Configuration

### Environment Variables

Create environment files for each deployment target:

#### .env.development
```bash
# Application
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/techshop_dev
MONGODB_OPTIONS=retryWrites=true&w=majority

# Cache
REDIS_URL=redis://localhost:6379
REDIS_PREFIX=techshop:dev:

# Security
JWT_SECRET=development-jwt-secret-change-in-production
JWT_REFRESH_SECRET=development-refresh-secret-change-in-production
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000
AES_SECRET_KEY=dev-32-character-secret-key-here

# External Services
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
SMTP_FROM=noreply@techshop-dev.local

# Monitoring
LOG_LEVEL=debug
METRICS_ENABLED=true
METRICS_PORT=9090

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### .env.production
```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=v1

# Database
MONGODB_URI=${MONGODB_CONNECTION_STRING}
MONGODB_OPTIONS=retryWrites=true&w=majority&authSource=admin

# Cache
REDIS_URL=${REDIS_CONNECTION_STRING}
REDIS_PREFIX=techshop:prod:

# Security
JWT_SECRET=${JWT_SECRET_KEY}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET_KEY}
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=604800000
AES_SECRET_KEY=${AES_ENCRYPTION_KEY}

# External Services
SMTP_HOST=${SMTP_SERVER}
SMTP_PORT=587
SMTP_USER=${SMTP_USERNAME}
SMTP_PASS=${SMTP_PASSWORD}
SMTP_FROM=noreply@techshop-cloud.com

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
METRICS_PORT=9090
SENTRY_DSN=${SENTRY_DSN}

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Local Development Deployment

### Using Docker Compose

1. **Clone Repository**
```bash
git clone https://github.com/techshop/techshop-cloud.git
cd techshop-cloud
```

2. **Create Environment File**
```bash
cp .env.example .env.development
# Edit .env.development with your local settings
```

3. **Build and Start Services**
```bash
# Build application image
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app
```

4. **Initialize Database**
```bash
# Run database migrations
docker-compose exec app npm run db:migrate

# Seed test data
docker-compose exec app npm run db:seed
```

5. **Verify Deployment**
```bash
# Check service status
docker-compose ps

# Test API endpoint
curl http://localhost:3000/health

# Access application
open http://localhost:3000
```

### Using Local Node.js

1. **Install Dependencies**
```bash
npm install
```

2. **Start Database Services**
```bash
# Start MongoDB
docker run -d --name mongo -p 27017:27017 mongo:6.0

# Start Redis
docker run -d --name redis -p 6379:6379 redis:7-alpine
```

3. **Run Application**
```bash
# Development mode with hot reload
npm run dev

# Production build
npm run build
npm start
```

## Staging Deployment

### Docker Swarm

1. **Initialize Swarm**
```bash
docker swarm init
```

2. **Create Docker Stack File**
```yaml
# docker-stack.staging.yml
version: '3.8'

services:
  app:
    image: techshop/app:staging
    deploy:
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=staging
    secrets:
      - mongodb_uri
      - jwt_secret
    networks:
      - techshop-network

  mongodb:
    image: mongo:6.0
    deploy:
      replicas: 1
      placement:
        constraints:
          - node.role == manager
    volumes:
      - mongodb_data:/data/db
    secrets:
      - mongodb_root_password
    networks:
      - techshop-network

  redis:
    image: redis:7-alpine
    deploy:
      replicas: 1
    volumes:
      - redis_data:/data
    networks:
      - techshop-network

secrets:
  mongodb_uri:
    external: true
  jwt_secret:
    external: true
  mongodb_root_password:
    external: true

volumes:
  mongodb_data:
  redis_data:

networks:
  techshop-network:
    driver: overlay
```

3. **Deploy Stack**
```bash
# Create secrets
echo "mongodb://root:password@mongodb:27017/techshop" | docker secret create mongodb_uri -
echo "staging-jwt-secret-key" | docker secret create jwt_secret -

# Deploy stack
docker stack deploy -c docker-stack.staging.yml techshop
```

### Kubernetes (Single Node)

1. **Create Kubernetes Manifests**
```bash
mkdir k8s-staging
```

2. **Namespace Configuration**
```yaml
# k8s-staging/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: techshop-staging
```

3. **ConfigMap**
```yaml
# k8s-staging/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: techshop-config
  namespace: techshop-staging
data:
  NODE_ENV: "staging"
  PORT: "3000"
  LOG_LEVEL: "info"
  METRICS_ENABLED: "true"
```

4. **Secrets**
```yaml
# k8s-staging/secrets.yaml
apiVersion: v1
kind: Secret
metadata:
  name: techshop-secrets
  namespace: techshop-staging
type: Opaque
data:
  mongodb-uri: <base64-encoded-mongodb-uri>
  jwt-secret: <base64-encoded-jwt-secret>
  jwt-refresh-secret: <base64-encoded-refresh-secret>
```

5. **Deploy to Staging**
```bash
# Apply configurations
kubectl apply -f k8s-staging/

# Check deployment status
kubectl get pods -n techshop-staging

# Check logs
kubectl logs -f deployment/techshop-app -n techshop-staging
```

## Production Deployment

### Kubernetes Production Setup

1. **Cluster Preparation**
```bash
# Verify cluster access
kubectl cluster-info

# Create production namespace
kubectl create namespace techshop-production

# Set default namespace
kubectl config set-context --current --namespace=techshop-production
```

2. **Storage Configuration**
```yaml
# k8s-production/storage.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: fast-ssd
provisioner: kubernetes.io/gce-pd
parameters:
  type: pd-ssd
  replication-type: regional-pd
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
  namespace: techshop-production
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 100Gi
  storageClassName: fast-ssd
```

3. **Database Deployment**
```yaml
# k8s-production/mongodb.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: techshop-production
spec:
  serviceName: mongodb-service
  replicas: 3
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:6.0
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: password
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
        resources:
          requests:
            memory: "2Gi"
            cpu: "1000m"
          limits:
            memory: "4Gi"
            cpu: "2000m"
        livenessProbe:
          exec:
            command:
            - mongo
            - --eval
            - "db.adminCommand('ping')"
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command:
            - mongo
            - --eval
            - "db.adminCommand('ping')"
          initialDelaySeconds: 5
          periodSeconds: 5
  volumeClaimTemplates:
  - metadata:
      name: mongodb-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName