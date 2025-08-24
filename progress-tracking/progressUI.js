// progressUI.js - UI components for progress tracking
class ProgressUI {
    constructor(progressTracker, progressChart, progressShare) {
        this.progressTracker = progressTracker;
        this.progressChart = progressChart;
        this.progressShare = progressShare;
        this.isVisible = false;
        this.currentView = 'overview';
        this.init();
    }

    init() {
        this.createProgressModal();
        this.createProgressButton();
        this.attachEventListeners();
    }

    // Create progress button that appears on the main screen
    createProgressButton() {
        const button = document.createElement('button');
        button.id = 'progress-btn';
        button.className = 'progress-btn';
        button.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
            </svg>
            <span>Progress</span>
        `;
        
        // Add to settings screen
        const settingsScreen = document.getElementById('settings-screen');
        if (settingsScreen) {
            settingsScreen.appendChild(button);
        }
    }

    // Create the main progress modal
    createProgressModal() {
        const modal = document.createElement('div');
        modal.id = 'progress-modal';
        modal.className = 'progress-modal hidden';
        modal.innerHTML = `
            <div class="progress-modal-content">
                <div class="progress-header">
                    <h2>Progress</h2>
                    <button class="close-btn" id="close-progress">×</button>
                </div>
                
                <div class="progress-tabs">
                    <button class="tab-btn active" data-view="overview">Overview</button>
                    <button class="tab-btn" data-view="drills">Improvement</button>
                    <button class="tab-btn" data-view="history">History</button>
                </div>
                
                <div class="progress-content">
                    <!-- Overview Tab -->
                    <div id="overview-content" class="tab-content active">
                        <div class="summary-cards">
                            <div class="summary-card">
                                <div class="card-icon">📚</div>
                                <div class="card-value" id="total-drills">0</div>
                                <div class="card-label">Drills Practiced</div>
                            </div>
                            <div class="summary-card">
                                <div class="card-icon">✅</div>
                                <div class="card-value" id="total-attempts">0</div>
                                <div class="card-label">Total Attempts</div>
                            </div>
                            <div class="summary-card">
                                <div class="card-icon">⏱️</div>
                                <div class="card-value" id="total-time">0:00</div>
                                <div class="card-label">Time Spent</div>
                            </div>
                            <div class="summary-card">
                                <div class="card-icon">📈</div>
                                <div class="card-value" id="avg-improvement">0%</div>
                                <div class="card-label">Avg Improvement</div>
                            </div>
                        </div>
                        
                        <div class="recent-activity">
                            <h3>Recent Activity</h3>
                            <div id="recent-sessions"></div>
                        </div>
                    </div>
                    
                    <!-- Drill Progress Tab -->
                    <div id="drills-content" class="tab-content">
                        <div class="drill-selector">
                            <label for="drill-select">Select Drill:</label>
                            <select id="drill-select">
                                <option value="">Choose a drill...</option>
                            </select>
                        </div>
                        
                        <div class="chart-container">
                            <canvas id="progress-chart"></canvas>
                        </div>
                        
                        <div class="drill-stats" id="drill-stats"></div>
                    </div>
                    
                    <!-- History Tab -->
                    <div id="history-content" class="tab-content">
                        <div class="history-controls">
                            <button id="clear-data" class="btn btn-danger">Clear All Data</button>
                        </div>
                        
                        <div class="history-table">
                            <table id="history-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Drill</th>
                                        <th>Time</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody id="history-tbody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
                <div class="progress-actions">
                    <button id="print-report" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                        </svg>
                        Print Report
                    </button>
                    <button id="download-chart" class="btn btn-secondary">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                        </svg>
                        Download Chart
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    // Attach event listeners
    attachEventListeners() {
        // Progress button
        document.getElementById('progress-btn')?.addEventListener('click', () => this.show());
        
        // Close button
        document.getElementById('close-progress')?.addEventListener('click', () => this.hide());
        
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.view));
        });
        
        // Drill selector
        document.getElementById('drill-select')?.addEventListener('change', (e) => {
            this.showDrillProgress(e.target.value);
        });
        
        // Remove comparison button listener
        
        // Actions
        document.getElementById('print-report')?.addEventListener('click', () => this.progressShare.generatePrintableReport());
        document.getElementById('download-chart')?.addEventListener('click', () => this.progressShare.downloadChartImage());
        
        // Data management
        document.getElementById('clear-data')?.addEventListener('click', () => this.confirmClearData());
        
        // Close modal on background click
        document.getElementById('progress-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'progress-modal') {
                this.hide();
            }
        });
    }

    // Show the progress modal
    show() {
        const modal = document.getElementById('progress-modal');
        modal.classList.remove('hidden');
        this.isVisible = true;
        this.updateContent();
        this.populateSelectors();
    }

    // Hide the progress modal
    hide() {
        const modal = document.getElementById('progress-modal');
        modal.classList.add('hidden');
        this.isVisible = false;
    }

    // Switch between tabs
    switchTab(view) {
        this.currentView = view;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
        
        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${view}-content`)?.classList.add('active');
        
        // Initialize specific views AFTER making them visible
        setTimeout(() => {
            if (view === 'drills') {
                this.initializeDrillChart();
                // Re-trigger the current selection if any
                const drillSelect = document.getElementById('drill-select');
                if (drillSelect && drillSelect.value) {
                    this.showDrillProgress(drillSelect.value);
                }
            }
            // Removed comparison case
        }, 100);
    }

    // Update overview content
    updateContent() {
        const summary = this.progressTracker.getProgressSummary();
        
        // Update summary cards
        document.getElementById('total-drills').textContent = summary.totalDrills;
        document.getElementById('total-attempts').textContent = summary.totalAttempts;
        document.getElementById('total-time').textContent = this.progressShare.formatTime(summary.totalTimeSpent);
        document.getElementById('avg-improvement').textContent = `${summary.averageImprovement || 0}%`;
        
        // Update recent sessions
        const recentSessions = this.progressTracker.getRecentSessions(10);
        const sessionsHtml = recentSessions.map(session => {
            const date = new Date(session.timestamp);
            return `
                <div class="session-item">
                    <div class="session-date">${date.toLocaleDateString()}</div>
                    <div class="session-drill">${this.progressChart.getLevelNameFromKey(session.levelKey)}</div>
                    <div class="session-time">${this.progressShare.formatTime(session.time)}</div>
                </div>
            `;
        }).join('');
        
        document.getElementById('recent-sessions').innerHTML = sessionsHtml || '<p>No recent activity</p>';
        
        // Update history table
        this.updateHistoryTable();
    }

    // Populate drill selectors
    populateSelectors() {
        const allProgress = this.progressTracker.getAllProgress();
        const drillKeys = Object.keys(allProgress);
        
        // Populate drill selector
        const drillSelect = document.getElementById('drill-select');
        drillSelect.innerHTML = '<option value="">Choose a drill...</option>';
        drillKeys.forEach(key => {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = this.progressChart.getLevelNameFromKey(key);
            drillSelect.appendChild(option);
        });
        
        // Remove comparison checkboxes population
    }

    // Initialize drill chart
    initializeDrillChart() {
        // Make sure we're working with the right canvas
        const chartContainer = document.querySelector('#drills-content .chart-container');
        if (!chartContainer) {
            console.error('Chart container not found');
            return;
        }
        
        let canvas = document.getElementById('progress-chart');
        if (!canvas) {
            // Create canvas if it doesn't exist
            canvas = document.createElement('canvas');
            canvas.id = 'progress-chart';
            chartContainer.appendChild(canvas);
        } else if (canvas.parentElement !== chartContainer) {
            // Move canvas to correct container if it's elsewhere
            chartContainer.appendChild(canvas);
        }
        
        // Update chart instance with canvas
        this.progressChart.canvas = canvas;
        this.progressChart.ctx = canvas.getContext('2d');
    }

    // Show drill progress
    showDrillProgress(levelKey) {
        if (!levelKey) {
            console.log('No level key provided');
            return;
        }
        
        console.log('Showing progress for:', levelKey);
        
        // Ensure canvas is ready
        this.initializeDrillChart();
        
        const levelName = this.progressChart.getLevelNameFromKey(levelKey);
        
        // Make sure we have the canvas before trying to create chart
        if (!this.progressChart.canvas || !this.progressChart.ctx) {
            console.error('Canvas not initialized');
            return;
        }
        
        this.progressChart.initChart(levelKey, levelName);
        
        // Update drill stats
        const drill = this.progressTracker.getDrillProgress(levelKey);
        if (drill) {
            const statsHtml = `
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-label">Best Time</div>
                        <div class="stat-value">${this.progressShare.formatTime(drill.bestTime)}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Average Time</div>
                        <div class="stat-value">${this.progressShare.formatTime(Math.round(drill.averageTime))}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Total Attempts</div>
                        <div class="stat-value">${drill.totalAttempts}</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-label">Improvements</div>
                        <div class="stat-value">${drill.improvements.length}</div>
                    </div>
                </div>
            `;
            document.getElementById('drill-stats').innerHTML = statsHtml;
        }
    }

    // Update history table
    updateHistoryTable() {
        const sessions = this.progressTracker.getRecentSessions(50);
        const tbody = document.getElementById('history-tbody');
        
        if (tbody) {
            tbody.innerHTML = sessions.map(session => {
                const date = new Date(session.timestamp);
                const drill = this.progressTracker.getDrillProgress(session.levelKey);
                const isBest = drill && session.time === drill.bestTime;
                
                return `
                    <tr class="${isBest ? 'best-time' : ''}">
                        <td>${date.toLocaleString()}</td>
                        <td>${this.progressChart.getLevelNameFromKey(session.levelKey)}</td>
                        <td>${this.progressShare.formatTime(session.time)}</td>
                        <td>${isBest ? '⭐ Personal Best!' : `${session.averageTimePerQuestion.toFixed(1)}s/question`}</td>
                    </tr>
                `;
            }).join('');
        }
    }

    // Confirm data clear
    confirmClearData() {
        if (confirm('Are you sure you want to clear all progress data? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your progress. Are you absolutely sure?')) {
                this.progressTracker.resetData();
                alert('All progress data has been cleared.');
                this.updateContent();
                this.populateSelectors();
            }
        }
    }
}