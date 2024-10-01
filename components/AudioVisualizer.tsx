import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audioDataRef: React.RefObject<Float32Array>;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audioDataRef }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) return;

    let animationFrameId: number;
    const updateInterval = 40;
    const smoothingFactor = 0.8;
    let lastUpdateTime = 0;
    const bufferLength = audioDataRef.current?.length ?? 0;
    const smoothedData = new Float32Array(bufferLength).fill(0);

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastUpdateTime < updateInterval) {
        return;
      }

      lastUpdateTime = currentTime;

      const audioData = audioDataRef.current;

      if (!audioData) return;

      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      // Apply smoothing and amplification
      const amplificationFactor = 2.7; // increase/decrease amplification
      for (let i = 0; i < bufferLength; i++) {
        const normalizedValue = audioData[i];
        const amplifiedValue = Math.tanh(normalizedValue * amplificationFactor) * 128 + 128; // Amplify and scale to [0, 255]
        smoothedData[i] = smoothingFactor * smoothedData[i] + (1 - smoothingFactor) * amplifiedValue;
      }

      canvasCtx.clearRect(0, 0, WIDTH, HEIGHT);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = 'rgb(0, 0, 0)';
      canvasCtx.beginPath();

      const sliceWidth = WIDTH / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = (smoothedData[i] - 128) / 128; // Normalize to [-1, 1]
        const y = (v * HEIGHT * 0.8) + (HEIGHT / 2); // Scale to canvas height and center

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.stroke();
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [audioDataRef]);

  return <canvas ref={canvasRef} width="300" height="150" />;
};

export default AudioVisualizer;
