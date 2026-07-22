import { Injectable, Logger } from '@nestjs/common';
import { GradeScaleType } from '@campusos/shared';

export interface GradeCategory {
  id: string;
  name: string;
  weight: number; // 0–100
  items: GradeItem[];
}

export interface GradeItem {
  id: string;
  score: number | null; // null = missing / not submitted
  maxScore: number;
}

export interface GradeCalculationResult {
  finalGrade: number;           // weighted average 0–100
  projectedFinalGrade: number;  // if missing scores treated as 0
  scaledGrade: string;          // human-readable e.g. "A", "85%", "3.5 GPA"
  categoryBreakdown: {
    categoryId: string;
    name: string;
    weight: number;
    average: number;
    contribution: number;
  }[];
}

/**
 * GradeCalculationService
 *
 * Implements weighted category averaging per SDD §24.6:
 *   finalGrade = Σ (categoryWeight × categoryAverage)
 *
 * Supports all GradeScaleType values from packages/shared.
 * Handles partial weights (categories that don't sum to 100%).
 *
 * GAP-SVC-02: SRS §20.4, SDD §24.6
 */
@Injectable()
export class GradeCalculationService {
  private readonly logger = new Logger(GradeCalculationService.name);

  /**
   * Calculate weighted final grade from category definitions.
   * Missing scores are excluded from category average (not treated as 0).
   * Projected final grade treats missing scores as 0.
   */
  calculateFinalGrade(
    categories: GradeCategory[],
    scaleType: GradeScaleType = GradeScaleType.PERCENTAGE,
    customScaleMappings?: { minScore: number; maxScore: number; label: string }[],
  ): GradeCalculationResult {
    const totalWeight = categories.reduce((sum, cat) => sum + cat.weight, 0);
    const weightNormalizer = totalWeight > 0 ? 100 / totalWeight : 1;

    let finalGrade = 0;
    let projectedFinalGrade = 0;
    const categoryBreakdown = [];

    for (const cat of categories) {
      const submittedItems = cat.items.filter((i) => i.score !== null);

      // Category average from submitted items only
      const categoryAvg =
        submittedItems.length > 0
          ? submittedItems.reduce((sum, i) => sum + ((i.score! / i.maxScore) * 100), 0) /
            submittedItems.length
          : 0;

      // Projected: all items (missing = 0)
      const projectedAvg =
        cat.items.length > 0
          ? cat.items.reduce((sum, i) => sum + (((i.score ?? 0) / i.maxScore) * 100), 0) /
            cat.items.length
          : 0;

      const normalizedWeight = (cat.weight * weightNormalizer) / 100;
      const contribution = categoryAvg * normalizedWeight;

      finalGrade += contribution;
      projectedFinalGrade += projectedAvg * normalizedWeight;

      categoryBreakdown.push({
        categoryId: cat.id,
        name: cat.name,
        weight: cat.weight,
        average: Math.round(categoryAvg * 100) / 100,
        contribution: Math.round(contribution * 100) / 100,
      });
    }

    finalGrade = Math.round(finalGrade * 100) / 100;
    projectedFinalGrade = Math.round(projectedFinalGrade * 100) / 100;

    const scaledGrade = this.convertToScale(finalGrade, scaleType, customScaleMappings);

    return { finalGrade, projectedFinalGrade, scaledGrade, categoryBreakdown };
  }

  /**
   * Convert a percentage score (0–100) to the configured grade scale.
   * GAP-SVC-02: must support all GradeScaleType values.
   */
  convertToScale(
    percentage: number,
    scaleType: GradeScaleType,
    customMappings?: { minScore: number; maxScore: number; label: string }[],
  ): string {
    switch (scaleType) {
      case GradeScaleType.PERCENTAGE:
        return `${percentage.toFixed(1)}%`;

      case GradeScaleType.LETTER:
        return this.percentageToLetter(percentage);

      case GradeScaleType.GPA:
        return this.percentageToGpa(percentage).toFixed(2);

      case GradeScaleType.PASS_FAIL:
        return percentage >= 60 ? 'Pass' : 'Fail';

      case GradeScaleType.CUSTOM: {
        if (!customMappings?.length) return `${percentage.toFixed(1)}%`;
        const match = customMappings
          .sort((a, b) => b.minScore - a.minScore)
          .find((m) => percentage >= m.minScore && percentage <= m.maxScore);
        return match?.label ?? `${percentage.toFixed(1)}%`;
      }

      default:
        return `${percentage.toFixed(1)}%`;
    }
  }

  private percentageToLetter(p: number): string {
    if (p >= 97) return 'A+';
    if (p >= 93) return 'A';
    if (p >= 90) return 'A-';
    if (p >= 87) return 'B+';
    if (p >= 83) return 'B';
    if (p >= 80) return 'B-';
    if (p >= 77) return 'C+';
    if (p >= 73) return 'C';
    if (p >= 70) return 'C-';
    if (p >= 67) return 'D+';
    if (p >= 63) return 'D';
    if (p >= 60) return 'D-';
    return 'F';
  }

  private percentageToGpa(p: number): number {
    if (p >= 97) return 4.0;
    if (p >= 93) return 4.0;
    if (p >= 90) return 3.7;
    if (p >= 87) return 3.3;
    if (p >= 83) return 3.0;
    if (p >= 80) return 2.7;
    if (p >= 77) return 2.3;
    if (p >= 73) return 2.0;
    if (p >= 70) return 1.7;
    if (p >= 67) return 1.3;
    if (p >= 63) return 1.0;
    if (p >= 60) return 0.7;
    return 0.0;
  }
}
