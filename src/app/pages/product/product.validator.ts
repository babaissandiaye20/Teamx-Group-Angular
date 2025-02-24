import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Product, CreateProductDto, UpdateProductDto } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductValidator {
  private readonly NAME_PATTERN = /^[a-zA-Z0-9À-ÿ\s\-_]{2,100}$/;
  private readonly MIN_PRICE = 0;
  private readonly MAX_PRICE = 10000000; // 10 millions FCFA
  private readonly MIN_QUANTITY = 0;
  private readonly MAX_QUANTITY = 999999;
  private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  validateName(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return { required: true };
    }

    if (!this.NAME_PATTERN.test(value)) {
      return {
        pattern: {
          requiredPattern: this.NAME_PATTERN,
          actualValue: value
        }
      };
    }

    return null;
  }

  validatePrice(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return { required: true };
    }

    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return { notANumber: true };
    }

    if (numValue < this.MIN_PRICE) {
      return {
        min: {
          min: this.MIN_PRICE,
          actual: numValue
        }
      };
    }

    if (numValue > this.MAX_PRICE) {
      return {
        max: {
          max: this.MAX_PRICE,
          actual: numValue
        }
      };
    }

    return null;
  }

  validateQuantity(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (value === null || value === undefined || value === '') {
      return { required: true };
    }

    const numValue = Number(value);
    
    if (isNaN(numValue)) {
      return { notANumber: true };
    }

    if (!Number.isInteger(numValue)) {
      return { notAnInteger: true };
    }

    if (numValue < this.MIN_QUANTITY) {
      return {
        min: {
          min: this.MIN_QUANTITY,
          actual: numValue
        }
      };
    }

    if (numValue > this.MAX_QUANTITY) {
      return {
        max: {
          max: this.MAX_QUANTITY,
          actual: numValue
        }
      };
    }

    return null;
  }

  validateImage(file: File | null): ValidationErrors | null {
    if (!file) {
      return { required: true };
    }

    if (!this.ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        invalidType: {
          allowedTypes: this.ALLOWED_FILE_TYPES,
          actual: file.type
        }
      };
    }

    if (file.size > this.MAX_FILE_SIZE) {
      return {
        maxSize: {
          maxSize: this.MAX_FILE_SIZE,
          actual: file.size
        }
      };
    }

    return null;
  }

  getErrorMessage(fieldName: string, errors: ValidationErrors): string {
    if (!errors) return '';

    switch (fieldName) {
      case 'name':
        if (errors['required']) {
          return 'Le nom du produit est requis';
        }
        if (errors['pattern']) {
          return 'Le nom du produit n\'est pas valide (2-100 caractères, lettres, chiffres et tirets autorisés)';
        }
        break;

      case 'price':
        if (errors['required']) {
          return 'Le prix est requis';
        }
        if (errors['notANumber']) {
          return 'Le prix doit être un nombre valide';
        }
        if (errors['min']) {
          return `Le prix minimum est de ${this.MIN_PRICE} FCFA`;
        }
        if (errors['max']) {
          return `Le prix maximum est de ${this.MAX_PRICE.toLocaleString()} FCFA`;
        }
        break;

      case 'quantity':
        if (errors['required']) {
          return 'La quantité est requise';
        }
        if (errors['notANumber']) {
          return 'La quantité doit être un nombre valide';
        }
        if (errors['notAnInteger']) {
          return 'La quantité doit être un nombre entier';
        }
        if (errors['min']) {
          return `La quantité minimum est de ${this.MIN_QUANTITY}`;
        }
        if (errors['max']) {
          return `La quantité maximum est de ${this.MAX_QUANTITY.toLocaleString()}`;
        }
        break;

      case 'image':
        if (errors['required']) {
          return 'L\'image du produit est requise';
        }
        if (errors['invalidType']) {
          return 'Format de fichier non supporté. Utilisez JPG, PNG ou GIF';
        }
        if (errors['maxSize']) {
          return 'Le fichier est trop volumineux (maximum 10MB)';
        }
        break;
    }

    return 'Champ invalide';
  }
}