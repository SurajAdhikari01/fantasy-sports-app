import React from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { RecoilRoot, useRecoilValue, useRecoilState } from "recoil";
import EnhancedTeamView from "../components/EnhancedTeamView";
import TournamentSelect from "../components/TournamentSelect";
import ViewTeam from "../components/ViewTeam";
import { selectedTournamentState, viewModeState } from "../components/atoms";

// conditionally render based on Recoil state
const MainContent = () => {
  const selectedTournament = useRecoilValue(selectedTournamentState);
  const [viewMode, setViewMode] = useRecoilState(viewModeState);

  // If no tournament is selected, show tournament selection
  if (!selectedTournament) {
    return <TournamentSelect />;
  }

  // If tournament is selected, show either team management or team view based on viewMode
  switch (viewMode) {
    case 'VIEW_TEAM':
      return <ViewTeam />;
    case 'MANAGE_TEAM':
    default:
      return <EnhancedTeamView />;
  }
};

const MainPage = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1F2937' }}>
      <RecoilRoot>
        <MainContent />
      </RecoilRoot>
    </SafeAreaView>
  );
};

export default MainPage;