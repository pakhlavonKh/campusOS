import { describe, it, expect, beforeEach } from '@jest/globals';
import { GradeCalculationService } from '../../../src/modules/gradebook/services/grade-calculation.service';
import { GradeScaleType } from '@campusos/shared';

/**
 * Gradebook Calculation Engine Unit Tests
 * GAP-TEST-04: SRS §20.9, SDD §24.11
 */
describe('GradeCalculationService', () => {
  let service: GradeCalculationService;

  beforeEach(() => {
    service = new GradeCalculationService();
  });

  it('should correctly calculate weighted final grade with 100% total weight', () => {
    const categories = [
      {
        id: 'cat-1',
        name: 'Homework',
        weight: 40,
        items: [
          { id: 'hw-1', score: 90, maxScore: 100 },
          { id: 'hw-2', score: 100, maxScore: 100 },
        ], // avg = 95%
      },
      {
        id: 'cat-2',
        name: 'Exams',
        weight: 60,
        items: [
          { id: 'ex-1', score: 80, maxScore: 100 },
        ], // avg = 80%
      },
    ];

    // Final = (95 * 0.40) + (80 * 0.60) = 38 + 48 = 86%
    const result = service.calculateFinalGrade(categories, GradeScaleType.LETTER);

    expect(result.finalGrade).toBe(86);
    expect(result.scaledGrade).toBe('B');
  });

  it('should support GPA scale conversion', () => {
    expect(service.convertToScale(95, GradeScaleType.GPA)).toBe('4.00');
    expect(service.convertToScale(85, GradeScaleType.GPA)).toBe('3.00');
    expect(service.convertToScale(50, GradeScaleType.GPA)).toBe('0.00');
  });

  it('should support Pass/Fail scale conversion', () => {
    expect(service.convertToScale(75, GradeScaleType.PASS_FAIL)).toBe('Pass');
    expect(service.convertToScale(55, GradeScaleType.PASS_FAIL)).toBe('Fail');
  });
});
