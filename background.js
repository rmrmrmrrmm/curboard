import Marker from "/js/marker.js";
import StateHolder from "/js/stateholder.js";

const holder = new StateHolder();

chrome.commands.onCommand.addListener((command, tab) => {
  console.log(command);
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      args: [
        command,
        holder.get(tab.id),
        holder.getCSS(),
        holder.getCharacters(),
        holder.getModifiers(),
      ],
      func: Marker,
    },
    (arg) => {
      holder.set(tab.id, arg[0].result);
    }
  );
  console.log("tab " + tab.id + ": marker.exec");
});

console.log("working");
