/* esm.sh - esbuild bundle(seedrandom@3.0.5) deno production */
import __crypto$ from "https://deno.land/std@0.173.0/node/crypto.ts";var un=Object.create;var I=Object.defineProperty;var cn=Object.getOwnPropertyDescriptor;var an=Object.getOwnPropertyNames;var xn=Object.getPrototypeOf,sn=Object.prototype.hasOwnProperty;var ln=(x=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(x,{get:(c,a)=>(typeof require<"u"?require:c)[a]}):x)(function(x){if(typeof require<"u")return require.apply(this,arguments);throw new Error('Dynamic require of "'+x+'" is not supported')});var S=(x,c)=>()=>(c||x((c={exports:{}}).exports,c),c.exports);var hn=(x,c,a,v)=>{if(c&&typeof c=="object"||typeof c=="function")for(let l of an(c))!sn.call(x,l)&&l!==a&&I(x,l,{get:()=>c[l],enumerable:!(v=cn(c,l))||v.enumerable});return x};var vn=(x,c,a)=>(a=x!=null?un(xn(x)):{},hn(c||!x||!x.__esModule?I(a,"default",{value:x,enumerable:!0}):a,x));var K=S((J,B)=>{(function(x,c,a){function v(n){var e=this,i=o();e.next=function(){var t=2091639*e.s0+e.c*23283064365386963e-26;return e.s0=e.s1,e.s1=e.s2,e.s2=t-(e.c=t|0)},e.c=1,e.s0=i(" "),e.s1=i(" "),e.s2=i(" "),e.s0-=i(n),e.s0<0&&(e.s0+=1),e.s1-=i(n),e.s1<0&&(e.s1+=1),e.s2-=i(n),e.s2<0&&(e.s2+=1),i=null}function l(n,e){return e.c=n.c,e.s0=n.s0,e.s1=n.s1,e.s2=n.s2,e}function w(n,e){var i=new v(n),t=e&&e.state,r=i.next;return r.int32=function(){return i.next()*4294967296|0},r.double=function(){return r()+(r()*2097152|0)*11102230246251565e-32},r.quick=r,t&&(typeof t=="object"&&l(t,i),r.state=function(){return l(i,{})}),r}function o(){var n=4022871197,e=function(i){i=String(i);for(var t=0;t<i.length;t++){n+=i.charCodeAt(t);var r=.02519603282416938*n;n=r>>>0,r-=n,r*=n,n=r>>>0,r-=n,n+=r*4294967296}return(n>>>0)*23283064365386963e-26};return e}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.alea=w})(J,typeof B=="object"&&B,typeof define=="function"&&define)});var N=S((L,U)=>{(function(x,c,a){function v(o){var n=this,e="";n.x=0,n.y=0,n.z=0,n.w=0,n.next=function(){var t=n.x^n.x<<11;return n.x=n.y,n.y=n.z,n.z=n.w,n.w^=n.w>>>19^t^t>>>8},o===(o|0)?n.x=o:e+=o;for(var i=0;i<e.length+64;i++)n.x^=e.charCodeAt(i)|0,n.next()}function l(o,n){return n.x=o.x,n.y=o.y,n.z=o.z,n.w=o.w,n}function w(o,n){var e=new v(o),i=n&&n.state,t=function(){return(e.next()>>>0)/4294967296};return t.double=function(){do var r=e.next()>>>11,f=(e.next()>>>0)/4294967296,u=(r+f)/(1<<21);while(u===0);return u},t.int32=e.next,t.quick=t,i&&(typeof i=="object"&&l(i,e),t.state=function(){return l(e,{})}),t}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.xor128=w})(L,typeof U=="object"&&U,typeof define=="function"&&define)});var P=S((O,V)=>{(function(x,c,a){function v(o){var n=this,e="";n.next=function(){var t=n.x^n.x>>>2;return n.x=n.y,n.y=n.z,n.z=n.w,n.w=n.v,(n.d=n.d+362437|0)+(n.v=n.v^n.v<<4^(t^t<<1))|0},n.x=0,n.y=0,n.z=0,n.w=0,n.v=0,o===(o|0)?n.x=o:e+=o;for(var i=0;i<e.length+64;i++)n.x^=e.charCodeAt(i)|0,i==e.length&&(n.d=n.x<<10^n.x>>>4),n.next()}function l(o,n){return n.x=o.x,n.y=o.y,n.z=o.z,n.w=o.w,n.v=o.v,n.d=o.d,n}function w(o,n){var e=new v(o),i=n&&n.state,t=function(){return(e.next()>>>0)/4294967296};return t.double=function(){do var r=e.next()>>>11,f=(e.next()>>>0)/4294967296,u=(r+f)/(1<<21);while(u===0);return u},t.int32=e.next,t.quick=t,i&&(typeof i=="object"&&l(i,e),t.state=function(){return l(e,{})}),t}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.xorwow=w})(O,typeof V=="object"&&V,typeof define=="function"&&define)});var T=S((Q,E)=>{(function(x,c,a){function v(o){var n=this;n.next=function(){var i=n.x,t=n.i,r,f,u;return r=i[t],r^=r>>>7,f=r^r<<24,r=i[t+1&7],f^=r^r>>>10,r=i[t+3&7],f^=r^r>>>3,r=i[t+4&7],f^=r^r<<7,r=i[t+7&7],r=r^r<<13,f^=r^r<<9,i[t]=f,n.i=t+1&7,f};function e(i,t){var r,f,u=[];if(t===(t|0))f=u[0]=t;else for(t=""+t,r=0;r<t.length;++r)u[r&7]=u[r&7]<<15^t.charCodeAt(r)+u[r+1&7]<<13;for(;u.length<8;)u.push(0);for(r=0;r<8&&u[r]===0;++r);for(r==8?f=u[7]=-1:f=u[r],i.x=u,i.i=0,r=256;r>0;--r)i.next()}e(n,o)}function l(o,n){return n.x=o.x.slice(),n.i=o.i,n}function w(o,n){o==null&&(o=+new Date);var e=new v(o),i=n&&n.state,t=function(){return(e.next()>>>0)/4294967296};return t.double=function(){do var r=e.next()>>>11,f=(e.next()>>>0)/4294967296,u=(r+f)/(1<<21);while(u===0);return u},t.int32=e.next,t.quick=t,i&&(i.x&&l(i,e),t.state=function(){return l(e,{})}),t}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.xorshift7=w})(Q,typeof E=="object"&&E,typeof define=="function"&&define)});var Y=S((W,F)=>{(function(x,c,a){function v(o){var n=this;n.next=function(){var i=n.w,t=n.X,r=n.i,f,u;return n.w=i=i+1640531527|0,u=t[r+34&127],f=t[r=r+1&127],u^=u<<13,f^=f<<17,u^=u>>>15,f^=f>>>12,u=t[r]=u^f,n.i=r,u+(i^i>>>16)|0};function e(i,t){var r,f,u,b,z,q=[],G=128;for(t===(t|0)?(f=t,t=null):(t=t+"\0",f=0,G=Math.max(G,t.length)),u=0,b=-32;b<G;++b)t&&(f^=t.charCodeAt((b+32)%t.length)),b===0&&(z=f),f^=f<<10,f^=f>>>15,f^=f<<4,f^=f>>>13,b>=0&&(z=z+1640531527|0,r=q[b&127]^=f+z,u=r==0?u+1:0);for(u>=128&&(q[(t&&t.length||0)&127]=-1),u=127,b=4*128;b>0;--b)f=q[u+34&127],r=q[u=u+1&127],f^=f<<13,r^=r<<17,f^=f>>>15,r^=r>>>12,q[u]=f^r;i.w=z,i.X=q,i.i=u}e(n,o)}function l(o,n){return n.i=o.i,n.w=o.w,n.X=o.X.slice(),n}function w(o,n){o==null&&(o=+new Date);var e=new v(o),i=n&&n.state,t=function(){return(e.next()>>>0)/4294967296};return t.double=function(){do var r=e.next()>>>11,f=(e.next()>>>0)/4294967296,u=(r+f)/(1<<21);while(u===0);return u},t.int32=e.next,t.quick=t,i&&(i.X&&l(i,e),t.state=function(){return l(e,{})}),t}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.xor4096=w})(W,typeof F=="object"&&F,typeof define=="function"&&define)});var $=S((Z,H)=>{(function(x,c,a){function v(o){var n=this,e="";n.next=function(){var t=n.b,r=n.c,f=n.d,u=n.a;return t=t<<25^t>>>7^r,r=r-f|0,f=f<<24^f>>>8^u,u=u-t|0,n.b=t=t<<20^t>>>12^r,n.c=r=r-f|0,n.d=f<<16^r>>>16^u,n.a=u-t|0},n.a=0,n.b=0,n.c=-1640531527,n.d=1367130551,o===Math.floor(o)?(n.a=o/4294967296|0,n.b=o|0):e+=o;for(var i=0;i<e.length+20;i++)n.b^=e.charCodeAt(i)|0,n.next()}function l(o,n){return n.a=o.a,n.b=o.b,n.c=o.c,n.d=o.d,n}function w(o,n){var e=new v(o),i=n&&n.state,t=function(){return(e.next()>>>0)/4294967296};return t.double=function(){do var r=e.next()>>>11,f=(e.next()>>>0)/4294967296,u=(r+f)/(1<<21);while(u===0);return u},t.int32=e.next,t.quick=t,i&&(typeof i=="object"&&l(i,e),t.state=function(){return l(e,{})}),t}c&&c.exports?c.exports=w:a&&a.amd?a(function(){return w}):this.tychei=w})(Z,typeof H=="object"&&H,typeof define=="function"&&define)});var tn=S((nn,k)=>{(function(x,c,a){var v=256,l=6,w=52,o="random",n=a.pow(v,l),e=a.pow(2,w),i=e*2,t=v-1,r;function f(s,h,g){var p=[];h=h==!0?{entropy:!0}:h||{};var y=q(z(h.entropy?[s,M(c)]:s??G(),3),p),j=new u(p),d=function(){for(var m=j.g(l),C=n,X=0;m<e;)m=(m+X)*v,C*=v,X=j.g(1);for(;m>=i;)m/=2,C/=2,X>>>=1;return(m+X)/C};return d.int32=function(){return j.g(4)|0},d.quick=function(){return j.g(4)/4294967296},d.double=d,q(M(j.S),c),(h.pass||g||function(m,C,X,A){return A&&(A.S&&b(A,j),m.state=function(){return b(j,{})}),X?(a[o]=m,C):m})(d,y,"global"in h?h.global:this==a,h.state)}function u(s){var h,g=s.length,p=this,y=0,j=p.i=p.j=0,d=p.S=[];for(g||(s=[g++]);y<v;)d[y]=y++;for(y=0;y<v;y++)d[y]=d[j=t&j+s[y%g]+(h=d[y])],d[j]=h;(p.g=function(m){for(var C,X=0,A=p.i,R=p.j,D=p.S;m--;)C=D[A=t&A+1],X=X*v+D[t&(D[A]=D[R=t&R+C])+(D[R]=C)];return p.i=A,p.j=R,X})(v)}function b(s,h){return h.i=s.i,h.j=s.j,h.S=s.S.slice(),h}function z(s,h){var g=[],p=typeof s,y;if(h&&p=="object")for(y in s)try{g.push(z(s[y],h-1))}catch{}return g.length?g:p=="string"?s:s+"\0"}function q(s,h){for(var g=s+"",p,y=0;y<g.length;)h[t&y]=t&(p^=h[t&y]*19)+g.charCodeAt(y++);return M(h)}function G(){try{var s;return r&&(s=r.randomBytes)?s=s(v):(s=new Uint8Array(v),(x.crypto||x.msCrypto).getRandomValues(s)),M(s)}catch{var h=x.navigator,g=h&&h.plugins;return[+new Date,x,g,x.screen,M(c)]}}function M(s){return String.fromCharCode.apply(0,s)}if(q(a.random(),c),typeof k=="object"&&k.exports){k.exports=f;try{r=__crypto$}catch{}}else typeof define=="function"&&define.amd?define(function(){return f}):a["seed"+o]=f})(typeof self<"u"?self:nn,[],Math)});var en=S((qn,rn)=>{var wn=K(),yn=N(),pn=P(),gn=T(),bn=Y(),jn=$(),_=tn();_.alea=wn;_.xor128=yn;_.xorwow=pn;_.xorshift7=gn;_.xor4096=bn;_.tychei=jn;rn.exports=_});var fn=vn(en()),{alea:Xn,xor128:Cn,xorwow:zn,xorshift7:An,xor4096:Sn,tychei:_n}=fn,{default:on,...mn}=fn,Gn=on!==void 0?on:mn;export{Xn as alea,Gn as default,_n as tychei,Cn as xor128,Sn as xor4096,An as xorshift7,zn as xorwow};