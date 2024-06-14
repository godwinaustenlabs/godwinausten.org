!function(n,e){"object"==typeof exports&&"undefined"!=typeof module?module.exports=e():"function"==typeof define&&define.amd?define(e):n.anime=e()}(this,function(){"use strict";var k={update:null,begin:null,loopBegin:null,changeBegin:null,change:null,changeComplete:null,loopComplete:null,complete:null,loop:1,direction:"normal",autoplay:!0,timelineOffset:0},C={duration:1e3,delay:0,endDelay:0,easing:"easeOutElastic(1, .5)",round:0},t=["translateX","translateY","translateZ","rotate","rotateX","rotateY","rotateZ","scale","scaleX","scaleY","scaleZ","skew","skewX","skewY","perspective","matrix","matrix3d"],d={CSS:{},springs:{}};function P(n,e,t){return Math.min(Math.max(n,e),t)}function l(n,e){return-1<n.indexOf(e)}function o(n,e){return n.apply(null,e)}var I={arr:function(n){return Array.isArray(n)},obj:function(n){return l(Object.prototype.toString.call(n),"Object")},pth:function(n){return I.obj(n)&&n.hasOwnProperty("totalLength")},svg:function(n){return n instanceof SVGElement},inp:function(n){return n instanceof HTMLInputElement},dom:function(n){return n.nodeType||I.svg(n)},str:function(n){return"string"==typeof n},fnc:function(n){return"function"==typeof n},und:function(n){return void 0===n},nil:function(n){return I.und(n)||null===n},hex:function(n){return/(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(n)},rgb:function(n){return/^rgb/.test(n)},hsl:function(n){return/^hsl/.test(n)},col:function(n){return I.hex(n)||I.rgb(n)||I.hsl(n)},key:function(n){return!k.hasOwnProperty(n)&&!C.hasOwnProperty(n)&&"targets"!==n&&"keyframes"!==n}};function p(n){var e=/\(([^)]+)\)/.exec(n);return e?e[1].split(",").map(function(n){return parseFloat(n)}):[]}function i(a,t){var n=p(a),e=P(I.und(n[0])?1:n[0],.1,100),r=P(I.und(n[1])?100:n[1],.1,100),o=P(I.und(n[2])?10:n[2],.1,100),i=P(I.und(n[3])?0:n[3],.1,100),u=Math.sqrt(r/e),c=o/(2*Math.sqrt(r*e)),s=c<1?u*Math.sqrt(1-c*c):0,f=c<1?(c*u-i)/s:-i+u;function l(n){var e=t?t*n/1e3:n;return e=c<1?Math.exp(-e*c*u)*(+Math.cos(s*e)+f*Math.sin(s*e)):(1+f*e)*Math.exp(-e*u),0===n||1===n?n:1-e}return t?l:function(){var n=d.springs[a];if(n)return n;for(var e=0,t=0;;)if(1===l(e+=1/6)){if(16<=++t)break}else t=0;var r=e*(1/6)*1e3;return d.springs[a]=r}}function u(e){return void 0===e&&(e=10),function(n){return Math.ceil(P(n,1e-6,1)*e)*(1/e)}}var e,a,c=function(o,e,i,t){if(0<=o&&o<=1&&0<=i&&i<=1){var u=new Float32Array(11);if(o!==e||i!==t)for(var n=0;n<11;++n)u[n]=v(.1*n,o,i);return function(n){return o===e&&i===t||0===n||1===n?n:v(function(n){for(var e=0,t=1;10!==t&&u[t]<=n;++t)e+=.1;var r=e+(n-u[--t])/(u[t+1]-u[t])*.1,a=g(r,o,i);return.001<=a?function(n,e,t,r){for(var a=0;a<4;++a){var o=g(e,t,r);if(0===o)return e;e-=(v(e,t,r)-n)/o}return e}(n,r,o,i):0===a?r:function(n,e,t,r,a){for(var o,i,u=0;0<(o=v(i=e+(t-e)/2,r,a)-n)?t=i:e=i,1e-7<Math.abs(o)&&++u<10;);return i}(n,e,e+.1,o,i)}(n),e,t)}}},s=(e={linear:function(){return function(n){return n}}},a={Sine:function(){return function(n){return 1-Math.cos(n*Math.PI/2)}},Circ:function(){return function(n){return 1-Math.sqrt(1-n*n)}},Back:function(){return function(n){return n*n*(3*n-2)}},Bounce:function(){return function(n){for(var e,t=4;n<((e=Math.pow(2,--t))-1)/11;);return 1/Math.pow(4,3-t)-7.5625*Math.pow((3*e-2)/22-n,2)}},Elastic:function(n,e){void 0===n&&(n=1),void 0===e&&(e=.5);var t=P(n,1,10),r=P(e,.1,2);return function(n){return 0===n||1===n?n:-t*Math.pow(2,10*(n-1))*Math.sin((n-1-r/(2*Math.PI)*Math.asin(1/t))*(2*Math.PI)/r)}}},["Quad","Cubic","Quart","Quint","Expo"].forEach(function(n,e){a[n]=function(){return function(n){return Math.pow(n,e+2)}}}),Object.keys(a).forEach(function(n){var r=a[n];e["easeIn"+n]=r,e["easeOut"+n]=function(e,t){return function(n){return 1-r(e,t)(1-n)}},e["easeInOut"+n]=function(e,t){return function(n){return n<.5?r(e,t)(2*n)/2:1-r(e,t)(-2*n+2)/2}},e["easeOutIn"+n]=function(e,t){return function(n){return n<.5?(1-r(e,t)(1-2*n))/2:(r(e,t)(2*n-1)+1)/2}}}),e);function r(n,e){return 1-3*e+3*n}function f(n,e){return 3*e-6*n}function h(n){return 3*n}function v(n,e,t){return((r(e,t)*n+f(e,t))*n+h(e))*n}function g(n,e,t){return 3*r(e,t)*n*n+2*f(e,t)*n+h(e)}function O(n,e){if(I.fnc(n))return n;var t=n.split("(")[0],r=s[t],a=p(n);switch(t){case"spring":return i(n,e);case"cubicBezier":return o(c,a);case"steps":return o(u,a);default:return o(r,a)}}function m(n){try{return document.querySelectorAll(n)}catch(n){return}}function D(n,e){for(var t=n.length,r=2<=arguments.length?e:void 0,a=[],o=0;o<t;o++)if(o in n){var i=n[o];e.call(r,i,o,n)&&a.push(i)}return a}function B(n){return n.reduce(function(n,e){return n.concat(I.arr(e)?B(e):e)},[])}function y(n){return I.arr(n)?n:(I.str(n)&&(n=m(n)||n),n instanceof NodeList||n instanceof HTMLCollection?[].slice.call(n):[n])}function b(n,e){return n.some(function(n){return n===e})}function M(n){var e={};for(var t in n)e[t]=n[t];return e}function T(n,e){var t=M(n);for(var r in n)t[r]=e.hasOwnProperty(r)?e[r]:n[r];return t}function E(n,e){var t=M(n);for(var r in e)t[r]=I.und(n[r])?e[r]:n[r];return t}function F(n){var e=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(n);if(e)return e[1]}function x(n,e){return I.fnc(n)?n(e.target,e.id,e.total):n}function w(n,e){return n.getAttribute(e)}function A(n,e,t){if(b([t,"deg","rad","turn"],F(e)))return e;var r=d.CSS[e+t];if(!I.und(r))return r;var a=document.createElement(n.tagName),o=n.parentNode&&n.parentNode!==document?n.parentNode:document.body;o.appendChild(a),a.style.position="absolute",a.style.width=100+t;var i=100/a.offsetWidth;o.removeChild(a);var u=i*parseFloat(e);return d.CSS[e+t]=u}function N(n,e,t){if(e in n.style){var r=e.replace(/([a-z])([A-Z])/g,"$1-$2").toLowerCase(),a=n.style[e]||getComputedStyle(n).getPropertyValue(r)||"0";return t?A(n,a,t):a}}function S(n,e){return I.dom(n)&&!I.inp(n)&&(!I.nil(w(n,e))||I.svg(n)&&n[e])?"attribute":I.dom(n)&&b(t,e)?"transform":I.dom(n)&&"transform"!==e&&N(n,e)?"css":null!=n[e]?"object":void 0}function L(n){if(I.dom(n)){for(var e,t=n.style.transform||"",r=/(\w+)\(([^)]*)\)/g,a=new Map;e=r.exec(t);)a.set(e[1],e[2]);return a}}function j(n,e,t,r){switch(S(n,e)){case"transform":return a=n,i=r,u=t,s=l(o=e,"scale")?1:0+(l(c=o,"translate")||"perspective"===c?"px":l(c,"rotate")||l(c,"skew")?"deg":void 0),f=L(a).get(o)||s,i&&(i.transforms.list.set(o,f),i.transforms.last=o),u?A(a,f,u):f;case"css":return N(n,e,t);case"attribute":return w(n,e);default:return n[e]||0}var a,o,i,u,c,s,f}function q(n,e){var t=/^(\*=|\+=|-=)/.exec(n);if(!t)return n;var r=F(n)||0,a=parseFloat(e),o=parseFloat(n.replace(t[0],""));switch(t[0][0]){case"+":return a+o+r;case"-":return a-o+r;case"*":return a*o+r}}function H(n,e){if(I.col(n))return t=n,I.rgb(t)?(a=/rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(r=t))?"rgba("+a[1]+",1)":r:I.hex(t)?(o=t.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,function(n,e,t,r){return e+e+t+t+r+r}),i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(o),"rgba("+parseInt(i[1],16)+","+parseInt(i[2],16)+","+parseInt(i[3],16)+",1)"):I.hsl(t)?function(n){var e,t,r,a=/hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(n)||/hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(n),o=parseInt(a[1],10)/360,i=parseInt(a[2],10)/100,u=parseInt(a[3],10)/100,c=a[4]||1;function s(n,e,t){return t<0&&(t+=1),1<t&&--t,t<1/6?n+6*(e-n)*t:t<.5?e:t<2/3?n+(e-n)*(2/3-t)*6:n}if(0==i)e=t=r=u;else{var f=u<.5?u*(1+i):u+i-u*i,l=2*u-f;e=s(l,f,o+1/3),t=s(l,f,o),r=s(l,f,o-1/3)}return"rgba("+255*e+","+255*t+","+255*r+","+c+")"}(t):void 0;var t,r,a,o,i;if(/\s/g.test(n))return n;var u=F(n),c=u?n.substr(0,n.length-u.length):n;return e?c+e:c}function V(n,e){return Math.sqrt(Math.pow(e.x-n.x,2)+Math.pow(e.y-n.y,2))}function $(n){for(var e,t=n.points,r=0,a=0;a<t.numberOfItems;a++){var o=t.getItem(a);0<a&&(r+=V(e,o)),e=o}return r}function W(n){if(n.getTotalLength)return n.getTotalLength();switch(n.tagName.toLowerCase()){case"circle":return 2*Math.PI*w(n,"r");case"rect":return 2*w(r=n,"width")+2*w(r,"height");case"line":return V({x:w(t=n,"x1"),y:w(t,"y1")},{x:w(t,"x2"),y:w(t,"y2")});case"polyline":return $(n);case"polygon":return e=n.points,$(n)+V(e.getItem(e.numberOfItems-1),e.getItem(0))}var e,t,r}function X(e,n){var t=n||{},r=t.el||function(){for(var n=e.parentNode;I.svg(n)&&I.svg(n.parentNode);)n=n.parentNode;return n}(),a=r.getBoundingClientRect(),o=w(r,"viewBox"),i=a.width,u=a.height,c=t.viewBox||(o?o.split(" "):[0,0,i,u]);return{el:r,viewBox:c,x:+c[0],y:+c[1],w:i,h:u,vW:c[2],vH:c[3]}}function Y(t,r,n){function e(n){void 0===n&&(n=0);var e=1<=r+n?r+n:0;return t.el.getPointAtLength(e)}var a=X(t.el,t.svg),o=e(),i=e(-1),u=e(1),c=n?1:a.w/a.vW,s=n?1:a.h/a.vH;switch(t.property){case"x":return(o.x-a.x)*c;case"y":return(o.y-a.y)*s;case"angle":return 180*Math.atan2(u.y-i.y,u.x-i.x)/Math.PI}}function Z(n,e){var t=/[+-]?\d*\.?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g,r=H(I.pth(n)?n.totalLength:n,e)+"";return{original:r,numbers:r.match(t)?r.match(t).map(Number):[0],strings:I.str(n)||e?r.split(t):[]}}function G(n){return D(n?B(I.arr(n)?n.map(y):y(n)):[],function(n,e,t){return t.indexOf(n)===e})}function Q(n){var t=G(n);return t.map(function(n,e){return{target:n,id:e,total:t.length,transforms:{list:L(n)}}})}function z(n,r){var e=M(r);if(/^spring/.test(e.easing)&&(e.duration=i(e.easing)),I.arr(n)){var t=n.length;2!==t||I.obj(n[0])?I.fnc(r.duration)||(e.duration=r.duration/t):n={value:n}}var a=I.arr(n)?n:[n];return a.map(function(n,e){var t=I.obj(n)&&!I.pth(n)?n:{value:n};return I.und(t.delay)&&(t.delay=e?0:r.delay),I.und(t.endDelay)&&(t.endDelay=e===a.length-1?r.endDelay:0),t}).map(function(n){return E(n,e)})}var _={css:function(n,e,t){return n.style[e]=t},attribute:function(n,e,t){return n.setAttribute(e,t)},object:function(n,e,t){return n[e]=t},transform:function(n,e,t,r,a){if(r.list.set(e,t),e===r.last||a){var o="";r.list.forEach(function(n,e){o+=e+"("+n+") "}),n.style.transform=o}}};function R(n,c){Q(n).forEach(function(n){for(var e in c){var t=x(c[e],n),r=n.target,a=F(t),o=j(r,e,a,n),i=q(H(t,a||F(o)),o),u=S(r,e);_[u](r,e,i,n.transforms,!0)}})}function J(n,t){return D(B(n.map(function(e){return t.map(function(n){return function(n,e){var f,l,d,t=S(n.target,e.name);if(t){var r=(l=n,(f=e).tweens.map(function(n){var e=function(n,e){var t={};for(var r in n){var a=x(n[r],e);I.arr(a)&&1===(a=a.map(function(n){return x(n,e)})).length&&(a=a[0]),t[r]=a}return t.duration=parseFloat(t.duration),t.delay=parseFloat(t.delay),t}(n,l),t=e.value,r=I.arr(t)?t[1]:t,a=F(r),o=j(l.target,f.name,a,l),i=d?d.to.original:o,u=I.arr(t)?t[0]:i,c=F(u)||F(o),s=a||c;return I.und(r)&&(r=i),e.from=Z(u,s),e.to=Z(q(r,u),s),e.start=d?d.end:0,e.end=e.start+e.delay+e.duration+e.endDelay,e.easing=O(e.easing,e.duration),e.isPath=I.pth(t),e.isPathTargetInsideSVG=e.isPath&&I.svg(l.target),e.isColor=I.col(e.from.original),e.isColor&&(e.round=1),d=e})),a=r[r.length-1];return{type:t,property:e.name,animatable:n,tweens:r,duration:a.end,delay:r[0].delay,endDelay:a.endDelay}}}(e,n)})})),function(n){return!I.und(n)})}function K(n,e){function t(n){return n.timelineOffset?n.timelineOffset:0}var r=n.length,a={};return a.duration=r?Math.max.apply(Math,n.map(function(n){return t(n)+n.duration})):e.duration,a.delay=r?Math.min.apply(Math,n.map(function(n){return t(n)+n.delay})):e.delay,a.endDelay=r?a.duration-Math.max.apply(Math,n.map(function(n){return t(n)+n.duration-n.endDelay})):e.endDelay,a}var U,nn=0,en=[],tn=("undefined"!=typeof document&&document.addEventListener("visibilitychange",function(){an.suspendWhenDocumentHidden&&(n()?U=cancelAnimationFrame(U):(en.forEach(function(n){return n._onDocumentVisibility()}),tn()))}),function(){U||n()&&an.suspendWhenDocumentHidden||!(0<en.length)||(U=requestAnimationFrame(rn))});function rn(n){for(var e=en.length,t=0;t<e;){var r=en[t];r.paused?(en.splice(t,1),e--):(r.tick(n),t++)}U=0<t?requestAnimationFrame(rn):void 0}function n(){return document&&document.hidden}function an(n){void 0===n&&(n={});var o,i=0,u=0,c=0,s=0,f=null;function l(n){var e=window.Promise&&new Promise(function(n){return f=n});return n.finished=e}var e,t,r,a,d,p,h,v,O=(t=T(k,e=n),a=function(n,e){var t=[],r=e.keyframes;for(var a in r&&(e=E(function(e){for(var t=D(B(e.map(function(n){return Object.keys(n)})),function(n){return I.key(n)}).reduce(function(n,e){return n.indexOf(e)<0&&n.push(e),n},[]),a={},n=function(n){var r=t[n];a[r]=e.map(function(n){var e={};for(var t in n)I.key(t)?t==r&&(e.value=n[t]):e[t]=n[t];return e})},r=0;r<t.length;r++)n(r);return a}(r),e)),e)I.key(a)&&t.push({name:a,tweens:z(e[a],n)});return t}(r=T(C,e),e),h=K(p=J(d=Q(e.targets),a),r),v=nn,nn++,E(t,{id:v,children:[],animatables:d,animations:p,duration:h.duration,delay:h.delay,endDelay:h.endDelay}));function g(){var n=O.direction;"alternate"!==n&&(O.direction="normal"!==n?"normal":"reverse"),O.reversed=!O.reversed,o.forEach(function(n){return n.reversed=O.reversed})}function m(n){return O.reversed?O.duration-n:n}function y(){i=0,u=m(O.currentTime)*(1/an.speed)}function b(n,e){e&&e.seek(n-e.timelineOffset)}function M(e){for(var n=0,t=O.animations,r=t.length;n<r;){var a=t[n],o=a.animatable,i=a.tweens,u=i.length-1,c=i[u];u&&(c=D(i,function(n){return e<n.end})[0]||c);for(var s=P(e-c.start-c.delay,0,c.duration)/c.duration,f=isNaN(s)?1:c.easing(s),l=c.to.strings,d=c.round,p=[],h=c.to.numbers.length,v=void 0,g=0;g<h;g++){var m=void 0,y=c.to.numbers[g],b=c.from.numbers[g]||0;m=c.isPath?Y(c.value,f*y,c.isPathTargetInsideSVG):b+f*(y-b),d&&(c.isColor&&2<g||(m=Math.round(m*d)/d)),p.push(m)}var M=l.length;if(M){v=l[0];for(var x=0;x<M;x++){l[x];var w=l[x+1],k=p[x];isNaN(k)||(v+=w?k+w:k+" ")}}else v=p[0];_[a.type](o.target,a.property,v,o.transforms),a.currentValue=v,n++}}function x(n){O[n]&&!O.passThrough&&O[n](O)}function w(n){var e=O.duration,t=O.delay,r=e-O.endDelay,a=m(n);O.progress=P(a/e*100,0,100),O.reversePlayback=a<O.currentTime,o&&function(n){if(O.reversePlayback)for(var e=s;e--;)b(n,o[e]);else for(var t=0;t<s;t++)b(n,o[t])}(a),!O.began&&0<O.currentTime&&(O.began=!0,x("begin")),!O.loopBegan&&0<O.currentTime&&(O.loopBegan=!0,x("loopBegin")),a<=t&&0!==O.currentTime&&M(0),(r<=a&&O.currentTime!==e||!e)&&M(e),t<a&&a<r?(O.changeBegan||(O.changeBegan=!0,O.changeCompleted=!1,x("changeBegin")),x("change"),M(a)):O.changeBegan&&(O.changeCompleted=!0,O.changeBegan=!1,x("changeComplete")),O.currentTime=P(a,0,e),O.began&&x("update"),e<=n&&(u=0,O.remaining&&!0!==O.remaining&&O.remaining--,O.remaining?(i=c,x("loopComplete"),O.loopBegan=!1,"alternate"===O.direction&&g()):(O.paused=!0,O.completed||(O.completed=!0,x("loopComplete"),x("complete"),!O.passThrough&&"Promise"in window&&(f(),l(O)))))}return l(O),O.reset=function(){var n=O.direction;O.passThrough=!1,O.currentTime=0,O.progress=0,O.paused=!0,O.began=!1,O.loopBegan=!1,O.changeBegan=!1,O.completed=!1,O.changeCompleted=!1,O.reversePlayback=!1,O.reversed="reverse"===n,O.remaining=O.loop,o=O.children;for(var e=s=o.length;e--;)O.children[e].reset();(O.reversed&&!0!==O.loop||"alternate"===n&&1===O.loop)&&O.remaining++,M(O.reversed?O.duration:0)},O._onDocumentVisibility=y,O.set=function(n,e){return R(n,e),O},O.tick=function(n){w(((c=n)+(u-(i=i||c)))*an.speed)},O.seek=function(n){w(m(n))},O.pause=function(){O.paused=!0,y()},O.play=function(){O.paused&&(O.completed&&O.reset(),O.paused=!1,en.push(O),y(),tn())},O.reverse=function(){g(),O.completed=!O.reversed,y()},O.restart=function(){O.reset(),O.play()},O.remove=function(n){un(G(n),O)},O.reset(),O.autoplay&&O.play(),O}function on(n,e){for(var t=e.length;t--;)b(n,e[t].animatable.target)&&e.splice(t,1)}function un(n,e){var t=e.animations,r=e.children;on(n,t);for(var a=r.length;a--;){var o=r[a],i=o.animations;on(n,i),i.length||o.children.length||r.splice(a,1)}t.length||r.length||e.pause()}return an.version="3.2.1",an.speed=1,an.suspendWhenDocumentHidden=!0,an.running=en,an.remove=function(n){for(var e=G(n),t=en.length;t--;)un(e,en[t])},an.get=j,an.set=R,an.convertPx=A,an.path=function(n,e){var t=I.str(n)?m(n)[0]:n,r=e||100;return function(n){return{property:n,el:t,svg:X(t),totalLength:W(t)*(r/100)}}},an.setDashoffset=function(n){var e=W(n);return n.setAttribute("stroke-dasharray",e),e},an.stagger=function(n,e){void 0===e&&(e={});var s=e.direction||"normal",f=e.easing?O(e.easing):null,l=e.grid,d=e.axis,p=e.from||0,h="first"===p,v="center"===p,g="last"===p,m=I.arr(n),y=m?parseFloat(n[0]):parseFloat(n),b=m?parseFloat(n[1]):0,M=F(m?n[1]:n)||0,x=e.start||0+(m?y:0),w=[],k=0;return function(n,e,t){if(h&&(p=0),v&&(p=(t-1)/2),g&&(p=t-1),!w.length){for(var r=0;r<t;r++){if(l){var a=v?(l[0]-1)/2:p%l[0],o=v?(l[1]-1)/2:Math.floor(p/l[0]),i=a-r%l[0],u=o-Math.floor(r/l[0]),c=Math.sqrt(i*i+u*u);"x"===d&&(c=-i),"y"===d&&(c=-u),w.push(c)}else w.push(Math.abs(p-r));k=Math.max.apply(Math,w)}f&&(w=w.map(function(n){return f(n/k)*k})),"reverse"===s&&(w=w.map(function(n){return d?n<0?-1*n:-n:Math.abs(k-n)}))}return x+(m?(b-y)/k:y)*(Math.round(100*w[e])/100)+M}},an.timeline=function(f){void 0===f&&(f={});var l=an(f);return l.duration=0,l.add=function(n,e){var t=en.indexOf(l),r=l.children;function a(n){n.passThrough=!0}-1<t&&en.splice(t,1);for(var o=0;o<r.length;o++)a(r[o]);var i=E(n,T(C,f));i.targets=i.targets||f.targets;var u=l.duration;i.autoplay=!1,i.direction=l.direction,i.timelineOffset=I.und(e)?u:q(e,u),a(l),l.seek(i.timelineOffset);var c=an(i);a(c),r.push(c);var s=K(r,f);return l.delay=s.delay,l.endDelay=s.endDelay,l.duration=s.duration,l.seek(0),l.reset(),l.autoplay&&l.play(),l},l},an.easing=O,an.penner=s,an.random=function(n,e){return Math.floor(Math.random()*(e-n+1))+n},an});