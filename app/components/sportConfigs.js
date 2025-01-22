// sportConfigs.js
export const SPORT_CONFIGS = {
  football: {
    maxPlayers: 7,
    maxTeamValue: 100,
    sections: {
      goalkeepers: {
        min: 1,
        max: 1,
        playerTypes: ['goalkeeper']
      },
      defenders: {
        min: 2,
        max: 3,
        playerTypes: ['defender']
      },
      midfielders: {
        min: 2,
        max: 2,
        playerTypes: ['midfielder']
      },
      forwards: {
        min: 1,
        max: 1,
        playerTypes: ['forward']
      }
    }
  }
};