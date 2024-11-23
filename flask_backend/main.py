from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
from PIL import Image
import traceback
import mimetypes

app = Flask(__name__)
CORS(app)

# Temporary folder to store files
TEMP_FOLDER = "temp"
os.makedirs(TEMP_FOLDER, exist_ok=True)

# Supported conversions dictionary
SUPPORTED_CONVERSIONS = {
    "image": ["png", "jpg", "jpeg", "webp", "gif", "bmp"],
    "application/msword": ["pdf", "txt"],
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ["pdf", "txt"],
    "application/pdf": ["doc", "docx"],
    "text/plain": ["pdf"],
    # Add more mappings for other file types as needed
}

@app.route('/get-conversions', methods=['POST'])
def get_conversions():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400

    uploaded_file = request.files['file']
    file_type, _ = mimetypes.guess_type(uploaded_file.filename)

    if not file_type:
        return jsonify({"error": "Unsupported file type"}), 400

    # Determine file category and return supported conversions
    file_category = file_type.split('/')[0]  # e.g., "image", "application"
    conversions = SUPPORTED_CONVERSIONS.get(file_type, SUPPORTED_CONVERSIONS.get(file_category, []))

    if not conversions:
        return jsonify({"error": f"No conversions available for file type '{file_type}'"}), 400

    return jsonify({"conversions": conversions}), 200

@app.route('/convert', methods=['POST'])
def convert_file():
    try:
        if 'file' not in request.files or 'format' not in request.form:
            return jsonify({"error": "File or format not provided"}), 400

        uploaded_file = request.files['file']
        output_format = request.form['format']

        # Save the uploaded file temporarily
        input_file_path = os.path.join(TEMP_FOLDER, uploaded_file.filename)
        uploaded_file.save(input_file_path)

        if output_format.lower() == 'jpg':
            output_format = 'JPEG'

        # Determine file type and perform conversion
        file_extension = os.path.splitext(uploaded_file.filename)[1].lower()
        base_name = os.path.splitext(uploaded_file.filename)[0]
        output_file_path = os.path.join(TEMP_FOLDER, f"{base_name}_converted.{output_format.lower()}")

        if file_extension in ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp']:  # Example for images
            with Image.open(input_file_path) as img:
                if img.mode == 'RGBA' and output_format.upper() == 'JPEG':
                    img = img.convert('RGB')
                img.save(output_file_path, format=output_format.upper())

        return send_file(
            output_file_path,
            as_attachment=True,
            download_name=f"{base_name}_converted.{output_format.lower()}",
            mimetype=f"image/{output_format.lower()}"
        )
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({"error": f"File conversion failed: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5001, debug=True)
