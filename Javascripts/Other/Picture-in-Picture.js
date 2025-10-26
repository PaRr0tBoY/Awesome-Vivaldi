// Picture-in-Picture Enhancement Script for Vivaldi
// @author MickyFoley
// @source https://forum.vivaldi.net/topic/108624/a-user-friendly-enhancement-for-vivaldi-s-picture-in-picture-pip?_=1761390291135
// == Summary of Enhancements Compared to Original Script ==
// This script significantly improves upon a more basic PiP implementation by:
//
// 1.  **No External Configuration Required:**
//     - Removed dependency on any external `config.json` for site-specific selectors or z-index values.
//     - The script now operates autonomously.
//
// 2.  **Aggressive Video Detection & `disablePictureInPicture` Bypass:**
//     - Actively attempts to find and enable PiP for ALL `<video>` elements on a page.
//     - Ignores and overrides the `disablePictureInPicture` attribute/property, forcing PiP availability
//       even if a website tries to prevent it.
//
// 3.  **Robust Dynamic Video Detection:**
//     - Implements a `MutationObserver` on the entire document (`document.documentElement`) to detect
//       and enable PiP for videos added dynamically to the page after initial load.
//     - This complements any browser-specific APIs (like `window.vivaldi.pipPrivate.onVideoElementCreated`).
//
// 4.  **Comprehensive Media Session API Integration:**
//     - Extensively uses the Media Session API to provide rich media control through OS-level UI
//       (e.g., media keys, system media controls).
//     - Supports actions: `play`, `pause`, `stop` (pauses and resets video), `seekbackward` (5s),
//       `seekforward` (5s), `seekto`, `previoustrack` (restarts video), `nexttrack` (seeks to near end).
//     - Attempts to populate `MediaMetadata` (title, artist, album, artwork) more thoroughly by
//       inspecting video attributes, `dataset` properties, and surrounding HTML.
//     - Default seek/skip amount is set to 5 seconds.
//
// 5.  **PiP Activation Icon Styling & Positioning:**
//     - A floating icon appears over videos on mouse hover to activate PiP.
//     - This icon is styled via an external `picture-in-picture.css` file (dependency remains).
//     - The icon is positioned centrally (horizontally centered, slightly offset from the top) over the video.
//
// 6.  **Streamlined Functionality:**
//     - Removed a previously experimental double-click feature in the PiP window due to
//       browser limitations in event propagation from the PiP window.
//     - Removed the keyboard shortcut for toggling PiP to simplify user interaction based on preference.
//
// 7.  **Improved Debugging & Internationalization:**
//     - Enhanced console logging for easier debugging (all logs now in English).
//     - All user-facing strings (tooltips, ARIA labels) and internal comments are in English.
//
// In essence, this script aims to be a more universal, powerful, and user-friendly solution
// for Picture-in-Picture functionality, activated via the on-video icon.

const K_BUTTON_WIDTH = 38; // Default width for the PiP button if not set by CSS
const K_HOVER_TIMEOUT = 2000; // Milliseconds until the button automatically hides
const K_SEEK_AMOUNT = 5; // Seek amount in seconds for forward/backward
const K_TRACK_SKIP_THRESHOLD = 5; // Seconds before the end of video for 'nexttrack' action to avoid auto-closing

var PIP = {
  containerElm_: null, // Container for the PiP button overlay
  pipButton_: null,    // The actual PiP button element
  timerID_: 0,         // Timer ID for auto-hiding the button
  host_: null,         // Host element for the Shadow DOM
  root_: null,         // Shadow DOM root
  tabId_: 0,           // Current tab ID
  seenVideoElements_: new WeakSet(), // Tracks videos for which listeners have been added
  activeVideoForPipClick: null,  // Stores the video element currently targeted by click/hover for PiP activation
  onPipExitBound: null, // Stores the bound onPipExit function for proper event removal

  findSelectorElements: function(selector = 'video') {
    // Finds elements matching the selector, defaults to 'video'
    const videos = document.querySelectorAll(selector);
    return videos;
  },

  findVideoElementForCoordinate: function(x, y) {
    // Finds a video element at the given screen coordinates
    const videos = document.querySelectorAll('video');
    for (let i = 0; i < videos.length; i++) {
      const rect = videos[i].getBoundingClientRect();
      if (x > rect.x &&
          y > rect.y &&
          x < rect.x + rect.width &&
          y < rect.y + rect.height) {
        this.activeVideoForPipClick = videos[i]; // Update for click activation
        return videos[i];
      }
    }
    return null;
  },

  createTimer: function() {
    // Creates a timer to hide the PiP button
    this.clearTimer(); // Ensure no existing timer is running
    this.timerID_ = setTimeout(this.onTimeout.bind(this), K_HOVER_TIMEOUT);
  },

  clearTimer: function() {
    // Clears the button-hiding timer
    if (this.timerID_) {
      clearTimeout(this.timerID_);
      this.timerID_ = 0;
    }
  },

  onTimeout: function() {
    // Called when the timer expires; hides the button
    this.clearTimer();
    if (this.containerElm_) {
        this.containerElm_.classList.add('transparent');
    }
  },

   videoOver: function(event) {
    // Handles mouseover events on video elements or their containers
    const videoElement = event.target.closest('video');
    if (videoElement) {
        this.activeVideoForPipClick = videoElement;
        this.doVideoOver(event.clientX, event.clientY, videoElement);
    } else {
        // Fallback if the event target is an overlay above the video
        const videosNodeList = document.querySelectorAll('video');
        let foundVideo = null;
        for (let i = 0; i < videosNodeList.length; i++) {
            const rect = videosNodeList[i].getBoundingClientRect();
            if (event.clientX >= rect.left && event.clientX <= rect.right &&
                event.clientY >= rect.top && event.clientY <= rect.bottom) {
                foundVideo = videosNodeList[i];
                break;
            }
        }
        if (foundVideo) {
            this.activeVideoForPipClick = foundVideo;
            this.doVideoOver(event.clientX, event.clientY, foundVideo);
        } else {
             // If no video is found but the button is visible and not hovered, start hide timer
             if (this.containerElm_ && !this.containerElm_.classList.contains('transparent') && !this.containerElm_.matches(':hover')) {
                this.createTimer();
            }
        }
    }
  },

  videoOut: function(event) {
    // Handles mouseout events from video elements
    // Start timer to hide button if mouse is not over the button itself
    if (this.containerElm_ && !this.containerElm_.contains(event.relatedTarget) && !this.pipButton_.contains(event.relatedTarget)) {
        this.createTimer();
    }
  },

  doVideoOver: function(x, y, videoElement) {
    // Displays the PiP button over the specified video element
    if (document.fullscreenElement || !this.containerElm_ || !this.pipButton_) {
      if (this.containerElm_) this.containerElm_.classList.add('transparent', 'fullscreen'); // Hide in fullscreen
      return;
    }
    
    let video = videoElement;
    if (!video || video.tagName !== 'VIDEO') { // Ensure it's a video element
        video = this.findVideoElementForCoordinate(x,y);
    }
    
    if (video && video.readyState > 1) { // Video metadata must be loaded
      this.activeVideoForPipClick = video;
      const rect = video.getBoundingClientRect();
      const buttonActualWidth = this.pipButton_.offsetWidth || K_BUTTON_WIDTH;

      // Position the PiP icon (button container) centered horizontally and slightly offset from the top of the video
      const left = rect.left + (rect.width / 2) - (buttonActualWidth / 2) + window.scrollX;
      const top = rect.top + window.scrollY + 10; // 10px offset from the video's top

      this.containerElm_.style.left = `${left}px`;
      this.containerElm_.style.top = `${top}px`;
      this.containerElm_.style.zIndex = 2147483647; // Ensure it's on top

      this.containerElm_.classList.remove("transparent", "initial", "fullscreen");
      this.clearTimer(); // Stop hide timer as mouse is over video/button
    } else {
      // If no valid video, but button is visible and mouse not over it, start hide timer
      if (this.containerElm_ && !this.containerElm_.classList.contains('transparent') && !this.containerElm_.matches(':hover')) {
        this.createTimer();
      }
    }
  },

  buttonOver: function(event) {
    // Handles mouseover on the PiP button itself
    if (this.containerElm_) {
        this.containerElm_.classList.remove('transparent'); // Keep button visible
    }
    this.clearTimer(); // Stop hide timer
  },

  buttonOut: function(event) {
    // Handles mouseout from the PiP button
    this.createTimer(); // Start timer to hide button
  },

  onPipExit: function(eventOrVideo) {
    // Called when PiP mode is exited
    let videoExiting = eventOrVideo.target || eventOrVideo; // Get the video element that was in PiP
    console.log("PiP INFO: onPipExit called for video:", videoExiting);

    if (this.pipButton_) {
        this.pipButton_.classList.remove('on'); // Update button style
    }
    
    if (videoExiting && typeof videoExiting.removeEventListener === 'function') {
        if (this.onPipExitBound) {
            videoExiting.removeEventListener('leavepictureinpicture', this.onPipExitBound);
            console.log("PiP INFO: 'leavepictureinpicture' listener removed.");
        }
    }
    this.removeMediaSessionHandlers(); // Clean up media session
    this.activeVideoForPipClick = null;
    this.onPipExitBound = null;
    if (this.containerElm_) { // Hide the button overlay
        this.containerElm_.classList.add('transparent');
    }
  },

  pipClicked: function(event) {
    // Handles clicks on the PiP button
    let videoTarget = this.activeVideoForPipClick;

    // Fallback if hover didn't set it and it's a mouse click
    if (!videoTarget && event && typeof event.clientX === 'number') {
        videoTarget = this.findVideoElementForCoordinate(event.clientX, event.clientY);
    }
    
    if (videoTarget) {
      // Aggressively enable PiP
      if (videoTarget.hasAttribute('disablePictureInPicture')) {
        videoTarget.removeAttribute('disablePictureInPicture');
      }
      videoTarget.disablePictureInPicture = false;

      try {
        if (document.pictureInPictureElement === videoTarget) {
          // If already in PiP for this video, exit PiP
          document.exitPictureInPicture().catch(err => console.error("PiP ERROR: Failed to exit PiP on click:", err));
        } else {
          // Otherwise, request PiP
          console.log("PiP INFO: Attempting to request PiP for video:", videoTarget);
          videoTarget.requestPictureInPicture()
            .then(() => {
              const pipVideoElement = document.pictureInPictureElement; // Get the actual element in PiP
              console.log("PiP INFO: Successfully entered PiP. Current PiP element:", pipVideoElement);

              if (!pipVideoElement) {
                  console.error("PiP ERROR: document.pictureInPictureElement is null after successful PiP request!");
                  return;
              }

              if (this.pipButton_) this.pipButton_.classList.add('on'); // Update button style
              
              if (this.onPipExitBound && this.lastPipElement && this.lastPipElement !== pipVideoElement) {
                  this.lastPipElement.removeEventListener('leavepictureinpicture', this.onPipExitBound);
              }
              this.onPipExitBound = () => this.onPipExit(pipVideoElement); 
              pipVideoElement.addEventListener('leavepictureinpicture', this.onPipExitBound);
              this.lastPipElement = pipVideoElement; 
              console.log("PiP INFO: 'leavepictureinpicture' listener added to PiP element:", pipVideoElement);
              
              this.setupMediaSessionHandlers(pipVideoElement); // Set up media controls
            })
            .catch(err => {
                console.error("PiP ERROR: Failed to enter PiP for video:", videoTarget, err);
            });
        }
      } catch (error) {
          console.error("PiP ERROR: Unexpected error in pipClicked:", error);
      }
      if (event) { // Prevent default action if it was a mouse click
        event.preventDefault();
        event.stopPropagation();
      }
    } else {
        console.log("PiP INFO: pipClicked called but no videoTarget found.");
    }
  },

  setupMediaSessionHandlers: function(video) {
    // Sets up Media Session API handlers for rich media control.
    if (!navigator.mediaSession) {
      console.warn("PiP WARNING: MediaSession API not available.");
      return;
    }
    try {
      let title = video.title || document.title;
      let artist = window.location.hostname;
      let album = 'Picture-in-Picture Video';
      let artworkSrc = video.poster || '';

      if (video.dataset.title) title = video.dataset.title;
      if (video.dataset.artist) artist = video.dataset.artist;
      if (video.dataset.album) album = video.dataset.album;
      if (video.dataset.artwork) artworkSrc = video.dataset.artwork;
      else {
        const closestFigcaption = video.closest('figure')?.querySelector('figcaption');
        if (closestFigcaption) title = closestFigcaption.textContent.trim();
      }

      // Add '画中画' suffix if title doesn't already contain it
      if (title && !title.includes('画中画')) {
        title = title + ' - 画中画';
      } else if (!title) {
        title = '视频播放 - 画中画';
      }

      navigator.mediaSession.metadata = new MediaMetadata({
        title: title,
        artist: artist,
        album: album,
        artwork: artworkSrc ? [{ src: artworkSrc, sizes: '512x512', type: 'image/png' }] : [] 
      });

      navigator.mediaSession.setActionHandler('play', () => {
        if (video.paused) video.play().catch(e => console.error("PiP ERROR: Play action failed:", e));
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        if (!video.paused) video.pause();
      });
      navigator.mediaSession.setActionHandler('stop', () => { 
        video.pause();
        video.currentTime = 0;
        console.log("PiP INFO: Media session 'stop' action handled.");
      });
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || K_SEEK_AMOUNT; 
        video.currentTime = Math.max(0, video.currentTime - skipTime);
      });
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || K_SEEK_AMOUNT; 
        video.currentTime = Math.min(video.duration, video.currentTime + skipTime);
      });
      navigator.mediaSession.setActionHandler('seekto', (details) => { 
        if (details.fastSeek && ('fastSeek' in video)) {
          video.fastSeek(details.seekTime); 
        } else {
          video.currentTime = details.seekTime;
        }
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => { 
        video.currentTime = 0;
        console.log("PiP INFO: Media session 'previoustrack' action handled (seek to start).");
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => { 
        if (video.duration) {
            video.currentTime = Math.max(0, video.duration - K_TRACK_SKIP_THRESHOLD);
        } else {
            video.currentTime = 0; 
        }
        console.log("PiP INFO: Media session 'nexttrack' action handled (seek to end).");
      });

      console.log("PiP INFO: All available media session handlers set up (seek amount: " + K_SEEK_AMOUNT + "s).");

    } catch (error) {
      console.warn("PiP WARNING: Error setting up media session handlers:", error);
    }
  },

  removeMediaSessionHandlers: function() {
    // Clears all Media Session API handlers
    if (!navigator.mediaSession) {
      return;
    }
    try {
      navigator.mediaSession.setActionHandler('play', null);
      navigator.mediaSession.setActionHandler('pause', null);
      navigator.mediaSession.setActionHandler('stop', null);
      navigator.mediaSession.setActionHandler('seekbackward', null);
      navigator.mediaSession.setActionHandler('seekforward', null);
      navigator.mediaSession.setActionHandler('seekto', null);
      navigator.mediaSession.setActionHandler('previoustrack', null);
      navigator.mediaSession.setActionHandler('nexttrack', null);
      navigator.mediaSession.metadata = null; 
      console.log("PiP INFO: All media session handlers removed.");
    } catch (error)      {
      console.warn("PiP WARNING: Error removing media session handlers:", error);
    }
  },

  onFullscreenChange: function(event) {
    // Hides the PiP button overlay if the main page enters fullscreen
    if (this.containerElm_) {
      if (document.fullscreenElement) {
        this.containerElm_.classList.add('transparent', 'fullscreen');
      } else {
        this.containerElm_.classList.remove('fullscreen');
      }
    }
  },

  registerVideoListener_: function(videoElement) {
    // Adds necessary event listeners to a video element
    const useCapture = false; 
    if (this.seenVideoElements_.has(videoElement)) return; 

    this.seenVideoElements_.add(videoElement);
    videoElement.addEventListener('mousemove', this.videoOver.bind(this), useCapture);
    videoElement.addEventListener('mouseout', this.videoOut.bind(this), useCapture); 
    videoElement.addEventListener('play', (e) => { 
        this.activeVideoForPipClick = e.target; 
        if (this.containerElm_ && this.containerElm_.classList.contains('transparent')) {
            const clientX = e.clientX || 0; 
            const clientY = e.clientY || 0;
            this.doVideoOver(clientX, clientY, e.target);
        }
    }, useCapture);
  },

  createPipButton: function() {
    // Creates the floating PiP button and its container, injects CSS
    if (this.pipButton_) return; 

    this.host_ = document.createElement('div');
    this.host_.id = 'vivaldi-pip-host-with-icon'; 
    try {
        this.root_ = this.host_.attachShadow({mode: 'open'}); 
    } catch (e) {
        console.warn("PiP WARNING: Shadow DOM not supported or failed, appending directly to host.", e);
        this.root_ = this.host_; 
    }

    const cssUrl = chrome.runtime.getURL('picture-in-picture.css'); 
    if (cssUrl) {
        const link = document.createElement('link');
        link.href = cssUrl;
        link.type = 'text/css';
        link.rel = 'stylesheet';
        this.root_.appendChild(link);
    } else {
        console.warn("PiP WARNING: Could not load picture-in-picture.css. Button may lack styling.");
    }

    this.containerElm_ = document.createElement('div');
    this.containerElm_.classList.add('vivaldi-picture-in-picture-container', 'initial', 'transparent');
    this.root_.appendChild(this.containerElm_);

    this.pipButton_ = document.createElement('input');
    this.pipButton_.setAttribute('type', 'button');
    this.pipButton_.classList.add('vivaldi-picture-in-picture-button');
    this.pipButton_.setAttribute('aria-label', 'Toggle Picture-in-Picture Mode'); 
    this.pipButton_.title = 'Picture-in-Picture'; // Removed shortcut from title
    this.containerElm_.appendChild(this.pipButton_);

    this.containerElm_.addEventListener('mouseenter', this.buttonOver.bind(this), true);
    this.containerElm_.addEventListener('mouseleave', this.buttonOut.bind(this), true);
    this.pipButton_.addEventListener('click', this.pipClicked.bind(this), true); 

    document.documentElement.appendChild(this.host_); 
  },

  scanAndRegisterVideos: function() {
    // Scans the document for video elements and registers listeners
    if (!this.pipButton_) { 
        this.createPipButton();
    }
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video.hasAttribute('disablePictureInPicture')) {
        video.removeAttribute('disablePictureInPicture');
      }
      video.disablePictureInPicture = false;
      this.registerVideoListener_(video);
    });
  },
  
  // handleKeyboardShortcut: function(event) { ... } // ENTIRE FUNCTION REMOVED

  injectPip: function() {
    // Main function to initialize the script
    if (document.getElementById('vivaldi-pip-host-with-icon')) {
        return; 
    }

    chrome.runtime.sendMessage({method: "getCurrentId"}, (response) => {
      if (chrome.runtime.lastError) {
        this.tabId_ = 0; 
      } else if (!response) {
        this.tabId_ = 0; 
      } else {
        this.tabId_ = response.tabId;
      }

      this.createPipButton(); 
      this.scanAndRegisterVideos(); 
      
      const observer = new MutationObserver((mutationsList) => {
          let needsScan = false;
          for(const mutation of mutationsList) {
              if (mutation.type === 'childList') {
                  mutation.addedNodes.forEach(node => {
                      if (node.nodeType === Node.ELEMENT_NODE) { 
                        if (node.tagName === 'VIDEO' || (node.matches && node.matches('video')) || (node.querySelector && node.querySelector('video'))) {
                            needsScan = true;
                        }
                      }
                  });
              }
              if (needsScan) break; 
          }
          if (needsScan) {
            this.scanAndRegisterVideos(); 
          }
      });
      observer.observe(document.documentElement, { childList: true, subtree: true }); 
      
      // document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this), true); // REMOVED
      document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this)); 
      console.log("PiP INFO: Script (International English Version, No Shortcut) injected and initialized.");
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => PIP.injectPip());
} else {
  PIP.injectPip(); 
}
