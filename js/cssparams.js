//used for reset
export class defaultCSSParams {
  #default;
  constructor() {
    this.#default = {
      position: "absolute",
      display: "block",
      "box-sizing": "content-box",
      border: "none",
      "border-radius": "4px",
      color: "rgb(255,255,255)",
      "background-color": "rgb(0,0,0)",
      "font-family": "sanserif",
      "font-size": "12px",
      "font-weight": "normal",
      "text-align": "center",
      "line-height": "18px",
      height: "18px",
      margin: "0",
      padding: "0 3px",
      "z-index": "9999",
    };
  }

  get keys() {
    return Object.keys(this.#default);
  }
  get params() {
    return Object.values(this.#default);
  }
  param(key) {
    return this.#default[key];
  }
  get length() {
    return Object.keys(this.#default).length;
  }
  get json() {
    return this.#default;
  }
}
