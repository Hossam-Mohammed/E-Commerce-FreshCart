import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WildcardComponent } from './wildcard.component';

describe('WildcardComponent', () => {
  let component: WildcardComponent;
  let fixture: ComponentFixture<WildcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WildcardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WildcardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
