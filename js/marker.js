function Marker(mode, recent, css, characters, modifiers) {
  if (document.getElementsByClassName(recent).length > 0) {
    document.getElementById(recent).remove();
    console.log("mode: replace");
  }
  var markerClassName = "jumpmarkers-" + Date.now();
  var index = 0;
  var targetMap = new Map();
  var markerSequence = new Array(...characters);
  var pressedKeys = "";
  for (var x of modifiers) {
    for (var y of characters) {
      markerSequence.push(x + y);
    }
  }

  var keyPressEvent = (e) => {
    if (!e.repeat) {
      console.log("keyboard event: " + e.key + " pressed");
      pressed(e.key);
      e.preventDefault();
    }
  };

  console.log("mode: " + mode);
  if (mode === "jump" || mode === "new") {
    injectMarker(document.getElementsByTagName("a"));
  } else if (mode === "button") {
    injectMarker([
      ...document.getElementsByTagName("button"),
      ...document.getElementsByTagName("input"),
      ...document.getElementsByTagName("textarea"),
      ...document.getElementsByTagName("object"),
      ...document.getElementsByTagName("area"),
      ...document.getElementsByTagName("select"),
    ]);
  } else console.log("mode: unexpected");

  //save to stateholder
  return markerClassName;

  function createMarker(element) {
    var mark = markerSequence[index++];
    targetMap.set(mark, element);
    return document.createTextNode(mark);
  }

  function hasEmptyMarker() {
    return index < markerSequence.length;
  }

  function pressed(key) {
    pressedKeys += key;
    if (modifiers.includes(key)) {
      console.log("keyboard event: modifier");
    } else if (characters.includes(key)) {
      //execute main function according to its mode
      document.getElementById(markerClassName).remove();
      window.removeEventListener("keypress", keyPressEvent, true);
      console.log("keyboard event: event removed");
      var target = targetMap.get(pressedKeys);
      console.log(target);
      if (target === undefined) {
        console.log("keyboard event: unmatch");
      } else if (mode === "jump") {
        window.location.href = target.href;
      } else if (mode === "new") {
        window.open(target.href);
      } else if (mode === "button") {
        if (target.tagName === "BUTTON") {
          target.dispatchEvent(new Event("click", { bubbles: true }));
        } else {
          target.focus();
        }
      }
    } else {
      //pressed key is unresisted
      console.log("keyboard event: unmatch");
      document.getElementById(markerClassName).remove();
      document.removeEventListener("keypress", keyPressEvent, true);
      console.log("keyboard event: event removed");
    }
  }

  function createCSS(posX, posY) {
    return css + "top: " + posY + "px;" + "left: " + posX + "px;";
  }

  function injectMarker(el) {
    var node = document.createElement("span");
    node.id = markerClassName;
    for (var i = 0; i < el.length; i++) {
      var rect = el[i].getBoundingClientRect();
      if (
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        rect.right > 0 &&
        rect.left < window.innerWidth &&
        hasEmptyMarker()
      ) {
        var popup = document.createElement("span");
        popup.appendChild(createMarker(el[i]));
        popup.setAttribute(
          "style",
          createCSS(
            window.scrollX + rect.left + 8,
            window.scrollY + rect.top + 8
          )
        );
        popup.classList.add(markerClassName);
        node.appendChild(popup);
      }
    }

    if (node.childElementCount > 0) {
      document.body.prepend(node);
      window.addEventListener("keypress", keyPressEvent, {
        once: false,
        capture: true,
        passive: false,
      });
      console.log("keyboard event: set");
    }
  }
}

export default Marker;
