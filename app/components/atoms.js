// atoms.js
import { atom, selector } from 'recoil';
import { allPlayers, SPORT_CONFIGS } from '../utils/data';

export const sportState = atom({
  key: 'sportState',
  default: 'cricket',
});

export const teamDataState = atom({
  key: 'teamDataState',
  default: {},
});

export const filterRoleState = atom({
  key: 'filterRoleState',
  default: 'All',
});

export const sortByState = atom({
  key: 'sortByState',
  default: 'points',
});

export const selectedPlayerState = atom({
  key: 'selectedPlayerState',
  default: null,
});

export const showPlayerStatsState = atom({
  key: 'showPlayerStatsState',
  default: false,
});

export const showPlayerSelectionModalState = atom({
  key: 'showPlayerSelectionModalState',
  default: false,
});

export const selectedSectionState = atom({
  key: 'selectedSectionState',
  default: null,
});

export const filteredAvailablePlayersState = selector({
  key: 'filteredAvailablePlayersState',
  get: ({ get }) => {
    const sport = get(sportState);
    const filterRole = get(filterRoleState);
    const sortBy = get(sortByState);
    const teamData = get(teamDataState);

    let players = allPlayers[sport]?.filter(
      (player) =>
        !Object.values(teamData)
          .flat()
          .some((p) => p.id === player.id)
    );

    if (!players) return [];

    if (filterRole !== 'All') {
      players = players.filter((p) => p.role === filterRole);
    }

    return [...players].sort((a, b) => b[sortBy] - a[sortBy]);
  },
});

export const totalPlayersState = selector({
  key: 'totalPlayersState',
  get: ({ get }) => {
    const teamData = get(teamDataState);
    return Object.values(teamData).flat().length;
  },
});

export const teamValueState = selector({
  key: 'teamValueState',
  get: ({ get }) => {
    const teamData = get(teamDataState);
    return Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.price, 0)
      .toFixed(1);
  },
});

export const totalPointsState = selector({
  key: 'totalPointsState',
  get: ({ get }) => {
    const teamData = get(teamDataState);
    return Object.values(teamData)
      .flat()
      .reduce((sum, player) => sum + player.points, 0);
  },
});