import { inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { AuthService } from '../../auth/facade/auth.service';
import { PROCESS_FEATURE } from '../../process/store/process-state';
import * as fromProcessReducers from '../../process/store/reducers';
import { UserActions } from '../store/actions/index';
import * as fromStoreReducers from '../store/reducers/index';
import { StateWithUser, USER_FEATURE } from '../store/user-state';
import { UserCostCenterService } from './user-cost-center.service';
import { CostCenter, B2BAddress } from '../../model/org-unit.model';

const userId = 'testUserId';
class MockAuthService {
  userId;
  invokeWithUserId(cb) {
    cb(userId);
  }
}
describe('PaymentTypeService', () => {
  let service: UserCostCenterService;
  let store: Store<StateWithUser>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot({}),
        StoreModule.forFeature(USER_FEATURE, fromStoreReducers.getReducers()),
        StoreModule.forFeature(
          PROCESS_FEATURE,
          fromProcessReducers.getReducers()
        ),
      ],
      providers: [
        UserCostCenterService,
        { provide: AuthService, useClass: MockAuthService },
      ],
    });

    store = TestBed.inject(Store);
    spyOn(store, 'dispatch').and.callThrough();
    service = TestBed.inject(UserCostCenterService);
  });

  it('should UserCostCenterService is injected', inject(
    [UserCostCenterService],
    (costCenterService: UserCostCenterService) => {
      expect(costCenterService).toBeTruthy();
    }
  ));

  it('should be able to load the active Cost Centers', () => {
    service.loadActiveCostCenters();
    expect(store.dispatch).toHaveBeenCalledWith(
      new UserActions.LoadActiveCostCenters(userId)
    );
  });

  it('should be able to get the active Cost Centers if data exist', () => {
    store.dispatch(
      new UserActions.LoadActiveCostCentersSuccess([{ code: 'account' }])
    );

    let costCenters: CostCenter[];
    service.getActiveCostCenters().subscribe((data) => {
      costCenters = data;
    });
    expect(costCenters).toEqual([{ code: 'account' }]);
  });

  it('should be able to get the active Cost Centers after trigger data loading when they do not exist', () => {
    spyOn(service, 'loadActiveCostCenters').and.callThrough();

    let costCenter: CostCenter[];
    service
      .getActiveCostCenters()
      .subscribe((data) => {
        costCenter = data;
      })
      .unsubscribe();
    expect(costCenter).toEqual(undefined);
    expect(service.loadActiveCostCenters).toHaveBeenCalled();
  });

  it('should be able to get the unit addresses of the cost center', () => {
    store.dispatch(
      new UserActions.LoadActiveCostCentersSuccess([
        { code: 'account', unit: { addresses: [{ id: 'test-address' }] } },
      ])
    );

    let addresses: B2BAddress[];
    service
      .getCostCenterAddresses('account')
      .subscribe((data) => {
        addresses = data;
      })
      .unsubscribe();
    expect(addresses).toEqual([{ id: 'test-address' }]);
  });
});
