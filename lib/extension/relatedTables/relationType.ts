/**
 * @module extension/relatedTables
 */

import { ContentsDataType } from '../../core/contents/contentsDataType';

/**
 * Spec supported User-Defined Related Data Tables
 * @class
 */
export class RelationType {
  /**
   * Link features with other features
   * @type {Object}
   */
  public static readonly FEATURES: RelationType = new RelationType('features', ContentsDataType.FEATURES);

  /**
   * Relate sets of tabular text or numeric data
   * @type {Object}
   */
  public static readonly SIMPLE_ATTRIBUTES: RelationType = new RelationType('simple_attributes', ContentsDataType.ATTRIBUTES);

  /**
   * Relate features or attributes to multimedia files such as pictures and videos
   * @type {Object}
   */
  public static readonly MEDIA: RelationType = new RelationType('media', ContentsDataType.ATTRIBUTES);

  /**
   * Attribute type relation
   * @type {Object}
   */
  public static readonly ATTRIBUTES: RelationType = new RelationType('attributes', ContentsDataType.ATTRIBUTES);

  /**
   * Tile type relation
   * @type {Object}
   */
  public static readonly TILES: RelationType = new RelationType('tiles', ContentsDataType.TILES);

  constructor(public name: string, public dataType: string) {}
  /**
   * Get the relation type from the name
   * @param  {string} name name
   * @return {module:extension/relatedTables~RelationType}
   */
  static fromName(name: string): RelationType {
    return RelationType[name.toUpperCase() as keyof typeof RelationType] as RelationType;
  }
}
