function loadApi(cb) {
    if (typeof gapi != "undefined") {
        cb();
    } else {
        var gapiScript = document.createElement("script");
        gapiScript.src = "https://apis.google.com/js/client.js?onload=gapiLoaded";
        document.head.appendChild(gapiScript);
        window.gapiLoaded = function () {
            gapi.client.load("youtube", "v3", cb);
        };
    }
}

function auth(cb) {
    chrome.identity.getAuthToken({ interactive: true }, function(token) {
        gapi.auth.setToken({
            access_token: token
        });
        cb();
    });
}

function fetchComments(videoID, cb) {
    var h = 0;
    loadApi(function () {
        auth(function () {
            var count = 0;
            var comments = {};
            var authors = {};
            var request = function (searchTerm, pageToken) {
                count++;
                gapi.client.youtube.commentThreads.list({
                    part: "snippet",
                    videoId: videoID,
                    maxResults: 100,
                    textFormat: "html",
                    searchTerms: searchTerm,
                    pageToken: pageToken
                }).then(function (data) {
                    var regExp = new RegExp('<a href="http://www\\.youtube\\.com/watch\\?v='+videoID+'&amp;t=(\\d+h)?\\d+m\\d+s">(\\d+):(\\d+):?(\\d+)?</a>', 'g');
                    data.result.items.forEach(function (item) {
                        regExp.lastIndex = 0;
                        var id = item.snippet.topLevelComment.id;
                        var comment = item.snippet.topLevelComment.snippet;
                        var _timestamps = comment.textDisplay.match(regExp);
                        if (_timestamps != null) {
                            var timestamps = [];
                            _timestamps.forEach(function (_timestamp) {
                                regExp.lastIndex = 0;
                                var seconds = 0;
                                var result = regExp.exec(_timestamp);
                                if (typeof result[4] == "undefined") {
                                    seconds += parseInt(result[2]) * 60;        // minutes
                                    seconds += parseInt(result[3]);             // seconds
                                } else {
                                    seconds += parseInt(result[2]) * 60 * 60;   // hours
                                    seconds += parseInt(result[3]) * 60;        // minutes
                                    seconds += parseInt(result[4]);             // seconds
                                }
                                timestamps.push(seconds);
                            });
                            comment.timestamps = timestamps;
                            if (comment.authorChannelId.hasOwnProperty("value")) {
                                var authorId = comment.authorChannelId.value;
                                if (typeof authors[authorId] == "undefined") authors[authorId] = [];
                                authors[authorId].push(id);
                            }
                            if (!comments.hasOwnProperty(id)) {
                                comments[id] = comment;
                            }
                        }
                    });
                    count--;
                    if (data.result.hasOwnProperty("nextPageToken")) {
                        request(searchTerm, data.result.nextPageToken);
                    } else if (count == 0) {
                        var ids = Object.keys(authors);
                        var idsList = null;
                        while ((idsList = ids.splice(0, 50).join(","))) {
                            count++;
                            gapi.client.youtube.channels.list({
                                part: "snippet",
                                id: idsList,
                                maxResults: 50
                            }).then(function (data) {
                                data.result.items.forEach(function (item) {
                                    authors[item.id].forEach(function (commentId) {
                                        comments[commentId].authorProfileImageUrl = item.snippet.thumbnails.medium.url;
                                    });
                                });
                                count--;
                                if (count == 0) {
                                    cb(comments);
                                }
                            });
                        }
                    }
                });
            };
            [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (searchTerm) {
                request(searchTerm);
            });
        });
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    switch (request.action) {
        case "FETCH_COMMENTS":
            fetchComments(request.videoID, sendResponse);
            return true;
    }
});