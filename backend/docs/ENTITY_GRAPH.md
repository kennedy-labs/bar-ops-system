Purpose: High-level map of the domain entities and their relationships. This document provides navigation only. Detailed behavior belongs in the individual module architecture documents.

Business
├── Branch
│ ├── Shift
│ │ ├── ShiftStockItem
│ │ ├── Expense
│ │ ├── ShiftPaymentSummary
│ │ └── Discrepancy
│ │
│ ├── StockLocation
│ │ ├── InventoryItem
│ │ └── StockMovement
│ │
│ ├── Transfer
│ │ └── TransferItem
│ │
│ └── MpesaAccount
│ └── MpesaTransaction
│
├── User
│ ├── Shift
│ ├── Expense
│ └── Transfer
│
├── Product
│ ├── ProductUnit
│ ├── ProductCostHistory
│ ├── InventoryItem
│ ├── ShiftStockItem
│ ├── TransferItem
│ └── StockMovement
│
└── Reports
