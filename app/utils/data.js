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
      image:
        "https://img.a.transfermarkt.technology/portrait/big/28003-1710080339.jpg?lm=1",
      stats: {
        goals: 672,
        assists: 285,
        matches: 778,
      },
    },
    {
      id: "f2",
      name: "Cristiano Ronaldo",
      team: "Manchester United",
      role: "Forward",
      price: 14.0,
      points: 95,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/8198-1694609670.jpg?lm=1",
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
      },
    },
    {
      id: "f4",
      name: "Harry Maguire",
      team: "Manchester United",
      role: "Defender",
      price: 10.0,
      points: 85,
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQFMMccx9wJLj-0wxZu_nBhsl-j3yQu5jCMlE89zLqMCdwaDjANTM19uJollBmquGRs92SJbZtG6qZbez5jsk8Jj8wjUavyk9nPnEjBpg",
      stats: {
        goals: 20,
        assists: 10,
        matches: 100,
      },
    },
    {
      id: "f5",
      name: "Kevin De Bruyne",
      team: "Manchester City",
      role: "Midfielder",
      price: 12.0,
      points: 88,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/88755-1713391485.jpg?lm=1",
      stats: {
        goals: 70,
        assists: 120,
        matches: 250,
      },
    },
    {
      id: "f6",
      name: "Alisson Becker",
      team: "Liverpool",
      role: "Goalkeeper",
      price: 11.0,
      points: 80,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/105470-1671601584.jpg?lm=1",
      stats: {
        cleanSheets: 50,
        saves: 200,
        matches: 100,
      },
    },
    {
      id: "f7",
      name: "Trent Alexander-Arnold",
      team: "Liverpool",
      role: "Defender",
      price: 10.5,
      points: 87,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/314353-1616775939.jpg?lm=1",
      stats: {
        goals: 10,
        assists: 30,
        matches: 150,
      },
    },
    {
      id: "f8",
      name: "Virgil van Dijk",
      team: "Liverpool",
      role: "Defender",
      price: 11.0,
      points: 90,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/139208-1554467568.jpg?lm=1",
      stats: {
        goals: 15,
        assists: 5,
        matches: 120,
      },
    },
    {
      id: "f9",
      name: "Andy Robertson",
      team: "Liverpool",
      role: "Defender",
      price: 10.0,
      points: 85,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/234803-1655127569.jpg?lm=1",
      stats: {
        goals: 8,
        assists: 35,
        matches: 130,
      },
    },
    {
      id: "f10",
      name: "Sergio Ramos",
      team: "PSG",
      role: "Defender",
      price: 10.0,
      points: 88,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/25557-1659270709.jpg?lm=1",
      stats: {
        goals: 30,
        assists: 12,
        matches: 170,
      },
    },
    {
      id: "f11",
      name: "Joshua Kimmich",
      team: "Bayern Munich",
      role: "Midfielder",
      price: 11.0,
      points: 89,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/161056-1616775939.jpg?lm=1",
      stats: {
        goals: 25,
        assists: 50,
        matches: 140,
      },
    },
    {
      id: "f12",
      name: "Bruno Fernandes",
      team: "Manchester United",
      role: "Midfielder",
      price: 12.0,
      points: 90,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/240306-1616775939.jpg?lm=1",
      stats: {
        goals: 40,
        assists: 60,
        matches: 130,
      },
    },
    {
      id: "f13",
      name: "Luka Modric",
      team: "Real Madrid",
      role: "Midfielder",
      price: 11.5,
      points: 88,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/215514-1616775939.jpg?lm=1",
      stats: {
        goals: 25,
        assists: 55,
        matches: 150,
      },
    },
    {
      id: "f14",
      name: "N'Golo Kante",
      team: "Chelsea",
      role: "Midfielder",
      price: 10.5,
      points: 85,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/215914-1616775939.jpg?lm=1",
      stats: {
        goals: 10,
        assists: 20,
        matches: 140,
      },
    },
    {
      id: "f15",
      name: "Sadio Mane",
      team: "Bayern Munich",
      role: "Forward",
      price: 13.0,
      points: 92,
      image:
        "https://img.a.transfermarkt.technology/portrait/big/200512-1616775939.jpg?lm=1",
      stats: {
        goals: 120,
        assists: 45,
        matches: 180,
      },
    },
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
    maxPlayers: 7,
    maxTeamValue: 120,
    sections: {
      Goalkeepers: { min: 1, max: 1 },
      Defenders: { min: 2, max: 2 },
      Midfielders: { min: 2, max: 3 },
      Forwards: { min: 1, max: 1 },
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
