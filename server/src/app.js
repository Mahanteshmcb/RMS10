// Entry point for the backend application

const express = require('express');
const app = express();

app.use(express.json());

// TODO: register routes and middleware

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});