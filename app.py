from flask import Flask, request, jsonify, render_template
import torch
import torch.nn as nn
import cv2
import numpy as np
from PIL import Image
import torchvision.transforms as transforms
import base64
import io
from model import UNet

app = Flask(__name__)

model = UNet(in_channels=3)
model.load_state_dict(torch.load('model/emotion_model.pth', map_location=torch.device('cpu')), strict=False)
model.eval()

EMOTIONS = {
    0: 'angry',
    1: 'fearful',
    2: 'disgusted',
    3: 'sad',
    4: 'happy',
    5: 'surprised',
    6: 'neutral'
}

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225])
])

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/detect_emotion', methods=['POST'])
def detect_emotion():
    if 'image' not in request.json:
        return jsonify({'error': 'No image provided'}), 400

    img_data = request.json['image'].split(',')[1]
    img_bytes = base64.b64decode(img_data)
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img = transform(img).unsqueeze(0)

    with torch.no_grad():
        output = model(img)
        _, predicted = torch.max(output, 1)
        emotion_idx = predicted.item()
        emotion_name = EMOTIONS.get(emotion_idx, 'unknown')

    return jsonify({'emotion': emotion_name})

if __name__ == '__main__':
    app.run(debug=True)
