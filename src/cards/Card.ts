import {CardMetadata} from './CardMetadata';
import {CardName} from '../CardName';
import {CardType} from './CardType';
import {IAdjacencyBonus} from '../ares/IAdjacencyBonus';
import {ResourceType} from '../ResourceType';
import {Tags} from './Tags';
import {Player} from '../Player';
import {Game} from '../Game';
import {Units} from '../Units';

export interface StaticCardProperties {
  adjacencyBonus?: IAdjacencyBonus;
  cardType: CardType;
  cost?: number;
  initialActionText?: string;
  metadata: CardMetadata;
  name: CardName;
  resourceType?: ResourceType;
  startingMegaCredits?: number;
  tags?: Array<Tags>;
  productionBox?: Units;
}

export const staticCardProperties = new Map<CardName, StaticCardProperties>();

export abstract class Card {
  private readonly properties: StaticCardProperties;
  constructor(properties: StaticCardProperties) {
    let staticInstance = staticCardProperties.get(properties.name);
    if (staticInstance === undefined) {
      if (properties.cardType === CardType.CORPORATION && properties.startingMegaCredits === undefined) {
        throw new Error('must define startingMegaCredits for corporation cards');
      }
      if (properties.cost === undefined) {
        if ([CardType.CORPORATION, CardType.PRELUDE, CardType.STANDARD_ACTION].includes(properties.cardType) === false) {
          throw new Error(`${properties.name} must have a cost property`);
        }
      }
      staticCardProperties.set(properties.name, properties);
      staticInstance = properties;
    }
    this.properties = staticInstance;
  }
  public get adjacencyBonus() {
    return this.properties.adjacencyBonus;
  }
  public get cardType() {
    return this.properties.cardType;
  }
  public get cost() {
    return this.properties.cost === undefined ? 0 : this.properties.cost;
  }
  public get initialActionText() {
    return this.properties.initialActionText;
  }
  public get metadata() {
    return this.properties.metadata;
  }
  public get name() {
    return this.properties.name;
  }
  public get resourceType() {
    return this.properties.resourceType;
  }
  public get startingMegaCredits() {
    return this.properties.startingMegaCredits === undefined ? 0 : this.properties.startingMegaCredits;
  }
  public get tags() {
    return this.properties.tags === undefined ? [] : this.properties.tags;
  }
  public get productionBox(): Units {
    return this.properties.productionBox || Units.EMPTY;
  }
  public canPlay(player: Player, _game?: Game) {
    if (this.properties.metadata.requirements === undefined) {
      return true;
    }
    return this.properties.metadata.requirements.satisfies(player);
  }
}
