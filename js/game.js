/**
 * Retro Overdrive - Core Game Controller & Loop
 * Automotive telemetry HUD, Workshop state, continuous controls, combo multiplier, and persistence.
 */

class GameEngine {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.ctx.imageSmoothingEnabled = false;

    // States: 'START', 'PLAYING', 'PAUSED', 'TRANSITION', 'GAMEOVER', 'VICTORY', 'WORKSHOP'
    this.state = 'START';
    this.previousState = 'START';

    // Scoring & Stats
    this.score = 0;
    this.highScore = 0;
    this.perfectDodges = 0;
    this.lastTime = 0;
    this.transitionTimer = 0;

    // Combo Multiplier System
    this.comboMultiplier = 1.0;
    this.comboTimer = 0;
    this.maxComboTime = 3.5; // seconds to chain near misses

    // Current run cash tracker
    this.runCashEarned = 0;

    // Load High Score
    try {
      this.highScore = parseInt(localStorage.getItem('retro_overdrive_highscore') || '0', 10);
    } catch (e) {
      this.highScore = 0;
    }

    // Cache DOM Elements
    this.dom = {
      startScreen: document.getElementById('startScreen'),
      pauseScreen: document.getElementById('pauseScreen'),
      gameOverScreen: document.getElementById('gameOverScreen'),
      victoryScreen: document.getElementById('victoryScreen'),
      workshopScreen: document.getElementById('workshopScreen'),
      stageTransitionOverlay: document.getElementById('stageTransitionOverlay'),
      transitionTitle: document.getElementById('transitionTitle'),
      transitionDesc: document.getElementById('transitionDesc'),

      // Marquee Cash
      marqueeCashVal: document.getElementById('marqueeCashVal'),
      startCashVal: document.getElementById('startCashVal'),
      startHighScore: document.getElementById('startHighScore'),

      // HUD Elements
      hudLayer: document.getElementById('hudLayer'),
      hudStageNum: document.getElementById('hudStageNum'),
      hudStageName: document.getElementById('hudStageName'),
      hudProgressBar: document.getElementById('hudProgressBar'),
      hudProgressMarker: document.getElementById('hudProgressMarker'),
      hudProgressText: document.getElementById('hudProgressText'),
      hudDistText: document.getElementById('hudDistText'),
      hudScore: document.getElementById('hudScore'),
      hudLiveCash: document.getElementById('hudLiveCash'),
      hudComboBadge: document.getElementById('hudComboBadge'),
      hudSpeed: document.getElementById('hudSpeed'),
      hudTachoFill: document.getElementById('hudTachoFill'),
      hudNitroBar: document.getElementById('hudNitroBar'),
      nitroStatus: document.getElementById('nitroStatus'),
      heartsContainer: document.getElementById('heartsContainer'),
      shieldsContainer: document.getElementById('shieldsContainer'),
      hudHullStatus: document.getElementById('hudHullStatus'),

      // Results Elements
      gameOverScore: document.getElementById('gameOverScore'),
      gameOverHighScore: document.getElementById('gameOverHighScore'),
      gameOverCashEarned: document.getElementById('gameOverCashEarned'),
      gameOverDodges: document.getElementById('gameOverDodges'),
      victoryScore: document.getElementById('victoryScore'),
      victoryHighScore: document.getElementById('victoryHighScore'),
      victoryDistance: document.getElementById('victoryDistance'),
      victoryCashEarned: document.getElementById('victoryCashEarned'),
      victoryDodges: document.getElementById('victoryDodges'),
      pauseStageText: document.getElementById('pauseStageText'),
      pauseScoreText: document.getElementById('pauseScoreText'),
      pauseCashText: document.getElementById('pauseCashText'),

      // Workshop Elements
      workshopCashVal: document.getElementById('workshopCashVal'),
      lvlMotor: document.getElementById('lvlMotor'),
      descMotor: document.getElementById('descMotor'),
      pipsMotor: document.getElementById('pipsMotor'),
      btnBuyMotor: document.getElementById('btnBuyMotor'),

      lvlPneus: document.getElementById('lvlPneus'),
      descPneus: document.getElementById('descPneus'),
      pipsPneus: document.getElementById('pipsPneus'),
      btnBuyPneus: document.getElementById('btnBuyPneus'),

      lvlNitro: document.getElementById('lvlNitro'),
      descNitro: document.getElementById('descNitro'),
      pipsNitro: document.getElementById('pipsNitro'),
      btnBuyNitro: document.getElementById('btnBuyNitro'),

      lvlBlindagem: document.getElementById('lvlBlindagem'),
      descBlindagem: document.getElementById('descBlindagem'),
      pipsBlindagem: document.getElementById('pipsBlindagem'),
      btnBuyBlindagem: document.getElementById('btnBuyBlindagem'),

      btnBuyRepair: document.getElementById('btnBuyRepair'),

      // Quick icons
      btnSoundToggle: document.getElementById('btnSoundToggle')
    };

    // Initialize UI
    this.updateStartScreenUI();
    this.bindInputs();
    this.bindUI();

    // Start loop
    requestAnimationFrame((t) => this.loop(t));
  }

  formatScore(num) {
    return Math.floor(num).toString().padStart(5, '0');
  }

  formatCash(num) {
    return `$ ${Math.floor(num).toLocaleString()}`;
  }

  addScore(pts) {
    this.score += pts;
    if (this.score > this.highScore) {
      this.highScore = this.score;
      try {
        localStorage.setItem('retro_overdrive_highscore', this.highScore.toString());
      } catch (e) {}
    }
  }

  incrementCombo() {
    this.comboMultiplier = Math.min(3.0, this.comboMultiplier + 0.2);
    this.comboTimer = this.maxComboTime;
    this.perfectDodges++;
  }

  resetCombo() {
    this.comboMultiplier = 1.0;
    this.comboTimer = 0;
  }

  // ==========================================================
  // INPUT HANDLING (Continuous Lateral Steering)
  // ==========================================================
  bindInputs() {
    window.addEventListener('keydown', (e) => {
      window.audioMgr.ensureContext();

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          if (this.state === 'PLAYING') window.playerCar.inputs.left = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          if (this.state === 'PLAYING') window.playerCar.inputs.right = true;
          break;
        case 'ArrowUp':
        case 'KeyW':
          if (this.state === 'PLAYING') window.playerCar.inputs.accelerate = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          if (this.state === 'PLAYING') window.playerCar.inputs.brake = true;
          break;
        case 'Space':
        case 'KeyE':
          e.preventDefault();
          if (this.state === 'PLAYING') window.playerCar.activateNitro();
          break;
        case 'KeyP':
        case 'Escape':
          e.preventDefault();
          this.togglePause();
          break;
        case 'KeyM':
          this.toggleSound();
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          window.playerCar.inputs.left = false;
          break;
        case 'ArrowRight':
        case 'KeyD':
          window.playerCar.inputs.right = false;
          break;
        case 'ArrowUp':
        case 'KeyW':
          window.playerCar.inputs.accelerate = false;
          break;
        case 'ArrowDown':
        case 'KeyS':
          window.playerCar.inputs.brake = false;
          break;
      }
    });

    // Mobile Virtual Touch Buttons (Smooth continuous holding)
    const btnLeft = document.getElementById('btnTouchLeft');
    const btnRight = document.getElementById('btnTouchRight');
    const btnNitro = document.getElementById('btnTouchNitro');

    const bindHoldButton = (btn, onDown, onUp) => {
      const start = (e) => {
        e.preventDefault();
        window.audioMgr.ensureContext();
        btn.classList.add('active-touch');
        onDown();
      };
      const stop = (e) => {
        e.preventDefault();
        btn.classList.remove('active-touch');
        onUp();
      };
      btn.addEventListener('touchstart', start, { passive: false });
      btn.addEventListener('touchend', stop, { passive: false });
      btn.addEventListener('mousedown', start);
      btn.addEventListener('mouseup', stop);
      btn.addEventListener('mouseleave', stop);
    };

    bindHoldButton(
      btnLeft,
      () => { window.playerCar.inputs.left = true; },
      () => { window.playerCar.inputs.left = false; }
    );
    bindHoldButton(
      btnRight,
      () => { window.playerCar.inputs.right = true; },
      () => { window.playerCar.inputs.right = false; }
    );
    bindHoldButton(
      btnNitro,
      () => { if (this.state === 'PLAYING') window.playerCar.activateNitro(); },
      () => {}
    );
  }

  // ==========================================================
  // UI BUTTON BINDINGS
  // ==========================================================
  bindUI() {
    // Start Game
    document.getElementById('btnStartGame').addEventListener('click', () => {
      window.audioMgr.ensureContext();
      window.audioMgr.playBeep();
      this.startGame();
    });

    // Open Workshop from Start Menu
    document.getElementById('btnOpenWorkshopStart').addEventListener('click', () => {
      window.audioMgr.ensureContext();
      window.audioMgr.playBeep();
      this.openWorkshop('START');
    });

    // Open Workshop from Pause Menu
    document.getElementById('btnOpenWorkshopPause').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.openWorkshop('PAUSED');
    });

    // Open Workshop from Game Over
    document.getElementById('btnOpenWorkshopGameOver').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.openWorkshop('GAMEOVER');
    });

    // Open Workshop from Victory
    document.getElementById('btnOpenWorkshopVictory').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.openWorkshop('VICTORY');
    });

    // Workshop Back Button
    document.getElementById('btnWorkshopBack').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.closeWorkshop();
    });

    // Workshop Start Race Button
    document.getElementById('btnWorkshopStart').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.startGame();
    });

    // Workshop Reset Progress
    document.getElementById('btnResetProgress').addEventListener('click', () => {
      if (confirm('Deseja realmente reiniciar todo o progresso, dinheiro e melhorias?')) {
        window.workshopMgr.resetProgress();
        this.updateWorkshopUI();
        this.updateStartScreenUI();
        window.audioMgr.playBeep();
      }
    });

    // Workshop Buy Buttons
    document.getElementById('btnBuyMotor').addEventListener('click', () => this.handleBuyUpgrade('motor'));
    document.getElementById('btnBuyPneus').addEventListener('click', () => this.handleBuyUpgrade('pneus'));
    document.getElementById('btnBuyNitro').addEventListener('click', () => this.handleBuyUpgrade('nitro'));
    document.getElementById('btnBuyBlindagem').addEventListener('click', () => this.handleBuyUpgrade('blindagem'));
    document.getElementById('btnBuyRepair').addEventListener('click', () => this.handleBuyRepair());

    // Pause / Resume
    document.getElementById('btnPauseToggle').addEventListener('click', () => this.togglePause());
    document.getElementById('btnResumeGame').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.resumeGame();
    });
    document.getElementById('btnRestartFromPause').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.startGame();
    });

    // Sound Toggle
    this.dom.btnSoundToggle.addEventListener('click', () => this.toggleSound());

    // Restart from Game Over
    document.getElementById('btnRestartGameOver').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.startGame();
    });

    // Restart from Victory
    document.getElementById('btnRestartVictory').addEventListener('click', () => {
      window.audioMgr.playBeep();
      this.startGame();
    });
  }

  toggleSound() {
    const isMuted = window.audioMgr.toggleMute();
    this.dom.btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
    this.dom.btnSoundToggle.title = isMuted ? 'Ativar Áudio (M)' : 'Silenciar Áudio (M)';
  }

  // ==========================================================
  // WORKSHOP ACTIONS
  // ==========================================================
  openWorkshop(fromState = 'START') {
    this.previousState = fromState;
    this.state = 'WORKSHOP';
    this.hideAllModals();
    this.updateWorkshopUI();
    this.dom.workshopScreen.classList.add('active');
  }

  closeWorkshop() {
    this.dom.workshopScreen.classList.remove('active');
    if (this.previousState === 'PAUSED') {
      this.dom.pauseScreen.classList.add('active');
      this.state = 'PAUSED';
    } else {
      this.updateStartScreenUI();
      this.dom.startScreen.classList.add('active');
      this.state = 'START';
    }
  }

  handleBuyUpgrade(type) {
    if (window.workshopMgr.canBuy(type)) {
      window.workshopMgr.buyUpgrade(type);
      window.audioMgr.playBuy();
      this.updateWorkshopUI();
      this.updateStartScreenUI();
    } else {
      window.audioMgr.playBeep();
    }
  }

  handleBuyRepair() {
    if (window.workshopMgr.canRepair(window.playerCar)) {
      window.workshopMgr.buyRepair(window.playerCar);
      window.audioMgr.playBuy();
      this.updateWorkshopUI();
      this.updateHUD();
    } else {
      window.audioMgr.playBeep();
    }
  }

  updateWorkshopUI() {
    const mgr = window.workshopMgr;
    const cash = mgr.cash;
    this.dom.workshopCashVal.textContent = this.formatCash(cash);
    this.dom.marqueeCashVal.textContent = this.formatCash(cash);

    const updateCard = (type, lvlEl, descEl, pipsEl, btnEl) => {
      const def = mgr.upgradeDefs[type];
      const lvl = mgr.getUpgradeLevel(type);
      const nextCost = mgr.getNextCost(type);

      lvlEl.textContent = `LVL ${lvl}/${def.maxLevel}`;
      if (lvl >= def.maxLevel) {
        descEl.textContent = 'Nível máximo atingido! Desempenho otimizado.';
        btnEl.textContent = 'MÁXIMO';
        btnEl.disabled = true;
        btnEl.classList.add('disabled');
      } else {
        descEl.textContent = def.benefits[lvl];
        btnEl.textContent = `COMPRAR $${nextCost}`;
        btnEl.disabled = cash < nextCost;
        if (cash < nextCost) btnEl.classList.add('disabled');
        else btnEl.classList.remove('disabled');
      }

      // Update level pips
      pipsEl.innerHTML = '';
      for (let i = 0; i < def.maxLevel; i++) {
        const span = document.createElement('span');
        span.className = `pip ${i < lvl ? 'filled' : ''}`;
        pipsEl.appendChild(span);
      }
    };

    updateCard('motor', this.dom.lvlMotor, this.dom.descMotor, this.dom.pipsMotor, this.dom.btnBuyMotor);
    updateCard('pneus', this.dom.lvlPneus, this.dom.descPneus, this.dom.pipsPneus, this.dom.btnBuyPneus);
    updateCard('nitro', this.dom.lvlNitro, this.dom.descNitro, this.dom.pipsNitro, this.dom.btnBuyNitro);
    updateCard('blindagem', this.dom.lvlBlindagem, this.dom.descBlindagem, this.dom.pipsBlindagem, this.dom.btnBuyBlindagem);

    // Repair button
    const canRepair = mgr.canRepair(window.playerCar);
    this.dom.btnBuyRepair.disabled = !canRepair;
    if (!canRepair) this.dom.btnBuyRepair.classList.add('disabled');
    else this.dom.btnBuyRepair.classList.remove('disabled');
  }

  updateStartScreenUI() {
    const cash = window.workshopMgr.cash;
    this.dom.startCashVal.textContent = this.formatCash(cash);
    this.dom.marqueeCashVal.textContent = this.formatCash(cash);
    this.dom.startHighScore.textContent = `${this.formatScore(this.highScore)} PTS`;
  }

  // ==========================================================
  // GAME LIFECYCLE
  // ==========================================================
  startGame() {
    this.hideAllModals();
    this.score = 0;
    this.perfectDodges = 0;
    this.resetCombo();
    this.runCashEarned = 0;

    window.stageMgr.reset();
    window.obstacleMgr.reset();
    window.particleMgr.reset();
    window.playerCar.reset();

    this.state = 'PLAYING';
    window.audioMgr.startEngine();
    this.updateHUD();
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      window.audioMgr.stopEngine();
      const stage = window.stageMgr.getCurrentStage();
      this.dom.pauseStageText.textContent = `${stage.id} - ${stage.subName}`;
      this.dom.pauseScoreText.textContent = this.formatScore(this.score);
      this.dom.pauseCashText.textContent = this.formatCash(window.workshopMgr.cash);
      this.dom.pauseScreen.classList.add('active');
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.hideAllModals();
    this.state = 'PLAYING';
    window.audioMgr.startEngine();
  }

  triggerGameOver() {
    this.state = 'GAMEOVER';
    window.audioMgr.stopEngine();
    window.audioMgr.playGameOver();

    // Reward distance cash bonus
    const distCash = Math.floor(window.stageMgr.totalDistance * 0.08);
    window.workshopMgr.addCash(distCash);
    this.runCashEarned += distCash;

    this.dom.gameOverScore.textContent = this.formatScore(this.score);
    this.dom.gameOverHighScore.textContent = this.formatScore(this.highScore);
    this.dom.gameOverCashEarned.textContent = `+$${this.runCashEarned.toLocaleString()}`;
    this.dom.gameOverDodges.textContent = this.perfectDodges.toString();

    setTimeout(() => {
      this.dom.gameOverScreen.classList.add('active');
    }, 750);
  }

  triggerVictory() {
    this.state = 'VICTORY';
    window.audioMgr.stopEngine();
    window.audioMgr.playVictory();

    // Grand champion prize
    const grandPrize = 1000;
    window.workshopMgr.addCash(grandPrize);
    this.runCashEarned += grandPrize;

    this.dom.victoryScore.textContent = this.formatScore(this.score);
    this.dom.victoryHighScore.textContent = this.formatScore(this.highScore);
    this.dom.victoryDistance.textContent = `${Math.floor(window.stageMgr.totalDistance).toLocaleString()} m`;
    this.dom.victoryCashEarned.textContent = `+$${this.runCashEarned.toLocaleString()}`;
    this.dom.victoryDodges.textContent = this.perfectDodges.toString();

    this.dom.victoryScreen.classList.add('active');
  }

  triggerStageTransition() {
    this.state = 'TRANSITION';
    this.transitionTimer = 2.4;

    // Stage Clear rewards
    this.addScore(2000);
    const stageCashBonus = 200;
    window.workshopMgr.addCash(stageCashBonus);
    this.runCashEarned += stageCashBonus;
    window.audioMgr.playStageClear();

    const nextStage = window.stageMgr.nextStage();
    if (!nextStage) {
      this.triggerVictory();
      return;
    }

    this.dom.transitionTitle.textContent = `FASE ${nextStage.id}: ${nextStage.subName}`;
    this.dom.transitionDesc.textContent = nextStage.desc;
    this.dom.stageTransitionOverlay.classList.add('active');

    window.obstacleMgr.items = [];
    window.playerCar.rechargeNitro(window.playerCar.maxNitro * 0.5);
  }

  hideAllModals() {
    this.dom.startScreen.classList.remove('active');
    this.dom.pauseScreen.classList.remove('active');
    this.dom.gameOverScreen.classList.remove('active');
    this.dom.victoryScreen.classList.remove('active');
    this.dom.workshopScreen.classList.remove('active');
    this.dom.stageTransitionOverlay.classList.remove('active');
  }

  // ==========================================================
  // HUD UPDATES
  // ==========================================================
  updateHUD() {
    const stage = window.stageMgr.getCurrentStage();
    const player = window.playerCar;

    // Stage
    this.dom.hudStageNum.textContent = stage.id.toString();
    this.dom.hudStageName.textContent = stage.subName;

    // Progress & Distance
    const progress = window.stageMgr.getProgressRatio();
    const pct = Math.floor(progress * 100);
    this.dom.hudProgressBar.style.width = `${pct}%`;
    this.dom.hudProgressMarker.style.left = `${pct}%`;
    this.dom.hudProgressText.textContent = `${pct}%`;
    this.dom.hudDistText.textContent = `${Math.floor(window.stageMgr.stageDistance)} m`;

    // Score & Combo Multiplier
    this.dom.hudScore.textContent = this.formatScore(this.score);
    if (this.comboMultiplier > 1.0) {
      this.dom.hudComboBadge.textContent = `${this.comboMultiplier.toFixed(1)}x COMBO`;
      this.dom.hudComboBadge.classList.add('active');
    } else {
      this.dom.hudComboBadge.textContent = '1.0x';
      this.dom.hudComboBadge.classList.remove('active');
    }

    // Hero Speedometer & Dynamic Tachometer Fill
    const kmh = Math.round(player.speed * 0.48);
    this.dom.hudSpeed.textContent = kmh.toString();
    const maxKmh = Math.round(stage.maxSpeed * (player.motorSpeedMult || 1.0) * 1.5 * 0.48);
    const speedRatio = Math.min(1.0, kmh / maxKmh);
    if (this.dom.hudTachoFill) {
      this.dom.hudTachoFill.style.width = `${Math.floor(speedRatio * 100)}%`;
    }

    // Live Cash in HUD and Marquee
    const cashStr = this.formatCash(window.workshopMgr.cash);
    if (this.dom.hudLiveCash) this.dom.hudLiveCash.textContent = cashStr;
    this.dom.marqueeCashVal.textContent = cashStr;

    // Vehicle Hull Status Text
    if (this.dom.hudHullStatus) {
      if (player.shields > 0) {
        this.dom.hudHullStatus.textContent = `ESCUDO: +${player.shields}`;
        this.dom.hudHullStatus.style.color = '#38bdf8';
      } else if (player.lives === 3) {
        this.dom.hudHullStatus.textContent = 'ESTRUTURA 100%';
        this.dom.hudHullStatus.style.color = '#10b981';
      } else if (player.lives === 2) {
        this.dom.hudHullStatus.textContent = 'ESTRUTURA 66%';
        this.dom.hudHullStatus.style.color = '#f59e0b';
      } else {
        this.dom.hudHullStatus.textContent = 'ALERTA CRÍTICO!';
        this.dom.hudHullStatus.style.color = '#ef4444';
      }
    }

    // Life Hearts
    const hearts = this.dom.heartsContainer.children;
    for (let i = 0; i < hearts.length; i++) {
      if (i < player.lives) {
        hearts[i].classList.remove('lost');
      } else {
        hearts[i].classList.add('lost');
      }
    }

    // Shield Pips (Armor)
    this.dom.shieldsContainer.innerHTML = '';
    if (player.maxShields > 0) {
      for (let s = 0; s < player.maxShields; s++) {
        const pip = document.createElement('span');
        pip.className = `pip-shield ${s < player.shields ? 'active' : 'lost'}`;
        pip.textContent = '🛡️';
        this.dom.shieldsContainer.appendChild(pip);
      }
    }

    // Nitro Gauge
    const nitroPct = (player.nitro / player.maxNitro) * 100;
    this.dom.hudNitroBar.style.width = `${nitroPct}%`;

    if (player.isNitroActive) {
      this.dom.nitroStatus.textContent = 'ATIVO!';
      this.dom.nitroStatus.className = 'nitro-status-label status-active';
    } else if (player.nitro >= 20) {
      this.dom.nitroStatus.textContent = 'PRONTO';
      this.dom.nitroStatus.className = 'nitro-status-label status-ready';
    } else {
      this.dom.nitroStatus.textContent = 'RECARREGANDO';
      this.dom.nitroStatus.className = 'nitro-status-label status-charging';
    }
  }

  // ==========================================================
  // MAIN LOOP
  // ==========================================================
  loop(currentTime) {
    if (!this.lastTime) this.lastTime = currentTime;
    const rawDt = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;
    const dt = Math.min(rawDt, 0.05);

    this.update(dt);
    this.render();

    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const stage = window.stageMgr.getCurrentStage();
    const player = window.playerCar;

    if (this.state === 'PLAYING') {
      // 1. Update Combo decay
      if (this.comboTimer > 0) {
        this.comboTimer -= dt;
        if (this.comboTimer <= 0) {
          this.resetCombo();
        }
      }

      // 2. Update Player
      player.update(dt);

      // 3. Distance scoring
      const speedMult = player.isNitroActive ? 2.5 : 1.0;
      this.addScore((player.speed * dt * 0.12) * speedMult * this.comboMultiplier);

      // 4. Update Road & Scenery
      window.stageMgr.update(dt, player.speed);

      // 5. Update Obstacles & Traffic
      window.obstacleMgr.update(dt, player.speed, player);

      // 6. Update Particles
      window.particleMgr.update(dt, player.speed);
      window.particleMgr.spawnStageAtmosphere(stage.id, dt);

      // 7. Check Stage Completion
      if (window.stageMgr.isStageComplete()) {
        if (window.stageMgr.isGameComplete()) {
          this.triggerVictory();
        } else {
          this.triggerStageTransition();
        }
      }

      this.updateHUD();
    } else if (this.state === 'TRANSITION') {
      window.stageMgr.update(dt, player.speed * 0.5);
      window.particleMgr.update(dt, player.speed * 0.5);

      this.transitionTimer -= dt;
      if (this.transitionTimer <= 0) {
        this.dom.stageTransitionOverlay.classList.remove('active');
        this.state = 'PLAYING';
      }
    } else if (this.state === 'VICTORY') {
      window.particleMgr.spawnConfetti(dt);
      window.particleMgr.update(dt, 50);
    } else if (this.state === 'GAMEOVER') {
      window.particleMgr.update(dt, 0);
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Apply Screen Shake
    const shakeX = window.particleMgr.shakeOffsetX;
    const shakeY = window.particleMgr.shakeOffsetY;
    ctx.translate(shakeX, shakeY);

    // Clear Screen
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Distant Skyline Horizon (Depth Layer 1)
    window.stageMgr.drawDistantSkyline(ctx);

    // 2. Roadside Architecture & Street Fixtures (Depth Layer 2 - Outside road)
    window.stageMgr.drawRoadsideArchitecture(ctx);

    // 3. Asphalt Road Bed, Curbs, Light Pools & Lane Dividers (Depth Layer 3)
    window.stageMgr.drawRoad(ctx);

    // 4. Tire Skid Marks (on top of asphalt)
    window.particleMgr.drawSkidMarks(ctx);

    // 5. Interactive Vehicles & Road Hazards (Depth Layer 4)
    window.obstacleMgr.draw(ctx);

    // 5. Player Car
    if (this.state !== 'START' && this.state !== 'WORKSHOP') {
      window.playerCar.draw(ctx);
    }

    // 6. Particles, Smoke, Embers, Explosions & Floating Text
    window.particleMgr.draw(ctx);

    // 7. Stage Atmosphere & Sky Lighting Tint
    window.stageMgr.drawAtmosphere(ctx);

    // Damage Flash
    if (window.playerCar.isInvincible && window.playerCar.invincibleTimer > 1.5) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    ctx.restore();
  }
}

// Boot game when DOM is loaded
window.addEventListener('DOMContentLoaded', () => {
  window.game = new GameEngine();
});
