import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CostCenter, EntitiesModel } from '@spartacus/core';
import { Table, TableService, TableStructure } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { BudgetService } from '@spartacus/my-account/organization/core';
import { BudgetCostCenterListService } from './budget-cost-center-list.service';

const mockCostCenterEntities: EntitiesModel<CostCenter> = {
  values: [
    {
      code: 'first',
      active: true,
    },
    {
      code: 'second',
      active: true,
    },
    {
      code: 'third',
      active: true,
    },
  ],
};

const mockCostCenterEntities2: EntitiesModel<CostCenter> = {
  values: [
    {
      code: 'first',
      active: true,
    },
    {
      code: 'second',
    },
    {
      code: 'third',
      active: true,
    },
  ],
};

class MockBudgetService {
  getCostCenters(): Observable<EntitiesModel<CostCenter>> {
    return of(mockCostCenterEntities);
  }
}

@Injectable()
export class MockTableService {
  buildStructure(type): Observable<TableStructure> {
    return of({ type });
  }
}

describe('BudgetCostCenterListService', () => {
  let service: BudgetCostCenterListService;
  let budgetService: BudgetService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        BudgetCostCenterListService,
        {
          provide: BudgetService,
          useClass: MockBudgetService,
        },
        {
          provide: TableService,
          useClass: MockTableService,
        },
      ],
    });
    service = TestBed.inject(BudgetCostCenterListService);
    budgetService = TestBed.inject(BudgetService);
  });

  it('should inject service', () => {
    expect(service).toBeTruthy();
  });

  it('should have all cost-centers', () => {
    let result: Table<CostCenter>;
    service.getTable().subscribe((table) => (result = table));
    expect(result.data.length).toEqual(3);
    expect(result.data[0].code).toEqual('first');
    expect(result.data[1].code).toEqual('second');
    expect(result.data[2].code).toEqual('third');
  });

  it('should filter selected cost-centers', () => {
    spyOn(budgetService, 'getCostCenters').and.returnValue(
      of(mockCostCenterEntities2)
    );
    let result: Table<CostCenter>;
    service.getTable().subscribe((table) => (result = table));
    expect(result.data.length).toEqual(2);
    expect(result.data).not.toContain({
      code: 'second',
    });
  });
});
