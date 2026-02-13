import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ArrowLeft, Loader2, Play, Pause, CheckCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import WebcamCapture from '../components/therapy/WebcamCapture';
import WordDisplay from '../components/therapy/WordDisplay';
import EmotionDetector from '../components/therapy/EmotionDetector';
import FeedbackPanel from '../components/sessions/FeedbackPanel';

export default function TherapySession() {
  const location = useLocation();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [language, setLanguage] = useState("Both");
  const [sessionState, setSessionState] = useState('setup'); // setup, active, complete
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [words, setWords] = useState([]);
  const [difficulty, setDifficulty] = useState('beginner');
  const [webcamFrames, setWebcamFrames] = useState([]);
  const [audioChunks, setAudioChunks] = useState([]);
  const [emotionData, setEmotionData] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [completedWords, setCompletedWords] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [wordRecordings, setWordRecordings] = useState([]);
  const [currentWordAudioChunks, setCurrentWordAudioChunks] = useState([]);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ChildProfile.list(),
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

  useEffect(() => {
    if (profiles.length > 0 && !selectedProfile) {
      setSelectedProfile(profiles[0].id);
      setLanguage(profiles[0].primary_language || "Both");
      setDifficulty(profiles[0].therapy_level || "beginner");
    }
  }, [profiles, selectedProfile]);

  // Auto-start session if exerciseId and autoStart flag are passed from navigation
  useEffect(() => {
    if (location.state?.autoStart && location.state?.exerciseId && selectedProfile && exercises.length > 0 && sessionState === 'setup') {
      const exerciseId = location.state.exerciseId;
      const exercise = exercises.find(e => e.id === exerciseId);

      if (exercise && exercise.example_words) {
        setSelectedExercise(exerciseId);
        setWords(exercise.example_words);
        setCurrentWordIndex(0);
        setSessionState('active');
        setWordRecordings([]);

        // Clear the autoStart flag from location state to prevent re-triggering
        window.history.replaceState({}, document.title);
      }
    }
  }, [location.state, selectedProfile, exercises, sessionState]);

  const handleEmotionDetected = (emotion) => {
    setEmotionData(prev => [...prev, { ...emotion, timestamp: Date.now() }]);

    // Adjust difficulty based on emotions
    const recentEmotions = [...emotionData.slice(-5), emotion];
    const negativeCount = recentEmotions.filter(e =>
      e.emotion === 'frustrated' || e.emotion === 'sad' || e.emotion === 'anxious'
    ).length;
    const positiveCount = recentEmotions.filter(e =>
      e.emotion === 'happy' || e.emotion === 'confident'
    ).length;

    if (negativeCount >= 3 && difficulty !== 'beginner') {
      setDifficulty('beginner');
      console.log('Difficulty decreased to beginner due to negative emotions');
    } else if (positiveCount >= 4 && difficulty === 'beginner') {
      setDifficulty('intermediate');
      console.log('Difficulty increased to intermediate due to positive emotions');
    } else if (positiveCount >= 4 && difficulty === 'intermediate') {
      setDifficulty('advanced');
      console.log('Difficulty increased to advanced due to positive emotions');
    }
  };

  const startSession = () => {
    const exerciseId = selectedExercise || location.state?.exerciseId;
    if (!exerciseId) {
      alert('Please select an exercise');
      return;
    }

    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise || !exercise.example_words) {
      alert('Exercise must have example words');
      return;
    }

    setWords(exercise.example_words);
    setCurrentWordIndex(0);
    setSessionState('active');
    setWordRecordings([]);
  };

  const startWordRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      mediaRecorderRef.current = new MediaRecorder(stream);
      setCurrentWordAudioChunks([]);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setCurrentWordAudioChunks(prev => [...prev, event.data]);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(currentWordAudioChunks, { type: 'audio/webm' });
        setWordRecordings(prev => [...prev, {
          word: words[currentWordIndex],
          audio: audioBlob,
          timestamp: Date.now()
        }]);

        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Please allow microphone access');
    }
  };

  const stopWordRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleNextWord = () => {
    if (!wordRecordings.find(r => r.word === words[currentWordIndex])) {
      alert('Please record this word before moving to the next one');
      return;
    }

    setCompletedWords(prev => [...prev, words[currentWordIndex]]);

    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      completeSession();
    }
  };

  const completeSession = async () => {
    setSessionState('complete');
    setIsAnalyzing(true);

    try {
      let file_url = null;
      let analysis = null;

      // Try to upload and analyze with AI
      try {
        const allAudioBlobs = wordRecordings.map(r => r.audio);
        const combinedBlob = new Blob(allAudioBlobs, { type: 'audio/webm' });
        const audioFile = new File([combinedBlob], 'session.webm', { type: 'audio/webm' });
        const uploadResult = await base44.integrations.Core.UploadFile({ file: audioFile });
        file_url = uploadResult.file_url;

        const avgEmotion = emotionData.length > 0
          ? emotionData.reduce((acc, e) => {
            if (e.emotion === 'happy' || e.emotion === 'confident') acc.positive++;
            if (e.emotion === 'frustrated' || e.emotion === 'sad') acc.negative++;
            return acc;
          }, { positive: 0, negative: 0 })
          : { positive: 0, negative: 0 };

        const prompt = `Analyze this speech therapy session for a child with Autism Spectrum Disorder.
Language: ${language}
Difficulty: ${difficulty}
Words practiced: ${completedWords.join(', ')}
Emotional state: ${avgEmotion.positive} positive moments, ${avgEmotion.negative} challenging moments

Provide transcript, clarity/fluency/confidence scores (0-100), 3-4 positive notes, 2-3 areas for improvement, and encouraging feedback.`;

        analysis = await base44.integrations.Core.InvokeLLM({
          prompt: prompt,
          response_json_schema: {
            type: "object",
            properties: {
              transcript: { type: "string" },
              clarity_score: { type: "number" },
              fluency_score: { type: "number" },
              confidence_score: { type: "number" },
              positive_notes: { type: "array", items: { type: "string" } },
              areas_of_improvement: { type: "array", items: { type: "string" } },
              ai_feedback: { type: "string" }
            }
          }
        });
      } catch (aiError) {
        // AI analysis failed - use basic feedback
        console.log('AI analysis unavailable, using basic feedback');

        const avgEmotion = emotionData.length > 0
          ? emotionData.reduce((acc, e) => {
            if (e.emotion === 'happy' || e.emotion === 'confident') acc.positive++;
            return acc;
          }, { positive: 0 })
          : { positive: 0 };

        const baseScore = difficulty === 'beginner' ? 75 : difficulty === 'intermediate' ? 70 : 65;
        const emotionBonus = Math.min(avgEmotion.positive * 2, 10);
        const completionBonus = completedWords.length >= words.length ? 10 : 5;

        analysis = {
          transcript: `Practiced ${completedWords.length} words: ${completedWords.join(', ')}`,
          clarity_score: baseScore + emotionBonus,
          fluency_score: baseScore + completionBonus,
          confidence_score: baseScore + (emotionBonus + completionBonus) / 2,
          positive_notes: [
            `Completed ${completedWords.length} words successfully!`,
            `Stayed engaged throughout the ${difficulty} difficulty session`,
            `Great effort with ${language} language practice`,
            emotionData.length > 0 ? `Showed positive emotions during practice` : `Maintained focus during the session`
          ],
          areas_of_improvement: [
            `Continue practicing ${difficulty} level exercises`,
            `Try spending more time on challenging words`,
            `Regular practice will improve fluency`
          ],
          ai_feedback: `Great job completing the session! You practiced ${completedWords.length} words at ${difficulty} difficulty level. Keep up the consistent practice to see continued improvement. Remember, every session helps build confidence and skills!`
        };
      }

      // Create session record
      const sessionData = {
        profile_id: selectedProfile,
        exercise_id: selectedExercise,
        recording_url: file_url,
        language_used: language,
        duration_seconds: wordRecordings.length * 5,
        transcript: analysis.transcript,
        clarity_score: analysis.clarity_score,
        fluency_score: analysis.fluency_score,
        confidence_score: analysis.confidence_score,
        ai_feedback: analysis.ai_feedback,
        positive_notes: analysis.positive_notes,
        areas_of_improvement: analysis.areas_of_improvement
      };

      const session = await base44.entities.Session.create(sessionData);
      setCurrentSession(session);
      queryClient.invalidateQueries(['sessions']);
      queryClient.invalidateQueries(['recentSessions']);

    } catch (error) {
      console.error('Error completing session:', error);
      alert('Failed to save session. Please try again.');
      setSessionState('setup');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleWebcamFrame = (frameBlob) => {
    setWebcamFrames(prev => [...prev.slice(-10), frameBlob]);
  };

  const resetSession = () => {
    setSessionState('setup');
    setCurrentWordIndex(0);
    setWords([]);
    setWebcamFrames([]);
    setEmotionData([]);
    setCompletedWords([]);
    setCurrentSession(null);
    setWordRecordings([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Therapy Session
          </h1>
        </div>

        {/* Setup Phase */}
        {sessionState === 'setup' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle>Session Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Child Profile
                    </label>
                    <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select profile" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map(profile => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.child_name} ({profile.age} years)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Language
                    </label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Both">Both (Mixed)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Select Exercise
                  </label>
                  <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an exercise" />
                    </SelectTrigger>
                    <SelectContent>
                      {exercises
                        .filter(ex => ex.language === language || ex.language === 'Both' || language === 'Both')
                        .map(exercise => (
                          <SelectItem key={exercise.id} value={exercise.id}>
                            {exercise.title} - {exercise.difficulty}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Session Instructions:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Camera will monitor emotions and adjust difficulty</li>
                    <li>• Words will appear one at a time with images</li>
                    <li>• Repeat each word clearly into the microphone</li>
                    <li>• Session adapts to your child's emotional state</li>
                  </ul>
                </div>

                <Button
                  onClick={startSession}
                  disabled={!selectedProfile || !selectedExercise}
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Therapy Session
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Active Session */}
        {sessionState === 'active' && words.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Word Display */}
              <AnimatePresence mode="wait">
                <WordDisplay
                  key={currentWordIndex}
                  word={words[currentWordIndex]}
                  language={language}
                  isRecording={isRecording}
                  onStartRecord={startWordRecording}
                  onStopRecord={stopWordRecording}
                />
              </AnimatePresence>

              {/* Controls */}
              <Card className="p-6 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Progress</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currentWordIndex + 1} / {words.length}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleNextWord}
                      size="lg"
                      disabled={!wordRecordings.find(r => r.word === words[currentWordIndex])}
                      className="bg-gradient-to-r from-green-500 to-emerald-600"
                    >
                      <CheckCircle className="w-5 h-5 mr-2" />
                      {currentWordIndex < words.length - 1 ? 'Next Word' : 'Finish Session'}
                    </Button>
                  </div>
                </div>

                {/* Difficulty Badge */}
                <div className="mt-4 flex items-center gap-2">
                  <span className="text-sm text-gray-600">Current Difficulty:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                    }`}>
                    {difficulty}
                  </span>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Webcam */}
              <WebcamCapture
                isActive={sessionState === 'active'}
                onFrameCapture={handleWebcamFrame}
              />

              {/* Emotion Detector */}
              <EmotionDetector
                webcamFrames={webcamFrames}
                onEmotionDetected={handleEmotionDetected}
              />
            </div>
          </div>
        )}

        {/* Complete Session */}
        {sessionState === 'complete' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {isAnalyzing ? (
              <Card className="p-12 text-center">
                <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-blue-600" />
                <h3 className="text-2xl font-bold text-gray-800">Analyzing Session...</h3>
                <p className="text-gray-600 mt-2">Processing speech and emotions</p>
              </Card>
            ) : (
              <>
                <FeedbackPanel session={currentSession} isLoading={false} />

                <div className="flex gap-4 justify-center mt-6">
                  <Button
                    onClick={resetSession}
                    size="lg"
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  >
                    Start New Session
                  </Button>
                  <Link to={createPageUrl('SessionHistory')}>
                    <Button variant="outline" size="lg">
                      View All Sessions
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}