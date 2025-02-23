import { catchError, Observable, throwError } from "rxjs";
import { HttpResponse } from "../../../shared/service/http/http-response.interface";
import { CreateProductDto, FindProductDto, Product, UpdateProductDto } from "../product";
import { Injectable } from "@angular/core";
import { HttpService } from "../../../shared/service/http/http.service";

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private endpoint = 'products';
  private readonly ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
  private readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB

  constructor(private http: HttpService) {}

  getAll(filter?: FindProductDto): Observable<HttpResponse<Product[]>> {
    try {
      const queryParams = new URLSearchParams();
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      const url = `${this.endpoint}${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return this.http.get<Product[]>(url).pipe(
        catchError(error => {
          console.error('Error fetching products:', error);
          return throwError(() => new Error('Erreur lors de la récupération des produits'));
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  getById(id: string): Observable<HttpResponse<Product>> {
    try {
      if (!id) {
        throw new Error('ID requis');
      }
      return this.http.get<Product>(`${this.endpoint}/${id}`).pipe(
        catchError(error => {
          console.error('Error fetching product:', error);
          return throwError(() => new Error('Erreur lors de la récupération du produit'));
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

  create(productData: CreateProductDto): Observable<HttpResponse<Product>> {
    try {
      console.log('Création produit - données reçues:', productData);
      
      this.validateProductData(productData);
      const formData = this.createFormData(productData);
      
      console.log('FormData créé:', this.logFormData(formData));

      return this.http.post<Product>(this.endpoint, formData).pipe(
        catchError(error => {
          console.error('Error creating product:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      console.error('Error in create method:', error);
      return throwError(() => error);
    }
  }

  update(id: string, productData: UpdateProductDto): Observable<HttpResponse<Product>> {
    try {
      console.log('Mise à jour produit - données reçues:', { id, productData });
      
      if (!id) {
        throw new Error('ID requis');
      }
      
      this.validateProductData(productData, true);
      const formData = this.createFormData(productData);
      
      console.log('FormData pour mise à jour:', this.logFormData(formData));

      return this.http.put<Product>(`${this.endpoint}/${id}`, formData).pipe(
        catchError(error => {
          console.error('Error updating product:', error);
          return throwError(() => error);
        })
      );
    } catch (error) {
      return throwError(() => error);
    }
  }

 // Dans product.service.ts
// Correct
delete(id: string): Observable<any> {
  return this.http.delete(`${this.endpoint}/${id}`);
}
  private validateProductData(data: Partial<CreateProductDto | UpdateProductDto>, isUpdate: boolean = false): void {
    console.log('Validation des données:', { data, isUpdate });
    
    if (!isUpdate || data.name !== undefined) {
      if (!data.name || !data.name.trim()) {
        console.error('Validation échec: nom manquant ou vide');
        throw new Error('Le nom du produit est requis');
      }
    }

    if (!isUpdate || data.price !== undefined) {
      if (data.price === undefined || data.price < 0) {
        console.error('Validation échec: prix invalide');
        throw new Error('Le prix doit être un nombre positif');
      }
    }

    if (!isUpdate || data.quantity !== undefined) {
      if (data.quantity === undefined || data.quantity < 0) {
        console.error('Validation échec: quantité invalide');
        throw new Error('La quantité doit être un nombre positif');
      }
    }

    if (data.image instanceof File) {
      if (!this.ALLOWED_FILE_TYPES.includes(data.image.type)) {
        throw new Error('Format de fichier non supporté. Utilisez JPG, PNG ou GIF');
      }
      if (data.image.size > this.MAX_FILE_SIZE) {
        throw new Error('Le fichier est trop volumineux (maximum 5MB)');
      }
    }

    console.log('Validation réussie');
  }

  private createFormData(data: Partial<CreateProductDto | UpdateProductDto>): FormData {
    console.log('Création FormData - données initiales:', data);
    const formData = new FormData();

    if (data.name) {
      const name = data.name.trim();
      console.log('Ajout nom:', name);
      formData.append('name', name);
    }

    if (data.price !== undefined) {
      console.log('Ajout prix:', data.price);
      formData.append('price', data.price.toString());
    }

    if (data.quantity !== undefined) {
      console.log('Ajout quantité:', data.quantity);
      formData.append('quantity', data.quantity.toString());
    }

    if (data.image instanceof File) {
      console.log('Ajout image:', data.image.name);
      formData.append('image', data.image);
    }

    return formData;
  }

  private logFormData(formData: FormData): string {
    const entries: { [key: string]: string } = {};
    formData.forEach((value, key) => {
      entries[key] = value instanceof File ? value.name : value.toString();
    });
    return JSON.stringify(entries, null, 2);
  }
}