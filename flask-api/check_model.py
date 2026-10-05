import pickle
import numpy as np

with open('dynamic.pkl', 'rb') as f:
    model = pickle.load(f)

# Print all class names the model knows
print("Model classes:", model.classes_)
