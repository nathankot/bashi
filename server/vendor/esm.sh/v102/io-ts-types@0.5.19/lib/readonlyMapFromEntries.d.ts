/**
 * @since 0.5.19
 */
import { Ord } from 'https://esm.sh/v102/fp-ts@2.13.1/lib/Ord/lib/index.d.ts'
import * as t from 'https://esm.sh/v102/io-ts@2.2.20/lib/index.d.ts'
/**
 * @since 0.5.19
 */
export interface ReadonlyMapFromEntriesC<K extends t.Mixed, V extends t.Mixed>
  extends t.Type<ReadonlyMap<t.TypeOf<K>, t.TypeOf<V>>, ReadonlyArray<[t.OutputOf<K>, t.OutputOf<V>]>, unknown> {}
/**
 * @since 0.5.19
 */
export declare function readonlyMapFromEntries<K extends t.Mixed, V extends t.Mixed>(
  keyCodec: K,
  KO: Ord<t.TypeOf<K>>,
  valueCodec: V,
  name?: string
): ReadonlyMapFromEntriesC<K, V>
