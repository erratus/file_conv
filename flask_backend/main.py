from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from PIL import Image

app = Flask(__name__)
CORS(app)

@app.route('/convert/image', methods=['POST'])
def convert_image():
    file = request.files['file']
    output_format = request.form['format']
    if file:
        input_path = f"temp/{file.filename}"
        output_path = f"temp/output.{output_format}"
        file.save(input_path)

        # Convert image format
        img = Image.open(input_path)
        img.save(output_path, output_format.upper())

        return send_file(output_path, as_attachment=True)
    return jsonify({"error": "File upload failed"}), 400

if __name__ == "__main__":
    os.makedirs('temp', exist_ok=True)
    app.run(port=5001)
