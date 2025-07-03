# TechShop Cloud - Infraestructura

## Arquitectura de Infraestructura

TechShop Cloud está diseñado para desplegarse en una infraestructura cloud-native que soporta escalabilidad automática, alta disponibilidad y tolerancia a fallos.

## Stack de Infraestructura

### Contenedores y Orquestación
- **Docker**: Contenedores para aplicación y servicios
- **Kubernetes**: Orquestación y gestión de contenedores
- **Helm**: Gestión de deployments y configuraciones
- **Istio**: Service mesh para comunicación entre servicios

### Base de Datos y Persistencia
- **MongoDB**: Base de datos principal (documentos)
- **Redis**: Cache distribuido y sesiones
- **MinIO**: Object storage para archivos estáticos
- **Backup automatizado**: Snapshots diarios

### Monitoreo y Observabilidad
- **Prometheus**: Métricas y alertas
- **Grafana**: Dashboards y visualización
- **Jaeger**: Distributed tracing
- **ELK Stack**: Logging centralizado (Elasticsearch, Logstash, Kibana)

### Seguridad y Networking
- **Cert-Manager**: Gestión automática de certificados SSL/TLS
- **Nginx Ingress**: Load balancer y reverse proxy
- **Network Policies**: Segmentación de red
- **Vault**: Gestión de secretos

## Arquitectura de Deployment

### Desarrollo Local

```
┌─────────────────────────────────────┐
│           Local Development         │
├─────────────────────────────────────┤
│  Node.js App → Docker Compose       │
│  MongoDB Local → Redis Local        │
│  Hot Reload → Live Testing          │
└─────────────────────────────────────┘
```

### Staging Environment

```
┌─────────────────────────────────────┐
│         Staging Environment         │
├─────────────────────────────────────┤
│  Kubernetes Cluster (Single Node)   │
│  MongoDB Replica Set (3 nodes)      │
│  Redis Cluster → Monitoring Stack   │
└─────────────────────────────────────┘
```

### Production Environment

```
┌─────────────────────────────────────┐
│        Production Environment       │
├─────────────────────────────────────┤
│  Multi-Zone Kubernetes Cluster      │
│  High Availability MongoDB          │
│  Redis Cluster → Full Monitoring    │
│  CDN → Load Balancers → Auto-scaling│
└─────────────────────────────────────┘
```

## Configuración de Contenedores

### Dockerfile Multi-stage

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S techshop -u 1001

WORKDIR /app

# Copy built application
COPY --from=builder --chown=techshop:nodejs /app/dist ./dist
COPY --from=builder --chown=techshop:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=techshop:nodejs /app/package.json ./package.json

USER techshop

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]
```

### Docker Compose para Desarrollo

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      target: production
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - MONGODB_URI=mongodb://mongodb:27017/techshop
      - REDIS_URL=redis://redis:6379
    depends_on:
      - mongodb
      - redis
    volumes:
      - ./src:/app/src
      - /app/node_modules
    networks:
      - techshop-network

  mongodb:
    image: mongo:6.0
    ports:
      - "27017:27017"
    environment:
      - MONGO_INITDB_ROOT_USERNAME=admin
      - MONGO_INITDB_ROOT_PASSWORD=password
      - MONGO_INITDB_DATABASE=techshop
    volumes:
      - mongodb_data:/data/db
      - ./scripts/mongo-init.js:/docker-entrypoint-initdb.d/mongo-init.js:ro
    networks:
      - techshop-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - techshop-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
    depends_on:
      - app
    networks:
      - techshop-network

volumes:
  mongodb_data:
  redis_data:

networks:
  techshop-network:
    driver: bridge
```

## Configuración de Kubernetes

### Namespace Configuration

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: techshop-cloud
  labels:
    name: techshop-cloud
    environment: production
```

### Application Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: techshop-app
  namespace: techshop-cloud
  labels:
    app: techshop-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: techshop-app
  template:
    metadata:
      labels:
        app: techshop-app
    spec:
      containers:
      - name: techshop-app
        image: techshop/app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: MONGODB_URI
          valueFrom:
            secretKeyRef:
              name: techshop-secrets
              key: mongodb-uri
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: techshop-secrets
              key: redis-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: techshop-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
        securityContext:
          runAsNonRoot: true
          runAsUser: 1001
          allowPrivilegeEscalation: false
          readOnlyRootFilesystem: true
```

### Service Configuration

```yaml
apiVersion: v1
kind: Service
metadata:
  name: techshop-app-service
  namespace: techshop-cloud
spec:
  selector:
    app: techshop-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: ClusterIP
```

### Horizontal Pod Autoscaler

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: techshop-app-hpa
  namespace: techshop-cloud
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: techshop-app
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

### MongoDB StatefulSet

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: mongodb
  namespace: techshop-cloud
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
          valueFrom:
            secretKeyRef:
              name: mongodb-secret
              key: username
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
            memory: "1Gi"
            cpu: "500m"
          limits:
            memory: "2Gi"
            cpu: "1000m"
  volumeClaimTemplates:
  - metadata:
      name: mongodb-storage
    spec:
      accessModes: ["ReadWriteOnce"]
      resources:
        requests:
          storage: 20Gi
```

### Redis Cluster

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: redis
  namespace: techshop-cloud
spec:
  replicas: 3
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
        command:
          - redis-server
          - "--appendonly"
          - "yes"
          - "--cluster-enabled"
          - "yes"
        volumeMounts:
        - name: redis-storage
          mountPath: /data
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
      volumes:
      - name: redis-storage
        persistentVolumeClaim:
          claimName: redis-pvc
```

## Ingress y Load Balancing

### Nginx Ingress Controller

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: techshop-ingress
  namespace: techshop-cloud
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/use-regex: "true"
    nginx.ingress.kubernetes.io/rewrite-target: /$2
    nginx.ingress.kubernetes.io/rate-limit: "100"
    nginx.ingress.kubernetes.io/rate-limit-window: "1m"
spec:
  tls:
  - hosts:
    - api.techshop-cloud.com
    secretName: techshop-tls
  rules:
  - host: api.techshop-cloud.com
    http:
      paths:
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: techshop-app-service
            port:
              number: 80
```

### SSL Certificate Management

```yaml
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@techshop-cloud.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

## Monitoreo y Observabilidad

### Prometheus Configuration

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
  namespace: techshop-cloud
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    
    rule_files:
      - "techshop_rules.yml"
    
    scrape_configs:
      - job_name: 'techshop-app'
        static_configs:
          - targets: ['techshop-app-service:80']
        metrics_path: /metrics
        scrape_interval: 10s
      
      - job_name: 'mongodb'
        static_configs:
          - targets: ['mongodb-service:9216']
      
      - job_name: 'redis'
        static_configs:
          - targets: ['redis-service:9121']
      
      - job_name: 'kubernetes-nodes'
        kubernetes_sd_configs:
          - role: node
        relabel_configs:
          - source_labels: [__address__]
            regex: '(.*):10250'
            target_label: __address__
            replacement: '${1}:9100'

    alerting:
      alertmanagers:
        - static_configs:
            - targets:
              - alertmanager:9093
```

### Grafana Dashboard

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: grafana-dashboards
  namespace: techshop-cloud
data:
  techshop-dashboard.json: |
    {
      "dashboard": {
        "title": "TechShop Cloud Metrics",
        "panels": [
          {
            "title": "Request Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total[5m])",
                "legendFormat": "{{method}} {{status}}"
              }
            ]
          },
          {
            "title": "Response Time",
            "type": "graph",
            "targets": [
              {
                "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
                "legendFormat": "95th percentile"
              }
            ]
          },
          {
            "title": "Error Rate",
            "type": "graph",
            "targets": [
              {
                "expr": "rate(http_requests_total{status=~\"5..\"}[5m])",
                "legendFormat": "5xx errors"
              }
            ]
          },
          {
            "title": "Database Connections",
            "type": "graph",
            "targets": [
              {
                "expr": "mongodb_connections",
                "legendFormat": "Active connections"
              }
            ]
          }
        ]
      }
    }
```

## Network Policies

### Application Network Policy

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: techshop-app-netpol
  namespace: techshop-cloud
spec:
  podSelector:
    matchLabels:
      app: techshop-app
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          name: nginx-ingress
    - podSelector:
        matchLabels:
          app: nginx-ingress
    ports:
    - protocol: TCP
      port: 3000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: mongodb
    ports:
    - protocol: TCP
      port: 27017
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
  - to: []
    ports:
    - protocol: TCP
      port: 80
    - protocol: TCP
      port: 443
```

## Backup y Disaster Recovery

### MongoDB Backup CronJob

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mongodb-backup
  namespace: techshop-cloud
spec:
  schedule: "0 2 * * *"  # Daily at 2 AM
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: mongodb-backup
            image: mongo:6.0
            command:
            - /bin/sh
            - -c
            - |
              mongodump --host mongodb-service:27017 \
                       --username $MONGO_USERNAME \
                       --password $MONGO_PASSWORD \
                       --authenticationDatabase admin \
                       --gzip \
                       --archive=/backup/backup-$(date +%Y%m%d-%H%M%S).gz
              
              # Upload to cloud storage
              aws s3 cp /backup/ s3://techshop-backups/mongodb/ --recursive
              
              # Clean old local backups
              find /backup -name "*.gz" -mtime +7 -delete
            env:
            - name: MONGO_USERNAME
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: username
            - name: MONGO_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: mongodb-secret
                  key: password
            volumeMounts:
            - name: backup-storage
              mountPath: /backup
          volumes:
          - name: backup-storage
            persistentVolumeClaim:
              claimName: backup-pvc
          restartPolicy: OnFailure
```

## Resource Quotas y Limits

### Namespace Resource Quota

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: techshop-quota
  namespace: techshop-cloud
spec:
  hard:
    requests.cpu: "4"
    requests.memory: 8Gi
    limits.cpu: "8"
    limits.memory: 16Gi
    persistentvolumeclaims: "10"
    pods: "20"
    services: "10"
    secrets: "20"
    configmaps: "20"
```

### Pod Disruption Budget

```yaml
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: techshop-app-pdb
  namespace: techshop-cloud
spec:
  minAvailable: 2
  selector:
    matchLabels:
      app: techshop-app
```

## Security Configurations

### Security Context

```yaml
apiVersion: v1
kind: SecurityContext
metadata:
  name: techshop-security-context
spec:
  runAsNonRoot: true
  runAsUser: 1001
  runAsGroup: 1001
  fsGroup: 1001
  seccompProfile:
    type: RuntimeDefault
  capabilities:
    drop:
    - ALL
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
```

### Service Account

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: techshop-service-account
  namespace: techshop-cloud
automountServiceAccountToken: false
```

## Escalabilidad y Performance

### Cluster Autoscaler

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: cluster-autoscaler-status
  namespace: kube-system
data:
  nodes.max: "10"
  nodes.min: "3"
  scale-down-enabled: "true"
  scale-down-delay-after-add: "10m"
  scale-down-unneeded-time: "10m"
```

### Vertical Pod Autoscaler

```yaml
apiVersion: autoscaling.k8s.io/v1
kind: VerticalPodAutoscaler
metadata:
  name: techshop-app-vpa
  namespace: techshop-cloud
spec:
  targetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: techshop-app
  updatePolicy:
    updateMode: "Auto"
  resourcePolicy:
    containerPolicies:
    - containerName: techshop-app
      maxAllowed:
        cpu: 1
        memory: 1Gi
      minAllowed:
        cpu: 100m
        memory: 128Mi
```

## CI/CD Pipeline Integration

### GitHub Actions Workflow

```yaml
name: Deploy to Kubernetes
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Docker Image
      run: |
        docker build -t techshop/app:${{ github.sha }} .
        docker tag techshop/app:${{ github.sha }} techshop/app:latest
    
    - name: Push to Registry
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push techshop/app:${{ github.sha }}
        docker push techshop/app:latest
    
    - name: Deploy to Kubernetes
      uses: azure/k8s-deploy@v1
      with:
        manifests: |
          k8s/deployment.yaml
          k8s/service.yaml
          k8s/ingress.yaml
        images: |
          techshop/app:${{ github.sha }}
```

## Configuración de Entornos

### Development Environment

```yaml
# values-dev.yaml
replicaCount: 1
image:
  tag: latest
  pullPolicy: Always

resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "256Mi"
    cpu: "200m"

mongodb:
  persistence:
    size: 1Gi
  
redis:
  persistence:
    size: 1Gi

ingress:
  enabled: false
```

### Production Environment

```yaml
# values-prod.yaml
replicaCount: 3
image:
  tag: stable
  pullPolicy: IfNotPresent

resources:
  requests:
    memory: "256Mi"
    cpu: "250m"
  limits:
    memory: "512Mi"
    cpu: "500m"

mongodb:
  persistence:
    size: 20Gi
  replicaSet:
    enabled: true
    replicas: 3

redis:
  persistence:
    size: 5Gi
  cluster:
    enabled: true

ingress:
  enabled: true
  tls:
    enabled: true
```

Esta infraestructura proporciona una base sólida para el despliegue escalable y seguro de TechShop Cloud en entornos de producción.