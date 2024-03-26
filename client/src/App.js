import axios from 'axios';
import './App.css';
import DateTime from './datetime';
import React, { useState, useEffect, useRef } from 'react';

// Camera component
const Camera = () => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
//meow
  useEffect(() => {
    const constraints = {
      video: true
    };

    const handleSuccess = (stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };

    const handleError = (err) => {
      setError(err.message || 'Failed to access the camera.');
    };

    navigator.mediaDevices.getUserMedia(constraints)
      .then(handleSuccess)
      .catch(handleError);

    return () => {
      if (videoRef.current) {
        const stream = videoRef.current.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
        }
      }
    };
  }, []);

  return (
    <div>
      {error && <div>Error: {error}</div>}
      <video ref={videoRef} autoPlay playsInline />
    </div>
  );
};

//data will be the string we send from our server
function App() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');
  const handleCheckStatus = async () => {
    try {
      const response = await axios.post('http://localhost:8080/checkStatus', { data: 'Hello from React' });
      console.log('Response from server:', response.data);
      axios.get('http://localhost:8080/yea')
      .then(response=>{
        setStatus(response.data)
      })
// Assuming server returns status
    } catch (error) {
      console.error('Error checking status:', error);
      setStatus('Error');
    }
  };
  
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
  const filter = data.find(item => item.NRP === "1105");
  const selper = filter ? filter.NAMA : []; // Check if filter is defined
  const selid = filter ? filter.NRP : []; // Check if filter is defined
  const selfo = selper ? images[`${selper}.png`] : null;

  console.log("tes: ", status)
  return (
    <div class="App">
      <div class="App-header">
        <DateTime />
        {/* <Camera className="camera"/> */}
        {/* <img src={'http://localhost:4444/video_feed'} alt="logo" /> */}
      </div>
      <div class='id'>
        {<img src={selfo} alt={selper} class='image' />}
        <h2>Nama: {selper}</h2>
        <h2>NRP: {selid}</h2>
        <button onClick={handleCheckStatus}>Check Status</button>
          {status && <p>Status: {status}</p>}
      </div>
    </div>
  );
}

export default App;
