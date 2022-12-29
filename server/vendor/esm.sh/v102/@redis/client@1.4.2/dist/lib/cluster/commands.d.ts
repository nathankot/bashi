import * as APPEND from '../commands/APPEND.d.ts';
import * as BITCOUNT from '../commands/BITCOUNT.d.ts';
import * as BITFIELD_RO from '../commands/BITFIELD_RO.d.ts';
import * as BITFIELD from '../commands/BITFIELD.d.ts';
import * as BITOP from '../commands/BITOP.d.ts';
import * as BITPOS from '../commands/BITPOS.d.ts';
import * as BLMOVE from '../commands/BLMOVE.d.ts';
import * as BLMPOP from '../commands/BLMPOP.d.ts';
import * as BLPOP from '../commands/BLPOP.d.ts';
import * as BRPOP from '../commands/BRPOP.d.ts';
import * as BRPOPLPUSH from '../commands/BRPOPLPUSH.d.ts';
import * as BZMPOP from '../commands/BZMPOP.d.ts';
import * as BZPOPMAX from '../commands/BZPOPMAX.d.ts';
import * as BZPOPMIN from '../commands/BZPOPMIN.d.ts';
import * as COPY from '../commands/COPY.d.ts';
import * as DECR from '../commands/DECR.d.ts';
import * as DECRBY from '../commands/DECRBY.d.ts';
import * as DEL from '../commands/DEL.d.ts';
import * as DUMP from '../commands/DUMP.d.ts';
import * as EVAL_RO from '../commands/EVAL_RO.d.ts';
import * as EVAL from '../commands/EVAL.d.ts';
import * as EVALSHA_RO from '../commands/EVALSHA_RO.d.ts';
import * as EVALSHA from '../commands/EVALSHA.d.ts';
import * as EXISTS from '../commands/EXISTS.d.ts';
import * as EXPIRE from '../commands/EXPIRE.d.ts';
import * as EXPIREAT from '../commands/EXPIREAT.d.ts';
import * as EXPIRETIME from '../commands/EXPIRETIME.d.ts';
import * as FCALL_RO from '../commands/FCALL_RO.d.ts';
import * as FCALL from '../commands/FCALL.d.ts';
import * as GEOADD from '../commands/GEOADD.d.ts';
import * as GEODIST from '../commands/GEODIST.d.ts';
import * as GEOHASH from '../commands/GEOHASH.d.ts';
import * as GEOPOS from '../commands/GEOPOS.d.ts';
import * as GEORADIUS_RO_WITH from '../commands/GEORADIUS_RO_WITH.d.ts';
import * as GEORADIUS_RO from '../commands/GEORADIUS_RO.d.ts';
import * as GEORADIUS_WITH from '../commands/GEORADIUS_WITH.d.ts';
import * as GEORADIUS from '../commands/GEORADIUS.d.ts';
import * as GEORADIUSBYMEMBER_RO_WITH from '../commands/GEORADIUSBYMEMBER_RO_WITH.d.ts';
import * as GEORADIUSBYMEMBER_RO from '../commands/GEORADIUSBYMEMBER_RO.d.ts';
import * as GEORADIUSBYMEMBER_WITH from '../commands/GEORADIUSBYMEMBER_WITH.d.ts';
import * as GEORADIUSBYMEMBER from '../commands/GEORADIUSBYMEMBER.d.ts';
import * as GEORADIUSBYMEMBERSTORE from '../commands/GEORADIUSBYMEMBERSTORE.d.ts';
import * as GEORADIUSSTORE from '../commands/GEORADIUSSTORE.d.ts';
import * as GEOSEARCH_WITH from '../commands/GEOSEARCH_WITH.d.ts';
import * as GEOSEARCH from '../commands/GEOSEARCH.d.ts';
import * as GEOSEARCHSTORE from '../commands/GEOSEARCHSTORE.d.ts';
import * as GET from '../commands/GET.d.ts';
import * as GETBIT from '../commands/GETBIT.d.ts';
import * as GETDEL from '../commands/GETDEL.d.ts';
import * as GETEX from '../commands/GETEX.d.ts';
import * as GETRANGE from '../commands/GETRANGE.d.ts';
import * as GETSET from '../commands/GETSET.d.ts';
import * as HDEL from '../commands/HDEL.d.ts';
import * as HEXISTS from '../commands/HEXISTS.d.ts';
import * as HGET from '../commands/HGET.d.ts';
import * as HGETALL from '../commands/HGETALL.d.ts';
import * as HINCRBY from '../commands/HINCRBY.d.ts';
import * as HINCRBYFLOAT from '../commands/HINCRBYFLOAT.d.ts';
import * as HKEYS from '../commands/HKEYS.d.ts';
import * as HLEN from '../commands/HLEN.d.ts';
import * as HMGET from '../commands/HMGET.d.ts';
import * as HRANDFIELD_COUNT_WITHVALUES from '../commands/HRANDFIELD_COUNT_WITHVALUES.d.ts';
import * as HRANDFIELD_COUNT from '../commands/HRANDFIELD_COUNT.d.ts';
import * as HRANDFIELD from '../commands/HRANDFIELD.d.ts';
import * as HSCAN from '../commands/HSCAN.d.ts';
import * as HSET from '../commands/HSET.d.ts';
import * as HSETNX from '../commands/HSETNX.d.ts';
import * as HSTRLEN from '../commands/HSTRLEN.d.ts';
import * as HVALS from '../commands/HVALS.d.ts';
import * as INCR from '../commands/INCR.d.ts';
import * as INCRBY from '../commands/INCRBY.d.ts';
import * as INCRBYFLOAT from '../commands/INCRBYFLOAT.d.ts';
import * as LCS_IDX_WITHMATCHLEN from '../commands/LCS_IDX_WITHMATCHLEN.d.ts';
import * as LCS_IDX from '../commands/LCS_IDX.d.ts';
import * as LCS_LEN from '../commands/LCS_LEN.d.ts';
import * as LCS from '../commands/LCS.d.ts';
import * as LINDEX from '../commands/LINDEX.d.ts';
import * as LINSERT from '../commands/LINSERT.d.ts';
import * as LLEN from '../commands/LLEN.d.ts';
import * as LMOVE from '../commands/LMOVE.d.ts';
import * as LMPOP from '../commands/LMPOP.d.ts';
import * as LPOP_COUNT from '../commands/LPOP_COUNT.d.ts';
import * as LPOP from '../commands/LPOP.d.ts';
import * as LPOS_COUNT from '../commands/LPOS_COUNT.d.ts';
import * as LPOS from '../commands/LPOS.d.ts';
import * as LPUSH from '../commands/LPUSH.d.ts';
import * as LPUSHX from '../commands/LPUSHX.d.ts';
import * as LRANGE from '../commands/LRANGE.d.ts';
import * as LREM from '../commands/LREM.d.ts';
import * as LSET from '../commands/LSET.d.ts';
import * as LTRIM from '../commands/LTRIM.d.ts';
import * as MGET from '../commands/MGET.d.ts';
import * as MIGRATE from '../commands/MIGRATE.d.ts';
import * as MSET from '../commands/MSET.d.ts';
import * as MSETNX from '../commands/MSETNX.d.ts';
import * as OBJECT_ENCODING from '../commands/OBJECT_ENCODING.d.ts';
import * as OBJECT_FREQ from '../commands/OBJECT_FREQ.d.ts';
import * as OBJECT_IDLETIME from '../commands/OBJECT_IDLETIME.d.ts';
import * as OBJECT_REFCOUNT from '../commands/OBJECT_REFCOUNT.d.ts';
import * as PERSIST from '../commands/PERSIST.d.ts';
import * as PEXPIRE from '../commands/PEXPIRE.d.ts';
import * as PEXPIREAT from '../commands/PEXPIREAT.d.ts';
import * as PEXPIRETIME from '../commands/PEXPIRETIME.d.ts';
import * as PFADD from '../commands/PFADD.d.ts';
import * as PFCOUNT from '../commands/PFCOUNT.d.ts';
import * as PFMERGE from '../commands/PFMERGE.d.ts';
import * as PSETEX from '../commands/PSETEX.d.ts';
import * as PTTL from '../commands/PTTL.d.ts';
import * as PUBLISH from '../commands/PUBLISH.d.ts';
import * as RENAME from '../commands/RENAME.d.ts';
import * as RENAMENX from '../commands/RENAMENX.d.ts';
import * as RPOP_COUNT from '../commands/RPOP_COUNT.d.ts';
import * as RPOP from '../commands/RPOP.d.ts';
import * as RPOPLPUSH from '../commands/RPOPLPUSH.d.ts';
import * as RPUSH from '../commands/RPUSH.d.ts';
import * as RPUSHX from '../commands/RPUSHX.d.ts';
import * as SADD from '../commands/SADD.d.ts';
import * as SCARD from '../commands/SCARD.d.ts';
import * as SDIFF from '../commands/SDIFF.d.ts';
import * as SDIFFSTORE from '../commands/SDIFFSTORE.d.ts';
import * as SET from '../commands/SET.d.ts';
import * as SETBIT from '../commands/SETBIT.d.ts';
import * as SETEX from '../commands/SETEX.d.ts';
import * as SETNX from '../commands/SETNX.d.ts';
import * as SETRANGE from '../commands/SETRANGE.d.ts';
import * as SINTER from '../commands/SINTER.d.ts';
import * as SINTERCARD from '../commands/SINTERCARD.d.ts';
import * as SINTERSTORE from '../commands/SINTERSTORE.d.ts';
import * as SISMEMBER from '../commands/SISMEMBER.d.ts';
import * as SMEMBERS from '../commands/SMEMBERS.d.ts';
import * as SMISMEMBER from '../commands/SMISMEMBER.d.ts';
import * as SMOVE from '../commands/SMOVE.d.ts';
import * as SORT_RO from '../commands/SORT_RO.d.ts';
import * as SORT_STORE from '../commands/SORT_STORE.d.ts';
import * as SORT from '../commands/SORT.d.ts';
import * as SPOP from '../commands/SPOP.d.ts';
import * as SRANDMEMBER_COUNT from '../commands/SRANDMEMBER_COUNT.d.ts';
import * as SRANDMEMBER from '../commands/SRANDMEMBER.d.ts';
import * as SREM from '../commands/SREM.d.ts';
import * as SSCAN from '../commands/SSCAN.d.ts';
import * as STRLEN from '../commands/STRLEN.d.ts';
import * as SUNION from '../commands/SUNION.d.ts';
import * as SUNIONSTORE from '../commands/SUNIONSTORE.d.ts';
import * as TOUCH from '../commands/TOUCH.d.ts';
import * as TTL from '../commands/TTL.d.ts';
import * as TYPE from '../commands/TYPE.d.ts';
import * as UNLINK from '../commands/UNLINK.d.ts';
import * as WATCH from '../commands/WATCH.d.ts';
import * as XACK from '../commands/XACK.d.ts';
import * as XADD from '../commands/XADD.d.ts';
import * as XAUTOCLAIM_JUSTID from '../commands/XAUTOCLAIM_JUSTID.d.ts';
import * as XAUTOCLAIM from '../commands/XAUTOCLAIM.d.ts';
import * as XCLAIM_JUSTID from '../commands/XCLAIM_JUSTID.d.ts';
import * as XCLAIM from '../commands/XCLAIM.d.ts';
import * as XDEL from '../commands/XDEL.d.ts';
import * as XGROUP_CREATE from '../commands/XGROUP_CREATE.d.ts';
import * as XGROUP_CREATECONSUMER from '../commands/XGROUP_CREATECONSUMER.d.ts';
import * as XGROUP_DELCONSUMER from '../commands/XGROUP_DELCONSUMER.d.ts';
import * as XGROUP_DESTROY from '../commands/XGROUP_DESTROY.d.ts';
import * as XGROUP_SETID from '../commands/XGROUP_SETID.d.ts';
import * as XINFO_CONSUMERS from '../commands/XINFO_CONSUMERS.d.ts';
import * as XINFO_GROUPS from '../commands/XINFO_GROUPS.d.ts';
import * as XINFO_STREAM from '../commands/XINFO_STREAM.d.ts';
import * as XLEN from '../commands/XLEN.d.ts';
import * as XPENDING_RANGE from '../commands/XPENDING_RANGE.d.ts';
import * as XPENDING from '../commands/XPENDING.d.ts';
import * as XRANGE from '../commands/XRANGE.d.ts';
import * as XREAD from '../commands/XREAD.d.ts';
import * as XREADGROUP from '../commands/XREADGROUP.d.ts';
import * as XREVRANGE from '../commands/XREVRANGE.d.ts';
import * as XSETID from '../commands/XSETID.d.ts';
import * as XTRIM from '../commands/XTRIM.d.ts';
import * as ZADD from '../commands/ZADD.d.ts';
import * as ZCARD from '../commands/ZCARD.d.ts';
import * as ZCOUNT from '../commands/ZCOUNT.d.ts';
import * as ZDIFF_WITHSCORES from '../commands/ZDIFF_WITHSCORES.d.ts';
import * as ZDIFF from '../commands/ZDIFF.d.ts';
import * as ZDIFFSTORE from '../commands/ZDIFFSTORE.d.ts';
import * as ZINCRBY from '../commands/ZINCRBY.d.ts';
import * as ZINTER_WITHSCORES from '../commands/ZINTER_WITHSCORES.d.ts';
import * as ZINTER from '../commands/ZINTER.d.ts';
import * as ZINTERCARD from '../commands/ZINTERCARD.d.ts';
import * as ZINTERSTORE from '../commands/ZINTERSTORE.d.ts';
import * as ZLEXCOUNT from '../commands/ZLEXCOUNT.d.ts';
import * as ZMPOP from '../commands/ZMPOP.d.ts';
import * as ZMSCORE from '../commands/ZMSCORE.d.ts';
import * as ZPOPMAX_COUNT from '../commands/ZPOPMAX_COUNT.d.ts';
import * as ZPOPMAX from '../commands/ZPOPMAX.d.ts';
import * as ZPOPMIN_COUNT from '../commands/ZPOPMIN_COUNT.d.ts';
import * as ZPOPMIN from '../commands/ZPOPMIN.d.ts';
import * as ZRANDMEMBER_COUNT_WITHSCORES from '../commands/ZRANDMEMBER_COUNT_WITHSCORES.d.ts';
import * as ZRANDMEMBER_COUNT from '../commands/ZRANDMEMBER_COUNT.d.ts';
import * as ZRANDMEMBER from '../commands/ZRANDMEMBER.d.ts';
import * as ZRANGE_WITHSCORES from '../commands/ZRANGE_WITHSCORES.d.ts';
import * as ZRANGE from '../commands/ZRANGE.d.ts';
import * as ZRANGEBYLEX from '../commands/ZRANGEBYLEX.d.ts';
import * as ZRANGEBYSCORE_WITHSCORES from '../commands/ZRANGEBYSCORE_WITHSCORES.d.ts';
import * as ZRANGEBYSCORE from '../commands/ZRANGEBYSCORE.d.ts';
import * as ZRANGESTORE from '../commands/ZRANGESTORE.d.ts';
import * as ZRANK from '../commands/ZRANK.d.ts';
import * as ZREM from '../commands/ZREM.d.ts';
import * as ZREMRANGEBYLEX from '../commands/ZREMRANGEBYLEX.d.ts';
import * as ZREMRANGEBYRANK from '../commands/ZREMRANGEBYRANK.d.ts';
import * as ZREMRANGEBYSCORE from '../commands/ZREMRANGEBYSCORE.d.ts';
import * as ZREVRANK from '../commands/ZREVRANK.d.ts';
import * as ZSCAN from '../commands/ZSCAN.d.ts';
import * as ZSCORE from '../commands/ZSCORE.d.ts';
import * as ZUNION_WITHSCORES from '../commands/ZUNION_WITHSCORES.d.ts';
import * as ZUNION from '../commands/ZUNION.d.ts';
import * as ZUNIONSTORE from '../commands/ZUNIONSTORE.d.ts';
declare const _default: {
    APPEND: typeof APPEND;
    append: typeof APPEND;
    BITCOUNT: typeof BITCOUNT;
    bitCount: typeof BITCOUNT;
    BITFIELD_RO: typeof BITFIELD_RO;
    bitFieldRo: typeof BITFIELD_RO;
    BITFIELD: typeof BITFIELD;
    bitField: typeof BITFIELD;
    BITOP: typeof BITOP;
    bitOp: typeof BITOP;
    BITPOS: typeof BITPOS;
    bitPos: typeof BITPOS;
    BLMOVE: typeof BLMOVE;
    blMove: typeof BLMOVE;
    BLMPOP: typeof BLMPOP;
    blmPop: typeof BLMPOP;
    BLPOP: typeof BLPOP;
    blPop: typeof BLPOP;
    BRPOP: typeof BRPOP;
    brPop: typeof BRPOP;
    BRPOPLPUSH: typeof BRPOPLPUSH;
    brPopLPush: typeof BRPOPLPUSH;
    BZMPOP: typeof BZMPOP;
    bzmPop: typeof BZMPOP;
    BZPOPMAX: typeof BZPOPMAX;
    bzPopMax: typeof BZPOPMAX;
    BZPOPMIN: typeof BZPOPMIN;
    bzPopMin: typeof BZPOPMIN;
    COPY: typeof COPY;
    copy: typeof COPY;
    DECR: typeof DECR;
    decr: typeof DECR;
    DECRBY: typeof DECRBY;
    decrBy: typeof DECRBY;
    DEL: typeof DEL;
    del: typeof DEL;
    DUMP: typeof DUMP;
    dump: typeof DUMP;
    EVAL_RO: typeof EVAL_RO;
    evalRo: typeof EVAL_RO;
    EVAL: typeof EVAL;
    eval: typeof EVAL;
    EVALSHA: typeof EVALSHA;
    evalSha: typeof EVALSHA;
    EVALSHA_RO: typeof EVALSHA_RO;
    evalShaRo: typeof EVALSHA_RO;
    EXISTS: typeof EXISTS;
    exists: typeof EXISTS;
    EXPIRE: typeof EXPIRE;
    expire: typeof EXPIRE;
    EXPIREAT: typeof EXPIREAT;
    expireAt: typeof EXPIREAT;
    EXPIRETIME: typeof EXPIRETIME;
    expireTime: typeof EXPIRETIME;
    FCALL_RO: typeof FCALL_RO;
    fCallRo: typeof FCALL_RO;
    FCALL: typeof FCALL;
    fCall: typeof FCALL;
    GEOADD: typeof GEOADD;
    geoAdd: typeof GEOADD;
    GEODIST: typeof GEODIST;
    geoDist: typeof GEODIST;
    GEOHASH: typeof GEOHASH;
    geoHash: typeof GEOHASH;
    GEOPOS: typeof GEOPOS;
    geoPos: typeof GEOPOS;
    GEORADIUS_RO_WITH: typeof GEORADIUS_RO_WITH;
    geoRadiusRoWith: typeof GEORADIUS_RO_WITH;
    GEORADIUS_RO: typeof GEORADIUS_RO;
    geoRadiusRo: typeof GEORADIUS_RO;
    GEORADIUS_WITH: typeof GEORADIUS_WITH;
    geoRadiusWith: typeof GEORADIUS_WITH;
    GEORADIUS: typeof GEORADIUS;
    geoRadius: typeof GEORADIUS;
    GEORADIUSBYMEMBER_RO_WITH: typeof GEORADIUSBYMEMBER_RO_WITH;
    geoRadiusByMemberRoWith: typeof GEORADIUSBYMEMBER_RO_WITH;
    GEORADIUSBYMEMBER_RO: typeof GEORADIUSBYMEMBER_RO;
    geoRadiusByMemberRo: typeof GEORADIUSBYMEMBER_RO;
    GEORADIUSBYMEMBER_WITH: typeof GEORADIUSBYMEMBER_WITH;
    geoRadiusByMemberWith: typeof GEORADIUSBYMEMBER_WITH;
    GEORADIUSBYMEMBER: typeof GEORADIUSBYMEMBER;
    geoRadiusByMember: typeof GEORADIUSBYMEMBER;
    GEORADIUSBYMEMBERSTORE: typeof GEORADIUSBYMEMBERSTORE;
    geoRadiusByMemberStore: typeof GEORADIUSBYMEMBERSTORE;
    GEORADIUSSTORE: typeof GEORADIUSSTORE;
    geoRadiusStore: typeof GEORADIUSSTORE;
    GEOSEARCH_WITH: typeof GEOSEARCH_WITH;
    geoSearchWith: typeof GEOSEARCH_WITH;
    GEOSEARCH: typeof GEOSEARCH;
    geoSearch: typeof GEOSEARCH;
    GEOSEARCHSTORE: typeof GEOSEARCHSTORE;
    geoSearchStore: typeof GEOSEARCHSTORE;
    GET: typeof GET;
    get: typeof GET;
    GETBIT: typeof GETBIT;
    getBit: typeof GETBIT;
    GETDEL: typeof GETDEL;
    getDel: typeof GETDEL;
    GETEX: typeof GETEX;
    getEx: typeof GETEX;
    GETRANGE: typeof GETRANGE;
    getRange: typeof GETRANGE;
    GETSET: typeof GETSET;
    getSet: typeof GETSET;
    HDEL: typeof HDEL;
    hDel: typeof HDEL;
    HEXISTS: typeof HEXISTS;
    hExists: typeof HEXISTS;
    HGET: typeof HGET;
    hGet: typeof HGET;
    HGETALL: typeof HGETALL;
    hGetAll: typeof HGETALL;
    HINCRBY: typeof HINCRBY;
    hIncrBy: typeof HINCRBY;
    HINCRBYFLOAT: typeof HINCRBYFLOAT;
    hIncrByFloat: typeof HINCRBYFLOAT;
    HKEYS: typeof HKEYS;
    hKeys: typeof HKEYS;
    HLEN: typeof HLEN;
    hLen: typeof HLEN;
    HMGET: typeof HMGET;
    hmGet: typeof HMGET;
    HRANDFIELD_COUNT_WITHVALUES: typeof HRANDFIELD_COUNT_WITHVALUES;
    hRandFieldCountWithValues: typeof HRANDFIELD_COUNT_WITHVALUES;
    HRANDFIELD_COUNT: typeof HRANDFIELD_COUNT;
    hRandFieldCount: typeof HRANDFIELD_COUNT;
    HRANDFIELD: typeof HRANDFIELD;
    hRandField: typeof HRANDFIELD;
    HSCAN: typeof HSCAN;
    hScan: typeof HSCAN;
    HSET: typeof HSET;
    hSet: typeof HSET;
    HSETNX: typeof HSETNX;
    hSetNX: typeof HSETNX;
    HSTRLEN: typeof HSTRLEN;
    hStrLen: typeof HSTRLEN;
    HVALS: typeof HVALS;
    hVals: typeof HVALS;
    INCR: typeof INCR;
    incr: typeof INCR;
    INCRBY: typeof INCRBY;
    incrBy: typeof INCRBY;
    INCRBYFLOAT: typeof INCRBYFLOAT;
    incrByFloat: typeof INCRBYFLOAT;
    LCS_IDX_WITHMATCHLEN: typeof LCS_IDX_WITHMATCHLEN;
    lcsIdxWithMatchLen: typeof LCS_IDX_WITHMATCHLEN;
    LCS_IDX: typeof LCS_IDX;
    lcsIdx: typeof LCS_IDX;
    LCS_LEN: typeof LCS_LEN;
    lcsLen: typeof LCS_LEN;
    LCS: typeof LCS;
    lcs: typeof LCS;
    LINDEX: typeof LINDEX;
    lIndex: typeof LINDEX;
    LINSERT: typeof LINSERT;
    lInsert: typeof LINSERT;
    LLEN: typeof LLEN;
    lLen: typeof LLEN;
    LMOVE: typeof LMOVE;
    lMove: typeof LMOVE;
    LMPOP: typeof LMPOP;
    lmPop: typeof LMPOP;
    LPOP_COUNT: typeof LPOP_COUNT;
    lPopCount: typeof LPOP_COUNT;
    LPOP: typeof LPOP;
    lPop: typeof LPOP;
    LPOS_COUNT: typeof LPOS_COUNT;
    lPosCount: typeof LPOS_COUNT;
    LPOS: typeof LPOS;
    lPos: typeof LPOS;
    LPUSH: typeof LPUSH;
    lPush: typeof LPUSH;
    LPUSHX: typeof LPUSHX;
    lPushX: typeof LPUSHX;
    LRANGE: typeof LRANGE;
    lRange: typeof LRANGE;
    LREM: typeof LREM;
    lRem: typeof LREM;
    LSET: typeof LSET;
    lSet: typeof LSET;
    LTRIM: typeof LTRIM;
    lTrim: typeof LTRIM;
    MGET: typeof MGET;
    mGet: typeof MGET;
    MIGRATE: typeof MIGRATE;
    migrate: typeof MIGRATE;
    MSET: typeof MSET;
    mSet: typeof MSET;
    MSETNX: typeof MSETNX;
    mSetNX: typeof MSETNX;
    OBJECT_ENCODING: typeof OBJECT_ENCODING;
    objectEncoding: typeof OBJECT_ENCODING;
    OBJECT_FREQ: typeof OBJECT_FREQ;
    objectFreq: typeof OBJECT_FREQ;
    OBJECT_IDLETIME: typeof OBJECT_IDLETIME;
    objectIdleTime: typeof OBJECT_IDLETIME;
    OBJECT_REFCOUNT: typeof OBJECT_REFCOUNT;
    objectRefCount: typeof OBJECT_REFCOUNT;
    PERSIST: typeof PERSIST;
    persist: typeof PERSIST;
    PEXPIRE: typeof PEXPIRE;
    pExpire: typeof PEXPIRE;
    PEXPIREAT: typeof PEXPIREAT;
    pExpireAt: typeof PEXPIREAT;
    PEXPIRETIME: typeof PEXPIRETIME;
    pExpireTime: typeof PEXPIRETIME;
    PFADD: typeof PFADD;
    pfAdd: typeof PFADD;
    PFCOUNT: typeof PFCOUNT;
    pfCount: typeof PFCOUNT;
    PFMERGE: typeof PFMERGE;
    pfMerge: typeof PFMERGE;
    PSETEX: typeof PSETEX;
    pSetEx: typeof PSETEX;
    PTTL: typeof PTTL;
    pTTL: typeof PTTL;
    PUBLISH: typeof PUBLISH;
    publish: typeof PUBLISH;
    RENAME: typeof RENAME;
    rename: typeof RENAME;
    RENAMENX: typeof RENAMENX;
    renameNX: typeof RENAMENX;
    RPOP_COUNT: typeof RPOP_COUNT;
    rPopCount: typeof RPOP_COUNT;
    RPOP: typeof RPOP;
    rPop: typeof RPOP;
    RPOPLPUSH: typeof RPOPLPUSH;
    rPopLPush: typeof RPOPLPUSH;
    RPUSH: typeof RPUSH;
    rPush: typeof RPUSH;
    RPUSHX: typeof RPUSHX;
    rPushX: typeof RPUSHX;
    SADD: typeof SADD;
    sAdd: typeof SADD;
    SCARD: typeof SCARD;
    sCard: typeof SCARD;
    SDIFF: typeof SDIFF;
    sDiff: typeof SDIFF;
    SDIFFSTORE: typeof SDIFFSTORE;
    sDiffStore: typeof SDIFFSTORE;
    SINTER: typeof SINTER;
    sInter: typeof SINTER;
    SINTERCARD: typeof SINTERCARD;
    sInterCard: typeof SINTERCARD;
    SINTERSTORE: typeof SINTERSTORE;
    sInterStore: typeof SINTERSTORE;
    SET: typeof SET;
    set: typeof SET;
    SETBIT: typeof SETBIT;
    setBit: typeof SETBIT;
    SETEX: typeof SETEX;
    setEx: typeof SETEX;
    SETNX: typeof SETNX;
    setNX: typeof SETNX;
    SETRANGE: typeof SETRANGE;
    setRange: typeof SETRANGE;
    SISMEMBER: typeof SISMEMBER;
    sIsMember: typeof SISMEMBER;
    SMEMBERS: typeof SMEMBERS;
    sMembers: typeof SMEMBERS;
    SMISMEMBER: typeof SMISMEMBER;
    smIsMember: typeof SMISMEMBER;
    SMOVE: typeof SMOVE;
    sMove: typeof SMOVE;
    SORT_RO: typeof SORT_RO;
    sortRo: typeof SORT_RO;
    SORT_STORE: typeof SORT_STORE;
    sortStore: typeof SORT_STORE;
    SORT: typeof SORT;
    sort: typeof SORT;
    SPOP: typeof SPOP;
    sPop: typeof SPOP;
    SRANDMEMBER_COUNT: typeof SRANDMEMBER_COUNT;
    sRandMemberCount: typeof SRANDMEMBER_COUNT;
    SRANDMEMBER: typeof SRANDMEMBER;
    sRandMember: typeof SRANDMEMBER;
    SREM: typeof SREM;
    sRem: typeof SREM;
    SSCAN: typeof SSCAN;
    sScan: typeof SSCAN;
    STRLEN: typeof STRLEN;
    strLen: typeof STRLEN;
    SUNION: typeof SUNION;
    sUnion: typeof SUNION;
    SUNIONSTORE: typeof SUNIONSTORE;
    sUnionStore: typeof SUNIONSTORE;
    TOUCH: typeof TOUCH;
    touch: typeof TOUCH;
    TTL: typeof TTL;
    ttl: typeof TTL;
    TYPE: typeof TYPE;
    type: typeof TYPE;
    UNLINK: typeof UNLINK;
    unlink: typeof UNLINK;
    WATCH: typeof WATCH;
    watch: typeof WATCH;
    XACK: typeof XACK;
    xAck: typeof XACK;
    XADD: typeof XADD;
    xAdd: typeof XADD;
    XAUTOCLAIM_JUSTID: typeof XAUTOCLAIM_JUSTID;
    xAutoClaimJustId: typeof XAUTOCLAIM_JUSTID;
    XAUTOCLAIM: typeof XAUTOCLAIM;
    xAutoClaim: typeof XAUTOCLAIM;
    XCLAIM: typeof XCLAIM;
    xClaim: typeof XCLAIM;
    XCLAIM_JUSTID: typeof XCLAIM_JUSTID;
    xClaimJustId: typeof XCLAIM_JUSTID;
    XDEL: typeof XDEL;
    xDel: typeof XDEL;
    XGROUP_CREATE: typeof XGROUP_CREATE;
    xGroupCreate: typeof XGROUP_CREATE;
    XGROUP_CREATECONSUMER: typeof XGROUP_CREATECONSUMER;
    xGroupCreateConsumer: typeof XGROUP_CREATECONSUMER;
    XGROUP_DELCONSUMER: typeof XGROUP_DELCONSUMER;
    xGroupDelConsumer: typeof XGROUP_DELCONSUMER;
    XGROUP_DESTROY: typeof XGROUP_DESTROY;
    xGroupDestroy: typeof XGROUP_DESTROY;
    XGROUP_SETID: typeof XGROUP_SETID;
    xGroupSetId: typeof XGROUP_SETID;
    XINFO_CONSUMERS: typeof XINFO_CONSUMERS;
    xInfoConsumers: typeof XINFO_CONSUMERS;
    XINFO_GROUPS: typeof XINFO_GROUPS;
    xInfoGroups: typeof XINFO_GROUPS;
    XINFO_STREAM: typeof XINFO_STREAM;
    xInfoStream: typeof XINFO_STREAM;
    XLEN: typeof XLEN;
    xLen: typeof XLEN;
    XPENDING_RANGE: typeof XPENDING_RANGE;
    xPendingRange: typeof XPENDING_RANGE;
    XPENDING: typeof XPENDING;
    xPending: typeof XPENDING;
    XRANGE: typeof XRANGE;
    xRange: typeof XRANGE;
    XREAD: typeof XREAD;
    xRead: typeof XREAD;
    XREADGROUP: typeof XREADGROUP;
    xReadGroup: typeof XREADGROUP;
    XREVRANGE: typeof XREVRANGE;
    xRevRange: typeof XREVRANGE;
    XSETID: typeof XSETID;
    xSetId: typeof XSETID;
    XTRIM: typeof XTRIM;
    xTrim: typeof XTRIM;
    ZADD: typeof ZADD;
    zAdd: typeof ZADD;
    ZCARD: typeof ZCARD;
    zCard: typeof ZCARD;
    ZCOUNT: typeof ZCOUNT;
    zCount: typeof ZCOUNT;
    ZDIFF_WITHSCORES: typeof ZDIFF_WITHSCORES;
    zDiffWithScores: typeof ZDIFF_WITHSCORES;
    ZDIFF: typeof ZDIFF;
    zDiff: typeof ZDIFF;
    ZDIFFSTORE: typeof ZDIFFSTORE;
    zDiffStore: typeof ZDIFFSTORE;
    ZINCRBY: typeof ZINCRBY;
    zIncrBy: typeof ZINCRBY;
    ZINTER_WITHSCORES: typeof ZINTER_WITHSCORES;
    zInterWithScores: typeof ZINTER_WITHSCORES;
    ZINTER: typeof ZINTER;
    zInter: typeof ZINTER;
    ZINTERCARD: typeof ZINTERCARD;
    zInterCard: typeof ZINTERCARD;
    ZINTERSTORE: typeof ZINTERSTORE;
    zInterStore: typeof ZINTERSTORE;
    ZLEXCOUNT: typeof ZLEXCOUNT;
    zLexCount: typeof ZLEXCOUNT;
    ZMPOP: typeof ZMPOP;
    zmPop: typeof ZMPOP;
    ZMSCORE: typeof ZMSCORE;
    zmScore: typeof ZMSCORE;
    ZPOPMAX_COUNT: typeof ZPOPMAX_COUNT;
    zPopMaxCount: typeof ZPOPMAX_COUNT;
    ZPOPMAX: typeof ZPOPMAX;
    zPopMax: typeof ZPOPMAX;
    ZPOPMIN_COUNT: typeof ZPOPMIN_COUNT;
    zPopMinCount: typeof ZPOPMIN_COUNT;
    ZPOPMIN: typeof ZPOPMIN;
    zPopMin: typeof ZPOPMIN;
    ZRANDMEMBER_COUNT_WITHSCORES: typeof ZRANDMEMBER_COUNT_WITHSCORES;
    zRandMemberCountWithScores: typeof ZRANDMEMBER_COUNT_WITHSCORES;
    ZRANDMEMBER_COUNT: typeof ZRANDMEMBER_COUNT;
    zRandMemberCount: typeof ZRANDMEMBER_COUNT;
    ZRANDMEMBER: typeof ZRANDMEMBER;
    zRandMember: typeof ZRANDMEMBER;
    ZRANGE_WITHSCORES: typeof ZRANGE_WITHSCORES;
    zRangeWithScores: typeof ZRANGE_WITHSCORES;
    ZRANGE: typeof ZRANGE;
    zRange: typeof ZRANGE;
    ZRANGEBYLEX: typeof ZRANGEBYLEX;
    zRangeByLex: typeof ZRANGEBYLEX;
    ZRANGEBYSCORE_WITHSCORES: typeof ZRANGEBYSCORE_WITHSCORES;
    zRangeByScoreWithScores: typeof ZRANGEBYSCORE_WITHSCORES;
    ZRANGEBYSCORE: typeof ZRANGEBYSCORE;
    zRangeByScore: typeof ZRANGEBYSCORE;
    ZRANGESTORE: typeof ZRANGESTORE;
    zRangeStore: typeof ZRANGESTORE;
    ZRANK: typeof ZRANK;
    zRank: typeof ZRANK;
    ZREM: typeof ZREM;
    zRem: typeof ZREM;
    ZREMRANGEBYLEX: typeof ZREMRANGEBYLEX;
    zRemRangeByLex: typeof ZREMRANGEBYLEX;
    ZREMRANGEBYRANK: typeof ZREMRANGEBYRANK;
    zRemRangeByRank: typeof ZREMRANGEBYRANK;
    ZREMRANGEBYSCORE: typeof ZREMRANGEBYSCORE;
    zRemRangeByScore: typeof ZREMRANGEBYSCORE;
    ZREVRANK: typeof ZREVRANK;
    zRevRank: typeof ZREVRANK;
    ZSCAN: typeof ZSCAN;
    zScan: typeof ZSCAN;
    ZSCORE: typeof ZSCORE;
    zScore: typeof ZSCORE;
    ZUNION_WITHSCORES: typeof ZUNION_WITHSCORES;
    zUnionWithScores: typeof ZUNION_WITHSCORES;
    ZUNION: typeof ZUNION;
    zUnion: typeof ZUNION;
    ZUNIONSTORE: typeof ZUNIONSTORE;
    zUnionStore: typeof ZUNIONSTORE;
};
export default _default;
