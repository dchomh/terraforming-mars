import {ICard} from '../ICard';
import {Player} from '../../Player';
import {Card} from '../Card';
import {Game} from '../../Game';
import {IProjectCard} from '../IProjectCard';
import {Tags} from '../Tags';
import {CardType} from '../CardType';
import {OrOptions} from '../../inputs/OrOptions';
import {SelectCard} from '../../inputs/SelectCard';
import {SelectOption} from '../../inputs/SelectOption';
import {PlayerInput} from '../../PlayerInput';
import {ResourceType} from '../../ResourceType';
import {CardName} from '../../CardName';
import {LogHelper} from '../../LogHelper';
import {Resources} from '../../Resources';
import {MAX_OCEAN_TILES, REDS_RULING_POLICY_COST} from '../../constants';
import {PartyHooks} from '../../turmoil/parties/PartyHooks';
import {PartyName} from '../../turmoil/parties/PartyName';
import {PlaceOceanTile} from '../../deferredActions/PlaceOceanTile';
import {CardRenderer} from '../render/CardRenderer';
import {CardRenderItemSize} from '../render/CardRenderItemSize';

export class LargeConvoy extends Card implements IProjectCard {
  constructor() {
    super({
      cardType: CardType.EVENT,
      name: CardName.LARGE_CONVOY,
      tags: [Tags.EARTH, Tags.SPACE],
      cost: 36,

      metadata: {
        cardNumber: '143',
        renderData: CardRenderer.builder((b) => {
          b.oceans(1).cards(2).br;
          b.plants(5).digit.or(CardRenderItemSize.MEDIUM).animals(4).digit.asterix();
        }),
        description: 'Place an ocean tile and draw 2 cards. Gain 5 Plants or add 4 Animals to ANOTHER card.',
        victoryPoints: 2,
      },
    });
  }

  public canPlay(player: Player, game: Game): boolean {
    const oceansMaxed = game.board.getOceansOnBoard() === MAX_OCEAN_TILES;

    if (PartyHooks.shouldApplyPolicy(game, PartyName.REDS) && !oceansMaxed) {
      return player.canAfford(player.getCardCost(this) + REDS_RULING_POLICY_COST, false, true);
    }

    return true;
  }

  public play(player: Player, game: Game): PlayerInput | undefined {
    player.drawCard(2);

    const animalCards = player.getResourceCards(ResourceType.ANIMAL);

    const gainPlants = function() {
      player.plants += 5;
      LogHelper.logGainStandardResource(player, Resources.PLANTS, 5);
      game.defer(new PlaceOceanTile(player));
      return undefined;
    };

    if (animalCards.length === 0 ) return gainPlants();

    const availableActions: Array<SelectOption | SelectCard<ICard>> = [];

    const gainPlantsOption = new SelectOption('Gain 5 plants', 'Gain plants', gainPlants);
    availableActions.push(gainPlantsOption);

    if (animalCards.length === 1) {
      const targetAnimalCard = animalCards[0];
      availableActions.push(new SelectOption('Add 4 animals to ' + targetAnimalCard.name, 'Add animals', () => {
        player.addResourceTo(targetAnimalCard, 4);
        LogHelper.logAddResource(player, targetAnimalCard, 4);
        game.defer(new PlaceOceanTile(player));
        return undefined;
      }));
    } else {
      availableActions.push(
        new SelectCard(
          'Select card to add 4 animals',
          'Add animals',
          animalCards,
          (foundCards: Array<ICard>) => {
            player.addResourceTo(foundCards[0], 4);
            LogHelper.logAddResource(player, foundCards[0], 4);
            game.defer(new PlaceOceanTile(player));
            return undefined;
          },
        ),
      );
    }

    return new OrOptions(...availableActions);
  }
  public getVictoryPoints() {
    return 2;
  }
}
