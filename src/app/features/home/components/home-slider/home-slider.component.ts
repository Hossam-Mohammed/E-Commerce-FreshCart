import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Slide {
  title: string;
  subtitle: string;
  badge?: string;
  image: string;
  buttonText: string;
  buttonLink: string;
}

@Component({
  selector: 'app-home-slider',
  imports: [RouterLink],
  templateUrl: './home-slider.component.html',
  styleUrl: './home-slider.component.css',
})
export class HomeSliderComponent implements OnInit, OnDestroy {
  currentSlide = signal<number>(0);
  private timer: any;

  slides: Slide[] = [
    {
      title: 'Fresh Products Delivered to your Door',
      subtitle: 'Get 20% off your first order',
      badge: 'Special Offer',
      image: '/images/home-slider-1.d79601a8.png',
      buttonText: 'Shop Now',
      buttonLink: '/shop',
    },
    {
      title: 'Fresh Organic Fruits & Crisp Vegetables',
      subtitle: 'Handpicked daily for peak freshness and quality',
      badge: '100% Organic',
      image: '/images/grocery-banner-2.jpeg',
      buttonText: 'Explore Now',
      buttonLink: '/shop',
    },
    {
      title: 'Premium Quality Groceries at Best Prices',
      subtitle: 'Free delivery on orders over 500 EGP',
      badge: 'Best Deals',
      image: '/images/grocery-banner.png',
      buttonText: 'View Deals',
      buttonLink: '/shop',
    },
  ];

  ngOnInit(): void {
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    this.stopAutoPlay();
  }

  startAutoPlay(): void {
    this.stopAutoPlay();
    this.timer = setInterval(() => {
      this.next();
    }, 5500);
  }

  stopAutoPlay(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  next(): void {
    this.currentSlide.update((i) => (i + 1) % this.slides.length);
  }

  prev(): void {
    this.currentSlide.update((i) => (i - 1 + this.slides.length) % this.slides.length);
  }

  goTo(index: number): void {
    this.currentSlide.set(index);
    this.startAutoPlay();
  }
}
