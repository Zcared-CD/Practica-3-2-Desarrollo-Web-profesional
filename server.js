
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;


app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.use((req, res) => {
    res.status(404).send('Recurso no encontrado en el servidor.');
});

// Inicio del servidor
app.listen(PORT, () => {
    console.log('\x1b[32m%s\x1b[0m', `[SERVIDOR OK] -> Corriendo en http://localhost:${PORT}`);
    console.log(`\x1b[36m%s\x1b[0m`, `Corriendo Todo Carlos`);
    console.log(`Presiona Ctrl+C para detener.`);
});