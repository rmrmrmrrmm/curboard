import { defaultCSSParams } from "./cssparams.js";
import { defaultCharacters, defaultModifiers } from "./defaultsettings.js";

let defaultParams = new defaultCSSParams();
let CSS = new Map();
let characters;
let modifiers;
let page = document.getElementById("cssselector");
let sample = document.getElementById("sample");
let sstyle = sample.style;
let reset = document.getElementById("reset");
let apply = document.getElementById("apply");
const resetEvent = new CustomEvent("reset");

constructOptions();
reset.addEventListener("click", resetMarkerStyle);
apply.addEventListener("click", applyMarkerStyle);

function resetMarkerStyle(event) {
  console.log("reset: start");
  for (var i = 0; i < defaultParams.length; i++) {
    chrome.storage.sync.set({
      [defaultParams.keys[i]]: defaultParams.params[i],
    });
    console.log(defaultParams.keys[i] + " :: " + defaultParams.params[i]);
  }
  //load default params to CSS and sample
  load(defaultParams.json);
  //reset input elements
  for (var el of document.getElementsByTagName("input")) {
    el.dispatchEvent(resetEvent);
  }

  chrome.storage.sync.set({
    ["characters"]: defaultCharacters,
    ["modifiers"]: defaultModifiers,
  });
  characters = defaultCharacters;
  modifiers = defaultModifiers;

  console.log("reset: complete");
}

function applyMarkerStyle(event) {
  console.log("apply: start");

  chrome.storage.sync.set({
    ["characters"]: characters,
    ["modifiers"]: modifiers,
  });

  chrome.storage.sync.get(defaultParams.keys, (v) => {
    for (var key of defaultParams.keys) {
      if (CSS.get(key) !== v[key]) {
        chrome.storage.sync.set({
          [key]: CSS.get(key),
        });
        console.log("apply: " + key + " :: " + CSS.get(key));
      }
    }
    console.log("apply: complete");
  });
}

function constructOptions() {
  chrome.storage.sync.get(defaultParams.keys, (v) => {
    load(v);

    //font-size
    createSlider(
      10,
      64,
      "fontsize",
      ptoi(sstyle.fontSize),
      ptoi(defaultParams.param("font-size")),
      (node) => {
        return () => {
          sstyle.fontSize = itop(node.value);
          CSS.set("font-size", sstyle.fontSize);
          sstyle.height = itop(node.value);
          CSS.set("height", sstyle.height);
          sstyle.lineHeight = itop(node.value);
          CSS.set("line-height", sstyle.lineHeight);
        };
      }
    );

    //paddingX
    createSlider(
      1,
      64,
      "width",
      ptoi(sstyle.paddingLeft),
      ptoi(defaultParams.param("padding").split(" ")[1]),
      (node) => {
        return () => {
          sstyle.paddingLeft = sstyle.paddingRight = itop(node.value);
          CSS.set("padding", sstyle.paddingTop + " " + sstyle.paddingLeft);
        };
      }
    );

    //paddingY
    createSlider(
      1,
      64,
      "height",
      ptoi(sstyle.paddingTop),
      ptoi(defaultParams.param("padding").split(" ")[0]),
      (node) => {
        return () => {
          sstyle.paddingTop = sstyle.paddingBottom = itop(node.value);
          CSS.set("padding", sstyle.paddingTop + " " + sstyle.paddingLeft);
        };
      }
    );
    console.log(sstyle.color);

    //color
    createColorPicker(
      "fontcolor",
      sstyle.color,
      defaultParams.param("color"),
      (node) => {
        return () => {
          sstyle.color = node.value;
          CSS.set("color", sstyle.color);
        };
      }
    );

    //background-color
    createColorPicker(
      "bgcolor",
      sstyle.backgroundColor,
      defaultParams.param("background-color"),
      (node) => {
        return () => {
          sstyle.backgroundColor = node.value;
          CSS.set("background-color", sstyle.backgroundColor);
        };
      }
    );
  });

  chrome.storage.sync.get(["characters", "modifiers"], (v) => {
    characters = v["characters"];
    modifiers = v["modifiers"];

    createForm("using characters", characters, defaultCharacters, (node) => {
      return () => {
        characters = node.value;
      };
    });
    createForm("using modifiers", modifiers, defaultModifiers, (node) => {
      return () => {
        modifiers = node.value;
      };
    });
  });
}

function load(params) {
  var markerCSS = "";
  for (var key of defaultParams.keys) {
    CSS.set(key, params[key]);
    markerCSS += key + ":" + params[key] + ";";
  }
  sample.setAttribute("style", markerCSS);
  //sstyle.margin = "auto";
  sstyle.display = "inline-block";
  sstyle.position = "inherit";
}

function createSlider(min, max, cls, value, defaultValue, onInput) {
  let container = createInputContainer();
  createLabelElement(cls, container);

  //param
  let valuenode = document.createElement("p");
  valuenode.setAttribute("class", "value");
  valuenode.textContent = value;
  container.appendChild(valuenode);

  //slider
  let node = document.createElement("input");
  node.setAttribute("type", "range");
  node.setAttribute("min", min);
  node.setAttribute("max", max);
  node.setAttribute("class", cls + " slider");
  node.setAttribute("value", value);
  //set EventListeners
  node.addEventListener("input", onInput(node));
  node.addEventListener("input", () => {
    valuenode.textContent = node.value;
  });
  //when [reset] is clicked
  node.addEventListener("reset", () => {
    node.value = valuenode.textContent = defaultValue;
  });
  //
  container.appendChild(node);

  //append
  page.appendChild(container);
}

function createColorPicker(cls, value, defaultValue, onInput) {
  let container = createInputContainer();
  createLabelElement(cls, container);

  //form
  let node = document.createElement("input");
  node.setAttribute("type", "color");
  node.setAttribute("class", cls + " picker");
  node.setAttribute("value", rtoh(value));
  //set EventListeners
  node.addEventListener("input", onInput(node));
  //when [reset] is clicked
  node.addEventListener("reset", () => {
    node.value = rtoh(defaultValue);
  });
  //
  container.appendChild(node);

  //append
  page.appendChild(container);
}

function createForm(cls, value, defaultValue, onInput) {
  let container = createInputContainer();
  createLabelElement(cls, container);

  //form
  let node = document.createElement("input");
  node.setAttribute("type", "text");
  node.setAttribute("class", cls + " textform");
  node.setAttribute("value", value);
  //set EventListeners
  node.addEventListener("input", onInput(node));
  //when [reset] is clicked
  node.addEventListener("reset", () => {
    node.value = defaultValue;
  });
  //
  container.appendChild(node);

  //append
  page.appendChild(container);
}

function createInputContainer() {
  let container = document.createElement("div");
  container.setAttribute("class", "inner");
  return container;
}

function createLabelElement(cls, container) {
  let textnode = document.createElement("p");
  textnode.setAttribute("class", "label");
  textnode.textContent = cls;
  container.appendChild(textnode);
}

function ptoi(px) {
  return px.match(/[0-9]/g).join("");
}
function itop(i) {
  return isNaN(i) ? "0px" : i < 0 ? "0px" : i + "px";
}

function rtoh(rgb) {
  if (rgb)
    return (
      "#" +
      rgb
        .match(/[0-9]+/g)
        .map((d) =>
          d > 0x0f ? Number(d).toString(16) : "0" + Number(d).toString(16)
        )
        .join("")
    );
}
