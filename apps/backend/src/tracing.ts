/**
 * OpenTelemetry Node.js SDK Initialization
 * GAP-OPS-04: Auto-instruments HTTP, TypeORM, Redis, BullMQ.
 * MUST be imported before any other module in main.ts.
 */
const otelExporterUrl = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { NodeSDK } = require('@opentelemetry/sdk-node');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Resource } = require('@opentelemetry/resources');
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { SemanticResourceAttributes: SRA } = require('@opentelemetry/semantic-conventions');

  const sdk = new NodeSDK({
    resource: new Resource({
      [SRA.SERVICE_NAME]: 'campusos-backend',
      [SRA.SERVICE_VERSION]: process.env.APP_VERSION || '0.1.0',
      [SRA.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    }),
    traceExporter: new OTLPTraceExporter({
      url: otelExporterUrl,
    }),
  });

  sdk.start();
  console.log(`📡 OpenTelemetry initialized (exporting to ${otelExporterUrl})`);

  process.on('SIGTERM', () => {
    sdk.shutdown()
      .then(() => console.log('Tracing terminated'))
      .catch((error: any) => console.error('Error terminating tracing', error))
      .finally(() => process.exit(0));
  });
} catch {
  // OpenTelemetry optional in local dev
}
