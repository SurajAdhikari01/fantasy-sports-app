// atoms.js
import { atom, atomFamily, selector } from "recoil";
import { allPlayers, SPORT_CONFIGS } from "../utils/data";

const atoms = {};

export const getAtom = (key, defaultValue) => {
  if (!atoms[key]) {
    atoms[key] = atom({
      key,
      default: defaultValue,
    });
  }
  return atoms[key];
};

// Sport State
export const sportState = getAtom("sportState", "football");

// Selected Tournament
export const selectedTournamentState = getAtom("selectedTournamentState", null);

// Team Data
export const teamDataState = getAtom("teamDataState", {});

// Franchises
export const franchisesState = getAtom("franchisesState", []);

// Filter Role
export const filterRoleState = getAtom("filterRoleState", "All");

// Sort By (atom family)
export const sortByState = atomFamily({
  key: "sortByState",
  default: "points",
});

// Selected Player (atom family)
export const selectedPlayerState = atomFamily({
  key: "selectedPlayerState",
  default: null,
});

// Show Player Stats (atom family)
export const showPlayerStatsState = atomFamily({
  key: "showPlayerStatsState",
  default: false,
});

// Show Player Selection Modal (atom family)
export const showPlayerSelectionModalState = atomFamily({
  key: "showPlayerSelectionModalState",
  default: false,
});

// Selected Section (atom family)
export const selectedSectionState = atomFamily({
  key: "selectedSectionState",
  default: null,
});

// Selectors
export const filteredAvailablePlayersState = selector({
  key: "filteredAvailablePlayersState",
  get: ({ get }) => {
    const sport = get(sportState);
    const filterRole = get(filterRoleState);
    const sortBy = get(sortByState("default"));
    const teamData = get(teamDataState);

    let players = allPlayers[sport]?.filter(
      (player) =>
        !Object.values(teamData)
          .flat()
          .some((p) => p.id === player.id)
    );

    if (!players) return [];
    if (filterRole !== "All")
      players = players.filter((p) => p.role === filterRole);

    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  },
});

// Total Players Selector
export const totalPlayersState = selector({
  key: "totalPlayersState",
  get: ({ get }) => Object.values(get(teamDataState)).flat().length,
});

// Team Value Selector
export const teamValueState = selector({
  key: "teamValueState",
  get: ({ get }) =>
    Object.values(get(teamDataState))
      .flat()
      .reduce((sum, player) => sum + player.price, 0)
      .toFixed(1),
});

// Total Points Selector
export const totalPointsState = selector({
  key: "totalPointsState",
  get: ({ get }) =>
    Object.values(get(teamDataState))
      .flat()
      .reduce((sum, player) => sum + player.points, 0),
});
