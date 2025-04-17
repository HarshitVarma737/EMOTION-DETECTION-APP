import torch
from model import UNet  # Assuming you have a model.py file with the UNet class

def load_model(model_path):
    model = UNet(in_channels=3)
    model.load_state_dict(torch.load(model_path))
    model.eval()
    return model