const express = require('express');
const app = express();

// Serve all static files in the current folder
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
