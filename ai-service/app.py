from flask import Flask, request, jsonify
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib
import os
from datetime import datetime

app = Flask(__name__)

# --- Mock Model Training (Simulating a pre-trained model) ---
# In a real scenario, this would load a .pkl file.
# We will train a simple model on synthetic data for demonstration.

def train_mock_model():
    print("Training mock fraud detection model...")
    # Synthetic dataset: [amount, hour, sender_balance, receiver_balance]
    # Label: 0 (Legit), 1 (Fraud)
    
    # Legit patterns: Moderate amounts, normal hours
    # Fraud patterns: High amounts, late hours, draining balance
    
    data = []
    labels = []
    
    # Generate 1000 samples
    for _ in range(1000):
        is_fraud = np.random.choice([0, 1], p=[0.9, 0.1])
        
        if is_fraud:
            amount = np.random.uniform(5000, 20000)
            hour = np.random.choice([0, 1, 2, 3, 23]) # Late night
            sender_bal = np.random.uniform(0, 5000) # Low balance
            receiver_bal = np.random.uniform(0, 1000)
        else:
            amount = np.random.uniform(10, 2000)
            hour = np.random.choice(range(6, 22)) # Day time
            sender_bal = np.random.uniform(2000, 50000)
            receiver_bal = np.random.uniform(1000, 50000)
            
        data.append([amount, hour, sender_bal, receiver_bal])
        labels.append(is_fraud)
        
    df = pd.DataFrame(data, columns=['amount', 'hour', 'sender_bal', 'receiver_bal'])
    y = np.array(labels)
    
    model = RandomForestClassifier(n_estimators=50, random_state=42)
    model.fit(df, y)
    print("Model trained.")
    return model

model = train_mock_model()

@app.route('/predict', methods=['POST'])
def predict_fraud():
    try:
        data = request.json
        # Expected keys: amount, timestamp (ISO), sender_balance, receiver_balance
        
        amount = data.get('amount')
        timestamp = data.get('timestamp') # "2023-10-27T10:00:00Z"
        sender_bal = data.get('sender_balance')
        receiver_bal = data.get('receiver_balance', 0) # Optional, default 0
        
        # Feature Engineering
        dt = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        hour = dt.hour
        
        features = np.array([[amount, hour, sender_bal, receiver_bal]])
        
        # Prediction
        probability = model.predict_proba(features)[0][1] # Probability of class 1 (Fraud)
        is_fraud = probability > 0.5
        
        risk_level = "low"
        if probability > 0.8:
            risk_level = "critical"
        elif probability > 0.5:
            risk_level = "high"
        elif probability > 0.3:
            risk_level = "medium"
            
        return jsonify({
            "fraud_score": float(probability),
            "is_fraud": bool(is_fraud),
            "risk_level": risk_level
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5001, debug=True)
