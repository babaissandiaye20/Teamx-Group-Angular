import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlashScreenComponent } from './flash-screen.component';

describe('FlashScreenComponent', () => {
  let component: FlashScreenComponent;
  let fixture: ComponentFixture<FlashScreenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FlashScreenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlashScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
