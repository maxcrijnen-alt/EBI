export type IngestionStage =
  | "PDF_EXTRACTION"
  | "DOCX_EXTRACTION"
  | "CHUNKING"
  | "TOPIC_TAGGING"
  | "FORMULA_EXTRACTION"
  | "QUESTION_DRAFTING"
  | "MANUAL_REVIEW";

export const ingestionPipeline: Array<{ stage: IngestionStage; outputFolder: string; status: string }> = [
  { stage: "PDF_EXTRACTION", outputFolder: "data/processed", status: "placeholder" },
  { stage: "DOCX_EXTRACTION", outputFolder: "data/processed", status: "placeholder" },
  { stage: "CHUNKING", outputFolder: "data/processed", status: "placeholder" },
  { stage: "TOPIC_TAGGING", outputFolder: "data/summaries", status: "placeholder" },
  { stage: "FORMULA_EXTRACTION", outputFolder: "data/formulas", status: "placeholder" },
  { stage: "QUESTION_DRAFTING", outputFolder: "data/questions", status: "placeholder" },
  { stage: "MANUAL_REVIEW", outputFolder: "data/rubrics", status: "required" },
];
