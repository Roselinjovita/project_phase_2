import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '../utils';
import ExerciseCard from '../components/exercises/ExerciseCard';
import { motion } from 'framer-motion';

export default function Exercises() {
  const [languageFilter, setLanguageFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const navigate = useNavigate();

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
  });

  const filteredExercises = exercises.filter(exercise => {
    const languageMatch = languageFilter === "all" || exercise.language === languageFilter || exercise.language === "Both";
    const difficultyMatch = difficultyFilter === "all" || exercise.difficulty === difficultyFilter;
    return languageMatch && difficultyMatch;
  });

  const handleStartExercise = (exercise) => {
    navigate(createPageUrl('TherapySession'), {
      state: {
        exerciseId: exercise.id,
        autoStart: true  // Skip setup screen and start immediately
      }
    });
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
            Therapy Exercises
          </h1>
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-md p-6"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <Tabs value={languageFilter} onValueChange={setLanguageFilter}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="Tamil">Tamil</TabsTrigger>
                  <TabsTrigger value="English">English</TabsTrigger>
                  <TabsTrigger value="Both">Both</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Difficulty</label>
              <Tabs value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="beginner">Beginner</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </motion.div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise, idx) => (
            <motion.div
              key={exercise.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <ExerciseCard
                exercise={exercise}
                onStart={handleStartExercise}
              />
            </motion.div>
          ))}
        </div>

        {/* No Results */}
        {filteredExercises.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-gray-500 text-lg">No exercises found matching your filters</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}