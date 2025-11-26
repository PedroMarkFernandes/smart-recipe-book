import { cleanInstructions } from './helpers';

describe('cleanInstructions', () => {
  // Test Case 1: Handle null/empty input
  it('returns an empty array for null input', () => {
    expect(cleanInstructions(null)).toEqual([]);
  });

  // Test Case 2: Split basic text
  it('splits text by new lines', () => {
    const input = "Step 1\r\nStep 2";
    const result = cleanInstructions(input);
    expect(result).toHaveLength(2);
    expect(result[0]).toBe("Step 1");
  });

  // Test Case 3: Cleaning the numbers
  it('removes leading numbers from instructions', () => {
    const input = "1. Preheat oven.\r\n2. Mix ingredients.";
    const result = cleanInstructions(input);
    expect(result[0]).toBe("Preheat oven."); // Number "1. " is gone
    expect(result[1]).toBe("Mix ingredients."); // Number "2. " is gone
  });

  // Test Case 4: Cleaning empty lines
  it('removes empty lines', () => {
    const input = "Step 1\r\n\r\nStep 2";
    const result = cleanInstructions(input);
    expect(result).toHaveLength(2);
  });
});