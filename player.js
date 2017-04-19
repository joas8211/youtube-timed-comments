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
        element.querySelector(".profile-image").addEventListener("load", function () {
            element.style.animationPlayState = "running";
            setTimeout(function () {
                spots.splice(spots.indexOf(spot), 1);
                element.remove();
            }, 10000);
        });
    }
}

function waitUntilAvailable(parent, target, callback) {
    if (document.querySelector(target) != null) {
        callback();
    } else {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                mutation.addedNodes.forEach(function (node) {
                    if (node.matches(target)) {
                        observer.disconnect();
                        callback();
                    }
                });
            });
        });
        observer.observe(document.querySelector(parent), {
            childList: true
        });
    }
}

waitUntilAvailable("#player-api", "#movie_player", function () {
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

    var previousVideo = null;
    document.querySelector("#player video").addEventListener("canplay", function () {
        var videoID = location.search.match(/v=([^&]+)(&|$)/)[1];
        if (videoID != previousVideo) {
            previousVideo = videoID;
            comments = {};
        
            chrome.runtime.sendMessage({action: "FETCH_COMMENTS", videoID: videoID}, function (items) {
                for (var id in items) {
                    var comment = items[id];
                    comment.timestamps.forEach(function (timestamp) {
                        if (typeof comments[timestamp] == "undefined") comments[timestamp] = [];
                        comments[timestamp].push(comment);
                    });
                }
                var limit = options.hasOwnProperty("limit") ? options.limit : 5;
                var noLists = options.hasOwnProperty("no_lists") ? options.no_lists : true;
                if (noLists) {
                    for (var timestamp in comments) {
                        comments[timestamp].forEach(function (comment, i) {
                            if (comment.timestamps.length >= 3) {
                                comments[timestamp].splice(i, 1);
                            }
                        });
                    }
                }
                var start = parseInt(Object.keys(comments)[0]);
                var end = parseInt(Object.keys(comments).pop());
                var duration = 10;
                while (start <= end) {
                    var queue = [];
                    for (var time = start; time <= start + duration; time++) {
                        if (comments.hasOwnProperty(time)) {
                            comments[time].forEach(function (comment, i) {
                                queue.push({
                                    likeCount: comment.likeCount,
                                    timestamp: time, 
                                    index: i
                                });
                            });
                        }
                    }
                    if (queue.length > limit) {
                        queue.sort(function (a, b) {
                            return a.likeCount - b.likeCount;
                        });
                        queue.slice(0, queue.length - limit).forEach(function (ref) {
                            comments[ref.timestamp].splice(ref.index, 1);
                        });
                    }
                    start++;
                }
            });
        }
    });
});