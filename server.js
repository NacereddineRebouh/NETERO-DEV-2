//Connect to express server and MongoDB server

const express= require('express');

const app=express();

// const connectDB=require('./config/db');
//Connect to the database ,using a method created in db.js 
// connectDB();

app.get('/', (req, res) => res.send('API running'));

const PORT =process.env.PORT || 5000;

app.listen(PORT, () => console.log("server started on port"+PORT));
