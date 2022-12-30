/* esm.sh - esbuild bundle(fp-ts@2.13.1/es6/Either) deno production */
import{getApplicativeMonoid as T}from"/v102/fp-ts@2.13.1/deno/es6/Applicative.js";import{apFirst as Q,apS as X,apSecond as Y,getApplySemigroup as J}from"/v102/fp-ts@2.13.1/deno/es6/Apply.js";import{bind as Z,chainFirst as $}from"/v102/fp-ts@2.13.1/deno/es6/Chain.js";import{tailRec as rr}from"/v102/fp-ts@2.13.1/deno/es6/ChainRec.js";import{chainOptionK as tr,filterOrElse as er,fromOption as nr,fromOptionK as or,fromPredicate as ir}from"/v102/fp-ts@2.13.1/deno/es6/FromEither.js";import{flow as ar,identity as m,pipe as v}from"/v102/fp-ts@2.13.1/deno/es6/function.js";import{bindTo as pr,flap as ur,let as cr}from"/v102/fp-ts@2.13.1/deno/es6/Functor.js";import*as u from"/v102/fp-ts@2.13.1/deno/es6/internal.js";import{separated as l}from"/v102/fp-ts@2.13.1/deno/es6/Separated.js";import{wiltDefault as fr,witherDefault as vr}from"/v102/fp-ts@2.13.1/deno/es6/Witherable.js";var f=u.left,i=u.right,c=function(t,r){return v(t,xr(r))},d=function(t,r){return v(t,dr(r))},_=function(t,r){return v(t,B(r))},E=function(t,r,e){return v(t,mr(r,e))},y=function(t){return function(r,e){var o=_r(t);return v(r,o(e))}},I=function(t,r,e){return v(t,Rr(r,e))},O=function(t){var r=Er(t);return function(e,o){return v(e,r(o))}},A=function(t,r,e){return v(t,yr(r,e))},w=function(t,r){return v(t,Ir(r))},V=function(t,r){return v(t,Or(r))},b=function(t,r){return v(t,j(r))},F=function(t,r){return rr(r(t),function(e){return n(e)?i(f(e.left)):n(e.right)?f(r(e.right.left)):i(i(e.right.right))})},a="Either",Zr=function(t,r){return{show:function(e){return n(e)?"left(".concat(t.show(e.left),")"):"right(".concat(r.show(e.right),")")}}},$r=function(t,r){return{equals:function(e,o){return e===o||(n(e)?n(o)&&t.equals(e.left,o.left):k(o)&&r.equals(e.right,o.right))}}},rt=function(t){return{concat:function(r,e){return n(e)?r:n(r)?e:i(t.concat(r.right,e.right))}}},P=function(t){var r=f(t.empty);return{URI:a,_E:void 0,compact:function(e){return n(e)?e:e.right._tag==="None"?r:i(e.right.value)},separate:function(e){return n(e)?l(e,e):n(e.right)?l(i(e.right.left),r):l(r,i(e.right.right))}}},lr=function(t){var r=f(t.empty),e=P(t),o=e.compact,x=e.separate,R=function(p,g){return n(p)||g(p.right)?p:r},H=function(p,g){return n(p)?l(p,p):g(p.right)?l(r,i(p.right)):l(i(p.right),r)};return{URI:a,_E:void 0,map:c,compact:o,separate:x,filter:R,filterMap:function(p,g){if(n(p))return p;var s=g(p.right);return s._tag==="None"?r:i(s.value)},partition:H,partitionMap:function(p,g){if(n(p))return l(p,p);var s=g(p.right);return n(s)?l(i(s.left),r):l(r,i(s.right))}}},tt=function(t){var r=lr(t),e=P(t);return{URI:a,_E:void 0,map:c,compact:r.compact,separate:r.separate,filter:r.filter,filterMap:r.filterMap,partition:r.partition,partitionMap:r.partitionMap,traverse:O,sequence:W,reduce:E,foldMap:y,reduceRight:I,wither:vr(L,e),wilt:fr(L,e)}},N=function(t){return{URI:a,_E:void 0,map:c,ap:function(r,e){return n(r)?n(e)?f(t.concat(r.left,e.left)):r:n(e)?e:i(r.right(e.right))},of:h}},hr=function(t){return{URI:a,_E:void 0,map:c,alt:function(r,e){if(k(r))return r;var o=e();return n(o)?f(t.concat(r.left,o.left)):o}}},xr=function(t){return function(r){return n(r)?r:i(t(r.right))}},q={URI:a,map:c},h=i,et={URI:a,of:h},gr=function(t){return function(r){return n(r)?r:n(t)?t:i(r.right(t.right))}},dr=gr,S={URI:a,map:c,ap:d},sr={URI:a,map:c,ap:d,of:h},D=function(t){return function(r){return n(r)?r:t(r.right)}},B=D,M={URI:a,map:c,ap:d,chain:_},nt={URI:a,map:c,ap:d,of:h,chain:_},mr=function(t,r){return function(e){return n(e)?t:r(t,e.right)}},_r=function(t){return function(r){return function(e){return n(e)?t.empty:r(e.right)}}},Rr=function(t,r){return function(e){return n(e)?t:r(e.right,t)}},ot={URI:a,reduce:E,foldMap:y,reduceRight:I},Er=function(t){return function(r){return function(e){return n(e)?t.of(f(e.left)):t.map(r(e.right),i)}}},W=function(t){return function(r){return n(r)?t.of(f(r.left)):t.map(r.right,i)}},L={URI:a,map:c,reduce:E,foldMap:y,reduceRight:I,traverse:O,sequence:W},yr=function(t,r){return function(e){return n(e)?f(t(e.left)):i(r(e.right))}},Ir=function(t){return function(r){return n(r)?f(t(r.left)):r}},it={URI:a,bimap:A,mapLeft:w},Ur=function(t){return function(r){return n(r)?t():r}},Or=Ur,at={URI:a,map:c,alt:V},j=function(t){return function(r){return n(r)?r:i(t(r))}},pt={URI:a,map:c,extend:b},ut={URI:a,map:c,ap:d,chain:_,chainRec:F},K=f,ct={URI:a,map:c,ap:d,of:h,chain:_,throwError:K},U={URI:a,fromEither:m},ft=ir(U),vt=nr(U),n=u.isLeft,k=u.isRight,z=function(t,r){return function(e){return n(e)?t(e.left):r(e.right)}},Sr=z,Mr=z,lt=Mr,Wr=function(t){return function(r){return n(r)?t(r.left):r.right}},ht=Wr,xt=ur(q),Ar=Q(S),gt=Ar,wr=Y(S),dt=wr,br=$(M),st=br,Fr=D(m),mt=Fr,_t=j(m),Rt=or(U),Et=tr(U,M),Nr=er(U,M),yt=Nr,It=function(t){return n(t)?i(t.left):f(t.right)},qr=function(t){return function(r){return n(r)?t(r.left):r}},Ut=qr,Kr=function(t){return function(r){return r==null?f(t):i(r)}},C=function(t,r){try{return i(t())}catch(e){return f(r(e))}},Ot=function(t,r){return function(){for(var e=[],o=0;o<arguments.length;o++)e[o]=arguments[o];return C(function(){return t.apply(void 0,e)},r)}},Cr=function(t){var r=Kr(t);return function(e){return ar(e,r)}},St=function(t){var r=Cr(t);return function(e){return B(r(e))}},Mt=Sr(m,m);function Wt(t){return t instanceof Error?t:new Error(String(t))}function Lr(t){return function(r,e){if(e===void 0){var o=Lr(t);return function(x){return o(r,x)}}return n(e)?!1:t.equals(r,e.right)}}var At=function(t){return function(r){return n(r)?!1:t(r.right)}},wt=h(u.emptyRecord),bt=pr(q),Ft=cr(q);var Tr=Z(M),Nt=Tr,Jr=X(S),qt=Jr,Vr=h(u.emptyReadonlyArray),Pr=function(t){return function(r){var e=t(0,u.head(r));if(n(e))return e;for(var o=[e.right],x=1;x<r.length;x++){var R=t(x,r[x]);if(n(R))return R;o.push(R.right)}return i(o)}},G=function(t){var r=Pr(t);return function(e){return u.isNonEmpty(e)?r(e):Vr}},Kt=G,Dr=function(t){return G(function(r,e){return t(e)})},Ct=Dr(m);function Lt(t,r){return C(function(){return JSON.parse(t)},r)}var Tt=function(t,r){return C(function(){var e=JSON.stringify(t);if(typeof e!="string")throw new Error("Converting unsupported structure to JSON");return e},r)},Jt={URI:a,map:c,of:h,ap:d,chain:_,reduce:E,foldMap:y,reduceRight:I,traverse:O,sequence:W,bimap:A,mapLeft:w,alt:V,extend:b,chainRec:F,throwError:K},Vt=J(S),Pt=T(sr),Dt=function(t,r){return J(N(t))(r)},Bt=function(t,r){return T(N(t))(r)};function jt(t){var r=N(t).ap,e=hr(t).alt;return{URI:a,_E:void 0,map:c,of:h,chain:_,bimap:A,mapLeft:w,reduce:E,foldMap:y,reduceRight:I,extend:b,traverse:O,sequence:W,chainRec:F,throwError:K,ap:r,alt:e}}export{at as Alt,Vr as ApT,sr as Applicative,S as Apply,it as Bifunctor,M as Chain,ut as ChainRec,wt as Do,pt as Extend,ot as Foldable,U as FromEither,q as Functor,nt as Monad,ct as MonadThrow,et as Pointed,L as Traversable,a as URI,Or as alt,Ur as altW,dr as ap,Ar as apFirst,gt as apFirstW,Jr as apS,qt as apSW,wr as apSecond,dt as apSecondW,gr as apW,yr as bimap,Tr as bind,bt as bindTo,Nt as bindW,B as chain,br as chainFirst,st as chainFirstW,St as chainNullableK,Et as chainOptionK,D as chainW,_t as duplicate,Jt as either,Lr as elem,At as exists,j as extend,Nr as filterOrElse,yt as filterOrElseW,xt as flap,mt as flatten,Fr as flattenW,lt as fold,_r as foldMap,Sr as foldW,Kr as fromNullable,Cr as fromNullableK,vt as fromOption,Rt as fromOptionK,ft as fromPredicate,hr as getAltValidation,N as getApplicativeValidation,Pt as getApplyMonoid,Vt as getApplySemigroup,P as getCompactable,$r as getEq,lr as getFilterable,ht as getOrElse,Wr as getOrElseW,rt as getSemigroup,Zr as getShow,jt as getValidation,Bt as getValidationMonoid,Dt as getValidationSemigroup,tt as getWitherable,n as isLeft,k as isRight,f as left,Ft as let,xr as map,Ir as mapLeft,Mr as match,z as matchW,h as of,Ut as orElse,qr as orElseW,Lt as parseJSON,mr as reduce,Rr as reduceRight,i as right,W as sequence,Ct as sequenceArray,Tt as stringifyJSON,It as swap,K as throwError,Wt as toError,Mt as toUnion,Er as traverse,Dr as traverseArray,Kt as traverseArrayWithIndex,G as traverseReadonlyArrayWithIndex,Pr as traverseReadonlyNonEmptyArrayWithIndex,C as tryCatch,Ot as tryCatchK};