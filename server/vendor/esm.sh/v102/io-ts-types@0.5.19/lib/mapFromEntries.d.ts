import { Ord } from 'https://esm.sh/v102/fp-ts@2.13.1/Ord/lib/index.d.ts'
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.19
 */
export interface MapFromEntriesC<K extends t.Mixed, V extends t.Mixed>
  extends t.Type<Map<t.TypeOf<K>, t.TypeOf<V>>, Array<[t.OutputOf<K>, t.OutputOf<V>]>, unknown> {}
/**
 * @since 0.5.19
 */
export declare function mapFromEntries<K extends t.Mixed, V extends t.Mixed>(
  keyCodec: K,
  KO: Ord<t.TypeOf<K>>,
  valueCodec: V,
  name?: string
): MapFromEntriesC<K, V>
