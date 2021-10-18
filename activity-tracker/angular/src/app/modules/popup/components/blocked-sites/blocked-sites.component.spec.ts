import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlockedSitesComponent } from './blocked-sites.component';

describe('BlockedSitesComponent', () => {
  let component: BlockedSitesComponent;
  let fixture: ComponentFixture<BlockedSitesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BlockedSitesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BlockedSitesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
