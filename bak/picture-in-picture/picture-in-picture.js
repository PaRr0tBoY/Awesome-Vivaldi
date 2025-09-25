// chrome-extension://jffbochibkahlbbmanpmndnhmeliecah/

const kButtonWidth = 38;
const kHoverTimeout = 3000;

var PIP = {
  containerElm_: null,
  pipButton_: null,
  timerID_: 0,
  host_: null,
  root_: null,
  videos_: null,
  tabId_: 0,
  overrideTable_: [],
  seenVideoElements_: new WeakSet(),

  getOverrideVideoSelector: function(url) {
    for (let i = 0; i < this.overrideTable_.length; i++) {
      if (url.indexOf(this.overrideTable_[i].host) > 0) {
        return this.overrideTable_[i];
      }
    }
    return { selector: "video", capture: false }; // Default
  },

  // Returns the video element selector for the top level element that is
  // handling events for the video.
  findSelectorElements: function(selector) {
    if (!selector) {
      selector = 'video';
    }
    const videos = document.querySelectorAll(selector);
    return videos;
  },

  // Finds the video element under the mouse event coordinate.
  findVideoElementForCoordinate: function(x, y) {
    const videos = document.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      const rect = videos[i].getBoundingClientRect();
      if (x > rect.x &&
          y > rect.y &&
          x < rect.x + rect.width &&
          y < rect.y + rect.height) {
        // Don't show button if PIP is disabled for the video, it will not
        // work. See https://w3c.github.io/picture-in-picture/#disable-pip.
        if (videos[i].disablePictureInPicture === true) {
          continue;
        }
        return videos[i];
      }
    }
    return null;
  },
  createTimer: function() {
    this.timerID_ = setTimeout(this.onTimeout.bind(this), kHoverTimeout);
  },

  clearTimer: function() {
    clearTimeout(this.timerID_);
  },

  onTimeout: function() {
    clearTimeout(this.timerID_);
    delete this.timerID_;
    this.timerID_ = 0;
    this.containerElm_.classList.add('transparent');
  },

  videoOver: function(event) {
    this.doVideoOver(event.x, event.y);
  },

  videoOut: function(event) {
    if (this.containerElm_) {
      this.containerElm_.classList.add('transparent');
    }
  },

  doVideoOver: function(x, y) {
    if (document.fullscreenElement) {
      // Don't show a button if we're in fullscreen.
      return;
    }
    // Get the video element rect
    let video = this.findVideoElementForCoordinate(x, y);
    const selector = this.getOverrideVideoSelector(document.URL);
    if (!video) {
      video = this.findSelectorElements(selector.selector);
      if (Array.isArray(video)) {
        video = video[0];
      }
    }
    // For some sites, we want to override the z-index of the button.
    let zIndex = 2147483647;
    if (selector.zIndex) {
      zIndex = selector.zIndex;
    }
    // readyState > 1 means it has loaded the meta data and has data for
    // at least one frame. pip should be safe now.
    if (video && video.readyState > 1) {
      const rect = video.getBoundingClientRect();
      const left =
        rect.left +
        rect.width -
        rect.width / 2 +
        window.scrollX -
        kButtonWidth / 2;
      const top = rect.top + window.scrollY;
      // Position our button container to overlap the hovered video element.
      this.containerElm_.style = `left: ${left}px; top: ${top}px;`;
      this.containerElm_.style.zIndex = zIndex;
      this.containerElm_.classList.remove("transparent");
      this.containerElm_.classList.remove("initial");
      this.createTimer();
    }
  },

  buttonOver: function(event) {
    // We don't want to hide it if the user is hovering the button.
    this.containerElm_.classList.remove('transparent');
    this.clearTimer();
  },

  buttonOut: function(event) {
    this.createTimer();
  },

  onPipExit: function(event) {
    this.pipButton_.classList.remove('on');
    event.target.removeEventListener('leavepictureinpicture', this.onPipExit);
    this.removeMediaSessionSeekTo();
  },

  pipClicked: function(event) {
    const videoTarget = this.findVideoElementForCoordinate(event.x, event.y);
    if (videoTarget) {
      if (videoTarget.ownerDocument.pictureInPictureElement ===
          videoTarget) {
        videoTarget.ownerDocument.exitPictureInPicture();
      } else {
        videoTarget.requestPictureInPicture();
        this.pipButton_.classList.add('on');
        videoTarget.addEventListener('leavepictureinpicture',
            this.onPipExit.bind(this));
        this.setMediaSessionSeekTo(videoTarget);
      }
      event.preventDefault();
      event.stopPropagation();
    }
  },

  removeMediaSessionSeekTo: function() {
    try {
      // 'seekto' is new for Chromium 81, try/catch here just to be safe.
      navigator.mediaSession.setActionHandler('seekto', null);
    } catch (error) {
      // do nothing
    }
  },

  setMediaSessionSeekTo: function(video) {
    try {
      // Installs a handler to listen to actions triggered from the PIP
      // window.
      // 'seekto' is new for Chromium 81, try/catch here just to be safe.
      navigator.mediaSession.setActionHandler('seekto',
          this.handleSeekTo.bind(this, video));
    } catch (error) {
      // do nothing
    }
  },

  handleSeekTo: function(video, event) {
    if (event.fastSeek && ('fastSeek' in video)) {
      video.fastSeek(event.seekTime);
      return;
    }
    video.currentTime = event.seekTime;
    // TODO: Do we need to update the position state on the video too?
  },

  onFullscreenChange: function(event) {
    if (this.containerElm_) {
      if (document.fullscreenElement) {
        this.containerElm_.classList.add('transparent');
      }
    }
  },
  registerVideoListener_: function(video) {
    const override = this.getOverrideVideoSelector(document.URL);
    let selectorElms = Array.from(this.findSelectorElements(override.selector));
    selectorElms = selectorElms.filter(elm => !this.seenVideoElements_.has(elm));
    selectorElms.forEach(elm => {
      // We also add the elements that are not necessarily video elements.
      this.seenVideoElements_.add(elm);
      elm.addEventListener('mousemove',
          this.videoOver.bind(this), override.capture);
      elm.addEventListener('mouseout',
          this.videoOut.bind(this), override.capture);
    });
  },

  createPipButton: function() {
    if (!this.pipButton_) {
      this.host_ = document.createElement('div');
      this.root_ = this.host_.attachShadow({mode: 'open'});

      const link = document.createElement('link');
      link.href = chrome.extension.getURL('picture-in-picture.css');
      link.type = 'text/css';
      link.rel = 'stylesheet';
      this.root_.appendChild(link);

      // We use only a single button which we move between videos when hovering.
      this.containerElm_ = document.createElement('div');
      this.containerElm_.classList.add('vivaldi-picture-in-picture-container');
      this.containerElm_.classList.add('initial');
      this.root_.appendChild(this.containerElm_);

      this.pipButton_ = document.createElement('input');
      this.pipButton_.setAttribute('type', 'button');
      this.pipButton_.classList.add('vivaldi-picture-in-picture-button');
      this.pipButton_.setAttribute('aria-label', 'picture-in-picture-button');
      this.containerElm_.appendChild(this.pipButton_);

      this.containerElm_.addEventListener('mousemove',
          this.buttonOver.bind(this), true);
      this.containerElm_.addEventListener('mouseout',
          this.buttonOut.bind(this), true);

      this.host_.addEventListener('click', this.pipClicked.bind(this));

      document.documentElement.appendChild(this.host_);

      document.addEventListener('fullscreenchange',
          this.onFullscreenChange.bind(this));
    }
  },

  onElementAdded: function(tabId) {
    // If a video element is added dynamically, we need to attach the handlers
    // to any new video element.
    let videos = Array.from(document.querySelectorAll('video'));
    videos = videos.filter(video => !this.seenVideoElements_.has(video));
    if (videos && videos.length > 0) {
      this.createPipButton();
    }
    videos.forEach(video => {
      this.registerVideoListener_(video);
    });
  },

  injectPip() {
    // Get hold of the tabId by bouncing a message to the background script.
    chrome.runtime.sendMessage({method: "getCurrentId"}, (response) => {
      if (!response) {
        console.warn("No valid response from extension script.");
      }
      this.tabId_ = response ? response.tabId : 0;
      const URL = chrome.extension.getURL('config.json');
      fetch(URL).then(json_response => {
        if (json_response.ok) {
          json_response.json().then(json => {
            this.overrideTable_ = json;
            this.onElementAdded();
            window.vivaldi.pipPrivate.onVideoElementCreated.addListener(
                this.onElementAdded.bind(this));
          });
        }
      });
    });
  }
};

PIP.injectPip();
