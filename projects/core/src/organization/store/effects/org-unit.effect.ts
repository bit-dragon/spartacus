import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  B2BApprovalProcess,
  B2BUnitNode,
  B2BUser,
} from '../../../model/org-unit.model';
import { EntitiesModel } from '../../../model/misc.model';
import { makeErrorSerializable } from '../../../util/serialization-utils';
import { OrgUnitConnector } from '../../connectors/org-unit/org-unit.connector';
import { B2BUserActions, OrgUnitActions } from '../actions/index';
import { normalizeListPage } from '../../utils/serializer';

@Injectable()
export class OrgUnitEffects {
  @Effect()
  loadOrgUnit$: Observable<
    OrgUnitActions.LoadOrgUnitSuccess | OrgUnitActions.LoadOrgUnitFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.LOAD_ORG_UNIT),
    map((action: OrgUnitActions.LoadOrgUnit) => action.payload),
    switchMap(({ userId, orgUnitId }) => {
      return this.orgUnitConnector.get(userId, orgUnitId).pipe(
        map(
          (orgUnit: B2BUnitNode) =>
            new OrgUnitActions.LoadOrgUnitSuccess([orgUnit])
        ),
        catchError(error =>
          of(
            new OrgUnitActions.LoadOrgUnitFail({
              orgUnitId,
              error: makeErrorSerializable(error),
            })
          )
        )
      );
    })
  );

  @Effect()
  loadAvailableOrgUnits$: Observable<
    OrgUnitActions.LoadOrgUnitNodesSuccess | OrgUnitActions.LoadOrgUnitNodesFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.LOAD_UNIT_NODES),
    map((action: OrgUnitActions.LoadOrgUnitNodes) => action.payload),
    switchMap(payload =>
      this.orgUnitConnector.getList(payload.userId).pipe(
        map(
          (orgUnitsList: B2BUnitNode[]) =>
            new OrgUnitActions.LoadOrgUnitNodesSuccess(orgUnitsList)
        ),
        catchError(error =>
          of(
            new OrgUnitActions.LoadOrgUnitNodesFail({
              error: makeErrorSerializable(error),
            })
          )
        )
      )
    )
  );

  @Effect()
  createUnit$: Observable<
    OrgUnitActions.CreateUnitSuccess | OrgUnitActions.CreateUnitFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.CREATE_ORG_UNIT),
    map((action: OrgUnitActions.CreateUnit) => action.payload),
    switchMap(payload =>
      this.orgUnitConnector.create(payload.userId, payload.unit).pipe(
        map(data => new OrgUnitActions.CreateUnitSuccess(data)),
        catchError(error =>
          of(
            new OrgUnitActions.CreateUnitFail({
              unitCode: payload.unit.uid,
              error: makeErrorSerializable(error),
            })
          )
        )
      )
    )
  );

  @Effect()
  updateUnit$: Observable<
    OrgUnitActions.UpdateUnitSuccess | OrgUnitActions.UpdateUnitFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.UPDATE_ORG_UNIT),
    map((action: OrgUnitActions.UpdateUnit) => action.payload),
    switchMap(payload =>
      this.orgUnitConnector
        .update(payload.userId, payload.unitCode, payload.unit)
        .pipe(
          map(data => new OrgUnitActions.UpdateUnitSuccess(data)),
          catchError(error =>
            of(
              new OrgUnitActions.UpdateUnitFail({
                unitCode: payload.unit.uid,
                error: makeErrorSerializable(error),
              })
            )
          )
        )
    )
  );

  @Effect()
  loadTree$: Observable<
    OrgUnitActions.LoadTreeSuccess | OrgUnitActions.LoadTreeFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.LOAD_UNIT_TREE),
    map((action: OrgUnitActions.LoadOrgUnit) => action.payload),
    switchMap(({ userId }) => {
      return this.orgUnitConnector.getTree(userId).pipe(
        map(
          (orgUnit: B2BUnitNode) => new OrgUnitActions.LoadTreeSuccess(orgUnit)
        ),
        catchError(error =>
          of(
            new OrgUnitActions.LoadTreeFail({
              error: makeErrorSerializable(error),
            })
          )
        )
      );
    })
  );

  @Effect()
  loadApprovalProcesses$: Observable<
    | OrgUnitActions.LoadApprovalProcessesSuccess
    | OrgUnitActions.LoadApprovalProcessesFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.LOAD_APPROVAL_PROCESSES),
    map((action: OrgUnitActions.LoadOrgUnit) => action.payload),
    switchMap(({ userId }) => {
      return this.orgUnitConnector.getApprovalProcesses(userId).pipe(
        map(
          (approvalProcesses: B2BApprovalProcess[]) =>
            new OrgUnitActions.LoadApprovalProcessesSuccess(approvalProcesses)
        ),
        catchError(error =>
          of(
            new OrgUnitActions.LoadApprovalProcessesFail({
              error: makeErrorSerializable(error),
            })
          )
        )
      );
    })
  );

  @Effect()
  loadUsers$: Observable<
    | OrgUnitActions.LoadAssignedUsersSuccess
    | OrgUnitActions.LoadAssignedUsersFail
    | B2BUserActions.LoadB2BUserSuccess
  > = this.actions$.pipe(
    ofType(OrgUnitActions.LOAD_ASSIGNED_USERS),
    map((action: OrgUnitActions.LoadAssignedUsers) => action.payload),
    switchMap(({ userId, orgUnitId, roleId, params }) => {
      return this.orgUnitConnector
        .getUsers(userId, orgUnitId, roleId, params)
        .pipe(
          switchMap((users: EntitiesModel<B2BUser>) => {
            const { values, page } = normalizeListPage(users, 'uid');
            return [
              new B2BUserActions.LoadB2BUserSuccess(values),
              new OrgUnitActions.LoadAssignedUsersSuccess({
                orgUnitId,
                roleId,
                page,
                params,
              }),
            ];
          }),
          catchError(error =>
            of(
              new OrgUnitActions.LoadAssignedUsersFail({
                orgUnitId,
                roleId,
                params,
                error: makeErrorSerializable(error),
              })
            )
          )
        );
    })
  );

  @Effect()
  assignRoleToUser: Observable<
    OrgUnitActions.AssignRoleSuccess | OrgUnitActions.AssignRoleFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.ASSIGN_ROLE),
    map((action: OrgUnitActions.AssignRole) => action.payload),
    switchMap(({ userId, orgUnitId, orgCustomerId, roleId }) =>
      this.orgUnitConnector
        .assignRole(userId, orgUnitId, orgCustomerId, roleId)
        .pipe(
          map(
            () =>
              new OrgUnitActions.AssignRoleSuccess({
                uid: orgCustomerId,
                roleId,
                selected: true,
              })
          ),
          catchError(error =>
            of(
              new OrgUnitActions.AssignRoleFail({
                orgCustomerId,
                error: makeErrorSerializable(error),
              })
            )
          )
        )
    )
  );

  @Effect()
  unassignRoleToUser$: Observable<
    OrgUnitActions.UnassignRoleSuccess | OrgUnitActions.UnassignRoleFail
  > = this.actions$.pipe(
    ofType(OrgUnitActions.UNASSIGN_ROLE),
    map((action: OrgUnitActions.UnassignRole) => action.payload),
    switchMap(({ userId, orgUnitId, orgCustomerId, roleId }) =>
      this.orgUnitConnector
        .unassignRole(userId, orgUnitId, orgCustomerId, roleId)
        .pipe(
          map(
            () =>
              new OrgUnitActions.UnassignRoleSuccess({
                uid: orgCustomerId,
                roleId,
                selected: false,
              })
          ),
          catchError(error =>
            of(
              new OrgUnitActions.UnassignRoleFail({
                orgCustomerId,
                error: makeErrorSerializable(error),
              })
            )
          )
        )
    )
  );

  constructor(
    private actions$: Actions,
    private orgUnitConnector: OrgUnitConnector
  ) {}
}
