import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpoint, WebhookDelivery } from '../entities/webhook.entity';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    @InjectRepository(WebhookEndpoint) private readonly endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookDelivery) private readonly deliveryRepo: Repository<WebhookDelivery>,
  ) {}

  async registerEndpoint(dto: Partial<WebhookEndpoint> & { organizationId: string }) {
    const endpoint = this.endpointRepo.create(dto);
    return this.endpointRepo.save(endpoint);
  }

  async getEndpointsForEvent(organizationId: string, eventType: string) {
    // Find active endpoints for the organization that subscribe to this event (or wildcard '*')
    const endpoints = await this.endpointRepo.find({
      where: { organizationId, isActive: true },
    });

    return endpoints.filter(
      (ep: WebhookEndpoint) => ep.subscribedEvents.includes(eventType) || ep.subscribedEvents.includes('*'),
    );
  }

  async dispatchEvent(organizationId: string, eventType: string, payload: Record<string, any>) {
    const endpoints = await this.getEndpointsForEvent(organizationId, eventType);

    for (const ep of endpoints) {
      const delivery = this.deliveryRepo.create({
        organizationId,
        endpointId: ep.id,
        eventType,
        payload,
        status: 'pending',
      });

      const savedDelivery = await this.deliveryRepo.save(delivery);

      try {
        // HTTP post dispatch logic stub
        // In production, this would sign the payload with ep.secretEncrypted,
        // send an HTTP POST request to ep.targetUrl, and log the status/response.
        savedDelivery.status = 'success';
        savedDelivery.responseStatusCode = 200;
        savedDelivery.responseBody = JSON.stringify({ success: true });
        await this.deliveryRepo.save(savedDelivery);
      } catch (err: any) {
        savedDelivery.status = 'failed';
        savedDelivery.errorMessage = err.message || 'Connection timeout';
        await this.deliveryRepo.save(savedDelivery);
        this.logger.error(`Webhook dispatch to ${ep.targetUrl} failed: ${err.message}`);
      }
    }
  }
}
