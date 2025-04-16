import { atom, atomFamily, selector } from "recoil";


// Default sport is set to football
export const sportState = atom({
  key: "sportState",
  default: "football",
});

export const selectedTournamentState = atom({
  key: "selectedTournamentState",
  default: null,
});

export const viewModeState = atom({
  key: "viewModeState",
  default: "MANAGE_TEAM",
});

export const totalPointsState = atom({
  key: "totalPointsState",
  default: 0,
});

export const playerLimitState = atom({
  key: "playerLimitState",
  default: 10,
});

export const teamDataState = atom({
  key: "teamDataState",
  default: {},
});

export const currentRoundState = atom({
  key: "currentRoundState",
  default: "knockout",
});

export const franchisesState = atom({
  key: "franchisesState",
  default: [],
});

export const showPlayerStatsState = atomFamily({
  key: "showPlayerStatsState",
  default: false,
});

export const showPlayerSelectionModalState = atomFamily({
  key: "showPlayerSelectionModalState",
  default: false,
});

export const selectedSectionState = atomFamily({
  key: "selectedSectionState",
  default: null,
});

export const fetchedPlayersState = atom({
  key: "fetchedPlayersState",
  default: [],
});

export const totalPlayersState = selector({
  key: "totalPlayersState",
  get: ({ get }) => {
    const teamData = get(teamDataState);
    return Object.values(teamData).flat().length;
  },
});

export const teamValueState = selector({
  key: "teamValueState",
  get: ({ get }) => {
    const teamData = get(teamDataState);
    const value = Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.price, 0);
    return Number(value.toFixed(1)); // Return as number
  },
});

export const teamIdState = atom({
  key: "teamIdState",
  default: null,
});
