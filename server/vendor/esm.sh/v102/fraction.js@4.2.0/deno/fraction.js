/* esm.sh - esbuild bundle(fraction.js@4.2.0/fraction) deno production */
var j=Object.create;var B=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var A=Object.getOwnPropertyNames;var S=Object.getPrototypeOf,z=Object.prototype.hasOwnProperty;var q=(v,l)=>()=>(l||v((l={exports:{}}).exports,l),l.exports);var X=(v,l,e,c)=>{if(l&&typeof l=="object"||typeof l=="function")for(let a of A(l))!z.call(v,a)&&a!==e&&B(v,a,{get:()=>l[a],enumerable:!(c=x(l,a))||c.enumerable});return v};var Y=(v,l,e)=>(e=v!=null?j(S(v)):{},X(l||!v||!v.__esModule?B(e,"default",{value:v,enumerable:!0}):e,v));var C=q((_,L)=>{(function(v){"use strict";var l=2e3,e={s:1,n:0,d:1};function c(t,i){if(isNaN(t=parseInt(t,10)))throw o.InvalidParameter;return t*i}function a(t,i){if(i===0)throw o.DivisionByZero;var n=Object.create(o.prototype);n.s=t<0?-1:1,t=t<0?-t:t;var r=M(t,i);return n.n=t/r,n.d=i/r,n}function I(t){for(var i={},n=t,r=2,h=4;h<=n;){for(;n%r===0;)n/=r,i[r]=(i[r]||0)+1;h+=1+2*r++}return n!==t?n>1&&(i[n]=(i[n]||0)+1):i[t]=(i[t]||0)+1,i}var N=function(t,i){var n=0,r=1,h=1,d=0,u=0,D=0,y=1,m=1,s=0,f=1,g=1,w=1,b=1e7,P;if(t!=null)if(i!==void 0){if(n=t,r=i,h=n*r,n%1!==0||r%1!==0)throw o.NonIntegerParameter}else switch(typeof t){case"object":{if("d"in t&&"n"in t)n=t.n,r=t.d,"s"in t&&(n*=t.s);else if(0 in t)n=t[0],1 in t&&(r=t[1]);else throw o.InvalidParameter;h=n*r;break}case"number":{if(t<0&&(h=t,t=-t),t%1===0)n=t;else if(t>0){for(t>=1&&(m=Math.pow(10,Math.floor(1+Math.log(t)/Math.LN10)),t/=m);f<=b&&w<=b;)if(P=(s+g)/(f+w),t===P){f+w<=b?(n=s+g,r=f+w):w>f?(n=g,r=w):(n=s,r=f);break}else t>P?(s+=g,f+=w):(g+=s,w+=f),f>b?(n=g,r=w):(n=s,r=f);n*=m}else(isNaN(t)||isNaN(i))&&(r=n=NaN);break}case"string":{if(f=t.match(/\d+|./g),f===null)throw o.InvalidParameter;if(f[s]==="-"?(h=-1,s++):f[s]==="+"&&s++,f.length===s+1?u=c(f[s++],h):f[s+1]==="."||f[s]==="."?(f[s]!=="."&&(d=c(f[s++],h)),s++,(s+1===f.length||f[s+1]==="("&&f[s+3]===")"||f[s+1]==="'"&&f[s+3]==="'")&&(u=c(f[s],h),y=Math.pow(10,f[s].length),s++),(f[s]==="("&&f[s+2]===")"||f[s]==="'"&&f[s+2]==="'")&&(D=c(f[s+1],h),m=Math.pow(10,f[s+1].length)-1,s+=3)):f[s+1]==="/"||f[s+1]===":"?(u=c(f[s],h),y=c(f[s+2],1),s+=3):f[s+3]==="/"&&f[s+1]===" "&&(d=c(f[s],h),u=c(f[s+2],h),y=c(f[s+4],1),s+=5),f.length<=s){r=y*m,h=n=D+r*d+m*u;break}}default:throw o.InvalidParameter}if(r===0)throw o.DivisionByZero;e.s=h<0?-1:1,e.n=Math.abs(n),e.d=Math.abs(r)};function F(t,i,n){for(var r=1;i>0;t=t*t%n,i>>=1)i&1&&(r=r*t%n);return r}function O(t,i){for(;i%2===0;i/=2);for(;i%5===0;i/=5);if(i===1)return 0;for(var n=10%i,r=1;n!==1;r++)if(n=n*10%i,r>l)return 0;return r}function Z(t,i,n){for(var r=1,h=F(10,n,i),d=0;d<300;d++){if(r===h)return d;r=r*10%i,h=h*10%i}return 0}function M(t,i){if(!t)return i;if(!i)return t;for(;;){if(t%=i,!t)return i;if(i%=t,!i)return t}}function o(t,i){if(N(t,i),this instanceof o)t=M(e.d,e.n),this.s=e.s,this.n=e.n/t,this.d=e.d/t;else return a(e.s*e.n,e.d)}o.DivisionByZero=new Error("Division by Zero"),o.InvalidParameter=new Error("Invalid argument"),o.NonIntegerParameter=new Error("Parameters must be integer"),o.prototype={s:1,n:0,d:1,abs:function(){return a(this.n,this.d)},neg:function(){return a(-this.s*this.n,this.d)},add:function(t,i){return N(t,i),a(this.s*this.n*e.d+e.s*this.d*e.n,this.d*e.d)},sub:function(t,i){return N(t,i),a(this.s*this.n*e.d-e.s*this.d*e.n,this.d*e.d)},mul:function(t,i){return N(t,i),a(this.s*e.s*this.n*e.n,this.d*e.d)},div:function(t,i){return N(t,i),a(this.s*e.s*this.n*e.d,this.d*e.n)},clone:function(){return a(this.s*this.n,this.d)},mod:function(t,i){if(isNaN(this.n)||isNaN(this.d))return new o(NaN);if(t===void 0)return a(this.s*this.n%this.d,1);if(N(t,i),e.n===0&&this.d===0)throw o.DivisionByZero;return a(this.s*(e.d*this.n)%(e.n*this.d),e.d*this.d)},gcd:function(t,i){return N(t,i),a(M(e.n,this.n)*M(e.d,this.d),e.d*this.d)},lcm:function(t,i){return N(t,i),e.n===0&&this.n===0?a(0,1):a(e.n*this.n,M(e.n,this.n)*M(e.d,this.d))},ceil:function(t){return t=Math.pow(10,t||0),isNaN(this.n)||isNaN(this.d)?new o(NaN):a(Math.ceil(t*this.s*this.n/this.d),t)},floor:function(t){return t=Math.pow(10,t||0),isNaN(this.n)||isNaN(this.d)?new o(NaN):a(Math.floor(t*this.s*this.n/this.d),t)},round:function(t){return t=Math.pow(10,t||0),isNaN(this.n)||isNaN(this.d)?new o(NaN):a(Math.round(t*this.s*this.n/this.d),t)},inverse:function(){return a(this.s*this.d,this.n)},pow:function(t,i){if(N(t,i),e.d===1)return e.s<0?a(Math.pow(this.s*this.d,e.n),Math.pow(this.n,e.n)):a(Math.pow(this.s*this.n,e.n),Math.pow(this.d,e.n));if(this.s<0)return null;var n=I(this.n),r=I(this.d),h=1,d=1;for(var u in n)if(u!=="1"){if(u==="0"){h=0;break}if(n[u]*=e.n,n[u]%e.d===0)n[u]/=e.d;else return null;h*=Math.pow(u,n[u])}for(var u in r)if(u!=="1"){if(r[u]*=e.n,r[u]%e.d===0)r[u]/=e.d;else return null;d*=Math.pow(u,r[u])}return e.s<0?a(d,h):a(h,d)},equals:function(t,i){return N(t,i),this.s*this.n*e.d===e.s*e.n*this.d},compare:function(t,i){N(t,i);var n=this.s*this.n*e.d-e.s*e.n*this.d;return(0<n)-(n<0)},simplify:function(t){if(isNaN(this.n)||isNaN(this.d))return this;t=t||.001;for(var i=this.abs(),n=i.toContinued(),r=1;r<n.length;r++){for(var h=a(n[r-1],1),d=r-2;d>=0;d--)h=h.inverse().add(n[d]);if(h.sub(i).abs().valueOf()<t)return h.mul(this.s)}return this},divisible:function(t,i){return N(t,i),!(!(e.n*this.d)||this.n*e.d%(e.n*this.d))},valueOf:function(){return this.s*this.n/this.d},toFraction:function(t){var i,n="",r=this.n,h=this.d;return this.s<0&&(n+="-"),h===1?n+=r:(t&&(i=Math.floor(r/h))>0&&(n+=i,n+=" ",r%=h),n+=r,n+="/",n+=h),n},toLatex:function(t){var i,n="",r=this.n,h=this.d;return this.s<0&&(n+="-"),h===1?n+=r:(t&&(i=Math.floor(r/h))>0&&(n+=i,r%=h),n+="\\frac{",n+=r,n+="}{",n+=h,n+="}"),n},toContinued:function(){var t,i=this.n,n=this.d,r=[];if(isNaN(i)||isNaN(n))return r;do r.push(Math.floor(i/n)),t=i%n,i=n,n=t;while(i!==1);return r},toString:function(t){var i=this.n,n=this.d;if(isNaN(i)||isNaN(n))return"NaN";t=t||15;var r=O(i,n),h=Z(i,n,r),d=this.s<0?"-":"";if(d+=i/n|0,i%=n,i*=10,i&&(d+="."),r){for(var u=h;u--;)d+=i/n|0,i%=n,i*=10;d+="(";for(var u=r;u--;)d+=i/n|0,i%=n,i*=10;d+=")"}else for(var u=t;i&&u--;)d+=i/n|0,i%=n,i*=10;return d}},typeof define=="function"&&define.amd?define([],function(){return o}):typeof _=="object"?(Object.defineProperty(o,"__esModule",{value:!0}),o.default=o,o.Fraction=o,L.exports=o):v.Fraction=o})(_)});var G=Y(C()),{default:E,...H}=G,K=E!==void 0?E:H;export{K as default};
/*! Bundled license information:

fraction.js/fraction.js:
  (**
   * @license Fraction.js v4.2.0 05/03/2022
   * https://www.xarg.org/2014/03/rational-numbers-in-javascript/
   *
   * Copyright (c) 2021, Robert Eisele (robert@xarg.org)
   * Dual licensed under the MIT or GPL Version 2 licenses.
   **)
*/
