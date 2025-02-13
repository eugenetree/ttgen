class VideoValidationService {
  canBeRendered(video) {
    return video.status === 'READY_FOR_RENDER' 
      && video.words 
      && video.words.length > 0 
      && this.hasValidTranslations(video);
  }

  hasValidTranslations(video) {
    return video.words.every(word => 
      word.sourceText && word.targetText
    );
  }
}

module.exports = new VideoValidationService(); 