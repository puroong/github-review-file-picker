import {
  GithubFile,
  Message,
  MessageType,
  ReviewFileMessageData,
} from "./core";

const PR_URL = (document.querySelector(
  'meta[property="og:url"]'
) as HTMLMetaElement)!.content;
const FILE_VIEW_API = `${PR_URL}/file_review`;
const ACTION = FILE_VIEW_API.split("https://github.com")[1];

console.log(`PR URL: ${PR_URL}`);
console.log(`FILE VIEW API: ${FILE_VIEW_API}`);
console.log(`ACTION: ${ACTION}`);

if (PR_URL === null) {
  alert('meta[property="og:url"]로 PR url을 파싱하지 못했습니다.');
}

function scrollToBottom() {
  const prevScrollHeight = document.body.scrollHeight;
  window.scrollTo(0, prevScrollHeight);

  while (prevScrollHeight !== document.body.scrollHeight) {
    const prevScrollHeight = document.body.scrollHeight;
    window.scrollTo(0, prevScrollHeight);
  }
}

function parseGithubFiles() {
  const githubFileViewButtonForms = document.querySelectorAll(
    `form[action="${ACTION}"]`
  );

  const githubFiles = Array.from(githubFileViewButtonForms).map(
    (githubFileViewButtonForm) => {
      const authenticityToken = (
        githubFileViewButtonForm.querySelector(
          'input[name="authenticity_token"]'
        ) as HTMLInputElement
      ).value;
      const path = (
        githubFileViewButtonForm.querySelector(
          'input[name="path"]'
        ) as HTMLInputElement
      ).value;

      return {
        authenticityToken,
        path,
      };
    }
  );

  return githubFiles;
}

function viewFile(githubFiles: GithubFile[]) {
  return githubFiles.map((githubFile) => {
    const formData = new FormData();
    formData.append("authenticity_token", githubFile.authenticityToken);
    formData.append("path", githubFile.path);
    formData.append("viewed", "viewed");

    return fetch(FILE_VIEW_API, {
      method: "POST",
      body: formData,
    });
  });
}

function cancelViewFile(githubFiles: GithubFile[]) {
  return githubFiles.map((githubFile) => {
    const formData = new FormData();
    formData.append("authenticity_token", githubFile.authenticityToken);
    formData.append("path", githubFile.path);
    formData.append("_method", "delete");

    return fetch(FILE_VIEW_API, {
      method: "POST",
      body: formData,
    });
  });
}

chrome.runtime.onMessage.addListener(async function (
  msg: Message,
  sender,
  sendResponse
) {
  if (msg.type === MessageType.VIEW_FILE) {
    const data = msg.data as ReviewFileMessageData[];
    console.log(data);
    const viewFilePaths = data
      .filter((datum) => datum.viewed)
      .map((datum) => datum.path);

    scrollToBottom();
    const githubFiles = parseGithubFiles();
    await Promise.all([
      ...viewFile(
        githubFiles.filter(
          (githubFile) =>
            !viewFilePaths.find((path) => path === githubFile.path)
        )
      ),
      ...cancelViewFile(
        githubFiles.filter((githubFile) =>
          viewFilePaths.find((path) => path === githubFile.path)
        )
      ),
    ]);
    window.location.reload();
  }
});
