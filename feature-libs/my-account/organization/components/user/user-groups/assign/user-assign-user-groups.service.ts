import { Injectable } from '@angular/core';
import { EntitiesModel } from '@spartacus/core';
import { TableService, TableStructure } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { BaseOrganizationListService } from '../../../shared/base-organization-list.service';
import { OrganizationTableType } from '../../../shared/organization.model';
import {
  B2BUserService,
  UserGroup,
} from '@spartacus/my-account/organization/core';

@Injectable({
  providedIn: 'root',
})
export class UserAssignUserGroupListService extends BaseOrganizationListService<
  UserGroup
> {
  protected tableType = OrganizationTableType.USER_ASSIGN_USER_GROUPS;

  constructor(
    protected tableService: TableService,
    protected userService: B2BUserService
  ) {
    super(tableService);
  }

  protected load(
    structure: TableStructure,
    code: string
  ): Observable<EntitiesModel<UserGroup>> {
    return this.userService.getUserGroups(code, structure.pagination);
  }

  toggleAssign(userCode: string, userGroupCode: string, assign = true) {
    if (assign) {
      this.userService.assignUserGroup(userCode, userGroupCode);
    } else {
      this.userService.unassignUserGroup(userCode, userGroupCode);
    }
  }
}
