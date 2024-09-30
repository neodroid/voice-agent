import { useState, useEffect } from "react";
import Image from "next/image";
import AudioVisualizer from "@/components/AudioVisualizer";

export default function Home({ 
  logoUrl, 
  backgroundColor, 
  foregroundColor, 
  font,
  buttonColor,
  buttonTextColor,
  brandName
}: {
  logoUrl: string;
  backgroundColor: string;
  foregroundColor: string;
  font: string;
  buttonColor: string;
  buttonTextColor: string;
  brandName: string;
}) {
  const [phase, setPhase] = useState<"start" | "call" | "end">("start");

  const handleStartCall = () => setPhase("call");
  const handleEndCall = () => setPhase("end");
  const handleRestart = () => setPhase("start");

  const customStyles = {
    backgroundColor,
    color: foregroundColor,
    fontFamily: font,
  };

  const buttonStyles = {
    backgroundColor: buttonColor,
    color: buttonTextColor,
  };

  return (
    <div style={customStyles} className={`min-h-screen ${backgroundColor} flex flex-col items-center justify-center`}>
      <header className="absolute top-0 left-0 p-4 flex items-center gap-4">
        <Image src={logoUrl} alt="Logo" width={30} height={30} />
        <h1 className="text-lg" style={{ color: foregroundColor }}>{brandName}</h1>
      </header>

      <div className="bg-white shadow-lg rounded-md p-8 max-w-md w-full">
        {phase === "start" && <StartPage handleStartCall={handleStartCall} buttonStyles={buttonStyles} />}
        {phase === "call" && <CallPage handleEndCall={handleEndCall} buttonStyles={buttonStyles} />}
        {phase === "end" && <EndPage handleRestart={handleRestart} buttonStyles={buttonStyles} />}
      </div>
    </div>
  );
}

const StartPage = ({ handleStartCall, buttonStyles }: { handleStartCall: () => void; buttonStyles: React.CSSProperties }) => (
  <div className="flex flex-col gap-8 items-center">
    <h2 className="text-2xl font-bold mb-4">Start a New Call</h2>
    <button
      onClick={handleStartCall}
      className="rounded-md font-semibold text-lg py-2 px-6 transition-all w-full"
      style={buttonStyles}
    >
      Start Call
    </button>
  </div>
);

const CallPage = ({ handleEndCall, buttonStyles }: { handleEndCall: () => void; buttonStyles: React.CSSProperties }) => {
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getAudioStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setAudioStream(stream);
      } catch (error) {
        console.error('Error accessing the microphone:', error);
      }
    };

    getAudioStream();

    return () => {
      if (audioStream) {
        audioStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col gap-8 items-center">
      <h2 className="text-2xl font-bold mb-4">In Call</h2>
      {audioStream && <AudioVisualizer audio={audioStream} />}
      <p className="text-gray-600 mb-4">Transcript will appear here...</p>
      <button
        onClick={handleEndCall}
        className="rounded-md font-semibold text-lg py-2 px-6 transition-all flex items-center justify-center gap-2 w-full"
        style={buttonStyles}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="white" />
          <rect x="8" y="8" width="8" height="8" fill="red" />
        </svg>
        End Call
      </button>
    </div>
  );
};

const EndPage = ({ handleRestart, buttonStyles }: { handleRestart: () => void; buttonStyles: React.CSSProperties }) => (
  <div className="flex flex-col gap-8 items-center">
    <h2 className="text-2xl font-bold mb-4">Call Ended</h2>
    <button
      onClick={handleRestart}
      className="rounded-md font-semibold text-lg py-2 px-6 transition-all w-full"
      style={buttonStyles}
    >
      Start New Call
    </button>
  </div>
);
export async function getServerSideProps() {
  // fetch from db
  const customProps = {
    logoUrl: "https://usebrainbase.com/bb_logo_black.svg",
    backgroundColor: "#F3F4F6",
    foregroundColor: "#000000",
    font: "'Messina Sans', 'Neue Machina', sans-serif",
    buttonColor: "#4B5563",
    buttonTextColor: "#FFFFFF",
    brandName: "Brainbase",
  };

  return {
    props: customProps,
  };
}