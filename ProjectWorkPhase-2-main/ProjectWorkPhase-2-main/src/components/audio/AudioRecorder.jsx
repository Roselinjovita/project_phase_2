import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AudioRecorder({ onRecordingComplete, language = "Both" }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        onRecordingComplete?.(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access to record speech');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) clearInterval(timerRef.current);
      }
      setIsPaused(!isPaused);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="p-8 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Recording Animation */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="relative"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="absolute inset-0 bg-red-400 rounded-full blur-xl"
              />
              <div className="relative w-32 h-32 bg-red-500 rounded-full flex items-center justify-center">
                <Mic className="w-16 h-16 text-white" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static Microphone */}
        {!isRecording && !audioURL && (
          <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
            <Mic className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Playback Control */}
        {audioURL && !isRecording && (
          <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-16 h-16 text-white" />
          </div>
        )}

        {/* Timer */}
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-red-600"
          >
            {formatTime(recordingTime)}
          </motion.div>
        )}

        {/* Status Text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-800">
            {isRecording 
              ? (isPaused ? "Recording Paused" : "Recording in Progress...") 
              : audioURL 
              ? "Recording Complete!" 
              : "Ready to Record"}
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            {isRecording 
              ? `Speak clearly in ${language}` 
              : audioURL 
              ? "Listen to your recording or start a new one" 
              : `Press the button to start recording in ${language}`}
          </p>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-4">
          {!isRecording && !audioURL && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-6 text-lg rounded-full shadow-lg"
            >
              <Mic className="w-6 h-6 mr-2" />
              Start Recording
            </Button>
          )}

          {isRecording && (
            <>
              <Button
                onClick={pauseRecording}
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full"
              >
                {isPaused ? <Play className="w-6 h-6 mr-2" /> : <Pause className="w-6 h-6 mr-2" />}
                {isPaused ? "Resume" : "Pause"}
              </Button>
              <Button
                onClick={stopRecording}
                size="lg"
                className="bg-red-500 hover:bg-red-600 text-white px-8 py-6 text-lg rounded-full"
              >
                <Square className="w-6 h-6 mr-2" />
                Stop
              </Button>
            </>
          )}

          {audioURL && !isRecording && (
            <>
              <Button
                onClick={togglePlayback}
                size="lg"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-6 text-lg rounded-full"
              >
                {isPlaying ? <Pause className="w-6 h-6 mr-2" /> : <Play className="w-6 h-6 mr-2" />}
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <Button
                onClick={() => {
                  setAudioURL(null);
                  setRecordingTime(0);
                }}
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg rounded-full"
              >
                <Mic className="w-6 h-6 mr-2" />
                New Recording
              </Button>
            </>
          )}
        </div>

        {/* Hidden Audio Element for Playback */}
        {audioURL && (
          <audio
            ref={audioRef}
            src={audioURL}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        )}
      </div>
    </Card>
  );
}