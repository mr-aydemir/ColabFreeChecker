/* // Saves options to chrome.storage
function save_options() {
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('like').checked;
    chrome.storage.local.set({
      favoriteColor: color,
      likesColor: likesColor
    }, function() {
      // Update status to let user know options were saved.
      var status = document.getElementById('status');
      status.textContent = 'Options saved.';
      setTimeout(function() {
        status.textContent = '';
      }, 750);
    });
  }
  
  // Restores select box and checkbox state using the preferences
  // stored in chrome.storage.
  function restore_options() {
    // Use default value color = 'red' and likesColor = true.
    chrome.storage.local.get({
      favoriteColor: 'red',
      likesColor: true
    }, function(items) {
      document.getElementById('color').value = items.favoriteColor;
      document.getElementById('like').checked = items.likesColor;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options); */


function appendToList(url) {
  document.querySelector('#tasks').innerHTML += `
<div class="task">
    <span id="taskname">${url}</span>
    <button class="delete"><i class="bi bi-trash"></i></button>
</div>
`;
  var current_tasks = document.querySelectorAll(".delete");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = function () {
      console.log(this.parentNode.querySelector("#taskname").textContent)
      removeUrl(this.parentNode.querySelector("#taskname").textContent)
      this.parentNode.remove();
    }
  }
  var current_tasks = document.querySelectorAll("#taskname");
  for (var i = 0; i < current_tasks.length; i++) {
    current_tasks[i].onclick = function () {
      chrome.tabs.create({"url": this.textContent});
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



function addurl(url) {
  chrome.storage.local.get("otomation_urls", function (data) {
    var urls = []
    if (data && data.otomation_urls.length > 0)
      urls = data.otomation_urls
    if (urls.includes(url)) return

    urls.push(url)
    console.log(urls)
    chrome.storage.local.set({
      "otomation_urls": urls
    });
    appendToList(url)
  });
}
function removeUrl(url) {
  chrome.storage.local.get("otomation_urls", function (data) {
    if (!data || data.otomation_urls.length == 0) return
    var urls = data.otomation_urls
    if (!urls.includes(url)) return
    urls = urls.filter(function (item) {
      return item !== url
    })
    chrome.storage.local.set({
      "otomation_urls": urls
    });
  });
}

document.querySelector('#push').onclick = function () {
  url = document.querySelector('#newtask input').value
  if (url.length == 0) {
    alert("Kindly Enter Task Name!!!!")
  }

  else {
    addurl(url)
  }
}


function restore_options() {
  // Use default value color = 'red' and likesColor = true.
  chrome.storage.local.get("otomation_urls", function (data) {

    var urls = data?.otomation_urls
    console.log(data)
    createListWidget(urls)
  });
}
document.addEventListener('DOMContentLoaded', restore_options);