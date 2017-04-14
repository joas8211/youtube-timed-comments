var container = document.createElement("div");
container.id = "yttc-container";
document.querySelector("#movie_player").appendChild(container);

var comments = {};
var spots = [];

document.querySelector("#player video").addEventListener("canplay", function () {
    comments = {};
    var videoID = location.search.match(/v=([^&]+)(&|$)/)[1];
    chrome.runtime.sendMessage({action: "FETCH_COMMENTS", videoID: videoID}, function (items) {
        items.forEach(function (comment) {
            comment.timestamps.forEach(function (timestamp) {
                comments[timestamp] = comment;
            });
        });
    });
});

var previousTime = 0;
document.querySelector("#player video").addEventListener("timeupdate", function () {
    var currentTime = Math.round(this.currentTime);
    if (currentTime != previousTime && comments.hasOwnProperty(currentTime)) {
        for (var spot = 0; spots.indexOf(spot) > -1; spot++);
        spots.push(spot);
        var comment = comments[currentTime];
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
    }
    previousTime = currentTime;
});