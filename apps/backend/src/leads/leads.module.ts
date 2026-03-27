import { Module } from '@nestjs/common';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { LeadScoringService } from './lead-scoring.service';
import { LeadGeneratorService } from './lead-generator.service';
import { CanvassingService } from './canvassing.service';

@Module({
  controllers: [LeadsController],
  providers: [
    LeadsService,
    LeadScoringService,
    LeadGeneratorService,
    CanvassingService,
  ],
  exports: [LeadsService, LeadScoringService, LeadGeneratorService, CanvassingService],
})
export class LeadsModule {}
