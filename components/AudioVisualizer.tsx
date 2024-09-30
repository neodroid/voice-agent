import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  audio: MediaStream;
}

interface WebkitAudioContext extends AudioContext {
  webkitAudioContext: AudioContext;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ audio }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const AudioContextClass = (window.AudioContext || (window as unknown as WebkitAudioContext).webkitAudioContext);
    const audioContext = new AudioContextClass();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(audio);
    source.connect(analyser);

    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const canvas = canvasRef.current;
    const canvasCtx = canvas.getContext('2d');

    if (!canvasCtx) return;

    let animationFrameId: number;
    const updateInterval = 40;
    const smoothingFactor = 0.8;
    const smoothedData = new Float32Array(bufferLength).fill(128);
    let lastUpdateTime = 0;

    const draw = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(draw);

      if (currentTime - lastUpdateTime < updateInterval) {
        return;
      }

      lastUpdateTime = currentTime;

      const WIDTH = canvas.width;
      const HEIGHT = canvas.height;

      analyser.getByteTimeDomainData(dataArray);

      // Apply smoothing and amplification
      const amplificationFactor = 2.7; // Adjust this value to increase/decrease amplification
      for (let i = 0; i < bufferLength; i++) {
        const normalizedValue = (dataArray[i] - 128) / 128; // Normalize to [-1, 1]
        const amplifiedValue = Math.tanh(normalizedValue * amplificationFactor) * 128 + 128; // Amplify and bring back to [0, 255]
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
      source.disconnect();
      audioContext.close();
    };
  }, [audio]);

  return <canvas ref={canvasRef} width="300" height="150" />;
};

export default AudioVisualizer;