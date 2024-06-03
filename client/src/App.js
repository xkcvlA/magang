import axios from 'axios';
import './App.css';
import React, { useState, useEffect } from 'react';
import logo from './logo.png';
import GFB from './logo-2.png';

function App() {
  const [data, setData] = useState([]);
  const [frnrp, setFrnrp] = useState('');
  const [Ctime, setCtime] = useState('');
  const [lastEmpID, setLastEmpID] = useState('');
  const [Status, setStatus] = useState('');
  const [jokes, setJokes] = useState('');
  const [lastRecognitionTime, setLastRecognitionTime] = useState(0);
  const [spoof, setSpoof] = useState('');

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  };
  const [date, setDate] = useState(new Date());

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:4444/check');
    eventSource.onmessage = (event) => {
      const dataset = event.data
      const nameIndex = dataset.split(/ , | \. /);
      const name = nameIndex[0].trim();
      const time = nameIndex[1].trim();
      const yesno = nameIndex[2].trim();
      console.log(yesno, "yeyyyy");
      setFrnrp(name);
      setCtime(time);
      setSpoof(yesno);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  useEffect(() => {
    let animationFrameId;
    const updateDate = () => {
      setDate(new Date());
      animationFrameId = requestAnimationFrame(updateDate);
    };
    updateDate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    axios.get('http://localhost:8080/getData')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
  }, []);

  const currentDate = date.toLocaleDateString(undefined, options);
  const currentTime = Ctime;
  const empID = frnrp;

  useEffect(() => {
    const handleRecognition = async () => {
      try {
        if (empID && empID !== 'Unknown' && (empID !== lastEmpID || Date.now() - lastRecognitionTime >= 10000)) {
          const response = await axios.post('http://localhost:8080/recognize', { empID, currentDate, currentTime });
          console.log('Data sent successfully:', response.data);
          
          setStatus(response.data);
          setLastEmpID(empID);
          setLastRecognitionTime(Date.now());

          console.log("djsfhl: ", Status);
          const getRandomJokes = () => {
            const jokes = [
              "kenapa kalau makan kepiting gaboleh pake gunting? karena nanti jadi kepotong",
              "sotong kalo kebelah jadi apa? sotongah",
              "kelapa apa yang berat? kelapa keluarga",
              "motor apa yg selalu senang? YamaHahahahaha",
              "tukang apa yang suka mengkhayal? tukang bubur, karena suka menghalusi-nasi",
              "kenapa matahari tenggelam? karena tidak bisa berenang",
              "santa claus kalau pake motor, merek apa? Hohohonda"
            ];
            const randomIndex = Math.floor(Math.random() * jokes.length);
            return jokes[randomIndex];
          };
  
          const randomJokes = getRandomJokes();
          setJokes(randomJokes);
        }
      } catch (error) {
        console.error('Error sending recognition data:', error);
      }
    };
    handleRecognition();
  }, [empID, lastEmpID, lastRecognitionTime, currentDate, currentTime, Status]);
  

  const images = importAll(require.context('./faces', false, /\.(jpg|jpeg|png)$/));
  const filter = data.find(item => item.EmpID === lastEmpID);
  const selper = filter ? filter.EmpName : '';
  const selid = filter ? filter.EmpID : '';
  const selfo = selper ? images[`${selper}.png`] : null;

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
            <img src={'http://localhost:4444/video_feed'} alt="cam" className='camera' />
          </div>
          <p className='text'>Arahkan muka anda ke kamera</p>
        </div>
      </div>
      <div className='body-cont2'>
        <div className='body-3'>
          {selfo ? (
            <div className='foto'>
              <img src={selfo} alt={selper} className='foto' />
            </div>
          ) : (
            <div className='foto placeholder'></div>
          )}
          <div className='body-8'>
            <div className='body-7'>
              <div className='id' style={{ display: 'flex', flexDirection: 'column' }}>
                <h2 style={{ flex: 1 }}>Nama:</h2>
                <h2 style={{ flex: 1 }}>NRP:</h2>
                <h2 style={{ flex: 1 }}>Status:</h2>
              </div>
              <div className='data' style={{ display: 'flex', flexDirection: 'column', fontSize: '15px', marginLeft: '15px' }}>
                <h2 style={{ flex: 1 }}>{selper}</h2>
                <h2 style={{ flex: 1 }}>{selid}</h2>
                <h2 style={{ flex: 1 }}>{Status}</h2>
              </div>
            </div>
            {Status === "check in" && (
              <div className="check-in">
                <p className='check'>Welcome, {selper}!</p>
              </div>
            )}
            {Status === "check out" && (
              <div className="check-out">
                <p className='check'>Thank you, {selper}!</p>
              </div>
            )}
            {Status === "alrd checked in" && (
              <div className="udh-check">
                <p className='check'>udh check in syg *lov*</p>
              </div>
            )}
            {Status === "gk bs check out" && (
              <div className="udh-check">
                <p className='check'>hayo mau kabur kmn?</p>
              </div>
            )}
            {Status === "" && (
              <div className='status placeholder'></div>
            )}
            {spoof === "True" && (
              <div className="udh-check">
                <p className='check'>faker kau</p>
              </div>

            )}
          </div>
          <div className='body-4'>
            <div>
              <h2>Daily Jokes</h2>
              <blockquote>{jokes}</blockquote>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

function importAll(r) {
  let images = {};
  r.keys().map((item, index) => { images[item.replace('./', '')] = r(item); });
  return images;
}
