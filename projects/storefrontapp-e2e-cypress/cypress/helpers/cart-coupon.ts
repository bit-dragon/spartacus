import { user } from '../sample-data/checkout-flow';
import { waitForPage } from './checkout-flow';

export const productCode1 = '300938';
export const couponCode1 = 'CouponForCart';
export const productCode2 = '493683';
export const couponCode2 = 'CouponForProduct';
export const productCode3 = '1986316';
export const couponCode3 = 'FreeGiftCoupon';
export const giftProductCode = '443175';

export const productCode4 = '1934793';
export const myCouponCode1 = 'springfestival';
export const myCouponCode2 = 'midautumn';

export function addProductToCart(productCode: string) {
  cy.get('cx-searchbox input')
    .clear()
    .type(`${productCode}{enter}{enter}`, { force: true });

  cy.get('cx-add-to-cart')
    .getAllByText(/Add To Cart/i)
    .first()
    .click();

  const waitForCart: string = waitForPage('/cart', 'waitForCart');
  cy.get('cx-added-to-cart-dialog').within(() => {
    cy.get('div.cx-dialog-item.col-sm-12.col-md-6').click();
    cy.get('.cx-code').should('contain', productCode);
    cy.getByText(/view cart/i).click();
  });
  cy.wait(`@${waitForCart}`);
}

export function verifyEmptyCoupons() {
  cy.get('.cx-customer-coupons').should('not.exist');
}

export function verifyMyCoupons() {
  cy.get('.cx-customer-coupons .coupon-id').should('have.length', 2);
  cy.get('.cx-customer-coupons .coupon-id').should('contain', myCouponCode1);
  cy.get('.cx-customer-coupons .coupon-id').should('contain', myCouponCode2);
}

export function filterAndApplyMyCoupons(
  filterCode: string,
  couponCode: string
) {
  cy.get('#applyVoucher').type(filterCode);
  cy.get('.cx-customer-coupons .coupon-id').should('have.length', 1);
  cy.get('.cx-customer-coupons .coupon-id').should('contain', couponCode);
  cy.get('.cx-customer-coupons a').click({ force: true });
  cy.get('cx-global-message').should(
    'contain',
    `${couponCode} has been applied`
  );
  getCouponItemFromCart(couponCode).should('exist');
  cy.get('.cx-customer-coupons .coupon-id').should('not.contain', couponCode);
  verifyMyCouponsAfterApply(couponCode);
}

export function verifyMyCouponsAfterApply(couponCode: string) {
  navigateToCheckoutPage();
  navigateToCartPage();
  getCouponItemFromCart(couponCode).should('exist');
  cy.get('.cx-customer-coupons .coupon-id').should('not.contain', couponCode);
}

export function claimCoupon(couponCode: string) {
  cy.request({
    method: 'POST',
    url: `${Cypress.env(
      'API_URL'
    )}/rest/v2/electronics-spa/users/current/customercoupons/${couponCode}/claim`,
    headers: {
      Authorization: `bearer ${
        JSON.parse(localStorage.getItem('spartacus-local-data')).auth.userToken
          .token.access_token
      }`,
    },
  }).then(response => {
    expect(response.status).to.eq(201);
  });
}

export function applyMyCouponAsAnonymous(couponCode: string) {
  addProductToCart(productCode4);
  cy.get('#applyVoucher').type(couponCode);
  cy.get('.col-md-4 > .btn').click();
  getCouponItemFromCart(couponCode).should('not.exist');
  cy.get('cx-global-message .alert').should('exist');
}

export function applyCoupon(couponCode: string) {
  cy.get('#applyVoucher').type(couponCode);
  cy.get('.col-md-4 > .btn').click();
  cy.get('cx-global-message').should(
    'contain',
    `${couponCode} has been applied`
  );
}

export function removeCoupon(couponCode: string) {
  cy.get('.cx-coupon-apply > .close').click();
  getCouponItemFromCart(couponCode).should('not.exist');
  getCouponItemOrderSummary(couponCode).should('not.exist');
}

export function applyWrongCoupon() {
  cy.get('#applyVoucher').type('error');
  cy.get('.col-md-4 > .btn').click();
  cy.get('cx-global-message').should('contain', 'coupon.invalid.code.provided');
}

export function placeOrder(stateAuth: any) {
  return cy
    .get('.cx-total')
    .first()
    .then($cart => {
      const cartId = $cart.text().match(/[0-9]+/)[0];
      cy.requireShippingAddressAdded(user.address, stateAuth);
      cy.requireShippingMethodSelected(stateAuth);
      cy.requirePaymentDone(stateAuth);
      return cy.requirePlacedOrder(stateAuth, cartId);
    });
}
export function verifyOrderHistory(
  orderData: any,
  couponCode?: string,
  totalPrice?: string,
  savedPrice?: string
) {
  navigateToOrderHistoryPage(orderData);
  if (couponCode) {
    verifyCouponInOrderHistory(couponCode, totalPrice, savedPrice);
  } else {
    verifyNoCouponInOrderHistory();
  }
}
export function verifyCouponAndPromotion(
  couponCode: string,
  totalPrice: string,
  savedPrice: string
) {
  //verify coupon in cart
  getCouponItemFromCart(couponCode).should('exist');
  //verify promotion
  cy.get('.cx-promotions > :nth-child(1)').should('exist');
  //verify price
  cy.get('.cx-summary-partials').within(() => {
    cy.get('.cx-summary-amount').should('contain', totalPrice);
    cy.get(':nth-child(5)').should('contain', `You saved: ${savedPrice}`);
  });
}

export function verifyCouponAndSavedPrice(
  couponCode: string,
  savedPrice: string
) {
  //verify coupon in cart
  getCouponItemFromCart(couponCode).should('exist');

  //verify saved price
  cy.get('.cx-summary-partials').within(() => {
    cy.get('.cx-summary-row').contains(`You saved: ${savedPrice}`);
  });
}

export function verifyCouponAndSavedPriceInOrder(
  couponCode: string,
  savedPrice: string
) {
  //verify coupon in order
  getCouponItemOrderSummary(couponCode).should('exist');

  //verify saved price
  cy.get('.cx-summary-partials').within(() => {
    cy.get('.cx-summary-row').contains(`You saved: ${savedPrice}`);
  });
}

export function verifyOrderHistoryForCouponAndPrice(
  orderData: any,
  couponCode?: string,
  savedPrice?: string
) {
  navigateToOrderHistoryPage(orderData);
  if (couponCode) {
    verifyCouponAndSavedPriceInOrder(couponCode, savedPrice);
  } else {
    verifyNoCouponInOrderHistory();
  }
}

export function verifyGiftProductCoupon(productCode: string) {
  cy.get('cx-cart-item-list')
    .contains('cx-cart-item', productCode)
    .within(() => {
      cy.get('.cx-price > .cx-value').should('contain', '$0.00');
      cy.get(
        '.cx-quantity > .cx-value > .ng-untouched > .cx-counter-wrapper > .cx-counter > .cx-counter-value'
      ).should('contain', '1');
      cy.get('.cx-total > .cx-value').should('contain', '$0.00');
    });
}

export function verifyCouponInOrderHistory(
  couponCode: string,
  totalPrice: string,
  savedPrice: string
) {
  cy.wait(Cypress.env('ORDER_HISTORY_WAIT_TIME'));
  cy.get('cx-searchbox input').click({ force: true });
  getCouponItemOrderSummary(couponCode).should('exist');
  cy.get('.cx-summary-partials > .cx-summary-row').should('have.length', 5);
  cy.get('.cx-summary-partials').within(() => {
    cy.get('.cx-summary-amount').should('contain', totalPrice);
    cy.get(':nth-child(5)').should('contain', `You saved: ${savedPrice}`);
  });
}

export function verifyNoCouponInOrderHistory() {
  cy.get('cx-order-summary > cx-applied-coupons').should('not.exist');
  cy.get('.cx-summary-partials > .cx-summary-row').should('have.length', 4);
  cy.get('.cx-summary-partials').within(() => {
    cy.get(':nth-child(5)').should('not.contain', 'You saved');
  });
}

export function navigateToCheckoutPage() {
  cy.get('cx-cart-totals > .btn')
    .should('contain', 'Proceed to Checkout')
    .click();
}

export function navigateToCartPage() {
  cy.visit('cart');
}

export function navigateToOrderHistoryPage(orderData: any) {
  cy.visit('my-account/orders');
  cy.get('cx-order-history h3').should('contain', 'Order history');
  cy.get('.cx-order-history-code  ').within(() => {
    cy.get('.cx-order-history-value')
      .should('contain', orderData.body.code)
      .click();
  });
}

export function getCouponItemFromCart(couponCode: string) {
  return cy
    .get('cx-cart-coupon > cx-applied-coupons > .row')
    .contains('.cx-cart-coupon-code', couponCode);
}

export function getCouponItemOrderSummary(couponCode: string) {
  return cy
    .get('cx-order-summary cx-applied-coupons')
    .contains('.cx-applied-coupon-code', couponCode);
}

export function verifyOrderPlacingWithCouponAndCustomerCoupon() {
  const stateAuth = JSON.parse(localStorage.getItem('spartacus-local-data'))
    .auth;
  addProductToCart(productCode4);
  verifyEmptyCoupons();
  claimCoupon(myCouponCode1);
  claimCoupon(myCouponCode2);

  navigateToCartPage();
  verifyMyCoupons();
  filterAndApplyMyCoupons('autumn', myCouponCode2);
  applyCoupon(couponCode1);
  //don't verify the total price which easy to changed by sample data
  verifyCouponAndSavedPrice(myCouponCode2, '$30');

  placeOrder(stateAuth).then(orderData => {
    verifyOrderHistoryForCouponAndPrice(orderData, myCouponCode2, '$30');
  });
}

export function verifyCustomerCouponRemoving() {
  const stateAuth = JSON.parse(localStorage.getItem('spartacus-local-data'))
    .auth;
  claimCoupon(myCouponCode2);
  addProductToCart(productCode4);
  filterAndApplyMyCoupons('autumn', myCouponCode2);
  verifyCouponAndSavedPrice(myCouponCode2, '$20');

  navigateToCheckoutPage();
  navigateToCartPage();
  removeCoupon(myCouponCode2);

  placeOrder(stateAuth).then(orderData => {
    verifyOrderHistory(orderData);
  });
}
