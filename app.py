from flask import Flask, Response
from flask_cors import CORS
import cv2
from recognition_offline import FaceRecognition
import time

app = Flask(__name__)
CORS(app)

fr = FaceRecognition()


def generate_frames():
    for frame in fr.run_recognition():  # Iterate over processed frames
        ret, buffer = cv2.imencode('.jpg', frame)
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + bytearray(buffer) + b'\r\n')

@app.route('/video_feed', methods=['GET'])
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/check', methods=['GET'])
def stream_data():
    def sendstuff():
        while True:
<<<<<<< HEAD
            yield f"data: {fr.the_name} , {fr.current_time}\n\n"
=======
            yield f"data: {fr.the_name}\n\n"
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
            time.sleep(0.1)
            
    return Response(sendstuff(), mimetype='text/event-stream')

if __name__ == '__main__':
    host = "localhost"
    port = 4444
    debug = True
    options = None

<<<<<<< HEAD
    app.run(host, port, debug, options)
=======
    app.run(host, port, debug, options)
>>>>>>> e2e4f4c2ef475ed569e984b630ae0131d5ca9bfe
