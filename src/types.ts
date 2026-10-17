export type UserRole =
  | 'SuperAdmin'
  | 'Admin'
  | 'SubDepartmentAdmin'
  | 'StoreManager'
  | 'StoreUser'
  | 'Employee'
  | 'SMG'
  | 'Obsolete';

export type FunctionalRole = 'Self' | 'SMG' | 'Store' | 'Obsolete';

export interface Department {
  id: string;
  code: string;
  name: string;
  alias: string;
  state: string;
  district: string;
  address: string;
  subDepartments: string[];
}

export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  departmentId: string;
  subDepartment: string;
  inchargeUserId: string;
  inchargeName: string;
  totalAssetsCount: number;
}

export type Store = StoreLocation;

export interface User {
  id: string;
  employeeCode: string; // PAN No. or Emp ID
  name: string;
  username: string;
  gender: string;
  dob: string;
  email?: string;
  mobile?: string;
  designation: string;
  departmentId: string;
  subDepartment: string;
  divisionDistrict: string;
  subLocation: string;
  role: UserRole;
  allowedRoles?: FunctionalRole[];
  storeId?: string;
  reportingOfficerId?: string;
  isActive: boolean;
  password?: string;
  isFirstLogin?: boolean;
  joinedAt?: string;
  customRole?: string;
  employmentStatus?: 'Active' | 'Transfer_Pending' | 'Deactivated';
  targetAdminId?: string;
  deactivatedAt?: string;
  transferRequestedAt?: string;
}

export interface RegistrationRecord {
  id: string;
  name: string;
  username: string;
  dob: string;
  defaultPassword?: string;
  role: UserRole;
  createdAt: string;
}

export interface AssetGroup {
  id: string;
  code: string;
  name: string;
  subgroups: string[];
}

export interface ItemMake {
  id: string;
  groupId: string;
  subgroupName: string;
  makeName: string;
  models: string[];
}

export interface Vendor {
  id: string;
  vendorCode: string;
  name: string;
  representativeName: string;
  address: string;
  mobile: string;
  email: string;
  yearRegistered: string;
}

export type AMCStatus = 'Warranty' | 'AMC' | 'No-AMC' | 'Form-9' | 'Form-10' | 'Auctioned';
export type AssetStatus = 'Active' | 'Under-Repair' | 'Reserved' | 'Obsolete-Form9' | 'Disposed-Form10';

export interface Asset {
  id: string;
  departmentSerialNo: string;
  mfrSerialNo: string;
  assetGroupId: string;
  assetGroupName: string;
  assetSubgroupName: string;
  itemName: string;
  make: string;
  model: string;
  storeId: string;
  storeName: string;
  custodianType: 'Store' | 'Employee';
  custodianId: string;
  custodianName: string;
  poNumber: string;
  poDate: string;
  vendorName: string;
  purchaseCost: number;
  warrantyExpiryDate: string;
  amcExpiryDate?: string;
  amcStatus: AMCStatus;
  status: AssetStatus;
  locationRoom: string;
  receivedDate: string;
  lastPhysicalVerificationDate?: string;
  isPhysicallyVerified?: boolean;
  movementHistory?: { id?: string; action: string; date: string; from: string; to: string; remarks?: string; transferredBy?: string }[];
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  poDate: string;
  vendorName: string;
  totalAmount: number;
  totalItems: number;
  status: 'Pending' | 'Completed';
  itemsSummary: string;
}

export type IndentStatus =
  | 'Pending_Department_Admin'
  | 'Pending_Admin'
  | 'Pending_Store_Admin'
  | 'Dispatched_To_SubDept'
  | 'Dispatched_To_Desk_User'
  | 'Completed_Received'
  | 'Rejected'
  | 'Pending_Reporting_Officer'
  | 'Approved_By_Officer'
  | 'Rejected_By_Officer'
  | 'Reserved_By_Store'
  | 'Sanctioned_Issued'
  | 'Rejected_By_Store'
  | 'Receipt_Rejected_By_Desk_User';

export interface IndentRequest {
  id: string;
  indentNo: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  departmentId?: string;
  departmentName?: string;
  subDepartment?: string;

  // Multi-stage workflow actors & timestamps
  departmentAdminId?: string;
  departmentAdminName?: string;
  departmentAdminRemarks?: string;
  departmentAdminDate?: string;

  adminId?: string;
  adminName?: string;
  adminRemarks?: string;
  adminDate?: string;

  storeId: string;
  storeName: string;
  storeAdminId?: string;
  storeAdminName?: string;
  storeRemarks?: string;
  storeDispatchedDate?: string;

  subDeptAdminId?: string;
  subDeptAdminName?: string;
  subDeptRemarks?: string;
  subDeptHandoverDate?: string;

  deskUserConfirmedDate?: string;
  deskUserRemarks?: string;
  deskUserRejectionDate?: string;
  deskUserRejectionReason?: string;
  storeResendDate?: string;
  storeResendRemarks?: string;

  // Legacy compatibility fields
  reportingOfficerId?: string;
  reportingOfficerName?: string;
  officerRemarks?: string;
  sanctionDate?: string;

  purpose: 'Official Use' | 'New Requirement' | 'Replacement' | 'Project Work';
  assetGroupName: string;
  assetSubgroupName: string;
  itemName: string;
  requestedQty: number;
  allocatedAssetIds?: string[];
  status: IndentStatus;
  requestDate: string;
}

export interface TransferRecord {
  id: string;
  transferNo: string;
  transferType: 'bulk' | 'serial';
  fromType: 'Employee' | 'Store';
  fromId: string;
  fromName: string;
  toType: 'Employee' | 'Store';
  toId: string;
  toName: string;
  toRole?: string;
  assetIds: string[];
  transferDate: string;
  status: 'Pending' | 'Approved' | 'Completed' | 'Rejected';
  remarks?: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ReturnRequest {
  id: string;
  requestNo: string;
  employeeId: string;
  employeeName: string;
  assetId: string;
  assetDeptSerial: string;
  itemName: string;
  reason: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export interface Complaint {
  id: string;
  complaintNo: string;
  assetId: string;
  deptSerialNo: string;
  itemName: string;
  employeeId: string;
  employeeName: string;
  problemType: 'Critical' | 'Non-Critical';
  problemDetails: string;
  bookingDate: string;
  status: 'Pending' | 'In-Progress' | 'Resolved' | 'Closed';
  assignedEngineer?: string;
  resolutionRemarks?: string;
  closedDate?: string;
  assetSerialNo?: string;
  assetName?: string;
  category?: string;
}

export interface NoticeBoardItem {
  id: string;
  title: string;
  circularMessage: string;
  circulateTo: string;
  publishDate: string;
  publishedBy: string;
  circularNo?: string;
  targetType?: 'All' | 'Department' | 'Role' | 'Person' | 'Store';
  targetId?: string;
  targetName?: string;
  priority?: 'Normal' | 'Important' | 'Urgent';
  category?: 'Circular' | 'Notice' | 'Order' | 'Directive' | 'Reminder';
  publishedByRole?: string;
  publishedById?: string;
  attachments?: string[];
}

export interface Form9Record {
  id: string;
  form9No: string;
  cutOffDate: string;
  generatedDate: string;
  storeName: string;
  generatedBy: string;
  assetIds: string[];
  status: 'Draft' | 'Eligible' | 'Admin_Approved' | 'Disposed_Form10';
  totalValue: number;
  remarks: string;
}

export interface PreventiveMaintenanceLog {
  id: string;
  assetId: string;
  deptSerialNo: string;
  mfrSerialNo: string;
  maintenanceDate: string;
  vendorName: string;
  technicianName: string;
  status: 'Completed' | 'Pending';
  remarks: string;
  nextDueDate: string;
}

export interface SystemAuditLog {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  actorCode: string;
  action: string;
  module: string;
  details: string;
  severity: 'Info' | 'Warning' | 'Security';
  ipAddress: string;
}

export interface SuperAdminSystemConfig {
  financialYear: string;
  stateNodalAgency: string;
  paoCode: string;
  capitalizationThreshold: number;
  mandatoryAnnualVerification: boolean;
  twoFactorAuthEnabled: boolean;
  maintenanceMode: boolean;
  disposalCommitteeQuorum: number;
}

// ----------------------------------------------------
// Role-Based Multi-Level Workflow Types
// ----------------------------------------------------
export type WorkflowRequestType = 'Order' | 'Replacement' | 'Repair' | 'Transfer';

export type WorkflowProductCategory =
  | 'Furniture'
  | 'Hardware'
  | 'Medicine'
  | 'Stationery'
  | 'Networking'
  | 'Other';

export type WorkflowStatus =
  | 'Pending'
  | 'Approved'
  | 'In Store'
  | 'Pending Desk Officer'
  | 'Partially Approved'
  | 'Dispatched'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Completed'
  | 'Rejected'
  | 'Receipt Rejected';

export interface WorkflowAuditStep {
  id: string;
  stepName: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  actorDept?: string;
  actorSubDept?: string;
  action:
    | 'Created'
    | 'Approved'
    | 'Forwarded'
    | 'Assigned'
    | 'Dispatched'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Completed'
    | 'Rejected'
    | 'Partially Approved'
    | 'Sent to Desk Officer'
    | 'Receipt Rejected'
    | 'Delivery Resent';
  timestamp: string;
  comments?: string;
}

export type DepartureStatus = 'Scheduled' | 'Out for Delivery' | 'Delivered' | 'Cancelled';

export interface StoreParcelItem {
  id: string; // e.g. PCL-IT-2026-001
  requestId?: string;
  indentId?: string;
  productName: string;
  category: WorkflowProductCategory | string;
  productSpecs?: string;
  quantity: number;
  assignedAssetId?: string;
  assignedSerialNo: string;
  barcode?: string;

  // Department & Recipient destination
  targetDepartmentId: string;
  targetDepartmentName: string;
  targetSubDepartment?: string;
  recipientId: string;
  recipientName: string;
  recipientDesignation?: string;
  destinationLocation: string; // e.g. Room 402, IT HQ, 4th Floor

  // Store Desk User who accepted & packed this parcel
  acceptedByUserId: string;
  acceptedByUserName: string;
  acceptedByUserRole?: string;
  acceptedAt: string;
  storeId: string;
  storeName: string;

  // Departure Linkage
  departureId?: string;
  departureNo?: string;
  status?: 'Ready for Dispatch' | 'Assigned to Departure' | 'Out for Delivery' | 'Delivered' | 'Receipt Rejected';
  dispatchedAt?: string;
  receivedAt?: string;
  receiptRejectedAt?: string;
  receiptRejectionReason?: string;
  resendDate?: string;
  resendNotes?: string;
  packageNotes?: string;
  boxType?: string;

  // Auto-generated tracking ID based on request type (e.g. ORD-2026-..., RET-2026-..., REP-2026-..., RPL-2026-...)
  orderReturnRepairReplaceId?: string;
  requestType?: 'Order' | 'Returned' | 'Repaired' | 'Replaced' | 'Transfer' | 'Repair' | 'Replacement' | string;
  senderId?: string;
  senderName?: string;
  senderRole?: string;
  senderEmployeeCode?: string;
  recipientEmployeeCode?: string;
  recipientRole?: string;

  // Incremental PDF Manifest Batch tracking
  pdfManifestBatchId?: string;
  pdfManifestDownloadedAt?: string;
}

export interface StorePdfManifestLog {
  id: string; // e.g. MNF-2026-001 or CUST-MNF-2026-001
  batchType: 'auto-sequential' | 'custom-time';
  generatedAt: string;
  generatedByUserId: string;
  generatedByUserName: string;
  generatedByUserRole: string;
  scopeType: 'self' | 'desk-user' | 'all';
  targetDeskUserId?: string;
  targetDeskUserName?: string;
  totalItems: number;
  sectionCounts: {
    orders: number;
    returned: number;
    repaired: number;
    replaced: number;
  };
  fromDate?: string;
  toDate?: string;
  itemIds: string[];
  notes?: string;
}

export interface StoreDeparture {
  id: string; // e.g. DEP-IT-2026-01
  departureNo: string;
  targetDepartmentId: string;
  targetDepartmentName: string;
  destinationHub: string; // e.g. IT Department HQ, Khushbu Logistics Center

  scheduledDepartureTime: string; // e.g. '2026-09-29T14:00:00'
  departureSlot: string; // e.g. 'Afternoon Run (02:00 PM)'

  // Logistics info
  vehicleNo: string; // e.g. 'ASC-LOG-5421 (Store Logistics Van)'
  courierOrDriverName: string; // e.g. 'Suresh Sharma (Store Dispatch Runner)'
  courierContact: string; // e.g. '9811223344'
  gatePassNo: string; // e.g. 'GP-2026-091'

  storeId: string;
  storeName: string;
  createdById: string;
  createdByName: string;
  createdAt: string;

  status: DepartureStatus; // 'Scheduled' | 'Out for Delivery' | 'Delivered'
  dispatchedAt?: string;
  dispatchedById?: string;
  dispatchedByName?: string;

  deliveredAt?: string;
  parcelIds: string[]; // List of parcel IDs assigned to this departure
  notes?: string;
}

export interface WorkflowRequest {
  id: string; // e.g. REQ-2026-001
  requestType: WorkflowRequestType;
  category: WorkflowProductCategory;
  productName: string;
  productSpecs?: string;
  quantity: number;
  approvedQuantity?: number; // Sanctioned quantity (if partial or full accept)
  partialApprovalReason?: string;
  reason?: string;
  existingAssetId?: string;
  existingSerialNo?: string;

  // Initiator / Sender
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  senderDepartmentId: string;
  senderDepartmentName: string;
  senderSubDepartment?: string;

  // Last Handled To (concise tracking)
  lastHandledToId?: string;
  lastHandledToName?: string;
  lastHandledToRole?: string;
  lastHandledToDept?: string;
  lastHandledToSubDept?: string;

  // Store handling & Departure Logistics
  selectedStoreId?: string;
  selectedStoreName?: string;
  assignedAssetId?: string;
  assignedSerialNo?: string;
  pickupDateTime?: string;
  expectedDeliveryDateTime?: string;
  departureId?: string;
  departureNo?: string;
  parcelId?: string;
  vehicleNo?: string;
  courierOrDriverName?: string;
  courierContact?: string;
  gatePassNo?: string;
  outForDeliveryAt?: string;

  // Desk Officer Referral & Sanction
  forwardedToDeskOfficerId?: string;
  forwardedToDeskOfficerName?: string;
  forwardedToDeskOfficerRemarks?: string;
  forwardedAt?: string;
  deskOfficerDecision?: 'Accepted' | 'Partial' | 'Rejected';
  deskOfficerRemarks?: string;
  deskOfficerActionDate?: string;

  // Transfer routing
  transferScope?: 'same-subdept' | 'across-subdept' | 'across-dept' | 'to-superadmin';
  targetDepartmentId?: string;
  targetDepartmentName?: string;
  targetSubDepartment?: string;
  targetEmployeeId?: string;
  targetEmployeeName?: string;

  // Confirmation actor (manager or desk user that confirmed the order)
  confirmedById?: string;
  confirmedByName?: string;
  confirmedByRole?: string;

  // Receipt Rejection & Redelivery Cycle tracking
  receiptRejectedAt?: string;
  receiptRejectionReason?: string;
  resendDeliveryAt?: string;
  resendDeliveryNotes?: string;

  // Workflow status & current approver
  status: WorkflowStatus;
  currentApproverRole?: UserRole | 'StoreManager' | 'Requester' | 'Recipient';
  currentApproverId?: string;
  currentApproverName?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;

  // Full history for audit trail / Super Admin
  history: WorkflowAuditStep[];

  // Auto-generated tracking ID based on request type (e.g. ORD-2026-..., RET-2026-..., REP-2026-..., RPL-2026-...)
  orderReturnRepairReplaceId?: string;
  pdfManifestBatchId?: string;
  pdfManifestDownloadedAt?: string;

  // Inter-store & Self-Store requisition tracking
  isSelfStoreRequisition?: boolean; // Manager requesting from own store (both sender and receiver)
  isInterStoreRequisition?: boolean; // Manager requesting from another store (requires other store approval)
  targetStoreId?: string; // Target store requested for asset
  targetStoreName?: string;
  fulfillingStoreId?: string;
  fulfillingStoreName?: string;
}

export interface WorkflowNotification {
  id: string;
  requestId: string;
  recipientId: string;
  title: string;
  message: string;
  type: 'info' | 'action_required' | 'success' | 'warning';
  createdAt: string;
  isRead: boolean;
}

// ----------------------------------------------------
// AMC Proposal & Post-SMG Approval Workflow Types
// ----------------------------------------------------
export type AmcProposalStatus =
  | 'Draft'
  | 'Pending – SMG Approval'
  | 'Approved – SMG'
  | 'Rejected – SMG'
  | 'Sub-line Item Defined'
  | 'Mapping Completed'
  | 'Vendor Assigned'
  | 'Penalty Configured'
  | 'Active AMC';

export interface AmcSubLineItem {
  id: string;
  amcItemId: string; // Foreign key to parent AMC Item
  subLineItemName: string;
  itemMakeId: string; // Foreign key to ItemMake
  itemMakeName: string;
  partNumber?: string;
  modelNumber?: string;
  quantity: number;
  unit: string;
  estimatedCostPerUnit: number;
  totalCost: number;
  serviceFrequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Annual' | 'On-Demand';
  specifications?: string;
}

export interface AmcMappingDetails {
  costCenterCode: string;
  costCenterName: string;
  internalAssetCode?: string;
  glAccountCode: string;
  budgetHead: string;
  departmentId: string;
  departmentName: string;
  storeLocationId?: string;
  storeLocationName?: string;
  buildingLocation: string;
  roomOrFloor: string;
  responsibleOfficer: string;
  itemMakeName: string; // Carried forward from Item Make master
}

export interface AmcVendorLinkage {
  vendorId: string; // Foreign key to Vendor
  vendorCode: string;
  vendorName: string;
  vendorContactPerson: string;
  vendorPhone: string;
  vendorEmail: string;
  contractStartDate: string;
  contractEndDate: string;
  contractValue: number;
  paymentTerms: string;
  slaResponseHours: number;
  slaResolutionHours: number;
}

export interface AmcPenaltyClause {
  id: string;
  clauseType: 'SLA Delay' | 'Resolution Breach' | 'Preventive Maintenance Delay' | 'Non-Compliance';
  conditionDescription: string;
  delayThresholdHoursOrDays: string;
  penaltyRate: string;
  maxPenaltyCapPercent: number;
  deductionMechanism: 'Monthly Invoice Deduction' | 'Security Deposit Forfeiture' | 'Performance Guarantee';
}

export interface AmcItemProposal {
  id: string; // e.g. AMC-PROP-2026-001
  proposalNo: string;
  amcYear: string;

  // Item & Classification Details
  assetGroupId: string;
  assetGroupName: string;
  assetSubgroupName: string;
  itemName: string;
  itemDescription?: string;

  // Foreign Key to Item Make Master (CRITICAL FIX)
  itemMakeId: string;
  itemMakeName: string;
  modelNumber?: string;

  // Quantity & Estimated Cost
  quantity: number;
  unit: string;
  estimatedTotalCost: number;
  preferredVendorId?: string;
  preferredVendorName?: string;

  // Originating asset details (if linked from physically verified asset)
  sourceAssetId?: string;
  mfrSerialNo?: string;
  departmentSerialNo?: string;

  // Requester Information (Role-Based Visibility)
  requestedById: string;
  requestedByName: string;
  requestedByRole: UserRole;
  requestedByDepartmentId: string;
  requestedByDepartmentName: string;
  submissionDate: string;
  justificationNotes?: string;

  // Status & SMG Approval Info
  status: AmcProposalStatus;
  smgApprovedById?: string;
  smgApprovedByName?: string;
  smgActionDate?: string;
  smgRemarks?: string;
  rejectionReason?: string;

  // Post-SMG Stage 1: Sub-line Items
  subLineItems?: AmcSubLineItem[];

  // Post-SMG Stage 2: Mapping Details
  mappingDetails?: AmcMappingDetails;

  // Post-SMG Stage 3: Vendor Linkage
  vendorLinkage?: AmcVendorLinkage;

  // Post-SMG Stage 4: Penalty Configuration
  penaltyClauses?: AmcPenaltyClause[];

  // History & Audit Trail
  history: {
    timestamp: string;
    action: string;
    actorName: string;
    actorRole: string;
    notes?: string;
  }[];
}

export interface LoginResult {
  success: boolean;
  error?: string;
  roleMismatch?: boolean;
  actualRole?: UserRole;
  expectedRole?: UserRole;
}

// ----------------------------------------------------
// Store Mode (Store Manager) Operational Types
// ----------------------------------------------------
export type StockAdjustmentReason =
  | 'DATA_ENTRY_ERROR'
  | 'SURPLUS_FOUND_IN_PAV'
  | 'DAMAGED_IN_STORE'
  | 'WRITE_OFF'
  | 'OBSOLETE_SURVEY';

export interface StockAdjustmentRecord {
  id: string;
  assetId: string;
  assetSerialNo: string;
  itemName: string;
  previousStatus: AssetStatus;
  newStatus: AssetStatus;
  reasonCode: StockAdjustmentReason;
  adjustedQty: number;
  remarks: string;
  adjustedBy: string;
  timestamp: string;
  storeId: string;
}

export type PAVItemResult = 'PENDING' | 'FOUND' | 'NOT_FOUND' | 'MISMATCH_LOCATION' | 'DAMAGED';

export interface PAVBatch {
  id: string;
  batchNumber: string;
  storeId: string;
  storeName: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  totalAssets: number;
  verifiedCount: number;
  status: 'Open' | 'In-Progress' | 'Reconciled' | 'Closed';
}

export interface PAVRecord {
  id: string;
  batchId: string;
  assetId: string;
  assetSerialNo: string;
  barcode: string;
  itemName: string;
  expectedLocation: string;
  scannedLocation: string;
  result: PAVItemResult;
  remarks?: string;
  scannedAt?: string;
  scannedBy?: string;
}

export interface StoreNOCRecord {
  id: string;
  requestNo: string;
  employeeId: string;
  employeeName: string;
  employeeDesignation: string;
  departmentId: string;
  departmentName: string;
  outstandingAssetsCount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestDate: string;
  clearanceDate?: string;
  clearedBy?: string;
  remarks?: string;
}

export interface StoreHandoverRecord {
  id: string;
  requestNo: string;
  assetId: string;
  assetSerialNo: string;
  itemName: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  handoverDate: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  remarks?: string;
}

export interface StoreDashboardMetrics {
  totalAssetsHeld: number;
  availableInStock: number;
  issuedActive: number;
  underRepair: number;
  obsoletePending: number;
  totalBookValue: number;
  pendingIndentsCount: number;
  pendingHandoversCount: number;
  returnsToVerifyCount: number;
  openComplaintsCount: number;
  disposalProposalsCount: number;
  activePavBatchesCount: number;
}



