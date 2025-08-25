import tauriConfig from '@/helpers/tauriConfig';
import { PakeAppOptions } from '@/types';
import BaseBuilder from './BaseBuilder';

export default class MacBuilder extends BaseBuilder {
  constructor(options: PakeAppOptions) {
    super(options);
    this.options.targets = 'dmg';
  }

  getFileName(): string {
    const { name, title } = this.options;
    const displayName = title || name;
    let arch: string;
    if (this.options.multiArch) {
      arch = 'universal';
    } else {
      // Determine target architecture from platform info set by GitHub workflow
      // Match what Tauri actually generates in filenames
      const targetPlatform = process.env.PAKE_TARGET_PLATFORM;
      if (targetPlatform === 'macos-intel') {
        arch = 'x64';  // Tauri uses 'x64', not 'x86_64' in filenames
      } else if (targetPlatform === 'macos-arm') {
        arch = 'aarch64';
      } else {
        // Fallback to process architecture  
        arch = process.arch === 'arm64' ? 'aarch64' : 'x64';
      }
    }
    return `${displayName}_${tauriConfig.version}_${arch}`;
  }

  protected getBuildCommand(): string {
    if (this.options.multiArch) {
      return 'npm run build:mac';
    }
    
    // For cross-compilation, we need to specify the target
    const targetPlatform = process.env.PAKE_TARGET_PLATFORM;
    if (targetPlatform === 'macos-intel') {
      return 'npm run tauri build -- --target x86_64-apple-darwin';
    } else if (targetPlatform === 'macos-arm') {
      return 'npm run tauri build -- --target aarch64-apple-darwin';
    }
    
    return super.getBuildCommand();
  }

  protected getBasePath(): string {
    if (this.options.multiArch) {
      return 'src-tauri/target/universal-apple-darwin/release/bundle';
    }
    
    // For cross-compilation, use target-specific path
    const targetPlatform = process.env.PAKE_TARGET_PLATFORM;
    if (targetPlatform === 'macos-intel') {
      return 'src-tauri/target/x86_64-apple-darwin/release/bundle';
    } else if (targetPlatform === 'macos-arm') {
      return 'src-tauri/target/aarch64-apple-darwin/release/bundle';
    }
    
    return super.getBasePath();
  }
}
