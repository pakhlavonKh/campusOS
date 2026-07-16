import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  SpeechProvider, SpeechProviderConfig, SpeakingAssignment,
  SpeechRecording, PronunciationResult, PronunciationScore, OralExam,
} from './entities/voice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([
    SpeechProvider, SpeechProviderConfig, SpeakingAssignment,
    SpeechRecording, PronunciationResult, PronunciationScore, OralExam,
  ])],
  exports: [TypeOrmModule],
})
export class VoiceModule {}
