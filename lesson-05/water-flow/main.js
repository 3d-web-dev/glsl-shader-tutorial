"use strict";
(function (g) {
  "function" === typeof define && define.amd ? define(g) : g();
})(function () {
  function g(e, d) {
    for (var a = 0; a < d.length; a++) {
      var b = d[a];
      b.enumerable = b.enumerable || !1;
      b.configurable = !0;
      "value" in b && (b.writable = !0);
      Object.defineProperty(e, b.key, b);
    }
  }
  function q(e, d, a) {
    d && g(e.prototype, d);
    a && g(e, a);
    return e;
  }
  function r(e, d) {
    if ("function" !== typeof d && null !== d)
      throw new TypeError("Super expression must either be null or a function");
    e.prototype = Object.create(d && d.prototype, {
      constructor: { value: e, writable: !0, configurable: !0 },
    });
    d && h(e, d);
  }
  function k(e) {
    k = Object.setPrototypeOf
      ? Object.getPrototypeOf
      : function (d) {
          return d.__proto__ || Object.getPrototypeOf(d);
        };
    return k(e);
  }
  function h(e, d) {
    h =
      Object.setPrototypeOf ||
      function (a, b) {
        a.__proto__ = b;
        return a;
      };
    return h(e, d);
  }
  function t() {
    if (
      "undefined" === typeof Reflect ||
      !Reflect.construct ||
      Reflect.construct.sham
    )
      return !1;
    if ("function" === typeof Proxy) return !0;
    try {
      return (
        Date.prototype.toString.call(
          Reflect.construct(Date, [], function () {})
        ),
        !0
      );
    } catch (e) {
      return !1;
    }
  }
  function l(e, d, a) {
    l = t()
      ? Reflect.construct
      : function (a, c, f) {
          var b = [null];
          b.push.apply(b, c);
          a = new (Function.bind.apply(a, b))();
          f && h(a, f.prototype);
          return a;
        };
    return l.apply(null, arguments);
  }
  function m(e) {
    var d = "function" === typeof Map ? new Map() : void 0;
    m = function (a) {
      function b() {
        return l(a, arguments, k(this).constructor);
      }
      if (
        null === a ||
        -1 === Function.toString.call(a).indexOf("[native code]")
      )
        return a;
      if ("function" !== typeof a)
        throw new TypeError(
          "Super expression must either be null or a function"
        );
      if ("undefined" !== typeof d) {
        if (d.has(a)) return d.get(a);
        d.set(a, b);
      }
      b.prototype = Object.create(a.prototype, {
        constructor: {
          value: b,
          enumerable: !1,
          writable: !0,
          configurable: !0,
        },
      });
      return h(b, a);
    };
    return m(e);
  }
  var n = document.createElement("template");
  n.innerHTML =
    "\n<style>\n  :host {\n    position: relative;\n    display: inline-block;\n    width: 250px;\n    height: 250px;\n  }\n  :host > canvas {\n    position: absolute;\n    top: 0;\n    left: 0;\n    height: 100%;\n    width: 100%;\n    border-radius: inherit;\n   }\n</style>\n";
  var p = /\(\s*out\s+vec4\s+(\S+)\s*,\s*in\s+vec2\s+(\S+)\s*\)/,
    u = (function (e) {
      function d() {
        if (!(this instanceof d))
          throw new TypeError("Cannot call a class as a function");
        var a = k(d).call(this);
        if (!a || ("object" !== typeof a && "function" !== typeof a)) {
          if (void 0 === this)
            throw new ReferenceError(
              "this hasn't been initialised - super() hasn't been called"
            );
          a = this;
        }
        a.shadow = a.attachShadow({ mode: "open" });
        a.shadow.appendChild(n.content.cloneNode(!0));
        return a;
      }
      r(d, e);
      q(d, [
        {
          key: "connectedCallback",
          value: function () {
            var a = this;
            this.mounted = !0;
            setTimeout(function () {
              if (!a.textContent.trim()) return !1;
              try {
                a.init();
              } catch (b) {
                (a.textContent = ""),
                  console.error((b && b.message) || "Error in shader-doodle.");
              }
            });
          },
        },
        {
          key: "disconnectedCallback",
          value: function () {
            this.mounted = !1;
            this.canvas.removeEventListener("mousedown", this.mouseDown);
            this.canvas.removeEventListener("mousemove", this.mouseMove);
            this.canvas.removeEventListener("mouseup", this.mouseUp);
            clearAnimationFrame(this.animationFrame);
          },
        },
        {
          key: "init",
          value: function () {
            var a = this;
            this.useST = this.hasAttribute("shadertoy");
            var b = this.textContent;
            this.uniforms = {
              resolution: {
                name: this.useST ? "iResolution" : "u_resolution",
                type: "vec2",
                value: [0, 0],
              },
              time: {
                name: this.useST ? "iTime" : "u_time",
                type: "float",
                value: 0,
              },
              delta: {
                name: this.useST ? "iTimeDelta" : "u_delta",
                type: "float",
                value: 0,
              },
              date: {
                name: this.useST ? "iDate" : "u_date",
                type: "vec4",
                value: [0, 0, 0, 0],
              },
              frame: {
                name: this.useST ? "iFrame" : "u_frame",
                type: "int",
                value: 0,
              },
              mouse: {
                name: this.useST ? "iMouse" : "u_mouse",
                type: this.useST ? "vec4" : "vec2",
                value: this.useST ? [0, 0, 0, 0] : [0, 0],
              },
            };
            this.canvas = document.createElement("canvas");
            this.shadow.appendChild(this.canvas);
            var c = (this.gl = this.canvas.getContext("webgl"));
            this.updateRect();
            if (this.useST) {
              var f = b.match(p);
              b = b.replace("mainImage", "main");
              b = b.replace(p, "()");
              b =
                (f
                  ? "#define "
                      .concat(f[1], " gl_FragColor\n#define ")
                      .concat(f[2], " gl_FragCoord.xy\n")
                  : "") + b;
            }
            b =
              "precision highp float;\n" +
              (Object.values(this.uniforms).reduce(function (a, b) {
                return a + "uniform ".concat(b.type, " ").concat(b.name, ";\n");
              }, "") +
                b);
            c.clearColor(0, 0, 0, 0);
            this.vertexShader = this.makeShader(
              c.VERTEX_SHADER,
              "\nattribute vec2 position;\n\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}"
            );
            this.fragmentShader = this.makeShader(c.FRAGMENT_SHADER, b);
            this.program = this.makeProgram(
              this.vertexShader,
              this.fragmentShader
            );
            this.vertices = new Float32Array([
              -1, 1, 1, 1, 1, -1, -1, 1, 1, -1, -1, -1,
            ]);
            this.buffer = c.createBuffer();
            c.bindBuffer(c.ARRAY_BUFFER, this.buffer);
            c.bufferData(c.ARRAY_BUFFER, this.vertices, c.STATIC_DRAW);
            c.useProgram(this.program);
            this.program.position = c.getAttribLocation(
              this.program,
              "position"
            );
            c.enableVertexAttribArray(this.program.position);
            c.vertexAttribPointer(this.program.position, 2, c.FLOAT, !1, 0, 0);
            Object.values(this.uniforms).forEach(function (b) {
              b.location = c.getUniformLocation(a.program, b.name);
            });
            this._bind("mouseDown", "mouseMove", "mouseUp", "render");
            this.canvas.addEventListener("mousedown", this.mouseDown);
            this.canvas.addEventListener("mousemove", this.mouseMove);
            this.canvas.addEventListener("mouseup", this.mouseUp);
            this.render();
          },
        },
        {
          key: "render",
          value: function (a) {
            if (this && this.mounted && this.gl) {
              var b = this.gl;
              this.updateTimeUniforms(a);
              this.updateRect();
              b.clear(b.COLOR_BUFFER_BIT);
              Object.values(this.uniforms).forEach(function (a) {
                var c = a.type,
                  d = a.location;
                a = a.value;
                c = c.match(/vec/)
                  ? "".concat(c[c.length - 1], "fv")
                  : "1".concat(c[0]);
                b["uniform".concat(c)](d, a);
              });
              b.drawArrays(b.TRIANGLES, 0, this.vertices.length / 2);
              this.ticking = !1;
              this.animationFrame = requestAnimationFrame(this.render);
            }
          },
        },
        {
          key: "mouseDown",
          value: function (a) {
            if (this.useST) {
              this.mousedown = !0;
              var b = this.rect,
                c = b.top,
                d = b.height;
              this.uniforms.mouse.value[2] = a.clientX - Math.floor(b.left);
              this.uniforms.mouse.value[3] =
                Math.floor(d) - (a.clientY - Math.floor(c));
            }
          },
        },
        {
          key: "mouseMove",
          value: function (a) {
            if (!this.ticking && (!this.useST || this.mousedown)) {
              var b = this.rect,
                c = b.top,
                d = b.height;
              this.uniforms.mouse.value[0] = a.clientX - Math.floor(b.left);
              this.uniforms.mouse.value[1] =
                Math.floor(d) - (a.clientY - Math.floor(c));
              this.ticking = !0;
            }
          },
        },
        {
          key: "mouseUp",
          value: function (a) {
            this.useST &&
              ((this.mousedown = !1),
              (this.uniforms.mouse.value[2] = 0),
              (this.uniforms.mouse.value[3] = 0));
          },
        },
        {
          key: "updateTimeUniforms",
          value: function (a) {
            var b = this.lastTime ? (a - this.lastTime) / 1e3 : 0;
            this.lastTime = a;
            this.uniforms.time.value += b;
            this.uniforms.delta.value = b;
            this.uniforms.frame.value++;
            a = new Date();
            this.uniforms.date.value[0] = a.getFullYear();
            this.uniforms.date.value[1] = a.getMonth() + 1;
            this.uniforms.date.value[2] = a.getDate();
            this.uniforms.date.value[3] =
              3600 * a.getHours() +
              60 * a.getMinutes() +
              a.getSeconds() +
              0.001 * a.getMilliseconds();
          },
        },
        {
          key: "updateRect",
          value: function () {
            var a = (this.rect = this.canvas.getBoundingClientRect()),
              b = a.width;
            a = a.height;
            var c = this.canvas.width !== b,
              d = this.canvas.height !== a;
            c && (this.canvas.width = this.uniforms.resolution.value[0] = b);
            d && (this.canvas.height = this.uniforms.resolution.value[1] = a);
            (c || d) &&
              this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
          },
        },
        {
          key: "makeShader",
          value: function (a, b) {
            var c = this.gl;
            a = c.createShader(a);
            c.shaderSource(a, b);
            c.compileShader(a);
            if (!c.getShaderParameter(a, c.COMPILE_STATUS)) {
              var d = c.getShaderInfoLog(a);
              c.deleteShader(a);
              console.warn(d, "\nin shader:\n", b);
            }
            return a;
          },
        },
        {
          key: "makeProgram",
          value: function () {
            for (
              var a = this.gl,
                b = a.createProgram(),
                c = arguments.length,
                d = Array(c),
                e = 0;
              e < c;
              e++
            )
              d[e] = arguments[e];
            d.forEach(function (c) {
              a.attachShader(b, c);
            });
            a.linkProgram(b);
            a.getProgramParameter(b, a.LINK_STATUS) ||
              ((c = a.getProgramInfoLog(this.program)), console.warn(c));
            return b;
          },
        },
        {
          key: "_bind",
          value: function () {
            for (
              var a = this, b = arguments.length, c = Array(b), d = 0;
              d < b;
              d++
            )
              c[d] = arguments[d];
            c.forEach(function (b) {
              return (a[b] = a[b].bind(a));
            });
          },
        },
      ]);
      return d;
    })(m(HTMLElement));
  customElements.define("shader-doodle", u);
});
