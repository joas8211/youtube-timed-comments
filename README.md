# Youtube Timed Comments

Youtube Timed Comments is a Chrome extension for showing comments in a corner of a Youtube video.
Time when these comments popup is determinated by timestamps in a comment (i.e. 12:34).

You can download the latest release straight from [Chrome Web Store](https://chrome.google.com/webstore/detail/youtube-timed-comments/mlljpeldlfcdmmailijkjokfenhcnolp).

## Features
| Feature                                                   | Option | Default  |
| :-------------------------------------------------------- | :----: | :------: |
| Disabling in not-fullscreen mode                          | Yes    | Disabled |
| Limiting the count of comments visible in same time       | Yes    | 5        |
| List filter											                          | Yes    | Enabled  |
| Remove timestamps from beginning                          | No     |          |

## Contributing
You can contribute coding through [pull requests](https://github.com/joas8211/youtube-timed-comments/pulls) or report bugs / suggest a feature through in the [issues section](https://github.com/joas8211/youtube-timed-comments/issues).

### Guidelines
Theres only one limitation in contributing through pull requests.
When adding a new **feature** it must be approved by the author if it isn't included in the to-do list.
Otherwise the pull request will be rejected or it will hang there until a future examination.

### How to get started?
1. Clone the repository
2. Load the extension from Chrome's extensions page (chrome://extensions/)
3. Copy the Application ID from extensions page
4. Create a development project in [Google Developer Console](https://console.developers.google.com/)
5. Enable YouTube Data API v3
6. Create Chrome App OAuth client ID with copied Application ID in [credentials page](https://console.developers.google.com/apis/credentials)
7. Copy client ID to [manifest.json](../master/manifest.json)
8. Reload the extension

## To-do
- Icons

## License
[MIT](../master/LICENSE)
