import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';

import { BudgetActions, CostCenterActions } from '../actions/index';
import * as fromEffects from './cost-center.effect';
import {
  B2BSearchConfig,
  Budget,
  CostCenterConnector,
} from '@spartacus/my-account/organization/core';

import { CostCenter, normalizeHttpError, OccConfig } from '@spartacus/core';
import { defaultOccOrganizationConfig } from '@spartacus/my-account/organization/occ';
import createSpy = jasmine.createSpy;

const httpErrorResponse = new HttpErrorResponse({
  error: 'error',
  headers: new HttpHeaders().set('xxx', 'xxx'),
  status: 500,
  statusText: 'Unknown error',
  url: '/xxx',
});
const error = normalizeHttpError(httpErrorResponse);
const costCenterCode = 'testCode';
const userId = 'testUser';
const costCenter: CostCenter = {
  code: costCenterCode,
  activeFlag: false,
  active: false,
  originalCode: 'orgCode',
  name: 'testName',
  unit: { uid: 'ouid', name: 'ouName' },
};
const budgetCode = 'testCode';
const budget: Budget = {
  code: budgetCode,
  active: false,
  budget: 2,
  currency: {},
  endDate: 'endDate',
  startDate: 'startDate',
  name: 'testName',
  orgUnit: { uid: 'ouid', name: 'ouName' },
  costCenters: [],
};
const pagination = { currentPage: 1 };
const sorts = [{ selected: true, name: 'code' }];

class MockCostCenterConnector implements Partial<CostCenterConnector> {
  get = createSpy().and.returnValue(of(costCenter));
  getList = createSpy().and.returnValue(
    of({ values: [costCenter], pagination, sorts })
  );
  create = createSpy().and.returnValue(of(costCenter));
  update = createSpy().and.returnValue(of(costCenter));
  getBudgets = createSpy().and.returnValue(
    of({ values: [budget], pagination, sorts })
  );
  assignBudget = createSpy().and.returnValue(of(null));
  unassignBudget = createSpy().and.returnValue(of(null));
}

describe('CostCenter Effects', () => {
  let actions$: Observable<CostCenterActions.CostCenterAction>;
  let costCenterConnector: CostCenterConnector;
  let effects: fromEffects.CostCenterEffects;
  let expected: TestColdObservable;

  const mockCostCenterState = {
    details: {
      entities: {
        testLoadedCode: { loading: false, value: costCenter },
        testLoadingCode: { loading: true, value: null },
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ costCenter: () => mockCostCenterState }),
      ],
      providers: [
        { provide: CostCenterConnector, useClass: MockCostCenterConnector },
        { provide: OccConfig, useValue: defaultOccOrganizationConfig },
        fromEffects.CostCenterEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.get(
      fromEffects.CostCenterEffects as Type<fromEffects.CostCenterEffects>
    );
    costCenterConnector = TestBed.get(
      CostCenterConnector as Type<CostCenterConnector>
    );
    expected = null;
  });

  describe('loadCostCenter$', () => {
    it('should return LoadCostCenterSuccess action', () => {
      const action = new CostCenterActions.LoadCostCenter({
        userId,
        costCenterCode,
      });
      const completion = new CostCenterActions.LoadCostCenterSuccess([
        costCenter,
      ]);
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.get).toHaveBeenCalledWith(
        userId,
        costCenterCode
      );
    });

    it('should return LoadCostCenterFail action if costCenter not updated', () => {
      costCenterConnector.get = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.LoadCostCenter({
        userId,
        costCenterCode,
      });
      const completion = new CostCenterActions.LoadCostCenterFail({
        costCenterCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.get).toHaveBeenCalledWith(
        userId,
        costCenterCode
      );
    });
  });

  describe('loadCostCenters$', () => {
    const params: B2BSearchConfig = { sort: 'code' };

    it('should return LoadCostCenterSuccess action', () => {
      const action = new CostCenterActions.LoadCostCenters({ userId, params });
      const completion = new CostCenterActions.LoadCostCenterSuccess([
        costCenter,
      ]);
      const completion2 = new CostCenterActions.LoadCostCentersSuccess({
        page: { ids: [costCenterCode], pagination, sorts },
        params,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-(bc)', { b: completion, c: completion2 });

      expect(effects.loadCostCenters$).toBeObservable(expected);
      expect(costCenterConnector.getList).toHaveBeenCalledWith(userId, params);
    });

    it('should return LoadCostCentersFail action if costCenters not loaded', () => {
      costCenterConnector.getList = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.LoadCostCenters({ userId, params });
      const completion = new CostCenterActions.LoadCostCentersFail({
        error,
        params,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadCostCenters$).toBeObservable(expected);
      expect(costCenterConnector.getList).toHaveBeenCalledWith(userId, params);
    });
  });

  describe('createCostCenter$', () => {
    it('should return CreateCostCenterSuccess action', () => {
      const action = new CostCenterActions.CreateCostCenter({
        userId,
        costCenter,
      });
      const completion = new CostCenterActions.CreateCostCenterSuccess(
        costCenter
      );
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.createCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.create).toHaveBeenCalledWith(
        userId,
        costCenter
      );
    });

    it('should return CreateCostCenterFail action if costCenter not created', () => {
      costCenterConnector.create = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.CreateCostCenter({
        userId,
        costCenter,
      });
      const completion = new CostCenterActions.CreateCostCenterFail({
        costCenterCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.createCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.create).toHaveBeenCalledWith(
        userId,
        costCenter
      );
    });
  });

  describe('updateCostCenter$', () => {
    it('should return UpdateCostCenterSuccess action', () => {
      const action = new CostCenterActions.UpdateCostCenter({
        userId,
        costCenterCode,
        costCenter,
      });
      const completion = new CostCenterActions.UpdateCostCenterSuccess(
        costCenter
      );
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.updateCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.update).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        costCenter
      );
    });

    it('should return UpdateCostCenterFail action if costCenter not created', () => {
      costCenterConnector.update = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.UpdateCostCenter({
        userId,
        costCenterCode,
        costCenter,
      });
      const completion = new CostCenterActions.UpdateCostCenterFail({
        costCenterCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.updateCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.update).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        costCenter
      );
    });
  });

  describe('loadAssignedBudgets$', () => {
    const params: B2BSearchConfig = { sort: 'code' };

    it('should return LoadBudgetSuccess action', () => {
      const action = new CostCenterActions.LoadAssignedBudgets({
        userId,
        costCenterCode,
        params,
      });
      const completion = new BudgetActions.LoadBudgetSuccess([budget]);
      const completion2 = new CostCenterActions.LoadAssignedBudgetsSuccess({
        costCenterCode,
        page: { ids: [budgetCode], pagination, sorts },
        params,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-(bc)', { b: completion, c: completion2 });

      expect(effects.loadAssignedBudgets$).toBeObservable(expected);
      expect(costCenterConnector.getBudgets).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        params
      );
    });

    it('should return LoadAssignedBudgetsFail action if budgets not loaded', () => {
      costCenterConnector.getBudgets = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.LoadAssignedBudgets({
        userId,
        costCenterCode,
        params,
      });
      const completion = new CostCenterActions.LoadAssignedBudgetsFail({
        error,
        costCenterCode,
        params,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadAssignedBudgets$).toBeObservable(expected);
      expect(costCenterConnector.getBudgets).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        params
      );
    });
  });

  describe('assignBudgetToCostCenter$', () => {
    it('should return UpdateCostCenterSuccess action', () => {
      const action = new CostCenterActions.AssignBudget({
        userId,
        costCenterCode,
        budgetCode,
      });
      const completion = new CostCenterActions.AssignBudgetSuccess({
        code: budgetCode,
        selected: true,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.assignBudgetToCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.assignBudget).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        budgetCode
      );
    });

    it('should return UpdateCostCenterFail action if budget not assigned', () => {
      costCenterConnector.assignBudget = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.AssignBudget({
        userId,
        costCenterCode,
        budgetCode,
      });
      const completion = new CostCenterActions.AssignBudgetFail({
        budgetCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.assignBudgetToCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.assignBudget).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        budgetCode
      );
    });
  });
  describe('unassignBudgetToCostCenter$', () => {
    it('should return UnassignBudgetSuccess action', () => {
      const action = new CostCenterActions.UnassignBudget({
        userId,
        costCenterCode,
        budgetCode,
      });
      const completion = new CostCenterActions.UnassignBudgetSuccess({
        code: budgetCode,
        selected: false,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.unassignBudgetToCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.unassignBudget).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        budgetCode
      );
    });

    it('should return UnassignBudgetFail action if budget not unassigned', () => {
      costCenterConnector.unassignBudget = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new CostCenterActions.UnassignBudget({
        userId,
        costCenterCode,
        budgetCode,
      });
      const completion = new CostCenterActions.UnassignBudgetFail({
        budgetCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.unassignBudgetToCostCenter$).toBeObservable(expected);
      expect(costCenterConnector.unassignBudget).toHaveBeenCalledWith(
        userId,
        costCenterCode,
        budgetCode
      );
    });
  });
});
