window.__ModuleLoader__.load({id:"dsh-yua-world",factory(require){const module={exports:{}};const exports=module.exports;
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// dsh/src/client.js
var client_exports = {};
__export(client_exports, {
  apply: () => apply,
  inject: () => inject,
  name: () => name
});
module.exports = __toCommonJS(client_exports);
var import_react = __toESM(require("react"), 1);
var name = "yua-world";
var inject = ["slots", "connection"];
function apply(ctx) {
  function World() {
    const [html, setHtml] = import_react.default.useState(""), [error, setError] = import_react.default.useState("");
    const frame = import_react.default.useRef(null), input = import_react.default.useRef(null);
    import_react.default.useEffect(() => {
      const controller = new AbortController();
      ctx.connection.rpc.call("/yua-world", "document", {}, controller.signal).then((result) => {
        if (!controller.signal.aborted) {
          if (result.ok) setHtml(result.value);
          else setError(result.error.message);
        }
      }).catch((e) => {
        if (!controller.signal.aborted) setError(String(e));
      });
      return () => {
        controller.abort();
        if (frame.current) frame.current.srcdoc = "";
      };
    }, []);
    function backup() {
      const blob = new Blob([JSON.stringify({ version: 1, climate: JSON.parse(localStorage.getItem("yua-climate") || "null") })], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "yua-world-save.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1e3);
    }
    async function restore(e) {
      try {
        const file = e.target.files[0];
        if (!file) return;
        const data = JSON.parse(await file.text()), value = data.climate ?? data;
        if (!["spring", "summer", "autumn", "winter"].includes(value.season) || !["clear", "rain", "snow"].includes(value.weather)) throw Error("\u65E0\u6548\u5B58\u6863");
        localStorage.setItem("yua-climate", JSON.stringify(value));
        setHtml((current) => {
          if (frame.current) frame.current.srcdoc = current;
          return current;
        });
        setError("");
      } catch (e2) {
        setError(String(e2));
      } finally {
        e.target.value = "";
      }
    }
    return import_react.default.createElement(
      "section",
      { style: { height: "100%", minHeight: 0, display: "flex", flexDirection: "column", position: "relative" } },
      import_react.default.createElement("div", { style: { display: "flex", gap: 8, padding: 6, flexShrink: 0 } }, import_react.default.createElement("button", { onClick: backup }, "\u5BFC\u51FA\u5B58\u6863"), import_react.default.createElement("button", { onClick: () => input.current.click() }, "\u5BFC\u5165\u5B58\u6863"), import_react.default.createElement("input", { ref: input, type: "file", accept: ".json", onChange: restore, style: { display: "none" } }), error && import_react.default.createElement("span", { role: "alert" }, error)),
      html ? import_react.default.createElement("iframe", { ref: frame, title: "\u98CE\u6816\u5C0F\u9547", srcDoc: html, sandbox: "allow-scripts allow-same-origin", allow: "fullscreen", style: { border: 0, width: "100%", flex: 1, minHeight: 0 } }) : import_react.default.createElement("p", null, error || "\u6B63\u5728\u52A0\u8F7D\u5C0F\u9547\u2026")
    );
  }
  ctx.effect(function* () {
    yield ctx.slots.inject("main", () => ctx.slots.register({ name: "main", key: "yua-world" }, World));
    yield ctx.slots.inject("sidebar.panellist", () => ctx.slots.register({ name: "sidebar.panellist", id: "yua-world", order: 20, label: () => "\u98CE\u6816\u5C0F\u9547" }, ({ size }) => import_react.default.createElement("span", { style: { fontSize: size }, "aria-hidden": true }, "\u2302")));
  });
}

return module.exports;}});
