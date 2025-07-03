# TechShop Cloud - Diseño del Dominio

##  Domain-Driven Design (DDD)

TechShop Cloud implementa DDD para mantener la complejidad del negocio organizada y expresiva a través del código.

## 🗺️ Context Map

```
┌─────────────────────────────────────────────────────────┐
│                  TechShop Cloud Domain                   │
│                                                         │
│  ┌─────────────────┐    ┌─────────────────┐           │
│  │   User Context  │────│Product Context  │           │
│  │                 │    │                 │           │
│  │ - Authentication│    │ - Catalog       │           │
│  │ - Authorization │    │ - Inventory     │           │
│  │ - User Profile  │    │ - Categories    │           │
│  └─────────────────┘    └─────────────────┘           │
│           │                       │                   │
│           │              ┌─────────────────┐           │
│           └──────────────│ Order Context   │           │
│                          │                 │           │
│                          │ - Shopping Cart │           │
│                          │ - Checkout      │           │
│                          │ - Order Mgmt    │           │
│                          └─────────────────┘           │
└─────────────────────────────────────────────────────────┘
```

##  Ubiquitous Language

### Términos del Dominio

| Término | Definición | Contexto |
|---------|------------|----------|
| **Product** | Artículo tecnológico disponible para venta | Catalog |
| **User** | Persona que interactúa con la plataforma | Authentication |
| **Customer** | Usuario que realiza compras | Order |
| **Provider** | Usuario que gestiona productos | Catalog |
| **Admin** | Usuario con permisos administrativos | System |
| **Stock** | Cantidad disponible de un producto | Inventory |
| **Category** | Clasificación de productos | Catalog |
| **Order** | Solicitud de compra de productos | Order |
| **Cart** | Contenedor temporal de productos | Order |

##  Bounded Contexts

### 1. User Management Context

**Responsabilidad**: Gestión de usuarios y seguridad

**Entidades**:
- `User`: Usuario del sistema
- `Role`: Rol de usuario
- `Session`: Sesión activa

**Value Objects**:
- `Email`: Dirección de correo válida
- `Password`: Contraseña encriptada
- `UserRole`: Enumeración de roles

**Domain Services**:
- `AuthenticationService`: Autenticación de usuarios
- `AuthorizationService`: Control de acceso

**Repository Interfaces**:
- `UserRepository`: Persistencia de usuarios
- `SessionRepository`: Gestión de sesiones

### 2. Product Catalog Context

**Responsabilidad**: Gestión del catálogo de productos

**Entidades**:
- `Product`: Producto tecnológico
- `Category`: Categoría de productos

**Value Objects**:
- `Money`: Precio con validaciones
- `ProductName`: Nombre con restricciones
- `SKU`: Código único de producto
- `StockQuantity`: Cantidad en inventario

**Domain Services**:
- `PricingService`: Cálculo de precios
- `InventoryService`: Gestión de stock

**Repository Interfaces**:
- `ProductRepository`: Persistencia de productos
- `CategoryRepository`: Gestión de categorías

### 3. Order Management Context

**Responsabilidad**: Gestión de pedidos y carrito

**Entidades**:
- `Order`: Pedido de compra
- `OrderItem`: Artículo en pedido
- `ShoppingCart`: Carrito de compras

**Value Objects**:
- `OrderStatus`: Estado del pedido
- `PaymentMethod`: Método de pago
- `ShippingAddress`: Dirección de envío

**Domain Services**:
- `OrderService`: Lógica de pedidos
- `PaymentService`: Procesamiento de pagos

##  Aggregate Design

### User Aggregate

```typescript
class User {
  // Aggregate Root
  private readonly _id: string;
  private _email: Email;
  private _firstName: string;
  private _lastName: string;
  private _passwordHash: string;
  private _roles: UserRole[];
  private _active: boolean;
  private _emailVerified: boolean;
  private _failedLoginAttempts: number;
  private _lockedUntil: Date | null;
  private _lastLoginAt: Date | null;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Business Rules
  public recordSuccessfulLogin(): void
  public recordFailedLogin(): void
  public lockAccount(): void
  public unlockAccount(): void
  public changePassword(newPassword: string): void
  public updateProfile(firstName: string, lastName: string): void
  public verifyEmail(): void
  public hasRole(role: UserRole): boolean
  public canLogin(): boolean
}
```

**Invariantes**:
- Un usuario debe tener al menos un rol
- Email debe ser único en el sistema
- Después de 5 intentos fallidos, la cuenta se bloquea
- Solo usuarios verificados pueden hacer pedidos

### Product Aggregate

```typescript
class Product {
  // Aggregate Root
  private readonly _id: string;
  private _name: string;
  private _description: string;
  private _price: Money;
  private _category: string;
  private _stockQuantity: number;
  private _active: boolean;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Business Rules
  public hasStock(): boolean
  public decreaseStock(quantity: number): void
  public increaseStock(quantity: number): void
  public updatePrice(newPrice: Money): void
  public activate(): void
  public deactivate(): void
  public isExpensive(): boolean
  public calculateDiscountedPrice(percentage: number): Money
}
```

**Invariantes**:
- El precio debe ser mayor que cero
- El stock no puede ser negativo
- Solo productos activos están disponibles para venta
- El nombre del producto debe ser único por categoría

### Order Aggregate

```typescript
class Order {
  // Aggregate Root
  private readonly _id: string;
  private readonly _customerId: string;
  private _items: OrderItem[];
  private _status: OrderStatus;
  private _total: Money;
  private _shippingAddress: ShippingAddress;
  private _paymentMethod: PaymentMethod;
  private _createdAt: Date;
  private _updatedAt: Date;

  // Business Rules
  public addItem(product: Product, quantity: number): void
  public removeItem(productId: string): void
  public updateItemQuantity(productId: string, quantity: number): void
  public calculateTotal(): Money
  public confirm(): void
  public cancel(): void
  public ship(): void
  public complete(): void
}
```

**Invariantes**:
- Un pedido debe tener al menos un artículo
- Solo se pueden modificar pedidos en estado PENDING
- El total debe coincidir con la suma de artículos
- No se puede confirmar un pedido sin dirección de envío

## 🎭 Domain Events

### User Events

```typescript
class UserCreated implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredOn: Date
  ) {}
}

class UserEmailVerified implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly email: string,
    public readonly occurredOn: Date
  ) {}
}

class UserAccountLocked implements DomainEvent {
  constructor(
    public readonly userId: string,
    public readonly reason: string,
    public readonly occurredOn: Date
  ) {}
}
```

### Product Events

```typescript
class ProductCreated implements DomainEvent {
  constructor(
    public readonly productId: string,
    public readonly name: string,
    public readonly category: string,
    public readonly occurredOn: Date
  ) {}
}

class ProductStockChanged implements DomainEvent {
  constructor(
    public readonly productId: string,
    public readonly previousStock: number,
    public readonly newStock: number,
    public readonly occurredOn: Date
  ) {}
}

class ProductPriceChanged implements DomainEvent {
  constructor(
    public readonly productId: string,
    public readonly previousPrice: Money,
    public readonly newPrice: Money,
    public readonly occurredOn: Date
  ) {}
}
```

### Order Events

```typescript
class OrderCreated implements DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly total: Money,
    public readonly occurredOn: Date
  ) {}
}

class OrderConfirmed implements DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly occurredOn: Date
  ) {}
}

class OrderShipped implements DomainEvent {
  constructor(
    public readonly orderId: string,
    public readonly customerId: string,
    public readonly trackingNumber: string,
    public readonly occurredOn: Date
  ) {}
}
```

##  Domain Services

### Authentication Service

```typescript
class AuthenticationService {
  constructor(
    private userRepository: UserRepository,
    private passwordEncoder: PasswordEncoder,
    private jwtProvider: JwtTokenProvider
  ) {}

  async authenticate(email: Email, password: string): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(email);
    
    if (!user || !user.canLogin()) {
      throw new AuthenticationFailedException();
    }

    if (!this.passwordEncoder.verify(password, user.passwordHash)) {
      user.recordFailedLogin();
      await this.userRepository.save(user);
      throw new AuthenticationFailedException();
    }

    user.recordSuccessfulLogin();
    await this.userRepository.save(user);

    return new AuthResult(
      this.jwtProvider.generateTokens(user),
      user.toDTO()
    );
  }
}
```

### Pricing Service

```typescript
class PricingService {
  calculatePrice(product: Product, quantity: number): Money {
    let basePrice = product.price.multiply(quantity);
    
    // Apply volume discounts
    if (quantity >= 10) {
      basePrice = basePrice.multiply(0.9); // 10% discount
    }
    
    // Apply category-specific rules
    if (product.category === 'Electronics') {
      basePrice = this.applyElectronicsDiscount(basePrice);
    }
    
    return basePrice;
  }

  private applyElectronicsDiscount(price: Money): Money {
    // Complex pricing logic for electronics
    return price;
  }
}
```

### Inventory Service

```typescript
class InventoryService {
  constructor(
    private productRepository: ProductRepository,
    private eventBus: EventBus
  ) {}

  async reserveStock(productId: string, quantity: number): Promise<void> {
    const product = await this.productRepository.findById(productId);
    
    if (!product) {
      throw new ProductNotFoundException(productId);
    }

    if (!product.hasStock() || product.stockQuantity < quantity) {
      throw new InsufficientStockException(productId, quantity);
    }

    product.decreaseStock(quantity);
    await this.productRepository.save(product);

    // Emit event for notifications
    this.eventBus.publish(new ProductStockChanged(
      productId,
      product.stockQuantity + quantity,
      product.stockQuantity,
      new Date()
    ));
  }
}
```

## 🏭 Factories

### User Factory

```typescript
class UserFactory {
  static createUser(
    email: string,
    firstName: string,
    lastName: string,
    password: string,
    roles: UserRole[] = [UserRole.USER]
  ): User {
    // Validate input
    const emailVO = new Email(email);
    const hashedPassword = PasswordEncoder.hash(password);
    
    // Create user with business rules
    return new User(
      emailVO.value,
      firstName,
      lastName,
      hashedPassword,
      roles
    );
  }

  static createAdminUser(
    email: string,
    firstName: string,
    lastName: string,
    password: string
  ): User {
    return this.createUser(
      email,
      firstName,
      lastName,
      password,
      [UserRole.ADMIN, UserRole.USER]
    );
  }
}
```

### Product Factory

```typescript
class ProductFactory {
  static createProduct(
    name: string,
    description: string,
    price: number,
    category: string,
    initialStock: number = 0
  ): Product {
    // Validate business rules
    if (price <= 0) {
      throw new InvalidPriceException('Price must be greater than zero');
    }

    if (initialStock < 0) {
      throw new InvalidStockException('Initial stock cannot be negative');
    }

    return new Product(
      name.trim(),
      description.trim(),
      price,
      category.trim(),
      initialStock
    );
  }

  static createFromImport(importData: ProductImportDTO): Product {
    // Handle product import with validation
    return this.createProduct(
      importData.name,
      importData.description,
      importData.price,
      importData.category,
      importData.stock
    );
  }
}
```

##  Value Objects

### Money Value Object

```typescript
class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: string = 'USD'
  ) {
    if (amount < 0) {
      throw new Error('Money amount cannot be negative');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('Currency must be a valid 3-letter code');
    }
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  public multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  private ensureSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new Error('Cannot operate on different currencies');
    }
  }
}
```

### Email Value Object

```typescript
class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  constructor(private readonly _value: string) {
    if (!this.isValid(_value)) {
      throw new Error('Invalid email format');
    }
  }

  get value(): string {
    return this._value;
  }

  private isValid(email: string): boolean {
    return Email.EMAIL_REGEX.test(email);
  }

  public equals(other: Email): boolean {
    return this._value === other._value;
  }
}
```

##  Business Rules Engine

### Rule Interface

```typescript
interface BusinessRule<T> {
  evaluate(entity: T): boolean;
  getMessage(): string;
}
```

### User Business Rules

```typescript
class UserMustHaveValidEmail implements BusinessRule<User> {
  evaluate(user: User): boolean {
    return user.email && user.email.length > 0;
  }

  getMessage(): string {
    return 'User must have a valid email address';
  }
}

class UserAccountMustNotBeExpired implements BusinessRule<User> {
  evaluate(user: User): boolean {
    // Check if account is not expired
    return user.isActive && !user.isAccountExpired();
  }

  getMessage(): string {
    return 'User account must not be expired';
  }
}
```

### Product Business Rules

```typescript
class ProductMustHavePositivePrice implements BusinessRule<Product> {
  evaluate(product: Product): boolean {
    return product.price > 0;
  }

  getMessage(): string {
    return 'Product price must be greater than zero';
  }
}

class ProductNameMustBeUnique implements BusinessRule<Product> {
  constructor(private productRepository: ProductRepository) {}

  async evaluate(product: Product): Promise<boolean> {
    const existing = await this.productRepository.findByName(product.name);
    return !existing || existing.id === product.id;
  }

  getMessage(): string {
    return 'Product name must be unique';
  }
}
```

##  Domain Event Handling

### Event Bus

```typescript
interface EventBus {
  publish(event: DomainEvent): void;
  subscribe<T extends DomainEvent>(
    eventType: new (...args: any[]) => T,
    handler: EventHandler<T>
  ): void;
}

interface EventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}
```

### Event Handlers

```typescript
class UserCreatedHandler implements EventHandler<UserCreated> {
  constructor(
    private emailService: EmailService,
    private auditService: AuditService
  ) {}

  async handle(event: UserCreated): Promise<void> {
    // Send welcome email
    await this.emailService.sendWelcomeEmail(event.email);
    
    // Log for audit
    await this.auditService.logUserCreation(event.userId);
  }
}

class ProductStockChangedHandler implements EventHandler<ProductStockChanged> {
  constructor(
    private notificationService: NotificationService,
    private analyticsService: AnalyticsService
  ) {}

  async handle(event: ProductStockChanged): Promise<void> {
    // Check for low stock alert
    if (event.newStock < 5) {
      await this.notificationService.sendLowStockAlert(event.productId);
    }
    
    // Track inventory metrics
    await this.analyticsService.trackStockChange(event);
  }
}
```

##  Domain Evolution Strategy

### Versioning Strategy

1. **Backward Compatibility**: Mantener APIs existentes
2. **Event Versioning**: Versionado de eventos de dominio
3. **Schema Evolution**: Migración gradual de esquemas
4. **Feature Flags**: Activación gradual de funcionalidades

### Migration Patterns

```typescript
class DomainMigrationService {
  async migrateUserV1ToV2(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    
    // Apply V2 business rules
    if (!user.hasRequiredFields()) {
      user.setDefaultValues();
    }
    
    // Update version
    user.markAsVersion(2);
    await this.userRepository.save(user);
  }
}
```

##  Próximos Pasos del Dominio

### Fase Actual (Core Domain)
- [x] User y Product aggregates
- [x] Autenticación y autorización
- [x] Validaciones de negocio básicas
- [ ] Order aggregate completo

### Fase 2 (Rich Domain)
- [ ] Complex business rules
- [ ] Domain events completos
- [ ] Advanced pricing strategies
- [ ] Inventory management avanzado

### Fase 3 (Domain Services)
- [ ] Recommendation engine
- [ ] Fraud detection
- [ ] Analytics y reporting
- [ ] Multi-tenant support

---

Este diseño de dominio proporciona una base sólida que puede evolucionar con las necesidades del negocio, manteniendo la complejidad organizada y el código expresivo.