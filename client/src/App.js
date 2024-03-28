import axios from 'axios';
import './App.css';
import DateTime from './datetime';
import React, { useState, useEffect, useRef } from 'react';

<<<<<<< HEAD
=======
// // Camera component
// const Camera = () => {
//   const videoRef = useRef(null);
//   const [error, setError] = useState(null);
// //meow
//   useEffect(() => {
//     const constraints = {
//       video: true
//     };

//     const handleSuccess = (stream) => {
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//       }
//     };

//     const handleError = (err) => {
//       setError(err.message || 'Failed to access the camera.');
//     };

//     navigator.mediaDevices.getUserMedia(constraints)
//       .then(handleSuccess)
//       .catch(handleError);

//     return () => {
//       if (videoRef.current) {
//         const stream = videoRef.current.srcObject;
//         if (stream) {
//           const tracks = stream.getTracks();
//           tracks.forEach(track => track.stop());
//         }
//       }
//     };
//   }, []);

//   return (
//     <div>
//       {error && <div>Error: {error}</div>}
//       <video ref={videoRef} autoPlay playsInline />
//     </div>
//   );
// };

//data will be the string we send from our server
>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78
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
<<<<<<< HEAD
        // updateFrnrp(event.data);
=======
>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78

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

<<<<<<< HEAD
=======
  // useEffect(() => {
  //   axios.get('http://localhost:4444')
  //     .then(response => {
  //       setFrnrp(response.data);
  //     })
  //     .catch(error => {
  //       console.error('Error fetching data:', error);
  //     });
  // },[]);

>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78

//function to import images
function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}
  const images = importAll(require.context('./faces', false, /\.(jpg|jpeg|png)$/));
<<<<<<< HEAD
  const filter = data.find(item => item.EmpID === frnrp);
  const selper = filter ? filter.EmpName : [];
  const selid = filter ? filter.EmpID : [];
  const selfo = selper ? images[`${selper}.png`] : null;

=======
  const filter = data.find(item => item.NRP === "1105");
  const selper = filter ? filter.NAMA : [];
  const selid = filter ? filter.NRP : [];
  const selfo = selper ? images[`${selper}.png`] : null;

  // const selper = filter ? filter.NAMA : []; // Check if filter is defined
  // const selid = filter ? filter.NRP : []; // Check if filter is defined
  // const selfo = selper ? images[${selper}.png] : null;
>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78

  console.log("tes: ", status)
  console.log(selper)
  return (
    <div class="App">
      <div class="App-header">
<<<<<<< HEAD
=======
        <div>
          <header>
            {/* <img src={'tes.jpg'}></img> */}
          </header>
        </div>
>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78
        <DateTime />
        <img src={'http://localhost:4444/video_feed'} alt="logo" />
      </div>
      <div class='id'>
        <img src={selfo} alt={selper} class='image' />
        <h2>Nama: {selper}</h2>
        <h2>NRP: {selid}</h2>
<<<<<<< HEAD
        <h2>status: {status}</h2>
=======
        <h2>NRP: {frnrp}</h2>
        <h2>status: {status}</h2>
        {/* <button onClick={handleCheckStatus}>Check Status</button>
          {status && <p>Status: {status}</p>}
          {frnrp && <p>NRP: {frnrp}</p>} */}
>>>>>>> 3c1b7b2383fcc81f8dd59befae19ad2fce326a78
      </div>
    </div>
  );
}

export default App;