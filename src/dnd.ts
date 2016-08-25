'use strict';

interface SerializedAbility {
  base: number,
  racialBonus?: number,
  levelBonus?: { [index: number]: number }
}

class Ability {
  base: number;
  racialBonus: number;
  levelBonus: { [index: number]: number }

  constructor (spec: SerializedAbility) {
    this.base = spec.base;
    this.racialBonus = spec.racialBonus || 0;

    this.levelBonus = {};
    for (var i in spec.levelBonus || {}) {
      this.levelBonus[i] = spec.levelBonus[i];
    }
  }

  get score () {
    let ret = this.base + this.racialBonus;
    for (var level in this.levelBonus) {
      ret += this.levelBonus[level];
    }
    return ret;
  }

  get modifier () {
    return (this.score / 2 | 0) - 5;
  }

  toJSON(): SerializedAbility {
    return {
      base: this.base,
      racialBonus: this.racialBonus,
      levelBonus: this.levelBonus,
    };
  }
}

interface SerializedSave {
  classBonus: number;
  miscBonus?: number;
}

class Save {
  ability: Ability;
  classBonus: number;
  miscBonus: number;

  constructor (spec: SerializedSave, ability: Ability) {
    this.ability = ability;
    this.classBonus = spec.classBonus;
    this.miscBonus = spec.miscBonus || 0;
  }

  get bonus(): number {
    return this.ability.modifier + this.classBonus + this.miscBonus;
  }

  toJSON() {
    return {
      classBonus: this.classBonus,
      miscBonus: this.miscBonus,
    };
  }
}

//     Good       Poor
// 0th       2.0       0.0
// 1st   2   2.5   0   0.3
// 2nd   3   3.0   0   0.7
// 3rd   3   3.5   1   1.0
// 4th   4   4.0   1   1.3
// 5th   4   4.5   1   1.7
// 6th   5   5.0   2   2.0
// 7th   5   5.5   2   2.3
// 8th   6   6.0   2   2.7
// 9th   6   6.5   3   3.0
// 
//     good(lvl) = 2 + floor(lvl / 2)
//     poor(lvl) = 0 + floor(lvl / 3)
// 
//     good[0] = 2.0
//     good[n] = good[n-1] + 0.5
//     poor[0] = 0.0
//     poor[n] = poor[n-1] + 0.34

interface SaveProgression {
  initial: number;
  increment: number;
}

const GOOD_SAVE_PROGRESSION: SaveProgression = { initial: 2.0; increment: 0.5; }
const POOR_SAVE_PROGRESSION: SaveProgression = { initial: 0.0; increment: 0.334; }

type BaseAttackBonusProgression = number;
const POOR_BAB_PROGRESSION: BaseAttackBonusProgression = 0.5;
const AVERAGE_BAB_PROGRESSION: BaseAttackBonusProgression = 0.75;
const GOOD_BAB_PROGRESSION: BaseAttackBonusProgression = 0.5;

interface CharacterClass {
  babProgression: BaseAttackBonusProgression;
  fortProgression: SaveProgression;
  reflProgression: SaveProgression;
  willProgression: SaveProgression;
}

const WARRIOR: CharacterClass {
  babProgression: GOOD_BAB_PROGRESSION,
  fortProgression: GOOD_SAVE_PROGRESSION,
  reflProgression: POOR_SAVE_PROGRESSION,
  willProgression: POOR_SAVE_PROGRESSION,
}

// Generics are a thing. I'm using one here to reduce repetition
interface AbilityMap<T> {
  STR: T, DEX: T, CON: T, INT: T, WIS: T, CHA: T,
}
interface SaveMap<T> {
  FORT: T, REFL: T, WILL: T,
}
interface SerializedCharacter {
  name: String,
  abilities: AbilityMap<SerializedAbility>,
  saves: SaveMap<SerializedSave>,
}

class Character {
  name: String;
  abilities: AbilityMap<Ability>;
  saves: SaveMap<Save>;

  constructor (spec: SerializedCharacter) {
    this.name = spec.name;
    this.abilities = {
      STR: new Ability(spec.abilities.STR),
      DEX: new Ability(spec.abilities.DEX),
      CON: new Ability(spec.abilities.CON),
      INT: new Ability(spec.abilities.INT),
      WIS: new Ability(spec.abilities.WIS),
      CHA: new Ability(spec.abilities.CHA),
    };
    this.saves = {
      FORT: new Save(spec.saves.FORT, this.abilities.CON),
      REFL: new Save(spec.saves.REFL, this.abilities.DEX),
      WILL: new Save(spec.saves.WILL, this.abilities.WIS),
    };
  }

  toJSON(): SerializedCharacter {
    return {
      name: this.name,
      abilities: {
        STR: this.abilities.STR.toJSON(),
        DEX: this.abilities.DEX.toJSON(),
        CON: this.abilities.CON.toJSON(),
        INT: this.abilities.INT.toJSON(),
        WIS: this.abilities.WIS.toJSON(),
        CHA: this.abilities.CHA.toJSON(),
      },
      saves: {
        FORT: this.saves.FORT.toJSON(),
        REFL: this.saves.REFL.toJSON(),
        WILL: this.saves.WILL.toJSON(),
      }
    };
  }
}

const wingblade = new Character({
  name: 'Wingblade',
  abilities: {
    // stat array: 18, 16, 15, 12, 12, 9
    STR: { base: 9, racialBonus: 0, levelBonus: {} },
    DEX: { base: 18, racialBonus: 2, levelBonus: {} },
    CON: { base: 15, racialBonus: 0, levelBonus: {} },
    INT: { base: 16, racialBonus: 0, levelBonus: {} },
    WIS: { base: 12, racialBonus: 0, levelBonus: {} },
    CHA: { base: 12, racialBonus: 0, levelBonus: {} },
  },
  saves: {
    FORT: { classBonus: 0 },
    REFL: { classBonus: 2 },
    WILL: { classBonus: 2 },
  }
});

console.log(wingblade.abilities.DEX.base); // 18
console.log(wingblade.abilities.DEX.score); // 20
console.log(wingblade.abilities.DEX.modifier); // 5
console.log(wingblade.saves.REFL.bonus); // 7
