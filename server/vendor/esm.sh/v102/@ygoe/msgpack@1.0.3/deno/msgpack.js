/* esm.sh - esbuild bundle(@ygoe/msgpack@1.0.3/msgpack) deno production */
var S=Object.create;var B=Object.defineProperty;var _=Object.getOwnPropertyDescriptor;var j=Object.getOwnPropertyNames;var R=Object.getPrototypeOf,q=Object.prototype.hasOwnProperty;var N=(g,p)=>()=>(p||g((p={exports:{}}).exports,p),p.exports);var V=(g,p,b,v)=>{if(p&&typeof p=="object"||typeof p=="function")for(let A of j(p))!q.call(g,A)&&A!==b&&B(g,A,{get:()=>p[A],enumerable:!(v=_(p,A))||v.enumerable});return g};var L=(g,p,b)=>(b=g!=null?S(R(g)):{},V(p||!g||!g.__esModule?B(b,"default",{value:g,enumerable:!0}):b,g));var D=N((G,k)=>{(function(){"use strict";function g(o,h){if(h&&h.multiple&&!Array.isArray(o))throw new Error("Invalid argument type: Expected an Array to serialize multiple values.");let w=4294967296,l,u,r=new Uint8Array(128),x=0;if(h&&h.multiple)for(let e=0;e<o.length;e++)s(o[e]);else s(o);return r.subarray(0,x);function s(e,n){switch(typeof e){case"undefined":E(e);break;case"boolean":U(e);break;case"number":F(e);break;case"string":T(e);break;case"object":e===null?E(e):e instanceof Date?f(e):Array.isArray(e)?m(e):e instanceof Uint8Array||e instanceof Uint8ClampedArray?d(e):e instanceof Int8Array||e instanceof Int16Array||e instanceof Uint16Array||e instanceof Int32Array||e instanceof Uint32Array||e instanceof Float32Array||e instanceof Float64Array?m(e):I(e);break;default:if(!n&&h&&h.invalidTypeReplacement)typeof h.invalidTypeReplacement=="function"?s(h.invalidTypeReplacement(e),!0):s(h.invalidTypeReplacement,!0);else throw new Error("Invalid argument type: The type '"+typeof e+"' cannot be serialized.")}}function E(e){c(192)}function U(e){c(e?195:194)}function F(e){if(isFinite(e)&&Math.floor(e)===e)if(e>=0&&e<=127)c(e);else if(e<0&&e>=-32)c(e);else if(e>0&&e<=255)t([204,e]);else if(e>=-128&&e<=127)t([208,e]);else if(e>0&&e<=65535)t([205,e>>>8,e]);else if(e>=-32768&&e<=32767)t([209,e>>>8,e]);else if(e>0&&e<=4294967295)t([206,e>>>24,e>>>16,e>>>8,e]);else if(e>=-2147483648&&e<=2147483647)t([210,e>>>24,e>>>16,e>>>8,e]);else if(e>0&&e<=18446744073709552e3){let n=e/w,i=e%w;t([211,n>>>24,n>>>16,n>>>8,n,i>>>24,i>>>16,i>>>8,i])}else e>=-9223372036854776e3&&e<=9223372036854776e3?(c(211),y(e)):e<0?t([211,128,0,0,0,0,0,0,0]):t([207,255,255,255,255,255,255,255,255]);else u||(l=new ArrayBuffer(8),u=new DataView(l)),u.setFloat64(0,e),c(203),t(new Uint8Array(l))}function T(e){let n=b(e),i=n.length;i<=31?c(160+i):i<=255?t([217,i]):i<=65535?t([218,i>>>8,i]):t([219,i>>>24,i>>>16,i>>>8,i]),t(n)}function m(e){let n=e.length;n<=15?c(144+n):n<=65535?t([220,n>>>8,n]):t([221,n>>>24,n>>>16,n>>>8,n]);for(let i=0;i<n;i++)s(e[i])}function d(e){let n=e.length;n<=15?t([196,n]):n<=65535?t([197,n>>>8,n]):t([198,n>>>24,n>>>16,n>>>8,n]),t(e)}function I(e){let n=0;for(let i in e)e[i]!==void 0&&n++;n<=15?c(128+n):n<=65535?t([222,n>>>8,n]):t([223,n>>>24,n>>>16,n>>>8,n]);for(let i in e){let C=e[i];C!==void 0&&(s(i),s(C))}}function f(e){let n=e.getTime()/1e3;if(e.getMilliseconds()===0&&n>=0&&n<4294967296)t([214,255,n>>>24,n>>>16,n>>>8,n]);else if(n>=0&&n<17179869184){let i=e.getMilliseconds()*1e6;t([215,255,i>>>22,i>>>14,i>>>6,i<<2>>>0|n/w,n>>>24,n>>>16,n>>>8,n])}else{let i=e.getMilliseconds()*1e6;t([199,12,255,i>>>24,i>>>16,i>>>8,i]),y(n)}}function c(e){if(r.length<x+1){let n=r.length*2;for(;n<x+1;)n*=2;let i=new Uint8Array(n);i.set(r),r=i}r[x]=e,x++}function t(e){if(r.length<x+e.length){let n=r.length*2;for(;n<x+e.length;)n*=2;let i=new Uint8Array(n);i.set(r),r=i}r.set(e,x),x+=e.length}function y(e){let n,i;e>=0?(n=e/w,i=e%w):(e++,n=Math.abs(e)/w,i=Math.abs(e)%w,n=~n,i=~i),t([n>>>24,n>>>16,n>>>8,n,i>>>24,i>>>16,i>>>8,i])}}function p(o,h){let l=0;if(o instanceof ArrayBuffer&&(o=new Uint8Array(o)),typeof o!="object"||typeof o.length>"u")throw new Error("Invalid argument type: Expected a byte array (Array or Uint8Array) to deserialize.");if(!o.length)throw new Error("Invalid argument: The byte array to deserialize is empty.");o instanceof Uint8Array||(o=new Uint8Array(o));let u;if(h&&h.multiple)for(u=[];l<o.length;)u.push(r());else u=r();return u;function r(){let f=o[l++];if(f>=0&&f<=127)return f;if(f>=128&&f<=143)return F(f-128);if(f>=144&&f<=159)return T(f-144);if(f>=160&&f<=191)return m(f-160);if(f===192)return null;if(f===193)throw new Error("Invalid byte code 0xc1 found.");if(f===194)return!1;if(f===195)return!0;if(f===196)return U(-1,1);if(f===197)return U(-1,2);if(f===198)return U(-1,4);if(f===199)return d(-1,1);if(f===200)return d(-1,2);if(f===201)return d(-1,4);if(f===202)return E(4);if(f===203)return E(8);if(f===204)return s(1);if(f===205)return s(2);if(f===206)return s(4);if(f===207)return s(8);if(f===208)return x(1);if(f===209)return x(2);if(f===210)return x(4);if(f===211)return x(8);if(f===212)return d(1);if(f===213)return d(2);if(f===214)return d(4);if(f===215)return d(8);if(f===216)return d(16);if(f===217)return m(-1,1);if(f===218)return m(-1,2);if(f===219)return m(-1,4);if(f===220)return T(-1,2);if(f===221)return T(-1,4);if(f===222)return F(-1,2);if(f===223)return F(-1,4);if(f>=224&&f<=255)return f-256;throw console.debug("msgpack array:",o),new Error("Invalid byte value '"+f+"' at index "+(l-1)+" in the MessagePack binary data (length "+o.length+"): Expecting a range of 0 to 255. This is not a byte array.")}function x(f){let c=0,t=!0;for(;f-- >0;)if(t){let y=o[l++];c+=y&127,y&128&&(c-=128),t=!1}else c*=256,c+=o[l++];return c}function s(f){let c=0;for(;f-- >0;)c*=256,c+=o[l++];return c}function E(f){let c=new DataView(o.buffer,l+o.byteOffset,f);if(l+=f,f===4)return c.getFloat32(0,!1);if(f===8)return c.getFloat64(0,!1)}function U(f,c){f<0&&(f=s(c));let t=o.subarray(l,l+f);return l+=f,t}function F(f,c){f<0&&(f=s(c));let t={};for(;f-- >0;){let y=r();t[y]=r()}return t}function T(f,c){f<0&&(f=s(c));let t=[];for(;f-- >0;)t.push(r());return t}function m(f,c){f<0&&(f=s(c));let t=l;return l+=f,v(o,t,f)}function d(f,c){f<0&&(f=s(c));let t=s(1),y=U(f);switch(t){case 255:return I(y)}return{type:t,data:y}}function I(f){if(f.length===4){let c=(f[0]<<24>>>0)+(f[1]<<16>>>0)+(f[2]<<8>>>0)+f[3];return new Date(c*1e3)}if(f.length===8){let c=(f[0]<<22>>>0)+(f[1]<<14>>>0)+(f[2]<<6>>>0)+(f[3]>>>2),t=(f[3]&3)*4294967296+(f[4]<<24>>>0)+(f[5]<<16>>>0)+(f[6]<<8>>>0)+f[7];return new Date(t*1e3+c/1e6)}if(f.length===12){let c=(f[0]<<24>>>0)+(f[1]<<16>>>0)+(f[2]<<8>>>0)+f[3];l-=8;let t=x(8);return new Date(t*1e3+c/1e6)}throw new Error("Invalid data length for a date value.")}}function b(o){let h=!0,w=o.length;for(let r=0;r<w;r++)if(o.charCodeAt(r)>127){h=!1;break}let l=0,u=new Uint8Array(o.length*(h?1:4));for(let r=0;r!==w;r++){let x=o.charCodeAt(r);if(x<128){u[l++]=x;continue}if(x<2048)u[l++]=x>>6|192;else{if(x>55295&&x<56320){if(++r>=w)throw new Error("UTF-8 encode: incomplete surrogate pair");let s=o.charCodeAt(r);if(s<56320||s>57343)throw new Error("UTF-8 encode: second surrogate character 0x"+s.toString(16)+" at index "+r+" out of range");x=65536+((x&1023)<<10)+(s&1023),u[l++]=x>>18|240,u[l++]=x>>12&63|128}else u[l++]=x>>12|224;u[l++]=x>>6&63|128}u[l++]=x&63|128}return h?u:u.subarray(0,l)}function v(o,h,w){let l=h,u="";for(w+=h;l<w;){let r=o[l++];if(r>127)if(r>191&&r<224){if(l>=w)throw new Error("UTF-8 decode: incomplete 2-byte sequence");r=(r&31)<<6|o[l++]&63}else if(r>223&&r<240){if(l+1>=w)throw new Error("UTF-8 decode: incomplete 3-byte sequence");r=(r&15)<<12|(o[l++]&63)<<6|o[l++]&63}else if(r>239&&r<248){if(l+2>=w)throw new Error("UTF-8 decode: incomplete 4-byte sequence");r=(r&7)<<18|(o[l++]&63)<<12|(o[l++]&63)<<6|o[l++]&63}else throw new Error("UTF-8 decode: unknown multibyte start 0x"+r.toString(16)+" at index "+(l-1));if(r<=65535)u+=String.fromCharCode(r);else if(r<=1114111)r-=65536,u+=String.fromCharCode(r>>10|55296),u+=String.fromCharCode(r&1023|56320);else throw new Error("UTF-8 decode: code point 0x"+r.toString(16)+" exceeds UTF-16 reach")}return u}let A={serialize:g,deserialize:p,encode:g,decode:p};typeof k=="object"&&k&&typeof k.exports=="object"?k.exports=A:window[window.msgpackJsName||"msgpack"]=A})()});var O=L(D()),{default:M,...J}=O,H=M!==void 0?M:J;export{H as default};
