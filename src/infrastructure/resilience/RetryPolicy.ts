// src/infrastructure/resilience/RetryPolicy.ts
export interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
  retryableErrors?: string[];
}

export class RetryPolicy {
  constructor(private readonly config: RetryConfig) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === this.config.maxAttempts) {
          break;
        }

        if (!this.shouldRetry(error as Error)) {
          throw error;
        }

        const delay = this.calculateDelay(attempt);
        console.log(`RetryPolicy: Attempt ${attempt} failed, retrying in ${delay}ms. Error: ${lastError.message}`);
        
        await this.sleep(delay);
      }
    }
    
    // Si llegamos aquí, todos los intentos fallaron
    throw new Error(`RetryPolicy: All ${this.config.maxAttempts} attempts failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  private shouldRetry(error: Error): boolean {
    if (!this.config.retryableErrors || this.config.retryableErrors.length === 0) {
      return true; // Retry all errors by default
    }
    
    return this.config.retryableErrors.some(retryableError => 
      error.message.includes(retryableError) || error.name.includes(retryableError)
    );
  }

  private calculateDelay(attempt: number): number {
    const exponentialDelay = this.config.baseDelayMs * Math.pow(this.config.backoffMultiplier, attempt - 1);
    const jitteredDelay = exponentialDelay + (Math.random() * 1000); // Add jitter
    
    return Math.min(jitteredDelay, this.config.maxDelayMs);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Utility methods for configuration validation
  public validateConfig(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.maxAttempts <= 0) {
      errors.push('maxAttempts must be greater than 0');
    }

    if (this.config.baseDelayMs < 0) {
      errors.push('baseDelayMs cannot be negative');
    }

    if (this.config.maxDelayMs < this.config.baseDelayMs) {
      errors.push('maxDelayMs must be greater than or equal to baseDelayMs');
    }

    if (this.config.backoffMultiplier < 1) {
      errors.push('backoffMultiplier must be at least 1');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Get current configuration
  public getConfig(): RetryConfig {
    return { ...this.config };
  }

  // Create a new RetryPolicy with modified configuration
  public withMaxAttempts(maxAttempts: number): RetryPolicy {
    return new RetryPolicy({
      ...this.config,
      maxAttempts
    });
  }

  public withBaseDelay(baseDelayMs: number): RetryPolicy {
    return new RetryPolicy({
      ...this.config,
      baseDelayMs
    });
  }

  public withRetryableErrors(retryableErrors: string[]): RetryPolicy {
    return new RetryPolicy({
      ...this.config,
      retryableErrors
    });
  }
}