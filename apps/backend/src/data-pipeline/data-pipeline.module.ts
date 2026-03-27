import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CensusService } from './census.service';
import { FemaService } from './fema.service';
import { PropertyEnrichmentService } from './property-enrichment.service';

@Module({
  imports: [HttpModule],
  providers: [CensusService, FemaService, PropertyEnrichmentService],
  exports: [CensusService, FemaService, PropertyEnrichmentService],
})
export class DataPipelineModule {}
