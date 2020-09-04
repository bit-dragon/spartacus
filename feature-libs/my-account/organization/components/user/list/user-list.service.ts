import { Injectable } from '@angular/core';
import { B2BUser, EntitiesModel } from '@spartacus/core';
import { TableService, TableStructure } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseOrganizationListService } from '../../shared/base-organization-list.service';
import { OrganizationTableType } from '../../shared/organization.model';
import { B2BUserService } from '@spartacus/my-account/organization/core';

/**
 * The UI model for the cost center, which is a slightly flattened version
 * of the core cost center model.
 */
export interface UserModel {
  uid?: string;
  name?: string;
  orgUnit?: any;
}

/**
 * Service to populate Cost Center data to `Table` data. The cost center
 * data is driven by the table configuration, using the `OrganizationTables.COST_CENTER`.
 */
@Injectable({
  providedIn: 'root',
})
export class UserListService extends BaseOrganizationListService<UserModel> {
  protected tableType = OrganizationTableType.USER;

  constructor(
    protected tableService: TableService,
    protected userService: B2BUserService
  ) {
    super(tableService);
  }

  protected load(
    structure: TableStructure,
    _params?
  ): Observable<EntitiesModel<UserModel>> {
    const paginationConfig = structure.pagination;
    return this.userService
      .getList(paginationConfig)
      .pipe(map((raw) => this.convertUsers(raw)));
  }

  /**
   * Populates the cost center data to a convenient table data model, so that we
   * can skip specific conversion in the view logic where possible.
   */
  protected convertUsers({
    pagination,
    sorts,
    values,
  }: EntitiesModel<B2BUser>): EntitiesModel<UserModel> {
    const userModels: EntitiesModel<UserModel> = {
      pagination,
      sorts,
      values: values.map((value: any) => ({
        ...value,
      })),
    };
    return userModels;
  }
}
