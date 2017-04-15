var comments = {};
var spots = [];
var options = {};

chrome.storage.sync.get(null, function (data) {
    options = data;
});

function showComment(comment) {
    var container = document.getElementById("yttc-container");
    for (var spot = 0; spots.indexOf(spot) > -1; spot++);
    if (110 * spot + 110 <= container.offsetHeight) {
        spots.push(spot);
        var element = document.createElement("div");
        element.className = "yttc-comment";
        element.innerHTML = ''
            + '<img class="profile-image" src="' + comment.authorProfileImageUrl + '">'
            + '<p class="profile-name">' + comment.authorDisplayName + '</p>'
            + '<p class="content">' + comment.textDisplay + '</p>';
        element.style.top = (110 * spot) + "px";
        container.appendChild(element);
        setTimeout(function () {
            spots.splice(spots.indexOf(spot), 1);
            element.remove();
        }, 10000);
    } else {
        setTimeout(function () {
            showComment(comment);
        }, 1000);
    }
}

setTimeout(function () {
    var container = document.createElement("div");
    container.id = "yttc-container";
    document.querySelector("#movie_player").appendChild(container);

    var style = document.createElement("style");
    document.head.appendChild(style);
    if (options.fullscreen_only) {
        style.sheet.insertRule(""
            + "#movie_player:not(.ytp-fullscreen) #yttc-container {"
            +   "display: none;"
            + "}"
        );
    }

    document.querySelector("#player video").addEventListener("canplay", function () {
        comments = {};
        var videoID = location.search.match(/v=([^&]+)(&|$)/)[1];
        chrome.runtime.sendMessage({action: "FETCH_COMMENTS", videoID: videoID}, function (items) {
            items.forEach(function (comment) {
                comment.timestamps.forEach(function (timestamp) {
                    if (typeof comments[timestamp] == "undefined") comments[timestamp] = [];
                    comments[timestamp].push(comment);
                });
            });
        });
    });

    var previousTime = 0;
    document.querySelector("#player video").addEventListener("timeupdate", function () {
        var currentTime = Math.round(this.currentTime);
        if (currentTime != previousTime && comments.hasOwnProperty(currentTime)) {
            comments[currentTime].forEach(function (comment) {
                showComment(comment);
            });
        }
        previousTime = currentTime;
    });
}, 250);