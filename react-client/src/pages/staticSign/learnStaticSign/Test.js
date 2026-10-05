import { Hands } from '@mediapipe/hands';
import React, { useRef, useEffect, useState } from 'react';
import * as hands from '@mediapipe/hands';
import * as cam from '@mediapipe/camera_utils';
import Webcam from 'react-webcam';
import axios from 'axios';

function Test({ webcamRef, canvasRef }) {
    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Webcam
                ref={webcamRef}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                }}
            />
            <canvas
                ref={canvasRef}
                className="output_canvas"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    borderRadius: '8px',
                }}
            />
        </div>
    );
}

export default Test;
