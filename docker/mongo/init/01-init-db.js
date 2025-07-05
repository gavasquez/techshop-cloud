// ========================================
// TechShop Cloud - MongoDB Initialization
// Script de inicialización de la base de datos
// ========================================

// Conectar a la base de datos admin
db = db.getSiblingDB('admin');

// Crear usuario administrador si no existe
if (!db.getUser("admin")) {
    db.createUser({
        user: "admin",
        pwd: "password", // Cambiar en producción
        roles: [
            { role: "userAdminAnyDatabase", db: "admin" },
            { role: "readWriteAnyDatabase", db: "admin" },
            { role: "dbAdminAnyDatabase", db: "admin" }
        ]
    });
    print("Usuario administrador creado");
}

// Cambiar a la base de datos de la aplicación
db = db.getSiblingDB('techshop');

// Crear colecciones con validaciones
db.createCollection("users", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["email", "firstName", "lastName", "password"],
            properties: {
                email: {
                    bsonType: "string",
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                },
                firstName: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 50
                },
                lastName: {
                    bsonType: "string",
                    minLength: 2,
                    maxLength: 50
                },
                password: {
                    bsonType: "string",
                    minLength: 8
                }
            }
        }
    }
});

db.createCollection("products", {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "description", "price", "category", "stockQuantity"],
            properties: {
                name: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 100
                },
                price: {
                    bsonType: "number",
                    minimum: 0
                },
                stockQuantity: {
                    bsonType: "int",
                    minimum: 0
                }
            }
        }
    }
});

db.createCollection("orders");
db.createCollection("payments");
db.createCollection("notifications");
db.createCollection("cartitems");

// Crear índices para optimizar consultas
db.users.createIndex({ "email": 1 }, { unique: true });
db.users.createIndex({ "active": 1 });
db.users.createIndex({ "roles": 1 });

db.products.createIndex({ "name": 1 });
db.products.createIndex({ "category": 1 });
db.products.createIndex({ "price": 1 });
db.products.createIndex({ "active": 1 });
db.products.createIndex({ "stockQuantity": 1 });

db.orders.createIndex({ "customerId": 1 });
db.orders.createIndex({ "status": 1 });
db.orders.createIndex({ "createdAt": -1 });

db.payments.createIndex({ "orderId": 1 });
db.payments.createIndex({ "status": 1 });
db.payments.createIndex({ "createdAt": -1 });

db.cartitems.createIndex({ "customerId": 1 });
db.cartitems.createIndex({ "productId": 1 });

db.notifications.createIndex({ "userId": 1 });
db.notifications.createIndex({ "read": 1 });
db.notifications.createIndex({ "createdAt": -1 });

print("Base de datos TechShop inicializada correctamente");
print("Colecciones creadas: users, products, orders, payments, notifications, cartitems");
print("Índices creados para optimizar consultas"); 