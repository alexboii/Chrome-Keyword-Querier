var PROXY_ADDRESS = "https://cors-anywhere.herokuapp.com/";

var NOTIFICATION_ID = '1'; //Id of the notification

//Object with options of notification
var NOTIFICATION_OPTIONS = {
    type: "basic",
    title: "Primary Title",
    message: "Primary message to display",
    iconUrl: "clock.png"
}


chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.executeScript(null, { file: "popup.js" });
});

function query() {
    chrome.storage.sync.get(["counter", "websites", "keywords", "flag"], function (result) {
        console.log(result.flag);
        console.log(result.counter);
        console.log(result.keywords);
        console.log(result.websites);


        if (result.flag == true) {
            for (var i = 0; i < result.counter; i++) {
                performCORSRequest(result.websites[i], result.keywords);
            }
        }

        if (result.flag == true) {
            document.getElementById("error-message").style.visibility = "visible";
            document.getElementById("error-message").innerHTML = "hello";
        }


    });

    setTimeout(query, 5000);
}

query();


// RETRIEVE HTML CONTENTS OF WEBSITE WITH THE USE OF A CORS PROXY
function performCORSRequest(targetURL, keywords) {

    console.log("Am I here?");


    var request = false;
    request = new XMLHttpRequest();

    request.open('GET', PROXY_ADDRESS + targetURL, true);
    request.setRequestHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Origin");
    request.setRequestHeader("Access-Control-Allow-Headers", "X-Requested-With");
    request.setRequestHeader("Access-Control-Allow-Origin", "*");
    request.setRequestHeader("X-Requested-With", "*");
    request.onreadystatechange = function () {
        if (request.readyState === 4) {
            for (var i = 0; i < keywords.length; i++) {

                console.log("Am I here in loop 2?" + keywords[i]);
                console.log(request.responseText.replace(/(<([^>]+)>)/ig, "").toLowerCase().indexOf(keywords[i].toLowerCase()));
                if (request.responseText.replace(/(<([^>]+)>)/ig, "").toLowerCase().indexOf(keywords[i].toLowerCase()) >= 0) {
                    console.log("KEYWORD FOUND");

                    chrome.notifications.create(NOTIFICATION_ID, NOTIFICATION_OPTIONS);

                }
            }
        }
    };

    request.send();
}
