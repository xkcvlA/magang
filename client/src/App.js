import axios from 'axios';
import './App.css';
import React, { useState, useEffect} from 'react';
import logo from './logo.png';
import GFB from './logo-2.png';
import phil from './philosophy_01.png';

//data will be the string we send from our server
function App() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState('');
  const [frnrp, setFrnrp] = useState(''); 
  const [EmpId, setEmpId] = useState(null); // State to store EmpId
  const [Ctime, setCtime] = useState('');

  useEffect(() => {
    axios.get('http://localhost:8080/getEmpId')
      .then(response => {
        setEmpId(response.data.EmpID); // Assuming the response contains EmpId
      })
      .catch(error => {
        console.error('Error fetching EmpId:', error);
      });
  }, []);
  
  // Function to handle check-in/check-out action
  const handleCheckAction = async (EmpId, action) => {
    try {
      // Send HTTP POST request to the Express.js endpoint
      await axios.post('/api/storeCheckTime', { EmpId, action });
      console.log('Check time stored successfully');
    } catch (error) {
      console.error('Error storing check time:', error);
    }
  };
  
  // Example usage when someone checks in
  handleCheckAction(EmpId, 'check-in');
  
  // Example usage when someone checks out
  handleCheckAction(EmpId, 'check-out');

  // date
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  var [date,setDate] = useState(new Date());

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4444/check');
    eventSource.onmessage = (event) => {
      const dataset = event.data
      const nameIndex = dataset.split(" , "); 
      const name = nameIndex[0];
      const time = nameIndex[1];
      setFrnrp(name);
      setCtime(time);
    };
    
    return () => {
        eventSource.close(); // Clean up event source on component unmount
    };
  }, []);
  console.log("m",frnrp)

  useEffect(() => {
    let animationFrameId;
    // Function to update the time
    const updateDate = () => {
      setDate(new Date());
      animationFrameId = requestAnimationFrame(updateDate);
    };
    // Start updating the time
    updateDate();
    // Clean up by canceling the animation frame
    return () => cancelAnimationFrame(animationFrameId);
  },[]);

  useEffect(() => {
    axios.get('http://localhost:8080/getData')
      .then(response => { 
        setData(response.data);
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
  const filter = data.find(item => item.EmpID === frnrp);
  const selper = filter ? filter.EmpName : [];
  const selid = filter ? filter.EmpID : []; 
  const selfo = selper ? images[`${selper}.png`] : null;

  useEffect(()=>{
    const handleCheckStatus = async () => {
      const selshift = data.find(item => item.EmpID === frnrp)?.shiftID;
      if (selshift && selshift.length > 0) {
        try {
          const response = await axios.post('http://localhost:8080/checkStatus', { data: selshift });
          console.log('Response from server:', response.data);
          setStatus(response.data);
        } catch (error) {
          console.error('Error checking status:', error);
          setStatus('Error');
        }
      } else {
        setStatus('');
      }
    };

    handleCheckStatus();      
  }, [frnrp, data]);


  console.log("tes: ", status)
  console.log(selper)
  return (
    <div className='app'>
      <div className='app-top'>
        <div className='logo-container'>
            <a href='https://musashi.co.in/MusashiPhilosophy'>
              <img src={logo} alt='logo' className='logo' />
              <img src={GFB} alt='logo' className='logo-2' />
            </a>
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
        <div className='body-3'>
          <img src={selfo} alt={selper} className='foto' />
          <div className='id'>
            <h2>Nama: {selper}</h2>
            <h2>NRP: {selid}</h2>
            <h2>Status: {status}</h2>
              {status === "Check in" && (
                <div className="check-in">
                  <p className='check'>Welcome, {selper}!</p>
                </div>
              )}
              {status === "Check out" && (
                <div className="check-out">
                  <p className='check'>Thank you, {selper}!</p>
                </div>
              )}
          </div>
        </div>
        <div className='body-4'>
          <div className='phil-cont'>
            <h3 className='phil-title'>Our Philosophy</h3>
            <img src={phil} alt={'philosophy'} className='p-photo' />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;