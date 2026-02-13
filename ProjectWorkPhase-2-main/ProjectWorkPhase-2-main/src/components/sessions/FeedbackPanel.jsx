import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, TrendingUp, Target, Award, Zap, Heart, Brain, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackPanel({ session, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-white shadow-lg">
        <CardContent className="p-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="text-gray-600">Analyzing speech patterns...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!session) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  const getScoreMessage = (score) => {
    if (score >= 90) return "Excellent! 🌟";
    if (score >= 80) return "Great Work! 👏";
    if (score >= 70) return "Good Job! 👍";
    if (score >= 60) return "Keep Practicing! 💪";
    return "Let's Improve! 📈";
  };

  const averageScore = Math.round(
    ((session.clarity_score || 0) + (session.fluency_score || 0) + (session.confidence_score || 0)) / 3
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg">
        <CardHeader className="border-b bg-white/50">
          <CardTitle className="flex items-center justify-between text-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              Session Feedback
            </div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
            >
              <Badge className={`${getScoreColor(averageScore)} text-lg px-4 py-1`}>
                {getScoreMessage(averageScore)}
              </Badge>
            </motion.div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          
          {/* Overall Progress */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-600" />
                Overall Performance
              </h4>
              <span className="text-3xl font-bold text-purple-600">{averageScore}%</span>
            </div>
            <Progress value={averageScore} className="h-3 mb-2" />
            <p className="text-sm text-gray-600 mt-2">
              {averageScore >= 80 ? "You're doing amazing! Keep up the excellent work!" :
               averageScore >= 60 ? "Good progress! A few more sessions and you'll be great!" :
               "Every session makes you better! Keep practicing!"}
            </p>
          </motion.div>

          {/* Scores Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Speech Clarity</span>
                <Target className="w-5 h-5 text-blue-500" />
              </div>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(session.clarity_score || 0)}`}>
                {session.clarity_score || 0}
                <span className="text-xl">/100</span>
              </div>
              <Progress value={session.clarity_score || 0} className="h-2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Fluency</span>
                <Zap className="w-5 h-5 text-green-500" />
              </div>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(session.fluency_score || 0)}`}>
                {session.fluency_score || 0}
                <span className="text-xl">/100</span>
              </div>
              <Progress value={session.fluency_score || 0} className="h-2" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Confidence</span>
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div className={`text-4xl font-bold mb-2 ${getScoreColor(session.confidence_score || 0)}`}>
                {session.confidence_score || 0}
                <span className="text-xl">/100</span>
              </div>
              <Progress value={session.confidence_score || 0} className="h-2" />
            </motion.div>
          </div>

          {/* Transcript */}
          {session.transcript && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Transcription
              </h4>
              <p className="text-gray-700 leading-relaxed italic">"{session.transcript}"</p>
            </div>
          )}

          {/* AI Feedback */}
          {session.ai_feedback && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Insights
              </h4>
              <p className="text-gray-700 leading-relaxed">{session.ai_feedback}</p>
            </div>
          )}

          {/* Positive Notes */}
          {session.positive_notes && session.positive_notes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-md"
            >
              <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2 text-lg">
                <Award className="w-6 h-6" />
                Awesome Achievements! 🌟
              </h4>
              <ul className="space-y-3">
                {session.positive_notes.map((note, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.1 }}
                    className="flex items-start gap-3 text-green-800 bg-white/50 p-3 rounded-lg"
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{note}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Areas of Improvement */}
          {session.areas_of_improvement && session.areas_of_improvement.length > 0 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200 shadow-md"
            >
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2 text-lg">
                <Target className="w-6 h-6" />
                Focus Areas for Next Session 🎯
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {session.areas_of_improvement.map((area, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + idx * 0.1 }}
                    className="bg-white p-3 rounded-lg border border-blue-200 flex items-start gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-blue-700 text-sm font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-blue-800 font-medium">{area}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}