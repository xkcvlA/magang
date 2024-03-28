import cv2
import face_recognition
import os, sys
from datetime import datetime
import numpy as np
import math

class FaceRecognition:
    face_locations = []
    face_encodings = []
    face_names = []
    known_face_encodings = []
    known_face_names = []
    the_name = ""
    process_current_frame = True

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

    # def upload_image(self, image):
    #     # Your image uploading logic goes here
    #     timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
    #     filename = f'unknown_person_{timestamp}.png'

    def run_recognition(self):
        video_capture = cv2.VideoCapture(0)
    
        if not video_capture.isOpened():
            sys.exit('Video source not found...')
        
        while True:
            ret, frame = video_capture.read()
            if self.process_current_frame:
                small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)
                self.face_locations = face_recognition.face_locations(rgb_small_frame)
                self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)
                self.face_names = []
                for face_encoding, (top, right, bottom, left) in zip(self.face_encodings, self.face_locations):
                    matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                    name = "Unknown"
                    confidence = '???'
                    face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                    best_match_index = np.argmin(face_distances)
                    if matches[best_match_index]:
                        face_distance = face_distances[best_match_index]
                        if face_distance < 0.9:
                            confi = self.face_confidence(face_distance)
                            if confi > 90:
                                name = self.known_face_names[best_match_index]
                                confidence = self.face_confidence(face_distances[best_match_index])
                                # Draw a red frame around the face
                    self.face_names.append(f'{name} ({confidence})')
                    self.the_name = name
                    cv2.rectangle(frame, (left * 4, top * 4), (right * 4, bottom * 4), (0, 0, 255), 2)
                    # Display the name and confidence
                    cv2.putText(frame, f'{name} ({confidence}%)', (left * 4, bottom * 4 + 20),
                                cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)
            self.process_current_frame = not self.process_current_frame
            yield frame  # Return the processed frame
            if not self.face_names:  # If no faces detected
                self.the_name = ""

    def face_confidence(self, face_distance, face_match_threshold=0.8):
        range_val = (1.2 - face_match_threshold)
        linear_val = (1.0 - face_distance) / (range_val * 2.0)

        if face_distance > face_match_threshold:
            return round(linear_val * 100, 2) 
        else:
            value = (linear_val + ((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
            return round(value, 2) 