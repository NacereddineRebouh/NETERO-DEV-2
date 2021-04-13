//Connect to express server and MongoDB server

const express = require("express");

const app = express();

const connectDB = require("./config/db");
//Connect to the database ,using a method created in db.js
connectDB();

app.use(express.json({ extended: false })); //will allows us to get the data in req.body in user.js

// app.get('/', (req, res) => res.send('API running'));

app.use("/api/users", require("./routes/api/users"));
app.use("/api/posts", require("./routes/api/posts"));
app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/profile", require("./routes/api/profile"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log("server started on port" + PORT));
