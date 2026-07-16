import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GradebookService } from './gradebook.service';
import { GradeCategory, GradebookEntry, GradeHistory } from '../entities/gradebook.entity';

describe('GradebookService', () => {
  let service: GradebookService;

  const mockCategoryRepo = {
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEntryRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockHistoryRepo = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockEventEmitter = {
    emit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GradebookService,
        {
          provide: getRepositoryToken(GradeCategory),
          useValue: mockCategoryRepo,
        },
        {
          provide: getRepositoryToken(GradebookEntry),
          useValue: mockEntryRepo,
        },
        {
          provide: getRepositoryToken(GradeHistory),
          useValue: mockHistoryRepo,
        },
        {
          provide: EventEmitter2,
          useValue: mockEventEmitter,
        },
      ],
    }).compile();

    service = module.get<GradebookService>(GradebookService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCourseGrade', () => {
    const studentId = 'student-1';
    const courseId = 'course-1';
    const orgId = 'org-1';

    it('should calculate the correct grade with standard weighting', async () => {
      // Mock Categories
      mockCategoryRepo.find.mockResolvedValue([
        { id: 'cat-homework', weight: 40 }, // 40% weight
        { id: 'cat-exams', weight: 60 },    // 60% weight
      ]);

      // Mock Entries
      mockEntryRepo.find.mockResolvedValue([
        // Homework 1: 9/10 (90%)
        { categoryId: 'cat-homework', score: 9, maxScore: 10 },
        // Homework 2: 90/100 (90%)
        { categoryId: 'cat-homework', score: 90, maxScore: 100 },
        // Exam 1: 80/100 (80%)
        { categoryId: 'cat-exams', score: 80, maxScore: 100 },
      ]);

      // Homework Avg: (9+90)/(10+100) = 99/110 = 0.9 = 90%
      // Exam Avg: 80/100 = 0.8 = 80%
      // Overall: (0.9 * 40) + (0.8 * 60) = 36 + 48 = 84
      // Return should be (84 / 100) * 100 = 84%

      const result = await service.calculateCourseGrade(studentId, courseId, orgId);
      
      expect(mockCategoryRepo.find).toHaveBeenCalledWith(expect.objectContaining({ where: { courseId, organizationId: orgId } }));
      expect(result).toBeCloseTo(84, 2);
    });

    it('should handle missing grades correctly (exclude from calculation)', async () => {
      mockCategoryRepo.find.mockResolvedValue([
        { id: 'cat-exams', weight: 100 },
      ]);

      mockEntryRepo.find.mockResolvedValue([
        { categoryId: 'cat-exams', score: 100, maxScore: 100 },
        { categoryId: 'cat-exams', score: null, maxScore: 100 }, // Not graded yet
      ]);

      // Expected: Only the graded entry counts, so 100/100 = 100%
      const result = await service.calculateCourseGrade(studentId, courseId, orgId);
      
      expect(result).toBe(100);
    });

    it('should handle missing categories or empty course by returning 0', async () => {
      mockCategoryRepo.find.mockResolvedValue([]);
      mockEntryRepo.find.mockResolvedValue([]);

      const result = await service.calculateCourseGrade(studentId, courseId, orgId);
      
      expect(result).toBe(0);
    });

    it('should adjust overall grade if a category has no graded entries', async () => {
      // If exams are 60% and homework is 40%, but there are NO exams graded yet,
      // the overall grade should only be calculated out of 40%.
      mockCategoryRepo.find.mockResolvedValue([
        { id: 'cat-homework', weight: 40 },
        { id: 'cat-exams', weight: 60 },
      ]);

      mockEntryRepo.find.mockResolvedValue([
        { categoryId: 'cat-homework', score: 8, maxScore: 10 }, // 80%
        // No entries for cat-exams
      ]);

      // Total Score: (0.8 * 40) = 32
      // Total Weight: 40
      // Expected: (32 / 40) * 100 = 80%
      const result = await service.calculateCourseGrade(studentId, courseId, orgId);
      
      expect(result).toBe(80);
    });
  });
});
