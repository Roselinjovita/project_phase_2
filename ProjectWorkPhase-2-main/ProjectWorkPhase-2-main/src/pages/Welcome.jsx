import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Mic, Brain, Heart, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Welcome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-12 h-12 text-purple-600" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Speech Therapy AI
            </h1>
          </div>
          <p className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto">
            AI-Powered Bilingual Speech Therapy for Children with Autism
          </p>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Supporting Tamil & English language development through adaptive therapy sessions
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Mic className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Interactive Sessions</h3>
                <p className="text-gray-600">
                  Guided therapy sessions with real-time feedback and emotion detection
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI Analysis</h3>
                <p className="text-gray-600">
                  Advanced AI provides detailed feedback on clarity, fluency, and confidence
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow h-full">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Emotion Aware</h3>
                <p className="text-gray-600">
                  Adapts difficulty based on child's emotional state during practice
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Why Choose Our Platform?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Bilingual Support</h4>
                <p className="text-gray-600">Practice in Tamil, English, or both languages</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Adaptive Learning</h4>
                <p className="text-gray-600">Difficulty adjusts based on performance and emotions</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Progress Tracking</h4>
                <p className="text-gray-600">Detailed charts and reports to monitor improvement</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-gray-800 mb-1">Personalized Feedback</h4>
                <p className="text-gray-600">AI-generated insights and encouragement after each session</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <Card className="bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 text-white shadow-2xl">
            <CardContent className="p-12">
              <Zap className="w-16 h-16 mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-lg mb-8 text-blue-50 max-w-2xl mx-auto">
                Create your child's profile and begin the journey to improved speech and confidence
              </p>
              <Link to={createPageUrl('Profile')}>
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-6">
                  Create Profile & Start
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-gray-500 mt-12 text-sm"
        >
          Designed specifically for children with Autism Spectrum Disorder (ASD)
        </motion.p>
      </div>
    </div>
  );
}