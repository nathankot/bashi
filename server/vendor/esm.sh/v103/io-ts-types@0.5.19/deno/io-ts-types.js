/* esm.sh - esbuild bundle(io-ts-types@0.5.19) deno production */
import*as M from"/v103/io-ts@2.2.20/deno/io-ts.js";function Qr(r,o,t){return t===void 0&&(t=r.name),new M.Type(t,r.is,r.validate,function(e){return o(r.encode(e))})}import*as O from"/v103/io-ts@2.2.20/deno/io-ts.js";var U=O.brand(O.string,function(r){return r.length>0},"NonEmptyString");import*as c from"/v103/io-ts@2.2.20/deno/io-ts.js";import{fromArray as Z,map as K}from"/v103/fp-ts@2.13.1/deno/es6/NonEmptyArray.js";import{isNonEmpty as k}from"/v103/fp-ts@2.13.1/deno/es6/Array.js";import{pipe as C}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as rr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";import{isNone as tr}from"/v103/fp-ts@2.13.1/deno/es6/Option.js";function j(r,o){o===void 0&&(o="NonEmptyArray<"+r.name+">");var t=c.array(r);return new c.Type(o,function(e){return t.is(e)&&k(e)},function(e,i){return C(t.validate(e,i),rr(function(F){var a=Z(F);return tr(a)?c.failure(e,i):c.success(a.value)}))},K(r.encode))}import{every as or,fromArray as er,toArray as nr}from"/v103/fp-ts@2.13.1/deno/es6/Set.js";import*as v from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as ir}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as ar}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";function _(r,o,t){t===void 0&&(t="Set<"+r.name+">");var e=v.array(r),i=nr(o),F=er(o);return new v.Type(t,function(a){return a instanceof Set&&or(r.is)(a)},function(a,A){return ir(e.validate(a,A),ar(function(f){var T=F(f);return T.size!==f.length?v.failure(a,A):v.success(T)}))},function(a){return e.encode(i(a))})}function at(r,o,t){return t===void 0&&(t="ReadonlySet<"+r.name+">"),_(r,o,t)}import*as x from"/v103/io-ts@2.2.20/deno/io-ts.js";function E(r,o){return new x.Type(r,o,function(t,e){return o(t)?x.success(t):x.failure(t,e)},x.identity)}var mr=function(r){return r instanceof Date},ut=E("Date",mr);import{iso as fr}from"/v103/newtype-ts@0.3.5/deno/newtype-ts.js";import*as P from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as pr}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{map as ur}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";function xt(r,o){o===void 0&&(o="fromNewtype("+r.name+")");var t=fr();return new P.Type(o,function(e){return r.is(e)},function(e,i){return pr(r.validate(e,i),ur(t.wrap))},function(e){return r.encode(t.unwrap(e))})}import{pipe as z}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{map as cr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";import*as g from"/v103/fp-ts@2.13.1/deno/es6/Option.js";import*as D from"/v103/io-ts@2.2.20/deno/io-ts.js";import*as y from"/v103/io-ts@2.2.20/deno/io-ts.js";var sr=y.strict({_tag:y.literal("None")},"None"),lr=y.literal("Some");function V(r,o){return o===void 0&&(o="Option<"+r.name+">"),y.union([sr,y.strict({_tag:lr,value:r},"Some<"+r.name+">")],o)}function bt(r,o){return o===void 0&&(o="Option<"+r.name+">"),new D.Type(o,V(r).is,function(t,e){return t==null?D.success(g.none):z(r.validate(t,e),cr(g.some))},function(t){return g.toNullable(z(t,g.map(r.encode)))})}import*as N from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as vr}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as xr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var Tt=new N.Type("DateFromISOString",function(r){return r instanceof Date},function(r,o){return vr(N.string.validate(r,o),xr(function(t){var e=new Date(t);return isNaN(e.getTime())?N.failure(r,o):N.success(e)}))},function(r){return r.toISOString()});function Et(r,o){return o===void 0&&(o="ReadonlyNonEmptyArray<"+r.name+">"),j(r,o)}function $(r){var o=Object.create(Object.getPrototypeOf(r));return Object.assign(o,r),o}import*as w from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as yr}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as gr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var Lt=new w.Type("DateFromNumber",function(r){return r instanceof Date},function(r,o){return yr(w.number.validate(r,o),gr(function(t){var e=new Date(t);return isNaN(e.getTime())?w.failure(r,o):w.success(e)}))},function(r){return r.getTime()});import*as G from"/v103/io-ts@2.2.20/deno/io-ts.js";import*as q from"/v103/io-ts@2.2.20/deno/io-ts.js";function h(r,o,t){t===void 0&&(t=r.name);var e=$(r);return e.validate=o,e.decode=function(i){return o(i,q.getDefaultContext(e))},e.name=t,e}import{orElse as Nr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";function Pt(r,o,t){return t===void 0&&(t="withFallback("+r.name+")"),h(r,function(e,i){return Nr(function(){return G.success(o)})(r.validate(e,i))},t)}import*as I from"/v103/io-ts@2.2.20/deno/io-ts.js";var wr=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,zt=I.brand(I.string,function(r){return wr.test(r)},"UUID");import*as H from"/v103/io-ts@2.2.20/deno/io-ts.js";function Gt(r,o,t){return t===void 0&&(t="fromNullable("+r.name+")"),h(r,function(e,i){return e==null?H.success(o):r.validate(e,i)},t)}import*as m from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as Sr}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as br}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var Xt=new m.Type("BooleanFromString",m.boolean.is,function(r,o){return Sr(m.string.validate(r,o),br(function(t){return t==="true"?m.success(!0):t==="false"?m.success(!1):m.failure(r,o)}))},String);import{mapLeft as hr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";function kt(r,o){return h(r,function(t,e){return hr(function(){return[{value:t,context:e,message:o(t,e),actual:t}]})(r.validate(t,e))})}import{Lens as dr}from"/v103/monocle-ts@2.3.13/deno/monocle-ts.js";function Q(r){switch(r._tag){case"InterfaceType":return r.props;case"ExactType":return Q(r.type)}}var Fr=dr.fromProp();function to(r){var o={};for(var t in Q(r))o[t]=Fr(t);return o}var Tr=function(r){return Object.prototype.toString.call(r)==="[object RegExp]"},no=E("RegExp",Tr);import*as S from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as Ar}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as Or}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var fo=new S.Type("DateFromUnixTime",function(r){return r instanceof Date},function(r,o){return Ar(S.Int.validate(r,o),Or(function(t){var e=new Date(t*1e3);return isNaN(e.getTime())?S.failure(r,o):S.success(e)}))},function(r){return Math.floor(r.getTime()/1e3)});import*as p from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as Er}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as Dr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var R=new p.Type("NumberFromString",p.number.is,function(r,o){return Er(p.string.validate(r,o),Dr(function(t){var e=+t;return isNaN(e)||t.trim()===""?p.failure(r,o):p.success(e)}))},String);import*as s from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as Ir}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as Rr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var yo=new s.Type("IntFromString",s.Int.is,function(r,o){return Ir(R.validate(r,o),Rr(function(t){return s.Int.is(t)?s.success(t):s.failure(r,o)}))},R.encode);import*as n from"/v103/io-ts@2.2.20/deno/io-ts.js";var Jr=n.recursion("JsonArray",function(){return n.readonlyArray(J)}),Lr=n.recursion("JsonRecord",function(){return n.record(n.string,J)}),J=n.union([n.boolean,n.number,n.string,n.null,Jr,Lr],"Json"),No=new n.Type("JsonFromString",J.is,function(r,o){try{return n.success(JSON.parse(r))}catch{return n.failure(r,o)}},function(r){return JSON.stringify(r)});import*as b from"/v103/io-ts@2.2.20/deno/io-ts.js";var Br=b.literal("Left"),Mr=b.literal("Right");function So(r,o,t){return t===void 0&&(t="Either<"+r.name+", "+o.name+">"),b.union([b.strict({_tag:Br,left:r},"Left<"+r.name+">"),b.strict({_tag:Mr,right:o},"Right<"+r.name+">")],t)}import*as l from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as Ur}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{chain as jr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";var Ao=new l.Type("BigIntFromString",function(r){return typeof r=="bigint"},function(r,o){return Ur(l.string.validate(r,o),jr(function(t){if(!U.is(t.trim()))return l.failure(r,o);try{return l.success(BigInt(t))}catch{return l.failure(r,o)}}))},String);import*as W from"/v103/io-ts@2.2.20/deno/io-ts.js";function Eo(r,o,t){return t===void 0&&(t=r.name),new W.Type(t,r.is,r.validate,o)}import*as d from"/v103/io-ts@2.2.20/deno/io-ts.js";import{pipe as _r}from"/v103/fp-ts@2.13.1/deno/es6/pipeable.js";import{map as Pr}from"/v103/fp-ts@2.13.1/deno/Either.js";var Jo=new d.Type("BooleanFromNumber",d.boolean.is,function(r,o){return _r(d.number.validate(r,o),Pr(function(t){return t!==0}))},Number);import*as X from"/v103/fp-ts@2.13.1/deno/es6/Array.js";import{chain as Vr}from"/v103/fp-ts@2.13.1/deno/es6/Either.js";import{fromFoldable as zr,toArray as $r}from"/v103/fp-ts@2.13.1/deno/es6/Map.js";import{getLastSemigroup as qr}from"/v103/fp-ts@2.13.1/deno/es6/Semigroup.js";import{pipe as Gr}from"/v103/fp-ts@2.13.1/deno/function.js";import*as u from"/v103/io-ts@2.2.20/deno/io-ts.js";var Hr=function(r,o){return function(t){for(var e=t.entries(),i;!(i=e.next()).done;)if(r(i.value[0])===!1||o(i.value[1])===!1)return!1;return!0}};function Y(r,o,t,e){e===void 0&&(e="Map<"+r.name+", "+t.name+">");var i=u.array(u.tuple([r,t])),F=$r(o),a=zr(o,qr(),X.Foldable),A=Hr(r.is,t.is);return new u.Type(e,function(f){return f instanceof Map&&A(f)},function(f,T){return Gr(i.validate(f,T),Vr(function(L){var B=a(L);return B.size!==L.length?u.failure(f,T):u.success(B)}))},function(f){return i.encode(F(f))})}function Vo(r,o,t,e){return e===void 0&&(e="ReadonlyMap<"+r.name+", "+t.name+">"),Y(r,o,t,e)}export{Ao as BigIntFromString,Jo as BooleanFromNumber,Xt as BooleanFromString,Tt as DateFromISOString,Lt as DateFromNumber,fo as DateFromUnixTime,yo as IntFromString,J as Json,Jr as JsonArray,No as JsonFromString,Lr as JsonRecord,U as NonEmptyString,R as NumberFromString,zt as UUID,$ as clone,ut as date,So as either,xt as fromNewtype,Gt as fromNullable,E as fromRefinement,to as getLenses,Y as mapFromEntries,Qr as mapOutput,j as nonEmptyArray,V as option,bt as optionFromNullable,Vo as readonlyMapFromEntries,Et as readonlyNonEmptyArray,at as readonlySetFromArray,no as regexp,_ as setFromArray,Eo as withEncode,Pt as withFallback,kt as withMessage,h as withValidate};