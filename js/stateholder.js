import { defaultCSSParams } from "./cssparams.js";
import { defaultCharacters, defaultModifiers } from "./defaultsettings.js";

class StateHolder {
  markerClassName;
  CSS;
  defaultParams;
  characters;
  modifiers;

  constructor() {
    console.log("init: start");
    this.markerClassName = new Map();
    this.CSS = new Map();
    this.defaultParams = new defaultCSSParams();

    chrome.storage.onChanged.addListener((changes, namespace) => {
      for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (this.defaultParams.keys.includes(key)) {
          this.CSS.set(key, newValue);
        }
        console.log(
          `Storage key "${key}" in namespace "${namespace}" changed.`,
          `Old value was "${oldValue}", new value is "${newValue}".`
        );
      }
    });

    this.load();
    console.log("init: complete");
  }

  set(key, value) {
    this.markerClassName.set(key, value);
  }
  get(key) {
    if (this.markerClassName.has(key)) {
      return this.markerClassName.get(key);
    } else {
      this.markerClassName.set(key, "");
      return "";
    }
  }

  load() {
    console.log("loading : start");
    //css
    chrome.storage.sync.get(this.defaultParams.keys, (v) => {
      for (var key of this.defaultParams.keys) {
        console.log("loading: " + key + " :: " + v[key]);
        if (v[key] !== null && v[key] !== undefined) {
          this.CSS.set(key, v[key]);
        } else {
          chrome.storage.sync.set({
            [key]: this.defaultParams.param(key),
          });
        }
      }
    });
    //characters used for marker
    chrome.storage.sync.get(["characters", "modifiers"], (v) => {
      if (
        v["characters"] !== null &&
        v["characters"] !== undefined &&
        v["modifiers"] !== null &&
        v["modifiers"] !== undefined
      ) {
        this.characters = v["characters"];
        this.modifiers = v["modifiers"];
      } else {
        chrome.storage.sync.set({
          ["characters"]: defaultCharacters,
          ["modifiers"]: defaultModifiers,
        });
        this.characters = defaultCharacters;
        this.modifiers = defaultModifiers;
      }
    });
    console.log("loading: complete");
  }

  getCSS() {
    var tmp = new String();
    for (var [key, value] of this.CSS) {
      tmp += key + ":" + value + ";";
    }
    return tmp;
  }

  getCharacters() {
    return this.characters;
  }
  getModifiers() {
    return this.modifiers;
  }
}

export default StateHolder;
