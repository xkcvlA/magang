from flask import Flask, Response
from flask_cors import CORS
import cv2
from recognition_offline import FaceRecognition
from threading import Thread
import time

app = Flask(__name__)
CORS(app, resources={r"/video_feed": {"origins": "http://localhost:3000"}})

fr = FaceRecognition()
frame_buffer = None
last_result_time = None
result_stable_duration = 2  # Adjust this value as needed

def generate_frames():
    global frame_buffer, last_result_time
    
    for frame in fr.run_recognition():
        frame_buffer = frame
        # Check if result is stable for 2 seconds before yielding the frame
        if last_result_time and time.time() - last_result_time >= result_stable_duration:
            yield frame

def process_recognition_results():
    global last_result_time
    
    while True:
        time.sleep(0.1)  # Adjust the sleep time as needed
        current_results = fr.get_current_results()
        if len(set(current_results)) == 1:
            last_result_time = time.time()

@app.route('/video_feed', methods=['GET'])
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    host = "localhost"
    port = 4444
    debug = False
    options = None

    # Start a thread to process recognition results
    result_thread = Thread(target=process_recognition_results)
    result_thread.daemon = True
    result_thread.start()

    app.run(host, port, debug, options)
