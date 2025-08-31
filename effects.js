/**
 * Visual effects for Maths Facts Challenge
 * Provides confetti animation system using HTML5 Canvas
 */

/**
 * Confetti class creates and manages animated confetti particles
 * Used to celebrate correct answers and level completions
 */
export class Confetti {
    /**
     * Initialize the confetti system
     * @param {string} canvasId - ID of the canvas element for rendering
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.pieces = [];           // Array to store active confetti pieces
        this.animationFrame = null; // Reference to animation frame for cleanup
        
        // Set initial canvas size and handle window resizing
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    /**
     * Resize canvas to fill the entire window
     * Called on initialization and window resize events
     */
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    /**
     * Trigger confetti animation with specified number of pieces
     * @param {number} count - Number of confetti pieces to create
     */
    trigger(count) {
        // Create the specified number of confetti pieces
        for (let i = 0; i < count; i++) {
            this.pieces.push(this.createPiece());
        }
        
        // Start animation if not already running
        if (!this.animationFrame) {
            this.animate();
        }
    }
    
    /**
     * Create a single confetti piece with random properties
     * @returns {Object} Confetti piece with position, velocity, and visual properties
     */
    createPiece() {
        const x = this.canvas.width * Math.random();  // Random horizontal position
        const y = -20;                                // Start above visible area
        const size = Math.random() * 10 + 5;          // Random size between 5-15px
        
        // Vibrant color palette for confetti pieces
        const colors = [
            '#fde047', '#facc15', '#a3e635', '#4ade80', '#34d399', '#2dd4bf', 
            '#67e8f9', '#7dd3fc', '#93c5fd', '#a5b4fc', '#c4b5fd', '#d8b4fe', 
            '#f0abfc', '#f9a8d4'
        ];
        
        return {
            x, y, size,
            color: colors[Math.floor(Math.random() * colors.length)],
            vx: Math.random() * 10 - 5,        // Horizontal velocity (-5 to +5)
            vy: Math.random() * 5 + 2,         // Vertical velocity (2 to 7)
            angle: Math.random() * Math.PI * 2, // Random rotation angle
            spin: Math.random() * 0.2 - 0.1     // Rotation speed (-0.1 to +0.1)
        };
    }
    
    /**
     * Animation loop for confetti pieces
     * Updates positions, renders pieces, and removes pieces that fall off screen
     */
    animate() {
        // Clear the entire canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and render each confetti piece
        this.pieces.forEach((p, index) => {
            // Update position and rotation
            p.x += p.vx;
            p.y += p.vy;
            p.angle += p.spin;
            
            // Render the piece with rotation
            this.ctx.save();
            this.ctx.translate(p.x, p.y);
            this.ctx.rotate(p.angle);
            this.ctx.fillStyle = p.color;
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            this.ctx.restore();
            
            // Remove pieces that have fallen off the bottom of the screen
            if (p.y > this.canvas.height) {
                this.pieces.splice(index, 1);
            }
        });
        
        // Continue animation if pieces remain, otherwise stop
        if (this.pieces.length > 0) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        } else {
            this.animationFrame = null;
        }
    }
}