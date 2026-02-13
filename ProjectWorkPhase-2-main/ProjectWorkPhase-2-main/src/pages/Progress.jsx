import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, TrendingUp, Award, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ProgressChart from '../components/progress/ProgressChart';
import { motion } from 'framer-motion';

export default function Progress() {
  const [chartType, setChartType] = useState("line");

  const { data: sessions = [] } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date'),
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ChildProfile.list(),
  });

  // Calculate stats
  const stats = {
    totalSessions: sessions.length,
    avgClarity: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.clarity_score || 0), 0) / sessions.length)
      : 0,
    avgFluency: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessions.length)
      : 0,
    avgConfidence: sessions.length > 0
      ? Math.round(sessions.reduce((sum, s) => sum + (s.confidence_score || 0), 0) / sessions.length)
      : 0,
    improvement: sessions.length >= 2 ? (() => {
      const recent = sessions.slice(0, 5);
      const older = sessions.slice(-5);
      const recentAvg = recent.reduce((sum, s) => 
        sum + ((s.clarity_score + s.fluency_score + s.confidence_score) / 3), 0) / recent.length;
      const olderAvg = older.reduce((sum, s) => 
        sum + ((s.clarity_score + s.fluency_score + s.confidence_score) / 3), 0) / older.length;
      return Math.round(recentAvg - olderAvg);
    })() : 0
  };

  const profile = profiles[0];

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
            Progress Tracking
          </h1>
        </div>

        {/* Profile Info */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">{profile.child_name}</h2>
                    <p className="text-purple-100">
                      {profile.age} years • {profile.primary_language} • {profile.therapy_level}
                    </p>
                  </div>
                  <Award className="w-16 h-16 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Total Sessions</span>
                  <Calendar className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-800">{stats.totalSessions}</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Clarity</span>
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-blue-600">{stats.avgClarity}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Avg Fluency</span>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-green-600">{stats.avgFluency}%</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Improvement</span>
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Chart Type Toggle */}
        {sessions.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center"
          >
            <Tabs value={chartType} onValueChange={setChartType}>
              <TabsList>
                <TabsTrigger value="line">Line Chart</TabsTrigger>
                <TabsTrigger value="bar">Bar Chart</TabsTrigger>
              </TabsList>
            </Tabs>
          </motion.div>
        )}

        {/* Progress Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <ProgressChart sessions={sessions} type={chartType} />
        </motion.div>

        {/* No Data Message */}
        {sessions.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white rounded-xl shadow-md"
          >
            <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 text-lg mb-4">No progress data available yet</p>
            <p className="text-gray-400 mb-6">Complete some therapy sessions to see your progress</p>
            <Link to={createPageUrl('TherapySession')}>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                Start a Session
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}