/**
 * FeatureTilePointIcon module.
 * @memberOf tiles/features
 */
/**
 * Constructor
 * @class FeatureTilePointIcon
 * @param {Image} icon
 * @constructor
 */
export class FeatureTilePointIcon {
  icon: any;
  width: number;
  height: number;
  xOffset: number;
  yOffset: number;
  constructor(icon: any) {
    this.icon = icon;
    this.width = icon.width;
    this.height = icon.height;
    this.pinIconDefault();
  }
  /**
   * Pin the icon to the point, lower middle on the point
   */
  pinIconDefault(): void {
    this.xOffset = this.width / 2.0;
    this.yOffset = this.height;
  }
  /**
   * Center the icon on the point
   */
  pinIconCenter(): void {
    this.xOffset = this.width / 2.0;
    this.yOffset = this.height / 2.0;
  }
  /**
   * Get the icon
   * @returns {Image} icon
   */
  getIcon(): {image: any, width: number, height: number} {
    return this.icon;
  }
  /**
   * Get the width
   * @return {Number} width
   */
  getWidth(): number {
    return this.width;
  }
  /**
   * Set the display width and adjust the x offset
   * @param {Number} width icon display width
   */
  setWidth(width: number): void {
    this.xOffset = (this.xOffset / this.width) * width;
    this.width = width;
  }
  /**
   * Get the height
   * @return {Number} height
   */
  getHeight(): number {
    return this.height;
  }
  /**
   * Set the display height and adjust the y offset
   * @param {Number} height  icon display height
   */
  setHeight(height: number): void {
    this.yOffset = (this.yOffset / this.height) * height;
    this.height = height;
  }
  /**
   * Get the x offset
   * @return {Number} x offset
   */
  getXOffset(): number {
    return this.xOffset;
  }
  /**
   * Set the x offset
   * @param {Number} xOffset x offset
   */
  setXOffset(xOffset: number): void {
    this.xOffset = xOffset;
  }
  /**
   * Get the y offset
   * @return {Number} y offset
   */
  getYOffset(): number {
    return this.yOffset;
  }
  /**
   * Set the y offset
   * @param {Number} yOffset y offset
   */
  setYOffset(yOffset: number): void {
    this.yOffset = yOffset;
  }
}
