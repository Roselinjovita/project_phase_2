import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import SessionCard from '../components/sessions/SessionCard';
import FeedbackPanel from '../components/sessions/FeedbackPanel';
import { motion, AnimatePresence } from 'framer-motion';

export default function SessionHistory() {
  const [selectedSession, setSelectedSession] = useState(null);

  const { data: sessions = [], isLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => base44.entities.Session.list('-created_date'),
  });

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
            Session History
          </h1>
        </div>

        {/* Selected Session Detail */}
        <AnimatePresence>
          {selectedSession && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedSession(null)}
                  className="mb-4"
                >
                  ← Back to All Sessions
                </Button>
              </div>
              <FeedbackPanel session={selectedSession} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Sessions Grid */}
        {!selectedSession && (
          <>
            {isLoading ? (
              <div className="text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600 mt-4">Loading sessions...</p>
              </div>
            ) : sessions.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 bg-white rounded-xl shadow-md"
              >
                <p className="text-gray-500 text-lg mb-4">No sessions recorded yet</p>
                <Link to={createPageUrl('TherapySession')}>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    Start Your First Session
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session, idx) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <SessionCard 
                      session={session}
                      onClick={() => setSelectedSession(session)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}