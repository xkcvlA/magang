const express = require('express');
const app = express();
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser'); 
const {shifts, getStatus}= require('./shifts');

// Configuration for your SQL Server connection
const config = {
  user: 'SA',
  password: 'a.mle_21',
  server: 'localhost',    // Change this to your SQL Server hostname
  port: 1433,             // Change this to your SQL Server port
  database: 'testDB', // Change this to your database name
  options: {
    encrypt: false,       // Change to true if you're using Azure SQL Database
    trustServerCertificate: false // Change to true if you're using Azure SQL Database
  }
};

// Middleware to parse JSON bodies
app.use(express.json());

// Example route to handle POST requests to insert data into MSSQL database
app.post('/api/saveData', async (req, res) => {
  const { field1, field2, field3, field4 } = req.body;

  try {
    // Create a connection pool
    const pool = await sql.connect(config);

    // Query to insert data into a table
    const result = await pool.request()
      .input('EmpID', sql.VarChar, field1)
      .input('status', sql.VarChar, field2)
      .input('date', sql.Date, field3)
      .input('time', sql.Time, field4)
      .query('INSERT INTO ShiftAct (EmpID, status, date, time) VALUES (@field1, @field2, @field3, @field4)');

    console.log('Data inserted successfully:', result);
    res.sendStatus(200);
  } catch (error) {
    console.error('Error inserting data:', error);
    res.sendStatus(500);
  } finally {
    // Close connection pool
    sql.close();
  }
});

var allowCrossDomain = function(req, res, next) {
      res.header('Access-Control-Allow-Origin', "*");
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      next();
  }
app.use(allowCrossDomain);

// Define a route to fetch data from the SQL table and store it in a variable
app.get('/getData', async(req, res) => {
 try {
      //connection
      const pool = await sql.connect(config);
      //query
      const result = await pool.request().query('SELECT * FROM EmpDet');
      //store data
      const data = result.recordset;
      //send as json
      res.json(data);
      // console.log("tes: ",data);
 }
 catch(error) {
      console.error("error executing: ", error);
      res.status(500).send("error fetching data");
 }
});

app.use(cors());
app.use(bodyParser.json());
app.post('/checkStatus', async (req, res) => {
  try {
        const { data } = req.body;
        console.log('Received data:', data);
        if(req.body.data){
              const datashift = "shift" + data
              const theshift = shifts[datashift];
              let myshift = getStatus(theshift); 
              res.json(myshift);     
        }
        myshift="";
        req.body.data= ''; 
        
        
      } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
         }
  });

// Start the Express server
app.listen(8080, () => {
  console.log("server listening on port 8080");
});