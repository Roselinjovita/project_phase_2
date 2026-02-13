import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, UserCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { motion } from 'framer-motion';

export default function Profile() {
  const [formData, setFormData] = useState({
    child_name: '',
    age: '',
    primary_language: 'Both',
    therapy_level: 'beginner',
    focus_areas: [],
    notes: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newFocusArea, setNewFocusArea] = useState('');

  const queryClient = useQueryClient();

  const { data: profiles = [] } = useQuery({
    queryKey: ['profiles'],
    queryFn: () => base44.entities.ChildProfile.list(),
  });

  useEffect(() => {
    if (profiles.length > 0) {
      const profile = profiles[0];
      setFormData({
        child_name: profile.child_name || '',
        age: profile.age || '',
        primary_language: profile.primary_language || 'Both',
        therapy_level: profile.therapy_level || 'beginner',
        focus_areas: profile.focus_areas || [],
        notes: profile.notes || ''
      });
    } else {
      setIsEditing(true);
    }
  }, [profiles]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ChildProfile.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      setIsEditing(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ChildProfile.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['profiles']);
      setIsEditing(false);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      age: parseInt(formData.age)
    };

    if (profiles.length > 0) {
      updateMutation.mutate({ id: profiles[0].id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleAddFocusArea = () => {
    if (newFocusArea.trim()) {
      setFormData(prev => ({
        ...prev,
        focus_areas: [...prev.focus_areas, newFocusArea.trim()]
      }));
      setNewFocusArea('');
    }
  };

  const handleRemoveFocusArea = (index) => {
    setFormData(prev => ({
      ...prev,
      focus_areas: prev.focus_areas.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link to={createPageUrl('Home')}>
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Child Profile
          </h1>
        </div>

        {/* Profile Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="w-6 h-6" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="child_name">Child's Name *</Label>
                    <Input
                      id="child_name"
                      value={formData.child_name}
                      onChange={(e) => setFormData({...formData, child_name: e.target.value})}
                      disabled={!isEditing}
                      required
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="age">Age (years) *</Label>
                    <Input
                      id="age"
                      type="number"
                      min="1"
                      max="20"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      disabled={!isEditing}
                      required
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primary_language">Primary Language</Label>
                    <Select
                      value={formData.primary_language}
                      onValueChange={(value) => setFormData({...formData, primary_language: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tamil">Tamil</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="therapy_level">Therapy Level</Label>
                    <Select
                      value={formData.therapy_level}
                      onValueChange={(value) => setFormData({...formData, therapy_level: value})}
                      disabled={!isEditing}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Focus Areas</Label>
                  {isEditing && (
                    <div className="flex gap-2 mt-2 mb-3">
                      <Input
                        value={newFocusArea}
                        onChange={(e) => setNewFocusArea(e.target.value)}
                        placeholder="Add focus area (e.g., pronunciation)"
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFocusArea())}
                      />
                      <Button type="button" onClick={handleAddFocusArea} variant="outline">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {formData.focus_areas.map((area, idx) => (
                      <div key={idx} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-2">
                        <span>{area}</span>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => handleRemoveFocusArea(idx)}
                            className="text-purple-500 hover:text-purple-700"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    disabled={!isEditing}
                    rows={4}
                    className="mt-2"
                    placeholder="Any additional information about therapy preferences or needs..."
                  />
                </div>

                <div className="flex gap-4 justify-end">
                  {!isEditing ? (
                    <Button type="button" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      {profiles.length > 0 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => {
                            setIsEditing(false);
                            const profile = profiles[0];
                            setFormData({
                              child_name: profile.child_name || '',
                              age: profile.age || '',
                              primary_language: profile.primary_language || 'Both',
                              therapy_level: profile.therapy_level || 'beginner',
                              focus_areas: profile.focus_areas || [],
                              notes: profile.notes || ''
                            });
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                      <Button 
                        type="submit" 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={createMutation.isLoading || updateMutation.isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Profile
                      </Button>
                    </>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}