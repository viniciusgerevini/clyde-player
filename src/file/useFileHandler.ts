import { useEffect, useState } from "react";
import { readTextFile, watch } from '@tauri-apps/plugin-fs';
import { parse, ClydeDocumentRoot, UnexpectedTokenError } from "@clyde-lang/parser";
import { useDebouncedCallback } from 'use-debounce';

interface DialogueFileHandler {
  getContent: () => string;
  getParsedDocument(): ClydeDocumentRoot;
  hasParsingError(): boolean;
  getParseError(): UnexpectedTokenError | Error | undefined;
}

export function useDialogueFileHandler(filePath: string): DialogueFileHandler {
  const [fileContent, setFileContent ] = useState("");
  const [parsedDocument, setParsedDocument ] = useState<ClydeDocumentRoot>(new ClydeDocumentRoot());
  const [lastError, setParseError ] = useState<UnexpectedTokenError | Error | undefined>();

  const loadFileDebounced = useDebouncedCallback(async (filePath: string) => {
    try {
      const content = await readTextFile(filePath);
      setFileContent(content);

      const doc = parse(content);
      setParsedDocument(doc);

      setParseError(undefined);
    } catch (e) {
      setParseError(e as any);
    }
  }, 300);

  useEffect(() => {
    if (!filePath) {
      return;
    }

    loadFileDebounced(filePath);

    watch(
      filePath,
      (_event) => {
        loadFileDebounced(filePath);
      },
      {
        delayMs: 200,
      }
    ).catch((e) => {
        console.error("Error while watching file", e)
    });
  }, [ filePath ]);

  return {
    getContent() {
      return fileContent;
    },
    getParsedDocument() {
      return parsedDocument;
    },
    hasParsingError() {
      return !!lastError;
    },
    getParseError() {
      return lastError;
    }
  }
}
