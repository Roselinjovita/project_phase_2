import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { TrendingUp } from 'lucide-react';

export default function ProgressChart({ sessions, type = "line" }) {
  if (!sessions || sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No session data available yet</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  // Filter sessions that have at least some score data
  const validSessions = sessions.filter(session =>
  (session.clarity_score !== undefined ||
    session.fluency_score !== undefined ||
    session.confidence_score !== undefined)
  );

  // If no sessions with data, show empty state
  if (validSessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-gray-500">No session data available for chart</p>
        </CardContent>
      </Card>
    );
  }

  // Check if we have valid dates to sort by
  const hasValidDates = validSessions.some(s =>
    s.created_date && !isNaN(new Date(s.created_date).getTime())
  );

  let processedData;

  if (hasValidDates) {
    // If we have dates, sort by date
    processedData = [...validSessions]
      .sort((a, b) => {
        const dateA = a.created_date ? new Date(a.created_date) : new Date(0);
        const dateB = b.created_date ? new Date(b.created_date) : new Date(0);
        return dateA - dateB;
      });
  } else {
    // If no valid dates, assume API returns Newest->Oldest
    // So distinct reverse to get Oldest->Newest order for chart
    processedData = [...validSessions].reverse();
  }

  const chartData = processedData.map((session, index) => {
    const dateObj = session.created_date ? new Date(session.created_date) : null;
    const isValidDate = dateObj && !isNaN(dateObj.getTime());

    return {
      date: isValidDate ? format(dateObj, 'MMM d') : `Session ${index + 1}`,
      clarity: session.clarity_score || 0,
      fluency: session.fluency_score || 0,
      confidence: session.confidence_score || 0,
      average: Math.round(
        ((session.clarity_score || 0) + (session.fluency_score || 0) + (session.confidence_score || 0)) / 3
      )
    };
  });

  return (
    <Card className="shadow-lg">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Progress Over Time
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="clarity"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Clarity"
              />
              <Line
                type="monotone"
                dataKey="fluency"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: '#22c55e', r: 4 }}
                name="Fluency"
              />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#a855f7"
                strokeWidth={3}
                dot={{ fill: '#a855f7', r: 4 }}
                name="Confidence"
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend />
              <Bar dataKey="clarity" fill="#3b82f6" name="Clarity" />
              <Bar dataKey="fluency" fill="#22c55e" name="Fluency" />
              <Bar dataKey="confidence" fill="#a855f7" name="Confidence" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}