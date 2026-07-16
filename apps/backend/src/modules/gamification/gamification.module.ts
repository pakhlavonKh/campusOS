import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Badge, BadgeAward, Achievement, AchievementProgress,
  XPRecord, PointRecord,
  Leaderboard, LeaderboardEntry,
  Streak, LearningChallenge, LearningChallengeProgress,
  CertificateTemplate, Certificate,
  Reward, ParentReward,
} from './entities/gamification.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Badge, BadgeAward, Achievement, AchievementProgress,
      XPRecord, PointRecord,
      Leaderboard, LeaderboardEntry,
      Streak, LearningChallenge, LearningChallengeProgress,
      CertificateTemplate, Certificate,
      Reward, ParentReward,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class GamificationModule {}
