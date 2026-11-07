import { HomeCategoriesComponent } from './components/home-categories/home-categories.component';
import { HomeProductsComponent } from './components/home-products/home-products.component';
import { HomeSliderComponent } from './components/home-slider/home-slider.component';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  imports: [HomeSliderComponent, HomeCategoriesComponent, HomeProductsComponent, RouterLink],
  selector: 'app-home',
  styleUrl: './home.component.css',
  templateUrl: './home.component.html',
})
export class HomeComponent {}
