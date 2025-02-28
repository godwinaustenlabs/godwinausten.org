!(function (a, b) {
  "function" == typeof define && define.amd
    ? define(["jquery"], function ($) {
        return b(a, $);
      })
    : "object" == typeof module && "object" == typeof module.exports
    ? (module.exports = b(a, require("jquery")))
    : (a.lity = b(a, a.jQuery || a.Zepto));
})("undefined" != typeof window ? window : this, function (b, $) {
  "use strict";
  var e = b.document,
    i = $(b),
    j = $.Deferred,
    k = $("html"),
    l = [],
    f = "aria-hidden",
    m = "lity-" + f,
    c = {
      esc: !0,
      handler: null,
      handlers: {
        image: g,
        inline: function (c, d) {
          var a, b, e;
          try {
            a = $(c);
          } catch (f) {
            return !1;
          }
          return (
            !!a.length &&
            ((b = $('<i style="display:none !important"/>')),
            (e = a.hasClass("lity-hide")),
            d.element().one("lity:remove", function () {
              b.before(a).remove(),
                e &&
                  !a.closest(".lity-content").length &&
                  a.addClass("lity-hide");
            }),
            a.removeClass("lity-hide").after(b))
          );
        },
        youtube: function (b) {
          var a = o.exec(b);
          return (
            !!a &&
            x(
              w(
                b,
                v(
                  "https://www.youtube" + (a[2] || "") + ".com/embed/" + a[4],
                  $.extend({ autoplay: 1 }, u(a[5] || ""))
                )
              )
            )
          );
        },
        vimeo: function (b) {
          var a = p.exec(b);
          return (
            !!a &&
            x(
              w(
                b,
                v(
                  "https://player.vimeo.com/video/" + a[3],
                  $.extend({ autoplay: 1 }, u(a[4] || ""))
                )
              )
            )
          );
        },
        googlemaps: function (b) {
          var a = q.exec(b);
          return (
            !!a &&
            x(
              w(
                b,
                v("https://www.google." + a[3] + "/maps?" + a[6], {
                  output: a[6].indexOf("layer=c") > 0 ? "svembed" : "embed",
                })
              )
            )
          );
        },
        facebookvideo: function (a) {
          var b = r.exec(a);
          return (
            !!b &&
            (0 !== a.indexOf("http") && (a = "https:" + a),
            x(
              w(
                a,
                v(
                  "https://www.facebook.com/plugins/video.php?href=" + a,
                  $.extend({ autoplay: 1 }, u(b[4] || ""))
                )
              )
            ))
          );
        },
        iframe: x,
      },
      template:
        '<div class="lity" role="dialog" aria-label="Dialog Window (Press escape to close)" tabindex="-1"><div class="lity-wrap" data-lity-close role="document"><div class="lity-loader" aria-hidden="true">Loading...</div><div class="lity-container"><div class="lity-content"></div><button class="lity-close" type="button" aria-label="Close (Press escape to close)" data-lity-close>&times;</button></div></div></div>',
    },
    n = /(^data:image\/)|(\.(png|jpe?g|gif|svg|webp|bmp|ico|tiff?)(\?\S*)?$)/i,
    o =
      /(youtube(-nocookie)?\.com|youtu\.be)\/(watch\?v=|v\/|u\/|embed\/?)?([\w-]{11})(.*)?/i,
    p = /(vimeo(pro)?.com)\/(?:[^\d]+)?(\d+)\??(.*)?$/,
    q = /((maps|www)\.)?google\.([^\/\?]+)\/?((maps\/?)?\?)(.*)/i,
    r = /(facebook\.com)\/([a-z0-9_-]*)\/videos\/([0-9]*)(.*)?$/i,
    s = (function () {
      var c = e.createElement("div"),
        a = {
          WebkitTransition: "webkitTransitionEnd",
          MozTransition: "transitionend",
          OTransition: "oTransitionEnd otransitionend",
          transition: "transitionend",
        };
      for (var b in a) if (void 0 !== c.style[b]) return a[b];
      return !1;
    })();
  function t(b) {
    var a = j();
    return (
      s && b.length
        ? (b.one(s, a.resolve), setTimeout(a.resolve, 500))
        : a.resolve(),
      a.promise()
    );
  }
  function d(a, b, c) {
    if (1 === arguments.length) return $.extend({}, a);
    if ("string" == typeof b) {
      if (void 0 === c) return void 0 === a[b] ? null : a[b];
      a[b] = c;
    } else $.extend(a, b);
    return this;
  }
  function u(e) {
    for (
      var c,
        b = decodeURI(e.split("#")[0]).split("&"),
        d = {},
        a = 0,
        f = b.length;
      a < f;
      a++
    )
      b[a] && (d[(c = b[a].split("="))[0]] = c[1]);
    return d;
  }
  function v(a, b) {
    return a + (a.indexOf("?") > -1 ? "&" : "?") + $.param(b);
  }
  function w(a, c) {
    var b = a.indexOf("#");
    return -1 === b ? c : (b > 0 && (a = a.substr(b)), c + a);
  }
  function g(b, a) {
    var c = $(
        '<img src="' +
          b +
          '" alt="' +
          ((a.opener() && a.opener().data("lity-desc")) ||
            "Image with no description") +
          '"/>'
      ),
      d = j(),
      e = function () {
        var a;
        d.reject(
          ((a = "Failed loading image"),
          $('<span class="lity-error"/>').append(a))
        );
      };
    return (
      c
        .on("load", function () {
          if (0 === this.naturalWidth) return e();
          d.resolve(c);
        })
        .on("error", e),
      d.promise()
    );
  }
  function x(a) {
    var c = a && 0 === a.indexOf("https://player.vimeo.com/"),
      b = "";
    return (
      !0 == c && (b = 'allow="autoplay; fullscreen; picture-in-picture"'),
      '<div class="lity-iframe-container"><iframe frameborder="0" allowfullscreen ' +
        b +
        ' src="' +
        a +
        '"/></div>'
    );
  }
  function y() {
    return e.documentElement.clientHeight
      ? e.documentElement.clientHeight
      : Math.round(i.height());
  }
  function z(b) {
    var a = h();
    a &&
      (27 === b.keyCode && a.options("esc") && a.close(),
      9 === b.keyCode && A(b, a));
  }
  function A(b, d) {
    var a = d
        .element()
        .find(
          'a[href],area[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),iframe,object,embed,[contenteditable],[tabindex]:not([tabindex^="-"])'
        ),
      c = a.index(e.activeElement);
    b.shiftKey && c <= 0
      ? (a.get(a.length - 1).focus(), b.preventDefault())
      : b.shiftKey ||
        c !== a.length - 1 ||
        (a.get(0).focus(), b.preventDefault());
  }
  function B() {
    $.each(l, function (b, a) {
      a.resize();
    });
  }
  function h() {
    return 0 === l.length ? null : l[0];
  }
  function C(w, b, x, A) {
    var n,
      q,
      C,
      r,
      s,
      u,
      g,
      v,
      o,
      h,
      p,
      a = this,
      D = !1,
      E = !1;
    (b = $.extend({}, c, b)),
      (q = $(b.template)),
      (a.element = function () {
        return q;
      }),
      (a.opener = function () {
        return x;
      }),
      (a.options = $.proxy(d, a, b)),
      (a.handlers = $.proxy(d, a, b.handlers)),
      (a.resize = function () {
        D && !E && C.css("max-height", y() + "px").trigger("lity:resize", [a]);
      }),
      (a.close = function () {
        if (D && !E) {
          (E = !0),
            (c = a).element().attr(f, "true"),
            1 === l.length &&
              (k.removeClass("lity-active"), i.off({ resize: B, keydown: z })),
            ((l = $.grep(l, function (a) {
              return c !== a;
            })).length
              ? l[0].element()
              : $(".lity-hidden")
            )
              .removeClass("lity-hidden")
              .each(function () {
                var a = $(this),
                  b = a.data(m);
                b ? a.attr(f, b) : a.removeAttr(f), a.removeData(m);
              });
          var c,
            b = j();
          if (
            A &&
            (e.activeElement === q[0] || $.contains(q[0], e.activeElement))
          )
            try {
              A.focus();
            } catch (d) {}
          return (
            C.trigger("lity:close", [a]),
            q.removeClass("lity-opened").addClass("lity-closed"),
            t(C.add(q)).always(function () {
              C.trigger("lity:remove", [a]),
                q.remove(),
                (q = void 0),
                b.resolve();
            }),
            b.promise()
          );
        }
      }),
      (n =
        ((r = w),
        (s = a),
        (u = b.handlers),
        (g = b.handler),
        (o = "inline"),
        (h = $.extend({}, u)),
        g && h[g]
          ? ((v = h[g](r, s)), (o = g))
          : ($.each(["inline", "iframe"], function (b, a) {
              delete h[a], (h[a] = u[a]);
            }),
            $.each(h, function (b, a) {
              return (
                !(a && (!a.test || a.test(r, s))) ||
                (!1 !== (v = a(r, s)) ? ((o = b), !1) : void 0)
              );
            })),
        { handler: o, content: v || "" })),
      q
        .attr(f, "false")
        .addClass("lity-loading lity-opened lity-" + n.handler)
        .appendTo("body")
        .focus()
        .on("click", "[data-lity-close]", function (b) {
          $(b.target).is("[data-lity-close]") && a.close();
        })
        .trigger("lity:open", [a]),
      (p = a),
      1 === l.unshift(p) &&
        (k.addClass("lity-active"), i.on({ resize: B, keydown: z })),
      $("body > *")
        .not(p.element())
        .addClass("lity-hidden")
        .each(function () {
          var a = $(this);
          void 0 === a.data(m) && a.data(m, a.attr(f) || null);
        })
        .attr(f, "true"),
      $.when(n.content).always(function (b) {
        (C = $(b).css("max-height", y() + "px")),
          q.find(".lity-loader").each(function () {
            var a = $(this);
            t(a).always(function () {
              a.remove();
            });
          }),
          q.removeClass("lity-loading").find(".lity-content").empty().append(C),
          (D = !0),
          C.trigger("lity:ready", [a]);
      });
  }
  function a(b, c, a) {
    b.preventDefault
      ? (b.preventDefault(),
        (b =
          (a = $(this)).data("lity-target") || a.attr("href") || a.attr("src")))
      : (a = $(a));
    var d = new C(
      b,
      $.extend({}, a.data("lity-options") || a.data("lity"), c),
      a,
      e.activeElement
    );
    if (!b.preventDefault) return d;
  }
  return (
    (g.test = function (a) {
      return n.test(a);
    }),
    (a.version = "2.2.2"),
    (a.options = $.proxy(d, a, c)),
    (a.handlers = $.proxy(d, a, c.handlers)),
    (a.current = h),
    $(e).on("click.lity", "[data-lity]", a),
    a
  );
});
