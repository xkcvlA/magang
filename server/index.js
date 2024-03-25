const express = require('express');
const app = express();
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser'); 
const {shifts, getStatus}= require('./shifts');
const theshift = shifts['shift1'];
const {PythonShell} = require('python-shell');

// Configuration for your SQL Server connection
const config = {
  user: 'SA',
  password: 'a.mle_21',
  server: 'localhost',    // Change this to your SQL Server hostname
  port: 1433,             // Change this to your SQL Server port
  database: 'master', // Change this to your database name
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

// Define a route to fetch data from the SQL table and store it in a variable
app.get('/getData', async(req, res) => {
 try {
      //connection
      const pool = await sql.connect(config);
      //query
      const result = await pool.request().query('SELECT * FROM frfr');
      //store data
      const data = result.recordset;
      //send as json
      res.json(data);
      console.log("tes: ",data);
 }
 catch(error) {
      console.error("error executing: ", error);
      res.status(500).send("error fetching data");
 }
});

// Start the Express server
app.listen(8080, () => {
  console.log("server listening on port 8080");
});

app.use(cors({
      origin: 'http://localhost:3000'
}));

app.get('/', (req, res) => {
      res.send('Hello from our server!')
});

app.use(cors());
app.use(bodyParser.json());
app.post('/checkStatus', (req, res) => {
  try {
        const { data } = req.body;
        console.log('Received data:', data);
        res.json({ message: 'Data received and processed successfully' });
        if(req.body.data){
              app.get('/yea', async(req, res)=>{
                    let alalal = getStatus(theshift); 
                    res.json(alalal);
                    alalal="";
              });
              req.body.data= '';
              
        }
        
      } catch (error) {
        console.error('Error checking status:', error);
        res.status(500).json({ error: 'Internal Server Error' }); // Send an error response
         }
  });