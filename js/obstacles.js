/**
 * Retro Overdrive - Traffic & Interactive Hazard Management
 * Manages only interactive vehicles and deliberate road obstacles.
 * Enforces explicit collidable/isDecorative separation.
 */

class ObstacleManager {
  constructor() {
    this.items = [];
    this.spawnTimer = 0;
    this.nextId = 1;
    this.lastSpawnLanes = [];
  }

  reset() {
    this.items = [];
    this.spawnTimer = 0;
    this.lastSpawnLanes = [];
  }

  update(dt, playerSpeed, playerCar) {
    const stage = window.stageMgr.getCurrentStage();

    // Spawn interval dynamically adjusted to current speed for fair reaction time
    const baseInterval = Math.max(0.75, 1.45 - (stage.id * 0.12));
    this.spawnTimer += dt;
    if (this.spawnTimer >= baseInterval) {
      this.spawnTimer = 0;
      this.spawnIntelligentWave(stage, playerSpeed);
    }

    // Update active interactive items
    for (let i = this.items.length - 1; i >= 0; i--) {
      const item = this.items[i];

      // Relative downward motion
      const relativeSpeed = playerSpeed - item.speed;
      item.y += relativeSpeed * dt;

      // Subtle horizontal weaving for muscle cars
      if (item.type === 'traffic' && item.driftSpeed) {
        item.x += item.driftSpeed * dt;
        const leftLimit = window.stageMgr.roadLeft + 25;
        const rightLimit = window.stageMgr.roadRight - 25;
        if (item.x < leftLimit || item.x > rightLimit) {
          item.driftSpeed *= -1;
        }
      }

      // Police siren flashing
      if (item.spriteKey === 'traffic_police') {
        item.sirenTimer = (item.sirenTimer || 0) + dt;
        item.sirenState = Math.sin(item.sirenTimer * 14) > 0;
      }

      // Near-miss overtake check (only on interactive hazards)
      if (!item.hasNearMissed && !item.hasCollided && item.collidable && item.category === 'hazard') {
        this.checkOvertake(item, playerCar);
      }

      // Remove offscreen items
      if (item.y > 820 || item.y < -350) {
        this.items.splice(i, 1);
      }
    }
  }

  // Intelligent Spawning: Always guarantees fair reaction time and open lanes
  spawnIntelligentWave(stage, playerSpeed) {
    const laneCenters = window.stageMgr.laneCenters; // [120, 200, 280, 360]
    const allLanes = [0, 1, 2, 3];

    // Pick 1 to 2 hazards (or max 3 in later stages, guaranteeing at least 1 open lane)
    const rand = Math.random();
    let numHazards = 1;
    if (rand > 0.52 && rand <= 0.88) {
      numHazards = 2;
    } else if (rand > 0.88 && stage.id >= 2) {
      numHazards = 3;
    }

    // Shuffle lanes
    for (let i = allLanes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allLanes[i], allLanes[j]] = [allLanes[j], allLanes[i]];
    }

    const chosenLanes = allLanes.slice(0, numHazards);
    this.lastSpawnLanes = chosenLanes;

    // Stagger heights slightly if multiple hazards
    chosenLanes.forEach((laneIdx, idx) => {
      const yOffset = -120 - (idx * 35);
      this.spawnItemInLane(laneIdx, stage, yOffset);
    });

    // Chance to spawn a pickup in an unoccupied lane
    if (Math.random() < 0.28) {
      const freeLanes = allLanes.slice(numHazards);
      if (freeLanes.length > 0) {
        const pickupLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
        this.spawnPickupInLane(pickupLane);
      }
    }
  }

  spawnItemInLane(laneIdx, stage, initialY = -120) {
    const x = window.stageMgr.laneCenters[laneIdx];
    const isTraffic = Math.random() < 0.7;

    if (isTraffic) {
      const spriteKey = stage.trafficTypes[Math.floor(Math.random() * stage.trafficTypes.length)];
      
      let speed = 90 + Math.random() * 80;
      let width = 24;
      let height = 48;

      if (spriteKey === 'traffic_truck') {
        speed = 55 + Math.random() * 35;
        width = 32;
        height = 96;
      } else if (spriteKey === 'traffic_suv') {
        speed = 100 + Math.random() * 60;
        width = 26;
        height = 52;
      } else if (spriteKey === 'traffic_police' || spriteKey === 'traffic_muscle') {
        speed = 140 + Math.random() * 80;
        width = 25;
        height = 50;
      } else if (spriteKey === 'traffic_wreck') {
        speed = 0;
        width = 26;
        height = 46;
      }

      this.items.push({
        id: this.nextId++,
        type: 'traffic',
        category: 'hazard',
        lane: laneIdx,
        x: x,
        y: initialY,
        width: width,
        height: height,
        spriteKey: spriteKey,
        speed: speed,
        driftSpeed: (spriteKey === 'traffic_muscle' && Math.random() > 0.65) ? (Math.random() > 0.5 ? 20 : -20) : 0,
        hasNearMissed: false,
        hasCollided: false,
        collidable: true,       // EXPLICIT COLLIDABLE OBJECT
        isDecorative: false     // EXPLICIT NOT DECORATIVE
      });
    } else {
      const spriteKey = stage.obstacleTypes[Math.floor(Math.random() * stage.obstacleTypes.length)];
      let width = 20;
      let height = 20;
      let isOil = spriteKey === 'obs_oil';
      let isFire = spriteKey === 'obs_fire';

      if (spriteKey === 'obs_barrier') {
        width = 42;
        height = 18;
      } else if (isOil) {
        width = 36;
        height = 22;
      } else if (isFire) {
        width = 28;
        height = 28;
      }

      this.items.push({
        id: this.nextId++,
        type: isOil ? 'oil' : (isFire ? 'fire' : 'obstacle'),
        category: 'hazard',
        lane: laneIdx,
        x: x,
        y: initialY,
        width: width,
        height: height,
        spriteKey: spriteKey,
        speed: 0,
        hasNearMissed: false,
        hasCollided: false,
        collidable: true,       // EXPLICIT COLLIDABLE OBJECT
        isDecorative: false     // EXPLICIT NOT DECORATIVE
      });
    }
  }

  spawnPickupInLane(laneIdx) {
    const x = window.stageMgr.laneCenters[laneIdx];
    const rand = Math.random();
    let pickupType = 'nitro';
    let spriteKey = 'pickup_nitro';

    if (rand < 0.45) {
      pickupType = 'nitro';
      spriteKey = 'pickup_nitro';
    } else if (rand < 0.8) {
      pickupType = 'coin';
      spriteKey = 'pickup_coin';
    } else {
      pickupType = 'heart';
      spriteKey = 'pickup_heart';
    }

    this.items.push({
      id: this.nextId++,
      type: pickupType,
      category: 'pickup',
      lane: laneIdx,
      x: x,
      y: -140,
      width: 20,
      height: 20,
      spriteKey: spriteKey,
      speed: 0,
      hasNearMissed: true,
      hasCollided: false,
      collidable: true,       // EXPLICIT COLLIDABLE (FOR PICKUP)
      isDecorative: false     // EXPLICIT NOT DECORATIVE
    });
  }

  checkOvertake(item, playerCar) {
    if (playerCar.isInvincible || !item.collidable || item.isDecorative) return;

    const dx = Math.abs(item.x - playerCar.x);
    const dy = item.y - playerCar.y;

    const minSafeDist = (item.width / 2 + playerCar.width / 2) + 2;
    const maxCloseDist = minSafeDist + 22;

    if (dy > 12 && dy < 50 && dx >= minSafeDist && dx <= maxCloseDist) {
      item.hasNearMissed = true;

      const combo = window.game ? window.game.comboMultiplier : 1.0;
      const basePoints = 150;
      const baseCash = 25;
      const awardedPoints = Math.round(basePoints * combo);
      const awardedCash = Math.round(baseCash * combo);

      window.audioMgr.playNearMiss();
      window.game.addScore(awardedPoints);
      window.game.incrementCombo();
      window.workshopMgr.addCash(awardedCash);
      playerCar.rechargeNitro(playerCar.maxNitro * 0.12);

      const comboText = combo > 1.0 ? ` [${combo.toFixed(1)}x]` : '';
      window.particleMgr.addFloatingText(`PERTO! +$${awardedCash}${comboText}`, item.x, item.y - 20, '#f59e0b');
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];

      // Soft shadow under interactive vehicles and obstacles
      if (item.category === 'hazard' && item.type !== 'oil') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
        ctx.beginPath();
        ctx.ellipse(Math.round(item.x), Math.round(item.y + 2), item.width * 0.6, item.height * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      window.spriteMgr.draw(ctx, item.spriteKey, item.x, item.y);

      // Police flashing light effects
      if (item.spriteKey === 'traffic_police' && item.sirenState) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.45)';
        ctx.beginPath();
        ctx.arc(item.x - 5, item.y - 3, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(59, 130, 246, 0.45)';
        ctx.beginPath();
        ctx.arc(item.x + 5, item.y - 3, 9, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pickup subtle aura
      if (item.category === 'pickup') {
        const pulse = 0.2 + Math.sin(Date.now() * 0.007) * 0.1;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulse})`;
        ctx.beginPath();
        ctx.arc(item.x, item.y, 13, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

// Global obstacle singleton
window.obstacleMgr = new ObstacleManager();
