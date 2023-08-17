import { QueryRunner } from 'typeorm';
import { Team } from '../teams/entities/team.entity';
import { Game } from '../games/entities/game.entity';

export const generateKnockoutGames = async (
  queryRunner: QueryRunner,
  teams: Team[],
  tournamentId: number,
) => {
  const shuffledTeams = shuffleArray(teams);
  const numberOfTeams = teams.length;
  const firstHalf = shuffledTeams.slice(0, numberOfTeams / 2);
  const secondHalf = shuffledTeams.slice(numberOfTeams / 2, numberOfTeams);
  const numberOfRounds = Math.log2(numberOfTeams);
  let semifinals: Game[] = [];
  let roundOf8: Game[] = [];

  // Step 2: Split the array into two halves

  // this will always be the same because is the final game
  const final: Game = new Game();
  final.nextMatchId = null;
  final.tournamentRoundText = numberOfRounds.toString();
  final.tournamentId = tournamentId;
  const finalSaved = await queryRunner.manager.save(final);

  switch (numberOfRounds) {
    case 2:
      semifinals = await generateSemiFinals(
        numberOfRounds,
        finalSaved,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '1',
      );
      break;
    case 3:
      semifinals = await generateSemiFinals(
        numberOfRounds,
        finalSaved,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '2',
      );

      roundOf8 = await generateRoundOf8(
        numberOfRounds,
        semifinals,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '1',
      );
      break;
    case 4:
      semifinals = await generateSemiFinals(
        numberOfRounds,
        finalSaved,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '3',
      );

      roundOf8 = await generateRoundOf8(
        numberOfRounds,
        semifinals,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '2',
      );

      await generateRoundOf16(
        numberOfRounds,
        roundOf8,
        firstHalf,
        secondHalf,
        queryRunner,
        tournamentId,
        '1',
      );
      break;
    default:
  }

  return queryRunner;
};

// Helper function to shuffle the array
const shuffleArray = (array: any[]): any[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const calculateRef = (iteration: number, ref: number) => {
  if (iteration != 0 && iteration % 2 === 0) {
    ref++;
  }
  return ref;
};

const generateSemiFinals = async (
  numberOfRounds,
  nextMatch,
  firstHalf,
  secondHalf,
  queryRunner,
  tournamentId,
  roundText,
) => {
  const semiFinals: Game[] = [];
  for (let i = 0; i < 2; i++) {
    const game: Game = new Game();
    game.nextMatchId = nextMatch.id;
    game.team1 = numberOfRounds === 2 ? firstHalf[i] : null;
    game.team2 = numberOfRounds === 2 ? secondHalf[i] : null;
    game.tournamentRoundText = roundText;
    game.nextMatchId = nextMatch.id;
    game.nextMatchPlace = i === 0 ? 'home' : 'away'; // Assign 'home' to the first semifinal and 'away' to the second semifinal
    game.tournamentId = tournamentId;
    const savedGame = await queryRunner.manager.save(game);
    semiFinals.push(savedGame);
  }
  return semiFinals;
};

const generateRoundOf8 = async (
  numberOfRounds,
  nextMatch,
  firstHalf,
  secondHalf,
  queryRunner,
  tournamentId,
  roundText,
) => {
  const roundOf8: Game[] = [];
  let roundOf8Ref = 0;
  for (let i = 0; i < 4; i++) {
    const game: Game = new Game();
    roundOf8Ref = calculateRef(i, roundOf8Ref);
    game.nextMatchId = nextMatch[roundOf8Ref].id;
    game.nextMatchPlace = i % 2 === 0 ? 'home' : 'away'; // Assign 'home' to even-index matches and 'away' to odd-index matches
    game.tournamentRoundText = roundText;
    game.team1 = numberOfRounds === 3 ? firstHalf[i] : null;
    game.team2 = numberOfRounds === 3 ? secondHalf[i] : null;
    game.tournamentId = tournamentId;
    const savedGame = await queryRunner.manager.save(game);
    roundOf8.push(savedGame);
  }
  return roundOf8;
};

const generateRoundOf16 = async (
  numberOfRounds,
  nextMatch,
  firstHalf,
  secondHalf,
  queryRunner,
  tournamentId,
  roundText,
) => {
  const roundOf16: Game[] = [];
  let roundOf16Ref = 0;
  for (let i = 0; i < 8; i++) {
    const game: Game = new Game();
    game.team1 = numberOfRounds === 4 ? firstHalf[i] : null;
    game.team2 = numberOfRounds === 4 ? secondHalf[i] : null;
    game.tournamentRoundText = roundText;
    game.tournamentId = tournamentId;
    roundOf16Ref = calculateRef(i, roundOf16Ref);
    game.nextMatchId = nextMatch[roundOf16Ref].id;
    game.nextMatchPlace = i % 2 === 0 ? 'home' : 'away'; // Assign 'home' to even-index matches and 'away' to odd-index matches
    const savedGame = await queryRunner.manager.save(game);
    roundOf16.push(savedGame);
  }
  return roundOf16;
};
