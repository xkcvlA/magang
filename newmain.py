import face_recognition
import os
import sys
import cv2
import numpy as np
import math
from datetime import datetime
import time
from threading import Thread
from queue import Queue

from test import test  # Ensure this import matches your project structure

def face_confidence(face_distance, face_match_threshold=0.8):
    range = (1.2 - face_match_threshold)
    linear_val = (1.0 - face_distance) / (range * 2.0)

    if face_distance > face_match_threshold:
        return round(linear_val * 100, 2)
    else:
        value = (linear_val + ((1.0 - linear_val) * math.pow((linear_val - 0.5) * 2, 0.2))) * 100
        return round(value, 2)

class FaceRecognition:
    face_encodings = []
    face_locations = []
    face_names = []
    known_face_encodings = []
    known_face_names = []
    spoof = False
    the_name = ""
    current_time = ""
    def __init__(self):
        
        self.encode_faces()
        self.frame_queue = Queue(maxsize=10)
        self.result_queue = Queue(maxsize=10)
        self.capture_thread = None
        self.process_thread = None
        

    def encode_faces(self):
        for image in os.listdir('./client/src/faces'):
            face_image = face_recognition.load_image_file(f"./client/src/faces/{image}")
            self.face_encodings = face_recognition.face_encodings(face_image)

            if self.face_encodings:
                face_encoding = self.face_encodings[0]  # Assuming only one face per image
                self.known_face_encodings.append(face_encoding)
                self.known_face_names.append(os.path.splitext(image)[0])  # Use the file name without extension as the name
            else:
                print(f"No face detected in {image}. Skipping...")

        print("Encoded faces:", self.known_face_names)

    def upload_image(self, image):
        timestamp = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')
        filename = f'unknown_person_{timestamp}.jpg'
        cv2.imwrite(filename, image)
        print(f"Image saved as {filename}")

    def process_frames(self):
        frame_interval = 5  # Process every 20th frame to reduce lag
        frame_count = 0

        while True:
            if not self.frame_queue.empty():
                frame = self.frame_queue.get()
                frame_count += 1
                if frame_count % frame_interval == 0:
                    label = test(frame, model_dir='./resources/anti_spoof_models', device_id=0)
                    self.face_names = []
                    if label == 1:
                        small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
                        rgb_small_frame = cv2.cvtColor(small_frame, cv2.COLOR_BGR2RGB)


                        self.face_locations = face_recognition.face_locations(rgb_small_frame)
                        self.face_encodings = face_recognition.face_encodings(rgb_small_frame, self.face_locations)

                        for face_encoding, (top, right, bottom, left) in zip(self.face_encodings, self.face_locations):
                            matches = face_recognition.compare_faces(self.known_face_encodings, face_encoding)
                            name = "Unknown"
                            confidence = '???'

                            face_distances = face_recognition.face_distance(self.known_face_encodings, face_encoding)
                            best_match_index = np.argmin(face_distances)
                            if matches[best_match_index]:
                                face_distance = face_distances[best_match_index]
                                if face_distance < 0.9:
                                    confi = face_confidence(face_distance)
                                    if confi > 80:
                                        name = self.known_face_names[best_match_index]
                                        confidence = face_confidence(face_distances[best_match_index])
                            self.face_names.append(f'{name} ({confidence})')
                            self.current_time = time.strftime('%H:%M:%S')
                            self.the_name = name
                            self.spoof = False
                            
                        #     cv2.rectangle(frame, (left * 4, top * 4), (right * 4, bottom * 4), (0, 0, 255), 2)
                        # # Display the name and confidence
                        #     cv2.putText(frame, f'{name} ({confidence}%)', (left * 4, bottom * 4 + 20),
                        #     cv2.FONT_HERSHEY_DUPLEX, 0.5, (255, 255, 255), 1)
                        #     print(self.face_names)

                    elif not self.face_encodings:
                        self.spoof = False
                        print("No faces detected in the image", label)
                    else:
                        print('you teasing me you naughty naughty~~', label)
                        self.spoof = True
 
                    self.result_queue.put((self.face_names, self.face_locations))
                else:
                    self.result_queue.put((self.face_names, self.face_locations))
            time.sleep(0.1)  # Small delay to prevent high CPU usage

    def run_recognition(self):
        video_capture = cv2.VideoCapture(0)
        if not video_capture.isOpened():
            sys.exit('Video source not found...')

        self.capture_thread = Thread(target=self.process_frames)
        self.capture_thread.daemon = True
        self.capture_thread.start()

        while True:
            ret, frame = video_capture.read()
            if not ret:
                print("Failed to grab frame")

            if not self.frame_queue.full():
                self.frame_queue.put(frame)

            if not self.result_queue.empty():
                self.face_names, self.face_locations = self.result_queue.get()
            for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
                # Scale back up face locations since the frame we detected in was scaled to 1/4 size
                top *= 4
                right *= 4
                bottom *= 4
                left *= 4

                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
                # Draw a label with a name below the face
                cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
                cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)

            # for (top, right, bottom, left), name in zip(self.face_locations, self.face_names):
            #     top *= 4
            #     right *= 4
            #     bottom *= 4
            #     left *= 4
            #     cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)
            #     cv2.rectangle(frame, (left, bottom - 35), (right, bottom), (0, 0, 255), cv2.FILLED)
            #     cv2.putText(frame, name, (left + 6, bottom - 6), cv2.FONT_HERSHEY_DUPLEX, 0.8, (255, 255, 255), 1)
            yield frame
            if not self.face_names:  # If no faces detected
                self.the_name = ""            

