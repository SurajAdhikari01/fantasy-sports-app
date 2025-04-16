export const SPORT_CONFIGS = {
  football: {
    maxTeamValue: 100,
    sections: {
      goalkeepers: {
        min: 1,
        max: 1,
        playerTypes: ["goalkeeper"],
      },
      defenders: {
        min: 1,
        max: 4,
        playerTypes: ["defender"],
      },
      midfielders: {
        min: 1,
        max: 5,
        playerTypes: ["midfielder"],
      },
      forwards: {
        min: 1,
        max: 3,
        playerTypes: ["forward"],
      },
    },
    distributionRules: {
      base: { gk: 1, def: 1, mid: 1, fwd: 1 }, // Minimum
      sequence: ['def', ['mid', 'fwd'], ['mid', 'fwd'], 'def', ['mid', 'fwd'], 'def', ['mid', 'fwd']] // For players 5-11
    }
  },
};
