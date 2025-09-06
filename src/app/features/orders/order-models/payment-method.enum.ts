export enum PaymentMethod {
  CashOnDelivery = 1,
  Card = 2,
  Wallet = 3
}

export const PaymentMethodDisplayNames: Record<PaymentMethod, string> = {
  [PaymentMethod.CashOnDelivery]: 'الدفع عند الاستلام',
  [PaymentMethod.Card]: 'الدفع عبر الإنترنت',
  [PaymentMethod.Wallet]: 'فودافون كاش'
};