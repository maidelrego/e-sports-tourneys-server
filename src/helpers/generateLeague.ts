import { QueryRunner } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { Game } from '../games/entities/game.entity';

export const generateGroupPhaseGames = async (
  queryRunner: QueryRunner,
  teams: Team[],
  tournamentId: number,
) => {
  const games: Game[] = [];

  // Loop through each team and create matches against other teams
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      const homeGame = new Game();
      homeGame.team1 = teams[i];
      homeGame.team2 = teams[j];
      homeGame.tournamentId = tournamentId;

      const awayGame = new Game();
      awayGame.team1 = teams[j];
      awayGame.team2 = teams[i];
      awayGame.tournamentId = tournamentId;

      games.push(homeGame);
      games.push(awayGame);
    }
  }

  for (const item of games) {
    await queryRunner.manager.save(item);
  }

  return queryRunner;
};
