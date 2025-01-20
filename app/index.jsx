// index.jsx
import React from "react";
import EnhancedTeamView from "./components/EnhancedTeamView.jsx";
import { RecoilRoot } from "recoil";

const App = () => {
  return (
    <RecoilRoot>
      <EnhancedTeamView />
    </RecoilRoot>
  );
};

export default App;
