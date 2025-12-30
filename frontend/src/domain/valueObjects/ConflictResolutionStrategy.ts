/**
 * ConflictResolutionStrategy Value Object
 * Defines strategies for resolving data conflicts during sync
 * Following Clean Architecture - Domain Layer
 */

export enum ConflictStrategy {
  SERVER_WINS = 'SERVER_WINS', // Server data takes precedence
  CLIENT_WINS = 'CLIENT_WINS', // Client data takes precedence
  MANUAL = 'MANUAL', // Require manual user intervention
  LATEST_TIMESTAMP = 'LATEST_TIMESTAMP', // Most recent change wins
  MERGE = 'MERGE', // Attempt to merge both changes
}

export interface ConflictResolutionStrategyProps {
  strategy: ConflictStrategy;
  autoResolve: boolean;
  preserveHistory: boolean;
}

export class ConflictResolutionStrategy {
  private constructor(private props: ConflictResolutionStrategyProps) {}

  public static create(
    strategy: ConflictStrategy,
    autoResolve: boolean = true,
    preserveHistory: boolean = true
  ): ConflictResolutionStrategy {
    return new ConflictResolutionStrategy({
      strategy,
      autoResolve,
      preserveHistory,
    });
  }

  public static serverWins(): ConflictResolutionStrategy {
    return new ConflictResolutionStrategy({
      strategy: ConflictStrategy.SERVER_WINS,
      autoResolve: true,
      preserveHistory: true,
    });
  }

  public static clientWins(): ConflictResolutionStrategy {
    return new ConflictResolutionStrategy({
      strategy: ConflictStrategy.CLIENT_WINS,
      autoResolve: true,
      preserveHistory: true,
    });
  }

  public static manual(): ConflictResolutionStrategy {
    return new ConflictResolutionStrategy({
      strategy: ConflictStrategy.MANUAL,
      autoResolve: false,
      preserveHistory: true,
    });
  }

  public static latestTimestamp(): ConflictResolutionStrategy {
    return new ConflictResolutionStrategy({
      strategy: ConflictStrategy.LATEST_TIMESTAMP,
      autoResolve: true,
      preserveHistory: true,
    });
  }

  public getStrategy(): ConflictStrategy {
    return this.props.strategy;
  }

  public isAutoResolve(): boolean {
    return this.props.autoResolve;
  }

  public shouldPreserveHistory(): boolean {
    return this.props.preserveHistory;
  }

  public requiresManualIntervention(): boolean {
    return this.props.strategy === ConflictStrategy.MANUAL || !this.props.autoResolve;
  }

  public toJSON(): ConflictResolutionStrategyProps {
    return { ...this.props };
  }
}
