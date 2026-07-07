export class AudioManager {
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private enabled: boolean = true
  private volume: number = 0.7

  async init(): Promise<void> {
    try {
      this.setupAudioContext()
    } catch (error) {
      console.warn('Audio initialization failed:', error)
    }
  }

  private setupAudioContext(): void {
    const initializeAudio = () => {
      if (this.audioContext) {
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume().catch(error => {
            console.warn('Failed to resume audio context:', error)
          })
        }

        if (this.sounds.size === 0) {
          this.loadDefaultSounds()
        }

        return
      }

      const AudioContextClass = window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext

      if (!AudioContextClass) {
        return
      }

      this.audioContext = new AudioContextClass()
      this.loadDefaultSounds()
    }

    document.addEventListener('pointerdown', initializeAudio, { once: true })
    document.addEventListener('keydown', initializeAudio, { once: true })
  }

  private loadDefaultSounds(): void {
    // Create procedural sounds instead of loading files for better performance
    this.createTone('correct', 523.25, 0.1, 'sine') // C5 note
    this.createTone('incorrect', 220, 0.2, 'square') // A3 note
    this.createTone('achievement', 698.46, 0.3, 'sine') // F5 note
    this.createTone('streak', 783.99, 0.15, 'triangle') // G5 note
  }

  private createTone(name: string, frequency: number, duration: number, waveform: OscillatorType): void {
    if (!this.audioContext) return

    const sampleRate = this.audioContext.sampleRate
    const frameCount = sampleRate * duration
    const buffer = this.audioContext.createBuffer(1, frameCount, sampleRate)
    const channelData = buffer.getChannelData(0)

    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate
      let sample = 0

      switch (waveform) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t)
          break
        case 'square':
          sample = Math.sign(Math.sin(2 * Math.PI * frequency * t))
          break
        case 'triangle':
          sample = 2 / Math.PI * Math.asin(Math.sin(2 * Math.PI * frequency * t))
          break
      }

      // Apply envelope for smoother sound
      const envelope = Math.exp(-3 * t)
      channelData[i] = sample * envelope * 0.3
    }

    this.sounds.set(name, buffer)
  }

  playSound(soundName: string): void {
    if (!this.enabled || !this.audioContext || !this.sounds.has(soundName)) {
      return
    }

    try {
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(error => {
          console.warn('Failed to resume audio context:', error)
        })
      }

      const buffer = this.sounds.get(soundName)!
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = buffer
      gainNode.gain.value = this.volume

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      source.start()
    } catch (error) {
      console.warn('Failed to play sound:', error)
    }
  }

  playCorrect(): void {
    this.playSound('correct')
  }

  playIncorrect(): void {
    this.playSound('incorrect')
  }

  playAchievement(): void {
    this.playSound('achievement')
  }

  playStreak(): void {
    this.playSound('streak')
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume))
  }

  isEnabled(): boolean {
    return this.enabled
  }

  getVolume(): number {
    return this.volume
  }
}
