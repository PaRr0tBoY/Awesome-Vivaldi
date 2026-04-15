// VivaldiHistorySummary.js
// Modified to be triggered by a command chain button, similar to MoonPhase.js

(async function vivaldiHistorySummary() {
  "use strict";

  // EDIT START
  // Command chain identifier (inspect UI and input your own)
  // This is the ID of the button you want to use to trigger the summary.
  const command = "COMMAND_b74ad2da-7877-4557-a941-f26392e627a2";
  // EDIT END

  class NotificationManager {
    constructor() {
      this.notifications = [];
      this.currentTop = 20;
      this.notificationGap = 12;
    }

    show(message, isError = false, isStream = false) {
      const notification = document.createElement("div");
      notification.style.cssText = `
                  position: fixed;
                  right: 20px;
                  top: ${this.currentTop}px;
                  max-width: 400px;
                  width: auto;
                  padding: 15px;
                  background: ${isError ? "#ff4444" : "#4444ff"};
                  color: white;
                  border-radius: 8px;
                  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                  z-index: 10000;
                  font-family: Arial, sans-serif;
                  font-size: 14px;
                  line-height: 1.4;
                  word-wrap: break-word;
                  white-space: pre-wrap;
                  transition: all 0.3s ease;
                  overflow: hidden;
                  ${isStream ? "max-height: 730px;" : "max-height: 500px;"}
              `;

      const closeBtn = document.createElement("button");
      closeBtn.textContent = "×";
      closeBtn.style.cssText = `
                  position: absolute;
                  top: 5px;
                  right: 10px;
                  background: none;
                  border: none;
                  color: white;
                  font-size: 20px;
                  cursor: pointer;
                  padding: 0;
                  width: 20px;
                  height: 20px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              `;
      closeBtn.onclick = () => this.remove(notification);
      notification.appendChild(closeBtn);

      const content = document.createElement("div");
      content.style.cssText = `
                  margin-right: 25px;
                  max-height: ${isStream ? "700px" : "300px"};
                  overflow-y: auto;
              `;
      notification.appendChild(content);
      document.body.appendChild(notification);

      this.notifications.push(notification);
      this.currentTop += notification.offsetHeight + this.notificationGap;

      return { notification, content };
    }

    remove(notification) {
      const index = this.notifications.indexOf(notification);
      if (index > -1) {
        this.notifications.splice(index, 1);
        document.body.removeChild(notification);
        this.rearrange();
      }
    }

    rearrange() {
      this.currentTop = 20;
      this.notifications.forEach((notif) => {
        notif.style.top = this.currentTop + "px";
        this.currentTop += notif.offsetHeight + this.notificationGap;
      });
    }

    clear() {
      this.notifications.forEach((notif) => {
        if (document.body.contains(notif)) {
          document.body.removeChild(notif);
        }
      });
      this.notifications = [];
      this.currentTop = 20;
    }
  }

  // --- Fetch Today's History (getTodayHistoryWithTopSite) ---
  async function getTodayHistoryWithTopSite() {
    try {
      const now = new Date().getTime();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const startTime = todayStart.getTime();

      const historyItems = await vivaldi.historyPrivate.visitSearch({
        startTime: startTime,
        endTime: now,
      });

      const groupedItems = { Morning: {}, Afternoon: {}, Evening: {} };
      const allSitesCount = {};

      historyItems.forEach((item) => {
        const hour = new Date(item.visitTime).getHours();
        const title = item.title || "Untitled";
        let timeOfDay;

        if (hour >= 5 && hour < 12) {
          timeOfDay = "Morning";
        } else if (hour >= 12 && hour < 18) {
          timeOfDay = "Afternoon";
        } else {
          timeOfDay = "Evening";
        }

        if (!groupedItems[timeOfDay][title]) {
          groupedItems[timeOfDay][title] = {
            url: item.url,
            count: 1,
            firstVisit: item.visitTime,
            lastVisit: item.visitTime,
          };
        } else {
          groupedItems[timeOfDay][title].count++;
          if (item.visitTime < groupedItems[timeOfDay][title].firstVisit) {
            groupedItems[timeOfDay][title].firstVisit = item.visitTime;
          }
          if (item.visitTime > groupedItems[timeOfDay][title].lastVisit) {
            groupedItems[timeOfDay][title].lastVisit = item.visitTime;
          }
        }

        if (!allSitesCount[title]) {
          allSitesCount[title] = {
            url: item.url,
            count: 1,
            firstVisit: item.visitTime,
            lastVisit: item.visitTime,
          };
        } else {
          allSitesCount[title].count++;
          if (item.visitTime < allSitesCount[title].firstVisit) {
            allSitesCount[title].firstVisit = item.visitTime;
          }
          if (item.visitTime > allSitesCount[title].lastVisit) {
            allSitesCount[title].lastVisit = item.visitTime;
          }
        }
      });

      const topSites = Object.keys(allSitesCount)
        .map((title) => ({ title, ...allSitesCount[title] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      let historyText = `Found ${historyItems.length} history records today:\n\n`;

      Object.keys(groupedItems).forEach((timeOfDay) => {
        const items = groupedItems[timeOfDay];
        if (Object.keys(items).length > 0) {
          historyText += `${timeOfDay}:\n{\n`;
          Object.keys(items).forEach((title) => {
            const item = items[title];
            const firstTime = new Date(item.firstVisit).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );
            const lastTime = new Date(item.lastVisit).toLocaleTimeString(
              "en-US",
              {
                hour: "2-digit",
                minute: "2-digit",
              },
            );

            if (item.count === 1) {
              historyText += `[${firstTime}]${title}-${item.url}\n`;
            } else {
              historyText += `[${firstTime}~${lastTime}]${title}(${item.count} times)-${item.url}\n`;
            }
          });
          historyText += "}\n\n";
        }
      });

      historyText += "====================\n";
      historyText += "Most visited pages today (Top 3):\n";

      topSites.forEach((site, index) => {
        historyText += `\nNo.${index + 1}: ${site.title}\n`;
        historyText += `URL: ${site.url}\n`;
        historyText += `Visits: ${site.count}\n`;
        const percentage = ((site.count / historyItems.length) * 100).toFixed(
          1,
        );
        historyText += `Share of today's visits: ${percentage}%\n`;
      });

      historyText += "====================";
      return historyText;
    } catch (error) {
      console.error("Failed to fetch history:", error);
      return "Failed to fetch history: " + error.message;
    }
  }

  // --- Call AI stream API (callAIStream) ---
  async function callAIStream(historyText, onChunk) {
    const API_KEY = "e2105adcbe8d4d6ea49dce2fd94c127f.6dcsB9uMmtNxKXl2";
    const API_URL = "https://open.bigmodel.cn/api/paas/v4/chat/completions";

    if (!API_KEY) {
      onChunk("Please configure the API key in the script first");
      return;
    }

    const prompt = `Summarize my day based on the history records. Output the result in English. Here is my browsing history today:\n${historyText}`;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "glm-4-flash",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful AI assistant, skilled at summarizing a user's daily activities based on their browsing history.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error) {
      console.error("AI call failed:", error);
      onChunk("AI call failed: " + error.message);
    }
  }

  // --- Main (main) ---
  async function main() {
    const notificationManager = new NotificationManager();
    notificationManager.clear();

    const { notification: loadingNotif, content: loadingContent } =
      notificationManager.show("Fetching history...");
    const historyText = await getTodayHistoryWithTopSite();

    if (historyText.startsWith("Failed to fetch history")) {
      loadingContent.textContent = historyText;
      loadingNotif.style.background = "#ff4444";
      return;
    }

    const { notification: streamNotif, content: streamContent } =
      notificationManager.show("AI Analysis Results:\n\n", false, true);
    let fullResponse = "AI Analysis Results:\n\n";

    await callAIStream(historyText, (chunk) => {
      fullResponse += chunk;
      streamContent.textContent = fullResponse;
      streamContent.scrollTop = streamContent.scrollHeight;
    });

    notificationManager.remove(loadingNotif);
  }

  // --- Core modification: Find and bind button ---
  // This function iterates over all buttons to find the specified one and binds the click event
  function setupButton(el) {
    const btn = el.getElementsByTagName("BUTTON");
    for (let i = 0; i < btn.length; i++) {
      // Check if button name matches our command ID
      // and ensure it hasn't been bound yet
      if (
        btn[i].name === command &&
        !btn[i].classList.contains("vhs-summary-btn")
      ) {
        console.log(
          "Vivaldi History Summary: Button found and event attached.",
        );
        // Bind main function
        btn[i].addEventListener("click", main);
        // Add custom class to prevent duplicate binding
        btn[i].classList.add("vhs-summary-btn");
      }
    }
  }

  // --- Wait for page load and start listening ---
  // Similar logic to MoonPhase.js to ensure the button can be found in dynamic UI
  const wait = () => {
    return new Promise((resolve) => {
      const check = document.getElementById("browser");
      if (check) return resolve(check);
      else {
        const startup = new MutationObserver(() => {
          const el = document.getElementById("browser");
          if (el) {
            startup.disconnect();
            resolve(el);
          }
        });
        startup.observe(document.body, { childList: true, subtree: true });
      }
    });
  };

  const lazy = (el, observer) => {
    observer.observe(el, { childList: true, subtree: true });
  };

  await wait().then((browser) => {
    const lazy_obs = new MutationObserver(() => {
      lazy_obs.disconnect();
      setTimeout(() => {
        setupButton(browser);
        lazy(browser, lazy_obs);
      }, 666); // Delay execution to ensure UI is fully rendered
    });
    setupButton(browser);
    lazy(browser, lazy_obs);
  });
})();
