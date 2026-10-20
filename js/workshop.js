/**
 * Retro Overdrive - Workshop & Economy Manager
 * Handles persistent cash, upgrade trees, stat modifiers, and repairs.
 */

class WorkshopManager {
  constructor() {
    this.storageKeyCash = 'retro_overdrive_cash';
    this.storageKeyUpgrades = 'retro_overdrive_upgrades';

    // Upgrade Tree Definitions
    this.upgradeDefs = {
      motor: {
        name: 'MOTOR',
        icon: '⚙️',
        desc: 'Aumenta velocidade máxima e aceleração.',
        maxLevel: 3,
        costs: [450, 1100, 2400],
        benefits: [
          'Velocidade base e aceleração +10%',
          'Velocidade base e aceleração +22%',
          'Velocidade base e aceleração +36%'
        ],
        // Stat multiplier getters
        getSpeedMult: (lvl) => 1.0 + lvl * 0.12,
        getAccelMult: (lvl) => 1.0 + lvl * 0.15
      },
      pneus: {
        name: 'PNEUS',
        icon: '🛞',
        desc: 'Melhora resposta lateral, aderência e controle.',
        maxLevel: 3,
        costs: [350, 950, 2000],
        benefits: [
          'Resposta lateral +15%, menor derrapagem',
          'Resposta lateral +30%, controle firme',
          'Aderência máxima e manobras cirúrgicas'
        ],
        getSteerMult: (lvl) => 1.0 + lvl * 0.16,
        getGripMult: (lvl) => 1.0 + lvl * 0.2
      },
      nitro: {
        name: 'NITRO',
        icon: '⚡',
        desc: 'Aumenta eficiência, duração e recarga do turbo.',
        maxLevel: 3,
        costs: [400, 1000, 2200],
        benefits: [
          'Duração +20%, recarga passiva +15%',
          'Duração +40%, recarga passiva +30%',
          'Turbo de alta densidade e recarga ultrarrápida'
        ],
        getCapacityMult: (lvl) => 1.0 + lvl * 0.15,
        getDrainMult: (lvl) => 1.0 / (1.0 + lvl * 0.18),
        getRechargeMult: (lvl) => 1.0 + lvl * 0.25
      },
      blindagem: {
        name: 'BLINDAGEM',
        icon: '🛡️',
        desc: 'Camada reforçada que absorve impactos sem perder vida.',
        maxLevel: 3,
        costs: [500, 1300, 2800],
        benefits: [
          '1 Escudo de absorção (+1 impacto suportado)',
          '2 Escudos de absorção (+2 impactos suportados)',
          '3 Escudos de absorção e menor tempo de recuperação'
        ],
        getShields: (lvl) => lvl // 0, 1, 2, or 3 bonus shield hits
      }
    };

    // Repair cost
    this.repairCost = 150;

    // Load saved data
    this.cash = 0;
    this.upgrades = {
      motor: 0,
      pneus: 0,
      nitro: 0,
      blindagem: 0
    };

    this.load();
  }

  load() {
    try {
      const savedCash = localStorage.getItem(this.storageKeyCash);
      this.cash = savedCash !== null ? Math.max(0, parseInt(savedCash, 10)) : 100; // start with $100 starter cash

      const savedUpgrades = localStorage.getItem(this.storageKeyUpgrades);
      if (savedUpgrades) {
        const parsed = JSON.parse(savedUpgrades);
        this.upgrades = {
          motor: Math.min(3, Math.max(0, parsed.motor || 0)),
          pneus: Math.min(3, Math.max(0, parsed.pneus || 0)),
          nitro: Math.min(3, Math.max(0, parsed.nitro || 0)),
          blindagem: Math.min(3, Math.max(0, parsed.blindagem || 0))
        };
      }
    } catch (e) {
      this.cash = 100;
    }
  }

  save() {
    try {
      localStorage.setItem(this.storageKeyCash, this.cash.toString());
      localStorage.setItem(this.storageKeyUpgrades, JSON.stringify(this.upgrades));
    } catch (e) {}
  }

  addCash(amount) {
    if (amount <= 0) return;
    this.cash += Math.floor(amount);
    this.save();
    return this.cash;
  }

  spendCash(amount) {
    if (this.cash >= amount) {
      this.cash -= amount;
      this.save();
      return true;
    }
    return false;
  }

  getUpgradeLevel(type) {
    return this.upgrades[type] || 0;
  }

  getNextCost(type) {
    const def = this.upgradeDefs[type];
    const lvl = this.upgrades[type] || 0;
    if (lvl >= def.maxLevel) return null;
    return def.costs[lvl];
  }

  canBuy(type) {
    const cost = this.getNextCost(type);
    if (cost === null) return false;
    return this.cash >= cost;
  }

  buyUpgrade(type) {
    const cost = this.getNextCost(type);
    if (cost === null) return false;

    if (this.spendCash(cost)) {
      this.upgrades[type] = (this.upgrades[type] || 0) + 1;
      this.save();
      // Apply immediately to active player
      if (window.playerCar) {
        this.applyToPlayer(window.playerCar);
      }
      return true;
    }
    return false;
  }

  // Repair player car shields / lives
  canRepair(player) {
    if (!player) return false;
    const maxShields = this.upgradeDefs.blindagem.getShields(this.upgrades.blindagem);
    const needsRepair = player.lives < player.maxLives || player.shields < maxShields;
    return needsRepair && this.cash >= this.repairCost;
  }

  buyRepair(player) {
    if (!this.canRepair(player)) return false;
    if (this.spendCash(this.repairCost)) {
      player.lives = player.maxLives;
      player.shields = this.upgradeDefs.blindagem.getShields(this.upgrades.blindagem);
      return true;
    }
    return false;
  }

  // Apply upgrade stats to Player
  applyToPlayer(player) {
    if (!player) return;

    const motorLvl = this.upgrades.motor;
    const pneusLvl = this.upgrades.pneus;
    const nitroLvl = this.upgrades.nitro;
    const blindagemLvl = this.upgrades.blindagem;

    // Motor multipliers
    player.motorSpeedMult = this.upgradeDefs.motor.getSpeedMult(motorLvl);
    player.motorAccelMult = this.upgradeDefs.motor.getAccelMult(motorLvl);

    // Pneus multipliers (fluid lateral handling)
    player.steerAccel = 1350 * this.upgradeDefs.pneus.getSteerMult(pneusLvl);
    player.maxLateralSpeed = 420 * this.upgradeDefs.pneus.getSteerMult(pneusLvl);
    player.gripDamping = 0.88 + pneusLvl * 0.02; // snappier grip deceleration

    // Nitro multipliers
    player.maxNitro = 100 * this.upgradeDefs.nitro.getCapacityMult(nitroLvl);
    player.nitroDrainRate = 32 * this.upgradeDefs.nitro.getDrainMult(nitroLvl);
    player.nitroRechargeRate = 9 * this.upgradeDefs.nitro.getRechargeMult(nitroLvl);

    // Armor shields
    player.maxShields = this.upgradeDefs.blindagem.getShields(blindagemLvl);
    // If shields are uninitialized or lower than max, assign max
    if (player.shields === undefined || player.shields < player.maxShields) {
      player.shields = player.maxShields;
    }
  }

  // Reset progress option
  resetProgress() {
    this.cash = 100;
    this.upgrades = {
      motor: 0,
      pneus: 0,
      nitro: 0,
      blindagem: 0
    };
    this.save();
    if (window.playerCar) {
      this.applyToPlayer(window.playerCar);
      window.playerCar.reset();
    }
  }
}

// Global workshop singleton
window.workshopMgr = new WorkshopManager();
