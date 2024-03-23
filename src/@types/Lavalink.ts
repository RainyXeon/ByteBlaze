export type LavalinkDataType = {
  host: string;
  port: number;
  pass: string;
  secure: boolean;
  name: string;
  online: boolean;
};

export type LavalinkUsingDataType = {
  host: string;
  port: number;
  pass: string;
  secure: boolean;
  name: string;
};

export type Headers = {
  "Client-Name": string;
  "User-Agent": string;
  Authorization: string;
  "User-Id": string;
  "Resume-Key": string;
};
