require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const sql = require('mssql');
const bodyParser = require('body-parser');
const moment = require('moment-timezone');

// Configuration for your SQL Server connection
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port: parseInt(process.env.DB_PORT),
  database: process.env.DB_NAME,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true'
  }
};

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.use(cors());
app.use(bodyParser.json());

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

let isProcessing = false; // Flag to indicate if processing is ongoing

app.post('/recognize', async (req, res) => {
  if (isProcessing) {
    console.log('Another request is already being processed. Please try again later.');
    return res.status(409).send('Another request is already being processed. Please try again later.');
  }

  try {
    isProcessing = true; // Set processing flag to true

    console.log('Processing request...');

    const checkQuery = `
      SELECT TOP 1  
          EmpID,
          status,
          CONVERT(varchar, date, 23) AS date,
          CONVERT(varchar, time, 108) AS time
      FROM ShiftAct 
      WHERE EmpID = @EmpID 
      ORDER BY date DESC, time DESC
    `;

    // Connect to SQL Server
    const pool = await sql.connect(config);

    // Extract the empID from the request body
    const { empID } = req.body;

    // Get the current date and time
    const currentDate = moment().tz('Asia/Jakarta');
    const currentTime = currentDate.format('HH:mm:ss');
    const currentDateTime = currentDate.format('YYYY-MM-DD HH:mm:ss');

    // Check for existing "check in" record
    const checkResult = await pool.request()
      .input('EmpID', sql.VarChar, empID)
      .query(checkQuery);
 
    if (checkResult.recordset.length > 0) {
      // console.log(`A "check in" record already exists for employee ID: ${empID}`);
      const firstRow = checkResult.recordset[0];
      const lastCheckInTimestamp = moment(`${firstRow.date} ${firstRow.time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');
      console.log('date: ', currentDate);
      console.log('time-last: ', lastCheckInTimestamp);

      const diffMinutes = Math.abs(currentDate.diff(lastCheckInTimestamp, 'minutes'));
      console.log('minutes', diffMinutes);

      if (firstRow.status === 'check in'){
        console.log('tesd')
        // const firstRow = checkResult.recordset[0];
        // const lastCheckInTimestamp = moment(`${firstRow.date} ${firstRow.time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');
        // console.log('date: ', currentDate);
        // console.log('time-last: ', lastCheckInTimestamp);

        // const diffMinutes = Math.abs(currentDate.diff(lastCheckInTimestamp, 'minutes'));
        // console.log('minutes', diffMinutes);
        if (diffMinutes > 5) {
          const insertCheckInQuery = `
            INSERT INTO ShiftAct (EmpID, status, date, time) 
            VALUES (@EmpID, 'check in', @CurrentDate, @CurrentTime)
          `;
          await pool.request()
            .input('EmpID', sql.VarChar, empID)
            .input('CurrentDate', sql.Date, currentDateTime)
            .input('CurrentTime', sql.VarChar, currentTime) // Define CurrentTime input parameter
            .query(insertCheckInQuery);
  
          return res.send('check in');
        } else if (diffMinutes >= 1 && diffMinutes <= 5) {
            // Insert check out record
            console.log('test')
            const insertCheckOutQuery = `
              INSERT INTO ShiftAct (EmpID, status, date, time) 
              VALUES (@EmpID, 'check out', @CurrentDate, @CurrentTime)
            `;
            await pool.request()
              .input('EmpID', sql.VarChar, empID)
              .input('CurrentDate', sql.Date, currentDateTime)
              .input('CurrentTime', sql.VarChar, currentTime) // Define CurrentTime input parameter
              .query(insertCheckOutQuery);
            return res.send('check out');
          }
          else {
          return res.send('g bisa check in');
          }
        } else if (firstRow.status === 'check out')  {
          console.log('jdhjkasl')
          // const firstRow = checkResult.recordset[0];
          // const lastCheckInTimestamp = moment(`${firstRow.date} ${firstRow.time}`, 'YYYY-MM-DD HH:mm:ss').tz('Asia/Jakarta');
          // console.log('date: ', currentDate);
          // console.log('time-last: ', lastCheckInTimestamp);

          // const diffMinutes = Math.abs(currentDate.diff(lastCheckInTimestamp, 'minutes'));
          // console.log('minutes', diffMinutes);
          if (diffMinutes < 2){
            return res.send('gk bisa check out');
          } else {
            const insertCheckInQuery = `
              INSERT INTO ShiftAct (EmpID, status, date, time) 
              VALUES (@EmpID, 'check in', @CurrentDate, @CurrentTime)
            `;
            await pool.request()
              .input('EmpID', sql.VarChar, empID)
              .input('CurrentDate', sql.Date, currentDateTime)
              .input('CurrentTime', sql.VarChar, currentTime) // Define CurrentTime input parameter
              .query(insertCheckInQuery);
      
            console.log(`2Check in recorded for employee ID: ${empID}`);
            return res.send('check in');
          } 
        }
      } else {
        // Insert new "check in" record
        const insertCheckInQuery = `
              INSERT INTO ShiftAct (EmpID, status, date, time) 
              VALUES (@EmpID, 'check in', @CurrentDate, @CurrentTime)
            `;
            await pool.request()
              .input('EmpID', sql.VarChar, empID)
              .input('CurrentDate', sql.Date, currentDateTime)
              .input('CurrentTime', sql.VarChar, currentTime) // Define CurrentTime input parameter
              .query(insertCheckInQuery);
      
            console.log(`1Check in recorded for employee ID: ${empID}`);
            return res.send('check in');
          } 
        
      } 

      
    catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).send('Error processing request');
  } finally {
    isProcessing = false; // Reset processing flag
    console.log('Request processing complete.');
  }
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
