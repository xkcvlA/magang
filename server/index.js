const express = require('express');
const app = express();
const cors = require('cors');
const sql = require('mssql');
<<<<<<< HEAD
const bodyParser = require('body-parser');
const { shifts, getStatus } = require('./shifts');
const axios = require('axios');
const moment = require('moment-timezone');
=======
const bodyParser = require('body-parser'); 
const {shifts, getStatus}= require('./shifts');

>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe

// Configuration for your SQL Server connection
const config = {
  user: 'SA',
  password: 'a.mle_21',
  server: '10.41.36.133',    // Change this to your SQL Server hostname
  port: 1433,             // Change this to your SQL Server port
<<<<<<< HEAD
  database: 'testDB',     // Change this to your database name
=======
  database: 'testDB', // Change this to your database name
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
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

<<<<<<< HEAD
app.use(allowCrossDomain);
app.use(cors());
app.use(bodyParser.json());

// Define a route to fetch data from the SQL table and send it as JSON
app.get('/getData', async (req, res) => {
  try {
    // Connect to SQL Server
    const pool = await sql.connect(config);

    // Execute SQL query to fetch data from the table
    const result = await pool.request().query('SELECT * FROM EmpDet');

    // Send the fetched data as JSON response
    res.json(result.recordset);
  } catch (error) {
    console.error("Error executing SQL query:", error);
    res.status(500).send("Error fetching data");
  }
});

let myshift;
// Route to check status
app.post('/checkStatus', async (req, res) => {
  try {
    const { data } = req.body;
    console.log('Received data:', data);

    if (req.body.data) {
      const datashift = "shift" + data;
      const theshift = shifts[datashift];
      myshift = getStatus(theshift);
      res.json(myshift);
    } else {
      res.status(400).json({ error: 'Data not provided' });
    }
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const { Readable } = require('stream');

// Variable to store current time
let currentTimeFromSSE;

// Make GET request to Flask SSE endpoint
axios.get('http://127.0.0.1:4444/check', { responseType: 'stream' })
    .then(response => {
        const readableStream = response.data;

        // Event listener for 'data' event
        readableStream.on('data', chunk => {
            const data = chunk.toString('utf8').trim(); // Convert buffer to string and remove whitespace
            const nameIndex = data.split(" , "); 
            const time = nameIndex[1];
            currentTimeFromSSE = time;
            // console.log('Received SSE data:', time);
            // Process the SSE data as needed
        });

        // Event listener for 'end' event
        readableStream.on('end', () => {
            console.log('End of SSE stream');
        });
    })
    .catch(error => {
        console.error('Error fetching SSE data from Flask:', error);
        // Handle errors as needed
    });

// Route to save recognition data to SQL database
app.post('/recognize', async (req, res) => {

  try {
    // Connect to SQL Server
    const pool = await sql.connect(config);

    // Extract the empID and myshift from the request body
    const { empID } = req.body;
    console.log("sts: ", myshift);
    // const options = {
    //   year: 'numeric',
    //   month: 'numeric',
    //   day: 'numeric'
    // };

    // Extract the date and time components separately
    const date = moment().tz('Asia/Jakarta').format('YYYY-MM-DD'); // Extract date component in Indonesia timezone
    console.log("date: ", date);
    // Convert time string to a JavaScript Date object
    const timeParts = currentTimeFromSSE.split(':');
    const time = moment().tz('Asia/Jakarta').set({ // Convert current time to Indonesia timezone
      hour: parseInt(timeParts[0], 10),
      minute: parseInt(timeParts[1], 10),
      second: parseInt(timeParts[2], 10)
    }).format('HH:mm:ss');
    console.log("time: ", time); // Use the stored time variable

    // Execute SQL query to insert recognition data into the database
    await pool.request()
      .input('EmpID', sql.VarChar, empID)
      .input('myshift', sql.VarChar, myshift)
      .input('date', sql.Date, date) // Insert date component into separate column
      .input('time', sql.VarChar, time) // Insert time component into separate column
      .query('INSERT INTO ShiftAct (EmpID, status, date, time) VALUES (@empID, @myshift, @date, @time)');

    res.send('Recognition data saved successfully');
  } catch (error) {
    console.error('Error saving recognition data:', error);
    res.status(500).send('Error saving recognition data');
  }
=======
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
      // console.log(data);
 }
 catch(error) {
      console.error("error executing: ", error);
      res.status(500).send("error fetching data");
 }
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
});

// Start the Express server
const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
<<<<<<< HEAD
=======

app.use(cors());
app.use(bodyParser.json());
app.post('/checkStatus', async (req, res) => {
  try {
        const { data } = req.body;
        console.log('Received data:', data);
        // res.json({ message: 'Data received and processed successfully' });
        if(req.body.data){
              const datashift = "shift" + data
              const theshift = shifts[datashift];
              // console.log("the", datashift, theshift)
              let myshift = getStatus(theshift); 
              // console.log(myshift);
              res.json(myshift);
              // app.get('/yea', (req, res)=>{
              //       res.json(myshift);
              //       console.log("ta", myshift)
                    
                     
              // });
                 
        }
        myshift="";
        // console.log("boo", myshift)
        req.body.data= ''; 
        
        
      } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
         }
  });
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
