import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListroomComponent } from './listroom.component';

describe('ListroomComponent', () => {
  let component: ListroomComponent;
  let fixture: ComponentFixture<ListroomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListroomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListroomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
