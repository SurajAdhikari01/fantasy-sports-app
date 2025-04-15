import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { useRouter } from 'expo-router';
import {
  teamDataState,
  teamIdState,
  sportState,
  viewModeState,
  selectedTournamentState,
  playerLimitState,
} from './atoms';
import api from '../config/axios';
import EnhancedTeamView from './EnhancedTeamView';
import { SPORT_CONFIGS } from './sportConfigs';

function groupPlayersBySection(players, sport) {
  const config = SPORT_CONFIGS[sport];
  const teamData = {};
  // Build an empty array per section
  Object.keys(config.sections).forEach((section) => {
    teamData[section] = [];
  });

  players.forEach((player) => {
    // Find which section this player belongs to
    const section = Object.keys(config.sections).find((section) =>
      config.sections[section].playerTypes.includes(player.playerType?.toLowerCase())
    );
    if (section) {
      teamData[section].push(player);
    }
  });
  return teamData;
}

const EditTeam = () => {
  const router = useRouter();
  const teamId = useRecoilValue(teamIdState);
  const [teamData, setTeamData] = useRecoilState(teamDataState);
  const sport = useRecoilValue(sportState);
  const setViewMode = useSetRecoilState(viewModeState);
  const selectedTournament = useRecoilValue(selectedTournamentState);
  const playerLimit = useRecoilValue(playerLimitState);
  const [originalPlayerIds, setOriginalPlayerIds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Set the view mode to EDIT_TEAM when component mounts
  useEffect(() => {
    setViewMode("EDIT_TEAM");
    return () => {
      setViewMode("MANAGE_TEAM");
    };
  }, [setViewMode]);

  // On mount, fetch the team and structure teamData for editing
  useEffect(() => {
    async function fetchAndSetTeamData() {
      setLoading(true);
      try {
        const response = await api.get(`/teams`);
        console.log("response", response.data);
        if (response.data.success) {
          const teamForTournament = response.data.data.find(
            (team) => team.tournamentId?._id === selectedTournament
          );
          if (teamForTournament) {
            console.log("playerlimit edit team", playerLimit);
            const allPlayers =
              Object.values(teamForTournament.players || {})
                .flat()
                .map((p) => ({
                  ...p,
                  playerType: (p.playerType?.toLowerCase() || "").trim(),
                }));

            setOriginalPlayerIds(allPlayers.map((p) => p._id));
            setTeamData(groupPlayersBySection(allPlayers, sport));
          }
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to load team for editing');
      } finally {
        setLoading(false);
      }
    }

    fetchAndSetTeamData();
  }, [selectedTournament, sport]);

  const handleSubmit = async (currentTeamData) => {
    const currentPlayerIds = Object.values(currentTeamData).flat().map(p => p._id).filter(Boolean);
    const addPlayers = currentPlayerIds.filter(id => !originalPlayerIds.includes(id));
    const removePlayers = originalPlayerIds.filter(id => !currentPlayerIds.includes(id));
    console.log("submitting", { addPlayers, removePlayers });

    try {
      await api.put(`/teams/${teamId}`, { addPlayers, removePlayers });
      console.log("Updated team successfully", response.data);
      Alert.alert('Success', 'Team updated successfully!');
      setTeamData({});
      setViewMode("VIEW_TEAM");
      router.back();
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update team');
    }
  };

  if (loading) return null;

  return <EnhancedTeamView onSubmit={handleSubmit} />;
};

export default EditTeam;