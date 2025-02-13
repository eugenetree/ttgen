const { z } = require('zod');

const wordSchema = z.object({
  sourceText: z.string(),
  targetText: z.string(),
  audio: z.string(),
});

const videoSchema = z.object({
  sourceLanguage: z.literal('en'),
  targetLanguage: z.enum(['ru', 'de']),
  englishLevel: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),
  words: z.array(wordSchema),
  status: z.enum(['READY_FOR_RENDER', 'RENDERED', 'UPLOADED', 'FAILED']).default('READY_FOR_RENDER'),
  createdAt: z.coerce.date().optional(),
  renderedAt: z.coerce.date().optional(),
  filePath: z.string().optional(),
  error: z.string().optional(),
  errorCount: z.number().int().min(0).optional().default(0),
  uploads: z.array(
    z.object({
      platform: z.literal('tiktok'),
      date: z.coerce.date()
    })
  ).optional().default([])
});

class VideoSchema {
  static validate(data) {
    const result = videoSchema.safeParse(data);
    return {
      success: result.success,
      data: result.success ? result.data : undefined,
      error: !result.success ? result.error.message : undefined
    };
  }
}

module.exports = VideoSchema; 