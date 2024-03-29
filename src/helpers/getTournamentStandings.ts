// Step 1: Interface for a match
interface Match {
  id: number;
  score1: number;
  score2: number;
  createdAt: Date;
  updatedAt: Date;
}

interface MatchResult {
  value: string;
  playedAt: Date;
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
  lastFiveGameResults: Array<MatchResult>;
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
    gameResult: MatchResult,
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
        lastFiveGameResults: [],
      };
      teamStatsMap.set(teamId, teamStats);
    }

    if (goalsScored === null || goalsConceded === null) return;

    teamStats.gamesPlayed++;
    teamStats.goalsScored += goalsScored;
    teamStats.goalsConceded += goalsConceded;
    teamStats.points += points;
    teamStats.lastFiveGameResults.push(gameResult);

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

    for (const match of gamesAsTeam1) {
      const { score1, score2, updatedAt = null } = match;

      if (score1 === null || score2 === null) {
        updateTeamStats(teamId, team, null, null, null, null);
        continue; // Skip if match is not played (scores are null)
      }

      if (score1 > score2) {
        updateTeamStats(teamId, team, score1, score2, 3, {
          value: 'W',
          playedAt: updatedAt,
        }); // Team 1 wins
      } else if (score1 < score2) {
        updateTeamStats(teamId, team, score1, score2, 0, {
          value: 'L',
          playedAt: updatedAt,
        }); // Team 1 loses
      } else {
        updateTeamStats(teamId, team, score1, score2, 1, {
          value: 'D',
          playedAt: updatedAt,
        }); // Draw
      }
    }

    for (const match of gamesAsTeam2) {
      const { score1, score2, updatedAt = null } = match;

      if (score1 === null || score2 === null) {
        updateTeamStats(teamId, team, null, null, null, null);
        continue;
      }

      if (score1 > score2) {
        updateTeamStats(teamId, team, score2, score1, 0, {
          value: 'L',
          playedAt: updatedAt,
        }); // Team 2 loses
      } else if (score1 < score2) {
        updateTeamStats(teamId, team, score2, score1, 3, {
          value: 'W',
          playedAt: updatedAt,
        }); // Team 2 wins
      } else {
        updateTeamStats(teamId, team, score2, score1, 1, {
          value: 'D',
          playedAt: updatedAt,
        }); // Draw
      }
    }
  }

  // Convert teamStatsMap to an array and sort by points (descending)
  const standings: TeamStats[] = Array.from(teamStatsMap.values());

  standings.sort((a, b) => {
    // Sort by points (descending)
    if (a.points !== b.points) {
      return b.points - a.points;
    }

    // Sort by goalsScored (descending) if points are tied
    if (a.goalsScored !== b.goalsScored) {
      return b.goalsScored - a.goalsScored;
    }

    // If points and goalsScored are tied, apply head-to-head logic
    // Here, you can define your own logic based on head-to-head results
    // For simplicity, let's assume a tie when the teams have the same number of wins against each other.
    const aWinsAgainstB = a.team.gamesAsTeam1.filter(
      (game) =>
        (game.score1 > game.score2 && game.score2 === b.team.id) ||
        (game.score1 === b.team.id && game.score2 > game.score1),
    );
    const bWinsAgainstA = b.team.gamesAsTeam1.filter(
      (game) =>
        (game.score1 > game.score2 && game.score2 === a.team.id) ||
        (game.score1 === a.team.id && game.score2 > game.score1),
    );

    if (aWinsAgainstB.length !== bWinsAgainstA.length) {
      return bWinsAgainstA.length - aWinsAgainstB.length;
    }

    // If all criteria are tied, maintain the same order
    return 0;
  });

  // delete gamesAsTeam1 and gamesAsTeam2 from each teamStats object
  for (const teamStats of standings) {
    delete teamStats.team.gamesAsTeam1;
    delete teamStats.team.gamesAsTeam2;
    teamStats.lastFiveGameResults = teamStats.lastFiveGameResults
      .sort((a, b) => b?.playedAt?.getTime() - a?.playedAt?.getTime())
      .slice(0, 5);
  }

  return standings;
}
