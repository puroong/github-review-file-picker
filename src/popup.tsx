import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { MessageType, ReviewFileMessageData } from "./core";

const Popup = () => {
  const [currentURL, setCurrentURL] = useState<string>();
  const [textareaValue, setTextAreaValue] = useState<string>("");
  console.log('hello')
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setCurrentURL(tabs[0].url);
    });
  }, []);

  const changeFileViewStatus = () => {
    const viewFileMessageData: ReviewFileMessageData[] = textareaValue
      .split("\n")
      .map((line) => {
        return { path: line.trim(), viewed: true };
      });

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      const tab = tabs[0];
      if (tab.id) {
        chrome.tabs.sendMessage(
          tab.id,
          {
            type: MessageType.VIEW_FILE,
            data: viewFileMessageData,
          },
          (response) => {}
        );
      }
    });
  };

  return (
    <div>
      <textarea
        name="review-files"
        id="review-files-textarea"
        style={{
          'minWidth': '500px',
          'minHeight': '200px'
        }}
        value={textareaValue}
        onChange={(e) => setTextAreaValue(e.target.value)}
      ></textarea>
      <button style={{'width': '100%'}} onClick={changeFileViewStatus}>실행</button>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
