const express = require('express');
const app = express();

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Funciona limpio' });
});

app.listen(3000, () => console.log('Test server en http://localhost:3000'));
