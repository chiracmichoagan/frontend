from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
from rembg import remove
from PIL import Image
import io
import os

app = Flask(__name__)
CORS(app)  # Permettre les requêtes depuis le frontend React

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier que l'API fonctionne"""
    return jsonify({'status': 'ok', 'message': 'API is running'})

@app.route('/api/remove-background', methods=['POST'])
def remove_background():
    """Endpoint principal pour supprimer l'arrière-plan"""
    
    # Vérifier si un fichier est présent
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    # Vérifier si un fichier a été sélectionné
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    # Vérifier l'extension du fichier
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed. Use PNG, JPG, JPEG or WEBP'}), 400
    
    try:
        # Lire l'image
        input_image = Image.open(file.stream)
        
        # Supprimer l'arrière-plan
        output_image = remove(input_image)
        
        # Convertir en bytes pour l'envoi
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(
            img_io,
            mimetype='image/png',
            as_attachment=True,
            download_name='no_background.png'
        )
    
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR: {error_detail}")
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

@app.route('/api/remove-background-preview', methods=['POST'])
def remove_background_preview():
    """Endpoint pour obtenir une prévisualisation sans téléchargement"""
    
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    
    file = request.files['image']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed'}), 400
    
    try:
        input_image = Image.open(file.stream)
        output_image = remove(input_image)
        
        img_io = io.BytesIO()
        output_image.save(img_io, 'PNG')
        img_io.seek(0)
        
        return send_file(img_io, mimetype='image/png')
    
    except Exception as e:
        import traceback
        error_detail = traceback.format_exc()
        print(f"ERROR: {error_detail}")
        return jsonify({'error': f'Error processing image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)