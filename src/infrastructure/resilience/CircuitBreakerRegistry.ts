// src/infrastructure/resilience/CircuitBreakerRegistry.ts
import { CircuitBreaker, CircuitBreakerConfig, CircuitBreakerMetrics } from './CircuitBreaker';
export class CircuitBreakerRegistry {
  private static instance: CircuitBreakerRegistry;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();

  private constructor() {}

  public static getInstance(): CircuitBreakerRegistry {
    if (!CircuitBreakerRegistry.instance) {
      CircuitBreakerRegistry.instance = new CircuitBreakerRegistry();
    }
    return CircuitBreakerRegistry.instance;
  }

  public register(name: string, config: CircuitBreakerConfig): CircuitBreaker {
    if (this.circuitBreakers.has(name)) {
      throw new Error(`CircuitBreaker with name '${name}' already exists`);
    }

    const circuitBreaker = new CircuitBreaker(name, config);
    this.circuitBreakers.set(name, circuitBreaker);
    
    console.log(`CircuitBreaker[${name}]: Registered with config:`, config);
    return circuitBreaker;
  }

  public get(name: string): CircuitBreaker {
    const circuitBreaker = this.circuitBreakers.get(name);
    if (!circuitBreaker) {
      throw new Error(`CircuitBreaker with name '${name}' not found`);
    }
    return circuitBreaker;
  }

  public getAllMetrics(): Record<string, CircuitBreakerMetrics> {
    const metrics: Record<string, CircuitBreakerMetrics> = {};
    
    for (const [name, circuitBreaker] of this.circuitBreakers) {
      metrics[name] = circuitBreaker.getMetrics();
    }
    
    return metrics;
  }

  public getCircuitBreakerNames(): string[] {
    return Array.from(this.circuitBreakers.keys());
  }

  public removeCircuitBreaker(name: string): boolean {
    return this.circuitBreakers.delete(name);
  }

  public clear(): void {
    this.circuitBreakers.clear();
  }
}