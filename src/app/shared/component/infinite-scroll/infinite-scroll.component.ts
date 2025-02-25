import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, HostListener } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-infinite-scroll',
  imports: [NgIf],
  templateUrl: './infinite-scroll.component.html',
  styleUrl: './infinite-scroll.component.css'
})
export class InfiniteScrollComponent implements OnChanges {
  @Input() allItems: any[] = []; // Toutes les données à charger
  @Input() limit: number = 10;   // Nombre d'éléments à charger à chaque fois
  @Output() displayedItemsChange = new EventEmitter<any[]>(); 
  @Input() loading: boolean = false; // État de chargement

  currentCount: number = 0;     // Nombre d'éléments actuellement affichés
  displayedItems: any[] = [];   // Éléments actuellement affichés
  hasMoreItems: boolean = true; // Indique s'il reste des éléments à charger
  
  // Seuil en pixels avant d'atteindre le bas de la page pour déclencher le chargement
  private scrollThreshold: number = 200;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allItems'] || changes['limit']) {
      this.resetScroll();
    }
  }

  /**
   * Réinitialise le défilement et charge la première page d'éléments
   */
  resetScroll(): void {
    this.currentCount = 0;
    this.displayedItems = [];
    this.hasMoreItems = this.allItems.length > 0;
    this.loadMoreItems();
  }

  /**
   * Charge une nouvelle "page" d'éléments
   */
  loadMoreItems(): void {
    if (!this.hasMoreItems || this.loading) return;

    const newItems = this.allItems.slice(
      this.currentCount, 
      this.currentCount + this.limit
    );
    
    if (newItems.length > 0) {
      this.displayedItems = [...this.displayedItems, ...newItems];
      this.currentCount += newItems.length;
      this.displayedItemsChange.emit(this.displayedItems);
    }
    
    // Vérifier s'il reste des éléments à charger
    this.hasMoreItems = this.currentCount < this.allItems.length;
  }

  /**
   * Surveille le défilement de la fenêtre pour charger plus d'éléments
   * lorsque l'utilisateur approche du bas de la page
   */
  @HostListener('window:scroll', ['$event'])
  onScroll(): void {
    // La position actuelle du scroll + la hauteur de la fenêtre visible
    const windowHeight = window.innerHeight;
    const scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Si on s'approche du bas de la page
    if (windowHeight + scrollPosition >= documentHeight - this.scrollThreshold) {
      this.loadMoreItems();
    }
  }
}