import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import {
  ConverterService,
  EntitiesModel,
  Occ,
  OccEndpointsService,
} from '@spartacus/core';
import {
  B2BSearchConfig,
  Budget,
  BUDGET_NORMALIZER,
  BudgetAdapter,
  BUDGETS_NORMALIZER,
} from '@spartacus/my-account/organization/core';

@Injectable()
export class OccBudgetAdapter implements BudgetAdapter {
  constructor(
    protected http: HttpClient,
    protected occEndpoints: OccEndpointsService,
    protected converter: ConverterService
  ) {}

  load(userId: string, budgetCode: string): Observable<Budget> {
    return this.http
      .get<Occ.Budget>(this.getBudgetEndpoint(userId, budgetCode))
      .pipe(this.converter.pipeable(BUDGET_NORMALIZER));
  }

  loadList(
    userId: string,
    params?: B2BSearchConfig
  ): Observable<EntitiesModel<Budget>> {
    return this.http
      .get<Occ.BudgetsList>(this.getBudgetsEndpoint(userId, params))
      .pipe(this.converter.pipeable(BUDGETS_NORMALIZER));
  }

  create(userId: string, budget: Budget): Observable<Budget> {
    return this.http
      .post<Occ.Budget>(this.getBudgetsEndpoint(userId), budget)
      .pipe(this.converter.pipeable(BUDGET_NORMALIZER));
  }

  update(
    userId: string,
    budgetCode: string,
    budget: Budget
  ): Observable<Budget> {
    return this.http
      .patch<Occ.Budget>(this.getBudgetEndpoint(userId, budgetCode), budget)
      .pipe(this.converter.pipeable(BUDGET_NORMALIZER));
  }

  protected getBudgetEndpoint(userId: string, budgetCode: string): string {
    return this.occEndpoints.getUrl('budget', { userId, budgetCode });
  }

  protected getBudgetsEndpoint(
    userId: string,
    params?: B2BSearchConfig
  ): string {
    return this.occEndpoints.getUrl('budgets', { userId }, params);
  }
}
