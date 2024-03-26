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
    
@app.route('/', methods=['GET'])
def sendstuff():
    printed_name = fr.the_name
    time.sleep(2)
    print(printed_name)
    return str(printed_name)

if __name__ == '_main_':
    host = "localhost"
    port = 4444
    debug = False
    options = None

    app.run(host, port, debug, options)