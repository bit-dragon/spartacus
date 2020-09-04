import { Type } from '@angular/core';
import { inject, TestBed } from '@angular/core/testing';
import { EntitiesModel, OccConfig, Occ, OrderApproval } from '@spartacus/core';
import { OccOrderApprovalListNormalizer } from './occ-order-approval-list-normalizer';

const MockOccModuleConfig: OccConfig = {
  backend: {
    occ: {
      baseUrl: '',
      prefix: '',
    },
  },
};

describe('OrderApprovalsListNormalizer', () => {
  let service: OccOrderApprovalListNormalizer;

  const orderApproval: Occ.OrderApproval = {
    code: 'testCode',
  };

  const orderApprovalsList: Occ.OrderApprovalsList = {
    orderApprovals: [orderApproval],
  };

  const targetOrderApproval: OrderApproval = {
    code: 'testCode',
  };

  const targetOrderApprovalsList: EntitiesModel<OrderApproval> = {
    values: [targetOrderApproval],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        OccOrderApprovalListNormalizer,
        { provide: OccConfig, useValue: MockOccModuleConfig },
      ],
    });

    service = TestBed.get(
      OccOrderApprovalListNormalizer as Type<OccOrderApprovalListNormalizer>
    );
  });

  it('should inject OccOrderApprovalListNormalizer', inject(
    [OccOrderApprovalListNormalizer],
    (orderApprovalsListNormalizer: OccOrderApprovalListNormalizer) => {
      expect(orderApprovalsListNormalizer).toBeTruthy();
    }
  ));

  it('should convert Order Approval list', () => {
    const result = service.convert(orderApprovalsList);
    expect(result.values).toEqual(targetOrderApprovalsList.values);
  });

  it('should convert Order Approval list with applied target', () => {
    const result = service.convert(
      orderApprovalsList,
      targetOrderApprovalsList
    );
    expect(result).toEqual(targetOrderApprovalsList);
  });
});
