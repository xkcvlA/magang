import axios from 'axios';
import './App.css';
import React, { useState, useEffect, useRef } from 'react';
import logo from './logo.png';

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
  // date
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  var [date,setDate] = useState(new Date());
  const [frnrp, setFrnrp] = useState(''); 

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4444/check');

    eventSource.onmessage = (event) => {
        setFrnrp(event.data);

    };

    return () => {
        eventSource.close(); // Clean up event source on component unmount
    };
}, []);
  console.log("m",frnrp)
  
  useEffect(() => {
      var timer = setInterval(()=>setDate(new Date()), 1000 )
      return function cleanup() {
          clearInterval(timer)
      }
  });

  useEffect(() => {
    axios.get('http://localhost:8080/getData')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  },[]);

  useEffect(() => {
    axios.get('http://localhost:4444')
      .then(response => {
        setFrnrp(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  },[]);


// function to import images
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}
  const images = importAll(require.context('./faces', false, /\.(jpg|jpeg|png)$/));
  const filter = data.find(item => item.NRP === "1105");
  const selper = filter ? filter.NAMA : []; // Check if filter is defined
  const selid = filter ? filter.NRP : []; // Check if filter is defined
  const selfo = selper ? images[`${selper}.jpg`] : null;

  // const selper = filter ? filter.NAMA : []; // Check if filter is defined
  // const selid = filter ? filter.NRP : []; // Check if filter is defined
  // const selfo = selper ? images[${selper}.png] : null;

  console.log("tes: ", status)
  return (
    <div className='app'>
      <div className='app-top'>
        <div className='logo-container'>
          <img src={logo} alt='logo' className='logo' />
        </div>
        <div className='date-container'>
          <p className='date'>{date.toLocaleDateString('id-ID', options)}</p>
        </div>
      </div>
      <div className='body-cont'>
        <div className='fr-cont'>
          <p className='time'>{date.toLocaleTimeString()}</p>
          <div className='camera-cont'>
            <Camera className='camera' autoPlay/>
          </div>
          <p className='text'>Arahkan muka anda ke kamera</p>
        </div>
      </div>
      <div className='body-cont2'>
        <div className='id'>
          {<img src={selfo} alt={selper} className='foto' />}
          <h2>Nama: {selper}</h2>
          <h2>NRP: {selid}</h2>
          <button onClick={handleCheckStatus}>Check Status</button>
            {status && <p>Status: {status}</p>}
        </div>
      </div>
    </div>
  );
}

export default App;