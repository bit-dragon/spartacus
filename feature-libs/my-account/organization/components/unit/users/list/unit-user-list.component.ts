import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Table } from '@spartacus/storefront';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { UnitRoleType } from '../../../shared/organization.model';
import { CurrentUnitService } from '../../current-unit.service';
import { UnitUsersService } from './unit-users.service';

@Component({
  selector: 'cx-unit-user-list',
  templateUrl: './unit-user-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitUserListComponent {
  code$ = this.currentUnitService.key$;

  dataTable$: Observable<Table> = this.code$.pipe(
    switchMap((code) =>
      this.unitUsersService.getTable(code, UnitRoleType.CUSTOMER)
    )
  );

  constructor(
    protected unitUsersService: UnitUsersService,
    protected currentUnitService: CurrentUnitService
  ) {}
}
