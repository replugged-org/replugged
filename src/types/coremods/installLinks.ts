export interface Downloadable {
  name: string;
  id: string;
  type: string;
  url: string;
  version: string;
  description?: string;
  author: DownloadableAuthor;
}

export interface DownloadableAuthor {
  name: string;
  github?: string;
  discordID?: string;
}
