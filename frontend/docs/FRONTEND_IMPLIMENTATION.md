IMPLEMENTATION_ALGORITHM.md

The implementation journey for turning the real business operation into a working system.

The implementation follows the order reality unfolds.
Each transition is an explicit implementation step.
Nothing is considered complete merely because a feature exists in isolation.

1. Establish the Business

Build the Business foundation.

The system must establish:

Business exists
↓
Business information exists
↓
Business becomes the owner of everything that follows

Transition: The system now has an ownership foundation on which the rest of the business can be built.

2. Establish Branches

Build the branches belonging to the Business.

Business
↓
Branches exist
↓
Each branch becomes an operational location

Transition: The system can now represent where business operations physically happen.

3. Establish People

Build the people who operate the business.

Business
↓
Owner exists
↓
Workers exist
↓
Workers belong to the Business
↓
Workers are associated with operational locations

Transition: The system now represents who manages the business and who performs its daily operations.

4. Establish Products

Build the products the business handles.

Products
↓
Product units
↓
Product costs
↓
Products become usable operational items

Transition: The system now understands what the business buys, stores, moves, and sells.

5. Establish Physical Stock Reality

Build the representation of where stock physically exists.

Branch
↓
Stock locations
↓
Inventory items
↓
Current stock becomes visible

Transition: The system can now represent the physical stock reality at each operational location.

6. Establish Stock History

Build the record of stock changing over time.

Stock exists
↓
Stock is added
↓
Stock is reduced
↓
Stock is moved
↓
Every movement is recorded

Transition: The system no longer only knows what stock exists; it knows how that stock got there.

7. Build Opening Shift

Build the beginning of the real working day.

Worker starts shift
↓
System presents opening stock
↓
Worker goes to the real counter
↓
Worker counts actual stock

Transition: The system's opening state is now compared against physical reality.

8. Verify Opening Stock

Build the opening verification process.

System opening stock
↓
Worker counts real stock
↓
Compare
↓
Matches?
┌──────┴──────┐
Yes No
↓ ↓
Verified Report inconsistency
\ /
↓ ↓
Worker proceeds

The worker must explicitly establish one of two states:

Verified

or

Inconsistency reported

Transition: The worker begins the shift from a known and explicitly acknowledged opening reality.

9. Transition Into Active Shift

The worker begins operating from the verified/current counter reality.

Opening state established
↓
Worker starts operating
↓
Shift becomes active

This transition must never be skipped.

The system must clearly distinguish:

Opening
→ Active 10. Run the Shift

Build the operational period in which business activity occurs.

During the active shift:

Worker operates
│
├── Stock changes
├── Payments occur
├── Expenses occur
├── Transfers occur
└── Operational records accumulate

The worker's primary responsibility is:

Record what actually happens.

The system's responsibility is to maintain the resulting business state.

11. Record Stock Operations

During the active shift, allow real stock changes to become system records.

Real stock operation
↓
Worker records it
↓
System records movement
↓
Inventory state changes

Possible operations include:

Stock added
Stock reduced
Stock transferred
Other permitted stock movements

Transition: Physical stock activity becomes traceable system history.

12. Record Payments

During the active shift:

Customer payment
↓
Cash and/or Mpesa
↓
Worker records operational data
↓
System maintains payment records

Mpesa activity may come through:

Mpesa Playbill
Pochi la Biashara
Send Money
Buy Goods and Services

Transition: Physical/financial payment activity becomes system-recorded financial reality.

13. Record Expenses

If an expense occurs during the shift:

Real expense
↓
Worker records expense
↓
System stores expense
↓
Expense becomes part of shift/business records

Transition: Money leaving the business becomes part of the recorded operational reality.

14. Handle Transfers

When stock moves between locations:

Transfer required
↓
Source records transfer
↓
Stock leaves source
↓
Receiving side confirms
↓
Stock arrives at destination
↓
Transfer becomes complete

The system must preserve the history of the movement.

Transition: Stock movement between locations becomes a shared, traceable reality rather than a verbal event.

15. Maintain the Active Shift State

Throughout the shift:

Stock
Payments
Expenses
Transfers
Other operations
↓
Continuous operational record
↓
Current shift state

The system continuously accumulates the information required to understand what happened during the shift.

16. Transition Into Closing

When work ends:

Active shift
↓
Worker stops normal operations
↓
Worker prepares to close
↓
Closing state begins

This transition must be explicit.

The system must distinguish:

Active
→ Closing 17. Establish Closing Stock

Build the end-of-shift physical verification.

System expected closing state
↓
Worker counts real remaining stock
↓
Worker records closing stock
↓
System compares expected vs actual

Any inconsistency becomes visible.

Transition: The system now knows the difference between what should remain and what physically remains.

18. Complete Shift Reconciliation

Bring together everything that happened during the shift.

Opening state

- Stock operations
- Transfers
- Payments
- Expenses
- Closing state
  ↓
  Reconciliation
  ↓
  Expected reality vs recorded reality

Discrepancies are identified and recorded.

19. Close the Shift

Once the closing process is complete:

Closing reconciliation
↓
Shift ends
↓
Shift becomes historical record

The system preserves what happened during that operational period.

Transition:

Closing
→ Closed 20. Calculate the Result

After the shift is closed, the system automatically derives the financial result.

Recorded operations
↓
Revenue
↓
Expenses
↓
Product costs
↓
Profit / Loss

The worker does not manually perform the calculations.

System responsibility:

Calculate from recorded reality.

21. Surface Discrepancies

When recorded reality does not match expected reality:

Expected
↓
Actual
↓
Difference
↓
Discrepancy

The system records the discrepancy and makes it visible to the appropriate person.

22. Transfer Information to the Owner

The Owner must be able to understand what happened without physically meeting the Worker.

Worker operates
↓
System records operations
↓
System calculates results
↓
System identifies discrepancies
↓
Owner receives business information

The Owner can then review:

Shift results
Stock
Payments
Expenses
Transfers
Discrepancies
Profit/Loss
Reports
Analytics 23. Owner Manages the Business

The Owner operates the management side of the system.

Business information
↓
Operational information
↓
Financial information
↓
Discrepancies
↓
Reports / Analytics
↓
Owner decisions

The Owner can manage the system while Workers perform the operational work.

24. Continuous Business Operation

The system must support the repeated operational cycle:

OPENING
↓
VERIFY
↓
ACTIVE SHIFT
↓
OPERATE
↓
CLOSING
↓
RECONCILE
↓
CLOSE
↓
RESULTS
↓
OWNER INFORMATION
↓
NEXT SHIFT
↓
OPENING

This is the central recurring loop of the system.

25. Full-System Completion

The system is complete when the business can operate through this cycle without requiring the Owner and Worker to constantly meet physically.

Worker
↓
Records reality

System
↓
Maintains records
↓
Maintains business state
↓
Performs calculations
↓
Identifies discrepancies
↓
Produces information

Owner
↓
Receives information
↓
Understands business state
↓
Manages business
Final Reality

The software should allow:

The Worker to operate the business by recording what happens, while the system automatically maintains the records, calculations, accountability, and information required by the Owner.

The implementation is considered complete when this entire reality can unfold reliably inside the system.

IMPLEMENTATION-DOCS
BUSINESS_DESIGN_ARCHITECTURE.md
BRANCH_DESIGN_ARCHITECTURE.md
USERS_DESIGN_ARCHITECTURE.md
PRODUCTS_DESIGN_ARCHITECTURE.md
PRODUCT-UNITS_DESIGN_ARCHITECTURE.md
PRODUCT-COST-HISTORY_DESIGN_ARCHITECTURE.md
STOCK-LOCATION_DESIGN_ARCHITECTURE.md
INVENTORY-ITEM_DESIGN_ARCHITECTURE.md
STOCK-MOVEMENT_DESIGN_ARCHITECTURE.md
SHIFT_DESIGN_ARCHITECTURE.md
SHIFT-STOCK-ITEM_DESIGN_ARCHITECTURE.md
MPESA-ACCOUNT_DESIGN_ARCHITECTURE.md
MPESA-TRANSACTION_DESIGN_ARCHITECTURE.md
EXPENSE_DESIGN_ARCHITECTURE.md
TRANSFER_DESIGN_ARCHITECTURE.md
SHIFT-PAYMENT-SUMMARY_DESIGN_ARCHITECTURE.md
DISCREPANCY_DESIGN_ARCHITECTURE.md
REPORTS_DESIGN_ARCHITECTURE.md
ANALYTICS_DESIGN_ARCHITECTURE.md
AUTH_DESIGN_ARCHITECTURE.md
FRONTEND_DESIGN_ARCHITECTURE.md
INTEGRATION_DESIGN_ARCHITECTURE.md
TESTING_DESIGN_ARCHITECTURE.md
DEPLOYMENT_DESIGN_ARCHITECTURE.md
