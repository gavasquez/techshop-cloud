// src/infrastructure/resilience/ResilientService.ts
import { CircuitBreaker, CircuitBreakerConfig, CircuitBreakerMetrics } from './CircuitBreaker';
import { CircuitBreakerRegistry } from './CircuitBreakerRegistry';
import { RetryPolicy, RetryConfig } from './RetryPolicy';
export class ResilientService {
  private circuitBreaker: CircuitBreaker;
  private retryPolicy: RetryPolicy;

  constructor(
    serviceName: string,
    circuitBreakerConfig: CircuitBreakerConfig,
    retryConfig: RetryConfig
  ) {
    const registry = CircuitBreakerRegistry.getInstance();
    this.circuitBreaker = registry.register(serviceName, circuitBreakerConfig);
    this.retryPolicy = new RetryPolicy(retryConfig);
  }

  async executeWithResilience<T>(operation: () => Promise<T>): Promise<T> {
    return this.circuitBreaker.execute(async () => {
      return this.retryPolicy.execute(operation);
    });
  }

  getMetrics(): CircuitBreakerMetrics {
    return this.circuitBreaker.getMetrics();
  }

  getCircuitBreaker(): CircuitBreaker {
    return this.circuitBreaker;
  }

  getRetryPolicy(): RetryPolicy {
    return this.retryPolicy;
  }
}