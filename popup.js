
var errormsg = "";
var counter;

var websites = [];
var keywords = [];

// TODO: ADD INTERVAL		
// TODO: ERROR TEXT CSS STYLE FOR APPEARING
// TODO: ADD SO THAT KEYWORDS GET ADDED UP AS DIFFERENT POPUPS LIKE IN TUMBLR 

// https://stackoverflow.com/questions/29222861/getting-multiple-items-from-chrome-storage

chrome.storage.sync.get(["counter", "websites", "keywords"], function (result) {
 
  if (result.counter === undefined) {
    counter = 0;
  } else {
    counter = result.counter;
    keywords = result.keywords;
    addAllFields();
  }

  if (result.websites === undefined || result.websites.length == 0) {
    return;
  } else {
    websites = result.websites;
    console.log(websites);
    fillAllFields();
  }

});

// chrome.browserAction.setPopup({ popup: "popup.html" });

function error(errorstr) {
  document.getElementById("error-message").style.visibility = "visible";

  if (errorstr.charAt(errorstr.length - 2) == "," && errorstr.charAt(errorstr.length - 1) == " ") {
    var errorbuffer = errorstr.substring(0, errorstr.length - 2);
    document.getElementById("error-message").innerHTML = errorbuffer;
  } else {
    document.getElementById("error-message").innerHTML = errorstr;
  }

  errormsg = "";
}

function hideError() {
  document.getElementById("error-message").style.visibility = "hidden";
}

function addAllFields() {

  var temp_counter = counter;
  console.log("HELLO: " + temp_counter);
  counter = 0;
  for (var i = 0; i < temp_counter; i++) {
    moreFields();
  }

}

function fillAllFields() {
  for (var i = 1; i <= websites.length; i++) {
    console.log("HERE: " + websites[i]);
    document.getElementById("enter-website-" + i).value = websites[i - 1];
  }

    document.getElementById("keywords-field").value = keywords.join(", ");

}


function moreFields() {
  counter++;
  var newFields = document.getElementById("input-website").cloneNode(true);
  newFields.id = "enter-website-" + counter;
  newFields.style.display = "block";

  var newField = newFields.childNodes;
  console.log("1 \\" + newField);

  for (var i = 0; i < newField.length; i++) {
    var theName = newField[i].name
    console.log("2 \\" + theName);
  }

  if (theName) {
    newField[i].name = theName + counter;
    console.log("3 \\" + newField[i].name);
  }

  var insertHere = document.getElementById("writeroot");
  console.log(newFields);
  insertHere.parentNode.insertBefore(newFields, insertHere);

  chrome.storage.sync.set({ 'counter': counter }, function () { });
}

function remove() {
  var elem = document.getElementById("enter-website-" + counter);
  elem.remove();
  counter--;
  chrome.storage.sync.set({ 'counter': counter }, function () { });

}


// document.addEventListener("DOMContentLoaded", function () {

//   var link = document.getElementById("remove-field");
//   console.log(link);
//   link.addEventListener("click", function () {
//       console.log("Am I here?");
//       this.parentNode.removeChild(this.parentNode); 
//   });
// });

chrome.extension.onMessage.addListener(
  function (request, sender, sendResponse) {
    if (request['request_type'] === 'copy') {
      storage.clear();
      storage.set({ 'form_data': request['form_data'] });
    } else if (request['request_type'] === 'paste') {
      storage.get('form_data', function (item) {
        chrome.tabs.getSelected(null, function (tab) {
          chrome.tabs.sendMessage(tab.id, item['form_data']);
        });
      });
    }
  });

document.getElementById("add-fields").onclick = moreFields;
document.getElementById("remove-field").onclick = remove;

// REGEX COURTESY OF MATTHEW O'RIORDAN FROM STACK OVERFLOW 
var urlpattern = new RegExp(/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/);

window.onload = function () {
  document.getElementById("refresh-field").onclick = function () {

    keywords.length = 0;

    if (document.getElementById("keywords-field").value.length != 0) {
      keywords = document.getElementById("keywords-field").value.split(",");
    }

    if (keywords === undefined || keywords.length == 0) {
      errormsg += "Please enter at least one keyword, ";
    } else {
      // TRIM SPACES FROM BEGINNING AND END OF EACH KEYWORD
      for (var i = 0; i < keywords.length; i++) {
        keywords[i] = keywords[i].replace(/^\s\s*/, "").replace(/\s\s*$/, "");
      }

      hideError();

    }

    websites.length = 0;
    var control_bool = false;
    for (var i = 1; i <= counter; i++) {
      var elem = document.getElementById("enter-website-" + i).value;
      if (!urlpattern.test(elem)) {
        errormsg += "Invalid URL on field #" + i + ", ";
      } else {
        websites.push(elem);
        control_bool = true;
      }
    }

    if ((websites === undefined || websites.length == 0) && control_bool) {
      errormsg += "Please enter at least one website, ";
    }

    if (errormsg != "") {
      error(errormsg);
    }

    chrome.storage.sync.set({ 'websites': websites }, function () { });
    chrome.storage.sync.set({ 'keywords': keywords }, function () { });

    console.log("Titles: " + websites.join(", ") + "\\ " + counter);
    console.log(keywords);
  }
}

// Tests the roundtrip time of sendRequest().
function testRequest() {
  setChildTextNode("resultsRequest", "running...");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var timer = new chrome.Interval();
    timer.start();
    var tab = tabs[0];
    chrome.tabs.sendRequest(tab.id, { counter: 1 }, function handler(response) {
      if (response.counter < 1000) {
        chrome.tabs.sendRequest(tab.id, { counter: response.counter }, handler);
      } else {
        timer.stop();
        var usec = Math.round(timer.microseconds() / response.counter);
        setChildTextNode("resultsRequest", usec + "usec");
      }
    });
  });
}

// Tests the roundtrip time of Port.postMessage() after opening a channel.
function testConnect() {
  setChildTextNode("resultsConnect", "running...");

  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var timer = new chrome.Interval();
    timer.start();

    var port = chrome.tabs.connect(tabs[0].id);
    port.postMessage({ counter: 1 });
    port.onMessage.addListener(function getResp(response) {
      if (response.counter < 1000) {
        port.postMessage({ counter: response.counter });
      } else {
        timer.stop();
        var usec = Math.round(timer.microseconds() / response.counter);
        setChildTextNode("resultsConnect", usec + "usec");
      }
    });
  });
}

