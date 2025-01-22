// MainPage.js
import React, { useState } from 'react';
import { SafeAreaView } from "react-native-safe-area-context";
import { RecoilRoot } from "recoil";
import EnhancedTeamView from "../components/EnhancedTeamView";
import TournamentSelector from "../components/TournamentSelector";

const MainPage = () => {
  // const [selectedTournament, setSelectedTournament] = useState("");

  // const handleTournamentSelect = (tournament) => {
  //   setSelectedTournament(tournament);
  // };


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#1F2937' }}>
      
      <RecoilRoot>
        {/* {!selectedTournament ? (
          <TournamentSelector onTournamentSelect={handleTournamentSelect} />
        ) : (
          <EnhancedTeamView tournament={selectedTournament} />
        )} */}
        <EnhancedTeamView  />

      </RecoilRoot>
    </SafeAreaView>
  );
};

export default MainPage;