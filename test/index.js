const express = require("express");
const {join} = require("path");

require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(join(__dirname, "public")));

app.get("/greet", (req, res) => {
    res.json({message: "Hello! This is a simple API example using Express."});
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
