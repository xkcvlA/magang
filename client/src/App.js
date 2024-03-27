import axios from 'axios';
import './App.css';
import DateTime from './datetime';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');
  const [frnrp, setFrnrp] = useState(''); 
  // const updateFrnrp = (filenameWithExtension) => {
  //   const filenameWithoutExtension = filenameWithExtension.split('.').slice(0, -1);
  //   setFrnrp(filenameWithoutExtension);
  // };

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4444/check');

    eventSource.onmessage = (event) => {
        setFrnrp(event.data);
        // updateFrnrp(event.data);

    };

    return () => {
        eventSource.close(); // Clean up event source on component unmount
    };
}, []);
  console.log("m",frnrp)

//   const handleCheckStatus = async () => {
//     try {
//       const response = await axios.post('http://localhost:8080/checkStatus', { data: 'Hello from React' });
//       console.log('Response from server:', response.data);
//       axios.get('http://localhost:8080/yea')
//       .then(response=>{
//         setStatus(response.data)
//       })
// // Assuming server returns status
//     } catch (error) {
//       console.error('Error checking status:', error);
//       setStatus('Error');
//     }
//     axios.get('http://localhost:4444')
//       .then(response => {
//         setFrnrp(response.data);
//         console.log("m",frnrp)

//       })
//       .catch(error => {
//         console.error('Error fetching data:', error);
//       })
//   };

  // useEffect(()=>{
  //   const intervalId = setInterval(() => {
  //     handleCheckStatus();
  //   }, 500);
  //   return () => {
  //     if (frnrp !== '') {
  //       setFrnrp('');
  //     }
  //     clearInterval(intervalId);
  //   };
  // },[]);
 
  
  
  
  useEffect(() => {
    axios.get('http://localhost:8080/getData')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  },[]);


//function to import images
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}
  const images = importAll(require.context('./faces', false, /\.(jpg|jpeg|png)$/));
  const filter = data.find(item => item.EmpID === frnrp);
  const selper = filter ? filter.EmpName : [];
  const selid = filter ? filter.EmpID : [];
  const selfo = selper ? images[`${selper}.png`] : null;


  console.log("tes: ", status)
  console.log(selper)
  return (
    <div class="App">
      <div class="App-header">
        <DateTime />
        <img src={'http://localhost:4444/video_feed'} alt="logo" />
      </div>
      <div class='id'>
        <img src={selfo} alt={selper} class='image' />
        <h2>Nama: {selper}</h2>
        <h2>NRP: {selid}</h2>
        <h2>status: {status}</h2>
      </div>
    </div>
  );
}

export default App;