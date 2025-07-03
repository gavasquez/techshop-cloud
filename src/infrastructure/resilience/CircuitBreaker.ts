// src/infrastructure/resilience/CircuitBreaker.ts
export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  successThreshold: number;
  timeout: number;
  monitoringPeriod: number;
}

export interface CircuitBreakerMetrics {
  totalRequests: number;
  failedRequests: number;
  successfulRequests: number;
  lastFailureTime: Date | null;
  lastSuccessTime: Date | null;
  state: CircuitState;
  nextAttemptTime: Date | null;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount = 0;
  private successCount = 0;
  private nextAttemptTime: Date | null = null;
  private lastFailureTime: Date | null = null;
  private lastSuccessTime: Date | null = null;
  private totalRequests = 0;

  constructor(
    private readonly name: string,
    private readonly config: CircuitBreakerConfig
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.state = CircuitState.HALF_OPEN;
        console.log(`CircuitBreaker[${this.name}]: Attempting reset - state changed to HALF_OPEN`);
      } else {
        throw new Error(`CircuitBreaker[${this.name}]: Circuit is OPEN. Service unavailable.`);
      }
    }

    try {
      this.totalRequests++;
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.lastSuccessTime = new Date();
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      
      if (this.successCount >= this.config.successThreshold) {
        this.reset();
        console.log(`CircuitBreaker[${this.name}]: Reset to CLOSED state after ${this.successCount} successful attempts`);
      }
    } else {
      this.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.lastFailureTime = new Date();
    this.failureCount++;
    
    if (this.state === CircuitState.HALF_OPEN) {
      this.trip();
      console.log(`CircuitBreaker[${this.name}]: Failed during HALF_OPEN state, returning to OPEN`);
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.trip();
      console.log(`CircuitBreaker[${this.name}]: Failure threshold reached (${this.failureCount}), tripping to OPEN state`);
    }
  }

  private trip(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
    this.successCount = 0;
  }

  private reset(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = null;
  }

  private shouldAttemptReset(): boolean {
    return this.nextAttemptTime !== null && new Date() >= this.nextAttemptTime;
  }

  public getMetrics(): CircuitBreakerMetrics {
    return {
      totalRequests: this.totalRequests,
      failedRequests: this.failureCount,
      successfulRequests: this.totalRequests - this.failureCount,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      state: this.state,
      nextAttemptTime: this.nextAttemptTime
    };
  }

  public getState(): CircuitState {
    return this.state;
  }

  public getName(): string {
    return this.name;
  }

  // Force circuit breaker state for testing
  public forceOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttemptTime = new Date(Date.now() + this.config.timeout);
  }

  public forceClose(): void {
    this.state = CircuitState.CLOSED;
    this.failureCount = 0;
    this.successCount = 0;
    this.nextAttemptTime = null;
  }
}