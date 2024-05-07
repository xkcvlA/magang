import face_recognition
import os, sys
import cv2
import numpy as np
import math
from datetime import datetime
import time

import util
from test import test

# Helper
def face_confidence(face_distance, face_match_threshold=0.8): 
    range = (1.2 - face_match_threshold)
    linear_val = (1.0 - face_distance) / (range * 2.0)

    if face_distance > face_match_threshold:
        return (round(linear_val * 100, 2)) 
    else:
        value = (linear_val + ((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
        print(value)
        return (round(value, 2)) 
        
class FaceRecognition:
    face_locations = []
    face_encodings = []
    face_names = []
    known_face_encodings = []
    known_face_names = []
    process_current_frame = True
    the_name = ""
    current_time = ""

    def __init__(self):
        self.encode_faces()

    def encode_faces(self):
        for image in os.listdir('./client/src/faces'):
            face_image = face_recognition.load_image_file(f"./client/src/faces/{image}")
            face_encodings = face_recognition.face_encodings(face_image)
            
            if len(face_encodings) > 0:
                face_encoding = face_encodings[0]  # Assuming only one face per image
                self.known_face_encodings.append(face_encoding)
                self.known_face_names.append(image)
            else:
                print(f"No face detected in {image}. Skipping...")
        
        print(self.known_face_names)


    def upload_image(self, image):
        # Your image uploading logic goes here
        timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'unknown_person_{timestamp}.jpg'


        pass

    def run_recognition(self):
    # Change the index to the appropriate one for your PC camera
        video_capture = cv2.VideoCapture(0)
    
        if not video_capture.isOpened():
            sys.exit('Video source not found...')
        
        while True:
            ret, frame = video_capture.read()
            # Only process every other frame of video to save time
            if self.process_current_frame:
                # Resize frame of video to 1/4 size for faster face recognition processing
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)

                # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)

                # Find all the faces and face encodings in the current frame of video
                self.face_locations = face_recognition.face_locations(rgb_small_frame)
                self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)
            
            label = test(
                    image=frame,
                    model_dir='./resources/anti_spoof_models',
                    device_id=0
                    )
            if label == 1:
                self.face_names = []
                for face_encoding, (top, right, bottom, left) in zip(self.face_encodings, self.face_locations):
                    # See if the face is a match for the known face(s)
                    matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                    name = "Unknown"
                    confidence = '???'

                    # Calculate the shortest distance to face
                    face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)

                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        face_distance = face_distances[best_match_index]
                        if face_distance < 0.9:
                            confi = face_confidence(face_distance)
                            if confi > 95:  # Checking if the confidence is above 95% (0.05 is an example threshold)
                                imgname = self.known_face_names[best_match_index]
                                name = imgname.split('.')[0]
                                confidence = face_confidence(face_distances[best_match_index])
                    self.face_names.append(f'{name} ({confidence})')
                    self.current_time = time.strftime('%H:%M:%S')
                    self.the_name = name
                    cv2.rectangle(frame, (left * 4, top * 4), (right * 4, bottom * 4), (0, 0, 255), 2)
                    # Display the name and confidence
                    cv2.putText(frame, f'{name} ({confidence}%)', (left * 4, bottom * 4 + 20),
                                cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)
                    print(self.face_names)
                    # print('no fakey fakey')
                
            else:
                print('you teasing me you naughty naughty~~', label)

            if not self.face_encodings:
                    # self.face_names.append("Unknown")
                    # print(self.face_names)
                    print("No faces detected in the image", label)

            self.process_current_frame = not self.process_current_frame
            yield frame
            if not self.face_names:  # If no faces detected
                self.the_name = ""
        