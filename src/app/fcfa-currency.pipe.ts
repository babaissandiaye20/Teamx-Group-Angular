import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fcfa',
  standalone: true
})
export class FcfaCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    // Formatter le nombre avec 2 décimales
    const formattedNumber = new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
    
    // Ajouter le symbole FCFA
    return `${formattedNumber} FCFA`;
  }
}