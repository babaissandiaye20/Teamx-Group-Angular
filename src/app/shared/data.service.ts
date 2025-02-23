import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService<T extends { id: number | string }> {
  private _items = new BehaviorSubject<T[]>([]);
  items$: Observable<T[]> = this._items.asObservable();

  constructor() {}

  // Initialiser les données
  setItems(items: T[]) {
    this._items.next(items);
  }

  // Obtenir tous les items
  getItems(): T[] {
    return this._items.getValue();
  }

  // Ajouter un nouvel item
  addItem(item: Omit<T, 'id'>): T {
    const items = this.getItems();
    const newId = typeof items[0]?.id === 'number' 
      ? Math.max(...items.map(item => Number(item.id)), 0) + 1
      : Date.now().toString();
    
    const newItem = { ...item, id: newId } as T;
    this._items.next([...items, newItem]);
    return newItem;
  }

  // Mettre à jour un item existant
  updateItem(item: T): T {
    const items = this.getItems();
    const index = items.findIndex(i => i.id === item.id);
    
    if (index !== -1) {
      const updatedItems = [...items];
      updatedItems[index] = { ...item };
      this._items.next(updatedItems);
    }
    
    return item;
  }

  // Supprimer un item
  deleteItem(id: number | string): void {
    const items = this.getItems();
    this._items.next(items.filter(item => item.id !== id));
  }
}
