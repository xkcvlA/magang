import axios from 'axios';
import './App.css';
import logo from './logo.png';
// import DateTime from './datetime';
import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');
  const [frnrp, setFrnrp] = useState('');
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  var [date,setDate] = useState(new Date()); 
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

  useEffect(() => {
    var timer = setInterval(()=>setDate(new Date()), 1000 )
    return function cleanup() {
        clearInterval(timer)
    }
});

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
  const selshift = filter ? filter.shiftID : [];
  console.log("s", selshift)

  const handleCheckStatus = async () => {
    if(selshift && selshift.length>0){
      try {
        const response = await axios.post('http://localhost:8080/checkStatus', {data: selshift});
        console.log('Response from server:', response.data);
        setStatus(response.data);
  // Assuming server returns status
      } catch (error) {
        console.error('Error checking status:', error);
        setStatus('Error');
      }
    }
    else{
      setStatus("")
    }
  };

  useEffect(()=>{
    handleCheckStatus();      
  }, [frnrp]);


  console.log("tes: ", status)
  console.log(selper)
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
            <img src={'http://localhost:4444/video_feed'} alt="cam" className='camera'/>
            {/* <Camera className='camera' autoPlay/> */}
          </div>
          <p className='text'>Arahkan muka anda ke kamera</p>
        </div>
      </div>
      <div className='body-cont2'>
        {/* <img src={a} alt="non" className='foto' /> */}
        <img src={selfo} alt={selper} className='foto' />
        <div className='id'>
          <h2>Nama: {selper}</h2>
          <h2>NRP: {selid}</h2>
          <h2>Status: {status}</h2>
        </div>
      {/* <button onClick={handleCheckStatus}>Check Status</button> */}
        {/* {status && <p>Status: {status}</p>} */}
      </div>
    </div>
  );
}

export default App;