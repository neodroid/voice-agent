import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { RetellWebClient } from "retell-client-js-sdk";
import AudioVisualizer from "@/components/AudioVisualizer";
import { FaPhone, FaPhoneSlash } from 'react-icons/fa';

export default function Home({ 
  logoUrl = "https://usebrainbase.com/bb_logo_black.svg", 
  backgroundColor = "#FFF", 
  foregroundColor = "#373737", 
  font = "'Messina Sans', 'Neue Machina', sans-serif",
  buttonColor = "#F1F1F1",
  buttonTextColor = "#373737",
  brandName = "Brainbase",
  buttonBorderColor = "transparent"
}: {
  logoUrl?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  font?: string;
  buttonColor?: string;
  buttonTextColor?: string;
  brandName?: string;
  buttonBorderColor?: string;
}) {
  const [phase, setPhase] = useState<"start" | "call" | "end">("start");
  const [isConnecting, setIsConnecting] = useState(false);
  const [retellClient, setRetellClient] = useState<RetellWebClient | null>(null);
  const [callEnded, setCallEnded] = useState(false);

  const handleStartCall = async () => {
    setIsConnecting(true);
    try {
      // Get access token
      const response = await fetch('/api/call', { method: 'POST' });
      const data = await response.json();

      // Retell client
      const client = new RetellWebClient();
      await client.startCall({
        accessToken: data.accessToken,
        sampleRate: 24000,
        emitRawAudioSamples: true,
      });

      setRetellClient(client);
      setPhase("call");
    } catch (error) {
      console.error('Error setting up call:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCallEnded = useCallback(() => {
    if (callEnded) return;
    setCallEnded(true);
    setRetellClient(null);
    setPhase("end");
  }, [callEnded]);

  const handleUserEndCall = useCallback(() => {
    if (callEnded) return;
    if (retellClient) {
      retellClient.stopCall();
    }
  }, [callEnded, retellClient]);
  

  const handleRestart = () => {
    setCallEnded(false);
    setPhase("start");
  };
  

  const customStyles = {
    backgroundColor,
    color: foregroundColor,
    fontFamily: font,
  };

  const buttonStyles = {
    backgroundColor: buttonColor,
    color: buttonTextColor,
    border: `1px solid ${buttonBorderColor}`, 
  };

  return (
    <div style={customStyles} className={`min-h-screen ${backgroundColor} flex flex-col items-center justify-center`}>
      <header className="absolute top-0 left-0 p-4 flex items-center gap-4">
        <Image src={logoUrl} alt="Logo" width={30} height={30} />
        <h1 className="text-lg" style={{ color: foregroundColor }}>{brandName}</h1>
      </header>

      {/* <div className="bg-[#F3F4F6] shadow-lg rounded-md p-8 max-w-md w-full"> */}
      <div className="rounded-md p-8 max-w-md w-full">
        {phase === "start" && <StartPage handleStartCall={handleStartCall} buttonStyles={buttonStyles} isConnecting={isConnecting} />}
        {phase === "call" && <CallPage handleUserEndCall={handleUserEndCall} handleCallEnded={handleCallEnded} buttonStyles={buttonStyles} retellClient={retellClient} />}
        {phase === "end" && <EndPage handleRestart={handleRestart} buttonStyles={buttonStyles} />}
      </div>
    </div>
  );
}

const StartPage = ({ handleStartCall, buttonStyles, isConnecting }: { handleStartCall: () => void; buttonStyles: React.CSSProperties; isConnecting: boolean }) => (
  <div className="flex flex-col gap-8 items-center">
    <h2 className="text-2xl font-bold mb-4">Start a Call</h2>
    <button
      onClick={handleStartCall}
      className="rounded-md font-semibold text-lg py-2 px-6 transition-all w-full hover:brightness-90 flex items-center justify-center gap-2"
      style={buttonStyles}
      disabled={isConnecting}
    >
      <FaPhone />
      {isConnecting ? "Connecting..." : "Call Now"}
    </button>
  </div>
);

const CallPage = ({ handleUserEndCall, handleCallEnded, buttonStyles, retellClient }: { handleUserEndCall: () => void; handleCallEnded: () => void; buttonStyles: React.CSSProperties; retellClient: RetellWebClient | null }) => {
  const [transcript, setTranscript] = useState<{role: string, content: string}[]>([]);
  const aiAudioDataRef = useRef<Float32Array>(new Float32Array(2048));

  useEffect(() => {
    if (retellClient) {

      retellClient.on("update", (update) => {
        console.log("Received update:", update);
        if (update.transcript && Array.isArray(update.transcript)) {
          setTranscript(update.transcript);
        }
      });

      retellClient.on("call_ended", () => {
        handleCallEnded();
      });

      retellClient.on('audio', (audio) => {
        const buffer = aiAudioDataRef.current;
        const incomingDataLength = audio.length;

        if (incomingDataLength >= buffer.length) {
          aiAudioDataRef.current.set(audio.subarray(incomingDataLength - buffer.length));
        } else {
          buffer.set(buffer.subarray(incomingDataLength));
          buffer.set(audio, buffer.length - incomingDataLength);
        }
      });

      retellClient.on("error", (error) => {
        console.error("An error occurred:", error);
        handleCallEnded()
      });

      return () => {
        if (retellClient) {
          retellClient.removeAllListeners();
        }
      };
    }
  }, [retellClient, handleCallEnded]);

  // Only last 2 mesages
  const displayedTranscript = transcript.slice(-2);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedTranscript]);

  return (
    <div className="flex flex-col gap-8 items-center h-[500px]">
      <div className="flex items-center gap-4">
        <div className="w-4 h-4 rounded-full bg-green-400 animate-pulse"></div>
        <h2 className="text-2xl font-bold">In Call</h2>
      </div>
      {aiAudioDataRef && <AudioVisualizer audioDataRef={aiAudioDataRef} />}
      <div className="w-full flex-grow overflow-y-auto">
        {displayedTranscript.length > 0 && (
          <div className="space-y-2">
            {displayedTranscript.map((item, index) => (
              <p 
                key={index} 
                className={`p-2 rounded ${item.role === 'agent' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}
              >
                <strong>{item.role === 'agent' ? 'Kate' : 'You'}:</strong> {item.content}
              </p>
            ))}
            <div ref={transcriptEndRef} />
          </div>
        )}
      </div>
      <button
        onClick={handleUserEndCall}
        className="rounded-md font-semibold text-lg py-2 px-6 transition-all flex items-center justify-center gap-2 w-full hover:brightness-90"
        style={buttonStyles}
      >
        <FaPhoneSlash />
        End Call
      </button>
    </div>
  );
};


const EndPage = ({ handleRestart, buttonStyles }: { handleRestart: () => void; buttonStyles: React.CSSProperties }) => (
  <div className="flex flex-col gap-8 items-center">
      <div className="flex items-center gap-4">
        <div className="w-4 h-4 rounded-full bg-red-400"></div>
        <h2 className="text-2xl font-bold">Call ended</h2>
      </div>
    <button
      onClick={handleRestart}
      className="rounded-md font-semibold text-lg py-2 px-6 transition-all w-full hover:brightness-90 flex items-center justify-center gap-2"
      style={buttonStyles}
    >
      <FaPhone />
      Start New Call
    </button>
  </div>
);

export async function getServerSideProps() {
  // fetch from db
  const customProps = {
    logoUrl: "https://usebrainbase.com/bb_logo_black.svg",
    backgroundColor: "#FFF",
    foregroundColor: "#373737",
    font: "'Messina Sans', 'Neue Machina', sans-serif",
    buttonColor: "#F1F1F1",
    buttonTextColor: "#373737",
    brandName: "Brainbase",
    // buttonBorderColor: "#a9a9a9"
  };

  return {
    props: customProps,
  };
}
