// Step 1: Interface for a match
interface Match {
  id: number;
  score1: number;
  score2: number;
  createdAt: Date;
}

// Step 2: Interface for a team
interface Team {
  id: number;
  userName: string;
  teamName: string;
  logoUrl: string;
  createdAt: Date;
  gamesAsTeam1: Match[];
  gamesAsTeam2: Match[];
}

// Step 3: Interface for team statistics in standings table
export interface TeamStats {
  teamId: number;
  team: Team;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsConceded: number;
  points: number;
}

// Step 4: Function to calculate tournament standings
export function getTournamentStandings(teams: Team[]): TeamStats[] {
  const teamStatsMap = new Map<number, TeamStats>();

  // Helper function to update team stats
  function updateTeamStats(
    teamId: number,
    team: Team,
    goalsScored: number,
    goalsConceded: number,
    points: number,
  ): void {
    let teamStats = teamStatsMap.get(teamId);
    if (!teamStats) {
      teamStats = {
        teamId, // Using teamId instead of teamName
        team, // Storing the whole Team object as an association
        gamesPlayed: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsScored: 0,
        goalsConceded: 0,
        points: 0,
      };
      teamStatsMap.set(teamId, teamStats);
    }

    console.log(goalsScored, goalsConceded, points);

    if (goalsScored === null || goalsConceded === null) return;

    teamStats.gamesPlayed++;
    teamStats.goalsScored += goalsScored;
    teamStats.goalsConceded += goalsConceded;
    teamStats.points += points;

    if (points === 3) {
      teamStats.wins++;
    } else if (points === 1) {
      teamStats.draws++;
    } else {
      teamStats.losses++;
    }
  }

  // Calculate team stats for each team
  for (const team of teams) {
    const { id: teamId, gamesAsTeam1, gamesAsTeam2 } = team;

    // Call the updateTeamStats function with the whole team object
    // updateTeamStats(teamId, team, 0, 0, 0); // Initialize the teamStats object

    for (const match of gamesAsTeam1) {
      const { score1, score2 } = match;

      if (score1 === null || score2 === null) {
        updateTeamStats(teamId, team, null, null, null);
        continue; // Skip if match is not played (scores are null)
      }

      if (score1 > score2) {
        updateTeamStats(teamId, team, score1, score2, 3); // Team 1 wins
      } else if (score1 < score2) {
        updateTeamStats(teamId, team, score1, score2, 0); // Team 1 loses
      } else {
        updateTeamStats(teamId, team, score1, score2, 1); // Draw
      }
    }

    for (const match of gamesAsTeam2) {
      const { score1, score2 } = match;

      if (score1 === null || score2 === null) {
        updateTeamStats(teamId, team, null, null, null);
        continue;
      }

      if (score1 > score2) {
        updateTeamStats(teamId, team, score2, score1, 0); // Team 2 loses
      } else if (score1 < score2) {
        updateTeamStats(teamId, team, score2, score1, 3); // Team 2 wins
      } else {
        updateTeamStats(teamId, team, score2, score1, 1); // Draw
      }
    }
  }

  // Convert teamStatsMap to an array and sort by points (descending)
  const standings: TeamStats[] = Array.from(teamStatsMap.values());
  standings.sort((a, b) => b.points - a.points);

  // delete gamesAsTeam1 and gamesAsTeam2 from each teamStats object
  for (const teamStats of standings) {
    delete teamStats.team.gamesAsTeam1;
    delete teamStats.team.gamesAsTeam2;
  }

  return standings;
}
