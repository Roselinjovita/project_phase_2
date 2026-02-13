import React from 'react';
import { Card } from '@/components/ui/card';
import { Volume2, Mic, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function WordDisplay({ word, language, isRecording, onStartRecord, onStopRecord }) {
  const speakWord = () => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = language === 'Tamil' ? 'ta-IN' : 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  React.useEffect(() => {
    // Auto-play word when displayed
    speakWord();
  }, [word]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
    >
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl">
        <div className="text-center space-y-6">
          {/* Word Display */}
          <motion.h2 
            className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            animate={{ scale: isRecording ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: isRecording ? Infinity : 0 }}
          >
            {word}
          </motion.h2>

          {/* Instructions */}
          <div className="space-y-4">
            <p className="text-xl text-gray-700">
              {isRecording ? 'Recording... Say the word clearly' : 'Press record and say this word'}
            </p>
            
            <div className="flex gap-3 justify-center">
              <Button
                onClick={speakWord}
                variant="outline"
                size="lg"
                disabled={isRecording}
              >
                <Volume2 className="w-5 h-5 mr-2" />
                Hear Word
              </Button>

              {!isRecording ? (
                <Button
                  onClick={onStartRecord}
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white"
                >
                  <Mic className="w-5 h-5 mr-2" />
                  Start Recording
                </Button>
              ) : (
                <Button
                  onClick={onStopRecord}
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white animate-pulse"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop Recording
                </Button>
              )}
            </div>
          </div>

          {/* Recording Indicator */}
          {isRecording && (
            <motion.div 
              className="flex justify-center gap-2 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}