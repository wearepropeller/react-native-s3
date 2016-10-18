export const normalizeFilePath = path =>
  path.startsWith("file://") ? path.slice(7) :
  path;
