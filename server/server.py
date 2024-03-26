from flask import Flask, request, jsonify
from recognition_offline import facial_recognition_function  # Import your facial recognition function from fr.py

app = Flask(__name__)

@app.route('/checkStatus', methods=['POST'])
def check_status():
    data = request.json.get('data')
    # Call your facial recognition function here passing any required data
    # Example:
    status = facial_recognition_function(data)
    return jsonify({'status': status})

if __name__ == '__main__':
    app.run(debug=True)  # Run the Flask app
