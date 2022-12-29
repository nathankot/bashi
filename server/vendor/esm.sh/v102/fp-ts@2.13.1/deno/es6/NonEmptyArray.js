/* esm.sh - esbuild bundle(fp-ts@2.13.1/es6/NonEmptyArray) deno production */
import{apFirst as nr,apS as er,apSecond as or}from"/v102/fp-ts@2.13.1/deno/es6/Apply.js";import{bind as ur,chainFirst as ar}from"/v102/fp-ts@2.13.1/deno/es6/Chain.js";import{identity as D,pipe as p}from"/v102/fp-ts@2.13.1/deno/es6/function.js";import{let as pr,bindTo as ir,flap as cr}from"/v102/fp-ts@2.13.1/deno/es6/Functor.js";import*as c from"/v102/fp-ts@2.13.1/deno/es6/internal.js";import{getMonoid as fr}from"/v102/fp-ts@2.13.1/deno/es6/Ord.js";import*as a from"/v102/fp-ts@2.13.1/deno/es6/ReadonlyNonEmptyArray.js";var I=function(r,t,n){if(n||arguments.length===2)for(var e=0,u=t.length,o;e<u;e++)(o||!(e in t))&&(o||(o=Array.prototype.slice.call(t,0,e)),o[e]=t[e]);return r.concat(o||Array.prototype.slice.call(t))},l=function(r){return r.length>0},P=function(r,t){return r<0||r>=t.length},vr=function(r){return function(t){return I([r],t,!0)}},y=vr,xr=function(r){return function(t){return I(I([],t,!0),[r],!1)}},U=xr,dr=function(r,t,n){if(l(n)){var e=E(n);return e.splice(r,0,t),e}return[t]},hr=function(r,t,n){var e=E(n);return e[r]=t,e},lr=function(r){return function(t){if(t.length===1)return R(t);for(var n=[x(t)],e=h(t),u=function(_){n.every(function(N){return!r.equals(N,_)})&&n.push(_)},o=0,i=e;o<i.length;o++){var d=i[o];u(d)}return n}},Jr=function(r){if(l(r)){var t=fr();return G(r.reduce(t.concat,t.empty))}return R},mr=function(r){var t=lr(r);return function(n){return function(e){return t(p(e,F(n)))}}},Ir=function(r){return function(t){var n=t.length,e=Math.round(r)%n;if(P(Math.abs(e),t)||e===0)return R(t);if(e<0){var u=K(-e)(t),o=u[0],i=u[1];return p(i,F(o))}else return Ir(e-n)(t)}},E=c.fromReadonlyNonEmptyArray,Rr=function(r){return l(r)?c.some(r):c.none},k=function(r){return function(t){for(var n=Math.max(0,Math.floor(t)),e=[r(0)],u=1;u<n;u++)e.push(r(u));return e}},Kr=function(r){return k(function(){return r})},Qr=function(r,t){return r<=t?k(function(n){return r+n})(t-r+1):[r]},gr=function(r){return[x(r),h(r)]},sr=function(r){return[j(r),M(r)]};function Wr(r){return function(t){return t.concat(r)}}function F(r,t){return t?r.concat(t):function(n){return n.concat(r)}}var Vr=function(r){return I([M(r)],r.slice(0,-1).reverse(),!0)};function Ar(r){return function(t){var n=t.length;if(n===0)return[];for(var e=[],u=t[0],o=[u],i=1;i<n;i++){var d=t[i];r.equals(d,u)?o.push(d):(e.push(o),u=d,o=[u])}return e.push(o),e}}var Xr=function(r){return function(t){for(var n={},e=0,u=t;e<u.length;e++){var o=u[e],i=r(o);c.has.call(n,i)?n[i].push(o):n[i]=[o]}return n}},G=function(r){return function(t){return t.slice().sort(r.compare)}},Yr=function(r,t){return function(n){return r<0||r>n.length?c.none:c.some(dr(r,t,n))}},Zr=function(r,t){return _r(r,function(){return t})},_r=function(r,t){return function(n){return P(r,n)?c.none:c.some(hr(r,t(n[r]),n))}},R=E,m=function(r){return[r]},yr=function(r,t,n){for(var e=[n(r[0],t[0])],u=Math.min(r.length,t.length),o=1;o<u;o++)e[o]=n(r[o],t[o]);return e};function Er(r,t){return t===void 0?function(n){return Er(n,r)}:yr(r,t,function(n,e){return[n,e]})}var $r=function(r){for(var t=[r[0][0]],n=[r[0][1]],e=1;e<r.length;e++)t[e]=r[e][0],n[e]=r[e][1];return[t,n]},J=function(r){return function(t){for(var n=[r,t[0]],e=1;e<t.length;e++)n.push(r,t[e]);return n}},rt=function(r){return function(t){var n=h(t);return l(n)?p(n,J(r),y(x(t))):R(t)}},Mr=a.foldMapWithIndex,Nr=a.foldMap,Ur=function(r){return function(t){for(var n=E(r(0,x(t))),e=1;e<t.length;e++)n.push.apply(n,r(e,t[e]));return n}},Fr=function(r){return function(t){for(var n=r(t),e=n[0],u=n[1],o=[e],i=u;l(i);){var d=r(i),_=d[0],N=d[1];o.push(_),i=N}return o}},K=function(r){return function(t){var n=Math.max(1,r);return n>=t.length?[R(t),[]]:[p(t.slice(1,n),y(x(t))),t.slice(n)]}},tt=function(r){return Fr(K(r))},v=function(r,t){return p(r,Z(t))},S=function(r,t){return p(r,$(t))},g=function(r,t){return p(r,Tr(t))},q=function(r,t){return p(r,O(t))},Q=function(r,t){return p(r,Y(t))},s=function(r,t,n){return p(r,br(t,n))},W=function(r){var t=Nr(r);return function(n,e){return p(n,t(e))}},A=function(r,t,n){return p(r,Br(t,n))},T=function(r){var t=zr(r);return function(n,e){return p(n,t(e))}},V=function(r,t){return p(r,qr(t))},b=function(r,t,n){return p(r,wr(t,n))},w=function(r){var t=Mr(r);return function(n,e){return p(n,t(e))}},B=function(r,t,n){return p(r,Or(t,n))},X=function(r){var t=L(r);return function(n,e){return p(n,t(e))}},Sr=function(r){return function(t){return p(t,Wr(r()))}},qr=Sr,Tr=function(r){return O(function(t){return p(r,Z(t))})},O=function(r){return Ur(function(t,n){return r(n)})},Y=function(r){return function(t){for(var n=h(t),e=[r(t)];l(n);)e.push(r(n)),n=h(n);return e}},nt=Y(D),et=O(D),Z=function(r){return $(function(t,n){return r(n)})},$=function(r){return function(t){for(var n=[r(0,x(t))],e=1;e<t.length;e++)n.push(r(e,t[e]));return n}},br=a.reduce,wr=a.reduceWithIndex,Br=a.reduceRight,Or=a.reduceRightWithIndex,zr=function(r){var t=L(r);return function(n){return t(function(e,u){return n(u)})}},z=function(r){return L(r)(function(t,n){return n})},L=function(r){return function(t){return function(n){for(var e=r.map(t(0,x(n)),m),u=1;u<n.length;u++)e=r.ap(r.map(e,function(o){return function(i){return p(o,U(i))}}),t(u,n[u]));return e}}},rr=a.head,f="NonEmptyArray",ot=a.getShow,ut=function(){return{concat:F}},at=a.getEq,pt=function(r){var t=mr(r);return{concat:function(n,e){return t(e)(n)}}},C={URI:f,map:v},it=cr(C),ct={URI:f,of:m},ft={URI:f,map:v,mapWithIndex:S},H={URI:f,map:v,ap:g},vt=nr(H),xt=or(H),dt={URI:f,map:v,ap:g,of:m},tr={URI:f,map:v,ap:g,chain:q},ht=ar(tr),lt={URI:f,map:v,ap:g,of:m,chain:q},mt={URI:f,reduce:s,foldMap:W,reduceRight:A},It={URI:f,reduce:s,foldMap:W,reduceRight:A,reduceWithIndex:b,foldMapWithIndex:w,reduceRightWithIndex:B},Rt={URI:f,map:v,reduce:s,foldMap:W,reduceRight:A,traverse:T,sequence:z},gt={URI:f,map:v,mapWithIndex:S,reduce:s,foldMap:W,reduceRight:A,traverse:T,sequence:z,reduceWithIndex:b,foldMapWithIndex:w,reduceRightWithIndex:B,traverseWithIndex:X},st={URI:f,map:v,alt:V},Wt={URI:f,map:v,extend:Q,extract:rr},At=m(c.emptyRecord),_t=ir(C),yt=pr(C);var Et=ur(tr),Mt=er(H),x=a.head,h=function(r){return r.slice(1)},M=a.last,j=function(r){return r.slice(0,-1)},Nt=a.min,Ut=a.max,Ft=function(r){return function(t){return t.reduce(r.concat)}},St=function(r){return function(t){return r(x(t),h(t))}},qt=function(r){return function(t){return r(j(t),M(t))}},Lr=function(r){return function(t){return I([r(x(t))],h(t),!0)}},Tt=function(r){return Lr(function(){return r})},Cr=function(r){return function(t){return p(j(t),U(r(M(t))))}},bt=function(r){return Cr(function(){return r})},wt=a.intercalate;function Bt(r){var t=G(r),n=Ar(r);return function(e){return l(e)?n(t(e)):[]}}function Ot(r){return Hr(function(t,n){return r(n)})}var Hr=function(r){return function(t){return Rr(t.filter(function(n,e){return r(e,n)}))}},zt=gr,Lt=sr;function Ct(r,t){return t===void 0?y(r):p(t,y(r))}var Ht=function(r,t){return p(r,U(t))},jt=J,Dt=a.concatAll,Pt={URI:f,of:m,map:v,mapWithIndex:S,ap:g,chain:q,extend:Q,extract:rr,reduce:s,foldMap:W,reduceRight:A,traverse:T,sequence:z,reduceWithIndex:b,foldMapWithIndex:w,reduceRightWithIndex:B,traverseWithIndex:X,alt:V};export{st as Alt,dt as Applicative,H as Apply,tr as Chain,Wt as Comonad,At as Do,mt as Foldable,It as FoldableWithIndex,C as Functor,ft as FunctorWithIndex,lt as Monad,ct as Pointed,Rt as Traversable,gt as TraversableWithIndex,f as URI,qr as alt,Sr as altW,Tr as ap,vt as apFirst,Mt as apS,xt as apSecond,U as append,xr as appendW,Et as bind,_t as bindTo,O as chain,ht as chainFirst,Ur as chainWithIndex,Fr as chop,tt as chunksOf,F as concat,Ft as concatAll,Wr as concatW,Ct as cons,R as copy,nt as duplicate,Y as extend,rr as extract,Ot as filter,Hr as filterWithIndex,it as flap,et as flatten,Dt as fold,Nr as foldMap,Mr as foldMapWithIndex,Rr as fromArray,E as fromReadonlyNonEmptyArray,at as getEq,ut as getSemigroup,ot as getShow,pt as getUnionSemigroup,Ar as group,Xr as groupBy,Bt as groupSort,x as head,j as init,Yr as insertAt,wt as intercalate,rt as intersperse,l as isNonEmpty,P as isOutOfBound,M as last,yt as let,k as makeBy,Z as map,$ as mapWithIndex,St as matchLeft,qt as matchRight,Ut as max,Nt as min,_r as modifyAt,Lr as modifyHead,Cr as modifyLast,Pt as nonEmptyArray,m as of,y as prepend,J as prependAll,jt as prependToAll,vr as prependW,Qr as range,br as reduce,Br as reduceRight,Or as reduceRightWithIndex,wr as reduceWithIndex,Kr as replicate,Vr as reverse,Ir as rotate,z as sequence,Ht as snoc,G as sort,Jr as sortBy,K as splitAt,h as tail,zr as traverse,L as traverseWithIndex,sr as unappend,zt as uncons,mr as union,lr as uniq,gr as unprepend,dr as unsafeInsertAt,hr as unsafeUpdateAt,Lt as unsnoc,$r as unzip,Zr as updateAt,Tt as updateHead,bt as updateLast,Er as zip,yr as zipWith};
