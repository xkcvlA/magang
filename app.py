from flask import Flask, Response
from flask_cors import CORS
import cv2
from recognition_offline import FaceRecognition

app = Flask(__name__)
CORS(app, resources={r"/video_feed": {"origins": "http://localhost:3000"}})

fr = FaceRecognition()

def generate_frames():
    for frame in fr.run_recognition():  # Iterate over processed frames
        ret, buffer = cv2.imencode('.jpg', frame)
        # frame_bytes = buffer.tobytes()
        yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + bytearray(buffer) + b'\r\n')

@app.route('/video_feed', methods=['GET'])
def video_feed():
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

if __name__ == '__main__':
    host = "localhost"
    port = 4444
    debug = False
    options = None

    app.run(host, port, debug, options)
