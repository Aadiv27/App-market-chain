// Navigation guard to prevent excessive navigation calls
class NavigationGuard {
  private navigationAttempts: Map<string, { count: number; lastAttempt: number }> = new Map();
  private readonly MAX_NAVIGATIONS = 5; // Increased from 3 to 5
  private readonly RESET_INTERVAL = 3000; // Increased from 2 to 3 seconds
  private readonly COOLDOWN_PERIOD = 3000; // Reduced from 5 to 3 seconds
  private readonly CLEANUP_INTERVAL = 30000; // 30 seconds
  private cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    // Start cleanup timer
    this.startCleanup();
  }

  canNavigate(path: string): boolean {
    const now = Date.now();
    const pathData = this.navigationAttempts.get(path);

    // If no previous attempts, allow navigation
    if (!pathData) {
      this.navigationAttempts.set(path, { count: 1, lastAttempt: now });
      return true;
    }

    // If enough time has passed since last attempt, reset counter
    if (now - pathData.lastAttempt > this.RESET_INTERVAL) {
      this.navigationAttempts.set(path, { count: 1, lastAttempt: now });
      return true;
    }

    // If we're in cooldown period after blocking, continue blocking
    if (pathData.count > this.MAX_NAVIGATIONS && now - pathData.lastAttempt < this.COOLDOWN_PERIOD) {
      console.warn(`Navigation to ${path} blocked due to excessive attempts. Please wait ${Math.ceil((this.COOLDOWN_PERIOD - (now - pathData.lastAttempt)) / 1000)} seconds.`);
      return false;
    }

    // If cooldown period has passed, reset and allow
    if (pathData.count > this.MAX_NAVIGATIONS && now - pathData.lastAttempt >= this.COOLDOWN_PERIOD) {
      this.navigationAttempts.set(path, { count: 1, lastAttempt: now });
      return true;
    }

    // Increment counter
    pathData.count++;
    pathData.lastAttempt = now;

    // Check if we've exceeded the limit
    if (pathData.count > this.MAX_NAVIGATIONS) {
      console.warn(`Navigation to ${path} blocked due to excessive attempts. Cooldown period started.`);
      return false;
    }

    return true;
  }

  private startCleanup(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  private cleanup(): void {
    const now = Date.now();
    const toDelete: string[] = [];
    
    this.navigationAttempts.forEach((data, path) => {
      // Remove entries older than cooldown period that are no longer blocked
      if (now - data.lastAttempt > this.COOLDOWN_PERIOD) {
        toDelete.push(path);
      }
    });
    
    toDelete.forEach(path => this.navigationAttempts.delete(path));
  }

  reset(path?: string): void {
    if (path) {
      this.navigationAttempts.delete(path);
    } else {
      this.navigationAttempts.clear();
    }
  }

  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.navigationAttempts.clear();
  }

  // Method to check if a path is currently blocked
  isBlocked(path: string): boolean {
    const now = Date.now();
    const pathData = this.navigationAttempts.get(path);
    
    if (!pathData) return false;
    
    return pathData.count > this.MAX_NAVIGATIONS && 
           now - pathData.lastAttempt < this.COOLDOWN_PERIOD;
  }

  // Debug method to get current state
  getDebugInfo(): Record<string, any> {
    const now = Date.now();
    const info: Record<string, any> = {};
    
    this.navigationAttempts.forEach((data, path) => {
      info[path] = {
        count: data.count,
        lastAttempt: new Date(data.lastAttempt).toISOString(),
        timeSinceLastAttempt: now - data.lastAttempt,
        isBlocked: this.isBlocked(path),
        timeUntilReset: Math.max(0, this.RESET_INTERVAL - (now - data.lastAttempt)),
        timeUntilUnblock: this.isBlocked(path) ? Math.max(0, this.COOLDOWN_PERIOD - (now - data.lastAttempt)) : 0
      };
    });
    
    return info;
  }
}

export const navigationGuard = new NavigationGuard();

// Make navigation guard available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).navigationGuard = navigationGuard;
  (window as any).debugNavigation = () => {
    console.log('Navigation Guard Debug Info:', navigationGuard.getDebugInfo());
  };
}