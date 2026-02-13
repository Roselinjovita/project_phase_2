import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Mic, BookOpen, ArrowUp, Award, ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ProgressChart from '../components/progress/ProgressChart';

export default function Home() {
  const [profile, setProfile] = useState(null);

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ChildProfile.list(),
  });

  const { data: recentSessions = [] } = useQuery({
    queryKey: ['recentSessions'],
    queryFn: () => base44.entities.Session.list('-created_date', 5),
  });

  useEffect(() => {
    if (profiles.length > 0 && !profile) {
      setProfile(profiles[0]);
    }
  }, [profiles, profile]);

  const stats = {
    totalSessions: recentSessions.length,
    avgScore: recentSessions.length > 0
      ? Math.round(
          recentSessions.reduce((sum, s) => 
            sum + ((s.clarity_score || 0) + (s.fluency_score || 0) + (s.confidence_score || 0)) / 3, 0
          ) / recentSessions.length
        )
      : 0,
    improvement: recentSessions.length >= 2
      ? Math.round(
          (((recentSessions[0].clarity_score || 0) + (recentSessions[0].fluency_score || 0) + (recentSessions[0].confidence_score || 0)) / 3) -
          (((recentSessions[recentSessions.length - 1].clarity_score || 0) + (recentSessions[recentSessions.length - 1].fluency_score || 0) + (recentSessions[recentSessions.length - 1].confidence_score || 0)) / 3)
        )
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Speech Therapy Assistant
          </h1>
          <p className="text-lg text-gray-600">
            AI-Powered Bilingual Therapy for Tamil & English
          </p>
          {profile && (
            <div className="inline-block bg-white px-6 py-3 rounded-full shadow-md">
              <p className="text-gray-700">
                Welcome back, <span className="font-semibold text-purple-600">{profile.child_name}</span>! 👋
              </p>
            </div>
          )}
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm mb-1">Total Sessions</p>
                    <p className="text-4xl font-bold">{stats.totalSessions}</p>
                  </div>
                  <Mic className="w-12 h-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm mb-1">Average Score</p>
                    <p className="text-4xl font-bold">{stats.avgScore}%</p>
                  </div>
                  <Award className="w-12 h-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Improvement</p>
                    <p className="text-4xl font-bold">
                      {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                    </p>
                  </div>
                  <ArrowUp className="w-12 h-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Link to={createPageUrl('TherapySession')}>
            <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-blue-400 to-purple-500 text-white h-full">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Start Therapy Session</h3>
                    <p className="text-blue-50">Interactive guided therapy with AI</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link to={createPageUrl('Exercises')}>
            <Card className="hover:shadow-xl transition-all cursor-pointer bg-gradient-to-br from-pink-400 to-orange-500 text-white h-full">
              <CardContent className="p-8">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">Practice Exercises</h3>
                    <p className="text-pink-50">Guided therapy activities</p>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>

        {/* Progress Chart */}
        {recentSessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ProgressChart sessions={recentSessions} type="line" />
          </motion.div>
        )}

        {/* Get Started Message */}
        {recentSessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                <h3 className="text-2xl font-bold text-gray-800 mb-3">Let's Begin Your Journey!</h3>
                <p className="text-gray-600 mb-6">
                  Start your first therapy session to see your progress and receive AI-powered feedback
                </p>
                <Link to={createPageUrl('TherapySession')}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white">
                    <Mic className="w-5 h-5 mr-2" />
                    Start First Session
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}