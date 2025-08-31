/**
 * Main entry point for Maths Facts Challenge
 * This file bootstraps the entire application by creating the main GameController instance
 * The GameController coordinates all subsystems and manages the overall application flow
 */

import { GameController } from './gameController.js';

// Initialize the application by creating the main game controller
// This will automatically set up all required subsystems including:
// - Game state management
// - UI rendering and event handling  
// - Question generation
// - Progress tracking
// - Mastery assessment
new GameController();