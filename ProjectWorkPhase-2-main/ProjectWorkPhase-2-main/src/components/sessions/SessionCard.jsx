import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Calendar, Clock, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export default function SessionCard({ session, onClick }) {
  const averageScore = Math.round(
    ((session.clarity_score || 0) + (session.fluency_score || 0) + (session.confidence_score || 0)) / 3
  );

  const getScoreColor = (score) => {
    if (score >= 80) return "bg-green-100 text-green-700 border-green-300";
    if (score >= 60) return "bg-yellow-100 text-yellow-700 border-yellow-300";
    return "bg-orange-100 text-orange-700 border-orange-300";
  };

  const languageColors = {
    Tamil: "bg-purple-100 text-purple-700",
    English: "bg-blue-100 text-blue-700",
    Mixed: "bg-indigo-100 text-indigo-700"
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-white" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {session.created_date && !isNaN(new Date(session.created_date).getTime())
                  ? format(new Date(session.created_date), 'MMM d, yyyy')
                  : 'Date unknown'}
              </span>
              <Badge variant="outline" className={languageColors[session.language_used] || "bg-gray-100"}>
                {session.language_used || "Unknown"}
              </Badge>
            </div>
            {session.duration_seconds && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {Math.floor(session.duration_seconds / 60)}:{(session.duration_seconds % 60).toString().padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
          <Badge className={`${getScoreColor(averageScore)} border text-lg px-3 py-1`}>
            {averageScore}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Score Bars */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Clarity</span>
              <span className="font-semibold">{session.clarity_score || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${session.clarity_score || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Fluency</span>
              <span className="font-semibold">{session.fluency_score || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all"
                style={{ width: `${session.fluency_score || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Confidence</span>
              <span className="font-semibold">{session.confidence_score || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${session.confidence_score || 0}%` }}
              />
            </div>
          </div>

          {/* Transcript Preview */}
          {session.transcript && (
            <div className="bg-gray-50 rounded-lg p-3 mt-3">
              <p className="text-sm text-gray-700 line-clamp-2 italic">
                "{session.transcript}"
              </p>
            </div>
          )}

          <Button variant="outline" className="w-full mt-3" onClick={onClick}>
            <Play className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}