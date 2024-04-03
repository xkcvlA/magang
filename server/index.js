const express = require('express');
const app = express();
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser'); 
const { shifts, getStatus } = require('./shifts');
const axios = require('axios');

// Configuration for your SQL Server connection
const config = {
  user: 'SA',
  password: 'a.mle_21',
  server: 'localhost',    // Change this to your SQL Server hostname
  port: 1433,             // Change this to your SQL Server port
  database: 'testDB',     // Change this to your database name
  options: {
    encrypt: false,       // Change to true if you're using Azure SQL Database
    trustServerCertificate: false // Change to true if you're using Azure SQL Database
  }
};

var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
}

app.use(allowCrossDomain);
app.use(cors());
app.use(bodyParser.json());

// Define a route to fetch data from the SQL table and send it as JSON
// app.get('/getData', async (req, res) => {
//   try {
//     // Connect to SQL Server
//     const pool = await sql.connect(config);

//     // Execute SQL query to fetch data from the table
//     const result = await pool.request().query('SELECT * FROM EmpDet');

//     // Send the fetched data as JSON response
//     res.json(result.recordset);
//   } catch (error) {
//     console.error("Error executing SQL query:", error);
//     res.status(500).send("Error fetching data");
//   }
// });

// Route to check status
app.post('/checkStatus', async (req, res) => {
  try {
    const { data } = req.body;
    console.log('Received data:', data);

    if (req.body.data) {
      const datashift = "shift" + data;
      const theshift = shifts[datashift];
      let myshift = getStatus(theshift);
      res.json(myshift);
    } else {
      res.status(400).json({ error: 'Data not provided' });
    }
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/aaaaa', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:4444/check');
    const CTime = response.data.current_time;
    // Do whatever you want with the currentTime
    res.get(CTime);
    console.log('curet: ', CTime);
  } catch (error) {
    res.status(500).send('Error Accessing Flask route');
  }
});


// Route to save recognition data to SQL database
app.post('/recognize', async (req, res) => {
  const { empID, status } = req.body;
  // const time = Ctime;

  try {
    // Connect to SQL Server
    const pool = await sql.connect(config);

    // Format the currentTime string into a JavaScript Date object
    const currentDate = new Date();

    const options = {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    };

    // Extract the date and time components separately
    const date = currentDate.toLocaleDateString(undefined, options); // Extract date component
    console.log("aaa: ", date);
    const time = currentDate.toLocaleTimeString('en-US', { hour12: false }); // Extract time component
    console.log("aaa: ", time);

    // Execute SQL query to insert recognition data into the database
    await pool.request()
      .input('EmpID', sql.VarChar, empID)
      .input('status', sql.VarChar, status)
      .input('date', sql.Date, date) // Insert date component into separate column
      .input('time', sql.Time, time) // Insert time component into separate column
      .query('INSERT INTO ShiftAct (EmpID, status, date, time) VALUES (@empID, @status, @date, @time)');

    res.send('Recognition data saved successfully');
  } catch (error) {
    console.error('Error saving recognition data:', error);
    res.status(500).send('Error saving recognition data');
  }
});

// Start the Express server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
