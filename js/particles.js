/**
 * Retro Overdrive - Particle & FX Engine (Enhanced Pixel Atmosphere)
 * Screen shake, skid marks, tire curb sparks, shield absorption sparks, exhaust smoke, and floating text.
 */

class ParticleSystem {
  constructor() {
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  reset() {
    this.particles = [];
    this.skidMarks = [];
    this.floatingTexts = [];
    this.screenShakeTime = 0;
    this.screenShakeIntensity = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  shake(intensity = 6, duration = 0.3) {
    this.screenShakeIntensity = intensity;
    this.screenShakeTime = duration;
  }

  update(dt, roadSpeed) {
    // 1. Screen Shake decay
    if (this.screenShakeTime > 0) {
      this.screenShakeTime -= dt;
      const decay = Math.max(0, this.screenShakeTime / 0.3);
      const amp = this.screenShakeIntensity * decay;
      this.shakeOffsetX = (Math.random() * 2 - 1) * amp;
      this.shakeOffsetY = (Math.random() * 2 - 1) * amp;
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }

    // 2. Skid Marks scrolling
    for (let i = this.skidMarks.length - 1; i >= 0; i--) {
      const sm = this.skidMarks[i];
      sm.y += roadSpeed * dt;
      sm.life -= dt * 0.45;
      if (sm.y > 750 || sm.life <= 0) {
        this.skidMarks.splice(i, 1);
      }
    }

    // 3. Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += (p.vy + (p.relativeRoad ? roadSpeed : 0)) * dt;
      p.life -= dt;
      p.size = Math.max(0, p.size + (p.growth || 0) * dt);

      if (p.life <= 0 || p.y > 760 || p.y < -60 || p.x < -60 || p.x > 540) {
        this.particles.splice(i, 1);
      }
    }

    // 4. Floating Texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy * dt;
      ft.life -= dt;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }

  addSkidMark(x, y, isLeftWheel = true) {
    const offsetX = isLeftWheel ? -9 : 9;
    this.skidMarks.push({
      x: x + offsetX,
      y: y + 18,
      w: 3,
      h: 10,
      alpha: 0.35,
      life: 1.0
    });
  }

  addExhaustSmoke(x, y) {
    if (Math.random() > 0.35) return;
    this.particles.push({
      x: x + (Math.random() * 4 - 2),
      y: y + 26,
      vx: (Math.random() - 0.5) * 12,
      vy: 35 + Math.random() * 25,
      size: 2.5 + Math.random() * 2,
      growth: 5,
      color: 'rgba(148, 163, 184, 0.35)',
      life: 0.25,
      relativeRoad: true
    });
  }

  addNitroSparks(x, y) {
    for (let i = 0; i < 3; i++) {
      const isCyan = Math.random() > 0.3;
      this.particles.push({
        x: x + (Math.random() * 10 - 5),
        y: y + 26,
        vx: (Math.random() - 0.5) * 35,
        vy: 160 + Math.random() * 90,
        size: 2.5 + Math.random() * 2,
        growth: -3,
        color: isCyan ? '#00e5ff' : '#ffffff',
        life: 0.22,
        relativeRoad: true
      });
    }
  }

  addTireSparks(x, y) {
    for (let i = 0; i < 2; i++) {
      this.particles.push({
        x: x,
        y: y + 10,
        vx: (Math.random() - 0.5) * 60,
        vy: -20 - Math.random() * 40,
        size: 2,
        growth: -2,
        color: Math.random() > 0.5 ? '#f59e0b' : '#fef08a',
        life: 0.18,
        relativeRoad: false
      });
    }
  }

  addShieldSparks(x, y) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 70 + Math.random() * 90;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2 + Math.random() * 3,
        growth: -2,
        color: Math.random() > 0.5 ? '#00e5ff' : '#ffffff',
        life: 0.35,
        relativeRoad: false
      });
    }
  }

  addExplosion(x, y, isBig = false) {
    const count = isBig ? 32 : 18;
    const colors = ['#f43f5e', '#f97316', '#fbbf24', '#ffffff', '#334155'];

    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * (isBig ? 160 : 110);
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 4,
        growth: -2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0.35 + Math.random() * 0.35,
        relativeRoad: false
      });
    }
  }

  addFloatingText(text, x, y, color = '#fbbf24') {
    this.floatingTexts.push({
      text: text,
      x: x,
      y: y,
      vy: -45,
      color: color,
      life: 0.85,
      maxLife: 0.85
    });
  }

  spawnStageAtmosphere(stageId, dt) {
    // Stage 1: Desert Dust
    if (stageId === 1) {
      if (Math.random() < 0.25) {
        this.particles.push({
          x: Math.random() * 480,
          y: -10,
          vx: -35 - Math.random() * 30,
          vy: 70 + Math.random() * 60,
          size: 2,
          color: 'rgba(217, 119, 6, 0.35)',
          life: 3.5,
          relativeRoad: false
        });
      }
    }
    // Stage 2: City Night Mist / Light Motes
    else if (stageId === 2) {
      if (Math.random() < 0.18) {
        this.particles.push({
          x: Math.random() * 480,
          y: -10,
          vx: (Math.random() - 0.5) * 10,
          vy: 180 + Math.random() * 70,
          size: 1.5,
          color: 'rgba(186, 230, 253, 0.3)',
          life: 2.5,
          relativeRoad: false
        });
      }
    }
    // Stage 3: Burning City floating embers
    else if (stageId === 3) {
      if (Math.random() < 0.55) {
        const isEmber = Math.random() > 0.4;
        this.particles.push({
          x: Math.random() * 480,
          y: 730,
          vx: (Math.random() - 0.5) * 35,
          vy: -60 - Math.random() * 75,
          size: isEmber ? 2 + Math.random() * 2 : 3 + Math.random() * 3,
          growth: -1,
          color: isEmber ? (Math.random() > 0.5 ? '#f97316' : '#fde047') : 'rgba(23, 23, 23, 0.45)',
          life: 2.2,
          relativeRoad: false
        });
      }
    }
    // Stage 4: Violent Sandstorm streaks
    else if (stageId === 4) {
      for (let i = 0; i < 2; i++) {
        this.particles.push({
          x: Math.random() * 480,
          y: -10,
          vx: -70 - Math.random() * 70,
          vy: 240 + Math.random() * 120,
          size: 2 + Math.random() * 2.5,
          color: Math.random() > 0.6 ? 'rgba(234, 88, 12, 0.55)' : 'rgba(180, 130, 90, 0.35)',
          life: 1.6,
          relativeRoad: false
        });
      }
    }
  }

  spawnConfetti(dt) {
    const colors = ['#f43f5e', '#fbbf24', '#00e5ff', '#10b981', '#a855f7', '#f8fafc'];
    for (let i = 0; i < 3; i++) {
      this.particles.push({
        x: Math.random() * 480,
        y: -10,
        vx: (Math.random() - 0.5) * 80,
        vy: 80 + Math.random() * 110,
        size: 3 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 4.0,
        relativeRoad: false
      });
    }
  }

  drawSkidMarks(ctx) {
    ctx.fillStyle = '#0f1117';
    for (let i = 0; i < this.skidMarks.length; i++) {
      const sm = this.skidMarks[i];
      ctx.globalAlpha = sm.alpha * (sm.life > 0.5 ? 1 : sm.life * 2);
      ctx.fillRect(Math.round(sm.x - sm.w / 2), Math.round(sm.y), sm.w, sm.h);
    }
    ctx.globalAlpha = 1.0;
  }

  draw(ctx) {
    // 1. Draw particles
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x - p.size / 2), Math.round(p.y - p.size / 2), Math.round(p.size), Math.round(p.size));
    }

    // 2. Draw floating text popups
    ctx.font = '8px "Press Start 2P", monospace';
    ctx.textAlign = 'center';
    for (let i = 0; i < this.floatingTexts.length; i++) {
      const ft = this.floatingTexts[i];
      const alpha = Math.min(1, ft.life / (ft.maxLife * 0.4));
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha * 0.85})`;
      ctx.fillText(ft.text, Math.round(ft.x) + 1, Math.round(ft.y) + 1);

      ctx.fillStyle = ft.color;
      ctx.globalAlpha = alpha;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
      ctx.globalAlpha = 1.0;
    }
  }
}

// Global particle singleton
window.particleMgr = new ParticleSystem();
