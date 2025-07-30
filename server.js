const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.static('public'));

let precautions = {};
fs.readFile('./data.json', 'utf8', (err, data) => {
  if (!err) {
    precautions = JSON.parse(data);
    console.log("Precautions data loaded.");
  } else {
    console.error("Error reading data.json:", err);
  }
});

app.get('/api/precautions/:city', (req, res) => {
  const city = req.params.city.toLowerCase();
  const message = precautions[city];
  if (message) {
    res.json({ city, precautions: message });
  } else {
    res.status(404).json({ error: "No precautions found for this location." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});