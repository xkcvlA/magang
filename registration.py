import cv2
import os

def capture_image(filename):
    webcam = cv2.VideoCapture(0) # pilih webcam
        
    _, frame = webcam.read()

    webcam.release() # matikan webcam

    folder = "faces" # declare folder penyimpanan
    os.makedirs(folder, exist_ok=True) # kalau blm ada folder nanti dibuat otomatis
    
    filepath = os.path.join(folder, filename) # File storage location and naming
    filepath_jpg = f"{os.path.splitext(filepath)[0]}.jpg" # JPG image extension
    cv2.imwrite(filepath_jpg, frame) # Save image file

    print(f"Face registered. Welcome, {filename}!") # Notify that the image has been saved


filename = input("Enter your name: ") # Manually input the file name, filled with the person's name

capture_image(filename) # Take a photo