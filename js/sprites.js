/**
 * Retro Overdrive - High-Fidelity Pixel Art Sprite Engine v3.0
 * Meticulously detailed pixel art for vehicles, varied urban architecture, and road hazards.
 */

class SpriteManager {
  constructor() {
    this.sprites = {};
    this.initSprites();
  }

  // Create an offscreen canvas for crisp pixel blitting
  createCanvas(width, height) {
    const c = document.createElement('canvas');
    c.width = width;
    c.height = height;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  // Pixel draw helper
  px(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
  }

  initSprites() {
    this.generatePlayerSprites();
    this.generateTrafficVehicles();
    this.generateObstacleSprites();
    this.generateCityArchitecture();
    this.generateDesertScenery();
    this.generateChaosScenery();
    this.generatePickupSprites();
  }

  // ==========================================================
  // 1. PLAYER CAR (Detailed Crimson Supercar)
  // ==========================================================
  generatePlayerSprites() {
    // Base Player Car
    {
      const { canvas, ctx } = this.createCanvas(34, 58);

      // 4 Wheels with tire treads and alloy rims
      const wRubber = '#121318';
      const wRim = '#94a3b8';
      // Front
      this.px(ctx, 3, 10, 4, 10, wRubber);
      this.px(ctx, 4, 12, 2, 6, wRim);
      this.px(ctx, 27, 10, 4, 10, wRubber);
      this.px(ctx, 28, 12, 2, 6, wRim);
      // Rear
      this.px(ctx, 3, 38, 4, 11, wRubber);
      this.px(ctx, 4, 40, 2, 7, wRim);
      this.px(ctx, 27, 38, 4, 11, wRubber);
      this.px(ctx, 28, 40, 2, 7, wRim);

      // Chassis Body: Crimson Supercar with shaded volumes
      const redBase = '#b91c1c';
      const redLight = '#dc2626';
      const redHigh = '#f87171';
      const redDark = '#7f1d1d';
      const redShade = '#450a0a';
      const darkTrim = '#0f172a';

      // Rear Bumper, Diffuser & Exhausts
      this.px(ctx, 8, 48, 18, 5, darkTrim);
      this.px(ctx, 10, 52, 3, 2, '#64748b'); // exhaust L
      this.px(ctx, 21, 52, 3, 2, '#64748b'); // exhaust R

      // Rear Spoiler
      this.px(ctx, 5, 46, 24, 3, darkTrim);
      this.px(ctx, 7, 44, 2, 3, darkTrim);
      this.px(ctx, 25, 44, 2, 3, darkTrim);

      // Taillight Bar
      this.px(ctx, 7, 49, 5, 2, '#ff1e38');
      this.px(ctx, 22, 49, 5, 2, '#ff1e38');
      this.px(ctx, 12, 49, 10, 1, '#991b1b');

      // Main Body Volume
      this.px(ctx, 7, 18, 20, 28, redBase);
      this.px(ctx, 7, 18, 2, 28, redLight);  // left specular highlight
      this.px(ctx, 25, 18, 2, 28, redDark);  // right shadow flank

      // Hood & Front Bumper
      this.px(ctx, 8, 7, 18, 12, redBase);
      this.px(ctx, 9, 4, 16, 4, redLight);
      this.px(ctx, 11, 3, 12, 2, redHigh);
      this.px(ctx, 8, 3, 18, 2, darkTrim); // splitter

      // Xenon Headlights
      this.px(ctx, 8, 4, 4, 3, '#fef08a');
      this.px(ctx, 9, 5, 2, 1, '#ffffff');
      this.px(ctx, 22, 4, 4, 3, '#fef08a');
      this.px(ctx, 23, 5, 2, 1, '#ffffff');

      // Cockpit / Glass Canopy
      this.px(ctx, 10, 15, 14, 18, '#090d16');
      this.px(ctx, 11, 15, 12, 6, '#1e293b');
      this.px(ctx, 12, 15, 3, 5, '#64748b'); // glass glare
      this.px(ctx, 11, 27, 12, 5, '#1e293b'); // rear window
      this.px(ctx, 10, 21, 14, 6, redDark);   // painted roof panel
      this.px(ctx, 12, 21, 10, 6, redBase);

      // Subtle Racing Stripes
      this.px(ctx, 15, 6, 2, 42, '#1e293b');
      this.px(ctx, 18, 6, 2, 42, '#1e293b');

      // Side Mirrors
      this.px(ctx, 5, 19, 2, 3, redDark);
      this.px(ctx, 27, 19, 2, 3, redDark);

      this.sprites['player_car'] = canvas;
    }

    // Player with Nitro Active (Animated Cyan Jet Exhausts)
    {
      const { canvas, ctx } = this.createCanvas(34, 74);
      ctx.drawImage(this.sprites['player_car'], 0, 0);

      const drawJet = (x, y) => {
        this.px(ctx, x - 2, y, 6, 4, '#0284c7');
        this.px(ctx, x - 1, y + 3, 4, 7, '#00e5ff');
        this.px(ctx, x, y + 9, 2, 8, '#ffffff');
      };
      drawJet(11, 52);
      drawJet(22, 52);

      this.sprites['player_nitro'] = canvas;
    }
  }

  // ==========================================================
  // 2. TRAFFIC VEHICLES (Distinct Silhouettes & Detailing)
  // ==========================================================
  generateTrafficVehicles() {
    // 1. Compact City Hatchback
    {
      const { canvas, ctx } = this.createCanvas(30, 48);
      // Wheels
      this.px(ctx, 2, 8, 4, 8, '#18181b');
      this.px(ctx, 24, 8, 4, 8, '#18181b');
      this.px(ctx, 2, 32, 4, 8, '#18181b');
      this.px(ctx, 24, 32, 4, 8, '#18181b');

      // Body - Slate Teal / Ocean Blue
      const bMid = '#0284c7';
      const bLight = '#38bdf8';
      const bDark = '#0369a1';
      this.px(ctx, 5, 5, 20, 38, bMid);
      this.px(ctx, 6, 6, 2, 36, bLight);
      this.px(ctx, 22, 6, 2, 36, bDark);
      this.px(ctx, 7, 3, 16, 3, bLight);
      this.px(ctx, 7, 42, 16, 3, '#1e293b');

      // Glass
      this.px(ctx, 8, 12, 14, 6, '#0f172a');
      this.px(ctx, 9, 12, 3, 5, '#7dd3fc');
      this.px(ctx, 8, 31, 14, 6, '#0f172a');
      this.px(ctx, 7, 18, 2, 13, '#0f172a');
      this.px(ctx, 21, 18, 2, 13, '#0f172a');
      this.px(ctx, 8, 18, 14, 13, bMid);

      // Lights
      this.px(ctx, 6, 3, 3, 2, '#fef08a');
      this.px(ctx, 21, 3, 3, 2, '#fef08a');
      this.px(ctx, 6, 43, 3, 2, '#ef4444');
      this.px(ctx, 21, 43, 3, 2, '#ef4444');

      this.sprites['traffic_compact'] = canvas;
      this.sprites['traffic_blue'] = canvas;
    }

    // 2. Classic Taxi / Sedan
    {
      const { canvas, ctx } = this.createCanvas(32, 54);
      this.px(ctx, 2, 9, 4, 9, '#18181b');
      this.px(ctx, 26, 9, 4, 9, '#18181b');
      this.px(ctx, 2, 37, 4, 9, '#18181b');
      this.px(ctx, 26, 37, 4, 9, '#18181b');

      // Body - Ochre Yellow / Amber Taxi
      const yMid = '#d97706';
      const yLight = '#fbbf24';
      const yDark = '#92400e';
      this.px(ctx, 5, 5, 22, 44, yMid);
      this.px(ctx, 6, 6, 2, 42, yLight);
      this.px(ctx, 24, 6, 2, 42, yDark);

      // Windows
      this.px(ctx, 8, 14, 16, 7, '#0f172a');
      this.px(ctx, 9, 14, 3, 6, '#94a3b8');
      this.px(ctx, 8, 35, 16, 6, '#0f172a');
      this.px(ctx, 6, 21, 2, 14, '#0f172a');
      this.px(ctx, 24, 21, 2, 14, '#0f172a');
      this.px(ctx, 8, 21, 16, 14, yMid);

      // Taxi roof light
      this.px(ctx, 11, 25, 10, 5, '#ffffff');
      this.px(ctx, 12, 26, 8, 3, '#0f172a');
      this.px(ctx, 13, 27, 6, 1, '#fbbf24');

      // Lights
      this.px(ctx, 6, 3, 3, 2, '#fef08a');
      this.px(ctx, 23, 3, 3, 2, '#fef08a');
      this.px(ctx, 6, 48, 3, 2, '#dc2626');
      this.px(ctx, 23, 48, 3, 2, '#dc2626');

      this.sprites['traffic_sedan'] = canvas;
      this.sprites['traffic_taxi'] = canvas;
    }

    // 3. Executive SUV (Wider, bulkier, roof rails)
    {
      const { canvas, ctx } = this.createCanvas(34, 56);
      this.px(ctx, 2, 8, 5, 10, '#09090b');
      this.px(ctx, 27, 8, 5, 10, '#09090b');
      this.px(ctx, 2, 38, 5, 10, '#09090b');
      this.px(ctx, 27, 38, 5, 10, '#09090b');

      // Body - Midnight Metallic Graphite
      const sMid = '#334155';
      const sLight = '#475569';
      const sDark = '#1e293b';
      this.px(ctx, 5, 4, 24, 48, sMid);
      this.px(ctx, 6, 5, 2, 46, sLight);
      this.px(ctx, 26, 5, 2, 46, sDark);

      // Glass & Roof
      this.px(ctx, 8, 13, 18, 8, '#0f172a');
      this.px(ctx, 9, 13, 4, 7, '#64748b');
      this.px(ctx, 8, 39, 18, 6, '#0f172a');
      this.px(ctx, 8, 21, 18, 18, sMid);

      // Roof Rails
      this.px(ctx, 9, 18, 2, 20, '#94a3b8');
      this.px(ctx, 23, 18, 2, 20, '#94a3b8');

      // Lights
      this.px(ctx, 6, 3, 4, 2, '#f8fafc');
      this.px(ctx, 24, 3, 4, 2, '#f8fafc');
      this.px(ctx, 6, 50, 4, 2, '#ef4444');
      this.px(ctx, 24, 50, 4, 2, '#ef4444');

      this.sprites['traffic_suv'] = canvas;
    }

    // 4. Muscle Car (Aggressive hood scoop & wide rear rubber)
    {
      const { canvas, ctx } = this.createCanvas(34, 56);
      this.px(ctx, 2, 9, 4, 10, '#0f172a');
      this.px(ctx, 28, 9, 4, 10, '#0f172a');
      this.px(ctx, 1, 37, 5, 11, '#0f172a');
      this.px(ctx, 28, 37, 5, 11, '#0f172a');

      // British Racing Green
      const gMid = '#15803d';
      const gLight = '#22c55e';
      const gDark = '#166534';
      this.px(ctx, 5, 4, 24, 48, gMid);
      this.px(ctx, 6, 5, 2, 46, gLight);
      this.px(ctx, 26, 5, 2, 46, gDark);

      // Matte Black Hood Scoop
      this.px(ctx, 11, 7, 12, 10, '#0f172a');
      this.px(ctx, 13, 8, 8, 3, '#334155');

      // Windows
      this.px(ctx, 8, 18, 18, 7, '#052e16');
      this.px(ctx, 9, 18, 3, 6, '#4ade80');
      this.px(ctx, 8, 37, 18, 6, '#052e16');
      this.px(ctx, 8, 25, 18, 12, gMid);

      this.px(ctx, 6, 3, 3, 2, '#ffffff');
      this.px(ctx, 25, 3, 3, 2, '#ffffff');
      this.px(ctx, 6, 51, 3, 2, '#ef4444');
      this.px(ctx, 25, 51, 3, 2, '#ef4444');

      this.sprites['traffic_muscle'] = canvas;
    }

    // 5. Police Cruiser (Interceptor with pushbar & active lightbar)
    {
      const { canvas, ctx } = this.createCanvas(34, 56);
      this.px(ctx, 2, 9, 4, 9, '#09090b');
      this.px(ctx, 28, 9, 4, 9, '#09090b');
      this.px(ctx, 2, 38, 4, 9, '#09090b');
      this.px(ctx, 28, 38, 4, 9, '#09090b');

      // Black & White squad body
      this.px(ctx, 5, 4, 24, 48, '#0f172a');
      this.px(ctx, 5, 18, 24, 18, '#f1f5f9');
      this.px(ctx, 6, 19, 2, 16, '#ffffff');

      // Windows
      this.px(ctx, 8, 13, 18, 7, '#1e293b');
      this.px(ctx, 9, 13, 3, 6, '#94a3b8');
      this.px(ctx, 8, 36, 18, 6, '#1e293b');

      // Lightbar (Red, White, Blue)
      this.px(ctx, 9, 24, 6, 4, '#ef4444');
      this.px(ctx, 15, 24, 4, 4, '#ffffff');
      this.px(ctx, 19, 24, 6, 4, '#3b82f6');

      // Bull-bar bumper front
      this.px(ctx, 8, 2, 18, 3, '#475569');

      this.sprites['traffic_police'] = canvas;
    }

    // 6. 18-Wheeler Heavy Rig & Tanker Trailer
    {
      const { canvas, ctx } = this.createCanvas(42, 112);
      [14, 28, 78, 92].forEach(y => {
        this.px(ctx, 2, y, 5, 10, '#09090b');
        this.px(ctx, 35, y, 5, 10, '#09090b');
      });

      // Cab front
      this.px(ctx, 6, 4, 30, 32, '#c2410c');
      this.px(ctx, 7, 5, 2, 30, '#ea580c');
      this.px(ctx, 33, 5, 2, 30, '#7c2d12');

      // Chrome grill
      this.px(ctx, 9, 3, 24, 4, '#cbd5e1');
      for (let x = 11; x < 31; x += 3) {
        this.px(ctx, x, 4, 1, 3, '#334155');
      }

      // Windshield & Sun visor
      this.px(ctx, 8, 13, 26, 8, '#0f172a');
      this.px(ctx, 10, 13, 6, 7, '#38bdf8');
      this.px(ctx, 7, 11, 28, 3, '#334155');

      // Dual Chrome Chimneys
      this.px(ctx, 5, 28, 3, 9, '#94a3b8');
      this.px(ctx, 34, 28, 3, 9, '#94a3b8');

      // Hitch
      this.px(ctx, 18, 36, 6, 6, '#1e293b');

      // Massive Tanker / Cargo Trailer
      this.px(ctx, 6, 42, 30, 64, '#e2e8f0');
      this.px(ctx, 7, 43, 2, 62, '#ffffff');
      this.px(ctx, 33, 43, 2, 62, '#94a3b8');

      // Warning chevron hazard stripes on rear
      for (let y = 98; y < 106; y += 4) {
        this.px(ctx, 8, y, 12, 2, '#f59e0b');
        this.px(ctx, 22, y, 12, 2, '#f59e0b');
        this.px(ctx, 8, y + 2, 12, 2, '#0f172a');
        this.px(ctx, 22, y + 2, 12, 2, '#0f172a');
      }

      this.sprites['traffic_truck'] = canvas;
    }

    // 7. Armored Wasteland Buggy (Spiked wheels, rollcage)
    {
      const { canvas, ctx } = this.createCanvas(36, 56);
      this.px(ctx, 2, 8, 5, 11, '#18181b');
      this.px(ctx, 29, 8, 5, 11, '#18181b');
      this.px(ctx, 2, 37, 5, 12, '#18181b');
      this.px(ctx, 29, 37, 5, 12, '#18181b');
      this.px(ctx, 0, 12, 2, 3, '#a1a1aa');
      this.px(ctx, 34, 12, 2, 3, '#a1a1aa');

      // Rusted metal body
      this.px(ctx, 6, 6, 24, 44, '#78350f');
      this.px(ctx, 26, 6, 3, 44, '#451a03');

      // Rollcage bars
      this.px(ctx, 8, 14, 20, 20, '#1c1917');
      this.px(ctx, 9, 15, 2, 18, '#78716c');
      this.px(ctx, 25, 15, 2, 18, '#78716c');
      this.px(ctx, 9, 23, 18, 2, '#78716c');

      // Skull ramming prow
      this.px(ctx, 13, 3, 10, 6, '#d6d3d1');
      this.px(ctx, 15, 4, 2, 2, '#1c1917');
      this.px(ctx, 19, 4, 2, 2, '#1c1917');

      this.sprites['traffic_wasteland'] = canvas;
    }

    // 8. Charred Car Wreck
    {
      const { canvas, ctx } = this.createCanvas(34, 52);
      this.px(ctx, 3, 9, 4, 8, '#09090b');
      this.px(ctx, 27, 9, 4, 8, '#09090b');
      this.px(ctx, 3, 36, 4, 8, '#09090b');
      this.px(ctx, 27, 36, 4, 8, '#09090b');

      this.px(ctx, 6, 6, 22, 42, '#18181b');
      this.px(ctx, 7, 7, 20, 40, '#27272a');
      this.px(ctx, 10, 12, 6, 8, '#451a03');
      this.px(ctx, 18, 28, 8, 12, '#291102');

      // Blown windshield
      this.px(ctx, 9, 14, 16, 7, '#09090b');
      this.px(ctx, 10, 14, 2, 3, '#71717a');
      this.px(ctx, 23, 17, 2, 4, '#71717a');

      // Glowing embers
      this.px(ctx, 13, 16, 3, 3, '#f97316');
      this.px(ctx, 18, 17, 2, 2, '#fbbf24');
      this.px(ctx, 14, 26, 4, 4, '#ef4444');

      this.sprites['traffic_wreck'] = canvas;
    }
  }

  // ==========================================================
  // 3. ROAD OBSTACLES (Cones, Barriers, Crates, Tires, Oil, Fire)
  // ==========================================================
  generateObstacleSprites() {
    // 1. Traffic Cone
    {
      const { canvas, ctx } = this.createCanvas(22, 22);
      this.px(ctx, 3, 16, 16, 4, '#0f172a');
      this.px(ctx, 4, 17, 14, 2, '#ea580c');
      this.px(ctx, 5, 12, 12, 4, '#ea580c');
      this.px(ctx, 6, 8, 10, 4, '#f8fafc'); // reflective white band
      this.px(ctx, 7, 5, 8, 3, '#ea580c');
      this.px(ctx, 8, 2, 6, 3, '#f97316');
      this.px(ctx, 9, 0, 4, 2, '#fdba74');
      this.sprites['obs_cone'] = canvas;
    }

    // 2. Concrete Road Barrier (Striped hazard)
    {
      const { canvas, ctx } = this.createCanvas(46, 22);
      this.px(ctx, 2, 3, 42, 16, '#cbd5e1');
      this.px(ctx, 2, 16, 42, 3, '#64748b');
      this.px(ctx, 2, 3, 42, 2, '#f8fafc');

      ctx.fillStyle = '#dc2626';
      for (let x = 6; x < 40; x += 10) {
        ctx.beginPath();
        ctx.moveTo(x, 16);
        ctx.lineTo(x + 5, 16);
        ctx.lineTo(x + 9, 5);
        ctx.lineTo(x + 4, 5);
        ctx.closePath();
        ctx.fill();
      }
      this.sprites['obs_barrier'] = canvas;
    }

    // 3. Wooden Cargo Crate
    {
      const { canvas, ctx } = this.createCanvas(26, 26);
      this.px(ctx, 2, 2, 22, 22, '#92400e');
      this.px(ctx, 3, 3, 20, 20, '#b45309');
      this.px(ctx, 2, 2, 22, 3, '#78350f');
      this.px(ctx, 2, 21, 22, 3, '#78350f');
      this.px(ctx, 2, 2, 3, 22, '#78350f');
      this.px(ctx, 21, 2, 3, 22, '#78350f');
      for (let i = 4; i < 20; i++) {
        this.px(ctx, i, i, 2, 2, '#78350f');
        this.px(ctx, 23 - i, i, 2, 2, '#78350f');
      }
      this.sprites['obs_crate'] = canvas;
    }

    // 4. Tire Stack
    {
      const { canvas, ctx } = this.createCanvas(28, 24);
      const drawTire = (x, y) => {
        this.px(ctx, x, y, 13, 10, '#18181b');
        this.px(ctx, x + 1, y + 1, 11, 8, '#27272a');
        this.px(ctx, x + 3, y + 2, 7, 6, '#09090b');
      };
      drawTire(1, 10);
      drawTire(14, 10);
      drawTire(7, 2);
      this.sprites['obs_tires'] = canvas;
    }

    // 5. Oil Slick Hazard
    {
      const { canvas, ctx } = this.createCanvas(42, 26);
      ctx.fillStyle = '#090d16';
      ctx.beginPath();
      ctx.ellipse(21, 13, 19, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#111827';
      ctx.beginPath();
      ctx.ellipse(19, 12, 13, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      this.px(ctx, 13, 10, 7, 2, '#7c3aed');
      this.px(ctx, 19, 12, 8, 2, '#06b6d4');
      this.px(ctx, 23, 14, 6, 2, '#ec4899');
      this.px(ctx, 15, 14, 5, 2, '#f43f5e');
      this.sprites['obs_oil'] = canvas;
    }

    // 6. Fire Hazard
    {
      const { canvas, ctx } = this.createCanvas(32, 32);
      ctx.fillStyle = '#171717';
      ctx.beginPath();
      ctx.ellipse(16, 24, 13, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      this.px(ctx, 8, 16, 16, 10, '#b91c1c');
      this.px(ctx, 10, 12, 12, 10, '#ea580c');
      this.px(ctx, 12, 6, 8, 12, '#f59e0b');
      this.px(ctx, 14, 2, 4, 8, '#fef08a');
      this.sprites['obs_fire'] = canvas;
    }
  }

  // ==========================================================
  // 4. DETAILED CITY ARCHITECTURE (Varied Styles, Storefronts, Balconies)
  // Max width 62px so it fits completely within 72px sidewalk space!
  // ==========================================================
  generateCityArchitecture() {
    // Style 1: Modern High-Rise Office Tower
    {
      const { canvas, ctx } = this.createCanvas(58, 96);
      // Dark slate glass facade
      this.px(ctx, 2, 0, 54, 96, '#111827');
      this.px(ctx, 2, 0, 2, 96, '#1f2937');
      this.px(ctx, 54, 0, 2, 96, '#030712');

      // Grid of office windows with varied interior warmth
      for (let y = 6; y < 88; y += 12) {
        for (let x = 6; x < 50; x += 11) {
          const isWarm = (x + y) % 3 === 0;
          const isDark = (x * y) % 5 === 0;
          this.px(ctx, x, y, 8, 7, isDark ? '#0f172a' : (isWarm ? '#fef08a' : '#bae6fd'));
        }
      }
      // Rooftop Communications Tower & Red Beacon
      this.px(ctx, 27, 0, 4, 6, '#475569');
      this.px(ctx, 28, 0, 2, 2, '#ef4444');
      this.sprites['city_bldg_office'] = canvas;
    }

    // Style 2: Classic 4-Story Brick Apartment with Fire Escapes
    {
      const { canvas, ctx } = this.createCanvas(58, 92);
      // Terracotta brick facade
      this.px(ctx, 2, 4, 54, 88, '#7c2d12');
      this.px(ctx, 2, 4, 54, 3, '#9a3412'); // roof cornice
      this.px(ctx, 2, 4, 2, 88, '#9a3412');
      this.px(ctx, 54, 4, 2, 88, '#431407');

      // Windows with concrete stone lintels
      for (let y = 14; y < 80; y += 16) {
        for (let x = 6; x < 50; x += 15) {
          this.px(ctx, x, y - 2, 10, 2, '#e2e8f0'); // stone lintel
          this.px(ctx, x, y, 10, 10, '#090d16');
          this.px(ctx, x + 1, y + 1, 8, 8, '#fed7aa'); // warm curtain
          this.px(ctx, x + 4, y, 2, 10, '#090d16');   // frame
        }
        // Iron Fire Escape Balcony
        this.px(ctx, 20, y + 8, 18, 2, '#18181b');
        this.px(ctx, 20, y + 5, 2, 4, '#18181b');
        this.px(ctx, 36, y + 5, 2, 4, '#18181b');
      }
      this.sprites['city_bldg_brick'] = canvas;
    }

    // Style 3: Luxury Hotel with Glowing Vertical Neon Sign
    {
      const { canvas, ctx } = this.createCanvas(58, 96);
      this.px(ctx, 2, 0, 54, 96, '#1e293b');
      this.px(ctx, 2, 0, 2, 96, '#334155');
      this.px(ctx, 54, 0, 2, 96, '#0f172a');

      // Windows
      for (let y = 8; y < 84; y += 13) {
        for (let x = 18; x < 52; x += 11) {
          const lit = (x + y) % 2 === 0;
          this.px(ctx, x, y, 7, 7, lit ? '#fed7aa' : '#0f172a');
        }
      }
      // Vertical Neon Sign ("HOTEL")
      this.px(ctx, 5, 12, 9, 60, '#0f172a');
      this.px(ctx, 6, 13, 7, 58, '#0369a1');
      this.px(ctx, 7, 16, 5, 6, '#38bdf8'); // H
      this.px(ctx, 7, 26, 5, 6, '#38bdf8'); // O
      this.px(ctx, 7, 36, 5, 6, '#38bdf8'); // T
      this.px(ctx, 7, 46, 5, 6, '#38bdf8'); // E
      this.px(ctx, 7, 56, 5, 6, '#38bdf8'); // L
      this.sprites['city_bldg_hotel'] = canvas;
    }

    // Style 4: Retro 2-Story Diner & Garage with Striped Awning
    {
      const { canvas, ctx } = this.createCanvas(58, 72);
      this.px(ctx, 2, 4, 54, 68, '#334155');
      this.px(ctx, 2, 4, 54, 3, '#475569');

      // Upper floor windows
      for (let x = 8; x < 50; x += 14) {
        this.px(ctx, x, 12, 10, 10, '#fef08a');
      }

      // Ground floor Diner Panoramic Display Glass
      this.px(ctx, 6, 36, 46, 32, '#0f172a');
      this.px(ctx, 8, 38, 42, 28, '#0284c7');
      this.px(ctx, 10, 40, 38, 24, '#1e293b');

      // Red & White Striped Canopy Awning
      for (let x = 4; x < 54; x += 8) {
        this.px(ctx, x, 28, 4, 8, '#dc2626');
        this.px(ctx, x + 4, 28, 4, 8, '#f8fafc');
      }

      // Neon sign
      this.px(ctx, 14, 6, 30, 5, '#10b981');
      this.sprites['city_bldg_diner'] = canvas;
    }

    // Streetlamp with warm light pool
    {
      const { canvas, ctx } = this.createCanvas(26, 60);
      this.px(ctx, 11, 10, 4, 50, '#334155');
      this.px(ctx, 12, 10, 2, 50, '#64748b');
      this.px(ctx, 6, 6, 12, 4, '#334155');
      this.px(ctx, 4, 8, 4, 6, '#334155');
      this.px(ctx, 3, 12, 6, 5, '#fef08a');
      this.px(ctx, 2, 11, 8, 2, '#1e293b');
      this.sprites['city_lamp'] = canvas;
    }

    // Sidewalk Planter Tree
    {
      const { canvas, ctx } = this.createCanvas(34, 48);
      // Trunk
      this.px(ctx, 15, 26, 4, 20, '#593214');
      // Planter Box
      this.px(ctx, 8, 42, 18, 6, '#475569');
      this.px(ctx, 9, 43, 16, 4, '#334155');

      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(17, 16, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(16, 14, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(14, 11, 5, 0, Math.PI * 2);
      ctx.fill();
      this.sprites['city_tree'] = canvas;
    }

    // Burning City: Ruined High-Rise Spewing Fire (Stage 3)
    {
      const { canvas, ctx } = this.createCanvas(58, 96);
      this.px(ctx, 2, 0, 54, 96, '#181215');
      this.px(ctx, 2, 0, 2, 96, '#28171b');

      for (let y = 8; y < 86; y += 13) {
        for (let x = 8; x < 50; x += 11) {
          const isFire = (x * y) % 2 === 0;
          if (isFire) {
            this.px(ctx, x, y, 7, 7, '#ea580c');
            this.px(ctx, x + 1, y + 1, 5, 5, '#f59e0b');
            this.px(ctx, x + 2, y + 2, 3, 3, '#fef08a');
          } else {
            this.px(ctx, x, y, 7, 7, '#090608');
          }
        }
      }
      this.px(ctx, 8, 0, 10, 4, '#dc2626');
      this.px(ctx, 28, 0, 12, 5, '#f97316');
      this.sprites['city_bldg_fire'] = canvas;
    }
  }

  // ==========================================================
  // 5. DESERT SCENERY (Cacti, Rocks, Route 66 Signs, Telegraph)
  // ==========================================================
  generateDesertScenery() {
    // Saguaro Cactus (Large)
    {
      const { canvas, ctx } = this.createCanvas(32, 54);
      const cMid = '#2d6a4f';
      const cLight = '#40916c';
      const cDark = '#1b4332';
      this.px(ctx, 12, 6, 8, 44, cMid);
      this.px(ctx, 13, 6, 2, 44, cLight);
      this.px(ctx, 18, 6, 2, 44, cDark);
      this.px(ctx, 4, 18, 9, 6, cMid);
      this.px(ctx, 4, 10, 6, 10, cMid);
      this.px(ctx, 5, 10, 2, 10, cLight);
      this.px(ctx, 19, 24, 9, 6, cMid);
      this.px(ctx, 22, 16, 6, 10, cMid);
      this.px(ctx, 23, 16, 2, 10, cLight);
      this.sprites['desert_cactus'] = canvas;
    }

    // Canyon Rock Boulder
    {
      const { canvas, ctx } = this.createCanvas(38, 30);
      this.px(ctx, 4, 8, 30, 18, '#85371b');
      this.px(ctx, 8, 4, 22, 22, '#a84724');
      this.px(ctx, 12, 5, 12, 6, '#c45a30');
      this.px(ctx, 22, 16, 11, 9, '#5e230e');
      this.sprites['desert_rock'] = canvas;
    }

    // Route 66 Shield Sign
    {
      const { canvas, ctx } = this.createCanvas(32, 46);
      this.px(ctx, 14, 22, 4, 24, '#64748b');
      this.px(ctx, 15, 22, 2, 24, '#94a3b8');
      this.px(ctx, 4, 4, 24, 20, '#f8fafc');
      this.px(ctx, 6, 2, 20, 4, '#f8fafc');
      this.px(ctx, 6, 20, 20, 6, '#f8fafc');
      this.px(ctx, 9, 24, 14, 4, '#f8fafc');
      this.px(ctx, 6, 5, 20, 2, '#0f172a');
      this.px(ctx, 8, 10, 6, 8, '#0f172a');
      this.px(ctx, 18, 10, 6, 8, '#0f172a');
      this.sprites['desert_sign66'] = canvas;
    }

    // Telegraph / Utility Pole with Crossbars
    {
      const { canvas, ctx } = this.createCanvas(34, 60);
      this.px(ctx, 15, 8, 4, 52, '#78350f');
      this.px(ctx, 16, 8, 2, 52, '#92400e');
      // Top Crossbar
      this.px(ctx, 4, 12, 26, 3, '#78350f');
      this.px(ctx, 5, 10, 3, 2, '#e2e8f0'); // ceramic insulators
      this.px(ctx, 15, 10, 3, 2, '#e2e8f0');
      this.px(ctx, 26, 10, 3, 2, '#e2e8f0');
      this.sprites['desert_pole'] = canvas;
    }
  }

  // ==========================================================
  // 6. CHAOS & BURNING SCENERY (Totems, Barrels, Burning Debris)
  // ==========================================================
  generateChaosScenery() {
    // Burning Oil Drum
    {
      const { canvas, ctx } = this.createCanvas(24, 32);
      this.px(ctx, 4, 14, 16, 14, '#581c1c');
      this.px(ctx, 5, 14, 2, 14, '#7f1d1d');
      this.px(ctx, 4, 17, 16, 2, '#18181b');
      this.px(ctx, 4, 23, 16, 2, '#18181b');
      this.px(ctx, 6, 6, 12, 8, '#ea580c');
      this.px(ctx, 8, 2, 8, 8, '#f59e0b');
      this.px(ctx, 10, 0, 4, 4, '#fef08a');
      this.sprites['chaos_barrel'] = canvas;
    }

    // Wasteland Spiked Totem with Skull
    {
      const { canvas, ctx } = this.createCanvas(34, 52);
      this.px(ctx, 14, 12, 6, 40, '#431407');
      this.px(ctx, 15, 12, 2, 40, '#78350f');
      this.px(ctx, 6, 18, 22, 4, '#431407');
      this.px(ctx, 8, 28, 18, 3, '#431407');
      this.px(ctx, 11, 2, 12, 10, '#d6d3d1');
      this.px(ctx, 13, 5, 3, 3, '#0c0a09');
      this.px(ctx, 18, 5, 3, 3, '#0c0a09');
      this.sprites['chaos_totem'] = canvas;
    }
  }

  // ==========================================================
  // 7. PICKUPS (Nitro, Health Kit, Cash Medal)
  // ==========================================================
  generatePickupSprites() {
    // 1. Nitro Boost Canister
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      this.px(ctx, 6, 5, 12, 14, '#0284c7');
      this.px(ctx, 7, 6, 2, 12, '#38bdf8');
      this.px(ctx, 8, 3, 8, 3, '#94a3b8');

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(13, 6);
      ctx.lineTo(8, 13);
      ctx.lineTo(12, 13);
      ctx.lineTo(10, 18);
      ctx.lineTo(16, 11);
      ctx.lineTo(12, 11);
      ctx.closePath();
      ctx.fill();

      this.sprites['pickup_nitro'] = canvas;
    }

    // 2. Health Repair Tool Kit
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      this.px(ctx, 4, 6, 16, 13, '#0f766e');
      this.px(ctx, 5, 7, 14, 11, '#14b8a6');
      this.px(ctx, 9, 3, 6, 3, '#475569');

      this.px(ctx, 10, 10, 4, 6, '#ffffff');
      this.px(ctx, 8, 12, 8, 2, '#ffffff');

      this.sprites['pickup_heart'] = canvas;
    }

    // 3. Gold Cash Coin
    {
      const { canvas, ctx } = this.createCanvas(24, 24);
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(12, 12, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(12, 12, 7, 0, Math.PI * 2);
      ctx.fill();

      this.px(ctx, 10, 8, 4, 2, '#78350f');
      this.px(ctx, 9, 9, 2, 2, '#78350f');
      this.px(ctx, 10, 11, 4, 2, '#78350f');
      this.px(ctx, 13, 13, 2, 2, '#78350f');
      this.px(ctx, 10, 14, 4, 2, '#78350f');
      this.px(ctx, 11, 7, 2, 10, '#78350f');

      this.sprites['pickup_coin'] = canvas;
    }
  }

  // Draw sprite onto target canvas
  draw(ctx, spriteKey, x, y, scale = 1, rotation = 0) {
    const s = this.sprites[spriteKey];
    if (!s) return;

    if (rotation === 0 && scale === 1) {
      ctx.drawImage(s, Math.round(x - s.width / 2), Math.round(y - s.height / 2));
    } else {
      ctx.save();
      ctx.translate(Math.round(x), Math.round(y));
      if (rotation !== 0) ctx.rotate(rotation);
      if (scale !== 1) ctx.scale(scale, scale);
      ctx.drawImage(s, -s.width / 2, -s.height / 2);
      ctx.restore();
    }
  }
}

// Global sprite singleton
window.spriteMgr = new SpriteManager();
