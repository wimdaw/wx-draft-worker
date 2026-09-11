var ue=(t,e,r)=>(a,n)=>{let o=-1;return s(0);async function s(i){if(i<=o)throw new Error("next() called multiple times");o=i;let c,l=!1,d;if(t[i]?(d=t[i][0][0],a.req.routeIndex=i):d=i===t.length&&n||void 0,d)try{c=await d(a,()=>s(i+1))}catch(p){if(p instanceof Error&&e)a.error=p,c=await e(p,a),l=!0;else throw p}else a.finalized===!1&&r&&(c=await r(a));return c&&(a.finalized===!1||l)&&(a.res=c),a}};var ze=Symbol();var qe=(t,e)=>new Response(t,{headers:{"Content-Type":e.replace(/^[^;]+/,a=>a.toLowerCase())}}).formData();var Fe=32,or=1e4,K=t=>"headers"in t,Ge=async(t,e=Object.create(null))=>{let{all:r=!1,dot:a=!1}=e,s=(K(t)?t.headers:t.raw.headers).get("Content-Type")?.split(";")[0].trim().toLowerCase();return s==="multipart/form-data"||s==="application/x-www-form-urlencoded"?sr(t,{all:r,dot:a}):{}};async function sr(t,e){if(!K(t)&&t.bodyCache.formData)return Xe(await t.bodyCache.formData,e);let r=K(t)?t.headers:t.raw.headers,a=await t.arrayBuffer(),n=qe(a,r.get("Content-Type")||"");K(t)||(t.bodyCache.formData=n);let o=await n;return o?Xe(o,e):{}}function Xe(t,e){let r=Object.create(null),a={count:0};return t.forEach((n,o)=>{e.all||o.endsWith("[]")?ir(r,o,n):r[o]=n}),e.dot&&Object.entries(r).forEach(([n,o])=>{n.includes(".")&&(cr(r,n,o,a),delete r[n])}),r}var ir=(t,e,r)=>{t[e]!==void 0?Array.isArray(t[e])?t[e].push(r):t[e]=[t[e],r]:e.endsWith("[]")?t[e]=[r]:t[e]=r},cr=(t,e,r,a)=>{if(/(?:^|\.)__proto__\./.test(e))return;let n=t,o=e.split(".",Fe+2);o.length>Fe+1&&Ke(),o.forEach((s,i)=>{i===o.length-1?n[s]=r:((!n[s]||typeof n[s]!="object"||Array.isArray(n[s])||n[s]instanceof File)&&(a.count++>=or&&Ke(),n[s]=Object.create(null)),n=n[s])})},Ke=()=>{throw new Error("Nesting limit exceeded")};var fe=t=>{let e=t.split("/");return e[0]===""&&e.shift(),e},Ye=t=>{let{groups:e,path:r}=lr(t),a=fe(r);return dr(a,e)},lr=t=>{let e=[];return t=t.replace(/\{[^}]+\}/g,(r,a)=>{let n=`@${a}`;return e.push([n,r]),n}),{groups:e,path:t}},dr=(t,e)=>{for(let r=e.length-1;r>=0;r--){let[a]=e[r];for(let n=t.length-1;n>=0;n--)if(t[n].includes(a)){t[n]=t[n].replace(a,e[r][1]);break}}return t},G={},Ve=(t,e)=>{if(t==="*")return"*";let r=t.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/);if(r){let a=`${t}#${e}`;return G[a]||(r[2]?G[a]=e&&e[0]!==":"&&e[0]!=="*"?[a,r[1],new RegExp(`^${r[2]}(?=/${e})`)]:[t,r[1],new RegExp(`^${r[2]}$`)]:G[a]=[t,r[1],!0]),G[a]}return null},Je=(t,e)=>{try{return e(t)}catch{return t.replace(/(?:%[0-9A-Fa-f]{2})+/g,r=>{try{return e(r)}catch{return r}})}},pr=t=>Je(t,decodeURI),he=t=>{let e=t.url,r=e.indexOf("/",e.indexOf(":")+4),a=r;for(;a<e.length;a++){let n=e.charCodeAt(a);if(n===37){let o=e.indexOf("?",a),s=e.indexOf("#",a),i=o===-1?s===-1?void 0:s:s===-1?o:Math.min(o,s),c=e.slice(r,i);return pr(c.includes("%25")?c.replace(/%25/g,"%2525"):c)}else if(n===63||n===35)break}return e.slice(r,a)};var Qe=t=>{let e=he(t);return e.length>1&&e.at(-1)==="/"?e.slice(0,-1):e},R=(t,e,...r)=>(r.length&&(e=R(e,...r)),`${t?.[0]==="/"?"":"/"}${t}${e==="/"?"":`${t?.at(-1)==="/"?"":"/"}${e?.[0]==="/"?e.slice(1):e}`}`),Y=t=>{if(t.charCodeAt(t.length-1)!==63||!t.includes(":"))return null;let e=t.split("/"),r=[],a="";return e.forEach(n=>{if(n!==""&&!/\:/.test(n))a+="/"+n;else if(/\:/.test(n))if(n.charCodeAt(n.length-1)===63){r.length===0&&a===""?r.push("/"):r.push(a);let o=n.slice(0,-1);a+="/"+o,r.push(a)}else a+="/"+n}),r.filter((n,o,s)=>s.indexOf(n)===o)},N=t=>t.indexOf("%")!==-1?Je(t,ur):t,me=t=>(t.indexOf("+")!==-1&&(t=t.replace(/\+/g," ")),N(t)),Ze=(t,e,r)=>{let a=t.indexOf("#",8);a!==-1&&(t=t.slice(0,a));let n;if(!r&&e&&e.indexOf("%")===-1&&e.indexOf("+")===-1){let i=t.indexOf("?",8);if(i===-1)return;for(t.startsWith(e,i+1)||(i=t.indexOf(`&${e}`,i+1));i!==-1;){let c=t.charCodeAt(i+e.length+1);if(c===61){let l=i+e.length+2,d=t.indexOf("&",l);return me(t.slice(l,d===-1?void 0:d))}else if(c==38||isNaN(c))return"";i=t.indexOf(`&${e}`,i+1)}if(n=/[%+]/.test(t),!n)return}let o=Object.create(null);n??=/[%+]/.test(t);let s=t.indexOf("?",8);for(;s!==-1;){let i=t.indexOf("&",s+1),c=t.indexOf("=",s);c>i&&i!==-1&&(c=-1);let l=t.slice(s+1,c===-1?i===-1?void 0:i:c);if(n&&(l=me(l)),s=i,l==="")continue;let d;c===-1?d="":(d=t.slice(c+1,i===-1?void 0:i),n&&(d=me(d))),r?(o[l]&&Array.isArray(o[l])||(o[l]=[]),o[l].push(d)):o[l]??=d}return e?o[e]:o},et=Ze,tt=(t,e)=>Ze(t,e,!0),ur=decodeURIComponent;var rt=class{raw;#t;#e;routeIndex=0;path;bodyCache={};constructor(t,e="/",r=[[]]){this.raw=t,this.path=e,this.#e=r}param(t){return t?this.#r(t):this.#o()}#r(t){let e=this.#e[0][this.routeIndex]?.[1][t],r=this.#a(e);return r&&N(r)}#o(){let t={},e=Object.keys(this.#e[0][this.routeIndex]?.[1]??{});for(let r of e){let a=this.#a(this.#e[0][this.routeIndex][1][r]);a!==void 0&&(t[r]=N(a))}return t}#a(t){return this.#e[1]?this.#e[1][t]:t}query(t){return et(this.url,t)}queries(t){return tt(this.url,t)}header(t){if(t)return this.raw.headers.get(t)??void 0;let e=Object.create(null);return this.raw.headers.forEach((r,a)=>{e[a]=r}),e}async parseBody(t){return Ge(this,t)}#n=t=>{let{bodyCache:e,raw:r}=this,a=e[t];if(a)return a;for(let n in e)return e[n].then(o=>(n==="json"&&(o=JSON.stringify(o)),new Response(o)[t]()));return e[t]=r[t]()};json(){return this.#n("text").then(t=>JSON.parse(t))}text(){return this.#n("text")}arrayBuffer(){return this.#n("arrayBuffer")}bytes(){return this.#n("arrayBuffer").then(t=>new Uint8Array(t))}blob(){return this.#n("blob")}formData(){return this.#n("formData")}addValidatedData(t,e){(this.#t??={})[t]=e}valid(t){return this.#t?.[t]}get url(){return this.raw.url}get method(){return this.raw.method}get[ze](){return this.#e}get matchedRoutes(){return this.#e[0].map(([[,t]])=>t)}get routePath(){return this.#e[0].map(([[,t]])=>t)[this.routeIndex].path}};var at={Stringify:1,BeforeStream:2,Stream:3},mr=(t,e)=>{let r=new String(t);return r.isEscaped=!0,r.callbacks=e,r};var ge=async(t,e,r,a,n)=>{typeof t=="object"&&!(t instanceof String)&&(t instanceof Promise||(t=t.toString()),t instanceof Promise&&(t=await t));let o=t.callbacks;if(!o?.length)return Promise.resolve(t);n?n[0]+=t:n=[t];let s=Promise.all(o.map(i=>i({phase:e,buffer:n,context:a}))).then(i=>Promise.all(i.filter(Boolean).map(c=>ge(c,e,!1,a,n))).then(()=>n[0]));return r?mr(await s,o):s};var fr="text/plain; charset=UTF-8",ve=(t,e)=>({"Content-Type":t,...e}),j=(t,e)=>new Response(t,e),be=class{#t;#e;env={};#r;finalized=!1;error;#o;#a;#n;#d;#c;#l;#i;#p;#u;constructor(t,e){this.#t=t,e&&(this.#a=e.executionCtx,this.env=e.env,this.#l=e.notFoundHandler,this.#u=e.path,this.#p=e.matchResult)}get req(){return this.#e??=new rt(this.#t,this.#u,this.#p),this.#e}get event(){if(this.#a&&"respondWith"in this.#a)return this.#a;throw Error("This context has no FetchEvent")}get executionCtx(){if(this.#a)return this.#a;throw Error("This context has no ExecutionContext")}get res(){return this.#n||=j(null,{headers:this.#i??=new Headers})}set res(t){if(this.#n&&t){t=j(t.body,t);for(let[e,r]of this.#n.headers.entries())if(e!=="content-type")if(e==="set-cookie"){let a=this.#n.headers.getSetCookie();t.headers.delete("set-cookie");for(let n of a)t.headers.append("set-cookie",n)}else t.headers.set(e,r)}this.#n=t,this.finalized=!0}render=(...t)=>(this.#c??=e=>this.html(e),this.#c(...t));setLayout=t=>this.#d=t;getLayout=()=>this.#d;setRenderer=t=>{this.#c=t};header=(t,e,r)=>{this.finalized&&(this.#n=j(this.#n.body,this.#n));let a=this.#n?this.#n.headers:this.#i??=new Headers;e===void 0?a.delete(t):r?.append?a.append(t,e):a.set(t,e)};status=t=>{this.#o=t};set=(t,e)=>{this.#r??=new Map,this.#r.set(t,e)};get=t=>this.#r?this.#r.get(t):void 0;get var(){return this.#r?Object.fromEntries(this.#r):{}}#s(t,e,r){let a=this.#n?new Headers(this.#n.headers):this.#i;if(typeof e=="object"&&e.headers){a??=new Headers;for(let[o,s]of new Headers(e.headers))o==="set-cookie"?a.append(o,s):a.set(o,s)}if(r){if(!a){let o=0;for(let s in r)if(++o>1||typeof r[s]!="string"){a=new Headers;break}}if(a)for(let o in r){let s=r[o];if(typeof s=="string")a.set(o,s);else{a.delete(o);for(let i of s)a.append(o,i)}}}let n=typeof e=="number"?e:e?.status??this.#o;return j(t,{status:n,headers:a??r})}newResponse=(...t)=>this.#s(...t);body=(t,e,r)=>this.#s(t,e,r);text=(t,e,r)=>!this.#i&&!this.#o&&!e&&!r&&!this.finalized?new Response(t):this.#s(t,e,ve(fr,r));json=(t,e,r)=>this.#s(JSON.stringify(t),e,ve("application/json",r));html=(t,e,r)=>{let a=n=>this.#s(n,e,ve("text/html; charset=UTF-8",r));return typeof t=="object"?ge(t,at.Stringify,!1,{}).then(a):a(t)};redirect=(t,e)=>{let r=String(t);return this.header("Location",/[^\x00-\xFF]/.test(r)?encodeURI(r):r),this.newResponse(null,e??302)};notFound=()=>(this.#l??=()=>j(),this.#l(this))};var w="ALL",nt="all",ot=["get","post","put","delete","options","patch","query"],V="Can not add a route since the matcher is already built.",J=class extends Error{};var st="__COMPOSED_HANDLER";var hr=t=>t.text("404 Not Found",404),it=(t,e)=>{if("getResponse"in t){let r=t.getResponse();return e.newResponse(r.body,r)}return console.error(t),e.text("Internal Server Error",500)},ct=class lt{get;post;put;delete;options;patch;query;all;on;use;router;getPath;_basePath="/";#t="/";routes=[];constructor(e={}){[...ot,nt].forEach(o=>{this[o]=(s,...i)=>{let c=o.toUpperCase();return typeof s=="string"?this.#t=s:this.#o(c,this.#t,s),i.forEach(l=>{this.#o(c,this.#t,l)}),this}}),this.on=(o,s,...i)=>{for(let c of[s].flat()){this.#t=c;for(let l of[o].flat()){let d=l.toUpperCase();for(let p of i)this.#o(d,this.#t,p)}}return this},this.use=(o,...s)=>(typeof o=="string"?this.#t=o:(this.#t="*",s.unshift(o)),s.forEach(i=>{this.#o(w,this.#t,i)}),this);let{strict:a,...n}=e;Object.assign(this,n),this.getPath=a??!0?e.getPath??he:Qe}#e(){let e=new lt({router:this.router,getPath:this.getPath});return e.errorHandler=this.errorHandler,e.#r=this.#r,e.routes=this.routes,e}#r=hr;errorHandler=it;route(e,r){let a=this.basePath(e);return r.routes.map(n=>{let o;r.errorHandler===it?o=n.handler:(o=async(s,i)=>(await ue([],r.errorHandler)(s,()=>n.handler(s,i))).res,o[st]=n.handler),a.#o(n.method,n.path,o,n.basePath)}),this}basePath(e){let r=this.#e();return r._basePath=R(this._basePath,e),r}onError=e=>(this.errorHandler=e,this);notFound=e=>(this.#r=e,this);mount(e,r,a){let n,o;a&&(typeof a=="function"?o=a:(o=a.optionHandler,a.replaceRequest===!1?n=c=>c:n=a.replaceRequest));let s=o?c=>{let l=o(c);return Array.isArray(l)?l:[l]}:c=>{let l;try{l=c.executionCtx}catch{}return[c.env,l]};n||=(()=>{let c=R(this._basePath,e),l=c==="/"?0:c.length;return d=>{let p=new URL(d.url);return p.pathname=this.getPath(d).slice(l)||"/",new Request(p,d)}})();let i=async(c,l)=>{let d=await r(n(c.req.raw),...s(c));if(d)return d;await l()};return this.#o(w,R(e,"*"),i),this}#o(e,r,a,n){r=R(this._basePath,r);let o={basePath:n!==void 0?R(this._basePath,n):this._basePath,path:r,method:e,handler:a};this.router.add(e,r,[a,o]),this.routes.push(o)}#a(e,r){if(e instanceof Error)return this.errorHandler(e,r);throw e}#n(e,r,a,n){if(n==="HEAD")return(async()=>new Response(null,await this.#n(e,r,a,"GET")))();let o=this.getPath(e,{env:a}),s=this.router.match(n,o),i=new be(e,{path:o,matchResult:s,env:a,executionCtx:r,notFoundHandler:this.#r});if(s[0].length===1){let l;try{l=s[0][0][0][0](i,async()=>{i.res=await this.#r(i)})}catch(d){return this.#a(d,i)}return l instanceof Promise?l.then(d=>d||(i.finalized?i.res:this.#r(i))).catch(d=>this.#a(d,i)):l??this.#r(i)}let c=ue(s[0],this.errorHandler,this.#r);return(async()=>{try{let l=await c(i);if(!l.finalized)throw new Error("Context is not finalized. Did you forget to return a Response object or `await next()`?");return l.res}catch(l){return this.#a(l,i)}})()}fetch=(e,...r)=>this.#n(e,r[1],r[0],e.method);request=(e,r,a,n)=>e instanceof Request?this.fetch(r?new Request(e,r):e,a,n):(e=e.toString(),this.fetch(new Request(/^https?:\/\//.test(e)?e:`http://localhost${R("/",e)}`,r),a,n));fire=()=>{addEventListener("fetch",e=>{e.respondWith(this.#n(e.request,e,void 0,e.request.method))})}};var b=()=>Object.create(null);var Q=[];function we(t,e){let r=this.buildAllMatchers(),a=((n,o)=>{let s=r[n]||r[w],i=s[2][o];if(i)return i;let c=o.match(s[0]);if(!c)return[[],Q];let l=c.indexOf("",1);return[s[1][l],c]});return this.match=a,a(t,e)}var $="[^/]+",P=".*",S="(?:|/.*)",C=Symbol(),dt=new Set(".\\+*[^]$()");function gr(t,e){return t.length===1?e.length===1?t<e?-1:1:-1:e.length===1?1:t===P||t===S?e===S?-1:1:e===P||e===S?-1:t===$?1:e===$?-1:t.length===e.length?t<e?-1:1:e.length-t.length}var pt=class xe{#t;#e;#r=b();insert(e,r,a,n,o){let s=this;for(let i=0,c=e.length;i<c;i++){let l=e[i],d=l.length===1?l==="*"?i===c-1?["","",P]:["","",$]:null:l==="/*"?["","",S]:l.match(/^\:([^\{\}]+)(?:\{(.+)\})?$/),p;if(d){let m=d[1],f=d[2]||$;if(m&&d[2]&&(f===".*"||(f=f.replace(/^\((?!\?:)(?=[^)]+\)$)/,"(?:"),/\((?!\?:)/.test(f))||f.length===1&&dt.has(f)))throw C;if(p=s.#r[f],!p){if(f!==P&&f!==S){for(let x in s.#r)if((f.length>1||x.length>1)&&x!==P&&x!==S)throw C}p=s.#r[f]=new xe}m!==""&&(p.#e??=n.varIndex++,a.push([m,p.#e]))}else if(p=s.#r[l],!p){for(let m in s.#r)if(m.length>1&&m!==P&&m!==S)throw C;p=s.#r[l]=new xe}s=p}if(s.#t!==void 0)throw C;s.#t=o?-1:r}buildRegExpStr(){let r=Object.keys(this.#r).sort(gr).map(a=>{let n=this.#r[a],o=n.buildRegExpStr();return o===""?"":(typeof n.#e=="number"?`(${a})@${n.#e}`:dt.has(a)?`\\${a}`:a)+o}).filter(Boolean);return typeof this.#t=="number"&&this.#t!==-1&&r.unshift(`#${this.#t}`),r.length===0?"":r.length===1?r[0]:"(?:"+r.join("|")+")"}};var ye=class{#t={varIndex:0};#e=new pt;#r=0;paths=b();insert(t,e){if(e){this.#e.insert(t.split(""),0,[],this.#t,!0);return}let r=[],a=[],n=t;for(let s=0;;){let i=!1;if(n=n.replace(/\{[^}]+\}/g,c=>{let l=`@\\${s}`;return a[s]=[l,c],s++,i=!0,l}),!i)break}let o=n.match(/(?::[^\/]+)|(?:\/\*$)|./g)||[];for(let s=a.length-1;s>=0;s--){let[i]=a[s];for(let c=o.length-1;c>=0;c--)if(o[c].indexOf(i)!==-1){o[c]=o[c].replace(i,a[s][1]);break}}this.#e.insert(o,this.#r,r,this.#t,!1),this.paths[t]=[this.#r++,r]}buildRegExp(){let t=this.#e.buildRegExpStr();if(t==="")return[/^$/,[],[]];let e=0,r=[],a=[];return t=t.replace(/#(\d+)|@(\d+)|\.\*\$/g,(n,o,s)=>o!==void 0?(r[++e]=Number(o),"$()"):(s!==void 0&&(a[Number(s)]=++e),"")),[new RegExp(`^${t}`),r,a]}};var ut=b();function mt(t){return ut[t]??=new RegExp(`^${t.replace(/\/:[^/{}]+(?:\{\[\^\/]\+})?(?=[/{]|$)|\/?\*$|([.\\+*[^\]$()?{}|])/g,(e,r)=>r?`\\${r}`:e==="/*"?S:e==="*"?P:`/:${$}`)}$`)}function Z(t,e){for(let r of Object.keys(t).sort((a,n)=>n.length-a.length))if(mt(r).test(e))return[...t[r]]}var ee=class{name="RegExpRouter";#t;#e;#r;constructor(){this.#t={[w]:b()},this.#e={[w]:b()},this.#r={[w]:new ye}}#o(t,e){try{this.#r[t].insert(e,!/\*|\/:/.test(e))}catch(r){throw r===C?new J(e):r}}add(t,e,r){let a=this.#t,n=this.#e;if(!a)throw new Error(V);if(!a[t]){this.#r[t]=new ye;for(let i of[a,n]){i[t]=b();for(let c in i[w])i[t][c]=[...i[w][c]],this.#o(t,c)}}e==="/*"&&(e="*");let o=t===w?Object.keys(a):[t];if(/\*$/.test(e)){let i=mt(e);for(let c of o)a[c][e]||(this.#o(c,e),a[c][e]=Z(a[c],e)||Z(a[w],e)||[]);for(let c of[a,n])for(let l of o)for(let d in c[l])i.test(d)&&c[l][d].push([r,e]);return}let s=Y(e)||[e];for(let i of s)for(let c of o)n[c][i]||(this.#o(c,i),n[c][i]=Z(a[c],i)||Z(a[w],i)||[]),n[c][i].push([r,i])}match=we;buildAllMatchers(){let t=b();for(let e of Object.keys(this.#e))t[e]=this.#a(e);return this.#t=this.#e=this.#r=void 0,ut=b(),t}#a(t){let e=this.#t[t],r=this.#e[t],a=this.#r[t],n=b(),o=[],[s,i,c]=a.buildRegExp();for(let l of[e,r])for(let d in l){let p=l[d],m=a.paths[d];if(!m){n[d]=[p.map(([f])=>[f,b()]),Q];continue}o[m[0]]=p.map(([f,x])=>[f,a.paths[x][1].reduceRight((A,[de],k)=>(A[de]=c[m[1][k][1]],A),b())])}return[s,i.map(l=>o[l]),n]}};var ke=class{name="SmartRouter";#t=[];#e=[];constructor(t){this.#t=t.routers}add(t,e,r){if(!this.#e)throw new Error(V);this.#e.push([t,e,r])}match(t,e){if(!this.#e)throw new Error("Fatal error");let r=this.#t,a=this.#e,n=r.length,o=0,s;for(;o<n;o++){let i=r[o];try{for(let c=0,l=a.length;c<l;c++)i.add(...a[c]);s=i.match(t,e)}catch(c){if(c instanceof J)continue;throw c}this.match=i.match.bind(i),this.#t=[i],this.#e=void 0;break}if(o===n)throw new Error("Fatal error");return this.name=`SmartRouter + ${this.activeRouter.name}`,s}get activeRouter(){if(this.#e||this.#t.length!==1)throw new Error("No active router has been determined yet.");return this.#t[0]}};var Ee=b(),vr=0,ft=class ht{#t=[];#e=b();#r=[];#o;#a=Ee;insert(e,r,a){let n=this,o=Ye(r),s=new Set,i=0;for(let c of o){let l=o[++i],d=Ve(c,l)||(l===void 0&&c&&c.indexOf("*")===c.length-1?c:null),p=Array.isArray(d),m=p?d[0]:d||c,f=n.#e[m]||=new ht;d&&!f.#o&&(f.#o=d,n.#r.push(f)),n=f,p&&s.add(d[1])}n.#t.push({[e]:{handler:a,possibleKeys:[...s],score:++vr}})}#n(e,r,a,n,o){for(let s=0,i=r.#t.length;s<i;s++){let c=r.#t[s],l=c[a]||c[w];if(l){l.params=b(),e.push(l);for(let d=0,p=l.possibleKeys.length;d<p;d++){let m=l.possibleKeys[d];l.params[m]=o?.[m]&&!d?o[m]:n[m]??o?.[m]}}}}search(e,r){let a=[];this.#a=Ee;let o=[this],s=fe(r),i=[],c=s.length,l=null;for(let d=0;d<c;d++){let p=s[d],m=d===c-1,f=[];for(let A=0,de=o.length;A<de;A++){let k=o[A],O=k.#e[p];O&&(O.#a=k.#a,m?(O.#e["*"]&&this.#n(a,O.#e["*"],e,k.#a),this.#n(a,O,e,k.#a)):f.push(O));for(let y of k.#r){let M=y.#o,T=k.#a===Ee?{}:{...k.#a};if(typeof M=="string"){(M==="*"||p.startsWith(M.slice(0,-1)))&&(this.#n(a,y,e,k.#a),M==="*"&&(y.#a=T,f.push(y)));continue}let[,je,U]=M;if(!(!p&&U===!0)){if(U!==!0){if(!l){l=[];let pe=r[0]==="/"?1:0;for(let L=0;L<c;L++)l[L]=pe,pe+=s[L].length+1}let We=r.slice(l[d]),X=U.exec(We);if(X){T[je]=X[0],this.#n(a,y,e,k.#a,T),X[0].length===We.length&&y.#e["*"]&&this.#n(a,y.#e["*"],e,k.#a,T);for(let pe in y.#e){y.#a=T;let L=X[0].match(/\//g)?.length??0;(i[L]||=[]).push(y);break}continue}}(U===!0||U.test(p))&&(T[je]=p,m?(this.#n(a,y,e,T,k.#a),y.#e["*"]&&this.#n(a,y.#e["*"],e,T,k.#a)):(y.#a=T,f.push(y)))}}}let x=i.shift();o=x?f.concat(x):f}return a[1]&&a.sort((d,p)=>d.score-p.score),[a.map(({handler:d,params:p})=>[d,p])]}};var _e=class{name="TrieRouter";#t=new ft;add(t,e,r){for(let a of Y(e)||[e])this.#t.insert(t,a,r)}match(t,e){return this.#t.search(t,e)}};var W=class extends ct{constructor(t={}){super(t),this.router=t.router??new ke({routers:[new ee,new _e]})}};var gt=t=>{let e={origin:"*",allowMethods:["GET","HEAD","PUT","POST","DELETE","PATCH","QUERY"],allowHeaders:[],exposeHeaders:[],...t},r=e.exposeHeaders?.length?e.exposeHeaders.join(","):void 0,a=e.allowHeaders?.length?e.allowHeaders.join(","):void 0,n=(s=>typeof s=="string"?s==="*"?()=>s:i=>s===i?i:null:typeof s=="function"?s:i=>s.includes(i)?i:null)(e.origin),o=(s=>{if(typeof s=="function")return async(i,c)=>(await s(i,c)).join(",");if(Array.isArray(s)){let i=s.join(",");return()=>i}else return()=>""})(e.allowMethods);return async function(i,c){function l(p,m){i.res.headers.set(p,m)}let d=await n(i.req.header("origin")||"",i);if(d&&l("Access-Control-Allow-Origin",d),e.credentials&&l("Access-Control-Allow-Credentials","true"),r&&l("Access-Control-Expose-Headers",r),i.req.method==="OPTIONS"){e.origin!=="*"&&i.res.headers.append("Vary","Origin"),e.maxAge!=null&&l("Access-Control-Max-Age",e.maxAge.toString());let p=await o(i.req.header("origin")||"",i);p&&l("Access-Control-Allow-Methods",p);let m=a;if(!m){let f=i.req.header("Access-Control-Request-Headers");f&&(m=f.split(",").map(x=>x.trim()).join(","))}return m&&(l("Access-Control-Allow-Headers",m),i.res.headers.append("Vary","Access-Control-Request-Headers")),i.res.headers.delete("Content-Length"),i.res.headers.delete("Content-Type"),new Response(null,{headers:i.res.headers,status:204,statusText:"No Content"})}await c(),e.origin!=="*"&&i.header("Vary","Origin",{append:!0})}};function br(){let{process:t,Deno:e}=globalThis;return!(typeof e?.noColor=="boolean"?e.noColor:t!==void 0?"NO_COLOR"in t?.env:!1)}async function vt(){let{navigator:t}=globalThis,e="cloudflare:workers";return!(t!==void 0&&t.userAgent==="Cloudflare-Workers"?await(async()=>{try{return"NO_COLOR"in((await import(e)).env??{})}catch{return!1}})():!br())}var wr=t=>{let[e,r]=[",","."];return t.map(n=>n.replace(/(\d)(?=(\d\d\d)+(?!\d))/g,"$1"+e)).join(r)},xr=t=>{let e=Date.now()-t;return wr([e<1e3?e+"ms":Math.round(e/1e3)+"s"])},yr=async t=>{if(await vt())switch(t/100|0){case 5:return`\x1B[31m${t}\x1B[0m`;case 4:return`\x1B[33m${t}\x1B[0m`;case 3:return`\x1B[36m${t}\x1B[0m`;case 2:return`\x1B[32m${t}\x1B[0m`}return`${t}`};async function bt(t,e,r,a,n=0,o){let s=e==="<--"?`${e} ${r} ${a}`:`${e} ${r} ${a} ${await yr(n)} ${o}`;t(s)}var wt=(t=console.log)=>async function(r,a){let{method:n,url:o}=r.req,s=o.slice(o.indexOf("/",8));await bt(t,"<--",n,s);let i=Date.now();await a(),await bt(t,"-->",n,s,r.res.status,xr(i))};function xt(t,e=200,r={}){return new Response(JSON.stringify(t),{status:e,headers:{"content-type":"application/json; charset=utf-8",...r}})}function h(t={},e=200){return xt({ok:!0,data:t},e)}function u(t,e=400){return xt({ok:!1,error:t},e)}var kr={40001:"AppSecret \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5 WECHAT_APPSECRET",40002:"\u4E0D\u5408\u6CD5\u7684\u51ED\u8BC1\u7C7B\u578B",40007:"\u4E0D\u5408\u6CD5\u7684 media_id",40013:"AppID \u65E0\u6548\uFF0C\u8BF7\u68C0\u67E5 WECHAT_APPID",40014:"\u4E0D\u5408\u6CD5\u7684 access_token",40164:"\u8C03\u7528\u65B9 IP \u4E0D\u5728\u767D\u540D\u5355\uFF1A\u8BF7\u628A Cloudflare \u5168\u90E8 IPv4 \u6BB5\u52A0\u5165\u516C\u4F17\u53F7 IP \u767D\u540D\u5355",41001:"\u7F3A\u5C11 access_token",42001:"access_token \u5DF2\u8FC7\u671F",43001:"\u9700\u8981 GET \u8BF7\u6C42",44002:"POST \u6570\u636E\u5305\u4E3A\u7A7A",45009:"\u63A5\u53E3\u8C03\u7528\u8D85\u9650\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5",48001:"\u63A5\u53E3\u672A\u6388\u6743\uFF08\u53EF\u80FD\u8D26\u53F7\u7C7B\u578B\u4E0D\u652F\u6301\u8BE5\u63A5\u53E3\uFF09",53500:"\u65E0\u8349\u7A3F\u6743\u9650\uFF1Adraft/add \u9700\u8981\u5DF2\u8BA4\u8BC1\u7684\u516C\u4F17\u53F7",53503:"\u4E0D\u5408\u6CD5\u7684\u5C01\u9762\u56FE media_id"};function Er(t,e){let r=e?.errcode,a=r!==void 0?kr[r]:void 0,n=e?.errmsg||"\u672A\u77E5\u9519\u8BEF";return`${t}\u5931\u8D25\uFF1A${a||n}${a?`\uFF08${n}\uFF09`:""} [${r}]`}function I(t,e){if(!e||typeof e!="object")throw new Error(`${t}\u5931\u8D25\uFF1A\u54CD\u5E94\u5F02\u5E38`);if(e.errcode)throw new Error(Er(t,e))}function E(t){return String(t).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}function _r(t){return String(t).replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/\s+/g," ").trim()}function te(t,e){return t.length>e?`${t.slice(0,e-1)}\u2026`:t}function yt(t,e=120){let r=_r(t);return r.length>e?r.slice(0,e):r}var Ar=/^[\w!#$%&'*.^`|~+-]+$/,Tr=/^[!#-:<>-[\]-~]+$/,Sr=/^[ !#-:<-[\]-~]*$/,kt=t=>{let e=0,r=t.length;for(;e<r;){let a=t.charCodeAt(e);if(a!==32&&a!==9)break;e++}for(;r>e;){let a=t.charCodeAt(r-1);if(a!==32&&a!==9)break;r--}return e===0&&r===t.length?t:t.slice(e,r)},Ae=(t,e)=>{if(e&&t.indexOf(e)===-1)return{};let r=t.split(";"),a=Object.create(null);for(let n of r){let o=n.indexOf("=");if(o===-1)continue;let s=kt(n.substring(0,o));if(e&&e!==s||!Tr.test(s)||s in a)continue;let i=kt(n.substring(o+1));if(i.startsWith('"')&&i.endsWith('"')&&(i=i.slice(1,-1)),Sr.test(i)&&(a[s]=N(i),e))break}return a};var Rr=(t,e,r={})=>{if(!Ar.test(t))throw new Error("Invalid cookie name");let a=`${t}=${e}`;if(t.startsWith("__Secure-")&&!r.secure)throw new Error("__Secure- Cookie must have Secure attributes");if(t.startsWith("__Host-")){if(!r.secure)throw new Error("__Host- Cookie must have Secure attributes");if(r.path!=="/")throw new Error('__Host- Cookie must have Path attributes with "/"');if(r.domain)throw new Error("__Host- Cookie must not have Domain attributes")}for(let n of["domain","path","sameSite","priority"])if(r[n]&&/[;\r\n]/.test(r[n]))throw new Error(`${n} must not contain ";", "\\r", or "\\n"`);if(r&&typeof r.maxAge=="number"&&r.maxAge>=0){if(r.maxAge>3456e4)throw new Error("Cookies Max-Age SHOULD NOT be greater than 400 days (34560000 seconds) in duration.");a+=`; Max-Age=${r.maxAge|0}`}if(r.domain&&r.prefix!=="host"&&(a+=`; Domain=${r.domain}`),r.path&&(a+=`; Path=${r.path}`),r.expires){if(r.expires.getTime()-Date.now()>3456e7)throw new Error("Cookies Expires SHOULD NOT be greater than 400 days (34560000 seconds) in the future.");a+=`; Expires=${r.expires.toUTCString()}`}if(r.httpOnly&&(a+="; HttpOnly"),r.secure&&(a+="; Secure"),r.sameSite&&(a+=`; SameSite=${r.sameSite.charAt(0).toUpperCase()+r.sameSite.slice(1)}`),r.priority&&(a+=`; Priority=${r.priority.charAt(0).toUpperCase()+r.priority.slice(1)}`),r.partitioned){if(!r.secure)throw new Error("Partitioned Cookie must have Secure attributes");a+="; Partitioned"}return a},re=(t,e,r)=>(e=encodeURIComponent(e),Rr(t,e,r));var ae=(t,e,r)=>{let a=t.req.raw.headers.get("Cookie");if(typeof e=="string"){if(!a)return;let o=e;return r==="secure"?o="__Secure-"+e:r==="host"&&(o="__Host-"+e),Ae(a,o)[o]}return a?Ae(a):{}};var Cr=(t,e,r)=>{let a;return r?.prefix==="secure"?a=re("__Secure-"+t,e,{path:"/",...r,secure:!0}):r?.prefix==="host"?a=re("__Host-"+t,e,{...r,path:"/",secure:!0,domain:void 0}):a=re(t,e,{path:"/",...r}),a},Te=(t,e,r,a)=>{let n=Cr(e,r,a);t.header("Set-Cookie",n,{append:!0})};var Et=(t,e,r)=>{let a=ae(t,e,r?.prefix);return Te(t,e,"",{...r,maxAge:0}),a};var ne=`
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
.dots { display: flex; gap: .25rem; }
.dots i { width: .375rem; height: .375rem; border-radius: 50%; background: var(--color-rule-2); }

/* \u9762\u677F\u5185\u76F4\u63A5\u653E\u7F6E\u7684\u5185\u5BB9\u9700\u8981\u5185\u8FB9\u8DDD */
.panel > .row, .panel > .notice, .panel > .bars, .panel > .field { padding: var(--space-md); }
.panel > .mono-out { margin: var(--space-md); }
.panel > .stat-grid { border: 0; border-radius: 0; }

/* \u4EE4\u724C\u5C55\u793A / \u56FE\u6807\u7EC6\u8282 */
.mask-key { font-family: var(--font-mono); font-size: var(--text-xs); cursor: pointer; word-break: break-all; text-decoration: underline dotted; text-underline-offset: 3px; }
.mask-key:hover { color: var(--color-accent, currentColor); }
.mask-key.show { text-decoration: none; }
.auth-context__lede { color: var(--color-muted); }
`;var Pr=`<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=JetBrains+Mono:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">`;function Se(t,e,r="site-page"){return`<!DOCTYPE html>
<html lang="zh-CN"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#0f1115">
<meta name="description" content="\u628A Markdown / HTML \u6587\u7AE0\u901A\u8FC7\u4E00\u884C API \u63A8\u9001\u8FDB\u5FAE\u4FE1\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\uFF0C\u56FE\u7247\u81EA\u52A8\u8F6C\u5B58\uFF0C\u8349\u7A3F\u7531\u4F60\u786E\u8BA4\u540E\u53D1\u5E03\u3002">
<title>${E(t)}</title>
${Pr}
<style>${ne}</style>
</head><body class="${r}">${e}</body></html>`}var Dr=t=>`
<header class="topbar"><div class="shell topbar__inner">
  <a class="brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
    <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
    <span class="brand__name">\u8349\u7A3F\u63A8\u9001\u7F51\u5173</span>
    <span class="brand__descriptor">WECHAT DRAFT API</span>
  </a>
  <nav class="topbar__actions" aria-label="\u4E3B\u5BFC\u822A">
    <a class="btn btn-gh" href="/#docs"><i class="fas fa-book" aria-hidden="true"></i>\u63A5\u53E3\u6587\u6863</a>
    <a class="btn btn-gh" href="/#start"><i class="fas fa-bolt" aria-hidden="true"></i>\u5FEB\u901F\u5F00\u59CB</a>
    <a class="btn btn-p" href="${t?"/admin":"/admin/login"}"><i class="fas fa-sliders-h" aria-hidden="true"></i>${t?"\u8FDB\u5165\u540E\u53F0":"\u540E\u53F0\u767B\u5F55"}</a>
  </nav>
</div></header>`,Re=`<footer class="site-footer"><div class="shell site-footer__inner">
  <span>\u8349\u7A3F\u63A8\u9001\u7F51\u5173 \xB7 Cloudflare Workers + Hono</span>
  <span>\u6570\u636E\u5B58\u50A8\u4E8E\u81EA\u6709 D1 \u6570\u636E\u5E93 \xB7 \u4EC5\u521B\u5EFA\u8349\u7A3F\uFF0C\u4E0D\u81EA\u52A8\u53D1\u5E03</span>
</div></footer>`,Ir=`<script>
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
<\/script>`;function _t(t){let e=`curl -X POST ${t}/api/draft \\
  -H "X-API-Key: wxk_\u4F60\u7684\u4EE4\u724C" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "\u6211\u7684\u7B2C\u4E00\u7BC7\u6587\u7AE0",
    "author": "\u5C0F\u7F16",
    "contentType": "markdown",
    "content": "# \u6807\u9898\\n\\n\u6B63\u6587\u652F\u6301 **Markdown**\uFF0C\u56FE\u7247\u4F1A\u81EA\u52A8\u8F6C\u5B58",
    "cover": "https://example.com/cover.png"
  }'`,r=`import requests

r = requests.post(
    "${t}/api/draft",
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
print(r.json())   # {"ok": true, "data": {"media_id": "...", ...}}`,a=`const res = await fetch("${t}/api/draft", {
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
console.log(await res.json())`;return Se("\u8349\u7A3F\u63A8\u9001\u7F51\u5173 \xB7 \u4E00\u884C API \u628A\u6587\u7AE0\u9001\u8FDB\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1",`${Dr(!1)}
<main>
  <section class="shell home-hero">
    <div class="home-hero__copy">
      <p class="eyebrow"><span aria-hidden="true"></span>CLOUDFLARE WORKERS \xB7 \u5FAE\u4FE1\u516C\u4F17\u53F7\u8349\u7A3F API</p>
      <h1 id="home-title">\u4E00\u884C API\uFF0C\u628A\u6587\u7AE0\u9001\u8FDB\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u3002</h1>
      <p class="home-hero__lede">\u4F20\u5165 Markdown \u6216 HTML\uFF0C\u670D\u52A1\u81EA\u52A8\u5B8C\u6210\u5916\u94FE\u56FE\u7247\u8F6C\u5B58\u3001\u5C01\u9762\u7D20\u6750\u4E0A\u4F20\u4E0E\u8349\u7A3F\u521B\u5EFA\u3002
        \u6392\u7248\u4E0E\u53D1\u5E03\u4ECD\u7531\u4F60\u5728\u516C\u4F17\u53F7\u540E\u53F0\u4EBA\u5DE5\u786E\u8BA4\uFF0C\u5B89\u5168\u53EF\u63A7\u3002</p>
      <div class="endpoint-box" aria-label="\u63A5\u53E3\u5730\u5740">
        <span class="endpoint-box__label">DRAFT ENDPOINT</span>
        <code>${E(t)}/api/draft</code>
        <button class="icon-btn" type="button" data-copy="${E(t)}/api/draft" aria-label="\u590D\u5236\u63A5\u53E3\u5730\u5740">
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
      <pre><code>${E(e)}</code></pre>
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
      <pre style="min-height:auto"><code>${E(e)}</code></pre>
    </div>
    <div class="request-panel" style="margin-block-end:var(--space-md)">
      <figcaption><span>Python</span></figcaption>
      <pre style="min-height:auto"><code>${E(r)}</code></pre>
    </div>
    <div class="request-panel">
      <figcaption><span>JavaScript</span></figcaption>
      <pre style="min-height:auto"><code>${E(a)}</code></pre>
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
            <code>needOpenComment</code> / <code>onlyFansCanComment</code></td></tr>
          <tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td>
            <td>\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u5217\u8868\uFF0C\u53C2\u6570 <code>offset</code> / <code>count</code>\uFF08\u226420\uFF09</td></tr>
          <tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td>
            <td>\u5220\u9664\u6307\u5B9A\u8349\u7A3F</td></tr>
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
${Re}
${Ir}`,"site-page home-page")}function oe(t={baseUrl:""}){return Se("\u540E\u53F0\u767B\u5F55 \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173",`<header class="topbar topbar--auth"><div class="shell topbar__inner">
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
        <div><h2>\u7BA1\u7406\u5458\u767B\u5F55</h2><p>\u8F93\u5165\u7BA1\u7406\u5458\u8D26\u53F7\u4E0E\u5BC6\u7801\u7EE7\u7EED\u3002</p></div>
      </div>
      ${t.error?'<div class="al al-e"><i class="fas fa-circle-exclamation" aria-hidden="true"></i><span>\u8D26\u53F7\u6216\u5BC6\u7801\u4E0D\u6B63\u786E\uFF0C\u8BF7\u91CD\u65B0\u8F93\u5165\u3002</span></div>':""}
      <div class="fg">
        <label for="user">\u7BA1\u7406\u5458\u8D26\u53F7</label>
        <div class="input-wrap">
          <i class="fas fa-user" aria-hidden="true"></i>
          <input id="user" name="username" type="text" placeholder="\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u8D26\u53F7"
                 autocomplete="username" required autofocus aria-required="true" value="admin">
        </div>
      </div>
      <div class="fg">
        <label for="pw">\u7BA1\u7406\u5458\u5BC6\u7801</label>
        <div class="input-wrap">
          <i class="fas fa-key" aria-hidden="true"></i>
          <input id="pw" name="password" type="password" placeholder="\u8BF7\u8F93\u5165\u7BA1\u7406\u5458\u5BC6\u7801"
                 autocomplete="current-password" required aria-required="true">
          <button class="password-toggle" id="pw-toggle" type="button" aria-label="\u663E\u793A\u5BC6\u7801">
            <i class="far fa-eye" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <p class="form-helper">\u8D26\u53F7\u9ED8\u8BA4 <code>admin</code>\uFF1B\u5FD8\u8BB0\u5BC6\u7801\u53EF\u5728\u540E\u53F0\u300C\u8BBE\u7F6E\u300D\u4E2D\u4FEE\u6539\uFF0C\u6216\u5728 Cloudflare \u63A7\u5236\u53F0\u8C03\u6574 <code>ADMIN_USER</code> / <code>ADMIN_PASSWORD</code> \u53D8\u91CF\u3002</p>
      <button class="btn btn-p btn-submit" type="submit">
        <span class="button-label"><i class="fas fa-right-to-bracket" aria-hidden="true"></i>\u767B\u5F55\u63A7\u5236\u53F0</span>
      </button>
    </form>
  </section>
</main>
${Re}
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
<\/script>`,"site-page auth-page")}function At(t){let e=(a,n,o)=>`<a class="admin-nav__link" data-view="${a}" href="#${a}"><i class="${n}" aria-hidden="true"></i><span>${o}</span></a>`,r=(a,n)=>`<a data-view="${a}" href="#${a}">${n}</a>`;return Se("\u63A7\u5236\u53F0 \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173",`<div class="admin-shell">
  <aside class="admin-rail" aria-label="\u63A7\u5236\u53F0\u5BFC\u822A">
    <div class="admin-rail__head">
      <a class="brand admin-rail__brand" href="/" aria-label="\u8349\u7A3F\u63A8\u9001\u7F51\u5173\u9996\u9875">
        <span class="brand__mark" aria-hidden="true"><i class="fas fa-paper-plane"></i></span>
        <span><strong>\u8349\u7A3F\u63A8\u9001\u7F51\u5173</strong><small>CONTROL PANEL</small></span>
      </a>
    </div>
    <nav class="admin-nav" aria-label="\u529F\u80FD\u5BFC\u822A">
      ${e("dashboard","fas fa-chart-pie","\u6982\u89C8")}
      ${e("accounts","fas fa-layer-group","\u516C\u4F17\u53F7\u7BA1\u7406")}
      ${e("records","fas fa-receipt","\u63A8\u9001\u8BB0\u5F55")}
      ${e("drafts","fas fa-inbox","\u8349\u7A3F\u7BB1")}
      ${e("tokens","fas fa-key","\u4EE4\u724C\u7BA1\u7406")}
      ${e("docs","fas fa-book","\u63A5\u53E3\u6587\u6863")}
      ${e("settings","fas fa-gear","\u8BBE\u7F6E")}
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
        ${r("dashboard","\u6982\u89C8")}
        ${r("accounts","\u516C\u4F17\u53F7")}
        ${r("records","\u8BB0\u5F55")}
        ${r("drafts","\u8349\u7A3F")}
        ${r("tokens","\u4EE4\u724C")}
        ${r("docs","\u6587\u6863")}
        ${r("settings","\u8BBE\u7F6E")}
      </nav>
      <a class="icon-btn" href="/admin/logout" aria-label="\u9000\u51FA\u767B\u5F55">
        <i class="fas fa-right-from-bracket" aria-hidden="true"></i>
      </a>
    </header>
    <main class="admin-content">
      <div id="view"><div class="empty-state">\u52A0\u8F7D\u4E2D\u2026</div></div>
    </main>
    ${Re}
  </div>
</div>
<div class="toasts" id="toasts"></div>
<script>window.__BASE__ = ${JSON.stringify(t.baseUrl)};<\/script>
<script src="/admin/app.js"><\/script>
<script>
(function () {
  var btn = document.getElementById('rail-toggle');
  var shellEl = document.querySelector('.admin-shell');
  if (!btn || !shellEl) return;
  btn.addEventListener('click', function () { shellEl.classList.toggle('is-collapsed'); });
})();
<\/script>`,"site-page admin-page")}var Tt=!1;async function St(t){if(!Tt){await t.DB.batch([t.DB.prepare(`CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )`),t.DB.prepare(`CREATE TABLE IF NOT EXISTS tokens (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        enabled INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        last_used_at TEXT,
        use_count INTEGER NOT NULL DEFAULT 0
      )`),t.DB.prepare(`CREATE TABLE IF NOT EXISTS drafts (
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
      )`),t.DB.prepare(`CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        expires_at TEXT NOT NULL
      )`),t.DB.prepare("CREATE INDEX IF NOT EXISTS idx_drafts_created ON drafts(created_at DESC)"),t.DB.prepare("CREATE INDEX IF NOT EXISTS idx_tokens_key ON tokens(key)"),t.DB.prepare(`CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        appid TEXT NOT NULL,
        appsecret TEXT NOT NULL,
        enabled INTEGER NOT NULL DEFAULT 1,
        is_default INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL
      )`)]);for(let e of["ALTER TABLE drafts ADD COLUMN account_id TEXT","ALTER TABLE drafts ADD COLUMN account_name TEXT"])try{await t.DB.prepare(e).run()}catch{}Tt=!0}}async function Rt(t){await St(t);try{((await t.DB.prepare("SELECT COUNT(*) AS n FROM tokens").first())?.n??0)===0&&t.DRAFT_API_KEY&&await t.DB.prepare("INSERT INTO tokens (id, name, key, enabled, created_at, use_count) VALUES (?, ?, ?, 1, ?, 0)").bind(z(),"\u9ED8\u8BA4\u4EE4\u724C\uFF08\u7531 DRAFT_API_KEY \u8FC1\u79FB\uFF09",t.DRAFT_API_KEY,D()).run()}catch{}try{let r=(await t.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first())?.n??0;r===0&&t.WECHAT_APPID&&t.WECHAT_APPSECRET?await t.DB.prepare("INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at) VALUES (?, ?, ?, ?, 1, 1, ?)").bind(z(),"\u9ED8\u8BA4\u516C\u4F17\u53F7",t.WECHAT_APPID,t.WECHAT_APPSECRET,D()).run():r>0&&((await t.DB.prepare("SELECT COUNT(*) AS n FROM accounts WHERE is_default = 1").first())?.n??0)===0&&await t.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)").run()}catch{}}async function q(t){return(await t.DB.prepare("SELECT * FROM accounts ORDER BY is_default DESC, created_at ASC").all()).results??[]}async function H(t,e){return await t.DB.prepare("SELECT * FROM accounts WHERE id = ?").bind(e).first()??null}async function Ct(t,e){let a=(await t.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first())?.n??0,n=e.is_default===!0||a===0,o={id:z(),name:String(e.name??"").trim()||`\u516C\u4F17\u53F7 ${a+1}`,appid:String(e.appid??"").trim(),appsecret:String(e.appsecret??"").trim(),enabled:1,is_default:n?1:0,created_at:D()};return n&&await t.DB.prepare("UPDATE accounts SET is_default = 0").run(),await t.DB.prepare("INSERT INTO accounts (id, name, appid, appsecret, enabled, is_default, created_at) VALUES (?, ?, ?, ?, 1, ?, ?)").bind(o.id,o.name,o.appid,o.appsecret,o.is_default,o.created_at).run(),o}async function Pt(t,e,r){let a=[],n=[];return typeof r.name=="string"&&r.name.trim()&&(a.push("name = ?"),n.push(r.name.trim())),typeof r.appid=="string"&&r.appid.trim()&&(a.push("appid = ?"),n.push(r.appid.trim())),typeof r.appsecret=="string"&&r.appsecret.trim()&&(a.push("appsecret = ?"),n.push(r.appsecret.trim())),typeof r.enabled=="number"&&(a.push("enabled = ?"),n.push(r.enabled?1:0)),a.length?(n.push(e),((await t.DB.prepare(`UPDATE accounts SET ${a.join(", ")} WHERE id = ?`).bind(...n).run()).meta?.changes??0)>0):!0}async function Dt(t,e){return await t.DB.prepare("UPDATE accounts SET is_default = 0").run(),((await t.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = ?").bind(e).run()).meta?.changes??0)>0}async function It(t,e){let r=await H(t,e);if(!r)return!1;let a=await t.DB.prepare("DELETE FROM accounts WHERE id = ?").bind(e).run();return r.is_default&&await t.DB.prepare("UPDATE accounts SET is_default = 1 WHERE id = (SELECT id FROM accounts ORDER BY created_at ASC LIMIT 1)").run(),(a.meta?.changes??0)>0}async function F(t,e){try{if(await St(t),e){let a=await H(t,e);if(a)return{id:a.id,name:a.name,appid:a.appid,appsecret:a.appsecret}}let r=await t.DB.prepare("SELECT * FROM accounts WHERE is_default = 1 LIMIT 1").first()??await t.DB.prepare("SELECT * FROM accounts WHERE enabled = 1 ORDER BY created_at ASC LIMIT 1").first();if(r)return{id:r.id,name:r.name,appid:r.appid,appsecret:r.appsecret}}catch{}return t.WECHAT_APPID&&t.WECHAT_APPSECRET?{id:"",name:"\u73AF\u5883\u53D8\u91CF\u51ED\u636E",appid:t.WECHAT_APPID,appsecret:t.WECHAT_APPSECRET}:null}var D=()=>new Date().toISOString(),z=()=>crypto.randomUUID();function Or(){let t=new Uint8Array(16);return crypto.getRandomValues(t),"wxk_"+Array.from(t).map(e=>e.toString(16).padStart(2,"0")).join("")}function Lr(){let t=new Uint8Array(24);return crypto.getRandomValues(t),Array.from(t).map(e=>e.toString(16).padStart(2,"0")).join("")}async function Ot(t){let e=await t.DB.prepare("SELECT key, value FROM settings").all(),r={};for(let a of e.results??[])r[a.key]=a.value;return r}async function Ce(t,e,r){await t.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(e,r).run()}async function Lt(t){return(await t.DB.prepare("SELECT * FROM tokens ORDER BY created_at DESC").all()).results??[]}async function Nt(t,e){let r={id:z(),name:e.trim()||"\u672A\u547D\u540D\u4EE4\u724C",key:Or(),enabled:1,created_at:D(),last_used_at:null,use_count:0};return await t.DB.prepare("INSERT INTO tokens (id, name, key, enabled, created_at, last_used_at, use_count) VALUES (?, ?, ?, 1, ?, NULL, 0)").bind(r.id,r.name,r.key,r.created_at).run(),r}async function $t(t,e,r){let a=[],n=[];return typeof r.name=="string"&&(a.push("name = ?"),n.push(r.name.trim()||"\u672A\u547D\u540D\u4EE4\u724C")),r.enabled!==void 0&&(a.push("enabled = ?"),n.push(r.enabled?1:0)),a.length?(n.push(e),((await t.DB.prepare(`UPDATE tokens SET ${a.join(", ")} WHERE id = ?`).bind(...n).run()).meta?.changes??0)>0):!1}async function Ht(t,e){return((await t.DB.prepare("DELETE FROM tokens WHERE id = ?").bind(e).run()).meta?.changes??0)>0}async function Bt(t,e){return await t.DB.prepare("SELECT * FROM tokens WHERE id = ?").bind(e).first()??null}async function Mt(t,e){return await t.DB.prepare("SELECT * FROM tokens WHERE key = ? AND enabled = 1").bind(e).first()??null}async function Ut(t,e){await t.DB.prepare("UPDATE tokens SET last_used_at = ?, use_count = use_count + 1 WHERE id = ?").bind(D(),e).run()}async function Pe(t,e){try{await t.DB.prepare(`INSERT INTO drafts (id, media_id, title, author, status, error, duration_ms, images, content_len, token_name, account_id, account_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(z(),e.media_id,e.title,e.author,e.status,e.error,e.duration_ms,e.images,e.content_len,e.token_name,e.account_id??null,e.account_name??null,D()).run()}catch{}}async function jt(t,e=50,r=0){return(await t.DB.prepare("SELECT * FROM drafts ORDER BY created_at DESC LIMIT ? OFFSET ?").bind(Math.min(Math.max(e,1),200),Math.max(r,0)).all()).results??[]}async function Wt(t,e){return((await t.DB.prepare("DELETE FROM drafts WHERE id = ?").bind(e).run()).meta?.changes??0)>0}async function zt(t){await t.DB.prepare("DELETE FROM drafts").run()}async function qt(t){let e=await t.DB.prepare(`SELECT COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success,
            COALESCE(SUM(CASE WHEN status = 'failed'  THEN 1 ELSE 0 END), 0) AS failed,
            COALESCE(AVG(duration_ms), 0) AS avg_duration
     FROM drafts`).first(),r=await t.DB.prepare("SELECT COUNT(*) AS n FROM drafts WHERE date(created_at) = date('now')").first(),a=await t.DB.prepare("SELECT COUNT(*) AS total, COALESCE(SUM(CASE WHEN enabled = 1 THEN 1 ELSE 0 END), 0) AS enabled FROM tokens").first(),n=await t.DB.prepare(`SELECT date(created_at) AS date,
            COUNT(*) AS total,
            COALESCE(SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END), 0) AS success
     FROM drafts
     WHERE created_at >= datetime('now', '-7 days')
     GROUP BY date(created_at)
     ORDER BY date ASC`).all(),o=e?.total??0,s=e?.success??0,i=new Map;for(let l of n.results??[])i.set(l.date,{total:l.total,success:l.success});let c=[];for(let l=6;l>=0;l--){let d=new Date(Date.now()-l*864e5).toISOString().slice(0,10),p=i.get(d)??{total:0,success:0};c.push({date:d,total:p.total,success:p.success})}return{total:o,success:s,failed:e?.failed??0,success_rate:o?Math.round(s/o*1e3)/10:0,avg_duration_ms:Math.round(e?.avg_duration??0),today:r?.n??0,tokens:a?.total??0,tokens_enabled:a?.enabled??0,appid_configured:!!t.WECHAT_APPID,secret_configured:!!t.WECHAT_APPSECRET,daily:c}}var Nr=7*864e5;async function Ft(t){let e=Lr(),r=new Date(Date.now()+Nr).toISOString();return await t.DB.prepare("INSERT INTO sessions (id, created_at, expires_at) VALUES (?, ?, ?)").bind(e,D(),r).run(),{id:e,expires_at:r}}async function Xt(t,e){if(!e)return!1;let r=await t.DB.prepare("SELECT expires_at FROM sessions WHERE id = ?").bind(e).first();return r?new Date(r.expires_at).getTime()<Date.now()?(await De(t,e),!1):!0:!1}async function De(t,e){await t.DB.prepare("DELETE FROM sessions WHERE id = ?").bind(e).run()}async function Kt(t){await t.DB.prepare("DELETE FROM sessions WHERE expires_at < ?").bind(D()).run()}var se="wxd_session";async function Gt(t){let e=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(t));return Array.from(new Uint8Array(e)).map(r=>r.toString(16).padStart(2,"0")).join("")}async function Ie(t,e){let[r,a]=await Promise.all([Gt(t),Gt(e)]),n=0;for(let o=0;o<r.length;o++)n|=r.charCodeAt(o)^a.charCodeAt(o);return n===0}async function ie(t){try{let e=await t.DB.prepare("SELECT value FROM settings WHERE key = 'admin_password'").first();if(e?.value)return e.value}catch{}return t.ADMIN_PASSWORD||"admin"}async function Oe(t,e){return Ie(e,await ie(t))}async function Le(t){try{let e=await t.DB.prepare("SELECT value FROM settings WHERE key = 'admin_user'").first();if(e?.value)return e.value}catch{}return t.ADMIN_USER||"admin"}async function $r(t,e,r){let[a,n]=await Promise.all([Ie(String(e).trim(),await Le(t)),Oe(t,r)]);return a&&n}async function Yt(t){return await ie(t)==="admin"}var Ne=async(t,e)=>{let r=ae(t,se)??"";return(r?await Xt(t.env,r):!1)?e():t.req.path.startsWith("/admin/api/")?u("\u672A\u767B\u5F55\u6216\u4F1A\u8BDD\u5DF2\u8FC7\u671F\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55",401):t.redirect("/admin/login")};async function Vt(t){let e=t.req.header("content-type")??"",r="",a="",n=!1;if(e.includes("application/json")){n=!0;let i=await t.req.json().catch(()=>({}));r=String(i.username??i.user??""),a=String(i.password??"")}else{let i=await t.req.parseBody();r=String(i.username??i.user??""),a=String(i.password??"")}if(!await $r(t.env,r||"admin",a))return n?u("\u8D26\u53F7\u6216\u5BC6\u7801\u9519\u8BEF",401):t.html(Hr(),401);await Kt(t.env);let o=await Ft(t.env),s=new URL(t.req.url).protocol==="https:";return Te(t,se,o.id,{path:"/",httpOnly:!0,sameSite:"Lax",secure:s,maxAge:7*86400}),n?h({redirect:"/admin"}):t.redirect("/admin")}async function $e(t){let e=ae(t,se)??"";return e&&await De(t.env,e),Et(t,se,{path:"/"}),t.redirect("/admin/login")}function Hr(){return oe({error:!0,baseUrl:""})}async function Br(t){try{return((await t.DB.prepare("SELECT COUNT(*) AS n FROM tokens WHERE enabled = 1").first())?.n??0)>0}catch(e){return console.error("\u4EE4\u724C\u72B6\u6001\u63A2\u6D4B\u5931\u8D25:",e),!1}}async function Mr(t,e){if(t.DRAFT_API_KEY&&await Ie(e,t.DRAFT_API_KEY))return{ok:!0,tokenName:"\u73AF\u5883\u53D8\u91CF\u5BC6\u94A5"};let r=await Mt(t,e);return r?(await Ut(t,r.id),{ok:!0,tokenName:r.name}):{ok:!1,response:u("\u4EE4\u724C\u65E0\u6548\u6216\u5DF2\u88AB\u7981\u7528",401)}}var Jt=async(t,e)=>{if(t.req.path==="/api/health")return e();let r=t.env.DRAFT_API_KEY,a=t.req.header("X-API-Key")??t.req.query("key")??(t.req.header("Authorization")?.replace(/^Bearer\s+/i,"")||"");if(!a)return r||await Br(t.env)?u("\u672A\u6388\u6743\uFF1A\u8BF7\u5728\u8BF7\u6C42\u5934\u643A\u5E26 X-API-Key\uFF0C\u6216\u4F7F\u7528 ?key= \u67E5\u8BE2\u53C2\u6570",401):e();let n=await Mr(t.env,a);return n.ok?(t.set("tokenName",n.tokenName),e()):n.response};var Ur="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",jr=/^data:([^;]+);base64,(.*)$/s;function Wr(t){let e=jr.exec(t);if(!e)return null;let r=atob(e[2].replace(/\s/g,"")),a=new Uint8Array(r.length);for(let n=0;n<r.length;n++)a[n]=r.charCodeAt(n);return new Blob([a],{type:e[1]})}async function zr(t){let e=await fetch(t,{headers:{"User-Agent":Ur,Accept:"image/*,*/*;q=0.8"},redirect:"follow"});if(!e.ok)throw new Error(`\u4E0B\u8F7D\u56FE\u7247\u5931\u8D25: ${t} (HTTP ${e.status})`);return e.blob()}function Qt(t){return t.startsWith("https://mmbiz.qpic.cn")||t.startsWith("http://mmbiz.qpic.cn")}function He(t){let e=/<img\s+[^>]*?src=["']([^"']+)["'][^>]*>/gi,r=[],a;for(;(a=e.exec(t))!==null;)r.push(a[1]);return r}function Zt(t){return He(t)[0]??null}async function ce(t){return t.startsWith("data:")?Wr(t):/^https?:\/\//i.test(t)?zr(t):null}var B="https://api.weixin.qq.com",er=new Map,_=class{constructor(e,r){this.appid=e;this.secret=r}appid;secret;async getToken(e=!1){let r=Date.now(),a=er.get(this.appid);if(!e&&a&&r<a.exp)return a.token;let o=await(await fetch(`${B}/cgi-bin/stable_token`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({grant_type:"client_credential",appid:this.appid,secret:this.secret,force_refresh:!1})})).json();if(I("\u83B7\u53D6 access_token",o),!o.access_token)throw new Error("\u83B7\u53D6 access_token \u5931\u8D25\uFF1A\u54CD\u5E94\u4E3A\u7A7A");return er.set(this.appid,{token:o.access_token,exp:r+((o.expires_in??7200)-200)*1e3}),o.access_token}async uploadContentImage(e,r="image.png"){let a=await this.getToken(),n=new FormData;n.append("media",e,r);let s=await(await fetch(`${B}/cgi-bin/media/uploadimg?access_token=${encodeURIComponent(a)}`,{method:"POST",body:n})).json();if(I("\u4E0A\u4F20\u6B63\u6587\u56FE\u7247",s),!s.url)throw new Error("\u4E0A\u4F20\u6B63\u6587\u56FE\u7247\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE url");return s.url}async uploadMaterialImage(e,r="cover.png"){let a=await this.getToken(),n=new FormData;n.append("media",e,r);let s=await(await fetch(`${B}/cgi-bin/material/add_material?access_token=${encodeURIComponent(a)}&type=image`,{method:"POST",body:n})).json();if(I("\u4E0A\u4F20\u5C01\u9762\u7D20\u6750",s),!s.media_id)throw new Error("\u4E0A\u4F20\u5C01\u9762\u7D20\u6750\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE media_id");return s.media_id}async localizeImages(e){let r=He(e),a=e,n=0,o=[];for(let s of r)if(!Qt(s))try{let i=await ce(s);if(!i)continue;let c=await this.uploadContentImage(i);a=a.split(s).join(c),n++}catch{o.push(s)}return{html:a,localized:n,failed:o}}async resolveCover(e,r){if(e){let n=await ce(e);if(n)return this.uploadMaterialImage(n)}let a=Zt(r);if(a){let n=await ce(a);if(n)return this.uploadMaterialImage(n)}return null}async addDraft(e){let r=await this.getToken(),n=await(await fetch(`${B}/cgi-bin/draft/add?access_token=${encodeURIComponent(r)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({articles:[e]})})).json();if(I("\u65B0\u5EFA\u8349\u7A3F",n),!n.media_id)throw new Error("\u65B0\u5EFA\u8349\u7A3F\u5931\u8D25\uFF1A\u672A\u8FD4\u56DE media_id");return n.media_id}async batchGetDrafts(e=0,r=20){let a=await this.getToken(),o=await(await fetch(`${B}/cgi-bin/draft/batchget?access_token=${encodeURIComponent(a)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({offset:e,count:r,no_content:1})})).json();return I("\u83B7\u53D6\u8349\u7A3F\u5217\u8868",o),o}async deleteDraft(e){let r=await this.getToken(),n=await(await fetch(`${B}/cgi-bin/draft/delete?access_token=${encodeURIComponent(r)}`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({media_id:e})})).json();I("\u5220\u9664\u8349\u7A3F",n)}};function Be(t){let e=t.replace(/\r\n/g,`
`).trim(),r=[];e=e.replace(/```([\w+-]*)\n([\s\S]*?)```/g,(i,c,l)=>{let d=r.length,p=c?` class="language-${E(c)}"`:"";return r.push(`<pre><code${p}>${E(l)}</code></pre>`),`\0B${d}\0`}),e=e.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g,(i,c,l)=>`<img src="${l}" alt="${E(c)}">`),e=e.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,(i,c,l)=>`<a href="${l}">${c}</a>`),e=e.replace(/`([^`]+)`/g,(i,c)=>`<code>${E(c)}</code>`),e=e.replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>"),e=e.replace(/(^|[^*])\*([^*\n]+)\*/g,"$1<em>$2</em>");let a=e.split(`
`),n=[],o=null,s=()=>{o&&(n.push(`</${o}>`),o=null)};for(let i of a){let c=i.trimEnd(),l=/^\u0000B(\d+)\u0000$/.exec(c.trim());if(l){s(),n.push(r[Number(l[1])]);continue}if(/^\s*$/.test(c)){s();continue}let d=/^(#{1,6})\s+(.*)$/.exec(c);if(d){s();let x=d[1].length;n.push(`<h${x}>${d[2]}</h${x}>`);continue}if(/^(-{3,}|\*{3,})$/.test(c.trim())){s(),n.push("<hr>");continue}let p=/^>\s?(.*)$/.exec(c);if(p){s(),n.push(`<blockquote>${p[1]}</blockquote>`);continue}let m=/^[-*+]\s+(.*)$/.exec(c);if(m){o!=="ul"&&(s(),n.push("<ul>"),o="ul"),n.push(`<li>${m[1]}</li>`);continue}let f=/^\d+[.)]\s+(.*)$/.exec(c);if(f){o!=="ol"&&(s(),n.push("<ol>"),o="ol"),n.push(`<li>${f[1]}</li>`);continue}s(),n.push(`<p>${c}</p>`)}return s(),n.join(`
`)}function qr(t,e){return e==="html"?t:e==="markdown"?Be(t):/<[a-z][^>]*>/i.test(t)?t:Be(t)}async function le(t,e,r,a){let n=Date.now(),o=null;try{o=await F(t,a??e?.accountId??null)}catch{}let s=o?.name??null,i=te(String(e?.title||"\u672A\u547D\u540D\u6587\u7AE0"),64),c=te(String(e?.author||""),8),l=String(e?.content??"").length,d=0;try{if(!o)throw new Error("\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u516C\u4F17\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret\uFF0C\u6216\u914D\u7F6E WECHAT_APPID \u4E0E WECHAT_APPSECRET \u73AF\u5883\u53D8\u91CF");let p=e?.content;if(!p)throw new Error("\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09");p=qr(p,e.contentType);let m=new _(o.appid,o.appsecret),f=await m.localizeImages(p);p=f.html,d=f.localized??0;let x=await m.resolveCover(e.cover,p);if(!x)throw new Error("\u65E0\u6CD5\u751F\u6210\u5C01\u9762\uFF1A\u8BF7\u4F20\u5165 cover\uFF0C\u6216\u5728\u6B63\u6587\u4E2D\u81F3\u5C11\u5305\u542B\u4E00\u5F20\u56FE\u7247");let A=await m.addDraft({title:i,author:c,digest:te(String(e.digest||yt(p)),120),content:p,thumb_media_id:x,need_open_comment:e.needOpenComment===0?0:1,only_fans_can_comment:e.onlyFansCanComment?1:0,...e.contentSourceUrl?{content_source_url:e.contentSourceUrl}:{}});return await Pe(t,{media_id:A,title:i,author:c,status:"success",error:null,duration_ms:Date.now()-n,images:d,content_len:l,token_name:r,account_id:o.id||null,account_name:s}),h({media_id:A,title:i,images:f.localized,failed_images:f.failed,account:s})}catch(p){let m=String(p?.message??p);return await Pe(t,{media_id:null,title:i,author:c,status:"failed",error:m,duration_ms:Date.now()-n,images:d,content_len:l,token_name:r,account_id:o?.id||null,account_name:s}),u(m,500)}}var g=new W;g.get("/stats",async t=>{try{return h(await qt(t.env))}catch(e){return u(`\u7EDF\u8BA1\u67E5\u8BE2\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.get("/tokens",async t=>{try{let e=(await Lt(t.env)).map(r=>({...r,key:Fr(r.key)}));return h({tokens:e})}catch(e){return u(`\u4EE4\u724C\u67E5\u8BE2\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.get("/tokens/:id/key",async t=>{try{let e=await Bt(t.env,t.req.param("id"));return e?h({id:e.id,key:e.key}):u("\u4EE4\u724C\u4E0D\u5B58\u5728",404)}catch(e){return u(`\u8BFB\u53D6\u4EE4\u724C\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.post("/tokens",async t=>{try{let e=await t.req.json().catch(()=>({})),r=await Nt(t.env,String(e.name??""));return h({token:r})}catch(e){return u(`\u521B\u5EFA\u4EE4\u724C\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.patch("/tokens/:id",async t=>{try{let e=await t.req.json().catch(()=>({}));return await $t(t.env,t.req.param("id"),{...e.name!==void 0?{name:String(e.name)}:{},...e.enabled!==void 0?{enabled:e.enabled?1:0}:{}})?h({updated:!0}):u("\u4EE4\u724C\u4E0D\u5B58\u5728\u6216\u6CA1\u6709\u9700\u8981\u4FEE\u6539\u7684\u5B57\u6BB5",404)}catch(e){return u(`\u66F4\u65B0\u4EE4\u724C\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.delete("/tokens/:id",async t=>{try{return await Ht(t.env,t.req.param("id"))?h({deleted:!0}):u("\u4EE4\u724C\u4E0D\u5B58\u5728",404)}catch(e){return u(`\u5220\u9664\u4EE4\u724C\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.get("/records",async t=>{try{let e=Number(t.req.query("limit")??50)||50,r=Number(t.req.query("offset")??0)||0;return h({records:await jt(t.env,e,r)})}catch(e){return u(`\u8BB0\u5F55\u67E5\u8BE2\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.delete("/records/:id",async t=>{try{return await Wt(t.env,t.req.param("id"))?h({deleted:!0}):u("\u8BB0\u5F55\u4E0D\u5B58\u5728",404)}catch(e){return u(`\u5220\u9664\u8BB0\u5F55\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.delete("/records",async t=>{try{return await zt(t.env),h({cleared:!0})}catch(e){return u(`\u6E05\u7A7A\u8BB0\u5F55\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.get("/settings",async t=>{try{let e=await Ot(t.env),r=await q(t.env);return h({settings:e,using_default_password:await Yt(t.env),admin_user:await Le(t.env),accounts_count:r.length,accounts_default:r.find(a=>a.is_default)?.name??null,appid_configured:!!t.env.WECHAT_APPID,secret_configured:!!t.env.WECHAT_APPSECRET,appid_masked:tr(t.env.WECHAT_APPID),legacy_key_configured:!!t.env.DRAFT_API_KEY})}catch(e){return u(`\u8BBE\u7F6E\u8BFB\u53D6\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.put("/settings",async t=>{try{let e=await t.req.json().catch(()=>({})),r=["default_author","default_content_type","default_need_open_comment"],a=0;for(let n of r)e[n]!==void 0&&(await Ce(t.env,n,String(e[n])),a++);return a?h({updated:a}):u("\u6CA1\u6709\u53EF\u66F4\u65B0\u7684\u8BBE\u7F6E\u9879",400)}catch(e){return u(`\u8BBE\u7F6E\u4FDD\u5B58\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.put("/password",async t=>{try{let e=await t.req.json().catch(()=>({}));if(!await Oe(t.env,String(e.old??"")))return u("\u5F53\u524D\u5BC6\u7801\u9519\u8BEF",400);let r=String(e.new??"");return r.length<6?u("\u65B0\u5BC6\u7801\u81F3\u5C11 6 \u4F4D",400):(await Ce(t.env,"admin_password",r),h({updated:!0}))}catch(e){return u(`\u4FEE\u6539\u5BC6\u7801\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.get("/password",async t=>{let e=await ie(t.env);return h({using_default:e==="admin",length:e.length})});g.post("/try",async t=>{let e=null;try{e=await t.req.json()}catch{return u("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u5408\u6CD5 JSON",400)}return e?.content?le(t.env,e,"\u540E\u53F0\u8BD5\u7528",e?.accountId??null):u("\u6B63\u6587\uFF08content\uFF09\u4E0D\u80FD\u4E3A\u7A7A",400)});async function Me(t,e){let r=new _(t,e);return await r.getToken(!0),(await r.batchGetDrafts(0,1)).total_count??0}g.get("/accounts",async t=>{try{let e=await q(t.env);return h({accounts:e.map(r=>({id:r.id,name:r.name,appid:r.appid,secret_masked:tr(r.appsecret),enabled:r.enabled,is_default:r.is_default,created_at:r.created_at}))})}catch(e){return u(`\u516C\u4F17\u53F7\u5217\u8868\u8BFB\u53D6\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.post("/accounts",async t=>{try{let e=await t.req.json().catch(()=>({})),r=String(e.appid??"").trim(),a=String(e.appsecret??"").trim();if(!r)return u("AppID \u4E0D\u80FD\u4E3A\u7A7A",400);if(!a)return u("AppSecret \u4E0D\u80FD\u4E3A\u7A7A",400);if(r.length<10)return u("AppID \u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u5E94\u4E3A wx \u5F00\u5934\u7684 18 \u4F4D\u5B57\u7B26\uFF09",400);if(a.length<16)return u("AppSecret \u683C\u5F0F\u4E0D\u6B63\u786E\uFF08\u5E94\u4E3A 32 \u4F4D\u5B57\u7B26\uFF09",400);let n=(await q(t.env)).find(s=>s.appid===r);if(n)return u(`\u8BE5 AppID \u5DF2\u5B58\u5728\uFF08${n.name}\uFF09`,409);try{await Me(r,a)}catch(s){return u(`\u51ED\u636E\u6821\u9A8C\u672A\u901A\u8FC7\uFF1A${String(s?.message??s)}\uFF08\u8BF7\u6838\u5BF9 AppID/AppSecret\uFF0C\u5E76\u786E\u8BA4\u5DF2\u628A Cloudflare \u51FA\u53E3 IP \u52A0\u5165\u5FAE\u4FE1\u767D\u540D\u5355\uFF09`,400)}let o=await Ct(t.env,{name:e.name,appid:r,appsecret:a,is_default:e.is_default});return h({account:{id:o.id,name:o.name,appid:o.appid,is_default:o.is_default}})}catch(e){return u(`\u6DFB\u52A0\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.put("/accounts/:id",async t=>{try{let e=t.req.param("id"),r=await H(t.env,e);if(!r)return u("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404);let a=await t.req.json().catch(()=>({})),n=String(a.appid??"").trim()||r.appid,o=String(a.appsecret??"").trim()||r.appsecret;if(n!==r.appid||o!==r.appsecret){if(n!==r.appid){let i=(await q(t.env)).find(c=>c.appid===n&&c.id!==e);if(i)return u(`\u8BE5 AppID \u5DF2\u88AB\u300C${i.name}\u300D\u5360\u7528`,409)}try{await Me(n,o)}catch(i){return u(`\u51ED\u636E\u6821\u9A8C\u672A\u901A\u8FC7\uFF1A${String(i?.message??i)}`,400)}}return await Pt(t.env,e,{name:a.name,appid:a.appid,appsecret:a.appsecret,enabled:typeof a.enabled=="boolean"?a.enabled?1:0:a.enabled}),h({updated:!0})}catch(e){return u(`\u66F4\u65B0\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.delete("/accounts/:id",async t=>{try{return await It(t.env,t.req.param("id"))?h({deleted:!0}):u("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404)}catch(e){return u(`\u5220\u9664\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.post("/accounts/:id/default",async t=>{try{return await Dt(t.env,t.req.param("id"))?h({is_default:!0}):u("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404)}catch(e){return u(`\u8BBE\u7F6E\u9ED8\u8BA4\u516C\u4F17\u53F7\u5931\u8D25\uFF1A${String(e?.message??e)}`,500)}});g.post("/accounts/:id/test",async t=>{try{let e=await H(t.env,t.req.param("id"));if(!e)return u("\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404);let r=await Me(e.appid,e.appsecret);return h({account:e.name,appid:e.appid,draft_total:r,message:"\u51ED\u636E\u53EF\u7528\uFF0C\u53EF\u6B63\u5E38\u8BFB\u53D6\u8349\u7A3F\u7BB1"})}catch(e){return u(String(e?.message??e),400)}});g.get("/wx-drafts",async t=>{try{let e=t.req.query("account_id")||null;if(e&&!await H(t.env,e))return u("\u6307\u5B9A\u7684\u516C\u4F17\u53F7\u4E0D\u5B58\u5728",404);let r=await F(t.env,e);if(!r)throw new Error("\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u516C\u4F17\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret");let a=Number(t.req.query("offset")??0)||0,n=Math.min(Number(t.req.query("count")??20)||20,20),s=await new _(r.appid,r.appsecret).batchGetDrafts(a,n);return h({account:{id:r.id,name:r.name,appid:r.appid},total_count:s.total_count??0,item_count:s.item_count??0,item:s.item??[]})}catch(e){return u(String(e?.message??e),500)}});g.delete("/wx-drafts/:mediaId",async t=>{try{let e=await F(t.env,t.req.query("account_id")||null);if(!e)throw new Error("\u5C1A\u672A\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A\u8BF7\u5230\u540E\u53F0\u300C\u516C\u4F17\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret");return await new _(e.appid,e.appsecret).deleteDraft(t.req.param("mediaId")),h({media_id:t.req.param("mediaId"),account:e.name})}catch(e){return u(String(e?.message??e),500)}});function Fr(t){let e=String(t??"");return e.length<=12?`${e.slice(0,3)}${"*".repeat(Math.max(1,e.length-3))}`:`${e.slice(0,8)}${"*".repeat(8)}${e.slice(-4)}`}function tr(t){return t?t.length<=8?t.slice(0,2)+"***":`${t.slice(0,4)}****${t.slice(-4)}`:""}var rr=`
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

  function fmtTime(iso) {
    if (!iso) return '-';
    try {
      var d = new Date(iso);
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return iso; }
  }

  function copy(text) {
    function done() { toast('\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F', 'ok'); }
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

    var cfg = [];
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
        '<div class="row"><div><p class="muted">\u8FD8\u6CA1\u6709\u4EE4\u724C\uFF1F</p><a class="btn btn-s" href="#tokens">\u53BB\u4EE4\u724C\u7BA1\u7406</a></div>' +
        '<div><p class="muted">\u8FD8\u6CA1\u914D\u7F6E\u516C\u4F17\u53F7\uFF1F</p><a class="btn btn-s" href="#accounts">\u524D\u5F80\u516C\u4F17\u53F7\u7BA1\u7406</a></div>' +
        '<div><p class="muted">\u67E5\u770B\u63A5\u53E3\u6587\u6863\uFF1F</p><a class="btn btn-s" href="#docs">\u67E5\u770B\u63A5\u53E3\u6587\u6863</a></div></div></div>';
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
          '<button class="btn btn-s" data-act="copy-key" data-id="' + esc(t.id) + '">\u590D\u5236</button></div></td>' +
        '<td>' + (t.enabled ? '<span class="badge badge-ok">\u542F\u7528</span>' : '<span class="badge badge-mute">\u5DF2\u7981\u7528</span>') + '</td>' +
        '<td>' + esc(t.use_count) + '</td>' +
        '<td class="muted">' + fmtTime(t.last_used_at) + '</td>' +
        '<td class="muted">' + fmtTime(t.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s" data-act="toggle" data-id="' + esc(t.id) + '" data-enabled="' + (t.enabled ? '1' : '0') + '">' + (t.enabled ? '\u7981\u7528' : '\u542F\u7528') + '</button> ' +
          '<button class="btn btn-s btn-danger" data-act="del" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '">\u5220\u9664</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u4EE4\u724C\u7BA1\u7406</h1>' +
        '<div class="sp"><input class="input" id="new-token-name" placeholder="\u4EE4\u724C\u5907\u6CE8\u540D\uFF0C\u5982\uFF1A\u535A\u5BA2\u81EA\u52A8\u53D1\u5E03" style="width:240px">' +
        '<button class="btn btn-p" id="create-token">\u65B0\u5EFA\u4EE4\u724C</button></div></div>' +
      '<div class="notice info">\u4EE4\u724C\u7B49\u540C\u4E8E\u8BBF\u95EE\u5BC6\u7801\uFF1A\u4EFB\u4F55\u4EBA\u62FF\u5230\u5B83\u90FD\u80FD\u5411\u4F60\u7684\u8349\u7A3F\u7BB1\u63A8\u9001\u6587\u7AE0\u3002\u8BF7\u52FF\u5199\u5165\u524D\u7AEF\u4EE3\u7801\u6216\u516C\u5F00\u4ED3\u5E93\u3002</div>' +
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
        var d = await api('/admin/api/tokens', { method: 'POST', body: JSON.stringify({ name: input.value }) });
        toast('\u4EE4\u724C\u5DF2\u521B\u5EFA', 'ok');
        await go('tokens');
        alert('\u8BF7\u7ACB\u5373\u4FDD\u5B58\u4EE4\u724C\uFF08\u4EC5\u6B64\u4E00\u6B21\u5B8C\u6574\u5C55\u793A\uFF09\uFF1A\\n\\n' + d.token.key);
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });
  }

  // ==================== \u89C6\u56FE\u8DEF\u7531 ====================
  var views = { dashboard: dashboard, tokens: tokens, records: records, drafts: drafts, accounts: accounts, docs: docs, settings: settings };
  var binds = { tokens: bindTokens, records: bindRecords, drafts: bindDrafts, accounts: bindAccounts, settings: bindSettings };
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
      view.innerHTML = '<div class="notice warn">\u52A0\u8F7D\u5931\u8D25\uFF1A' + esc(e.message) + '</div>';
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
    } else if (act === 'del') {
      if (!confirm('\u786E\u8BA4\u5220\u9664\u4EE4\u724C\u300C' + el.getAttribute('data-name') + '\u300D\uFF1F\u4F7F\u7528\u8BE5\u4EE4\u724C\u7684\u8C03\u7528\u5C06\u7ACB\u5373\u5931\u6548\u3002')) return;
      api('/admin/api/tokens/' + el.getAttribute('data-id'), { method: 'DELETE' })
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
        ? '<div class="copy-key"><code>' + esc(String(r.media_id).slice(0, 16)) + '\u2026</code><button class="btn btn-s" data-act="copy" data-key="' + esc(r.media_id) + '">\u590D\u5236</button></div>'
        : '<span class="muted">-</span>';
      return '<tr><td>' + esc(r.title) + '</td>' +
        '<td>' + (r.status === 'success' ? '<span class="badge badge-ok">\u6210\u529F</span>' : '<span class="badge badge-fail">\u5931\u8D25</span>') + '</td>' +
        '<td>' + mid + '</td>' +
        '<td>' + esc(r.images) + '</td>' +
        '<td>' + esc((r.duration_ms / 1000).toFixed(2)) + 's</td>' +
        '<td class="muted">' + esc(r.token_name || '-') + '</td>' +
        '<td class="muted">' + fmtTime(r.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (r.error ? '<button class="btn btn-s" data-act="show-error" data-msg="' + esc(r.error) + '">\u9519\u8BEF</button> ' : '') +
          '<button class="btn btn-s btn-danger" data-act="del-rec" data-id="' + esc(r.id) + '">\u5220\u9664</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u63A8\u9001\u8BB0\u5F55</h1><div class="sp">' +
        '<button class="btn btn-s" id="refresh-records">\u5237\u65B0</button>' +
        '<button class="btn btn-s btn-danger" id="clear-records">\u6E05\u7A7A\u8BB0\u5F55</button></div></div>' +
      '<div class="notice info">\u8FD9\u91CC\u53EA\u8BB0\u5F55\u672C\u670D\u52A1\u7684\u8C03\u7528\u5386\u53F2\uFF08\u542B\u5931\u8D25\u539F\u56E0\u4E0E\u8017\u65F6\uFF09\uFF0C\u4E0E\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u4E92\u4E0D\u5F71\u54CD\u3002</div>' +
      '<div class="panel panel-flush">' +
        (d.records.length
          ? '<table class="tb"><thead><tr><th>\u6807\u9898</th><th>\u7ED3\u679C</th><th>\u8349\u7A3F ID</th><th>\u56FE\u7247</th><th>\u8017\u65F6</th><th>\u4EE4\u724C</th><th>\u65F6\u95F4</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">\u8FD8\u6CA1\u6709\u63A8\u9001\u8BB0\u5F55\uFF0C\u5148\u5230\u300C\u516C\u4F17\u53F7\u7BA1\u7406\u300D\u914D\u7F6E\u516C\u4F17\u53F7\uFF0C\u518D\u7B7E\u53D1\u4EE4\u724C\u63A8\u9001\u3002</div>') +
      '</div>';
  }

  function bindRecords() {
    var rf = document.getElementById('refresh-records');
    if (rf) rf.addEventListener('click', function () { go('records'); });
    var clr = document.getElementById('clear-records');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('\u6E05\u7A7A\u5168\u90E8\u63A8\u9001\u8BB0\u5F55\uFF1F\uFF08\u4E0D\u4F1A\u5220\u9664\u5FAE\u4FE1\u8349\u7A3F\u7BB1\u91CC\u7684\u8349\u7A3F\uFF09')) return;
      api('/admin/api/records', { method: 'DELETE' })
        .then(function () { toast('\u5DF2\u6E05\u7A7A', 'ok'); return go('records'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="show-error"]'), function (b) {
      b.addEventListener('click', function () { alert(b.getAttribute('data-msg')); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-rec"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u5220\u9664\u8FD9\u6761\u8BB0\u5F55\uFF1F')) return;
        api('/admin/api/records/' + b.getAttribute('data-id'), { method: 'DELETE' })
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('records'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u5FAE\u4FE1\u8349\u7A3F\u7BB1 ====================
  async function drafts() {
    var acc = await api('/admin/api/accounts');
    var list = acc.accounts || [];
    if (!list.length) {
      return '' +
        '<div class="admin-heading"><h1>\u8349\u7A3F\u7BB1</h1></div>' +
        '<div class="notice warn">\u8FD8\u6CA1\u6709\u6DFB\u52A0\u4EFB\u4F55\u516C\u4F17\u53F7\uFF0C\u8BF7\u5148\u5230\u300C\u516C\u4F17\u53F7\u7BA1\u7406\u300D\u6DFB\u52A0 AppID / AppSecret\uFF0C\u8349\u7A3F\u7BB1\u4F1A\u6309\u516C\u4F17\u53F7\u5206\u7C7B\u5C55\u793A\u3002</div>' +
        '<div class="panel"><a class="btn btn-p" href="#accounts">\u524D\u5F80\u516C\u4F17\u53F7\u7BA1\u7406</a></div>';
    }

    var settled = await Promise.all(list.map(function (a) {
      return api('/admin/api/wx-drafts?count=20&account_id=' + encodeURIComponent(a.id))
        .then(function (d) { return { a: a, d: d, err: null }; })
        .catch(function (e) { return { a: a, d: null, err: e.message }; });
    }));

    var blocks = settled.map(function (s) {
      var a = s.a;
      var head = '<div class="admin-heading"><h2 style="margin:0;font-size:18px">' + esc(a.name) +
        (a.is_default ? ' <span class="badge badge-ok">\u9ED8\u8BA4</span>' : '') +
        '</h2><div class="sp"><span class="muted">' + esc(a.appid) + '</span>' +
        (s.d ? '<span class="muted">\u5171 ' + esc(s.d.total_count) + ' \u7BC7</span>' : '') +
        '<button class="btn btn-s" data-act="drafts-refresh">\u5237\u65B0</button></div></div>';

      if (s.err) {
        return head + '<div class="notice warn">\u8BFB\u53D6\u5931\u8D25\uFF1A' + esc(s.err) + '</div>';
      }
      var items = s.d.item || [];
      var rows = items.map(function (it) {
        var c = it.content || {};
        var ni = (c.news_item && c.news_item[0]) || {};
        var time = c.update_time ? fmtTime(new Date(c.update_time * 1000).toISOString()) : '-';
        return '<tr><td>' + esc(ni.title || '(\u65E0\u6807\u9898)') + '</td>' +
          '<td class="muted">' + esc(ni.author || '-') + '</td>' +
          '<td class="muted">' + esc(time) + '</td>' +
          '<td><div class="copy-key"><code>' + esc(String(it.media_id).slice(0, 16)) + '\u2026</code>' +
            '<button class="btn btn-s" data-act="copy" data-key="' + esc(it.media_id) + '">\u590D\u5236</button></div></td>' +
          '<td><button class="btn btn-s btn-danger" data-act="del-wx" data-id="' + esc(it.media_id) + '" data-account="' + esc(a.id) + '">\u5220\u9664</button></td></tr>';
      }).join('');

      return head + (items.length
        ? '<div class="panel panel-flush"><table class="tb"><thead><tr><th>\u6807\u9898</th><th>\u4F5C\u8005</th><th>\u66F4\u65B0\u65F6\u95F4</th><th>\u8349\u7A3F ID</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="panel"><div class="empty-state">\u8BE5\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u662F\u7A7A\u7684\u3002</div></div>');
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u8349\u7A3F\u7BB1</h1><div class="sp"><button class="btn btn-s" id="refresh-drafts">\u5168\u90E8\u5237\u65B0</button></div></div>' +
      '<div class="notice warn">\u4E0B\u9762\u662F\u5404\u516C\u4F17\u53F7\u300C\u8349\u7A3F\u7BB1\u300D\u4E2D\u7684\u771F\u5B9E\u5185\u5BB9\uFF0C\u6309\u516C\u4F17\u53F7\u5206\u7C7B\u5C55\u793A\uFF1B\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\uFF0C\u8BF7\u8C28\u614E\u64CD\u4F5C\u3002</div>' +
      blocks;
  }

  function bindDrafts() {
    var rf = document.getElementById('refresh-drafts');
    if (rf) rf.addEventListener('click', function () { go('drafts'); });
    [].forEach.call(view.querySelectorAll('[data-act="drafts-refresh"]'), function (b) {
      b.addEventListener('click', function () { go('drafts'); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-wx"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u8FD9\u7BC7\u8349\u7A3F\uFF1F\u5FAE\u4FE1\u7AEF\u5220\u9664\u540E\u65E0\u6CD5\u6062\u590D\u3002')) return;
        var url = '/admin/api/wx-drafts/' + encodeURIComponent(b.getAttribute('data-id')) +
          '?account_id=' + encodeURIComponent(b.getAttribute('data-account') || '');
        api(url, { method: 'DELETE' })
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('drafts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u516C\u4F17\u53F7\u7BA1\u7406 ====================
  async function accounts() {
    var d = await api('/admin/api/accounts');
    var list = d.accounts || [];
    var rows = list.map(function (a) {
      return '<tr>' +
        '<td><strong>' + esc(a.name) + '</strong>' + (a.is_default ? ' <span class="badge badge-ok">\u9ED8\u8BA4</span>' : '') + '</td>' +
        '<td class="mono">' + esc(a.appid) + '</td>' +
        '<td class="mono muted">' + esc(a.secret_masked) + '</td>' +
        '<td>' + (a.enabled ? '<span class="badge badge-ok">\u542F\u7528</span>' : '<span class="badge badge-mute">\u5DF2\u505C\u7528</span>') + '</td>' +
        '<td class="muted">' + fmtTime(a.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s" data-act="acc-test" data-id="' + esc(a.id) + '">\u6D4B\u8BD5\u8FDE\u901A</button> ' +
          (a.is_default ? '' : '<button class="btn btn-s" data-act="acc-default" data-id="' + esc(a.id) + '">\u8BBE\u4E3A\u9ED8\u8BA4</button> ') +
          '<button class="btn btn-s" data-act="acc-edit" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" data-appid="' + esc(a.appid) + '">\u7F16\u8F91</button> ' +
          '<button class="btn btn-s btn-danger" data-act="acc-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '">\u5220\u9664</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>\u516C\u4F17\u53F7\u7BA1\u7406</h1><div class="sp">' +
        '<span class="muted">\u5DF2\u6DFB\u52A0 ' + list.length + ' \u4E2A</span>' +
        '<button class="btn btn-s" id="acc-refresh">\u5237\u65B0</button></div></div>' +
      '<div class="notice info">\u5728\u8FD9\u91CC\u6DFB\u52A0\u8981\u63A8\u9001\u7684\u516C\u4F17\u53F7\uFF1A\u586B\u5FAE\u4FE1\u540E\u53F0\u7684 <b>AppID</b> \u4E0E <b>AppSecret</b> \u5373\u53EF\u3002<b>\u63A8\u9001\u65F6\u672A\u6307\u5B9A\u516C\u4F17\u53F7\uFF0C\u5C31\u53D1\u5230\u6807\u300C\u9ED8\u8BA4\u300D\u7684\u90A3\u4E2A</b>\u3002\u8BB0\u5F97\u5148\u628A Cloudflare \u51FA\u53E3 IP \u52A0\u5165\u5FAE\u4FE1 IP \u767D\u540D\u5355\uFF0C\u5426\u5219\u4F1A\u62A5 invalid ip\u3002</div>' +
      '<div class="panel">' +
        '<div class="panel-head"><h3 id="acc-form-title">\u6DFB\u52A0\u516C\u4F17\u53F7</h3></div>' +
        '<div class="row">' +
          '<div class="field"><label>\u540D\u79F0\uFF08\u5907\u6CE8\uFF09</label><input class="input" id="acc-name" placeholder="\u4F8B\u5982\uFF1A\u4E3B\u53F7 / \u6D4B\u8BD5\u53F7"></div>' +
          '<div class="field"><label>AppID</label><input class="input" id="acc-appid" placeholder="wx \u5F00\u5934\u7684 18 \u4F4D\u5B57\u7B26" autocomplete="off"></div>' +
        '</div>' +
        '<div class="row">' +
          '<div class="field"><label>AppSecret' + '</label><input class="input" id="acc-secret" placeholder="32 \u4F4D\u5B57\u7B26\uFF0C\u4FDD\u5B58\u65F6\u4F1A\u5411\u5FAE\u4FE1\u6821\u9A8C" autocomplete="new-password"></div>' +
          '<div class="field"><label>\u9009\u9879</label><label class="muted" style="display:block;padding-top:10px"><input type="checkbox" id="acc-default"> \u8BBE\u4E3A\u9ED8\u8BA4\u516C\u4F17\u53F7</label></div>' +
        '</div>' +
        '<div class="sp">' +
          '<button class="btn btn-p" id="acc-save">\u6DFB\u52A0\u5E76\u6821\u9A8C</button>' +
          '<button class="btn btn-s" id="acc-cancel" style="display:none">\u53D6\u6D88\u7F16\u8F91</button>' +
        '</div>' +
        '<p class="muted" style="margin:12px 0 0">\u4FDD\u5B58\u65F6\u4F1A\u771F\u5B9E\u8C03\u7528\u5FAE\u4FE1\u63A5\u53E3\u6821\u9A8C\u51ED\u636E\u5E76\u8BFB\u53D6\u8349\u7A3F\u6570\uFF0C\u6821\u9A8C\u901A\u8FC7\u624D\u5199\u5165\u6570\u636E\u5E93\u3002</p>' +
      '</div>' +
      '<div class="panel panel-flush">' +
        (list.length
          ? '<table class="tb"><thead><tr><th>\u540D\u79F0</th><th>AppID</th><th>AppSecret</th><th>\u72B6\u6001</th><th>\u6DFB\u52A0\u65F6\u95F4</th><th>\u64CD\u4F5C</th></tr></thead><tbody>' + rows + '</tbody></table>'
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
      if (save) save.textContent = '\u6DFB\u52A0\u5E76\u6821\u9A8C';
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
      var old = save.textContent;
      save.textContent = '\u6B63\u5728\u5411\u5FAE\u4FE1\u6821\u9A8C\u2026';
      try {
        if (editing) {
          await api('/admin/api/accounts/' + encodeURIComponent(editing), { method: 'PUT', body: JSON.stringify(payload) });
          toast('\u5DF2\u4FDD\u5B58\u5E76\u6821\u9A8C\u901A\u8FC7', 'ok');
        } else {
          var r = await api('/admin/api/accounts', { method: 'POST', body: JSON.stringify(payload) });
          toast('\u5DF2\u6DFB\u52A0\u516C\u4F17\u53F7\uFF1A' + ((r.account && r.account.name) || ''), 'ok');
        }
        await go('accounts');
      } catch (e) {
        toast(e.message, 'err');
      } finally {
        save.disabled = false;
        save.textContent = old;
      }
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-test"]'), function (b) {
      b.addEventListener('click', async function () {
        b.disabled = true;
        var t = b.textContent;
        b.textContent = '\u6D4B\u8BD5\u4E2D\u2026';
        try {
          var r = await api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')) + '/test', { method: 'POST' });
          toast('\u51ED\u636E\u53EF\u7528\uFF0C\u8BE5\u516C\u4F17\u53F7\u8349\u7A3F\u7BB1\u5171 ' + r.draft_total + ' \u7BC7', 'ok');
        } catch (e) {
          toast(e.message, 'err');
        } finally {
          b.disabled = false;
          b.textContent = t;
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
        if (save) save.textContent = '\u4FDD\u5B58\u4FEE\u6539\u5E76\u6821\u9A8C';
        if (cancel) cancel.style.display = '';
        if (secret) secret.placeholder = '\u7559\u7A7A\u8868\u793A\u4E0D\u4FEE\u6539 AppSecret';
        if (name) name.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('\u786E\u5B9A\u5220\u9664\u516C\u4F17\u53F7\u300C' + b.getAttribute('data-name') + '\u300D\uFF1F\u5220\u9664\u540E\u9700\u91CD\u65B0\u6DFB\u52A0\u624D\u80FD\u63A8\u9001\u5230\u5B83\u3002')) return;
        api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' })
          .then(function () { toast('\u5DF2\u5220\u9664', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== \u63A5\u53E3\u6587\u6863 ====================
  function docs() {
    var curl = 'curl -X POST ' + BASE + '/api/draft \\\\n' +
      '  -H "X-API-Key: wxk_\u4F60\u7684\u4EE4\u724C" \\\\n' +
      '  -H "Content-Type: application/json" \\\\n' +
      '  -d \\'{"title":"\u6807\u9898","content":"<p>\u6B63\u6587</p>"}\\'';
    return '' +
      '<div class="admin-heading"><h1>\u63A5\u53E3\u6587\u6863</h1></div>' +
      '<div class="notice info">\u6240\u6709\u63A5\u53E3\u8FD4\u56DE\u7EDF\u4E00\u7ED3\u6784\uFF1A<code>{ ok: true, data: {...} }</code> \u6216 <code>{ ok: false, error: "..." }</code></div>' +
      '<div class="panel panel-flush"><table class="tb">' +
        '<thead><tr><th style="width:88px">\u65B9\u6CD5</th><th style="width:230px">\u8DEF\u5F84</th><th>\u8BF4\u660E</th></tr></thead><tbody>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td><td>\u65B0\u5EFA\u8349\u7A3F\uFF08title / content \u5FC5\u586B\uFF0C\u652F\u6301 contentType=markdown\uFF09</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td><td>\u8349\u7A3F\u5217\u8868\uFF08offset / count\uFF09</td></tr>' +
        '<tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td><td>\u5220\u9664\u8349\u7A3F</td></tr>' +
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
        '<pre class="code">' + esc(curl) + '</pre></div>';
  }

  // ==================== \u8BBE\u7F6E ====================
  async function settings() {
    var d = await api('/admin/api/settings');
    var s = d.settings || {};
    return '' +
      '<div class="admin-heading"><h1>\u8BBE\u7F6E</h1></div>' +
      (d.using_default_password
        ? '<div class="notice warn">\u5F53\u524D\u4ECD\u5728\u4F7F\u7528\u9ED8\u8BA4\u53E3\u4EE4\uFF0C\u5F3A\u70C8\u5EFA\u8BAE\u7ACB\u5373\u5728\u4E0B\u65B9\u300C\u4FEE\u6539\u540E\u53F0\u5BC6\u7801\u300D\u5904\u8BBE\u7F6E\u65B0\u5BC6\u7801\u3002</div>'
        : '') +
      '<div class="panel"><div class="panel-head"><h3>\u516C\u4F17\u53F7\u51ED\u636E</h3></div>' +
        '<table class="tb"><tbody>' +
        '<tr><td style="width:180px" class="muted">AppID</td><td>' + (d.appid_configured ? '<code>' + esc(d.appid_masked) + '</code>' : '<span class="badge badge-fail">\u672A\u914D\u7F6E</span>') + '</td></tr>' +
        '<tr><td class="muted">AppSecret</td><td>' + (d.secret_configured ? '<span class="badge badge-ok">\u5DF2\u914D\u7F6E\uFF08\u52A0\u5BC6\u5B58\u50A8\uFF09</span>' : '<span class="badge badge-fail">\u672A\u914D\u7F6E</span>') + '</td></tr>' +
        '<tr><td class="muted">\u65E7\u7248\u73AF\u5883\u53D8\u91CF\u5BC6\u94A5</td><td>' + (d.legacy_key_configured ? '<span class="badge badge-mute">DRAFT_API_KEY \u5DF2\u8BBE\u7F6E\uFF08\u517C\u5BB9\u4FDD\u7559\uFF09</span>' : '<span class="badge badge-mute">\u672A\u8BBE\u7F6E</span>') + '</td></tr>' +
        '</tbody></table>' +
        '<p class="muted" style="margin:14px 0 0">\u51ED\u636E\u7528\u4E8E\u670D\u52A1\u5668\u52A0\u5BC6\u53D8\u91CF\u5B58\u50A8\uFF0C\u51FA\u4E8E\u5B89\u5168\u8003\u8651\u4EC5\u53EF\u67E5\u770B\u914D\u7F6E\u72B6\u6001\uFF0C\u4E0D\u652F\u6301\u5728\u9875\u9762\u4E2D\u4FEE\u6539\u3002\u5982\u9700\u66F4\u6362\uFF0C\u8BF7\u5728 Cloudflare \u63A7\u5236\u53F0 \u2192 Workers \u2192 \u672C\u670D\u52A1 \u2192 \u8BBE\u7F6E \u2192 \u53D8\u91CF\u4E0E\u5BC6\u94A5 \u4E2D\u66F4\u65B0\u3002</p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u9ED8\u8BA4\u63A8\u9001\u53C2\u6570</h3></div>' +
        '<div class="field" style="max-width:340px"><label>\u9ED8\u8BA4\u4F5C\u8005</label>' +
        '<input class="input" id="set-author" value="' + esc(s.default_author || '') + '" placeholder="\u7559\u7A7A\u8868\u793A\u4E0D\u8BBE\u7F6E"></div>' +
        '<button class="btn btn-p" id="save-settings">\u4FDD\u5B58\u8BBE\u7F6E</button>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>\u4FEE\u6539\u540E\u53F0\u5BC6\u7801</h3></div>' +
        '<div class="row" style="max-width:640px">' +
          '<div class="field"><label>\u5F53\u524D\u5BC6\u7801</label><input class="input" id="pw-old" type="password"></div>' +
          '<div class="field"><label>\u65B0\u5BC6\u7801\uFF08\u22656 \u4F4D\uFF09</label><input class="input" id="pw-new" type="password"></div>' +
          '<div class="field"><label>\u786E\u8BA4\u65B0\u5BC6\u7801</label><input class="input" id="pw-new2" type="password"></div>' +
        '</div>' +
        '<button class="btn" id="save-password">\u66F4\u65B0\u5BC6\u7801</button>' +
      '</div>';
  }

  function bindSettings() {
    var ss = document.getElementById('save-settings');
    if (ss) ss.addEventListener('click', function () {
      api('/admin/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ default_author: document.getElementById('set-author').value }),
      }).then(function () { toast('\u8BBE\u7F6E\u5DF2\u4FDD\u5B58', 'ok'); }).catch(function (e) { toast(e.message, 'err'); });
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
`;var Xr="wx-draft-worker",Kr="2.0.0",v=new W;v.use("*",wt());v.use("*",gt({origin:"*"}));var ar=!1;v.use("*",async(t,e)=>{if(!ar&&t.env.DB)try{await Rt(t.env),ar=!0}catch(r){console.error("\u521D\u59CB\u5316\u5931\u8D25:",r)}await e()});var Ue=t=>{try{return new URL(t.req.url).origin}catch{return""}};v.get("/",t=>t.html(_t(Ue(t))));v.get("/admin/login",t=>{let e=t.req.query("error")==="1";return t.html(oe({error:e,baseUrl:Ue(t)}))});v.post("/admin/login",Vt);v.get("/admin/logout",$e);v.post("/admin/logout",$e);v.get("/admin/app.js",t=>t.body(rr,200,{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store"}));v.use("/admin/api/*",Ne);v.route("/admin/api",g);v.use("/admin",Ne);v.get("/admin",t=>t.html(At({baseUrl:Ue(t)})));v.get("/api/health",async t=>{let e=!1;try{await t.env.DB.prepare("SELECT 1 AS ok").first(),e=!0}catch{}return h({service:Xr,version:Kr,appid_configured:!!t.env.WECHAT_APPID,secret_configured:!!t.env.WECHAT_APPSECRET,auth_enabled:!!t.env.DRAFT_API_KEY,db_connected:e,time:new Date().toISOString()})});v.use("/api/*",Jt);v.post("/api/draft",async t=>{let e;try{e=await t.req.json()}catch{return u("\u8BF7\u6C42\u4F53\u5FC5\u987B\u662F\u5408\u6CD5 JSON",400)}if(!e?.content)return u("\u7F3A\u5C11 content\uFF08\u6B63\u6587\uFF09",400);let r=t.get("tokenName")??null;return le(t.env,e,r)});v.get("/api/drafts",async t=>{try{if(!t.env.WECHAT_APPID||!t.env.WECHAT_APPSECRET)throw new Error("\u670D\u52A1\u7AEF\u672A\u914D\u7F6E WECHAT_APPID / WECHAT_APPSECRET");let e=Number(t.req.query("offset")??0)||0,r=Math.min(Number(t.req.query("count")??20)||20,20),n=await new _(t.env.WECHAT_APPID,t.env.WECHAT_APPSECRET).batchGetDrafts(e,r);return h({total_count:n.total_count??0,item_count:n.item_count??0,item:n.item??[]})}catch(e){return u(String(e?.message??e),500)}});v.delete("/api/drafts/:mediaId",async t=>{try{if(!t.env.WECHAT_APPID||!t.env.WECHAT_APPSECRET)throw new Error("\u670D\u52A1\u7AEF\u672A\u914D\u7F6E WECHAT_APPID / WECHAT_APPSECRET");let e=t.req.param("mediaId");return await new _(t.env.WECHAT_APPID,t.env.WECHAT_APPSECRET).deleteDraft(e),h({media_id:e})}catch(e){return u(String(e?.message??e),500)}});function nr(t,e,r){return`<!DOCTYPE html><html lang="zh-CN"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t} \xB7 ${e} \xB7 \u8349\u7A3F\u63A8\u9001\u7F51\u5173</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&amp;family=Space+Grotesk:wght@500;600&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
<style>${ne}</style></head>
<body class="site-page"><main class="auth-shell" style="grid-template-columns:minmax(0,1fr)">
  <section class="auth-form-wrap" style="text-align:center;align-items:center;justify-content:center">
    <p class="eyebrow" style="justify-content:center"><span aria-hidden="true"></span>ERROR ${t}</p>
    <h1 style="font-size:clamp(2.5rem,8vw,4rem)">${t}</h1>
    <p style="max-width:48ch;margin-block:var(--space-sm) var(--space-lg);color:var(--color-muted)">${r}</p>
    <div class="sp" style="justify-content:center">
      <a class="btn btn-p" href="/"><i class="fas fa-house" aria-hidden="true"></i>\u8FD4\u56DE\u9996\u9875</a>
      <a class="btn btn-s" href="/admin"><i class="fas fa-sliders-h" aria-hidden="true"></i>\u7BA1\u7406\u63A7\u5236\u53F0</a>
    </div>
  </section>
</main></body></html>`}v.notFound(t=>t.req.path.startsWith("/api/")||t.req.path.startsWith("/admin/api/")?u("\u63A5\u53E3\u4E0D\u5B58\u5728",404):t.html(nr("404","\u9875\u9762\u4E0D\u5B58\u5728","\u4F60\u8BBF\u95EE\u7684\u5730\u5740\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u79FB\u52A8\uFF0C\u8BF7\u68C0\u67E5\u94FE\u63A5\u662F\u5426\u6B63\u786E\u3002"),404));v.onError((t,e)=>(console.error("\u672A\u6355\u83B7\u7684\u9519\u8BEF:",t),e.req.path.startsWith("/api/")||e.req.path.startsWith("/admin/api/")?u("\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF",500):e.html(nr("500","\u670D\u52A1\u5668\u5185\u90E8\u9519\u8BEF","\u670D\u52A1\u6682\u65F6\u51FA\u4E86\u70B9\u95EE\u9898\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\uFF1B\u82E5\u6301\u7EED\u51FA\u73B0\u8BF7\u68C0\u67E5 Worker \u65E5\u5FD7\u3002"),500)));var Eo=v;export{Eo as default};
