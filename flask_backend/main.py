from flask import Flask, request, send_file
from flask_cors import CORS
import os
from PIL import Image
import traceback

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Temporary folder to store files
TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)

@app.route('/convert/image', methods=['POST'])
def convert_image():
    if 'file' not in request.files:
        return {"error": "No file provided"}, 400

    uploaded_file = request.files['file']
    output_format = request.form.get('format', 'png').lower()

    # Validate format
    allowed_formats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']
    if output_format not in allowed_formats:
        return {"error": f"Unsupported format '{output_format}'"}, 400

    if output_format == 'jpg':
        output_format = 'jpeg'

    input_file_path = os.path.join(TEMP_FOLDER, uploaded_file.filename)
    uploaded_file.save(input_file_path)

    base_name, _ = os.path.splitext(uploaded_file.filename)
    output_file_path = os.path.join(TEMP_FOLDER, f"{base_name}_converted.{output_format}")

    try:
        with Image.open(input_file_path) as img:
            img = img.convert("RGB")
            img.save(output_file_path, format=output_format.upper())
    except Exception as e:
        print(f"Error: {str(e)}")
        print(traceback.format_exc())
        return {"error": f"Conversion failed: {str(e)}"}, 500
    finally:
        os.remove(input_file_path)

    return send_file(output_file_path, as_attachment=True, download_name=f"{base_name}_converted.{output_format}")

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
