const allPlayers = {
  cricket: [
    {
      id: "1",
      name: "Virat Kohli",
      team: "RCB",
      role: "Batsmen",
      price: 12.0,
      points: 95,
      image: "https://example.com/kohli.jpg",
      stats: {
        matches: 200,
        average: 50.3,
        strikeRate: 138.2,
      },
    },
    // Other players...
  ],
  football: [
    {
      id: "f1",
      name: "Lionel Messi",
      team: "Inter Miami",
      role: "Forward",
      price: 15.0,
      points: 94,
      image: "https://img.a.transfermarkt.technology/portrait/big/28003-1710080339.jpg?lm=1",
      stats: {
        goals: 672,
        assists: 285,
        matches: 778,
      },
    },
    {
      id:"f2",
      name: "Cristiano Ronaldo",
      team: "Manchester United",
      role: "Forward",
      price: 14.0,
      points: 95,
      image: "https://img.a.transfermarkt.technology/portrait/big/8198-1694609670.jpg?lm=1",
      stats: {
        goals: 917,
        assists: 256,
        matches: 1256,
    },
  },
  {
    id: "f3",
    name: "Neymar Jr",
    team: "PSG",
    role: "Forward",
    price: 13.0,
    points: 90,
    image: "https://b.fssta.com/uploads/application/soccer/headshots/713.png",
    stats: {
      goals: 250,
      assists: 150,
      matches: 400,
    }
  },
  {
    id: "f4",
    name: "Harry Maguire",
    team: "Manchester United",
    role: "Defender",
    price: 10.0,
    points: 85,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFMMccx9wJLj-0wxZu_nBhsl-j3yQu5jCMlE89zLqMCdwaDjANTM19uJollBmquGRs92SJbZtG6qZbez5jsk8Jj8wjUavyk9nPnEjBpg",
    stats: {
      goals: 20,
      assists: 10,
      matches: 100,
    }
  },
  {
    id: "f5",
    name: "Kevin De Bruyne",
    team: "Manchester City",
    role: "Midfielder",
    price: 12.0,
    points: 88,
    image: "https://img.a.transfermarkt.technology/portrait/big/88755-1713391485.jpg?lm=1",
    stats: {
      goals: 70,
      assists: 120,
      matches: 250,
    }
  }
    // Other players...
  ],
};

const SPORT_CONFIGS = {
  cricket: {
    maxPlayers: 11,
    maxTeamValue: 100,
    sections: {
      Batsmen: { min: 3, max: 6 },
      Bowlers: { min: 3, max: 6 },
      AllRounders: { min: 1, max: 4 },
      WicketKeepers: { min: 1, max: 2 },
    },
    fieldPositions: {
      Batsmen: { y: 200, spread: true },
      Bowlers: { y: 400, spread: true },
      AllRounders: { y: 300, spread: true },
      WicketKeepers: { y: 500, spread: false },
    },
  },
  football: {
    maxPlayers: 15,
    maxTeamValue: 120,
    sections: {
      Goalkeepers: { min: 1, max: 1 },
      Defenders: { min: 3, max: 5 },
      Midfielders: { min: 2, max: 5 },
      Forwards: { min: 1, max: 3 },
    },
    fieldPositions: {
      Goalkeepers: { y: 550, spread: false },
      Defenders: { y: 400, spread: true },
      Midfielders: { y: 250, spread: true },
      Forwards: { y: 100, spread: true },
    },
  },
};

export { allPlayers, SPORT_CONFIGS };

// Dummy default export to satisfy Expo Router
export default {};