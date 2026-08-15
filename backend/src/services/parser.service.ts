import fs from "fs/promises";
import path from "path";

import mammoth from "mammoth";
import pdfParse from "pdf-parse";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export interface ParsedBasicInfo {
  name: string | null;
  email: string | null;
  phone: string | null;
}

export interface ParserResult {
  text: string;
  pageCount?: number;
}

interface PDFParseResult {
  text: string;
  numpages: number;
}

/*
|--------------------------------------------------------------------------
| PARSER SERVICE
|--------------------------------------------------------------------------
*/

export class ParserService {
  /*
  |--------------------------------------------------------------------------
  | CONSTANTS
  |--------------------------------------------------------------------------
  */

  private static readonly MIN_TEXT_LENGTH = 50;

  private static readonly MAX_TEXT_LENGTH = 100000;

  /*
  |--------------------------------------------------------------------------
  | EXTRACT TEXT
  |--------------------------------------------------------------------------
  */

  static async extractText(
    file: Express.Multer.File
  ): Promise<string> {
    try {
      if (!file) {
        throw new Error(
          "Resume file is missing."
        );
      }

      console.log(
        "========================================"
      );

      console.log(
        "📄 RESUME PARSER"
      );

      console.log(
        "========================================"
      );

      console.log(
        "📄 Original name:",
        file.originalname
      );

      console.log(
        "📋 MIME:",
        file.mimetype
      );

      console.log(
        "📦 File size:",
        file.size,
        "bytes"
      );

      /*
      |--------------------------------------------------------------------------
      | GET BUFFER
      |--------------------------------------------------------------------------
      */

      const buffer =
        await this.getFileBuffer(file);

      if (
        !buffer ||
        buffer.length === 0
      ) {
        throw new Error(
          "Resume file is empty."
        );
      }

      console.log(
        "✅ File buffer loaded:",
        buffer.length,
        "bytes"
      );

      /*
      |--------------------------------------------------------------------------
      | GET EXTENSION
      |--------------------------------------------------------------------------
      */

      const extension =
        path
          .extname(file.originalname)
          .toLowerCase();

      console.log(
        "📎 Extension:",
        extension
      );

      let extractedText = "";

      /*
      |--------------------------------------------------------------------------
      | PDF
      |--------------------------------------------------------------------------
      */

      if (
        extension === ".pdf" ||
        file.mimetype ===
          "application/pdf"
      ) {
        extractedText =
          await this.parsePDF(buffer);
      }

      /*
      |--------------------------------------------------------------------------
      | DOCX
      |--------------------------------------------------------------------------
      */

      else if (
        extension === ".docx" ||
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        extractedText =
          await this.parseDOCX(buffer);
      }

      /*
      |--------------------------------------------------------------------------
      | TXT
      |--------------------------------------------------------------------------
      */

      else if (
        extension === ".txt" ||
        file.mimetype === "text/plain"
      ) {
        extractedText =
          await this.parseTXT(buffer);
      }

      /*
      |--------------------------------------------------------------------------
      | DOC
      |--------------------------------------------------------------------------
      */

      else if (
        extension === ".doc" ||
        file.mimetype ===
          "application/msword"
      ) {
        throw new Error(
          "Legacy .doc files are not supported. Please upload a .docx or PDF resume."
        );
      }

      /*
      |--------------------------------------------------------------------------
      | UNSUPPORTED
      |--------------------------------------------------------------------------
      */

      else {
        throw new Error(
          `Unsupported resume format: ${
            extension || file.mimetype
          }. Please upload PDF, DOCX, or TXT.`
        );
      }

      /*
      |--------------------------------------------------------------------------
      | CLEAN TEXT
      |--------------------------------------------------------------------------
      */

      extractedText =
        this.cleanText(
          extractedText
        );

      console.log(
        "📝 Final extracted characters:",
        extractedText.length
      );

      /*
      |--------------------------------------------------------------------------
      | VALIDATE TEXT
      |--------------------------------------------------------------------------
      */

      if (
        !this.validateText(
          extractedText
        )
      ) {
        throw new Error(
          "No readable text could be extracted from this resume. The PDF may be scanned/image-based. Please upload a text-based PDF or DOCX file."
        );
      }

      console.log(
        "========================================"
      );

      console.log(
        "✅ TEXT EXTRACTION SUCCESSFUL"
      );

      console.log(
        "========================================"
      );

      return extractedText;
    } catch (error: unknown) {
      console.error(
        "========================================"
      );

      console.error(
        "❌ RESUME TEXT EXTRACTION FAILED"
      );

      console.error(
        "========================================"
      );

      console.error(
        "File:",
        file?.originalname
      );

      console.error(
        "MIME:",
        file?.mimetype
      );

      console.error(
        "Error:",
        error
      );

      if (
        error instanceof Error
      ) {
        throw error;
      }

      throw new Error(
        "Failed to extract resume text."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | GET FILE BUFFER
  |--------------------------------------------------------------------------
  */

  private static async getFileBuffer(
    file: Express.Multer.File
  ): Promise<Buffer> {
    /*
    |--------------------------------------------------------------------------
    | MEMORY STORAGE
    |--------------------------------------------------------------------------
    */

    if (
      file.buffer &&
      file.buffer.length > 0
    ) {
      console.log(
        "💾 Using Multer memory buffer"
      );

      return file.buffer;
    }

    /*
    |--------------------------------------------------------------------------
    | DISK STORAGE - file.path
    |--------------------------------------------------------------------------
    */

    if (file.path) {
      console.log(
        "📂 Reading file from:",
        file.path
      );

      const buffer =
        await fs.readFile(
          file.path
        );

      console.log(
        "✅ File read from disk"
      );

      return buffer;
    }

    /*
    |--------------------------------------------------------------------------
    | DISK STORAGE - destination + filename
    |--------------------------------------------------------------------------
    */

    if (
      file.destination &&
      file.filename
    ) {
      const filePath =
        path.resolve(
          file.destination,
          file.filename
        );

      console.log(
        "📂 Reading file from:",
        filePath
      );

      return fs.readFile(
        filePath
      );
    }

    throw new Error(
      "Uploaded file has neither buffer nor file path."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE PDF
  |--------------------------------------------------------------------------
  */

  private static async parsePDF(
    buffer: Buffer
  ): Promise<string> {
    console.log(
      "📕 Parsing PDF..."
    );

    try {
      /*
      |--------------------------------------------------------------------------
      | pdf-parse does not provide TypeScript
      | declarations in the installed version.
      |
      | We cast the imported function locally instead
      | of spreading `any` through the entire service.
      |--------------------------------------------------------------------------
      */

      const parser =
        pdfParse as unknown as (
          data: Buffer
        ) => Promise<PDFParseResult>;

      const result =
        await parser(buffer);

      const pageCount =
        result.numpages;

      const rawText =
        result.text || "";

      console.log(
        "📄 PDF pages:",
        pageCount
      );

      console.log(
        "📝 PDF extracted characters:",
        rawText.length
      );

      /*
      |--------------------------------------------------------------------------
      | TEXT AVAILABLE
      |--------------------------------------------------------------------------
      */

      if (
        rawText.trim().length >=
        this.MIN_TEXT_LENGTH
      ) {
        console.log(
          "✅ PDF contains readable text"
        );

        return rawText;
      }

      /*
      |--------------------------------------------------------------------------
      | TEXT TOO SHORT
      |--------------------------------------------------------------------------
      */

      console.warn(
        "⚠️ PDF parser returned insufficient text."
      );

      console.warn(
        "⚠️ Extracted characters:",
        rawText.trim().length
      );

      console.warn(
        "⚠️ PDF may be scanned/image-based."
      );

      /*
      |--------------------------------------------------------------------------
      | DEBUG RAW TEXT
      |--------------------------------------------------------------------------
      */

      if (
        rawText.trim()
      ) {
        console.warn(
          "⚠️ Raw PDF text:",
          JSON.stringify(
            rawText
          )
        );
      }

      return "";
    } catch (error) {
      console.error(
        "❌ PDF parsing error:",
        error
      );

      throw new Error(
        "Unable to read the PDF file. Please make sure the PDF is valid and not corrupted."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE DOCX
  |--------------------------------------------------------------------------
  */

  private static async parseDOCX(
    buffer: Buffer
  ): Promise<string> {
    console.log(
      "📘 Parsing DOCX..."
    );

    try {
      const result =
        await mammoth.extractRawText({
          buffer,
        });

      const text =
        result.value || "";

      console.log(
        "📝 DOCX extracted characters:",
        text.length
      );

      /*
      |--------------------------------------------------------------------------
      | MAMMOTH WARNINGS
      |--------------------------------------------------------------------------
      */

      if (
        result.messages &&
        result.messages.length > 0
      ) {
        console.warn(
          "⚠️ Mammoth warnings:",
          result.messages
        );
      }

      return text;
    } catch (error) {
      console.error(
        "❌ DOCX parsing error:",
        error
      );

      throw new Error(
        "Unable to read the DOCX resume. Please make sure the document is valid."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PARSE TXT
  |--------------------------------------------------------------------------
  */

  private static async parseTXT(
    buffer: Buffer
  ): Promise<string> {
    console.log(
      "📄 Parsing TXT..."
    );

    try {
      const text =
        buffer.toString(
          "utf-8"
        );

      console.log(
        "📝 TXT characters:",
        text.length
      );

      return text;
    } catch (error) {
      console.error(
        "❌ TXT parsing error:",
        error
      );

      throw new Error(
        "Unable to read the TXT resume."
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | CLEAN TEXT
  |--------------------------------------------------------------------------
  */

  private static cleanText(
    text: string
  ): string {
    if (!text) {
      return "";
    }

    let cleaned =
      text
        .replace(/\u0000/g, "")
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .replace(/[ \t]+/g, " ")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n{3,}/g, "\n\n")
        .trim();

    /*
    |--------------------------------------------------------------------------
    | LIMIT TEXT SIZE
    |--------------------------------------------------------------------------
    */

    if (
      cleaned.length >
      this.MAX_TEXT_LENGTH
    ) {
      console.warn(
        "⚠️ Resume text exceeded maximum length."
      );

      cleaned =
        cleaned.slice(
          0,
          this.MAX_TEXT_LENGTH
        );
    }

    return cleaned;
  }

  /*
  |--------------------------------------------------------------------------
  | VALIDATE TEXT
  |--------------------------------------------------------------------------
  */

  static validateText(
    text: string
  ): boolean {
    if (
      !text ||
      typeof text !== "string"
    ) {
      return false;
    }

    const cleaned =
      text.trim();

    /*
    |--------------------------------------------------------------------------
    | MINIMUM LENGTH
    |--------------------------------------------------------------------------
    */

    if (
      cleaned.length <
      this.MIN_TEXT_LENGTH
    ) {
      console.warn(
        "⚠️ Extracted resume text is too short:",
        cleaned.length
      );

      return false;
    }

    /*
    |--------------------------------------------------------------------------
    | READABLE CHARACTERS
    |--------------------------------------------------------------------------
    */

    const readableCharacters =
      cleaned.replace(
        /[^a-zA-Z0-9]/g,
        ""
      );

    if (
      readableCharacters.length <
      20
    ) {
      console.warn(
        "⚠️ Resume contains insufficient readable characters."
      );

      return false;
    }

    return true;
  }

  /*
  |--------------------------------------------------------------------------
  | EXTRACT BASIC INFORMATION
  |--------------------------------------------------------------------------
  */

  static extractBasicInfo(
    text: string
  ): ParsedBasicInfo {
    const result: ParsedBasicInfo = {
      name: null,
      email: null,
      phone: null,
    };

    if (
      !text ||
      !text.trim()
    ) {
      return result;
    }

    /*
    |--------------------------------------------------------------------------
    | EMAIL
    |--------------------------------------------------------------------------
    */

    const emailMatch =
      text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
      );

    if (emailMatch) {
      result.email =
        emailMatch[0].trim();
    }

    /*
    |--------------------------------------------------------------------------
    | PHONE
    |--------------------------------------------------------------------------
    */

    const phonePatterns = [
      /(?:\+91[\s-]?)?[6-9]\d{9}/,
      /(?:\+91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}/,
      /\+\d{1,3}[\s-]?\d{7,14}/,
    ];

    for (
      const pattern of phonePatterns
    ) {
      const match =
        text.match(
          pattern
        );

      if (match) {
        result.phone =
          match[0].trim();

        break;
      }
    }

    /*
    |--------------------------------------------------------------------------
    | LINES
    |--------------------------------------------------------------------------
    */

    const lines =
      text
        .split("\n")
        .map(
          (line) =>
            line.trim()
        )
        .filter(Boolean);

    /*
    |--------------------------------------------------------------------------
    | IGNORED HEADINGS
    |--------------------------------------------------------------------------
    */

    const ignoredHeadings =
      new Set([
        "resume",
        "curriculum vitae",
        "cv",
        "profile",
        "professional summary",
        "summary",
        "objective",
        "career objective",
        "contact",
        "contact information",
        "personal information",
      ]);

    /*
    |--------------------------------------------------------------------------
    | FIRST PASS - NAME DETECTION
    |--------------------------------------------------------------------------
    */

    for (
      const line of lines.slice(
        0,
        15
      )
    ) {
      const normalized =
        line
          .toLowerCase()
          .replace(
            /[:\-]/g,
            ""
          )
          .trim();

      /*
      |--------------------------------------------------------------------------
      | BASIC FILTERS
      |--------------------------------------------------------------------------
      */

      if (
        normalized.length < 3 ||
        normalized.length > 80
      ) {
        continue;
      }

      if (
        ignoredHeadings.has(
          normalized
        )
      ) {
        continue;
      }

      if (
        line.includes("@")
      ) {
        continue;
      }

      if (
        /\d{7,}/.test(
          line
        )
      ) {
        continue;
      }

      /*
      |--------------------------------------------------------------------------
      | NAME-LIKE CHECK
      |--------------------------------------------------------------------------
      */

      const words =
        line.split(
          /\s+/
        );

      if (
        words.length >= 2 &&
        words.length <= 5
      ) {
        const looksLikeName =
          words.every(
            (word) =>
              /^[A-Za-z.'-]+$/.test(
                word
              )
          );

        if (
          looksLikeName
        ) {
          result.name =
            line;

          break;
        }
      }
    }

    /*
    |--------------------------------------------------------------------------
    | FALLBACK NAME
    |--------------------------------------------------------------------------
    */

    if (
      !result.name
    ) {
      for (
        const line of lines.slice(
          0,
          10
        )
      ) {
        const normalized =
          line
            .toLowerCase()
            .trim();

        if (
          normalized.length >= 3 &&
          normalized.length <= 80 &&
          !ignoredHeadings.has(
            normalized
          ) &&
          !line.includes("@") &&
          !/\d{7,}/.test(
            line
          )
        ) {
          result.name =
            line;

          break;
        }
      }
    }

    return result;
  }

  /*
  |--------------------------------------------------------------------------
  | GET PDF INFO
  |--------------------------------------------------------------------------
  */

  static async getPDFInfo(
    file: Express.Multer.File
  ): Promise<{
    pages: number;
    textLength: number;
    hasText: boolean;
  }> {
    try {
      const buffer =
        await this.getFileBuffer(
          file
        );

      /*
      |--------------------------------------------------------------------------
      | Cast pdf-parse locally
      |--------------------------------------------------------------------------
      */

      const parser =
        pdfParse as unknown as (
          data: Buffer
        ) => Promise<PDFParseResult>;

      const result =
        await parser(buffer);

      const text =
        result.text || "";

      return {
        pages:
          result.numpages || 0,

        textLength:
          text.length,

        hasText:
          Boolean(
            text.trim()
          ),
      };
    } catch (error) {
      console.error(
        "❌ Could not inspect PDF:",
        error
      );

      return {
        pages: 0,
        textLength: 0,
        hasText: false,
      };
    }
  }
}