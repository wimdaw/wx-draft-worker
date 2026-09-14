var Re=(e,t,a)=>(r,n)=>{let s=-1;return i(0);async function i(o){if(o<=s)throw new Error("next() called multiple times");s=o;let c,l=!1,u;if(e[o]?(u=e[o][0][0],r.req.routeIndex=o):u=o===e.length&&n||void 0,u)try{c=await u(r,()=>i(o+1))}catch(p){if(p instanceof Error&&t)r.error=p,c=await t(p,r),l=!0;else throw p}else r.finalized===!1&&a&&(c=await a(r));return c&&(r.finalized===!1||l)&&(r.res=c),r}};var it=Symbol();var ot=(e,t)=>new Response(e,{headers:{"Content-Type":t.replace(/^[^;]+/,r=>r.toLowerCase())}}).formData();var ct=32,Ia=1e4,ce=e=>"headers"in e,ut=async(e,t=Object.create(null))=>{let{all:a=!1,dot:r=!1}=t,i=(ce(e)?e.headers:e.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();return i==="multipart/form-data"||i==="application/x-www-form-urlencoded"?Pa(e,{all:a,dot:r}):{}};async function Pa(e,t){if(!ce(e)&&e.bodyCache.formData)return lt(await e.bodyCache.formData,t);let a=ce(e)?e.headers:e.raw.headers,r=await e.arrayBuffer(),n=ot(r,a.get("Content-Type")||"");ce(e)||(e.bodyCache.formData=n);let s=await n;return s?lt(s,t):{}}function lt(e,t){let a=Object.create(null),r={count:0};return e.forEach((n,s)=>{t.all||s.endsWith("[]")?Oa(a,s,n):a[s]=n}),t.dot&&Object.entries(a).forEach(([n,s])=>{n.includes(".")&&(Na(a,n,s,r),delete a[n])}),a}var Oa=(e,t,a)=>{e[t]!==void 0?Array.isArray(e[t])?e[t].push(a):e[t]=[e[t],a]:t.endsWith("[]")?e[t]=[a]:e[t]=a},Na=(e,t,a,r)=>{if(/(?:^|\.)__proto__\./.test(t))return;let n=e,s=t.split(".",ct+2);s.length>ct+1&&dt(),s.forEach((i,o)=>{o===s.length-1?n[i]=a:((!n[i]||typeof n[i]!="object"||Array.isArray(n[i])||n[i]instanceof File)&&(r.count++>=Ia&&dt(),n[i]=Object.create(null)),n=n[i])})},dt=()=>{throw new Error("Nesting limit exceeded")};var Ce=e=>{let t=e.split("/");return t[0]===""&&t.shift(),t},pt=e=>{let{groups:t,path:a}=Ua(e),r=Ce(a);return Ba(r,t)},Ua=e=>{let t=[];return e=e.replace(/\{[^}]+\}/g,(a,r)=>{let n=`@${r}`;return t.push([n,a]),n}),{groups:t,path:e}},Ba=(e,t)=>{for(let a=t.length-1;a>=0;a--){let[r]=t[a];for(let n=e.length-1;n>=0;n--)if(e[n].includes(r)){e[n]=e[n].replace(r,t[a][1]);break}}return e},le={},mt=(e,t)=>{if(e==="*")return"*";let a=e.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(a){let r=`${e}#${t}`;return le[r]||(a[2]?le[r]=t&&t[0]!==":"&&t[0]!=="*"?[r,a[1],new RegExp(`^${a[2]}(?=/${t})`)]:[e,a[1],new RegExp(`^${a[2]}$`)]:le[r]=[e,a[1],!0]),le[r]}return null},ft=(e,t)=>{try{return t(e)}catch{return e.replace(/(?:%[0-9A-Fa-f]{2})+/g,a=>{try{return t(a)}catch{return a}})}},$a=e=>ft(e,decodeURI),Le=e=>{let t=e.url,a=t.indexOf("/",t.indexOf(":")+4),r=a;for(;r<t.length;r++){let n=t.charCodeAt(r);if(n===37){let s=t.indexOf("?",r),i=t.indexOf("#",r),o=s===-1?i===-1?void 0:i:i===-1?s:Math.min(s,i),c=t.slice(a,o);return $a(c.includes("%25")?c.replace(/%25/g,"%2525"):c)}else if(n===63||n===35)break}return t.slice(a,r)};var ht=e=>{let t=Le(e);return t.length>1&&t.at(-1)==="/"?t.slice(0,-1):t},H=(e,t,...a)=>(a.length&&(t=H(t,...a)),`${e?.[0]==="/"?"":"/"}${e}${t==="/"?"":`${e?.at(-1)==="/"?"":"/"}${t?.[0]==="/"?t.slice(1):t}`}`),de=e=>{if(e.charCodeAt(e.length-1)!==63||!e.includes(":"))return null;let t=e.split("/"),a=[],r="";return t.forEach(n=>{if(n!==""&&!/\:/.test(n))r+="/"+n;else if(/\:/.test(n))if(n.charCodeAt(n.length-1)===63){a.length===0&&r===""?a.push("/"):a.push(r);let s=n.slice(0,-1);r+="/"+s,a.push(r)}else r+="/"+n}),a.filter((n,s,i)=>i.indexOf(n)===s)},V=e=>e.indexOf("%")!==-1?ft(e,Ma):e,De=e=>(e.indexOf("+")!==-1&&(e=e.replace(/\+/g," ")),V(e)),gt=(e,t,a)=>{let r=e.indexOf("#",8);r!==-1&&(e=e.slice(0,r));let n;if(!a&&t&&t.indexOf("%")===-1&&t.indexOf("+")===-1){let o=e.indexOf("?",8);if(o===-1)return;for(e.startsWith(t,o+1)||(o=e.indexOf(`&${t}`,o+1));o!==-1;){let c=e.charCodeAt(o+t.length+1);if(c===61){let l=o+t.length+2,u=e.indexOf("&",l);return De(e.slice(l,u===-1?void 0:u))}else if(c==38||isNaN(c))return"";o=e.indexOf(`&${t}`,o+1)}if(n=/[%+]/.test(e),!n)return}let s=Object.create(null);n??=/[%+]/.test(e);let i=e.indexOf("?",8);for(;i!==-1;){let o=e.indexOf("&",i+1),c=e.indexOf("=",i);c>o&&o!==-1&&(c=-1);let l=e.slice(i+1,c===-1?o===-1?void 0:o:c);if(n&&(l=De(l)),i=o,l==="")continue;let u;c===-1?u="":(u=e.slice(c+1,o===-1?void 0:o),n&&(u=De(u))),a?(s[l]&&Array.isArray(s[l])||(s[l]=[]),s[l].push(u)):s[l]??=u}return t?s[t]:s},vt=gt,bt=(e,t)=>gt(e,t,!0),Ma=decodeURIComponent;var wt=class{raw;#t;#e;routeIndex=0;path;bodyCache={};constructor(e,t="/",a=[[]]){this.raw=e,this.path=t,this.#e=a}param(e){return e?this.#a(e):this.#s()}#a(e){let t=this.#e[0][this.routeIndex]?.[1][e],a=this.#r(t);return a&&V(a)}#s(){let e={},t=Object.keys(this.#e[0][this.routeIndex]?.[1]??{});for(let a of t){let r=this.#r(this.#e[0][this.routeIndex][1][a]);r!==void 0&&(e[a]=V(r))}return e}#r(e){return this.#e[1]?this.#e[1][e]:e}query(e){return vt(this.url,e)}queries(e){return bt(this.url,e)}header(e){if(e)return this.raw.headers.get(e)??void 0;let t=Object.create(null);return this.raw.headers.forEach((a,r)=>{t[r]=a}),t}async parseBody(e){return ut(this,e)}#n=e=>{let{bodyCache:t,raw:a}=this,r=t[e];if(r)return r;for(let n in t)return t[n].then(s=>(n==="json"&&(s=JSON.stringify(s)),new Response(s)[e]()));return t[e]=a[e]()};json(){return this.#n("text").then(e=>JSON.parse(e))}text(){return this.#n("text")}arrayBuffer(){return this.#n("arrayBuffer")}bytes(){return this.#n("arrayBuffer").then(e=>new Uint8Array(e))}blob(){return this.#n("blob")}formData(){return this.#n("formData")}addValidatedData(e,t){(this.#t??={})[e]=t}valid(e){return this.#t?.[e]}get url(){return this.raw.url}get method(){return this.raw.method}get[it](){return this.#e}get matchedRoutes(){return this.#e[0].map(([[,e]])=>e)}get routePath(){return this.#e[0].map(([[,e]])=>e)[this.routeIndex].path}};var yt={Stringify:1,BeforeStream:2,Stream:3},Ha=(e,t)=>{let a=new String(e);return a.isEscaped=!0,a.callbacks=t,a};var Ie=async(e,t,a,r,n)=>{typeof e=="object"&&!(e instanceof String)&&(e instanceof Promise||(e=e.toString()),e instanceof Promise&&(e=await e));let s=e.callbacks;if(!s?.length)return Promise.resolve(e);n?n[0]+=e:n=[e];let i=Promise.all(s.map(o=>o({phase:t,buffer:n,context:r}))).then(o=>Promise.all(o.filter(Boolean).map(c=>Ie(c,t,!1,r,n))).then(()=>n[0]));return a?Ha(await i,s):i};var qa="text/plain; charset=UTF-8",Pe=(e,t)=>({"Content-Type":e,...t}),re=(e,t)=>new Response(e,t),Oe=class{#t;#e;env={};#a;finalized=!1;error;#s;#r;#n;#d;#c;#l;#o;#u;#p;constructor(e,t){this.#t=e,t&&(this.#r=t.executionCtx,this.env=t.env,this.#l=t.notFoundHandler,this.#p=t.path,this.#u=t.matchResult)}get req(){return this.#e??=new wt(this.#t,this.#p,this.#u),this.#e}get event(){if(this.#r&&"respondWith"in this.#r)return this.#r;throw Error("This context has no FetchEvent")}get executionCtx(){if(this.#r)return this.#r;throw Error("This context has no ExecutionContext")}get res(){return this.#n||=re(null,{headers:this.#o??=new Headers})}set res(e){if(this.#n&&e){e=re(e.body,e);for(let[t,a]of this.#n.headers.entries())if(t!=="content-type")if(t==="set-cookie"){let r=this.#n.headers.getSetCookie();e.headers.delete("set-cookie");for(let n of r)e.headers.append("set-cookie",n)}else e.headers.set(t,a)}this.#n=e,this.finalized=!0}render=(...e)=>(this.#c??=t=>this.html(t),this.#c(...e));setLayout=e=>this.#d=e;getLayout=()=>this.#d;setRenderer=e=>{this.#c=e};header=(e,t,a)=>{this.finalized&&(this.#n=re(this.#n.body,this.#n));let r=this.#n?this.#n.headers:this.#o??=new Headers;t===void 0?r.delete(e):a?.append?r.append(e,t):r.set(e,t)};status=e=>{this.#s=e};set=(e,t)=>{this.#a??=new Map,this.#a.set(e,t)};get=e=>this.#a?this.#a.get(e):void 0;get var(){return this.#a?Object.fromEntries(this.#a):{}}#i(e,t,a){let r=this.#n?new Headers(this.#n.headers):this.#o;if(typeof t=="object"&&t.headers){r??=new Headers;for(let[s,i]of new Headers(t.headers))s==="set-cookie"?r.append(s,i):r.set(s,i)}if(a){if(!r){let s=0;for(let i in a)if(++s>1||typeof a[i]!="string"){r=new Headers;break}}if(r)for(let s in a){let i=a[s];if(typeof i=="string")r.set(s,i);else{r.delete(s);for(let o of i)r.append(s,o)}}}let n=typeof t=="number"?t:t?.status??this.#s;return re(e,{status:n,headers:r??a})}newResponse=(...e)=>this.#i(...e);body=(e,t,a)=>this.#i(e,t,a);text=(e,t,a)=>!this.#o&&!this.#s&&!t&&!a&&!this.finalized?new Response(e):this.#i(e,t,Pe(qa,a));json=(e,t,a)=>this.#i(JSON.stringify(e),t,Pe("application/json",a));html=(e,t,a)=>{let r=n=>this.#i(n,t,Pe("text/html; charset=UTF-8",a));return typeof e=="object"?Ie(e,yt.Stringify,!1,{}).then(r):r(e)};redirect=(e,t)=>{let a=String(e);return this.header("Location",/[^\x00-\xFF]/.test(a)?encodeURI(a):a),this.newResponse(null,t??302)};notFound=()=>(this.#l??=()=>re(),this.#l(this))};var T="ALL",xt="all",Et=["get","post","put","delete","options","patch","query"],ue="Can not add a route since the matcher is already built.",pe=class extends Error{};var kt="__COMPOSED_HANDLER";var ja=e=>e.text("404 Not Found",404),_t=(e,t)=>{if("getResponse"in e){let a=e.getResponse();return t.newResponse(a.body,a)}return console.error(e),t.text("Internal Server Error",500)},Tt=class St{get;post;put;delete;options;patch;query;all;on;use;router;getPath;_basePath="/";#t="/";routes=[];constructor(t={}){[...Et,xt].forEach(s=>{this[s]=(i,...o)=>{let c=s.toUpperCase();return typeof i=="string"?this.#t=i:this.#s(c,this.#t,i),o.forEach(l=>{this.#s(c,this.#t,l)}),this}}),this.on=(s,i,...o)=>{for(let c of[i].flat()){this.#t=c;for(let l of[s].flat()){let u=l.toUpperCase();for(let p of o)this.#s(u,this.#t,p)}}return this},this.use=(s,...i)=>(typeof s=="string"?this.#t=s:(this.#t="*",i.unshift(s)),i.forEach(o=>{this.#s(T,this.#t,o)}),this);let{strict:r,...n}=t;Object.assign(this,n),this.getPath=r??!0?t.getPath??Le:ht}#e(){let t=new St({router:this.router,getPath:this.getPath});return t.errorHandler=this.errorHandler,t.#a=this.#a,t.routes=this.routes,t}#a=ja;errorHandler=_t;route(t,a){let r=this.basePath(t);return a.routes.map(n=>{let s;a.errorHandler===_t?s=n.handler:(s=async(i,o)=>(await Re([],a.errorHandler)(i,()=>n.handler(i,o))).res,s[kt]=n.handler),r.#s(n.method,n.path,s,n.basePath)}),this}basePath(t){let a=this.#e();return a._basePath=H(this._basePath,t),a}onError=t=>(this.errorHandler=t,this);notFound=t=>(this.#a=t,this);mount(t,a,r){let n,s;r&&(typeof r=="function"?s=r:(s=r.optionHandler,r.replaceRequest===!1?n=c=>c:n=r.replaceRequest));let i=s?c=>{let l=s(c);return Array.isArray(l)?l:[l]}:c=>{let l;try{l=c.executionCtx}catch{}return[c.env,l]};n||=(()=>{let c=H(this._basePath,t),l=c==="/"?0:c.length;return u=>{let p=new URL(u.url);return p.pathname=this.getPath(u).slice(l)||"/",new Request(p,u)}})();let o=async(c,l)=>{let u=await a(n(c.req.raw),...i(c));if(u)return u;await l()};return this.#s(T,H(t,"*"),o),this}#s(t,a,r,n){a=H(this._basePath,a);let s={basePath:n!==void 0?H(this._basePath,n):this._basePath,path:a,method:t,handler:r};this.router.add(t,a,[r,s]),this.routes.push(s)}#r(t,a){if(t instanceof Error)return this.errorHandler(t,a);throw t}#n(t,a,r,n){if(n==="HEAD")return(async()=>new Response(null,await this.#n(t,a,r,"GET")))();let s=this.getPath(t,{env:r}),i=this.router.match(n,s),o=new Oe(t,{path:s,matchResult:i,env:r,executionCtx:a,notFoundHandler:this.#a});if(i[0].length===1){let l;try{l=i[0][0][0][0](o,async()=>{o.res=await this.#a(o)})}catch(u){return this.#r(u,o)}return l instanceof Promise?l.then(u=>u||(o.finalized?o.res:this.#a(o))).catch(u=>this.#r(u,o)):l??this.#a(o)}let c=Re(i[0],this.errorHandler,this.#a);return(async()=>{try{let l=await c(o);if(!l.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return l.res}catch(l){return this.#r(l,o)}})()}fetch=(t,...a)=>this.#n(t,a[1],a[0],t.method);request=(t,a,r,n)=>t instanceof Request?this.fetch(a?new Request(t,a):t,r,n):(t=t.toString(),this.fetch(new Request(/^https?:\/\//.test(t)?t:`http://localhost${H("/",t)}`,a),r,n));fire=()=>{addEventListener("fetch",t=>{t.respondWith(this.#n(t.request,t,void 0,t.request.method))})}};var _=()=>Object.create(null);var me=[];function Ne(e,t){let a=this.buildAllMatchers(),r=((n,s)=>{let i=a[n]||a[T],o=i[2][s];if(o)return o;let c=s.match(i[0]);if(!c)return[[],me];let l=c.indexOf("",1);return[i[1][l],c]});return this.match=r,r(e,t)}var J="[^/]+",j=".*",N="(?:|/.*)",q=Symbol(),At=new Set(".\\+*[^]$()");function Wa(e,t){return e.length===1?t.length===1?e<t?-1:1:-1:t.length===1?1:e===j||e===N?t===N?-1:1:t===j||t===N?-1:e===J?1:t===J?-1:e.length===t.length?e<t?-1:1:t.length-e.length}var Rt=class Ue{#t;#e;#a=_();insert(t,a,r,n,s){let i=this;for(let o=0,c=t.length;o<c;o++){let l=t[o],u=l.length===1?l==="*"?o===c-1?["","",j]:["","",J]:null:l==="/*"?["","",N]:l.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/),p;if(u){let m=u[1],f=u[2]||J;if(m&&u[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))||f.length===1&&At.has(f)))throw q;if(p=i.#a[f],!p){if(f!==j&&f!==N){for(let v in i.#a)if((f.length>1||v.length>1)&&v!==j&&v!==N)throw q}p=i.#a[f]=new Ue}m!==""&&(p.#e??=n.varIndex++,r.push([m,p.#e]))}else if(p=i.#a[l],!p){for(let m in i.#a)if(m.length>1&&m!==j&&m!==N)throw q;p=i.#a[l]=new Ue}i=p}if(i.#t!==void 0)throw q;i.#t=s?-1:a}buildRegExpStr(){let a=Object.keys(this.#a).sort(Wa).map(r=>{let n=this.#a[r],s=n.buildRegExpStr();return s===""?"":(typeof n.#e=="number"?`(${r})@${n.#e}`:At.has(r)?`\\${r}`:r)+s}).filter(Boolean);return typeof this.#t=="number"&&this.#t!==-1&&a.unshift(`#${this.#t}`),a.length===0?"":a.length===1?a[0]:"(?:"+a.join("|")+")"}};var Be=class{#t={varIndex:0};#e=new Rt;#a=0;paths=_();insert(e,t){if(t){this.#e.insert(e.split(""),0,[],this.#t,!0);return}let a=[],r=[],n=e;for(let i=0;;){let o=!1;if(n=n.replace(/\{[^}]+\}/g,c=>{let l=`@\\${i}`;return r[i]=[l,c],i++,o=!0,l}),!o)break}let s=n.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let i=r.length-1;i>=0;i--){let[o]=r[i];for(let c=s.length-1;c>=0;c--)if(s[c].indexOf(o)!==-1){s[c]=s[c].replace(o,r[i][1]);break}}this.#e.insert(s,this.#a,a,this.#t,!1),this.paths[e]=[this.#a++,a]}buildRegExp(){let e=this.#e.buildRegExpStr();if(e==="")return[/^$/,[],[]];let t=0,a=[],r=[];return e=e.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,s,i)=>s!==void 0?(a[++t]=Number(s),"$()"):(i!==void 0&&(r[Number(i)]=++t),"")),[new RegExp(`^${e}`),a,r]}};var Dt=_();function Ct(e){return Dt[e]??=new RegExp(`^${e.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,(t,a)=>a?`\\${a}`:t==="/*"?N:t==="*"?j:`/:${J}`)}$`)}function fe(e,t){for(let a of Object.keys(e).sort((r,n)=>n.length-r.length))if(Ct(a).test(t))return[...e[a]]}var he=class{name="RegExpRouter";#t;#e;#a;constructor(){this.#t={[T]:_()},this.#e={[T]:_()},this.#a={[T]:new Be}}#s(e,t){try{this.#a[e].insert(t,!/\*|\/:/.test(t))}catch(a){throw a===q?new pe(t):a}}add(e,t,a){let r=this.#t,n=this.#e;if(!r)throw new Error(ue);if(!r[e]){this.#a[e]=new Be;for(let o of[r,n]){o[e]=_();for(let c in o[T])o[e][c]=[...o[T][c]],this.#s(e,c)}}t==="/*"&&(t="*");let s=e===T?Object.keys(r):[e];if(/\*$/.test(t)){let o=Ct(t);for(let c of s)r[c][t]||(this.#s(c,t),r[c][t]=fe(r[c],t)||fe(r[T],t)||[]);for(let c of[r,n])for(let l of s)for(let u in c[l])o.test(u)&&c[l][u].push([a,t]);return}let i=de(t)||[t];for(let o of i)for(let c of s)n[c][o]||(this.#s(c,o),n[c][o]=fe(r[c],o)||fe(r[T],o)||[]),n[c][o].push([a,o])}match=Ne;buildAllMatchers(){let e=_();for(let t of Object.keys(this.#e))e[t]=this.#r(t);return this.#t=this.#e=this.#a=void 0,Dt=_(),e}#r(e){let t=this.#t[e],a=this.#e[e],r=this.#a[e],n=_(),s=[],[i,o,c]=r.buildRegExp();for(let l of[t,a])for(let u in l){let p=l[u],m=r.paths[u];if(!m){n[u]=[p.map(([f])=>[f,_()]),me];continue}s[m[0]]=p.map(([f,v])=>[f,r.paths[v][1].reduceRight((k,[A],x)=>(k[A]=c[m[1][x][1]],k),_())])}return[i,o.map(l=>s[l]),n]}};var $e=class{name="SmartRouter";#t=[];#e=[];constructor(e){this.#t=e.routers}add(e,t,a){if(!this.#e)throw new Error(ue);this.#e.push([e,t,a])}match(e,t){if(!this.#e)throw new Error("Fatal error");let a=this.#t,r=this.#e,n=a.length,s=0,i;for(;s<n;s++){let o=a[s];try{for(let c=0,l=r.length;c<l;c++)o.add(...r[c]);i=o.match(e,t)}catch(c){if(c instanceof pe)continue;throw c}this.match=o.match.bind(o),this.#t=[o],this.#e=void 0;break}if(s===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,i}get activeRouter(){if(this.#e||this.#t.length!==1)throw new Error("No active router has been determined yet.");return this.#t[0]}};var Me=_(),za=0,Lt=class It{#t=[];#e=_();#a=[];#s;#r=Me;insert(t,a,r){let n=this,s=pt(a),i=new Set,o=0;for(let c of s){let l=s[++o],u=mt(c,l)||(l===void 0&&c&&c.indexOf("*")===c.length-1?c:null),p=Array.isArray(u),m=p?u[0]:u||c,f=n.#e[m]||=new It;u&&!f.#s&&(f.#s=u,n.#a.push(f)),n=f,p&&i.add(u[1])}n.#t.push({[t]:{handler:r,possibleKeys:[...i],score:++za}})}#n(t,a,r,n,s){for(let i=0,o=a.#t.length;i<o;i++){let c=a.#t[i],l=c[r]||c[T];if(l){l.params=_(),t.push(l);for(let u=0,p=l.possibleKeys.length;u<p;u++){let m=l.possibleKeys[u];l.params[m]=s?.[m]&&!u?s[m]:n[m]??s?.[m]}}}}search(t,a){let r=[];this.#r=Me;let s=[this],i=Ce(a),o=[],c=i.length,l=null;for(let u=0;u<c;u++){let p=i[u],m=u===c-1,f=[];for(let k=0,A=s.length;k<A;k++){let x=s[k],C=x.#e[p];C&&(C.#r=x.#r,m?(C.#e["*"]&&this.#n(r,C.#e["*"],t,x.#r),this.#n(r,C,t,x.#r)):f.push(C));for(let y of x.#a){let S=y.#s,L=x.#r===Me?{}:{...x.#r};if(typeof S=="string"){(S==="*"||p.startsWith(S.slice(0,-1)))&&(this.#n(r,y,t,x.#r),S==="*"&&(y.#r=L,f.push(y)));continue}let[,O,M]=S;if(!(!p&&M===!0)){if(M!==!0){if(!l){l=[];let Ae=a[0]==="/"?1:0;for(let G=0;G<c;G++)l[G]=Ae,Ae+=i[G].length+1}let st=a.slice(l[u]),oe=M.exec(st);if(oe){L[O]=oe[0],this.#n(r,y,t,x.#r,L),oe[0].length===st.length&&y.#e["*"]&&this.#n(r,y.#e["*"],t,x.#r,L);for(let Ae in y.#e){y.#r=L;let G=oe[0].match(/\//g)?.length??0;(o[G]||=[]).push(y);break}continue}}(M===!0||M.test(p))&&(L[O]=p,m?(this.#n(r,y,t,L,x.#r),y.#e["*"]&&this.#n(r,y.#e["*"],t,L,x.#r)):(y.#r=L,f.push(y)))}}}let v=o.shift();s=v?f.concat(v):f}return r[1]&&r.sort((u,p)=>u.score-p.score),[r.map(({handler:u,params:p})=>[u,p])]}};var He=class{name="TrieRouter";#t=new Lt;add(e,t,a){for(let r of de(t)||[t])this.#t.insert(e,r,a)}match(e,t){return this.#t.search(e,t)}};var ne=class extends Tt{constructor(e={}){super(e),this.router=e.router??new $e({routers:[new he,new He]})}};var Pt=e=>{let t={origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH","QUERY"],allowHeaders:[],exposeHeaders:[],...e},a=t.exposeHeaders?.length?t.exposeHeaders.join(","):void 0,r=t.allowHeaders?.length?t.allowHeaders.join(","):void 0,n=(i=>typeof i=="string"?i==="*"?()=>i:o=>i===o?o:null:typeof i=="function"?i:o=>i.includes(o)?o:null)(t.origin),s=(i=>{if(typeof i=="function")return async(o,c)=>(await i(o,c)).join(",");if(Array.isArray(i)){let o=i.join(",");return()=>o}else return()=>""})(t.allowMethods);return async function(o,c){function l(p,m){o.res.headers.set(p,m)}let u=await n(o.req.header("origin")||"",o);if(u&&l("Access-Control-Allow-Origin",u),t.credentials&&l("Access-Control-Allow-Credentials","true"),a&&l("Access-Control-Expose-Headers",a),o.req.method==="OPTIONS"){t.origin!=="*"&&o.res.headers.append("Vary","Origin"),t.maxAge!=null&&l("Access-Control-Max-Age",t.maxAge.toString());let p=await s(o.req.header("origin")||"",o);p&&l("Access-Control-Allow-Methods",p);let m=r;if(!m){let f=o.req.header("Access-Control-Request-Headers");f&&(m=f.split(",").map(v=>v.trim()).join(","))}return m&&(l("Access-Control-Allow-Headers",m),o.res.headers.append("Vary","Access-Control-Request-Headers")),o.res.headers.delete("Content-Length"),o.res.headers.delete("Content-Type"),new Response(null,{headers:o.res.headers,status:204,statusText:"No Content"})}await c(),t.origin!=="*"&&o.header("Vary","Origin",{append:!0})}};function Fa(){let{process:e,Deno:t}=globalThis;return!(typeof t?.noColor=="boolean"?t.noColor:e!==void 0?"NO_COLOR"in e?.env:!1)}async function Ot(){let{navigator:e}=globalThis,t="cloudflare:workers";return!(e!==void 0&&e.userAgent==="Cloudflare-Workers"?await(async()=>{try{return"NO_COLOR"in((await import(t)).env??{})}catch{return!1}})():!Fa())}var Xa=e=>{let[t,a]=[",","."];return e.map(n=>n.replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+t)).join(a)},Ya=e=>{let t=Date.now()-e;return Xa([t<1e3?t+"ms":Math.round(t/1e3)+"s"])},Ka=async e=>{if(await Ot())switch(e/100|0){case 5:return`\x1B[31m${e}\x1B[0m`;case 4:return`\x1B[33m${e}\x1B[0m`;case 3:return`\x1B[36m${e}\x1B[0m`;case 2:return`\x1B[32m${e}\x1B[0m`}return`${e}`};async function Nt(e,t,a,r,n=0,s){let i=t==="<--"?`${t} ${a} ${r}`:`${t} ${a} ${r} ${await Ka(n)} ${s}`;e(i)}var Ut=(e=console.log)=>async function(a,r){let{method:n,url:s}=a.req,i=s.slice(s.indexOf("/",8));await Nt(e,"<--",n,i);let o=Date.now();await r(),await Nt(e,"-->",n,i,a.res.status,Ya(o))};function Bt(e,t=200,a={}){return new Response(JSON.stringify(e),{status:t,headers:{"content-type":"application/json; charset=utf-8",...a}})}function h(e={},t=200){return Bt({ok:!0,data:e},t)}function d(e,t=400){return Bt({ok:!1,error:e},t)}var Ga={40001:"AppSecret \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5 WECHAT_APPSECRET",40002:"\u4E0D\u5408\u6CD5\u7684\u51ED\u8BC1\u7C7B\u578B",40007:"\u4E0D\u5408\u6CD5\u7684 media_id",40013:"AppID \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5 WECHAT_APPID",40014:"\u4E0D\u5408\u6CD5\u7684 access_token",40164:"\u8C03\u7528\u65B9 IP \u4E0D\u5728\u767D\u540D\u5355\uFF1A\u8BF7\u628A Cloudflare \u5168\u90E8 IPv4 \u6BB5\u52A0\u5165\u516C\u4F17\u53F7 IP \u767D\u540D\u5355",41001:"\u7F3A\u5C11 access_token",42001:"access_token \u5DF2\u8FC7\u671F",43001:"\u9700\u8981 GET \u8BF7\u6C42",44002:"POST \u6570\u636E\u5305\u4E3A\u7A7A",45009:"\u63A5\u53E3\u8C03\u7528\u8D85\u9650\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",48001:"\u63A5\u53E3\u672A\u6388\u6743\uFF08\u53EF\u80FD\u8D26\u53F7\u7C7B\u578B\u4E0D\u652F\u6301\u8BE5\u63A5\u53E3\uFF09",53500:"\u65E0\u8349\u7A3F\u6743\u9650\uFF1Adraft/add \u9700\u8981\u5DF2\u8BA4\u8BC1\u7684\u516C\u4F17\u53F7",53503:"\u4E0D\u5408\u6CD5\u7684\u5C01\u9762\u56FE media_id"};function Va(e,t){let a=t?.errcode,r=a!==void 0?Ga[a]:void 0,n=t?.errmsg||"\u672A\u77E5\u9519\u8BEF";return`${e}\u5931\u8D25\uFF1A${r||n}${r?`\uFF08${n}\uFF09`:""} [${a}]`}function X(e,t){if(!t||typeof t!="object")throw new Error(`${e}\u5931\u8D25\uFF1A\u54CD\u5E94\u5F02\u5E38`);if(t.errcode)throw new Error(Va(e,t))}function D(e){return String(e).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function Ja(e){return String(e).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim()}function Q(e,t){return e.length>t?`${e.slice(0,t-1)}\u2026`:e}function $t(e,t=120){let a=Ja(e);return a.length>t?a.slice(0,t):a}var Qa=/^[\w!#$%&'*.^`|~+-]+$/,Za=/^[!#-:<>-[\]-~]+$/,er=/^[ !#-:<-[\]-~]*$/,Mt=e=>{let t=0,a=e.length;for(;t<a;){let r=e.charCodeAt(t);if(r!==32&&r!==9)break;t++}for(;a>t;){let r=e.charCodeAt(a-1);if(r!==32&&r!==9)break;a--}return t===0&&a===e.length?e:e.slice(t,a)},qe=(e,t)=>{if(t&&e.indexOf(t)===-1)return{};let a=e.split(";"),r=Object.create(null);for(let n of a){let s=n.indexOf("=");if(s===-1)continue;let i=Mt(n.substring(0,s));if(t&&t!==i||!Za.test(i)||i in r)continue;let o=Mt(n.substring(s+1));if(o.startsWith('"')&&o.endsWith('"')&&(o=o.slice(1,-1)),er.test(o)&&(r[i]=V(o),t))break}return r};var tr=(e,t,a={})=>{if(!Qa.test(e))throw new Error("Invalid cookie name");let r=`${e}=${t}`;if(e.startsWith("__Secure-")&&!a.secure)throw new Error("__Secure- Cookie must have Secure attributes");if(e.startsWith("__Host-")){if(!a.secure)throw new Error("__Host- Cookie must have Secure attributes");if(a.path!=="/")throw new Error('__Host- Cookie must have Path attributes with "/"');if(a.domain)throw new Error("__Host- Cookie must not have Domain attributes")}for(let n of["domain","path","sameSite","priority"])if(a[n]&&/[;\r\n]/.test(a[n]))throw new Error(`${n} must not contain ";", "\\r", or "\\n"`);if(a&&typeof a.maxAge=="number"&&a.maxAge>=0){if(a.maxAge>3456e4)throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");r+=`; Max-Age=${a.maxAge|0}`}if(a.domain&&a.prefix!=="host"&&(r+=`; Domain=${a.domain}`),a.path&&(r+=`; Path=${a.path}`),a.expires){if(a.expires.getTime()-Date.now()>3456e7)throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");r+=`; Expires=${a.expires.toUTCString()}`}if(a.httpOnly&&(r+="; HttpOnly"),a.secure&&(r+="; Secure"),a.sameSite&&(r+=`; SameSite=${a.sameSite.charAt(0).toUpperCase()+a.sameSite.slice(1)}`),a.priority&&(r+=`; Priority=${a.priority.charAt(0).toUpperCase()+a.priority.slice(1)}`),a.partitioned){if(!a.secure)throw new Error("Partitioned Cookie must have Secure attributes");r+="; Partitioned"}return r},ge=(e,t,a)=>(t=encodeURIComponent(t),tr(e,t,a));var ve=(e,t,a)=>{let r=e.req.raw.headers.get("Cookie");if(typeof t=="string"){if(!r)return;let s=t;return a==="secure"?s="__Secure-"+t:a==="host"&&(s="__Host-"+t),qe(r,s)[s]}return r?qe(r):{}};var ar=(e,t,a)=>{let r;return a?.prefix==="secure"?r=ge("__Secure-"+e,t,{path:"/",...a,secure:!0}):a?.prefix==="host"?r=ge("__Host-"+e,t,{...a,path:"/",secure:!0,domain:void 0}):r=ge(e,t,{path:"/",...a}),r},je=(e,t,a,r)=>{let n=ar(t,a,r);e.header("Set-Cookie",n,{append:!0})};var Ht=(e,t,a)=>{let r=ve(e,t,a?.prefix);return je(e,t,"",{...a,maxAge:0}),r};var be=`
/* \u4E2D\u6587\u8BF4\u660E\uFF1A\u65B9\u6848 A\u300CCloud Workbench\u300D\u7EDF\u4E00\u9996\u9875\u3001\u767B\u5F55\u9875\u548C\u7BA1\u7406\u9875\u7684\u8BBE\u8BA1\u8BED\u8A00\uFF1B\u4E0D\u6D89\u53CA\u540E\u7AEF\u903B\u8F91\u3002 */
/* Hallmark \xB7 genre: modern-minimal \xB7 macrostructure: Workbench \xB7 design-system: design.md \xB7 designed-as-app
 * Hallmark \xB7 pre-emit critique: P5 H5 E4 S5 R5 V5
 */
:root {
  --color-paper: oklch(98.5% 0.004 250);
  --color-paper-a: oklch(98.5% 0.004 250 / .94);
  --color-paper-2: oklch(96.7% 0.006 250);
  --color-paper-3: oklch(94.8% 0.008 250);
  --color-ink: oklch(22% 0.020 258);
  --color-ink-2: oklch(34% 0.018 257);
  --color-muted: oklch(49% 0.016 255);
  --color-rule: oklch(89% 0.010 252);
  --color-rule-2: oklch(82% 0.014 252);
  --color-accent: oklch(52% 0.205 256);
  --color-accent-hover: oklch(46% 0.195 256);
  --color-accent-soft: oklch(94% 0.030 256);
  --color-accent-ink: oklch(99% 0.003 250);
  --color-focus: oklch(44% 0.180 256);
  --color-success: oklch(45% 0.120 158);
  --color-success-soft: oklch(95% 0.025 158);
  --color-success-ink: oklch(34% 0.092 158);
  --color-danger: oklch(50% 0.185 25);
  --color-danger-hover: oklch(45% 0.175 25);
  --color-danger-soft: oklch(96% 0.022 25);
  --color-danger-ink: oklch(38% 0.145 25);
  --color-graphite: oklch(22% 0.016 260);
  --color-graphite-2: oklch(28% 0.018 260);
  --color-graphite-rule: oklch(38% 0.020 258);
  --color-graphite-ink: oklch(92% 0.010 250);
  --color-overlay: oklch(18% 0.020 258 / .48);
  --shadow-panel: 0 18px 48px oklch(20% 0.020 258 / .10);
  --shadow-float: 0 8px 24px oklch(20% 0.020 258 / .12);

  --font-display: 'Space Grotesk', 'SF Pro Display', sans-serif;
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'SFMono-Regular', Consolas, monospace;

  --space-3xs: .25rem;
  --space-2xs: .5rem;
  --space-xs: .75rem;
  --space-sm: 1rem;
  --space-md: 1.5rem;
  --space-lg: 2rem;
  --space-xl: 3rem;
  --space-2xl: 4rem;
  --space-3xl: 6rem;
  --space-4xl: 8rem;

  --text-xs: .75rem;
  --text-sm: .875rem;
  --text-md: 1rem;
  --text-lg: 1.25rem;
  --text-xl: 1.75rem;
  --text-2xl: clamp(2.25rem, 5vw, 4.5rem);

  --radius-control: .375rem;
  --radius-panel: .625rem;
  --radius-round: 999px;
  --control-h: 2.75rem;
  --control-h-sm: 2rem;
  --shell: 74rem;
  --ease-out: cubic-bezier(.16, 1, .3, 1);
  --dur-fast: 160ms;
  --dur-panel: 260ms;

  /* compatibility aliases for existing management scripts */
  --c-primary: var(--color-accent);
  --c-primary-hover: var(--color-accent-hover);
  --c-primary-glow: var(--color-accent-soft);
  --c-text: var(--color-ink-2);
  --c-text-dark: var(--color-ink);
  --c-text-secondary: var(--color-ink-2);
  --c-text-muted: var(--color-muted);
  --c-text-light: var(--color-muted);
  --c-bg: var(--color-paper-2);
  --c-bg-white: var(--color-paper);
  --c-bg-light: var(--color-paper-2);
  --c-bg-alt: var(--color-paper-2);
  --c-border: var(--color-rule);
  --c-border-dark: var(--color-rule-2);
  --c-success: var(--color-success);
  --c-success-bg: var(--color-success-soft);
  --c-success-text: var(--color-success-ink);
  --c-danger: var(--color-danger);
  --c-danger-bg: var(--color-danger-soft);
  --c-danger-text: var(--color-danger-ink);
  --c-info-bg: var(--color-accent-soft);
  --c-info-text: var(--color-focus);
  --c-overlay: var(--color-overlay);
}

*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; min-width: 0; overflow-x: clip; scroll-behavior: smooth; }
body {
  min-height: 100dvh;
  background: var(--color-paper-2);
  color: var(--color-ink-2);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
button, input, textarea, select { font: inherit; }
button, a, input, select, textarea { -webkit-tap-highlight-color: transparent; }
a { color: inherit; }
h1, h2, h3, p, figure, dl, dd { margin: 0; }
h1, h2, h3 { color: var(--color-ink); font-family: var(--font-display); font-style: normal; font-weight: 600; letter-spacing: -.025em; line-height: 1.12; overflow-wrap: anywhere; min-width: 0; }
code, pre { font-family: var(--font-mono); }
fieldset { min-width: 0; }
html:focus-within { scroll-behavior: smooth; }
:target { scroll-margin-top: var(--space-lg); }
:focus { outline: 0; }
:focus-visible { outline: .125rem solid var(--color-focus); outline-offset: .125rem; }
::selection { background: var(--color-accent-soft); color: var(--color-ink); }

.shell { width: min(100% - calc(var(--space-sm) * 2), var(--shell)); margin-inline: auto; }
.site-page { display: flex; min-height: 100dvh; flex-direction: column; }
.site-page > main { flex: 1; }
.hd { display: none !important; }
.sr-only { position: absolute; width: .0625rem; height: .0625rem; padding: 0; margin: -.0625rem; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }

/* shared navigation */
.topbar { position: sticky; inset-block-start: 0; z-index: 100; min-height: 4rem; border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-a); color: var(--color-ink); backdrop-filter: blur(.75rem); }
.topbar__inner { min-height: 4rem; display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.brand { min-width: 0; display: inline-flex; align-items: center; gap: var(--space-2xs); color: var(--color-ink); text-decoration: none; white-space: nowrap; }
.brand__mark { width: 2rem; height: 2rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-accent); }
.brand__name, .brand strong { font-family: var(--font-display); font-size: var(--text-md); font-weight: 600; letter-spacing: -.02em; }
.brand__descriptor, .brand small { color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; font-weight: 500; letter-spacing: .08em; }
.topbar__actions { display: flex; align-items: center; gap: var(--space-2xs); }

/* buttons and controls */
.btn, .icon-btn, .model-token, .password-toggle, .admin-nav__link, .ps {
  border: .0625rem solid transparent;
  border-radius: var(--radius-control);
  cursor: pointer;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--dur-fast) ease, border-color var(--dur-fast) ease, color var(--dur-fast) ease, transform var(--dur-fast) ease;
}
.btn { min-height: var(--control-h-sm); padding-inline: var(--space-sm); display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2xs); font-size: var(--text-sm); font-weight: 600; line-height: 1; }
.btn-p { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-accent-ink); }
.btn-s { border-color: var(--color-rule-2); background: var(--color-paper); color: var(--color-ink-2); }
/* \u7EAF\u56FE\u6807\u6309\u94AE\uFF1A\u4E0E .btn \u540C\u5C3A\u5BF8\u7684\u6B63\u65B9\u5F62\uFF0C\u914D\u5408 title \u4F7F\u7528 */
.btn-icon { padding-inline: 0; inline-size: var(--control-h-sm); flex: 0 0 var(--control-h-sm); }
.btn-gh { border-color: transparent; background: transparent; color: var(--color-muted); }
.btn-g { border-color: var(--color-success-soft); background: var(--color-success-soft); color: var(--color-success-ink); }
.btn-d { border-color: var(--color-danger-soft); background: var(--color-danger-soft); color: var(--color-danger-ink); }
.icon-btn, .password-toggle { width: var(--control-h-sm); height: var(--control-h-sm); flex: 0 0 var(--control-h-sm); display: inline-grid; place-items: center; border-color: transparent; background: transparent; color: var(--color-muted); }
.icon-btn span { font-family: var(--font-body); font-size: var(--text-xs); }
.copy-control[data-state='success'] { border-color: var(--color-success); color: var(--color-success-ink); }
.copy-control[data-state='error'] { border-color: var(--color-danger); color: var(--color-danger-ink); }
.btn:active, .icon-btn:active, .model-token:active, .password-toggle:active, .ps:active { transform: translateY(.0625rem); }
.btn:disabled, .btn[aria-disabled='true'], .icon-btn:disabled, input:disabled, select:disabled { opacity: .55; cursor: not-allowed; }
.btn[data-state='loading'] .button-label { display: none; }
.btn:not([data-state='loading']) .button-loading { display: none; }
.btn[data-state='success'] { border-color: var(--color-success); background: var(--color-success); color: var(--color-paper); }
.button-loading { display: inline-flex; align-items: center; gap: var(--space-2xs); }

/* form controls */
input, textarea, select {
  width: 100%; height: var(--control-h); padding-inline: var(--space-xs); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); outline: .125rem solid transparent; outline-offset: .0625rem; background: var(--color-paper); color: var(--color-ink); transition: background-color var(--dur-fast) ease, border-color var(--dur-fast) ease;
}
/* \u884C\u5185\u5C0F\u5C3A\u5BF8\u63A7\u4EF6\uFF1A\u4E0E .btn\uFF08--control-h-sm\uFF09\u7B49\u9AD8\uFF0C\u7528\u4E8E\u548C\u56FE\u6807\u6309\u94AE\u5E76\u6392 */
.input-sm { height: var(--control-h-sm); }
/* \u590D\u9009\u6846 / \u5355\u9009\u6846\u4E0D\u5E94\u7EE7\u627F\u8F93\u5165\u6846\u7684\u6574\u884C\u5C3A\u5BF8\u4E0E\u8FB9\u6846\uFF08\u5426\u5219\u4F1A\u88AB\u6491\u6210\u4E00\u4E2A\u5927\u65B9\u6846\uFF09 */
input[type='checkbox'], input[type='radio'] {
  width: 1rem; height: 1rem; min-height: 0; padding: 0; border: 0; border-radius: 0; background: none; flex: 0 0 auto; accent-color: var(--color-accent); cursor: pointer;
}
/* \u884C\u5185\u590D\u9009 + \u8BF4\u660E\u6587\u5B57 */
.check-inline { display: inline-flex; align-items: center; gap: var(--space-3xs); min-height: var(--control-h); color: var(--color-ink-2); font-size: var(--text-xs); font-weight: 500; cursor: pointer; }
input::placeholder, textarea::placeholder { color: var(--color-muted); opacity: .82; }
input:focus-visible, textarea:focus-visible, select:focus-visible { border-color: var(--color-ink-2); outline: .125rem solid var(--color-focus); outline-offset: .0625rem; }
input[aria-invalid='true'], textarea[aria-invalid='true'], select[aria-invalid='true'] { border-color: var(--color-danger); background: var(--color-danger-soft); }
textarea { min-height: 6rem; padding-block: var(--space-xs); resize: vertical; }
label, legend { color: var(--color-ink-2); font-size: var(--text-xs); font-weight: 600; }
.fg { min-width: 0; margin-block-end: var(--space-sm); }
.fg > label { display: block; margin-block-end: var(--space-2xs); }
.form-helper { min-height: 1lh; margin-block-start: var(--space-3xs); color: var(--color-muted); font-size: var(--text-xs); }
.fg-tag { color: var(--color-accent); font-size: var(--text-2xs); border: .0625rem solid color-mix(in srgb, var(--color-accent) 35%, transparent); border-radius: 999px; padding: .0625rem .4rem; margin-inline-start: .4rem; vertical-align: middle; white-space: nowrap; }
.input-wrap { position: relative; }
.input-wrap > i { position: absolute; inset-inline-start: var(--space-xs); inset-block-start: 50%; z-index: 1; color: var(--color-muted); transform: translateY(-50%); }
.input-wrap input { padding-inline-start: var(--space-xl); padding-inline-end: var(--space-xl); }
.password-toggle { position: absolute; inset-inline-end: 0; inset-block-start: 0; }
.select-sm { height: var(--control-h); }
.tts-voice-row { display: flex; gap: var(--space-2xs); align-items: center; }
.tts-voice-row .select-sm { flex: 1; min-width: 0; }
.tts-voice-row .btn { white-space: nowrap; }
.fr, .fr3 { display: grid; grid-template-columns: minmax(0, 1fr); gap: 0 var(--space-sm); }
.form-group { margin: 0 0 var(--space-md); padding: var(--space-sm); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); }
.form-group legend { padding-inline: var(--space-2xs); }
.field-row { min-width: 0; flex-wrap: nowrap; }
.field-row input { min-width: 0; }
/* \u7EAF\u56FE\u6807\u6309\u94AE\u76F8\u90BB\u65F6\u6536\u7D27\u95F4\u8DDD\uFF08\u8D1F\u5916\u8FB9\u8DDD\u62B5\u6D88 .fc \u7684 gap\uFF09 */
.fc > .icon-btn + .icon-btn { margin-inline-start: calc(var(--space-3xs) - var(--space-2xs)); }

/* switch */
.tg { position: relative; display: inline-block; width: 2.5rem; height: var(--control-h); flex: 0 0 2.5rem; margin: 0; }
.tg input { position: absolute; opacity: 0; width: .0625rem; height: .0625rem; }
.tg .sl { position: absolute; inset-inline: 0; inset-block-start: .8125rem; height: 1.125rem; border-radius: var(--radius-round); background: var(--color-rule-2); cursor: pointer; transition: background-color var(--dur-fast) ease; }
.tg .sl::before { content: ''; position: absolute; width: .75rem; height: .75rem; inset-inline-start: .1875rem; inset-block-start: .1875rem; border-radius: 50%; background: var(--color-paper); box-shadow: 0 .0625rem .125rem var(--color-overlay); transition: transform var(--dur-fast) var(--ease-out); }
.tg input:checked + .sl { background: var(--color-accent); }
.tg input:checked + .sl::before { transform: translateX(1.375rem); }
.tg input:focus-visible + .sl { outline: .125rem solid var(--color-focus); outline-offset: .125rem; }
.tg input:disabled + .sl { opacity: .55; cursor: not-allowed; }

/* home workbench */
.home-page { background: var(--color-paper); }
.home-hero { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xl); padding-block: var(--space-2xl); }
.home-hero__copy { align-self: center; min-width: 0; }
.eyebrow { margin-block-end: var(--space-sm); display: flex; align-items: center; gap: var(--space-2xs); color: var(--color-muted); font-family: var(--font-mono); font-size: .6875rem; font-weight: 600; letter-spacing: .08em; }
.eyebrow > span { width: .75rem; height: .125rem; background: var(--color-accent); }
.home-hero h1 { max-width: 12ch; font-size: var(--text-2xl); }
.home-hero__lede { max-width: 60ch; margin-block-start: var(--space-md); color: var(--color-muted); font-size: var(--text-md); }
.endpoint-box { max-width: 40rem; margin-block-start: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); }
.endpoint-box__label { grid-column: 1 / -1; padding: var(--space-2xs) var(--space-xs) 0; color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; font-weight: 600; letter-spacing: .08em; }
.endpoint-box code { min-width: 0; padding: var(--space-2xs) var(--space-xs) var(--space-xs); overflow: hidden; color: var(--color-ink); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.endpoint-box .icon-btn { width: auto; padding-inline: var(--space-sm); display: flex; gap: var(--space-2xs); border-inline-start-color: var(--color-rule); border-radius: 0; }
.endpoint-box--list { max-width: none; grid-column: 1 / -1; grid-template-columns: 1fr; }
.endpoint-box--list .endpoint-box__label { padding-block-end: var(--space-2xs); }
.endpoint-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2xs); padding: 0 var(--space-xs) var(--space-xs); }
@media (min-width: 40rem) {
  .endpoint-list { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-2xs) var(--space-sm); }
}
.ep-item { display: flex; align-items: baseline; gap: var(--space-2xs); min-width: 0; padding: var(--space-2xs); overflow: hidden; border-radius: var(--radius-control); background: var(--color-paper); }
.ep-item code { display: inline; padding: 0; overflow: hidden; color: var(--color-ink); font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.ep-item small { flex-shrink: 0; color: var(--color-muted); font-size: .6875rem; white-space: nowrap; }
.endpoint-method { flex-shrink: 0; color: var(--color-accent); font-weight: 600; }
.request-panel { min-width: 0; overflow: clip; border: .0625rem solid var(--color-graphite-rule); border-radius: var(--radius-panel); background: var(--color-graphite); color: var(--color-graphite-ink); box-shadow: var(--shadow-panel); }
.request-panel figcaption, .request-panel__foot { min-height: 3rem; padding-inline: var(--space-sm); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); border-block-end: .0625rem solid var(--color-graphite-rule); color: var(--color-graphite-ink); font-family: var(--font-mono); font-size: .625rem; letter-spacing: .04em; }
.protocol-state { display: inline-flex; align-items: center; gap: var(--space-2xs); color: var(--color-graphite-ink); white-space: nowrap; }
.protocol-state i { width: .4375rem; height: .4375rem; border-radius: 50%; background: var(--color-success); }
.request-panel pre { margin: 0; min-height: 18rem; padding: var(--space-md); overflow: auto; background: var(--color-graphite); color: var(--color-graphite-ink); font-size: clamp(.6875rem, 2vw, .8125rem); line-height: 1.8; }
.request-panel pre code { white-space: pre; }
.syntax-command, .syntax-key { color: oklch(75% 0.130 256); }
.syntax-string { color: oklch(83% 0.060 154); }
.request-panel__foot { border-block-start: .0625rem solid var(--color-graphite-rule); border-block-end: 0; color: oklch(72% 0.012 250); }
.request-panel__foot code { color: var(--color-graphite-ink); }
.metrics-strip { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-block: .0625rem solid var(--color-rule); }
.metric { min-width: 0; padding-block: var(--space-md); display: flex; flex-direction: column; gap: var(--space-3xs); border-inline-end: .0625rem solid var(--color-rule); }
.metric:nth-child(even) { border-inline-end: 0; }
.metric:nth-child(n+3) { border-block-start: .0625rem solid var(--color-rule); }
.metric__value { color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; line-height: 1; }
.metric__label { color: var(--color-muted); font-size: var(--text-xs); }
.directory { padding-block: var(--space-2xl) var(--space-3xl); }
.section-heading { margin-block-end: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); align-items: end; }
.section-heading h2 { font-size: var(--text-xl); }
.section-heading p { max-width: 65ch; margin-block-start: var(--space-2xs); color: var(--color-muted); }
.search-field { position: relative; width: 100%; }
.search-field > i { position: absolute; inset-inline-start: var(--space-xs); inset-block-start: 50%; color: var(--color-muted); transform: translateY(-50%); }
.search-field input { padding-inline-start: var(--space-lg); }
.provider-index { border-block-start: .0625rem solid var(--color-rule-2); }
.provider-row { min-width: 0; padding-block: var(--space-md); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: start; border-block-end: .0625rem solid var(--color-rule); }
.provider-row__identity { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.provider-row__mark, .provider-avatar { width: 2.5rem; height: 2.5rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-display); font-weight: 600; }
.provider-row h3 { font-size: var(--text-md); }
.provider-row__identity p { margin-block-start: var(--space-3xs); display: flex; flex-wrap: wrap; gap: var(--space-2xs); color: var(--color-muted); font-size: var(--text-xs); }
.provider-row__identity code { color: var(--color-ink-2); }
.provider-row__models { min-width: 0; display: flex; flex-wrap: wrap; gap: var(--space-2xs); }
.model-token { max-width: 100%; min-height: var(--control-h-sm); padding-inline: var(--space-xs); display: inline-flex; align-items: center; gap: var(--space-2xs); border-color: var(--color-rule); background: var(--color-paper-2); color: var(--color-ink-2); }
.model-token code { overflow: hidden; font-size: var(--text-xs); text-overflow: ellipsis; white-space: nowrap; }
.model-token i { color: var(--color-muted); }
.status-badge, .bd, .protocol-chip, .status-dot { display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2xs); width: max-content; min-height: 1.75rem; padding-inline: var(--space-xs); border-radius: var(--radius-round); font-size: var(--text-xs); font-weight: 600; white-space: nowrap; }
.status-badge i, .status-dot i { width: .4375rem; height: .4375rem; border-radius: 50%; background: currentColor; }
.status-badge--on, .bd-on, .status-dot--online { background: var(--color-success-soft); color: var(--color-success-ink); }
.bd-off { background: var(--color-paper-3); color: var(--color-muted); }
.bd-info, .protocol-chip { background: var(--color-accent-soft); color: var(--color-focus); }
/* \u5220\u9664\u7C7B\u5FBD\u6807\u6309\u94AE\uFF1A\u5F62\u72B6\u540C .bd \u80F6\u56CA\uFF0C\u989C\u8272\u4FDD\u6301\u5371\u9669\u6001 */
.bd-del { border: .0625rem solid transparent; background: var(--color-danger-soft); color: var(--color-danger-ink); font-family: inherit; cursor: pointer; transition: background-color var(--dur-fast) ease, color var(--dur-fast) ease; }
.bd-del:hover { background: var(--color-danger); color: var(--color-paper); }
.empty-inline { color: var(--color-muted); font-size: var(--text-xs); }
.empty-state { padding: var(--space-xl) var(--space-sm); display: flex; flex-direction: column; align-items: center; gap: var(--space-xs); border: .0625rem dashed var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper-2); color: var(--color-muted); text-align: center; }
.empty-state > i { font-size: var(--text-lg); color: var(--color-muted); }
.empty-state h3 { font-size: var(--text-md); }
.empty-state p { max-width: 55ch; }
.site-footer { border-block-start: .0625rem solid var(--color-rule); background: var(--color-paper-2); color: var(--color-muted); }
.admin-main > .site-footer { margin-block-start: auto; }
.site-footer__inner { padding-block: var(--space-md); display: flex; flex-direction: column; align-items: flex-start; gap: var(--space-2xs); font-size: var(--text-xs); }
.site-footer a { text-underline-offset: .125rem; }
.site-footer__link { color: inherit; text-decoration: none; }

/* authentication split */
.auth-page { background: var(--color-paper); }
.auth-shell { width: min(100%, var(--shell)); min-height: calc(100dvh - 4rem); margin-inline: auto; display: grid; grid-template-columns: minmax(0, 1fr); }
.auth-context, .auth-form-wrap { min-width: 0; padding: var(--space-xl) var(--space-sm); }
.auth-context { display: flex; flex-direction: column; justify-content: center; border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-2); color: var(--color-ink-2); }
.auth-context h1 { max-width: 11ch; font-size: clamp(2.25rem, 6vw, 4rem); }
.auth-context > p:not(.eyebrow) { max-width: 58ch; margin-block-start: var(--space-md); color: var(--color-muted); font-size: var(--text-md); }
.auth-facts { margin-block-start: var(--space-xl); border-block-start: .0625rem solid var(--color-rule); }
.auth-facts > div { padding-block: var(--space-sm); display: grid; grid-template-columns: minmax(7rem, .7fr) minmax(0, 1.3fr); gap: var(--space-sm); border-block-end: .0625rem solid var(--color-rule); }
.auth-facts dt { color: var(--color-muted); font-size: var(--text-xs); }
.auth-facts dd { min-width: 0; color: var(--color-ink); font-size: var(--text-xs); overflow-wrap: anywhere; }
.auth-form-wrap { display: grid; place-items: center; background: var(--color-paper); color: var(--color-ink-2); }
.auth-form { width: min(100%, 27rem); }
.auth-form__heading { margin-block-end: var(--space-lg); display: flex; align-items: center; gap: var(--space-sm); }
.auth-form__icon, .panel-heading__mark { width: 2.75rem; height: 2.75rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-accent); }
.auth-form h2 { font-size: var(--text-xl); }
.auth-form__heading p { margin-block-start: var(--space-3xs); color: var(--color-muted); }
.auth-form .al { margin-block-end: var(--space-sm); }
.btn-submit { width: 100%; margin-block-start: var(--space-sm); }

/* admin control plane */
.admin-page { background: var(--color-paper-2); }
.admin-shell { min-height: 100dvh; }
.admin-rail { display: none; }
.admin-main { min-width: 0; min-height: 100dvh; display: flex; flex-direction: column; }
.admin-topbar { position: sticky; inset-block-start: 0; z-index: 90; min-height: 4rem; padding-inline: var(--space-sm); display: flex; align-items: center; justify-content: space-between; gap: var(--space-2xs); border-block-end: .0625rem solid var(--color-rule); background: var(--color-paper-a); backdrop-filter: blur(.75rem); }
.admin-topbar nav { min-width: 0; display: flex; align-items: center; gap: var(--space-3xs); overflow-x: auto; }
.admin-topbar nav a { min-height: var(--control-h); padding-inline: var(--space-xs); display: inline-flex; align-items: center; color: var(--color-muted); font-size: var(--text-xs); font-weight: 600; text-decoration: none; white-space: nowrap; }
.admin-content { width: 100%; max-width: 82rem; margin-inline: auto; padding: var(--space-lg) var(--space-sm) var(--space-3xl); }
.admin-overview { margin-block-end: var(--space-xl); }
.admin-heading { margin-block-end: var(--space-lg); display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); align-items: end; }
.admin-heading h1 { font-size: clamp(2rem, 5vw, 3rem); }
.admin-heading > div > p:not(.eyebrow) { max-width: 65ch; margin-block-start: var(--space-2xs); color: var(--color-muted); }
.admin-heading__actions { display: flex; flex-wrap: wrap; gap: var(--space-2xs); }
.admin-metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); }
.admin-metrics > div { min-width: 0; padding: var(--space-sm); border-inline-end: .0625rem solid var(--color-rule); border-block-end: .0625rem solid var(--color-rule); }
.admin-metrics > div:nth-child(even) { border-inline-end: 0; }
.admin-metrics > div:nth-child(n+3) { border-block-end: 0; }
.admin-metrics > div > span:not(.status-dot) { color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; line-height: 1; }
.admin-metrics p { margin-block-start: var(--space-xs); color: var(--color-ink); font-weight: 600; }
.admin-metrics small { color: var(--color-muted); font-size: var(--text-xs); }
.workspace-section { margin-block-start: var(--space-xl); }
.section-heading--admin { padding-block-end: var(--space-md); border-block-end: .0625rem solid var(--color-rule); }
.section-heading--admin code { font-size: var(--text-xs); }
.af-w { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); margin-block-end: var(--space-md); }
.add-form-panel, .mdl-list-panel { min-width: 0; padding: var(--space-md); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper-2); }
.panel-heading { margin-block-end: var(--space-md); display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-sm); }
.panel-heading > div { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.panel-heading h3 { font-size: var(--text-md); }
.panel-heading p { color: var(--color-muted); font-size: var(--text-xs); }
.mdl-list-panel { max-height: 36rem; overflow-y: auto; margin-bottom: 20px;}
.panel-actions, .detail-actions { display: flex; flex-direction: column; align-items: stretch; gap: var(--space-sm); }
.panel-actions > div, .detail-actions > div { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: var(--space-2xs); }
.switch-label { min-height: var(--control-h); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.gp, .provider-list, .key-list { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-xs); }
.pi, .ki { min-width: 0; border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper); }
.ps { min-height: 4.75rem; padding: var(--space-xs); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); cursor: pointer; }
.ps .l { min-width: 0; display: flex; align-items: center; gap: var(--space-xs); }
.ps .l > div { min-width: 0; }
.ps h3 { font-size: var(--text-md); }
.provider-chevron { width: 1rem; flex: 0 0 auto; color: var(--color-muted); transition: transform var(--dur-fast) var(--ease-out); }
.pu { margin-block-start: var(--space-3xs); display: flex; flex-wrap: wrap; gap: var(--space-2xs); color: var(--color-muted); font-size: var(--text-xs); }
.pu > *:not(:last-child)::after { content: '\xB7'; margin-inline-start: var(--space-2xs); color: var(--color-rule-2); }
.pd { display: none; padding: var(--space-md); border-block-start: .0625rem solid var(--color-rule); background: var(--color-paper-2); }
.pd.open { display: block; }
.detail-heading { margin-block-end: var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); }
.detail-heading h3 { font-size: var(--text-lg); }
.detail-heading p { margin-block-start: var(--space-3xs); color: var(--color-muted); font-size: var(--text-xs); }
.detail-actions { padding-block-start: var(--space-sm); border-block-start: .0625rem solid var(--color-rule); }
.detail-actions > div:first-child { flex: 1; justify-content: flex-start; }
.ki { padding: var(--space-sm); display: flex; flex-direction: column; gap: var(--space-sm); }
.key-main { min-width: 0; display: flex; align-items: flex-start; gap: var(--space-xs); }
.key-main > div { min-width: 0; }
.key-icon { width: 2.5rem; height: 2.5rem; flex: 0 0 auto; display: grid; place-items: center; border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-accent); }
.kv { min-width: 0; display: flex; align-items: center; gap: var(--space-3xs); color: var(--color-ink-2); font-family: var(--font-mono); font-size: var(--text-xs); }
.kv > span { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.kv .icon-btn { width: var(--control-h-sm); }
.key-main h3 { margin-block-start: var(--space-3xs); font-size: var(--text-sm); }
.key-main p { color: var(--color-muted); font-size: var(--text-xs); }
/* Key \u540D\u79F0\u4E0E\u521B\u5EFA\u65F6\u95F4\u4E00\u884C\u663E\u793A */
.key-meta { min-width: 0; display: flex; align-items: baseline; gap: var(--space-2xs); }
.key-meta h3 { margin-block-start: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.key-meta p { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.key-meta__sep { color: var(--color-muted); flex: 0 0 auto; }
.key-actions { display: flex; align-items: center; justify-content: flex-end; gap: var(--space-2xs); }

/* feedback, model list and modal */
.al { min-height: var(--control-h); padding: var(--space-xs); display: flex; align-items: center; gap: var(--space-2xs); border: .0625rem solid transparent; border-radius: var(--radius-control); font-size: var(--text-xs); }
.al-s { border-color: var(--color-success); background: var(--color-success-soft); color: var(--color-success-ink); margin-top: 20px; }
.al-e { border-color: var(--color-danger); background: var(--color-danger-soft); color: var(--color-danger-ink); }
.al-i { border-color: var(--color-accent); background: var(--color-accent-soft); color: var(--color-focus); }
.toast { position: fixed; inset-block-start: var(--space-sm); inset-inline-end: var(--space-sm); z-index: 9998; width: min(calc(100% - calc(var(--space-sm) * 2)), 24rem); box-shadow: var(--shadow-float); }
.modal-o { position: fixed; inset: 0; z-index: 9999; padding: var(--space-sm); display: grid; place-items: center; background: var(--color-overlay); color: var(--color-ink-2); }
.modal { width: min(100%, 27rem); max-height: min(80dvh, 40rem); overflow-y: auto; padding: var(--space-md); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-panel); background: var(--color-paper); color: var(--color-ink-2); box-shadow: var(--shadow-panel); animation: modal-in var(--dur-panel) var(--ease-out); }
.modal h3 { margin-block-end: var(--space-xs); font-size: var(--text-lg); }
.modal p { margin-block-end: var(--space-sm); color: var(--color-muted); }
.modal .fa { margin-block-start: var(--space-sm); display: flex; justify-content: flex-end; gap: var(--space-2xs); }
.mk { margin-block: var(--space-xs); padding: var(--space-sm); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); overflow-wrap: anywhere; user-select: all; }
.mdl-item { min-width: 0; min-height: var(--control-h-sm); padding-inline: var(--space-2xs); display: flex; align-items: center; gap: var(--space-2xs); border: .0625rem solid var(--color-rule); border-radius: var(--radius-control); background: var(--color-paper); color: var(--color-ink-2); font-size: var(--text-xs); }
.mdl-item .fx1 { min-width: 0; white-space: normal; overflow-wrap: anywhere; }
.mdl-item i:first-child { color: var(--color-muted); }
.mdl-add-btn { flex-shrink: 0; width: var(--control-h-sm); min-height: 0; font-size: var(--text-md); line-height: 2; }
.grid-2-gap6 { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-2xs); }
@keyframes modal-in { from { opacity: 0; transform: translateY(var(--space-xs)); } to { opacity: 1; transform: none; } }

/* compatibility utilities used by existing interaction code */
.fc { display: flex; align-items: center; gap: var(--space-2xs); }
.fx1 { flex: 1; min-width: 0; }
.fx-s0 { flex-shrink: 0; }
.flex-col { display: flex; flex-direction: column; }
.jc-c { justify-content: center; }
.gap-8, .gp8 { gap: var(--space-2xs); }
.gp3, .gp4 { gap: var(--space-3xs); }
.gp6 { gap: var(--space-2xs); }
.mt-1 { margin-block-start: var(--space-3xs); }
.mt-2, .mt-8 { margin-block-start: var(--space-2xs); }
.mt-3, .mt-6 { margin-block-start: var(--space-2xs); }
.mb-2, .mb-10 { margin-block-end: var(--space-2xs); }
.mb-3, .mb-4 { margin-block-end: var(--space-3xs); }
.m-16-0 { margin-block: var(--space-sm); }
.input-mt-6 { margin-block-start: var(--space-2xs); }
.p-14, .p-10-12 { padding: var(--space-xs); }
.fw { width: 100%; }
.fw-4 { font-weight: 400; }
.fw-6 { font-weight: 600; }
.fw-7 { font-weight: 700; }
.fs-xs, .fs-65, .fs-77 { font-size: var(--text-xs); }
.fs-sm, .fs-s, .fs-88 { font-size: var(--text-sm); }
.fs-1 { font-size: var(--text-md); }
.fs-xxs { font-size: .625rem; }
.w12, .w14, .w16 { width: 1rem; }
.c-p { color: var(--color-accent); }
.c-l, .c-muted, .mu { color: var(--color-muted); }
.c-s { color: var(--color-success); }

/* \u590D\u5236\u6210\u529F\u6001\u9700\u538B\u8FC7 .model-token i / .mdl-item i:first-child \u7684 muted \u8272\uFF080,2,0 > 0,1,1\uFF09 */
.model-token i.c-s, .mdl-item i.c-s, .mdl-item i:first-child.c-s { color: var(--color-success); }
.c-d { color: var(--color-danger); }
.mu { font-size: var(--text-xs); }
.tc { text-align: center; }
.va-m { vertical-align: middle; }
.ov { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cp { cursor: pointer; user-select: none; }
.cd { padding: var(--space-3xs) var(--space-2xs); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink); font-family: var(--font-mono); font-size: var(--text-xs); }
.copy-icon { color: var(--color-muted); font-size: var(--text-xs); }

@media (hover: hover) and (pointer: fine) {
  .btn-p:hover { border-color: var(--color-accent-hover); background: var(--color-accent-hover); }
  .btn-s:hover, .btn-gh:hover, .icon-btn:hover, .password-toggle:hover { border-color: var(--color-rule-2); background: var(--color-paper-2); color: var(--color-ink); }
  .btn-g:hover { border-color: var(--color-success); }
  .btn-d:hover { border-color: var(--color-danger); background: var(--color-danger); color: var(--color-paper); }
  input:hover, textarea:hover, select:hover { background: var(--color-paper-2); }
  .model-token:hover { border-color: var(--color-accent); color: var(--color-focus); }
  .provider-row:hover, .pi:hover, .ki:hover { border-color: var(--color-rule-2); }
  .ps:hover { background: var(--color-paper-2); }
  .admin-nav__link:hover { background: var(--color-paper-2); color: var(--color-ink); }
}

@media (min-width: 40rem) {
  .shell { width: min(100% - calc(var(--space-lg) * 2), var(--shell)); }
  .home-hero { padding-block: var(--space-3xl); }
  .metrics-strip { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .metric { padding-inline: var(--space-md); }
  .metric:first-child { padding-inline-start: 0; }
  .metric:last-child { border-inline-end: 0; }
  .metric:nth-child(even) { border-inline-end: .0625rem solid var(--color-rule); }
  .metric:nth-child(n+3) { border-block-start: 0; }
  .section-heading { grid-template-columns: minmax(0, 1fr) minmax(16rem, .45fr); }
  .provider-row { grid-template-columns: minmax(13rem, .7fr) minmax(0, 1.5fr) auto; align-items: center; }
  .site-footer__inner { flex-direction: row; align-items: center; justify-content: space-between; }
  .auth-context, .auth-form-wrap { padding: var(--space-2xl); }
  .fr { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .fr3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .admin-content { padding-inline: var(--space-lg); }
  .admin-heading, .section-heading--admin { grid-template-columns: minmax(0, 1fr) auto; }
  .admin-heading__actions { justify-content: flex-end; }
  .admin-metrics { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .admin-metrics > div { border-block-end: 0; }
  .admin-metrics > div:nth-child(even) { border-inline-end: .0625rem solid var(--color-rule); }
  .admin-metrics > div:last-child { border-inline-end: 0; }
  .panel-actions, .detail-actions { flex-direction: row; align-items: center; justify-content: space-between; }
  .ki { flex-direction: row; align-items: center; justify-content: space-between; }
  .grid-2-gap6 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (min-width: 60rem) {
  .home-hero { grid-template-columns: minmax(0, .9fr) minmax(28rem, 1.1fr); align-items: center; gap: var(--space-2xl); }
  .auth-shell { grid-template-columns: minmax(0, 1.05fr) minmax(25rem, .95fr); }
  .auth-context { border-block-end: 0; border-inline-end: .0625rem solid var(--color-rule); }
  .admin-shell { display: grid; grid-template-columns: 15rem minmax(0, 1fr); transition: grid-template-columns .18s ease; }
  .admin-rail { position: sticky; inset-block-start: 0; height: 100dvh; padding: var(--space-md) var(--space-sm); display: flex; flex-direction: column; border-inline-end: .0625rem solid var(--color-rule); background: var(--color-paper); color: var(--color-ink-2); overflow: hidden; transition: padding .18s ease; }
  .admin-rail__head { display: flex; align-items: center; justify-content: space-between; gap: var(--space-2xs); }
  .admin-rail__brand { padding-inline: var(--space-xs); min-width: 0; }
  .admin-rail__brand > span:last-child { display: flex; flex-direction: column; line-height: 1.2; white-space: nowrap; overflow: hidden; }
  .rail-toggle { cursor: pointer; background: none; border: 0; font: inherit; text-align: start; }
  /* \u6536\u7F29\u6001: \u53EA\u5269\u56FE\u6807 */
  .admin-shell.is-collapsed { grid-template-columns: 4.25rem minmax(0, 1fr); }
  .admin-shell.is-collapsed .admin-rail { padding-inline: .5rem; }
  .admin-shell.is-collapsed .admin-rail__head { justify-content: center; }
  .admin-shell.is-collapsed .admin-rail__brand { width: 100%; justify-content: center; padding-inline: 0; }
  .admin-shell.is-collapsed .admin-rail__brand > span:last-child,
  .admin-shell.is-collapsed .admin-nav__link span,
  .admin-shell.is-collapsed .admin-nav__link b { display: none; }
  .admin-shell.is-collapsed .admin-nav__link { padding-inline: 0; grid-template-columns: 1fr; justify-items: center; }
  .admin-shell.is-collapsed .rail-toggle i { transform: rotate(180deg); }
  .admin-nav { margin-block-start: var(--space-xl); display: grid; gap: var(--space-3xs); }
  .admin-nav__link { min-height: var(--control-h); padding-inline: var(--space-xs); display: grid; grid-template-columns: 1.25rem minmax(0, 1fr) auto; align-items: center; gap: var(--space-2xs); color: var(--color-muted); font-weight: 600; }
  .admin-nav__link b { min-width: 1.5rem; padding-inline: var(--space-3xs); border-radius: var(--radius-round); background: var(--color-paper-3); color: var(--color-muted); font-family: var(--font-mono); font-size: .625rem; text-align: center; }
  .admin-nav__link.is-active { background: var(--color-accent-soft); color: var(--color-focus); }
  .admin-rail__foot { margin-block-start: auto; display: grid; gap: var(--space-3xs); }
  .admin-topbar { display: none; }
  .admin-content { padding-block-start: var(--space-xl); }
  .grid-2-gap6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pd { padding: var(--space-lg); }
}

@media (min-width: 80rem) {
  .admin-content { padding-inline: var(--space-xl); }
}

@media (max-width: 24rem) {
  .brand__descriptor { display: none; }
  .topbar__actions .btn-gh { display: none; }
  .topbar__actions .btn, .topbar--auth .btn { padding-inline: var(--space-xs); }
  .request-panel figcaption { align-items: flex-start; flex-direction: column; justify-content: center; gap: 0; }
  .protocol-state { font-size: .5625rem; }
  .workspace-section { padding: 0; }
  .provider-avatar { display: none; }
  .ps { align-items: flex-start; }
  .ps > .fc { flex-direction: column; align-items: flex-end; }
  .field-row { flex-wrap: wrap; }
  .field-row input { flex-basis: calc(100% - 3.5rem); }
  .field-row .btn { flex: 1; }
  .admin-topbar .brand__name { display: none; }
  .admin-heading__actions .btn { flex: 1; }
}

@media (pointer: coarse) {
  .btn, .model-token, .password-toggle, input, select { min-height: var(--control-h); }
  .icon-btn, .password-toggle { width: var(--control-h); height: var(--control-h); flex-basis: var(--control-h); }
}

@media (prefers-reduced-motion: reduce) {
  html, body { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .001ms !important; animation-iteration-count: 1 !important; transition-duration: .001ms !important; }
  .modal { transform: none; }
}
/* ===== \u7528\u91CF\u7EDF\u8BA1 ===== */
.rank-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr)); gap: var(--space-sm); }
.rank-card { min-width: 0; border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); padding: var(--space-sm); background: var(--color-paper); }
.rank-card .panel-heading { margin-block-end: var(--space-xs); }
.rank-card code { font-family: var(--font-mono); }
.trend-fill { transition: width .3s ease; }

/* ================================================================
   \u672C\u9879\u76EE\u4E1A\u52A1\u7EC4\u4EF6\u5C42 \u2014 \u6CBF\u7528\u4E0A\u65B9\u540C\u4E00\u5957\u8BBE\u8BA1\u4EE4\u724C\uFF08AI Gateway design.md\uFF09
   \u4EC5\u8865\u5145\u672C\u670D\u52A1\u7279\u6709\u7684\u8868\u683C/\u5FBD\u6807/\u56FE\u8868/\u8F93\u51FA\u6846\u7B49\uFF0C\u4E0D\u5F15\u5165\u65B0\u98CE\u683C
   ================================================================ */
:root {
  --color-warn: oklch(58% 0.115 78);
  --color-warn-soft: oklch(96.5% 0.035 85);
  --color-warn-ink: oklch(40% 0.085 78);
}

/* \u6570\u636E\u8868\u683C */
.tb { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
.tb th { padding: var(--space-xs) var(--space-sm); text-align: start; color: var(--color-muted); font-family: var(--font-mono); font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; white-space: nowrap; border-block-end: .0625rem solid var(--color-rule-2); }
.tb td { padding: var(--space-xs) var(--space-sm); border-block-end: .0625rem solid var(--color-rule); color: var(--color-ink-2); vertical-align: middle; }
.tb tbody tr:last-child td { border-block-end: 0; }
.tb tbody tr:hover { background: var(--color-paper-2); }
.tb code { font-size: var(--text-xs); white-space: nowrap; }
/* \u8868\u683C\u4E2D\u7684\u957F\u6587\u672C\u5217\uFF1A\u8D85\u51FA\u5373\u7701\u7565\u53F7\uFF0C\u60AC\u505C\u7528 title \u770B\u5168\u6587\uFF0C\u907F\u514D\u628A\u8868\u683C\u6491\u5F00 */
.cell-clip { display: block; max-width: clamp(8rem, 30vw, 24rem); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* HTTP \u65B9\u6CD5\u5FBD\u6807 */
.method { display: inline-flex; align-items: center; justify-content: center; min-height: 1.5rem; padding-inline: var(--space-2xs); border-radius: var(--radius-control); font-family: var(--font-mono); font-size: .6875rem; font-weight: 600; letter-spacing: .04em; }
.method.post { background: var(--color-accent-soft); color: var(--color-focus); }
.method.get { background: var(--color-success-soft); color: var(--color-success-ink); }
.method.del, .method.delete { background: var(--color-danger-soft); color: var(--color-danger-ink); }
.method.patch, .method.put { background: var(--color-paper-3); color: var(--color-ink-2); }

/* \u72B6\u6001\u5FBD\u6807\uFF08\u7B80\u5316\u5199\u6CD5\uFF0C\u7B49\u540C status-badge\uFF09 */
.badge { display: inline-flex; align-items: center; min-height: 1.5rem; padding-inline: var(--space-2xs); border-radius: var(--radius-control); font-size: .6875rem; font-weight: 600; white-space: nowrap; }
.badge-ok { background: var(--color-success-soft); color: var(--color-success-ink); }
.badge-fail { background: var(--color-danger-soft); color: var(--color-danger-ink); }
.badge-mute { background: var(--color-paper-3); color: var(--color-muted); }

/* \u63D0\u793A\u5757 */
.notice { padding: var(--space-xs) var(--space-sm); display: flex; flex-direction: column; gap: var(--space-3xs); border: .0625rem solid transparent; border-radius: var(--radius-control); font-size: var(--text-sm); line-height: 1.6; }
.notice p { margin: 0; }
.notice code, .notice .tag { font-size: var(--text-xs); }
.notice.info { background: var(--color-accent-soft); border-color: oklch(90% 0.035 256); color: var(--color-focus); }
.notice.warn { background: var(--color-warn-soft); border-color: oklch(90% 0.055 85); color: var(--color-warn-ink); }
.notice strong { font-weight: 600; }

/* \u9762\u677F\uFF08\u5361\u7247\uFF09 */
.panel { border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); }
.panel + .panel, .panel + .notice, .notice + .panel { margin-block-start: var(--space-md); }
.panel-head { padding: var(--space-sm) var(--space-md); display: flex; align-items: center; justify-content: space-between; gap: var(--space-sm); border-block-end: .0625rem solid var(--color-rule); }
.panel-head h3 { font-family: var(--font-display); font-size: var(--text-md); font-weight: 600; }
.panel-body { padding: var(--space-md); }
.panel-body > * + * { margin-block-start: var(--space-sm); }
.panel-flush { overflow: hidden; }
/* \u8868\u683C\u5E95\u90E8\u7684\u64CD\u4F5C / \u5206\u9875\u6761 */
.table-foot { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: var(--space-2xs) var(--space-sm); padding: var(--space-2xs) var(--space-sm); border-block-start: .0625rem solid var(--color-rule); }
@media (max-width: 48rem) { .table-foot { justify-content: center; } }

/* \u7EDF\u8BA1\u7F51\u683C */
.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); overflow: hidden; }
.stat { padding: var(--space-sm); border-inline-end: .0625rem solid var(--color-rule); border-block-end: .0625rem solid var(--color-rule); min-width: 0; }
.stat .k { color: var(--color-muted); font-family: var(--font-mono); font-size: .6875rem; letter-spacing: .06em; text-transform: uppercase; }
.stat .v { margin-block-start: var(--space-2xs); color: var(--color-ink); font-family: var(--font-display); font-size: var(--text-xl); font-weight: 600; line-height: 1; }
.stat .v small { margin-inline-start: .25rem; color: var(--color-muted); font-family: var(--font-mono); font-size: var(--text-xs); font-weight: 400; }
@media (min-width: 60rem) { .stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }

/* \u67F1\u72B6\u56FE */
.bars { display: flex; align-items: flex-end; gap: var(--space-xs); padding: var(--space-sm) 0; }
.bar-col { flex: 1; min-width: 0; display: flex; flex-direction: column; align-items: center; gap: var(--space-3xs); }
.bar-track { width: 100%; height: 6rem; display: flex; align-items: flex-end; }
.bar-fill { width: 100%; min-height: .25rem; background: var(--color-accent); border-radius: var(--radius-control) var(--radius-control) 0 0; transition: height var(--dur-panel) var(--ease-out); }
.bar-lb { font-family: var(--font-mono); font-size: .6875rem; color: var(--color-muted); }

/* \u4EE3\u7801\u8F93\u51FA / \u4EE3\u7801\u5757 */
.mono-out, .code { margin: 0; padding: var(--space-sm); border: .0625rem solid var(--color-graphite-rule); border-radius: var(--radius-control); background: var(--color-graphite); color: var(--color-graphite-ink); font-family: var(--font-mono); font-size: var(--text-xs); line-height: 1.7; overflow: auto; white-space: pre-wrap; word-break: break-word; }

/* \u590D\u5236\u7EC4 */
.copy-key { display: flex; align-items: center; gap: var(--space-2xs); }
.copy-key code { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: var(--text-xs); color: var(--color-ink-2); }

/* \u8868\u5355 */
.field { min-width: 0; display: flex; flex-direction: column; gap: var(--space-3xs); }
.field > label { color: var(--color-ink-2); font-size: var(--text-xs); font-weight: 600; }
/* \u8868\u5355\u4E0B\u65B9\u7684\u8865\u5145\u8BF4\u660E\uFF1A\u5C0F\u5B57 + \u56FE\u6807\uFF0C\u9650\u5236\u884C\u5BBD\u907F\u514D\u957F\u53E5\u94FA\u6EE1\u6574\u884C */
.form-hint { display: flex; align-items: flex-start; gap: var(--space-2xs); max-width: 68ch; color: var(--color-muted); font-size: var(--text-xs); line-height: 1.7; }
.form-hint > i { flex: 0 0 auto; margin-block-start: .2em; }
.form-hint > span { min-width: 0; }
.row { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-sm); }
@media (min-width: 48rem) { .row { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.muted { color: var(--color-muted); }
.tag { display: inline-block; padding: .0625rem var(--space-3xs); border: .0625rem solid var(--color-rule-2); border-radius: var(--radius-control); background: var(--color-paper-2); color: var(--color-ink-2); font-family: var(--font-mono); font-size: var(--text-xs); }
.empty { padding: var(--space-xl) var(--space-sm); text-align: center; color: var(--color-muted); font-size: var(--text-sm); }

/* \u89C6\u56FE\u9875\u5934 */
.page-head { margin-block-end: var(--space-md); display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-sm); }
.page-head h1 { font-size: var(--text-xl); font-weight: 600; }
.sp { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2xs); }

/* \u63D0\u793A\u6761\u5BB9\u5668 */
.toasts { position: fixed; inset-block-start: var(--space-sm); inset-inline-end: var(--space-sm); z-index: 9998; display: flex; flex-direction: column; gap: var(--space-2xs); width: min(calc(100% - var(--space-lg)), 24rem); }
.toasts .toast { position: static; width: auto; }
.toast.ok { border-color: var(--color-success-soft); background: var(--color-success-soft); color: var(--color-success-ink); box-shadow: none; }
.toast.err { border-color: var(--color-danger-soft); background: var(--color-danger-soft); color: var(--color-danger-ink); box-shadow: none; }

/* \u9996\u9875\u5185\u5D4C\u5C0F\u4ED3\u5E93 */
.hero-grid { display: grid; grid-template-columns: minmax(0, 1fr); gap: var(--space-md); }
@media (min-width: 60rem) { .hero-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.hero-card { padding: var(--space-md); border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); }
.hero-card h3 { font-size: var(--text-md); margin-block-end: var(--space-3xs); }
.hero-card p { color: var(--color-muted); font-size: var(--text-sm); }
.hero-card code { font-size: var(--text-xs); }
.icon-lg { color: var(--color-accent); font-size: var(--text-md); }

/* \u517C\u5BB9\u522B\u540D\uFF08\u65E7\u7C7B\u540D \u2192 \u540C\u4E00\u5957\u4EE4\u724C\uFF0C\u4FDD\u8BC1\u540E\u53F0\u89C6\u56FE\u4E0D\u7834\u76F8\uFF09 */
.card { border: .0625rem solid var(--color-rule); border-radius: var(--radius-panel); background: var(--color-paper); }
.card-pad, .panel-pad { padding: var(--space-md); }
.card-pad > * + *, .panel-pad > * + * { margin-block-start: var(--space-sm); }
.card h3, .panel-pad h3 { font-family: var(--font-display); font-size: var(--text-md); font-weight: 600; }
.card p { color: var(--color-muted); font-size: var(--text-sm); }
.btn-primary { border-color: var(--color-accent); background: var(--color-accent); color: var(--color-accent-ink); }
.btn-primary:hover { border-color: var(--color-accent-hover); background: var(--color-accent-hover); }
.btn-sm { min-height: var(--control-h-sm); padding-inline: var(--space-xs); font-size: var(--text-xs); }
.btn-danger { border-color: var(--color-rule-2); background: var(--color-paper); color: var(--color-danger-ink); }
.btn-danger:hover { border-color: var(--color-danger); background: var(--color-danger-soft); }
.input { width: 100%; }
.grid { display: grid; gap: var(--space-md); grid-template-columns: minmax(0, 1fr); }
@media (min-width: 48rem) { .grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (min-width: 60rem) { .grid-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
/* \u540E\u53F0\u89C6\u56FE\u9875\u5934\uFF08ai-gateway \u539F\u751F\u98CE\u683C\uFF09 */
.admin-heading { margin-block-end: var(--space-lg); display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: var(--space-sm); }
.admin-heading > div > h1, .admin-heading > h1 { font-size: var(--text-xl); font-weight: 600; }
/* \u89C6\u56FE\u5185\u591A\u4E2A\u5206\u8282\uFF08\u5982\u8349\u7A3F\u7BB1\u6309\u516C\u4F17\u53F7\u5206\u7EC4\uFF09\u4E4B\u95F4\u7559\u51FA\u95F4\u8DDD\uFF1A\u975E\u9996\u4E2A\u6807\u9898\u624D\u52A0\uFF0C\u907F\u514D\u63D0\u793A / \u8868\u683C\u4E0E\u4E0B\u4E00\u4E2A\u6807\u9898\u9ECF\u8FDE */
#view > * + .admin-heading { margin-block-start: var(--space-xl); }
.dots { display: flex; gap: .25rem; }
.dots i { width: .375rem; height: .375rem; border-radius: 50%; background: var(--color-rule-2); }

/* \u9762\u677F\u5185\u5BB9\u7EDF\u4E00\u8D77\u59CB\u8FB9\uFF1A\u975E flush \u9762\u677F\u7684\u6240\u6709\u76F4\u63A5\u5B50\u5143\u7D20\u90FD\u4E0E\u9762\u677F\u6807\u9898\u5DE6\u5BF9\u9F50\u3002
   \u7528\u5916\u8FB9\u8DDD\u800C\u975E\u5185\u8FB9\u8DDD\uFF0C\u907F\u514D\u6309\u94AE / \u4EE3\u7801\u5757 / \u8868\u683C\u88AB\u4E8C\u6B21\u7F29\u8FDB\uFF1B.panel \u6709\u8FB9\u6846\uFF0C\u5B50\u5143\u7D20\u5916\u8FB9\u8DDD\u4E0D\u4F1A\u6EA2\u51FA\u3002 */
.panel:not(.panel-flush) > *:not(.panel-head):not(.stat-grid) { margin: var(--space-md); }
/* flush \u9762\u677F\u91CC\u7684\u7A7A\u72B6\u6001\u6846\u4E5F\u8981\u5185\u7F29\uFF0C\u5426\u5219\u865A\u7EBF\u6846\u4F1A\u4E0E\u9762\u677F\u8FB9\u6846\u91CD\u53E0 */
.panel-flush > .empty-state { margin: var(--space-md); }
.panel > .stat-grid { border: 0; border-radius: 0; }

/* \u4EE4\u724C\u5C55\u793A / \u56FE\u6807\u7EC6\u8282 */
.mask-key { font-family: var(--font-mono); font-size: var(--text-xs); cursor: pointer; word-break: break-all; text-decoration: underline dotted; text-underline-offset: 3px; }
.mask-key:hover { color: var(--color-accent, currentColor); }
.mask-key.show { text-decoration: none; }
.auth-context__lede { color: var(--color-muted); }
`;var rr=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">`;function We(e,t,a="site-page"){return`<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f1115">
<meta name="description" content="\u628A Markdown / HTML \u6587\u7AE0\u901A\u8FC7\u4E00\u884C API \u63A8\u9001\u8FDB\u5FAE\u4FE1\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\uFF0C\u56FE\u7247\u81EA\u52A8\u8F6C\u5B58\uFF0C\u8349\u7A3F\u7531\u4F60\u786E\u8BA4\u540E\u53D1\u5E03\u3002">
<title>${D(e)}</title>
${rr}
<style>${be}</style>
</head><body class="${a}">${t}</body></html>`}var nr=e=>`
<header class="topbar"><div class="shell topbar__inner">
  <a class="brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
    <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
    <span class="brand__name">\u8349\u7A3F\u63A8\u9001\u7F51\u5173</span>
    <span class="brand__descriptor">WECHAT DRAFT API</span>
  </a>
  <nav class="topbar__actions" aria-label="\u4E3B\u5BFC\u822A">
    <a class="btn btn-gh" href="/#docs"><i class="fas fa-book" aria-hidden="true"></i>\u63A5\u53E3\u6587\u6863</a>
    <a class="btn btn-gh" href="/#start"><i class="fas fa-bolt" aria-hidden="true"></i>\u5FEB\u901F\u5F00\u59CB</a>
    <a class="btn btn-p" href="${e?"/admin":"/admin/login"}"><i class="fas fa-sliders-h" aria-hidden="true"></i>${e?"\u8FDB\u5165\u540E\u53F0":"\u540E\u53F0\u767B\u5F55"}</a>
  </nav>
</div></header>`,ze=`<footer class="site-footer"><div class="shell site-footer__inner">
  <span>\u8349\u7A3F\u63A8\u9001\u7F51\u5173 \xB7 Cloudflare Workers + Hono</span>
  <span>\u6570\u636E\u5B58\u50A8\u4E8E\u81EA\u6709 D1 \u6570\u636E\u5E93 \xB7 \u4EC5\u521B\u5EFA\u8349\u7A3F\uFF0C\u4E0D\u81EA\u52A8\u53D1\u5E03</span>
</div></footer>`,sr=`<script>
(function () {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy') || '';
      var label = btn.querySelector('span');
      var done = function () {
        if (!label) return;
        var old = label.textContent;
        label.textContent = '\u5DF2\u590D\u5236';
        setTimeout(function () { label.textContent = old; }, 1500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else { done(); }
    });
  });
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var el = document.getElementById(a.getAttribute('href').slice(1));
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
<\/script>`;function qt(e){let t=`curl -X POST ${e}/api/draft \\
  -H "X-API-Key: wxk_\u4F60\u7684\u4EE4\u724C" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "\u6211\u7684\u7B2C\u4E00\u7BC7\u6587\u7AE0",
    "author": "\u5C0F\u7F16",
    "contentType": "markdown",
    "content": "# \u6807\u9898\\n\\n\u6B63\u6587\u652F\u6301 **Markdown**\uFF0C\u56FE\u7247\u4F1A\u81EA\u52A8\u8F6C\u5B58",
    "cover": "https://example.com/cover.png"
  }'`,a=`import requests

r = requests.post(
    "${e}/api/draft",
    headers={"X-API-Key": "wxk_\u4F60\u7684\u4EE4\u724C"},
    json={
        "title": "\u6211\u7684\u7B2C\u4E00\u7BC7\u6587\u7AE0",
        "author": "\u5C0F\u7F16",
        "contentType": "markdown",
        "content": "# \u6807\u9898\\n\\n\u6B63\u6587\u91CC\u7684\u5916\u94FE\u56FE\u7247\u4F1A\u88AB\u81EA\u52A8\u8F6C\u5B58\u5230\u5FAE\u4FE1\u57DF\u540D",
        "cover": "https://example.com/cover.png",
    },
    timeout=120,
)
print(r.json())   # {"ok": true, "data": {"media_id": "...", ...}}`,r=`const res = await fetch("${e}/api/draft", {
  method: "POST",
  headers: {
    "X-API-Key": "wxk_\u4F60\u7684\u4EE4\u724C",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    title: "\u6211\u7684\u7B2C\u4E00\u7BC7\u6587\u7AE0",
    contentType: "markdown",
    content: "## Hello\\n\\n\u8FD9\u662F\u6B63\u6587",
    cover: "https://example.com/cover.png",
  }),
})
console.log(await res.json())`;return We("\u8349\u7A3F\u63A8\u9001\u7F51\u5173 \xB7 \u4E00\u884C API \u628A\u6587\u7AE0\u9001\u8FDB\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1",`${nr(!1)}
<main>
  <section class="shell home-hero">
    <div class="home-hero__copy">
      <p class="eyebrow"><span aria-hidden="true"></span>CLOUDFLARE WORKERS \xB7 \u5FAE\u4FE1\u516C\u4F17\u53F7\u8349\u7A3F API</p>
      <h1 id="home-title">\u4E00\u884C API\uFF0C\u628A\u6587\u7AE0\u9001\u8FDB\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u3002</h1>
      <p class="home-hero__lede">\u4F20\u5165 Markdown \u6216 HTML\uFF0C\u670D\u52A1\u81EA\u52A8\u5B8C\u6210\u5916\u94FE\u56FE\u7247\u8F6C\u5B58\u3001\u5C01\u9762\u7D20\u6750\u4E0A\u4F20\u4E0E\u8349\u7A3F\u521B\u5EFA\u3002
        \u6392\u7248\u4E0E\u53D1\u5E03\u4ECD\u7531\u4F60\u5728\u516C\u4F17\u53F7\u540E\u53F0\u4EBA\u5DE5\u786E\u8BA4\uFF0C\u5B89\u5168\u53EF\u63A7\u3002</p>
      <div class="endpoint-box" aria-label="\u63A5\u53E3\u5730\u5740">
        <span class="endpoint-box__label">DRAFT ENDPOINT</span>
        <code>${D(e)}/api/draft</code>
        <button class="icon-btn" type="button" data-copy="${D(e)}/api/draft" aria-label="\u590D\u5236\u63A5\u53E3\u5730\u5740">
          <i class="far fa-copy" aria-hidden="true"></i><span>\u590D\u5236</span>
        </button>
      </div>
      <div class="topbar__actions" style="margin-block-start:var(--space-md)">
        <a class="btn btn-p" href="#start"><i class="fas fa-bolt" aria-hidden="true"></i>\u7ACB\u5373\u63A5\u5165</a>
        <a class="btn btn-s" href="/admin"><i class="fas fa-sliders-h" aria-hidden="true"></i>\u7BA1\u7406\u63A7\u5236\u53F0</a>
      </div>
    </div>
    <figure class="request-panel" aria-labelledby="req-cap">
      <figcaption id="req-cap"><span>POST /api/draft</span>
        <span class="protocol-state"><i aria-hidden="true"></i>MARKDOWN / HTML</span></figcaption>
      <pre><code>${D(t)}</code></pre>
      <div class="request-panel__foot"><span>\u8FD4\u56DE</span><code>{"ok":true,"data":{"media_id":"..."}}</code></div>
    </figure>
    <div class="endpoint-box endpoint-box--list" aria-label="\u5168\u90E8\u63A5\u53E3">
      <span class="endpoint-box__label">ALL ENDPOINTS</span>
      <div class="endpoint-list">
        <div class="ep-item"><code><span class="endpoint-method">POST</span> /api/draft</code><small>\u65B0\u5EFA\u8349\u7A3F</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /api/drafts</code><small>\u8349\u7A3F\u7BB1\u5217\u8868</small></div>
        <div class="ep-item"><code><span class="endpoint-method">DELETE</span> /api/drafts/:mediaId</code><small>\u5220\u9664\u8349\u7A3F</small></div>
        <div class="ep-item"><code><span class="endpoint-method">GET</span> /api/health</code><small>\u914D\u7F6E\u81EA\u68C0</small></div>
      </div>
    </div>
  </section>

  <section class="shell metrics-strip" aria-label="\u670D\u52A1\u80FD\u529B">
    <div class="metric"><span class="metric__value">4</span><span class="metric__label">\u4E1A\u52A1\u63A5\u53E3</span></div>
    <div class="metric"><span class="metric__value">\u81EA\u52A8</span><span class="metric__label">\u56FE\u7247\u8F6C\u5B58</span></div>
    <div class="metric"><span class="metric__value">D1</span><span class="metric__label">\u8BB0\u5F55\u5B58\u50A8</span></div>
    <div class="metric"><span class="metric__value">0</span><span class="metric__label">\u670D\u52A1\u5668\u4F9D\u8D56</span></div>
  </section>

  <section class="shell directory" id="start" aria-labelledby="start-title">
    <div class="section-heading">
      <div>
        <h2 id="start-title">\u5FEB\u901F\u5F00\u59CB</h2>
        <p>\u4E09\u6B65\uFF1A\u9886\u53D6\u4EE4\u724C \u2192 \u8C03\u7528\u63A5\u53E3 \u2192 \u5230\u516C\u4F17\u53F7\u540E\u53F0\u786E\u8BA4\u8349\u7A3F\u3002\u6574\u4E2A\u8FC7\u7A0B\u4E0D\u9700\u8981\u670D\u52A1\u5668\u4E0E\u5907\u6848\u3002</p>
      </div>
    </div>

    <div class="hero-grid">
      <article class="hero-card">
        <h3><i class="fas fa-image icon-lg" aria-hidden="true"></i> \u56FE\u7247\u81EA\u52A8\u8F6C\u5B58</h3>
        <p>\u6B63\u6587\u4E2D\u7684\u5916\u94FE\u56FE\u3001Base64 \u56FE\u81EA\u52A8\u4E0A\u4F20\u5230\u5FAE\u4FE1\u57DF\u540D\uFF0C\u89E3\u51B3\u8349\u7A3F\u91CC\u56FE\u7247\u4E0D\u663E\u793A\u7684\u95EE\u9898\u3002</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-code icon-lg" aria-hidden="true"></i> Markdown \u76F4\u4F20</h3>
        <p><code>contentType</code> \u8BBE\u4E3A <code>markdown</code> \u5373\u53EF\uFF0C\u6807\u9898\u3001\u5217\u8868\u3001\u4EE3\u7801\u5757\u3001\u5F15\u7528\u81EA\u52A8\u8F6C\u6210\u5FAE\u4FE1\u53EF\u7528 HTML\u3002</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-key icon-lg" aria-hidden="true"></i> \u4EE4\u724C\u4E0E\u540E\u53F0</h3>
        <p>\u591A\u4EE4\u724C\u7B7E\u53D1\u3001\u968F\u65F6\u7981\u7528\uFF1B\u63A8\u9001\u8BB0\u5F55\u3001\u6210\u529F\u7387\u3001\u8017\u65F6\u7EDF\u8BA1\u4E00\u5C4F\u638C\u63E1\u3002</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-bolt icon-lg" aria-hidden="true"></i> \u96F6\u8FD0\u7EF4</h3>
        <p>\u8DD1\u5728 Cloudflare \u8FB9\u7F18\u7F51\u7EDC\uFF0C\u51B7\u542F\u52A8\u6BEB\u79D2\u7EA7\uFF0C\u5168\u7403\u53EF\u7528\uFF0C\u65E0\u9700\u81EA\u5907\u670D\u52A1\u5668\u3002</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-flask icon-lg" aria-hidden="true"></i> \u5728\u7EBF\u8BD5\u7528</h3>
        <p>\u540E\u53F0\u7C98\u8D34\u6807\u9898\u4E0E\u6B63\u6587\u5373\u53EF\u4E00\u952E\u63A8\u9001\uFF0C\u4E0D\u7528\u5199\u4EE3\u7801\u5C31\u80FD\u9A8C\u8BC1\u6392\u7248\u6548\u679C\u3002</p>
      </article>
      <article class="hero-card">
        <h3><i class="fas fa-database icon-lg" aria-hidden="true"></i> \u6570\u636E\u81EA\u6301</h3>
        <p>\u8BB0\u5F55\u5B58\u653E\u4E8E\u4F60\u81EA\u5DF1\u7684 D1 \u6570\u636E\u5E93\uFF0C\u4E0D\u7ECF\u8FC7\u4EFB\u4F55\u7B2C\u4E09\u65B9\u4E2D\u8F6C\uFF0C\u5BC6\u94A5\u4EC5\u5B58\u4E8E Worker \u52A0\u5BC6\u53D8\u91CF\u3002</p>
      </article>
    </div>

    <div class="section-heading" style="margin-block-start:var(--space-2xl)">
      <div>
        <h2>\u8C03\u7528\u793A\u4F8B</h2>
        <p>\u5728\u8BF7\u6C42\u5934\u643A\u5E26 <code>X-API-Key</code>\uFF0C\u4E5F\u53EF\u4F7F\u7528 <code>Authorization: Bearer</code> \u6216 <code>?key=</code> \u67E5\u8BE2\u53C2\u6570\u3002</p>
      </div>
    </div>
    <div class="request-panel" style="margin-block-end:var(--space-md)">
      <figcaption><span>cURL</span></figcaption>
      <pre style="min-height:auto"><code>${D(t)}</code></pre>
    </div>
    <div class="request-panel" style="margin-block-end:var(--space-md)">
      <figcaption><span>Python</span></figcaption>
      <pre style="min-height:auto"><code>${D(a)}</code></pre>
    </div>
    <div class="request-panel">
      <figcaption><span>JavaScript</span></figcaption>
      <pre style="min-height:auto"><code>${D(r)}</code></pre>
    </div>

    <div class="notice warn" style="margin-block-start:var(--space-lg)">
      <strong><i class="fas fa-triangle-exclamation" aria-hidden="true"></i> \u4F7F\u7528\u524D\u5FC5\u505A\uFF1A\u628A Cloudflare \u51FA\u53E3 IP \u6BB5\u52A0\u5165\u516C\u4F17\u53F7\u767D\u540D\u5355</strong>
      <p>Worker \u6BCF\u6B21\u8C03\u7528\u7684\u51FA\u53E3 IP \u90FD\u53EF\u80FD\u4E0D\u540C\uFF0C\u6CA1\u6709\u52A0\u767D\u540D\u5355\u65F6\u5FAE\u4FE1\u4F1A\u76F4\u63A5\u62D2\u7EDD\uFF0C\u62A5\u9519
        <code>40164 invalid ip \u2026 not in whitelist</code>\u3002</p>
      <p>\u8BF7\u5230\u300C\u516C\u4F17\u53F7\u540E\u53F0 \u2192 \u8BBE\u7F6E\u4E0E\u5F00\u53D1 \u2192 \u57FA\u672C\u914D\u7F6E\uFF08\u6216\u5B89\u5168\u4E2D\u5FC3\uFF09\u2192 IP \u767D\u540D\u5355\u300D\uFF0C\u628A\u4E0B\u9762
        <strong>\u5168\u90E8 15 \u4E2A IPv4 \u6BB5</strong>\u4E00\u6B21\u6027\u7C98\u8FDB\u53BB\uFF08\u6BCF\u884C\u4E00\u6BB5\uFF09\uFF0C\u4FDD\u5B58\u540E\u7EA6 1~5 \u5206\u949F\u751F\u6548\uFF1A</p>
      <details open>
        <summary>\u5C55\u5F00 / \u6536\u8D77 Cloudflare \u5168\u90E8 IPv4 \u6BB5\uFF0815 \u6BB5\uFF09</summary>
        <pre class="mono-out" style="margin-block-start:var(--space-2xs)">173.245.48.0/20
103.21.244.0/22
103.22.200.0/22
103.31.4.0/22
141.101.64.0/18
108.162.192.0/18
190.93.240.0/20
188.114.96.0/20
197.234.240.0/22
198.41.128.0/17
162.158.0.0/15
104.16.0.0/13
104.24.0.0/14
172.64.0.0/13
131.0.72.0/22</pre>
      </details>
      <p><small>\u53E6\u6CE8\uFF1A\u8C03\u7528\u65B9\u987B\u643A\u5E26\u6D4F\u89C8\u5668 UA\uFF0C\u5426\u5219\u4F1A\u88AB Cloudflare \u8FB9\u7F18\u62E6\u622A\uFF08<code>403 error 1010</code>\uFF09\uFF1B
      \u82E5\u7ED1\u5B9A\u4E86\u81EA\u5B9A\u4E49\u57DF\u540D\uFF0C\u8FD8\u8981\u5728\u57DF\u540D\u5B89\u5168\u6027\u91CC\u5173\u95ED Bot Fight Mode \u4E0E\u6D4F\u89C8\u5668\u5B8C\u6574\u6027\u68C0\u67E5\u3002</small></p>
    </div>
  </section>

  <section class="shell directory" id="docs" aria-labelledby="docs-title">
    <div class="section-heading">
      <div>
        <h2 id="docs-title">\u63A5\u53E3\u6587\u6863</h2>
        <p>\u4E1A\u52A1\u63A5\u53E3\u5747\u9700\u643A\u5E26\u4EE4\u724C\uFF1B\u8FD4\u56DE\u7EDF\u4E00\u4E3A <code>{ ok: true, data: {...} }</code> \u6216 <code>{ ok: false, error: "..." }</code>\u3002</p>
      </div>
    </div>
    <div class="panel panel-flush">
      <table class="tb">
        <thead><tr><th style="width:90px">\u65B9\u6CD5</th><th style="width:230px">\u8DEF\u5F84</th><th>\u8BF4\u660E</th></tr></thead>
        <tbody>
          <tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td>
            <td>\u65B0\u5EFA\u8349\u7A3F\u3002\u5B57\u6BB5\uFF1A<code>title</code> / <code>author</code>\uFF08\u22648 \u5B57\uFF09/ <code>digest</code> / <code>content</code>\uFF08\u5FC5\u586B\uFF09/
            <code>cover</code> / <code>contentType</code>\uFF08html|markdown\uFF09/ <code>contentSourceUrl</code> /
            <code>needOpenComment</code> / <code>onlyFansCanComment</code>\uFF1B\u4F20 <code>articles[]</code> \u53EF\u4E00\u6B21\u53D1\u591A\u56FE\u6587\uFF08\u22648 \u7BC7\uFF09</td></tr>
          <tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td>
            <td>\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u5217\u8868\uFF0C\u53C2\u6570 <code>offset</code> / <code>count</code>\uFF08\u226420\uFF09</td></tr>
          <tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td>
            <td>\u5220\u9664\u6307\u5B9A\u8349\u7A3F</td></tr>
          <tr><td><span class="method post">POST</span></td><td><code>/api/material</code></td>
            <td>\u4E0A\u4F20\u56FE\u7247\u4E3A\u6C38\u4E45\u7D20\u6750\uFF08<code>url</code> \u6216 <code>dataUri</code>\uFF09\u2192 \u8FD4\u56DE <code>media_id</code> \u4E0E\u5FAE\u4FE1\u57DF\u540D <code>url</code>\uFF0C\u53EF\u590D\u7528</td></tr>
          <tr><td><span class="method get">GET</span></td><td><code>/api/health</code></td>
            <td>\u914D\u7F6E\u81EA\u68C0\uFF1A\u516C\u4F17\u53F7\u51ED\u636E\u3001\u9274\u6743\u72B6\u6001\u3001\u6570\u636E\u5E93\u8FDE\u901A\u6027</td></tr>
        </tbody>
      </table>
    </div>
    <div class="notice info" style="margin-block-start:var(--space-md)">
      \u63A8\u9001\u6210\u529F\u8FD4\u56DE <code>media_id</code>\uFF0C\u5373\u8349\u7A3F\u7F16\u53F7\u3002\u8BF7\u5230\u300C\u516C\u4F17\u53F7\u540E\u53F0 \u2192 \u8349\u7A3F\u7BB1\u300D\u67E5\u770B\uFF0C
      \u786E\u8BA4\u6392\u7248\u65E0\u8BEF\u540E\u518D\u7FA4\u53D1 \u2014\u2014 \u672C\u670D\u52A1\u53EA\u521B\u5EFA\u8349\u7A3F\uFF0C\u7EDD\u4E0D\u81EA\u52A8\u53D1\u5E03\u3002
    </div>
  </section>
</main>
${ze}
${sr}`,"site-page home-page")}function we(e={baseUrl:""}){return We("\u540E\u53F0\u767B\u5F55 \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173",`<header class="topbar topbar--auth"><div class="shell topbar__inner">
  <a class="brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
    <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
    <span class="brand__name">\u8349\u7A3F\u63A8\u9001\u7F51\u5173</span>
  </a>
  <a class="btn btn-gh" href="/"><i class="fas fa-arrow-left" aria-hidden="true"></i>\u8FD4\u56DE\u9996\u9875</a>
</div></header>
<main class="auth-shell">
  <section class="auth-context">
    <p class="eyebrow"><span aria-hidden="true"></span>CONTROL PANEL ACCESS</p>
    <h1>\u7BA1\u7406\u4EE4\u724C\u3001\u8BB0\u5F55\u4E0E\u8349\u7A3F\u3002</h1>
    <p class="auth-context__lede">\u767B\u5F55\u540E\u53EF\u4EE5\u7B7E\u53D1 / \u505C\u7528 API \u4EE4\u724C\uFF0C\u67E5\u770B\u6BCF\u4E00\u6B21\u63A8\u9001\u7684\u6210\u529F\u7387\u4E0E\u8017\u65F6\uFF0C\u7BA1\u7406\u591A\u4E2A\u516C\u4F17\u53F7\u51ED\u636E\uFF0C\u5E76\u76F4\u63A5\u67E5\u770B\u5404\u516C\u4F17\u53F7\u7684\u8349\u7A3F\u7BB1\u3002</p>
    <div class="auth-facts">
      <div><i class="fas fa-key" aria-hidden="true"></i><div><strong>\u4EE4\u724C\u7BA1\u7406</strong><span>\u591A\u4EE4\u724C\u7B7E\u53D1\u4E0E\u64A4\u9500</span></div></div>
      <div><i class="fas fa-chart-simple" aria-hidden="true"></i><div><strong>\u63A8\u9001\u8BB0\u5F55</strong><span>\u6210\u529F\u7387\u4E0E\u8017\u65F6\u7EDF\u8BA1</span></div></div>
      <div><i class="fas fa-inbox" aria-hidden="true"></i><div><strong>\u8349\u7A3F\u7BB1</strong><span>\u67E5\u770B\u4E0E\u5220\u9664\u8349\u7A3F</span></div></div>
      <div><i class="fas fa-shield-halved" aria-hidden="true"></i><div><strong>\u6570\u636E\u81EA\u6301</strong><span>\u5B58\u50A8\u4E8E\u81EA\u6709 D1 \u5E93</span></div></div>
    </div>
  </section>
  <section class="auth-form-wrap">
    <form class="auth-form" method="post" action="/admin/login" novalidate>
      <div class="auth-form__heading">
        <span class="auth-form__icon" aria-hidden="true"><i class="fas fa-lock"></i></span>
        <div><h2>\u8D26\u53F7\u767B\u5F55</h2><p>\u8F93\u5165\u7528\u6237\u540D\u4E0E\u5BC6\u7801\u7EE7\u7EED\u3002</p></div>
      </div>
      ${e.error?'<div class="al al-e"><i class="fas fa-circle-exclamation" aria-hidden="true"></i><span>\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165\u3002</span></div>':""}
      <div class="fg">
        <label for="user">\u7528\u6237\u540D</label>
        <div class="input-wrap">
          <i class="fas fa-user" aria-hidden="true"></i>
          <input id="user" name="username" type="text" placeholder="\u8BF7\u8F93\u5165\u7528\u6237\u540D"
                 autocomplete="username" required autofocus aria-required="true" value="admin">
        </div>
      </div>
      <div class="fg">
        <label for="pw">\u5BC6\u7801</label>
        <div class="input-wrap">
          <i class="fas fa-key" aria-hidden="true"></i>
          <input id="pw" name="password" type="password" placeholder="\u8BF7\u8F93\u5165\u5BC6\u7801"
                 autocomplete="current-password" required aria-required="true">
          <button class="password-toggle" id="pw-toggle" type="button" aria-label="\u663E\u793A\u5BC6\u7801">
            <i class="far fa-eye" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <p class="form-helper">\u9996\u4E2A\u7BA1\u7406\u5458\u8D26\u53F7\u9ED8\u8BA4 <code>admin</code>\uFF0C\u7531\u90E8\u7F72\u65F6\u7684 <code>ADMIN_PASSWORD</code> \u51B3\u5B9A\uFF1B\u6210\u5458\u8D26\u53F7\u8BF7\u5728\u540E\u53F0\u300C\u7528\u6237\u7BA1\u7406\u300D\u4E2D\u521B\u5EFA\u3002</p>
      <button class="btn btn-p btn-submit" type="submit">
        <span class="button-label"><i class="fas fa-right-to-bracket" aria-hidden="true"></i>\u767B\u5F55\u63A7\u5236\u53F0</span>
      </button>
    </form>
  </section>
</main>
${ze}
<script>
(function () {
  var input = document.getElementById('pw');
  var toggle = document.getElementById('pw-toggle');
  if (!toggle || !input) return;
  toggle.addEventListener('click', function () {
    var show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    toggle.innerHTML = show
      ? '<i class="far fa-eye-slash" aria-hidden="true"></i>'
      : '<i class="far fa-eye" aria-hidden="true"></i>';
    toggle.setAttribute('aria-label', show ? '\u9690\u85CF\u5BC6\u7801' : '\u663E\u793A\u5BC6\u7801');
    input.focus();
  });
})();
<\/script>`,"site-page auth-page")}function jt(e){let t=(i,o,c)=>`<a class="admin-nav__link" data-view="${i}" href="#${i}"><i class="${o}" aria-hidden="true"></i><span>${c}</span></a>`,a=(i,o)=>`<a data-view="${i}" href="#${i}">${o}</a>`,r=e.user?.role==="admin",n=e.user?.username??"",s=e.user?.role??"member";return We("\u63A7\u5236\u53F0 \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173",`<div class="admin-shell">
  <aside class="admin-rail" aria-label="\u63A7\u5236\u53F0\u5BFC\u822A">
    <div class="admin-rail__head">
      <a class="brand admin-rail__brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
        <span><strong>\u8349\u7A3F\u63A8\u9001\u7F51\u5173</strong><small>CONTROL PANEL</small></span>
      </a>
    </div>
    <nav class="admin-nav" aria-label="\u529F\u80FD\u5BFC\u822A">
      ${t("dashboard","fas fa-chart-pie","\u6982\u89C8")}
      ${t("accounts","fas fa-layer-group","\u8D26\u53F7\u7BA1\u7406")}
      ${t("records","fas fa-receipt","\u63A8\u9001\u8BB0\u5F55")}
      ${t("drafts","fas fa-inbox","\u8349\u7A3F\u7BB1")}
      ${t("tokens","fas fa-key","\u4EE4\u724C\u7BA1\u7406")}
      ${t("docs","fas fa-book","\u63A5\u53E3\u6587\u6863")}
      ${r?t("audit","fas fa-clipboard-list","\u64CD\u4F5C\u65E5\u5FD7"):""}
      ${r?t("users","fas fa-users-gear","\u7528\u6237\u7BA1\u7406"):""}
      ${r?t("settings","fas fa-gear","\u8BBE\u7F6E"):""}
    </nav>
    <div class="admin-rail__foot">
      <button class="admin-nav__link rail-toggle" type="button" id="rail-toggle">
        <i class="fas fa-angles-left" aria-hidden="true"></i><span>\u6536\u7F29\u4FA7\u8FB9\u680F</span>
      </button>
      <a class="admin-nav__link" href="/"><i class="fas fa-arrow-left" aria-hidden="true"></i><span>\u8FD4\u56DE\u9996\u9875</span></a>
      <a class="admin-nav__link" href="/admin/logout"><i class="fas fa-right-from-bracket" aria-hidden="true"></i><span>\u9000\u51FA\u767B\u5F55</span></a>
    </div>
  </aside>
  <div class="admin-main">
    <header class="admin-topbar">
      <a class="brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
        <span class="brand__name">\u8349\u7A3F\u63A8\u9001\u7F51\u5173</span>
      </a>
      <nav aria-label="\u79FB\u52A8\u7AEF\u529F\u80FD\u5BFC\u822A">
        ${a("dashboard","\u6982\u89C8")}
        ${a("accounts","\u8D26\u53F7")}
        ${a("records","\u8BB0\u5F55")}
        ${a("drafts","\u8349\u7A3F")}
        ${a("tokens","\u4EE4\u724C")}
        ${a("docs","\u6587\u6863")}
        ${r?a("audit","\u65E5\u5FD7"):""}
        ${r?a("users","\u7528\u6237"):""}
        ${r?a("settings","\u8BBE\u7F6E"):""}
      </nav>
      <a class="icon-btn" href="/admin/logout" aria-label="\u9000\u51FA\u767B\u5F55">
        <i class="fas fa-right-from-bracket" aria-hidden="true"></i>
      </a>
    </header>
    <main class="admin-content">
      <div id="view"><div class="empty-state">\u52A0\u8F7D\u4E2D\u2026</div></div>
    </main>
    ${ze}
  </div>
</div>
<div class="toasts" id="toasts"></div>
<script>window.__BASE__ = ${JSON.stringify(e.baseUrl)};<\/script>
<script>window.__ME__ = ${JSON.stringify({username:n,role:s})};<\/script>
<script src="/admin/app.js"><\/script>
<script>
(function () {
  var btn = document.getElementById('rail-toggle');
  var shellEl = document.querySelector('.admin-shell');
  if (!btn || !shellEl) return;
  btn.addEventListener('click', function () { shellEl.classList.toggle('is-collapsed'); });
})();
<\/script>`,"site-page admin-page")}function Wt(e){return Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}function zt(e){let t=new Uint8Array(Math.floor(e.length/2));for(let a=0;a<t.length;a++)t[a]=parseInt(e.substr(a*2,2),16);return t}async function Fe(e,t){let a=await crypto.subtle.importKey("raw",new TextEncoder().encode(e),"PBKDF2",!1,["deriveBits"]),r=await crypto.subtle.deriveBits({name:"PBKDF2",salt:t,iterations:1e5,hash:"SHA-256"},a,256);return Wt(new Uint8Array(r))}async function ye(e,t){if(t)return{hash:await Fe(e,zt(t)),salt:t};let a=crypto.getRandomValues(new Uint8Array(16));return{hash:await Fe(e,a),salt:Wt(a)}}async function se(e,t,a){if(!t||!a)return!1;let r=await Fe(e,zt(a));if(r.length!==t.length)return!1;let n=0;for(let s=0;s<r.length;s++)n|=r.charCodeAt(s)^t.charCodeAt(s);return n===0}var Ft=!1;async function Xt(e){if(!Ft){await e.DB.batch([e.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`),e.DB.prepare(`CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        use_count INTEGER NOT NULL DEFAULT 0
      )`),e.DB.prepare(`CREATE TABLE IF NOT EXISTS drafts (
        id TEXT PRIMARY KEY,
        media_id TEXT,
        title TEXT NOT NULL,
        author TEXT,
        status TEXT NOT NULL,
        error TEXT,
        duration_ms INTEGER NOT NULL DEFAULT 0,
        images INTEGER NOT NULL DEFAULT 0,
        content_len INTEGER NOT NULL DEFAULT 0,
        token_name TEXT,
        created_at TEXT NOT NULL
      )`),e.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`),e.DB.prepare("CREATE INDEX IF NOT EXISTS idx_drafts_created ON drafts(created_at DESC)"),e.DB.prepare("CREATE INDEX IF NOT EXISTS idx_tokens_key ON tokens(key)"),e.DB.prepare(`CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        appid TEXT NOT NULL,
        appsecret TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`),e.DB.prepare(`CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        salt TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'member',
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_login_at TEXT,
        created_by TEXT
      )`),e.DB.prepare("CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)"),e.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_logs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        username TEXT,
        action TEXT NOT NULL,
        target_type TEXT,
        target_id TEXT,
        detail TEXT,
        ip TEXT,
        created_at TEXT NOT NULL
      )`),e.DB.prepare("CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC)"),e.DB.prepare("CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id)")]);for(let t of["ALTER TABLE drafts ADD COLUMN account_id TEXT","ALTER TABLE drafts ADD COLUMN account_name TEXT","ALTER TABLE drafts ADD COLUMN user_id TEXT","ALTER TABLE sessions ADD COLUMN user_id TEXT","ALTER TABLE sessions ADD COLUMN username TEXT","ALTER TABLE tokens ADD COLUMN user_id TEXT","ALTER TABLE accounts ADD COLUMN user_id TEXT","ALTER TABLE drafts ADD COLUMN article_count INTEGER NOT NULL DEFAULT 1"])try{await e.DB.prepare(t).run()}catch{}Ft=!0}}async function Yt(e){await Xt(e);try{((await e.DB.prepare("SELECT COUNT(*) AS n FROM tokens").first())?.n??0)===0&&e.DRAFT_API_KEY&&await e.DB.prepare("INSERT INTO tokens (id, name, key, enabled, created_at, use_count) VALUES (?, ?, ?, 1, ?, 0)").bind(W(),"\u9ED8\u8BA4\u4EE4\u724C\uFF08\u7531 DRAFT_API_KEY \u8FC1\u79FB\uFF09",e.DRAFT_API_KEY,I()).run()}catch{}try{let a=(await e.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first())?.n??0;a===0&&e.WECHAT_APPID&&e.WECHAT_APPSECRET?await e.DB.prepare("INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at) VALUES (?, ?, ?, ?, 1, 1, ?)").bind(W(),"\u9ED8\u8BA4\u516C\u4F17\u53F7",e.WECHAT_APPID,e.WECHAT_APPSECRET,I()).run():a>0&&((await e.DB.prepare("SELECT COUNT(*) AS n FROM accounts WHERE is_default = 1").first())?.n??0)===0&&await e.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)").run()}catch{}try{if(((await e.DB.prepare("SELECT COUNT(*) AS n FROM users").first())?.n??0)===0){let a=await Z(e),r=a.admin_user||e.ADMIN_USER||"admin",n=a.admin_password||e.ADMIN_PASSWORD||"admin",{hash:s,salt:i}=await ye(n);await e.DB.prepare("INSERT INTO users (id, username, password_hash, salt, role, enabled, created_at, last_login_at, created_by) VALUES (?, ?, ?, ?, ?, 1, ?, NULL, NULL)").bind(W(),r,s,i,"admin",I()).run()}}catch{}try{let t=await e.DB.prepare("SELECT id FROM users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1").first();t?.id&&(await e.DB.prepare("UPDATE tokens SET user_id = ? WHERE user_id IS NULL").bind(t.id).run(),await e.DB.prepare("UPDATE accounts SET user_id = ? WHERE user_id IS NULL").bind(t.id).run(),await e.DB.prepare("UPDATE drafts SET user_id = ? WHERE user_id IS NULL").bind(t.id).run())}catch{}}async function ie(e,t){return t?(await e.DB.prepare("SELECT * FROM accounts WHERE user_id = ? ORDER BY is_default DESC, created_at ASC").bind(t).all()).results??[]:(await e.DB.prepare("SELECT * FROM accounts ORDER BY is_default DESC, created_at ASC").all()).results??[]}async function z(e,t){return await e.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(t).first()??null}async function Kt(e,t,a){let n=(a?await e.DB.prepare("SELECT COUNT(*) AS n FROM accounts WHERE user_id = ?").bind(a).first():await e.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first())?.n??0,s=t.is_default===!0||n===0,i={id:W(),name:String(t.name??"").trim()||`\u516C\u4F17\u53F7 ${n+1}`,appid:String(t.appid??"").trim(),appsecret:String(t.appsecret??"").trim(),enabled:1,is_default:s?1:0,created_at:I(),user_id:a??null};return s&&await Gt(e,a),await e.DB.prepare("INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at, user_id) VALUES (?, ?, ?, ?, 1, ?, ?, ?)").bind(i.id,i.name,i.appid,i.appsecret,i.is_default,i.created_at,i.user_id??null).run(),i}async function Gt(e,t){t?await e.DB.prepare("UPDATE accounts SET is_default = 0 WHERE user_id = ?").bind(t).run():await e.DB.prepare("UPDATE accounts SET is_default = 0").run()}async function Xe(e,t,a){let r=[],n=[];return typeof a.name=="string"&&a.name.trim()&&(r.push("name = ?"),n.push(a.name.trim())),typeof a.appid=="string"&&a.appid.trim()&&(r.push("appid = ?"),n.push(a.appid.trim())),typeof a.appsecret=="string"&&a.appsecret.trim()&&(r.push("appsecret = ?"),n.push(a.appsecret.trim())),typeof a.enabled=="number"&&(r.push("enabled = ?"),n.push(a.enabled?1:0)),r.length?(n.push(t),((await e.DB.prepare(`UPDATE accounts SET ${r.join(", ")} WHERE id = ?`).bind(...n).run()).meta?.changes??0)>0):!0}async function Vt(e,t,a){return await Gt(e,a),((await e.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = ?").bind(t).run()).meta?.changes??0)>0}async function Jt(e,t){let a=await z(e,t);if(!a)return!1;let r=await e.DB.prepare("DELETE FROM accounts WHERE id = ?").bind(t).run();return a.is_default&&(a.user_id?await e.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts WHERE user_id = ? ORDER BY created_at ASC LIMIT 1)").bind(a.user_id).run():await e.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)").run()),(r.meta?.changes??0)>0}async function U(e,t,a){try{if(await Xt(e),t){let n=await z(e,t);if(n&&(!a||n.user_id===a))return{id:n.id,name:n.name,appid:n.appid,appsecret:n.appsecret}}let r=a?await e.DB.prepare("SELECT * FROM accounts WHERE user_id = ? AND is_default = 1 LIMIT 1").bind(a).first()??await e.DB.prepare("SELECT * FROM accounts WHERE user_id = ? AND enabled = 1 ORDER BY created_at ASC LIMIT 1").bind(a).first():await e.DB.prepare("SELECT * FROM accounts WHERE is_default = 1 LIMIT 1").first()??await e.DB.prepare("SELECT * FROM accounts WHERE enabled = 1 ORDER BY created_at ASC LIMIT 1").first();if(r)return{id:r.id,name:r.name,appid:r.appid,appsecret:r.appsecret}}catch{}return!a&&e.WECHAT_APPID&&e.WECHAT_APPSECRET?{id:"",name:"\u73AF\u5883\u53D8\u91CF\u51ED\u636E",appid:e.WECHAT_APPID,appsecret:e.WECHAT_APPSECRET}:null}var I=()=>new Date().toISOString(),W=()=>crypto.randomUUID();function Qt(){let e=new Uint8Array(16);return crypto.getRandomValues(e),"wxk_"+Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}function ir(){let e=new Uint8Array(24);return crypto.getRandomValues(e),Array.from(e).map(t=>t.toString(16).padStart(2,"0")).join("")}async function Z(e){let t=await e.DB.prepare("SELECT key, value FROM settings").all(),a={};for(let r of t.results??[])a[r.key]=r.value;return a}async function Zt(e,t,a){await e.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(t,a).run()}async function ea(e,t){return t?(await e.DB.prepare("SELECT * FROM tokens WHERE user_id = ? ORDER BY created_at DESC").bind(t).all()).results??[]:(await e.DB.prepare("SELECT * FROM tokens ORDER BY created_at DESC").all()).results??[]}async function ta(e,t,a){let r={id:W(),name:t.trim()||"\u672A\u547D\u540D\u4EE4\u724C",key:Qt(),enabled:1,created_at:I(),last_used_at:null,use_count:0,user_id:a??null};return await e.DB.prepare("INSERT INTO tokens (id, name, key, enabled, created_at, last_used_at, use_count, user_id) VALUES (?, ?, ?, 1, ?, NULL, 0, ?)").bind(r.id,r.name,r.key,r.created_at,r.user_id??null).run(),r}async function aa(e,t,a){let r=[],n=[];return typeof a.name=="string"&&(r.push("name = ?"),n.push(a.name.trim()||"\u672A\u547D\u540D\u4EE4\u724C")),a.enabled!==void 0&&(r.push("enabled = ?"),n.push(a.enabled?1:0)),r.length?(n.push(t),((await e.DB.prepare(`UPDATE tokens SET ${r.join(", ")} WHERE id = ?`).bind(...n).run()).meta?.changes??0)>0):!1}async function ra(e,t){return((await e.DB.prepare("DELETE FROM tokens WHERE id = ?").bind(t).run()).meta?.changes??0)>0}async function na(e,t){let a=await ee(e,t);if(!a)return null;let r=Qt();return((await e.DB.prepare("UPDATE tokens SET key = ? WHERE id = ?").bind(r,t).run()).meta?.changes??0)===0?null:{...a,key:r}}async function ee(e,t){return await e.DB.prepare("SELECT * FROM tokens WHERE id = ?").bind(t).first()??null}async function sa(e,t){return await e.DB.prepare("SELECT * FROM tokens WHERE key = ? AND enabled = 1").bind(t).first()??null}async function ia(e,t){await e.DB.prepare("UPDATE tokens SET last_used_at = ?, use_count = use_count + 1 WHERE id = ?").bind(I(),t).run()}async function Ye(e,t){try{await e.DB.prepare(`INSERT INTO drafts (id, media_id, title, author, status, error, duration_ms, images, content_len, token_name, account_id, account_name, user_id, article_count, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(W(),t.media_id,t.title,t.author,t.status,t.error,t.duration_ms,t.images,t.content_len,t.token_name,t.account_id??null,t.account_name??null,t.user_id??null,t.article_count??1,I()).run()}catch{}}async function Ke(e,t=50,a=0,r){let n=Math.min(Math.max(t,1),200),s=Math.max(a,0);return(r?await e.DB.prepare("SELECT * FROM drafts WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(r,n,s).all():await e.DB.prepare("SELECT * FROM drafts ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(n,s).all()).results??[]}async function oa(e,t,a){return((a?await e.DB.prepare("DELETE FROM drafts WHERE id = ? AND user_id = ?").bind(t,a).run():await e.DB.prepare("DELETE FROM drafts WHERE id = ?").bind(t).run()).meta?.changes??0)>0}async function ca(e,t){t?await e.DB.prepare("DELETE FROM drafts WHERE user_id = ?").bind(t).run():await e.DB.prepare("DELETE FROM drafts").run()}async function la(e,t){let a=t?"WHERE user_id = ?":"",r=t?[t]:[],n=await e.DB.prepare(`SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success,
            COALESCE(SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END), 0) AS failed,
            COALESCE(AVG(duration_ms), 0) AS avg_duration
     FROM drafts ${a}`).bind(...r).first(),s=await e.DB.prepare(t?"SELECT COUNT(*) AS n FROM drafts WHERE date(created_at) = date('now') AND user_id = ?":"SELECT COUNT(*) AS n FROM drafts WHERE date(created_at) = date('now')").bind(...r).first(),i=await e.DB.prepare(t?"SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END), 0) AS enabled FROM tokens WHERE user_id = ?":"SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END), 0) AS enabled FROM tokens").bind(...r).first(),o=await e.DB.prepare(`SELECT date(created_at) AS date,
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success
     FROM drafts
     WHERE created_at >= datetime('now', '-7 days')${t?" AND user_id = ?":""}
     GROUP BY date(created_at)
     ORDER BY date ASC`).bind(...r).all(),c=n?.total??0,l=n?.success??0,u=new Map;for(let m of o.results??[])u.set(m.date,{total:m.total,success:m.success});let p=[];for(let m=6;m>=0;m--){let f=new Date(Date.now()-m*864e5).toISOString().slice(0,10),v=u.get(f)??{total:0,success:0};p.push({date:f,total:v.total,success:v.success})}return{total:c,success:l,failed:n?.failed??0,success_rate:c?Math.round(l/c*1e3)/10:0,avg_duration_ms:Math.round(n?.avg_duration??0),today:s?.n??0,tokens:i?.total??0,tokens_enabled:i?.enabled??0,appid_configured:!!e.WECHAT_APPID,secret_configured:!!e.WECHAT_APPSECRET,daily:p}}var or=7*864e5;async function da(e,t){let a=ir(),r=new Date(Date.now()+or).toISOString();return await e.DB.prepare("INSERT INTO sessions (id, created_at, expires_at, user_id, username) VALUES (?, ?, ?, ?, ?)").bind(a,I(),r,t?.id??null,t?.username??null).run(),{id:a,expires_at:r}}async function ua(e,t){if(!t)return null;let a=await e.DB.prepare(`SELECT s.expires_at AS expires_at, u.id AS id, u.username AS username, u.role AS role, u.enabled AS enabled
     FROM sessions s LEFT JOIN users u ON u.id = s.user_id
     WHERE s.id = ?`).bind(t).first();return a?new Date(a.expires_at).getTime()<Date.now()?(await Ge(e,t),null):!a.id||!a.username||!a.role||!a.enabled?null:{id:a.id,username:a.username,role:a.role}:null}async function Ge(e,t){await e.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(t).run()}async function xe(e,t){await e.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(t).run()}async function pa(e){await e.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(I()).run()}async function ma(e){return(await e.DB.prepare("SELECT * FROM users ORDER BY created_at ASC").all()).results??[]}async function te(e,t){return await e.DB.prepare("SELECT * FROM users WHERE id = ?").bind(t).first()??null}async function Ee(e,t){return await e.DB.prepare("SELECT * FROM users WHERE username = ?").bind(t).first()??null}async function Ve(e){return(await e.DB.prepare("SELECT COUNT(*) AS n FROM users WHERE role = 'admin' AND enabled = 1").first())?.n??0}async function ke(e,t){let a=String(t.username??"").trim(),{hash:r,salt:n}=await ye(String(t.password??"")),s={id:W(),username:a,password_hash:r,salt:n,role:t.role==="admin"?"admin":"member",enabled:1,created_at:I(),last_login_at:null,created_by:t.createdBy??null};return await e.DB.prepare("INSERT INTO users (id, username, password_hash, salt, role, enabled, created_at, last_login_at, created_by) VALUES (?, ?, ?, ?, ?, 1, ?, NULL, ?)").bind(s.id,s.username,s.password_hash,s.salt,s.role,s.created_at,s.created_by).run(),s}async function fa(e,t,a){let r=[],n=[];return(a.role==="admin"||a.role==="member")&&(r.push("role = ?"),n.push(a.role)),typeof a.enabled=="number"&&(r.push("enabled = ?"),n.push(a.enabled?1:0)),r.length?(n.push(t),((await e.DB.prepare(`UPDATE users SET ${r.join(", ")} WHERE id = ?`).bind(...n).run()).meta?.changes??0)>0):!1}async function Je(e,t,a){let{hash:r,salt:n}=await ye(String(a));await e.DB.prepare("UPDATE users SET password_hash = ?, salt = ? WHERE id = ?").bind(r,n,t).run()}async function ha(e,t){return((await e.DB.prepare("DELETE FROM users WHERE id = ?").bind(t).run()).meta?.changes??0)>0}async function ga(e,t){await e.DB.prepare("UPDATE users SET last_login_at = ? WHERE id = ?").bind(I(),t).run()}async function va(e,t,a){await e.DB.batch([e.DB.prepare("UPDATE tokens SET user_id = ? WHERE user_id = ?").bind(a,t),e.DB.prepare("UPDATE accounts SET user_id = ? WHERE user_id = ?").bind(a,t),e.DB.prepare("UPDATE drafts SET user_id = ? WHERE user_id = ?").bind(a,t)])}async function _e(e,t){try{await e.DB.prepare("INSERT INTO audit_logs (id, user_id, username, action, target_type, target_id, detail, ip, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)").bind(W(),t.userId??null,t.username??null,t.action,t.targetType??null,t.targetId??null,t.detail??null,t.ip??null,I()).run()}catch{}}async function ba(e,t=50,a=0,r){let n=Math.min(Math.max(t,1),200),s=Math.max(a,0);return(r?await e.DB.prepare("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(r,n,s).all():await e.DB.prepare("SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(n,s).all()).results??[]}async function wa(e){await e.DB.prepare("DELETE FROM audit_logs").run()}var Te="wxd_session";async function ya(e){let t=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(e));return Array.from(new Uint8Array(t)).map(a=>a.toString(16).padStart(2,"0")).join("")}async function Qe(e,t){let[a,r]=await Promise.all([ya(e),ya(t)]),n=0;for(let s=0;s<a.length;s++)n|=a.charCodeAt(s)^r.charCodeAt(s);return n===0}function F(e){return e.get("user")??null}function b(e){let t=F(e);return t&&t.role!=="admin"?t.id:null}async function xa(e){if(e.ADMIN_PASSWORD)return!1;try{return!(await Z(e)).admin_password}catch{return!0}}async function cr(e,t,a){let r=e.ADMIN_USER||"admin",n=e.ADMIN_PASSWORD||"admin";try{let o=await Z(e);o.admin_user&&(r=o.admin_user),o.admin_password&&(n=o.admin_password)}catch{}let[s,i]=await Promise.all([Qe(t,r),Qe(a,n)]);return s&&i}var Ze=async(e,t)=>{let a=ve(e,Te)??"",r=a?await ua(e.env,a):null;return r?(e.set("user",r),t()):e.req.path.startsWith("/admin/api/")?d("\u672A\u767B\u5F55\u6216\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55",401):e.redirect("/admin/login")},Y=async(e,t)=>{let a=F(e);return a?a.role!=="admin"?d("\u9700\u8981\u7BA1\u7406\u5458\u6743\u9650",403):t():d("\u672A\u767B\u5F55",401)};async function Ea(e){let t=e.req.header("content-type")??"",a="",r="",n=!1;if(t.includes("application/json")){n=!0;let p=await e.req.json().catch(()=>({}));a=String(p.username??p.user??""),r=String(p.password??"")}else{let p=await e.req.parseBody();a=String(p.username??p.user??""),r=String(p.password??"")}let s=(a||"admin").trim(),i=()=>n?d("\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF",401):e.html(lr(),401),o=await Ee(e.env,s),c=!!o&&!!o.enabled&&await se(r,o.password_hash,o.salt);if(!c&&await cr(e.env,s,r)&&(o||(o=await ke(e.env,{username:s,password:r,role:"admin"})),c=!!o&&!!o.enabled),!c||!o)return i();await ga(e.env,o.id),await _e(e.env,{userId:o.id,username:o.username,action:"login",targetType:"user",targetId:o.id,ip:e.req.header("cf-connecting-ip")??null}),await pa(e.env);let l=await da(e.env,{id:o.id,username:o.username,role:o.role}),u=new URL(e.req.url).protocol==="https:";return je(e,Te,l.id,{path:"/",httpOnly:!0,sameSite:"Lax",secure:u,maxAge:7*86400}),n?h({redirect:"/admin",role:o.role}):e.redirect("/admin")}async function et(e){let t=ve(e,Te)??"";return t&&await Ge(e.env,t),Ht(e,Te,{path:"/"}),e.redirect("/admin/login")}function lr(){return we({error:!0,baseUrl:""})}async function dr(e){try{return((await e.DB.prepare("SELECT COUNT(*) AS n FROM tokens WHERE enabled = 1").first())?.n??0)>0}catch(t){return console.error("\u4EE4\u724C\u72B6\u6001\u63A2\u6D4B\u5931\u8D25:",t),!1}}async function ur(e,t){if(e.DRAFT_API_KEY&&await Qe(t,e.DRAFT_API_KEY))return{ok:!0,tokenName:"\u73AF\u5883\u53D8\u91CF\u5BC6\u94A5",ownerId:null};let a=await sa(e,t);return a?(await ia(e,a.id),{ok:!0,tokenName:a.name,ownerId:a.user_id??null}):{ok:!1,response:d("\u4EE4\u724C\u65E0\u6548\u6216\u5DF2\u88AB\u7981\u7528",401)}}var ka=async(e,t)=>{if(e.req.path==="/api/health")return t();let a=e.env.DRAFT_API_KEY,r=e.req.header("X-API-Key")??e.req.query("key")??(e.req.header("Authorization")?.replace(/^Bearer\s+/i,"")||"");if(!r)return a||await dr(e.env)?d("\u672A\u6388\u6743\uFF1A\u8BF7\u5728\u8BF7\u6C42\u5934\u643A\u5E26 X-API-Key\uFF0C\u6216\u4F7F\u7528 ?key= \u67E5\u8BE2\u53C2\u6570",401):t();let n=await ur(e.env,r);return n.ok?(e.set("tokenName",n.tokenName),e.set("apiOwnerId",n.ownerId),t()):n.response};var pr="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",mr=/^data:([^;]+);base64,(.*)$/s;function fr(e){let t=mr.exec(e);if(!t)return null;let a=atob(t[2].replace(/\s/g,"")),r=new Uint8Array(a.length);for(let n=0;n<a.length;n++)r[n]=a.charCodeAt(n);return new Blob([r],{type:t[1]})}async function hr(e){let t=await fetch(e,{headers:{"User-Agent":pr,Accept:"image/*,*/*;q=0.8"},redirect:"follow"});if(!t.ok)throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${e} (HTTP ${t.status})`);return t.blob()}function _a(e){return e.startsWith("https://mmbiz.qpic.cn")||e.startsWith("http://mmbiz.qpic.cn")}function gr(e){return e.replace(/&amp;/g,"&").replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&#x27;/g,"'")}function tt(e){let t=/<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi,a=[],r;for(;(r=t.exec(e))!==null;)a.push(gr(r[1]));return a}function Ta(e){return tt(e)[0]??null}async function ae(e){return e.startsWith("data:")?fr(e):/^https?:\/\//i.test(e)?hr(e):null}var K="https://api.weixin.qq.com",Sa=new Map,P=class{constructor(t,a){this.appid=t;this.secret=a}async getToken(t=!1){let a=Date.now(),r=Sa.get(this.appid);if(!t&&r&&a<r.exp)return r.token;let s=await(await fetch(`${K}/cgi-bin/stable_token`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({grant_type:"client_credential",appid:this.appid,secret:this.secret,force_refresh:!1})})).json();if(X("\u83B7\u53D6 access_token",s),!s.access_token)throw new Error("\u83B7\u53D6 access_token \u5931\u8D25\uFF1A\u54CD\u5E94\u4E3A\u7A7A");return Sa.set(this.appid,{token:s.access_token,exp:a+((s.expires_in??7200)-200)*1e3}),s.access_token}async getAccountNickName(){try{let t=await this.getToken(),r=await(await fetch(`${K}/cgi-bin/account/getaccountbasicinfo?access_token=${encodeURIComponent(t)}`)).json();return r.errcode?null:String(r.nick_name??r.nickname??"").trim()||null}catch{return null}}async uploadContentImage(t,a="image.png"){let r=await this.getToken(),n=new FormData;n.append("media",t,a);let i=await(await fetch(`${K}/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(r)}`,{method:"POST",body:n})).json();if(X("\u4E0A\u4F20\u6B63\u6587\u56FE\u7247",i),!i.url)throw new Error("\u4E0A\u4F20\u6B63\u6587\u56FE\u7247\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE url");return i.url}async uploadPermanentImage(t,a="image.png"){let r=await this.getToken(),n=new FormData;n.append("media",t,a);let i=await(await fetch(`${K}/cgi-bin/material/add_material?access_token=${encodeURIComponent(r)}&type=image`,{method:"POST",body:n})).json();if(X("\u4E0A\u4F20\u6C38\u4E45\u7D20\u6750",i),!i.media_id)throw new Error("\u4E0A\u4F20\u6C38\u4E45\u7D20\u6750\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE media_id");return{media_id:i.media_id,url:i.url??null}}async uploadMaterialImage(t,a="cover.png"){return(await this.uploadPermanentImage(t,a)).media_id}async localizeImages(t){let a=tt(t),r=t,n=0,s=[];for(let i of a)if(!_a(i))try{let o=await ae(i);if(!o)continue;let c=await this.uploadContentImage(o),l=i.replace(/&/g,"&amp;");r=r.split(i).join(c).split(l).join(c),n++}catch{s.push(i)}return{html:r,localized:n,failed:s}}async resolveCover(t,a){if(t){let n=await ae(t);if(n)return this.uploadMaterialImage(n)}let r=Ta(a);if(r){let n=await ae(r);if(n)return this.uploadMaterialImage(n)}return null}async addDraft(t){let a=await this.getToken(),n=await(await fetch(`${K}/cgi-bin/draft/add?access_token=${encodeURIComponent(a)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({articles:t})})).json();if(X("\u65B0\u5EFA\u8349\u7A3F",n),!n.media_id)throw new Error("\u65B0\u5EFA\u8349\u7A3F\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE media_id");return n.media_id}async batchGetDrafts(t=0,a=20){let r=await this.getToken(),s=await(await fetch(`${K}/cgi-bin/draft/batchget?access_token=${encodeURIComponent(r)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({offset:t,count:a,no_content:0})})).json();return X("\u83B7\u53D6\u8349\u7A3F\u5217\u8868",s),s}async deleteDraft(t){let a=await this.getToken(),n=await(await fetch(`${K}/cgi-bin/draft/delete?access_token=${encodeURIComponent(a)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({media_id:t})})).json();X("\u5220\u9664\u8349\u7A3F",n)}};function at(e){let t=e.replace(/\r\n/g,`
`).trim(),a=[];t=t.replace(/```([\w+-]*)\n([\s\S]*?)```/g,(o,c,l)=>{let u=a.length,p=c?` class="language-${D(c)}"`:"";return a.push(`<pre><code${p}>${D(l)}</code></pre>`),`\0B${u}\0`}),t=t.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(o,c,l)=>`<img src="${l}" alt="${D(c)}">`),t=t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(o,c,l)=>`<a href="${l}">${c}</a>`),t=t.replace(/`([^`]+)`/g,(o,c)=>`<code>${D(c)}</code>`),t=t.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),t=t.replace(/(^|[^*])\*([^*\n]+)\*/g,"$1<em>$2</em>");let r=t.split(`
`),n=[],s=null,i=()=>{s&&(n.push(`</${s}>`),s=null)};for(let o of r){let c=o.trimEnd(),l=/^\u0000B(\d+)\u0000$/.exec(c.trim());if(l){i(),n.push(a[Number(l[1])]);continue}if(/^\s*$/.test(c)){i();continue}let u=/^(#{1,6})\s+(.*)$/.exec(c);if(u){i();let v=u[1].length;n.push(`<h${v}>${u[2]}</h${v}>`);continue}if(/^(-{3,}|\*{3,})$/.test(c.trim())){i(),n.push("<hr>");continue}let p=/^>\s?(.*)$/.exec(c);if(p){i(),n.push(`<blockquote>${p[1]}</blockquote>`);continue}let m=/^[-*+]\s+(.*)$/.exec(c);if(m){s!=="ul"&&(i(),n.push("<ul>"),s="ul"),n.push(`<li>${m[1]}</li>`);continue}let f=/^\d+[.)]\s+(.*)$/.exec(c);if(f){s!=="ol"&&(i(),n.push("<ol>"),s="ol"),n.push(`<li>${f[1]}</li>`);continue}i(),n.push(`<p>${c}</p>`)}return i(),n.join(`
`)}var vr=8;function br(e,t){return t==="html"?e:t==="markdown"?at(e):/<[a-z][^>]*>/i.test(e)?e:at(e)}function wr(e){return(Array.isArray(e.articles)&&e.articles.length?e.articles:[{title:e.title,author:e.author,digest:e.digest,content:e.content,cover:e.cover,contentType:e.contentType,contentSourceUrl:e.contentSourceUrl,needOpenComment:e.needOpenComment,onlyFansCanComment:e.onlyFansCanComment}]).slice(0,vr).map(a=>({title:a.title??e.title,author:a.author??e.author,digest:a.digest,content:a.content??e.content,cover:a.cover??e.cover,contentType:a.contentType??e.contentType,contentSourceUrl:a.contentSourceUrl??e.contentSourceUrl,needOpenComment:a.needOpenComment??e.needOpenComment,onlyFansCanComment:a.onlyFansCanComment??e.onlyFansCanComment}))}async function Se(e,t,a,r,n){let s=Date.now(),i=null;try{i=await U(e,r??t?.accountId??null,n??null)}catch{}let o=i?.name??null,c=wr(t??{}),l=c.length,u=c[0]??{},p=Q(String(u.title||"\u672A\u547D\u540D\u6587\u7AE0"),64),m=Q(String(u.author||""),8),f=c.reduce((k,A)=>k+String(A.content??"").length,0),v=0;try{if(!i)throw new Error(n?"\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret":"\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret\uFF0C\u6216\u914D\u7F6E WECHAT_APPID \u4E0E WECHAT_APPSECRET \u73AF\u5883\u53D8\u91CF");if(!l)throw new Error("\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09");let k=new P(i.appid,i.appsecret),A=[],x=[];for(let y=0;y<c.length;y++){let S=c[y],L=String(S.content??"");if(!L.trim())throw new Error(l>1?`\u7B2C ${y+1} \u7BC7\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09`:"\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09");let O=await k.localizeImages(br(L,S.contentType));v+=O.localized??0,O.failed?.length&&x.push(...O.failed);let M=await k.resolveCover(S.cover,O.html);if(!M)throw new Error(l>1?`\u65E0\u6CD5\u751F\u6210\u5C01\u9762\uFF1A\u7B2C ${y+1} \u7BC7\u8BF7\u4F20\u5165 cover\uFF0C\u6216\u5728\u6B63\u6587\u4E2D\u81F3\u5C11\u5305\u542B\u4E00\u5F20\u56FE\u7247`:"\u65E0\u6CD5\u751F\u6210\u5C01\u9762\uFF1A\u8BF7\u4F20\u5165 cover\uFF0C\u6216\u5728\u6B63\u6587\u4E2D\u81F3\u5C11\u5305\u542B\u4E00\u5F20\u56FE\u7247");A.push({title:Q(String(S.title||"\u672A\u547D\u540D\u6587\u7AE0"),64),author:Q(String(S.author||""),8),digest:Q(String(S.digest||$t(O.html)),120),content:O.html,thumb_media_id:M,need_open_comment:S.needOpenComment===0?0:1,only_fans_can_comment:S.onlyFansCanComment?1:0,...S.contentSourceUrl?{content_source_url:S.contentSourceUrl}:{}})}let C=await k.addDraft(A);return await Ye(e,{media_id:C,title:p,author:m,status:"success",error:null,duration_ms:Date.now()-s,images:v,content_len:f,token_name:a,account_id:i.id||null,account_name:o,user_id:n??null,article_count:l}),h({media_id:C,title:p,article_count:l,images:v,failed_images:x,account:o})}catch(k){let A=String(k?.message??k);return await Ye(e,{media_id:null,title:p,author:m,status:"failed",error:A,duration_ms:Date.now()-s,images:v,content_len:f,token_name:a,account_id:i?.id||null,account_name:o,user_id:n??null,article_count:l}),d(A,500)}}var g=new ne;function B(e){return F(e)}function yr(e){return e.req.header("cf-connecting-ip")??e.req.header("x-real-ip")??null}async function E(e,t,a,r,n){let s=F(e);await _e(e.env,{userId:s?.id??null,username:s?.username??null,action:t,targetType:a??null,targetId:r??null,detail:n?String(n).slice(0,300):null,ip:yr(e)})}async function R(e){let t=F(e);if(!t)return d("\u672A\u767B\u5F55",401);let a=e.req.header("x-confirm-password")??"";if(!a)return await E(e,"confirm.missing","sensitive"),d("\u8BE5\u64CD\u4F5C\u9700\u8981\u9A8C\u8BC1\u5BC6\u7801\uFF1A\u8BF7\u91CD\u65B0\u8F93\u5165\u767B\u5F55\u5BC6\u7801",403);let r=await te(e.env,t.id);return r?await se(a,r.password_hash,r.salt)?null:(await E(e,"confirm.failed","sensitive",void 0,`${e.req.method} ${e.req.path}`),d("\u5BC6\u7801\u4E0D\u6B63\u786E\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88",403)):d("\u7528\u6237\u4E0D\u5B58\u5728",404)}function $(e,t){return e===null||t===e}g.get("/me",e=>h({user:B(e)}));g.get("/stats",async e=>{try{return h(await la(e.env,b(e)))}catch(t){return d(`\u7EDF\u8BA1\u67E5\u8BE2\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.get("/tokens",async e=>{try{let t=(await ea(e.env,b(e))).map(a=>({...a,key:Er(a.key)}));return h({tokens:t})}catch(t){return d(`\u4EE4\u724C\u67E5\u8BE2\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.get("/tokens/:id/key",async e=>{try{let t=await ee(e.env,e.req.param("id"));return!t||!$(b(e),t.user_id)?d("\u4EE4\u724C\u4E0D\u5B58\u5728",404):h({id:t.id,key:t.key})}catch(t){return d(`\u8BFB\u53D6\u4EE4\u724C\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/tokens",async e=>{try{let t=await R(e);if(t)return t;let a=await e.req.json().catch(()=>({})),r=await ta(e.env,String(a.name??""),B(e).id);return await E(e,"token.create","token",r.id,r.name),h({token:r})}catch(t){return d(`\u521B\u5EFA\u4EE4\u724C\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.patch("/tokens/:id",async e=>{try{let t=await ee(e.env,e.req.param("id"));if(!t||!$(b(e),t.user_id))return d("\u4EE4\u724C\u4E0D\u5B58\u5728",404);let a=await e.req.json().catch(()=>({})),r=await aa(e.env,t.id,{...a.name!==void 0?{name:String(a.name)}:{},...a.enabled!==void 0?{enabled:a.enabled?1:0}:{}});return r&&await E(e,"token.update","token",t.id,[a.name!==void 0?`\u540D\u79F0=${String(a.name)}`:"",a.enabled!==void 0?`\u542F\u7528=${a.enabled?1:0}`:""].filter(Boolean).join(" ")),r?h({updated:!0}):d("\u6CA1\u6709\u9700\u8981\u4FEE\u6539\u7684\u5B57\u6BB5",400)}catch(t){return d(`\u66F4\u65B0\u4EE4\u724C\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/tokens/:id",async e=>{try{let t=await R(e);if(t)return t;let a=await ee(e.env,e.req.param("id"));return!a||!$(b(e),a.user_id)?d("\u4EE4\u724C\u4E0D\u5B58\u5728",404):(await ra(e.env,a.id),await E(e,"token.delete","token",a.id,a.name),h({deleted:!0}))}catch(t){return d(`\u5220\u9664\u4EE4\u724C\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/tokens/:id/rotate",async e=>{try{let t=await R(e);if(t)return t;let a=await ee(e.env,e.req.param("id"));if(!a||!$(b(e),a.user_id))return d("\u4EE4\u724C\u4E0D\u5B58\u5728",404);let r=await na(e.env,a.id);return r?(await E(e,"token.rotate","token",a.id,a.name),h({id:r.id,key:r.key})):d("\u4EE4\u724C\u4E0D\u5B58\u5728",404)}catch(t){return d(`\u5237\u65B0\u4EE4\u724C\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.get("/records",async e=>{try{let t=Number(e.req.query("limit")??50)||50,a=Number(e.req.query("offset")??0)||0;return h({records:await Ke(e.env,t,a,b(e))})}catch(t){return d(`\u8BB0\u5F55\u67E5\u8BE2\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.get("/records/export",async e=>{try{let t=await Ke(e.env,200,0,b(e)),a=o=>`"${String(o??"").replace(/"/g,'""')}"`,r=["\u65F6\u95F4","\u6807\u9898","\u4F5C\u8005","\u7ED3\u679C","\u8349\u7A3FID","\u7BC7\u6570","\u56FE\u7247\u6570","\u8017\u65F6(ms)","\u4EE4\u724C","\u516C\u4F17\u53F7","\u9519\u8BEF"],n=t.map(o=>[o.created_at,o.title,o.author,o.status==="success"?"\u6210\u529F":"\u5931\u8D25",o.media_id??"",o.article_count??1,o.images,o.duration_ms,o.token_name??"",o.account_name??"",o.error??""].map(a).join(",")),s="\uFEFF"+[r.map(a).join(","),...n].join(`\r
`),i=new Date().toISOString().slice(0,10);return e.body(s,200,{"content-type":"text/csv; charset=utf-8","content-disposition":`attachment; filename="push-records-${i}.csv"`,"cache-control":"no-store"})}catch(t){return d(`\u5BFC\u51FA\u8BB0\u5F55\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/records/:id",async e=>{try{let t=await R(e);if(t)return t;let a=await oa(e.env,e.req.param("id"),b(e));return a&&await E(e,"record.delete","record",e.req.param("id")),a?h({deleted:!0}):d("\u8BB0\u5F55\u4E0D\u5B58\u5728",404)}catch(t){return d(`\u5220\u9664\u8BB0\u5F55\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/records",async e=>{try{let t=await R(e);return t||(await ca(e.env,b(e)),await E(e,"record.clear","record",void 0,b(e)?"\u6E05\u7A7A\u672C\u4EBA\u8BB0\u5F55":"\u6E05\u7A7A\u5168\u90E8\u8BB0\u5F55"),h({cleared:!0}))}catch(t){return d(`\u6E05\u7A7A\u8BB0\u5F55\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.use("/audit",Y);g.use("/audit/*",Y);g.get("/audit",async e=>{try{let t=Number(e.req.query("limit")??80)||80,a=Number(e.req.query("offset")??0)||0;return h({logs:await ba(e.env,t,a,null)})}catch(t){return d(`\u5BA1\u8BA1\u65E5\u5FD7\u67E5\u8BE2\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/audit",async e=>{try{let t=await R(e);return t||(await wa(e.env),await E(e,"audit.clear","audit"),h({cleared:!0}))}catch(t){return d(`\u6E05\u7A7A\u5BA1\u8BA1\u65E5\u5FD7\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.use("/settings",Y);g.use("/settings/*",Y);g.get("/settings",async e=>{try{let t=await Z(e.env),a=await ie(e.env);return h({settings:t,using_default_password:await xa(e.env),accounts_count:a.length,accounts_default:a.find(r=>r.is_default)?.name??null,appid_configured:!!e.env.WECHAT_APPID,secret_configured:!!e.env.WECHAT_APPSECRET,appid_masked:Ra(e.env.WECHAT_APPID),legacy_key_configured:!!e.env.DRAFT_API_KEY})}catch(t){return d(`\u8BBE\u7F6E\u8BFB\u53D6\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.put("/settings",async e=>{try{let t=await R(e);if(t)return t;let a=await e.req.json().catch(()=>({})),r=["default_author","default_content_type","default_need_open_comment"],n=0;for(let s of r)a[s]!==void 0&&(await Zt(e.env,s,String(a[s])),n++);return n&&await E(e,"settings.update","settings",void 0,Object.keys(a).filter(s=>r.includes(s)).join(",")),n?h({updated:n}):d("\u6CA1\u6709\u53EF\u66F4\u65B0\u7684\u8BBE\u7F6E\u9879",400)}catch(t){return d(`\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.put("/password",async e=>{try{let t=await te(e.env,B(e).id);if(!t)return d("\u7528\u6237\u4E0D\u5B58\u5728",404);let a=await e.req.json().catch(()=>({}));if(!await se(String(a.old??""),t.password_hash,t.salt))return d("\u5F53\u524D\u5BC6\u7801\u9519\u8BEF",400);let r=String(a.new??"");return r.length<6?d("\u65B0\u5BC6\u7801\u81F3\u5C11 6 \u4F4D",400):(await Je(e.env,t.id,r),await E(e,"password.change","user",t.id,t.username),h({updated:!0}))}catch(t){return d(`\u4FEE\u6539\u5BC6\u7801\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.use("/users",Y);g.use("/users/*",Y);function Aa(e){return{id:e.id,username:e.username,role:e.role,enabled:e.enabled,created_at:e.created_at,last_login_at:e.last_login_at}}var xr=/^[A-Za-z0-9_.-]{3,32}$/;g.get("/users",async e=>{try{let t=B(e).id,a=(await ma(e.env)).map(r=>({...Aa(r),is_self:r.id===t}));return h({users:a,self:t})}catch(t){return d(`\u7528\u6237\u67E5\u8BE2\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/users",async e=>{try{let t=await R(e);if(t)return t;let a=await e.req.json().catch(()=>({})),r=String(a.username??"").trim(),n=String(a.password??""),s=a.role==="admin"?"admin":"member";if(!xr.test(r))return d("\u7528\u6237\u540D\u9700\u4E3A 3-32 \u4F4D\u5B57\u6BCD\u3001\u6570\u5B57\u3001\u4E0B\u5212\u7EBF\u3001\u70B9\u6216\u8FDE\u5B57\u7B26",400);if(n.length<6)return d("\u5BC6\u7801\u81F3\u5C11 6 \u4F4D",400);if(await Ee(e.env,r))return d("\u8BE5\u7528\u6237\u540D\u5DF2\u5B58\u5728",409);let i=await ke(e.env,{username:r,password:n,role:s,createdBy:B(e).id});return await E(e,"user.create","user",i.id,`${r} (${s})`),h({user:Aa(i)})}catch(t){return d(`\u521B\u5EFA\u7528\u6237\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.patch("/users/:id",async e=>{try{let t=await R(e);if(t)return t;let a=e.req.param("id"),r=await te(e.env,a);if(!r)return d("\u7528\u6237\u4E0D\u5B58\u5728",404);let n=await e.req.json().catch(()=>({})),s=n.role==="admin"?"admin":n.role==="member"?"member":void 0,i=n.enabled===void 0?void 0:n.enabled?1:0;if(a===B(e).id&&(s!==void 0||i===0))return d("\u4E0D\u80FD\u4FEE\u6539\u81EA\u5DF1\u7684\u89D2\u8272\u6216\u505C\u7528\u81EA\u5DF1",400);if(r.role==="admin"&&r.enabled===1&&(s==="member"||i===0)&&await Ve(e.env)<=1)return d("\u81F3\u5C11\u9700\u8981\u4FDD\u7559\u4E00\u4E2A\u542F\u7528\u72B6\u6001\u7684\u7BA1\u7406\u5458",400);let c=await fa(e.env,a,{role:s,enabled:i});return i===0&&await xe(e.env,a),c&&await E(e,"user.update","user",a,`${r.username} ${[s?`\u89D2\u8272=${s}`:"",i!==void 0?`\u542F\u7528=${i}`:""].filter(Boolean).join(" ")}`),c?h({updated:!0}):d("\u6CA1\u6709\u9700\u8981\u4FEE\u6539\u7684\u5B57\u6BB5",400)}catch(t){return d(`\u66F4\u65B0\u7528\u6237\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.put("/users/:id/password",async e=>{try{let t=await R(e);if(t)return t;let a=e.req.param("id"),r=await te(e.env,a);if(!r)return d("\u7528\u6237\u4E0D\u5B58\u5728",404);let n=await e.req.json().catch(()=>({})),s=String(n.password??"");return s.length<6?d("\u65B0\u5BC6\u7801\u81F3\u5C11 6 \u4F4D",400):(await Je(e.env,a,s),await xe(e.env,a),await E(e,"user.password","user",a,r.username),h({updated:!0}))}catch(t){return d(`\u91CD\u7F6E\u5BC6\u7801\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/users/:id",async e=>{try{let t=await R(e);if(t)return t;let a=e.req.param("id"),r=await te(e.env,a);if(!r)return d("\u7528\u6237\u4E0D\u5B58\u5728",404);if(a===B(e).id)return d("\u4E0D\u80FD\u5220\u9664\u81EA\u5DF1",400);if(r.role==="admin"&&r.enabled===1&&await Ve(e.env)<=1)return d("\u81F3\u5C11\u9700\u8981\u4FDD\u7559\u4E00\u4E2A\u542F\u7528\u72B6\u6001\u7684\u7BA1\u7406\u5458",400);let n=B(e).id;return await va(e.env,a,n),await xe(e.env,a),await ha(e.env,a),await E(e,"user.delete","user",a,r.username),h({deleted:!0,reassigned_to:n})}catch(t){return d(`\u5220\u9664\u7528\u6237\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/try",async e=>{let t=null;try{t=await e.req.json()}catch{return d("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u5408\u6CD5 JSON",400)}return!t?.content&&!(Array.isArray(t?.articles)&&t.articles.some(a=>String(a?.content??"").trim()))?d("\u6B63\u6587\uFF08content\uFF09\u4E0D\u80FD\u4E3A\u7A7A",400):Se(e.env,t,"\u540E\u53F0\u8BD5\u7528",t?.accountId??null,b(e))});async function rt(e,t){let a=new P(e,t);await a.getToken(!0);let r=await a.batchGetDrafts(0,1),n=await a.getAccountNickName();return{draftTotal:r.total_count??0,nickName:n}}g.get("/accounts",async e=>{try{let t=await ie(e.env,b(e));return h({accounts:t.map(a=>({id:a.id,name:a.name,appid:a.appid,secret_masked:Ra(a.appsecret),enabled:a.enabled,is_default:a.is_default,created_at:a.created_at}))})}catch(t){return d(`\u516C\u4F17\u53F7\u5217\u8868\u8BFB\u53D6\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/accounts",async e=>{try{let t=await R(e);if(t)return t;let a=await e.req.json().catch(()=>({})),r=String(a.appid??"").trim(),n=String(a.appsecret??"").trim();if(!r)return d("AppID \u4E0D\u80FD\u4E3A\u7A7A",400);if(!n)return d("AppSecret \u4E0D\u80FD\u4E3A\u7A7A",400);if(r.length<10)return d("AppID \u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u5E94\u4E3A wx \u5F00\u5934\u7684 18 \u4F4D\u5B57\u7B26\uFF09",400);if(n.length<16)return d("AppSecret \u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u5E94\u4E3A 32 \u4F4D\u5B57\u7B26\uFF09",400);if((await ie(e.env)).find(c=>c.appid===r))return d("\u8BE5 AppID \u5DF2\u88AB\u6DFB\u52A0",409);let i;try{i=await rt(r,n)}catch(c){return d(`\u51ED\u636E\u6821\u9A8C\u672A\u901A\u8FC7\uFF1A${String(c?.message??c)}\uFF08\u8BF7\u6838\u5BF9 AppID/AppSecret\uFF0C\u5E76\u786E\u8BA4\u5DF2\u628A Cloudflare \u51FA\u53E3 IP \u52A0\u5165\u5FAE\u4FE1\u767D\u540D\u5355\uFF09`,400)}let o=await Kt(e.env,{name:String(a.name??"").trim()||i.nickName||`\u516C\u4F17\u53F7 ${r.slice(-6)}`,appid:r,appsecret:n,is_default:a.is_default},B(e).id);return await E(e,"account.create","account",o.id,o.name),h({account:{id:o.id,name:o.name,appid:o.appid,is_default:o.is_default},nickname:i.nickName,draft_total:i.draftTotal})}catch(t){return d(`\u6DFB\u52A0\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.put("/accounts/:id",async e=>{try{let t=await R(e);if(t)return t;let a=e.req.param("id"),r=await z(e.env,a);if(!r||!$(b(e),r.user_id))return d("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404);let n=await e.req.json().catch(()=>({})),s=String(n.appid??"").trim()||r.appid,i=String(n.appsecret??"").trim()||r.appsecret,o=s!==r.appid||i!==r.appsecret,c=null;if(o){if(s!==r.appid&&(await ie(e.env)).find(u=>u.appid===s&&u.id!==a))return d("\u8BE5 AppID \u5DF2\u88AB\u6DFB\u52A0",409);try{c=(await rt(s,i)).nickName}catch(l){return d(`\u51ED\u636E\u6821\u9A8C\u672A\u901A\u8FC7\uFF1A${String(l?.message??l)}`,400)}}return await Xe(e.env,a,{name:String(n.name??"").trim()||c||void 0,appid:n.appid,appsecret:n.appsecret,enabled:typeof n.enabled=="boolean"?n.enabled?1:0:n.enabled}),await E(e,"account.update","account",a,r.name),h({updated:!0})}catch(t){return d(`\u66F4\u65B0\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.delete("/accounts/:id",async e=>{try{let t=await R(e);if(t)return t;let a=await z(e.env,e.req.param("id"));return!a||!$(b(e),a.user_id)?d("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404):(await Jt(e.env,a.id),await E(e,"account.delete","account",a.id,a.name),h({deleted:!0}))}catch(t){return d(`\u5220\u9664\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/accounts/:id/default",async e=>{try{let t=await z(e.env,e.req.param("id"));return!t||!$(b(e),t.user_id)?d("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404):(await Vt(e.env,t.id,b(e)),await E(e,"account.default","account",t.id,t.name),h({is_default:!0}))}catch(t){return d(`\u8BBE\u7F6E\u9ED8\u8BA4\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(t?.message??t)}`,500)}});g.post("/accounts/:id/test",async e=>{try{let t=await z(e.env,e.req.param("id"));if(!t||!$(b(e),t.user_id))return d("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404);let a=await rt(t.appid,t.appsecret);return a.nickName&&a.nickName!==t.name&&await Xe(e.env,t.id,{name:a.nickName}),h({account:a.nickName||t.name,nickname:a.nickName,appid:t.appid,draft_total:a.draftTotal,message:"\u51ED\u636E\u53EF\u7528\uFF0C\u53EF\u6B63\u5E38\u8BFB\u53D6\u8349\u7A3F\u7BB1"})}catch(t){return d(String(t?.message??t),400)}});g.get("/wx-drafts",async e=>{try{let t=e.req.query("account_id")||null;if(t){let l=await z(e.env,t);if(!l||!$(b(e),l.user_id))return d("\u6307\u5B9A\u7684\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404)}let a=await U(e.env,t,b(e));if(!a)throw new Error("\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret");let r=Math.max(Number(e.req.query("offset")??0)||0,0),n=Math.min(Math.max(Number(e.req.query("count")??20)||20,1),20),s=(e.req.query("q")??"").trim(),i=new P(a.appid,a.appsecret),o={id:a.id,name:a.name,appid:a.appid};if(s){let u=s.toLowerCase(),p=[],m=0,f=0;for(let v=0;v<200;v+=20){let k=await i.batchGetDrafts(v,20);m=k.total_count??m;let A=k.item??[];if(!A.length)break;f+=A.length;for(let x of A){let C=x.content?.news_item?.[0]??{};`${C.title??""} ${C.author??""}`.toLowerCase().includes(u)&&p.push(x)}if(f>=m)break}return h({account:o,query:s,offset:0,count:p.length,total_count:m,scanned:f,item_count:p.length,item:p})}let c=await i.batchGetDrafts(r,n);return h({account:o,offset:r,count:n,total_count:c.total_count??0,item_count:c.item_count??0,item:c.item??[]})}catch(t){return d(String(t?.message??t),500)}});g.delete("/wx-drafts/:mediaId",async e=>{try{let t=await R(e);if(t)return t;let a=await U(e.env,e.req.query("account_id")||null,b(e));if(!a)throw new Error("\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret");let r=new P(a.appid,a.appsecret),n=e.req.param("mediaId");return await r.deleteDraft(n),await E(e,"wx-draft.delete","draft",n,a.name),h({media_id:n,account:a.name})}catch(t){return d(String(t?.message??t),500)}});function Er(e){let t=String(e??"");return t.length<=12?`${t.slice(0,3)}${"*".repeat(Math.max(1,t.length-3))}`:`${t.slice(0,8)}${"*".repeat(8)}${t.slice(-4)}`}function Ra(e){return e?e.length<=8?e.slice(0,2)+"***":`${e.slice(0,4)}****${e.slice(-4)}`:""}var kr=["curl -X POST $BASE/api/draft \\",'  -H "X-API-Key: wxk_\u4F60\u7684\u4EE4\u724C" \\','  -H "Content-Type: application/json" \\',`  -d '{"author":"\u767E\u6653\u6587\u82D1","articles":[`,'        {"title":"\u5934\u6761\u6807\u9898","content":"<p>\u5934\u6761\u6B63\u6587</p>","cover":"https://example.com/a.png"},','        {"title":"\u6B21\u6761\u6807\u9898","content":"<p>\u6B21\u6761\u6B63\u6587</p>","cover":"https://example.com/b.png"}',"      ]}'"].join(`
`),Da=`
(function () {
  var BASE = (window.__BASE__ || location.origin).replace(/\\/+$/, '');
  var view = document.getElementById('view');
  var toasts = document.getElementById('toasts');

  function esc(s) {
    return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function toast(msg, type) {
    var el = document.createElement('div');
    el.className = 'toast' + (type ? ' ' + type : '');
    el.textContent = msg;
    toasts.appendChild(el);
    setTimeout(function () { el.remove(); }, 3600);
  }

  async function api(path, opts) {
    opts = opts || {};
    var res = await fetch(path, Object.assign({ headers: { 'Content-Type': 'application/json' } }, opts));
    var data = null;
    try { data = await res.json(); } catch (e) { data = null; }
    if (res.status === 401) { location.href = '/admin/login'; throw new Error('\u767B\u5F55\u5DF2\u8FC7\u671F'); }
    if (!res.ok || !data || data.ok === false) {
      throw new Error((data && data.error) || ('\u8BF7\u6C42\u5931\u8D25 HTTP ' + res.status));
    }
    return data.data === undefined ? data : data.data;
  }

  // \u654F\u611F\u64CD\u4F5C\uFF1A\u5148\u8F93\u5165\u767B\u5F55\u5BC6\u7801\uFF0C\u518D\u4EE5 X-Confirm-Password \u5934\u63D0\u4EA4
  async function apiConfirm(path, opts, tip) {
    var pw = prompt('\u654F\u611F\u64CD\u4F5C\u9700\u8981\u9A8C\u8BC1\u5BC6\u7801' + (tip ? '\uFF08' + tip + '\uFF09' : '') + '\uFF1A\u8BF7\u8F93\u5165\u4F60\u7684\u767B\u5F55\u5BC6\u7801');
    if (pw === null) throw new Error('\u5DF2\u53D6\u6D88\u64CD\u4F5C');
    if (!pw) throw new Error('\u672A\u8F93\u5165\u5BC6\u7801\uFF0C\u64CD\u4F5C\u5DF2\u53D6\u6D88');
    opts = opts || {};
    var headers = Object.assign({ 'Content-Type': 'application/json' }, opts.headers || {}, { 'X-Confirm-Password': pw });
    return api(path, Object.assign({}, opts, { headers: headers }));
  }

  function fmtTime(iso) {
    if (!iso) return '-';
    try {
      var d = new Date(iso);
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return iso; }
  }

  // \u4E0E\u540E\u7AEF mask() \u4FDD\u6301\u4E00\u81F4\uFF1A\u524D 4 \u540E 4\uFF0C\u4E2D\u95F4\u4EE5 **** \u4EE3\u66FF
  function maskId(s) {
    s = String(s || '');
    if (!s) return '';
    if (s.length <= 8) return s.slice(0, 2) + '***';
    return s.slice(0, 4) + '****' + s.slice(-4);
  }

  function copy(text) {    function done() { toast('\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F', 'ok'); }
    function fallback() {
      // \u975E\u5B89\u5168\u4E0A\u4E0B\u6587 / \u65E0\u526A\u8D34\u677F\u6743\u9650\u65F6\u7684\u515C\u5E95\u65B9\u6848
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.top = '-1000px';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        var okc = document.execCommand('copy');
        document.body.removeChild(ta);
        okc ? done() : toast('\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9', 'err');
      } catch (e) { toast('\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u9009\u62E9', 'err'); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }

  // ==================== \u6982\u89C8 ====================
  async function dashboard() {
    var s = await api('/admin/api/stats');
    var max = 1;
    s.daily.forEach(function (d) { if (d.total > max) max = d.total; });
    var bars = s.daily.map(function (d) {
      var h = Math.round((d.total / max) * 100);
      return '<div class="bar-col"><div class="bar-track"><div class="bar-fill" style="height:' + h + '%"></div></div>' +
        '<div class="bar-lb">' + d.date.slice(5) + '</div>' +
        '<div class="bar-lb" style="color:#5b6675">' + d.total + '</div></div>';
    }).join('');

    // \u5F53\u524D\u767B\u5F55\u8EAB\u4EFD\uFF1A\u4E0E AppID / AppSecret \u5FBD\u7AE0\u540C\u6B3E\u6837\u5F0F\uFF0C\u653E\u5728\u6700\u524D\u9762
    var me = window.__ME__ || { username: '', role: 'member' };
    var meLabel = (me.role === 'admin' ? '\u7BA1\u7406\u5458' : '\u6210\u5458') + (me.username ? ' \xB7 ' + me.username : '');
    var cfg = [];
    cfg.push('<span class="badge ' + (me.role === 'admin' ? 'badge-ok' : 'badge-mute') + '">' + esc(meLabel) + '</span>');
    cfg.push(s.appid_configured ? '<span class="badge badge-ok">AppID \u5DF2\u914D\u7F6E</span>' : '<span class="badge badge-fail">AppID \u672A\u914D\u7F6E</span>');
    cfg.push(s.secret_configured ? '<span class="badge badge-ok">AppSecret \u5DF2\u914D\u7F6E</span>' : '<span class="badge badge-fail">AppSecret \u672A\u914D\u7F6E</span>');

    return '' +
      '<div class="admin-heading"><h1>\u6982\u89C8</h1><div class="sp">' + cfg.join(' ') + '</div></div>' +
      '<div class="stat-grid">' +
        stat('\u7D2F\u8BA1\u63A8\u9001', s.total, '\u6B21') +
        stat('\u6210\u529F', s.success, '\u6B21') +
        stat('\u5931\u8D25', s.failed, '\u6B21') +
        stat('\u6210\u529F\u7387', s.success_rate, '%') +
        stat('\u4ECA\u65E5\u63A8\u9001', s.today, '\u6B21') +
        stat('\u5E73\u5747\u8017\u65F6', (s.avg_duration_ms / 1000).toFixed(2), '\u79D2') +
        stat('\u4EE4\u724C', s.tokens_enabled, '/' + s.tokens + ' \u542F\u7528') +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u8FD1 7 \u5929\u63A8\u9001\u91CF</h3></div>' +
        '<div class="bars">' + bars + '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>\u5FEB\u901F\u5165\u53E3</h3></div>' +
        '<div class="row"><div><p class="muted">\u8FD8\u6CA1\u6709\u4EE4\u724C\uFF1F</p><a class="btn btn-s" href="#tokens"><i class="fas fa-key" aria-hidden="true"></i> \u53BB\u4EE4\u724C\u7BA1\u7406</a></div>' +
        '<div><p class="muted">\u8FD8\u6CA1\u914D\u7F6E\u516C\u4F17\u53F7\uFF1F</p><a class="btn btn-s" href="#accounts"><i class="fas fa-layer-group" aria-hidden="true"></i> \u524D\u5F80\u8D26\u53F7\u7BA1\u7406</a></div>' +
        '<div><p class="muted">\u67E5\u770B\u63A5\u53E3\u6587\u6863\uFF1F</p><a class="btn btn-s" href="#docs"><i class="fas fa-book" aria-hidden="true"></i> \u67E5\u770B\u63A5\u53E3\u6587\u6863</a></div></div></div>';
  }

  function stat(k, v, unit) {
    return '<div class="stat"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</div></div>';
  }

  // ==================== \u4EE4\u724C\u7BA1\u7406 ====================
  async function tokens() {
    var d = await api('/admin/api/tokens');
    var rows = d.tokens.map(function (t) {
      return '<tr>' +
        '<td>' + esc(t.name) + '</td>' +
        '<td><div class="copy-key"><code class="mask-key" data-act="reveal" data-id="' + esc(t.id) + '" data-mask="' + esc(t.key) + '" data-vis="0" title="\u70B9\u51FB\u663E\u793A / \u9690\u85CF\u5B8C\u6574\u4EE4\u724C">' + esc(t.key) + '</code>' +
          '<button class="btn btn-s btn-icon" data-act="copy-key" data-id="' + esc(t.id) + '" title="\u590D\u5236\u4EE4\u724C" aria-label="\u590D\u5236\u4EE4\u724C"><i class="fas fa-copy" aria-hidden="true"></i></button></div></td>' +
        '<td>' + (t.enabled ? '<span class="badge badge-ok">\u542F\u7528</span>' : '<span class="badge badge-mute">\u5DF2\u7981\u7528</span>') + '</td>' +
        '<td>' + esc(t.use_count) + '</td>' +
        '<td class="muted">' + fmtTime(t.last_used_at) + '</td>' +
        '<td class="muted">' + fmtTime(t.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s btn-icon" data-act="rotate" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '" title="\u5237\u65B0\u4EE4\u724C\uFF08\u751F\u6210\u65B0\u5BC6\u94A5\uFF09" aria-label="\u5237\u65B0\u4EE4\u724C"><i class="fas fa-rotate" aria-hidden="true"></i></button> ' +
          '<button class="btn btn-s btn-icon" data-act="toggle" data-id="' + esc(t.id) + '" data-enabled="' + (t.enabled ? '1' : '0') + '" title="' + (t.enabled ? '\u7981\u7528' : '\u542F\u7528') + '">' + '<i class="fas ' + (t.enabled ? 'fa-ban' : 'fa-circle-check') + '" aria-hidden="true"></i>' + '</button> ' +
          '<button class="btn btn-s btn-icon btn-danger" data-act="del" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '" title="\u5220\u9664\u4EE4\u724C" aria-label="\u5220\u9664\u4EE4\u724C"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u4EE4\u724C\u7BA1\u7406</h1>' +
        '<div class="sp"><input class="input input-sm" id="new-token-name" placeholder="\u4EE4\u724C\u5907\u6CE8\u540D\uFF0C\u5982\uFF1A\u535A\u5BA2\u81EA\u52A8\u53D1\u5E03" style="width:240px">' +
        '<button class="btn btn-p" id="create-token"><i class="fas fa-plus" aria-hidden="true"></i> \u65B0\u5EFA\u4EE4\u724C</button></div></div>' +
      '<div class="notice info"><p>\u4EE4\u724C\u7B49\u540C\u4E8E\u8BBF\u95EE\u5BC6\u7801\uFF1A\u4EFB\u4F55\u4EBA\u62FF\u5230\u5B83\u90FD\u80FD\u5411\u4F60\u7684\u8349\u7A3F\u7BB1\u63A8\u9001\u6587\u7AE0\u3002\u8BF7\u52FF\u5199\u5165\u524D\u7AEF\u4EE3\u7801\u6216\u516C\u5F00\u4ED3\u5E93\u3002\u884C\u5185\u300C\u5237\u65B0\u300D\u53EF\u91CD\u65B0\u751F\u6210\u5BC6\u94A5\uFF0C\u65E7\u5BC6\u94A5\u7ACB\u5373\u5931\u6548\u3002</p></div>' +
      '<div class="panel panel-flush">' +
        (d.tokens.length
          ? '<table class="tb"><thead><tr><th>\u5907\u6CE8\u540D</th><th>\u4EE4\u724C</th><th>\u72B6\u6001</th><th>\u8C03\u7528\u6B21\u6570</th><th>\u6700\u8FD1\u4F7F\u7528</th><th>\u521B\u5EFA\u65F6\u95F4</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u6682\u65E0\u4EE4\u724C\uFF0C\u70B9\u51FB\u53F3\u4E0A\u89D2\u300C\u65B0\u5EFA\u4EE4\u724C\u300D\u521B\u5EFA\u7B2C\u4E00\u628A\u3002</div>') +
      '</div>';
  }

  function bindTokens() {
    var btn = document.getElementById('create-token');
    if (btn) btn.addEventListener('click', async function () {
      var input = document.getElementById('new-token-name');
      btn.disabled = true;
      try {
        var d = await apiConfirm('/admin/api/tokens', { method: 'POST', body: JSON.stringify({ name: input.value }) }, '\u65B0\u5EFA\u4EE4\u724C');
        toast('\u4EE4\u724C\u5DF2\u521B\u5EFA', 'ok');
        await go('tokens');
        alert('\u8BF7\u7ACB\u5373\u4FDD\u5B58\u4EE4\u724C\uFF08\u4EC5\u6B64\u4E00\u6B21\u5B8C\u6574\u5C55\u793A\uFF09\uFF1A\\n\\n' + d.token.key);
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });
  }

  // ==================== \u89C6\u56FE\u8DEF\u7531 ====================
  var views = { dashboard: dashboard, tokens: tokens, records: records, drafts: drafts, accounts: accounts, docs: docs, settings: settings, users: users, audit: audit };
  var binds = { tokens: bindTokens, records: bindRecords, drafts: bindDrafts, accounts: bindAccounts, settings: bindSettings, users: bindUsers, audit: bindAudit };
  var loaded = {};

  async function go(name) {
    if (name === 'try' || name === 'tryit') name = 'accounts';
    name = views[name] ? name : 'dashboard';
    loaded[name] = true;
    [].forEach.call(document.querySelectorAll('.admin-nav__link[data-view]'), function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-view') === name);
    });
    if (location.hash.slice(1) !== name) location.hash = name;
    view.innerHTML = '<div class="empty-state">\u52A0\u8F7D\u4E2D\u2026</div>';
    try {
      view.innerHTML = await views[name]();
      if (binds[name]) binds[name]();
    } catch (e) {
      view.innerHTML = '<div class="notice warn"><p>\u52A0\u8F7D\u5931\u8D25\uFF1A' + esc(e.message) + '</p></div>';
    }
  }
  window.__go = go;

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'copy') { copy(el.getAttribute('data-key')); }
    else if (act === 'copy-key') {
      // \u5217\u8868\u91CC\u53EA\u6709\u63A9\u7801\uFF0C\u590D\u5236\u65F6\u518D\u5411\u540E\u7AEF\u53D6\u4E00\u6B21\u5B8C\u6574\u4EE4\u724C
      api('/admin/api/tokens/' + encodeURIComponent(el.getAttribute('data-id')) + '/key')
        .then(function (d) { copy(d.key); })
        .catch(function (e) { toast(e.message, 'err'); });
    }
    else if (act === 'reveal') {
      var masked = el.getAttribute('data-mask') || '';
      if (el.getAttribute('data-vis') === '1') {
        el.textContent = masked;
        el.setAttribute('data-vis', '0');
        el.classList.remove('show');
      } else {
        api('/admin/api/tokens/' + encodeURIComponent(el.getAttribute('data-id')) + '/key')
          .then(function (d) {
            el.textContent = d.key;
            el.setAttribute('data-vis', '1');
            el.classList.add('show');
          })
          .catch(function (e) { toast(e.message, 'err'); });
      }
    }
    else if (act === 'toggle') {
      api('/admin/api/tokens/' + el.getAttribute('data-id'), {
        method: 'PATCH', body: JSON.stringify({ enabled: el.getAttribute('data-enabled') !== '1' }),
      }).then(function () { toast('\u5DF2\u66F4\u65B0', 'ok'); return go('tokens'); })
        .catch(function (e) { toast(e.message, 'err'); });
    } else if (act === 'rotate') {
      if (!confirm('\u5237\u65B0\u4EE4\u724C\u300C' + el.getAttribute('data-name') + '\u300D\uFF1F\u5C06\u751F\u6210\u65B0\u5BC6\u94A5\uFF0C\u65E7\u5BC6\u94A5\u7ACB\u5373\u5931\u6548\u3002')) return;
      apiConfirm('/admin/api/tokens/' + encodeURIComponent(el.getAttribute('data-id')) + '/rotate', { method: 'POST' }, '\u5237\u65B0\u4EE4\u724C')
        .then(function (d) {
          alert('\u65B0\u4EE4\u724C\uFF08\u4EC5\u6B64\u4E00\u6B21\u5B8C\u6574\u5C55\u793A\uFF09\uFF1A\\n\\n' + d.key);
          toast('\u5DF2\u751F\u6210\u65B0\u5BC6\u94A5', 'ok');
          return go('tokens');
        })
        .catch(function (e) { toast(e.message, 'err'); });
    } else if (act === 'del') {
      if (!confirm('\u786E\u8BA4\u5220\u9664\u4EE4\u724C\u300C' + el.getAttribute('data-name') + '\u300D\uFF1F\u4F7F\u7528\u8BE5\u4EE4\u724C\u7684\u8C03\u7528\u5C06\u7ACB\u5373\u5931\u6548\u3002')) return;
      apiConfirm('/admin/api/tokens/' + el.getAttribute('data-id'), { method: 'DELETE' }, '\u5220\u9664\u4EE4\u724C')
        .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('tokens'); })
        .catch(function (e) { toast(e.message, 'err'); });
    }
  });

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('.admin-nav__link[data-view]') : null;
    if (a) { ev.preventDefault(); go(a.getAttribute('data-view')); }
  });

  // ==================== \u63A8\u9001\u8BB0\u5F55 ====================
  async function records() {
    var d = await api('/admin/api/records?limit=100');
    var rows = d.records.map(function (r) {
      var mid = r.media_id
        ? '<div class="copy-key"><code>' + esc(String(r.media_id).slice(0, 16)) + '\u2026</code><button class="btn btn-s btn-icon" data-act="copy" data-key="' + esc(r.media_id) + '" title="\u590D\u5236\u8349\u7A3F ID" aria-label="\u590D\u5236\u8349\u7A3F ID"><i class="fas fa-copy" aria-hidden="true"></i></button></div>'
        : '<span class="muted">-</span>';
      return '<tr><td><span class="cell-clip" title="' + esc(r.title) + '">' + esc(r.title) + '</span></td>' +
        '<td>' + (r.status === 'success' ? '<span class="badge badge-ok">\u6210\u529F</span>' : '<span class="badge badge-fail">\u5931\u8D25</span>') + '</td>' +
        '<td>' + mid + '</td>' +
        '<td>' + esc(r.images) + '</td>' +
        '<td>' + esc(r.article_count || 1) + '</td>' +
        '<td>' + esc((r.duration_ms / 1000).toFixed(2)) + 's</td>' +
        '<td class="muted">' + esc(r.token_name || '-') + '</td>' +
        '<td class="muted">' + fmtTime(r.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (r.error ? '<button class="btn btn-s btn-icon" data-act="show-error" data-msg="' + esc(r.error) + '" title="\u67E5\u770B\u9519\u8BEF" aria-label="\u67E5\u770B\u9519\u8BEF"><i class="fas fa-circle-exclamation" aria-hidden="true"></i></button> ' : '') +
          '<button class="btn btn-s btn-icon btn-danger" data-act="del-rec" data-id="' + esc(r.id) + '" title="\u5220\u9664\u8BB0\u5F55" aria-label="\u5220\u9664\u8BB0\u5F55"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u63A8\u9001\u8BB0\u5F55</h1><div class="sp">' +
        '<a class="btn btn-s" id="export-records" href="/admin/api/records/export"><i class="fas fa-file-csv" aria-hidden="true"></i> \u5BFC\u51FA CSV</a>' +
        '<button class="btn btn-s" id="refresh-records"><i class="fas fa-rotate" aria-hidden="true"></i> \u5237\u65B0</button>' +
        '<button class="btn btn-s btn-danger" id="clear-records"><i class="fas fa-trash-can" aria-hidden="true"></i> \u6E05\u7A7A\u8BB0\u5F55</button></div></div>' +
      '<div class="notice info"><p>\u8FD9\u91CC\u53EA\u8BB0\u5F55\u672C\u670D\u52A1\u7684\u8C03\u7528\u5386\u53F2\uFF08\u542B\u5931\u8D25\u539F\u56E0\u4E0E\u8017\u65F6\uFF09\uFF0C\u4E0E\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u4E92\u4E0D\u5F71\u54CD\u3002</p></div>' +
      '<div class="panel panel-flush">' +
        (d.records.length
          ? '<table class="tb"><thead><tr><th>\u6807\u9898</th><th>\u7ED3\u679C</th><th>\u8349\u7A3F ID</th><th>\u56FE\u7247</th><th>\u7BC7\u6570</th><th>\u8017\u65F6</th><th>\u4EE4\u724C</th><th>\u65F6\u95F4</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u8FD8\u6CA1\u6709\u63A8\u9001\u8BB0\u5F55\uFF0C\u5148\u5230\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u914D\u7F6E\u516C\u4F17\u53F7\uFF0C\u518D\u7B7E\u53D1\u4EE4\u724C\u63A8\u9001\u3002</div>') +
      '</div>';
  }

  function bindRecords() {
    var rf = document.getElementById('refresh-records');
    if (rf) rf.addEventListener('click', function () { go('records'); });
    var clr = document.getElementById('clear-records');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('\u6E05\u7A7A\u5168\u90E8\u63A8\u9001\u8BB0\u5F55\uFF1F\uFF08\u4E0D\u4F1A\u5220\u9664\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u91CC\u7684\u8349\u7A3F\uFF09')) return;
      apiConfirm('/admin/api/records', { method: 'DELETE' }, '\u6E05\u7A7A\u8BB0\u5F55')
        .then(function () { toast('\u5DF2\u6E05\u7A7A', 'ok'); return go('records'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="show-error"]'), function (b) {
      b.addEventListener('click', function () { alert(b.getAttribute('data-msg')); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-rec"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\uFF1F')) return;
        apiConfirm('/admin/api/records/' + b.getAttribute('data-id'), { method: 'DELETE' }, '\u5220\u9664\u8BB0\u5F55')
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('records'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u5FAE\u4FE1\u8349\u7A3F\u7BB1 ====================
  // \u6BCF\u4E2A\u516C\u4F17\u53F7\u72EC\u7ACB\u7684\u5206\u9875 / \u641C\u7D22\u72B6\u6001\uFF0C\u8DE8\u6E32\u67D3\u4FDD\u7559
  var draftsState = {};

  function draftsStateOf(id) {
    if (!draftsState[id]) draftsState[id] = { offset: 0, q: '' };
    return draftsState[id];
  }

  async function drafts() {
    var acc = await api('/admin/api/accounts');
    var list = acc.accounts || [];
    if (!list.length) {
      return '' +
        '<div class="admin-heading"><h1>\u8349\u7A3F\u7BB1</h1></div>' +
        '<div class="notice warn"><p>\u8FD8\u6CA1\u6709\u6DFB\u52A0\u4EFB\u4F55\u516C\u4F17\u53F7\uFF0C\u8BF7\u5148\u5230\u300C\u8D26\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret\uFF0C\u8349\u7A3F\u7BB1\u4F1A\u6309\u516C\u4F17\u53F7\u5206\u7C7B\u5C55\u793A\u3002</p></div>' +
        '<div class="panel"><a class="btn btn-p" href="#accounts"><i class="fas fa-layer-group" aria-hidden="true"></i> \u524D\u5F80\u8D26\u53F7\u7BA1\u7406</a></div>';
    }

    var settled = await Promise.all(list.map(function (a) {
      var st = draftsStateOf(a.id);
      var url = '/admin/api/wx-drafts?count=20&account_id=' + encodeURIComponent(a.id) +
        '&offset=' + encodeURIComponent(st.offset) + (st.q ? '&q=' + encodeURIComponent(st.q) : '');
      return api(url)
        .then(function (d) { return { a: a, st: st, d: d, err: null }; })
        .catch(function (e) { return { a: a, st: st, d: null, err: e.message }; });
    }));

    var blocks = settled.map(function (s) {
      var a = s.a;
      var st = s.st;
      var total = s.d ? Number(s.d.total_count || 0) : 0;
      var offset = s.d ? Number(s.d.offset || 0) : 0;
      var shown = s.d ? ((s.d.item || []).length) : 0;

      var search = '<input class="input input-sm" id="drafts-q-' + esc(a.id) + '" data-account="' + esc(a.id) + '" placeholder="\u6309\u6807\u9898 / \u4F5C\u8005\u641C\u7D22\uFF08\u56DE\u8F66\uFF09" value="' + esc(st.q) + '" style="width:190px">' +
        '<button class="btn btn-s btn-icon" data-act="drafts-search" data-account="' + esc(a.id) + '" title="\u641C\u7D22" aria-label="\u641C\u7D22"><i class="fas fa-magnifying-glass" aria-hidden="true"></i></button>' +
        (st.q ? '<button class="btn btn-s btn-icon" data-act="drafts-clear" data-account="' + esc(a.id) + '" title="\u6E05\u9664\u641C\u7D22" aria-label="\u6E05\u9664\u641C\u7D22"><i class="fas fa-xmark" aria-hidden="true"></i></button>' : '');

      var head = '<div class="admin-heading"><h2 style="margin:0;font-size:18px">' + esc(a.name) +
        (a.is_default ? ' <span class="badge badge-ok">\u9ED8\u8BA4</span>' : '') +
        '</h2><div class="sp"><span class="muted">' + esc(maskId(a.appid)) + '</span>' + search +
        '<button class="btn btn-s btn-icon" data-act="drafts-refresh" data-account="' + esc(a.id) + '" title="\u5237\u65B0" aria-label="\u5237\u65B0"><i class="fas fa-rotate" aria-hidden="true"></i></button></div></div>';

      // \u5206\u9875\u6761\uFF1A\u8D34\u5728\u8868\u683C\u5E95\u90E8
      var foot = st.q
        ? '<div class="table-foot"><span class="muted">\u5339\u914D ' + shown + ' \u7BC7' + (s.d && s.d.scanned ? '\uFF08\u626B\u63CF ' + s.d.scanned + ' / ' + total + '\uFF09' : '') + '</span></div>'
        : '<div class="table-foot"><span class="muted">' + (total ? '\u7B2C ' + (offset + 1) + '\u2013' + (offset + shown) + ' \u7BC7 / \u5171 ' + total + ' \u7BC7' : '\u5171 0 \u7BC7') + '</span><div class="sp">' +
          '<button class="btn btn-s btn-icon" data-act="drafts-prev" data-account="' + esc(a.id) + '"' + (offset <= 0 ? ' disabled' : '') + ' title="\u4E0A\u4E00\u9875" aria-label="\u4E0A\u4E00\u9875"><i class="fas fa-angle-left" aria-hidden="true"></i></button>' +
          '<button class="btn btn-s btn-icon" data-act="drafts-next" data-account="' + esc(a.id) + '"' + (offset + 20 >= total ? ' disabled' : '') + ' title="\u4E0B\u4E00\u9875" aria-label="\u4E0B\u4E00\u9875"><i class="fas fa-angle-right" aria-hidden="true"></i></button>' +
          '</div></div>';

      if (s.err) {
        return head + '<div class="notice warn"><p>\u8BFB\u53D6\u5931\u8D25\uFF1A' + esc(s.err) + '</p></div>';
      }
      var items = s.d.item || [];
      var rows = items.map(function (it) {
        var c = it.content || {};
        var ni = (c.news_item && c.news_item[0]) || {};
        var time = c.update_time ? fmtTime(new Date(c.update_time * 1000).toISOString()) : '-';
        return '<tr><td><span class="cell-clip" title="' + esc(ni.title || '') + '">' + esc(ni.title || '(\u65E0\u6807\u9898)') + '</span></td>' +
          '<td class="muted">' + esc(ni.author || '-') + '</td>' +
          '<td class="muted">' + esc(time) + '</td>' +
          '<td><div class="copy-key"><code>' + esc(String(it.media_id).slice(0, 16)) + '\u2026</code>' +
            '<button class="btn btn-s btn-icon" data-act="copy" data-key="' + esc(it.media_id) + '" title="\u590D\u5236\u8349\u7A3F ID" aria-label="\u590D\u5236\u8349\u7A3F ID"><i class="fas fa-copy" aria-hidden="true"></i></button></div></td>' +
          '<td><button class="btn btn-s btn-icon btn-danger" data-act="del-wx" data-id="' + esc(it.media_id) + '" data-account="' + esc(a.id) + '" title="\u5220\u9664\u8349\u7A3F" aria-label="\u5220\u9664\u8349\u7A3F"><i class="fas fa-trash-can" aria-hidden="true"></i></button></td></tr>';
      }).join('');

      return head + (items.length
        ? '<div class="panel panel-flush"><table class="tb"><thead><tr><th>\u6807\u9898</th><th>\u4F5C\u8005</th><th>\u66F4\u65B0\u65F6\u95F4</th><th>\u8349\u7A3F ID</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>' + foot + '</div>'
        : '<div class="panel"><div class="empty-state">' + (st.q ? '\u6CA1\u6709\u5339\u914D\u7684\u8349\u7A3F\u3002' : '\u8BE5\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u662F\u7A7A\u7684\u3002') + '</div></div>');
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u8349\u7A3F\u7BB1</h1><div class="sp"><button class="btn btn-s" id="refresh-drafts"><i class="fas fa-rotate" aria-hidden="true"></i> \u5168\u90E8\u5237\u65B0</button></div></div>' +
      '<div class="notice warn"><p>\u4E0B\u9762\u662F\u5404\u516C\u4F17\u53F7\u300C\u8349\u7A3F\u7BB1\u300D\u4E2D\u7684\u771F\u5B9E\u5185\u5BB9\uFF0C\u6309\u516C\u4F17\u53F7\u5206\u7C7B\u5C55\u793A\uFF1B\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF0C\u8BF7\u8C28\u614E\u64CD\u4F5C\u3002</p></div>' +
      blocks;
  }

  function doDraftsSearch(accountId) {
    var inp = document.getElementById('drafts-q-' + accountId);
    var st = draftsStateOf(accountId);
    st.q = inp ? inp.value.trim() : '';
    st.offset = 0;
    go('drafts');
  }

  function bindDrafts() {
    var rf = document.getElementById('refresh-drafts');
    if (rf) rf.addEventListener('click', function () { draftsState = {}; go('drafts'); });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-refresh"]'), function (b) {
      b.addEventListener('click', function () { go('drafts'); });
    });
    [].forEach.call(view.querySelectorAll('input[id^="drafts-q-"]'), function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); doDraftsSearch(inp.getAttribute('data-account')); }
      });
    });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-search"]'), function (b) {
      b.addEventListener('click', function () { doDraftsSearch(b.getAttribute('data-account')); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-clear"]'), function (b) {
      b.addEventListener('click', function () {
        var st = draftsStateOf(b.getAttribute('data-account'));
        st.q = '';
        st.offset = 0;
        go('drafts');
      });
    });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-prev"]'), function (b) {
      b.addEventListener('click', function () {
        var st = draftsStateOf(b.getAttribute('data-account'));
        st.offset = Math.max(0, st.offset - 20);
        go('drafts');
      });
    });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-next"]'), function (b) {
      b.addEventListener('click', function () {
        var st = draftsStateOf(b.getAttribute('data-account'));
        st.offset = st.offset + 20;
        go('drafts');
      });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-wx"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u8FD9\u7BC7\u8349\u7A3F\uFF1F\u5FAE\u4FE1\u7AEF\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002')) return;
        var url = '/admin/api/wx-drafts/' + encodeURIComponent(b.getAttribute('data-id')) +
          '?account_id=' + encodeURIComponent(b.getAttribute('data-account') || '');
        apiConfirm(url, { method: 'DELETE' }, '\u5220\u9664\u8349\u7A3F')
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('drafts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u8D26\u53F7\u7BA1\u7406 ====================
  async function accounts() {
    var d = await api('/admin/api/accounts');
    var list = d.accounts || [];
    var rows = list.map(function (a) {
      return '<tr>' +
        '<td><strong>' + esc(a.name) + '</strong>' + (a.is_default ? ' <span class="badge badge-ok">\u9ED8\u8BA4</span>' : '') + '</td>' +
        '<td class="mono muted">' + esc(maskId(a.appid)) + '</td>' +
        '<td class="mono muted">' + esc(a.secret_masked) + '</td>' +
        '<td>' + (a.enabled ? '<span class="badge badge-ok">\u542F\u7528</span>' : '<span class="badge badge-mute">\u5DF2\u505C\u7528</span>') + '</td>' +
        '<td class="muted">' + fmtTime(a.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s btn-icon" data-act="acc-test" data-id="' + esc(a.id) + '" title="\u6D4B\u8BD5\u8FDE\u901A" aria-label="\u6D4B\u8BD5\u8FDE\u901A"><i class="fas fa-plug-circle-check" aria-hidden="true"></i></button> ' +
          (a.is_default ? '' : '<button class="btn btn-s btn-icon" data-act="acc-default" data-id="' + esc(a.id) + '" title="\u8BBE\u4E3A\u9ED8\u8BA4" aria-label="\u8BBE\u4E3A\u9ED8\u8BA4"><i class="fas fa-star" aria-hidden="true"></i></button> ') +
          '<button class="btn btn-s btn-icon" data-act="acc-edit" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" data-appid="' + esc(a.appid) + '" title="\u7F16\u8F91" aria-label="\u7F16\u8F91"><i class="fas fa-pen" aria-hidden="true"></i></button> ' +
          '<button class="btn btn-s btn-icon btn-danger" data-act="acc-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" title="\u5220\u9664" aria-label="\u5220\u9664"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u8D26\u53F7\u7BA1\u7406</h1><div class="sp">' +
        '<span class="muted">\u5DF2\u6DFB\u52A0 ' + list.length + ' \u4E2A</span>' +
        '<button class="btn btn-s" id="acc-refresh"><i class="fas fa-rotate" aria-hidden="true"></i> \u5237\u65B0</button></div></div>' +
      '<div class="notice info"><p>\u5728\u8FD9\u91CC\u6DFB\u52A0\u8981\u63A8\u9001\u7684\u516C\u4F17\u53F7\uFF1A\u586B\u5FAE\u4FE1\u540E\u53F0\u7684 <b>AppID</b> \u4E0E <b>AppSecret</b> \u5373\u53EF\uFF0C<b>\u516C\u4F17\u53F7\u540D\u79F0\u4F1A\u81EA\u52A8\u8BFB\u51FA\u6765</b>\uFF0C\u4E0D\u7528\u624B\u586B\u3002<b>\u63A8\u9001\u65F6\u672A\u6307\u5B9A\u516C\u4F17\u53F7\uFF0C\u5C31\u53D1\u5230\u6807\u300C\u9ED8\u8BA4\u300D\u7684\u90A3\u4E2A</b>\u3002\u8BB0\u5F97\u5148\u628A Cloudflare \u51FA\u53E3 IP \u52A0\u5165\u5FAE\u4FE1 IP \u767D\u540D\u5355\uFF0C\u5426\u5219\u4F1A\u62A5 invalid ip\u3002</p></div>' +
      '<div class="panel">' +
        '<div class="panel-head"><h3 id="acc-form-title">\u6DFB\u52A0\u516C\u4F17\u53F7</h3></div>' +
        '<div class="row">' +
          '<div class="field"><label>AppID</label><input class="input" id="acc-appid" placeholder="wx \u5F00\u5934\u7684 18 \u4F4D\u5B57\u7B26" autocomplete="off"></div>' +
          '<div class="field"><label>AppSecret</label><input class="input" id="acc-secret" placeholder="32 \u4F4D\u5B57\u7B26\uFF0C\u4FDD\u5B58\u65F6\u4F1A\u5411\u5FAE\u4FE1\u6821\u9A8C" autocomplete="new-password"></div>' +
        '</div>' +
        '<div class="row">' +
          '<div class="field"><label>\u540D\u79F0\uFF08\u53EF\u9009\uFF09</label><input class="input" id="acc-name" placeholder="\u7559\u7A7A\u5219\u81EA\u52A8\u8BFB\u53D6\u516C\u4F17\u53F7\u6635\u79F0"></div>' +
          '<div class="field"><label>\u9009\u9879</label><label class="check-inline"><input type="checkbox" id="acc-default"><span>\u8BBE\u4E3A\u9ED8\u8BA4\u516C\u4F17\u53F7\uFF08\u63A8\u9001\u672A\u6307\u5B9A\u65F6\u4F7F\u7528\uFF09</span></label></div>' +
        '</div>' +
        '<div class="sp">' +
          '<button class="btn btn-p" id="acc-save"><i class="fas fa-circle-plus" aria-hidden="true"></i> <span id="acc-save-label">\u6DFB\u52A0\u5E76\u6821\u9A8C</span></button>' +
          '<button class="btn btn-s" id="acc-cancel" style="display:none"><i class="fas fa-xmark" aria-hidden="true"></i> \u53D6\u6D88\u7F16\u8F91</button>' +
        '</div>' +
        '<p class="form-hint"><i class="fas fa-circle-info" aria-hidden="true"></i><span>\u4FDD\u5B58\u65F6\u4F1A\u81EA\u52A8\u6821\u9A8C\u51ED\u636E\u3001\u8BFB\u53D6\u8349\u7A3F\u6570\u5E76\u8BC6\u522B\u516C\u4F17\u53F7\u6635\u79F0\uFF1B\u672A\u8BA4\u8BC1\u53F7\u53EF\u80FD\u8BFB\u53D6\u5931\u8D25\uFF0C\u53EF\u5728\u300C\u7F16\u8F91\u300D\u4E2D\u624B\u52A8\u586B\u540D\u79F0\u3002</span></p>' +
      '</div>' +
      '<div class="panel panel-flush">' +
        (list.length
          ? '<table class="tb"><thead><tr><th>\u516C\u4F17\u53F7\u540D\u79F0</th><th>AppID</th><th>AppSecret</th><th>\u72B6\u6001</th><th>\u6DFB\u52A0\u65F6\u95F4</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u8FD8\u6CA1\u6709\u516C\u4F17\u53F7\uFF0C\u8BF7\u5728\u4E0A\u65B9\u6DFB\u52A0\u7B2C\u4E00\u4E2A\u3002</div>') +
      '</div>';
  }

  function bindAccounts() {
    var editing = null;
    var name = document.getElementById('acc-name');
    var appid = document.getElementById('acc-appid');
    var secret = document.getElementById('acc-secret');
    var def = document.getElementById('acc-default');
    var save = document.getElementById('acc-save');
    var saveLabel = document.getElementById('acc-save-label');
    var cancel = document.getElementById('acc-cancel');
    var title = document.getElementById('acc-form-title');
    var rf = document.getElementById('acc-refresh');
    if (rf) rf.addEventListener('click', function () { go('accounts'); });

    function resetForm() {
      editing = null;
      if (name) name.value = '';
      if (appid) appid.value = '';
      if (secret) secret.value = '';
      if (def) def.checked = false;
      if (title) title.textContent = '\u6DFB\u52A0\u516C\u4F17\u53F7';
      if (saveLabel) saveLabel.textContent = '\u6DFB\u52A0\u5E76\u6821\u9A8C';
      if (cancel) cancel.style.display = 'none';
    }

    if (cancel) cancel.addEventListener('click', resetForm);

    if (save) save.addEventListener('click', async function () {
      var payload = {
        name: name.value.trim(),
        appid: appid.value.trim(),
        appsecret: secret.value.trim(),
        is_default: !!(def && def.checked),
      };
      if (!payload.appid) { toast('\u8BF7\u586B\u5199 AppID', 'err'); return; }
      if (!editing && !payload.appsecret) { toast('\u8BF7\u586B\u5199 AppSecret', 'err'); return; }
      save.disabled = true;
      var old = saveLabel ? saveLabel.textContent : '';
      if (saveLabel) saveLabel.textContent = '\u6B63\u5728\u5411\u5FAE\u4FE1\u6821\u9A8C\u2026';
      try {
        if (editing) {
          await apiConfirm('/admin/api/accounts/' + encodeURIComponent(editing), { method: 'PUT', body: JSON.stringify(payload) }, '\u7F16\u8F91\u8D26\u53F7');
          toast('\u5DF2\u4FDD\u5B58\u5E76\u6821\u9A8C\u901A\u8FC7', 'ok');
        } else {
          var r = await apiConfirm('/admin/api/accounts', { method: 'POST', body: JSON.stringify(payload) }, '\u6DFB\u52A0\u8D26\u53F7');
          toast('\u5DF2\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A' + ((r.account && r.account.name) || ''), 'ok');
        }
        await go('accounts');
      } catch (e) {
        toast(e.message, 'err');
      } finally {
        save.disabled = false;
        if (saveLabel) saveLabel.textContent = old;
      }
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-test"]'), function (b) {
      b.addEventListener('click', async function () {
        b.disabled = true;
        var html = b.innerHTML;
        b.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';
        try {
          var r = await api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')) + '/test', { method: 'POST' });
          toast('\u51ED\u636E\u53EF\u7528\uFF0C\u8BE5\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u5171 ' + r.draft_total + ' \u7BC7', 'ok');
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          b.disabled = false;
          b.innerHTML = html;
        }
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-default"]'), function (b) {
      b.addEventListener('click', function () {
        api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')) + '/default', { method: 'POST' })
          .then(function () { toast('\u5DF2\u8BBE\u4E3A\u9ED8\u8BA4\u516C\u4F17\u53F7', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-edit"]'), function (b) {
      b.addEventListener('click', function () {
        editing = b.getAttribute('data-id');
        if (title) title.textContent = '\u7F16\u8F91\u516C\u4F17\u53F7\uFF1A' + b.getAttribute('data-name');
        if (name) name.value = b.getAttribute('data-name') || '';
        if (appid) appid.value = b.getAttribute('data-appid') || '';
        if (secret) secret.value = '';
        if (def) def.checked = false;
        if (saveLabel) saveLabel.textContent = '\u4FDD\u5B58\u4FEE\u6539\u5E76\u6821\u9A8C';
        if (cancel) cancel.style.display = '';
        if (secret) secret.placeholder = '\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539 AppSecret';
        if (name) name.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u516C\u4F17\u53F7\u300C' + b.getAttribute('data-name') + '\u300D\uFF1F\u5220\u9664\u540E\u9700\u91CD\u65B0\u6DFB\u52A0\u624D\u80FD\u63A8\u9001\u5230\u5B83\u3002')) return;
        apiConfirm('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' }, '\u5220\u9664\u8D26\u53F7')
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u7528\u6237\u7BA1\u7406 ====================
  async function users() {
    var d = await api('/admin/api/users');
    var rows = d.users.map(function (u) {
      var self = u.is_self;
      return '<tr>' +
        '<td><strong>' + esc(u.username) + '</strong>' + (self ? ' <span class="badge badge-ok">\u5F53\u524D</span>' : '') + '</td>' +
        '<td>' + (u.role === 'admin' ? '<span class="badge badge-ok">\u7BA1\u7406\u5458</span>' : '<span class="badge badge-mute">\u6210\u5458</span>') + '</td>' +
        '<td>' + (u.enabled ? '<span class="badge badge-ok">\u542F\u7528</span>' : '<span class="badge badge-fail">\u5DF2\u505C\u7528</span>') + '</td>' +
        '<td class="muted">' + fmtTime(u.created_at) + '</td>' +
        '<td class="muted">' + fmtTime(u.last_login_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (self
            ? '<span class="muted">\u2014</span>'
            : '<button class="btn btn-s btn-icon" data-act="u-toggle" data-id="' + esc(u.id) + '" data-enabled="' + (u.enabled ? '1' : '0') + '" title="' + (u.enabled ? '\u505C\u7528' : '\u542F\u7528') + '">' + '<i class="fas ' + (u.enabled ? 'fa-ban' : 'fa-circle-check') + '" aria-hidden="true"></i>' + '</button> ' +
              '<button class="btn btn-s btn-icon" data-act="u-role" data-id="' + esc(u.id) + '" data-role="' + esc(u.role) + '" title="' + (u.role === 'admin' ? '\u964D\u4E3A\u6210\u5458' : '\u8BBE\u4E3A\u7BA1\u7406\u5458') + '">' + '<i class="fas ' + (u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield') + '" aria-hidden="true"></i>' + '</button> ' +
              '<button class="btn btn-s btn-icon" data-act="u-pw" data-id="' + esc(u.id) + '" data-name="' + esc(u.username) + '" title="\u91CD\u7F6E\u5BC6\u7801" aria-label="\u91CD\u7F6E\u5BC6\u7801"><i class="fas fa-key" aria-hidden="true"></i></button> ' +
              '<button class="btn btn-s btn-icon btn-danger" data-act="u-del" data-id="' + esc(u.id) + '" data-name="' + esc(u.username) + '" title="\u5220\u9664\u7528\u6237" aria-label="\u5220\u9664\u7528\u6237"><i class="fas fa-trash-can" aria-hidden="true"></i></button>') +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u7528\u6237\u7BA1\u7406</h1></div>' +
      '<div class="notice info"><p>\u7BA1\u7406\u5458\u53EF\u7BA1\u7406\u5168\u90E8\u4EE4\u724C / \u516C\u4F17\u53F7 / \u8BB0\u5F55\uFF1B\u6210\u5458\u767B\u5F55\u540E<b>\u53EA\u80FD\u770B\u5230\u5E76\u7BA1\u7406\u81EA\u5DF1\u540D\u4E0B</b>\u7684\u4EE4\u724C\u3001\u516C\u4F17\u53F7\u4E0E\u63A8\u9001\u8BB0\u5F55\u3002\u5220\u9664\u7528\u6237\u65F6\uFF0C\u5176\u540D\u4E0B\u8D44\u6E90\u4F1A\u81EA\u52A8\u8F6C\u4EA4\u7ED9\u64CD\u4F5C\u8005\u3002</p></div>' +
      '<div class="panel"><div class="panel-head"><h3>\u65B0\u5EFA\u7528\u6237</h3></div>' +
        '<div class="row">' +
          '<div class="field"><label>\u7528\u6237\u540D</label><input class="input" id="u-name" placeholder="3-32 \u4F4D\u5B57\u6BCD / \u6570\u5B57 / _ . -" autocomplete="off"></div>' +
          '<div class="field"><label>\u521D\u59CB\u5BC6\u7801\uFF08\u22656 \u4F4D\uFF09</label><input class="input" id="u-pw" type="password" autocomplete="new-password"></div>' +
          '<div class="field"><label>\u89D2\u8272</label><select class="input" id="u-role"><option value="member">\u6210\u5458</option><option value="admin">\u7BA1\u7406\u5458</option></select></div>' +
        '</div>' +
        '<div class="sp"><button class="btn btn-p" id="u-create"><i class="fas fa-user-plus" aria-hidden="true"></i> \u521B\u5EFA\u7528\u6237</button></div>' +
      '</div>' +
      '<div class="panel panel-flush">' +
        (d.users.length
          ? '<table class="tb"><thead><tr><th>\u7528\u6237\u540D</th><th>\u89D2\u8272</th><th>\u72B6\u6001</th><th>\u521B\u5EFA\u65F6\u95F4</th><th>\u6700\u8FD1\u767B\u5F55</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u6682\u65E0\u7528\u6237\u3002</div>') +
      '</div>';
  }

  function bindUsers() {
    var btn = document.getElementById('u-create');
    if (btn) btn.addEventListener('click', async function () {
      var name = document.getElementById('u-name');
      var pw = document.getElementById('u-pw');
      var role = document.getElementById('u-role');
      btn.disabled = true;
      try {
        await apiConfirm('/admin/api/users', {
          method: 'POST',
          body: JSON.stringify({ username: name.value, password: pw.value, role: role.value }),
        }, '\u521B\u5EFA\u7528\u6237');
        toast('\u7528\u6237\u5DF2\u521B\u5EFA', 'ok');
        await go('users');
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-toggle"]'), function (b) {
      b.addEventListener('click', function () {
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), {
          method: 'PATCH', body: JSON.stringify({ enabled: b.getAttribute('data-enabled') !== '1' }),
        }, '\u542F\u7528 / \u505C\u7528\u7528\u6237').then(function () { toast('\u5DF2\u66F4\u65B0', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-role"]'), function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-role') === 'admin' ? 'member' : 'admin';
        if (!confirm('\u5C06\u8BE5\u7528\u6237\u89D2\u8272\u6539\u4E3A\u300C' + (next === 'admin' ? '\u7BA1\u7406\u5458' : '\u6210\u5458') + '\u300D\uFF1F')) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), {
          method: 'PATCH', body: JSON.stringify({ role: next }),
        }, '\u53D8\u66F4\u7528\u6237\u89D2\u8272').then(function () { toast('\u5DF2\u66F4\u65B0', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-pw"]'), function (b) {
      b.addEventListener('click', function () {
        var np = prompt('\u4E3A\u300C' + b.getAttribute('data-name') + '\u300D\u8BBE\u7F6E\u65B0\u5BC6\u7801\uFF08\u81F3\u5C11 6 \u4F4D\uFF09\uFF1A');
        if (np === null) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')) + '/password', {
          method: 'PUT', body: JSON.stringify({ password: np }),
        }, '\u91CD\u7F6E\u7528\u6237\u5BC6\u7801').then(function () { toast('\u5BC6\u7801\u5DF2\u91CD\u7F6E\uFF0C\u8BE5\u7528\u6237\u9700\u91CD\u65B0\u767B\u5F55', 'ok'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u786E\u8BA4\u5220\u9664\u7528\u6237\u300C' + b.getAttribute('data-name') + '\u300D\uFF1F\u5176\u540D\u4E0B\u4EE4\u724C / \u516C\u4F17\u53F7 / \u8BB0\u5F55\u5C06\u8F6C\u4EA4\u7ED9\u4F60\u3002')) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' }, '\u5220\u9664\u7528\u6237')
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u64CD\u4F5C\u65E5\u5FD7 ====================
  async function audit() {
    var d = await api('/admin/api/audit?limit=100');
    var rows = (d.logs || []).map(function (l) {
      return '<tr>' +
        '<td class="muted">' + fmtTime(l.created_at) + '</td>' +
        '<td>' + esc(l.username || '-') + '</td>' +
        '<td><code>' + esc(l.action) + '</code></td>' +
        '<td class="muted">' + esc(l.target_type || '-') + '</td>' +
        '<td class="muted mono">' + esc(String(l.target_id || '-').slice(0, 12)) + '</td>' +
        '<td><span class="cell-clip" title="' + esc(l.detail || '') + '">' + esc(l.detail || '-') + '</span></td>' +
        '<td class="muted">' + esc(l.ip || '-') + '</td>' +
        '</tr>';
    }).join('');
    return '' +
      '<div class="admin-heading"><h1>\u64CD\u4F5C\u65E5\u5FD7</h1><div class="sp">' +
        '<button class="btn btn-s" id="refresh-audit"><i class="fas fa-rotate" aria-hidden="true"></i> \u5237\u65B0</button>' +
        '<button class="btn btn-s btn-danger" id="clear-audit"><i class="fas fa-trash-can" aria-hidden="true"></i> \u6E05\u7A7A\u65E5\u5FD7</button></div></div>' +
      '<div class="notice info"><p>\u8BB0\u5F55\u767B\u5F55\u3001\u4EE4\u724C / \u516C\u4F17\u53F7 / \u7528\u6237\u7684\u53D8\u66F4\u3001\u8BB0\u5F55\u6E05\u7A7A\u7B49\u654F\u611F\u64CD\u4F5C\uFF0C\u4FBF\u4E8E\u8FFD\u6EAF\u3002\u9ED8\u8BA4\u663E\u793A\u6700\u8FD1 100 \u6761\u3002</p></div>' +
      '<div class="panel panel-flush">' +
        (rows
          ? '<table class="tb"><thead><tr><th>\u65F6\u95F4</th><th>\u64CD\u4F5C\u8005</th><th>\u52A8\u4F5C</th><th>\u5BF9\u8C61</th><th>\u5BF9\u8C61 ID</th><th>\u8BE6\u60C5</th><th>IP</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u6682\u65E0\u64CD\u4F5C\u65E5\u5FD7\u3002</div>') +
      '</div>';
  }

  function bindAudit() {
    var rf = document.getElementById('refresh-audit');
    if (rf) rf.addEventListener('click', function () { go('audit'); });
    var clr = document.getElementById('clear-audit');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('\u6E05\u7A7A\u5168\u90E8\u64CD\u4F5C\u65E5\u5FD7\uFF1F')) return;
      apiConfirm('/admin/api/audit', { method: 'DELETE' }, '\u6E05\u7A7A\u65E5\u5FD7')
        .then(function () { toast('\u5DF2\u6E05\u7A7A', 'ok'); return go('audit'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
  }

  // ==================== \u63A5\u53E3\u6587\u6863 ====================
  function docs() {
    var curl = 'curl -X POST ' + BASE + '/api/draft \\\\n' +
      '  -H "X-API-Key: wxk_\u4F60\u7684\u4EE4\u724C" \\\\n' +
      '  -H "Content-Type: application/json" \\\\n' +
      '  -d \\'{"title":"\u6807\u9898","content":"<p>\u6B63\u6587</p>"}\\'';
    var multi = ${JSON.stringify(kr)}.split('$BASE').join(BASE);
    return '' +
      '<div class="admin-heading"><h1>\u63A5\u53E3\u6587\u6863</h1></div>' +
      '<div class="notice info"><p>\u6240\u6709\u63A5\u53E3\u8FD4\u56DE\u7EDF\u4E00\u7ED3\u6784\uFF1A<code>{ ok: true, data: {...} }</code> \u6216 <code>{ ok: false, error: "..." }</code></p></div>' +
      '<div class="panel panel-flush"><table class="tb">' +
        '<thead><tr><th style="width:88px">\u65B9\u6CD5</th><th style="width:230px">\u8DEF\u5F84</th><th>\u8BF4\u660E</th></tr></thead><tbody>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td><td>\u65B0\u5EFA\u8349\u7A3F\uFF08title / content \u5FC5\u586B\uFF0C\u652F\u6301 contentType=markdown\uFF1B\u4F20 <code>articles[]</code> \u53EF\u4E00\u6B21\u53D1\u591A\u56FE\u6587\uFF0C\u6700\u591A 8 \u7BC7\uFF09</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td><td>\u8349\u7A3F\u5217\u8868\uFF08offset / count\uFF0Ccount \u2264 20\uFF09</td></tr>' +
        '<tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td><td>\u5220\u9664\u8349\u7A3F</td></tr>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/material</code></td><td>\u4E0A\u4F20\u56FE\u7247\u4E3A\u6C38\u4E45\u7D20\u6750\uFF08\u4F20 <code>url</code> \u6216 <code>dataUri</code>\uFF09\u2192 \u8FD4\u56DE <code>media_id</code> \u4E0E\u5FAE\u4FE1\u57DF\u540D <code>url</code>\uFF0C\u53EF\u5728\u6B63\u6587 / \u5C01\u9762\u4E2D\u590D\u7528</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/health</code></td><td>\u5065\u5EB7\u68C0\u67E5\uFF08\u516C\u5F00\uFF09</td></tr>' +
        '</tbody></table></div>' +
      '<div class="panel"><div class="panel-head"><h3>\u9274\u6743\u65B9\u5F0F</h3></div>' +
        '<p class="muted">\u4EE5\u4E0B\u4E09\u79CD\u4EFB\u9009\u5176\u4E00\uFF1A</p>' +
        '<pre class="mono-out">X-API-Key: wxk_xxxxxxxx' + '\\n' + 'Authorization: Bearer wxk_xxxxxxxx' + '\\n' + '?key=wxk_xxxxxxxx</pre>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u26A0\uFE0F \u4F7F\u7528\u524D\u5FC5\u505A\uFF1A\u516C\u4F17\u53F7 IP \u767D\u540D\u5355</h3></div>' +
        '<p class="muted">Worker \u6BCF\u6B21\u8C03\u7528\u7684\u51FA\u53E3 IP \u90FD\u53EF\u80FD\u4E0D\u540C\uFF0C\u6CA1\u52A0\u767D\u540D\u5355\u65F6\u5FAE\u4FE1\u4F1A\u76F4\u63A5\u62D2\u7EDD\uFF1A<code>40164 invalid ip \u2026 not in whitelist</code>\u3002</p>' +
        '<p>\u5230\u300C\u516C\u4F17\u53F7\u540E\u53F0 \u2192 \u8BBE\u7F6E\u4E0E\u5F00\u53D1 \u2192 \u57FA\u672C\u914D\u7F6E\uFF08\u6216\u5B89\u5168\u4E2D\u5FC3\uFF09\u2192 IP \u767D\u540D\u5355\u300D\uFF0C\u628A\u4E0B\u9762 <b>\u5168\u90E8 15 \u4E2A IPv4 \u6BB5</b>\u6BCF\u884C\u4E00\u6BB5\u7C98\u8FDB\u53BB\uFF08\u4FDD\u5B58\u540E\u7EA6 1~5 \u5206\u949F\u751F\u6548\uFF09\uFF1A</p>' +
        '<pre class="code">' + ['173.245.48.0/20','103.21.244.0/22','103.22.200.0/22','103.31.4.0/22','141.101.64.0/18','108.162.192.0/18','190.93.240.0/20','188.114.96.0/20','197.234.240.0/22','198.41.128.0/17','162.158.0.0/15','104.16.0.0/13','104.24.0.0/14','172.64.0.0/13','131.0.72.0/22'].join('\\n') + '</pre>' +
        '<p class="muted"><small>\u53E6\u6CE8\uFF1A\u8C03\u7528\u65B9\u987B\u643A\u5E26\u6D4F\u89C8\u5668 UA\uFF0C\u5426\u5219\u4F1A\u88AB Cloudflare \u8FB9\u7F18\u62E6\u622A\uFF08<code>403 error 1010</code>\uFF09\uFF1B\u82E5\u7ED1\u5B9A\u81EA\u5B9A\u4E49\u57DF\u540D\uFF0C\u9700\u5728\u57DF\u540D\u5B89\u5168\u6027\u91CC\u5173\u95ED Bot Fight Mode \u4E0E\u6D4F\u89C8\u5668\u5B8C\u6574\u6027\u68C0\u67E5\u3002</small></p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>cURL \u793A\u4F8B</h3></div>' +
        '<pre class="code">' + esc(curl) + '</pre></div>' +
      '<div class="panel"><div class="panel-head"><h3>\u591A\u56FE\u6587\u793A\u4F8B\uFF08\u4E00\u6B21\u63A8\u591A\u7BC7\uFF09</h3></div>' +
        '<p class="muted">\u4E0D\u4F20 <code>articles</code> \u65F6\u6309\u5355\u56FE\u6587\u5904\u7406\uFF0C\u5B57\u6BB5\u4E0E\u539F\u6765\u5B8C\u5168\u4E00\u81F4\uFF1B\u4F20\u4E86\u5219\u6309\u6570\u7EC4\u987A\u5E8F\u5EFA\u4E00\u7BC7\u591A\u56FE\u6587\u8349\u7A3F\uFF0C\u6BCF\u7BC7\u672A\u586B\u7684\u5B57\u6BB5\u56DE\u843D\u5230\u9876\u5C42\u540C\u540D\u5B57\u6BB5\u3002</p>' +
        '<pre class="code">' + esc(multi) + '</pre></div>';
  }

  // ==================== \u8BBE\u7F6E ====================
  async function settings() {
    var d = await api('/admin/api/settings');
    var s = d.settings || {};
    return '' +
      '<div class="admin-heading"><h1>\u8BBE\u7F6E</h1></div>' +
      (d.using_default_password
        ? '<div class="notice warn"><p>\u5F53\u524D\u4ECD\u5728\u4F7F\u7528\u9ED8\u8BA4\u53E3\u4EE4\uFF0C\u5F3A\u70C8\u5EFA\u8BAE\u7ACB\u5373\u5728\u4E0B\u65B9\u300C\u4FEE\u6539\u540E\u53F0\u5BC6\u7801\u300D\u5904\u8BBE\u7F6E\u65B0\u5BC6\u7801\u3002</p></div>'
        : '') +
      '<div class="panel"><div class="panel-head"><h3>\u516C\u4F17\u53F7\u51ED\u636E</h3></div>' +
        '<table class="tb"><tbody>' +
        '<tr><td style="width:180px" class="muted">AppID</td><td>' + (d.appid_configured ? '<code>' + esc(d.appid_masked) + '</code>' : '<span class="badge badge-fail">\u672A\u914D\u7F6E</span>') + '</td></tr>' +
        '<tr><td class="muted">AppSecret</td><td>' + (d.secret_configured ? '<span class="badge badge-ok">\u5DF2\u914D\u7F6E\uFF08\u52A0\u5BC6\u5B58\u50A8\uFF09</span>' : '<span class="badge badge-fail">\u672A\u914D\u7F6E</span>') + '</td></tr>' +
        '<tr><td class="muted">\u65E7\u7248\u73AF\u5883\u53D8\u91CF\u5BC6\u94A5</td><td>' + (d.legacy_key_configured ? '<span class="badge badge-mute">DRAFT_API_KEY \u5DF2\u8BBE\u7F6E\uFF08\u517C\u5BB9\u4FDD\u7559\uFF09</span>' : '<span class="badge badge-mute">\u672A\u8BBE\u7F6E</span>') + '</td></tr>' +
        '</tbody></table>' +
        '<p class="muted">\u51ED\u636E\u7528\u4E8E\u670D\u52A1\u5668\u52A0\u5BC6\u53D8\u91CF\u5B58\u50A8\uFF0C\u51FA\u4E8E\u5B89\u5168\u8003\u8651\u4EC5\u53EF\u67E5\u770B\u914D\u7F6E\u72B6\u6001\uFF0C\u4E0D\u652F\u6301\u5728\u9875\u9762\u4E2D\u4FEE\u6539\u3002\u5982\u9700\u66F4\u6362\uFF0C\u8BF7\u5728 Cloudflare \u63A7\u5236\u53F0 \u2192 Workers \u2192 \u672C\u670D\u52A1 \u2192 \u8BBE\u7F6E \u2192 \u53D8\u91CF\u4E0E\u5BC6\u94A5 \u4E2D\u66F4\u65B0\u3002</p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u9ED8\u8BA4\u63A8\u9001\u53C2\u6570</h3></div>' +
        '<div class="field" style="max-width:340px"><label>\u9ED8\u8BA4\u4F5C\u8005</label>' +
        '<input class="input" id="set-author" value="' + esc(s.default_author || '') + '" placeholder="\u7559\u7A7A\u8868\u793A\u4E0D\u8BBE\u7F6E"></div>' +
        '<button class="btn btn-p" id="save-settings"><i class="fas fa-floppy-disk" aria-hidden="true"></i> \u4FDD\u5B58\u8BBE\u7F6E</button>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u4FEE\u6539\u540E\u53F0\u5BC6\u7801</h3></div>' +
        '<div class="row" style="max-width:640px">' +
          '<div class="field"><label>\u5F53\u524D\u5BC6\u7801</label><input class="input" id="pw-old" type="password"></div>' +
          '<div class="field"><label>\u65B0\u5BC6\u7801\uFF08\u22656 \u4F4D\uFF09</label><input class="input" id="pw-new" type="password"></div>' +
          '<div class="field"><label>\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="input" id="pw-new2" type="password"></div>' +
        '</div>' +
        '<button class="btn" id="save-password"><i class="fas fa-key" aria-hidden="true"></i> \u66F4\u65B0\u5BC6\u7801</button>' +
      '</div>';
  }

  function bindSettings() {
    var ss = document.getElementById('save-settings');
    if (ss) ss.addEventListener('click', function () {
      apiConfirm('/admin/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ default_author: document.getElementById('set-author').value }),
      }, '\u4FDD\u5B58\u8BBE\u7F6E').then(function () { toast('\u8BBE\u7F6E\u5DF2\u4FDD\u5B58', 'ok'); }).catch(function (e) { toast(e.message, 'err'); });
    });

    var sp = document.getElementById('save-password');
    if (sp) sp.addEventListener('click', function () {
      var o = document.getElementById('pw-old').value;
      var n = document.getElementById('pw-new').value;
      var n2 = document.getElementById('pw-new2').value;
      if (!n || n.length < 6) { toast('\u65B0\u5BC6\u7801\u81F3\u5C11 6 \u4F4D', 'err'); return; }
      if (n !== n2) { toast('\u4E24\u6B21\u8F93\u5165\u7684\u65B0\u5BC6\u7801\u4E0D\u4E00\u81F4', 'err'); return; }
      api('/admin/api/password', { method: 'PUT', body: JSON.stringify({ old: o, new: n }) })
        .then(function () {
          toast('\u5BC6\u7801\u5DF2\u66F4\u65B0', 'ok');
          document.getElementById('pw-old').value = '';
          document.getElementById('pw-new').value = '';
          document.getElementById('pw-new2').value = '';
        })
        .catch(function (e) { toast(e.message, 'err'); });
    });
  }

  window.addEventListener('hashchange', function () { go(location.hash.slice(1)); });
  go(location.hash.slice(1) || 'dashboard');
})();
`;var _r="wx-draft-worker",Tr="2.1.0",w=new ne;w.use("*",Ut());w.use("*",Pt({origin:"*"}));var Ca=!1;w.use("*",async(e,t)=>{if(!Ca&&e.env.DB)try{await Yt(e.env),Ca=!0}catch(a){console.error("\u521D\u59CB\u5316\u5931\u8D25:",a)}await t()});var nt=e=>{try{return new URL(e.req.url).origin}catch{return""}};function Sr(e){return e?String(e.content??"").trim()?!0:Array.isArray(e.articles)&&e.articles.some(t=>String(t?.content??"").trim()):!1}w.get("/",e=>e.html(qt(nt(e))));w.get("/admin/login",e=>{let t=e.req.query("error")==="1";return e.html(we({error:t,baseUrl:nt(e)}))});w.post("/admin/login",Ea);w.get("/admin/logout",et);w.post("/admin/logout",et);w.get("/admin/app.js",e=>e.body(Da,200,{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store"}));w.use("/admin/api/*",Ze);w.route("/admin/api",g);w.use("/admin",Ze);w.get("/admin",e=>{let t=F(e);return e.html(jt({baseUrl:nt(e),user:t?{username:t.username,role:t.role}:void 0}))});w.get("/api/health",async e=>{let t=!1;try{await e.env.DB.prepare("SELECT 1 AS ok").first(),t=!0}catch{}return h({service:_r,version:Tr,appid_configured:!!e.env.WECHAT_APPID,secret_configured:!!e.env.WECHAT_APPSECRET,auth_enabled:!!e.env.DRAFT_API_KEY,db_connected:t,time:new Date().toISOString()})});w.use("/api/*",ka);w.post("/api/draft",async e=>{let t;try{t=await e.req.json()}catch{return d("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u5408\u6CD5 JSON",400)}if(!Sr(t))return d("\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09",400);let a=e.get("tokenName")??null,r=e.get("apiOwnerId")??null;return Se(e.env,t,a,t?.accountId??null,r)});w.get("/api/drafts",async e=>{try{let t=e.get("apiOwnerId")??null,a=await U(e.env,null,t);if(!a)throw new Error("\u5C1A\u672A\u914D\u7F6E\u516C\u4F17\u53F7\uFF1A\u8BF7\u5728\u540E\u53F0\u6DFB\u52A0 AppID / AppSecret");let r=Number(e.req.query("offset")??0)||0,n=Math.min(Number(e.req.query("count")??20)||20,20),i=await new P(a.appid,a.appsecret).batchGetDrafts(r,n);return h({account:a.name,total_count:i.total_count??0,item_count:i.item_count??0,item:i.item??[]})}catch(t){return d(String(t?.message??t),500)}});w.delete("/api/drafts/:mediaId",async e=>{try{let t=e.get("apiOwnerId")??null,a=await U(e.env,null,t);if(!a)throw new Error("\u5C1A\u672A\u914D\u7F6E\u516C\u4F17\u53F7\uFF1A\u8BF7\u5728\u540E\u53F0\u6DFB\u52A0 AppID / AppSecret");let r=e.req.param("mediaId");return await new P(a.appid,a.appsecret).deleteDraft(r),h({media_id:r,account:a.name})}catch(t){return d(String(t?.message??t),500)}});w.post("/api/material",async e=>{let t;try{t=await e.req.json()}catch{return d("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u5408\u6CD5 JSON",400)}let a=String(t.dataUri||t.url||"").trim();if(!a)return d("\u7F3A\u5C11 url \u6216 dataUri",400);try{let r=e.get("apiOwnerId")??null,n=await U(e.env,null,r);if(!n)throw new Error("\u5C1A\u672A\u914D\u7F6E\u516C\u4F17\u53F7\uFF1A\u8BF7\u5728\u540E\u53F0\u6DFB\u52A0 AppID / AppSecret");let s=await ae(a);if(!s)throw new Error("\u65E0\u6CD5\u8BFB\u53D6\u56FE\u7247\uFF1A\u8BF7\u63D0\u4F9B\u53EF\u8BBF\u95EE\u7684\u56FE\u7247 URL \u6216 data URI");let o=await new P(n.appid,n.appsecret).uploadPermanentImage(s,String(t.filename||"image.png"));return h({media_id:o.media_id,url:o.url,account:n.name})}catch(r){return d(String(r?.message??r),500)}});function La(e,t,a){return`<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e} \xB7 ${t} \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<style>${be}</style></head>
<body class="site-page"><main class="auth-shell" style="grid-template-columns:minmax(0,1fr)">
  <section class="auth-form-wrap" style="text-align:center;align-items:center;justify-content:center">
    <p class="eyebrow" style="justify-content:center"><span aria-hidden="true"></span>ERROR ${e}</p>
    <h1 style="font-size:clamp(2.5rem,8vw,4rem)">${e}</h1>
    <p style="max-width:48ch;margin-block:var(--space-sm) var(--space-lg);color:var(--color-muted)">${a}</p>
    <div class="sp" style="justify-content:center">
      <a class="btn btn-p" href="/"><i class="fas fa-house" aria-hidden="true"></i>\u8FD4\u56DE\u9996\u9875</a>
      <a class="btn btn-s" href="/admin"><i class="fas fa-sliders-h" aria-hidden="true"></i>\u7BA1\u7406\u63A7\u5236\u53F0</a>
    </div>
  </section>
</main></body></html>`}w.notFound(e=>e.req.path.startsWith("/api/")||e.req.path.startsWith("/admin/api/")?d("\u63A5\u53E3\u4E0D\u5B58\u5728",404):e.html(La("404","\u9875\u9762\u4E0D\u5B58\u5728","\u4F60\u8BBF\u95EE\u7684\u5730\u5740\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u79FB\u52A8\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u6B63\u786E\u3002"),404));w.onError((e,t)=>(console.error("\u672A\u6355\u83B7\u7684\u9519\u8BEF:",e),t.req.path.startsWith("/api/")||t.req.path.startsWith("/admin/api/")?d("\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",500):t.html(La("500","\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF","\u670D\u52A1\u6682\u65F6\u51FA\u4E86\u70B9\u95EE\u9898\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF1B\u82E5\u6301\u7EED\u51FA\u73B0\u8BF7\u68C0\u67E5 Worker \u65E5\u5FD7\u3002"),500)));var ii=w;export{ii as default};
