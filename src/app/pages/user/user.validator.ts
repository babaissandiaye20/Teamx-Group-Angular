import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { User, CreateUserDto, UpdateUserDto } from './user';

@Injectable({
  providedIn: 'root'
})
export class UserValidator {
  private readonly NAME_PATTERN = /^[a-zA-ZÀ-ÿ\s-]{2,50}$/;
  private readonly ADDRESS_MIN_LENGTH = 2;
  private readonly ADDRESS_MAX_LENGTH = 200;

  validateFirstName(control: AbstractControl): ValidationErrors | null {
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

  validateLastName(control: AbstractControl): ValidationErrors | null {
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

  validateAddress(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    
    if (!value) {
      return { required: true };
    }

    if (value.length < this.ADDRESS_MIN_LENGTH) {
      return {
        minlength: {
          requiredLength: this.ADDRESS_MIN_LENGTH,
          actualLength: value.length
        }
      };
    }

    if (value.length > this.ADDRESS_MAX_LENGTH) {
      return {
        maxlength: {
          requiredLength: this.ADDRESS_MAX_LENGTH,
          actualLength: value.length
        }
      };
    }

    return null;
  }

  getErrorMessage(fieldName: string, errors: ValidationErrors): string {
    if (!errors) return '';

    switch (fieldName) {
      case 'firstname':
      case 'lastname':
        if (errors['required']) {
          return `Le ${fieldName === 'firstname' ? 'prénom' : 'nom'} est requis`;
        }
        if (errors['pattern']) {
          return `Le ${fieldName === 'firstname' ? 'prénom' : 'nom'} n'est pas valide (2-50 caractères, lettres uniquement)`;
        }
        break;

      case 'address':
        if (errors['required']) {
          return "L'adresse est requise";
        }
        if (errors['minlength']) {
          return `L'adresse doit contenir au moins ${this.ADDRESS_MIN_LENGTH} caractères`;
        }
        if (errors['maxlength']) {
          return `L'adresse ne peut pas dépasser ${this.ADDRESS_MAX_LENGTH} caractères`;
        }
        break;
    }

    return 'Champ invalide';
  }
}