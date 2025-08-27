
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { Publisher } from '../../Publisher/Publisher Interfaces/publisher-interfaces';
import { PublisherServices } from '../../Publisher/PublisherServices/publisher-services';

@Component({
  selector: 'app-filtering',
  imports: [RouterLink, RouterLinkActive, CommonModule, FormsModule],
  templateUrl: './filtering.html',
  styleUrl: './filtering.css'
})
export class Filtering implements OnInit {
  languages: string[] = ['الكتب العربية', 'الكتب الانجلزية'];
  
  public languageMap: {[key: string]: number} = {
    'الكتب العربية': 1, 
    'الكتب الانجلزية': 2 
  };

  sortOptions = [
    { label: '⇡ الأحدث', value: 0 }, 
    { label: '⇣ الأقدم', value: 1 }, 
    { label: '⇡ الأكثر رواجاً', value: 4 } 
  ];
  
  sectionVisibility = {
    language: true,
    order: true,
    publisher: true
  };

  selectedLanguage: number | null = null;
  selectedSort: number = 0;
  selectedPublishers: number[] = [];
  searchPublisherTerm: string = '';

  // Publisher related properties
  allPublishers: Publisher[] = [];
  displayedPublishers: Publisher[] = [];
  showAllPublishers: boolean = false;
  private searchSubject = new Subject<string>();

  @Output() filterChanged = new EventEmitter<FilterParams>();

  constructor(private publisherService: PublisherServices) {}

  ngOnInit() {
    this.loadPublishers();
    
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(searchTerm => {
      this.searchPublisherTerm = searchTerm;
      this.filterPublishers();
    });

    // Emit initial filter state
    this.applyFilters();
  }

  loadPublishers() {
    this.publisherService.getPublishers(1, 50, '').subscribe({
      next: (response) => {
        if (response.succeeded) {
          this.allPublishers = response.data;
          this.filterPublishers();
        }
      },
      error: (error) => {
        console.error('Error loading publishers:', error);
      }
    });
  }

  filterPublishers() {
    if (this.searchPublisherTerm) {
      this.displayedPublishers = this.allPublishers.filter(publisher =>
        publisher.name.toLowerCase().includes(this.searchPublisherTerm.toLowerCase())
      );
    } else {
      this.displayedPublishers = this.showAllPublishers 
        ? this.allPublishers 
        : this.allPublishers.slice(0, 3);
    }
  }

  onSearchInput() {
    this.searchSubject.next(this.searchPublisherTerm);
  }

  toggleShowAllPublishers() {
    this.showAllPublishers = !this.showAllPublishers;
    this.filterPublishers();
  }

  toggleSection(section: 'language' | 'order' | 'publisher') {
    this.sectionVisibility[section] = !this.sectionVisibility[section];
  }

  onLanguageChange(language: string) {
    const languageValue = this.languageMap[language];
    this.selectedLanguage = this.selectedLanguage === languageValue ? null : languageValue;
    this.applyFilters();
  }

  onSortChange(sortValue: any) {
    this.selectedSort = Number(sortValue);
    this.applyFilters();
  }

  onPublisherChange(publisherId: number) {
    const index = this.selectedPublishers.indexOf(publisherId);
    if (index > -1) {
      this.selectedPublishers.splice(index, 1);
    } else {
      this.selectedPublishers.push(publisherId);
    }
    this.applyFilters();
  }

  applyFilters() {
    this.filterChanged.emit({
      language: this.selectedLanguage,
      sortBy: this.selectedSort,
      publisherIds: this.selectedPublishers,
      searchTerm: this.searchPublisherTerm
    });
  }
}

export interface FilterParams {
  language?: number | null;
  sortBy?: number;
  publisherIds?: number[];
  searchTerm?: string;
}