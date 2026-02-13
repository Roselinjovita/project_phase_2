import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Smile, Frown, Meh, Heart, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EmotionDetector({ webcamFrames, audioBlob, onEmotionDetected }) {
  const [currentEmotion, setCurrentEmotion] = useState(null);
  const [emotionHistory, setEmotionHistory] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const emotionIcons = {
    happy: Smile,
    sad: Frown,
    neutral: Meh,
    frustrated: Frown,
    confident: Heart,
    anxious: Brain,
  };

  const emotionColors = {
    happy: 'text-green-600 bg-green-100',
    confident: 'text-blue-600 bg-blue-100',
    neutral: 'text-gray-600 bg-gray-100',
    frustrated: 'text-red-600 bg-red-100',
    sad: 'text-orange-600 bg-orange-100',
    anxious: 'text-purple-600 bg-purple-100',
  };

  useEffect(() => {
    if (webcamFrames && webcamFrames.length > 0) {
      analyzeEmotion();
    }
  }, [webcamFrames]);

  const analyzeEmotion = async () => {
    if (isAnalyzing || !webcamFrames || webcamFrames.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      // Upload latest frame
      const latestFrame = webcamFrames[webcamFrames.length - 1];
      const imageFile = new File([latestFrame], 'frame.jpg', { type: 'image/jpeg' });
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });

      // Analyze emotion using AI
      const prompt = `Analyze the child's facial expression in this image. 
      Determine their emotional state: happy, confident, neutral, frustrated, sad, or anxious.
      Consider facial features, body language, and overall demeanor.
      This is for a speech therapy session with a child with autism.
      Return the emotion and a confidence score (0-100).`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            emotion: { 
              type: "string",
              enum: ["happy", "confident", "neutral", "frustrated", "sad", "anxious"]
            },
            confidence: { type: "number" },
            description: { type: "string" }
          }
        }
      });

      setCurrentEmotion(result);
      setEmotionHistory(prev => [...prev.slice(-9), result]);
      
      if (onEmotionDetected) {
        onEmotionDetected(result);
      }
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      // Silently fail for emotion detection - don't disrupt the session
      // Use neutral as fallback
      if (!currentEmotion) {
        const fallback = {
          emotion: 'neutral',
          confidence: 50,
          description: 'Emotion detection unavailable'
        };
        setCurrentEmotion(fallback);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getOverallMood = () => {
    if (emotionHistory.length === 0) return null;
    
    const recentEmotions = emotionHistory.slice(-5);
    const positiveCount = recentEmotions.filter(e => 
      e.emotion === 'happy' || e.emotion === 'confident'
    ).length;
    const negativeCount = recentEmotions.filter(e => 
      e.emotion === 'frustrated' || e.emotion === 'sad' || e.emotion === 'anxious'
    ).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  };

  if (!currentEmotion) {
    return (
      <Card className="p-4 bg-white shadow-lg">
        <div className="text-center text-gray-500">
          <Brain className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          <p className="text-sm">Analyzing emotions...</p>
        </div>
      </Card>
    );
  }

  const EmotionIcon = emotionIcons[currentEmotion.emotion] || Meh;
  const overallMood = getOverallMood();

  return (
    <Card className="p-4 bg-white shadow-lg">
      <h3 className="font-semibold text-gray-800 mb-3">Emotional State</h3>
      
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        className={`flex items-center gap-3 p-4 rounded-lg ${emotionColors[currentEmotion.emotion]}`}
      >
        <EmotionIcon className="w-8 h-8" />
        <div className="flex-1">
          <p className="font-semibold capitalize">{currentEmotion.emotion}</p>
          <p className="text-xs opacity-80">{currentEmotion.description}</p>
        </div>
        <div className="text-sm font-bold">{Math.round(currentEmotion.confidence)}%</div>
      </motion.div>

      {/* Overall Mood Indicator */}
      {overallMood && (
        <div className="mt-3 text-center">
          <p className="text-xs text-gray-600 mb-1">Session Mood</p>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
            overallMood === 'positive' ? 'bg-green-100 text-green-700' :
            overallMood === 'negative' ? 'bg-red-100 text-red-700' :
            'bg-gray-100 text-gray-700'
          }`}>
            {overallMood === 'positive' && '😊 Doing Great'}
            {overallMood === 'negative' && '😔 Needs Support'}
            {overallMood === 'neutral' && '😐 Steady'}
          </div>
        </div>
      )}

      {/* Emotion History */}
      <div className="mt-3 flex gap-1 justify-center">
        {emotionHistory.slice(-10).map((emotion, idx) => {
          const Icon = emotionIcons[emotion.emotion] || Meh;
          return (
            <div 
              key={idx} 
              className={`w-6 h-6 rounded-full flex items-center justify-center ${emotionColors[emotion.emotion]}`}
            >
              <Icon className="w-3 h-3" />
            </div>
          );
        })}
      </div>
    </Card>
  );
}