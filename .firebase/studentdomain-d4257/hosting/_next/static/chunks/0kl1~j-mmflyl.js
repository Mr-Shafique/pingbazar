(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([
  "object" == typeof document ? document.currentScript : void 0,
  74775,
  (e, t, a) => {},
  70309,
  (e, t, a) => {
    var s = e.i(99981);
    e.r(74775);
    var r = e.r(36138),
      l = r && "object" == typeof r && "default" in r ? r : { default: r },
      o = void 0 !== s.default && s.default.env && !0,
      n = function (e) {
        return "[object String]" === Object.prototype.toString.call(e);
      },
      i = (function () {
        function e(e) {
          var t = void 0 === e ? {} : e,
            a = t.name,
            s = void 0 === a ? "stylesheet" : a,
            r = t.optimizeForSpeed,
            l = void 0 === r ? o : r;
          (c(n(s), "`name` must be a string"),
            (this._name = s),
            (this._deletedRulePlaceholder = "#" + s + "-deleted-rule____{}"),
            c("boolean" == typeof l, "`optimizeForSpeed` must be a boolean"),
            (this._optimizeForSpeed = l),
            (this._serverSheet = void 0),
            (this._tags = []),
            (this._injected = !1),
            (this._rulesCount = 0));
          var i =
            "u" > typeof window &&
            document.querySelector('meta[property="csp-nonce"]');
          this._nonce = i ? i.getAttribute("content") : null;
        }
        var t,
          a = e.prototype;
        return (
          (a.setOptimizeForSpeed = function (e) {
            (c(
              "boolean" == typeof e,
              "`setOptimizeForSpeed` accepts a boolean",
            ),
              c(
                0 === this._rulesCount,
                "optimizeForSpeed cannot be when rules have already been inserted",
              ),
              this.flush(),
              (this._optimizeForSpeed = e),
              this.inject());
          }),
          (a.isOptimizeForSpeed = function () {
            return this._optimizeForSpeed;
          }),
          (a.inject = function () {
            var e = this;
            if (
              (c(!this._injected, "sheet already injected"),
              (this._injected = !0),
              "u" > typeof window && this._optimizeForSpeed)
            ) {
              ((this._tags[0] = this.makeStyleTag(this._name)),
                (this._optimizeForSpeed = "insertRule" in this.getSheet()),
                this._optimizeForSpeed ||
                  (o ||
                    console.warn(
                      "StyleSheet: optimizeForSpeed mode not supported falling back to standard mode.",
                    ),
                  this.flush(),
                  (this._injected = !0)));
              return;
            }
            this._serverSheet = {
              cssRules: [],
              insertRule: function (t, a) {
                return (
                  "number" == typeof a
                    ? (e._serverSheet.cssRules[a] = { cssText: t })
                    : e._serverSheet.cssRules.push({ cssText: t }),
                  a
                );
              },
              deleteRule: function (t) {
                e._serverSheet.cssRules[t] = null;
              },
            };
          }),
          (a.getSheetForTag = function (e) {
            if (e.sheet) return e.sheet;
            for (var t = 0; t < document.styleSheets.length; t++)
              if (document.styleSheets[t].ownerNode === e)
                return document.styleSheets[t];
          }),
          (a.getSheet = function () {
            return this.getSheetForTag(this._tags[this._tags.length - 1]);
          }),
          (a.insertRule = function (e, t) {
            if (
              (c(n(e), "`insertRule` accepts only strings"),
              "u" < typeof window)
            )
              return (
                "number" != typeof t && (t = this._serverSheet.cssRules.length),
                this._serverSheet.insertRule(e, t),
                this._rulesCount++
              );
            if (this._optimizeForSpeed) {
              var a = this.getSheet();
              "number" != typeof t && (t = a.cssRules.length);
              try {
                a.insertRule(e, t);
              } catch (t) {
                return (
                  o ||
                    console.warn(
                      "StyleSheet: illegal rule: \n\n" +
                        e +
                        "\n\nSee https://stackoverflow.com/q/20007992 for more info",
                    ),
                  -1
                );
              }
            } else {
              var s = this._tags[t];
              this._tags.push(this.makeStyleTag(this._name, e, s));
            }
            return this._rulesCount++;
          }),
          (a.replaceRule = function (e, t) {
            if (this._optimizeForSpeed || "u" < typeof window) {
              var a = "u" > typeof window ? this.getSheet() : this._serverSheet;
              if (
                (t.trim() || (t = this._deletedRulePlaceholder), !a.cssRules[e])
              )
                return e;
              a.deleteRule(e);
              try {
                a.insertRule(t, e);
              } catch (s) {
                (o ||
                  console.warn(
                    "StyleSheet: illegal rule: \n\n" +
                      t +
                      "\n\nSee https://stackoverflow.com/q/20007992 for more info",
                  ),
                  a.insertRule(this._deletedRulePlaceholder, e));
              }
            } else {
              var s = this._tags[e];
              (c(s, "old rule at index `" + e + "` not found"),
                (s.textContent = t));
            }
            return e;
          }),
          (a.deleteRule = function (e) {
            if ("u" < typeof window)
              return void this._serverSheet.deleteRule(e);
            if (this._optimizeForSpeed) this.replaceRule(e, "");
            else {
              var t = this._tags[e];
              (c(t, "rule at index `" + e + "` not found"),
                t.parentNode.removeChild(t),
                (this._tags[e] = null));
            }
          }),
          (a.flush = function () {
            ((this._injected = !1),
              (this._rulesCount = 0),
              "u" > typeof window
                ? (this._tags.forEach(function (e) {
                    return e && e.parentNode.removeChild(e);
                  }),
                  (this._tags = []))
                : (this._serverSheet.cssRules = []));
          }),
          (a.cssRules = function () {
            var e = this;
            return "u" < typeof window
              ? this._serverSheet.cssRules
              : this._tags.reduce(function (t, a) {
                  return (
                    a
                      ? (t = t.concat(
                          Array.prototype.map.call(
                            e.getSheetForTag(a).cssRules,
                            function (t) {
                              return t.cssText === e._deletedRulePlaceholder
                                ? null
                                : t;
                            },
                          ),
                        ))
                      : t.push(null),
                    t
                  );
                }, []);
          }),
          (a.makeStyleTag = function (e, t, a) {
            t &&
              c(n(t), "makeStyleTag accepts only strings as second parameter");
            var s = document.createElement("style");
            (this._nonce && s.setAttribute("nonce", this._nonce),
              (s.type = "text/css"),
              s.setAttribute("data-" + e, ""),
              t && s.appendChild(document.createTextNode(t)));
            var r = document.head || document.getElementsByTagName("head")[0];
            return (a ? r.insertBefore(s, a) : r.appendChild(s), s);
          }),
          (t = [
            {
              key: "length",
              get: function () {
                return this._rulesCount;
              },
            },
          ]),
          (function (e, t) {
            for (var a = 0; a < t.length; a++) {
              var s = t[a];
              ((s.enumerable = s.enumerable || !1),
                (s.configurable = !0),
                "value" in s && (s.writable = !0),
                Object.defineProperty(e, s.key, s));
            }
          })(e.prototype, t),
          e
        );
      })();
    function c(e, t) {
      if (!e) throw Error("StyleSheet: " + t + ".");
    }
    var d = function (e) {
        for (var t = 5381, a = e.length; a; ) t = (33 * t) ^ e.charCodeAt(--a);
        return t >>> 0;
      },
      x = {};
    function p(e, t) {
      if (!t) return "jsx-" + e;
      var a = String(t),
        s = e + a;
      return (x[s] || (x[s] = "jsx-" + d(e + "-" + a)), x[s]);
    }
    function m(e, t) {
      "u" < typeof window && (t = t.replace(/\/style/gi, "\\/style"));
      var a = e + t;
      return (
        x[a] || (x[a] = t.replace(/__jsx-style-dynamic-selector/g, e)),
        x[a]
      );
    }
    var u = (function () {
        function e(e) {
          var t = void 0 === e ? {} : e,
            a = t.styleSheet,
            s = void 0 === a ? null : a,
            r = t.optimizeForSpeed,
            l = void 0 !== r && r;
          ((this._sheet =
            s || new i({ name: "styled-jsx", optimizeForSpeed: l })),
            this._sheet.inject(),
            s &&
              "boolean" == typeof l &&
              (this._sheet.setOptimizeForSpeed(l),
              (this._optimizeForSpeed = this._sheet.isOptimizeForSpeed())),
            (this._fromServer = void 0),
            (this._indices = {}),
            (this._instancesCounts = {}));
        }
        var t = e.prototype;
        return (
          (t.add = function (e) {
            var t = this;
            (void 0 === this._optimizeForSpeed &&
              ((this._optimizeForSpeed = Array.isArray(e.children)),
              this._sheet.setOptimizeForSpeed(this._optimizeForSpeed),
              (this._optimizeForSpeed = this._sheet.isOptimizeForSpeed())),
              "u" > typeof window &&
                !this._fromServer &&
                ((this._fromServer = this.selectFromServer()),
                (this._instancesCounts = Object.keys(this._fromServer).reduce(
                  function (e, t) {
                    return ((e[t] = 0), e);
                  },
                  {},
                ))));
            var a = this.getIdAndRules(e),
              s = a.styleId,
              r = a.rules;
            if (s in this._instancesCounts) {
              this._instancesCounts[s] += 1;
              return;
            }
            var l = r
              .map(function (e) {
                return t._sheet.insertRule(e);
              })
              .filter(function (e) {
                return -1 !== e;
              });
            ((this._indices[s] = l), (this._instancesCounts[s] = 1));
          }),
          (t.remove = function (e) {
            var t = this,
              a = this.getIdAndRules(e).styleId;
            if (
              ((function (e, t) {
                if (!e) throw Error("StyleSheetRegistry: " + t + ".");
              })(a in this._instancesCounts, "styleId: `" + a + "` not found"),
              (this._instancesCounts[a] -= 1),
              this._instancesCounts[a] < 1)
            ) {
              var s = this._fromServer && this._fromServer[a];
              (s
                ? (s.parentNode.removeChild(s), delete this._fromServer[a])
                : (this._indices[a].forEach(function (e) {
                    return t._sheet.deleteRule(e);
                  }),
                  delete this._indices[a]),
                delete this._instancesCounts[a]);
            }
          }),
          (t.update = function (e, t) {
            (this.add(t), this.remove(e));
          }),
          (t.flush = function () {
            (this._sheet.flush(),
              this._sheet.inject(),
              (this._fromServer = void 0),
              (this._indices = {}),
              (this._instancesCounts = {}));
          }),
          (t.cssRules = function () {
            var e = this,
              t = this._fromServer
                ? Object.keys(this._fromServer).map(function (t) {
                    return [t, e._fromServer[t]];
                  })
                : [],
              a = this._sheet.cssRules();
            return t.concat(
              Object.keys(this._indices)
                .map(function (t) {
                  return [
                    t,
                    e._indices[t]
                      .map(function (e) {
                        return a[e].cssText;
                      })
                      .join(e._optimizeForSpeed ? "" : "\n"),
                  ];
                })
                .filter(function (e) {
                  return !!e[1];
                }),
            );
          }),
          (t.styles = function (e) {
            var t, a;
            return (
              (t = this.cssRules()),
              void 0 === (a = e) && (a = {}),
              t.map(function (e) {
                var t = e[0],
                  s = e[1];
                return l.default.createElement("style", {
                  id: "__" + t,
                  key: "__" + t,
                  nonce: a.nonce ? a.nonce : void 0,
                  dangerouslySetInnerHTML: { __html: s },
                });
              })
            );
          }),
          (t.getIdAndRules = function (e) {
            var t = e.children,
              a = e.dynamic,
              s = e.id;
            if (a) {
              var r = p(s, a);
              return {
                styleId: r,
                rules: Array.isArray(t)
                  ? t.map(function (e) {
                      return m(r, e);
                    })
                  : [m(r, t)],
              };
            }
            return { styleId: p(s), rules: Array.isArray(t) ? t : [t] };
          }),
          (t.selectFromServer = function () {
            return Array.prototype.slice
              .call(document.querySelectorAll('[id^="__jsx-"]'))
              .reduce(function (e, t) {
                return ((e[t.id.slice(2)] = t), e);
              }, {});
          }),
          e
        );
      })(),
      h = r.createContext(null);
    function b() {
      return new u();
    }
    function f() {
      return r.useContext(h);
    }
    h.displayName = "StyleSheetContext";
    var g = l.default.useInsertionEffect || l.default.useLayoutEffect,
      y = "u" > typeof window ? b() : void 0;
    function j(e) {
      var t = y || f();
      return (
        t &&
          ("u" < typeof window
            ? t.add(e)
            : g(
                function () {
                  return (
                    t.add(e),
                    function () {
                      t.remove(e);
                    }
                  );
                },
                [e.id, String(e.dynamic)],
              )),
        null
      );
    }
    ((j.dynamic = function (e) {
      return e
        .map(function (e) {
          return p(e[0], e[1]);
        })
        .join(" ");
    }),
      (a.StyleRegistry = function (e) {
        var t = e.registry,
          a = e.children,
          s = r.useContext(h),
          o = r.useState(function () {
            return s || t || b();
          })[0];
        return l.default.createElement(h.Provider, { value: o }, a);
      }),
      (a.createStyleRegistry = b),
      (a.style = j),
      (a.useStyleRegistry = f));
  },
  40128,
  (e, t, a) => {
    t.exports = e.r(70309).style;
  },
  18202,
  (e) => {
    "use strict";
    var t = e.i(60159),
      a = e.i(36138),
      s = e.i(94165),
      r = e.i(17795);
    e.i(66301);
    var l = e.i(39628),
      l = l,
      o = l;
    e.i(84237);
    var n = e.i(95961),
      n = n,
      i = e.i(38146);
    e.i(99981);
    var c = e.i(40128);
    function d({
      isOpen: e,
      onClose: s,
      onConfirm: r,
      initialLat: l = "51.5074",
      initialLng: o = "-0.1278",
    }) {
      let n = (0, a.useRef)(null),
        i = (0, a.useRef)(null),
        x = (0, a.useRef)(null),
        p = (0, a.useRef)(null),
        m = (0, a.useRef)(!1),
        [u, h] = (0, a.useState)(l),
        [b, f] = (0, a.useState)(o),
        [g, y] = (0, a.useState)(""),
        [j, w] = (0, a.useState)(!1),
        [v, N] = (0, a.useState)(!1),
        [k, S] = (0, a.useState)(!1),
        [_, C] = (0, a.useState)(""),
        I = (0, a.useCallback)((e, t) => {
          if (
            !window.google?.maps ||
            "function" != typeof window.google.maps.Geocoder
          )
            return;
          (S(!0), C(""));
          let a = setTimeout(() => {
            S(!1);
          }, 5e3);
          try {
            new window.google.maps.Geocoder().geocode(
              { location: { lat: e, lng: t } },
              (s, r) => {
                if ((clearTimeout(a), S(!1), "OK" === r && s && s[0])) {
                  let e = s[0].formatted_address || s[0].name || "";
                  (y(e), i.current && (i.current.value = e));
                } else {
                  console.warn("Geocoding failed with status:", r);
                  let a = `${e.toFixed(4)}, ${t.toFixed(4)}`;
                  y((e) => e || a);
                }
              },
            );
          } catch (s) {
            (clearTimeout(a),
              S(!1),
              console.error("Geocoder error:", s),
              y((a) => a || `${e.toFixed(5)}, ${t.toFixed(5)}`));
          }
        }, []),
        F = (0, a.useCallback)(
          (e, t) => {
            (h(e.toFixed(6)),
              f(t.toFixed(6)),
              p.current && p.current.setPosition({ lat: e, lng: t }),
              x.current && x.current.panTo({ lat: e, lng: t }),
              I(e, t));
          },
          [I],
        ),
        R = (0, a.useCallback)(() => {
          if (!m.current && n.current && window.google?.maps)
            try {
              let e = parseFloat(l) || 51.5074,
                t = parseFloat(o) || -0.1278;
              if (0 === n.current.offsetHeight) return void setTimeout(R, 100);
              m.current = !0;
              let a = new window.google.maps.Map(n.current, {
                center: { lat: e, lng: t },
                zoom: 14,
                mapTypeControl: !1,
                streetViewControl: !1,
                fullscreenControl: !1,
                gestureHandling: "greedy",
              });
              x.current = a;
              let s = new window.google.maps.Marker({
                position: { lat: e, lng: t },
                map: a,
                draggable: !0,
                title: "Drag to pick location",
                animation: window.google.maps.Animation?.DROP,
              });
              ((p.current = s),
                a.addListener("click", (e) => {
                  e.latLng && F(e.latLng.lat(), e.latLng.lng());
                }),
                s.addListener("dragend", (e) => {
                  e.latLng && F(e.latLng.lat(), e.latLng.lng());
                }),
                I(e, t),
                i.current &&
                  i.current.addEventListener("gmp-select", async (e) => {
                    try {
                      let t = e.placePrediction;
                      if (!t) return;
                      let a = t.toPlace();
                      if (
                        (await a.fetchFields({
                          fields: [
                            "location",
                            "formattedAddress",
                            "displayName",
                          ],
                        }),
                        a.location)
                      ) {
                        let e = a.location.lat(),
                          t = a.location.lng(),
                          s = a.formattedAddress || a.displayName || "";
                        (y(s),
                          h(e.toFixed(6)),
                          f(t.toFixed(6)),
                          p.current &&
                            p.current.setPosition({ lat: e, lng: t }),
                          x.current &&
                            (x.current.panTo({ lat: e, lng: t }),
                            x.current.setZoom(14)));
                      }
                    } catch (e) {
                      console.error("Place selection error:", e);
                    }
                  }),
                N(!0));
            } catch (e) {
              (console.error("Map initialization failed:", e),
                C("Failed to initialize the map. Please try again."),
                (m.current = !1));
            }
        }, [l, o, F, I]);
      return ((0, a.useEffect)(() => {
        e &&
          (h(l),
          f(o),
          y(""),
          N(!1),
          C(""),
          (m.current = !1),
          (x.current = null),
          (p.current = null),
          (() => {
            if (window.google?.maps) return setTimeout(R, 100);
            if (document.getElementById("google-maps-script")) {
              let e = 0,
                t = setInterval(() => {
                  (e++,
                    window.google?.maps
                      ? (clearInterval(t), setTimeout(R, 100))
                      : e > 60 &&
                        (clearInterval(t),
                        C("Google Maps took too long to load. Please retry.")));
                }, 100);
            } else {
              let e = document.createElement("script");
              ((e.id = "google-maps-script"),
                (e.src =
                  "https://maps.googleapis.com/maps/api/js?key=AIzaSyD4gIWwArqAM_Dsco1mCRylBThCcFV-CAc&libraries=places"),
                (e.async = !0),
                (e.defer = !0),
                (e.onload = () => setTimeout(R, 100)),
                (e.onerror = () =>
                  C(
                    "Failed to load Google Maps. Check your API key or network.",
                  )),
                document.head.appendChild(e));
            }
          })());
      }, [e]),
      e)
        ? (0, t.jsxs)("div", {
            style: { backgroundColor: "rgba(0,0,0,0.8)" },
            onClick: (e) => {
              e.target === e.currentTarget && s();
            },
            className:
              "jsx-9eda48d4173a3903 fixed inset-0 z-[9999] flex items-end sm:items-center justify-center",
            children: [
              (0, t.jsxs)("div", {
                style: {
                  boxShadow: "0 -4px 0 0 #000, 6px 6px 0px 0px rgba(0,0,0,1)",
                  height: "90vh",
                  maxHeight: "90vh",
                },
                onClick: (e) => e.stopPropagation(),
                className:
                  "jsx-9eda48d4173a3903 relative bg-white border-t-[3px] sm:border-[3px] border-black w-full sm:max-w-2xl flex flex-col overflow-hidden",
                children: [
                  (0, t.jsxs)("div", {
                    className:
                      "jsx-9eda48d4173a3903 flex items-center justify-between px-4 py-3 border-b-[3px] border-black bg-[#7d12ff] flex-shrink-0",
                    children: [
                      (0, t.jsxs)("div", {
                        className:
                          "jsx-9eda48d4173a3903 flex items-center gap-2",
                        children: [
                          (0, t.jsx)("span", {
                            className:
                              "jsx-9eda48d4173a3903 material-symbols-outlined text-white text-[20px]",
                            children: "map",
                          }),
                          (0, t.jsx)("h3", {
                            className:
                              "jsx-9eda48d4173a3903 font-space-grotesk text-[15px] sm:text-[17px] font-black text-white uppercase tracking-wider",
                            children: "Pick Your Location",
                          }),
                        ],
                      }),
                      (0, t.jsx)("button", {
                        onClick: s,
                        "aria-label": "Close",
                        className:
                          "jsx-9eda48d4173a3903 w-8 h-8 flex items-center justify-center text-white hover:bg-white/20 rounded transition-colors cursor-pointer text-xl font-black leading-none",
                        children: "✕",
                      }),
                    ],
                  }),
                  (0, t.jsxs)("div", {
                    className:
                      "jsx-9eda48d4173a3903 flex gap-2 px-3 py-2.5 border-b-[2px] border-black bg-[#f0eded] flex-shrink-0",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "jsx-9eda48d4173a3903 relative flex-grow",
                        children: [
                          (0, t.jsx)("span", {
                            className:
                              "jsx-9eda48d4173a3903 material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-black text-[18px] pointer-events-none select-none z-10",
                            children: "search",
                          }),
                          (0, t.jsx)("gmp-place-autocomplete", {
                            ref: i,
                            placeholder: "Search city, area, address…",
                            className:
                              "w-full border-[2px] border-black text-[13px] bg-white focus-within:ring-2 focus-within:ring-[#7d12ff] transition-all font-mono",
                            style: { fontFamily: "Space Grotesk, monospace" },
                          }),
                        ],
                      }),
                      (0, t.jsxs)("button", {
                        onClick: () => {
                          navigator.geolocation
                            ? (w(!0),
                              C(""),
                              navigator.geolocation.getCurrentPosition(
                                (e) => {
                                  (w(!1),
                                    F(e.coords.latitude, e.coords.longitude),
                                    x.current && x.current.setZoom(15));
                                },
                                (e) => {
                                  (w(!1), C("GPS error: " + e.message));
                                },
                                { enableHighAccuracy: !0, timeout: 12e3 },
                              ))
                            : C(
                                "Geolocation is not supported by your browser.",
                              );
                        },
                        disabled: j,
                        title: "Use my GPS location",
                        style: {
                          background: "#e2e2e2",
                          boxShadow: j ? "none" : "2px 2px 0 0 #000",
                          fontFamily: "Space Grotesk, sans-serif",
                        },
                        className:
                          "jsx-9eda48d4173a3903 flex items-center gap-1.5 px-3 py-2 border-[2px] border-black font-bold text-[11px] uppercase transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap flex-shrink-0",
                        children: [
                          (0, t.jsx)("span", {
                            style: {
                              animation: j ? "spin 1s linear infinite" : "none",
                            },
                            className:
                              "jsx-9eda48d4173a3903 material-symbols-outlined text-[17px]",
                            children: j ? "sync" : "my_location",
                          }),
                          (0, t.jsx)("span", {
                            className: "jsx-9eda48d4173a3903 hidden sm:inline",
                            children: j ? "Locating…" : "GPS",
                          }),
                        ],
                      }),
                    ],
                  }),
                  _ &&
                    (0, t.jsxs)("div", {
                      className:
                        "jsx-9eda48d4173a3903 flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b-[2px] border-red-400 text-red-700 text-[12px] font-bold flex-shrink-0",
                      children: [
                        (0, t.jsx)("span", {
                          className:
                            "jsx-9eda48d4173a3903 material-symbols-outlined text-[16px]",
                          children: "error",
                        }),
                        _,
                        (0, t.jsx)("button", {
                          onClick: () => C(""),
                          className:
                            "jsx-9eda48d4173a3903 ml-auto text-red-400 hover:text-red-600 font-black cursor-pointer",
                          children: "✕",
                        }),
                      ],
                    }),
                  (0, t.jsxs)("div", {
                    style: { minHeight: 0 },
                    className:
                      "jsx-9eda48d4173a3903 relative flex-1 overflow-hidden",
                    children: [
                      (0, t.jsx)("div", {
                        ref: n,
                        className: "jsx-9eda48d4173a3903 absolute inset-0",
                      }),
                      !v &&
                        !_ &&
                        (0, t.jsxs)("div", {
                          className:
                            "jsx-9eda48d4173a3903 absolute inset-0 flex flex-col items-center justify-center bg-[#f0eded] gap-4 z-10",
                          children: [
                            (0, t.jsx)("div", {
                              className:
                                "jsx-9eda48d4173a3903 w-14 h-14 border-[3px] border-black border-t-[#7d12ff] rounded-full animate-spin",
                            }),
                            (0, t.jsx)("p", {
                              style: {
                                fontFamily: "Space Grotesk, sans-serif",
                              },
                              className:
                                "jsx-9eda48d4173a3903 text-[13px] font-bold uppercase tracking-wide",
                              children: "Loading Map…",
                            }),
                          ],
                        }),
                      k &&
                        v &&
                        (0, t.jsxs)("div", {
                          style: {
                            fontFamily: "Space Grotesk, monospace",
                            boxShadow: "2px 2px 0 #000",
                          },
                          className:
                            "jsx-9eda48d4173a3903 absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white border-[2px] border-black px-3 py-1.5 flex items-center gap-2 text-[12px] font-bold",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "jsx-9eda48d4173a3903 material-symbols-outlined text-[14px] animate-spin",
                              children: "sync",
                            }),
                            "Resolving address…",
                          ],
                        }),
                      v &&
                        (0, t.jsxs)("div", {
                          style: { fontFamily: "Space Grotesk, monospace" },
                          className:
                            "jsx-9eda48d4173a3903 absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-black/80 text-white text-[11px] px-3 py-1.5 flex items-center gap-1.5 pointer-events-none rounded-full",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "jsx-9eda48d4173a3903 material-symbols-outlined text-[13px]",
                              children: "touch_app",
                            }),
                            "Tap map or drag pin",
                          ],
                        }),
                    ],
                  }),
                  (0, t.jsxs)("div", {
                    style: { boxShadow: "0 -2px 0 0 #000" },
                    className:
                      "jsx-9eda48d4173a3903 flex-shrink-0 border-t-[3px] border-black bg-white",
                    children: [
                      (0, t.jsxs)("div", {
                        className: "jsx-9eda48d4173a3903 px-4 pt-3 pb-2",
                        children: [
                          (0, t.jsx)("p", {
                            style: {
                              fontFamily: "Space Grotesk, sans-serif",
                              letterSpacing: "0.08em",
                            },
                            className:
                              "jsx-9eda48d4173a3903 text-[10px] uppercase font-bold text-[#5e5e5e] mb-1",
                            children: "Selected Location",
                          }),
                          g
                            ? (0, t.jsxs)("p", {
                                style: {
                                  fontFamily: "Space Grotesk, monospace",
                                },
                                className:
                                  "jsx-9eda48d4173a3903 text-[13px] font-bold text-black truncate flex items-center gap-1.5",
                                children: [
                                  (0, t.jsx)("span", {
                                    className:
                                      "jsx-9eda48d4173a3903 text-[#7d12ff]",
                                    children: "📍",
                                  }),
                                  g,
                                ],
                              })
                            : (0, t.jsx)("p", {
                                style: {
                                  fontFamily: "Space Grotesk, sans-serif",
                                },
                                className:
                                  "jsx-9eda48d4173a3903 text-[12px] text-[#5e5e5e] italic",
                                children: v
                                  ? "Tap the map to select a location"
                                  : "Map is loading…",
                              }),
                          u &&
                            b &&
                            (0, t.jsxs)("p", {
                              style: { fontFamily: "Space Grotesk, monospace" },
                              className:
                                "jsx-9eda48d4173a3903 text-[10px] text-[#7c7388] mt-0.5",
                              children: [
                                parseFloat(u).toFixed(4),
                                ",",
                                " ",
                                parseFloat(b).toFixed(4),
                              ],
                            }),
                        ],
                      }),
                      (0, t.jsxs)("div", {
                        className: "jsx-9eda48d4173a3903 flex gap-2 px-4 pb-4",
                        children: [
                          (0, t.jsx)("button", {
                            onClick: s,
                            style: {
                              fontFamily: "Space Grotesk, sans-serif",
                              boxShadow: "2px 2px 0 0 #000",
                            },
                            className:
                              "jsx-9eda48d4173a3903 flex-1 sm:flex-none px-5 py-2.5 bg-white text-black border-[2px] border-black text-[12px] uppercase font-bold hover:bg-[#f0eded] transition-all cursor-pointer",
                            children: "Cancel",
                          }),
                          (0, t.jsxs)("button", {
                            onClick: () => {
                              u && b
                                ? (r(
                                    g ||
                                      `${parseFloat(u).toFixed(4)}, ${parseFloat(b).toFixed(4)}`,
                                    u,
                                    b,
                                  ),
                                  s())
                                : C(
                                    "Please select a location on the map first.",
                                  );
                            },
                            disabled: !v,
                            style: {
                              background: "#7d12ff",
                              fontFamily: "Space Grotesk, sans-serif",
                              boxShadow: v ? "2px 2px 0 0 #000" : "none",
                            },
                            className:
                              "jsx-9eda48d4173a3903 flex-1 px-5 py-2.5 text-white border-[2px] border-black text-[12px] uppercase font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2",
                            children: [
                              (0, t.jsx)("span", {
                                className:
                                  "jsx-9eda48d4173a3903 material-symbols-outlined text-[16px]",
                                children: "check_circle",
                              }),
                              "Confirm Location",
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              (0, t.jsx)(c.default, {
                id: "9eda48d4173a3903",
                children:
                  "@keyframes spin{0%{transform:rotate(0)}to{transform:rotate(360deg)}}.animate-spin.jsx-9eda48d4173a3903{animation:1s linear infinite spin}gmp-place-autocomplete.jsx-9eda48d4173a3903.jsx-9eda48d4173a3903::part(input){background:0 0!important;border:none!important;outline:none!important;padding:10px 12px 10px 36px!important;font-family:inherit!important;font-size:13px!important}",
              }),
            ],
          })
        : null;
    }
    function x({ user: e, onSignOut: l }) {
      let [o, c] = (0, a.useState)("location"),
        [p, m] = (0, a.useState)("London"),
        [u, h] = (0, a.useState)("10"),
        [b, f] = (0, a.useState)("51.5074"),
        [g, y] = (0, a.useState)("-0.1278"),
        [j, w] = (0, a.useState)(""),
        [v, N] = (0, a.useState)(""),
        [k, S] = (0, a.useState)(""),
        [_, C] = (0, a.useState)(!1),
        [I, F] = (0, a.useState)([]),
        [R, z] = (0, a.useState)([]),
        [P, A] = (0, a.useState)([]),
        [M, L] = (0, a.useState)(""),
        [G, T] = (0, a.useState)(""),
        [q, E] = (0, a.useState)(""),
        [D, H] = (0, a.useState)(null),
        [O, Z] = (0, a.useState)(!1),
        [B, V] = (0, a.useState)(null),
        [W, Y] = (0, a.useState)(!1);
      function U(e, t, a, s) {
        let r = ((a - e) * Math.PI) / 180,
          l = ((s - t) * Math.PI) / 180,
          o =
            Math.sin(r / 2) * Math.sin(r / 2) +
            Math.cos((e * Math.PI) / 180) *
              Math.cos((a * Math.PI) / 180) *
              Math.sin(l / 2) *
              Math.sin(l / 2);
        return 2 * Math.atan2(Math.sqrt(o), Math.sqrt(1 - o)) * 6371;
      }
      ((0, a.useRef)(null),
        (0, a.useEffect)(() => {
          let e = localStorage.getItem("pingbazar_city"),
            t = localStorage.getItem("pingbazar_radius"),
            a = localStorage.getItem("pingbazar_lat"),
            s = localStorage.getItem("pingbazar_lng");
          (e && m(e), t && h(t), a && f(a), s && y(s));
          let r = localStorage.getItem("pingbazar_shop_name"),
            l = localStorage.getItem("pingbazar_shop_phone"),
            o = localStorage.getItem("pingbazar_shop_address");
          (r && L(r), l && T(l), o && E(o));
        }, []),
        (0, a.useEffect)(() => {
          if (!e) return;
          let t = (0, i.query)((0, n.aO)(r.db, "requests")),
            a = (0, i.onSnapshot)(t, (t) => {
              let a = [];
              (t.docChanges().forEach((t) => {
                if ("added" === t.type) {
                  let a = { id: t.doc.id, ...t.doc.data() };
                  a.buyerId !== e.uid &&
                    U(
                      parseFloat(b || "0"),
                      parseFloat(g || "0"),
                      parseFloat(a.lat?.toString() || "0"),
                      parseFloat(a.lng?.toString() || "0"),
                    ) <= parseFloat(u || "10") &&
                    (V({ title: a.title, city: a.city, id: a.id }),
                    setTimeout(() => V(null), 1e4));
                }
              }),
                t.forEach((e) => {
                  a.push({ id: e.id, ...e.data() });
                }),
                a.sort(
                  (e, t) =>
                    new Date(t.createdAt).getTime() -
                    new Date(e.createdAt).getTime(),
                ),
                F(a));
            }),
            s = (0, i.query)(
              (0, n.aO)(r.db, "responses"),
              (0, i.where)("buyerId", "==", e.uid),
            ),
            l = (0, i.query)(
              (0, n.aO)(r.db, "responses"),
              (0, i.where)("sellerId", "==", e.uid),
            ),
            o = new Map(),
            c = () => {
              z(Array.from(o.values()));
            },
            d = (0, i.onSnapshot)(s, (e) => {
              (e.forEach((e) => {
                o.set(e.id, { id: e.id, ...e.data() });
              }),
                c());
            }),
            x = (0, i.onSnapshot)(l, (e) => {
              (e.forEach((e) => {
                o.set(e.id, { id: e.id, ...e.data() });
              }),
                c());
            });
          return () => {
            (a(), d(), x());
          };
        }, [e, b, g, u]));
      let J = async (t) => {
          if ((t.preventDefault(), !j || !v))
            return alert("Please include a title and description.");
          if (e)
            try {
              (C(!0),
                await (0, i.addDoc)((0, n.aO)(r.db, "requests"), {
                  buyerId: e.uid,
                  buyerName: e.displayName || "Local Buyer",
                  title: j,
                  description: v,
                  image: k || "",
                  city: p || "London",
                  lat: parseFloat(b),
                  lng: parseFloat(g),
                  radius: parseFloat(u),
                  createdAt: new Date().toISOString(),
                }),
                w(""),
                N(""),
                S(""),
                alert("Your product request was posted successfully!"),
                c("my-needs"));
            } catch (e) {
              (console.error(e), alert("Error posting request: " + e));
            } finally {
              C(!1);
            }
        },
        $ = async (t) => {
          if ((t.preventDefault(), !M || !G || !q))
            return void alert(
              "Please provide your shop information before accepting.",
            );
          if (D && e) {
            if (R.some((t) => t.requestId === D.id && t.sellerId === e.uid)) {
              (alert("You have already responded to this request."), H(null));
              return;
            }
            try {
              (Z(!0),
                await (0, i.addDoc)((0, n.aO)(r.db, "responses"), {
                  requestId: D.id,
                  buyerId: D.buyerId,
                  sellerId: e.uid,
                  sellerName: e.displayName || "Local Seller",
                  shopName: M,
                  contactNumber: G,
                  shopLocation: q,
                  response: "yes",
                  createdAt: new Date().toISOString(),
                }),
                localStorage.setItem("pingbazar_shop_name", M),
                localStorage.setItem("pingbazar_shop_phone", G),
                localStorage.setItem("pingbazar_shop_address", q),
                H(null),
                alert(
                  "Offer sent! The buyer can now view your shop and contact details.",
                ));
            } catch (e) {
              (console.error(e), alert("Error responding to request: " + e));
            } finally {
              Z(!1);
            }
          }
        },
        Q = parseFloat(b || "0"),
        K = parseFloat(g || "0"),
        X = parseFloat(u || "10"),
        ee = I.filter((t) => {
          if (
            P.includes(t.id) ||
            t.buyerId === e.uid ||
            R.some((a) => a.requestId === t.id && a.sellerId === e.uid)
          )
            return !1;
          let a =
              U(
                Q,
                K,
                parseFloat(t.lat?.toString() || "0"),
                parseFloat(t.lng?.toString() || "0"),
              ) <= X,
            s =
              t.city &&
              p &&
              t.city.toLowerCase().trim() === p.toLowerCase().trim();
          return a || s;
        }),
        et = I.filter((t) => t.buyerId === e.uid);
      return (0, t.jsxs)("div", {
        className:
          "bg-background text-on-background font-body-lg min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-white",
        children: [
          (0, t.jsx)("div", {
            className:
              "fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none",
          }),
          B &&
            (0, t.jsxs)("div", {
              className:
                "fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 max-w-sm bg-tertiary-container border-[3px] border-black p-4 neo-brutal-shadow-lg flex items-center justify-between gap-3 animate-bounce",
              children: [
                (0, t.jsxs)("div", {
                  className: "flex items-center gap-2",
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-black font-bold animate-pulse text-[20px]",
                      children: "notifications_active",
                    }),
                    (0, t.jsxs)("div", {
                      children: [
                        (0, t.jsx)("p", {
                          className:
                            "font-meta-mono text-[10px] text-black font-bold uppercase tracking-wider",
                          children: "New Local Request",
                        }),
                        (0, t.jsx)("p", {
                          className:
                            "font-headline-sm text-sm font-black text-black leading-tight truncate",
                          children: B.title,
                        }),
                        (0, t.jsxs)("p", {
                          className:
                            "font-meta-mono text-[10px] text-black italic",
                          children: ["In ", B.city],
                        }),
                      ],
                    }),
                  ],
                }),
                (0, t.jsx)("button", {
                  onClick: () => V(null),
                  className:
                    "text-black font-headline-lg font-black text-xl hover:text-red-500 transition-colors cursor-pointer",
                  children: "×",
                }),
              ],
            }),
          (0, t.jsxs)("header", {
            className:
              "w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-20",
            children: [
              (0, t.jsx)(s.default, {
                href: "/",
                className: "flex items-center gap-2 cursor-pointer",
                children: (0, t.jsx)("span", {
                  className:
                    "font-display-lg text-xl sm:text-2xl lg:text-3xl italic tracking-tighter bg-primary-container text-white px-2 py-1 border-[2px] border-black",
                  children: "PINGBAZAR",
                }),
              }),
              (0, t.jsxs)("div", {
                className: "flex items-center gap-4",
                children: [
                  (0, t.jsxs)("div", {
                    className:
                      "hidden sm:flex flex-col text-right border-r-[2px] border-black pr-4 mr-1",
                    children: [
                      (0, t.jsx)("span", {
                        className:
                          "font-headline-sm text-sm font-bold truncate max-w-[150px]",
                        children: e.displayName || "USER",
                      }),
                      (0, t.jsx)("span", {
                        className:
                          "font-meta-mono text-[10px] text-secondary truncate max-w-[150px]",
                        children: e.email,
                      }),
                    ],
                  }),
                  (0, t.jsxs)("button", {
                    onClick: l,
                    className:
                      "px-3 py-1.5 sm:px-4 sm:py-2 bg-error-container text-on-error-container font-button-text text-[10px] sm:text-xs uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-1 cursor-pointer",
                    children: [
                      (0, t.jsx)("span", {
                        className: "material-symbols-outlined text-[14px]",
                        children: "logout",
                      }),
                      (0, t.jsx)("span", {
                        className: "hidden sm:inline",
                        children: "Sign Out",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, t.jsx)("div", {
            className: "w-full max-w-4xl mx-auto px-4 sm:px-6 z-20 mt-4",
            children: (0, t.jsxs)("div", {
              className:
                "grid grid-cols-5 bg-white border-[3px] border-black neo-brutal-shadow overflow-hidden",
              children: [
                (0, t.jsxs)("button", {
                  onClick: () => c("location"),
                  className: `py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${"location" === o ? "bg-primary-container text-white" : "bg-white text-black hover:bg-surface-container"}`,
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-[16px] sm:text-[18px]",
                      children: "location_on",
                    }),
                    (0, t.jsx)("span", {
                      className: "hidden md:inline",
                      children: "Location",
                    }),
                  ],
                }),
                (0, t.jsxs)("button", {
                  onClick: () => c("request"),
                  className: `py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${"request" === o ? "bg-primary-container text-white" : "bg-white text-black hover:bg-surface-container"}`,
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-[16px] sm:text-[18px]",
                      children: "add_photo_alternate",
                    }),
                    (0, t.jsx)("span", {
                      className: "hidden md:inline",
                      children: "Post Needs",
                    }),
                  ],
                }),
                (0, t.jsxs)("button", {
                  onClick: () => c("feed"),
                  className: `py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${"feed" === o ? "bg-primary-container text-white" : "bg-white text-black hover:bg-surface-container"}`,
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-[16px] sm:text-[18px]",
                      children: "dynamic_feed",
                    }),
                    (0, t.jsx)("span", {
                      className: "hidden md:inline",
                      children: "Local Feed",
                    }),
                  ],
                }),
                (0, t.jsxs)("button", {
                  onClick: () => c("my-needs"),
                  className: `py-3 px-1 sm:px-3 text-center border-r-[3px] border-black font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${"my-needs" === o ? "bg-primary-container text-white" : "bg-white text-black hover:bg-surface-container"}`,
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-[16px] sm:text-[18px]",
                      children: "shopping_bag",
                    }),
                    (0, t.jsx)("span", {
                      className: "hidden md:inline",
                      children: "My Needs",
                    }),
                  ],
                }),
                (0, t.jsxs)("button", {
                  onClick: () => c("seller-profile"),
                  className: `py-3 px-1 sm:px-3 text-center font-button-text text-[10px] sm:text-xs uppercase font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer ${"seller-profile" === o ? "bg-primary-container text-white" : "bg-white text-black hover:bg-surface-container"}`,
                  children: [
                    (0, t.jsx)("span", {
                      className:
                        "material-symbols-outlined text-[16px] sm:text-[18px]",
                      children: "storefront",
                    }),
                    (0, t.jsx)("span", {
                      className: "hidden md:inline",
                      children: "Shop Profile",
                    }),
                  ],
                }),
              ],
            }),
          }),
          (0, t.jsx)("main", {
            className:
              "flex-grow flex flex-col items-center max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-20",
            children: (0, t.jsxs)("div", {
              className:
                "bg-white border-[3px] border-black neo-brutal-shadow-lg p-5 sm:p-8 md:p-10 w-full relative",
              children: [
                (0, t.jsx)("div", {
                  className:
                    "absolute top-4 right-4 sm:top-5 sm:right-5 w-4 h-4 bg-tertiary-container border-[2px] border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                }),
                "location" === o &&
                  (0, t.jsxs)("div", {
                    className: "w-full",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase",
                        children: "🎯 Set Your Location",
                      }),
                      (0, t.jsx)("p", {
                        className:
                          "font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium",
                        children:
                          "Choose your location on the map or use GPS. Nearby product requests within your radius will appear in your Local Feed.",
                      }),
                      (0, t.jsxs)("div", {
                        className:
                          "mb-5 p-4 bg-surface-container border-[2px] border-black border-dashed flex items-center gap-4",
                        children: [
                          (0, t.jsx)("div", {
                            className:
                              "w-12 h-12 shrink-0 bg-primary-container border-[2px] border-black flex items-center justify-center",
                            children: (0, t.jsx)("span", {
                              className:
                                "material-symbols-outlined text-white text-[24px]",
                              children: "location_on",
                            }),
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex-grow min-w-0",
                            children: [
                              (0, t.jsx)("p", {
                                className:
                                  "font-button-text text-[10px] uppercase font-bold text-secondary mb-0.5",
                                children: "Current Location",
                              }),
                              (0, t.jsx)("p", {
                                className:
                                  "font-headline-sm text-sm sm:text-base font-black text-black truncate",
                                children: p || "No location set yet",
                              }),
                              b &&
                                g &&
                                (0, t.jsxs)("p", {
                                  className:
                                    "font-meta-mono text-[11px] text-secondary mt-0.5",
                                  children: [
                                    parseFloat(b).toFixed(4),
                                    ", ",
                                    parseFloat(g).toFixed(4),
                                  ],
                                }),
                            ],
                          }),
                          (0, t.jsxs)("button", {
                            onClick: () => Y(!0),
                            className:
                              "shrink-0 px-3 py-2 bg-white border-[2px] border-black font-button-text text-[11px] uppercase font-bold neo-brutal-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center gap-1.5 cursor-pointer",
                            children: [
                              (0, t.jsx)("span", {
                                className:
                                  "material-symbols-outlined text-[16px]",
                                children: "edit_location_alt",
                              }),
                              (0, t.jsx)("span", {
                                className: "hidden sm:inline",
                                children: "Change",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsx)("div", {
                        className: "flex flex-col sm:flex-row gap-3 mb-6",
                        children: (0, t.jsxs)("button", {
                          onClick: () => Y(!0),
                          className:
                            "flex-1 px-4 py-3.5 bg-white text-black font-button-text text-xs sm:text-sm uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "material-symbols-outlined text-[20px]",
                              children: "map",
                            }),
                            "Choose on Map",
                          ],
                        }),
                      }),
                      (0, t.jsxs)("div", {
                        className: "flex flex-col gap-2 mb-6",
                        children: [
                          (0, t.jsxs)("label", {
                            className:
                              "font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1",
                            children: [
                              (0, t.jsx)("span", {
                                className:
                                  "material-symbols-outlined text-[16px]",
                                children: "radar",
                              }),
                              "Search Radius",
                            ],
                          }),
                          (0, t.jsx)("div", {
                            className: "flex flex-wrap gap-2",
                            children: [
                              { value: "1", label: "1 km", sub: "Hyper Local" },
                              {
                                value: "5",
                                label: "5 km",
                                sub: "Neighbourhood",
                              },
                              { value: "10", label: "10 km", sub: "City" },
                              { value: "25", label: "25 km", sub: "Metro" },
                              { value: "50", label: "50 km", sub: "Regional" },
                            ].map((e) =>
                              (0, t.jsxs)(
                                "button",
                                {
                                  type: "button",
                                  onClick: () => h(e.value),
                                  className:
                                    "flex flex-col items-center px-3 py-2 border-[2px] border-black font-bold transition-all cursor-pointer min-w-[64px]",
                                  style: {
                                    background:
                                      u === e.value ? "#7d12ff" : "#fff",
                                    color: u === e.value ? "#fff" : "#000",
                                    boxShadow: (e.value, "2px 2px 0 0 #000"),
                                    fontFamily: "Space Grotesk, sans-serif",
                                  },
                                  children: [
                                    (0, t.jsx)("span", {
                                      className:
                                        "text-[14px] font-black leading-tight",
                                      children: e.label,
                                    }),
                                    (0, t.jsx)("span", {
                                      className:
                                        "text-[9px] uppercase leading-tight mt-0.5",
                                      style: {
                                        opacity: u === e.value ? 0.85 : 0.55,
                                      },
                                      children: e.sub,
                                    }),
                                  ],
                                },
                                e.value,
                              ),
                            ),
                          }),
                        ],
                      }),
                      (0, t.jsx)("div", {
                        className: "flex justify-end",
                        children: (0, t.jsxs)("button", {
                          onClick: () => {
                            p && b && g
                              ? (localStorage.setItem("pingbazar_city", p),
                                localStorage.setItem("pingbazar_radius", u),
                                localStorage.setItem("pingbazar_lat", b),
                                localStorage.setItem("pingbazar_lng", g),
                                alert(
                                  "Search criteria updated! Nearby requests will now refresh in your feed.",
                                ),
                                c("feed"))
                              : alert(
                                  "Please fill in a valid city name, latitude and longitude.",
                                );
                          },
                          className:
                            "w-full sm:w-auto px-6 py-3 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "material-symbols-outlined text-[18px]",
                              children: "check_circle",
                            }),
                            "Save & Continue",
                          ],
                        }),
                      }),
                    ],
                  }),
                "request" === o &&
                  (0, t.jsxs)("div", {
                    className: "w-full",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase",
                        children: "📸 Request Needs",
                      }),
                      (0, t.jsx)("p", {
                        className:
                          "font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium",
                        children:
                          "Describe the product what you want, upload a photo, and let nearby sellers view your reverse e-commerce listing.",
                      }),
                      (0, t.jsxs)("form", {
                        onSubmit: J,
                        className: "flex flex-col gap-5 sm:gap-6",
                        children: [
                          (0, t.jsxs)("div", {
                            className: "flex flex-col gap-1.5 sm:gap-2",
                            children: [
                              (0, t.jsx)("label", {
                                className:
                                  "font-button-text text-[11px] text-black uppercase font-bold",
                                children: "Title of product",
                              }),
                              (0, t.jsx)("input", {
                                type: "text",
                                required: !0,
                                placeholder:
                                  "E.g. Vintage Leather Jacket, High-End Headphones...",
                                value: j,
                                onChange: (e) => w(e.target.value),
                                className:
                                  "w-full bg-white border-[2px] border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100",
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col gap-1.5 sm:gap-2",
                            children: [
                              (0, t.jsx)("label", {
                                className:
                                  "font-button-text text-[11px] text-black uppercase font-bold",
                                children:
                                  "Description of product what you want",
                              }),
                              (0, t.jsx)("textarea", {
                                required: !0,
                                rows: 4,
                                placeholder:
                                  "Describe specific features, brand, condition, size, etc.",
                                value: v,
                                onChange: (e) => N(e.target.value),
                                className:
                                  "w-full bg-white border-[2px] border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100",
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className:
                              "flex flex-col sm:flex-row items-center gap-4 border-[2px] border-black border-dashed p-4 sm:p-5 bg-surface-container",
                            children: [
                              (0, t.jsxs)("div", {
                                className: "flex flex-col flex-grow gap-1",
                                children: [
                                  (0, t.jsxs)("label", {
                                    className:
                                      "font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1",
                                    children: [
                                      (0, t.jsx)("span", {
                                        className:
                                          "material-symbols-outlined text-[16px]",
                                        children: "file_upload",
                                      }),
                                      "Product Image Upload (Optional)",
                                    ],
                                  }),
                                  (0, t.jsx)("input", {
                                    type: "file",
                                    accept: "image/*",
                                    onChange: (e) => {
                                      let t = e.target.files?.[0];
                                      if (!t) return;
                                      let a = new FileReader();
                                      ((a.onloadend = () => {
                                        S(a.result);
                                      }),
                                        a.readAsDataURL(t));
                                    },
                                    className:
                                      "text-xs font-meta-mono file:mr-4 file:py-2 file:px-4 file:border-[2px] file:border-black file:neo-brutal-shadow file:bg-white file:text-black file:uppercase file:font-bold file:text-xs cursor-pointer hover:file:bg-surface-container file:transition-all",
                                  }),
                                ],
                              }),
                              k &&
                                (0, t.jsxs)("div", {
                                  className:
                                    "relative border-[2px] border-black w-24 h-24 bg-white p-1 shrink-0 overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center",
                                  children: [
                                    (0, t.jsx)("img", {
                                      src: k,
                                      alt: "Base64 Preview",
                                      className:
                                        "max-w-full max-h-full object-contain",
                                    }),
                                    (0, t.jsx)("button", {
                                      type: "button",
                                      onClick: () => S(""),
                                      className:
                                        "absolute top-0 right-0 bg-error-container text-on-error-container font-black border-l-[2px] border-b-[2px] border-black px-1.5 text-xs hover:bg-red-500 cursor-pointer",
                                      children: "×",
                                    }),
                                  ],
                                }),
                            ],
                          }),
                          (0, t.jsx)("div", {
                            className: "flex justify-end mt-2",
                            children: (0, t.jsxs)("button", {
                              type: "submit",
                              disabled: _,
                              className:
                                "w-full sm:w-auto px-6 py-3.5 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer",
                              children: [
                                (0, t.jsx)("span", {
                                  className:
                                    "material-symbols-outlined text-[18px]",
                                  children: "publish",
                                }),
                                _ ? "Publishing..." : "Post This Request",
                              ],
                            }),
                          }),
                        ],
                      }),
                    ],
                  }),
                "feed" === o &&
                  (0, t.jsxs)("div", {
                    className: "w-full",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase",
                        children: "📡 Local Feed",
                      }),
                      (0, t.jsx)("p", {
                        className:
                          "font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium",
                        children:
                          "Location-based requests will appear below. Accept or dismiss items based on your current shop availability.",
                      }),
                      0 === ee.length
                        ? (0, t.jsxs)("div", {
                            className:
                              "bg-surface-container border-[2px] border-black border-dashed p-6 sm:p-10 text-center flex flex-col items-center gap-3",
                            children: [
                              (0, t.jsx)("span", {
                                className:
                                  "material-symbols-outlined text-[36px] sm:text-[48px] text-primary-container animate-pulse",
                                children: "local_mall",
                              }),
                              (0, t.jsx)("p", {
                                className:
                                  "font-headline-sm text-sm sm:text-base font-black",
                                children:
                                  "No requests matched within your specified criteria.",
                              }),
                              (0, t.jsx)("p", {
                                className:
                                  "font-meta-mono text-[11px] sm:text-[12px] text-secondary",
                                children:
                                  "Try modifying your target radius or latitude and longitude settings under the Location tab.",
                              }),
                            ],
                          })
                        : (0, t.jsx)("div", {
                            className: "grid grid-cols-1 md:grid-cols-2 gap-5",
                            children: ee.map((e) =>
                              (0, t.jsxs)(
                                "div",
                                {
                                  className:
                                    "bg-white border-[3px] border-black p-4 neo-brutal-shadow relative flex flex-col justify-between",
                                  children: [
                                    (0, t.jsxs)("div", {
                                      children: [
                                        e.image &&
                                          (0, t.jsx)("div", {
                                            className:
                                              "border-[2px] border-black w-full h-44 sm:h-48 bg-surface-container mb-4 flex items-center justify-center overflow-hidden",
                                            children: (0, t.jsx)("img", {
                                              src: e.image,
                                              alt: e.title,
                                              className:
                                                "max-w-full max-h-full object-contain",
                                            }),
                                          }),
                                        (0, t.jsxs)("span", {
                                          className:
                                            "inline-flex items-center gap-1 bg-tertiary-container text-on-tertiary-container text-[9px] font-meta-mono px-2 py-0.5 border-[1.5px] border-black mb-2 uppercase font-bold tracking-wider",
                                          children: [
                                            (0, t.jsx)("span", {
                                              className:
                                                "material-symbols-outlined text-[12px]",
                                              children: "location_on",
                                            }),
                                            e.city,
                                            " (",
                                            U(Q, K, e.lat, e.lng).toFixed(1),
                                            " km)",
                                          ],
                                        }),
                                        (0, t.jsx)("h3", {
                                          className:
                                            "font-headline-sm text-[16px] sm:text-[18px] font-black text-black uppercase mb-1 leading-snug",
                                          children: e.title,
                                        }),
                                        (0, t.jsx)("p", {
                                          className:
                                            "font-body-sm text-[12px] sm:text-[13px] text-secondary mb-4 line-clamp-3",
                                          children: e.description,
                                        }),
                                        (0, t.jsxs)("p", {
                                          className:
                                            "font-meta-mono text-[10px] text-black font-bold uppercase mb-4",
                                          children: [
                                            "Requested by: ",
                                            e.buyerName,
                                          ],
                                        }),
                                      ],
                                    }),
                                    (0, t.jsxs)("div", {
                                      className: "flex gap-2",
                                      children: [
                                        (0, t.jsxs)("button", {
                                          onClick: () => H(e),
                                          className:
                                            "flex-grow py-2.5 bg-primary-container text-white font-button-text text-[11px] uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1.5 cursor-pointer",
                                          children: [
                                            (0, t.jsx)("span", {
                                              className:
                                                "material-symbols-outlined text-[16px]",
                                              children: "check",
                                            }),
                                            "Yes, I have it",
                                          ],
                                        }),
                                        (0, t.jsxs)("button", {
                                          onClick: () => A((t) => [...t, e.id]),
                                          className:
                                            "px-3 py-2.5 bg-white text-black font-button-text text-[11px] uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all flex items-center justify-center gap-1 cursor-pointer",
                                          children: [
                                            (0, t.jsx)("span", {
                                              className:
                                                "material-symbols-outlined text-[16px]",
                                              children: "close",
                                            }),
                                            "No",
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                    ],
                  }),
                "my-needs" === o &&
                  (0, t.jsxs)("div", {
                    className: "w-full",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase",
                        children: "📦 My Needs & Offers",
                      }),
                      (0, t.jsx)("p", {
                        className:
                          "font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium",
                        children:
                          "Review your posted requests. When nearby local sellers accept, their physical shop and phone details immediately appear here.",
                      }),
                      0 === et.length
                        ? (0, t.jsxs)("div", {
                            className:
                              "bg-surface-container border-[2px] border-black border-dashed p-6 sm:p-10 text-center flex flex-col items-center gap-3",
                            children: [
                              (0, t.jsx)("span", {
                                className:
                                  "material-symbols-outlined text-[36px] sm:text-[48px] text-secondary animate-pulse",
                                children: "receipt_long",
                              }),
                              (0, t.jsx)("p", {
                                className:
                                  "font-headline-sm text-sm sm:text-base font-black",
                                children:
                                  "You have not posted any reverse e-commerce needs yet.",
                              }),
                              (0, t.jsx)("p", {
                                className:
                                  "font-meta-mono text-[11px] sm:text-[12px] text-secondary",
                                children:
                                  'Go to the "Post Needs" tab to describe products and begin matching with shops.',
                              }),
                            ],
                          })
                        : (0, t.jsx)("div", {
                            className: "flex flex-col gap-6",
                            children: et.map((e) => {
                              let a = R.filter((t) => t.requestId === e.id);
                              return (0, t.jsxs)(
                                "div",
                                {
                                  className:
                                    "bg-white border-[3px] border-black p-4 sm:p-6 neo-brutal-shadow flex flex-col gap-4",
                                  children: [
                                    (0, t.jsxs)("div", {
                                      className:
                                        "flex flex-col md:flex-row gap-4 items-start md:items-center justify-between border-b-[2px] border-black border-dashed pb-4",
                                      children: [
                                        (0, t.jsxs)("div", {
                                          className:
                                            "flex flex-col gap-1 flex-grow",
                                          children: [
                                            (0, t.jsxs)("span", {
                                              className:
                                                "inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container text-[9px] font-meta-mono px-2 py-0.5 border-[1.5px] border-black w-fit uppercase font-bold tracking-wider mb-1",
                                              children: [
                                                (0, t.jsx)("span", {
                                                  className:
                                                    "material-symbols-outlined text-[12px]",
                                                  children: "schedule",
                                                }),
                                                new Date(
                                                  e.createdAt,
                                                ).toLocaleDateString(),
                                              ],
                                            }),
                                            (0, t.jsx)("h3", {
                                              className:
                                                "font-headline-sm text-[16px] sm:text-[18px] font-black text-black uppercase mb-1 leading-snug",
                                              children: e.title,
                                            }),
                                            (0, t.jsx)("p", {
                                              className:
                                                "font-body-sm text-[12px] sm:text-[13px] text-secondary",
                                              children: e.description,
                                            }),
                                          ],
                                        }),
                                        e.image &&
                                          (0, t.jsx)("div", {
                                            className:
                                              "border-[2px] border-black w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-surface-container flex items-center justify-center overflow-hidden p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                                            children: (0, t.jsx)("img", {
                                              src: e.image,
                                              alt: "Request Preview",
                                              className:
                                                "max-w-full max-h-full object-contain",
                                            }),
                                          }),
                                      ],
                                    }),
                                    (0, t.jsxs)("div", {
                                      className: "flex flex-col gap-3",
                                      children: [
                                        (0, t.jsxs)("h4", {
                                          className:
                                            "font-headline-sm text-sm font-black uppercase text-black flex items-center gap-1.5 border-b-[1.5px] border-black pb-1",
                                          children: [
                                            (0, t.jsx)("span", {
                                              className:
                                                "material-symbols-outlined text-[18px]",
                                              children:
                                                "connect_without_contact",
                                            }),
                                            "Seller Responses (",
                                            a.length,
                                            ")",
                                          ],
                                        }),
                                        0 === a.length
                                          ? (0, t.jsx)("p", {
                                              className:
                                                "font-meta-mono text-[11px] text-secondary italic",
                                              children:
                                                "No responses have been submitted by local sellers yet. Please check back soon.",
                                            })
                                          : (0, t.jsx)("div", {
                                              className:
                                                "grid grid-cols-1 md:grid-cols-2 gap-3 mt-1",
                                              children: a.map((e) =>
                                                (0, t.jsxs)(
                                                  "div",
                                                  {
                                                    className:
                                                      "bg-surface-container border-[2px] border-black p-3.5 neo-brutal-shadow flex flex-col gap-2 relative",
                                                    children: [
                                                      (0, t.jsx)("span", {
                                                        className:
                                                          "absolute top-3 right-3 material-symbols-outlined text-green-600 font-black text-[22px]",
                                                        children: "verified",
                                                      }),
                                                      (0, t.jsxs)("div", {
                                                        children: [
                                                          (0, t.jsx)("h5", {
                                                            className:
                                                              "font-headline-sm text-[13px] sm:text-[14px] font-black text-black uppercase",
                                                            children:
                                                              e.shopName,
                                                          }),
                                                          (0, t.jsxs)("p", {
                                                            className:
                                                              "font-meta-mono text-[10px] sm:text-[11px] text-secondary uppercase font-semibold",
                                                            children: [
                                                              "Location: ",
                                                              e.shopLocation,
                                                            ],
                                                          }),
                                                        ],
                                                      }),
                                                      (0, t.jsxs)("div", {
                                                        className:
                                                          "flex items-center gap-1.5 border-t-[1.5px] border-black border-dashed pt-2 mt-1",
                                                        children: [
                                                          (0, t.jsx)("span", {
                                                            className:
                                                              "material-symbols-outlined text-black font-bold text-[16px]",
                                                            children: "call",
                                                          }),
                                                          (0, t.jsx)("span", {
                                                            className:
                                                              "font-meta-mono text-[11px] sm:text-[12px] font-bold text-black select-all",
                                                            children:
                                                              e.contactNumber,
                                                          }),
                                                        ],
                                                      }),
                                                    ],
                                                  },
                                                  e.id,
                                                ),
                                              ),
                                            }),
                                      ],
                                    }),
                                  ],
                                },
                                e.id,
                              );
                            }),
                          }),
                    ],
                  }),
                "seller-profile" === o &&
                  (0, t.jsxs)("div", {
                    className: "w-full",
                    children: [
                      (0, t.jsx)("h2", {
                        className:
                          "font-headline-lg text-[22px] sm:text-[28px] md:text-[34px] font-black mb-1 leading-tight uppercase",
                        children: "🏪 Shop Profile",
                      }),
                      (0, t.jsx)("p", {
                        className:
                          "font-body-md text-[13px] sm:text-[15px] text-secondary mb-6 font-medium",
                        children:
                          "Sellers, optimize your profile details. They are immediately saved to persistent local storage and are populated for you whenever you accept a product request.",
                      }),
                      (0, t.jsxs)("div", {
                        className:
                          "flex flex-col gap-4 sm:gap-5 bg-surface-container border-[2px] border-black border-dashed p-4 sm:p-6 mb-6",
                        children: [
                          (0, t.jsxs)("div", {
                            className: "flex flex-col gap-1.5 sm:gap-2",
                            children: [
                              (0, t.jsxs)("label", {
                                className:
                                  "font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1",
                                children: [
                                  (0, t.jsx)("span", {
                                    className:
                                      "material-symbols-outlined text-[16px]",
                                    children: "store",
                                  }),
                                  "Your Shop Name",
                                ],
                              }),
                              (0, t.jsx)("input", {
                                type: "text",
                                required: !0,
                                placeholder: "E.g. Vintage Apparel & Co.",
                                value: M,
                                onChange: (e) => L(e.target.value),
                                className:
                                  "w-full bg-white border-[2px] border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100",
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col gap-1.5 sm:gap-2",
                            children: [
                              (0, t.jsxs)("label", {
                                className:
                                  "font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1",
                                children: [
                                  (0, t.jsx)("span", {
                                    className:
                                      "material-symbols-outlined text-[16px]",
                                    children: "call",
                                  }),
                                  "Your Shop Contact Number",
                                ],
                              }),
                              (0, t.jsx)("input", {
                                type: "tel",
                                required: !0,
                                placeholder: "E.g. +1234567890",
                                value: G,
                                onChange: (e) => T(e.target.value),
                                className:
                                  "w-full bg-white border-[2px] border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100",
                              }),
                            ],
                          }),
                          (0, t.jsxs)("div", {
                            className: "flex flex-col gap-1.5 sm:gap-2",
                            children: [
                              (0, t.jsxs)("label", {
                                className:
                                  "font-button-text text-[11px] text-black uppercase font-bold flex items-center gap-1",
                                children: [
                                  (0, t.jsx)("span", {
                                    className:
                                      "material-symbols-outlined text-[16px]",
                                    children: "pin_drop",
                                  }),
                                  "Your Shop Physical Address / Location",
                                ],
                              }),
                              (0, t.jsx)("input", {
                                type: "text",
                                required: !0,
                                placeholder: "E.g. 123 High Street, London",
                                value: q,
                                onChange: (e) => E(e.target.value),
                                className:
                                  "w-full bg-white border-[2px] border-black font-meta-mono text-[13px] px-3 py-2.5 sm:px-4 sm:py-3 neo-brutal-shadow focus:outline-none transition-all duration-100",
                              }),
                            ],
                          }),
                        ],
                      }),
                      (0, t.jsx)("div", {
                        className: "flex justify-end",
                        children: (0, t.jsxs)("button", {
                          onClick: () => {
                            M && G && q
                              ? (localStorage.setItem("pingbazar_shop_name", M),
                                localStorage.setItem("pingbazar_shop_phone", G),
                                localStorage.setItem(
                                  "pingbazar_shop_address",
                                  q,
                                ),
                                alert("Seller details updated successfully!"))
                              : alert("Please enter all seller information.");
                          },
                          className:
                            "w-full sm:w-auto px-6 py-3.5 bg-primary-container text-white font-button-text text-sm uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "material-symbols-outlined text-[18px]",
                              children: "save",
                            }),
                            "Update Seller Profile",
                          ],
                        }),
                      }),
                    ],
                  }),
              ],
            }),
          }),
          (0, t.jsxs)("footer", {
            className:
              "w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center font-meta-mono text-[10px] sm:text-[12px] text-secondary relative z-20 border-t-[3px] border-black bg-white",
            children: [
              "© ",
              new Date().getFullYear(),
              " PINGBAZAR PROTOCOL. ALL RIGHTS RESERVED.",
            ],
          }),
          D &&
            (0, t.jsxs)("div", {
              className:
                "fixed inset-0 z-[9999] flex items-center justify-center p-4",
              children: [
                (0, t.jsx)("div", {
                  className: "absolute inset-0 bg-black/80 backdrop-blur-md",
                  onClick: () => H(null),
                }),
                (0, t.jsxs)("div", {
                  className:
                    "bg-white border-[4px] border-black p-6 sm:p-10 relative neo-brutal-shadow-lg flex flex-col gap-6 max-h-[90vh] overflow-y-auto z-10 w-full",
                  style: { maxWidth: "540px", width: "100%" },
                  onClick: (e) => e.stopPropagation(),
                  children: [
                    (0, t.jsx)("button", {
                      onClick: () => H(null),
                      className:
                        "absolute top-4 right-4 text-black hover:text-red-500 transition-colors cursor-pointer text-3xl font-black leading-none",
                      "aria-label": "Close modal",
                      children: "×",
                    }),
                    (0, t.jsxs)("div", {
                      className: "pr-8",
                      children: [
                        (0, t.jsx)("h3", {
                          className:
                            "font-headline-sm text-2xl sm:text-3xl font-black text-black leading-tight uppercase mb-2",
                          children: "Offer Fulfillment Details",
                        }),
                        (0, t.jsx)("p", {
                          className:
                            "font-body-sm text-sm text-secondary font-medium",
                          children:
                            "Confirm your physical shop presence and contact details for the buyer to contact you directly.",
                        }),
                      ],
                    }),
                    (0, t.jsxs)("form", {
                      onSubmit: $,
                      className: "flex flex-col gap-5",
                      children: [
                        (0, t.jsxs)("div", {
                          className: "flex flex-col gap-2",
                          children: [
                            (0, t.jsx)("label", {
                              className:
                                "font-button-text text-[11px] font-bold uppercase text-black",
                              children: "Shop Name",
                            }),
                            (0, t.jsx)("input", {
                              type: "text",
                              required: !0,
                              placeholder: "Your Shop Name",
                              value: M,
                              onChange: (e) => L(e.target.value),
                              className:
                                "w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all",
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className: "flex flex-col gap-2",
                          children: [
                            (0, t.jsx)("label", {
                              className:
                                "font-button-text text-[11px] font-bold uppercase text-black",
                              children: "Contact Number",
                            }),
                            (0, t.jsx)("input", {
                              type: "tel",
                              required: !0,
                              placeholder: "Your Shop Phone/WhatsApp Number",
                              value: G,
                              onChange: (e) => T(e.target.value),
                              className:
                                "w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all",
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className: "flex flex-col gap-2",
                          children: [
                            (0, t.jsx)("label", {
                              className:
                                "font-button-text text-[11px] font-bold uppercase text-black",
                              children: "Shop Location",
                            }),
                            (0, t.jsx)("input", {
                              type: "text",
                              required: !0,
                              placeholder: "Your Shop Address / Location",
                              value: q,
                              onChange: (e) => E(e.target.value),
                              className:
                                "w-full bg-white border-[3px] border-black font-meta-mono text-[14px] px-4 py-3 neo-brutal-shadow focus:outline-none focus:ring-2 focus:ring-primary-container transition-all",
                            }),
                          ],
                        }),
                        (0, t.jsxs)("div", {
                          className:
                            "flex flex-col sm:flex-row justify-end gap-3 pt-4",
                          children: [
                            (0, t.jsx)("button", {
                              type: "button",
                              onClick: () => H(null),
                              className:
                                "px-6 py-3 bg-white text-black font-button-text text-xs uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer min-w-[120px]",
                              children: "Cancel",
                            }),
                            (0, t.jsxs)("button", {
                              type: "submit",
                              disabled: O,
                              className:
                                "px-8 py-3 bg-primary-container text-white font-button-text text-xs uppercase font-bold border-[3px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer flex-grow sm:flex-grow-0",
                              children: [
                                (0, t.jsx)("span", {
                                  className:
                                    "material-symbols-outlined text-[20px]",
                                  children: "send",
                                }),
                                O ? "Submitting..." : "Send Shop Info",
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          (0, t.jsx)(d, {
            isOpen: W,
            onClose: () => Y(!1),
            onConfirm: (e, t, a) => {
              (m(e || "Selected Location"),
                f(t),
                y(a),
                localStorage.setItem(
                  "pingbazar_city",
                  e || "Selected Location",
                ),
                localStorage.setItem("pingbazar_lat", t),
                localStorage.setItem("pingbazar_lng", a),
                localStorage.setItem("pingbazar_radius", u));
            },
            initialLat: b,
            initialLng: g,
          }),
        ],
      });
    }
    e.s(
      [
        "default",
        0,
        function () {
          let [e, n] = (0, a.useState)(null),
            [i, c] = (0, a.useState)(!0);
          (0, a.useEffect)(() => {
            let e = (0, l.z)(r.auth, (e) => {
              (n(e), c(!1));
            });
            return () => e();
          }, []);
          let d = async () => {
            try {
              (await (0, o.D)(r.auth), n(null));
            } catch (e) {
              console.error("Error signing out:", e);
            }
          };
          return i
            ? (0, t.jsx)("div", {
                className:
                  "bg-background text-on-background font-body-lg min-h-screen flex items-center justify-center p-4",
                children: (0, t.jsxs)("div", {
                  className:
                    "flex flex-col items-center gap-4 bg-white p-6 border-[3px] border-black neo-brutal-shadow-lg",
                  children: [
                    (0, t.jsxs)("svg", {
                      className:
                        "animate-spin h-10 w-10 text-primary-container",
                      viewBox: "0 0 24 24",
                      children: [
                        (0, t.jsx)("circle", {
                          className: "opacity-25",
                          cx: "12",
                          cy: "12",
                          r: "10",
                          stroke: "currentColor",
                          strokeWidth: "4",
                          fill: "none",
                        }),
                        (0, t.jsx)("path", {
                          className: "opacity-75",
                          fill: "currentColor",
                          d: "M4 12a8 8 0 018-8v8H4z",
                        }),
                      ],
                    }),
                    (0, t.jsx)("p", {
                      className: "font-meta-mono text-sm uppercase font-bold",
                      children: "Connecting to PingBazar...",
                    }),
                  ],
                }),
              })
            : e
              ? (0, t.jsx)(x, { user: e, onSignOut: d })
              : (0, t.jsxs)("div", {
                  className:
                    "bg-background text-on-background font-body-lg min-h-screen flex flex-col justify-between relative overflow-x-hidden selection:bg-primary-container selection:text-white",
                  children: [
                    (0, t.jsx)("div", {
                      className:
                        "fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdHRoIGQ9Ik0gNDAgMCBMIDAgMCAwIDQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlNWUyZTEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-60 z-0 pointer-events-none",
                    }),
                    (0, t.jsxs)("header", {
                      className:
                        "w-full max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center relative z-20",
                      children: [
                        (0, t.jsx)(s.default, {
                          href: "/",
                          className: "flex items-center gap-2",
                          children: (0, t.jsx)("span", {
                            className:
                              "font-display-lg text-2xl sm:text-3xl lg:text-4xl italic tracking-tighter bg-primary-container text-white px-2 py-1 border-[2px] border-black",
                            children: "PINGBAZAR",
                          }),
                        }),
                        (0, t.jsxs)("div", {
                          className: "flex items-center gap-3",
                          children: [
                            (0, t.jsx)(s.default, {
                              href: "/login",
                              className:
                                "hidden sm:block px-4 py-2 bg-white text-black font-button-text text-sm uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer",
                              children: "Log In",
                            }),
                            (0, t.jsxs)(s.default, {
                              href: "/signup",
                              className:
                                "px-4 py-2 sm:px-5 sm:py-2.5 bg-tertiary-container text-on-tertiary-container font-button-text text-xs sm:text-sm uppercase font-bold border-[2px] border-black neo-brutal-shadow hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center gap-2 cursor-pointer",
                              children: [
                                "Sign Up",
                                (0, t.jsx)("span", {
                                  className:
                                    "material-symbols-outlined text-[16px] sm:text-[18px]",
                                  children: "arrow_forward",
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    (0, t.jsxs)("main", {
                      className:
                        "flex-grow flex flex-col justify-center items-center max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-20 py-10",
                      children: [
                        (0, t.jsxs)("div", {
                          className:
                            "inline-flex items-center gap-2 bg-secondary-container text-on-secondary-container border-[2px] border-black px-3 py-1 mb-6 sm:mb-8 font-meta-mono text-[10px] sm:text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                          children: [
                            (0, t.jsx)("span", {
                              className:
                                "material-symbols-outlined text-[14px]",
                              children: "radar",
                            }),
                            (0, t.jsx)("span", {
                              children: "Reverse E-Commerce Redefined",
                            }),
                          ],
                        }),
                        (0, t.jsxs)("h1", {
                          className:
                            "font-display-xl text-[32px] sm:text-[44px] md:text-[56px] lg:text-[72px] leading-[1.1] text-black tracking-tight mb-6 max-w-4xl mx-auto break-words hyphens-auto",
                          children: [
                            "Find Products Through ",
                            (0, t.jsx)("br", { className: "hidden sm:block" }),
                            (0, t.jsx)("span", {
                              className:
                                "inline-block bg-primary-container text-white px-3 py-1 mt-2 border-[3px] border-black transform -rotate-2",
                              children: "Local Sellers Near You",
                            }),
                          ],
                        }),
                        (0, t.jsx)("p", {
                          className:
                            "font-body-lg text-[15px] sm:text-[18px] lg:text-[20px] text-secondary max-w-2xl mb-10 leading-relaxed mx-auto px-2",
                          children:
                            "Describe what you need, upload a photo, and get instant responses from nearby sellers with correct shop details and locations.",
                        }),
                        (0, t.jsx)("div", {
                          className:
                            "flex flex-col sm:flex-row items-center gap-4 justify-center w-full",
                          children: (0, t.jsxs)(s.default, {
                            href: "/signup",
                            className:
                              "w-full sm:w-auto px-6 py-4 bg-primary-container text-white font-button-text text-sm sm:text-base uppercase font-bold border-[3px] border-black neo-brutal-shadow-lg hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none transition-all flex items-center justify-center gap-3 cursor-pointer",
                            children: [
                              (0, t.jsx)("span", {
                                className: "material-symbols-outlined",
                                children: "rocket_launch",
                              }),
                              "Create My Account",
                            ],
                          }),
                        }),
                      ],
                    }),
                    (0, t.jsxs)("footer", {
                      className:
                        "w-full max-w-7xl mx-auto px-4 py-6 sm:py-8 text-center font-meta-mono text-[10px] sm:text-[12px] text-secondary relative z-20 border-t-[3px] border-black bg-white",
                      children: [
                        "© ",
                        new Date().getFullYear(),
                        " PINGBAZAR PROTOCOL. ALL RIGHTS RESERVED.",
                      ],
                    }),
                  ],
                });
        },
      ],
      18202,
    );
  },
]);
