// Local API Client - Standalone replacement for Base44 SDK
// Uses localStorage for data persistence

// Generate unique IDs
const generateId = () => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Entity Manager - Generic CRUD operations
class EntityManager {
    constructor(entityName) {
        this.entityName = entityName;
        this.storageKey = `local_${entityName}`;
    }

    // Get all entities
    list() {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // Get entity by ID
    get(id) {
        const entities = this.list();
        const entity = entities.find(e => e.id === id);
        if (!entity) {
            throw new Error(`${this.entityName} with id ${id} not found`);
        }
        return entity;
    }

    // Create new entity
    create(data) {
        const entities = this.list();
        const newEntity = {
            id: generateId(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...data
        };
        entities.push(newEntity);
        localStorage.setItem(this.storageKey, JSON.stringify(entities));
        return newEntity;
    }

    // Update entity
    update(id, data) {
        const entities = this.list();
        const index = entities.findIndex(e => e.id === id);
        if (index === -1) {
            throw new Error(`${this.entityName} with id ${id} not found`);
        }
        entities[index] = {
            ...entities[index],
            ...data,
            updated_at: new Date().toISOString()
        };
        localStorage.setItem(this.storageKey, JSON.stringify(entities));
        return entities[index];
    }

    // Delete entity
    delete(id) {
        const entities = this.list();
        const filtered = entities.filter(e => e.id !== id);
        if (filtered.length === entities.length) {
            throw new Error(`${this.entityName} with id ${id} not found`);
        }
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return { success: true };
    }
}

// Mock AI Analysis
const mockAIAnalysis = (sessionData) => {
    const { language, difficulty, completedWords, emotionData } = sessionData;

    // Calculate emotion scores
    const avgEmotion = emotionData && emotionData.length > 0
        ? emotionData.reduce((acc, e) => {
            if (e.emotion === 'happy' || e.emotion === 'confident') acc.positive++;
            if (e.emotion === 'frustrated' || e.emotion === 'sad') acc.negative++;
            return acc;
        }, { positive: 0, negative: 0 })
        : { positive: 0, negative: 0 };

    // Calculate base scores
    const baseScore = difficulty === 'beginner' ? 75 : difficulty === 'intermediate' ? 70 : 65;
    const emotionBonus = Math.min(avgEmotion.positive * 2, 10);
    const completionBonus = completedWords && completedWords.length >= 5 ? 10 : 5;

    return {
        transcript: `Practiced ${completedWords ? completedWords.length : 0} words: ${completedWords ? completedWords.join(', ') : 'N/A'}`,
        clarity_score: Math.min(baseScore + emotionBonus, 100),
        fluency_score: Math.min(baseScore + completionBonus, 100),
        confidence_score: Math.min(baseScore + (emotionBonus + completionBonus) / 2, 100),
        positive_notes: [
            `Completed ${completedWords ? completedWords.length : 0} words successfully!`,
            `Stayed engaged throughout the ${difficulty} difficulty session`,
            `Great effort with ${language} language practice`,
            avgEmotion.positive > 0 ? `Showed ${avgEmotion.positive} positive emotional moments` : `Maintained focus during the session`
        ],
        areas_of_improvement: [
            `Continue practicing ${difficulty} level exercises`,
            `Try spending more time on challenging words`,
            `Regular practice will improve fluency`
        ],
        ai_feedback: `Great job completing the session! You practiced ${completedWords ? completedWords.length : 0} words at ${difficulty} difficulty level. Keep up the consistent practice to see continued improvement. Remember, every session helps build confidence and skills!`
    };
};

// Local Client
export const localClient = {
    // Entities
    entities: {
        ChildProfile: new EntityManager('ChildProfile'),
        Exercise: new EntityManager('Exercise'),
        Session: new EntityManager('Session')
    },

    // Integrations
    integrations: {
        Core: {
            // Mock file upload - converts to data URL
            UploadFile: async ({ file }) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        resolve({
                            file_url: reader.result, // Data URL
                            file_name: file.name,
                            file_size: file.size,
                            file_type: file.type
                        });
                    };
                    reader.readAsDataURL(file);
                });
            },

            // Mock LLM invocation
            InvokeLLM: async ({ prompt, response_json_schema }) => {
                // Extract session data from prompt
                const languageMatch = prompt.match(/Language: (\w+)/);
                const difficultyMatch = prompt.match(/Difficulty: (\w+)/);
                const wordsMatch = prompt.match(/Words practiced: ([^\n]+)/);
                const emotionMatch = prompt.match(/Emotional state: (\d+) positive moments, (\d+) challenging moments/);

                const sessionData = {
                    language: languageMatch ? languageMatch[1] : 'Both',
                    difficulty: difficultyMatch ? difficultyMatch[1] : 'beginner',
                    completedWords: wordsMatch ? wordsMatch[1].split(', ') : [],
                    emotionData: emotionMatch ? [
                        ...Array(parseInt(emotionMatch[1])).fill({ emotion: 'happy' }),
                        ...Array(parseInt(emotionMatch[2])).fill({ emotion: 'frustrated' })
                    ] : []
                };

                return mockAIAnalysis(sessionData);
            }
        }
    },

    // Auth
    auth: {
        me: async () => {
            const user = localStorage.getItem('local_user');
            if (!user) {
                throw new Error('Not authenticated');
            }
            return JSON.parse(user);
        },

        login: (userData) => {
            const user = {
                id: generateId(),
                email: userData.email || 'user@local.com',
                name: userData.name || 'Local User',
                ...userData
            };
            localStorage.setItem('local_user', JSON.stringify(user));
            return user;
        },

        logout: (redirectUrl) => {
            localStorage.removeItem('local_user');
            if (redirectUrl) {
                window.location.href = redirectUrl;
            }
        },

        redirectToLogin: (returnUrl) => {
            // For local client, just auto-login
            const user = {
                id: generateId(),
                email: 'user@local.com',
                name: 'Local User'
            };
            localStorage.setItem('local_user', JSON.stringify(user));
            if (returnUrl) {
                window.location.href = returnUrl;
            }
        }
    }
};

// Initialize default user if not exists
if (!localStorage.getItem('local_user')) {
    localClient.auth.login({
        email: 'user@local.com',
        name: 'Local User'
    });
}

// Initialize sample data if entities are empty
const initializeSampleData = () => {
    // Sample exercises
    if (localClient.entities.Exercise.list().length === 0) {
        const sampleExercises = [
            {
                title: 'Basic Words - Tamil',
                language: 'Tamil',
                difficulty: 'beginner',
                description: 'Practice basic Tamil words',
                example_words: ['அம்மா', 'அப்பா', 'வீடு', 'பூ', 'நீர்']
            },
            {
                title: 'Basic Words - English',
                language: 'English',
                difficulty: 'beginner',
                description: 'Practice basic English words',
                example_words: ['cat', 'dog', 'house', 'tree', 'water']
            },
            {
                title: 'Animals - Both',
                language: 'Both',
                difficulty: 'intermediate',
                description: 'Learn animal names in both languages',
                example_words: ['cat - பூனை', 'dog - நாய்', 'bird - பறவை', 'fish - மீன்', 'cow - மாடு']
            },
            {
                title: 'Colors - English',
                language: 'English',
                difficulty: 'beginner',
                description: 'Practice color names',
                example_words: ['red', 'blue', 'green', 'yellow', 'orange']
            },
            {
                title: 'Numbers - Tamil',
                language: 'Tamil',
                difficulty: 'intermediate',
                description: 'Practice Tamil numbers',
                example_words: ['ஒன்று', 'இரண்டு', 'மூன்று', 'நான்கு', 'ஐந்து']
            }
        ];

        sampleExercises.forEach(exercise => {
            localClient.entities.Exercise.create(exercise);
        });
    }
};

// Initialize sample data on load
initializeSampleData();

// Export as default for compatibility
export default localClient;
