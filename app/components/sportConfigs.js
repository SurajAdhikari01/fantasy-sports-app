import { selector } from "recoil";
import { playerLimitState } from "./atoms";

// Recoil selector to retrieve player limit dynamically
export const playerLimitSelector = selector({
  key: "playerLimitSelector",
  get: ({ get }) => {
    return get(playerLimitState); // Retrieve the current value of playerLimitState
  },
});

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
        min: 2,
        max: 10,
        playerTypes: ["midfielder"],
      },
      forwards: {
        min: 1,
        max: 10,
        playerTypes: ["forward"],
      },
    },
  },
};