/* esm.sh - esbuild bundle(escape-latex@1.2.0) deno production */
var F=Object.create;var o=Object.defineProperty;var x=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var M=Object.getPrototypeOf,b=Object.prototype.hasOwnProperty;var w=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports);var O=(t,e,n,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of E(e))!b.call(t,s)&&s!==n&&o(t,s,{get:()=>e[s],enumerable:!(a=x(e,s))||a.enumerable});return t};var $=(t,e,n)=>(n=t!=null?F(M(t)):{},O(e||!t||!t.__esModule?o(n,"default",{value:t,enumerable:!0}):n,t));var g=w((A,d)=>{"use strict";var c=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var n=arguments[e];for(var a in n)Object.prototype.hasOwnProperty.call(n,a)&&(t[a]=n[a])}return t},j={"{":"\\{","}":"\\}","\\":"\\textbackslash{}","#":"\\#",$:"\\$","%":"\\%","&":"\\&","^":"\\textasciicircum{}",_:"\\_","~":"\\textasciitilde{}"},q={"\u2013":"\\--","\u2014":"\\---"," ":"~","	":"\\qquad{}","\r\n":"\\newline{}","\n":"\\newline{}"},S=function(e,n){return c({},e,n)};d.exports=function(t){for(var e=arguments.length>1&&arguments[1]!==void 0?arguments[1]:{},n=e.preserveFormatting,a=n===void 0?!1:n,s=e.escapeMapFn,_=s===void 0?S:s,r=String(t),l="",f=_(c({},j),a?c({},q):{}),p=Object.keys(f),h=function(){var u=!1;p.forEach(function(i,m){u||r.length>=i.length&&r.slice(0,i.length)===i&&(l+=f[p[m]],r=r.slice(i.length,r.length),u=!0)}),u||(l+=r.slice(0,1),r=r.slice(1,r.length))};r;)h();return l}});var C=$(g()),{default:v,...K}=C,B=v!==void 0?v:K;export{B as default};
