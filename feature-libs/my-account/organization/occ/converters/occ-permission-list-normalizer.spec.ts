import { Type } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { EntitiesModel, OccConfig, Occ, Permission } from '@spartacus/core';
import { OccPermissionListNormalizer } from './occ-permission-list-normalizer';

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
    },
  },
};

describe('PermissionListNormalizer', () => {
  let service: OccPermissionListNormalizer;

  const permission: Occ.Permission = {
    code: 'testCode',
  };

  const permissionsList: Occ.PermissionsList = {
    orderApprovalPermissions: [permission],
  };

  const targetPermission: Permission = {
    code: 'testCode',
  };

  const targetPermissionsList: EntitiesModel<Permission> = {
    values: [targetPermission],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OccPermissionListNormalizer,
        { provide: OccConfig, useValue: MockOccModuleConfig },
      ],
    });

    service = TestBed.get(
      OccPermissionListNormalizer as Type<OccPermissionListNormalizer>
    );
  });

  it('should inject OccPermissionListNormalizer', inject(
    [OccPermissionListNormalizer],
    (permissionsListNormalizer: OccPermissionListNormalizer) => {
      expect(permissionsListNormalizer).toBeTruthy();
    }
  ));

  it('should convert permission list', () => {
    const result = service.convert(permissionsList);
    expect(result.values).toEqual(targetPermissionsList.values);
  });

  it('should convert permission list with applied target', () => {
    const result = service.convert(permissionsList, targetPermissionsList);
    expect(result).toEqual(targetPermissionsList);
  });
});
