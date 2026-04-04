import { SlideImage, AudioTrack, TransitionType } from "@/types/videoGenerator";

interface RenderOptions {
  slides: SlideImage[];
  audio: AudioTrack | null;
  transition: TransitionType;
  width: number;
  height: number;
  fps: number;
  onProgress: (progress: number) => void;
}

export class VideoRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private animationFrameId: number | null = null;

  constructor(width: number, height: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d')!;
  }

  private async loadImage(src: string): Promise<HTMLImageElement | HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private async loadVideo(src: string): Promise<HTMLVideoElement> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.playsInline = true;
      video.preload = 'auto';
      video.onloadeddata = () => resolve(video);
      video.onerror = () => reject(new Error('Failed to load video source'));
      video.src = src;
      video.load();
    });
  }

  private async loadMedia(slide: SlideImage): Promise<HTMLImageElement | HTMLVideoElement> {
    if (slide.type === 'video') {
      try {
        return await this.loadVideo(slide.src);
      } catch {
        // Fallback to thumbnail if available
        if (slide.thumbnailUrl) {
          return await this.loadImage(slide.thumbnailUrl);
        }
        throw new Error(`Failed to load video: ${slide.name}`);
      }
    }
    return this.loadImage(slide.src);
  }

  private drawImageCover(img: HTMLImageElement | HTMLVideoElement) {
    const { width, height } = this.canvas;
    const imgWidth = img instanceof HTMLVideoElement ? img.videoWidth : img.width;
    const imgHeight = img instanceof HTMLVideoElement ? img.videoHeight : img.height;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = width / height;

    let drawWidth = width;
    let drawHeight = height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > canvasRatio) {
      drawWidth = height * imgRatio;
      offsetX = (width - drawWidth) / 2;
    } else {
      drawHeight = width / imgRatio;
      offsetY = (height - drawHeight) / 2;
    }

    this.ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
  }

  private drawSlide(img: HTMLImageElement, opacity: number = 1, scale: number = 1) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    
    if (scale !== 1) {
      const { width, height } = this.canvas;
      this.ctx.translate(width / 2, height / 2);
      this.ctx.scale(scale, scale);
      this.ctx.translate(-width / 2, -height / 2);
    }
    
    this.drawImageCover(img);
    this.ctx.restore();
  }

  private async renderFrame(
    currentImg: HTMLImageElement,
    nextImg: HTMLImageElement | null,
    transition: TransitionType,
    transitionProgress: number
  ) {
    const { width, height } = this.canvas;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, width, height);

    if (transitionProgress <= 0 || !nextImg) {
      // No transition, just draw current
      this.drawSlide(currentImg);
    } else if (transitionProgress >= 1) {
      // Transition complete, draw next
      this.drawSlide(nextImg);
    } else {
      // In transition
      switch (transition) {
        case 'fade':
          this.drawSlide(currentImg, 1 - transitionProgress);
          this.drawSlide(nextImg, transitionProgress);
          break;

        case 'slide':
          const slideOffset = transitionProgress * width;
          this.ctx.save();
          this.ctx.translate(-slideOffset, 0);
          this.drawSlide(currentImg);
          this.ctx.translate(width, 0);
          this.drawSlide(nextImg);
          this.ctx.restore();
          break;

        case 'zoom':
          const zoomOut = 1 + (transitionProgress * 0.2);
          const zoomIn = 0.8 + (transitionProgress * 0.2);
          this.drawSlide(currentImg, 1 - transitionProgress, zoomOut);
          this.drawSlide(nextImg, transitionProgress, zoomIn);
          break;

        default:
          // No transition - hard cut
          if (transitionProgress < 0.5) {
            this.drawSlide(currentImg);
          } else {
            this.drawSlide(nextImg);
          }
      }
    }
  }

  async render(options: RenderOptions): Promise<Blob> {
    const { slides, audio, transition, fps, onProgress } = options;
    
    if (slides.length === 0) {
      throw new Error('No slides to render');
    }

    // Preload all images
    const images = await Promise.all(slides.map(s => this.loadImage(s.src)));
    
    // Calculate total frames
    const transitionDuration = 0.5; // 0.5 seconds for transitions
    let totalDuration = 0;
    slides.forEach(slide => {
      totalDuration += slide.duration;
    });
    
    const totalFrames = Math.ceil(totalDuration * fps);
    
    // Setup MediaRecorder
    const stream = this.canvas.captureStream(fps);
    
    // Add audio track if available
    let audioContext: AudioContext | null = null;
    let audioSource: AudioBufferSourceNode | null = null;
    let audioDestination: MediaStreamAudioDestinationNode | null = null;
    
    if (audio) {
      try {
        audioContext = new AudioContext();
        const audioResponse = await fetch(audio.src);
        const audioArrayBuffer = await audioResponse.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(audioArrayBuffer);
        
        audioDestination = audioContext.createMediaStreamDestination();
        audioSource = audioContext.createBufferSource();
        audioSource.buffer = audioBuffer;
        audioSource.connect(audioDestination);
        
        // Add audio track to stream
        audioDestination.stream.getAudioTracks().forEach(track => {
          stream.addTrack(track);
        });
      } catch (e) {
        console.warn('Failed to add audio:', e);
      }
    }

    // Check supported MIME types
    const mimeTypes = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4',
    ];
    
    let selectedMimeType = '';
    for (const mimeType of mimeTypes) {
      if (MediaRecorder.isTypeSupported(mimeType)) {
        selectedMimeType = mimeType;
        break;
      }
    }
    
    if (!selectedMimeType) {
      throw new Error('No supported video format found');
    }

    this.recordedChunks = [];
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: selectedMimeType,
      videoBitsPerSecond: 5000000, // 5 Mbps
    });

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    return new Promise((resolve, reject) => {
      this.mediaRecorder!.onstop = () => {
        const blob = new Blob(this.recordedChunks, { type: selectedMimeType });
        resolve(blob);
      };

      this.mediaRecorder!.onerror = (event) => {
        reject(new Error('MediaRecorder error'));
      };

      this.mediaRecorder!.start();
      
      if (audioSource) {
        audioSource.start();
      }

      let currentFrame = 0;
      let currentSlideIndex = 0;
      let slideStartFrame = 0;

      const renderNextFrame = async () => {
        if (currentFrame >= totalFrames) {
          this.mediaRecorder!.stop();
          if (audioSource) {
            audioSource.stop();
          }
          if (audioContext) {
            audioContext.close();
          }
          return;
        }

        const currentTime = currentFrame / fps;
        
        // Find current slide
        let accumulatedTime = 0;
        for (let i = 0; i < slides.length; i++) {
          if (currentTime < accumulatedTime + slides[i].duration) {
            if (currentSlideIndex !== i) {
              currentSlideIndex = i;
              slideStartFrame = currentFrame;
            }
            break;
          }
          accumulatedTime += slides[i].duration;
        }

        const slideTime = (currentFrame - slideStartFrame) / fps;
        const slideDuration = slides[currentSlideIndex].duration;
        const transitionStart = slideDuration - transitionDuration;
        
        let transitionProgress = 0;
        if (slideTime >= transitionStart && currentSlideIndex < slides.length - 1) {
          transitionProgress = (slideTime - transitionStart) / transitionDuration;
        }

        const currentImg = images[currentSlideIndex];
        const nextImg = currentSlideIndex < images.length - 1 ? images[currentSlideIndex + 1] : null;

        await this.renderFrame(currentImg, nextImg, transition, transitionProgress);

        currentFrame++;
        onProgress((currentFrame / totalFrames) * 100);

        // Use requestAnimationFrame for smoother rendering, but process multiple frames per tick
        if (currentFrame % 2 === 0) {
          requestAnimationFrame(renderNextFrame);
        } else {
          setTimeout(renderNextFrame, 0);
        }
      };

      renderNextFrame();
    });
  }

  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }
}

export async function renderVideo(options: RenderOptions): Promise<Blob> {
  const renderer = new VideoRenderer(options.width, options.height);
  try {
    return await renderer.render(options);
  } finally {
    renderer.cleanup();
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
