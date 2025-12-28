import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Serve static files
app.use('/images/*', serveStatic({ root: './public' }))
app.use('/static/*', serveStatic({ root: './public' }))

// Main game page
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="hu">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <title>Gazdálkodj Okosan - Magyar Társasjáték</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body {
                overflow: hidden;
                touch-action: manipulation;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                user-select: none;
            }
            
            .board {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                position: relative;
                aspect-ratio: 1;
                max-width: 100vmin;
                max-height: 100vmin;
                margin: 0 auto;
            }
            
            .space {
                position: absolute;
                border: 2px solid #fff;
                background: rgba(255, 255, 255, 0.9);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.6rem;
                font-weight: bold;
                text-align: center;
                padding: 2px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .space:hover {
                background: rgba(255, 255, 255, 1);
                transform: scale(1.05);
                z-index: 10;
            }
            
            .space.start { background: #10b981; color: white; }
            .space.shop { background: #3b82f6; color: white; }
            .space.card { background: #8b5cf6; color: white; }
            .space.special { background: #f59e0b; color: white; }
            
            .player-token {
                position: absolute;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: all 0.5s ease;
                z-index: 100;
            }
            
            .dice {
                width: 80px;
                height: 80px;
                background: white;
                border-radius: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 3rem;
                font-weight: bold;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                cursor: pointer;
                transition: transform 0.1s;
                margin: 0 auto;
            }
            
            .dice:active {
                transform: scale(0.95);
            }
            
            .dice.rolling {
                animation: spin 0.5s linear;
            }
            
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 1000;
                padding: 20px;
            }
            
            .modal-content {
                background: white;
                border-radius: 12px;
                padding: 24px;
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow-y: auto;
            }
            
            .btn {
                padding: 12px 24px;
                border-radius: 8px;
                font-weight: bold;
                cursor: pointer;
                transition: all 0.2s;
                border: none;
                outline: none;
            }
            
            .btn-primary {
                background: #3b82f6;
                color: white;
            }
            
            .btn-primary:hover {
                background: #2563eb;
            }
            
            .btn-success {
                background: #10b981;
                color: white;
            }
            
            .btn-danger {
                background: #ef4444;
                color: white;
            }
            
            .furniture-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
                gap: 8px;
            }
            
            .furniture-item {
                padding: 12px;
                border: 2px solid #e5e7eb;
                border-radius: 8px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .furniture-item:hover {
                border-color: #3b82f6;
                background: #eff6ff;
            }
            
            .furniture-item.owned {
                background: #10b981;
                color: white;
                border-color: #10b981;
            }
            
            .furniture-item.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        </style>
    </head>
    <body class="bg-gray-900">
        <div id="app" class="min-h-screen flex flex-col">
            <!-- Game Setup Screen -->
            <div id="setupScreen" class="flex-1 flex items-center justify-center p-4">
                <div class="bg-white rounded-lg p-8 max-w-md w-full">
                    <h1 class="text-3xl font-bold text-center mb-6 text-purple-600">🎲 Gazdálkodj Okosan</h1>
                    <div class="mb-4">
                        <label class="block text-sm font-bold mb-2">Játékosok száma (2-6):</label>
                        <input type="number" id="playerCount" min="2" max="6" value="2" class="w-full px-4 py-2 border rounded">
                    </div>
                    <div id="playerColors" class="mb-4 space-y-2"></div>
                    <button onclick="startGame()" class="w-full btn btn-primary">Játék indítása</button>
                </div>
            </div>
            
            <!-- Game Board Screen -->
            <div id="gameScreen" class="hidden flex-1 flex flex-col">
                <!-- Top Panel -->
                <div class="bg-gray-800 text-white p-2 flex justify-between items-center text-xs sm:text-sm">
                    <div id="currentPlayerInfo" class="font-bold"></div>
                    <button onclick="showMenu()" class="btn btn-primary text-xs px-3 py-1">Menü</button>
                </div>
                
                <!-- Game Board -->
                <div class="flex-1 flex items-center justify-center p-2 sm:p-4">
                    <div class="board" id="gameBoard">
                        <div class="absolute inset-0 flex items-center justify-center">
                            <div class="text-center text-white">
                                <div class="dice mb-4" id="dice" onclick="rollDice()">
                                    <span id="diceValue">🎲</span>
                                </div>
                                <div class="text-sm font-bold" id="turnInfo">Koppints a kockára!</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Bottom Panel -->
                <div class="bg-gray-800 text-white p-2">
                    <div id="playerStats" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-xs"></div>
                </div>
            </div>
        </div>
        
        <!-- Modals will be injected here -->
        <div id="modalContainer"></div>
        
        <script src="/static/game.js"></script>
    </body>
    </html>
  `)
})

export default app
