// Extracts and cleans recipe instructions
export const cleanInstructions = (instructionString) => {
  if (!instructionString) return [];
  
  return instructionString
    .split(/\r\n|\n/) // Split by new lines
    .filter((text) => text.trim().length > 0) // Remove empty lines
    .map((text) => text.replace(/^\d+\.\s*/, '').trim()); // Remove "1. ", "2. " etc
};