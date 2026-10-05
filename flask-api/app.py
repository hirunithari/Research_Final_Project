from flask import Flask, request, jsonify
import pickle
import numpy as np
import csv
import pandas as pd
import os
import fitz  # PyMuPDF
from sklearn.model_selection import train_test_split
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.metrics import accuracy_score
from flask_cors import CORS

_BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(_BASE_DIR, 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
uploaded_file_path = None

app = Flask(__name__)
CORS(app)

# Cache dynamic model using absolute path so it works regardless of working directory
_dynamic_model = None
try:
    with open(os.path.join(_BASE_DIR, 'dynamic.pkl'), 'rb') as _f:
        _dynamic_model = pickle.load(_f)
    print('dynamic.pkl loaded successfully — classes:', _dynamic_model.classes_)
except Exception as _e:
    import traceback
    print('WARNING: could not load dynamic.pkl at startup:')
    traceback.print_exc()


def _get_dynamic_model():
    """Return cached model, loading it lazily if startup failed."""
    global _dynamic_model
    if _dynamic_model is None:
        with open(os.path.join(_BASE_DIR, 'dynamic.pkl'), 'rb') as f:
            _dynamic_model = pickle.load(f)
    return _dynamic_model


@app.route('/')
def hello_world():
    return 'Hello World'


@app.route('/predict-dynamic', methods=['POST'])
def predict_dynamic():
    try:
        data = request.get_json(force=True)
        right = data['temp']
        model = _get_dynamic_model()
        X = np.array([right])
        predict_class = str(model.predict(X)[0])
        prob = model.predict_proba(X)[0]
        max_prob = float(prob[np.argmax(prob)])
        return jsonify({'predict': predict_class, 'probability': max_prob})
    except Exception as e:
        import traceback
        print('ERROR in predict_dynamic:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/predict-static-sign', methods=['POST'])
def predict_static_sign():
    try:
        data = request.get_json(force=True)
        right = data['temp']
        with open('staticsign.pkl', 'rb') as f:
            model = pickle.load(f)
        X = np.array([right])
        predict_class = str(model.predict(X)[0])
        prob = model.predict_proba(X)[0]
        max_prob = float(prob[np.argmax(prob)])
        return jsonify({'predict': predict_class, 'probability': max_prob})
    except Exception as e:
        import traceback
        print('ERROR in predict_static_sign:', traceback.format_exc())
        return jsonify({'error': str(e)}), 500


@app.route('/train-model', methods=['POST'])
def train():
    try:
        body = request.get_json(force=True)
        file_name = body['file_name']
        model_name = body['model_name']
        df = pd.read_csv(file_name)
        y = df['class']
        x = df.drop('class', axis=1)
        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.3, random_state=1234)
        model = make_pipeline(StandardScaler(), GradientBoostingClassifier())
        model.fit(x_train, y_train)
        yhat = model.predict(x_test)
        print('accuracy:', accuracy_score(y_test, yhat))
        with open(model_name, 'wb') as f:
            pickle.dump(model, f)
        return jsonify({'message': 'Trained successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/create-csv', methods=['POST'])
def create_csv():
    try:
        body = request.get_json(force=True)
        landmarks = ['class']
        for val in range(1, 22):
            landmarks += ['x{}'.format(val), 'y{}'.format(val), 'z{}'.format(val)]
        with open(body['filename'], mode='w', newline='') as f:
            csv.writer(f).writerow(landmarks)
        return jsonify({'message': 'CSV created'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/save-csv-data', methods=['POST'])
def save_csv_data():
    try:
        body = request.get_json(force=True)
        row = [body['className']] + body['temp']
        with open(body['filename'], mode='a', newline='') as f:
            csv.writer(f).writerow(row)
        return jsonify({'message': 'Data saved'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/upload', methods=['POST'])
def upload_file():
    global uploaded_file_path
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        uploaded_file_path = file_path
        return jsonify({'message': 'File uploaded successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/pdfScan', methods=['GET'])
def pdf_scan():
    global uploaded_file_path
    try:
        if not uploaded_file_path or not os.path.exists(uploaded_file_path):
            return jsonify({'error': 'No PDF uploaded'}), 400
        doc = fitz.open(uploaded_file_path)
        text = ''
        for page in doc:
            text += page.get_text()
        doc.close()
        processed = []
        for w in text.split():
            w = w.strip()
            if not w:
                continue
            if any('\u0D80' <= c <= '\u0DFF' for c in w):
                # Sinhala word — keep as-is, no lowercase
                processed.append(w)
            elif w.isalpha():
                # English word — lowercase
                processed.append(w.lower())
        words = list(dict.fromkeys(processed))
        return jsonify({'useful_words': words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/typeSentence', methods=['POST'])
def type_sentence():
    try:
        data = request.get_json(force=True)
        sentence = data.get('sentence', '')
        words = [w.strip().lower() for w in sentence.split() if w.strip()]
        return jsonify({'useful_words': words})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5001)
