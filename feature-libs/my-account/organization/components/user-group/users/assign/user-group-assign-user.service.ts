import { Injectable } from '@angular/core';
import { B2BUser, EntitiesModel } from '@spartacus/core';
import { TableService, TableStructure } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { BaseOrganizationListService } from '../../../shared/base-organization-list.service';
import { OrganizationTableType } from '../../../shared/organization.model';
import { UserGroupService } from '@spartacus/my-account/organization/core';

@Injectable({
  providedIn: 'root',
})
export class UserGroupAssignUserService extends BaseOrganizationListService<
  B2BUser
> {
  protected tableType = OrganizationTableType.USER_GROUP_ASSIGN_USERS;

  constructor(
    protected tableService: TableService,
    protected userGroupService: UserGroupService
  ) {
    super(tableService);
  }

  protected load(
    structure: TableStructure,
    code: string
  ): Observable<EntitiesModel<B2BUser>> {
    return this.userGroupService.getAvailableOrgCustomers(
      code,
      structure.pagination
    );
  }

  toggleAssign(userGroupCode: string, customerId: string, assign = true) {
    if (assign) {
      this.userGroupService.assignMember(userGroupCode, customerId);
    } else {
      this.userGroupService.unassignMember(userGroupCode, customerId);
    }
  }

  unassignAll(userGroupCode: string) {
    this.userGroupService.unassignAllMembers(userGroupCode);
  }
}
