import { format_colab_url } from "../../js/helper.js";
import { add_url, get_otomation_urls, remove_url, setAll } from "../../js/otomation.js";


var listItems = Array.from(document.querySelectorAll(".list-item"));
var rowSize = listItems[0].offsetHeight; // => container height / number of items
var container = document.querySelector(".tasks");// Array of elements
var sortables = listItems.map(Sortable); // Array of sortables
var total = sortables.length;
var urls = []


TweenLite.to(container, 0.5, { autoAlpha: 1 });
var listItems = []

document.querySelector('#push').onclick = function () {
  var url = document.querySelector('#newtask input').value
  if (url.length == 0 || !url.includes("colab") || urls.includes(url)) {
    alert("Kindly Enter Task Name!!!!")
  }

  else {
    addurl(url)
  }
}
function onListChanged() {
  listItems = Array.from(document.querySelectorAll(".list-item"));
  rowSize = listItems[0].offsetHeight + 5; // => container height / number of items
  container = document.querySelector(".tasks");// Array of elements
  sortables = listItems.map(Sortable); // Array of sortables
  total = sortables.length;
  TweenLite.to(container, 0.5, { autoAlpha: 1 });
  // Set index for each sortable
  sortables.forEach((sortable, index) => sortable.setIndex(index));
}


async function addurl(url) {
  const ok = await add_url(url)
  if (ok) appendToList(format_colab_url(url))
}

function changeAllUrls(_urls) {
  urls = _urls
  setAll(urls)
  document.querySelector('#tasks').innerHTML = ""
  for (const url of urls) {
    appendToList(url)
  }

}



function appendToList(url) {
  document.querySelector('#tasks').innerHTML += `
  <div class="list-item task">
  <span class="order">${listItems.length + 1}</span>
  <div class="item-content"> <span class="url">${url}</span>
  </div>
  <div class="icons">
          <button class="delete"><i class="bi bi-trash"></i></button>
          <i class="bi bi-list"></i>
  </div>
</div>
`;
  onListChanged();
  var current_tasks = document.querySelectorAll(".delete");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = async function () {
      console.log(this.parentNode.parentNode.querySelector(".url").textContent)
      await remove_url(this.parentNode.parentNode.querySelector(".url").textContent)
      this.parentNode.parentNode.remove();
      onListChanged();
    }
  }
  var current_tasks = document.querySelectorAll(".url");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = function () {
      chrome.tabs.create({ "url": this.textContent });
    }
  }
}
function createListWidget(urls) {
  if (!urls || urls.length == 0) return
  document.querySelector('#tasks').innerHTML = ""
  for (const url of urls) {
    appendToList(url)
  }
}

document.querySelector('#export').onclick = async function () {

  var data = { "otomation_urls": await get_otomation_urls() }
  var saveData = (function () {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
      var json = JSON.stringify(data),
        blob = new Blob([json], { type: "octet/stream" }),
        url = window.URL.createObjectURL(blob);
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    };
  }());

  var fileName = "backup_colab_free_checker.json";
  saveData(data, fileName);
}
document.querySelector('#import').onclick = async function () {
  let fileHandle;
  const pickerOpts = {
    types: [
      {
        description: "JSON",
        accept: {
          "JSON/*": [".json"],
        },
      },
    ],
    excludeAcceptAllOption: true,
    multiple: false,
  };
  [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  const file = await fileHandle.getFile();
  const contents = await file.text();
  console.log(fileHandle)
  console.log(file)
  console.log(contents)
  var data = JSON.parse(contents)
  console.log(data)
  changeAllUrls(data.otomation_urls)
}



async function restore_options() {
  var urls = await get_otomation_urls()
  createListWidget(urls)
}
document.addEventListener('DOMContentLoaded', restore_options);



function changeIndex(item, to) {
  // Change position in array
  arrayMove(sortables, item.index, to);

  // Change element's position in DOM. Not always necessary. Just showing how.
  if (to === total - 1) {
    container.appendChild(item.element);
  } else {
    var i = item.index > to ? to : to + 1;
    container.insertBefore(item.element, container.children[i]);
  }

  // Set index for each sortable
  sortables.forEach((sortable, index) => sortable.setIndex(index));

}

async function dragend() {
  urls = sortables.map((value, index, array) => value.element.querySelector(".url").textContent)
  await setAll(urls)
  console.log(urls);
}
function Sortable(element, index) {
  var content = element.querySelector(".item-content");
  var order = element.querySelector(".order");

  var animation = TweenLite.to(content, 0.3, {
    boxShadow: "rgba(0,0,0,0.2)",
    force3D: true,
    scale: 1,
    paused: true
  });

  var dragger = new Draggable(element, {
    onDragStart: downAction,
    onRelease: upAction,
    onDrag: dragAction,
    cursor: "inherit",
    type: "y"
  });

  // Public properties and methods
  var sortable = {
    dragger: dragger,
    element: element,
    index: index,
    setIndex: setIndex
  };

  TweenLite.set(element, { y: index * rowSize });

  function setIndex(index) {
    sortable.index = index;
    order.textContent = index + 1;

    // Don't layout if you're dragging
    if (!dragger.isDragging) layout();
  }

  function downAction() {
    animation.play();
    this.update();
  }

  function dragAction() {
    // Calculate the current index based on element's position
    var index = clamp(Math.round(this.y / rowSize), 0, total - 1);

    if (index !== sortable.index) {
      changeIndex(sortable, index);
    }
  }

  function upAction() {
    animation.reverse();
    layout();
    dragend();
  }

  function layout() {
    TweenLite.to(element, 0.3, { y: sortable.index * rowSize });
  }

  return sortable;
}

// Changes an elements's position in array
function arrayMove(array, from, to) {
  array.splice(to, 0, array.splice(from, 1)[0]);
}

// Clamps a value to a min/max
function clamp(value, a, b) {
  return value < a ? a : value > b ? b : value;
}
