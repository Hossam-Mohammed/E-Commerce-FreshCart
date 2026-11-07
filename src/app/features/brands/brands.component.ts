import { Component, inject, signal } from '@angular/core';
import { BrandsService } from '../../core/services/Brands/brands.service';
import { Daum } from '../../core/models/brands/ibrands.interface';
import { RouterLink } from '@angular/router';

@Component({
  imports: [RouterLink],
  selector: 'app-brands',
  styleUrl: './brands.component.css',
  templateUrl: './brands.component.html',
})
export class BrandsComponent {
  private _BrandsService = inject(BrandsService);
  brands = signal<Daum[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this._BrandsService.GetAllBrands().subscribe({
      next: (res) => {
        this.brands.set(res.data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }
}
