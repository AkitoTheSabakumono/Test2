const express = require('express');
const path = require('path');
const app = express();

// Serve the js folder
app.use('/js', express.static(path.join(__dirname, 'js')));

// Serve HTML files in the root
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
