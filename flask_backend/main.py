from flask import Flask, request, send_file
from flask_cors import CORS
import os
from PIL import Image

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Temporary folder to store files
TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)  # Create temp folder if it doesn't exist

@app.route('/convert/image', methods=['POST'])
def convert_image():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return {"error": "No file provided"}, 400
    
    uploaded_file = request.files['file']
    output_format = request.form.get('format', 'png').lower()

    # Validate output format
    allowed_formats = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp']
    if output_format not in allowed_formats:
        return {"error": f"Unsupported format '{output_format}'. Allowed formats: {', '.join(allowed_formats)}"}, 400

    # Save the uploaded file temporarily
    input_file_path = os.path.join(TEMP_FOLDER, uploaded_file.filename)
    uploaded_file.save(input_file_path)

    # Create output file path
    base_name, _ = os.path.splitext(uploaded_file.filename)
    output_file_path = os.path.join(TEMP_FOLDER, f"{base_name}_converted.{output_format}")

    try:
        # Convert the image using Pillow
        with Image.open(input_file_path) as img:
            if img.mode!="RGB":
                img = img.convert("RGB")  # Ensure compatibility with formats like JPEG
            img.save(output_file_path, format=output_format.upper())
    except Exception as e:
        return {"error": f"Image conversion failed: {str(e)}"}, 500
    finally:
        os.remove(input_file_path)  # Clean up input file

    # Return the converted file as a downloadable attachment
    return send_file(
        output_file_path,
        as_attachment=True,
        download_name=f"{base_name}_converted.{output_format}",
    )

# Run the app
if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
