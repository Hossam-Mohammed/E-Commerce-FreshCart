import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PDetailsComponent } from './p-details.component';

describe('PDetailsComponent', () => {
  let component: PDetailsComponent;
  let fixture: ComponentFixture<PDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
