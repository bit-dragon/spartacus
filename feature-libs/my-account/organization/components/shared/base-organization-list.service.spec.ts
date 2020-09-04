import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PaginationModel } from '@spartacus/core';
import { Table, TableService, TableStructure } from '@spartacus/storefront';
import { Observable, of } from 'rxjs';
import { BaseOrganizationListService } from './base-organization-list.service';
import { OrganizationTableType } from './organization.model';

const mockValues = [{ foo: 'bar' }];

@Injectable()
class SampleListService extends BaseOrganizationListService<any> {
  tableType = 'mockTableType' as OrganizationTableType;
  load(structure: TableStructure): Observable<any> {
    return of({ ...structure, values: mockValues });
  }
}

@Injectable()
export class MockTableService {
  buildStructure(type): Observable<TableStructure> {
    return of({ type });
  }
}

describe('BaseOrganizationListService', () => {
  let service: SampleListService;
  let tableService: TableService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SampleListService,
        {
          provide: TableService,
          useClass: MockTableService,
        },
      ],
    });

    service = TestBed.inject(SampleListService);
    tableService = TestBed.inject(TableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getTable', () => {
    it('should call load method', () => {
      spyOn(service, 'load').and.callThrough();
      service.getTable().subscribe();
      expect(service.load).toHaveBeenCalled();
    });

    it('should return structure.values', () => {
      let result: Table<any>;
      service.getTable().subscribe((data) => (result = data));
      expect(result.data).toEqual(mockValues);
    });
  });

  describe('getStructure()', () => {
    it('should merge page structure pagination and runtime pagination', () => {
      const mockPagination: PaginationModel = { currentPage: 1, totalPages: 9 };
      service.viewPage({ currentPage: 1 }, 5);

      spyOn(tableService, 'buildStructure').and.returnValue(
        of({ pagination: mockPagination }) as Observable<TableStructure>
      );

      let result: Table<any>;
      service.getTable().subscribe((data) => (result = data));
      expect(result.pagination).toEqual({ ...mockPagination, currentPage: 5 });
    });
  });

  describe('viewPage()', () => {
    it('should paginate to page 5', () => {
      service.viewPage({ currentPage: 1 }, 5);
      let result: Table<any>;
      service.getTable().subscribe((data) => (result = data));
      expect(result.pagination.currentPage).toEqual(5);
    });
  });

  describe('sort()', () => {
    it('should sort by sortCode and reset currentPage', () => {
      service.sort({ currentPage: 7 }, 'byCode');
      let result: Table<any>;
      service.getTable().subscribe((data) => (result = data));
      expect(result.pagination.sort).toEqual('byCode');
      expect(result.pagination.currentPage).toEqual(0);
    });
  });
});
