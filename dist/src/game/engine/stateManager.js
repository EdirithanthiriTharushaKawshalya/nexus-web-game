"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateManager = exports.GAME_PATH = void 0;
exports.GAME_PATH = [
    { x: 0, y: 300 },
    { x: 200, y: 300 },
    { x: 200, y: 100 },
    { x: 600, y: 100 },
    { x: 600, y: 500 },
    { x: 800, y: 500 }
];
class StateManager {
    constructor() {
        this.spawnTimer = 0;
        this.waveDelay = 5;
        this.enemiesToSpawn = 0;
        this.state = {
            players: {},
            enemies: [],
            towers: [],
            floatingTexts: [],
            gameStatus: 'lobby',
            wave: 0,
            nexusHealth: 100,
            maxNexusHealth: 100,
            enemiesRemaining: 0,
            screenShake: 0
        };
    }
    getState() {
        return this.state;
    }
    syncState(newState) {
        this.state.players = newState.players || {};
        this.state.gameStatus = newState.gameStatus;
        if (newState.gameStatus === 'lobby') {
            this.state.enemies = [];
            this.state.towers = [];
            this.state.floatingTexts = [];
            this.state.nexusHealth = 100;
            this.state.wave = 0;
            this.state.screenShake = 0;
        }
    }
    addPlayer(id, name) {
        this.state.players[id] = {
            id, name, lives: 20, gold: 150, score: 0
        };
    }
    removePlayer(id) {
        delete this.state.players[id];
    }
    startGame() {
        this.state.gameStatus = 'playing';
        this.state.wave = 0;
        this.state.nexusHealth = 100;
        this.startNextWave();
    }
    startNextWave() {
        this.state.wave++;
        this.enemiesToSpawn = 5 + (this.state.wave * 3);
        this.state.enemiesRemaining = this.enemiesToSpawn;
        this.spawnTimer = 0;
    }
    update(dt) {
        if (this.state.gameStatus !== 'playing')
            return;
        // Juice: Screen Shake Decay
        if (this.state.screenShake > 0) {
            this.state.screenShake -= dt * 3;
            if (this.state.screenShake < 0)
                this.state.screenShake = 0;
        }
        // Juice: Floating Text Update
        this.state.floatingTexts = this.state.floatingTexts.filter(ft => {
            ft.life -= dt * 1.2;
            ft.y -= dt * 25; // Drift up
            return ft.life > 0;
        });
        // 1. Spawning
        if (this.enemiesToSpawn > 0) {
            this.spawnTimer += dt;
            if (this.spawnTimer >= 1.5) {
                this.spawnEnemy();
                this.enemiesToSpawn--;
                this.spawnTimer = 0;
            }
        }
        else if (this.state.enemies.length === 0 && this.state.enemiesRemaining === 0) {
            this.waveDelay -= dt;
            if (this.waveDelay <= 0) {
                this.startNextWave();
                this.waveDelay = 5;
            }
        }
        // 2. Enemies
        this.state.enemies.forEach(enemy => {
            const targetNode = exports.GAME_PATH[enemy.pathIndex + 1];
            if (!targetNode)
                return;
            const startNode = exports.GAME_PATH[enemy.pathIndex];
            const dx = targetNode.x - startNode.x;
            const dy = targetNode.y - startNode.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            enemy.progress += (enemy.speed * dt) / distance;
            if (enemy.progress >= 1) {
                enemy.pathIndex++;
                enemy.progress = 0;
                if (enemy.pathIndex >= exports.GAME_PATH.length - 1) {
                    this.state.nexusHealth -= 10;
                    enemy.health = 0;
                    this.state.screenShake = 0.6; // TRIGGER SHAKE
                    this.addFloatingText("CRITICAL HIT", enemy.x, enemy.y, "#ef4444");
                    if (this.state.nexusHealth <= 0)
                        this.state.gameStatus = 'gameOver';
                    return;
                }
            }
            enemy.x = startNode.x + (targetNode.x - startNode.x) * enemy.progress;
            enemy.y = startNode.y + (targetNode.y - startNode.y) * enemy.progress;
        });
        this.state.enemies = this.state.enemies.filter(e => {
            if (e.health <= 0) {
                this.state.enemiesRemaining--;
                return false;
            }
            return true;
        });
        // 3. Towers
        const now = Date.now();
        this.state.towers.forEach(tower => {
            if (now - tower.lastShot < (1000 / tower.fireRate))
                return;
            let closestEnemy = null;
            let minDistance = tower.range;
            this.state.enemies.forEach(enemy => {
                const dist = Math.sqrt(Math.pow(enemy.x - tower.x, 2) + Math.pow(enemy.y - tower.y, 2));
                if (dist < minDistance) {
                    minDistance = dist;
                    closestEnemy = enemy;
                }
            });
            if (closestEnemy) {
                const target = closestEnemy;
                target.health -= tower.damage;
                tower.lastShot = now;
                if (target.health <= 0) {
                    const owner = this.state.players[tower.ownerId];
                    if (owner) {
                        owner.gold += 20;
                        owner.score += 100;
                        this.addFloatingText("+20", target.x, target.y, "#facc15");
                    }
                }
            }
        });
    }
    addFloatingText(text, x, y, color) {
        this.state.floatingTexts.push({
            id: Math.random().toString(36).substr(2, 5),
            text, x, y, color, life: 1.0
        });
    }
    placeTower(playerId, type, x, y) {
        const player = this.state.players[playerId];
        let cost = 50, range = 150, damage = 15, fireRate = 1.5;
        if (type === 'sniper') {
            cost = 120;
            range = 300;
            damage = 60;
            fireRate = 0.5;
        }
        else if (type === 'pulse') {
            cost = 100;
            range = 100;
            damage = 25;
            fireRate = 1.0;
        }
        if (!player || player.gold < cost)
            return;
        const gridX = Math.floor(x / 40) * 40;
        const gridY = Math.floor(y / 40) * 40;
        if (this.isPointOnPath(gridX, gridY))
            return;
        if (this.state.towers.some(t => t.x === gridX && t.y === gridY))
            return;
        const newTower = {
            id: Math.random().toString(36).substring(2, 9),
            ownerId: playerId,
            type: type,
            level: 1,
            x: gridX, y: gridY,
            range, damage, fireRate,
            lastShot: 0,
            upgradeCost: Math.floor(cost * 1.5)
        };
        this.state.towers.push(newTower);
        player.gold -= cost;
        this.addFloatingText(`-${cost}`, gridX, gridY, "#ef4444");
    }
    upgradeTower(playerId, towerId) {
        const tower = this.state.towers.find(t => t.id === towerId);
        const player = this.state.players[playerId];
        if (!tower || !player || player.gold < tower.upgradeCost)
            return;
        player.gold -= tower.upgradeCost;
        tower.level++;
        tower.damage *= 1.4;
        tower.range *= 1.1;
        tower.fireRate *= 1.1;
        const oldCost = tower.upgradeCost;
        tower.upgradeCost = Math.floor(oldCost * 1.8);
        this.addFloatingText(`LVL ${tower.level}`, tower.x, tower.y, "#3b82f6");
        this.addFloatingText(`-${oldCost}`, tower.x, tower.y + 20, "#ef4444");
    }
    isPointOnPath(gridX, gridY) {
        const tx = gridX + 20, ty = gridY + 20;
        for (let i = 0; i < exports.GAME_PATH.length - 1; i++) {
            const s = exports.GAME_PATH[i], e = exports.GAME_PATH[i + 1];
            if (s.y === e.y) {
                const minX = Math.min(s.x, e.x), maxX = Math.max(s.x, e.x);
                if (Math.abs(ty - (s.y + 20)) < 20 && tx >= minX && tx <= maxX + 40)
                    return true;
            }
            if (s.x === e.x) {
                const minY = Math.min(s.y, e.y), maxY = Math.max(s.y, e.y);
                if (Math.abs(tx - (s.x + 20)) < 20 && ty >= minY && ty <= maxY + 40)
                    return true;
            }
        }
        return false;
    }
    spawnEnemy() {
        const r = Math.random();
        let type = 'basic', h = 40 + (this.state.wave * 12), s = 60 + (this.state.wave * 2);
        if (r > 0.85) {
            type = 'tank';
            h *= 3.5;
            s *= 0.55;
        }
        else if (r > 0.7) {
            type = 'fast';
            h *= 0.4;
            s *= 2.0;
        }
        this.state.enemies.push({ id: Math.random().toString(36).substr(2, 7), type, health: h, maxHealth: h, x: exports.GAME_PATH[0].x, y: exports.GAME_PATH[0].y, speed: s, pathIndex: 0, progress: 0 });
    }
}
exports.StateManager = StateManager;
