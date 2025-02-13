const configService = require('./backend/shared/infrastructure/config.service');
const videoRepository = require('./backend/shared/infrastructure/video.repository');
const Logger = require('./backend/shared/utils/logger');
const videoGenerationFeature = require('./backend/features/video-generation');
const videoUploadFeature = require('./backend/features/video-upload');
const uploadVideoUseCase = require('./backend/features/video-upload/use-cases/upload-video.use-case');

const logger = new Logger('Application');

async function bootstrap() {
  try {
    // Initialize configuration service
    await configService.init();
    logger.info(`Starting ${configService.get('app.name')} v${configService.get('app.version')}`);

    // Initialize video repository
    await videoRepository.init();
    logger.info('Video repository initialized');

    // Initialize video generation feature
    await videoGenerationFeature.init();
    logger.info('Video generation feature initialized');

    // Initialize video upload feature
    await videoUploadFeature.init();
    logger.info('Video upload feature initialized');

    logger.info('Application started successfully');
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection', { reason, promise });
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Starting graceful shutdown...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Starting graceful shutdown...');
  process.exit(0);
});

// Start the application
bootstrap(); 