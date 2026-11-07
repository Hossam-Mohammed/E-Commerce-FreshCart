import { Component, inject, signal } from '@angular/core';
import { CategoriesService } from '../../core/services/Categories/categories.service';
import { ICategory } from '../../core/models/Category/icategory.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-categories',
  styleUrl: './categories.component.css',
  templateUrl: './categories.component.html',
})
export class CategoriesComponent {
  private _CategoriesService = inject(CategoriesService);
  categories = signal<ICategory[]>([]);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this._CategoriesService.GetAllCategories().subscribe({
      next: (res) => {
        this.categories.set(res.data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.hasError.set(true);
        this.isLoading.set(false);
      },
    });
  }
}
