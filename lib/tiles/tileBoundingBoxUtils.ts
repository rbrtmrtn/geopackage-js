import { Projection, ProjectionConstants, Projections } from '@ngageoint/projections-js';
import { TileGrid } from './tileGrid';
import { BoundingBox } from '../boundingBox';
import { TileMatrix } from './matrix/tileMatrix';
import { Point } from '@ngageoint/simple-features-js';
import { GeometryTransform } from '@ngageoint/simple-features-proj-js/dist/lib/GeometryTransform';

/**
 * This module exports utility functions for [slippy map (XYZ)](https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames)
 * tile calculations.
 *
 * @module tiles/tileBoundingBoxUtils
 */

export class TileBoundingBoxUtils {

  /**
   * Web mercator projection
   */
  private static readonly webMercator: Projection = Projections.getWebMercatorProjection();

  /**
   * WGS84 projection
   */
  private static readonly wgs84: Projection = Projections.getWGS84Projection()

  /**
   * Get the overlapping bounding box between the two bounding boxes adjusting
   * the second box to an Anti-Meridian complementary version based upon the
   * max longitude
   *
   * @param boundingBox
   *            bounding box
   * @param boundingBox2
   *            bounding box 2
   * @param allowEmpty
   *            allow empty latitude and/or longitude ranges when determining
   * @param maxLongitude
   *            max longitude of the world for the current bounding box units
   *            overlap
   *
   * @return bounding box
   */
  public static overlap(boundingBox: BoundingBox, boundingBox2: BoundingBox, allowEmpty: boolean = false, maxLongitude: number): BoundingBox {
    let bbox2 = boundingBox2;
    let adjustment = 0.0;
    if (maxLongitude > 0) {
      if (boundingBox.getMinLongitude() > boundingBox2.getMaxLongitude()) {
        adjustment = maxLongitude * 2.0;
      } else if (boundingBox.getMaxLongitude() < boundingBox2.getMinLongitude()) {
        adjustment = maxLongitude * -2.0;
      }
    }
    if (adjustment !== 0.0) {
      bbox2 = boundingBox2.copy();
      bbox2.setMinLongitude(bbox2.getMinLongitude() + adjustment);
      bbox2.setMaxLongitude(bbox2.getMaxLongitude() + adjustment);
    }

    return boundingBox.overlap(bbox2, allowEmpty);
  }

  /**
   * Determine if the point is within the bounding box
   *
   * @param point
   *            bounding box
   * @param boundingBox
   *            bounding box
   * @param maxLongitude
   *            max longitude of the world for the current bounding box units
   *
   * @return true if within the bounding box
   * @since 5.0.0
   */
  public static isPointInBoundingBox(point: Point, boundingBox: BoundingBox, maxLongitude: number = null): boolean {
    const pointBoundingbox = new BoundingBox(point.x, point.y, point.x, point.y);
    const overlap = TileBoundingBoxUtils.overlap(boundingBox, pointBoundingbox, true, maxLongitude);
    return overlap != null;
  }

  /**
   * Get the union bounding box combining the two bounding boxes
   *
   * @param boundingBox
   *            bounding box 1
   * @param boundingBox2
   *            bounding box 2
   * @return bounding box
   */
  public static union(boundingBox: BoundingBox, boundingBox2: BoundingBox): BoundingBox {
    return boundingBox.union(boundingBox2);
  }

  /**
   * Get the X pixel for where the longitude fits into the bounding box
   *
   * @param width
   *            width
   * @param boundingBox
   *            bounding box
   * @param longitude
   *            longitude
   * @return x pixel
   */
  public static getXPixel(width: number, boundingBox: BoundingBox, longitude: number): number {
    const boxWidth = boundingBox.getMaxLongitude() - boundingBox.getMinLongitude();
    const offset = longitude - boundingBox.getMinLongitude();
    const percentage = offset / boxWidth;
    const pixel = (percentage * width);
    return pixel;
  }

  /**
   * Get the longitude from the pixel location, bounding box, and image width
   *
   * @param width
   *            width
   * @param boundingBox
   *            bounding box
   * @param pixel
   *            pixel
   * @return longitude
   */
  public static getLongitudeFromPixel(width: number, boundingBox: BoundingBox, pixel: number): number {
    return TileBoundingBoxUtils.getLongitudeFromPixel(width, boundingBox, boundingBox, pixel);
  }

  /**
   * Get the longitude from the pixel location, bounding box, tile bounding
   * box (when different from bounding box), and image width
   *
   * @param width
   *            width
   * @param boundingBox
   *            bounding box
   * @param tileBoundingBox
   *            tile bounding box
   * @param pixel
   *            pixel
   * @return longitude
   */
  public static getLongitudeFromPixel(width: number, boundingBox: BoundingBox, tileBoundingBox: BoundingBox, pixel: number): number {
    const boxWidth = tileBoundingBox.getMaxLongitude() - tileBoundingBox.getMinLongitude();
    const percentage = pixel / width;
    const offset = percentage * boxWidth;
    const longitude: number = offset + boundingBox.getMinLongitude();
    return longitude;
  }

  /**
   * Get the Y pixel for where the latitude fits into the bounding box
   *
   * @param height
   *            height
   * @param boundingBox
   *            bounding box
   * @param latitude
   *            latitude
   * @return y pixel
   */
  public static getYPixel(height: number, boundingBox: BoundingBox, latitude: number): number {
    const boxHeight = boundingBox.getMaxLatitude() - boundingBox.getMinLatitude();
    const offset = boundingBox.getMaxLatitude() - latitude;
    const percentage = offset / boxHeight;
    const pixel = (percentage * height);
    return pixel;
  }

  /**
   * Get the latitude from the pixel location, bounding box, and image height
   *
   * @param height
   *            height
   * @param boundingBox
   *            bounding box
   * @param pixel
   *            pixel
   * @return latitude
   */
  public static getLatitudeFromPixel(height: number, boundingBox: BoundingBox, pixel: number): number {
    return TileBoundingBoxUtils.getLatitudeFromPixel(height, boundingBox, boundingBox, pixel);
  }

  /**
   * Get the latitude from the pixel location, bounding box, tile bounding box
   * (when different from bounding box), and image height
   *
   * @param height
   *            height
   * @param boundingBox
   *            bounding box
   * @param tileBoundingBox
   *            tile bounding box
   * @param pixel
   *            pixel
   * @return latitude
   * @since 3.2.0
   */
  public static getLatitudeFromPixel(height: number, boundingBox: BoundingBox, tileBoundingBox: BoundingBox, pixel: number): number {
    const boxHeight = tileBoundingBox.getMaxLatitude() - tileBoundingBox.getMinLatitude();
    const percentage = pixel / height;
    const offset = percentage * boxHeight;
    const latitude = boundingBox.getMaxLatitude() - offset;

    return latitude;
  }

  /**
   * Get the tile bounding box from the XYZ tile coordinates and zoom level
   *
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   */
  public static getBoundingBox(x: number, y: number, zoom: number): BoundingBox {

    const tilesPerSide = TileBoundingBoxUtils.tilesPerSide(zoom);
    const tileWidthDegrees = TileBoundingBoxUtils.tileWidthDegrees(tilesPerSide);
    const tileHeightDegrees = TileBoundingBoxUtils.tileHeightDegrees(tilesPerSide);

    const minLon = -180.0 + (x * tileWidthDegrees);
    const maxLon = minLon + tileWidthDegrees;

    const maxLat = 90.0 - (y * tileHeightDegrees);
    const minLat = maxLat - tileHeightDegrees;

    const box = new BoundingBox(minLon, minLat, maxLon, maxLat);

    return box;
  }

  /**
   * Get the Web Mercator tile bounding box from the XYZ tile coordinates and
   * zoom level
   *
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   */
  public static getWebMercatorBoundingBox(x: number, y: number, zoom: number): BoundingBox {
    return TileBoundingBoxUtils.getWebMercatorBoundingBoxFromTileGrid(new TileGrid(x, y, x, y), zoom);
  }

  /**
   * Get the Web Mercator tile bounding box from the XYZ tile grid and zoom
   * level
   *
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   */
  public static getWebMercatorBoundingBoxFromTileGrid(tileGrid: TileGrid, zoom: number): BoundingBox {
    const tileSize = TileBoundingBoxUtils.tileSizeWithZoom(zoom);

    const minLon = (-1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) + (tileGrid.getMinX() * tileSize);
    const maxLon = (-1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) + ((tileGrid.getMaxX() + 1) * tileSize);
    const minLat = ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - ((tileGrid.getMaxY() + 1) * tileSize);
    const maxLat = ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - (tileGrid.getMinY() * tileSize);

    const box = new BoundingBox(minLon, minLat, maxLon, maxLat);

    return box;
  }

  /**
   * Get the Projected tile bounding box from the XYZ tile coordinates and
   * zoom level
   *
   * @param authority
   *            projection authority
   * @param code
   *            projection code
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 1.3.0
   */
  public static getProjectedBoundingBox(authority: string = ProjectionConstants.AUTHORITY_EPSG, code: number, x: number, y: number, zoom: number): BoundingBox {
    let boundingBox = TileBoundingBoxUtils.getWebMercatorBoundingBox(x, y, zoom);
    if (code != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.webMercator, authority, code);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the Projected tile bounding box from the XYZ tile coordinates and
   * zoom level
   *
   * @param projection
   *            projection
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   */
  public static getProjectedBoundingBoxWithProjection(projection: Projection, x: number, y: number, zoom: number): BoundingBox {
    const boundingBox: BoundingBox = TileBoundingBoxUtils.getWebMercatorBoundingBox(x, y, zoom);

    if (projection != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.webMercator, projection);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }


  /**
   * Get the Projected tile bounding box from the XYZ tile tileGrid and zoom
   * level
   *
   * @param authority
   *            projection authority
   * @param code
   *            projection code
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 1.3.0
   */
  public static getProjectedBoundingBoxFromTileGrid(authority: string = ProjectionConstants.AUTHORITY_EPSG, code: number, tileGrid: TileGrid, zoom: number): BoundingBox {
    let boundingBox = TileBoundingBoxUtils.getWebMercatorBoundingBoxFromTileGrid(tileGrid, zoom);
    if (code != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.webMercator, authority, code);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the Projected tile bounding box from the XYZ tile grid and zoom level
   *
   * @param projection
   *            projection
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   */
  public static getProjectedBoundingBoxWithProjectionFromTileGrid(projection: Projection, tileGrid: TileGrid, zoom: number): BoundingBox {
    let boundingBox: BoundingBox = TileBoundingBoxUtils.getWebMercatorBoundingBoxFromTileGrid(tileGrid, zoom);
    if (projection != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.webMercator, projection);
      boundingBox = boundingBox.transform(transform);
    }
    return boundingBox;
  }

  /**
   * Get the WGS84 tile bounding box from the XYZ tile tileGrid and zoom level
   *
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 5.0.0
   */
  public static getBoundingBoxAsWGS84(tileGrid: TileGrid, zoom: number): BoundingBox {
    return TileBoundingBoxUtils.getProjectedBoundingBoxFromTileGrid(ProjectionConstants.AUTHORITY_EPSG, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM, tileGrid, zoom);
  }
  
  /**
   * Get the Projected tile bounding box from the WGS84 XYZ tile coordinates
   * and zoom level
   *
   * @param authority
   *            projection authority (default is EPSG)
   * @param code
   *            projection code
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 6.0.1
   */
  public static getProjectedBoundingBoxFromWGS84(authority: string = ProjectionConstants.AUTHORITY_EPSG, code: number, x: number, y: number, zoom: number): BoundingBox {

    let boundingBox: BoundingBox = TileBoundingBoxUtils.getWGS84BoundingBox(x, y, zoom);

    if (code != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.wgs84, authority, code);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the Projected tile bounding box from the WGS84 XYZ tile coordinates
   * and zoom level
   *
   * @param projection
   *            projection
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 6.0.1
   */
  public static getProjectedBoundingBoxFromWGS84WithProjection(projection: Projection, x: number, y: number, zoom: number): BoundingBox {

    let boundingBox: BoundingBox = TileBoundingBoxUtils.getWGS84BoundingBox(x, y, zoom);

    if (projection != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.wgs84, projection);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the Projected tile bounding box from the WGS84 XYZ tile tileGrid and
   * zoom level
   *
   * @param authority
   *            projection authority (default is EPSG)
   * @param code
   *            projection code
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 6.0.1
   */
  public static getProjectedBoundingBoxFromWGS84FromTileGrid(authority: string = ProjectionConstants.AUTHORITY_EPSG, code: number, tileGrid: TileGrid, zoom: number): BoundingBox {
    let boundingBox: BoundingBox = TileBoundingBoxUtils.getWGS84BoundingBox(tileGrid, zoom);

    if (code != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.wgs84, authority, code);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the Projected tile bounding box from the WGS84 XYZ tile grid and zoom
   * level
   *
   * @param projection
   *            projection
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 6.0.1
   */
  public static getProjectedBoundingBoxFromWGS84WithProjectionFromTileGrid(projection: Projection, tileGrid: TileGrid, zoom: number): BoundingBox {
    let boundingBox: BoundingBox = TileBoundingBoxUtils.getWGS84BoundingBox(tileGrid, zoom);

    if (projection != null) {
      const transform = GeometryTransform.create(TileBoundingBoxUtils.wgs84, projection);
      boundingBox = boundingBox.transform(transform);
    }

    return boundingBox;
  }

  /**
   * Get the tile grid for the location specified as WGS84
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @return tile grid
   * @since 1.1.0
   */
  public static getTileGridFromWGS84(point: Point, zoom: number): TileGrid {
    const projection: Projection = Projections.getWGS84Projection();
    return TileBoundingBoxUtils.getTileGrid(point, zoom, projection);
  }

  /**
   * Get the tile grid for the location specified as the projection
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @param projection
   *            projection
   * @return tile grid
   * @since 1.1.0
   */
  public static getTileGridForPoint(point: Point, zoom: number, projection: Projection): TileGrid {
    const toWebMercator = GeometryTransform.create(projection, Projections.getWebMercatorProjection());
    const webMercatorPoint = toWebMercator.transformPoint(point);
    return TileBoundingBoxUtils.getTileGridFromWebMercator(webMercatorPoint, zoom);
  }

  /**
   * Get the tile grid for the location specified as web mercator
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @return tile grid
   * @since 5.0.0
   */
  public static getTileGridFromWebMercator(point: Point, zoom: number): TileGrid {
    const boundingBox: BoundingBox = new BoundingBox(point.x, point.y, point.x, point.y);
    return TileBoundingBoxUtils.getTileGridFromBoundingBox(boundingBox, zoom);
  }

  /**
   * Get the tile grid that includes the entire tile bounding box
   *
   * @param webMercatorBoundingBox
   *            web mercator bounding box
   * @param zoom
   *            zoom level
   * @return tile grid
   */
  public static getTileGridFromBoundingBox(webMercatorBoundingBox: BoundingBox, zoom: number): TileGrid {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSide(zoom);
    const tileSize = TileBoundingBoxUtils.tileSize(tilesPerSide);
    const minX = Math.round((webMercatorBoundingBox.getMinLongitude() + ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize);
    const tempMaxX = (webMercatorBoundingBox.getMaxLongitude() + ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize;
    let maxX = Math.round(tempMaxX - ProjectionConstants.WEB_MERCATOR_PRECISION);
    maxX = Math.min(maxX, tilesPerSide - 1);

    const minY = Math.round(((webMercatorBoundingBox.getMaxLatitude() - ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) * -1) / tileSize);
    const tempMaxY = ((webMercatorBoundingBox.getMinLatitude() - ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) * -1) / tileSize;
    let maxY = Math.round(tempMaxY - ProjectionConstants.WEB_MERCATOR_PRECISION);
    maxY = Math.min(maxY, tilesPerSide - 1);

    const grid = new TileGrid(minX, minY, maxX, maxY);

    return grid;
  }

  /**
   * Get the bounds of the XYZ tile at the point and zoom level
   *
   * @param projection
   *            point and bounding box projection
   * @param point
   *            point location
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 5.0.0
   */
  public static getTileBounds(projection: Projection, point: Point, zoom: number): BoundingBox {
    const tileGrid: TileGrid = TileBoundingBoxUtils.getTileGridForPoint(point, zoom, projection);
    return TileBoundingBoxUtils.getProjectedBoundingBoxWithProjectionFromTileGrid(projection, tileGrid, zoom);
  }

  /**
   * Get the WGS84 bounds of the XYZ tile at the WGS84 point and zoom level
   *
   * @param point
   *            WGS84 point
   * @param zoom
   *            zoom level
   * @return WGS84 bounding box
   * @since 5.0.0
   */
  public static getTileBoundsForWGS84(point: Point, zoom: number): BoundingBox {
    const projection: Projection = Projections.getWGS84Projection();
    return TileBoundingBoxUtils.getTileBounds(projection, point, zoom);
  }

  /**
   * Get the web mercator bounds of the XYZ tile at the web mercator point and
   * zoom level
   *
   * @param point
   *            web mercator point
   * @param zoom
   *            zoom level
   * @return web mercator bounding box
   * @since 5.0.0
   */
  public static getTileBoundsForWebMercator(point: Point, zoom: number): BoundingBox {
    const projection: Projection = Projections.getWebMercatorProjection();
    return TileBoundingBoxUtils.getTileBounds(projection, point, zoom);
  }

  /**
   * Get the bounds of the WGS84 tile at the point and zoom level
   *
   * @param projection
   *            point and bounding box projection
   * @param point
   *            point location
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 5.0.0
   */
  public static getWGS84TileBounds(projection: Projection, point: Point, zoom: number): BoundingBox {
    const tileGrid: TileGrid = TileBoundingBoxUtils.getTileGridWGS84FromPoint(point, zoom, projection);
    return TileBoundingBoxUtils.getProjectedBoundingBoxFromWGS84WithProjectionFromTileGrid(projection, tileGrid, zoom);
  }

  /**
   * Get the WGS84 bounds of the WGS84 tile at the WGS84 point and zoom level
   *
   * @param point
   *            WGS84 point
   * @param zoom
   *            zoom level
   * @return WGS84 bounding box
   * @since 5.0.0
   */
  public static getWGS84TileBoundsForWGS84(point: Point, zoom: number): BoundingBox {
    const projection: Projection = Projections.getWGS84Projection();
    return TileBoundingBoxUtils.getWGS84TileBounds(projection, point, zoom);
  }

  /**
   * Get the web mercator bounds of the WGS84 tile at the web mercator point
   * and zoom level
   *
   * @param point
   *            web mercator point
   * @param zoom
   *            zoom level
   * @return web mercator bounding box
   * @since 5.0.0
   */
  public static getWGS84TileBoundsForWebMercator(point: Point, zoom: number): BoundingBox {
    const projection = Projections.getWebMercatorProjection();
    return TileBoundingBoxUtils.getWGS84TileBounds(projection, point, zoom);
  }

  /**
   * Convert the bounding box coordinates to a new web mercator bounding box
   *
   * @param boundingBox bounding box
   * @return bounding box
   */
  public static toWebMercator(boundingBox: BoundingBox): BoundingBox {
    const minLatitude = Math.max(boundingBox.getMinLatitude(), ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE);
    const maxLatitude = Math.min(boundingBox.getMaxLatitude(), ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE);
    let lowerLeftPoint = new Point(false, false, boundingBox.getMinLongitude(), minLatitude);
    let upperRightPoint = new Point(false, false, boundingBox.getMaxLongitude(), maxLatitude);
    const toWebMercator = GeometryTransform.create(ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM, ProjectionConstants.EPSG_WEB_MERCATOR);
    lowerLeftPoint = toWebMercator.transformPoint(lowerLeftPoint);
    upperRightPoint = toWebMercator.transformPoint(upperRightPoint);
    const mercatorBox = new BoundingBox(lowerLeftPoint.x, lowerLeftPoint.y, upperRightPoint.x, upperRightPoint.y);
    return mercatorBox;
  }

  /**
   * Get the tile size in length units (meters by default)
   * @param tilesPerSide  tiles per side
   * @param totalLength  total length
   * @return tile size
   * @since 5.0.0
   */
  public static tileSize(tilesPerSide: number, totalLength: number = 2 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH): number {
    return totalLength / tilesPerSide;
  }

  /**
   * Get the zoom level from the tile size in length units (default is meters)
   * @param tileSize tile size in units
   * @param totalLength  total length
   * @return zoom level
   * @since 5.0.0
   */
  public static zoomLevelOfTileSize(tileSize: number, totalLength: number =  2 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH): number {
    const tilesPerSide = totalLength / tileSize;
    const zoom = Math.log(tilesPerSide) / Math.log(2);
    return zoom;
  }

  /**
   * Get the tile size in length units at the zoom level
   *
   * @param zoom
   *            zoom level
   * @param totalLength
   *            total length
   * @return tile size in units
   * @since 5.0.0
   */
  public static tileSizeWithZoom(zoom: number, totalLength: number): number {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSide(zoom);
    const tileSize = TileBoundingBoxUtils.tileSize(tilesPerSide, totalLength);
    return tileSize;
  }

  /**
   * Get the tile width in degrees
   *
   * @param tilesPerSide
   *            tiles per side
   * @return tile width degrees
   */
  public static tileWidthDegrees(tilesPerSide: number): number {
    return 360.0 / tilesPerSide;
  }

  /**
   * Get the tile height in degrees
   * @param tilesPerSide tiles per side
   * @return tile height degrees
   */
  public static tileHeightDegrees(tilesPerSide: number): number {
    return 180.0 / tilesPerSide;
  }

  /**
   * Get the tiles per side, width and height, at the zoom level
   *
   * @param zoom
   *            zoom level
   * @return tiles per side
   */
  public static tilesPerSide(zoom: number): number {
    return Math.round(Math.pow(2, zoom));
  }

  /**
   * Get the tile size in meters at the zoom level
   *
   * @param zoom
   *            zoom level
   *
   * @return tile size in meters
   */
  public static tileSizeWithZoom(zoom: number): number {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSide(zoom);
    const tileSize = TileBoundingBoxUtils.tileSize(tilesPerSide);
    return tileSize;
  }

  /**
   * Get the tolerance distance in meters for the zoom level and pixels length
   *
   * @param zoom
   *            zoom level
   * @param pixels
   *            pixel length
   *
   * @return tolerance distance in meters
   */
  public static toleranceDistanceForLength(zoom: number, pixels: number): number {
    const tileSize = TileBoundingBoxUtils.tileSizeWithZoom(zoom);
    const tolerance = tileSize / pixels;
    return tolerance;
  }

  /**
   * Get the tolerance distance in meters for the zoom level and pixels length
   *
   * @param zoom
   *            zoom level
   * @param pixelWidth
   *            pixel width
   * @param pixelHeight
   *            pixel height
   *
   * @return tolerance distance in meters
   */
  public static toleranceDistance(zoom: number, pixelWidth, pixelHeight): number {
    return TileBoundingBoxUtils.toleranceDistanceForLength(zoom, Math.max(pixelWidth, pixelHeight));
  }

  /**
   * Get the standard y tile location as TMS or a TMS y location as standard
   *
   * @param zoom
   *            zoom level
   * @param y
   *            y coordinate
   * @return opposite tile format y
   */
  public static getYAsOppositeTileFormat(zoom: number, y: number): number {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSide(zoom);
    const oppositeY = tilesPerSide - y - 1;
    return oppositeY;
  }

  /**
   * Get the zoom level from the tiles per side
   *
   * @param tilesPerSide
   *            tiles per side
   * @return zoom level
   */
  public static zoomFromTilesPerSide(tilesPerSide: number): number {
    return Math.round(Math.log(tilesPerSide) / Math.log(2));
  }

  /**
   * Get the tile grid
   *
   * @param totalBox
   *            total bounding box
   * @param matrixWidth
   *            matrix width
   * @param matrixHeight
   *            matrix height
   * @param boundingBox
   *            bounding box
   * @return tile grid
   */
  public static getTileGrid(totalBox: BoundingBox, matrixWidth: number, matrixHeight: number, boundingBox: BoundingBox): TileGrid {

    let minColumn = TileBoundingBoxUtils.getTileColumn(totalBox, matrixWidth, boundingBox.getMinLongitude());
    let maxColumn = TileBoundingBoxUtils.getTileColumn(totalBox, matrixWidth, boundingBox.getMaxLongitude());

    if (minColumn < matrixWidth && maxColumn >= 0) {
      if (minColumn < 0) {
        minColumn = 0;
      }
      if (maxColumn >= matrixWidth) {
        maxColumn = matrixWidth - 1;
      }
    }

    let maxRow = TileBoundingBoxUtils.getTileRow(totalBox, matrixHeight, boundingBox.getMinLatitude());
    let minRow = TileBoundingBoxUtils.getTileRow(totalBox, matrixHeight, boundingBox.getMaxLatitude());

    if (minRow < matrixHeight && maxRow >= 0) {
      if (minRow < 0) {
        minRow = 0;
      }
      if (maxRow >= matrixHeight) {
        maxRow = matrixHeight - 1;
      }
    }

    const tileGrid: TileGrid = new TileGrid(minColumn, minRow, maxColumn, maxRow);

    return tileGrid;
  }

  /**
   * Get the tile column of the longitude in constant units
   *
   * @param totalBox
   *            total bounding box
   * @param matrixWidth
   *            matrix width
   * @param longitude
   *            in constant units
   * @return tile column if in the range, -1 if before,
   *         {@link TileMatrix#getMatrixWidth()} if after
   */
  public static getTileColumn(totalBox: BoundingBox, matrixWidth: number, longitude: number): number {
    const minX = totalBox.getMinLongitude();
    const maxX = totalBox.getMaxLongitude();
    let tileId;
    if (longitude < minX) {
      tileId = -1;
    } else if (longitude >= maxX) {
      tileId = matrixWidth;
    } else {
      const matrixWidthMeters = totalBox.getMaxLongitude() - totalBox.getMinLongitude();
      const tileWidth = matrixWidthMeters / matrixWidth;
      tileId = Math.round((longitude - minX) / tileWidth);
    }
    return tileId;
  }

  /**
   * Get the tile row of the latitude in constant units
   *
   * @param totalBox
   *            total bounding box
   * @param matrixHeight
   *            matrix height
   * @param latitude
   *            in constant units
   * @return tile row if in the range, -1 if before,
   *         {@link TileMatrix#getMatrixHeight()} if after
   */
  public static getTileRow(totalBox: BoundingBox, matrixHeight: number, latitude: number): number {
    const minY = totalBox.getMinLatitude();
    const maxY = totalBox.getMaxLatitude();

    let tileId;
    if (latitude <= minY) {
      tileId = matrixHeight;
    } else if (latitude > maxY) {
      tileId = -1;
    } else {
      const matrixHeightMeters = totalBox.getMaxLatitude() - totalBox.getMinLatitude();
      const tileHeight = matrixHeightMeters / matrixHeight;
      tileId = Math.round((maxY - latitude) / tileHeight);
    }

    return tileId;
  }

  /**
   * Get the bounding box of the tile column and row in the tile matrix using
   * the total bounding box with constant units
   *
   * @param totalBox
   *            total bounding box
   * @param tileMatrix
   *            tile matrix
   * @param tileColumn
   *            tile column
   * @param tileRow
   *            tile row
   * @return bounding box
   */
  public static getBoundingBoxForTileMatrix(totalBox: BoundingBox, tileMatrix: TileMatrix, tileColumn: number, tileRow: number): BoundingBox {
    return TileBoundingBoxUtils.getBoundingBoxForTileGrid(totalBox, tileMatrix.getMatrixWidth(),tileMatrix.getMatrixHeight(), tileColumn, tileRow);
  }

  /**
   * Get the bounding box of the tile column and row in the tile width and
   * height bounds using the total bounding box with constant units
   *
   * @param totalBox
   *            total bounding box
   * @param tileMatrixWidth
   *            matrix width
   * @param tileMatrixHeight
   *            matrix height
   * @param tileColumn
   *            tile column
   * @param tileRow
   *            tile row
   * @return bounding box
   */
  public static getBoundingBox(totalBox: BoundingBox, tileMatrixWidth: number, tileMatrixHeight: number, tileColumn: number, tileRow: number): BoundingBox {
    const tileGrid: TileGrid = new TileGrid(tileColumn, tileRow, tileColumn, tileRow);
    return TileBoundingBoxUtils.getBoundingBoxForTileGrid(totalBox, tileMatrixWidth, tileMatrixHeight, tileGrid);
  }

  /**
   * Get the bounding box of the tile grid in the tile matrix using the total
   * bounding box with constant units
   *
   * @param totalBox
   *            total bounding box
   * @param tileMatrix
   *            tile matrix
   * @param tileGrid
   *            tile grid
   * @return bounding box
   * @since 1.2.0
   */
  public static getBoundingBoxForTileMatrixAndTileGrid(totalBox: BoundingBox, tileMatrix: TileMatrix, tileGrid: TileGrid): BoundingBox {
    return TileBoundingBoxUtils.getBoundingBoxForTileGrid(totalBox, tileMatrix.getMatrixWidth(), tileMatrix.getMatrixHeight(), tileGrid);
  }

  /**
   * Get the bounding box of the tile grid in the tile width and height bounds
   * using the total bounding box with constant units
   *
   * @param totalBox
   *            total bounding box
   * @param tileMatrixWidth
   *            matrix width
   * @param tileMatrixHeight
   *            matrix height
   * @param tileGrid
   *            tile grid
   * @return bounding box
   * @since 1.2.0
   */
  public static getBoundingBoxForTileGrid(totalBox: BoundingBox, tileMatrixWidth: number, tileMatrixHeight: number, tileGrid: TileGrid): BoundingBox {
    // Get the tile width
    const matrixMinX = totalBox.getMinLongitude();
    const matrixMaxX = totalBox.getMaxLongitude();
    const matrixWidth = matrixMaxX - matrixMinX;
    const tileWidth = matrixWidth / tileMatrixWidth;

    // Find the longitude range
    const minLon = matrixMinX + (tileWidth * tileGrid.getMinX());
    const maxLon = matrixMinX + (tileWidth * (tileGrid.getMaxX() + 1));

    // Get the tile height
    const matrixMinY = totalBox.getMinLatitude();
    const matrixMaxY = totalBox.getMaxLatitude();
    const matrixHeight = matrixMaxY - matrixMinY;
    const tileHeight = matrixHeight / tileMatrixHeight;

    // Find the latitude range
    const maxLat = matrixMaxY - (tileHeight * tileGrid.getMinY());
    const minLat = matrixMaxY - (tileHeight * (tileGrid.getMaxY() + 1));

    constboundingBox: BoundingBox = new BoundingBox(minLon, minLat, maxLon, maxLat);

    return boundingBox;
  }

  /**
   * Get the zoom level of where the web mercator bounding box fits into the
   * complete world
   *
   * @param webMercatorBoundingBox
   *            web mercator bounding box
   * @return zoom level
   */
  public static getZoomLevel(webMercatorBoundingBox: BoundingBox): number {
    const worldLength = ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH * 2;

    let longitudeDistance = webMercatorBoundingBox.getMaxLongitude() - webMercatorBoundingBox.getMinLongitude();
    let latitudeDistance = webMercatorBoundingBox.getMaxLatitude() - webMercatorBoundingBox.getMinLatitude();

    if (longitudeDistance <= 0) {
      longitudeDistance = Number.MIN_VALUE;
    }
    if (latitudeDistance <= 0) {
      latitudeDistance = Number.MIN_VALUE;
    }

    const widthTiles = Math.round(worldLength / longitudeDistance);
    const heightTiles = Math.round(worldLength / latitudeDistance);

    let tilesPerSide = Math.min(widthTiles, heightTiles);
    tilesPerSide = Math.max(tilesPerSide, 1);

    const zoom: number = TileBoundingBoxUtils.zoomFromTilesPerSide(tilesPerSide);

    return zoom;
  }

  /**
   * Get the pixel x size for the bounding box with matrix width and tile
   * width
   *
   * @param webMercatorBoundingBox
   *            web mercator bounding box
   * @param matrixWidth
   *            matrix width
   * @param tileWidth
   *            tile width
   * @return pixel x size
   */
  public static getPixelXSize(webMercatorBoundingBox: BoundingBox, matrixWidth: number, tileWidth: number): number {
    const pixelXSize = (webMercatorBoundingBox.getMaxLongitude() - webMercatorBoundingBox.getMinLongitude()) / matrixWidth / tileWidth;
    return pixelXSize;
  }

  /**
   * Get the pixel y size for the bounding box with matrix height and tile
   * height
   *
   * @param webMercatorBoundingBox
   *            web mercator bounding box
   * @param matrixHeight
   *            matrix height
   * @param tileHeight
   *            tile height
   * @return pixel y size
   */
  public static getPixelYSize(webMercatorBoundingBox: BoundingBox, matrixHeight: number, tileHeight: number): number {
    const pixelYSize = (webMercatorBoundingBox.getMaxLatitude() - webMercatorBoundingBox.getMinLatitude()) / matrixHeight / tileHeight;
    return pixelYSize;
  }

  /**
   * Bound the web mercator bounding box within the limits
   *
   * @param boundingBox
   *            web mercator bounding box
   * @return bounding box
   * @since 3.5.0
   */
  public static boundWebMercatorBoundingBox(boundingBox: BoundingBox): BoundingBox {
    const bounded = boundingBox.copy();
    bounded.setMinLongitude(Math.max(bounded.getMinLongitude(),
      -1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
    bounded.setMaxLongitude(Math.min(bounded.getMaxLongitude(),
      ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
    bounded.setMinLatitude(Math.max(bounded.getMinLatitude(),
      -1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
    bounded.setMaxLatitude(Math.min(bounded.getMaxLatitude(),
      ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH));
    return bounded;
  }

  /**
   * Bound the upper and lower bounds of the WGS84 bounding box with web
   * mercator limits
   *
   * @param boundingBox
   *            wgs84 bounding box
   * @return bounding box
   */
  public static boundWgs84BoundingBoxWithWebMercatorLimits(boundingBox: BoundingBox): BoundingBox {
    return TileBoundingBoxUtils.boundDegreesBoundingBoxWithWebMercatorLimits(boundingBox);
  }

  /**
   * Bound the upper and lower bounds of the degrees bounding box with web
   * mercator limits
   *
   * @param boundingBox
   *            degrees bounding box
   * @return bounding box
   */
  public static boundDegreesBoundingBoxWithWebMercatorLimits(boundingBox: BoundingBox): BoundingBox {
    const bounded = boundingBox.copy();
    if (bounded.getMinLatitude() < ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE) {
      bounded.setMinLatitude(ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE);
    }
    if (bounded.getMaxLatitude() < ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE) {
      bounded.setMaxLatitude(ProjectionConstants.WEB_MERCATOR_MIN_LAT_RANGE);
    }
    if (bounded.getMaxLatitude() > ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE) {
      bounded.setMaxLatitude(ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE);
    }
    if (bounded.getMinLatitude() > ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE) {
      bounded.setMinLatitude(ProjectionConstants.WEB_MERCATOR_MAX_LAT_RANGE);
    }
    return bounded;
  }

  /**
   * Get the WGS84 tile grid for the point specified as WGS84
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @return tile grid
   * @since 5.0.0
   */
  public static getTileGridWGS84ForWGS84Point(point: Point, zoom: number): TileGrid {
    const boundingBox: BoundingBox = new BoundingBox(point.x, point.y, point.x, point.y);
    return TileBoundingBoxUtils.getTileGridWGS84(boundingBox, zoom);
  }

  /**
   * Get the WGS84 tile grid for the point specified as the projection
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @param projection
   *            projection
   * @return tile grid
   * @since 5.0.0
   */
  public static getTileGridWGS84ForPoint(point: Point, zoom: number, projection: Projection): TileGrid {
    const toWGS84 = GeometryTransform.create(projection, ProjectionConstants.EPSG_WORLD_GEODETIC_SYSTEM);
    const wgs84Point = toWGS84.transformPoint(point);
    return TileBoundingBoxUtils.getTileGridWGS84FromWGS84(wgs84Point, zoom);
  }

  /**
   * Get the WGS84 tile grid for the point specified as web mercator
   *
   * @param point
   *            point
   * @param zoom
   *            zoom level
   * @return tile grid
   * @since 5.0.0
   */
  public static TileGrid getTileGridWGS84FromWebMercator(point: Point,
    zoom: number) {
    projection: Projection = ProjectionFactory
      .getProjection(ProjectionConstants.EPSG_WEB_MERCATOR);
    return getTileGridWGS84(point, zoom, projection);
  }

  /**
   * Get the WGS84 tile grid that includes the entire tile bounding box
   *
   * @param boundingBox
   *            wgs84 bounding box
   * @param zoom
   *            zoom level
   *
   * @return tile grid
   * @since 1.2.0
   */
  public static TileGrid getTileGridWGS84(boundingBox: BoundingBox,
    zoom: number) {

    int tilesPerLat = tilesPerWGS84LatSide(zoom);
    int tilesPerLon = tilesPerWGS84LonSide(zoom);

    double tileSizeLat = tileSizeLatPerWGS84Side(tilesPerLat);
    double tileSizeLon = tileSizeLonPerWGS84Side(tilesPerLon);

    int minX = (int) ((boundingBox.getMinLongitude()
        + ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH)
      / tileSizeLon);
    double tempMaxX = (boundingBox.getMaxLongitude()
      + ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tileSizeLon;
    int maxX = (int) tempMaxX;
    if (tempMaxX % 1 == 0) {
      maxX--;
    }
    maxX = Math.min(maxX, tilesPerLon - 1);

    int minY = (int) (((boundingBox.getMaxLatitude()
        - ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT) * -1)
      / tileSizeLat);
    double tempMaxY = ((boundingBox.getMinLatitude()
        - ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT) * -1)
      / tileSizeLat;
    int maxY = (int) tempMaxY;
    if (tempMaxY % 1 == 0) {
      maxY--;
    }
    maxY = Math.min(maxY, tilesPerLat - 1);

    TileGrid grid = new TileGrid(minX, minY, maxX, maxY);

    return grid;
  }

  /**
   * Get the WGS84 tile bounding box from the WGS84 XYZ tile coordinates and
   * zoom level
   *
   * @param x
   *            x coordinate
   * @param y
   *            y coordinate
   * @param zoom
   *            zoom level
   * @return bounding box
   * @since 6.0.1
   */
  public static BoundingBox getWGS84BoundingBox(x: number, y: number, zoom: number) {
    return getWGS84BoundingBox(new TileGrid(x, y, x, y), zoom);
  }

  /**
   * Get the WGS84 tile bounding box from the WGS84 tile grid and zoom level
   *
   * @param tileGrid
   *            tile grid
   * @param zoom
   *            zoom
   *
   * @return wgs84 bounding box
   * @since 1.2.0
   */
  public static BoundingBox getWGS84BoundingBox(tileGrid: TileGrid,
    zoom: number) {

    int tilesPerLat = tilesPerWGS84LatSide(zoom);
    int tilesPerLon = tilesPerWGS84LonSide(zoom);

    double tileSizeLat = tileSizeLatPerWGS84Side(tilesPerLat);
    double tileSizeLon = tileSizeLonPerWGS84Side(tilesPerLon);

    double minLon = (-1 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH)
      + (tileGrid.getMinX() * tileSizeLon);
    double maxLon = (-1 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH)
      + ((tileGrid.getMaxX() + 1) * tileSizeLon);
    double minLat = ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT
      - ((tileGrid.getMaxY() + 1) * tileSizeLat);
    double maxLat = ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT
      - (tileGrid.getMinY() * tileSizeLat);

    BoundingBox box = new BoundingBox(minLon, minLat, maxLon, maxLat);

    return box;
  }

  /**
   * Get the tiles per latitude side at the zoom level
   *
   * @param zoom
   *            zoom level
   *
   * @return tiles per latitude side
   * @since 1.2.0
   */
  public static int tilesPerWGS84LatSide(zoom: number) {
    return tilesPerSide(zoom);
  }

  /**
   * Get the tiles per longitude side at the zoom level
   *
   * @param zoom
   *            zoom level
   *
   * @return tiles per longitude side
   * @since 1.2.0
   */
  public static int tilesPerWGS84LonSide(zoom: number) {
    return 2 * tilesPerSide(zoom);
  }

  /**
   * Get the tile height in degrees latitude
   *
   * @param tilesPerLat
   *            tiles per latitude side
   *
   * @return degrees
   * @since 1.2.0
   */
  public static double tileSizeLatPerWGS84Side(int tilesPerLat) {
    return (2 * ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT)
      / tilesPerLat;
  }

  /**
   * Get the tile height in degrees longitude
   *
   * @param tilesPerLon
   *            tiles per longitude side
   *
   * @return degrees
   * @since 1.2.0
   */
  public static double tileSizeLonPerWGS84Side(int tilesPerLon) {
    return (2 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH)
      / tilesPerLon;
  }

  /**
   * Get the tile grid starting from the tile grid and current zoom to the new
   * zoom level
   *
   * @param tileGrid
   *            current tile grid
   * @param fromZoom
   *            current zoom level
   * @param toZoom
   *            new zoom level
   * @return tile grid at new zoom level
   * @since 2.0.1
   */
  public static tileGrid: TileGridZoom(tileGrid: TileGrid, long fromZoom,
    long toZoom) {

    TileGrid newTileGrid = null;

    zoom: numberChange = toZoom - fromZoom;
    if (zoomChange > 0) {
      newTileGrid = tileGridZoomIncrease(tileGrid, zoomChange);
    } else if (zoomChange < 0) {
      zoomChange = Math.abs(zoomChange);
      newTileGrid = tileGridZoomDecrease(tileGrid, zoomChange);
    } else {
      newTileGrid = tileGrid;
    }

    return newTileGrid;
  }

  /**
   * Get the tile grid starting from the tile grid and zooming in / increasing
   * the number of levels
   *
   * @param tileGrid
   *            current tile grid
   * @param zoomLevels
   *            number of zoom levels to increase by
   * @return tile grid at new zoom level
   * @since 2.0.1
   */
  public static tileGrid: TileGridZoomIncrease(tileGrid: TileGrid,
    zoom: numberLevels) {
    long minX = tileGridMinZoomIncrease(tileGrid.getMinX(), zoomLevels);
    long maxX = tileGridMaxZoomIncrease(tileGrid.getMaxX(), zoomLevels);
    long minY = tileGridMinZoomIncrease(tileGrid.getMinY(), zoomLevels);
    long maxY = tileGridMaxZoomIncrease(tileGrid.getMaxY(), zoomLevels);
    TileGrid newTileGrid = new TileGrid(minX, minY, maxX, maxY);
    return newTileGrid;
  }

  /**
   * Get the tile grid starting from the tile grid and zooming out /
   * decreasing the number of levels
   *
   * @param tileGrid
   *            current tile grid
   * @param zoomLevels
   *            number of zoom levels to decrease by
   * @return tile grid at new zoom level
   * @since 2.0.1
   */
  public static tileGrid: TileGridZoomDecrease(tileGrid: TileGrid,
    zoom: numberLevels) {
    long minX = tileGridMinZoomDecrease(tileGrid.getMinX(), zoomLevels);
    long maxX = tileGridMaxZoomDecrease(tileGrid.getMaxX(), zoomLevels);
    long minY = tileGridMinZoomDecrease(tileGrid.getMinY(), zoomLevels);
    long maxY = tileGridMaxZoomDecrease(tileGrid.getMaxY(), zoomLevels);
    TileGrid newTileGrid = new TileGrid(minX, minY, maxX, maxY);
    return newTileGrid;
  }

  /**
   * Get the new tile grid min value starting from the tile grid min and
   * zooming in / increasing the number of levels
   *
   * @param min
   *            tile grid min value
   * @param zoomLevels
   *            number of zoom levels to increase by
   * @return tile grid min value at new zoom level
   * @since 2.0.1
   */
  public static long tileGridMinZoomIncrease(long min, zoom: numberLevels) {
    return min * (long) Math.pow(2, zoomLevels);
  }

  /**
   * Get the new tile grid max value starting from the tile grid max and
   * zooming in / increasing the number of levels
   *
   * @param max
   *            tile grid max value
   * @param zoomLevels
   *            number of zoom levels to increase by
   * @return tile grid max value at new zoom level
   * @since 2.0.1
   */
  public static long tileGridMaxZoomIncrease(long max, zoom: numberLevels) {
    return (max + 1) * (long) Math.pow(2, zoomLevels) - 1;
  }

  /**
   * Get the new tile grid min value starting from the tile grid min and
   * zooming out / decreasing the number of levels
   *
   * @param min
   *            tile grid min value
   * @param zoomLevels
   *            number of zoom levels to decrease by
   * @return tile grid min value at new zoom level
   * @since 2.0.1
   */
  public static long tileGridMinZoomDecrease(long min, zoom: numberLevels) {
    return (long) Math.floor(min / Math.pow(2, zoomLevels));
  }

  /**
   * Get the new tile grid max value starting from the tile grid max and
   * zooming out / decreasing the number of levels
   *
   * @param max
   *            tile grid max value
   * @param zoomLevels
   *            number of zoom levels to decrease by
   * @return tile grid max value at new zoom level
   * @since 2.0.1
   */
  public static long tileGridMaxZoomDecrease(long max, zoom: numberLevels) {
    return (long) Math.ceil((max + 1) / Math.pow(2, zoomLevels) - 1);
  }



/**
   * Calculate the bounds in tile coordinates that covers the given bounding box
   * at the given zoom level.  The result object contains the keys `minX`, `maxX`,
   * `minY`, and `maxY`, which are tile column and row values in the XYZ tile
   * scheme.
   *
   * @param {BoundingBox} webMercatorBoundingBox bounds in EPSG:3857 coordinates (meters)
   * @param {number} zoom the integral zoom level
   * @returns {{minX: number, maxX: number, minY: number, maxY: number}} bounds in tile column and row coordinates
   */
  static webMercatorTileBox(webMercatorBoundingBox: BoundingBox, zoom: number): BoundingBox {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSideWithZoom(zoom);
    const tileSize = TileBoundingBoxUtils.tileSizeWithTilesPerSide(tilesPerSide);

    const minLonClip = Math.max(
      -ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH,
      webMercatorBoundingBox.minLongitude,
    );
    const maxLonClip = Math.min(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.maxLongitude);
    const minLatClip = Math.max(-ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.minLatitude);
    const maxLatClip = Math.min(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, webMercatorBoundingBox.maxLatitude);

    const minX = Math.floor((minLonClip + ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize);
    const maxX = Math.max(
      0,
      Math.ceil((maxLonClip + ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize) - 1,
    );
    const minY = Math.floor((ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - maxLatClip) / tileSize);
    const maxY = Math.max(
      0,
      Math.ceil((ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - minLatClip) / tileSize) - 1,
    );
    return new BoundingBox(minX, maxX, minY, maxY);
  }

  /**
   * Calculate the bounds in tile coordinates that covers the given bounding box
   * at the given zoom level.  The result object contains the keys `minX`, `maxX`,
   * `minY`, and `maxY`, which are tile column and row values in the XYZ tile
   * scheme.
   *
   * @param {BoundingBox} wgs84BoundingBox bounds in EPSG:4326 coordinates (meters)
   * @param {number} zoom the integral zoom level
   * @returns {{minX: number, maxX: number, minY: number, maxY: number}} bounds in tile column and row coordinates
   */
  static wgs84TileBox(wgs84BoundingBox: BoundingBox, zoom: number): BoundingBox {
    const tilesPerSideLat = TileBoundingBoxUtils.tilesPerWGS84LatSide(zoom);
    const tilesPerSideLon = TileBoundingBoxUtils.tilesPerWGS84LonSide(zoom);
    const tileSizeLat = TileBoundingBoxUtils.tileSizeLatPerWGS84Side(tilesPerSideLat);
    const tileSizeLon = TileBoundingBoxUtils.tileSizeLonPerWGS84Side(tilesPerSideLon);
    const minLonClip = Math.max(-ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, wgs84BoundingBox.minLongitude);
    const maxLonClip = Math.min(ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH, wgs84BoundingBox.maxLongitude);
    const minLatClip = Math.max(-ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT, wgs84BoundingBox.minLatitude);
    const maxLatClip = Math.min(ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT, wgs84BoundingBox.maxLatitude);
    const minX = Math.floor((minLonClip + ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tileSizeLon);
    const maxX = Math.max(
      0,
      Math.ceil((maxLonClip + ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tileSizeLon) - 1,
    );
    const minY = Math.floor((ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - maxLatClip) / tileSizeLat);
    const maxY = Math.max(
      0,
      Math.ceil((ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - minLatClip) / tileSizeLat) - 1,
    );
    return new BoundingBox(minX, maxX, minY, maxY);
  }

  static determinePositionAndScale(
    geoPackageTileBoundingBox: BoundingBox,
    tileHeight: number,
    tileWidth: number,
    totalBoundingBox: BoundingBox,
    totalHeight: number,
    totalWidth: number,
  ): {
    yPositionInFinalTileStart: number;
    xPositionInFinalTileStart: number;
    dx: number;
    dy: number;
    sx: number;
    sy: number;
    dWidth: number;
    dHeight: number;
    sWidth: number;
    sHeight: number;
  } {
    const p = {} as {
      yPositionInFinalTileStart: number;
      xPositionInFinalTileStart: number;
      dx: number;
      dy: number;
      sx: number;
      sy: number;
      dWidth: number;
      dHeight: number;
      sWidth: number;
      sHeight: number;
    };

    const finalTileWidth = totalBoundingBox.maxLongitude - totalBoundingBox.minLongitude;
    const xoffsetMin = geoPackageTileBoundingBox.minLongitude - totalBoundingBox.minLongitude;
    const xpercentageMin = xoffsetMin / finalTileWidth;

    const finalTileHeight = totalBoundingBox.maxLatitude - totalBoundingBox.minLatitude;
    const yoffsetMax = totalBoundingBox.maxLatitude - geoPackageTileBoundingBox.maxLatitude;
    const ypercentageMax = yoffsetMax / finalTileHeight;

    const finalTilePixelsPerUnitWidth = totalWidth / finalTileWidth;
    const widthInFinalTileUnits =
      (geoPackageTileBoundingBox.maxLongitude - geoPackageTileBoundingBox.minLongitude) * finalTilePixelsPerUnitWidth;
    const finalTilePixelsPerUnitHeight = totalHeight / finalTileHeight;
    const heightInFinalTileUnits =
      (geoPackageTileBoundingBox.maxLatitude - geoPackageTileBoundingBox.minLatitude) * finalTilePixelsPerUnitHeight;

    p.yPositionInFinalTileStart = ypercentageMax * totalHeight;
    p.xPositionInFinalTileStart = xpercentageMin * totalWidth;
    p.dx = p.xPositionInFinalTileStart;
    p.dy = p.yPositionInFinalTileStart;
    p.sx = 0;
    p.sy = 0;
    p.dWidth = widthInFinalTileUnits;
    p.dHeight = heightInFinalTileUnits;
    p.sWidth = tileWidth;
    p.sHeight = tileHeight;

    return p;
  }

  /**
   * Calculate the bounds in EPSG:3857 coordinates of the tile at the given XYZ
   * coordinates coordinates and zoom level.
   *
   *  @param {number} x tile column
   *  @param {number} y tile row
   *  @param {number} zoom zoom level
   *  @param {*} [options] options object
   *  @return {BoundingBox} a bounding box in EPSG:3857 meters
   */
  static getWebMercatorBoundingBoxFromXYZ(
    x: number,
    y: number,
    zoom: number,
    options?: { tileSize?: number; buffer?: number },
  ): BoundingBox {
    const tilesPerSide = TileBoundingBoxUtils.tilesPerSideWithZoom(zoom);
    const tileSize = TileBoundingBoxUtils.tileSizeWithTilesPerSide(tilesPerSide);

    // correct the x number to be between 0 and tilesPerSide
    while (x < 0) {
      x = x + tilesPerSide;
    }
    while (x >= tilesPerSide) {
      x = x - tilesPerSide;
    }

    let meterBuffer = 0;
    if (options && options.buffer && options.tileSize) {
      const pixelBuffer = options.buffer;
      const metersPerPixel = tileSize / options.tileSize;
      meterBuffer = metersPerPixel * pixelBuffer;
    }

    let minLon = -1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH + x * tileSize - meterBuffer;
    let maxLon = -1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH + (x + 1) * tileSize + meterBuffer;
    let minLat = ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - (y + 1) * tileSize - meterBuffer;
    let maxLat = ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH - y * tileSize + meterBuffer;

    minLon = Math.max(-1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, minLon);
    maxLon = Math.min(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, maxLon);
    minLat = Math.max(-1 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, minLat);
    maxLat = Math.min(ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH, maxLat);

    return new BoundingBox(minLon, maxLon, minLat, maxLat);
  }

  static getWGS84BoundingBoxFromXYZ(x: number, y: number, zoom: number): BoundingBox {
    const tilesPerLat = TileBoundingBoxUtils.tilesPerWGS84LatSide(zoom);
    const tilesPerLon = TileBoundingBoxUtils.tilesPerWGS84LonSide(zoom);
    const tileSizeLat = TileBoundingBoxUtils.tileSizeLatPerWGS84Side(tilesPerLat);
    const tileSizeLon = TileBoundingBoxUtils.tileSizeLonPerWGS84Side(tilesPerLon);
    const minLon = -1 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH + x * tileSizeLon;
    const maxLon = -1 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH + (x + 1) * tileSizeLon;
    const minLat = ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - (y + 1) * tileSizeLat;
    const maxLat = ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT - y * tileSizeLat;
    return new BoundingBox(minLon, maxLon, minLat, maxLat);
  }

  /**
   *  Get the tile size in meters
   *
   *  @param tilesPerSide tiles per side
   *
   *  @return meters
   */
  static tileSizeWithTilesPerSide(tilesPerSide: number): number {
    return (2 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tilesPerSide;
  }

  static intersects(boundingBoxA: BoundingBox, boundingBoxB: BoundingBox): boolean {
    return TileBoundingBoxUtils.intersection(boundingBoxA, boundingBoxB) != null;
  }

  static intersection(boundingBoxA: BoundingBox, boundingBoxB: BoundingBox): BoundingBox {
    const x1 = Math.max(boundingBoxA.minLongitude, boundingBoxB.minLongitude);
    const y1 = Math.max(boundingBoxA.minLatitude, boundingBoxB.minLatitude);
    const x2 = Math.min(boundingBoxA.maxLongitude, boundingBoxB.maxLongitude);
    const y2 = Math.min(boundingBoxA.maxLatitude, boundingBoxB.maxLatitude);
    if (x1 > x2 || y1 > y2) {
      return null;
    }
    return new BoundingBox(x1, x2, y1, y2);
  }

  /**
   *  Get the tiles per side, width and height, at the zoom level
   *
   *  @param zoom zoom level
   *
   *  @return tiles per side
   */
  static tilesPerSideWithZoom(zoom: number): number {
    return 1 << zoom;
  }

  /**
   * Get the tiles per latitude side at the zoom level
   * @param zoom zoom level
   * @return tiles per latitude side
   * @since 1.2.0
   */
  static tilesPerWGS84LatSide(zoom: number): number {
    return TileBoundingBoxUtils.tilesPerSide(zoom);
  }

  /**
   * Get the tiles per longitude side at the zoom level
   * @param zoom zoom level
   * @return tiles per longitude side
   * @since 1.2.0
   */
  static tilesPerWGS84LonSide(zoom: number): number {
    return 2 * TileBoundingBoxUtils.tilesPerSide(zoom);
  }

  /**
   * Get the tile height in degrees latitude
   *
   * @param tilesPerLat
   *            tiles per latitude side
   *
   * @return degrees
   * @since 1.2.0
   */
  static tileSizeLatPerWGS84Side(tilesPerLat: number): number {
    return (2 * ProjectionConstants.WGS84_HALF_WORLD_LAT_HEIGHT) / tilesPerLat;
  }

  /**
   * Get the tile height in degrees longitude
   *
   * @param tilesPerLon
   *            tiles per longitude side
   *
   * @return degrees
   * @since 1.2.0
   */
  static tileSizeLonPerWGS84Side(tilesPerLon: number): number {
    return (2 * ProjectionConstants.WGS84_HALF_WORLD_LON_WIDTH) / tilesPerLon;
  }

  /**
   *  Get the tile grid
   *  @param {BoundingBox} totalBoundingBox    web mercator total bounding box
   *  @param {Number} matrixWidth            matrix width
   *  @param {Number} matrixHeight           matrix height
   *  @param {BoundingBox} boundingBox            bounding box
   *
   *  @return tile grid
   */
  static getTileGridWithTotalBoundingBox(
    totalBoundingBox: BoundingBox,
    matrixWidth: number,
    matrixHeight: number,
    boundingBox: BoundingBox,
  ): TileGrid {
    let minColumn = TileBoundingBoxUtils.getTileColumnWithTotalBoundingBox(
      totalBoundingBox,
      matrixWidth,
      boundingBox.minLongitude,
    );
    let maxColumn = TileBoundingBoxUtils.getTileColumnWithTotalBoundingBox(
      totalBoundingBox,
      matrixWidth,
      boundingBox.maxLongitude,
    );
    if (minColumn < matrixWidth && maxColumn >= 0) {
      if (minColumn < 0) {
        minColumn = 0;
      }
      if (maxColumn >= matrixWidth) {
        maxColumn = matrixWidth - 1;
      }
    }

    let maxRow = TileBoundingBoxUtils.getRowWithTotalBoundingBox(
      totalBoundingBox,
      matrixHeight,
      boundingBox.minLatitude,
    );
    let minRow = TileBoundingBoxUtils.getRowWithTotalBoundingBox(
      totalBoundingBox,
      matrixHeight,
      boundingBox.maxLatitude,
    );

    if (minRow < matrixHeight && maxRow >= 0) {
      if (minRow < 0) {
        minRow = 0;
      }
      if (maxRow >= matrixHeight) {
        maxRow = matrixHeight - 1;
      }
    }

    return new TileGrid(minColumn, maxColumn, minRow, maxRow);
  }

  /**
   *  Get the tile column of the longitude in degrees
   *
   *  @param {BoundingBox} webMercatorTotalBox web mercator total bounding box
   *  @param {Number} matrixWidth         matrix width
   *  @param {Number} longitude           longitude
   *  @param {Boolean} [max]
   *
   *  @return tile column
   */
  static getTileColumnWithTotalBoundingBox(
    webMercatorTotalBox: BoundingBox,
    matrixWidth: number,
    longitude: number,
  ): number {
    const minX = webMercatorTotalBox.minLongitude;
    const maxX = webMercatorTotalBox.maxLongitude;
    let tileId;
    if (longitude < minX) {
      tileId = -1;
    } else if (longitude >= maxX) {
      tileId = matrixWidth;
    } else {
      const matrixWidthMeters = maxX - minX;
      const tileWidth = matrixWidthMeters / matrixWidth;
      const tileIdDouble = (longitude - minX) / tileWidth;
      tileId = ~~tileIdDouble;
    }
    return tileId;
  }

  /**
   *  Get the tile row of the latitude in degrees
   *
   *  @param {BoundingBox} webMercatorTotalBox web mercator total bounding box
   *  @param {Number} matrixHeight        matrix height
   *  @param {Number} latitude            latitude
   *  @param {Boolean} [max]
   *  @return tile row
   */
  static getRowWithTotalBoundingBox(webMercatorTotalBox: BoundingBox, matrixHeight: number, latitude: number): number {
    const minY = webMercatorTotalBox.minLatitude;
    const maxY = webMercatorTotalBox.maxLatitude;

    let tileId;
    if (latitude < minY) {
      tileId = matrixHeight;
    } else if (latitude >= maxY) {
      tileId = -1;
    } else {
      const matrixHeightMeters = maxY - minY;
      const tileHeight = matrixHeightMeters / matrixHeight;
      const tileIdDouble = (maxY - latitude) / tileHeight;
      tileId = ~~tileIdDouble;
    }
    return tileId;
  }

  /**
   *  Get the web mercator bounding box of the tile column and row in the tile
   *  matrix using the total bounding box
   *
   *  @param {BoundingBox} box web mercator total bounding box
   *  @param {TileMatrix} tileMatrix          tile matrix
   *  @param {Number} tileColumn          tile column
   *  @param {Number} tileRow             tile row
   *
   *  @return web mercator bounding box
   */
  static getTileBoundingBox(
    box: BoundingBox,
    tileMatrix: TileMatrix,
    tileColumn: number,
    tileRow: number,
  ): BoundingBox {
    const tileMatrixWidth = tileMatrix.matrix_width;
    const tileMatrixHeight = tileMatrix.matrix_height;
    const tileGrid = new TileGrid(tileColumn, tileColumn, tileRow, tileRow);
    const matrixMinX = box.minLongitude;
    const matrixMaxX = box.maxLongitude;
    const matrixWidth = matrixMaxX - matrixMinX;
    const tileWidth = matrixWidth / tileMatrixWidth;

    // Find the longitude range
    const minLon = matrixMinX + tileWidth * tileGrid.min_x;
    const maxLon = minLon + tileWidth * (tileGrid.max_x + 1 - tileGrid.min_x);

    // Get the tile height
    const matrixMinY = box.minLatitude;
    const matrixMaxY = box.maxLatitude;
    const matrixHeight = matrixMaxY - matrixMinY;
    const tileHeight = matrixHeight / tileMatrixHeight;

    // Find the latitude range
    const maxLat = matrixMaxY - tileHeight * tileGrid.min_y;
    const minLat = maxLat - tileHeight * (tileGrid.max_y + 1 - tileGrid.min_y);

    return new BoundingBox(minLon, maxLon, minLat, maxLat);
  }

  static getTileGridBoundingBox(
    matrixSetBoundingBox: BoundingBox,
    tileMatrixWidth: number,
    tileMatrixHeight: number,
    tileGrid: TileGrid,
  ): BoundingBox {
    // Get the tile width
    const matrixMinX = matrixSetBoundingBox.minLongitude;
    const matrixWidth = matrixSetBoundingBox.width;
    const tileWidth = matrixWidth / tileMatrixWidth;

    // Find the longitude range
    const minLon = matrixMinX + tileWidth * tileGrid.min_x;
    const maxLon = minLon + tileWidth * (tileGrid.max_x + 1 - tileGrid.min_x);

    // Get the tile height
    const matrixMaxY = matrixSetBoundingBox.maxLatitude;
    const matrixHeight = matrixSetBoundingBox.height;
    const tileHeight = matrixHeight / tileMatrixHeight;

    // Find the latitude range
    const maxLat = matrixMaxY - tileHeight * tileGrid.min_y;
    const minLat = maxLat - tileHeight * (tileGrid.max_y + 1 - tileGrid.min_y);

    return new BoundingBox(minLon, maxLon, minLat, maxLat);
  }

  static getXPixel(width: number, boundingBox: BoundingBox, longitude: number): number {
    return ((longitude - boundingBox.minLongitude) / boundingBox.width) * width;
  }

  static getLongitudeFromPixel(
    width: number,
    boundingBox: BoundingBox,
    tileBoundingBox: BoundingBox,
    pixel: number,
  ): number {
    return (pixel / width) * tileBoundingBox.width + boundingBox.minLongitude;
  }

  static getYPixel(height: number, boundingBox: BoundingBox, latitude: number): number {
    return ((boundingBox.maxLatitude - latitude) / boundingBox.height) * height;
  }

  static getLatitudeFromPixel(
    height: number,
    boundingBox: BoundingBox,
    tileBoundingBox: BoundingBox,
    pixel: number,
  ): number {
    return boundingBox.maxLatitude - (pixel / height) * tileBoundingBox.height;
  }

  /**
   * Get the tile size in meters
   * @param tilesPerSide tiles per side
   * @return {Number} tile size
   */
  static tileSize(tilesPerSide: number): number {
    return (2 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tilesPerSide;
  }

  /**
   * Get the zoom level from the tile size in meters
   * @param tileSize tile size in meters
   * @return {Number} zoom level
   * @since 1.2.0
   */
  static zoomLevelOfTileSize(tileSize: number): number {
    const tilesPerSide = (2 * ProjectionConstants.WEB_MERCATOR_HALF_WORLD_WIDTH) / tileSize;
    return Math.log(tilesPerSide) / Math.log(2);
  }

  /**
   * Get the tile width in degrees
   * @param tilesPerSide tiles per side
   * @return {Number} tile width degrees
   */
  static tileWidthDegrees(tilesPerSide: number): number {
    return 360.0 / tilesPerSide;
  }

  /**
   * Get the tile height in degrees
   * @param tilesPerSide tiles per side
   * @return {Number} tile height degrees
   */
  statictileHeightDegrees(tilesPerSide: number): number {
    return 180.0 / tilesPerSide;
  }

  /**
   * Get the tiles per side, width and height, at the zoom level
   * @param zoom zoom level
   * @return {Number} tiles per side
   */
  static tilesPerSide(zoom: number): number {
    return Math.pow(2, zoom);
  }

  /**
   * Get the tile size in meters at the zoom level
   * @param zoom zoom level
   * @return {Number} tile size in meters
   * @since 2.0.0
   */
  static tileSizeWithZoom(zoom: number): number {
    const tilesPerSide = this.tilesPerSide(zoom);
    return this.tileSize(tilesPerSide);
  }

  /**
   * Get the tolerance distance in meters for the zoom level and pixels length
   * @param zoom zoom level
   * @param pixels pixel length
   * @return {Number} tolerance distance in meters
   * @since 2.0.0
   */
  static toleranceDistance(zoom: number, pixels: number): number {
    const tileSize = this.tileSizeWithZoom(zoom);
    return tileSize / pixels;
  }

  /**
   * Get the tolerance distance in meters for the zoom level and pixels length
   * @param zoom zoom level
   * @param pixelWidth pixel width
   * @param pixelHeight pixel height
   * @return {Number} tolerance distance in meters
   * @since 2.0.0
   */
  static toleranceDistanceWidthAndHeight(zoom: number, pixelWidth: number, pixelHeight: number): number {
    return this.toleranceDistance(zoom, Math.max(pixelWidth, pixelHeight));
  }

  static getFloatRoundedRectangle(width: number, height: number, boundingBox: BoundingBox, boundingBoxSection: any) {
    const left = Math.round(TileBoundingBoxUtils.getXPixel(width, boundingBox, boundingBoxSection.minLongitude));
    const right = Math.round(TileBoundingBoxUtils.getXPixel(width, boundingBox, boundingBoxSection.maxLongitude));
    const top = Math.round(TileBoundingBoxUtils.getYPixel(height, boundingBox, boundingBoxSection.maxLatitude));
    const bottom = Math.round(TileBoundingBoxUtils.getYPixel(height, boundingBox, boundingBoxSection.minLatitude));
    const isValid = left < right && top < bottom;
    return { left, right, bottom, top, isValid };
  }
}
