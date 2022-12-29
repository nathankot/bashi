/* esm.sh - esbuild bundle(fp-ts@2.13.1/es6/Map) deno production */
import{pipe as I}from"/v102/fp-ts@2.13.1/deno/es6/function.js";import{flap as P}from"/v102/fp-ts@2.13.1/deno/es6/Functor.js";import*as v from"/v102/fp-ts@2.13.1/deno/es6/internal.js";import*as q from"/v102/fp-ts@2.13.1/deno/es6/Option.js";import*as f from"/v102/fp-ts@2.13.1/deno/es6/ReadonlyMap.js";import{separated as A}from"/v102/fp-ts@2.13.1/deno/es6/Separated.js";import{wiltDefault as B,witherDefault as G}from"/v102/fp-ts@2.13.1/deno/es6/Witherable.js";var h=function(){return h=Object.assign||function(r){for(var e,n=1,t=arguments.length;n<t;n++){e=arguments[n];for(var i in e)Object.prototype.hasOwnProperty.call(e,i)&&(r[i]=e[i])}return r},h.apply(this,arguments)},xe=f.getShow,se=f.size,d=f.isEmpty,he=f.member,Me=f.elem,K=function(r){return function(e){return Array.from(e.keys()).sort(r.compare)}},me=function(r){return function(e){return Array.from(e.values()).sort(r.compare)}};function H(r){var e=K(r);return function(n){return function(t){for(var i=[],u=e(t),a=0,o=u;a<o.length;a++){var p=o[a];i.push(n(p,t.get(p)))}return i}}}function J(r){return H(r)(function(e,n){return[e,n]})}function Ie(r,e){var n=J(r);return function(t){var i=n(t),u=i.length;return e.unfold(0,function(a){return a<u?v.some([i[a],a+1]):v.none})}}var Q=function(r){var e=M(r);return function(n,t){var i=e(n);return function(u){var a=i(u);if(v.isNone(a)){var o=new Map(u);return o.set(n,t),o}else if(a.value[1]!==t){var o=new Map(u);return o.set(a.value[0],t),o}return u}}},V=function(r){var e=M(r);return function(n){return function(t){var i=e(n,t);if(v.isSome(i)){var u=new Map(t);return u.delete(i.value[0]),u}return t}}},We=function(r){var e=X(r);return function(n,t){return e(n,function(){return t})}},X=function(r){var e=M(r);return function(n,t){return function(i){var u=e(n,i);if(v.isNone(u))return v.none;var a=new Map(i);return a.set(u.value[0],t(u.value[1])),v.some(a)}}};function ge(r){var e=Y(r),n=V(r);return function(t){var i=n(t);return function(u){return I(e(t,u),q.map(function(a){return[a,i(u)]}))}}}function M(r){return function(e,n){if(n===void 0){var t=M(r);return function(c){return t(e,c)}}for(var i=n.entries(),u;!(u=i.next()).done;){var a=u.value,o=a[0],p=a[1];if(r.equals(o,e))return v.some([o,p])}return v.none}}var Y=f.lookup,Re=f.isSubmap,we=f.getEq;function _e(r,e){var n=M(r);return{concat:function(t,i){if(d(t))return i;if(d(i))return t;for(var u=new Map(t),a=i.entries(),o;!(o=a.next()).done;){var p=o.value,c=p[0],l=p[1],s=n(c,t);v.isSome(s)?u.set(s.value[0],e.concat(s.value[1],l)):u.set(c,l)}return u},empty:new Map}}var ye=function(r,e){return new Map([[r,e]])};function Ee(r,e,n){return function(t){var i=M(r);return n.reduce(t,new Map,function(u,a){var o=a[0],p=a[1],c=i(o,u);return v.isSome(c)?u.set(c.value[0],e.concat(c.value[1],p)):u.set(o,p),u})}}var W=function(r,e){for(var n=new Map,t=r.entries(),i;!(i=t.next()).done;){var u=i.value,a=u[0],o=u[1];n.set(a,e(a,o))}return n},Z=function(r){return function(e){for(var n=new Map,t=new Map,i=e.entries(),u;!(u=i.next()).done;){var a=u.value,o=a[0],p=a[1],c=r(o,p);v.isLeft(c)?n.set(o,c.left):t.set(o,c.right)}return A(n,t)}};function $(r){return function(e){for(var n=new Map,t=new Map,i=e.entries(),u;!(u=i.next()).done;){var a=u.value,o=a[0],p=a[1];r(o,p)?t.set(o,p):n.set(o,p)}return A(n,t)}}var ee=function(r){return function(e){for(var n=new Map,t=e.entries(),i;!(i=t.next()).done;){var u=i.value,a=u[0],o=u[1],p=r(a,o);v.isSome(p)&&n.set(a,p.value)}return n}};function re(r){return function(e){for(var n=new Map,t=e.entries(),i;!(i=t.next()).done;){var u=i.value,a=u[0],o=u[1];r(a,o)&&n.set(a,o)}return n}}var m=function(r,e){return W(r,function(n,t){return e(t)})},R=function(r,e){return k(r,function(n,t){return e(t)})},w=function(r,e){return O(r,function(n,t){return e(t)})},_=function(r,e){return D(r,function(n,t){return e(t)})},y=function(r,e){return j(r,function(n,t){return e(t)})},k=function(r,e){return I(r,re(e))},O=function(r,e){return I(r,ee(e))},D=function(r,e){return I(r,$(e))},j=function(r,e){return I(r,Z(e))},E=function(r){for(var e=new Map,n=r.entries(),t;!(t=n.next()).done;){var i=t.value,u=i[0],a=i[1];v.isSome(a)&&e.set(u,a.value)}return e},Se=function(r){return function(e){return R(e,r)}},be=function(r){return function(e){return w(e,r)}},Ue=function(r){return function(e){return m(e,r)}},Ae=function(r){return function(e){return W(e,r)}},Fe=function(r){return function(e){return _(e,r)}},qe=function(r){return function(e){return y(e,r)}},S=function(r){for(var e=new Map,n=new Map,t=r.entries(),i;!(i=t.next()).done;){var u=i.value,a=u[0],o=u[1];v.isLeft(o)?e.set(a,o.left):n.set(a,o.right)}return A(e,n)},x="Map",te=function(r,e){var n=oe(r,e);return{concat:function(t,i){return n(i)(t)}}},Ke=function(r,e){return{concat:te(r,e).concat,empty:new Map}},ke=function(r,e){var n=fe(r,e);return{concat:function(t,i){return n(i)(t)}}},Oe=function(r){return function(){var e=pe(r);return{concat:function(n,t){return e(t)(n)}}}};function De(){return{URI:x,_E:void 0,map:m,mapWithIndex:W,compact:E,separate:S,filter:R,filterMap:w,partition:_,partitionMap:y,partitionMapWithIndex:j,partitionWithIndex:D,filterMapWithIndex:O,filterWithIndex:k}}function je(r){var e=ie(r);return{URI:x,_E:void 0,map:m,compact:E,separate:S,filter:R,filterMap:w,partition:_,partitionMap:y,reduce:e.reduce,foldMap:e.foldMap,reduceRight:e.reduceRight,traverse:e.traverse,sequence:e.sequence,mapWithIndex:W,reduceWithIndex:e.reduceWithIndex,foldMapWithIndex:e.foldMapWithIndex,reduceRightWithIndex:e.reduceRightWithIndex,traverseWithIndex:e.traverseWithIndex,wilt:B(e,F),wither:G(e,F)}}var ze=f.reduce,Le=f.foldMap,Ne=f.reduceRight,Te=function(r){return h(h({},f.getFoldable(r)),{URI:x})},Ce=f.reduceWithIndex,Pe=f.foldMapWithIndex,Be=f.reduceRightWithIndex,ne=function(r){return h(h({},f.getFoldableWithIndex(r)),{URI:x})},ie=function(r){var e=ne(r),n=K(r),t=function(a){return function(o,p){for(var c=a.of(new Map),l=n(o),s=l.length,z=function(L){var U=l[L],N=o.get(U);c=a.ap(a.map(c,function(T){return function(C){return T.set(U,C)}}),p(U,N))},b=0;b<s;b++)z(b);return c}},i=function(a){var o=t(a);return function(p,c){return o(p,function(l,s){return c(s)})}},u=function(a){var o=t(a);return function(p){return o(p,function(c,l){return l})}};return{URI:x,_E:void 0,map:m,mapWithIndex:W,reduce:e.reduce,foldMap:e.foldMap,reduceRight:e.reduceRight,reduceWithIndex:e.reduceWithIndex,foldMapWithIndex:e.foldMapWithIndex,reduceRightWithIndex:e.reduceRightWithIndex,traverse:i,sequence:u,traverseWithIndex:t}},ae={URI:x,map:m},Ge=P(ae),F={URI:x,compact:E,separate:S},ue={URI:x,map:m,compact:E,separate:S,filter:R,filterMap:w,partition:_,partitionMap:y},g=function(r){return new Map(r)},oe=function(r,e){var n=f.union(r,e);return function(t){return function(i){return d(i)?g(t):d(t)?g(i):n(t)(i)}}},fe=function(r,e){var n=f.intersection(r,e);return function(t){return function(i){return d(i)||d(t)?new Map:n(t)(i)}}},pe=function(r){var e=f.difference(r);return function(n){return function(t){return d(t)?g(n):d(n)?g(t):e(n)(t)}}},He=new Map,Je=Q,Qe=ue;export{F as Compactable,ue as Filterable,ae as Functor,x as URI,H as collect,E as compact,V as deleteAt,pe as difference,Me as elem,He as empty,Se as filter,be as filterMap,ee as filterMapWithIndex,re as filterWithIndex,Ge as flap,Le as foldMap,Pe as foldMapWithIndex,Ee as fromFoldable,Oe as getDifferenceMagma,we as getEq,De as getFilterableWithIndex,Te as getFoldable,ne as getFoldableWithIndex,ke as getIntersectionSemigroup,_e as getMonoid,xe as getShow,ie as getTraversableWithIndex,Ke as getUnionMonoid,te as getUnionSemigroup,je as getWitherable,Je as insertAt,fe as intersection,d as isEmpty,Re as isSubmap,K as keys,Y as lookup,M as lookupWithKey,Ue as map,Ae as mapWithIndex,Qe as map_,he as member,X as modifyAt,Fe as partition,qe as partitionMap,Z as partitionMapWithIndex,$ as partitionWithIndex,ge as pop,ze as reduce,Ne as reduceRight,Be as reduceRightWithIndex,Ce as reduceWithIndex,S as separate,ye as singleton,se as size,J as toArray,Ie as toUnfoldable,oe as union,We as updateAt,Q as upsertAt,me as values};
