export type RootStackParamList = {
  Login: undefined;
  Suppliers: undefined;
  Conflicts: undefined;
  Supplier: { supplierId: string };
  AddCollection: { supplierId: string };
  AddPayment: { supplierId: string };
};
