from flask import Flask, request, send_file
from rembg import remove
from io import BytesIO
from gevent.pywsgi import WSGIServer

app = Flask(__name__)
# Set to 'u2netp' for a smaller, faster model, or 'u2net' for better quality.
MODEL_NAME = 'u2net' 

@app.route('/remove', methods=['POST'])
def remove_background():
    """
    Receives an image file via POST request, removes the background 
    using the Rembg/U2Net model, and returns the result as a PNG buffer.
    """
    if 'image' not in request.files:
        return {'error': 'No image file provided in the request.'}, 400

    image_file = request.files['image']
    
    # Read the incoming image file bytes
    input_data = image_file.read()

    # Log the received image size
    print(f"Received image: {image_file.filename} ({len(input_data)} bytes)")

    try:
        # 1. REMOVE BACKGROUND: Process the image buffer using the U2Net model
        output_data = remove(input_data, session_name=MODEL_NAME)

        # 2. Return the processed bytes as a file (PNG format)
        return send_file(
            BytesIO(output_data),
            mimetype='image/png',
            as_attachment=False,
            download_name='bg_removed.png'
        )

    except Exception as e:
        print(f"Error during background removal: {e}")
        return {'error': f'Background processing failed: {e}'}, 500

if __name__ == '__main__':
    # Use gevent for production-ready server and better handling of concurrent requests
    print(f"Rembg Microservice running with model: {MODEL_NAME}")
    print("Serving on http://localhost:5000")
    http_server = WSGIServer(('', 5000), app)
    http_server.serve_forever()