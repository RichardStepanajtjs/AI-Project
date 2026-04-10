import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly STORAGE_KEY = 'sokrates-theme';

  apply(theme: Theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  }

  init() {
    const saved = (localStorage.getItem(this.STORAGE_KEY) ?? 'light') as Theme;
    this.apply(saved);
  }

  current(): Theme {
    return (localStorage.getItem(this.STORAGE_KEY) ?? 'light') as Theme;
  }
}
