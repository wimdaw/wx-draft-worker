
/**
 * 后台前端脚本（作为独立 JS 返回 /admin/app.js）
 * 注意：本字符串会被原样交付浏览器，内部不使用模板字符串
 */
/**
 * 接口文档里的多图文 cURL 示例。
 * 在 TS 侧作为普通字符串生成，再用 JSON.stringify 注入到前端 JS，
 * 避免手工处理模板字符串的层层转义。$BASE 由前端运行时替换。
 */
const DOCS_MULTI_CURL = [
  'curl -X POST $BASE/api/draft \\',
  '  -H "X-API-Key: wxk_你的令牌" \\',
  '  -H "Content-Type: application/json" \\',
  '  -d \'{"author":"百晓文苑","articles":[',
  '        {"title":"头条标题","content":"<p>头条正文</p>","cover":"https://example.com/a.png"},',
  '        {"title":"次条标题","content":"<p>次条正文</p>","cover":"https://example.com/b.png"}',
  '      ]}\'',
].join('\n')

export const ADMIN_JS = `
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
    if (res.status === 401) { location.href = '/admin/login'; throw new Error('登录已过期'); }
    if (!res.ok || !data || data.ok === false) {
      throw new Error((data && data.error) || ('请求失败 HTTP ' + res.status));
    }
    return data.data === undefined ? data : data.data;
  }

  // 敏感操作：先输入登录密码，再以 X-Confirm-Password 头提交
  async function apiConfirm(path, opts, tip) {
    var pw = prompt('敏感操作需要验证密码' + (tip ? '（' + tip + '）' : '') + '：请输入你的登录密码');
    if (pw === null) throw new Error('已取消操作');
    if (!pw) throw new Error('未输入密码，操作已取消');
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

  // 与后端 mask() 保持一致：前 4 后 4，中间以 **** 代替
  function maskId(s) {
    s = String(s || '');
    if (!s) return '';
    if (s.length <= 8) return s.slice(0, 2) + '***';
    return s.slice(0, 4) + '****' + s.slice(-4);
  }

  function copy(text) {    function done() { toast('已复制到剪贴板', 'ok'); }
    function fallback() {
      // 非安全上下文 / 无剪贴板权限时的兜底方案
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
        okc ? done() : toast('复制失败，请手动选择', 'err');
      } catch (e) { toast('复制失败，请手动选择', 'err'); }
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }

  // ==================== 概览 ====================
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

    // 当前登录身份：与 AppID / AppSecret 徽章同款样式，放在最前面
    var me = window.__ME__ || { username: '', role: 'member' };
    var meLabel = (me.role === 'admin' ? '管理员' : '成员') + (me.username ? ' · ' + me.username : '');
    var cfg = [];
    cfg.push('<span class="badge ' + (me.role === 'admin' ? 'badge-ok' : 'badge-mute') + '">' + esc(meLabel) + '</span>');
    cfg.push(s.appid_configured ? '<span class="badge badge-ok">AppID 已配置</span>' : '<span class="badge badge-fail">AppID 未配置</span>');
    cfg.push(s.secret_configured ? '<span class="badge badge-ok">AppSecret 已配置</span>' : '<span class="badge badge-fail">AppSecret 未配置</span>');

    return '' +
      '<div class="admin-heading"><h1>概览</h1><div class="sp">' + cfg.join(' ') + '</div></div>' +
      '<div class="stat-grid">' +
        stat('累计推送', s.total, '次') +
        stat('成功', s.success, '次') +
        stat('失败', s.failed, '次') +
        stat('成功率', s.success_rate, '%') +
        stat('今日推送', s.today, '次') +
        stat('平均耗时', (s.avg_duration_ms / 1000).toFixed(2), '秒') +
        stat('令牌', s.tokens_enabled, '/' + s.tokens + ' 启用') +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>近 7 天推送量</h3></div>' +
        '<div class="bars">' + bars + '</div></div>' +
      '<div class="panel"><div class="panel-head"><h3>快速入口</h3></div>' +
        '<div class="row"><div><p class="muted">还没有令牌？</p><a class="btn btn-s" href="#tokens"><i class="fas fa-key" aria-hidden="true"></i> 去令牌管理</a></div>' +
        '<div><p class="muted">还没配置公众号？</p><a class="btn btn-s" href="#accounts"><i class="fas fa-layer-group" aria-hidden="true"></i> 前往账号管理</a></div>' +
        '<div><p class="muted">查看接口文档？</p><a class="btn btn-s" href="#docs"><i class="fas fa-book" aria-hidden="true"></i> 查看接口文档</a></div></div></div>';
  }

  function stat(k, v, unit) {
    return '<div class="stat"><div class="k">' + esc(k) + '</div><div class="v">' + esc(v) + (unit ? '<small>' + esc(unit) + '</small>' : '') + '</div></div>';
  }

  // ==================== 令牌管理 ====================
  async function tokens() {
    var d = await api('/admin/api/tokens');
    var rows = d.tokens.map(function (t) {
      return '<tr>' +
        '<td>' + esc(t.name) + '</td>' +
        '<td><div class="copy-key"><code class="mask-key" data-act="reveal" data-id="' + esc(t.id) + '" data-mask="' + esc(t.key) + '" data-vis="0" title="点击显示 / 隐藏完整令牌">' + esc(t.key) + '</code>' +
          '<button class="btn btn-s btn-icon" data-act="copy-key" data-id="' + esc(t.id) + '" title="复制令牌" aria-label="复制令牌"><i class="fas fa-copy" aria-hidden="true"></i></button></div></td>' +
        '<td>' + (t.enabled ? '<span class="badge badge-ok">启用</span>' : '<span class="badge badge-mute">已禁用</span>') + '</td>' +
        '<td>' + esc(t.use_count) + '</td>' +
        '<td class="muted">' + fmtTime(t.last_used_at) + '</td>' +
        '<td class="muted">' + fmtTime(t.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s btn-icon" data-act="rotate" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '" title="刷新令牌（生成新密钥）" aria-label="刷新令牌"><i class="fas fa-rotate" aria-hidden="true"></i></button> ' +
          '<button class="btn btn-s btn-icon" data-act="toggle" data-id="' + esc(t.id) + '" data-enabled="' + (t.enabled ? '1' : '0') + '" title="' + (t.enabled ? '禁用' : '启用') + '">' + '<i class="fas ' + (t.enabled ? 'fa-ban' : 'fa-circle-check') + '" aria-hidden="true"></i>' + '</button> ' +
          '<button class="btn btn-s btn-icon btn-danger" data-act="del" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '" title="删除令牌" aria-label="删除令牌"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>令牌管理</h1>' +
        '<div class="sp"><input class="input input-sm" id="new-token-name" placeholder="令牌备注名，如：博客自动发布" style="width:240px">' +
        '<button class="btn btn-p" id="create-token"><i class="fas fa-plus" aria-hidden="true"></i> 新建令牌</button></div></div>' +
      '<div class="notice info"><p>令牌等同于访问密码：任何人拿到它都能向你的草稿箱推送文章。请勿写入前端代码或公开仓库。行内「刷新」可重新生成密钥，旧密钥立即失效。</p></div>' +
      '<div class="panel panel-flush">' +
        (d.tokens.length
          ? '<table class="tb"><thead><tr><th>备注名</th><th>令牌</th><th>状态</th><th>调用次数</th><th>最近使用</th><th>创建时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">暂无令牌，点击右上角「新建令牌」创建第一把。</div>') +
      '</div>';
  }

  function bindTokens() {
    var btn = document.getElementById('create-token');
    if (btn) btn.addEventListener('click', async function () {
      var input = document.getElementById('new-token-name');
      btn.disabled = true;
      try {
        var d = await apiConfirm('/admin/api/tokens', { method: 'POST', body: JSON.stringify({ name: input.value }) }, '新建令牌');
        toast('令牌已创建', 'ok');
        await go('tokens');
        alert('请立即保存令牌（仅此一次完整展示）：\\n\\n' + d.token.key);
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });
  }

  // ==================== 视图路由 ====================
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
    view.innerHTML = '<div class="empty-state">加载中…</div>';
    try {
      view.innerHTML = await views[name]();
      if (binds[name]) binds[name]();
    } catch (e) {
      view.innerHTML = '<div class="notice warn"><p>加载失败：' + esc(e.message) + '</p></div>';
    }
  }
  window.__go = go;

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest ? ev.target.closest('[data-act]') : null;
    if (!el) return;
    var act = el.getAttribute('data-act');
    if (act === 'copy') { copy(el.getAttribute('data-key')); }
    else if (act === 'copy-key') {
      // 列表里只有掩码，复制时再向后端取一次完整令牌
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
      }).then(function () { toast('已更新', 'ok'); return go('tokens'); })
        .catch(function (e) { toast(e.message, 'err'); });
    } else if (act === 'rotate') {
      if (!confirm('刷新令牌「' + el.getAttribute('data-name') + '」？将生成新密钥，旧密钥立即失效。')) return;
      apiConfirm('/admin/api/tokens/' + encodeURIComponent(el.getAttribute('data-id')) + '/rotate', { method: 'POST' }, '刷新令牌')
        .then(function (d) {
          alert('新令牌（仅此一次完整展示）：\\n\\n' + d.key);
          toast('已生成新密钥', 'ok');
          return go('tokens');
        })
        .catch(function (e) { toast(e.message, 'err'); });
    } else if (act === 'del') {
      if (!confirm('确认删除令牌「' + el.getAttribute('data-name') + '」？使用该令牌的调用将立即失效。')) return;
      apiConfirm('/admin/api/tokens/' + el.getAttribute('data-id'), { method: 'DELETE' }, '删除令牌')
        .then(function () { toast('已删除', 'ok'); return go('tokens'); })
        .catch(function (e) { toast(e.message, 'err'); });
    }
  });

  document.addEventListener('click', function (ev) {
    var a = ev.target.closest ? ev.target.closest('.admin-nav__link[data-view]') : null;
    if (a) { ev.preventDefault(); go(a.getAttribute('data-view')); }
  });

  // ==================== 推送记录 ====================
  async function records() {
    var d = await api('/admin/api/records?limit=100');
    var rows = d.records.map(function (r) {
      var mid = r.media_id
        ? '<div class="copy-key"><code>' + esc(String(r.media_id).slice(0, 16)) + '…</code><button class="btn btn-s btn-icon" data-act="copy" data-key="' + esc(r.media_id) + '" title="复制草稿 ID" aria-label="复制草稿 ID"><i class="fas fa-copy" aria-hidden="true"></i></button></div>'
        : '<span class="muted">-</span>';
      return '<tr><td><span class="cell-clip" title="' + esc(r.title) + '">' + esc(r.title) + '</span></td>' +
        '<td>' + (r.status === 'success' ? '<span class="badge badge-ok">成功</span>' : '<span class="badge badge-fail">失败</span>') + '</td>' +
        '<td>' + mid + '</td>' +
        '<td>' + esc(r.images) + '</td>' +
        '<td>' + esc(r.article_count || 1) + '</td>' +
        '<td>' + esc((r.duration_ms / 1000).toFixed(2)) + 's</td>' +
        '<td class="muted">' + esc(r.token_name || '-') + '</td>' +
        '<td class="muted">' + fmtTime(r.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (r.error ? '<button class="btn btn-s btn-icon" data-act="show-error" data-msg="' + esc(r.error) + '" title="查看错误" aria-label="查看错误"><i class="fas fa-circle-exclamation" aria-hidden="true"></i></button> ' : '') +
          '<button class="btn btn-s btn-icon btn-danger" data-act="del-rec" data-id="' + esc(r.id) + '" title="删除记录" aria-label="删除记录"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>推送记录</h1><div class="sp">' +
        '<a class="btn btn-s" id="export-records" href="/admin/api/records/export"><i class="fas fa-file-csv" aria-hidden="true"></i> 导出 CSV</a>' +
        '<button class="btn btn-s" id="refresh-records"><i class="fas fa-rotate" aria-hidden="true"></i> 刷新</button>' +
        '<button class="btn btn-s btn-danger" id="clear-records"><i class="fas fa-trash-can" aria-hidden="true"></i> 清空记录</button></div></div>' +
      '<div class="notice info"><p>这里只记录本服务的调用历史（含失败原因与耗时），与微信草稿箱互不影响。</p></div>' +
      '<div class="panel panel-flush">' +
        (d.records.length
          ? '<table class="tb"><thead><tr><th>标题</th><th>结果</th><th>草稿 ID</th><th>图片</th><th>篇数</th><th>耗时</th><th>令牌</th><th>时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">还没有推送记录，先到「账号管理」配置公众号，再签发令牌推送。</div>') +
      '</div>';
  }

  function bindRecords() {
    var rf = document.getElementById('refresh-records');
    if (rf) rf.addEventListener('click', function () { go('records'); });
    var clr = document.getElementById('clear-records');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('清空全部推送记录？（不会删除微信草稿箱里的草稿）')) return;
      apiConfirm('/admin/api/records', { method: 'DELETE' }, '清空记录')
        .then(function () { toast('已清空', 'ok'); return go('records'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="show-error"]'), function (b) {
      b.addEventListener('click', function () { alert(b.getAttribute('data-msg')); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-rec"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('删除这条记录？')) return;
        apiConfirm('/admin/api/records/' + b.getAttribute('data-id'), { method: 'DELETE' }, '删除记录')
          .then(function () { toast('已删除', 'ok'); return go('records'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 微信草稿箱 ====================
  // 每个公众号独立的分页 / 搜索状态，跨渲染保留
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
        '<div class="admin-heading"><h1>草稿箱</h1></div>' +
        '<div class="notice warn"><p>还没有添加任何公众号，请先到「账号管理」添加 AppID / AppSecret，草稿箱会按公众号分类展示。</p></div>' +
        '<div class="panel"><a class="btn btn-p" href="#accounts"><i class="fas fa-layer-group" aria-hidden="true"></i> 前往账号管理</a></div>';
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

      var search = '<input class="input input-sm" id="drafts-q-' + esc(a.id) + '" data-account="' + esc(a.id) + '" placeholder="按标题 / 作者搜索（回车）" value="' + esc(st.q) + '" style="width:190px">' +
        '<button class="btn btn-s btn-icon" data-act="drafts-search" data-account="' + esc(a.id) + '" title="搜索" aria-label="搜索"><i class="fas fa-magnifying-glass" aria-hidden="true"></i></button>' +
        (st.q ? '<button class="btn btn-s btn-icon" data-act="drafts-clear" data-account="' + esc(a.id) + '" title="清除搜索" aria-label="清除搜索"><i class="fas fa-xmark" aria-hidden="true"></i></button>' : '');

      var head = '<div class="admin-heading"><h2 style="margin:0;font-size:18px">' + esc(a.name) +
        (a.is_default ? ' <span class="badge badge-ok">默认</span>' : '') +
        '</h2><div class="sp"><span class="muted">' + esc(maskId(a.appid)) + '</span>' + search +
        '<button class="btn btn-s btn-icon" data-act="drafts-refresh" data-account="' + esc(a.id) + '" title="刷新" aria-label="刷新"><i class="fas fa-rotate" aria-hidden="true"></i></button></div></div>';

      // 分页条：贴在表格底部
      var foot = st.q
        ? '<div class="table-foot"><span class="muted">匹配 ' + shown + ' 篇' + (s.d && s.d.scanned ? '（扫描 ' + s.d.scanned + ' / ' + total + '）' : '') + '</span></div>'
        : '<div class="table-foot"><span class="muted">' + (total ? '第 ' + (offset + 1) + '–' + (offset + shown) + ' 篇 / 共 ' + total + ' 篇' : '共 0 篇') + '</span><div class="sp">' +
          '<button class="btn btn-s btn-icon" data-act="drafts-prev" data-account="' + esc(a.id) + '"' + (offset <= 0 ? ' disabled' : '') + ' title="上一页" aria-label="上一页"><i class="fas fa-angle-left" aria-hidden="true"></i></button>' +
          '<button class="btn btn-s btn-icon" data-act="drafts-next" data-account="' + esc(a.id) + '"' + (offset + 20 >= total ? ' disabled' : '') + ' title="下一页" aria-label="下一页"><i class="fas fa-angle-right" aria-hidden="true"></i></button>' +
          '</div></div>';

      if (s.err) {
        return head + '<div class="notice warn"><p>读取失败：' + esc(s.err) + '</p></div>';
      }
      var items = s.d.item || [];
      var rows = items.map(function (it) {
        var c = it.content || {};
        var ni = (c.news_item && c.news_item[0]) || {};
        var time = c.update_time ? fmtTime(new Date(c.update_time * 1000).toISOString()) : '-';
        return '<tr><td><span class="cell-clip" title="' + esc(ni.title || '') + '">' + esc(ni.title || '(无标题)') + '</span></td>' +
          '<td class="muted">' + esc(ni.author || '-') + '</td>' +
          '<td class="muted">' + esc(time) + '</td>' +
          '<td><div class="copy-key"><code>' + esc(String(it.media_id).slice(0, 16)) + '…</code>' +
            '<button class="btn btn-s btn-icon" data-act="copy" data-key="' + esc(it.media_id) + '" title="复制草稿 ID" aria-label="复制草稿 ID"><i class="fas fa-copy" aria-hidden="true"></i></button></div></td>' +
          '<td><button class="btn btn-s btn-icon btn-danger" data-act="del-wx" data-id="' + esc(it.media_id) + '" data-account="' + esc(a.id) + '" title="删除草稿" aria-label="删除草稿"><i class="fas fa-trash-can" aria-hidden="true"></i></button></td></tr>';
      }).join('');

      return head + (items.length
        ? '<div class="panel panel-flush"><table class="tb"><thead><tr><th>标题</th><th>作者</th><th>更新时间</th><th>草稿 ID</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>' + foot + '</div>'
        : '<div class="panel"><div class="empty-state">' + (st.q ? '没有匹配的草稿。' : '该公众号草稿箱是空的。') + '</div></div>');
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>草稿箱</h1><div class="sp"><button class="btn btn-s" id="refresh-drafts"><i class="fas fa-rotate" aria-hidden="true"></i> 全部刷新</button></div></div>' +
      '<div class="notice warn"><p>下面是各公众号「草稿箱」中的真实内容，按公众号分类展示；删除后无法恢复，请谨慎操作。</p></div>' +
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
        if (!confirm('确定删除这篇草稿？微信端删除后无法恢复。')) return;
        var url = '/admin/api/wx-drafts/' + encodeURIComponent(b.getAttribute('data-id')) +
          '?account_id=' + encodeURIComponent(b.getAttribute('data-account') || '');
        apiConfirm(url, { method: 'DELETE' }, '删除草稿')
          .then(function () { toast('已删除', 'ok'); return go('drafts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 账号管理 ====================
  async function accounts() {
    var d = await api('/admin/api/accounts');
    var list = d.accounts || [];
    var rows = list.map(function (a) {
      return '<tr>' +
        '<td><strong>' + esc(a.name) + '</strong>' + (a.is_default ? ' <span class="badge badge-ok">默认</span>' : '') + '</td>' +
        '<td class="mono muted">' + esc(maskId(a.appid)) + '</td>' +
        '<td class="mono muted">' + esc(a.secret_masked) + '</td>' +
        '<td>' + (a.enabled ? '<span class="badge badge-ok">启用</span>' : '<span class="badge badge-mute">已停用</span>') + '</td>' +
        '<td class="muted">' + fmtTime(a.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s btn-icon" data-act="acc-test" data-id="' + esc(a.id) + '" title="测试连通" aria-label="测试连通"><i class="fas fa-plug-circle-check" aria-hidden="true"></i></button> ' +
          (a.is_default ? '' : '<button class="btn btn-s btn-icon" data-act="acc-default" data-id="' + esc(a.id) + '" title="设为默认" aria-label="设为默认"><i class="fas fa-star" aria-hidden="true"></i></button> ') +
          '<button class="btn btn-s btn-icon" data-act="acc-edit" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" data-appid="' + esc(a.appid) + '" title="编辑" aria-label="编辑"><i class="fas fa-pen" aria-hidden="true"></i></button> ' +
          '<button class="btn btn-s btn-icon btn-danger" data-act="acc-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" title="删除" aria-label="删除"><i class="fas fa-trash-can" aria-hidden="true"></i></button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>账号管理</h1><div class="sp">' +
        '<span class="muted">已添加 ' + list.length + ' 个</span>' +
        '<button class="btn btn-s" id="acc-refresh"><i class="fas fa-rotate" aria-hidden="true"></i> 刷新</button></div></div>' +
      '<div class="notice info"><p>在这里添加要推送的公众号：填微信后台的 <b>AppID</b> 与 <b>AppSecret</b> 即可，<b>公众号名称会自动读出来</b>，不用手填。<b>推送时未指定公众号，就发到标「默认」的那个</b>。记得先把 Cloudflare 出口 IP 加入微信 IP 白名单，否则会报 invalid ip。</p></div>' +
      '<div class="panel">' +
        '<div class="panel-head"><h3 id="acc-form-title">添加公众号</h3></div>' +
        '<div class="row">' +
          '<div class="field"><label>AppID</label><input class="input" id="acc-appid" placeholder="wx 开头的 18 位字符" autocomplete="off"></div>' +
          '<div class="field"><label>AppSecret</label><input class="input" id="acc-secret" placeholder="32 位字符，保存时会向微信校验" autocomplete="new-password"></div>' +
        '</div>' +
        '<div class="row">' +
          '<div class="field"><label>名称（可选）</label><input class="input" id="acc-name" placeholder="留空则自动读取公众号昵称"></div>' +
          '<div class="field"><label>选项</label><label class="check-inline"><input type="checkbox" id="acc-default"><span>设为默认公众号（推送未指定时使用）</span></label></div>' +
        '</div>' +
        '<div class="sp">' +
          '<button class="btn btn-p" id="acc-save"><i class="fas fa-circle-plus" aria-hidden="true"></i> <span id="acc-save-label">添加并校验</span></button>' +
          '<button class="btn btn-s" id="acc-cancel" style="display:none"><i class="fas fa-xmark" aria-hidden="true"></i> 取消编辑</button>' +
        '</div>' +
        '<p class="form-hint"><i class="fas fa-circle-info" aria-hidden="true"></i><span>保存时会自动校验凭据、读取草稿数并识别公众号昵称；未认证号可能读取失败，可在「编辑」中手动填名称。</span></p>' +
      '</div>' +
      '<div class="panel panel-flush">' +
        (list.length
          ? '<table class="tb"><thead><tr><th>公众号名称</th><th>AppID</th><th>AppSecret</th><th>状态</th><th>添加时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">还没有公众号，请在上方添加第一个。</div>') +
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
      if (title) title.textContent = '添加公众号';
      if (saveLabel) saveLabel.textContent = '添加并校验';
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
      if (!payload.appid) { toast('请填写 AppID', 'err'); return; }
      if (!editing && !payload.appsecret) { toast('请填写 AppSecret', 'err'); return; }
      save.disabled = true;
      var old = saveLabel ? saveLabel.textContent : '';
      if (saveLabel) saveLabel.textContent = '正在向微信校验…';
      try {
        if (editing) {
          await apiConfirm('/admin/api/accounts/' + encodeURIComponent(editing), { method: 'PUT', body: JSON.stringify(payload) }, '编辑账号');
          toast('已保存并校验通过', 'ok');
        } else {
          var r = await apiConfirm('/admin/api/accounts', { method: 'POST', body: JSON.stringify(payload) }, '添加账号');
          toast('已添加公众号：' + ((r.account && r.account.name) || ''), 'ok');
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
          toast('凭据可用，该公众号草稿箱共 ' + r.draft_total + ' 篇', 'ok');
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
          .then(function () { toast('已设为默认公众号', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-edit"]'), function (b) {
      b.addEventListener('click', function () {
        editing = b.getAttribute('data-id');
        if (title) title.textContent = '编辑公众号：' + b.getAttribute('data-name');
        if (name) name.value = b.getAttribute('data-name') || '';
        if (appid) appid.value = b.getAttribute('data-appid') || '';
        if (secret) secret.value = '';
        if (def) def.checked = false;
        if (saveLabel) saveLabel.textContent = '保存修改并校验';
        if (cancel) cancel.style.display = '';
        if (secret) secret.placeholder = '留空表示不修改 AppSecret';
        if (name) name.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('确定删除公众号「' + b.getAttribute('data-name') + '」？删除后需重新添加才能推送到它。')) return;
        apiConfirm('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' }, '删除账号')
          .then(function () { toast('已删除', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 用户管理 ====================
  async function users() {
    var d = await api('/admin/api/users');
    var rows = d.users.map(function (u) {
      var self = u.is_self;
      return '<tr>' +
        '<td><strong>' + esc(u.username) + '</strong>' + (self ? ' <span class="badge badge-ok">当前</span>' : '') + '</td>' +
        '<td>' + (u.role === 'admin' ? '<span class="badge badge-ok">管理员</span>' : '<span class="badge badge-mute">成员</span>') + '</td>' +
        '<td>' + (u.enabled ? '<span class="badge badge-ok">启用</span>' : '<span class="badge badge-fail">已停用</span>') + '</td>' +
        '<td class="muted">' + fmtTime(u.created_at) + '</td>' +
        '<td class="muted">' + fmtTime(u.last_login_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (self
            ? '<span class="muted">—</span>'
            : '<button class="btn btn-s btn-icon" data-act="u-toggle" data-id="' + esc(u.id) + '" data-enabled="' + (u.enabled ? '1' : '0') + '" title="' + (u.enabled ? '停用' : '启用') + '">' + '<i class="fas ' + (u.enabled ? 'fa-ban' : 'fa-circle-check') + '" aria-hidden="true"></i>' + '</button> ' +
              '<button class="btn btn-s btn-icon" data-act="u-role" data-id="' + esc(u.id) + '" data-role="' + esc(u.role) + '" title="' + (u.role === 'admin' ? '降为成员' : '设为管理员') + '">' + '<i class="fas ' + (u.role === 'admin' ? 'fa-user-minus' : 'fa-user-shield') + '" aria-hidden="true"></i>' + '</button> ' +
              '<button class="btn btn-s btn-icon" data-act="u-pw" data-id="' + esc(u.id) + '" data-name="' + esc(u.username) + '" title="重置密码" aria-label="重置密码"><i class="fas fa-key" aria-hidden="true"></i></button> ' +
              '<button class="btn btn-s btn-icon btn-danger" data-act="u-del" data-id="' + esc(u.id) + '" data-name="' + esc(u.username) + '" title="删除用户" aria-label="删除用户"><i class="fas fa-trash-can" aria-hidden="true"></i></button>') +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>用户管理</h1></div>' +
      '<div class="notice info"><p>管理员可管理全部令牌 / 公众号 / 记录；成员登录后<b>只能看到并管理自己名下</b>的令牌、公众号与推送记录。删除用户时，其名下资源会自动转交给操作者。</p></div>' +
      '<div class="panel"><div class="panel-head"><h3>新建用户</h3></div>' +
        '<div class="row">' +
          '<div class="field"><label>用户名</label><input class="input" id="u-name" placeholder="3-32 位字母 / 数字 / _ . -" autocomplete="off"></div>' +
          '<div class="field"><label>初始密码（≥6 位）</label><input class="input" id="u-pw" type="password" autocomplete="new-password"></div>' +
          '<div class="field"><label>角色</label><select class="input" id="u-role"><option value="member">成员</option><option value="admin">管理员</option></select></div>' +
        '</div>' +
        '<div class="sp"><button class="btn btn-p" id="u-create"><i class="fas fa-user-plus" aria-hidden="true"></i> 创建用户</button></div>' +
      '</div>' +
      '<div class="panel panel-flush">' +
        (d.users.length
          ? '<table class="tb"><thead><tr><th>用户名</th><th>角色</th><th>状态</th><th>创建时间</th><th>最近登录</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">暂无用户。</div>') +
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
        }, '创建用户');
        toast('用户已创建', 'ok');
        await go('users');
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-toggle"]'), function (b) {
      b.addEventListener('click', function () {
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), {
          method: 'PATCH', body: JSON.stringify({ enabled: b.getAttribute('data-enabled') !== '1' }),
        }, '启用 / 停用用户').then(function () { toast('已更新', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-role"]'), function (b) {
      b.addEventListener('click', function () {
        var next = b.getAttribute('data-role') === 'admin' ? 'member' : 'admin';
        if (!confirm('将该用户角色改为「' + (next === 'admin' ? '管理员' : '成员') + '」？')) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), {
          method: 'PATCH', body: JSON.stringify({ role: next }),
        }, '变更用户角色').then(function () { toast('已更新', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-pw"]'), function (b) {
      b.addEventListener('click', function () {
        var np = prompt('为「' + b.getAttribute('data-name') + '」设置新密码（至少 6 位）：');
        if (np === null) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')) + '/password', {
          method: 'PUT', body: JSON.stringify({ password: np }),
        }, '重置用户密码').then(function () { toast('密码已重置，该用户需重新登录', 'ok'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="u-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('确认删除用户「' + b.getAttribute('data-name') + '」？其名下令牌 / 公众号 / 记录将转交给你。')) return;
        apiConfirm('/admin/api/users/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' }, '删除用户')
          .then(function () { toast('已删除', 'ok'); return go('users'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 操作日志 ====================
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
      '<div class="admin-heading"><h1>操作日志</h1><div class="sp">' +
        '<button class="btn btn-s" id="refresh-audit"><i class="fas fa-rotate" aria-hidden="true"></i> 刷新</button>' +
        '<button class="btn btn-s btn-danger" id="clear-audit"><i class="fas fa-trash-can" aria-hidden="true"></i> 清空日志</button></div></div>' +
      '<div class="notice info"><p>记录登录、令牌 / 公众号 / 用户的变更、记录清空等敏感操作，便于追溯。默认显示最近 100 条。</p></div>' +
      '<div class="panel panel-flush">' +
        (rows
          ? '<table class="tb"><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象</th><th>对象 ID</th><th>详情</th><th>IP</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">暂无操作日志。</div>') +
      '</div>';
  }

  function bindAudit() {
    var rf = document.getElementById('refresh-audit');
    if (rf) rf.addEventListener('click', function () { go('audit'); });
    var clr = document.getElementById('clear-audit');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('清空全部操作日志？')) return;
      apiConfirm('/admin/api/audit', { method: 'DELETE' }, '清空日志')
        .then(function () { toast('已清空', 'ok'); return go('audit'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
  }

  // ==================== 接口文档 ====================
  function docs() {
    var curl = 'curl -X POST ' + BASE + '/api/draft \\\\n' +
      '  -H "X-API-Key: wxk_你的令牌" \\\\n' +
      '  -H "Content-Type: application/json" \\\\n' +
      '  -d \\'{"title":"标题","content":"<p>正文</p>"}\\'';
    var multi = ${JSON.stringify(DOCS_MULTI_CURL)}.split('$BASE').join(BASE);
    return '' +
      '<div class="admin-heading"><h1>接口文档</h1></div>' +
      '<div class="notice info"><p>所有接口返回统一结构：<code>{ ok: true, data: {...} }</code> 或 <code>{ ok: false, error: "..." }</code></p></div>' +
      '<div class="panel panel-flush"><table class="tb">' +
        '<thead><tr><th style="width:88px">方法</th><th style="width:230px">路径</th><th>说明</th></tr></thead><tbody>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td><td>新建草稿（title / content 必填，支持 contentType=markdown；传 <code>articles[]</code> 可一次发多图文，最多 8 篇）</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td><td>草稿列表（offset / count，count ≤ 20）</td></tr>' +
        '<tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td><td>删除草稿</td></tr>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/material</code></td><td>上传图片为永久素材（传 <code>url</code> 或 <code>dataUri</code>）→ 返回 <code>media_id</code> 与微信域名 <code>url</code>，可在正文 / 封面中复用</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/health</code></td><td>健康检查（公开）</td></tr>' +
        '</tbody></table></div>' +
      '<div class="panel"><div class="panel-head"><h3>鉴权方式</h3></div>' +
        '<p class="muted">以下三种任选其一：</p>' +
        '<pre class="mono-out">X-API-Key: wxk_xxxxxxxx' + '\\n' + 'Authorization: Bearer wxk_xxxxxxxx' + '\\n' + '?key=wxk_xxxxxxxx</pre>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>⚠️ 使用前必做：公众号 IP 白名单</h3></div>' +
        '<p class="muted">Worker 每次调用的出口 IP 都可能不同，没加白名单时微信会直接拒绝：<code>40164 invalid ip … not in whitelist</code>。</p>' +
        '<p>到「公众号后台 → 设置与开发 → 基本配置（或安全中心）→ IP 白名单」，把下面 <b>全部 15 个 IPv4 段</b>每行一段粘进去（保存后约 1~5 分钟生效）：</p>' +
        '<pre class="code">' + ['173.245.48.0/20','103.21.244.0/22','103.22.200.0/22','103.31.4.0/22','141.101.64.0/18','108.162.192.0/18','190.93.240.0/20','188.114.96.0/20','197.234.240.0/22','198.41.128.0/17','162.158.0.0/15','104.16.0.0/13','104.24.0.0/14','172.64.0.0/13','131.0.72.0/22'].join('\\n') + '</pre>' +
        '<p class="muted"><small>另注：调用方须携带浏览器 UA，否则会被 Cloudflare 边缘拦截（<code>403 error 1010</code>）；若绑定自定义域名，需在域名安全性里关闭 Bot Fight Mode 与浏览器完整性检查。</small></p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>cURL 示例</h3></div>' +
        '<pre class="code">' + esc(curl) + '</pre></div>' +
      '<div class="panel"><div class="panel-head"><h3>多图文示例（一次推多篇）</h3></div>' +
        '<p class="muted">不传 <code>articles</code> 时按单图文处理，字段与原来完全一致；传了则按数组顺序建一篇多图文草稿，每篇未填的字段回落到顶层同名字段。</p>' +
        '<pre class="code">' + esc(multi) + '</pre></div>';
  }

  // ==================== 设置 ====================
  async function settings() {
    var d = await api('/admin/api/settings');
    var s = d.settings || {};
    return '' +
      '<div class="admin-heading"><h1>设置</h1></div>' +
      (d.using_default_password
        ? '<div class="notice warn"><p>当前仍在使用默认口令，强烈建议立即在下方「修改后台密码」处设置新密码。</p></div>'
        : '') +
      '<div class="panel"><div class="panel-head"><h3>公众号凭据</h3></div>' +
        '<table class="tb"><tbody>' +
        '<tr><td style="width:180px" class="muted">AppID</td><td>' + (d.appid_configured ? '<code>' + esc(d.appid_masked) + '</code>' : '<span class="badge badge-fail">未配置</span>') + '</td></tr>' +
        '<tr><td class="muted">AppSecret</td><td>' + (d.secret_configured ? '<span class="badge badge-ok">已配置（加密存储）</span>' : '<span class="badge badge-fail">未配置</span>') + '</td></tr>' +
        '<tr><td class="muted">旧版环境变量密钥</td><td>' + (d.legacy_key_configured ? '<span class="badge badge-mute">DRAFT_API_KEY 已设置（兼容保留）</span>' : '<span class="badge badge-mute">未设置</span>') + '</td></tr>' +
        '</tbody></table>' +
        '<p class="muted">凭据用于服务器加密变量存储，出于安全考虑仅可查看配置状态，不支持在页面中修改。如需更换，请在 Cloudflare 控制台 → Workers → 本服务 → 设置 → 变量与密钥 中更新。</p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>默认推送参数</h3></div>' +
        '<div class="field" style="max-width:340px"><label>默认作者</label>' +
        '<input class="input" id="set-author" value="' + esc(s.default_author || '') + '" placeholder="留空表示不设置"></div>' +
        '<button class="btn btn-p" id="save-settings"><i class="fas fa-floppy-disk" aria-hidden="true"></i> 保存设置</button>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>修改后台密码</h3></div>' +
        '<div class="row" style="max-width:640px">' +
          '<div class="field"><label>当前密码</label><input class="input" id="pw-old" type="password"></div>' +
          '<div class="field"><label>新密码（≥6 位）</label><input class="input" id="pw-new" type="password"></div>' +
          '<div class="field"><label>确认新密码</label><input class="input" id="pw-new2" type="password"></div>' +
        '</div>' +
        '<button class="btn" id="save-password"><i class="fas fa-key" aria-hidden="true"></i> 更新密码</button>' +
      '</div>';
  }

  function bindSettings() {
    var ss = document.getElementById('save-settings');
    if (ss) ss.addEventListener('click', function () {
      apiConfirm('/admin/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ default_author: document.getElementById('set-author').value }),
      }, '保存设置').then(function () { toast('设置已保存', 'ok'); }).catch(function (e) { toast(e.message, 'err'); });
    });

    var sp = document.getElementById('save-password');
    if (sp) sp.addEventListener('click', function () {
      var o = document.getElementById('pw-old').value;
      var n = document.getElementById('pw-new').value;
      var n2 = document.getElementById('pw-new2').value;
      if (!n || n.length < 6) { toast('新密码至少 6 位', 'err'); return; }
      if (n !== n2) { toast('两次输入的新密码不一致', 'err'); return; }
      api('/admin/api/password', { method: 'PUT', body: JSON.stringify({ old: o, new: n }) })
        .then(function () {
          toast('密码已更新', 'ok');
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
`
