/**
 * Metadata module.
 * @module metadata
 * @see module:dao/dao
 */
import { Metadata } from './metadata';
import { DBValue } from '../../db/dbAdapter';
import { GeoPackageDao } from '../../db/geoPackageDao';
import { MetadataReferenceDao } from './reference/metadataReferenceDao';
import { GeoPackageConnection } from '../../db/geoPackageConnection';

/**
 * Metadata Data Access Object
 * @class
 * @extends Dao
 */
export class MetadataDao extends GeoPackageDao<Metadata, number> {
  readonly gpkgTableName: string = Metadata.TABLE_NAME;
  readonly idColumns: string[] = [Metadata.COLUMN_ID];
  metadataReferenceDao: MetadataReferenceDao;

  /**
   * Constructor
   * @param geoPackageConnection GeoPackage object this dao belongs to
   */
  constructor(geoPackageConnection: GeoPackageConnection) {
    super(geoPackageConnection, Metadata.TABLE_NAME);
  }

  public static createDao(geoPackageConnection: GeoPackageConnection): MetadataDao {
    return new MetadataDao(geoPackageConnection);
  }

  createObject(results?: Record<string, DBValue>): Metadata {
    const m = new Metadata();
    if (results) {
      m.id = results.id as number;
      m.md_scope = results.md_scope as string;
      m.md_standard_uri = results.md_standard_uri as string;
      m.mime_type = results.mime_type as string;
      m.metadata = results.metadata as string;
    }
    return m;
  }

  /**
   * Delete the Metadata, cascading
   *
   * @param metadata
   *            metadata
   * @return deleted count
   */
  public deleteCascade(metadata: Metadata): number {
    let count = 0;
    if (metadata != null) {
      // Delete Metadata References and remove parent references
      const dao = this.getMetadataReferenceDao();
      dao.deleteByMetadata(metadata.getId());
      dao.removeMetadataParent(metadata.getId());

      // Delete
      count = this.deleteById(metadata.getId());
    }
    return count;
  }

  /**
   * Get or create a Metadata Reference DAO
   *
   * @return metadata reference dao
   */
  private getMetadataReferenceDao(): MetadataReferenceDao {
    if (this.metadataReferenceDao == null) {
      this.metadataReferenceDao = MetadataReferenceDao.createDao(this.db);
    }
    return this.metadataReferenceDao;
  }

  queryForIdWithKey(key: number): Metadata {
    return this.queryForId(key);
  }
}
