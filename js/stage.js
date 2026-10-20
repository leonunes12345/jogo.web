/**
 * Retro Overdrive - Multi-Layer Stage & Environment Architecture
 * Implements 5 distinct visual depth planes:
 * 1. Distant skyline horizon
 * 2. Roadside architecture & props (100% non-collidable, positioned outside road)
 * 3. Textured asphalt, curbs, and streetlamp illumination pools
 * 4. Interactive vehicles and obstacles
 * 5. Atmospheric weather particles
 */

class StageManager {
  constructor() {
    this.stages = [
      {
        id: 1,
        name: 'ROTA 66: DESERTO',
        subName: 'DESERTO / ROTA 66',
        targetDist: 1000,
        baseSpeed: 275,
        maxSpeed: 385,
        roadColor: '#2b2a30',
        shoulderColor: '#8a4b22', // desert sandstone
        curbColor1: '#b45309',
        curbColor2: '#d97706',
        laneLineColor: '#f1f5f9',
        skyTint: null,
        props: ['desert_cactus', 'desert_rock', 'desert_sign66', 'desert_pole', 'desert_cactus'],
        trafficTypes: ['traffic_sedan', 'traffic_compact', 'traffic_suv', 'traffic_truck'],
        obstacleTypes: ['obs_cone', 'obs_barrier', 'obs_crate', 'obs_tires'],
        propSpacing: 85,
        desc: 'Desvie pelo calor da Rota 66 e aprenda a controlar o carro.'
      },
      {
        id: 2,
        name: 'METRÓPOLE NOTURNA',
        subName: 'CIDADE NOTURNA',
        targetDist: 1400,
        baseSpeed: 315,
        maxSpeed: 440,
        roadColor: '#1a1d24',
        shoulderColor: '#1e2430', // granite city sidewalk
        curbColor1: '#334155',
        curbColor2: '#64748b',
        laneLineColor: '#e2e8f0',
        skyTint: 'rgba(10, 20, 35, 0.16)',
        props: ['city_bldg_office', 'city_bldg_brick', 'city_bldg_hotel', 'city_bldg_diner', 'city_lamp', 'city_tree'],
        trafficTypes: ['traffic_sedan', 'traffic_compact', 'traffic_suv', 'traffic_muscle', 'traffic_police', 'traffic_truck'],
        obstacleTypes: ['obs_cone', 'obs_barrier', 'obs_crate', 'obs_oil'],
        propSpacing: 78,
        desc: 'Trânsito denso, arranha-céus e asfalto com iluminação urbana.'
      },
      {
        id: 3,
        name: 'CIDADE EM CHAMAS',
        subName: 'CIDADE EM CHAMAS',
        targetDist: 1800,
        baseSpeed: 355,
        maxSpeed: 490,
        roadColor: '#171419',
        shoulderColor: '#261217', // scorched sidewalk
        curbColor1: '#7f1d1d',
        curbColor2: '#ea580c',
        laneLineColor: '#fed7aa',
        skyTint: 'rgba(185, 28, 28, 0.22)',
        props: ['city_bldg_fire', 'chaos_barrel', 'city_lamp', 'city_bldg_fire', 'city_bldg_office'],
        trafficTypes: ['traffic_compact', 'traffic_muscle', 'traffic_wreck', 'traffic_truck'],
        obstacleTypes: ['obs_barrier', 'obs_fire', 'obs_oil', 'obs_crate'],
        propSpacing: 80,
        desc: 'Caos urbano, fumaça, veículos queimados e fogo na pista!'
      },
      {
        id: 4,
        name: 'ESTRADA DO CAOS',
        subName: 'ESTRADA DO CAOS',
        targetDist: 2200,
        baseSpeed: 395,
        maxSpeed: 550,
        roadColor: '#111116',
        shoulderColor: '#2b160e', // wasteland dirt
        curbColor1: '#571c0c',
        curbColor2: '#b45309',
        laneLineColor: '#fde047',
        skyTint: 'rgba(194, 65, 12, 0.24)',
        props: ['chaos_totem', 'chaos_barrel', 'desert_cactus', 'desert_rock', 'chaos_barrel'],
        trafficTypes: ['traffic_muscle', 'traffic_wasteland', 'traffic_wreck', 'traffic_truck'],
        obstacleTypes: ['obs_fire', 'obs_oil', 'obs_barrier', 'obs_tires'],
        propSpacing: 82,
        desc: 'Tempestade de areia e sobrevivência extrema em alta velocidade!'
      }
    ];

    this.currentStageIndex = 0;
    this.stageDistance = 0;
    this.totalDistance = 0;

    // Strict Road Geometry (4 lanes of 80px)
    this.canvasWidth = 480;
    this.canvasHeight = 720;
    this.roadLeft = 80;
    this.roadRight = 400;
    this.roadWidth = 320; // exactly 4 * 80px
    this.numLanes = 4;
    this.laneWidth = 80;

    // Lane Centers: 120, 200, 280, 360
    this.laneCenters = [120, 200, 280, 360];

    // Scroll Offsets
    this.roadScrollY = 0;
    this.curbScrollY = 0;

    // Asphalt tar repair lines & stains
    this.asphaltWear = [];
    for (let i = 0; i < 16; i++) {
      this.asphaltWear.push({
        x: this.roadLeft + 16 + Math.random() * (this.roadWidth - 48),
        y: Math.random() * 720,
        w: 16 + Math.random() * 22,
        h: 3 + Math.random() * 5
      });
    }

    // Roadside Decorative Props (Strictly Non-Collidable)
    this.decorProps = [];
    this.initDecorProps();
  }

  getCurrentStage() {
    return this.stages[this.currentStageIndex];
  }

  reset() {
    this.currentStageIndex = 0;
    this.stageDistance = 0;
    this.totalDistance = 0;
    this.roadScrollY = 0;
    this.curbScrollY = 0;
    this.decorProps = [];
    this.initDecorProps();
  }

  initDecorProps() {
    for (let y = -80; y < 800; y += 75) {
      this.spawnDecorProp(y, 'left');
      this.spawnDecorProp(y, 'right');
    }
  }

  // Spawn Decorative Prop (Guaranteed to be 100% outside the road)
  spawnDecorProp(y = -85, side = null) {
    const stage = this.getCurrentStage();
    const chooseSide = side || (Math.random() > 0.5 ? 'left' : 'right');
    const spriteKey = stage.props[Math.floor(Math.random() * stage.props.length)];

    // Left props center at x=36 (bounds 7 to 65, safely outside roadLeft 80)
    // Right props center at x=444 (bounds 415 to 473, safely outside roadRight 400)
    const x = chooseSide === 'left' ? 36 : 444;

    this.decorProps.push({
      spriteKey: spriteKey,
      x: x,
      y: y,
      side: chooseSide,
      isDecorative: true, // EXPLICIT DECORATIVE FLAG
      collidable: false   // EXPLICIT NON-COLLIDABLE GUARANTEE
    });
  }

  update(dt, speed) {
    const stage = this.getCurrentStage();
    const distDelta = (speed * dt) * 0.15;
    this.stageDistance += distDelta;
    this.totalDistance += distDelta;

    // Scrolling loops
    this.roadScrollY = (this.roadScrollY + speed * dt) % 64;
    this.curbScrollY = (this.curbScrollY + speed * dt) % 32;

    // Scroll asphalt wear marks
    for (let i = 0; i < this.asphaltWear.length; i++) {
      const p = this.asphaltWear[i];
      p.y += speed * dt;
      if (p.y > 740) {
        p.y = -25;
        p.x = this.roadLeft + 16 + Math.random() * (this.roadWidth - 48);
      }
    }

    // Scroll decorative props
    for (let i = this.decorProps.length - 1; i >= 0; i--) {
      const prop = this.decorProps[i];
      prop.y += speed * dt;
      if (prop.y > 800) {
        this.decorProps.splice(i, 1);
      }
    }

    // Spawn new decorative props at regular intervals
    if (Math.random() < 0.058) {
      if (Math.random() > 0.5) this.spawnDecorProp(-85, 'left');
      else this.spawnDecorProp(-85, 'right');
    }
  }

  isStageComplete() {
    return this.stageDistance >= this.getCurrentStage().targetDist;
  }

  isGameComplete() {
    return this.currentStageIndex >= this.stages.length - 1 && this.isStageComplete();
  }

  nextStage() {
    if (this.currentStageIndex < this.stages.length - 1) {
      this.currentStageIndex++;
      this.stageDistance = 0;
      return this.getCurrentStage();
    }
    return null;
  }

  getProgressRatio() {
    return Math.min(1.0, this.stageDistance / this.getCurrentStage().targetDist);
  }

  // ==========================================================
  // MULTI-LAYER RENDERING
  // ==========================================================

  // LAYER 1: Distant Skyline / Horizon Background
  drawDistantSkyline(ctx) {
    const stage = this.getCurrentStage();

    if (stage.id === 1) { // Desert Mesa & Horizon Mountains
      ctx.fillStyle = '#682a0e';
      ctx.beginPath();
      ctx.moveTo(0, 45);
      ctx.lineTo(80, 28);
      ctx.lineTo(160, 40);
      ctx.lineTo(260, 22);
      ctx.lineTo(360, 36);
      ctx.lineTo(480, 26);
      ctx.lineTo(480, 55);
      ctx.lineTo(0, 55);
      ctx.closePath();
      ctx.fill();
    } else if (stage.id === 2) { // City Night Skyline Silhouette
      ctx.fillStyle = '#0b0f19';
      // Distant building silhouettes
      const towers = [
        { x: 0, w: 45, h: 55 },
        { x: 45, w: 35, h: 42 },
        { x: 80, w: 50, h: 62 },
        { x: 130, w: 40, h: 38 },
        { x: 170, w: 60, h: 58 },
        { x: 230, w: 45, h: 48 },
        { x: 275, w: 55, h: 65 },
        { x: 330, w: 40, h: 44 },
        { x: 370, w: 50, h: 54 },
        { x: 420, w: 60, h: 40 }
      ];
      towers.forEach(t => {
        ctx.fillRect(t.x, 60 - t.h, t.w, t.h);
        // Distant illuminated window dots
        ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
        for (let wy = 60 - t.h + 8; wy < 58; wy += 8) {
          for (let wx = t.x + 6; wx < t.x + t.w - 6; wx += 8) {
            ctx.fillRect(wx, wy, 2, 2);
          }
        }
        ctx.fillStyle = '#0b0f19';
      });
    } else if (stage.id === 3) { // Burning Skyline with Fire Glow
      ctx.fillStyle = '#1a080c';
      ctx.fillRect(0, 0, 480, 60);
      ctx.fillStyle = 'rgba(234, 88, 12, 0.3)';
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(120, 25);
      ctx.lineTo(240, 45);
      ctx.lineTo(360, 20);
      ctx.lineTo(480, 50);
      ctx.lineTo(480, 60);
      ctx.closePath();
      ctx.fill();
    } else if (stage.id === 4) { // Wasteland Ruined Skyline
      ctx.fillStyle = '#1c0c05';
      ctx.beginPath();
      ctx.moveTo(0, 60);
      ctx.lineTo(100, 32);
      ctx.lineTo(220, 48);
      ctx.lineTo(340, 28);
      ctx.lineTo(480, 55);
      ctx.lineTo(480, 60);
      ctx.closePath();
      ctx.fill();
    }
  }

  // LAYER 2: Roadside Sidewalks & Decorative Architecture (Outside Road)
  drawRoadsideArchitecture(ctx) {
    const stage = this.getCurrentStage();

    // 1. Shoulders background
    ctx.fillStyle = stage.shoulderColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Decorative ground textures (sidewalk slabs / sand ripples)
    if (stage.id === 1) { // Desert Sand ripples
      ctx.fillStyle = 'rgba(180, 83, 9, 0.25)';
      for (let y = (this.roadScrollY * 0.4) % 48; y < this.canvasHeight; y += 40) {
        ctx.fillRect(0, y, this.roadLeft - 8, 2);
        ctx.fillRect(this.roadRight + 8, y + 16, this.canvasWidth - this.roadRight, 2);
      }
    } else if (stage.id === 2) { // City sidewalk paver grid
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      for (let y = (this.roadScrollY) % 24; y < this.canvasHeight; y += 24) {
        ctx.fillRect(0, y, this.roadLeft - 6, 2);
        ctx.fillRect(this.roadRight + 6, y, this.canvasWidth - this.roadRight, 2);
      }
    } else if (stage.id === 3) { // Charred pavement cracks
      ctx.fillStyle = 'rgba(234, 88, 12, 0.2)';
      for (let y = (this.roadScrollY * 0.8) % 64; y < this.canvasHeight; y += 64) {
        ctx.fillRect(4, y, 40, 3);
        ctx.fillRect(this.roadRight + 10, y + 28, 44, 3);
      }
    } else if (stage.id === 4) { // Wasteland earth cracks
      ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
      for (let y = (this.roadScrollY * 1.1) % 72; y < this.canvasHeight; y += 72) {
        ctx.fillRect(6, y, 38, 4);
        ctx.fillRect(this.roadRight + 14, y + 36, 36, 4);
      }
    }

    // 2. Draw Decorative Props (Buildings, Trees, Lamps) - strictly outside the road!
    for (let i = 0; i < this.decorProps.length; i++) {
      const p = this.decorProps[i];
      if (p.y > -95 && p.y < this.canvasHeight + 95) {
        window.spriteMgr.draw(ctx, p.spriteKey, p.x, p.y);
      }
    }

    // 3. Overhead utility wires
    this.drawUtilityWires(ctx);
  }

  // Overhead telegraph / utility wires
  drawUtilityWires(ctx) {
    ctx.strokeStyle = 'rgba(30, 35, 45, 0.45)';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(36, 0);
    ctx.lineTo(36, this.canvasHeight);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(this.canvasWidth - 36, 0);
    ctx.lineTo(this.canvasWidth - 36, this.canvasHeight);
    ctx.stroke();
  }

  // LAYER 3: Textured Asphalt Road Surface, Curbs, and Dividers
  drawRoad(ctx) {
    const stage = this.getCurrentStage();

    // 1. Concrete Curbs & Rumble Strips
    const curbW = 8;
    const curbH = 16;
    for (let y = -32 + this.curbScrollY; y < this.canvasHeight + 32; y += curbH) {
      const isAlt = Math.floor(y / curbH) % 2 === 0;
      ctx.fillStyle = isAlt ? stage.curbColor1 : stage.curbColor2;
      ctx.fillRect(this.roadLeft - curbW, Math.round(y), curbW, curbH);
      ctx.fillRect(this.roadRight, Math.round(y), curbW, curbH);
    }

    // 2. Main Asphalt Road Bed (80px to 400px = exactly 320px)
    ctx.fillStyle = stage.roadColor;
    ctx.fillRect(this.roadLeft, 0, this.roadWidth, this.canvasHeight);

    // Subtle tar repair patches
    ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
    for (let i = 0; i < this.asphaltWear.length; i++) {
      const ap = this.asphaltWear[i];
      ctx.fillRect(Math.round(ap.x), Math.round(ap.y), Math.round(ap.w), Math.round(ap.h));
    }

    // Tire groove wheel tracks down each lane
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    for (let laneIdx = 0; laneIdx < this.numLanes; laneIdx++) {
      const cx = this.laneCenters[laneIdx];
      ctx.fillRect(Math.round(cx - 16), 0, 8, this.canvasHeight);
      ctx.fillRect(Math.round(cx + 8), 0, 8, this.canvasHeight);
    }

    // Streetlamp Light Pools on Asphalt
    for (let i = 0; i < this.decorProps.length; i++) {
      const p = this.decorProps[i];
      if (p.spriteKey === 'city_lamp' && p.y > -80 && p.y < this.canvasHeight + 80) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.06)';
        ctx.beginPath();
        const poolX = p.side === 'left' ? this.roadLeft + 36 : this.roadRight - 36;
        ctx.ellipse(poolX, p.y + 15, 36, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. White Lane Divider Lines (Exactly 4 lanes -> 3 dividing lines)
    const dashLength = 28;
    const dashGap = 36;
    const cycle = dashLength + dashGap; // 64px

    ctx.fillStyle = stage.laneLineColor;
    for (let laneIdx = 1; laneIdx < this.numLanes; laneIdx++) {
      const lineX = this.roadLeft + laneIdx * this.laneWidth;
      for (let y = -64 + this.roadScrollY; y < this.canvasHeight + 64; y += cycle) {
        ctx.fillRect(Math.round(lineX - 2), Math.round(y), 4, dashLength);
      }
    }

    // 4. Solid White Outer Road Boundaries
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.roadLeft + 1, 0, 3, this.canvasHeight);
    ctx.fillRect(this.roadRight - 4, 0, 3, this.canvasHeight);
  }

  // LAYER 5: Atmospheric Sky/Lighting Tint
  drawAtmosphere(ctx) {
    const stage = this.getCurrentStage();
    if (stage.skyTint) {
      ctx.fillStyle = stage.skyTint;
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
    }
  }
}

// Global stage singleton
window.stageMgr = new StageManager();
