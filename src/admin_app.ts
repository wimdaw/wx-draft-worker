
/**
 * 后台前端脚本（作为独立 JS 返回 /admin/app.js）
 * 注意：本字符串会被原样交付浏览器，内部不使用模板字符串
 */
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

  function fmtTime(iso) {
    if (!iso) return '-';
    try {
      var d = new Date(iso);
      var p = function (n) { return n < 10 ? '0' + n : '' + n; };
      return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()) + ' ' + p(d.getHours()) + ':' + p(d.getMinutes());
    } catch (e) { return iso; }
  }

  function copy(text) {
    function done() { toast('已复制到剪贴板', 'ok'); }
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

    var cfg = [];
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
        '<div class="row"><div><p class="muted">还没有令牌？</p><a class="btn btn-s" href="#tokens">去令牌管理</a></div>' +
        '<div><p class="muted">还没配置公众号？</p><a class="btn btn-s" href="#accounts">前往公众号管理</a></div>' +
        '<div><p class="muted">查看接口文档？</p><a class="btn btn-s" href="#docs">查看接口文档</a></div></div></div>';
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
          '<button class="btn btn-s" data-act="copy-key" data-id="' + esc(t.id) + '">复制</button></div></td>' +
        '<td>' + (t.enabled ? '<span class="badge badge-ok">启用</span>' : '<span class="badge badge-mute">已禁用</span>') + '</td>' +
        '<td>' + esc(t.use_count) + '</td>' +
        '<td class="muted">' + fmtTime(t.last_used_at) + '</td>' +
        '<td class="muted">' + fmtTime(t.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s" data-act="toggle" data-id="' + esc(t.id) + '" data-enabled="' + (t.enabled ? '1' : '0') + '">' + (t.enabled ? '禁用' : '启用') + '</button> ' +
          '<button class="btn btn-s btn-danger" data-act="del" data-id="' + esc(t.id) + '" data-name="' + esc(t.name) + '">删除</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>令牌管理</h1>' +
        '<div class="sp"><input class="input" id="new-token-name" placeholder="令牌备注名，如：博客自动发布" style="width:240px">' +
        '<button class="btn btn-p" id="create-token">新建令牌</button></div></div>' +
      '<div class="notice info">令牌等同于访问密码：任何人拿到它都能向你的草稿箱推送文章。请勿写入前端代码或公开仓库。</div>' +
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
        var d = await api('/admin/api/tokens', { method: 'POST', body: JSON.stringify({ name: input.value }) });
        toast('令牌已创建', 'ok');
        await go('tokens');
        alert('请立即保存令牌（仅此一次完整展示）：\\n\\n' + d.token.key);
      } catch (e) { toast(e.message, 'err'); } finally { btn.disabled = false; }
    });
  }

  // ==================== 视图路由 ====================
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
    view.innerHTML = '<div class="empty-state">加载中…</div>';
    try {
      view.innerHTML = await views[name]();
      if (binds[name]) binds[name]();
    } catch (e) {
      view.innerHTML = '<div class="notice warn">加载失败：' + esc(e.message) + '</div>';
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
    } else if (act === 'del') {
      if (!confirm('确认删除令牌「' + el.getAttribute('data-name') + '」？使用该令牌的调用将立即失效。')) return;
      api('/admin/api/tokens/' + el.getAttribute('data-id'), { method: 'DELETE' })
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
        ? '<div class="copy-key"><code>' + esc(String(r.media_id).slice(0, 16)) + '…</code><button class="btn btn-s" data-act="copy" data-key="' + esc(r.media_id) + '">复制</button></div>'
        : '<span class="muted">-</span>';
      return '<tr><td>' + esc(r.title) + '</td>' +
        '<td>' + (r.status === 'success' ? '<span class="badge badge-ok">成功</span>' : '<span class="badge badge-fail">失败</span>') + '</td>' +
        '<td>' + mid + '</td>' +
        '<td>' + esc(r.images) + '</td>' +
        '<td>' + esc((r.duration_ms / 1000).toFixed(2)) + 's</td>' +
        '<td class="muted">' + esc(r.token_name || '-') + '</td>' +
        '<td class="muted">' + fmtTime(r.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          (r.error ? '<button class="btn btn-s" data-act="show-error" data-msg="' + esc(r.error) + '">错误</button> ' : '') +
          '<button class="btn btn-s btn-danger" data-act="del-rec" data-id="' + esc(r.id) + '">删除</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>推送记录</h1><div class="sp">' +
        '<button class="btn btn-s" id="refresh-records">刷新</button>' +
        '<button class="btn btn-s btn-danger" id="clear-records">清空记录</button></div></div>' +
      '<div class="notice info">这里只记录本服务的调用历史（含失败原因与耗时），与微信草稿箱互不影响。</div>' +
      '<div class="panel panel-flush">' +
        (d.records.length
          ? '<table class="tb"><thead><tr><th>标题</th><th>结果</th><th>草稿 ID</th><th>图片</th><th>耗时</th><th>令牌</th><th>时间</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table>'
          : '<div class="empty-state">还没有推送记录，先到「公众号管理」配置公众号，再签发令牌推送。</div>') +
      '</div>';
  }

  function bindRecords() {
    var rf = document.getElementById('refresh-records');
    if (rf) rf.addEventListener('click', function () { go('records'); });
    var clr = document.getElementById('clear-records');
    if (clr) clr.addEventListener('click', function () {
      if (!confirm('清空全部推送记录？（不会删除微信草稿箱里的草稿）')) return;
      api('/admin/api/records', { method: 'DELETE' })
        .then(function () { toast('已清空', 'ok'); return go('records'); })
        .catch(function (e) { toast(e.message, 'err'); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="show-error"]'), function (b) {
      b.addEventListener('click', function () { alert(b.getAttribute('data-msg')); });
    });
    [].forEach.call(view.querySelectorAll('[data-act="del-rec"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('删除这条记录？')) return;
        api('/admin/api/records/' + b.getAttribute('data-id'), { method: 'DELETE' })
          .then(function () { toast('已删除', 'ok'); return go('records'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 微信草稿箱 ====================
  async function drafts() {
    var acc = await api('/admin/api/accounts');
    var list = acc.accounts || [];
    if (!list.length) {
      return '' +
        '<div class="admin-heading"><h1>草稿箱</h1></div>' +
        '<div class="notice warn">还没有添加任何公众号，请先到「公众号管理」添加 AppID / AppSecret，草稿箱会按公众号分类展示。</div>' +
        '<div class="panel"><a class="btn btn-p" href="#accounts">前往公众号管理</a></div>';
    }

    var settled = await Promise.all(list.map(function (a) {
      return api('/admin/api/wx-drafts?count=20&account_id=' + encodeURIComponent(a.id))
        .then(function (d) { return { a: a, d: d, err: null }; })
        .catch(function (e) { return { a: a, d: null, err: e.message }; });
    }));

    var blocks = settled.map(function (s) {
      var a = s.a;
      var head = '<div class="admin-heading"><h2 style="margin:0;font-size:18px">' + esc(a.name) +
        (a.is_default ? ' <span class="badge badge-ok">默认</span>' : '') +
        '</h2><div class="sp"><span class="muted">' + esc(a.appid) + '</span>' +
        (s.d ? '<span class="muted">共 ' + esc(s.d.total_count) + ' 篇</span>' : '') +
        '<button class="btn btn-s" data-act="drafts-refresh">刷新</button></div></div>';

      if (s.err) {
        return head + '<div class="notice warn">读取失败：' + esc(s.err) + '</div>';
      }
      var items = s.d.item || [];
      var rows = items.map(function (it) {
        var c = it.content || {};
        var ni = (c.news_item && c.news_item[0]) || {};
        var time = c.update_time ? fmtTime(new Date(c.update_time * 1000).toISOString()) : '-';
        return '<tr><td>' + esc(ni.title || '(无标题)') + '</td>' +
          '<td class="muted">' + esc(ni.author || '-') + '</td>' +
          '<td class="muted">' + esc(time) + '</td>' +
          '<td><div class="copy-key"><code>' + esc(String(it.media_id).slice(0, 16)) + '…</code>' +
            '<button class="btn btn-s" data-act="copy" data-key="' + esc(it.media_id) + '">复制</button></div></td>' +
          '<td><button class="btn btn-s btn-danger" data-act="del-wx" data-id="' + esc(it.media_id) + '" data-account="' + esc(a.id) + '">删除</button></td></tr>';
      }).join('');

      return head + (items.length
        ? '<div class="panel panel-flush"><table class="tb"><thead><tr><th>标题</th><th>作者</th><th>更新时间</th><th>草稿 ID</th><th>操作</th></tr></thead><tbody>' + rows + '</tbody></table></div>'
        : '<div class="panel"><div class="empty-state">该公众号草稿箱是空的。</div></div>');
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>草稿箱</h1><div class="sp"><button class="btn btn-s" id="refresh-drafts">全部刷新</button></div></div>' +
      '<div class="notice warn">下面是各公众号「草稿箱」中的真实内容，按公众号分类展示；删除后无法恢复，请谨慎操作。</div>' +
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
        if (!confirm('确定删除这篇草稿？微信端删除后无法恢复。')) return;
        var url = '/admin/api/wx-drafts/' + encodeURIComponent(b.getAttribute('data-id')) +
          '?account_id=' + encodeURIComponent(b.getAttribute('data-account') || '');
        api(url, { method: 'DELETE' })
          .then(function () { toast('已删除', 'ok'); return go('drafts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 公众号管理 ====================
  async function accounts() {
    var d = await api('/admin/api/accounts');
    var list = d.accounts || [];
    var rows = list.map(function (a) {
      return '<tr>' +
        '<td><strong>' + esc(a.name) + '</strong>' + (a.is_default ? ' <span class="badge badge-ok">默认</span>' : '') + '</td>' +
        '<td class="mono">' + esc(a.appid) + '</td>' +
        '<td class="mono muted">' + esc(a.secret_masked) + '</td>' +
        '<td>' + (a.enabled ? '<span class="badge badge-ok">启用</span>' : '<span class="badge badge-mute">已停用</span>') + '</td>' +
        '<td class="muted">' + fmtTime(a.created_at) + '</td>' +
        '<td style="white-space:nowrap">' +
          '<button class="btn btn-s" data-act="acc-test" data-id="' + esc(a.id) + '">测试连通</button> ' +
          (a.is_default ? '' : '<button class="btn btn-s" data-act="acc-default" data-id="' + esc(a.id) + '">设为默认</button> ') +
          '<button class="btn btn-s" data-act="acc-edit" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '" data-appid="' + esc(a.appid) + '">编辑</button> ' +
          '<button class="btn btn-s btn-danger" data-act="acc-del" data-id="' + esc(a.id) + '" data-name="' + esc(a.name) + '">删除</button>' +
        '</td></tr>';
    }).join('');

    return '' +
      '<div class="admin-heading"><h1>公众号管理</h1><div class="sp">' +
        '<span class="muted">已添加 ' + list.length + ' 个</span>' +
        '<button class="btn btn-s" id="acc-refresh">刷新</button></div></div>' +
      '<div class="notice info">在这里添加要推送的公众号：填微信后台的 <b>AppID</b> 与 <b>AppSecret</b> 即可，<b>公众号名称会自动读出来</b>，不用手填。<b>推送时未指定公众号，就发到标「默认」的那个</b>。记得先把 Cloudflare 出口 IP 加入微信 IP 白名单，否则会报 invalid ip。</div>' +
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
          '<button class="btn btn-p" id="acc-save">添加并校验</button>' +
          '<button class="btn btn-s" id="acc-cancel" style="display:none">取消编辑</button>' +
        '</div>' +
        '<p class="muted" style="margin:12px 0 0">保存时会真实调用微信接口校验凭据、读取草稿数，并自动识别公众号昵称（未认证号可能读取失败，可在「编辑」里手动填名称）。</p>' +
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
      if (save) save.textContent = '添加并校验';
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
      var old = save.textContent;
      save.textContent = '正在向微信校验…';
      try {
        if (editing) {
          await api('/admin/api/accounts/' + encodeURIComponent(editing), { method: 'PUT', body: JSON.stringify(payload) });
          toast('已保存并校验通过', 'ok');
        } else {
          var r = await api('/admin/api/accounts', { method: 'POST', body: JSON.stringify(payload) });
          toast('已添加公众号：' + ((r.account && r.account.name) || ''), 'ok');
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
        b.textContent = '测试中…';
        try {
          var r = await api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')) + '/test', { method: 'POST' });
          toast('凭据可用，该公众号草稿箱共 ' + r.draft_total + ' 篇', 'ok');
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
        if (save) save.textContent = '保存修改并校验';
        if (cancel) cancel.style.display = '';
        if (secret) secret.placeholder = '留空表示不修改 AppSecret';
        if (name) name.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    [].forEach.call(view.querySelectorAll('[data-act="acc-del"]'), function (b) {
      b.addEventListener('click', function () {
        if (!confirm('确定删除公众号「' + b.getAttribute('data-name') + '」？删除后需重新添加才能推送到它。')) return;
        api('/admin/api/accounts/' + encodeURIComponent(b.getAttribute('data-id')), { method: 'DELETE' })
          .then(function () { toast('已删除', 'ok'); return go('accounts'); })
          .catch(function (e) { toast(e.message, 'err'); });
      });
    });
  }

  // ==================== 接口文档 ====================
  function docs() {
    var curl = 'curl -X POST ' + BASE + '/api/draft \\\\n' +
      '  -H "X-API-Key: wxk_你的令牌" \\\\n' +
      '  -H "Content-Type: application/json" \\\\n' +
      '  -d \\'{"title":"标题","content":"<p>正文</p>"}\\'';
    return '' +
      '<div class="admin-heading"><h1>接口文档</h1></div>' +
      '<div class="notice info">所有接口返回统一结构：<code>{ ok: true, data: {...} }</code> 或 <code>{ ok: false, error: "..." }</code></div>' +
      '<div class="panel panel-flush"><table class="tb">' +
        '<thead><tr><th style="width:88px">方法</th><th style="width:230px">路径</th><th>说明</th></tr></thead><tbody>' +
        '<tr><td><span class="method post">POST</span></td><td><code>/api/draft</code></td><td>新建草稿（title / content 必填，支持 contentType=markdown）</td></tr>' +
        '<tr><td><span class="method get">GET</span></td><td><code>/api/drafts</code></td><td>草稿列表（offset / count）</td></tr>' +
        '<tr><td><span class="method del">DELETE</span></td><td><code>/api/drafts/:mediaId</code></td><td>删除草稿</td></tr>' +
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
        '<pre class="code">' + esc(curl) + '</pre></div>';
  }

  // ==================== 设置 ====================
  async function settings() {
    var d = await api('/admin/api/settings');
    var s = d.settings || {};
    return '' +
      '<div class="admin-heading"><h1>设置</h1></div>' +
      (d.using_default_password
        ? '<div class="notice warn">当前仍在使用默认口令，强烈建议立即在下方「修改后台密码」处设置新密码。</div>'
        : '') +
      '<div class="panel"><div class="panel-head"><h3>公众号凭据</h3></div>' +
        '<table class="tb"><tbody>' +
        '<tr><td style="width:180px" class="muted">AppID</td><td>' + (d.appid_configured ? '<code>' + esc(d.appid_masked) + '</code>' : '<span class="badge badge-fail">未配置</span>') + '</td></tr>' +
        '<tr><td class="muted">AppSecret</td><td>' + (d.secret_configured ? '<span class="badge badge-ok">已配置（加密存储）</span>' : '<span class="badge badge-fail">未配置</span>') + '</td></tr>' +
        '<tr><td class="muted">旧版环境变量密钥</td><td>' + (d.legacy_key_configured ? '<span class="badge badge-mute">DRAFT_API_KEY 已设置（兼容保留）</span>' : '<span class="badge badge-mute">未设置</span>') + '</td></tr>' +
        '</tbody></table>' +
        '<p class="muted" style="margin:14px 0 0">凭据用于服务器加密变量存储，出于安全考虑仅可查看配置状态，不支持在页面中修改。如需更换，请在 Cloudflare 控制台 → Workers → 本服务 → 设置 → 变量与密钥 中更新。</p>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>默认推送参数</h3></div>' +
        '<div class="field" style="max-width:340px"><label>默认作者</label>' +
        '<input class="input" id="set-author" value="' + esc(s.default_author || '') + '" placeholder="留空表示不设置"></div>' +
        '<button class="btn btn-p" id="save-settings">保存设置</button>' +
      '</div>' +
      '<div class="panel"><div class="panel-head"><h3>修改后台密码</h3></div>' +
        '<div class="row" style="max-width:640px">' +
          '<div class="field"><label>当前密码</label><input class="input" id="pw-old" type="password"></div>' +
          '<div class="field"><label>新密码（≥6 位）</label><input class="input" id="pw-new" type="password"></div>' +
          '<div class="field"><label>确认新密码</label><input class="input" id="pw-new2" type="password"></div>' +
        '</div>' +
        '<button class="btn" id="save-password">更新密码</button>' +
      '</div>';
  }

  function bindSettings() {
    var ss = document.getElementById('save-settings');
    if (ss) ss.addEventListener('click', function () {
      api('/admin/api/settings', {
        method: 'PUT',
        body: JSON.stringify({ default_author: document.getElementById('set-author').value }),
      }).then(function () { toast('设置已保存', 'ok'); }).catch(function (e) { toast(e.message, 'err'); });
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
