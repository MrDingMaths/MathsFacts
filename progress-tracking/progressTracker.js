// progressTracker.js - Core tracking and data management
class ProgressTracker {
    constructor() {
        this.STORAGE_KEY = 'mf_progress_data_v4';
        this.SCHEMA_VERSION = 4;
        this.MAX_ENTRIES_PER_DRILL = 500;
        this.MAX_MISTAKES_PER_LEVEL = 100;
        this.initializeStorage();
    }

    // Initialize and migrate storage if needed
    initializeStorage() {
        let storedData = this.loadData();

        // If no data found with current key, check for older storage keys
        if (!storedData) {
            storedData = this.loadDataFromOldKeys();
        }

        if (!storedData || storedData.version < this.SCHEMA_VERSION) {
            this.migrateData(storedData);
        }
    }

    // Check for data in older storage keys
    loadDataFromOldKeys() {
        const oldKeys = [
            'mf_progress_data_v3',
            'mf_progress_data_v2',
            'mf_progress_data_v1',
            'mf_progress_data' // Check even older versions
        ];

        for (const oldKey of oldKeys) {
            try {
                const stored = localStorage.getItem(oldKey);
                if (stored) {
                    const data = JSON.parse(stored);
                    console.log(`Found old progress data in ${oldKey}, migrating...`);
                    console.log('Old data structure:', {
                        version: data.version,
                        sessions: data.sessions?.length || 0,
                        drillHistory: Object.keys(data.drillHistory || {}).length,
                        hasTimestamps: data.sessions?.some(s => s.timestamp) || false
                    });
                    return data;
                }
            } catch (error) {
                console.warn(`Error loading data from ${oldKey}:`, error);
            }
        }

        console.log('No old progress data found in localStorage');
        return null;
    }

    // Data migration system
    migrateData(oldData) {
        console.log('Migrating progress data to version', this.SCHEMA_VERSION);

        let newData = {
            version: this.SCHEMA_VERSION,
            sessions: [],
            drillHistory: {}
        };

        if (oldData) {
            console.log('Migrating from version', oldData.version, 'to version', this.SCHEMA_VERSION);
        } else {
            console.log('Creating new progress data structure');
        }

        if (oldData) {
            // Migrate from v1 to v2
            if (oldData.version === 1) {
                // Convert old format to new format
                if (oldData.sessions) {
                    newData.sessions = oldData.sessions.map(session => ({
                        ...session,
                        timestamp: session.date || session.timestamp,
                        deviceInfo: this.getDeviceInfo()
                    }));
                }
                // Preserve drill history if it exists
                if (oldData.drillHistory) {
                    newData.drillHistory = oldData.drillHistory;
                }
            }
            // Migrate from v2 to v3 - preserve existing data
            else if (oldData.version === 2) {
                newData.sessions = oldData.sessions || [];
                newData.drillHistory = oldData.drillHistory || {};
            }
            // Migrate from v3 to v4 - add baseline tracking for cumulative improvement
            else if (oldData.version === 3) {
                newData.sessions = oldData.sessions || [];
                newData.drillHistory = this.addBaselineTracking(oldData.drillHistory || {});
            }
            // For any version, preserve existing data
            else {
                if (oldData.sessions) {
                    newData.sessions = oldData.sessions;
                }
                if (oldData.drillHistory) {
                    newData.drillHistory = oldData.drillHistory;
                }
            }
        }

        this.saveData(newData);
    }

    // Add baseline tracking to existing drill history (for v3→v4 migration)
    addBaselineTracking(drillHistory) {
        const updated = {};
        Object.keys(drillHistory).forEach(key => {
            const drill = drillHistory[key];
            updated[key] = {
                ...drill,
                // Use earliest attempt as baseline, or bestTime if no attempts
                firstAttemptTime: drill.attempts && drill.attempts.length > 0
                    ? drill.attempts[0].time
                    : drill.bestTime,
                firstAttemptDate: drill.attempts && drill.attempts.length > 0
                    ? drill.attempts[0].timestamp
                    : drill.bestTimeDate
            };

            // Recalculate improvements with cumulative metric
            if (updated[key].improvements && updated[key].firstAttemptTime) {
                updated[key].improvements = updated[key].improvements.map(imp => ({
                    ...imp,
                    percentImprovementFromBaseline: ((updated[key].firstAttemptTime - imp.newBest) / updated[key].firstAttemptTime * 100).toFixed(1)
                }));
            }
        });
        return updated;
    }

    // Save progress data with validation
    recordProgress(levelKey, time, streak = 15) {
        try {
            const data = this.loadData();
            const timestamp = Date.now();

            // Create session entry
            const session = {
                id: this.generateId(),
                levelKey: levelKey,
                time: time,
                streak: streak,
                timestamp: timestamp,
                date: new Date(timestamp).toISOString(),
                deviceInfo: this.getDeviceInfo(),
                averageTimePerQuestion: time / streak
            };

            // Add to sessions
            data.sessions = data.sessions || [];
            data.sessions.push(session);

            // Update drill history
            data.drillHistory = data.drillHistory || {};
            if (!data.drillHistory[levelKey]) {
                data.drillHistory[levelKey] = {
                    attempts: [],
                    bestTime: null,
                    bestTimeDate: null,
                    firstAttemptTime: null,
                    firstAttemptDate: null,
                    totalAttempts: 0,
                    averageTime: 0,
                    lastAttempt: null,
                    improvements: []
                };
            }

            const drillData = data.drillHistory[levelKey];

            // Set first attempt time if this is the first time
            if (drillData.firstAttemptTime === null) {
                drillData.firstAttemptTime = time;
                drillData.firstAttemptDate = timestamp;
            }

            // Track improvement
            if (drillData.bestTime === null || time < drillData.bestTime) {
                if (drillData.bestTime !== null) {
                    // Calculate cumulative improvement from baseline
                    const cumulativeImprovement = drillData.firstAttemptTime
                        ? ((drillData.firstAttemptTime - time) / drillData.firstAttemptTime * 100).toFixed(1)
                        : '0.0';

                    drillData.improvements.push({
                        previousBest: drillData.bestTime,
                        newBest: time,
                        improvement: drillData.bestTime - time,
                        percentImprovement: ((drillData.bestTime - time) / drillData.bestTime * 100).toFixed(1),
                        percentImprovementFromBaseline: cumulativeImprovement,
                        date: timestamp
                    });
                }
                drillData.bestTime = time;
                drillData.bestTimeDate = timestamp;
            }

            // Add attempt
            drillData.attempts.push({
                time: time,
                timestamp: timestamp,
                isBest: time === drillData.bestTime
            });

            // Cleanup old entries if exceeding limit
            if (drillData.attempts.length > this.MAX_ENTRIES_PER_DRILL) {
                drillData.attempts = drillData.attempts.slice(-this.MAX_ENTRIES_PER_DRILL);
            }

            // Update statistics
            drillData.totalAttempts = drillData.attempts.length;
            drillData.lastAttempt = timestamp;
            drillData.averageTime = this.calculateAverage(drillData.attempts.map(a => a.time));

            // Cleanup old sessions (keep last 1000)
            if (data.sessions.length > 1000) {
                data.sessions = data.sessions.slice(-1000);
            }

            this.saveData(data);
            return session;

        } catch (error) {
            console.error('Error recording progress:', error);
            this.handleCorruptedData();
            return null;
        }
    }

    // Get progress data for a specific drill
    getDrillProgress(levelKey) {
        const data = this.loadData();
        return data.drillHistory?.[levelKey] || null;
    }

    // Get all progress data
    getAllProgress() {
        const data = this.loadData();
        return data.drillHistory || {};
    }

    // Get recent sessions
    getRecentSessions(limit = 10) {
        const data = this.loadData();
        return (data.sessions || [])
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, limit);
    }

    // Get progress summary
    getProgressSummary() {
        const data = this.loadData();
        const drillHistory = data.drillHistory || {};
        
        const summary = {
            totalDrills: Object.keys(drillHistory).length,
            totalAttempts: 0,
            totalTimeSpent: 0,
            drillsWithImprovement: 0,
            averageImprovement: 0,
            recentActivity: []
        };

        Object.entries(drillHistory).forEach(([key, drill]) => {
            summary.totalAttempts += drill.totalAttempts;
            summary.totalTimeSpent += drill.attempts.reduce((sum, a) => sum + a.time, 0);
            if (drill.improvements.length > 0) {
                summary.drillsWithImprovement++;
            }
        });

        // Calculate average improvement
        const allImprovements = Object.values(drillHistory)
            .flatMap(d => d.improvements)
            .map(i => parseFloat(i.percentImprovement));
        
        if (allImprovements.length > 0) {
            summary.averageImprovement = (allImprovements.reduce((a, b) => a + b, 0) / allImprovements.length).toFixed(1);
        }

        return summary;
    }


    // Get progress summary
    getProgressSummary() {
        const data = this.loadData();
        const drillHistory = data.drillHistory || {};

        const summary = {
            totalDrills: Object.keys(drillHistory).length,
            totalAttempts: 0,
            totalTimeSpent: 0,
            drillsWithImprovement: 0,
            averageImprovement: 0,
            recentActivity: []
        };

        Object.entries(drillHistory).forEach(([key, drill]) => {
            summary.totalAttempts += drill.totalAttempts;
            summary.totalTimeSpent += drill.attempts.reduce((sum, a) => sum + a.time, 0);
            if (drill.improvements.length > 0) {
                summary.drillsWithImprovement++;
            }
        });

        // Calculate average cumulative improvement across all drills
        const drillsWithBaseline = Object.values(drillHistory)
            .filter(d => d.firstAttemptTime && d.bestTime && d.firstAttemptTime > d.bestTime);

        if (drillsWithBaseline.length > 0) {
            const cumulativeImprovements = drillsWithBaseline.map(d =>
                ((d.firstAttemptTime - d.bestTime) / d.firstAttemptTime * 100)
            );
            summary.averageImprovement = (cumulativeImprovements.reduce((a, b) => a + b, 0) / cumulativeImprovements.length).toFixed(1);
        }

        return summary;
    }

    // Data validation
    validateData(data) {
        if (!data || typeof data !== 'object') return false;
        if (!data.version || data.version < this.SCHEMA_VERSION) return false;
        if (!Array.isArray(data.sessions)) return false;
        if (!data.drillHistory || typeof data.drillHistory !== 'object') return false;

        // Note: v4 adds firstAttemptTime/firstAttemptDate fields, but they're optional for backward compatibility

        return true;
    }

    // Handle corrupted data
    handleCorruptedData() {
        console.error('Corrupted data detected, creating backup and resetting...');
        const backup = localStorage.getItem(this.STORAGE_KEY);
        if (backup) {
            localStorage.setItem(this.STORAGE_KEY + '_backup_' + Date.now(), backup);
        }
        this.resetData();
    }

    // Reset data
    resetData() {
        const newData = {
            version: this.SCHEMA_VERSION,
            sessions: [],
            drillHistory: {}
        };
        this.saveData(newData);
    }

    // Helper functions
    loadData() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (!stored) return null;
            
            const data = JSON.parse(stored);
            if (!this.validateData(data)) {
                throw new Error('Invalid data structure');
            }
            return data;
        } catch (error) {
            console.error('Error loading progress data:', error);
            return null;
        }
    }

    saveData(data) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving progress data:', error);
            // Handle quota exceeded
            if (error.name === 'QuotaExceededError') {
                this.cleanupOldData();
                try {
                    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
                } catch (retryError) {
                    console.error('Failed to save after cleanup:', retryError);
                }
            }
        }
    }

    cleanupOldData() {
        const data = this.loadData();
        if (!data) return;

        // Keep only last 30 days of sessions
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        data.sessions = (data.sessions || []).filter(s => s.timestamp > thirtyDaysAgo);

        // Limit attempts per drill
        Object.keys(data.drillHistory || {}).forEach(key => {
            const drill = data.drillHistory[key];
            if (drill.attempts.length > this.MAX_ENTRIES_PER_DRILL / 2) {
                drill.attempts = drill.attempts.slice(-this.MAX_ENTRIES_PER_DRILL / 2);
            }
        });

        this.saveData(data);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getDeviceInfo() {
        return {
            userAgent: navigator.userAgent,
            screenWidth: window.screen.width,
            screenHeight: window.screen.height,
            platform: navigator.platform
        };
    }

    calculateAverage(numbers) {
        if (numbers.length === 0) return 0;
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
    }

    // Import data from backup
}