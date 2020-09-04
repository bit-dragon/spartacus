import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { StoreModule } from '@ngrx/store';
import { Observable, of, throwError } from 'rxjs';
import { cold, hot } from 'jasmine-marbles';
import { TestColdObservable } from 'jasmine-marbles/src/test-observables';

import { normalizeHttpError, OccConfig } from '@spartacus/core';
import { BudgetActions } from '../actions/index';
import * as fromEffects from './budget.effect';
import {
  B2BSearchConfig,
  Budget,
  BudgetConnector,
} from '@spartacus/my-account/organization/core';
import { defaultOccOrganizationConfig } from '@spartacus/my-account/organization/occ';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import createSpy = jasmine.createSpy;

const httpErrorResponse = new HttpErrorResponse({
  error: 'error',
  headers: new HttpHeaders().set('xxx', 'xxx'),
  status: 500,
  statusText: 'Unknown error',
  url: '/xxx',
});
const error = normalizeHttpError(httpErrorResponse);
const budgetCode = 'testCode';
const userId = 'testUser';
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

class MockBudgetConnector {
  get = createSpy().and.returnValue(of(budget));
  getList = createSpy().and.returnValue(
    of({ values: [budget], pagination, sorts })
  );
  create = createSpy().and.returnValue(of(budget));
  update = createSpy().and.returnValue(of(budget));
}

describe('Budget Effects', () => {
  let actions$: Observable<BudgetActions.BudgetAction>;
  let budgetConnector: BudgetConnector;
  let effects: fromEffects.BudgetEffects;
  let expected: TestColdObservable;

  const mockBudgetState = {
    details: {
      entities: {
        testLoadedCode: { loading: false, value: budget },
        testLoadingCode: { loading: true, value: null },
      },
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        StoreModule.forRoot({ budget: () => mockBudgetState }),
      ],
      providers: [
        { provide: BudgetConnector, useClass: MockBudgetConnector },
        { provide: OccConfig, useValue: defaultOccOrganizationConfig },
        fromEffects.BudgetEffects,
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.get(
      fromEffects.BudgetEffects as Type<fromEffects.BudgetEffects>
    );
    budgetConnector = TestBed.get(BudgetConnector as Type<BudgetConnector>);
    expected = null;
  });

  describe('loadBudget$', () => {
    it('should return LoadBudgetSuccess action', () => {
      const action = new BudgetActions.LoadBudget({ userId, budgetCode });
      const completion = new BudgetActions.LoadBudgetSuccess([budget]);
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadBudget$).toBeObservable(expected);
      expect(budgetConnector.get).toHaveBeenCalledWith(userId, budgetCode);
    });

    it('should return LoadBudgetFail action if budget not updated', () => {
      budgetConnector.get = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new BudgetActions.LoadBudget({ userId, budgetCode });
      const completion = new BudgetActions.LoadBudgetFail({
        budgetCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadBudget$).toBeObservable(expected);
      expect(budgetConnector.get).toHaveBeenCalledWith(userId, budgetCode);
    });
  });

  describe('loadBudgets$', () => {
    const params: B2BSearchConfig = { sort: 'code' };

    it('should return LoadBudgetSuccess action', () => {
      const action = new BudgetActions.LoadBudgets({ userId, params });
      const completion = new BudgetActions.LoadBudgetSuccess([budget]);
      const completion2 = new BudgetActions.LoadBudgetsSuccess({
        page: { ids: [budgetCode], pagination, sorts },
        params,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-(bc)', { b: completion, c: completion2 });

      expect(effects.loadBudgets$).toBeObservable(expected);
      expect(budgetConnector.getList).toHaveBeenCalledWith(userId, params);
    });

    it('should return LoadBudgetsFail action if budgets not loaded', () => {
      budgetConnector.getList = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new BudgetActions.LoadBudgets({ userId, params });
      const completion = new BudgetActions.LoadBudgetsFail({ error, params });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.loadBudgets$).toBeObservable(expected);
      expect(budgetConnector.getList).toHaveBeenCalledWith(userId, params);
    });
  });

  describe('createBudget$', () => {
    it('should return CreateBudgetSuccess action', () => {
      const action = new BudgetActions.CreateBudget({ userId, budget });
      const completion = new BudgetActions.CreateBudgetSuccess(budget);
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.createBudget$).toBeObservable(expected);
      expect(budgetConnector.create).toHaveBeenCalledWith(userId, budget);
    });

    it('should return CreateBudgetFail action if budget not created', () => {
      budgetConnector.create = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new BudgetActions.CreateBudget({ userId, budget });
      const completion = new BudgetActions.CreateBudgetFail({
        budgetCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.createBudget$).toBeObservable(expected);
      expect(budgetConnector.create).toHaveBeenCalledWith(userId, budget);
    });
  });

  describe('updateBudget$', () => {
    it('should return UpdateBudgetSuccess action', () => {
      const action = new BudgetActions.UpdateBudget({
        userId,
        budgetCode,
        budget,
      });
      const completion = new BudgetActions.UpdateBudgetSuccess(budget);
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.updateBudget$).toBeObservable(expected);
      expect(budgetConnector.update).toHaveBeenCalledWith(
        userId,
        budgetCode,
        budget
      );
    });

    it('should return UpdateBudgetFail action if budget not created', () => {
      budgetConnector.update = createSpy().and.returnValue(
        throwError(httpErrorResponse)
      );
      const action = new BudgetActions.UpdateBudget({
        userId,
        budgetCode,
        budget,
      });
      const completion = new BudgetActions.UpdateBudgetFail({
        budgetCode,
        error,
      });
      actions$ = hot('-a', { a: action });
      expected = cold('-b', { b: completion });

      expect(effects.updateBudget$).toBeObservable(expected);
      expect(budgetConnector.update).toHaveBeenCalledWith(
        userId,
        budgetCode,
        budget
      );
    });
  });
});
