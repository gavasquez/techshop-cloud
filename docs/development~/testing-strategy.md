# TechShop Cloud - Testing Strategy

## Overview

TechShop Cloud implementa una estrategia de testing comprehensiva basada en Test-Driven Development (TDD) que asegura la calidad del código y la confiabilidad del sistema.

## Testing Philosophy

### Principios Fundamentales

1. **Test-Driven Development (TDD)**: Escribir tests antes que el código de implementación
2. **Testing Pyramid**: Mayoría de tests unitarios, menos tests de integración, mínimos E2E
3. **Fast Feedback**: Tests rápidos para desarrollo ágil
4. **High Coverage**: Objetivo de 80%+ de cobertura de código
5. **Reliable Tests**: Tests determinísticos y estables

### Testing Pyramid

```
           E2E Tests
         (Few, Expensive)
        /               \
       /    Integration   \
      /     Tests (Some)   \
     /                     \
    -------------------------
    Unit Tests (Many, Fast)
```

**Distribución Target:**
- 70% Unit Tests
- 20% Integration Tests  
- 10% End-to-End Tests

## Test Structure

### Directorio de Tests

```
__tests__/
├── setup.ts                    # Configuración global de tests
├── unit/                       # Tests unitarios
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Product.test.ts
│   │   │   └── User.test.ts
│   │   ├── services/
│   │   └── value-objects/
│   ├── application/
│   │   ├── use-cases/
│   │   └── services/
│   └── infrastructure/
│       ├── repositories/
│       ├── security/
│       └── resilience/
├── integration/                # Tests de integración
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── products.test.ts
│   │   └── users.test.ts
│   ├── database/
│   │   ├── repositories/
│   │   └── migrations/
│   └── services/
└── e2e/                       # Tests End-to-End
    ├── user-flows/
    ├── api-workflows/
    └── performance/
```

## Unit Testing

### Características

- **Scope**: Funciones, métodos, clases individuales
- **Dependencies**: Mockeadas
- **Speed**: Muy rápidos (< 10ms por test)
- **Isolation**: Completamente aislados

### Herramientas

- **Jest**: Framework de testing principal
- **TypeScript**: Tipos y compilación
- **Supertest**: Testing de APIs HTTP
- **MSW**: Mocking de servicios externos

### Configuración Jest

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/?(*.)+(spec|test).ts'
  ],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/**/__tests__/**',
    '!src/**/tests/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 10000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};
```

### Ejemplo de Test Unitario

```typescript
// __tests__/unit/domain/entities/Product.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { Product } from '../../../../src/domain/product/Product';

describe('Product Entity', () => {
  let validProductData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stockQuantity: number;
  };

  beforeEach(() => {
    validProductData = {
      name: 'Gaming Laptop',
      description: 'High-performance gaming laptop',
      price: 1299.99,
      category: 'Electronics',
      stockQuantity: 10
    };
  });

  describe('Product Creation', () => {
    it('should create product with correct initial values', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );

      expect(product.id).toBeDefined();
      expect(product.name).toBe(validProductData.name);
      expect(product.price).toBe(validProductData.price);
      expect(product.isActive()).toBe(true);
    });

    it('should throw error when price is zero or negative', () => {
      expect(() => {
        new Product(
          validProductData.name,
          validProductData.description,
          0,
          validProductData.category,
          validProductData.stockQuantity
        );
      }).toThrow('Price must be greater than zero');
    });
  });

  describe('Stock Management', () => {
    it('should decrease stock correctly', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        validProductData.stockQuantity
      );

      product.decreaseStock(3);
      expect(product.stockQuantity).toBe(7);
    });

    it('should throw error when decreasing more stock than available', () => {
      const product = new Product(
        validProductData.name,
        validProductData.description,
        validProductData.price,
        validProductData.category,
        5
      );

      expect(() => {
        product.decreaseStock(10);
      }).toThrow('Insufficient stock');
    });
  });
});
```

### Best Practices para Unit Tests

#### Estructura AAA (Arrange, Act, Assert)

```typescript
it('should calculate discounted price correctly', () => {
  // Arrange
  const product = new Product('Test Product', 'Description', 100, 'Category', 10);
  const discountPercentage = 20;

  // Act
  const discountedPrice = product.calculateDiscountedPrice(discountPercentage);

  // Assert
  expect(discountedPrice).toBe(80);
});
```

#### Mocking Dependencies

```typescript
// __tests__/unit/application/use-cases/CreateProductUseCase.test.ts
import { jest } from '@jest/globals';
import { CreateProductUseCase } from '../../../../src/application/product/CreateProductUseCase';
import { ProductRepository } from '../../../../src/domain/product/ProductRepository';

describe('CreateProductUseCase', () => {
  let createProductUseCase: CreateProductUseCase;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  beforeEach(() => {
    mockProductRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      findByName: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ProductRepository>;

    createProductUseCase = new CreateProductUseCase(mockProductRepository);
  });

  it('should save product to repository', async () => {
    // Arrange
    const productData = {
      name: 'Test Product',
      description: 'Test Description',
      price: 99.99,
      category: 'Test Category',
      stockQuantity: 10
    };

    const savedProduct = new Product(
      productData.name,
      productData.description,
      productData.price,
      productData.category,
      productData.stockQuantity
    );

    mockProductRepository.save.mockResolvedValue(savedProduct);

    // Act
    const result = await createProductUseCase.execute(productData);

    // Assert
    expect(mockProductRepository.save).toHaveBeenCalledTimes(1);
    expect(result.name).toBe(productData.name);
  });
});
```

## Integration Testing

### Características

- **Scope**: Múltiples componentes trabajando juntos
- **Dependencies**: Servicios reales o containers de test
- **Speed**: Moderados (100ms - 1s por test)
- **Database**: Base de datos de test

### Database Testing

```typescript
// __tests__/integration/repositories/ProductRepository.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ProductMongoRepository } from '../../../src/infrastructure/mongoose/product/ProductMongoRepository';
import { Product } from '../../../src/domain/product/Product';

describe('ProductMongoRepository Integration', () => {
  let mongoServer: MongoMemoryServer;
  let repository: ProductMongoRepository;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
    repository = new ProductMongoRepository();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await mongoose.connection.db.dropDatabase();
  });

  it('should save and retrieve product', async () => {
    // Arrange
    const product = new Product(
      'Integration Test Product',
      'Test Description',
      99.99,
      'Test Category',
      5
    );

    // Act
    const savedProduct = await repository.save(product);
    const retrievedProduct = await repository.findById(savedProduct.id);

    // Assert
    expect(retrievedProduct).toBeDefined();
    expect(retrievedProduct!.name).toBe(product.name);
    expect(retrievedProduct!.price).toBe(product.price);
  });

  it('should find products by category', async () => {
    // Arrange
    const product1 = new Product('Product 1', 'Desc 1', 50, 'Electronics', 10);
    const product2 = new Product('Product 2', 'Desc 2', 75, 'Electronics', 5);
    const product3 = new Product('Product 3', 'Desc 3', 100, 'Books', 8);

    await repository.save(product1);
    await repository.save(product2);
    await repository.save(product3);

    // Act
    const electronicsProducts = await repository.findByCategory('Electronics');

    // Assert
    expect(electronicsProducts).toHaveLength(2);
    expect(electronicsProducts.every(p => p.category === 'Electronics')).toBe(true);
  });
});
```

### API Testing

```typescript
// __tests__/integration/api/products.test.ts
import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import request from 'supertest';
import { app } from '../../../src/app';
import { setupTestDatabase, clearTestDatabase } from '../../helpers/database';
import { createTestUser, generateAuthToken } from '../../helpers/auth';

describe('Products API Integration', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    await setupTestDatabase();
    
    const testUser = await createTestUser({ roles: ['USER'] });
    const adminUser = await createTestUser({ roles: ['ADMIN'] });
    
    authToken = generateAuthToken(testUser);
    adminToken = generateAuthToken(adminUser);
  });

  afterAll(async () => {
    await clearTestDatabase();
  });

  beforeEach(async () => {
    await clearTestDatabase();
  });

  describe('GET /api/v1/products', () => {
    it('should return paginated products', async () => {
      // Arrange
      await createTestProducts(5);

      // Act
      const response = await request(app)
        .get('/api/v1/products')
        .query({ page: 1, limit: 3 })
        .expect(200);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(3);
      expect(response.body.data.pagination.total).toBe(5);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    it('should filter products by category', async () => {
      // Arrange
      await createTestProducts(3, { category: 'Electronics' });
      await createTestProducts(2, { category: 'Books' });

      // Act
      const response = await request(app)
        .get('/api/v1/products')
        .query({ category: 'Electronics' })
        .expect(200);

      // Assert
      expect(response.body.data.items).toHaveLength(3);
      expect(response.body.data.items.every(item => item.category === 'Electronics')).toBe(true);
    });
  });

  describe('POST /api/v1/products', () => {
    it('should create new product with admin token', async () => {
      // Arrange
      const productData = {
        name: 'New Test Product',
        description: 'Test Description',
        price: 99.99,
        category: 'Electronics',
        stockQuantity: 10
      };

      // Act
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      // Assert
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(productData.name);
      expect(response.body.data.price).toBe(productData.price);
    });

    it('should reject creation with user token', async () => {
      // Arrange
      const productData = {
        name: 'Unauthorized Product',
        description: 'Should not be created',
        price: 50,
        category: 'Test',
        stockQuantity: 5
      };

      // Act & Assert
      await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(403);
    });

    it('should validate required fields', async () => {
      // Arrange
      const invalidProductData = {
        name: '',
        price: -10,
        category: 'Test'
        // Missing required fields
      };

      // Act
      const response = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidProductData)
        .expect(422);

      // Assert
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeInstanceOf(Array);
    });
  });
});
```

## End-to-End Testing

### Características

- **Scope**: Flujos completos de usuario
- **Environment**: Entorno lo más parecido a producción
- **Speed**: Lentos (segundos por test)
- **Browser**: Interacciones reales con navegador

### Herramientas

- **Playwright**: Framework de testing E2E principal
- **Puppeteer**: Alternativa para testing de navegador
- **Docker Compose**: Entorno de testing completo

### Configuración Playwright

```typescript
// playwright.config.ts
import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: '__tests__/e2e',
  timeout: 30000,
  retries: 2,
  workers: 1,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 10000,
    navigationTimeout: 30000,
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...require('@playwright/test').devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...require('@playwright/test').devices['Desktop Safari'] }
    }
  ],
  webServer: {
    command: 'npm run start:test',
    port: 3000,
    reuseExistingServer: !process.env.CI
  }
};

export default config;
```

### Ejemplo E2E Test

```typescript
// __tests__/e2e/user-authentication.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register, login and access protected content', async ({ page }) => {
    // Registration
    await page.click('[data-testid="register-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123!');
    await page.click('[data-testid="submit-login"]');

    // Verify login success and redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toContainText('Test User');

    // Access protected content
    await page.click('[data-testid="profile-link"]');
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('[data-testid="profile-email"]')).toContainText('test@example.com');
  });

  test('should show error for invalid login credentials', async ({ page }) => {
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'invalid@example.com');
    await page.fill('[data-testid="password-input"]', 'wrongpassword');
    await page.click('[data-testid="submit-login"]');

    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });

  test('should logout user and clear session', async ({ page }) => {
    // First login
    await loginUser(page, 'test@example.com', 'TestPassword123!');
    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Verify logout
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();

    // Try to access protected page
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });
});

async function loginUser(page, email: string, password: string) {
  await page.click('[data-testid="login-button"]');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="submit-login"]');
}
```

## Performance Testing

### Load Testing con Artillery

```yaml
# artillery/load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 300
      arrivalRate: 50
      name: Sustained load
    - duration: 120
      arrivalRate: 100
      name: Peak load
  defaults:
    headers:
      content-type: 'application/json'

scenarios:
  - name: User authentication and browsing
    weight: 70
    flow:
      - post:
          url: '/api/v1/auth/login'
          json:
            email: 'test@example.com'
            password: 'TestPassword123!'
          capture:
            json: '$.data.tokens.accessToken'
            as: 'authToken'
      - get:
          url: '/api/v1/products'
          headers:
            Authorization: 'Bearer {{ authToken }}'
      - get:
          url: '/api/v1/users/profile'
          headers:
            Authorization: 'Bearer {{ authToken }}'

  - name: Product browsing (anonymous)
    weight: 30
    flow:
      - get:
          url: '/api/v1/products'
          qs:
            page: '{{ $randomInt(1, 5) }}'
            limit: 20
      - get:
          url: '/api/v1/products/{{ $randomString() }}'
      - get:
          url: '/api/v1/categories'
```

### Benchmark Tests

```typescript
// __tests__/performance/benchmark.test.ts
import { describe, it, expect } from '@jest/globals';
import { performance } from 'perf_hooks';
import request from 'supertest';
import { app } from '../../src/app';

describe('Performance Benchmarks', () => {
  it('should handle product list request within 200ms', async () => {
    const start = performance.now();
    
    const response = await request(app)
      .get('/api/v1/products')
      .expect(200);
    
    const end = performance.now();
    const responseTime = end - start;
    
    expect(responseTime).toBeLessThan(200);
    expect(response.body.data.items).toBeDefined();
  });

  it('should handle concurrent requests efficiently', async () => {
    const concurrentRequests = 50;
    const start = performance.now();
    
    const promises = Array.from({ length: concurrentRequests }, () =>
      request(app).get('/api/v1/products').expect(200)
    );
    
    const responses = await Promise.all(promises);
    const end = performance.now();
    const totalTime = end - start;
    const avgResponseTime = totalTime / concurrentRequests;
    
    expect(avgResponseTime).toBeLessThan(500);
    expect(responses).toHaveLength(concurrentRequests);
  });
});
```

## Security Testing

### Authentication Tests

```typescript
// __tests__/security/auth-security.test.ts
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';
import { JwtTokenProvider } from '../../src/infrastructure/security/JwtTokenProvider';

describe('Security - Authentication', () => {
  const jwtProvider = new JwtTokenProvider();

  it('should reject requests without authentication token', async () => {
    await request(app)
      .get('/api/v1/users/profile')
      .expect(401);
  });

  it('should reject requests with invalid token', async () => {
    await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('should reject requests with expired token', async () => {
    // Create expired token
    const expiredToken = 'expired.jwt.token';
    
    await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('should prevent JWT token tampering', async () => {
    const validToken = 'valid.jwt.token';
    const tamperedToken = validToken.slice(0, -10) + 'tampered123';
    
    await request(app)
      .get('/api/v1/users/profile')
      .set('Authorization', `Bearer ${tamperedToken}`)
      .expect(401);
  });
});
```

### Input Validation Tests

```typescript
// __tests__/security/input-validation.test.ts
import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import { app } from '../../src/app';

describe('Security - Input Validation', () => {
  it('should prevent SQL injection attempts', async () => {
    const maliciousInput = "'; DROP TABLE users; --";
    
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: maliciousInput,
        password: 'password'
      })
      .expect(422);
    
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should prevent XSS attacks in input fields', async () => {
    const xssPayload = '<script>alert("XSS")</script>';
    
    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: xssPayload,
        description: 'Test product',
        price: 99.99,
        category: 'Test',
        stockQuantity: 10
      })
      .expect(422);
    
    expect(response.body.error.details).toContainEqual(
      expect.objectContaining({
        field: 'name',
        message: expect.stringContaining('Invalid characters')
      })
    );
  });

  it('should enforce request size limits', async () => {
    const largePayload = 'x'.repeat(1024 * 1024 * 2); // 2MB
    
    await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Test Product',
        description: largePayload,
        price: 99.99,
        category: 'Test',
        stockQuantity: 10
      })
      .expect(413); // Payload Too Large
  });
});
```

## Test Utilities y Helpers

### Database Helpers

```typescript
// __tests__/helpers/database.ts
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

export async function setupTestDatabase(): Promise<void> {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}

export async function clearTestDatabase(): Promise<void> {
  if (mongoose.connection.db) {
    await mongoose.connection.db.dropDatabase();
  }
}

export async function teardownTestDatabase(): Promise<void> {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}

export async function createTestProducts(count: number, overrides: Partial<any> = {}) {
  const products = [];
  for (let i = 0; i < count; i++) {
    const product = new Product(
      `Test Product ${i + 1}`,
      `Description for product ${i + 1}`,
      99.99 + i,
      overrides.category || 'Electronics',
      10 + i,
      ...overrides
    );
    products.push(await productRepository.save(product));
  }
  return products;
}
```

### Authentication Helpers

```typescript
// __tests__/helpers/auth.ts
import { User, UserRole } from '../../src/domain/user/User';
import { JwtTokenProvider } from '../../src/infrastructure/security/JwtTokenProvider';

const jwtProvider = new JwtTokenProvider();

export async function createTestUser(overrides: Partial<any> = {}): Promise<User> {
  const user = new User(
    overrides.email || `test-${Date.now()}@example.com`,
    overrides.firstName || 'Test',
    overrides.lastName || 'User',
    'hashedPassword123',
    overrides.roles || [UserRole.USER]
  );
  
  return await userRepository.save(user);
}

export function generateAuthToken(user: User): string {
  const tokens = jwtProvider.generateTokens(user);
  return tokens.accessToken;
}

export async function createAuthenticatedUser(roles: UserRole[] = [UserRole.USER]) {
  const user = await createTestUser({ roles });
  const token = generateAuthToken(user);
  return { user, token };
}
```

### Mock Factories

```typescript
// __tests__/helpers/factories.ts
import { Product } from '../../src/domain/product/Product';
import { User, UserRole } from '../../src/domain/user/User';

export class ProductFactory {
  static create(overrides: Partial<any> = {}): Product {
    return new Product(
      overrides.name || 'Default Product',
      overrides.description || 'Default description',
      overrides.price || 99.99,
      overrides.category || 'Electronics',
      overrides.stockQuantity || 10
    );
  }

  static createMany(count: number, overrides: Partial<any> = {}): Product[] {
    return Array.from({ length: count }, (_, i) =>
      this.create({
        name: `Product ${i + 1}`,
        ...overrides
      })
    );
  }
}

export class UserFactory {
  static create(overrides: Partial<any> = {}): User {
    return new User(
      overrides.email || `user-${Date.now()}@example.com`,
      overrides.firstName || 'John',
      overrides.lastName || 'Doe',
      'hashedPassword123',
      overrides.roles || [UserRole.USER]
    );
  }

  static createAdmin(overrides: Partial<any> = {}): User {
    return this.create({
      roles: [UserRole.ADMIN, UserRole.USER],
      ...overrides
    });
  }
}
```

## Test Data Management

### Fixtures

```typescript
// __tests__/fixtures/products.ts
export const productFixtures = {
  gaming_laptop: {
    name: 'Gaming Laptop Pro',
    description: 'High-performance gaming laptop with RTX 4070',
    price: 1299.99,
    category: 'Electronics',
    stockQuantity: 15
  },
  wireless_mouse: {
    name: 'Wireless Gaming Mouse',
    description: 'Precision wireless mouse with RGB lighting',
    price: 79.99,
    category: 'Accessories',
    stockQuantity: 50
  },
  mechanical_keyboard: {
    name: 'Mechanical Keyboard',
    description: 'Cherry MX Blue switches mechanical keyboard',
    price: 149.99,
    category: 'Accessories',
    stockQuantity: 25
  }
};

export const userFixtures = {
  admin_user: {
    email: 'admin@techshop.com',
    firstName: 'Admin',
    lastName: 'User',
    roles: [UserRole.ADMIN, UserRole.USER]
  },
  regular_user: {
    email: 'user@example.com',
    firstName: 'Regular',
    lastName: 'User',
    roles: [UserRole.USER]
  },
  provider_user: {
    email: 'provider@techshop.com',
    firstName: 'Provider',
    lastName: 'User',
    roles: [UserRole.PROVIDER, UserRole.USER]
  }
};
```

## Continuous Integration

### GitHub Actions Test Workflow

```yaml
# .github/workflows/test.yml
name: Test Suite

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x, 20.x]

    services:
      mongodb:
        image: mongo:6.0
        ports:
          - 27017:27017
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
    - uses: actions/checkout@v4

    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v4
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Run linting
      run: npm run lint

    - name: Run type checking
      run: npm run type-check

    - name: Run unit tests
      run: npm run test:unit
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/techshop_test
        REDIS_URL: redis://localhost:6379

    - name: Run integration tests
      run: npm run test:integration
      env:
        NODE_ENV: test
        MONGODB_URI: mongodb://localhost:27017/techshop_test
        REDIS_URL: redis://localhost:6379

    - name: Run E2E tests
      run: npm run test:e2e
      env:
        NODE_ENV: test

    - name: Generate coverage report
      run: npm run test:coverage

    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3
      with:
        file: ./coverage/lcov.info
        flags: unittests
        name: codecov-umbrella

    - name: Check coverage threshold
      run: npm run coverage:check
```

## Scripts de Testing

### Package.json Scripts

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:e2e": "playwright test",
    "test:e2e:headed": "playwright test --headed",
    "test:performance": "artillery run artillery/load-test.yml",
    "test:security": "jest --testPathPattern=security",
    "coverage:check": "jest --coverage --coverageThreshold='{\"global\":{\"branches\":80,\"functions\":80,\"lines\":80,\"statements\":80}}'",
    "test:ci": "npm run test:unit && npm run test:integration && npm run test:e2e",
    "test:debug": "jest --runInBand --no-cache --detectOpenHandles",
    "test:mutation": "stryker run"
  }
}
```

## Quality Gates

### Cobertura de Código

Requisitos mínimos:
- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Métricas de Calidad

- **Test Execution Time**: < 30 segundos para unit tests
- **Test Reliability**: > 99% success rate
- **Code Coverage**: > 80% en todas las métricas
- **Mutation Testing**: > 70% mutation score

### Reporting

```bash
# Generar reporte completo
npm run test:coverage

# Ver reporte HTML
open coverage/lcov-report/index.html

# Generar reporte de métricas
npm run test:metrics

# Reporte de performance
npm run test:performance -- --output performance-report.json
```

## Best Practices

### Naming Conventions

```typescript
// Test file naming
ProductService.test.ts          // Unit tests
ProductAPI.integration.test.ts  // Integration tests
UserFlow.e2e.spec.ts           // E2E tests

// Test description
describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create product with valid data', () => {
      // Test implementation
    });
    
    it('should throw error when price is negative', () => {
      // Test implementation
    });
  });
});
```

### Test Organization

1. **Arrange**: Setup test data and conditions
2. **Act**: Execute the code under test
3. **Assert**: Verify the expected outcome
4. **Cleanup**: Reset state if necessary

### Error Testing

```typescript
it('should handle database connection errors gracefully', async () => {
  // Arrange
  jest.spyOn(mongoose, 'connect').mockRejectedValue(new Error('Connection failed'));
  
  // Act & Assert
  await expect(repository.findById('123')).rejects.toThrow('Connection failed');
});
```

### Async Testing

```typescript
it('should handle async operations correctly', async () => {
  // Use async/await for promises
  const result = await service.asyncOperation();
  expect(result).toBeDefined();
  
  // Or use resolves/rejects matchers
  await expect(service.asyncOperation()).resolves.toBe(expectedValue);
  await expect(service.failingOperation()).rejects.toThrow();
});
```

Esta estrategia de testing asegura la calidad y confiabilidad del código en TechShop Cloud, proporcionando cobertura completa desde units tests hasta E2E testing con herramientas modernas y best practices.!');
    await page.fill('[data-testid="firstName-input"]', 'Test');
    await page.fill('[data-testid="lastName-input"]', 'User');
    await page.click('[data-testid="submit-registration"]');

    // Verify registration success
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Registration successful');

    // Login
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    await page.fill('[data-testid="password-input"]', 'TestPassword123