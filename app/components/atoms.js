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

export const teamDataState = atom({
  key: "teamDataState",
  default: {},
});

export const franchisesState = atom({
  key: "franchisesState",
  default: [],
});

export const filterRoleState = atom({
  key: "filterRoleState",
  default: "All",
});

export const sortByState = atomFamily({
  key: "sortByState",
  default: "points",
});

export const selectedPlayerState = atomFamily({
  key: "selectedPlayerState",
  default: null,
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

export const selectedFranchiseState = atom({
  key: "selectedFranchiseState",
  default: null,
});

export const filteredAvailablePlayersState = selector({
  key: "filteredAvailablePlayersState",
  get: ({ get }) => {
    const filterRole = get(filterRoleState);
    const sortBy = get(sortByState("default"));
    const teamData = get(teamDataState);
    const fetchedPlayers = get(fetchedPlayersState);

    const teamPlayers = Object.values(teamData).flat();
    let players = fetchedPlayers.filter(
      (player) => !teamPlayers.some((p) => p._id === player._id)
    );

    if (filterRole !== "All") {
      players = players.filter((p) => p.role === filterRole);
    }

    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  },
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

export const totalPointsState = selector({
  key: "totalPointsState",
  get: ({ get }) => {
    const teamData = get(teamDataState);
    return Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.points, 0);
  },
});