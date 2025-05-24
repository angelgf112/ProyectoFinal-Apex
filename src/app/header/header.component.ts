import { Component, HostListener } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../theme.service';
import { LiveAnnouncer } from '@angular/cdk/a11y';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  imports: [MatToolbarModule, MatIconModule, CommonModule],
})
export class HeaderComponent {
  title = 'ApexAutomotive';
  slogan = 'Más que autos, experiencias al límite';
  showSlogan = true;
  isScreenReaderActive = false;
  private speechSynth = window.speechSynthesis;
  private utterance = new SpeechSynthesisUtterance();
  private isPaused = false;
  isMenuOpen = false;
  isDaltonismMenuOpen = false;
  currentFilter = '';


  constructor(public themeService: ThemeService, private liveAnnouncer: LiveAnnouncer) { }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleDaltonismMenu(event: Event) {
    event.stopPropagation();
    this.isDaltonismMenuOpen = !this.isDaltonismMenuOpen;
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  applyFilter(filterType: string) {
  this.currentFilter = filterType;
  const mainContent = document.querySelector('.main-content');
  
  // Remueve filtros previos
  mainContent?.classList.remove('daltonism-protanopia', 'daltonism-deuteranopia', 'daltonism-tritanopia');
  
  // Aplica nuevo filtro solo al main-content
  mainContent?.classList.add(`daltonism-${filterType}`);
}


  resetFilter() {
  const mainContent = document.querySelector('.main-content');
  mainContent?.classList.remove('daltonism-protanopia', 'daltonism-deuteranopia', 'daltonism-tritanopia');
  this.currentFilter = '';
}

  startReading() {
    if (this.speechSynth.paused) {
      this.speechSynth.resume();
    } else {
      this.readContent(); 
    }
    this.isPaused = false;
  }

  pauseReading() {
    if (this.speechSynth.speaking) {
      this.speechSynth.pause();
      this.isPaused = true;
    }
  }

  stopReading() {
    this.speechSynth.cancel();
    this.isScreenReaderActive = false;
    this.isPaused = false;
  }

  private readContent() {
    this.speechSynth.cancel();

    const content = this.extractPageContent();
    this.utterance.text = content;
    this.utterance.onend = () => {
      this.isScreenReaderActive = false;
      this.isPaused = false;
    };

    this.speechSynth.speak(this.utterance);
  }

  private extractPageContent(): string {
    const ignoreSelectors = ['script', 'style', '.sr-only'];
    let text = '';

    document.querySelectorAll('body *').forEach(el => {
      const isVisible = el.checkVisibility() &&
        !ignoreSelectors.some(sel => el.matches(sel));

      if (isVisible && el.textContent) {
        text += el.textContent.trim() + ' ';
      }
    });

    return text || 'No hay contenido para leer';
  }

  getReaderIcon() {
    if (!this.isScreenReaderActive) return 'volume_off';
    return this.isPaused ? 'pause' : 'volume_up';
  }

  get isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  particles = Array.from({ length: 15 }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 10,
  }));

  toggleScreenReader() {
    this.isScreenReaderActive = !this.isScreenReaderActive;

    if (this.isScreenReaderActive) {
      this.readContent();
    } else {
      this.speechSynth.cancel();
    }
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si el clic NO fue en ningún elemento del menú de accesibilidad
    if (!target.closest('.accessibility-menu')) {
      this.isMenuOpen = false;
      this.isDaltonismMenuOpen = false;
    }
  }

}
