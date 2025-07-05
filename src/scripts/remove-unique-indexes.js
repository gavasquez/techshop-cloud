const mongoose = require('mongoose');

async function removeUniqueIndexes() {
  try {
    // Conectar a MongoDB Atlas
    await mongoose.connect('mongodb+srv://root:Control.21@micluster.coktd81.mongodb.net/tech', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');

    // Obtener las colecciones
    const db = mongoose.connection.db;
    
    // Lista de colecciones que pueden tener índices únicos problemáticos
    const collections = ['payments', 'notifications', 'orders', 'products', 'cartitems'];
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        
        // Obtener todos los índices
        const indexes = await collection.indexes();
        console.log(`\nIndexes for ${collectionName}:`, indexes.map(idx => idx.name));
        
        // Buscar y eliminar índices únicos en el campo 'id'
        for (const index of indexes) {
          if (index.name === 'id_1' || (index.key && index.key.id === 1 && index.unique)) {
            console.log(`Removing unique index on 'id' field for ${collectionName}: ${index.name}`);
            await collection.dropIndex(index.name);
          }
        }
        
        console.log(`✅ Processed ${collectionName}`);
      } catch (error) {
        console.log(`⚠️ Error processing ${collectionName}:`, error.message);
      }
    }

    console.log('\n✅ All unique indexes on "id" field have been removed');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Ejecutar el script
removeUniqueIndexes(); 