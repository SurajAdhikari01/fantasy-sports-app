import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRecoilValue } from "recoil";
import TournamentSelect from "../components/TournamentSelect";
import ViewTeam from "../components/ViewTeam";
import EnhancedTeamView from "../components/EnhancedTeamView";
import { selectedTournamentState, viewModeState } from "../components/atoms";

const MainPage = () => {
  const selectedTournament = useRecoilValue(selectedTournamentState);
  const viewMode = useRecoilValue(viewModeState);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2a2a2a" }}>
      {!selectedTournament ? (
        <TournamentSelect />
      ) : viewMode === "VIEW_TEAM" ? (
        <ViewTeam />
      ) : (
        <EnhancedTeamView />
      )}
    </SafeAreaView>
  );
};

export default MainPage;
