import urllib.request
import json

data = json.dumps({'temp': [0] * 63}).encode()
req = urllib.request.Request(
    'http://127.0.0.1:5000/predict-dynamic',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)
try:
    response = urllib.request.urlopen(req)
    print('SUCCESS:', response.read().decode())
except Exception as e:
    print('ERROR:', e)
