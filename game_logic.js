document.addEventListener('DOMContentLoaded', () => {
    // 2. Initialize ZenAudioEngine
    let audio;
    if (typeof window.ZenAudioEngine === 'function') {
        audio = new window.ZenAudioEngine();
        if (audio.init) audio.init();
    } else if (window.ZenAudioEngine) {
        audio = window.ZenAudioEngine;
        if (audio.init) audio.init();
    }

    // 3. Setup 3D graphics
    if (window.ZenGraphics && window.ZenGraphics.init) {
        window.ZenGraphics.init();
    }

    // DOM Elements
    const wordsLayer = document.getElementById('words-layer');
    const startBtn = document.getElementById('start-btn');
    const startOverlay = document.getElementById('start-overlay');
    const hud = document.getElementById('hud');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const restartBtn = document.getElementById('restart-btn');
    const saveScoreBtn = document.getElementById('save-score-btn');
    const stabilityBar = document.getElementById('stability-bar');
    
    // State
    let activeWords = [];
    let isGameRunning = false;
    let lastTime = performance.now();
    let spawnTimer = 0;
    let spawnInterval = 2000;
    let stability = 100;
    let score = 0;
    let wordsTyped = 0;
    let startTime = performance.now();
    let currentTargetWord = null;

    const defaultWords = ['zen', 'breathe', 'focus', 'relax', 'calm', 'water', 'flow', 'peace', 'harmony', 'mindful'];

    function getWord() {
        let lib = defaultWords;
        if (window.WORD_LIBRARY) {
            lib = [...window.WORD_LIBRARY.easy, ...window.WORD_LIBRARY.medium, ...window.WORD_LIBRARY.hard];
        }
        return lib[Math.floor(Math.random() * lib.length)];
    }

    function updateHUD() {
        const scoreEl = document.getElementById('score-display');
        if (scoreEl) scoreEl.textContent = `Score: ${score}`;

        if (stabilityBar) {
            stabilityBar.style.width = `${stability}%`;
            if (stability > 50) {
                stabilityBar.style.backgroundColor = '#4caf50';
            } else if (stability > 20) {
                stabilityBar.style.backgroundColor = '#ff9800';
            } else {
                stabilityBar.style.backgroundColor = '#f44336';
            }
        }
    }

    function updateWPM() {
        const elapsedMinutes = (performance.now() - startTime) / 60000;
        if (elapsedMinutes > 0) {
            const wpm = Math.floor(wordsTyped / elapsedMinutes);
            const wpmEl = document.getElementById('wpm-display');
            if (wpmEl) wpmEl.textContent = `WPM: ${wpm}`;
        }
    }

    // 6. Spawning words
    function spawnWord() {
        const text = getWord();
        const x = (Math.random() * 8) - 4; // X from -4 to 4
        const y = 10;                      // Y starts at 10
        const z = (Math.random() * 4) - 2; // Z from -2 to 2
        const velocity = 0.5 + Math.random() * 1.5;

        const el = document.createElement('div');
        el.className = 'falling-word';
        el.style.position = 'absolute';
        
        const typedSpan = document.createElement('span');
        typedSpan.className = 'typed';
        typedSpan.textContent = '';
        
        const currentSpan = document.createElement('span');
        currentSpan.className = 'current';
        currentSpan.textContent = text[0];
        
        const untypedSpan = document.createElement('span');
        untypedSpan.className = 'untyped';
        untypedSpan.textContent = text.slice(1);
        
        el.appendChild(typedSpan);
        el.appendChild(currentSpan);
        el.appendChild(untypedSpan);
        
        if (wordsLayer) wordsLayer.appendChild(el);

        activeWords.push({
            text,
            typedIndex: 0,
            position: new THREE.Vector3(x, y, z),
            velocity,
            el
        });
    }

    // 7. Typing logic handling
    function typeCharacter(word) {
        word.typedIndex++;
        
        if (word.typedIndex === word.text.length) {
            handleWordSuccess(word);
            currentTargetWord = null;
        } else {
            word.el.querySelector('.typed').textContent = word.text.substring(0, word.typedIndex);
            word.el.querySelector('.current').textContent = word.text[word.typedIndex];
            word.el.querySelector('.untyped').textContent = word.text.substring(word.typedIndex + 1);
            word.el.classList.add('targeted');
        }
    }

    // 8. Success logic
    function handleWordSuccess(word) {
        if (window.ZenGraphics && window.ZenGraphics.spawnSparks) {
            window.ZenGraphics.spawnSparks(word.position);
        }
        if (audio && audio.playSuccessSFX) {
            audio.playSuccessSFX();
        }
        
        if (word.el.parentNode) {
            word.el.parentNode.removeChild(word.el);
        }
        
        const index = activeWords.indexOf(word);
        if (index > -1) {
            activeWords.splice(index, 1);
        }
        
        score += word.text.length * 10;
        wordsTyped++;
        updateHUD();
    }

    // 9. Failure logic
    function handleWordFailure(word, index) {
        if (window.ZenGraphics && window.ZenGraphics.splashRipple) {
            window.ZenGraphics.splashRipple(word.position);
        }
        if (audio && audio.playFailureSFX) {
            audio.playFailureSFX();
        }
        
        if (word.el.parentNode) {
            word.el.parentNode.removeChild(word.el);
        }
        
        activeWords.splice(index, 1);
        
        if (currentTargetWord === word) {
            currentTargetWord = null;
        }
        
        stability -= 15;
        if (stability <= 0) {
            stability = 0;
            gameOver();
        }
        updateHUD();
    }

    // 10. Game Over logic
    function gameOver() {
        isGameRunning = false;
        if (hud) hud.classList.add('hidden');
        if (gameOverOverlay) {
            gameOverOverlay.classList.remove('hidden');
            const finalScoreEl = document.getElementById('final-score');
            if (finalScoreEl) finalScoreEl.textContent = score;
        }
    }

    function resetGame() {
        activeWords.forEach(w => {
            if (w.el.parentNode) w.el.parentNode.removeChild(w.el);
        });
        activeWords = [];
        currentTargetWord = null;
        stability = 100;
        score = 0;
        wordsTyped = 0;
        spawnTimer = 0;
        startTime = performance.now();
        lastTime = performance.now();
        updateHUD();
        updateWPM();
    }

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            if (audio && audio.startAmbientMusic) {
                if (audio.ctx && audio.ctx.state === 'suspended') audio.ctx.resume();
                audio.startAmbientMusic();
            }
            if (startOverlay) startOverlay.classList.add('hidden');
            if (hud) hud.classList.remove('hidden');
            resetGame();
            isGameRunning = true;
        });
    }

    if (restartBtn) {
        restartBtn.addEventListener('click', () => {
            if (gameOverOverlay) gameOverOverlay.classList.add('hidden');
            if (hud) hud.classList.remove('hidden');
            resetGame();
            isGameRunning = true;
        });
    }

    if (saveScoreBtn) {
        saveScoreBtn.addEventListener('click', () => {
            alert(`Score saved: ${score}`);
        });
    }

    // 7. Keydown listener
    document.addEventListener('keydown', (e) => {
        if (!isGameRunning) return;
        
        const key = e.key.toLowerCase();
        if (key.length > 1 || !key.match(/[a-z0-9]/)) return; // Ignore modifiers and non-alphanumeric

        if (!currentTargetWord) {
            const possibleWords = activeWords.filter(w => w.text[w.typedIndex].toLowerCase() === key);
            if (possibleWords.length > 0) {
                // Priority to the lowest word
                possibleWords.sort((a, b) => a.position.y - b.position.y);
                currentTargetWord = possibleWords[0];
                typeCharacter(currentTargetWord);
            }
        } else {
            if (currentTargetWord.text[currentTargetWord.typedIndex].toLowerCase() === key) {
                typeCharacter(currentTargetWord);
            }
        }
    });

    // 4. Game Loop
    function gameLoop(time) {
        requestAnimationFrame(gameLoop);
        
        const dt = (time - lastTime) / 1000;
        lastTime = time;

        if (window.ZenGraphics && window.ZenGraphics.render) {
            window.ZenGraphics.render(dt);
        }

        if (!isGameRunning) return;

        // Spawning logic
        spawnTimer += dt * 1000;
        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;
            spawnWord();
            if (spawnInterval > 500) {
                spawnInterval -= 10; // Increase difficulty over time
            }
        }

        const canvasWidth = window.innerWidth;
        const canvasHeight = window.innerHeight;

        // 5. Word position and DOM updates
        for (let i = activeWords.length - 1; i >= 0; i--) {
            const word = activeWords[i];
            word.position.y -= word.velocity * dt;

            if (window.ZenGraphics && window.ZenGraphics.getScreenPosition) {
                const screenPos = window.ZenGraphics.getScreenPosition(word.position, canvasWidth, canvasHeight);
                if (screenPos && screenPos.z < 1) { 
                    word.el.style.transform = `translate3d(${screenPos.x}px, ${screenPos.y}px, 0)`;
                    word.el.style.display = 'block';
                } else {
                    word.el.style.display = 'none';
                }
            } else {
                // Fallback translation if missing ZenGraphics getScreenPosition
                const fallbackY = (10 - word.position.y) * (canvasHeight / 10); 
                word.el.style.transform = `translate3d(${canvasWidth / 2}px, ${fallbackY}px, 0)`;
            }

            // 9. Failure checking
            if (word.position.y <= 0.8) {
                handleWordFailure(word, i);
            }
        }

        if (Math.floor(time) % 10 === 0) {
            updateWPM();
        }
    }

    requestAnimationFrame(gameLoop);
});
