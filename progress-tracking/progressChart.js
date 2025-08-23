// progressChart.js - Chart visualization with Chart.js
class ProgressChart {
    constructor(canvasId, progressTracker) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.ctx = null;
        this.progressTracker = progressTracker;
        this.chart = null;
        this.currentDrill = null;
        // Don't auto-initialize canvas here, let UI handle it
    }

    // Initialize chart for a specific drill
    initChart(levelKey, levelName) {
        console.log('InitChart called for:', levelKey, levelName);
        
        // Make sure we have a canvas
        if (!this.canvas) {
            this.canvas = document.getElementById('progress-chart');
            if (this.canvas) {
                this.ctx = this.canvas.getContext('2d');
            }
        }
        
        if (!this.ctx) {
            console.error('Canvas context not found');
            return;
        }
        
        this.currentDrill = levelKey;
        const drillData = this.progressTracker.getDrillProgress(levelKey);
        
        console.log('Drill data:', drillData);
        
        if (!drillData || !drillData.attempts || drillData.attempts.length === 0) {
            this.showNoDataMessage();
            return;
        }
        
        const chartData = this.prepareChartData(drillData, levelName);
        console.log('Chart data prepared:', chartData);
        
        this.createChart(chartData);
    }

    // Prepare data for chart
    prepareChartData(drillData, levelName) {
        return {
            levelName: levelName,
            attempts: drillData.attempts,
            improvements: drillData.improvements || []
        };
    }

    // Create Chart.js chart
    createChart(chartData) {
        console.log('Creating chart with data:', chartData);
        
        // Destroy existing chart if it exists
        if (this.chart) {
            console.log('Destroying existing chart');
            this.chart.destroy();
            this.chart = null;
        }
        
        // Make sure Chart.js is loaded
        if (typeof Chart === 'undefined') {
            console.error('Chart.js is not loaded!');
            return;
        }
        
        // Ensure canvas has proper dimensions
        if (this.canvas && this.canvas.parentElement) {
            const container = this.canvas.parentElement;
            const containerWidth = container.offsetWidth - 40; // Account for padding
            const containerHeight = container.offsetHeight - 40;
            
            // Set canvas size to fit container
            this.canvas.width = containerWidth > 0 ? containerWidth : 500;
            this.canvas.height = containerHeight > 0 ? containerHeight : 360;
            
            // Ensure canvas stays visible and in position
            this.canvas.style.position = 'relative';
            this.canvas.style.display = 'block';
            this.canvas.style.width = '100%';
            this.canvas.style.height = '360px';
            this.canvas.style.zIndex = '1';
        }
        
        try {
            // Convert data to use attempt numbers instead of dates
            const drillData = this.progressTracker.getDrillProgress(this.currentDrill);
            
            // Prepare data points
            const bestTimesData = [];
            const actualTimesData = [];
            let currentBest = Infinity;
            
            drillData.attempts.forEach((attempt, index) => {
                // Track actual times
                actualTimesData.push({
                    x: index + 1,
                    y: attempt.time
                });
                
                // Track best times (cumulative best)
                if (attempt.time < currentBest) {
                    currentBest = attempt.time;
                }
                bestTimesData.push({
                    x: index + 1,
                    y: currentBest
                });
            });
            
            this.chart = new Chart(this.ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Best Time',
                            data: bestTimesData,
                            borderColor: 'rgb(99, 102, 241)',
                            backgroundColor: 'rgba(99, 102, 241, 0.1)',
                            tension: 0.1,
                            fill: false,
                            pointRadius: 3,
                            pointHoverRadius: 6
                        },
                        {
                            label: 'Actual Time',
                            data: actualTimesData,
                            borderColor: 'rgb(156, 163, 175)',
                            backgroundColor: 'rgba(156, 163, 175, 0.1)',
                            borderDash: [5, 5],
                            tension: 0,
                            fill: false,
                            pointRadius: 2,
                            pointHoverRadius: 5
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    layout: {
                        padding: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10
                        }
                    },
                    interaction: {
                        mode: 'index',
                        intersect: false
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: `Progress: ${chartData.levelName}`,
                            font: {
                                size: 16,
                                weight: 'bold'
                            }
                        },
                        legend: {
                            display: true,
                            position: 'top'
                        },
                        tooltip: {
                            callbacks: {
                                title: function(context) {
                                    return `Attempt #${context[0].parsed.x}`;
                                },
                                label: function(context) {
                                    const time = context.parsed.y;
                                    const minutes = Math.floor(time / 60);
                                    const seconds = time % 60;
                                    return `${context.dataset.label}: ${minutes}:${seconds.toString().padStart(2, '0')}`;
                                },
                                afterLabel: function(context) {
                                    // Add date info if available
                                    if (context.datasetIndex === 1) { // Actual time dataset
                                        const attemptIndex = context.parsed.x - 1;
                                        const drillData = window.progressTracker.getDrillProgress(window.progressChart.currentDrill);
                                        if (drillData && drillData.attempts[attemptIndex]) {
                                            const date = new Date(drillData.attempts[attemptIndex].timestamp);
                                            return `Date: ${date.toLocaleDateString()}`;
                                        }
                                    }
                                    
                                    // Add improvement info for best time points
                                    if (context.datasetIndex === 0) { // Best time dataset
                                        const attemptIndex = context.parsed.x - 1;
                                        const drillData = window.progressTracker.getDrillProgress(window.progressChart.currentDrill);
                                        if (drillData && attemptIndex > 0) {
                                            const currentTime = context.parsed.y;
                                            const previousBest = bestTimesData[attemptIndex - 1]?.y;
                                            if (previousBest && currentTime < previousBest) {
                                                const improvement = previousBest - currentTime;
                                                const percentImprovement = ((improvement / previousBest) * 100).toFixed(1);
                                                return `Improved by ${improvement}s (${percentImprovement}%)`;
                                            }
                                        }
                                    }
                                    return '';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'linear',
                            title: {
                                display: true,
                                text: 'Attempt Number'
                            },
                            ticks: {
                                stepSize: 1,
                                precision: 0
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Time (seconds)'
                            },
                            ticks: {
                                callback: function(value) {
                                    const minutes = Math.floor(value / 60);
                                    const seconds = value % 60;
                                    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                }
                            },
                            beginAtZero: false
                        }
                    }
                }
            });
            
            console.log('Chart created successfully');
        } catch (error) {
            console.error('Error creating chart:', error);
        }
    }

    // Export chart as image
    exportAsImage() {
        if (!this.chart) return null;
        
        return this.canvas.toDataURL('image/png', 1.0);
    }

    // Show no data message
    showNoDataMessage() {
        console.log('Showing no data message');
        
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
        
        if (!this.canvas) {
            console.error('No canvas for no data message');
            return;
        }
        
        // Make canvas visible
        this.canvas.style.display = 'block';
        this.canvas.width = 500;
        this.canvas.height = 400;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.font = '20px Inter, sans-serif';
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('No data available for this drill yet', this.canvas.width / 2, this.canvas.height / 2);
    }

    // Helper to get level name from key
    getLevelNameFromKey(key) {
        // This should match your CONFIG.LEVEL_GROUPS structure
        const levelMap = {
            'bonds10': 'Bonds to 10',
            'bonds20': 'Bonds to 20',
            'mixed10-20': 'Mixed Bonds 10-20',
            'bonds90': 'Bonds to 90',
            'bonds100': 'Bonds to 100',
            'group245': '2 4 5 10',
            'group369': '3 6 9',
            'multall': '2 to 12',
            'mixed-negative-mult': 'Negatives',
            'powersOf10': 'Powers of 10',
            'double100': 'Doubling',
            'squares': 'Perfect Squares',
            'unitConversions': 'Unit Conversions',
            'hcf': 'HCF',
            'lcm': 'LCM',
            'equivFractions': 'Equivalent Fractions',
            'simplifyFractions': 'Simplifying Fractions',
            'fdpConversions': 'Common FDP Equivalences',
            'fdpConversionsMultiples': 'FDP Conversions',
            'fractionOfQuantity': 'Fraction of a Quantity',
            'percentageOfQuantity': 'Percentage of a Quantity'
        };
        return levelMap[key] || key;
    }

    // Destroy chart
    destroy() {
        if (this.chart) {
            this.chart.destroy();
            this.chart = null;
        }
    }
}