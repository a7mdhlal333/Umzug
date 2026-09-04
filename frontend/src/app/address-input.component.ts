import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-address-input',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './address-input.component.html'
})
export class AddressInputComponent {
  readonly language = inject(LanguageService);
  @Input() label = 'Adresse';
  @Input() placeholder = 'z. B. Stuttgart';
  @Input() value = '';
  @Output() readonly valueChange = new EventEmitter<string>();
  @ViewChild('addressInput') private addressInput?: ElementRef<HTMLInputElement>;

  readonly placesInBadenWuerttemberg = [
    'Stuttgart', 'Bad Cannstatt', 'Vaihingen', 'Degerloch', 'Zuffenhausen',
    'Mannheim', 'Karlsruhe', 'Freiburg im Breisgau', 'Heidelberg', 'Ulm',
    'Heilbronn', 'Pforzheim', 'Reutlingen', 'Esslingen am Neckar', 'Ludwigsburg',
    'Tübingen', 'Konstanz', 'Baden-Baden', 'Offenburg', 'Ravensburg',
    'Sindelfingen', 'Böblingen', 'Göppingen', 'Aalen', 'Waiblingen',
    'Leonberg', 'Fellbach', 'Schorndorf'
  ];

  readonly arabicPlaceNames: Record<string, string> = {
    Stuttgart: 'شتوتغارت',
    'Bad Cannstatt': 'باد كانشتات',
    Vaihingen: 'فايهينغن',
    Degerloch: 'ديغيرلوخ',
    Zuffenhausen: 'تسوفنهاوزن',
    Mannheim: 'مانهايم',
    Karlsruhe: 'كارلسروه',
    'Freiburg im Breisgau': 'فرايبورغ',
    Heidelberg: 'هايدلبرغ',
    Ulm: 'أولم',
    Heilbronn: 'هايلبرون',
    Pforzheim: 'فورتسهايم',
    Reutlingen: 'رويتلينغن',
    'Esslingen am Neckar': 'إسلينغن',
    Ludwigsburg: 'لودفيغسبورغ',
    Tübingen: 'توبينغن',
    Konstanz: 'كونستانس',
    'Baden-Baden': 'بادن بادن',
    Offenburg: 'أوفنبرغ',
    Ravensburg: 'رافنسبورغ',
    Sindelfingen: 'زيندلفينغن',
    Böblingen: 'بوبلينغن',
    Göppingen: 'غوبينغن',
    Aalen: 'آلن',
    Waiblingen: 'فايبلينغن',
    Leonberg: 'ليونبرغ',
    Fellbach: 'فيلباخ',
    Schorndorf: 'شورندورف'
  };

  suggestions: string[] = [];
  isOpen = false;

  onInput(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
    this.updateSuggestions();
  }

  onFocus(): void {
    this.isOpen = true;
    this.updateSuggestions();
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.isOpen = false;
    }
    if (event.key === 'Enter' && this.suggestions.length > 0) {
      event.preventDefault();
      this.selectSuggestion(this.suggestions[0]);
    }
  }

  selectSuggestion(place: string): void {
    this.value = place;
    this.valueChange.emit(place);
    this.isOpen = false;
  }

  placeLabel(place: string): string {
    return this.language.language() === 'ar' && this.arabicPlaceNames[place]
      ? `${place} (${this.arabicPlaceNames[place]})`
      : place;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.addressInput?.nativeElement.closest('app-address-input')?.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }

  private updateSuggestions(): void {
    const query = this.value.trim().toLocaleLowerCase('de-DE');
    this.suggestions = this.placesInBadenWuerttemberg
      .filter((place) => !query || place.toLocaleLowerCase('de-DE').includes(query))
      .slice(0, 6);
  }
}