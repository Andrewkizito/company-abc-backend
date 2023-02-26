export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export type callbackFunction = (error: unknown, data?: unknown) => unknown;

export type fileHandlerFunction = (
  req: unknown,
  file: IFile,
  cb: callbackFunction
) => void;
