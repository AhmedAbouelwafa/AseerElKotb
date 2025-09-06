export enum PaymentMethod {
  CASH_ON_DELIVERY = 'CASH_ON_DELIVERY',
  CREDIT_CARD = 'CREDIT_CARD',
  VODAFONE_CASH = 'VODAFONE_CASH'
}

export const PaymentMethodDisplayNames: Record<PaymentMethod, string> = {
  [PaymentMethod.CASH_ON_DELIVERY]: 'الدفع عند الاستلام',
  [PaymentMethod.CREDIT_CARD]: 'الدفع عبر الإنترنت',
  [PaymentMethod.VODAFONE_CASH]: 'فودافون كاش'
};