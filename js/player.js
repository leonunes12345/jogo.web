/**
 * Retro Overdrive - Player Vehicle Controller (Fluid Lateral Physics & Upgrades)
 * Continuous weighted steering, inertia, tire grip, armor shields, and nitro boost.
 */

class Player {
  constructor() {
    this.x = 240; // center of road
    this.y = 575; // fixed vertical position
    this.width = 22; // precise collision box matching car body
    this.height = 46;

    // Lateral Physics
    this.vx = 0; // lateral velocity
    this.steerAccel = 1350; // px/s^2 (modified by tires upgrade)
    this.maxLateralSpeed = 420; // px/s (modified by tires upgrade)
    this.gripDamping = 0.88; // friction damping per 60fps frame
    this.tiltAngle = 0; // visual roll/tilt angle in radians

    // Longitudinal Speed
    this.speed = 280;
    this.targetSpeed = 280;
    this.motorSpeedMult = 1.0;
    this.motorAccelMult = 1.0;

    // Health, Shields & Armor
    this.maxLives = 3;
    this.lives = 3;
    this.maxShields = 0; // from blindagem upgrade (0-3)
    this.shields = 0;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.blinkTimer = 0;
    this.visible = true;

    // Nitro System
    this.maxNitro = 100;
    this.nitro = 100;
    this.isNitroActive = false;
    this.nitroDrainRate = 32;
    this.nitroRechargeRate = 9;

    // Oil Slick Hazard
    this.isSpinning = false;
    this.spinTimer = 0;
    this.spinAngle = 0;

    // Input States (continuous holding)
    this.inputs = {
      left: false,
      right: false,
      accelerate: false,
      brake: false,
      nitro: false
    };

    // Apply workshop upgrades if manager is already loaded
    if (window.workshopMgr) {
      window.workshopMgr.applyToPlayer(this);
    }
  }

  reset() {
    this.x = 240;
    this.y = 575;
    this.vx = 0;
    this.tiltAngle = 0;
    this.lives = 3;
    this.isInvincible = false;
    this.invincibleTimer = 0;
    this.visible = true;
    this.isSpinning = false;
    this.spinAngle = 0;
    this.isNitroActive = false;

    // Reapply workshop stats
    if (window.workshopMgr) {
      window.workshopMgr.applyToPlayer(this);
    } else {
      this.shields = 0;
      this.maxNitro = 100;
      this.nitro = 100;
    }
    this.nitro = this.maxNitro;
    this.speed = window.stageMgr.getCurrentStage().baseSpeed * (this.motorSpeedMult || 1.0);
  }

  // Activate Nitro Overdrive
  activateNitro() {
    if (this.nitro > 20 && !this.isNitroActive) {
      this.isNitroActive = true;
      window.audioMgr.playNitro();
      window.particleMgr.shake(4, 0.35);
      window.particleMgr.addFloatingText('NITRO BOOST!', this.x, this.y - 25, '#00ffaa');
    }
  }

  rechargeNitro(amount) {
    this.nitro = Math.min(this.maxNitro, this.nitro + amount);
  }

  heal() {
    let healed = false;
    if (this.lives < this.maxLives) {
      this.lives++;
      healed = true;
    } else if (this.shields < this.maxShields) {
      this.shields++;
      healed = true;
    }
    return healed;
  }

  update(dt) {
    const stage = window.stageMgr.getCurrentStage();
    const roadLeft = window.stageMgr.roadLeft;
    const roadRight = window.stageMgr.roadRight;

    // 1. Fluid Lateral Physics (Continuous weighted steering)
    let steerDir = 0;
    if (this.inputs.left) steerDir -= 1;
    if (this.inputs.right) steerDir += 1;

    if (!this.isSpinning) {
      if (steerDir !== 0) {
        // Accelerate horizontally
        this.vx += steerDir * this.steerAccel * dt;
        // Clamp lateral speed
        this.vx = Math.max(-this.maxLateralSpeed, Math.min(this.maxLateralSpeed, this.vx));

        // Add subtle road friction / tire marks during heavy sharp turns
        if (Math.abs(this.vx) > this.maxLateralSpeed * 0.7 && Math.random() < 0.25) {
          window.particleMgr.addSkidMark(this.x, this.y, this.vx < 0);
        }
      } else {
        // Natural tire grip deceleration (friction/inertia decay)
        const frameDamping = Math.pow(this.gripDamping, dt * 60);
        this.vx *= frameDamping;
        if (Math.abs(this.vx) < 5) this.vx = 0;
      }
    } else {
      // Wild oil drift physics
      this.vx *= 0.94;
    }

    // Apply lateral movement
    this.x += this.vx * dt;

    // 2. Road Boundary Clamping with Curb Rumble
    const minX = roadLeft + this.width / 2 + 4;
    const maxX = roadRight - this.width / 2 - 4;

    if (this.x < minX) {
      this.x = minX;
      if (this.vx < 0) {
        this.vx = 0;
        window.particleMgr.addTireSparks(this.x, this.y);
      }
    } else if (this.x > maxX) {
      this.x = maxX;
      if (this.vx > 0) {
        this.vx = 0;
        window.particleMgr.addTireSparks(this.x, this.y);
      }
    }

    // 3. Smooth Visual Tilt (Leaning with inertia)
    const targetTilt = (this.vx / this.maxLateralSpeed) * 0.18; // up to ~10 degrees
    this.tiltAngle += (targetTilt - this.tiltAngle) * 12 * dt;

    // 4. Longitudinal Speed Handling (Integrated with Motor & Nitro upgrades)
    const baseSpeed = stage.baseSpeed * this.motorSpeedMult;
    const maxSpeed = stage.maxSpeed * this.motorSpeedMult;

    if (this.isNitroActive) {
      this.targetSpeed = maxSpeed * 1.5;
      this.nitro -= this.nitroDrainRate * dt;
      window.particleMgr.addNitroSparks(this.x, this.y);

      if (this.nitro <= 0) {
        this.nitro = 0;
        this.isNitroActive = false;
      }
    } else {
      // Passive nitro recharge
      this.nitro = Math.min(this.maxNitro, this.nitro + this.nitroRechargeRate * dt);

      if (this.inputs.accelerate) {
        this.targetSpeed = maxSpeed;
      } else if (this.inputs.brake) {
        this.targetSpeed = baseSpeed * 0.65;
      } else {
        this.targetSpeed = baseSpeed;
      }
    }

    // Oil spin speed penalty
    if (this.isSpinning) {
      this.targetSpeed *= 0.6;
    }

    // Smooth longitudinal acceleration
    const accelRate = 4.5 * this.motorAccelMult;
    this.speed += (this.targetSpeed - this.speed) * accelRate * dt;
    window.audioMgr.updateEngine(this.speed / maxSpeed, this.isNitroActive);

    // Exhaust smoke puff
    window.particleMgr.addExhaustSmoke(this.x, this.y);

    // 5. Oil Slick Spin Recovery
    if (this.isSpinning) {
      this.spinTimer -= dt;
      this.spinAngle += Math.PI * 4 * dt;
      if (this.spinTimer <= 0) {
        this.isSpinning = false;
        this.spinAngle = 0;
      }
    }

    // 6. Invincibility Blink (i-frames)
    if (this.isInvincible) {
      this.invincibleTimer -= dt;
      this.blinkTimer += dt;
      this.visible = Math.floor(this.blinkTimer * 14) % 2 === 0;

      if (this.invincibleTimer <= 0) {
        this.isInvincible = false;
        this.visible = true;
      }
    } else {
      this.visible = true;
    }

    // 7. Check Collisions with active items
    this.checkCollisions();
  }

  // Hit oil slick
  hitOil() {
    if (this.isSpinning) return;
    this.isSpinning = true;
    this.spinTimer = 0.85;
    window.audioMgr.playScreech();
    window.particleMgr.addSkidMark(this.x, this.y, true);
    window.particleMgr.addSkidMark(this.x, this.y, false);
    window.particleMgr.addFloatingText('DERRAPAGEM!', this.x, this.y - 25, '#00e5ff');
  }

  // Collision with vehicle or hazard
  takeDamage(obstacleX, obstacleY) {
    if (this.isInvincible) return;

    // Nitro smash: if nitro is active, blast through obstacles!
    if (this.isNitroActive) {
      window.audioMgr.playCrash();
      window.particleMgr.shake(6, 0.3);
      window.particleMgr.addExplosion(obstacleX, obstacleY, true);
      window.game.addScore(300);
      window.workshopMgr.addCash(35);
      window.particleMgr.addFloatingText('ESMAGADO! +$35', obstacleX, obstacleY - 20, '#00ff73');
      return;
    }

    // Armor shield absorption
    if (this.shields > 0) {
      this.shields--;
      window.audioMgr.playHit();
      window.particleMgr.shake(7, 0.35);
      window.particleMgr.addShieldSparks(this.x, this.y);
      this.isInvincible = true;
      this.invincibleTimer = 1.4;
      this.blinkTimer = 0;
      window.particleMgr.addFloatingText('ESCUDO ABSORVEU!', this.x, this.y - 30, '#00e5ff');
      return;
    }

    // No shield remaining: lose 1 life
    this.lives--;
    window.audioMgr.playCrash();
    window.particleMgr.shake(11, 0.5);
    window.particleMgr.addExplosion(this.x, this.y, false);

    // Reset combo multiplier on crash
    if (window.game) {
      window.game.resetCombo();
    }

    if (this.lives > 0) {
      this.isInvincible = true;
      this.invincibleTimer = 2.0;
      this.blinkTimer = 0;
      window.particleMgr.addFloatingText('-1 INTEGRIDADE!', this.x, this.y - 30, '#ff3366');
    } else {
      // Fatal crash
      window.particleMgr.addExplosion(this.x, this.y, true);
      window.game.triggerGameOver();
    }
  }

  // Collisions detection
  checkCollisions() {
    const items = window.obstacleMgr.items;
    const px = this.x;
    const py = this.y;
    const pw = this.width;
    const ph = this.height;

    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (!item.collidable || item.isDecorative || item.hasCollided) continue;

      // Axis-Aligned Bounding Box (AABB) with fair padding
      const collisionX = Math.abs(px - item.x) < (pw / 2 + item.width / 2 - 3);
      const collisionY = Math.abs(py - item.y) < (ph / 2 + item.height / 2 - 4);

      if (collisionX && collisionY) {
        item.hasCollided = true;

        if (item.category === 'pickup') {
          window.audioMgr.playPickup();
          if (item.type === 'nitro') {
            this.rechargeNitro(this.maxNitro * 0.4);
            window.particleMgr.addFloatingText('NITRO +40%', px, py - 20, '#00ffaa');
          } else if (item.type === 'heart') {
            const healed = this.heal();
            window.particleMgr.addFloatingText(healed ? 'REPARO +1!' : '+$50', px, py - 20, '#00e5ff');
            if (!healed) window.workshopMgr.addCash(50);
          } else if (item.type === 'coin') {
            window.game.addScore(500);
            window.workshopMgr.addCash(75);
            window.particleMgr.addFloatingText('+$75', px, py - 20, '#ffbe0b');
          }
          items.splice(i, 1);
        } else if (item.type === 'oil') {
          this.hitOil();
        } else {
          this.takeDamage(item.x, item.y);
          if (this.isNitroActive) {
            items.splice(i, 1);
          }
        }
      }
    }
  }

  // Draw Player Car with subtle tilt and headlights
  draw(ctx) {
    if (!this.visible) return;

    let spriteKey = this.isNitroActive ? 'player_nitro' : 'player_car';
    const rotation = this.spinAngle || this.tiltAngle;

    // Draw soft vehicle shadow underneath
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(Math.round(this.x), Math.round(this.y + 2), 14, 25, rotation, 0, Math.PI * 2);
    ctx.fill();

    // Draw Player Sprite
    window.spriteMgr.draw(ctx, spriteKey, this.x, this.y, 1, rotation);

    // Draw Active Shield Aura (if player has armor shields)
    if (this.shields > 0) {
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.4 + Math.sin(Date.now() * 0.008) * 0.2})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(Math.round(this.x), Math.round(this.y), 17, 28, rotation, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Headlights casting beam forward
    this.drawHeadlights(ctx);
  }

  drawHeadlights(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y - 24);
    ctx.fillStyle = 'rgba(255, 230, 160, 0.07)';
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.lineTo(-40, -150);
    ctx.lineTo(40, -150);
    ctx.lineTo(9, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// Global player singleton
window.playerCar = new Player();
