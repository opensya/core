import { FileService } from "./file_service";

export let fileService: FileService;

export function setFileService(fs: FileService) {
  fileService = fs;
}
