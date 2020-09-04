import { Injectable } from '@angular/core';
import { CostCenter, Converter, Occ } from '@spartacus/core';

@Injectable()
export class OccCostCenterNormalizer
  implements Converter<Occ.CostCenter, CostCenter> {
  convert(source: Occ.CostCenter, target?: CostCenter): CostCenter {
    if (target === undefined) {
      target = {
        ...(source as any),
        active: this.normalizeBoolean(source.active),
      };
    }
    return target;
  }

  /**
   * Returns the boolean value for a string property that is supposed
   * to be of type boolean.
   */
  protected normalizeBoolean(property: string | boolean): boolean {
    return typeof property === 'string' ? property === 'true' : property;
  }
}
