export enum MessageType {
  VIEW_FILE,
}

export interface Message {
  type: MessageType;
  data: any;
}

export interface ReviewFileMessageData {
  path: string;
  viewed: boolean;
}

export interface GithubFile {
  authenticityToken: string;
  path: string;
}
