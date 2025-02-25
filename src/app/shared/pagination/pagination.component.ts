import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-pagination',
  imports: [NgFor, NgIf],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.css'
})
export class PaginationComponent implements OnChanges {
  @Input() allItems: any[] = []; // Toutes les données à paginer
  @Input() limit: number = 10;   // Nombre d'éléments par page
  @Output() pageItemsChange = new EventEmitter<any[]>(); 

  currentPage: number = 1;
  totalPages: number = 1;
  total: number = 0;
  visiblePages: (number | string)[] = [];
  
  // Données visibles sur la page actuelle
  currentPageItems: any[] = [];

  startItem: number = 0;
  endItem: number = 0;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['allItems'] || changes['limit']) {
      this.total = this.allItems.length;
      this.totalPages = Math.ceil(this.total / this.limit);
      this.currentPage = 1; // Réinitialiser à la première page quand les données changent
      this.updatePage();
    }
  }

  // Méthode pour mettre à jour la page actuelle
  updatePage() {
    this.calculateVisiblePages();
    this.calculateItemRange();
    this.updateCurrentPageItems();
  }

  // Calculer les éléments visibles pour la page actuelle
  private updateCurrentPageItems() {
    const startIndex = (this.currentPage - 1) * this.limit;
    const endIndex = Math.min(startIndex + this.limit, this.total);
    this.currentPageItems = this.allItems.slice(startIndex, endIndex);
    
    // Émettre les éléments actuels
    this.pageItemsChange.emit(this.currentPageItems);
  }

  private calculateVisiblePages() {
    const maxVisiblePages = 5;
    let pages: (number | string)[] = [];

    if (this.totalPages <= maxVisiblePages) {
      pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    } else {
      if (this.currentPage <= 3) {
        // Début de la pagination
        pages = [1, 2, 3, 4, '...', this.totalPages];
      } else if (this.currentPage >= this.totalPages - 2) {
        // Fin de la pagination
        pages = [1, '...', this.totalPages - 3, this.totalPages - 2, this.totalPages - 1, this.totalPages];
      } else {
        // Milieu de la pagination
        pages = [1, '...', this.currentPage - 1, this.currentPage, this.currentPage + 1, '...', this.totalPages];
      }
    }
    this.visiblePages = pages;
  }

  private calculateItemRange() {
    this.startItem = (this.currentPage - 1) * this.limit + 1;
    this.endItem = Math.min(this.currentPage * this.limit, this.total);
  }

  onPageChange(page: number | string) {
    const pageNumber = Number(page);
  
    if (isNaN(pageNumber) || pageNumber < 1 || pageNumber > this.totalPages || pageNumber === this.currentPage) {
      return; // Ignore les valeurs invalides
    }
  
    this.currentPage = pageNumber;
    this.updatePage();
  }
}
