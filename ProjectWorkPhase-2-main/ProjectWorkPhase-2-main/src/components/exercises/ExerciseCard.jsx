import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Mic, Target, BarChart3, MessageCircle } from 'lucide-react';

export default function ExerciseCard({ exercise, onStart }) {
  const difficultyColors = {
    beginner: "bg-green-100 text-green-700 border-green-300",
    intermediate: "bg-yellow-100 text-yellow-700 border-yellow-300",
    advanced: "bg-red-100 text-red-700 border-red-300"
  };

  const categoryIcons = {
    pronunciation: Target,
    fluency: BarChart3,
    vocabulary: BookOpen,
    conversation: MessageCircle,
    sounds: Mic
  };

  const CategoryIcon = categoryIcons[exercise.category] || BookOpen;

  return (
    <Card className="hover:shadow-lg transition-all bg-white h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
              <CategoryIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">{exercise.title}</CardTitle>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="outline" className={difficultyColors[exercise.difficulty]}>
            {exercise.difficulty}
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-700">
            {exercise.language}
          </Badge>
          <Badge variant="outline" className="bg-blue-100 text-blue-700">
            {exercise.category}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <p className="text-gray-700 mb-4 flex-1">{exercise.prompt}</p>
        
        {exercise.example_words && exercise.example_words.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">Practice Words:</p>
            <div className="flex flex-wrap gap-2">
              {exercise.example_words.map((word, idx) => (
                <span key={idx} className="text-sm bg-white px-3 py-1 rounded-full border border-blue-200 text-blue-700">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        <Button 
          onClick={() => onStart(exercise)}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
        >
          <Mic className="w-4 h-4 mr-2" />
          Start Exercise
        </Button>
      </CardContent>
    </Card>
  );
}